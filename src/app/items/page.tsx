import { prisma } from "@/lib/db";
import { ItemsManager } from "./manager";

export const dynamic = "force-dynamic";

export default async function ItemsPage() {
  const [items, expenseAccounts] = await Promise.all([
    prisma.item.findMany({ orderBy: { code: "asc" } }),
    prisma.account.findMany({
      where: { type: { in: ["EXPENSE", "ASSET"] }, isGroup: false },
      orderBy: { code: "asc" },
      select: { id: true, code: true, name: true },
    }),
  ]);

  return (
    <ItemsManager
      items={items.map((i) => ({
        id: i.id,
        code: i.code,
        name: i.name,
        type: i.type,
        unit: i.unit,
        sellPrice: i.sellPrice,
        costPrice: i.costPrice,
        expenseAcctId: i.expenseAcctId ?? "",
        isActive: i.isActive,
        typeLabel: i.type === "PRODUCT" ? "Barang" : "Jasa",
      }))}
      expenseAccounts={expenseAccounts.map((a) => ({
        value: String(a.id),
        label: `${a.code} · ${a.name}`,
      }))}
    />
  );
}
