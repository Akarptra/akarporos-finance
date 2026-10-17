"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
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
  TbBell,
  TbUserCircle,
  TbX,
  TbFileInvoice,
  TbUsers,
  TbTruckDelivery,
  TbArrowsExchange,
  TbListDetails,
  TbNotes,
  TbBox,
  TbCreditCard,
  TbCoins,
  TbBuildingStore,
  TbHistory,
  TbPrinter,
} from "react-icons/tb";

type TabItem = {
  href: string;
  label: string;
};

const ROUTE_LABELS: Record<string, string> = {
  "/": "Dashboard",
  "/sales-invoices": "Faktur Penjualan",
  "/sales-invoices/new": "Faktur Jual Baru",
  "/purchase-invoices": "Faktur Pembelian",
  "/purchase-invoices/new": "Faktur Beli Baru",
  "/journal": "Jurnal Umum",
  "/reports": "Daftar Laporan",
  "/reports/neraca": "Laporan Neraca",
  "/reports/laba-rugi": "Laporan Laba Rugi",
  "/reports/arus-kas": "Laporan Arus Kas",
  "/reports/buku-besar": "Buku Besar",
  "/reports/piutang": "Aging Piutang",
  "/reports/utang": "Aging Utang",
  "/reports/pajak": "Rekap Pajak PPN",
  "/stock": "Persediaan Barang",
  "/cash": "Kas & Bank",
  "/accounts": "Akun Perkiraan",
  "/partners": "Pemasok & Pelanggan",
  "/items": "Barang & Jasa",
  "/taxes": "Pengaturan Pajak",
};

interface FlyoutModule {
  id: string;
  name: string;
  items: {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    color: "blue" | "green" | "orange" | "purple";
  }[];
}

const FLYOUT_MODULES: Record<string, FlyoutModule> = {
  company: {
    id: "company",
    name: "Perusahaan",
    items: [
      { label: "Pengaturan Usaha", href: "/", icon: TbBuilding, color: "blue" },
      { label: "Mitra Bisnis", href: "/partners", icon: TbUsers, color: "purple" },
      { label: "Tarif Pajak (PPN/PPh)", href: "/taxes", icon: TbReceiptTax, color: "green" },
    ],
  },
  gl: {
    id: "gl",
    name: "Buku Besar",
    items: [
      { label: "Akun Perkiraan (COA)", href: "/accounts", icon: TbListDetails, color: "blue" },
      { label: "Jurnal Umum", href: "/journal", icon: TbNotes, color: "green" },
      { label: "Buku Besar Detail", href: "/reports/buku-besar", icon: TbHistory, color: "purple" },
    ],
  },
  cash: {
    id: "cash",
    name: "Kas & Bank",
    items: [
      { label: "Transaksi Kas/Bank", href: "/cash", icon: TbCash, color: "green" },
      { label: "Transfer Antar Kas", href: "/cash", icon: TbArrowsExchange, color: "blue" },
      { label: "Laporan Arus Kas", href: "/reports/arus-kas", icon: TbCoins, color: "purple" },
    ],
  },
  sales: {
    id: "sales",
    name: "Penjualan",
    items: [
      { label: "Faktur Penjualan", href: "/sales-invoices", icon: TbFileInvoice, color: "blue" },
      { label: "+ Faktur Jual Baru", href: "/sales-invoices/new", icon: TbFileInvoice, color: "green" },
      { label: "Daftar Pelanggan", href: "/partners", icon: TbUsers, color: "orange" },
      { label: "Laporan Piutang", href: "/reports/piutang", icon: TbReceipt2, color: "purple" },
    ],
  },
  purchase: {
    id: "purchase",
    name: "Pembelian",
    items: [
      { label: "Faktur Pembelian", href: "/purchase-invoices", icon: TbShoppingCart, color: "purple" },
      { label: "+ Faktur Beli Baru", href: "/purchase-invoices/new", icon: TbShoppingCart, color: "green" },
      { label: "Daftar Pemasok", href: "/partners", icon: TbBuildingStore, color: "orange" },
      { label: "Laporan Utang Usaha", href: "/reports/utang", icon: TbTruckDelivery, color: "blue" },
    ],
  },
  inventory: {
    id: "inventory",
    name: "Persediaan",
    items: [
      { label: "Daftar Barang & Jasa", href: "/items", icon: TbBox, color: "orange" },
      { label: "Kartu Stok Perpetual", href: "/stock", icon: TbPackage, color: "green" },
    ],
  },
  reports: {
    id: "reports",
    name: "Daftar Laporan",
    items: [
      { label: "Semua Laporan (Katalog)", href: "/reports", icon: TbReportAnalytics, color: "blue" },
      { label: "Neraca Keuangan", href: "/reports/neraca", icon: TbFileInvoice, color: "green" },
      { label: "Laba / Rugi", href: "/reports/laba-rugi", icon: TbCreditCard, color: "orange" },
      { label: "Arus Kas", href: "/reports/arus-kas", icon: TbCoins, color: "blue" },
      { label: "Rekap Pajak (PPN)", href: "/reports/pajak", icon: TbReceiptTax, color: "purple" },
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
  const router = useRouter();

  const [tabs, setTabs] = useState<TabItem[]>([{ href: "/", label: "Dashboard" }]);
  const [activeFlyout, setActiveFlyout] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const flyoutRef = useRef<HTMLDivElement>(null);

  // Synchronize current route to tabs list
  useEffect(() => {
    const label = ROUTE_LABELS[pathname] || (pathname.startsWith("/sales-invoices/") ? "Detail Faktur Jual" : pathname.startsWith("/purchase-invoices/") ? "Detail Faktur Beli" : pathname.startsWith("/stock/") ? "Detail Kartu Stok" : "Dokumen");
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
    if (hrefToClose === "/") return;
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
    { id: "reports", label: "Daftar Laporan", icon: TbReportAnalytics },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F0F2F5] text-slate-800 antialiased font-sans">
      {/* 1. LEFT DOCK NAVIGATION (ACCURATE NAVY SIDEBAR) */}
      <aside className="relative z-30 flex w-[58px] flex-col items-center bg-[#15233C] py-3 text-white shadow-xl select-none">
        {/* Brand Logo Box */}
        <div className="mb-4 flex flex-col items-center">
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
        <nav className="flex flex-1 flex-col items-center gap-1.5">
          {navDockItems.map((item) => {
            const Icon = item.icon;
            const isOpen = activeFlyout === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveFlyout(isOpen ? null : item.id)}
                className={`group relative flex h-10 w-10 flex-col items-center justify-center rounded-lg transition-all ${
                  isOpen ? "bg-[#D32F2F] text-white shadow-md" : "text-slate-300 hover:bg-[#1E3354] hover:text-white"
                }`}
                title={item.label}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[8px] font-medium leading-tight opacity-80">{item.label.split(" ")[0]}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Setting */}
        <div className="mt-auto flex flex-col items-center gap-2">
          <button
            onClick={() => setActiveFlyout(activeFlyout === "company" ? null : "company")}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 hover:bg-[#1E3354] hover:text-white"
            title="Pengaturan"
          >
            <TbSettings className="h-5 w-5" />
          </button>
        </div>

        {/* 2. ACCURATE FLYOUT MODAL LAUNCHER (POPOUT MENU) */}
        {activeFlyout && FLYOUT_MODULES[activeFlyout] && (
          <div
            ref={flyoutRef}
            className="absolute left-[62px] top-12 z-50 min-w-[340px] max-w-[420px] rounded-lg border border-slate-200 bg-white p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-100"
          >
            <div className="mb-3 flex items-center justify-between border-b-2 border-[#D32F2F] pb-2">
              <h3 className="text-sm font-bold text-slate-800">{FLYOUT_MODULES[activeFlyout].name}</h3>
              <button
                onClick={() => setActiveFlyout(null)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <TbX className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {FLYOUT_MODULES[activeFlyout].items.map((it) => {
                const ItemIcon = it.icon;
                return (
                  <Link
                    key={it.label}
                    href={it.href}
                    onClick={() => setActiveFlyout(null)}
                    className={`flex flex-col items-center justify-center rounded-lg border p-3 text-center transition-all ${
                      COLOR_CLASSES[it.color]
                    }`}
                  >
                    <ItemIcon className="mb-1.5 h-6 w-6" />
                    <span className="text-xs font-semibold leading-tight">{it.label}</span>
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
        <header className="flex h-12 w-full items-center justify-between border-b border-slate-200 bg-white px-4 text-slate-700 select-none shadow-sm">
          {/* Left: Branding & Search */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black tracking-tight text-[#D32F2F]">ACCURATE</span>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">ONLINE</span>
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
            <div className="flex items-center gap-2 rounded border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-emerald-800">Perusahaan Aktif</span>
            </div>

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
        <div className="flex h-9 w-full items-end gap-1 border-b border-slate-300 bg-[#E5E9EE] px-2 pt-1 select-none overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <div
                key={tab.href}
                onClick={() => router.push(tab.href)}
                className={`group flex h-8 max-w-[200px] cursor-pointer items-center gap-2 rounded-t px-3 text-xs transition-colors ${
                  isActive
                    ? "bg-[#D32F2F] font-bold text-white shadow-sm"
                    : "bg-[#DFE3E8] font-medium text-slate-700 hover:bg-[#D2D7DD]"
                }`}
                title={tab.label}
              >
                <span className="truncate">{tab.label}</span>
                {tab.href !== "/" && (
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
