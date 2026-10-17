import { buildLabaRugi } from "@/lib/reports";
import { formatRp, toDateInput } from "@/lib/format";
import { PeriodForm } from "../period-form";
import { ambilDari, ambilSampai, panjang } from "../util";

export const dynamic = "force-dynamic";

export default async function LabaRugiPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const from = ambilDari(sp.from);
  const to = ambilSampai(sp.to);
  const r = await buildLabaRugi(from, to);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Laba / Rugi</h1>
          <p className="text-sm text-slate-500">
            {panjang(from)} — {panjang(to)}
          </p>
        </div>
        <PeriodForm action="/reports/laba-rugi" from={toDateInput(from)} to={toDateInput(to)} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* PENDAPATAN */}
        <div className="card">
          <h2 className="mb-3 font-semibold">Pendapatan</h2>
          <table className="w-full">
            <tbody>
              {r.pendapatan.length === 0 && (
                <tr>
                  <td className="td text-slate-400">Tidak ada data.</td>
                </tr>
              )}
              {r.pendapatan.map((x) => (
                <tr key={x.id} className="border-b border-slate-100">
                  <td className="td">
                    <span className="mr-2 text-slate-400">{x.code}</span>
                    {x.name}
                  </td>
                  <td className="td text-right">{formatRp(x.balance)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-slate-300 font-semibold">
                <td className="td">Total Pendapatan</td>
                <td className="td text-right">{formatRp(r.totalPendapatan)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* BEBAN */}
        <div className="card">
          <h2 className="mb-3 font-semibold">Beban</h2>
          <table className="w-full">
            <tbody>
              {r.beban.length === 0 && (
                <tr>
                  <td className="td text-slate-400">Tidak ada data.</td>
                </tr>
              )}
              {r.beban.map((x) => (
                <tr key={x.id} className="border-b border-slate-100">
                  <td className="td">
                    <span className="mr-2 text-slate-400">{x.code}</span>
                    {x.name}
                  </td>
                  <td className="td text-right">{formatRp(x.balance)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-slate-300 font-semibold">
                <td className="td">Total Beban</td>
                <td className="td text-right">{formatRp(r.totalBeban)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div
        className={`flex items-center justify-between rounded-lg p-4 ${
          r.labaBersih >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
        }`}
      >
        <span className="font-semibold">{r.labaBersih >= 0 ? "Laba Bersih" : "Rugi Bersih"}</span>
        <span className="text-xl font-bold">{formatRp(r.labaBersih)}</span>
      </div>
    </div>
  );
}
