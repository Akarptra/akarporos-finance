import { prisma } from "../src/lib/db";
import { postPurchaseInvoice, payPayable } from "../src/lib/purchase";
import { buildNeraca, buildArusKas } from "../src/lib/reports";

let fail = 0;
function check(label: string, cond: boolean, detail = "") {
  console.log(`${cond ? "PASS" : "FAIL"}  ${label}${detail ? "  → " + detail : ""}`);
  if (!cond) fail++;
}

const Y = new Date().getFullYear();
const d = (m: number, day: number) => new Date(Y, m - 1, day);

async function main() {
  const vendor = await prisma.partner.findFirstOrThrow({ where: { type: "VENDOR" } });
  const bank = await prisma.account.findFirstOrThrow({ where: { code: "1020" } });
  const item = await prisma.item.findFirstOrThrow({ where: { type: "PRODUCT" } });
  const invAcc = await prisma.account.findFirstOrThrow({ where: { alias: "INVENTORY" } });
  const apAcc = await prisma.account.findFirstOrThrow({ where: { alias: "AP" } });
  const vatIn = await prisma.account.findFirstOrThrow({ where: { alias: "VAT_IN" } });

  check("Alias AP tersedia", apAcc.code === "2010", apAcc.code);
  check("Alias VAT_IN tersedia", vatIn.code === "1150", vatIn.code);

  const number = `FB-TEST-${Date.now()}`;

  // 5 unit @ 10jt, diskon 1jt, PPN 11%
  // net = 50jt - 1jt = 49jt ; pajak = round(49jt * 0.11) = 5.390.000 ; total = 54.390.000
  const { invoice, entry } = await postPurchaseInvoice(prisma, {
    number,
    date: d(5, 10),
    dueDate: d(6, 9),
    partnerId: vendor.id,
    memo: "Pembelian persediaan uji",
    lines: [
      { description: item.name, qty: 5, price: 10_000_000, discount: 1_000_000, taxRate: 0.11, accountId: invAcc.id, itemId: item.id },
    ],
  });

  check("Total faktur benar", invoice.total === 54_390_000, `${invoice.total}`);
  check("Subtotal benar", invoice.subtotal === 50_000_000, `${invoice.subtotal}`);
  check("Diskon benar", invoice.discount === 1_000_000, `${invoice.discount}`);
  check("Pajak benar", invoice.taxAmount === 5_390_000, `${invoice.taxAmount}`);

  // Jurnal seimbang + komposisi benar
  const deb = entry.lines.reduce((s, l) => s + l.debit, 0);
  const cre = entry.lines.reduce((s, l) => s + l.credit, 0);
  check("Jurnal seimbang", deb === cre, `D=${deb} C=${cre}`);

  const byAcc = new Map(entry.lines.map((l) => [l.accountId, l]));
  check("Debit Persediaan 49jt", byAcc.get(invAcc.id)?.debit === 49_000_000);
  check("Debit PPN Masukan 5,39jt", byAcc.get(vatIn.id)?.debit === 5_390_000);
  check("Kredit Utang 54,39jt", byAcc.get(apAcc.id)?.credit === 54_390_000);

  // Bayar sebagian 20jt dari Bank BCA
  const pay = await payPayable(prisma, {
    number: `BYR-TEST-${Date.now()}`,
    date: d(5, 15),
    partnerId: vendor.id,
    invoiceId: invoice.id,
    bankAccountId: bank.id,
    amount: 20_000_000,
  });

  const after = await prisma.invoice.findUniqueOrThrow({ where: { id: invoice.id } });
  check("paid terupdate", after.paid === 20_000_000, `${after.paid}`);
  check("status PARTIAL", after.status === "PARTIAL", after.status);

  // Saldo Utang Usaha = total AP kredit - debit
  const apSum = await prisma.journalLine.aggregate({
    _sum: { debit: true, credit: true },
    where: { accountId: apAcc.id },
  });
  const apBalance = (apSum._sum.credit ?? 0) - (apSum._sum.debit ?? 0);
  const expectedAp = 54_390_000 - 20_000_000;
  check("Saldo Utang = sisa tagihan", apBalance === expectedAp, `ap=${apBalance} expected=${expectedAp}`);

  // Payment OUT tercatat + arah jurnal benar (debit AP, credit kas)
  const payEntry = pay.entry;
  const peDebit = payEntry.lines.find((l) => l.accountId === apAcc.id);
  const peCredit = payEntry.lines.find((l) => l.accountId === bank.id);
  check("PAYMENT_OUT: debit AP", peDebit?.debit === 20_000_000);
  check("PAYMENT_OUT: credit kas", peCredit?.credit === 20_000_000);

  // Neraca tetap seimbang setelah transaksi pembelian
  const ner = await buildNeraca(d(12, 31));
  check("Neraca masih seimbang", ner.seimbang, `aset=${ner.totalAset} kwj=${ner.totalKewajiban} modal=${ner.totalModal} laba=${ner.laba}`);

  // Arus kas: pembelian kredit tidak gerak kas; pelunasan = kas keluar operasi
  const ak = await buildArusKas(d(1, 1), d(12, 31));
  check("ArusKas: awal + masuk - keluar = akhir", ak.kasAwal + ak.totalMasuk - ak.totalKeluar === ak.kasAkhir);
  check(
    "ArusKas: kas keluar mencakup pelunasan 20jt",
    ak.totalKeluar >= 20_000_000,
    `keluar=${ak.totalKeluar}`
  );
  check("ArusKas: kategori operasi keluar ≥ 20jt", ak.perKategori.OPERASI.keluar >= 20_000_000);

  console.log(fail === 0 ? "\nSEMUA LULUS ✓" : `\n${fail} GAGAL ✗`);
  if (fail > 0) process.exitCode = 1;
  console.log(`Faktur uji: ${number} (id ${invoice.id})`);

  // Bersihkan semua data uji (termasuk sisa run sebelumnya)
  await cleanupTest();
  console.log("Data uji dibersihkan.");
}

async function cleanupTest() {
  const testInvoices = await prisma.invoice.findMany({
    where: { number: { startsWith: "FB-TEST-" } },
    select: { id: true, journalEntryId: true },
  });
  const entryIds = testInvoices.map((i) => i.journalEntryId).filter((x): x is number => x !== null);
  const payments = await prisma.payment.findMany({
    where: { invoiceId: { in: testInvoices.map((i) => i.id) } },
    select: { id: true, journalEntryId: true },
  });
  entryIds.push(...payments.map((p) => p.journalEntryId).filter((x): x is number => x !== null));

  await prisma.payment.deleteMany({ where: { id: { in: payments.map((p) => p.id) } } });
  await prisma.invoice.deleteMany({ where: { id: { in: testInvoices.map((i) => i.id) } } });
  await prisma.journalLine.deleteMany({ where: { entryId: { in: entryIds } } });
  await prisma.journalEntry.deleteMany({ where: { id: { in: entryIds } } });
  // nomor bayar uji tidak terikat invoice juga harus ikut hilang
  await prisma.journalEntry.deleteMany({ where: { reference: { startsWith: "BYR-TEST-" } } });
}

main().finally(() => prisma.$disconnect());
