import { buildNeraca } from "@/lib/reports";
import { formatRp, toDateInput } from "@/lib/format";
import { PeriodForm } from "../period-form";
import { ambilAsOf, panjang } from "../util";

export const dynamic = "force-dynamic";

export default async function NeracaPage({
  searchParams,
}: {
  searchParams: Promise<{ asOf?: string }>;
}) {
  const sp = await searchParams;
  const asOf = ambilAsOf(sp.asOf);
  const r = await buildNeraca(asOf);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Neraca</h1>
          <p className="text-sm text-slate-500">Per {panjang(asOf)}</p>
        </div>
        <PeriodForm
          action="/reports/neraca"
          single={{ name: "asOf", label: "Tanggal", value: toDateInput(asOf) }}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* ASET */}
        <div className="card">
          <h2 className="mb-3 font-semibold">Aset</h2>
          <table className="w-full">
            <tbody>
              {r.aset.length === 0 && (
                <tr>
                  <td className="td text-slate-400">Tidak ada data.</td>
                </tr>
              )}
              {r.aset.map((x) => (
                <tr key={x.id} className="border-b border-slate-100">
                  <td className="td">
                    <span className="mr-2 text-slate-400">{x.code}</span>
                    {x.name}
                  </td>
                  <td className="td text-right">{formatRp(x.balance)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-slate-300 font-semibold">
                <td className="td">Total Aset</td>
                <td className="td text-right">{formatRp(r.totalAset)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* KEWAJIBAN + MODAL */}
        <div className="card">
          <h2 className="mb-3 font-semibold">Kewajiban</h2>
          <table className="w-full">
            <tbody>
              {r.kewajiban.length === 0 && (
                <tr>
                  <td className="td text-slate-400">Tidak ada data.</td>
                </tr>
              )}
              {r.kewajiban.map((x) => (
                <tr key={x.id} className="border-b border-slate-100">
                  <td className="td">
                    <span className="mr-2 text-slate-400">{x.code}</span>
                    {x.name}
                  </td>
                  <td className="td text-right">{formatRp(x.balance)}</td>
                </tr>
              ))}
              <tr className="border-t border-slate-300 font-medium">
                <td className="td">Total Kewajiban</td>
                <td className="td text-right">{formatRp(r.totalKewajiban)}</td>
              </tr>
            </tbody>
          </table>

          <h2 className="mb-3 mt-6 font-semibold">Modal</h2>
          <table className="w-full">
            <tbody>
              {r.modal.length === 0 && (
                <tr>
                  <td className="td text-slate-400">Tidak ada data.</td>
                </tr>
              )}
              {r.modal.map((x) => (
                <tr key={x.id} className="border-b border-slate-100">
                  <td className="td">
                    <span className="mr-2 text-slate-400">{x.code}</span>
                    {x.name}
                  </td>
                  <td className="td text-right">{formatRp(x.balance)}</td>
                </tr>
              ))}
              <tr className="border-b border-slate-100">
                <td className="td text-slate-600">Laba / Rugi Berjalan</td>
                <td className={`td text-right ${r.laba >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {formatRp(r.laba)}
                </td>
              </tr>
              <tr className="border-t-2 border-slate-300 font-semibold">
                <td className="td">Total Kewajiban + Modal</td>
                <td className="td text-right">{formatRp(r.totalKewajiban + r.totalModal + r.laba)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div
        className={`rounded-lg p-3 text-sm ${
          r.seimbang ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
        }`}
      >
        {r.seimbang
          ? "✓ Seimbang — Aset = Kewajiban + Modal + Laba/Rugi"
          : "⚠ Tidak seimbang! Periksa jurnal yang masuk."}
      </div>
    </div>
  );
}
