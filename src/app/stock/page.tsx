import Link from "next/link";
import { prisma } from "@/lib/db";
import { stockSummary } from "@/lib/inventory";
import { formatRp, formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function StockPage() {
  const rows = await stockSummary(prisma);

  const totalValue = rows.reduce((s, r) => s + r.value, 0);
  const totalQty = rows.reduce((s, r) => s + r.qty, 0);
  const minus = rows.filter((r) => r.qty < 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Persediaan</h1>
          <p className="text-sm text-slate-500">
            Harga pokok memakai rata-rata bergerak. Barang keluar otomatis memicu HPP.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Nilai Persediaan</p>
          <p className="text-xl font-bold text-brand-700">{formatRp(totalValue)}</p>
        </div>
      </div>

      {minus.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {minus.length} barang stoknya minus (terjual melebihi pembelian tercatat). Periksa faktur
          beli yang belum dicatat.
        </div>
      )}

      <div className="card overflow-x-auto p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="th">Kode</th>
              <th className="th">Nama</th>
              <th className="th">Tipe</th>
              <th className="th text-right">Stok</th>
              <th className="th text-right">HPP Rata-rata</th>
              <th className="th text-right">Nilai</th>
              <th className="th" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td className="td py-8 text-center text-slate-400" colSpan={7}>
                  Belum ada barang. Tambah di menu Barang.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.itemId} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="td font-mono">{r.code}</td>
                <td className="td font-medium">{r.name}</td>
                <td className="td text-xs text-slate-500">
                  {r.type === "PRODUCT" ? "Barang" : "Jasa"}
                </td>
                <td className={`td text-right tabular-nums ${r.qty < 0 ? "text-red-600" : ""}`}>
                  {formatNumber(r.qty)} {r.unit}
                </td>
                <td className="td text-right tabular-nums">{formatRp(r.avg)}</td>
                <td className="td text-right font-medium tabular-nums">{formatRp(r.value)}</td>
                <td className="td text-right">
                  <Link className="text-sm text-brand-600 hover:underline" href={`/stock/${r.itemId}`}>
                    Kartu Stok
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-300 font-semibold">
              <td className="td" colSpan={5}>
                Total ({formatNumber(totalQty)} unit)
              </td>
              <td className="td text-right">{formatRp(totalValue)}</td>
              <td className="td" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
