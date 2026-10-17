"use server";

import { prisma } from "./db";
import { postPurchaseInvoice, payPayable } from "./purchase";
import { revalidatePath } from "next/cache";
import { formatRp } from "./format";

export interface RawPurchaseLine {
  description: string;
  qty: string;
  price: string;
  discount: string;
  taxId: string;
  accountId: string;
  itemId: string;
}

function parseLines(fd: FormData): RawPurchaseLine[] {
  return fd
    .getAll("line")
    .map((v) => {
      try {
        return JSON.parse(String(v)) as RawPurchaseLine;
      } catch {
        return null;
      }
    })
    .filter((x): x is RawPurchaseLine => x !== null);
}

function refreshAll() {
  revalidatePath("/");
  revalidatePath("/purchase-invoices");
  revalidatePath("/journal");
  revalidatePath("/reports");
}

export async function createPurchaseInvoiceAction(
  formData: FormData
): Promise<{ ok: boolean; error?: string; id?: number }> {
  const partnerId = Number(formData.get("partnerId"));
  const number = String(formData.get("number") || "").trim();
  const date = String(formData.get("date"));
  const dueDate = String(formData.get("dueDate") || date);
  const memo = String(formData.get("memo") || "");

  if (!partnerId || !number || !date) {
    return { ok: false, error: "Nomor, tanggal, dan pemasok wajib diisi." };
  }

  const vendor = await prisma.partner.findUnique({ where: { id: partnerId } });
  if (!vendor) return { ok: false, error: "Pemasok tidak ditemukan." };
  if (vendor.type === "CUSTOMER") {
    return { ok: false, error: `"${vendor.name}" bertipe Pelanggan. Pilih pemasok.` };
  }

  const raw = parseLines(formData);
  if (raw.length === 0) return { ok: false, error: "Minimal satu baris faktur." };

  // Pajak yang dipakai → ambil tarifnya
  const taxIds = [...new Set(raw.map((l) => (l.taxId ? Number(l.taxId) : 0)).filter(Boolean))];
  const taxes = await prisma.tax.findMany({ where: { id: { in: taxIds } } });
  const rateById = new Map(taxes.map((t) => [t.id, t.rate]));

  // Validasi akun debit tiap baris (harus akun leaf, tipe Aset/Beban)
  const accIds = [...new Set(raw.map((l) => Number(l.accountId)).filter(Boolean))];
  const accounts = await prisma.account.findMany({ where: { id: { in: accIds } } });
  const accById = new Map(accounts.map((a) => [a.id, a]));

  const lines = raw
    .filter((l) => l.description.trim() !== "" || Number(l.qty) > 0)
    .map((l) => {
      const accountId = Number(l.accountId);
      const acc = accById.get(accountId);
      if (!acc) throw new Error("Akun debit baris tidak valid. Pilih Persediaan atau akun beban.");
      if (acc.isGroup) throw new Error(`Akun "${acc.name}" adalah akun grup dan tidak bisa diposting.`);
      if (!["ASSET", "EXPENSE"].includes(acc.type)) {
        throw new Error(`Akun "${acc.name}" harus bertipe Aset atau Beban.`);
      }
      const taxId = l.taxId ? Number(l.taxId) : 0;
      return {
        description: l.description || "Pembelian",
        qty: Number(l.qty || 1),
        price: Number(l.price || 0),
        discount: Number(l.discount || 0),
        taxRate: taxId ? rateById.get(taxId) ?? 0 : 0,
        accountId,
        itemId: l.itemId ? Number(l.itemId) : null,
        taxId: taxId || null,
      };
    });

  if (lines.length === 0) return { ok: false, error: "Minimal satu baris faktur." };

  try {
    const { invoice } = await prisma.$transaction(async (tx) =>
      postPurchaseInvoice(tx, {
        number,
        date: new Date(date),
        dueDate: new Date(dueDate || date),
        partnerId,
        memo,
        lines,
      })
    );
    refreshAll();
    return { ok: true, id: invoice.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gagal menyimpan faktur." };
  }
}

export async function payPayableAction(
  formData: FormData
): Promise<{ ok: boolean; error?: string; needConfirm?: boolean }> {
  const invoiceId = Number(formData.get("invoiceId"));
  const amount = Number(formData.get("amount"));
  const bankAccountId = Number(formData.get("accountId"));
  const date = String(formData.get("date"));
  const number = String(formData.get("number") || "").trim();

  if (!invoiceId || !amount || !date || !number || !bankAccountId) {
    return { ok: false, error: "Nomor, tanggal, jumlah, dan akun kas/bank wajib diisi." };
  }
  if (amount <= 0) return { ok: false, error: "Jumlah pembayaran harus lebih dari 0." };

  const inv = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!inv) return { ok: false, error: "Faktur tidak ditemukan." };
  if (inv.type !== "PURCHASE") return { ok: false, error: "Bukan faktur pembelian." };

  const remaining = inv.total - inv.paid;
  if (amount > remaining) {
    return { ok: false, error: `Jumlah melebihi sisa utang (${remaining}).` };
  }

  // Guard saldo kas negatif: minta konfirmasi eksplisit dari user
  const cashAcc = await prisma.account.findUnique({ where: { id: bankAccountId } });
  if (!cashAcc) return { ok: false, error: "Akun kas/bank tidak ditemukan." };

  const cashSum = await prisma.journalLine.aggregate({
    _sum: { debit: true, credit: true },
    where: { accountId: bankAccountId },
  });
  const saldo = (cashSum._sum.debit ?? 0) - (cashSum._sum.credit ?? 0);
  const allowOverdraw = formData.get("allowOverdraw") === "1";
  if (saldo - amount < 0 && !allowOverdraw) {
    return {
      ok: false,
      needConfirm: true,
      error: `Saldo ${cashAcc.name} tinggal ${formatRp(saldo)}. Pembayaran ${formatRp(
        amount
      )} akan membuat saldo menjadi negatif. Centang "Tetap bayar" untuk melanjutkan.`,
    };
  }

  try {
    await payPayable(prisma, {
      number,
      date: new Date(date),
      partnerId: inv.partnerId,
      invoiceId,
      bankAccountId,
      amount,
    });
    refreshAll();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gagal menyimpan pembayaran." };
  }
}
