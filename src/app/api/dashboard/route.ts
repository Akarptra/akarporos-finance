import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [ar, sales, expenses, kasBank, invoiceCount, recentEntries, itemCount, partnerCount] =
      await Promise.all([
        prisma.journalLine.aggregate({
          where: { account: { alias: "AR" } },
          _sum: { debit: true, credit: true },
        }),
        prisma.journalLine.aggregate({
          where: { account: { alias: "SALES" } },
          _sum: { credit: true, debit: true },
        }),
        prisma.journalLine.aggregate({
          where: { account: { type: "EXPENSE" } },
          _sum: { debit: true, credit: true },
        }),
        prisma.journalLine.aggregate({
          where: { account: { isCash: true } },
          _sum: { debit: true, credit: true },
        }),
        prisma.invoice.count(),
        prisma.journalEntry.findMany({
          orderBy: { date: "desc" },
          take: 15,
          include: {
            lines: {
              include: { account: true, partner: true },
            },
          },
        }),
        prisma.item.count(),
        prisma.partner.count(),
      ]);

    const piutang = (ar._sum.debit ?? 0) - (ar._sum.credit ?? 0);
    const penjualan = (sales._sum.credit ?? 0) - (sales._sum.debit ?? 0);
    const beban = (expenses._sum.debit ?? 0) - (expenses._sum.credit ?? 0);
    const kas = (kasBank._sum.debit ?? 0) - (kasBank._sum.credit ?? 0);
    const labaRugi = penjualan - beban;

    const activities = recentEntries.map((e) => {
      const totalAmount = e.lines.reduce((acc, l) => acc + l.debit, 0);
      return {
        id: e.id,
        date: e.date,
        memo: e.memo,
        ref: e.reference,
        amount: totalAmount,
        type: e.sourceType,
      };
    });

    return NextResponse.json({
      success: true,
      stats: {
        kas,
        piutang,
        penjualan,
        beban,
        labaRugi,
        invoiceCount,
        itemCount,
        partnerCount,
      },
      activities,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
