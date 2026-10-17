"use server";

import { prisma } from "./db";
import { recordExpense, recordReceipt, transferCash } from "./cash";
import { revalidatePath } from "next/cache";
import { formatRp } from "./format";

const str = (v: FormDataEntryValue | null) => String(v ?? "").trim();
const num = (v: FormDataEntryValue | null) => Number(v);

function refreshCash() {
  revalidatePath("/cash");
  revalidatePath("/");
  revalidatePath("/journal");
  revalidatePath("/reports");
}

/** Saldo sebuah akun (debit - kredit). */
async function accountBalance(accountId: number): Promise<number> {
  const s = await prisma.journalLine.aggregate({
    _sum: { debit: true, credit: true },
    where: { accountId },
  });
  return (s._sum.debit ?? 0) - (s._sum.credit ?? 0);
}

interface CashCheck {
  error: string;
  needConfirm?: boolean;
}

/** Validasi umum + guard saldo negatif. */
async function validateCash(
  formData: FormData,
  cashAccountId: number,
  amount: number
): Promise<CashCheck | null> {
  if (!cashAccountId || !amount) return { error: "Akun kas/bank dan jumlah wajib diisi." };
  if (amount <= 0) return { error: "Jumlah harus lebih dari 0." };

  const acc = await prisma.account.findUnique({ where: { id: cashAccountId } });
  if (!acc) return { error: "Akun kas/bank tidak ditemukan." };
  if (!acc.isCash) return { error: `Akun "${acc.name}" bukan akun kas/bank.` };

  const saldo = await accountBalance(cashAccountId);
  if (saldo - amount < 0 && formData.get("allowOverdraw") !== "1") {
    return {
      needConfirm: true,
      error: `Saldo ${acc.name} tinggal ${formatRp(saldo)}. Pengeluaran ${formatRp(
        amount
      )} membuat saldo negatif. Centang "Tetap catat" untuk melanjutkan.`,
    };
  }
  return null;
}

export async function recordExpenseAction(
  formData: FormData
): Promise<{ ok: boolean; error?: string; needConfirm?: boolean }> {
  const cashAccountId = num(formData.get("cashAccountId"));
  const expenseAccountId = num(formData.get("expenseAccountId"));
  const amount = num(formData.get("amount"));
  const date = str(formData.get("date"));
  const number = str(formData.get("number"));
  const memo = str(formData.get("memo"));
  const partnerId = num(formData.get("partnerId")) || null;

  if (!number || !date) return { ok: false, error: "Nomor dan tanggal wajib diisi." };
  if (!expenseAccountId) return { ok: false, error: "Akun beban wajib dipilih." };

  const bad = await validateCash(formData, cashAccountId, amount);
  if (bad) return { ok: false, ...bad };

  try {
    await recordExpense(prisma, {
      number,
      date: new Date(date),
      cashAccountId,
      expenseAccountId,
      amount,
      partnerId,
      memo,
    });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gagal menyimpan." };
  }

  refreshCash();
  return { ok: true };
}

export async function recordReceiptAction(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const cashAccountId = num(formData.get("cashAccountId"));
  const revenueAccountId = num(formData.get("revenueAccountId"));
  const amount = num(formData.get("amount"));
  const date = str(formData.get("date"));
  const number = str(formData.get("number"));
  const memo = str(formData.get("memo"));
  const partnerId = num(formData.get("partnerId")) || null;

  if (!number || !date) return { ok: false, error: "Nomor dan tanggal wajib diisi." };
  if (!cashAccountId || !amount) return { ok: false, error: "Akun kas/bank dan jumlah wajib diisi." };
  if (amount <= 0) return { ok: false, error: "Jumlah harus lebih dari 0." };
  if (!revenueAccountId) return { ok: false, error: "Akun pendapatan wajib dipilih." };

  try {
    await recordReceipt(prisma, {
      number,
      date: new Date(date),
      cashAccountId,
      revenueAccountId,
      amount,
      partnerId,
      memo,
    });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gagal menyimpan." };
  }

  refreshCash();
  return { ok: true };
}

export async function transferCashAction(
  formData: FormData
): Promise<{ ok: boolean; error?: string; needConfirm?: boolean }> {
  const fromAccountId = num(formData.get("fromAccountId"));
  const toAccountId = num(formData.get("toAccountId"));
  const amount = num(formData.get("amount"));
  const date = str(formData.get("date"));
  const number = str(formData.get("number"));
  const memo = str(formData.get("memo"));

  if (!number || !date) return { ok: false, error: "Nomor dan tanggal wajib diisi." };
  if (!fromAccountId || !toAccountId) return { ok: false, error: "Kas asal dan tujuan wajib dipilih." };
  if (fromAccountId === toAccountId) return { ok: false, error: "Kas asal dan tujuan tidak boleh sama." };
  if (!amount) return { ok: false, error: "Jumlah wajib diisi." };
  if (amount <= 0) return { ok: false, error: "Jumlah harus lebih dari 0." };

  const bad = await validateCash(formData, fromAccountId, amount);
  if (bad) return { ok: false, ...bad };

  try {
    await transferCash(prisma, {
      number,
      date: new Date(date),
      fromAccountId,
      toAccountId,
      amount,
      memo,
    });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gagal menyimpan." };
  }

  refreshCash();
  return { ok: true };
}
