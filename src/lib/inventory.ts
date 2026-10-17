import { Db } from "./journal";

export interface StockMoveInput {
  date: Date;
  itemId: number;
  qty: number;
  unitCost?: number; // khusus IN; OUT dihitung dari rata-rata bergerak
  refType: string;
  refId: number;
  memo?: string | null;
}

export interface MovingAverage {
  qty: number; // saldo qty sebelum tanggal
  value: number; // saldo nilai sebelum tanggal
  avg: number; // harga pokok per unit (0 bila stok kosong)
}

/**
 * Rata-rata bergerak: proses seluruh mutasi sampai tanggal tersebut secara kronologis.
 * IN  → qty & nilai bertambah.
 * OUT → qty & nilai berkurang memakai harga pokok keluar yang tercatat.
 */
export async function movingAverage(
  db: Db,
  itemId: number,
  before: Date
): Promise<MovingAverage> {
  const moves = await db.stockMove.findMany({
    where: { itemId, date: { lte: before } },
    orderBy: [{ date: "asc" }, { id: "asc" }],
  });

  let qty = 0;
  let value = 0;
  for (const m of moves) {
    if (m.type === "IN") {
      qty += m.qty;
      value += m.qty * m.unitCost;
    } else {
      qty -= m.qty;
      value -= m.qty * m.unitCost;
    }
  }

  const avg = qty > 0 ? Math.round(value / qty) : 0;
  return { qty, value, avg };
}

/** Catat barang masuk (pembelian). */
export async function postStockIn(db: Db, p: StockMoveInput) {
  if (p.qty <= 0) return null;
  return db.stockMove.create({
    data: {
      date: p.date,
      itemId: p.itemId,
      type: "IN",
      qty: p.qty,
      unitCost: Math.round(p.unitCost ?? 0),
      refType: p.refType,
      refId: p.refId,
      memo: p.memo ?? null,
    },
  });
}

/**
 * Catat barang keluar (penjualan). Harga pokok keluar = rata-rata bergerak
 * saat itu; kalau stok kosong, jatuh ke harga beli terakhir pada master barang.
 * Mengembalikan unitCost yang dipakai + total nilai keluar.
 */
export async function postStockOut(db: Db, p: StockMoveInput) {
  if (p.qty <= 0) return null;

  const ma = await movingAverage(db, p.itemId, p.date);
  let unitCost = ma.avg;

  if (ma.qty <= 0) {
    // Stok tidak ada/minus → pakai harga beli terakhir di master barang
    const item = await db.item.findUnique({ where: { id: p.itemId } });
    unitCost = item?.costPrice ?? 0;
  }

  await db.stockMove.create({
    data: {
      date: p.date,
      itemId: p.itemId,
      type: "OUT",
      qty: p.qty,
      unitCost,
      refType: p.refType,
      refId: p.refId,
      memo: p.memo ?? null,
    },
  });

  return { unitCost, totalCost: unitCost * p.qty };
}

export interface StockSummaryRow {
  itemId: number;
  code: string;
  name: string;
  unit: string;
  type: string;
  qty: number;
  value: number;
  avg: number;
}

/** Ringkasan stok per barang (qty, nilai persediaan, harga pokok rata-rata). */
export async function stockSummary(db: Db): Promise<StockSummaryRow[]> {
  const [items, moves] = await Promise.all([
    db.item.findMany({ orderBy: { code: "asc" } }),
    db.stockMove.findMany({ select: { itemId: true, type: true, qty: true, unitCost: true } }),
  ]);

  const agg = new Map<number, { qty: number; value: number }>();
  for (const m of moves) {
    const cur = agg.get(m.itemId) ?? { qty: 0, value: 0 };
    if (m.type === "IN") {
      cur.qty += m.qty;
      cur.value += m.qty * m.unitCost;
    } else {
      cur.qty -= m.qty;
      cur.value -= m.qty * m.unitCost;
    }
    agg.set(m.itemId, cur);
  }

  return items.map((i) => {
    const a = agg.get(i.id) ?? { qty: 0, value: 0 };
    return {
      itemId: i.id,
      code: i.code,
      name: i.name,
      unit: i.unit,
      type: i.type,
      qty: a.qty,
      value: a.value,
      avg: a.qty > 0 ? Math.round(a.value / a.qty) : 0,
    };
  });
}

export interface StockCardRow {
  id: number;
  date: Date;
  type: string;
  qty: number;
  unitCost: number;
  total: number;
  refType: string;
  refId: number;
  memo: string | null;
  runningQty: number;
  runningValue: number;
}

/** Kartu stok satu barang: mutasi + saldo berjalan (qty & nilai). */
export async function stockCard(db: Db, itemId: number): Promise<StockCardRow[]> {
  const moves = await db.stockMove.findMany({
    where: { itemId },
    orderBy: [{ date: "asc" }, { id: "asc" }],
  });

  let rq = 0;
  let rv = 0;
  return moves.map((m) => {
    const total = m.qty * m.unitCost;
    if (m.type === "IN") {
      rq += m.qty;
      rv += total;
    } else {
      rq -= m.qty;
      rv -= total;
    }
    return {
      id: m.id,
      date: m.date,
      type: m.type,
      qty: m.qty,
      unitCost: m.unitCost,
      total,
      refType: m.refType,
      refId: m.refId,
      memo: m.memo,
      runningQty: rq,
      runningValue: rv,
    };
  });
}
