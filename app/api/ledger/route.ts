import { NextResponse } from "next/server";
import { listAccounts } from "@/lib/coa";
import { postJournal, listJournals } from "@/lib/journal";
import { getReport } from "@/lib/report";

// GET accounts or reports
export async function GET(req: Request) {
  const url = new URL(req.url);
  const companyId = Number(url.searchParams.get("company_id"));
  const report = url.searchParams.get("report");
  const from = url.searchParams.get("from") || "2000-01-01";
  const to = url.searchParams.get("to") || "2999-12-31";
  if (!companyId) return NextResponse.json({ error: "company_id required" }, { status: 400 });

  if (report) {
    const data = getReport(companyId, from, to);
    return NextResponse.json(data);
  }
  if (url.searchParams.has("journals")) {
    return NextResponse.json({ journals: listJournals(companyId, from, to) });
  }
  return NextResponse.json({ accounts: listAccounts(companyId) });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { company_id, type, ...rest } = body;
  if (!company_id) return NextResponse.json({ error: "company_id required" }, { status: 400 });
  if (type === "journal") {
    try {
      const j = postJournal(company_id, rest.entry_date, rest.description, rest.lines);
      return NextResponse.json({ journal: j }, { status: 201 });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "unknown";
      return NextResponse.json({ error: msg }, { status: 400 });
    }
  }
  return NextResponse.json({ error: "unknown type" }, { status: 400 });
}
