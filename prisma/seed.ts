import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SeedAccount = {
  code: string;
  name: string;
  type: "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";
  alias?: string;
  isCash?: boolean;
};

// COA umum usaha dagang/jasa Indonesia (disesuaikan kebutuhan, bisa edit di UI)
const ACCOUNTS: SeedAccount[] = [
  // ASET LANCAR
  { code: "1010", name: "Kas", type: "ASSET", alias: "KAS", isCash: true },
  { code: "1020", name: "Bank BCA", type: "ASSET", alias: "BANK", isCash: true },
  { code: "1030", name: "Bank Mandiri", type: "ASSET", isCash: true },
  { code: "1100", name: "Piutang Usaha", type: "ASSET", alias: "AR" },
  { code: "1150", name: "PPN Masukan (Ditahan)", type: "ASSET", alias: "VAT_IN" },
  { code: "1200", name: "Persediaan Barang", type: "ASSET", alias: "INVENTORY" },
  { code: "1300", name: "Uang Muka Pembelian", type: "ASSET" },
  // ASET TETAP
  { code: "1500", name: "Peralatan Kantor", type: "ASSET" },
  { code: "1510", name: "Akumulasi Penyusunan Peralatan", type: "ASSET" },
  // KEWAJIBAN
  { code: "2010", name: "Utang Usaha", type: "LIABILITY", alias: "AP" },
  { code: "2100", name: "Utang Gaji", type: "LIABILITY" },
  { code: "2200", name: "Utang Pajak (PPN)", type: "LIABILITY", alias: "VAT_OUT" },
  { code: "2300", name: "Utang Bank", type: "LIABILITY" },
  // MODAL
  { code: "3010", name: "Modal Usaha", type: "EQUITY" },
  { code: "3100", name: "Laba Ditahan", type: "EQUITY" },
  // PENDAPATAN
  { code: "4010", name: "Penjualan Barang", type: "REVENUE", alias: "SALES" },
  { code: "4020", name: "Pendapatan Jasa", type: "REVENUE" },
  { code: "4900", name: "Pendapatan Lain-lain", type: "REVENUE" },
  // HPP
  { code: "5010", name: "Harga Pokok Penjualan", type: "EXPENSE", alias: "HPP" },
  // BEBAN
  { code: "6010", name: "Beban Gaji", type: "EXPENSE" },
  { code: "6020", name: "Beban Sewa", type: "EXPENSE" },
  { code: "6030", name: "Beban Listrik & Air", type: "EXPENSE" },
  { code: "6040", name: "Beban ATK", type: "EXPENSE" },
  { code: "6050", name: "Beban Internet & Telepon", type: "EXPENSE" },
  { code: "6060", name: "Beban Penyusutan", type: "EXPENSE" },
  { code: "6900", name: "Beban Lain-lain", type: "EXPENSE" },
];

const TAXES = [
  { code: "PPN11", name: "PPN 11%", rate: 0.11, type: "OUTPUT" },
  { code: "PPN12", name: "PPN 12%", rate: 0.12, type: "OUTPUT" },
  { code: "PPNMASUK", name: "PPN Masukan", rate: 0.11, type: "INPUT" },
  { code: "PPH21", name: "PPh 21", rate: 0.05, type: "INPUT" },
  { code: "PPh23", name: "PPh 23", rate: 0.02, type: "INPUT" },
  { code: "NONPAJAK", name: "Non Pajak", rate: 0, type: "NONE" },
];

async function main() {
  console.log("Seeding...");

  await prisma.setting.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

  for (const a of ACCOUNTS) {
    await prisma.account.upsert({
      where: { code: a.code },
      update: { name: a.name, type: a.type, alias: a.alias ?? null, isCash: a.isCash ?? false },
      create: {
        code: a.code,
        name: a.name,
        type: a.type,
        alias: a.alias ?? null,
        isCash: a.isCash ?? false,
      },
    });
  }

  for (const t of TAXES) {
    await prisma.tax.upsert({
      where: { code: t.code },
      update: { name: t.name, rate: t.rate, type: t.type },
      create: { code: t.code, name: t.name, rate: t.rate, type: t.type },
    });
  }

  const custCount = await prisma.partner.count({ where: { type: "CUSTOMER" } });
  if (custCount === 0) {
    await prisma.partner.create({
      data: { type: "CUSTOMER", name: "PT Maju Jaya", email: "finance@majujaya.co.id", termsDays: 30 },
    });
    await prisma.partner.create({
      data: { type: "VENDOR", name: "CV Sumber Mandiri", email: "sales@sumbermandiri.co.id", termsDays: 14 },
    });
  }

  const itemCount = await prisma.item.count();
  if (itemCount === 0) {
    await prisma.item.create({
      data: { code: "SRV-001", name: "Jasa Konsultasi (jam)", type: "SERVICE", unit: "jam", sellPrice: 250000 },
    });
    await prisma.item.create({
      data: { code: "PRD-001", name: "Laptop Bisnis A", type: "PRODUCT", unit: "unit", sellPrice: 12500000, costPrice: 10000000 },
    });
  }

  console.log("Seed selesai.");
  console.log(`  ${ACCOUNTS.length} akun, ${TAXES.length} pajak.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
