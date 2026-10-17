import Link from "next/link";

export const dynamic = "force-dynamic";

const REPORTS = [
  {
    href: "/reports/neraca",
    title: "Neraca",
    desc: "Posisi keuangan pada tanggal tertentu: aset, kewajiban, dan modal.",
  },
  {
    href: "/reports/laba-rugi",
    title: "Laba / Rugi",
    desc: "Pendapatan dikurangi beban (termasuk HPP) selama periode.",
  },
  {
    href: "/reports/arus-kas",
    title: "Arus Kas",
    desc: "Pergerakan kas: operasi, investasi, dan pendanaan.",
  },
  {
    href: "/reports/piutang",
    title: "Piutang",
    desc: "Umur tagihan pelanggan: belum jatuh tempo sampai >90 hari.",
  },
  {
    href: "/reports/utang",
    title: "Utang",
    desc: "Umur tagihan ke pemasok per kategori tunggakan.",
  },
  {
    href: "/reports/pajak",
    title: "Pajak (PPN)",
    desc: "PPN keluaran vs masukan dan sisa yang harus disetor.",
  },
  {
    href: "/reports/buku-besar",
    title: "Buku Besar",
    desc: "Riwayat transaksi dan saldo berjalan per akun.",
  },
];

export default function ReportsIndex() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Laporan Keuangan</h1>
        <p className="text-sm text-slate-500">Semua laporan dihitung otomatis dari jurnal (double-entry).</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {REPORTS.map((r) => (
          <Link key={r.href} href={r.href} className="card block hover:border-brand-400 hover:shadow-md">
            <h2 className="font-semibold text-brand-700">{r.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{r.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
