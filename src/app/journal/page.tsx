import { prisma } from "@/lib/db";
import { formatRp, formatTanggal } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function JournalPage() {
  const entries = await prisma.journalEntry.findMany({
    orderBy: [{ date: "desc" }, { id: "desc" }],
    take: 100,
    include: { lines: { include: { account: true } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Buku Besar (Jurnal Umum)</h1>
      <p className="text-sm text-slate-500">100 transaksi terakhir. Setiap entri seimbang debit = kredit.</p>

      <div className="space-y-4">
        {entries.length === 0 && (
          <div className="card text-center text-slate-400">Belum ada transaksi.</div>
        )}
        {entries.map((e) => {
          const total = e.lines.reduce((s, l) => s + l.debit, 0);
          return (
            <div key={e.id} className="card">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <span className="font-semibold">{e.memo}</span>
                  <span className="ml-2 text-xs text-slate-400">
                    {e.reference ? `#${e.reference} · ` : ""}
                    {e.sourceType}
                  </span>
                </div>
                <span className="text-sm text-slate-500">{formatTanggal(e.date)}</span>
              </div>
              <table className="w-full">
                <tbody>
                  {e.lines.map((l) => (
                    <tr key={l.id} className="border-b border-slate-100 last:border-0">
                      <td className="td w-1/2">
                        <span className={l.debit ? "font-medium" : "pl-6 text-slate-600"}>
                          {l.account.code} · {l.account.name}
                        </span>
                      </td>
                      <td className="td w-1/4 text-right tabular-nums">
                        {l.debit ? formatRp(l.debit) : ""}
                      </td>
                      <td className="td w-1/4 text-right tabular-nums">
                        {l.credit ? formatRp(l.credit) : ""}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-semibold">
                    <td className="td">Total</td>
                    <td className="td text-right tabular-nums">{formatRp(total)}</td>
                    <td className="td text-right tabular-nums">{formatRp(total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
}
