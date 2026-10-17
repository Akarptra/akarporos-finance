import { buildPiutang } from "@/lib/reports";
import { formatRp, toDateInput } from "@/lib/format";
import { PeriodForm } from "../period-form";
import { ambilAsOf, panjang } from "../util";
import { AgingTable } from "../aging-table";

export const dynamic = "force-dynamic";

export default async function PiutangPage({
  searchParams,
}: {
  searchParams: Promise<{ asOf?: string }>;
}) {
  const sp = await searchParams;
  const asOf = ambilAsOf(sp.asOf);
  const r = await buildPiutang(asOf);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Laporan Piutang</h1>
          <p className="text-sm text-slate-500">Umur tagihan pelanggan per {panjang(asOf)}</p>
        </div>
        <PeriodForm action="/reports/piutang" single={{ name: "asOf", label: "Tanggal", value: toDateInput(asOf) }} />
      </div>

      <AgingTable r={r} />

      <div className="card">
        <h2 className="mb-3 font-semibold">Ringkasan</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Total Piutang" value={formatRp(r.total)} accent />
          <Stat
            label="Belum Jatuh Tempo"
            value={formatRp(r.totalBelum)}
            sub={`${r.total ? Math.round((r.totalBelum / r.total) * 100) : 0}%`}
          />
          <Stat
            label="Sudah Lewat Jatuh Tempo"
            value={formatRp(r.totalH1 + r.totalH2 + r.totalH3 + r.totalH4)}
            danger={r.totalH3 + r.totalH4 > 0}
            sub={`${r.total ? Math.round(((r.total - r.totalBelum) / r.total) * 100) : 0}%`}
          />
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  accent,
  danger,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-1 text-lg font-bold ${accent ? "text-brand-700" : danger ? "text-red-600" : "text-slate-900"}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
    </div>
  );
}
