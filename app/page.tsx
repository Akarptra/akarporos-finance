"use client";

import { useEffect, useState } from "react";

type Company = { id: number; name: string; ppn_rate: number };
type Account = { id: number; code: string; name: string; type: string; normal_balance: string };
type BalRow = { id: number; code: string; name: string; type: string; balance: number; parent_id: number | null };
type Sections = {
  assets: number; liabilities: number; equity: number; revenue: number;
  expenses: number; netProfit: number; balanceCheck: number;
};

export default function Home() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [rows, setRows] = useState<BalRow[]>([]);
  const [sections, setSections] = useState<Sections | null>(null);
  const [tab, setTab] = useState<"neraca" | "labarugi" | "jurnal">("neraca");
  const [desc, setDesc] = useState("");
  const [from, setFrom] = useState("2024-01-01");
  const [to, setTo] = useState("2024-12-31");
  const [lines, setLines] = useState([{ account_id: "", debit: "", credit: "" }]);

  const loadCompanies = () =>
    fetch("/api/companies").then((r) => r.json()).then((d) => setCompanies(d.companies));

  useEffect(() => { loadCompanies(); }, []);

  const selectCompany = async (id: number) => {
    setCompanyId(id);
    const d = await fetch(`/api/ledger?company_id=${id}`).then((r) => r.json());
    setAccounts(d.accounts);
    refreshReport(id, "2024-01-01", "2024-12-31");
  };

  const refreshReport = async (id: number, f: string, t: string) => {
    const d = await fetch(`/api/ledger?company_id=${id}&report=1&from=${f}&to=${t}`).then((r) => r.json());
    setRows(d.rows);
    setSections(d.sections);
  };

  const createCompany = async () => {
    const name = prompt("Nama perusahaan:");
    if (!name) return;
    await fetch("/api/companies", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    loadCompanies();
  };

  const addLine = () => setLines([...lines, { account_id: "", debit: "", credit: "" }]);
  const updateLine = (i: number, patch: { account_id?: string; debit?: string; credit?: string }) =>
    setLines(lines.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

  const postJournal = async () => {
    if (!companyId) return;
    const payload = {
      company_id: companyId, type: "journal", entry_date: to, description: desc,
      lines: lines.map((l) => ({ account_id: Number(l.account_id), debit: parseFloat(l.debit || "0"), credit: parseFloat(l.credit || "0") })),
    };
    const res = await fetch("/api/ledger", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const d = await res.json();
    if (d.error) alert(d.error);
    else {
      alert(`Jurnal berhasil: ${d.journal.entry_number}`);
      refreshReport(companyId, from, to);
      setLines([{ account_id: "", debit: "", credit: "" }]);
      setDesc("");
    }
  };

  const byType = (t: string) => rows.filter((r) => r.type === t);
  const isParent = (r: BalRow) => rows.some((x) => x.parent_id === r.id);

  return (
    <div className="min-h-screen bg-[#eef2f7] text-slate-800">
      <header className="bg-[#0b6b4f] text-white px-6 py-3 flex items-center justify-between sticky top-0 z-20 shadow">
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-lg tracking-tight">AKARPOROS</span>
          <span className="text-xs text-emerald-100">Finance Suite</span>
        </div>
        <div className="flex items-center gap-3">
          <select className="text-sm border border-white/20 bg-white/10 text-white rounded px-2 py-1" value={companyId ?? ""} onChange={(e) => selectCompany(Number(e.target.value))}>
            <option value="" className="text-slate-800">Pilih Perusahaan</option>
            {companies.map((c) => <option key={c.id} value={c.id} className="text-slate-800">{c.name}</option>)}
          </select>
          <button onClick={createCompany} className="text-sm bg-white text-[#0b6b4f] font-semibold px-3 py-1.5 rounded">+ Database</button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:block w-56 bg-white border-r border-slate-200 min-h-[calc(100vh-52px)] p-4">
          <button onClick={() => setTab("neraca")} className={`w-full text-left px-3 py-2 rounded text-sm mb-1 ${tab === "neraca" ? "bg-[#0b6b4f] text-white" : "text-slate-600 hover:bg-slate-100"}`}>📊 Neraca</button>
          <button onClick={() => setTab("labarugi")} className={`w-full text-left px-3 py-2 rounded text-sm mb-1 ${tab === "labarugi" ? "bg-[#0b6b4f] text-white" : "text-slate-600 hover:bg-slate-100"}`}>📈 Laba Rugi</button>
          <button onClick={() => setTab("jurnal")} className={`w-full text-left px-3 py-2 rounded text-sm mb-1 ${tab === "jurnal" ? "bg-[#0b6b4f] text-white" : "text-slate-600 hover:bg-slate-100"}`}>📒 Jurnal</button>
          <div className="mt-3 pt-3 border-t border-slate-200">
            <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide px-3 mb-1">Perkiraan (COA)</div>
            {rows.map((r) => (
              <div key={r.id} className="px-3 py-0.5 text-[11px] truncate text-slate-500 flex justify-between">
                <span>{r.code}</span><span>{r.name.split(" ")[0]}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 space-y-6 max-w-[calc(100%-14rem)]">
          {/* Period controls */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 flex flex-wrap items-end gap-3">
            <div><label className="block text-xs text-slate-500 mb-1">Dari</label><input type="date" className="border rounded px-2 py-1 text-sm" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
            <div><label className="block text-xs text-slate-500 mb-1">Sampai</label><input type="date" className="border rounded px-2 py-1 text-sm" value={to} onChange={(e) => setTo(e.target.value)} /></div>
            <button className="bg-[#0b6b4f] text-white px-4 py-1.5 rounded text-sm" onClick={() => refreshReport(companyId!, from, to)}>Terapkan</button>
          </div>

          {!companyId ? (
            <div className="text-center py-24 text-slate-400 bg-white rounded-lg border border-slate-200">
              <p className="text-2xl mb-2">Selamat datang 🎉</p>
              <p className="text-sm">Buat database perusahaan untuk mulai posting jurnal & lihat laporan keuangan.</p>
            </div>
          ) : (
            <>
              {sections && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Kpi label="Total Aset" value={money(sections.assets)} color="text-[#0b6b4f]" />
                  <Kpi label="Liabilitas" value={money(sections.liabilities)} />
                  <Kpi label="Ekuitas" value={money(sections.equity)} />
                  <Kpi label="Laba Bersih" value={money(sections.netProfit)} color="text-[#b06500]" />
                </div>
              )}

              {/* Neraca */}
              {tab === "neraca" && sections && (
                <ReportTable
                  title="Neraca"
                  subtitle={`Per ${to}`}
                  groups={[
                    { label: "ASET", rows: byType("asset") },
                    { label: "LIABILITAS", rows: byType("liability") },
                    { label: "EKUITAS", rows: byType("equity") },
                  ]}
                  money={money} isParent={isParent}
                  totalExtra={sections.balanceCheck}
                />
              )}

              {/* Laba Rugi */}
              {tab === "labarugi" && sections && (
                <ReportTable
                  title="Laba Rugi"
                  subtitle={`${from} s/d ${to}`}
                  groups={[
                    { label: "PENDAPATAN", rows: byType("revenue") },
                    { label: "BEBAN", rows: byType("expense") },
                  ]}
                  money={money} isParent={isParent}
                  netProfit={sections.netProfit}
                />
              )}

              {/* Jurnal entry */}
              {tab === "jurnal" && (
                <div className="bg-white rounded-lg border border-slate-200 p-5">
                  <h3 className="font-semibold text-sm mb-4">Entri Jurnal Baru</h3>
                  <input className="w-full border rounded px-2 py-1.5 text-sm mb-3" placeholder="Keterangan transaksi" value={desc} onChange={(e) => setDesc(e.target.value)} />
                  <div className="grid grid-cols-[2fr_1fr_1fr] gap-2 mb-2 text-xs font-semibold text-slate-500 px-1">
                    <span>Akun</span><span className="text-right">Debit</span><span className="text-right">Kredit</span>
                  </div>
                  {lines.map((l, i) => (
                    <div key={i} className="grid grid-cols-[2fr_1fr_1fr] gap-2 mb-1.5">
                      <select className="border rounded px-1 py-1.5 text-sm" value={l.account_id} onChange={(e) => updateLine(i, { account_id: e.target.value })}>
                        <option value={""}>— Pilih Akun —</option>
                        {accounts.map((a) => <option key={a.id} value={a.id}>{a.code} · {a.name}</option>)}
                      </select>
                      <input className="border rounded px-2 py-1.5 text-sm text-right" placeholder="0" value={l.debit} onChange={(e) => updateLine(i, { debit: e.target.value })} />
                      <input className="border rounded px-2 py-1.5 text-sm text-right" placeholder="0" value={l.credit} onChange={(e) => updateLine(i, { credit: e.target.value })} />
                    </div>
                  ))}
                  <div className="flex gap-2 mt-3">
                    <button onClick={addLine} className="text-sm border border-slate-300 px-3 py-1.5 rounded">+ Baris</button>
                    <button onClick={postJournal} className="text-sm bg-[#0b6b4f] text-white px-4 py-1.5 rounded font-semibold">Simpan Jurnal</button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function Kpi({ label, value, color = "text-slate-800" }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className={`text-lg font-bold ${color}`}>{value}</div>
    </div>
  );
}

function ReportTable({
  title, subtitle, groups, money, isParent, netProfit, totalExtra,
}: {
  title: string; subtitle: string;
  groups: { label: string; rows: BalRow[] }[];
  money: (n: number) => string; isParent: (r: BalRow) => boolean;
  netProfit?: number; totalExtra?: number;
}) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="text-center mb-6">
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
        <p className="text-sm text-slate-500">{subtitle}</p>
        <button onClick={() => window.print()} className="text-xs mt-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-3 py-1 rounded">🖨 Cetak / PDF</button>
      </div>

      <div className="space-y-6">
        {groups.filter((g) => g.rows.length > 0).map((g) => {
          const total = g.rows.reduce((s, r) => s + r.balance, 0);
          return (
            <div key={g.label}>
              <div className="font-semibold text-[#0b6b4f] text-sm border-b-2 border-[#0b6b4f] pb-1 mb-2">{g.label}</div>
              <table className="w-full text-sm">
                <tbody>
                  {g.rows.map((r) => (
                    <tr key={r.id} className={isParent(r) ? "font-semibold bg-slate-50" : ""}>
                      <td className="py-1 pl-3 text-slate-600">{r.code} — {r.name}</td>
                      <td className="py-1 text-right">{money(r.balance)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold border-t border-slate-300">
                    <td className="py-1.5 pl-3 text-slate-800">Total {g.label}</td>
                    <td className="py-1.5 text-right">{money(total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        })}

        {netProfit !== undefined && (
          <div className="border-t-2 border-slate-300 pt-3 flex justify-between font-bold text-base">
            <span>Laba (Rugi) Bersih</span>
            <span className={netProfit >= 0 ? "text-[#0b6b4f]" : "text-red-600"}>{money(netProfit)}</span>
          </div>
        )}

        {totalExtra !== undefined && (
          <div className="pt-2 text-xs">
            {Math.abs(totalExtra) < 0.01
              ? <span className="text-[#0b6b4f] font-semibold">✓ Laporan balance (Aset = Liabilitas + Ekuitas)</span>
              : <span className="text-red-600">⚠ Selisih: {money(totalExtra)}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

const money = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID", { minimumFractionDigits: 2 });
