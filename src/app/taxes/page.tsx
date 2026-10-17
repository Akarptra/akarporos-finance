import { prisma } from "@/lib/db";
import { TaxesManager } from "./manager";

export const dynamic = "force-dynamic";

export default async function TaxesPage() {
  const taxes = await prisma.tax.findMany({ orderBy: { code: "asc" } });

  return (
    <TaxesManager
      taxes={taxes.map((t) => ({
        id: t.id,
        code: t.code,
        name: t.name,
        rate: t.rate,
        type: t.type,
        active: t.active,
        rateLabel: `${(t.rate * 100).toLocaleString("id-ID", { maximumFractionDigits: 2 })}%`,
        typeLabel: t.type === "OUTPUT" ? "Keluaran" : t.type === "INPUT" ? "Masukan" : "Tanpa Pajak",
      }))}
    />
  );
}
