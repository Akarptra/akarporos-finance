"use server";

import { prisma } from "./db";
import { postSalesInvoice, receivePayment, SalesLineInput } from "./posting";
import { revalidatePath } from "next/cache";

// Bentuk baris faktur dari form (semua string dari input)
export interface RawLine {
  description: string;
  qty: string;
  price: string;
  discount: string;
  taxId: string;
  itemId: string;
}

// Baris dikirim dari client sebagai string JSON per baris (FormData hanya simpan string)
function parseLines(fd: FormData): RawLine[] {
  return fd
    .getAll("line")
    .map((v) => {
      try {
        return JSON.parse(String(v)) as RawLine;
      } catch {
        return null;
      }
    })
    .filter((x): x is RawLine => x !== null);
}

function toLines(raw: RawLine[], taxRateById: Map<number, number>): SalesLineInput[] {
  return raw
    .filter((l) => l.description.trim() !== "" || Number(l.qty) > 0)
    .map((l) => {
      const taxId = l.taxId ? Number(l.taxId) : 0;
      return {
        description: l.description || "Item",
        qty: Number(l.qty || 1),
        price: Number(l.price || 0),
        discount: Number(l.discount || 0),
        taxRate: taxId ? taxRateById.get(taxId) ?? 0 : 0,
        taxId: taxId || null,
        itemId: l.itemId ? Number(l.itemId) : null,
      };
    });
}

export async function createSalesInvoiceAction(formData: FormData) {
  const partnerId = Number(formData.get("partnerId"));
  const number = String(formData.get("number") || "").trim();
  const date = String(formData.get("date"));
  const dueDate = String(formData.get("dueDate") || date);
  const memo = String(formData.get("memo") || "");

  if (!partnerId || !number || !date) {
    return { ok: false, error: "Nomor, tanggal, dan pelanggan wajib diisi." };
  }

  // Kumpulkan pajak yang dipakai → ambil ratenya
  const raw = parseLines(formData);
  const taxIds = [...new Set(raw.map((l) => (l.taxId ? Number(l.taxId) : 0)).filter(Boolean))];
  const taxes = await prisma.tax.findMany({ where: { id: { in: taxIds } } });
  const rateById = new Map(taxes.map((t) => [t.id, t.rate]));

  const lines = toLines(raw, rateById);
  if (lines.length === 0) {
    return { ok: false, error: "Minimal satu baris faktur." };
  }

  try {
    // Transaksi: header faktur, kartu stok, dan jurnal harus masuk bersamaan
    const { invoice } = await prisma.$transaction(async (tx) =>
      postSalesInvoice(tx, {
        number,
        date: new Date(date),
        dueDate: new Date(dueDate || date),
        partnerId,
        memo,
        lines,
      })
    );
    revalidatePath("/");
    revalidatePath("/sales-invoices");
    revalidatePath("/journal");
    revalidatePath("/stock");
    return { ok: true, id: invoice.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gagal menyimpan faktur." };
  }
}

export async function receivePaymentAction(formData: FormData) {
  const invoiceId = Number(formData.get("invoiceId"));
  const amount = Number(formData.get("amount"));
  const bankAccountId = Number(formData.get("accountId"));
  const date = String(formData.get("date"));
  const number = String(formData.get("number") || "").trim();

  if (!invoiceId || !amount || !date || !number || !bankAccountId) {
    return { ok: false, error: "Nomor, tanggal, jumlah, dan akun kas/bank wajib diisi." };
  }

  const inv = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!inv) return { ok: false, error: "Faktur tidak ditemukan." };

  try {
    await receivePayment(prisma, {
      number,
      date: new Date(date),
      partnerId: inv.partnerId,
      invoiceId,
      bankAccountId,
      amount,
    });
    revalidatePath("/");
    revalidatePath("/sales-invoices");
    revalidatePath("/journal");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gagal menyimpan pembayaran." };
  }
}
