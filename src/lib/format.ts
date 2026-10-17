// Format & utilitas angka (Rupiah, bulan, tanggal)

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function formatRp(n: number | null | undefined): string {
  if (n === null || n === undefined) return "Rp 0";
  return rupiah.format(n);
}

export function formatNumber(n: number | null | undefined): string {
  if (n === null || n === undefined) return "0";
  return new Intl.NumberFormat("id-ID").format(n);
}

// "2025-01-31" -> Date (local, hindari off-by-one timezone)
export function parseDateInput(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function toDateInput(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatTanggal(d: Date | string | null | undefined): string {
  if (!d) return "-";
  const date = typeof d === "string" ? parseDateInput(d) : d;
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}
