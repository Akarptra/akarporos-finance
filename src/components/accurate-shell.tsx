"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  // Navigation & Core
  TbBuilding,
  TbBook2,
  TbCash,
  TbReceipt2,
  TbShoppingCart,
  TbPackage,
  TbReportAnalytics,
  TbReceiptTax,
  TbSettings,
  TbSearch,
  TbUserCircle,
  TbX,
  TbPrinter,
  // Perusahaan
  TbBuildingCommunity,
  TbUserCheck,
  TbRepeat,
  TbCalendarTime,
  TbClockPlay,
  TbCashBanknote,
  TbAddressBook,
  TbStar,
  TbHistory,
  // Buku Besar
  TbListDetails,
  TbNotes,
  TbReportMoney,
  TbChartBar,
  TbCurrencyDollar,
  TbArrowsExchange2,
  TbCoin,
  TbReceiptRefund,
  // Kas & Bank
  TbCreditCard,
  TbArrowsExchange,
  TbBuildingBank,
  TbFileDescription,
  TbChecklist,
  TbCoins,
  // Penjualan
  TbFileCheck,
  TbTruckDelivery,
  TbFileInvoice,
  TbPigMoney,
  TbTags,
  TbTag,
  TbUsers,
  TbDiscount,
  TbTargetArrow,
  TbBuildingStore,
  // Pembelian
  TbTruckLoading,
  TbReceipt,
  TbTruckReturn,
  TbCategory,
  // Persediaan
  TbClipboardCheck,
  TbTrademark,
  TbArrowsSort,
  TbHammer,
  TbLayersIntersect,
  TbScale,
  TbBox,
  TbBuildingWarehouse,
  TbAlertTriangle,
  // Aset Tetap
  TbArmchair,
  TbArchive,
  TbTruck,
  TbMapPin,
} from "react-icons/tb";

type TabItem = {
  href: string;
  label: string;
};

const ROUTE_LABELS: Record<string, string> = {
  "/": "Dashboard",
  "/setup": "Persiapan Data Perusahaan",
  "/sales-invoices": "Faktur Penjualan",
  "/sales-invoices/new": "Faktur Jual Baru",
  "/purchase-invoices": "Faktur Pembelian",
  "/purchase-invoices/new": "Faktur Beli Baru",
  "/journal": "Jurnal Umum",
  "/reports": "Daftar Laporan",
  "/reports/neraca": "Laporan Neraca",
  "/reports/laba-rugi": "Laporan Laba Rugi",
  "/reports/arus-kas": "Laporan Arus Kas",
  "/reports/buku-besar": "Buku Besar Detail",
  "/reports/piutang": "Aging Piutang",
  "/reports/utang": "Aging Utang",
  "/reports/pajak": "Rekapitulasi PPN",
  "/stock": "Persediaan Barang",
  "/cash": "Kas & Bank",
  "/accounts": "Akun Perkiraan",
  "/partners": "Pemasok & Pelanggan",
  "/items": "Barang & Jasa",
  "/taxes": "Pengaturan Pajak",
};

interface MenuItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "blue" | "green" | "orange" | "purple";
  badge?: string;
}

interface FlyoutModule {
  id: string;
  name: string;
  items: MenuItem[];
}

const FLYOUT_MODULES: Record<string, FlyoutModule> = {
  company: {
    id: "company",
    name: "Perusahaan",
    items: [
      { label: "Cabang", href: "/setup", icon: TbBuildingCommunity, color: "blue" },
      { label: "Pajak", href: "/taxes", icon: TbReceiptTax, color: "green" },
      { label: "Karyawan", href: "/partners", icon: TbUserCheck, color: "orange" },
      { label: "Transaksi Berulang", href: "/journal", icon: TbRepeat, color: "purple" },
      { label: "Syarat Pembayaran", href: "/partners", icon: TbCalendarTime, color: "blue" },
      { label: "Proses Akhir Bulan", href: "/reports/neraca", icon: TbClockPlay, color: "green", badge: "END" },
      { label: "Gaji/Tunjangan", href: "/journal", icon: TbCashBanknote, color: "orange" },
      { label: "Kontak", href: "/partners", icon: TbAddressBook, color: "purple" },
      { label: "Transaksi Favorit", href: "/sales-invoices", icon: TbStar, color: "blue" },
      { label: "Log Aktifitas", href: "/journal", icon: TbHistory, color: "green" },
    ],
  },
  gl: {
    id: "gl",
    name: "Buku Besar",
    items: [
      { label: "Akun Perkiraan", href: "/accounts", icon: TbListDetails, color: "blue" },
      { label: "Jurnal Umum", href: "/journal", icon: TbNotes, color: "green" },
      { label: "Pencatatan Beban", href: "/journal", icon: TbReportMoney, color: "orange" },
      { label: "Monitor Anggaran", href: "/reports/laba-rugi", icon: TbChartBar, color: "purple" },
      { label: "Pencatatan Gaji", href: "/journal", icon: TbCurrencyDollar, color: "blue" },
      { label: "Transfer Anggaran", href: "/journal", icon: TbArrowsExchange2, color: "green" },
      { label: "Anggaran", href: "/reports/laba-rugi", icon: TbCoin, color: "orange" },
      { label: "Histori Akun", href: "/reports/buku-besar", icon: TbHistory, color: "purple" },
      { label: "Log Aktifitas Jurnal", href: "/reports/buku-besar", icon: TbReceiptRefund, color: "blue" },
    ],
  },
  cash: {
    id: "cash",
    name: "Kas & Bank",
    items: [
      { label: "Pembayaran", href: "/cash", icon: TbReceiptRefund, color: "orange" },
      { label: "Penerimaan", href: "/cash", icon: TbCreditCard, color: "green" },
      { label: "Transfer Bank", href: "/cash", icon: TbArrowsExchange, color: "blue" },
      { label: "SmartLink e-Banking", href: "/cash", icon: TbBuildingBank, color: "purple" },
      { label: "Rekening Koran", href: "/reports/arus-kas", icon: TbFileDescription, color: "blue" },
      { label: "Histori Bank", href: "/reports/buku-besar", icon: TbHistory, color: "green" },
      { label: "Rekonsiliasi Bank", href: "/cash", icon: TbChecklist, color: "orange" },
      { label: "SmartLink Virtual Account", href: "/cash", icon: TbCreditCard, color: "purple" },
      { label: "SmartLink e-Payment", href: "/cash", icon: TbCoins, color: "blue" },
    ],
  },
  sales: {
    id: "sales",
    name: "Penjualan",
    items: [
      { label: "Penawaran Penjualan", href: "/sales-invoices/new", icon: TbFileDescription, color: "blue" },
      { label: "Pesanan Penjualan", href: "/sales-invoices/new", icon: TbFileCheck, color: "green" },
      { label: "Pengiriman Pesanan", href: "/sales-invoices", icon: TbTruckDelivery, color: "orange" },
      { label: "Faktur Penjualan", href: "/sales-invoices", icon: TbFileInvoice, color: "purple" },
      { label: "Uang Muka Penjualan", href: "/sales-invoices/new", icon: TbPigMoney, color: "blue" },
      { label: "Penerimaan Penjualan", href: "/cash", icon: TbCreditCard, color: "green" },
      { label: "Kategori Pelanggan", href: "/partners", icon: TbTags, color: "orange" },
      { label: "Kategori Penjualan", href: "/items", icon: TbTag, color: "purple" },
      { label: "Pelanggan", href: "/partners", icon: TbUsers, color: "blue" },
      { label: "Penyesuaian Harga Diskon", href: "/items", icon: TbDiscount, color: "green" },
      { label: "Target Penjualan", href: "/reports/laba-rugi", icon: TbTargetArrow, color: "orange" },
      { label: "SmartLink e-Commerce", href: "/sales-invoices", icon: TbBuildingStore, color: "purple" },
    ],
  },
  purchase: {
    id: "purchase",
    name: "Pembelian",
    items: [
      { label: "Pesanan Pembelian", href: "/purchase-invoices/new", icon: TbShoppingCart, color: "purple" },
      { label: "Penerimaan Barang", href: "/stock", icon: TbTruckLoading, color: "blue" },
      { label: "Uang Muka Pembelian", href: "/purchase-invoices/new", icon: TbPigMoney, color: "green" },
      { label: "Faktur Pembelian", href: "/purchase-invoices", icon: TbReceipt, color: "orange" },
      { label: "Pembayaran Pembelian", href: "/cash", icon: TbCreditCard, color: "purple" },
      { label: "Retur Pembelian", href: "/purchase-invoices", icon: TbTruckReturn, color: "blue" },
      { label: "Harga Pemasok", href: "/items", icon: TbTag, color: "green" },
      { label: "Kategori Pemasok", href: "/partners", icon: TbCategory, color: "orange" },
      { label: "Pemasok", href: "/partners", icon: TbBuildingStore, color: "purple" },
      { label: "Perintah Pembayaran", href: "/cash", icon: TbFileCheck, color: "blue" },
      { label: "Transfer Pemasok", href: "/cash", icon: TbArrowsExchange, color: "green" },
    ],
  },
  inventory: {
    id: "inventory",
    name: "Persediaan",
    items: [
      { label: "Permintaan Barang", href: "/stock", icon: TbFileDescription, color: "blue" },
      { label: "Perintah Stok Opname", href: "/stock", icon: TbClipboardCheck, color: "green" },
      { label: "Merek Barang", href: "/items", icon: TbTrademark, color: "orange" },
      { label: "Pemindahan Barang", href: "/stock", icon: TbArrowsSort, color: "purple" },
      { label: "Hasil Stok Opname", href: "/stock", icon: TbChecklist, color: "blue" },
      { label: "Pemenuhan Pesanan", href: "/stock", icon: TbFileCheck, color: "green" },
      { label: "Pekerjaan Pesanan", href: "/stock", icon: TbHammer, color: "orange" },
      { label: "Penambahan Bahan Baku", href: "/stock", icon: TbLayersIntersect, color: "purple" },
      { label: "Penyelesaian Pesanan", href: "/stock", icon: TbChecklist, color: "blue" },
      { label: "Penyesuaian Persediaan", href: "/stock", icon: TbScale, color: "green" },
      { label: "Satuan Barang", href: "/items", icon: TbBox, color: "orange" },
      { label: "Kategori Barang", href: "/items", icon: TbCategory, color: "purple" },
      { label: "Barang & Jasa", href: "/items", icon: TbPackage, color: "blue" },
      { label: "Gudang", href: "/stock", icon: TbBuildingWarehouse, color: "green" },
      { label: "Barang per Gudang", href: "/stock", icon: TbBuildingWarehouse, color: "orange" },
      { label: "Barang Stok Minimum", href: "/stock", icon: TbAlertTriangle, color: "purple" },
    ],
  },
  fixed_assets: {
    id: "fixed_assets",
    name: "Aset Tetap",
    items: [
      { label: "Aset Tetap", href: "/accounts", icon: TbArmchair, color: "blue" },
      { label: "Kategori Aset", href: "/accounts", icon: TbCategory, color: "green" },
      { label: "Kategori Aset Tetap Pajak", href: "/taxes", icon: TbReceiptTax, color: "orange" },
      { label: "Perubahan Aset Tetap", href: "/journal", icon: TbArrowsExchange, color: "purple" },
      { label: "Disposisi Aset Tetap", href: "/journal", icon: TbArchive, color: "blue" },
      { label: "Pindah Aset", href: "/accounts", icon: TbTruck, color: "green" },
      { label: "Aset per Lokasi", href: "/accounts", icon: TbMapPin, color: "orange" },
    ],
  },
  reports: {
    id: "reports",
    name: "Daftar Laporan",
    items: [
      { label: "Katalog Semua Laporan", href: "/reports", icon: TbReportAnalytics, color: "blue" },
      { label: "Neraca Keuangan", href: "/reports/neraca", icon: TbFileInvoice, color: "green" },
      { label: "Laba / Rugi", href: "/reports/laba-rugi", icon: TbCreditCard, color: "orange" },
      { label: "Arus Kas", href: "/reports/arus-kas", icon: TbCoins, color: "blue" },
      { label: "Buku Besar", href: "/reports/buku-besar", icon: TbHistory, color: "purple" },
      { label: "Penuaan Piutang", href: "/reports/piutang", icon: TbReceipt2, color: "green" },
      { label: "Penuaan Utang", href: "/reports/utang", icon: TbTruckDelivery, color: "orange" },
      { label: "Rekapitulasi Pajak PPN", href: "/reports/pajak", icon: TbReceiptTax, color: "purple" },
    ],
  },
};

const COLOR_CLASSES = {
  blue: "bg-[#EBF3FC] border-[#C3DCFA] text-[#1D4ED8] hover:bg-[#DDEBFA]",
  green: "bg-[#EAF7EE] border-[#BEE7CB] text-[#15803D] hover:bg-[#DCF1E2]",
  orange: "bg-[#FEF6EC] border-[#FBDDBB] text-[#C2410C] hover:bg-[#FCEFD9]",
  purple: "bg-[#F7EFFE] border-[#E9D0FC] text-[#7E22CE] hover:bg-[#EFE0FD]",
};

export function AccurateShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === '/ui') {
    return <>{children}</>;
  }
  const router = useRouter();

  // Pre-seed Dashboard and Persiapan Data Perusahaan as initial tabs (matching screenshot 21)
  const [tabs, setTabs] = useState<TabItem[]>([
    { href: "/", label: "Dashboard" },
    { href: "/setup", label: "Persiapan Data Perusahaan" },
  ]);

  const [activeFlyout, setActiveFlyout] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);

  // Synchronize current route to tabs list
  useEffect(() => {
    const label =
      ROUTE_LABELS[pathname] ||
      (pathname.startsWith("/sales-invoices/")
        ? "Detail Faktur Jual"
        : pathname.startsWith("/purchase-invoices/")
        ? "Detail Faktur Beli"
        : pathname.startsWith("/stock/")
        ? "Detail Kartu Stok"
        : "Dokumen");
    setTabs((prev) => {
      if (prev.some((t) => t.href === pathname)) return prev;
      return [...prev, { href: pathname, label }];
    });
  }, [pathname]);

  // Click outside flyout to dismiss
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (flyoutRef.current && !flyoutRef.current.contains(e.target as Node)) {
        setActiveFlyout(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeTab = (e: React.MouseEvent, hrefToClose: string) => {
    e.stopPropagation();
    if (hrefToClose === "/" || hrefToClose === "/setup") return;
    const nextTabs = tabs.filter((t) => t.href !== hrefToClose);
    setTabs(nextTabs);
    if (pathname === hrefToClose) {
      const fallback = nextTabs[nextTabs.length - 1] || { href: "/" };
      router.push(fallback.href);
    }
  };

  const navDockItems = [
    { id: "company", label: "Perusahaan", icon: TbBuilding },
    { id: "gl", label: "Buku Besar", icon: TbBook2 },
    { id: "cash", label: "Kas & Bank", icon: TbCash },
    { id: "sales", label: "Penjualan", icon: TbReceipt2 },
    { id: "purchase", label: "Pembelian", icon: TbShoppingCart },
    { id: "inventory", label: "Persediaan", icon: TbPackage },
    { id: "fixed_assets", label: "Aset Tetap", icon: TbArmchair },
    { id: "reports", label: "Daftar Laporan", icon: TbReportAnalytics },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F0F2F5] text-slate-800 antialiased font-sans">
      {/* 1. LEFT DOCK NAVIGATION (ACCURATE NAVY SIDEBAR) */}
      <aside className="relative z-30 flex w-[60px] flex-col items-center bg-[#15233C] py-3 text-white shadow-xl select-none shrink-0">
        {/* Brand Logo Box */}
        <div className="mb-3 flex flex-col items-center">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded bg-[#D32F2F] text-base font-black text-white shadow hover:bg-[#B71C1C]"
            title="Accurate Online / MyLedger"
          >
            A
          </Link>
          <span className="mt-1 text-[9px] font-semibold tracking-wider text-slate-400 uppercase">AOL</span>
        </div>

        {/* Dock Icons */}
        <nav className="flex flex-1 flex-col items-center gap-1.5 overflow-y-auto no-scrollbar py-1">
          {navDockItems.map((item) => {
            const Icon = item.icon;
            const isOpen = activeFlyout === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveFlyout(isOpen ? null : item.id)}
                className={`group relative flex h-10 w-11 flex-col items-center justify-center rounded-lg transition-all ${
                  isOpen ? "bg-[#D32F2F] text-white shadow-md" : "text-slate-300 hover:bg-[#1E3354] hover:text-white"
                }`}
                title={item.label}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[8px] font-medium leading-tight opacity-85 truncate max-w-[44px]">
                  {item.label.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Setting */}
        <div className="mt-auto flex flex-col items-center gap-2 pt-2 border-t border-slate-700/50">
          <Link
            href="/setup"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 hover:bg-[#1E3354] hover:text-white"
            title="Persiapan Data Perusahaan"
          >
            <TbSettings className="h-5 w-5" />
          </Link>
        </div>

        {/* 2. ACCURATE FLYOUT MODAL LAUNCHER (POPOUT GRID OF CARDS) */}
        {activeFlyout && FLYOUT_MODULES[activeFlyout] && (
          <div
            ref={flyoutRef}
            className="absolute left-[64px] top-6 z-50 w-[560px] max-w-[85vw] max-h-[88vh] overflow-y-auto rounded-lg border border-slate-200 bg-white p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-100"
          >
            <div className="mb-3 flex items-center justify-between border-b-2 border-[#D32F2F] pb-2">
              <div className="flex items-center gap-2">
                <span className="h-3 w-1 bg-[#D32F2F] rounded-full" />
                <h3 className="text-sm font-bold text-slate-800 tracking-wide uppercase">
                  {FLYOUT_MODULES[activeFlyout].name}
                </h3>
              </div>
              <button
                onClick={() => setActiveFlyout(null)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <TbX className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {FLYOUT_MODULES[activeFlyout].items.map((it) => {
                const ItemIcon = it.icon;
                return (
                  <Link
                    key={it.label}
                    href={it.href}
                    onClick={() => {
                      setActiveFlyout(null);
                      setFeedback(`Membuka: ${it.label}`);
                      setTimeout(() => setFeedback(null), 2500);
                    }}
                    className={`group relative flex flex-col items-center justify-center rounded-lg border p-2.5 text-center transition-all ${
                      COLOR_CLASSES[it.color]
                    }`}
                  >
                    {it.badge && (
                      <span className="absolute top-1 right-1 rounded bg-[#D32F2F] px-1 py-0.2 text-[8px] font-bold text-white uppercase">
                        {it.badge}
                      </span>
                    )}
                    <ItemIcon className="mb-1.5 h-6 w-6 transition-transform group-hover:scale-110" />
                    <span className="text-[10px] font-semibold leading-tight line-clamp-2">{it.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </aside>

      {/* 3. MAIN WORKSPACE CANVAS */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* TOP ACCURATE HEADER */}
        <header className="flex h-12 w-full items-center justify-between border-b border-slate-200 bg-white px-4 text-slate-700 select-none shadow-sm shrink-0">
          {/* Left: Branding & Search */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black tracking-tight text-[#D32F2F]">ACCURATE</span>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">ONLINE</span>
            <Link href="/ui" className="ml-2 inline-flex items-center gap-1 rounded bg-[#EBF3FC] px-2 py-0.5 text-[11px] font-semibold text-[#1D4ED8] border border-[#C3DCFA] hover:bg-[#DDEBFA] transition" title="Buka UI Workspace Clone">
              ✨ Workspace UI Clone ↗
            </Link>
            </div>

            {/* Global Search Input */}
            <div className="relative hidden sm:block">
              <TbSearch className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari transaksi, menu, akun..."
                className="h-8 w-64 rounded border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs outline-none focus:border-[#D32F2F] focus:bg-white"
              />
            </div>
          </div>

          {/* Right: Company & Profile Info */}
          <div className="flex items-center gap-3">
            {feedback && (
              <span className="hidden lg:inline text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
                ✓ {feedback}
              </span>
            )}

            <Link
              href="/setup"
              className="flex items-center gap-2 rounded border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs hover:bg-emerald-100 transition-colors"
              title="Atur Data Perusahaan"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-emerald-800">Perusahaan Aktif</span>
            </Link>

            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                title="Cetak Halaman / Laporan"
              >
                <TbPrinter className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Cetak</span>
              </button>
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <TbUserCircle className="h-5 w-5 text-slate-500" />
                <span className="hidden font-medium sm:inline">Operator</span>
              </div>
            </div>
          </div>
        </header>

        {/* TOP TAB BAR (ACCURATE SIGNATURE MULTI-TAB) */}
        <div className="flex h-9 w-full items-end gap-1 border-b border-slate-300 bg-[#E5E9EE] px-2 pt-1 select-none overflow-x-auto no-scrollbar shrink-0">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            const canClose = tab.href !== "/" && tab.href !== "/setup";
            return (
              <div
                key={tab.href}
                onClick={() => router.push(tab.href)}
                className={`group flex h-8 max-w-[220px] cursor-pointer items-center gap-2 rounded-t px-3 text-xs transition-colors shrink-0 ${
                  isActive
                    ? "bg-[#D32F2F] font-bold text-white shadow-sm"
                    : "bg-[#DFE3E8] font-medium text-slate-700 hover:bg-[#D2D7DD]"
                }`}
                title={tab.label}
              >
                <span className="truncate">{tab.label}</span>
                {canClose && (
                  <button
                    type="button"
                    onClick={(e) => closeTab(e, tab.href)}
                    className={`rounded p-0.5 transition-colors ${
                      isActive
                        ? "text-white/80 hover:bg-white/20 hover:text-white"
                        : "text-slate-400 hover:bg-slate-300 hover:text-slate-800"
                    }`}
                  >
                    <TbX className="h-3 w-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* 4. WORKSPACE CONTENT CONTAINER */}
        <main className="flex-1 overflow-y-auto bg-[#F4F6F9] p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
