import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DATA_DIR =
  process.env.DATA_DIR ||
  (process.env.VERCEL ? "/tmp" : path.join(process.cwd(), "data"));
const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, "finance.db");

fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  fiscal_start TEXT,
  ppn_rate REAL NOT NULL DEFAULT 11.0,
  created_at TEXT DEFAULT (datetime('now')),
  currency TEXT DEFAULT 'IDR'
);

CREATE TABLE IF NOT EXISTS chart_of_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  normal_balance TEXT NOT NULL,
  parent_id INTEGER,
  opening_balance NUMERIC DEFAULT 0
);

CREATE TABLE IF NOT EXISTS journal_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  entry_number TEXT NOT NULL,
  entry_date TEXT NOT NULL,
  description TEXT,
  source TEXT DEFAULT 'manual',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS journal_lines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  journal_id INTEGER NOT NULL,
  account_id INTEGER NOT NULL,
  debit NUMERIC DEFAULT 0,
  credit NUMERIC DEFAULT 0
);

CREATE TABLE IF NOT EXISTS parties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  code TEXT,
  name TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'customer'
);

CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  party_id INTEGER,
  invoice_date TEXT NOT NULL,
  invoice_number TEXT,
  total NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'draft'
);
`);

export default db;
