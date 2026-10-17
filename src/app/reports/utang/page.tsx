import { buildUtang } from "@/lib/reports";
import { formatRp, toDateInput } from "@/lib/format";
import { PeriodForm } from "../period-form";
import { ambilAsOf, panjang } from "../util";
import { AgingTable } from "../aging-table";

export const dynamic = "force-dynamic";

export default async function UtangPage({
  searchParams,
}: {
  searchParams: Promise<{ asOf?: string }>;
}) {
  const sp = await searchParams;
  const asOf = ambilAsOf(sp.asOf);
  const r = await buildUtang(asOf);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Laporan Utang</h1>
          <p className="text-sm text-slate-500">Umur tagihan ke pemasok per {panjang(asOf)}</p>
        </div>
        <PeriodForm action="/reports/utang" single={{ name: "asOf", label: "Tanggal", value: toDateInput(asOf) }} />
      </div>

      <AgingTable r={r} />

      <div className="card">
        <h2 className="mb-3 font-semibold">Ringkasan</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs text-slate-500">Total Utang</p>
            <p className="mt-1 text-lg font-bold text-brand-700">{formatRp(r.total)}</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs text-slate-500">Belum Jatuh Tempo</p>
            <p className="mt-1 text-lg font-bold">{formatRp(r.totalBelum)}</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs text-slate-500">Sudah Lewat Jatuh Tempo</p>
            <p
              className={`mt-1 text-lg font-bold ${
                r.totalH3 + r.totalH4 > 0 ? "text-red-600" : "text-slate-900"
              }`}
            >
              {formatRp(r.totalH1 + r.totalH2 + r.totalH3 + r.totalH4)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
