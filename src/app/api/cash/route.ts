import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cashAccounts = await prisma.account.findMany({
      where: { isCash: true },
      include: {
        journalLines: {
          select: { debit: true, credit: true },
        },
      },
      orderBy: { code: "asc" },
    });

    const accountsWithBalance = cashAccounts.map((acct) => {
      const balance = acct.journalLines.reduce((acc, l) => acc + l.debit - l.credit, 0);
      return {
        id: acct.id,
        code: acct.code,
        name: acct.name,
        balance,
      };
    });

    return NextResponse.json({ success: true, accounts: accountsWithBalance });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, balance } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: "Nama kas/bank wajib diisi" }, { status: 400 });
    }

    const code = `10${Date.now().toString().slice(-2)}`;

    // Create account
    const account = await prisma.account.create({
      data: {
        code,
        name,
        type: "ASSET",
        alias: "BANK",
        isCash: true,
      },
    });

    // If opening balance > 0, post opening journal entry
    const initialAmount = Number(balance) || 0;
    if (initialAmount > 0) {
      // Find or create Equity Opening Balance account
      let equityAcct = await prisma.account.findFirst({
        where: { type: "EQUITY" },
      });
      if (!equityAcct) {
        equityAcct = await prisma.account.create({
          data: {
            code: "3000",
            name: "Modal Disetor",
            type: "EQUITY",
            alias: "EQUITY",
          },
        });
      }

      await prisma.journalEntry.create({
        data: {
          date: new Date(),
          memo: `Saldo Awal ${name}`,
          reference: `SA-${code}`,
          sourceType: "MANUAL",
          lines: {
            create: [
              {
                accountId: account.id,
                debit: initialAmount,
                credit: 0,
                memo: `Saldo Awal ${name}`,
              },
              {
                accountId: equityAcct.id,
                debit: 0,
                credit: initialAmount,
                memo: `Penyesuaian Modal Saldo Awal`,
              },
            ],
          },
        },
      });
    }

    return NextResponse.json({ success: true, account });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
