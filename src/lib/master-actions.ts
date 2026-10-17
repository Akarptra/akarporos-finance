"use server";

import { prisma } from "./db";
import { revalidatePath } from "next/cache";

const PARTNER_TYPES = ["CUSTOMER", "VENDOR", "BOTH"];
const ITEM_TYPES = ["PRODUCT", "SERVICE"];
const TAX_TYPES = ["OUTPUT", "INPUT", "NONE"];

const str = (v: FormDataEntryValue | null) => String(v ?? "").trim();

function num(v: FormDataEntryValue | null): number {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

function float(v: FormDataEntryValue | null): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function optNum(v: FormDataEntryValue | null): number | null {
  const s = str(v);
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function refreshMaster() {
  revalidatePath("/partners");
  revalidatePath("/items");
  revalidatePath("/taxes");
  revalidatePath("/");
}

/* ================= MITRA (Partner) ================= */

export async function createPartnerAction(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const type = str(formData.get("type")) || "CUSTOMER";
  const name = str(formData.get("name"));
  const termsDays = num(formData.get("termsDays")) || 30;

  if (!name) return { ok: false, error: "Nama mitra wajib diisi." };
  if (!PARTNER_TYPES.includes(type)) return { ok: false, error: "Tipe mitra tidak valid." };

  try {
    await prisma.partner.create({
      data: {
        type,
        name,
        email: str(formData.get("email")) || null,
        phone: str(formData.get("phone")) || null,
        address: str(formData.get("address")) || null,
        npwp: str(formData.get("npwp")) || null,
        termsDays,
      },
    });
  } catch {
    return { ok: false, error: "Gagal menyimpan mitra." };
  }

  refreshMaster();
  return { ok: true };
}

export async function updatePartnerAction(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const id = Number(formData.get("id"));
  if (!id) return { ok: false, error: "ID mitra tidak valid." };

  const type = str(formData.get("type")) || "CUSTOMER";
  const name = str(formData.get("name"));
  const termsDays = num(formData.get("termsDays")) || 30;

  if (!name) return { ok: false, error: "Nama mitra wajib diisi." };
  if (!PARTNER_TYPES.includes(type)) return { ok: false, error: "Tipe mitra tidak valid." };

  try {
    await prisma.partner.update({
      where: { id },
      data: {
        type,
        name,
        email: str(formData.get("email")) || null,
        phone: str(formData.get("phone")) || null,
        address: str(formData.get("address")) || null,
        npwp: str(formData.get("npwp")) || null,
        termsDays,
      },
    });
  } catch {
    return { ok: false, error: "Mitra tidak ditemukan." };
  }

  refreshMaster();
  return { ok: true };
}

export async function deletePartnerAction(
  id: number
): Promise<{ ok: boolean; error?: string }> {
  const p = await prisma.partner.findUnique({
    where: { id },
    include: { _count: { select: { invoices: true, payments: true, journalLines: true } } },
  });
  if (!p) return { ok: false, error: "Mitra tidak ditemukan." };

  const c = p._count;
  if (c.invoices > 0 || c.payments > 0 || c.journalLines > 0) {
    return {
      ok: false,
      error: `Tidak bisa dihapus: mitra dipakai di ${c.invoices} faktur, ${c.payments} pembayaran, ${c.journalLines} baris jurnal.`,
    };
  }

  try {
    await prisma.partner.delete({ where: { id } });
  } catch {
    return { ok: false, error: "Gagal menghapus mitra." };
  }

  refreshMaster();
  return { ok: true };
}

/* ================= BARANG (Item) ================= */

async function validateItemCode(code: string, id?: number): Promise<string | null> {
  if (!code) return "Kode barang wajib diisi.";
  const dup = await prisma.item.findFirst({
    where: { code, ...(id ? { id: { not: id } } : {}) },
    select: { id: true },
  });
  if (dup) return `Kode "${code}" sudah dipakai barang lain.`;
  return null;
}

async function validateExpenseAccount(acctId: number | null): Promise<string | null> {
  if (acctId === null) return null;
  const acc = await prisma.account.findUnique({
    where: { id: acctId },
    select: { type: true, isGroup: true },
  });
  if (!acc) return "Akun beban tidak ditemukan.";
  if (acc.isGroup) return "Akun beban tidak boleh akun grup.";
  if (!["EXPENSE", "ASSET"].includes(acc.type)) {
    return "Akun pembelian harus bertipe Beban atau Aset.";
  }
  return null;
}

export async function createItemAction(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const code = str(formData.get("code"));
  const name = str(formData.get("name"));
  const type = str(formData.get("type")) || "PRODUCT";
  const unit = str(formData.get("unit")) || "pcs";
  const sellPrice = num(formData.get("sellPrice"));
  const costPrice = num(formData.get("costPrice"));
  const expenseAcctId = optNum(formData.get("expenseAcctId"));
  const isActive = formData.get("isActive") !== null;

  if (!name) return { ok: false, error: "Nama barang wajib diisi." };
  if (!ITEM_TYPES.includes(type)) return { ok: false, error: "Tipe barang tidak valid." };
  const dupCode = await validateItemCode(code);
  if (dupCode) return { ok: false, error: dupCode };
  const badAcc = await validateExpenseAccount(expenseAcctId);
  if (badAcc) return { ok: false, error: badAcc };

  try {
    await prisma.item.create({
      data: { code, name, type, unit, sellPrice, costPrice, expenseAcctId, isActive },
    });
  } catch {
    return { ok: false, error: "Gagal menyimpan barang." };
  }

  refreshMaster();
  return { ok: true };
}

export async function updateItemAction(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const id = Number(formData.get("id"));
  if (!id) return { ok: false, error: "ID barang tidak valid." };

  const code = str(formData.get("code"));
  const name = str(formData.get("name"));
  const type = str(formData.get("type")) || "PRODUCT";
  const unit = str(formData.get("unit")) || "pcs";
  const sellPrice = num(formData.get("sellPrice"));
  const costPrice = num(formData.get("costPrice"));
  const expenseAcctId = optNum(formData.get("expenseAcctId"));
  const isActive = formData.get("isActive") !== null;

  if (!name) return { ok: false, error: "Nama barang wajib diisi." };
  if (!ITEM_TYPES.includes(type)) return { ok: false, error: "Tipe barang tidak valid." };
  const dupCode = await validateItemCode(code, id);
  if (dupCode) return { ok: false, error: dupCode };
  const badAcc = await validateExpenseAccount(expenseAcctId);
  if (badAcc) return { ok: false, error: badAcc };

  try {
    await prisma.item.update({
      where: { id },
      data: { code, name, type, unit, sellPrice, costPrice, expenseAcctId, isActive },
    });
  } catch {
    return { ok: false, error: "Barang tidak ditemukan." };
  }

  refreshMaster();
  return { ok: true };
}

export async function deleteItemAction(
  id: number
): Promise<{ ok: boolean; error?: string }> {
  const item = await prisma.item.findUnique({
    where: { id },
    include: { _count: { select: { invoiceLines: true } } },
  });
  if (!item) return { ok: false, error: "Barang tidak ditemukan." };

  if (item._count.invoiceLines > 0) {
    return {
      ok: false,
      error: `Tidak bisa dihapus: barang sudah dipakai di ${item._count.invoiceLines} baris faktur. Nonaktifkan saja.`,
    };
  }

  try {
    await prisma.item.delete({ where: { id } });
  } catch {
    return { ok: false, error: "Gagal menghapus barang." };
  }

  refreshMaster();
  return { ok: true };
}

/* ================= PAJAK (Tax) ================= */

async function validateTaxCode(code: string, id?: number): Promise<string | null> {
  if (!code) return "Kode pajak wajib diisi.";
  const dup = await prisma.tax.findFirst({
    where: { code, ...(id ? { id: { not: id } } : {}) },
    select: { id: true },
  });
  if (dup) return `Kode "${code}" sudah dipakai pajak lain.`;
  return null;
}

export async function createTaxAction(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const code = str(formData.get("code"));
  const name = str(formData.get("name"));
  const rate = float(formData.get("rate"));
  const type = str(formData.get("type")) || "NONE";
  const active = formData.get("active") !== null;

  if (!name) return { ok: false, error: "Nama pajak wajib diisi." };
  if (!TAX_TYPES.includes(type)) return { ok: false, error: "Jenis pajak tidak valid." };
  if (rate < 0 || rate > 1) return { ok: false, error: "Tarif harus antara 0 dan 1 (mis. 0.11)." };
  const dupCode = await validateTaxCode(code);
  if (dupCode) return { ok: false, error: dupCode };

  try {
    await prisma.tax.create({ data: { code, name, rate, type, active } });
  } catch {
    return { ok: false, error: "Gagal menyimpan pajak." };
  }

  refreshMaster();
  return { ok: true };
}

export async function updateTaxAction(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const id = Number(formData.get("id"));
  if (!id) return { ok: false, error: "ID pajak tidak valid." };

  const code = str(formData.get("code"));
  const name = str(formData.get("name"));
  const rate = float(formData.get("rate"));
  const type = str(formData.get("type")) || "NONE";
  const active = formData.get("active") !== null;

  if (!name) return { ok: false, error: "Nama pajak wajib diisi." };
  if (!TAX_TYPES.includes(type)) return { ok: false, error: "Jenis pajak tidak valid." };
  if (rate < 0 || rate > 1) return { ok: false, error: "Tarif harus antara 0 dan 1 (mis. 0.11)." };
  const dupCode = await validateTaxCode(code, id);
  if (dupCode) return { ok: false, error: dupCode };

  try {
    await prisma.tax.update({ where: { id }, data: { code, name, rate, type, active } });
  } catch {
    return { ok: false, error: "Pajak tidak ditemukan." };
  }

  refreshMaster();
  return { ok: true };
}

export async function deleteTaxAction(
  id: number
): Promise<{ ok: boolean; error?: string }> {
  const tax = await prisma.tax.findUnique({
    where: { id },
    include: { _count: { select: { invoiceLines: true } } },
  });
  if (!tax) return { ok: false, error: "Pajak tidak ditemukan." };

  if (tax._count.invoiceLines > 0) {
    return {
      ok: false,
      error: `Tidak bisa dihapus: pajak sudah dipakai di ${tax._count.invoiceLines} baris faktur. Nonaktifkan saja.`,
    };
  }

  refreshMaster();
  return { ok: true };
}

/* ================= SETTING PERUSAHAAN ================= */

export async function updateCompanySettingAction(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const companyName = str(formData.get("companyName")) || "Perusahaan Saya";
  const npwp = str(formData.get("npwp"));
  const address = str(formData.get("address"));
  const fiscalYearStart = num(formData.get("fiscalYearStart")) || 1;

  try {
    await prisma.setting.upsert({
      where: { id: 1 },
      update: { companyName, npwp, address, fiscalYearStart },
      create: { id: 1, companyName, npwp, address, fiscalYearStart },
    });
    revalidatePath("/");
    revalidatePath("/setup");
    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gagal menyimpan data usaha";
    return { ok: false, error: msg };
  }
}
