import { Db, postJournal, accountByAlias, DraftLine } from "./journal";

/* ============ Transaksi kas/bank non-faktur ============ */

export interface CashExpenseInput {
  number: string;
  date: Date;
  cashAccountId: number;
  expenseAccountId: number;
  amount: number;
  partnerId?: number | null;
  memo?: string;
}

/**
 * Pengeluaran kas (beban operasional):
 *   Debit  Beban
 *   Credit Kas / Bank
 */
export async function recordExpense(db: Db, input: CashExpenseInput) {
  const cash = await requireCashAccount(db, input.cashAccountId);
  const expense = await db.account.findUnique({ where: { id: input.expenseAccountId } });
  if (!expense) throw new Error("Akun beban tidak ditemukan.");
  if (expense.type !== "EXPENSE") throw new Error(`Akun "${expense.name}" harus bertipe Beban.`);

  const lines: DraftLine[] = [
    {
      accountId: expense.id,
      debit: input.amount,
      credit: 0,
      memo: input.memo || `Beban ${input.number}`,
      partnerId: input.partnerId ?? null,
    },
    {
      accountId: cash.id,
      debit: 0,
      credit: input.amount,
      memo: `Pengeluaran ${input.number}`,
      partnerId: input.partnerId ?? null,
    },
  ];

  const entry = await postJournal(db, {
    date: input.date,
    memo: input.memo || `Pengeluaran kas ${input.number}`,
    reference: input.number,
    sourceType: "CASH_EXPENSE",
    lines,
  });

  return { entry };
}

export interface CashReceiptInput {
  number: string;
  date: Date;
  cashAccountId: number;
  revenueAccountId: number;
  amount: number;
  partnerId?: number | null;
  memo?: string;
}

/**
 * Penerimaan kas (pendapatan non-piutang, mis. tunai):
 *   Debit  Kas / Bank
 *   Credit Pendapatan
 */
export async function recordReceipt(db: Db, input: CashReceiptInput) {
  const cash = await requireCashAccount(db, input.cashAccountId);
  const revenue = await db.account.findUnique({ where: { id: input.revenueAccountId } });
  if (!revenue) throw new Error("Akun pendapatan tidak ditemukan.");
  if (revenue.type !== "REVENUE") {
    throw new Error(`Akun "${revenue.name}" harus bertipe Pendapatan.`);
  }

  const lines: DraftLine[] = [
    {
      accountId: cash.id,
      debit: input.amount,
      credit: 0,
      memo: `Penerimaan ${input.number}`,
      partnerId: input.partnerId ?? null,
    },
    {
      accountId: revenue.id,
      debit: 0,
      credit: input.amount,
      memo: input.memo || `Pendapatan ${input.number}`,
      partnerId: input.partnerId ?? null,
    },
  ];

  const entry = await postJournal(db, {
    date: input.date,
    memo: input.memo || `Penerimaan kas ${input.number}`,
    reference: input.number,
    sourceType: "CASH_RECEIPT",
    lines,
  });

  return { entry };
}

export interface CashTransferInput {
  number: string;
  date: Date;
  fromAccountId: number;
  toAccountId: number;
  amount: number;
  memo?: string;
}

/**
 * Mutasi antar kas/bank:
 *   Debit  Kas tujuan
 *   Credit Kas asal
 * Tidak memengaruhi total kas → otomatis diabaikan Arus Kas.
 */
export async function transferCash(db: Db, input: CashTransferInput) {
  if (input.fromAccountId === input.toAccountId) {
    throw new Error("Kas asal dan tujuan tidak boleh sama.");
  }
  const from = await requireCashAccount(db, input.fromAccountId);
  const to = await requireCashAccount(db, input.toAccountId);

  const lines: DraftLine[] = [
    {
      accountId: to.id,
      debit: input.amount,
      credit: 0,
      memo: `Mutasi masuk ${input.number}`,
    },
    {
      accountId: from.id,
      debit: 0,
      credit: input.amount,
      memo: `Mutasi keluar ${input.number}`,
    },
  ];

  const entry = await postJournal(db, {
    date: input.date,
    memo: input.memo || `Mutasi kas ${input.number}`,
    reference: input.number,
    sourceType: "CASH_TRANSFER",
    lines,
  });

  return { entry };
}

async function requireCashAccount(db: Db, id: number) {
  const acc = await db.account.findUnique({ where: { id } });
  if (!acc) throw new Error("Akun kas/bank tidak ditemukan.");
  if (!acc.isCash) throw new Error(`Akun "${acc.name}" bukan akun kas/bank (centang isCash).`);
  return acc;
}

/* ============ Saldo & mutasi kas/bank ============ */

export interface CashAccountRow {
  id: number;
  code: string;
  name: string;
  balance: number;
}

export async function cashAccounts(db: Db): Promise<CashAccountRow[]> {
  const [accounts, sums] = await Promise.all([
    db.account.findMany({ where: { isCash: true }, orderBy: { code: "asc" } }),
    db.journalLine.groupBy({
      by: ["accountId"],
      _sum: { debit: true, credit: true },
      where: { account: { isCash: true } },
    }),
  ]);
  const map = new Map(sums.map((s) => [s.accountId, (s._sum.debit ?? 0) - (s._sum.credit ?? 0)]));
  return accounts.map((a) => ({
    id: a.id,
    code: a.code,
    name: a.name,
    balance: map.get(a.id) ?? 0,
  }));
}

export interface CashTransactionRow {
  id: number;
  date: Date;
  sourceType: string;
  memo: string;
  cashAccountId: number;
  masuk: number;
  keluar: number;
}

/** Semua mutasi kas/bank (faktur + transaksi kas) untuk laporan/mutasi. */
export async function cashTransactions(db: Db, cashIds: number[]): Promise<CashTransactionRow[]> {
  if (cashIds.length === 0) return [];
  const lines = await db.journalLine.findMany({
    where: { accountId: { in: cashIds } },
    include: { entry: true },
    orderBy: [{ entry: { date: "desc" } }, { id: "desc" }],
  });
  return lines.map((l) => ({
    id: l.id,
    date: l.entry.date,
    sourceType: l.entry.sourceType,
    memo: l.entry.memo,
    cashAccountId: l.accountId,
    masuk: l.debit,
    keluar: l.credit,
  }));
}
