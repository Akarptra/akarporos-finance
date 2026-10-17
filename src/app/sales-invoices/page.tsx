import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatRp, formatTanggal } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function SalesInvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    where: { type: "SALES" },
    orderBy: { date: "desc" },
    include: { partner: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Faktur Penjualan</h1>
        <Link href="/sales-invoices/new" className="btn">
          + Faktur Baru
        </Link>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="th">No.</th>
              <th className="th">Tanggal</th>
              <th className="th">Jatuh Tempo</th>
              <th className="th">Pelanggan</th>
              <th className="th text-right">Total</th>
              <th className="th text-right">Dibayar</th>
              <th className="th">Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 && (
              <tr>
                <td className="td py-8 text-center text-slate-400" colSpan={7}>
                  Belum ada faktur.
                </td>
              </tr>
            )}
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="td">
                  <Link className="text-brand-600 hover:underline" href={`/sales-invoices/${inv.id}`}>
                    {inv.number}
                  </Link>
                </td>
                <td className="td">{formatTanggal(inv.date)}</td>
                <td className="td">{formatTanggal(inv.dueDate)}</td>
                <td className="td">{inv.partner.name}</td>
                <td className="td text-right">{formatRp(inv.total)}</td>
                <td className="td text-right">{formatRp(inv.paid)}</td>
                <td className="td">{inv.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
