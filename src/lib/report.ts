import db from "./db";
import { Account, listAccounts } from "./coa";

type Line = { account_id: number; debit: number; credit: number };

function accountBalance(
  linesByAccount: Map<number, Line[]>,
  account: Account,
  allAccounts: Account[],
  start?: string
): number {
  let bal = account.opening_balance || 0;
  const rows = (linesByAccount.get(account.id) as
    | { entry_date: string; debit: number; credit: number }[]
    | undefined) || [];
  for (const r of rows) {
    if (start && r.entry_date < start) continue;
    bal += account.normal_balance === "debit" ? r.debit - r.credit : r.credit - r.debit;
  }
  return bal;
}

function children(acct: Account, all: Account[]): Account[] {
  return all.filter((a) => a.parent_id === acct.id);
}

export function getReport(
  companyId: number,
  from: string,
  to: string,
  includeOpening = false
) {
  const accounts = listAccounts(companyId);
  const linesByAccount = new Map<number, { account_id: number; entry_date: string; debit: number; credit: number }[]>();
  const rows = db
    .prepare(
      `SELECT jl.account_id, je.entry_date, jl.debit, jl.credit
       FROM journal_lines jl
       JOIN journal_entries je ON je.id = jl.journal_id
       WHERE je.company_id=? AND je.entry_date <= ?`
    )
    .all(companyId, to) as { account_id: number; entry_date: string; debit: number; credit: number }[];
  for (const r of rows) {
    if (!linesByAccount.has(r.account_id)) linesByAccount.set(r.account_id, []);
    linesByAccount.get(r.account_id)!.push(r);
  }
  const balCache = new Map<number, number>();
  const bal = (a: Account) => {
    if (!balCache.has(a.id)) balCache.set(a.id, accountBalance(linesByAccount, a, accounts, includeOpening ? undefined : from));
    return balCache.get(a.id)!;
  };

  // Recompute per type correctly: only accounts without children (leaf) or roll-up groups
  const section = (type: string) => {
    let sum = 0;
    for (const a of accounts.filter((x) => x.type === type)) {
      if (children(a, accounts).length > 0) sum += sectionOfGroup(a);
      else sum += bal(a);
    }
    return sum;
  };
  const sectionOfGroup = (group: Account) => {
    let s = 0;
    for (const a of children(group, accounts)) s += children(a, accounts).length ? sectionOfGroup(a) : bal(a);
    return s;
  };

  const assets = section("asset");
  const liabilities = section("liability");
  const equity = section("equity");
  const revenue = section("revenue");
  const expenses = section("expense");
  const netProfit = revenue - expenses;
  const equityIncludingProfit = equity + netProfit;

  return {
    from,
    to,
    sections: {
      assets,
      liabilities,
      equity,
      revenue,
      expenses,
      netProfit,
    },
    balanceCheck: assets - (liabilities + equityIncludingProfit),
    rows: accounts.map((a) => ({
      id: a.id,
      code: a.code,
      name: a.name,
      type: a.type,
      balance: bal(a),
      parent_id: a.parent_id,
    })),
  };
}
