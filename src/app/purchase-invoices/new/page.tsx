import { prisma } from "@/lib/db";
import { NewPurchaseForm } from "./form";

export const dynamic = "force-dynamic";

export default async function NewPurchaseInvoicePage() {
  const [vendors, taxes, items, debitAccounts, inventoryAcc, lastInvoice] = await Promise.all([
    prisma.partner.findMany({
      where: { type: { in: ["VENDOR", "BOTH"] } },
      orderBy: { name: "asc" },
    }),
    prisma.tax.findMany({ where: { active: true } }),
    prisma.item.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.account.findMany({
      where: { type: { in: ["ASSET", "EXPENSE"] }, isGroup: false },
      orderBy: { code: "asc" },
      select: { id: true, code: true, name: true, type: true },
    }),
    prisma.account.findFirst({ where: { alias: "INVENTORY" } }),
    prisma.invoice.findFirst({ where: { type: "PURCHASE" }, orderBy: { id: "desc" } }),
  ]);

  // Akun default untuk baris jasa bila item belum punya akun beban
  const defaultExpense = debitAccounts.find((a) => a.type === "EXPENSE");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Faktur Pembelian Baru</h1>
      <NewPurchaseForm
        partners={vendors.map((v) => ({ id: v.id, name: v.name }))}
        taxes={taxes.map((t) => ({ id: t.id, name: t.name, rate: t.rate }))}
        items={items.map((i) => ({
          id: i.id,
          name: i.name,
          type: i.type,
          costPrice: i.costPrice,
          expenseAcctId: i.expenseAcctId,
        }))}
        debitAccounts={debitAccounts.map((a) => ({ id: a.id, label: `${a.code} · ${a.name}` }))}
        inventoryId={inventoryAcc?.id ?? null}
        defaultExpenseId={defaultExpense?.id ?? null}
        defaultNumber={nextPurchaseNumber(lastInvoice?.number ?? null)}
      />
    </div>
  );
}

function nextPurchaseNumber(last: string | null): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const prefix = `FB-${y}${m}${d}-`;
  if (last && last.startsWith(prefix)) {
    const seq = parseInt(last.slice(prefix.length), 10);
    if (!isNaN(seq)) return `${prefix}${String(seq + 1).padStart(3, "0")}`;
  }
  return `${prefix}001`;
}
