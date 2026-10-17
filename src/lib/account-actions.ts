"use server";

import { prisma } from "./db";
import { revalidatePath } from "next/cache";

const VALID_TYPES = ["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"];

// Alias diseragamkan huruf besar supaya cocok dengan lookup engine (KAS, BANK, AR, ...)
function normAlias(v: FormDataEntryValue | null): string {
  return String(v ?? "").trim().toUpperCase();
}

function str(v: FormDataEntryValue | null): string {
  return String(v ?? "").trim();
}

// Recompute isGroup sebuah akun (true jika punya sub-akun)
async function refreshIsGroup(accountId: number | null): Promise<void> {
  if (!accountId) return;
  const count = await prisma.account.count({ where: { parentId: accountId } });
  await prisma.account.update({
    where: { id: accountId },
    data: { isGroup: count > 0 },
  });
}

// Cek apakah menjadikan parentId sebagai induk id akan membuat siklus hierarki
async function createsCycle(id: number, parentId: number): Promise<boolean> {
  let cursor: number | null = parentId;
  const seen = new Set<number>();
  while (cursor !== null && !seen.has(cursor)) {
    if (cursor === id) return true;
    seen.add(cursor);
    const node: { parentId: number | null } | null =
      await prisma.account.findUnique({
        where: { id: cursor },
        select: { parentId: true },
      });
    cursor = node?.parentId ?? null;
  }
  return false;
}

async function validate(input: {
  id?: number;
  code: string;
  name: string;
  type: string;
  alias: string;
  parentId: number | null;
}): Promise<string | null> {
  const { id, code, name, type, alias, parentId } = input;

  if (!code) return "Kode wajib diisi.";
  if (!name) return "Nama akun wajib diisi.";
  if (!VALID_TYPES.includes(type)) return "Tipe akun tidak valid.";

  // Kode harus unik
  const dupCode = await prisma.account.findFirst({
    where: { code, ...(id ? { id: { not: id } } : {}) },
    select: { id: true },
  });
  if (dupCode) return `Kode "${code}" sudah dipakai akun lain.`;

  // Alias harus unik karena dipakai engine untuk lookup (AR, KAS, BANK, ...)
  if (alias) {
    const dupAlias = await prisma.account.findFirst({
      where: { alias, ...(id ? { id: { not: id } } : {}) },
      select: { id: true },
    });
    if (dupAlias) return `Alias "${alias}" sudah dipakai akun lain.`;
  }

  // Validasi induk
  if (parentId) {
    const p = await prisma.account.findUnique({
      where: { id: parentId },
      select: { id: true },
    });
    if (!p) return "Induk akun tidak ditemukan.";
    if (id) {
      if (parentId === id) return "Akun tidak bisa jadi induk dirinya sendiri.";
      if (await createsCycle(id, parentId)) {
        return "Pilihan induk akan membuat siklus hierarki.";
      }
    }
  }

  return null;
}

export async function createAccountAction(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const code = str(formData.get("code"));
  const name = str(formData.get("name"));
  const type = str(formData.get("type"));
  const alias = normAlias(formData.get("alias"));
  const parentRaw = str(formData.get("parentId"));
  const parentId = parentRaw ? Number(parentRaw) : null;

  const error = await validate({ code, name, type, alias, parentId });
  if (error) return { ok: false, error };

  try {
    await prisma.account.create({
      data: { code, name, type, alias: alias || null, parentId },
    });
  } catch {
    return { ok: false, error: "Gagal menyimpan akun." };
  }

  await refreshIsGroup(parentId);
  revalidatePath("/accounts");
  revalidatePath("/");
  return { ok: true };
}

export async function updateAccountAction(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const id = Number(formData.get("id"));
  if (!id) return { ok: false, error: "ID akun tidak valid." };

  const existing = await prisma.account.findUnique({
    where: { id },
    select: { id: true, parentId: true },
  });
  if (!existing) return { ok: false, error: "Akun tidak ditemukan." };

  const code = str(formData.get("code"));
  const name = str(formData.get("name"));
  const type = str(formData.get("type"));
  const alias = normAlias(formData.get("alias"));
  const parentRaw = str(formData.get("parentId"));
  const parentId = parentRaw ? Number(parentRaw) : null;

  const error = await validate({ id, code, name, type, alias, parentId });
  if (error) return { ok: false, error };

  try {
    await prisma.account.update({
      where: { id },
      data: { code, name, type, alias: alias || null, parentId },
    });
  } catch {
    return { ok: false, error: "Gagal memperbarui akun." };
  }

  // Jika induk berubah, recompute isGroup induk lama & baru
  if (existing.parentId !== parentId) {
    await refreshIsGroup(existing.parentId);
    await refreshIsGroup(parentId);
  }
  await refreshIsGroup(id);

  revalidatePath("/accounts");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteAccountAction(
  id: number
): Promise<{ ok: boolean; error?: string }> {
  const acc = await prisma.account.findUnique({
    where: { id },
    include: {
      _count: { select: { journalLines: true, children: true, payments: true } },
    },
  });
  if (!acc) return { ok: false, error: "Akun tidak ditemukan." };

  if (acc._count.journalLines > 0) {
    return {
      ok: false,
      error: `Tidak bisa dihapus: akun sudah dipakai di ${acc._count.journalLines} baris jurnal (transaksi).`,
    };
  }
  if (acc._count.children > 0) {
    return { ok: false, error: "Tidak bisa dihapus: masih ada sub-akun di bawahnya." };
  }
  if (acc._count.payments > 0) {
    return {
      ok: false,
      error: "Tidak bisa dihapus: akun dipakai pada transaksi pembayaran.",
    };
  }

  const parentId = acc.parentId;
  try {
    await prisma.account.delete({ where: { id } });
  } catch {
    return { ok: false, error: "Gagal menghapus akun." };
  }

  await refreshIsGroup(parentId);
  revalidatePath("/accounts");
  revalidatePath("/");
  return { ok: true };
}
