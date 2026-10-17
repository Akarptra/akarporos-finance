import { prisma } from "@/lib/db";
import { AccountsManager } from "./manager";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  const [accounts, balances] = await Promise.all([
    prisma.account.findMany({ orderBy: { code: "asc" } }),
    prisma.journalLine.groupBy({
      by: ["accountId"],
      _sum: { debit: true, credit: true },
    }),
  ]);

  const balanceMap: Record<number, number> = {};
  for (const b of balances) {
    balanceMap[b.accountId] = (b._sum.debit ?? 0) - (b._sum.credit ?? 0);
  }

  return <AccountsManager accounts={accounts} balances={balanceMap} />;
}
