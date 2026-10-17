import { prisma } from "@/lib/db";
import { cashAccounts, cashTransactions } from "@/lib/cash";
import { formatRp, formatTanggal } from "@/lib/format";
import { CashForms } from "./cash-forms";

export const dynamic = "force-dynamic";

const SOURCE_LABEL: Record<string, string> = {
  SALES_INVOICE: "Faktur Jual",
  PURCHASE_INVOICE: "Faktur Beli",
  PAYMENT_IN: "Penerimaan Piutang",
  PAYMENT_OUT: "Pembayaran Utang",
  CASH_EXPENSE: "Pengeluaran Kas",
  CASH_RECEIPT: "Penerimaan Kas",
  CASH_TRANSFER: "Mutasi Kas",
  OPENING: "Modal",
  MANUAL: "Jurnal Manual",
};

export default async function CashPage() {
  const [accounts, expenseAccounts, revenueAccounts, partners] = await Promise.all([
    cashAccounts(prisma),
    prisma.account.findMany({
      where: { type: "EXPENSE", isGroup: false },
      orderBy: { code: "asc" },
      select: { id: true, code: true, name: true },
    }),
    prisma.account.findMany({
      where: { type: "REVENUE", isGroup: false },
      orderBy: { code: "asc" },
      select: { id: true, code: true, name: true },
    }),
    prisma.partner.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  const txns = await cashTransactions(
    prisma,
    accounts.map((a) => a.id)
  );

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kas &amp; Bank</h1>
          <p className="text-sm text-slate-500">
            Pengeluaran beban, penerimaan tunai, dan mutasi antar akun kas.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Total Saldo</p>
          <p className="text-xl font-bold text-brand-700">{formatRp(totalBalance)}</p>
        </div>
      </div>

      {/* Saldo per akun kas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {accounts.length === 0 && (
          <div className="card col-span-full text-sm text-amber-600">
            Belum ada akun kas/bank. Set dulu di menu Akun (centang isCash).
          </div>
        )}
        {accounts.map((a) => (
          <div key={a.id} className="card">
            <p className="text-xs text-slate-500">
              <span className="mr-2 font-mono">{a.code}</span>
              {a.name}
            </p>
            <p className={`mt-1 text-xl font-bold ${a.balance < 0 ? "text-red-600" : "text-slate-900"}`}>
              {formatRp(a.balance)}
            </p>
          </div>
        ))}
      </div>

      {/* Form transaksi kas */}
      {accounts.length > 0 && (
        <CashForms
          cashAccounts={accounts.map((a) => ({ id: a.id, name: a.name, balance: a.balance }))}
          expenseAccounts={expenseAccounts.map((a) => ({ id: a.id, label: `${a.code} · ${a.name}` }))}
          revenueAccounts={revenueAccounts.map((a) => ({ id: a.id, label: `${a.code} · ${a.name}` }))}
          partners={partners.map((p) => ({ id: p.id, name: p.name }))}
        />
      )}

      {/* Mutasi */}
      <div className="card overflow-x-auto p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="th">Tanggal</th>
              <th className="th">Jenis</th>
              <th className="th">Keterangan</th>
              <th className="th text-right">Masuk</th>
              <th className="th text-right">Keluar</th>
            </tr>
          </thead>
          <tbody>
            {txns.length === 0 && (
              <tr>
                <td className="td py-8 text-center text-slate-400" colSpan={5}>
                  Belum ada mutasi kas.
                </td>
              </tr>
            )}
            {txns.map((t) => (
              <tr key={t.id} className="border-b border-slate-100">
                <td className="td whitespace-nowrap">{formatTanggal(t.date)}</td>
                <td className="td text-xs text-slate-500">{SOURCE_LABEL[t.sourceType] ?? t.sourceType}</td>
                <td className="td">{t.memo}</td>
                <td className="td text-right text-emerald-600 tabular-nums">
                  {t.masuk ? formatRp(t.masuk) : "-"}
                </td>
                <td className="td text-right text-red-600 tabular-nums">
                  {t.keluar ? formatRp(t.keluar) : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
