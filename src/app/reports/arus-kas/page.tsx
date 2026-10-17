import { buildArusKas, Kategori } from "@/lib/reports";
import { formatRp, toDateInput } from "@/lib/format";
import { PeriodForm } from "../period-form";
import { ambilDari, ambilSampai, panjang } from "../util";

export const dynamic = "force-dynamic";

const LABEL: Record<Kategori, string> = {
  OPERASI: "Operasi",
  INVESTASI: "Investasi",
  PENDANAAN: "Pendanaan",
};

export default async function ArusKasPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const from = ambilDari(sp.from);
  const to = ambilSampai(sp.to);
  const r = await buildArusKas(from, to);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Arus Kas</h1>
          <p className="text-sm text-slate-500">
            {panjang(from)} — {panjang(to)}
          </p>
        </div>
        <PeriodForm action="/reports/arus-kas" from={toDateInput(from)} to={toDateInput(to)} />
      </div>

      {/* Per kategori */}
      <div className="card">
        <h2 className="mb-3 font-semibold">Arus Kas per Kategori</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="th">Kategori</th>
              <th className="th text-right">Masuk</th>
              <th className="th text-right">Keluar</th>
              <th className="th text-right">Net</th>
            </tr>
          </thead>
          <tbody>
            {([ "OPERASI", "INVESTASI", "PENDANAAN" ] as Kategori[]).map((k) => {
              const b = r.perKategori[k];
              return (
                <tr key={k} className="border-b border-slate-100">
                  <td className="td font-medium">{LABEL[k]}</td>
                  <td className="td text-right text-emerald-600">{formatRp(b.masuk)}</td>
                  <td className="td text-right text-red-600">{formatRp(b.keluar)}</td>
                  <td className={`td text-right ${b.net >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {formatRp(b.net)}
                  </td>
                </tr>
              );
            })}
            <tr className="border-t-2 border-slate-300 font-semibold">
              <td className="td">Perubahan Kas</td>
              <td className="td" />
              <td className="td" />
              <td className={`td text-right ${r.perubahan >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {formatRp(r.perubahan)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Ringkasan kas */}
      <div className="card">
        <h2 className="mb-3 font-semibold">Ringkasan Kas &amp; Bank</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-600">Kas Awal</span>
            <span className="font-medium">{formatRp(r.kasAwal)}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-600">+ Total Masuk</span>
            <span className="font-medium text-emerald-600">{formatRp(r.totalMasuk)}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-600">− Total Keluar</span>
            <span className="font-medium text-red-600">{formatRp(r.totalKeluar)}</span>
          </div>
          <div className="flex justify-between border-t-2 border-slate-300 pt-2 font-semibold">
            <span>Kas Akhir</span>
            <span>{formatRp(r.kasAkhir)}</span>
          </div>
        </div>
      </div>

      {/* Per akun kas/bank */}
      <div className="card overflow-x-auto p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="th">Akun</th>
              <th className="th text-right">Saldo Awal</th>
              <th className="th text-right">Masuk</th>
              <th className="th text-right">Keluar</th>
              <th className="th text-right">Saldo Akhir</th>
            </tr>
          </thead>
          <tbody>
            {r.perAkun.length === 0 && (
              <tr>
                <td colSpan={5} className="td text-slate-400">
                  Belum ada akun kas/bank. Set dulu di menu Akun (centang isCash).
                </td>
              </tr>
            )}
            {r.perAkun.map((a) => (
              <tr key={a.id} className="border-b border-slate-100">
                <td className="td">
                  <span className="mr-2 text-slate-400">{a.code}</span>
                  {a.name}
                </td>
                <td className="td text-right">{formatRp(a.awal)}</td>
                <td className="td text-right text-emerald-600">{formatRp(a.masuk)}</td>
                <td className="td text-right text-red-600">{formatRp(a.keluar)}</td>
                <td className="td text-right font-medium">{formatRp(a.akhir)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-400">
        Metode langsung sederhana: tiap transaksi yang menyentuh akun kas/bank diklasifikasikan ke
        kategori berdasarkan akun lawannya (pendapatan/beban = operasi, aset tetap = investasi,
        ekuitas/utang bank = pendanaan). Transfer antar kas tidak mengubah total kas.
      </p>
    </div>
  );
}
