import { Db, postJournal, accountByAlias, DraftLine } from "./journal";
import { postStockOut } from "./inventory";

export interface SalesLineInput {
  description: string;
  qty: number;
  price: number; // harga per unit (Rp, bulat)
  discount: number; // diskon total baris (Rp)
  taxRate: number; // 0.11, 0.12, 0 ...
  taxId?: number | null;
  itemId?: number | null; // barang → dipakai kartu stok + HPP
}

export interface SalesInvoiceInput {
  number: string;
  date: Date;
  dueDate: Date;
  partnerId: number;
  memo?: string;
  lines: SalesLineInput[];
}

/** Hitung total faktur penjualan (subtotal, diskon, pajak, grand total). */
export function computeTotals(lines: SalesLineInput[]) {
  let subtotal = 0; // qty * price (sebelum diskon/pajak)
  let discount = 0;
  let taxAmount = 0;

  for (const l of lines) {
    const gross = l.qty * l.price;
    subtotal += gross;
    discount += l.discount;
    // pajak dihitung dari nilai setelah diskon baris
    const net = gross - l.discount;
    taxAmount += Math.round(net * l.taxRate);
  }

  const total = subtotal - discount + taxAmount;
  return { subtotal, discount, taxAmount, total };
}

/**
 * Faktur Penjualan → jurnal otomatis:
 *   Debit  Piutang Usaha (AR)      = total
 *   Credit Penjualan               = subtotal - diskon
 *   Credit Utang Pajak (PPN)       = pajak
 *   Debit  HPP / Credit Persediaan = harga pokok barang keluar (rata-rata bergerak)
 *
 * Header disimpan dulu karena kartu stok harus merujuk id faktur.
 */
export async function postSalesInvoice(db: Db, input: SalesInvoiceInput) {
  const totals = computeTotals(input.lines);
  const ar = await accountByAlias(db, "AR");
  const sales = await accountByAlias(db, "SALES");

  const revenue = totals.subtotal - totals.discount;

  const invoice = await db.invoice.create({
    data: {
      type: "SALES",
      number: input.number,
      date: input.date,
      dueDate: input.dueDate,
      partnerId: input.partnerId,
      subtotal: totals.subtotal,
      discount: totals.discount,
      taxAmount: totals.taxAmount,
      total: totals.total,
      status: "DRAFT",
      lines: {
        create: input.lines.map((l) => ({
          description: l.description,
          qty: l.qty,
          price: l.price,
          discount: l.discount,
          amount: l.qty * l.price - l.discount,
          itemId: l.itemId ?? null,
          taxId: l.taxId ?? null,
        })),
      },
    },
  });

  const lines: DraftLine[] = [
    {
      accountId: ar.id,
      debit: totals.total,
      credit: 0,
      memo: `Faktur ${input.number}`,
      partnerId: input.partnerId,
    },
    {
      accountId: sales.id,
      debit: 0,
      credit: revenue,
      memo: `Penjualan ${input.number}`,
      partnerId: input.partnerId,
    },
  ];

  // Baris pajak hanya jika ada PPN
  if (totals.taxAmount > 0) {
    const vatOut = await accountByAlias(db, "VAT_OUT");
    lines.push({
      accountId: vatOut.id,
      debit: 0,
      credit: totals.taxAmount,
      memo: `PPN Keluaran ${input.number}`,
      partnerId: input.partnerId,
    });
  }

  // Barang keluar + akumulasi HPP dari harga pokok rata-rata bergerak
  let totalCost = 0;
  for (const l of input.lines) {
    if (!l.itemId || l.qty <= 0) continue;
    const item = await db.item.findUnique({ where: { id: l.itemId } });
    if (!item || item.type !== "PRODUCT") continue;

    const out = await postStockOut(db, {
      date: input.date,
      itemId: l.itemId,
      qty: l.qty,
      refType: "SALES_INVOICE",
      refId: invoice.id,
      memo: `Jual ${input.number}`,
    });
    if (out) totalCost += out.totalCost;
  }

  if (totalCost > 0) {
    const hpp = await accountByAlias(db, "HPP");
    const inventory = await accountByAlias(db, "INVENTORY");
    lines.push({
      accountId: hpp.id,
      debit: totalCost,
      credit: 0,
      memo: `HPP ${input.number}`,
      partnerId: input.partnerId,
    });
    lines.push({
      accountId: inventory.id,
      debit: 0,
      credit: totalCost,
      memo: `Barang keluar ${input.number}`,
      partnerId: input.partnerId,
    });
  }

  const entry = await postJournal(db, {
    date: input.date,
    memo: input.memo || `Faktur penjualan ${input.number}`,
    reference: input.number,
    sourceType: "SALES_INVOICE",
    lines,
  });

  const posted = await db.invoice.update({
    where: { id: invoice.id },
    data: { journalEntryId: entry.id, status: "POSTED" },
    include: { lines: true, partner: true },
  });

  return { invoice: posted, entry };
}

/**
 * Penerimaan pembayaran faktur jual → jurnal:
 *   Debit  Bank/Kas (sesuai akun yang dipilih)
 *   Credit Piutang Usaha (AR)
 */
export async function receivePayment(
  db: Db,
  input: {
    number: string;
    date: Date;
    partnerId: number;
    invoiceId: number;
    bankAccountId: number; // akun kas/bank tujuan (dipilih user)
    amount: number;
    memo?: string;
  }
) {
  const bank = await db.account.findUnique({ where: { id: input.bankAccountId } });
  if (!bank) throw new Error("Akun kas/bank tidak ditemukan.");
  const ar = await accountByAlias(db, "AR");

  const entry = await postJournal(db, {
    date: input.date,
    memo: input.memo || `Pembayaran ${input.number}`,
    reference: input.number,
    sourceType: "PAYMENT_IN",
    lines: [
      {
        accountId: bank.id,
        debit: input.amount,
        credit: 0,
        memo: `Penerimaan ${input.number}`,
        partnerId: input.partnerId,
      },
      {
        accountId: ar.id,
        debit: 0,
        credit: input.amount,
        memo: `Pelunasan ${input.number}`,
        partnerId: input.partnerId,
      },
    ],
  });

  const payment = await db.payment.create({
    data: {
      type: "IN",
      number: input.number,
      date: input.date,
      partnerId: input.partnerId,
      accountId: bank.id,
      amount: input.amount,
      memo: input.memo ?? null,
      invoiceId: input.invoiceId,
      journalEntryId: entry.id,
    },
  });

  // Update status + paid pada faktur
  const inv = await db.invoice.findUniqueOrThrow({ where: { id: input.invoiceId } });
  const newPaid = inv.paid + input.amount;
  const status = newPaid >= inv.total ? "PAID" : "PARTIAL";
  await db.invoice.update({
    where: { id: inv.id },
    data: { paid: newPaid, status },
  });

  return { payment, entry };
}
