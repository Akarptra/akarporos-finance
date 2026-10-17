import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatRp } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [ar, sales, vatOut, kasBank, invoiceCount, latest] = await Promise.all([
    prisma.journalLine.aggregate({
      where: { account: { alias: "AR" } },
      _sum: { debit: true, credit: true },
    }),
    prisma.journalLine.aggregate({
      where: { account: { alias: "SALES" } },
      _sum: { credit: true, debit: true },
    }),
    prisma.journalLine.aggregate({
      where: { account: { alias: "VAT_OUT" } },
      _sum: { credit: true, debit: true },
    }),
    prisma.journalLine.aggregate({
      where: { account: { alias: { in: ["KAS", "BANK"] } } },
      _sum: { debit: true, credit: true },
    }),
    prisma.invoice.count(),
    prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { partner: true },
    }),
  ]);

  const piutang = (ar._sum.debit ?? 0) - (ar._sum.credit ?? 0);
  const penjualan = (sales._sum.credit ?? 0) - (sales._sum.debit ?? 0);
  const ppn = (vatOut._sum.credit ?? 0) - (vatOut._sum.debit ?? 0);
  const kas = (kasBank._sum.debit ?? 0) - (kasBank._sum.credit ?? 0);

  const stats = [
    { label: "Kas & Bank", value: kas },
    { label: "Piutang Usaha", value: piutang },
    { label: "Penjualan", value: penjualan },
    { label: "PPN Keluaran", value: ppn },
    { label: "Total Faktur", value: invoiceCount, isCount: true },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="card">
            <div className="text-xs font-medium text-slate-500">{s.label}</div>
            <div className="mt-1 text-xl font-semibold">
              {s.isCount ? s.value : formatRp(s.value)}
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Faktur Terbaru</h2>
          <Link href="/sales-invoices/new" className="btn">
            + Faktur Baru
          </Link>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="th">No.</th>
              <th className="th">Tanggal</th>
              <th className="th">Pelanggan</th>
              <th className="th text-right">Total</th>
              <th className="th">Status</th>
            </tr>
          </thead>
          <tbody>
            {latest.length === 0 && (
              <tr>
                <td className="td py-6 text-center text-slate-400" colSpan={5}>
                  Belum ada faktur. Mulai dari Faktur Baru.
                </td>
              </tr>
            )}
            {latest.map((inv) => (
              <tr key={inv.id} className="border-b border-slate-100">
                <td className="td">
                  <Link className="text-brand-600 hover:underline" href={`/sales-invoices/${inv.id}`}>
                    {inv.number}
                  </Link>
                </td>
                <td className="td">{inv.date.toLocaleDateString("id-ID")}</td>
                <td className="td">{inv.partner.name}</td>
                <td className="td text-right">{formatRp(inv.total)}</td>
                <td className="td">
                  <StatusBadge status={inv.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PAID: "bg-emerald-100 text-emerald-700",
    POSTED: "bg-blue-100 text-blue-700",
    PARTIAL: "bg-amber-100 text-amber-700",
    DRAFT: "bg-slate-100 text-slate-600",
    VOID: "bg-red-100 text-red-700",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${map[status] ?? "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}
