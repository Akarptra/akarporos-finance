import { prisma } from "../src/lib/db";
import { postJournal } from "../src/lib/journal";
import { postSalesInvoice, receivePayment } from "../src/lib/posting";

// Data demo: modal, penjualan (PPN), pelunasan sebagian, beli persediaan, bayar sewa.
async function main() {
  const existing = await prisma.journalEntry.count();
  if (existing > 0) {
    console.log("Sudah ada jurnal (" + existing + "). Lewati demo.");
    return;
  }

  const byCode = async (code: string) =>
    prisma.account.findUniqueOrThrow({ where: { code } });
  const kas = await byCode("1020"); // Bank BCA
  const modal = await byCode("3010");
  const persediaan = await byCode("1200");
  const sewa = await byCode("6020");
  const gaji = await byCode("6010");
  const ap = await byCode("2010");

  const cust = await prisma.partner.findFirstOrThrow({ where: { type: "CUSTOMER" } });
  const vend = await prisma.partner.findFirstOrThrow({ where: { type: "VENDOR" } });

  const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);
  const Y = new Date().getFullYear();

  // 1. Setoran modal
  await postJournal(prisma, {
    date: d(Y, 1, 5),
    memo: "Setoran modal pemilik",
    sourceType: "OPENING",
    lines: [
      { accountId: kas.id, debit: 500_000_000, credit: 0, memo: "Modal masuk" },
      { accountId: modal.id, debit: 0, credit: 500_000_000, memo: "Setoran modal" },
    ],
  });

  // 2. Bayar sewa 12 bulan (beban, keluar kas)
  await postJournal(prisma, {
    date: d(Y, 1, 10),
    memo: "Pembayaran sewa kantor",
    sourceType: "EXPENSE",
    lines: [
      { accountId: sewa.id, debit: 60_000_000, credit: 0, memo: "Sewa 12 bulan" },
      { accountId: kas.id, debit: 0, credit: 60_000_000, memo: "Bayar sewa" },
    ],
  });

  // 3. Beli persediaan kredit (utang usaha)
  await postJournal(prisma, {
    date: d(Y, 2, 3),
    memo: "Pembelian persediaan kredit",
    sourceType: "PURCHASE",
    lines: [
      { accountId: persediaan.id, debit: 200_000_000, credit: 0, memo: "Beli barang", partnerId: vend.id },
      { accountId: ap.id, debit: 0, credit: 200_000_000, memo: "Utang usaha", partnerId: vend.id },
    ],
  });

  // 4. Faktur penjualan + PPN 11%
  const inv1 = await postSalesInvoice(prisma, {
    number: "INV-0001",
    date: d(Y, 3, 15),
    dueDate: d(Y, 4, 14),
    partnerId: cust.id,
    memo: "Penjualan laptop",
    lines: [
      { description: "Laptop Bisnis A", qty: 10, price: 12_500_000, discount: 5_000_000, taxRate: 0.11 },
      { description: "Jasa instalasi", qty: 8, price: 250_000, discount: 0, taxRate: 0.11 },
    ],
  });

  // 5. Pelunasan sebagian via Bank BCA
  await receivePayment(prisma, {
    number: "BYR-0001",
    date: d(Y, 4, 1),
    partnerId: cust.id,
    invoiceId: inv1.invoice.id,
    bankAccountId: kas.id,
    amount: 70_000_000,
    memo: "DP pelanggan",
  });

  // 6. Bayar gaji (keluar kas)
  await postJournal(prisma, {
    date: d(Y, 4, 5),
    memo: "Pembayaran gaji karyawan",
    sourceType: "EXPENSE",
    lines: [
      { accountId: gaji.id, debit: 45_000_000, credit: 0, memo: "Gaji April" },
      { accountId: kas.id, debit: 0, credit: 45_000_000, memo: "Bayar gaji" },
    ],
  });

  console.log("Demo data dibuat.");
}

main().finally(() => prisma.$disconnect());
