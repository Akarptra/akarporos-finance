import type { AgingReport } from "@/lib/reports";
import { formatRp, formatTanggal } from "@/lib/format";

const BUCKETS = [
  { key: "belumJatuhTempo" as const, label: "Belum Jatuh Tempo", cls: "text-slate-600" },
  { key: "h1" as const, label: "1–30 hari", cls: "text-amber-600" },
  { key: "h2" as const, label: "31–60 hari", cls: "text-orange-600" },
  { key: "h3" as const, label: "61–90 hari", cls: "text-red-500" },
  { key: "h4" as const, label: "> 90 hari", cls: "text-red-700" },
];

export function AgingTable({ r }: { r: AgingReport }) {
  return (
    <div className="card overflow-x-auto p-0">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="th">Mitra</th>
            {BUCKETS.map((b) => (
              <th key={b.key} className="th text-right">
                {b.label}
              </th>
            ))}
            <th className="th text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {r.rows.length === 0 && (
            <tr>
              <td className="td py-8 text-center text-slate-400" colSpan={7}>
                Tidak ada tagihan belum lunas pada tanggal tersebut.
              </td>
            </tr>
          )}
          {r.rows.map((row) => (
            <tr key={row.partnerId} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="td">
                <span className="font-medium">{row.name}</span>
                {row.oldestDue && (
                  <span className="ml-2 text-xs text-slate-400">
                    tertua {formatTanggal(row.oldestDue)}
                  </span>
                )}
              </td>
              {BUCKETS.map((b) => (
                <td key={b.key} className={`td text-right tabular-nums ${row[b.key] > 0 ? b.cls : "text-slate-300"}`}>
                  {row[b.key] > 0 ? formatRp(row[b.key]) : "—"}
                </td>
              ))}
              <td className="td text-right font-semibold tabular-nums">{formatRp(row.total)}</td>
            </tr>
          ))}
        </tbody>
        {r.rows.length > 0 && (
          <tfoot>
            <tr className="border-t-2 border-slate-300 font-semibold">
              <td className="td">Total</td>
              <td className="td text-right tabular-nums">{formatRp(r.totalBelum)}</td>
              <td className="td text-right tabular-nums">{formatRp(r.totalH1)}</td>
              <td className="td text-right tabular-nums">{formatRp(r.totalH2)}</td>
              <td className="td text-right tabular-nums">{formatRp(r.totalH3)}</td>
              <td className="td text-right tabular-nums">{formatRp(r.totalH4)}</td>
              <td className="td text-right tabular-nums">{formatRp(r.total)}</td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
