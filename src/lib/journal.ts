import db from "./db";

export function postJournal(
  companyId: number,
  entryDate: string,
  description: string,
  lines: { account_id: number; debit: number; credit: number }[]
): { id: number; entry_number: string } {
  if (lines.length < 2) throw new Error("Jurnal minimal 2 baris (debit+credit)");
  const totalDebit = lines.reduce((s, l) => s + (l.debit || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (l.credit || 0), 0);
  if (Math.abs(totalDebit - totalCredit) > 0.0001)
    throw new Error(`Jurnal tidak balance: debit ${totalDebit} != credit ${totalCredit}`);

  const seq = (
    db
      .prepare("SELECT COUNT(*)+1 AS c FROM journal_entries WHERE company_id=?")
      .get(companyId) as { c: number }
  ).c;
  const entryNumber = `JRN-${String(companyId).padStart(3, "0")}-${String(seq).padStart(4, "0")}`;

  const insert = db.transaction(() => {
    const info = db
      .prepare(
        "INSERT INTO journal_entries (company_id, entry_number, entry_date, description) VALUES (?,?,?,?)"
      )
      .run(companyId, entryNumber, entryDate, description);
    const jid = info.lastInsertRowid as number;
    const insLine = db.prepare(
      "INSERT INTO journal_lines (journal_id, account_id, debit, credit) VALUES (?,?,?,?)"
    );
    for (const l of lines) insLine.run(jid, l.account_id, l.debit, l.credit);
    return jid;
  });

  const jid = insert();
  return { id: jid, entry_number: entryNumber };
}

export function listJournals(companyId: number, from?: string, to?: string) {
  let sql =
    "SELECT je.*, " +
    "(SELECT json_group_array(json_object('account_id', jl.account_id, 'debit', jl.debit, 'credit', jl.credit, 'code', a.code, 'name', a.name)) " +
    " FROM journal_lines jl JOIN chart_of_accounts a ON a.id=jl.account_id WHERE jl.journal_id=je.id) AS lines " +
    "FROM journal_entries je WHERE je.company_id=? ";
  const params: (string | number)[] = [companyId];
  if (from && to) {
    sql += "AND je.entry_date BETWEEN ? AND ? ";
    params.push(from, to);
  }
  sql += "ORDER BY je.entry_date DESC, je.id DESC";
  return db.prepare(sql).all(...params);
}
