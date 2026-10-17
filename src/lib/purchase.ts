import { Db, postJournal, accountByAlias, DraftLine } from "./journal";
import { computeTotals } from "./posting";
import { postStockIn } from "./inventory";

export interface PurchaseLineInput {
  description: string;
  qty: number;
  price: number; // harga per unit (Rp, bulat)
  discount: number; // diskon total baris (Rp)
  taxRate: number; // 0.11, 0.12, 0 ...
  accountId: number; // akun DEBIT: Persediaan (barang) atau akun beban (jasa)
  itemId?: number | null;
  taxId?: number | null;
}

export interface PurchaseInvoiceInput {
  number: string;
  date: Date;
  dueDate: Date;
  partnerId: number;
  memo?: string;
  lines: PurchaseLineInput[];
}

/**
 * Faktur Pembelian → jurnal otomatis:
 *   Debit  Persediaan / Beban   = nilai barang/jasa (per akun, digabung)
 *   Debit  PPN Masukan           = pajak (jika ada)
 *   Credit Utang Usaha (AP)      = grand total
 */
export async function postPurchaseInvoice(db: Db, input: PurchaseInvoiceInput) {
  const totals = computeTotals(input.lines);
  const ap = await accountByAlias(db, "AP");

  // Header disimpan dulu karena kartu stok harus merujuk id faktur
  const invoice = await db.invoice.create({
    data: {
      type: "PURCHASE",
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

  // Barang masuk dengan harga pokok per unit (setelah diskon baris)
  for (const l of input.lines) {
    if (!l.itemId || l.qty <= 0) continue;
    const item = await db.item.findUnique({ where: { id: l.itemId } });
    if (!item || item.type !== "PRODUCT") continue;
    const net = l.qty * l.price - l.discount;
    await postStockIn(db, {
      date: input.date,
      itemId: l.itemId,
      qty: l.qty,
      unitCost: Math.round(net / l.qty),
      refType: "PURCHASE_INVOICE",
      refId: invoice.id,
      memo: `Beli ${input.number}`,
    });
  }

  // Gabungkan baris per akun debit supaya jurnal ringkas
  const byAccount = new Map<number, number>();
  for (const l of input.lines) {
    const net = l.qty * l.price - l.discount;
    byAccount.set(l.accountId, (byAccount.get(l.accountId) ?? 0) + net);
  }

  const lines: DraftLine[] = [];
  for (const [accountId, amount] of byAccount) {
    if (amount === 0) continue;
    lines.push({
      accountId,
      debit: amount,
      credit: 0,
      memo: `Pembelian ${input.number}`,
      partnerId: input.partnerId,
    });
  }

  if (totals.taxAmount > 0) {
    const vatIn = await accountByAlias(db, "VAT_IN");
    lines.push({
      accountId: vatIn.id,
      debit: totals.taxAmount,
      credit: 0,
      memo: `PPN Masukan ${input.number}`,
      partnerId: input.partnerId,
    });
  }

  lines.push({
    accountId: ap.id,
    debit: 0,
    credit: totals.total,
    memo: `Utang pembelian ${input.number}`,
    partnerId: input.partnerId,
  });

  const entry = await postJournal(db, {
    date: input.date,
    memo: input.memo || `Faktur pembelian ${input.number}`,
    reference: input.number,
    sourceType: "PURCHASE_INVOICE",
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
 * Pembayaran utang ke pemasok → jurnal:
 *   Debit  Utang Usaha (AP)
 *   Credit Bank/Kas (sesuai akun yang dipilih)
 */
export async function payPayable(
  db: Db,
  input: {
    number: string;
    date: Date;
    partnerId: number;
    invoiceId: number;
    bankAccountId: number; // akun kas/bank asal dana
    amount: number;
    memo?: string;
  }
) {
  const bank = await db.account.findUnique({ where: { id: input.bankAccountId } });
  if (!bank) throw new Error("Akun kas/bank tidak ditemukan.");
  const ap = await accountByAlias(db, "AP");

  const entry = await postJournal(db, {
    date: input.date,
    memo: input.memo || `Pembayaran utang ${input.number}`,
    reference: input.number,
    sourceType: "PAYMENT_OUT",
    lines: [
      {
        accountId: ap.id,
        debit: input.amount,
        credit: 0,
        memo: `Pelunasan utang ${input.number}`,
        partnerId: input.partnerId,
      },
      {
        accountId: bank.id,
        debit: 0,
        credit: input.amount,
        memo: `Pembayaran ke ${input.number}`,
        partnerId: input.partnerId,
      },
    ],
  });

  const payment = await db.payment.create({
    data: {
      type: "OUT",
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

  const inv = await db.invoice.findUniqueOrThrow({ where: { id: input.invoiceId } });
  const newPaid = inv.paid + input.amount;
  const status = newPaid >= inv.total ? "PAID" : "PARTIAL";
  await db.invoice.update({ where: { id: inv.id }, data: { paid: newPaid, status } });

  return { payment, entry };
}
