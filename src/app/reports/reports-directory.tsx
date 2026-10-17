"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  TbFileDescription,
  TbSearch,
  TbFilter,
  TbBuildingBank,
  TbReceipt2,
  TbTruckDelivery,
  TbPackage,
  TbReceiptTax,
  TbCoins,
  TbBook2,
} from "react-icons/tb";

interface ReportItem {
  id: string;
  category: string;
  href: string;
  title: string;
  desc: string;
  tags: string[];
}

const ALL_REPORTS: ReportItem[] = [
  // KEUANGAN
  {
    id: "neraca",
    category: "Keuangan",
    href: "/reports/neraca",
    title: "Neraca (Balance Sheet)",
    desc: "Posisi keuangan pada tanggal tertentu: total aset lancar & tetap, liabilitas jangka pendek, dan ekuitas.",
    tags: ["aset", "liabilitas", "ekuitas", "modal", "balance"],
  },
  {
    id: "laba-rugi",
    category: "Keuangan",
    href: "/reports/laba-rugi",
    title: "Laba / Rugi (Income Statement)",
    desc: "Perhitungan pendapatan usaha, beban pokok penjualan (HPP), dan total beban operasional.",
    tags: ["pendapatan", "beban", "profit", "penjualan", "hpp"],
  },
  {
    id: "arus-kas",
    category: "Keuangan",
    href: "/reports/arus-kas",
    title: "Laporan Arus Kas (Cash Flow)",
    desc: "Arus kas masuk dan keluar dari aktivitas operasional, investasi, dan pendanaan modal.",
    tags: ["kas", "bank", "operating", "arus kas"],
  },
  // BUKU BESAR
  {
    id: "buku-besar",
    category: "Buku Besar",
    href: "/reports/buku-besar",
    title: "Histori Buku Besar (General Ledger)",
    desc: "Rincian seluruh mutasi debit, kredit, dan saldo berjalan per masing-masing akun perkiraan.",
    tags: ["jurnal", "mutasi", "debit", "kredit", "ledger"],
  },
  {
    id: "jurnal",
    category: "Buku Besar",
    href: "/journal",
    title: "Daftar Jurnal Umum",
    desc: "Daftar seluruh entri transaksi jurnal yang terposting dari penjualan, pembelian, dan manual.",
    tags: ["jurnal", "transaksi", "posting"],
  },
  // KAS & BANK
  {
    id: "kas-bank",
    category: "Kas & Bank",
    href: "/cash",
    title: "Mutasi Kas & Rekonsiliasi Bank",
    desc: "Catatan transaksi penerimaan kas, pengeluaran kas operasional, dan transfer saldo antar rekening.",
    tags: ["kas", "bca", "mandiri", "transfer"],
  },
  // PIUTANG
  {
    id: "piutang",
    category: "Piutang",
    href: "/reports/piutang",
    title: "Penuaan Piutang (Aging Piutang Usaha)",
    desc: "Klasifikasi umur tagihan piutang pelanggan: belum jatuh tempo, 1-30 hari, 31-60 hari, sampai >90 hari.",
    tags: ["piutang", "pelanggan", "customer", "aging", "ar"],
  },
  // UTANG
  {
    id: "utang",
    category: "Utang",
    href: "/reports/utang",
    title: "Penuaan Utang (Aging Utang Usaha)",
    desc: "Analisis jatuh tempo kewajiban utang ke pemasok berdasarkan faktur pembelian yang belum terbayar.",
    tags: ["utang", "pemasok", "vendor", "aging", "ap"],
  },
  // PAJAK
  {
    id: "pajak",
    category: "Pajak",
    href: "/reports/pajak",
    title: "Rekapitulasi Pajak PPN (SPT Masa)",
    desc: "Komparasi PPN Keluaran atas faktur jual dan PPN Masukan atas faktur beli serta status kurang/lebih bayar.",
    tags: ["ppn", "pajak", "faktur", "spt", "pph"],
  },
  // PERSEDIAAN
  {
    id: "stok",
    category: "Persediaan",
    href: "/stock",
    title: "Kartu Stok Barang Perpetual",
    desc: "Mutasi masuk/keluar kuantitas barang, penentuan HPP rata-rata bergerak (moving average), dan nilai saldo.",
    tags: ["stok", "inventory", "hpp", "gudang", "barang"],
  },
];

const CATEGORIES = [
  { id: "all", label: "Semua Kategori", icon: TbFilter },
  { id: "Keuangan", label: "Keuangan", icon: TbBuildingBank },
  { id: "Buku Besar", label: "Buku Besar", icon: TbBook2 },
  { id: "Kas & Bank", label: "Kas & Bank", icon: TbCoins },
  { id: "Piutang", label: "Piutang", icon: TbReceipt2 },
  { id: "Utang", label: "Utang", icon: TbTruckDelivery },
  { id: "Pajak", label: "Pajak", icon: TbReceiptTax },
  { id: "Persediaan", label: "Persediaan", icon: TbPackage },
];

export function ReportsDirectory() {
  const [selectedCat, setSelectedCat] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = ALL_REPORTS.filter((r) => {
    const matchCat = selectedCat === "all" || r.category === selectedCat;
    const matchQuery =
      !query ||
      r.title.toLowerCase().includes(query.toLowerCase()) ||
      r.desc.toLowerCase().includes(query.toLowerCase()) ||
      r.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()));
    return matchCat && matchQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Daftar Laporan (Report Center)</h1>
            <p className="text-xs text-slate-500">
              Laporan akuntansi komprehensif standar PSAK terhitung otomatis dari jurnal double-entry.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <TbSearch className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama laporan..."
              className="w-full rounded-md border border-slate-300 bg-slate-50 py-1.5 pl-9 pr-3 text-xs outline-none focus:border-[#D32F2F] focus:bg-white"
            />
          </div>
        </div>

        {/* Categories Bar */}
        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const isSel = selectedCat === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCat(c.id)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  isSel
                    ? "bg-[#D32F2F] text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Report Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((r) => (
          <Link
            key={r.id}
            href={r.href}
            className="group flex items-start gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-[#D32F2F] hover:shadow-md"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E0F2FE] text-[#0284C7] transition-colors group-hover:bg-[#D32F2F] group-hover:text-white">
              <TbFileDescription className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {r.category}
                </span>
              </div>
              <h2 className="text-sm font-bold text-slate-800 group-hover:text-[#D32F2F] transition-colors">
                {r.title}
              </h2>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">{r.desc}</p>
            </div>
          </Link>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-2 rounded-lg border border-dashed border-slate-300 bg-white py-12 text-center text-slate-400">
            <p className="text-sm">Tidak ada laporan yang cocok dengan pencarian "{query}".</p>
          </div>
        )}
      </div>
    </div>
  );
}
