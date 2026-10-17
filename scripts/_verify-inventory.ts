import { prisma } from "../src/lib/db";
import { postPurchaseInvoice } from "../src/lib/purchase";
import { postSalesInvoice } from "../src/lib/posting";
import { recordExpense, recordReceipt, transferCash } from "../src/lib/cash";
import { stockSummary, stockCard, movingAverage } from "../src/lib/inventory";
import { buildNeraca, buildLabaRugi, buildArusKas, buildPiutang, buildPajak } from "../src/lib/reports";

let fail = 0;
function check(label: string, cond: boolean, detail = "") {
  console.log(`${cond ? "PASS" : "FAIL"}  ${label}${detail ? "  → " + detail : ""}`);
  if (!cond) fail++;
}

const Y = new Date().getFullYear();
const d = (m: number, day: number) => new Date(Y, m - 1, day);

const createdInvoices: number[] = [];
const createdEntries: number[] = [];
let testItemId = 0;

async function main() {
  const vendor = await prisma.partner.findFirstOrThrow({ where: { type: "VENDOR" } });
  const customer = await prisma.partner.findFirstOrThrow({ where: { type: "CUSTOMER" } });
  const bank = await prisma.account.findFirstOrThrow({ where: { code: "1020" } });
  const kas = await prisma.account.findFirstOrThrow({ where: { code: "1010" } });
  const sewa = await prisma.account.findFirstOrThrow({ where: { code: "6020" } });
  const lain = await prisma.account.findFirstOrThrow({ where: { code: "4900" } });
  const invAcc = await prisma.account.findFirstOrThrow({ where: { alias: "INVENTORY" } });
  const hppAcc = await prisma.account.findFirstOrThrow({ where: { alias: "HPP" } });

  const item = await prisma.item.create({
    data: { code: `TST-${Date.now()}`, name: "Barang Uji Stok", type: "PRODUCT", unit: "unit", costPrice: 0, sellPrice: 0 },
  });
  testItemId = item.id;

  /* ---------- 1. Rata-rata bergerak ---------- */
  const p1 = await postPurchaseInvoice(prisma, {
    number: `FB-1-${Date.now()}`, date: d(1, 5), dueDate: d(2, 4), partnerId: vendor.id,
    lines: [{ description: "Beli batch 1", qty: 10, price: 10_000_000, discount: 0, taxRate: 0, accountId: invAcc.id, itemId: item.id }],
  });
  createdInvoices.push(p1.invoice.id); createdEntries.push(p1.entry.id);

  const p2 = await postPurchaseInvoice(prisma, {
    number: `FB-2-${Date.now()}`, date: d(2, 5), dueDate: d(3, 5), partnerId: vendor.id,
    lines: [{ description: "Beli batch 2", qty: 10, price: 12_000_000, discount: 0, taxRate: 0.11, accountId: invAcc.id, itemId: item.id }],
  });
  createdInvoices.push(p2.invoice.id); createdEntries.push(p2.entry.id);

  check("Batch1 total 100jt", p1.invoice.total === 100_000_000, `${p1.invoice.total}`);
  check("Batch2 total 133,2jt (PPN 11%)", p2.invoice.total === 133_200_000, `${p2.invoice.total}`);
  check("Batch2 pajak 13,2jt", p2.invoice.taxAmount === 13_200_000, `${p2.invoice.taxAmount}`);

  const ma2 = await movingAverage(prisma, item.id, d(2, 28));
  check("Rata-rata bergerak = 11jt", ma2.avg === 11_000_000, `qty=${ma2.qty} avg=${ma2.avg}`);
  check("Stok setelah beli = 20", ma2.qty === 20, `${ma2.qty}`);

  /* ---------- 2. Penjualan → HPP + barang keluar ---------- */
  const s1 = await postSalesInvoice(prisma, {
    number: `FJ-1-${Date.now()}`, date: d(3, 10), dueDate: d(1, 1), partnerId: customer.id,
    lines: [{ description: "Jual 8 unit", qty: 8, price: 15_000_000, discount: 0, taxRate: 0, itemId: item.id }],
  });
  createdInvoices.push(s1.invoice.id); createdEntries.push(s1.entry.id);

  const sLines = new Map(s1.entry.lines.map((l) => [l.accountId, l]));
  check("Penjualan kredit 120jt", sLines.get((await prisma.account.findFirstOrThrow({ where: { alias: "SALES" } })).id)?.credit === 120_000_000);
  check("HPP debit 88jt (8 × 11jt)", sLines.get(hppAcc.id)?.debit === 88_000_000, `${sLines.get(hppAcc.id)?.debit}`);
  check("Persediaan kredit 88jt", sLines.get(invAcc.id)?.credit === 88_000_000);
  check("Jurnal jual seimbang",
    s1.entry.lines.reduce((a, l) => a + l.debit, 0) === s1.entry.lines.reduce((a, l) => a + l.credit, 0));

  const sum = (await stockSummary(prisma)).find((r) => r.itemId === item.id)!;
  check("Stok sisa 12 unit", sum.qty === 12, `${sum.qty}`);
  check("Nilai persediaan 132jt", sum.value === 132_000_000, `${sum.value}`);
  check("HPP rata-rata 11jt", sum.avg === 11_000_000, `${sum.avg}`);

  const card = await stockCard(prisma, item.id);
  check("Kartu stok 3 baris", card.length === 3, `${card.length}`);
  check("Saldo berjalan kartu stok 12", card[card.length - 1].runningQty === 12);
  check("Saldo nilai kartu stok 132jt", card[card.length - 1].runningValue === 132_000_000);

  /* ---------- 3. Laporan ---------- */
  const lr = await buildLabaRugi(d(1, 1), d(12, 31));
  check("LabaRugi: HPP 88jt tercatat", lr.beban.some((b) => b.code === "5010" && b.balance === 88_000_000),
    JSON.stringify(lr.beban.filter((b) => b.code === "5010")));

  const ner = await buildNeraca(d(12, 31));
  check("Neraca seimbang", ner.seimbang, `aset=${ner.totalAset} kwj=${ner.totalKewajiban} modal=${ner.totalModal} laba=${ner.laba}`);

  /* ---------- 4. Kas & Bank ---------- */
  // Catat saldo berantai: tiap transaksi diukur langsung setelah posting
  const s0 = await bal(bank.id);
  const k0 = await bal(kas.id);

  const e1 = await recordExpense(prisma, {
    number: `KLR-${Date.now()}`, date: d(4, 5), cashAccountId: bank.id, expenseAccountId: sewa.id, amount: 5_000_000, memo: "Sewa uji",
  });
  createdEntries.push(e1.entry.id);
  const s1b = await bal(bank.id);
  check("Expense: bank −5jt", s1b === s0 - 5_000_000, `${s0} → ${s1b}`);

  const r1 = await recordReceipt(prisma, {
    number: `MSK-${Date.now()}`, date: d(4, 6), cashAccountId: bank.id, revenueAccountId: lain.id, amount: 3_000_000, memo: "Pendapatan uji",
  });
  createdEntries.push(r1.entry.id);
  const s2b = await bal(bank.id);
  check("Receipt: bank +3jt", s2b === s1b + 3_000_000, `${s1b} → ${s2b}`);

  const t1 = await transferCash(prisma, {
    number: `MTS-${Date.now()}`, date: d(4, 7), fromAccountId: bank.id, toAccountId: kas.id, amount: 2_000_000,
  });
  createdEntries.push(t1.entry.id);
  check("Transfer: kas +2jt", (await bal(kas.id)) === k0 + 2_000_000, `${k0} → ${await bal(kas.id)}`);
  check("Transfer: bank −2jt", (await bal(bank.id)) === s2b - 2_000_000, `${s2b} → ${await bal(bank.id)}`);

  // Total kas = jumlah semua akun kas. Termasuk penerimaan faktur user (11,1jt)
  // sejak awal tahun, jadi perubahan = 11,1jt − 5jt + 3jt = 9,1jt.
  const expectedChange = 11_100_000 - 5_000_000 + 3_000_000;
  const ak = await buildArusKas(d(1, 1), d(12, 31));
  check("ArusKas: awal+masuk−keluar=akhir", ak.kasAwal + ak.totalMasuk - ak.totalKeluar === ak.kasAkhir);
  check("ArusKas: perubahan kas benar", ak.perubahan === expectedChange, `${ak.perubahan} vs ${expectedChange}`);
  check("ArusKas: mutasi tidak mengubah total kas", ak.totalMasuk - ak.totalKeluar === ak.perubahan);
  check("ArusKas: beban masuk operasi", ak.perKategori.OPERASI.keluar >= 5_000_000, `${ak.perKategori.OPERASI.keluar}`);

  /* ---------- 5. Piutang (aging) ---------- */
  const pi = await buildPiutang(new Date(Y, 11, 31));
  check("Piutang memuat faktur jual belum bayar", pi.rows.some((x) => x.partnerId === customer.id && x.total > 0),
    JSON.stringify(pi.rows));
  check("Piutang jatuh tempo >90 hari", pi.totalH4 > 0, `${pi.totalH4}`);
  check("Piutang: total = jumlah bucket",
    pi.total === pi.totalBelum + pi.totalH1 + pi.totalH2 + pi.totalH3 + pi.totalH4);

  /* ---------- 6. Pajak ---------- */
  const paj = await buildPajak(d(1, 1), d(12, 31));
  check("PPN masukan ≥ 13,2jt", paj.ppnMasukan >= 13_200_000, `${paj.ppnMasukan}`);
  check("PPN keluaran ≥ 1,1jt (faktur user)", paj.ppnKeluaran >= 1_100_000, `${paj.ppnKeluaran}`);
  check("Sisa pajak = keluaran − masukan", paj.sisaPajak === paj.ppnKeluaran - paj.ppnMasukan);

  /* ---------- 7. Neraca tetap seimbang ---------- */
  const ner2 = await buildNeraca(d(12, 31));
  check("Neraca tetap seimbang setelah semua", ner2.seimbang);

  console.log(fail === 0 ? "\nSEMUA LULUS ✓" : `\n${fail} GAGAL ✗`);
  if (fail > 0) process.exitCode = 1;

  await cleanup();
  console.log("Data uji dibersihkan.");
}

async function bal(id: number): Promise<number> {
  const s = await prisma.journalLine.aggregate({ _sum: { debit: true, credit: true }, where: { accountId: id } });
  return (s._sum.debit ?? 0) - (s._sum.credit ?? 0);
}

async function cleanup() {
  await prisma.invoice.deleteMany({ where: { id: { in: createdInvoices } } });
  await prisma.stockMove.deleteMany({ where: { itemId: testItemId } });
  await prisma.journalLine.deleteMany({ where: { entryId: { in: createdEntries } } });
  await prisma.journalEntry.deleteMany({ where: { id: { in: createdEntries } } });
  await prisma.item.delete({ where: { id: testItemId } });
}

main().finally(() => prisma.$disconnect());
