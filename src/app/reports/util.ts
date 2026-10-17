import { parseDateInput } from "@/lib/format";

// Default periode: 1 Januari tahun berjalan → hari ini
export function defaultFrom(): Date {
  const n = new Date();
  return new Date(n.getFullYear(), 0, 1);
}

export function defaultTo(): Date {
  return new Date();
}

export function ambilDari(s?: string): Date {
  return s ? parseDateInput(s) : defaultFrom();
}

export function ambilSampai(s?: string): Date {
  return s ? parseDateInput(s) : defaultTo();
}

export function ambilAsOf(s?: string): Date {
  return s ? parseDateInput(s) : new Date();
}

export function panjang(d: Date): string {
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
}
