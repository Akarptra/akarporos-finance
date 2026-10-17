import db from "./db";

export type Account = {
  id: number;
  company_id: number;
  code: string;
  name: string;
  type: "asset" | "liability" | "equity" | "revenue" | "expense";
  normal_balance: "debit" | "credit";
  parent_id: number | null;
  opening_balance: number;
};

// ----- Standard COA seed (PSAK akun utama) -----
const STANDARD_COA = [
  // Aset Lancar (debit)
  ["1100", "Kas & Bank", "asset", "debit", null],
  ["1110", "Piutang Usaha", "asset", "debit", null],
  ["1120", "Persediaan", "asset", "debit", null],
  ["1130", "Pajak Dibayar Dimuka", "asset", "debit", null],
  // Aset Tidak Lancar
  ["1200", "Aset Tetap", "asset", "debit", null],
  ["1201", "Akumulasi Penyusutan", "asset", "credit", 1200],
  // Liabilitas
  ["2100", "Utang Usaha", "liability", "credit", null],
  ["2110", "Utang Pajak", "liability", "credit", null],
  ["2120", "Pendapatan Diterima Dimuka", "liability", "credit", null],
  // Ekuitas
  ["3100", "Modal", "equity", "credit", null],
  ["3110", "Laba Ditahan", "equity", "credit", null],
  // Pendapatan
  ["4100", "Pendapatan Usaha", "revenue", "credit", null],
  ["4200", "Pendapatan Lain-lain", "revenue", "credit", null],
  // Beban
  ["5100", "Harga Pokok Penjualan", "expense", "debit", null],
  ["5110", "Beban Gaji", "expense", "debit", null],
  ["5120", "Beban Sewa", "expense", "debit", null],
  ["5130", "Beban Listrik & Air", "expense", "debit", null],
  ["5140", "Beban Operasional Lain", "expense", "debit", null],
];

export function seedStandardCOA(companyId: number): void {
  const count = (
    db.prepare("SELECT COUNT(*) AS c FROM chart_of_accounts WHERE company_id = ?").get(companyId) as {
      c: number;
    }
  ).c;
  if (count > 0) return;
  const ins = db.prepare(
    "INSERT INTO chart_of_accounts (company_id, code, name, type, normal_balance, parent_id) VALUES (?,?,?,?,?,?)"
  );
  for (const [code, name, type, bal, parent] of STANDARD_COA) {
    let parentId: number | null = null;
    if (parent) {
      parentId = (
        db
          .prepare("SELECT id FROM chart_of_accounts WHERE company_id=? AND code=?")
          .get(companyId, parent) as Account
      )?.id ?? null;
    }
    ins.run(companyId, code, name, type, bal, parentId);
  }
}

export function listAccounts(companyId: number): Account[] {
  return db
    .prepare("SELECT * FROM chart_of_accounts WHERE company_id=? ORDER BY code")
    .all(companyId) as Account[];
}

export function createCompany(name: string): { id: number } {
  const info = db.prepare("INSERT INTO companies (name) VALUES (?)").run(name);
  const id = info.lastInsertRowid as number;
  seedStandardCOA(id);
  return { id };
}
