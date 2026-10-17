import { prisma } from "@/lib/db";
import { NewInvoiceForm } from "./form";

export const dynamic = "force-dynamic";

export default async function NewInvoicePage() {
  const [partners, taxes, items, lastInvoice] = await Promise.all([
    prisma.partner.findMany({ where: { type: { in: ["CUSTOMER", "BOTH"] } }, orderBy: { name: "asc" } }),
    prisma.tax.findMany({ where: { active: true } }),
    prisma.item.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.invoice.findFirst({ where: { type: "SALES" }, orderBy: { id: "desc" } }),
  ]);

  // Nomor urut sederhana: FJ-YYYYMMDD-### (atau lanjut dari terakhir)
  const nextNumber = nextInvoiceNumber(lastInvoice?.number ?? null);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Faktur Penjualan Baru</h1>
      <NewInvoiceForm
        partners={partners}
        taxes={taxes}
        items={items.map((i) => ({ id: i.id, name: i.name, sellPrice: i.sellPrice }))}
        defaultNumber={nextNumber}
      />
    </div>
  );
}

function nextInvoiceNumber(last: string | null): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const prefix = `FJ-${y}${m}${d}-`;
  if (last && last.startsWith(prefix)) {
    const seq = parseInt(last.slice(prefix.length), 10);
    if (!isNaN(seq)) return `${prefix}${String(seq + 1).padStart(3, "0")}`;
  }
  return `${prefix}001`;
}
