import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { stockCard } from "@/lib/inventory";
import { formatRp, formatNumber, formatTanggal } from "@/lib/format";

export const dynamic = "force-dynamic";

const REF_LABEL: Record<string, string> = {
  PURCHASE_INVOICE: "Faktur Beli",
  SALES_INVOICE: "Faktur Jual",
};

export default async function StockCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const itemId = Number(id);
  if (isNaN(itemId)) notFound();

  const [item, rows] = await Promise.all([
    prisma.item.findUnique({ where: { id: itemId } }),
    stockCard(prisma, itemId),
  ]);
  if (!item) notFound();

  const last = rows[rows.length - 1];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kartu Stok</h1>
          <p className="text-sm text-slate-500">
            <span className="mr-2 font-mono text-slate-400">{item.code}</span>
            {item.name} · satuan {item.unit}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Saldo Akhir</p>
          <p className="text-xl font-bold text-brand-700">
            {formatNumber(last?.runningQty ?? 0)} {item.unit}
          </p>
          <p className="text-sm text-slate-500">{formatRp(last?.runningValue ?? 0)}</p>
        </div>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="th">Tanggal</th>
              <th className="th">Ref</th>
              <th className="th">Keterangan</th>
              <th className="th text-right">Masuk</th>
              <th className="th text-right">Keluar</th>
              <th className="th text-right">HPP/unit</th>
              <th className="th text-right">Saldo Qty</th>
              <th className="th text-right">Saldo Nilai</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td className="td py-8 text-center text-slate-400" colSpan={8}>
                  Belum ada mutasi stok untuk barang ini.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-slate-100">
                <td className="td whitespace-nowrap">{formatTanggal(r.date)}</td>
                <td className="td text-xs text-slate-500">{REF_LABEL[r.refType] ?? r.refType}</td>
                <td className="td">{r.memo ?? "-"}</td>
                <td className="td text-right text-emerald-600 tabular-nums">
                  {r.type === "IN" ? formatNumber(r.qty) : "-"}
                </td>
                <td className="td text-right text-red-600 tabular-nums">
                  {r.type === "OUT" ? formatNumber(r.qty) : "-"}
                </td>
                <td className="td text-right tabular-nums">{formatRp(r.unitCost)}</td>
                <td className="td text-right font-medium tabular-nums">
                  {formatNumber(r.runningQty)}
                </td>
                <td className="td text-right tabular-nums">{formatRp(r.runningValue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Link href="/stock" className="btn-ghost inline-flex">
        ← Kembali ke Persediaan
      </Link>
    </div>
  );
}
