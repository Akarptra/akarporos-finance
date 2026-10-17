import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyLedger — Akuntansi",
  description: "Sistem akuntansi double-entry (inspirasi Accurate Online)",
};

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/sales-invoices", label: "Faktur Jual" },
  { href: "/purchase-invoices", label: "Faktur Beli" },
  { href: "/journal", label: "Jurnal" },
  { href: "/reports", label: "Laporan" },
  { href: "/stock", label: "Persediaan" },
  { href: "/cash", label: "Kas & Bank" },
  { href: "/accounts", label: "Akun" },
  { href: "/partners", label: "Mitra" },
  { href: "/items", label: "Barang" },
  { href: "/taxes", label: "Pajak" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <div className="min-h-screen">
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
              <span className="text-lg font-bold text-brand-700">MyLedger</span>
              <nav className="flex flex-wrap gap-1">
                {NAV.map((n) => (
                  <Link
                    key={n.href}
                    href={n.href}
                    className="rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  >
                    {n.label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
