import { prisma } from "@/lib/db";
import { PartnersManager } from "./manager";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  CUSTOMER: "Pelanggan",
  VENDOR: "Pemasok",
  BOTH: "Keduanya",
};

export default async function PartnersPage() {
  const partners = await prisma.partner.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { invoices: true } } },
  });

  return (
    <PartnersManager
      partners={partners.map((p) => ({
        id: p.id,
        type: p.type,
        name: p.name,
        email: p.email,
        phone: p.phone,
        address: p.address,
        npwp: p.npwp,
        termsDays: p.termsDays,
        invoiceCount: p._count.invoices,
        typeLabel: TYPE_LABEL[p.type] ?? p.type,
      }))}
    />
  );
}
