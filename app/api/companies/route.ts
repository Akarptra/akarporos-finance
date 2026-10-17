import { NextResponse } from "next/server";
import db from "@/lib/db";
import { createCompany } from "@/lib/coa";

export async function GET() {
  const companies = db.prepare("SELECT * FROM companies ORDER BY id").all();
  return NextResponse.json({ companies });
}

export async function POST(req: Request) {
  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
  const company = createCompany(name);
  return NextResponse.json({ company }, { status: 201 });
}
