import type { Metadata } from "next";
import "./globals.css";
import { AccurateShell } from "@/components/accurate-shell";

export const metadata: Metadata = {
  title: "Accurate Online — Laporan Keuangan",
  description: "Sistem akuntansi, pembukuan, stok perpetual, dan laporan keuangan komprehensif standar PSAK",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="overflow-hidden">
        <AccurateShell>{children}</AccurateShell>
      </body>
    </html>
  );
}
