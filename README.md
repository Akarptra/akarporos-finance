# MyLedger — Akar Poros Finance

Sistem akuntansi, pembukuan, stok perpetual, dan laporan keuangan komprehensif (Neraca, Laba Rugi, Arus Kas, Buku Besar, Utang/Piutang, Pajak PPN/PPh).

## Tech Stack
- Next.js 15 (App Router, Server Actions)
- TypeScript + Tailwind CSS
- Prisma ORM + SQLite (dev/serverless tmp)

## Fitur
- **Dashboard & Setting**: Setup perusahaan, NPWP, tahun buku fiskal
- **Chart of Accounts (COA)**: Standar akuntansi Indonesia (Aset, Kewajiban, Modal, Pendapatan, HPP, Beban)
- **Faktur Penjualan & Pembelian**: Multi-line item, kalkulasi PPN otomatis, status draft/posted/paid
- **Kas & Bank**: Penerimaan, pengeluaran, transfer antar bank/kas
- **Stok & Inventory Perpetual**: Kartu stok bergerak, tracking moving average cost
- **Laporan Lengkap**:
  - Neraca (Balance Sheet)
  - Laba Rugi (Income Statement)
  - Arus Kas (Cash Flow)
  - Buku Besar (General Ledger)
  - Kartu Utang & Piutang (Aging)
  - Rekapitulasi Pajak Masukan & Keluaran
