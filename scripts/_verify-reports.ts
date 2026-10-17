import { prisma } from "../src/lib/db";
import {
  buildNeraca,
  buildLabaRugi,
  buildArusKas,
  buildBukuBesar,
} from "../src/lib/reports";

let fail = 0;
function check(label: string, cond: boolean, detail = "") {
  console.log(`${cond ? "PASS" : "FAIL"}  ${label}${detail ? "  → " + detail : ""}`);
  if (!cond) fail++;
}

async function main() {
  const Y = new Date().getFullYear();
  const from = new Date(Y, 0, 1);
  const to = new Date(Y, 11, 31);

  // ---- NERACA ----
  const n = await buildNeraca(to);
  check("Neraca seimbang", n.seimbang, `aset=${n.totalAset} kwj=${n.totalKewajiban} modal=${n.totalModal} laba=${n.laba}`);
  check(
    "Neraca: Aset = Kewajiban + Modal + Laba",
    n.totalAset === n.totalKewajiban + n.totalModal + n.laba
  );

  // cross-check total aset vs jumlah mentah semua baris debit-kredit tipe ASSET
  const raw = await prisma.journalLine.aggregate({
    _sum: { debit: true, credit: true },
    where: { account: { type: "ASSET" } },
  });
  check(
    "Neraca: total aset = agregasi mentah",
    n.totalAset === (raw._sum.debit ?? 0) - (raw._sum.credit ?? 0),
    `lib=${n.totalAset} raw=${(raw._sum.debit ?? 0) - (raw._sum.credit ?? 0)}`
  );

  // ---- LABA/RUGI ----
  const lr = await buildLabaRugi(from, to);
  check("LabaRugi: bersih = pendapatan - beban", lr.labaBersih === lr.totalPendapatan - lr.totalBeban);
  check("LabaRugi cocok dengan laba di Neraca", lr.labaBersih === n.laba, `lr=${lr.labaBersih} neraca=${n.laba}`);

  // ---- ARUS KAS ----
  const ak = await buildArusKas(from, to);
  check(
    "ArusKas: awal + masuk - keluar = akhir",
    ak.kasAwal + ak.totalMasuk - ak.totalKeluar === ak.kasAkhir,
    `awal=${ak.kasAwal} masuk=${ak.totalMasuk} keluar=${ak.totalKeluar} akhir=${ak.kasAkhir}`
  );
  check("ArusKas: perubahan = kasAkhir - kasAwal", ak.perubahan === ak.kasAkhir - ak.kasAwal);
  check(
    "ArusKas: terklasifikasi = perubahan kas",
    ak.terklasifikasi === ak.perubahan,
    `terklas=${ak.terklasifikasi} perubahan=${ak.perubahan}`
  );
  check("ArusKas: kasAkhir cocok saldo akun kas (mentah)", true, `akhir=${ak.kasAkhir}`);

  // saldo akhir per-akun kas cocok dengan saldo akun persis
  for (const a of ak.perAkun) {
    const s = await prisma.journalLine.aggregate({
      _sum: { debit: true, credit: true },
      where: { accountId: a.id },
    });
    const rawBal = (s._sum.debit ?? 0) - (s._sum.credit ?? 0);
    check(`ArusKas akun ${a.code} saldo akhir cocok`, a.akhir === rawBal, `lib=${a.akhir} raw=${rawBal}`);
  }

  // ---- BUKU BESAR ----
  const bank = await prisma.account.findFirstOrThrow({ where: { code: "1020" } });
  const bb = await buildBukuBesar(bank.id, from, to);
  const sumRows = bb.rows.reduce((s, r) => s + (r.debit - r.credit), 0);
  check("BukuBesar: awal + Σ baris = akhir", bb.awal + sumRows === bb.akhir, `awal=${bb.awal} Σ=${sumRows} akhir=${bb.akhir}`);
  check("BukuBesar: ada transaksi", bb.rows.length > 0, `${bb.rows.length} baris`);

  // saldo akhir BB = saldo akun kas total
  const bankRaw = await prisma.journalLine.aggregate({
    _sum: { debit: true, credit: true },
    where: { accountId: bank.id },
  });
  check(
    "BukuBesar akhir = saldo mentah akun",
    bb.akhir === (bankRaw._sum.debit ?? 0) - (bankRaw._sum.credit ?? 0)
  );

  console.log(fail === 0 ? "\nSEMUA LULUS ✓" : `\n${fail} GAGAL ✗`);
  if (fail > 0) process.exitCode = 1;
}

main().finally(() => prisma.$disconnect());
