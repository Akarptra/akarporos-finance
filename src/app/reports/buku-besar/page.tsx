import { prisma } from "@/lib/db";
import { buildBukuBesar } from "@/lib/reports";
import { formatRp, formatTanggal, toDateInput } from "@/lib/format";
import { PeriodForm } from "../period-form";
import { ambilDari, ambilSampai, panjang } from "../util";

export const dynamic = "force-dynamic";

export default async function BukuBesarPage({
  searchParams,
}: {
  searchParams: Promise<{ accountId?: string; from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const from = ambilDari(sp.from);
  const to = ambilSampai(sp.to);

  const accounts = await prisma.account.findMany({ orderBy: { code: "asc" } });
  const accountId = Number(sp.accountId) || accounts[0]?.id;

  if (!accountId) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Buku Besar</h1>
        <p className="text-sm text-amber-600">Belum ada akun. Buat dulu di menu Akun (COA).</p>
      </div>
    );
  }

  const r = await buildBukuBesar(accountId, from, to);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Buku Besar</h1>
          <p className="text-sm text-slate-500">
            <span className="mr-2 text-slate-400">{r.account.code}</span>
            {r.account.name} · {panjang(from)} — {panjang(to)}
          </p>
        </div>
        <PeriodForm action="/reports/buku-besar" from={toDateInput(from)} to={toDateInput(to)}>
          <div>
            <label className="label">Akun</label>
            <select name="accountId" defaultValue={accountId} className="input w-64">
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.code} — {a.name}
                </option>
              ))}
            </select>
          </div>
        </PeriodForm>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="th">Tanggal</th>
              <th className="th">Ref</th>
              <th className="th">Keterangan</th>
              <th className="th text-right">Debit</th>
              <th className="th text-right">Kredit</th>
              <th className="th text-right">Saldo</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <td className="td" colSpan={5}>
                Saldo Awal
              </td>
              <td className="td text-right font-medium">{formatRp(r.awal)}</td>
            </tr>

            {r.rows.length === 0 && (
              <tr>
                <td colSpan={6} className="td text-slate-400">
                  Tidak ada transaksi pada periode ini.
                </td>
              </tr>
            )}

            {r.rows.map((x) => (
              <tr key={x.id} className="border-b border-slate-100">
                <td className="td whitespace-nowrap">{formatTanggal(x.date)}</td>
                <td className="td text-slate-500">{x.reference ?? "-"}</td>
                <td className="td">{x.memo}</td>
                <td className="td text-right">{x.debit ? formatRp(x.debit) : "-"}</td>
                <td className="td text-right">{x.credit ? formatRp(x.credit) : "-"}</td>
                <td className="td text-right font-medium">{formatRp(x.balance)}</td>
              </tr>
            ))}

            <tr className="border-t-2 border-slate-300 font-semibold">
              <td className="td" colSpan={5}>
                Saldo Akhir
              </td>
              <td className="td text-right">{formatRp(r.akhir)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
