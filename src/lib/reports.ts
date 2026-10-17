import { prisma } from "./db";

type AccType = "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";

export interface ReportRow {
  id: number;
  code: string;
  name: string;
  balance: number;
}

interface Range {
  from?: Date;
  to?: Date;
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

// Saldo natural: aset/beban = debit-kredit; kewajiban/modal/pendapatan = kredit-debit
function natural(type: string, raw: number): number {
  return type === "LIABILITY" || type === "EQUITY" || type === "REVENUE" ? -raw : raw;
}

type SumMap = Map<number, { sum: number; code: string; name: string; type: string }>;

async function accountSums(types: AccType[], range: Range = {}): Promise<SumMap> {
  const lines = await prisma.journalLine.findMany({
    where: {
      account: { type: { in: types } },
      entry: {
        date: {
          ...(range.from ? { gte: startOfDay(range.from) } : {}),
          ...(range.to ? { lte: endOfDay(range.to) } : {}),
        },
      },
    },
    select: {
      accountId: true,
      debit: true,
      credit: true,
      account: { select: { code: true, name: true, type: true } },
    },
  });

  const map: SumMap = new Map();
  for (const l of lines) {
    const cur = map.get(l.accountId) ?? {
      sum: 0,
      code: l.account.code,
      name: l.account.name,
      type: l.account.type,
    };
    cur.sum += l.debit - l.credit;
    map.set(l.accountId, cur);
  }
  return map;
}

function toRows(map: SumMap): ReportRow[] {
  return [...map.entries()]
    .map(([id, v]) => ({ id, code: v.code, name: v.name, balance: natural(v.type, v.sum) }))
    .filter((r) => r.balance !== 0)
    .sort((a, b) => a.code.localeCompare(b.code));
}

/* ============ NERACA (Balance Sheet) ============ */

export interface NeracaReport {
  asOf: Date;
  aset: ReportRow[];
  kewajiban: ReportRow[];
  modal: ReportRow[];
  laba: number;
  totalAset: number;
  totalKewajiban: number;
  totalModal: number;
  seimbang: boolean;
}

export async function buildNeraca(asOf: Date): Promise<NeracaReport> {
  const [a, l, m, r, e] = await Promise.all([
    accountSums(["ASSET"], { to: asOf }),
    accountSums(["LIABILITY"], { to: asOf }),
    accountSums(["EQUITY"], { to: asOf }),
    accountSums(["REVENUE"], { to: asOf }),
    accountSums(["EXPENSE"], { to: asOf }),
  ]);

  const aset = toRows(a);
  const kewajiban = toRows(l);
  const modal = toRows(m);

  const pendapatan = [...r.values()].reduce((s, v) => s + natural(v.type, v.sum), 0);
  const beban = [...e.values()].reduce((s, v) => s + natural(v.type, v.sum), 0);
  const laba = pendapatan - beban;

  const totalAset = aset.reduce((s, x) => s + x.balance, 0);
  const totalKewajiban = kewajiban.reduce((s, x) => s + x.balance, 0);
  const totalModal = modal.reduce((s, x) => s + x.balance, 0);

  return {
    asOf,
    aset,
    kewajiban,
    modal,
    laba,
    totalAset,
    totalKewajiban,
    totalModal,
    seimbang: totalAset === totalKewajiban + totalModal + laba,
  };
}

/* ============ LABA / RUGI (Income Statement) ============ */

export interface LabaRugiReport {
  from: Date;
  to: Date;
  pendapatan: ReportRow[];
  beban: ReportRow[];
  totalPendapatan: number;
  totalBeban: number;
  labaBersih: number;
}

export async function buildLabaRugi(from: Date, to: Date): Promise<LabaRugiReport> {
  const [r, e] = await Promise.all([
    accountSums(["REVENUE"], { from, to }),
    accountSums(["EXPENSE"], { from, to }),
  ]);

  const pendapatan = toRows(r);
  const beban = toRows(e);
  const totalPendapatan = pendapatan.reduce((s, x) => s + x.balance, 0);
  const totalBeban = beban.reduce((s, x) => s + x.balance, 0);

  return {
    from,
    to,
    pendapatan,
    beban,
    totalPendapatan,
    totalBeban,
    labaBersih: totalPendapatan - totalBeban,
  };
}

/* ============ ARUS KAS (Direct method, sederhana) ============ */

export type Kategori = "OPERASI" | "INVESTASI" | "PENDANAAN";

export interface KasBaris {
  masuk: number;
  keluar: number;
  net: number;
}

export interface KasAkunBaris {
  id: number;
  code: string;
  name: string;
  awal: number;
  masuk: number;
  keluar: number;
  akhir: number;
}

export interface ArusKasReport {
  from: Date;
  to: Date;
  perKategori: Record<Kategori, KasBaris>;
  perAkun: KasAkunBaris[];
  kasAwal: number;
  kasAkhir: number;
  perubahan: number;
  totalMasuk: number;
  totalKeluar: number;
  terklasifikasi: number;
}

function kategoriOf(acc: { type: string; code: string }): Kategori {
  if (acc.type === "REVENUE" || acc.type === "EXPENSE") return "OPERASI";
  if (acc.type === "EQUITY") return "PENDANAAN";
  if (acc.type === "LIABILITY") return Number(acc.code) >= 2300 ? "PENDANAAN" : "OPERASI";
  if (acc.type === "ASSET") return Number(acc.code) >= 1500 ? "INVESTASI" : "OPERASI";
  return "OPERASI";
}

async function cashBalanceMap(
  ids: number[],
  f: { lt?: Date; lte?: Date }
): Promise<Map<number, number>> {
  const lines = await prisma.journalLine.findMany({
    where: {
      accountId: { in: ids },
      entry: { date: f.lt ? { lt: f.lt } : { lte: f.lte! } },
    },
    select: { accountId: true, debit: true, credit: true },
  });
  const map = new Map<number, number>();
  for (const l of lines) {
    map.set(l.accountId, (map.get(l.accountId) ?? 0) + (l.debit - l.credit));
  }
  return map;
}

export async function buildArusKas(from: Date, to: Date): Promise<ArusKasReport> {
  const cashAccounts = await prisma.account.findMany({
    where: { OR: [{ isCash: true }, { alias: { in: ["KAS", "BANK"] } }] },
    orderBy: { code: "asc" },
  });
  const cashIds = cashAccounts.map((a) => a.id);
  const cashSet = new Set(cashIds);

  const perKategori: Record<Kategori, KasBaris> = {
    OPERASI: { masuk: 0, keluar: 0, net: 0 },
    INVESTASI: { masuk: 0, keluar: 0, net: 0 },
    PENDANAAN: { masuk: 0, keluar: 0, net: 0 },
  };
  const perAkunAgg = new Map<number, { masuk: number; keluar: number }>();

  if (cashIds.length > 0) {
    const entries = await prisma.journalEntry.findMany({
      where: {
        date: { gte: startOfDay(from), lte: endOfDay(to) },
        lines: { some: { accountId: { in: cashIds } } },
      },
      include: { lines: { include: { account: true } } },
    });

    for (const e of entries) {
      const cashLegs = e.lines.filter((l) => cashSet.has(l.accountId));

      for (const l of cashLegs) {
        const agg = perAkunAgg.get(l.accountId) ?? { masuk: 0, keluar: 0 };
        agg.masuk += l.debit;
        agg.keluar += l.credit;
        perAkunAgg.set(l.accountId, agg);
      }

      const net = cashLegs.reduce((s, l) => s + l.debit - l.credit, 0);
      if (net === 0) continue; // transfer antar kas → tidak ubah total kas

      const counters = e.lines.filter((l) => !cashSet.has(l.accountId));
      let kat: Kategori = "OPERASI";
      if (counters.length > 0) {
        const dom = counters.reduce((a, b) =>
          Math.abs(b.debit - b.credit) > Math.abs(a.debit - a.credit) ? b : a
        );
        kat = kategoriOf(dom.account);
      }
      if (net > 0) perKategori[kat].masuk += net;
      else perKategori[kat].keluar += -net;
    }
  }

  for (const k of ["OPERASI", "INVESTASI", "PENDANAAN"] as Kategori[]) {
    perKategori[k].net = perKategori[k].masuk - perKategori[k].keluar;
  }

  const [awalMap, akhirMap] = await Promise.all([
    cashIds.length > 0
      ? cashBalanceMap(cashIds, { lt: startOfDay(from) })
      : Promise.resolve(new Map<number, number>()),
    cashIds.length > 0
      ? cashBalanceMap(cashIds, { lte: endOfDay(to) })
      : Promise.resolve(new Map<number, number>()),
  ]);

  const perAkun: KasAkunBaris[] = cashAccounts.map((a) => {
    const agg = perAkunAgg.get(a.id) ?? { masuk: 0, keluar: 0 };
    return {
      id: a.id,
      code: a.code,
      name: a.name,
      awal: awalMap.get(a.id) ?? 0,
      masuk: agg.masuk,
      keluar: agg.keluar,
      akhir: akhirMap.get(a.id) ?? 0,
    };
  });

  const kasAwal = perAkun.reduce((s, x) => s + x.awal, 0);
  const kasAkhir = perAkun.reduce((s, x) => s + x.akhir, 0);
  const totalMasuk = perAkun.reduce((s, x) => s + x.masuk, 0);
  const totalKeluar = perAkun.reduce((s, x) => s + x.keluar, 0);

  return {
    from,
    to,
    perKategori,
    perAkun,
    kasAwal,
    kasAkhir,
    perubahan: kasAkhir - kasAwal,
    totalMasuk,
    totalKeluar,
    terklasifikasi:
      perKategori.OPERASI.net + perKategori.INVESTASI.net + perKategori.PENDANAAN.net,
  };
}

/* ============ BUKU BESAR per akun ============ */

export interface GLRow {
  id: number;
  date: Date;
  memo: string;
  reference: string | null;
  sourceType: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface BukuBesarReport {
  account: { id: number; code: string; name: string; type: string };
  from: Date;
  to: Date;
  awal: number;
  rows: GLRow[];
  akhir: number;
}

export async function buildBukuBesar(
  accountId: number,
  from: Date,
  to: Date
): Promise<BukuBesarReport> {
  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account) throw new Error("Akun tidak ditemukan");

  const opening = await prisma.journalLine.findMany({
    where: { accountId, entry: { date: { lt: startOfDay(from) } } },
    select: { debit: true, credit: true },
  });
  let run = natural(
    account.type,
    opening.reduce((s, l) => s + (l.debit - l.credit), 0)
  );
  const awal = run;

  const lines = await prisma.journalLine.findMany({
    where: { accountId, entry: { date: { gte: startOfDay(from), lte: endOfDay(to) } } },
    include: { entry: true },
    orderBy: [{ entry: { date: "asc" } }, { id: "asc" }],
  });

  const rows: GLRow[] = lines.map((l) => {
    run += natural(account.type, l.debit - l.credit);
    return {
      id: l.id,
      date: l.entry.date,
      memo: l.entry.memo,
      reference: l.entry.reference,
      sourceType: l.entry.sourceType,
      debit: l.debit,
      credit: l.credit,
      balance: run,
    };
  });

  return {
    account: { id: account.id, code: account.code, name: account.name, type: account.type },
    from,
    to,
    awal,
    rows,
    akhir: run,
  };
}

/* ============ PIUTANG / UTANG (Aging) ============ */

export interface AgingRow {
  partnerId: number;
  name: string;
  total: number;
  belumJatuhTempo: number;
  h1: number; // 1-30 hari
  h2: number; // 31-60 hari
  h3: number; // 61-90 hari
  h4: number; // >90 hari
  oldestDue: Date | null;
}

export interface AgingReport {
  asOf: Date;
  rows: AgingRow[];
  total: number;
  totalBelum: number;
  totalH1: number;
  totalH2: number;
  totalH3: number;
  totalH4: number;
}

/** Selisih hari berbasis tanggal murnya saja (hindari geser timezone). */
function daysBetween(a: Date, b: Date): number {
  const A = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const B = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((A - B) / 86400000);
}

async function buildAging(type: "SALES" | "PURCHASE", asOf: Date): Promise<AgingReport> {
  const invoices = await prisma.invoice.findMany({
    where: { type, status: { not: "VOID" } },
    include: { partner: true },
    orderBy: { dueDate: "asc" },
  });

  const rows = new Map<number, AgingRow>();
  let total = 0;

  for (const inv of invoices) {
    const sisa = inv.total - inv.paid;
    if (sisa <= 0) continue;

    const overdue = daysBetween(asOf, inv.dueDate);
    let row = rows.get(inv.partnerId);
    if (!row) {
      row = {
        partnerId: inv.partnerId,
        name: inv.partner.name,
        total: 0,
        belumJatuhTempo: 0,
        h1: 0,
        h2: 0,
        h3: 0,
        h4: 0,
        oldestDue: null,
      };
      rows.set(inv.partnerId, row);
    }

    row.total += sisa;
    total += sisa;

    if (overdue <= 0) row.belumJatuhTempo += sisa;
    else if (overdue <= 30) row.h1 += sisa;
    else if (overdue <= 60) row.h2 += sisa;
    else if (overdue <= 90) row.h3 += sisa;
    else row.h4 += sisa;

    if (!row.oldestDue || inv.dueDate < row.oldestDue) row.oldestDue = inv.dueDate;
  }

  const list = [...rows.values()].sort((a, b) => b.total - a.total);

  return {
    asOf,
    rows: list,
    total,
    totalBelum: list.reduce((s, r) => s + r.belumJatuhTempo, 0),
    totalH1: list.reduce((s, r) => s + r.h1, 0),
    totalH2: list.reduce((s, r) => s + r.h2, 0),
    totalH3: list.reduce((s, r) => s + r.h3, 0),
    totalH4: list.reduce((s, r) => s + r.h4, 0),
  };
}

export function buildPiutang(asOf: Date): Promise<AgingReport> {
  return buildAging("SALES", asOf);
}

export function buildUtang(asOf: Date): Promise<AgingReport> {
  return buildAging("PURCHASE", asOf);
}

/* ============ PAJAK (PPN Keluaran vs Masukan) ============ */

export interface PajakBaris {
  id: number;
  date: Date;
  reference: string | null;
  memo: string;
  debit: number;
  credit: number;
  net: number;
}

export interface PajakReport {
  from: Date;
  to: Date;
  keluaranAkun: string;
  masukanAkun: string;
  ppnKeluaran: number;
  ppnMasukan: number;
  sisaPajak: number; // > 0 = masih harus setor; < 0 = lebih bayar
  rincianKeluaran: PajakBaris[];
  rincianMasukan: PajakBaris[];
}

async function vatLines(alias: string, from: Date, to: Date) {
  const acc = await prisma.account.findFirst({ where: { alias } });
  if (!acc) return { account: null, lines: [] as PajakBaris[] };

  const raw = await prisma.journalLine.findMany({
    where: { accountId: acc.id, entry: { date: { gte: startOfDay(from), lte: endOfDay(to) } } },
    include: { entry: true },
    orderBy: [{ entry: { date: "asc" } }, { id: "asc" }],
  });

  return {
    account: acc,
    lines: raw.map((l) => ({
      id: l.id,
      date: l.entry.date,
      reference: l.entry.reference,
      memo: l.entry.memo,
      debit: l.debit,
      credit: l.credit,
      net: l.credit - l.debit,
    })),
  };
}

export async function buildPajak(from: Date, to: Date): Promise<PajakReport> {
  const [out, inn] = await Promise.all([
    vatLines("VAT_OUT", from, to),
    vatLines("VAT_IN", from, to),
  ]);

  // PPN keluaran = kredit - debit pada akun kewajiban pajak
  const ppnKeluaran = out.lines.reduce((s, l) => s + l.net, 0);
  // PPN masukan = debit - kredit pada akun pajak ditahan
  const ppnMasukan = inn.lines.reduce((s, l) => s - l.net, 0);

  return {
    from,
    to,
    keluaranAkun: out.account ? `${out.account.code} · ${out.account.name}` : "akun belum di-set",
    masukanAkun: inn.account ? `${inn.account.code} · ${inn.account.name}` : "akun belum di-set",
    ppnKeluaran,
    ppnMasukan,
    sisaPajak: ppnKeluaran - ppnMasukan,
    rincianKeluaran: out.lines,
    rincianMasukan: inn.lines,
  };
}
