import { Prisma, PrismaClient } from "@prisma/client";

// Tipe client yang dipakai di dalam transaksi
export type Db = Prisma.TransactionClient | PrismaClient;

// Representasi satu baris jurnal sementara (belum tersimpan)
export interface DraftLine {
  accountId: number;
  debit: number;
  credit: number;
  memo?: string | null;
  partnerId?: number | null;
}

export interface DraftEntry {
  date: Date;
  memo: string;
  reference?: string | null;
  sourceType: string;
  sourceId?: number | null;
  lines: DraftLine[];
}

/**
 * Validasi keseimbangan debit/kredit (persamaan dasar akuntansi).
 * Lembar jurnal SAH hanya jika total debit == total credit.
 */
export function assertBalanced(lines: DraftLine[]): void {
  const totalDebit = lines.reduce((s, l) => s + l.debit, 0);
  const totalCredit = lines.reduce((s, l) => s + l.credit, 0);
  if (totalDebit !== totalCredit) {
    throw new Error(
      `Jurnal tidak seimbang: debit ${totalDebit} vs kredit ${totalCredit}`
    );
  }
  if (totalDebit === 0) {
    throw new Error("Jurnal kosong (total 0).");
  }
}

/** Simpan lembar jurnal + barisnya. Memastikan seimbang dulu. */
export async function postJournal(db: Db, entry: DraftEntry) {
  assertBalanced(entry.lines);

  return db.journalEntry.create({
    data: {
      date: entry.date,
      memo: entry.memo,
      reference: entry.reference ?? null,
      sourceType: entry.sourceType,
      sourceId: entry.sourceId ?? null,
      lines: {
        create: entry.lines.map((l) => ({
          accountId: l.accountId,
          debit: Math.round(l.debit),
          credit: Math.round(l.credit),
          memo: l.memo ?? null,
          partnerId: l.partnerId ?? null,
        })),
      },
    },
    include: { lines: true },
  });
}

/**
 * Lookup akun berdasarkan "alias" sistem (KAS, BANK, AR, AP, SALES, VAT_OUT, ...).
 * Alias di-set di tabel Account waktu seed / lewat UI.
 */
export async function accountByAlias(db: Db, alias: string) {
  const acc = await db.account.findFirst({ where: { alias } });
  if (!acc) {
    throw new Error(
      `Akun dengan alias "${alias}" belum di-set. Atur di menu Akun (COA).`
    );
  }
  return acc;
}
