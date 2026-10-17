import { buildPajak } from "@/lib/reports";
import { formatRp, formatTanggal, toDateInput } from "@/lib/format";
import { PeriodForm } from "../period-form";
import { ambilDari, ambilSampai, panjang } from "../util";

export const dynamic = "force-dynamic";

export default async function PajakPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const from = ambilDari(sp.from);
  const to = ambilSampai(sp.to);
  const r = await buildPajak(from, to);

  const masihSetor = r.sisaPajak > 0;
  const lebihBayar = r.sisaPajak < 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Laporan Pajak (PPN)</h1>
          <p className="text-sm text-slate-500">
            {panjang(from)} — {panjang(to)}
          </p>
        </div>
        <PeriodForm action="/reports/pajak" from={toDateInput(from)} to={toDateInput(to)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card">
          <p className="text-xs text-slate-500">PPN Keluaran (dipungut)</p>
          <p className="mt-1 text-2xl font-bold text-blue-700">{formatRp(r.ppnKeluaran)}</p>
          <p className="mt-2 text-xs text-slate-400">Akun: {r.keluaranAkun}</p>
        </div>
        <div className="card">
          <p className="text-xs text-slate-500">PPN Masukan (dibayar)</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{formatRp(r.ppnMasukan)}</p>
          <p className="mt-2 text-xs text-slate-400">Akun: {r.masukanAkun}</p>
        </div>
      </div>

      <div
        className={`flex items-center justify-between rounded-lg p-4 ${
          masihSetor
            ? "bg-red-50 text-red-700"
            : lebihBayar
            ? "bg-blue-50 text-blue-700"
            : "bg-emerald-50 text-emerald-700"
        }`}
      >
        <span className="font-semibold">
          {masihSetor ? "PPN Masih Harus Disetor" : lebihBayar ? "PPN Lebih Bayar (claim)" : "PPN Nihil"}
        </span>
        <span className="text-xl font-bold">{formatRp(Math.abs(r.sisaPajak))}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Rincian title="Rincian PPN Keluaran" rows={r.rincianKeluaran} sign="credit" />
        <Rincian title="Rincian PPN Masukan" rows={r.rincianMasukan} sign="debit" />
      </div>
    </div>
  );
}

function Rincian({
  title,
  rows,
  sign,
}: {
  title: string;
  rows: { id: number; date: Date; reference: string | null; memo: string; debit: number; credit: number }[];
  sign: "debit" | "credit";
}) {
  return (
    <div className="card overflow-x-auto p-0">
      <h2 className="border-b border-slate-200 px-5 py-3 font-semibold">{title}</h2>
      <table className="w-full">
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td className="td py-6 text-center text-slate-400">Tidak ada data.</td>
            </tr>
          )}
          {rows.map((x) => (
            <tr key={x.id} className="border-b border-slate-100">
              <td className="td whitespace-nowrap text-xs text-slate-500">{formatTanggal(x.date)}</td>
              <td className="td">
                {x.memo}
                {x.reference && <span className="ml-2 text-xs text-slate-400">{x.reference}</span>}
              </td>
              <td className="td text-right tabular-nums">
                {formatRp(sign === "debit" ? x.debit : x.credit)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
