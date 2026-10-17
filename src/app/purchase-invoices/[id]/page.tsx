import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatRp, formatTanggal } from "@/lib/format";
import { PayForm } from "./pay-form";

export const dynamic = "force-dynamic";

export default async function PurchaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoiceId = Number(id);
  if (isNaN(invoiceId)) notFound();

  const [invoice, cashAccounts] = await Promise.all([
    prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        partner: true,
        lines: { include: { item: true } },
        payments: { orderBy: { date: "desc" } },
        journalEntry: { include: { lines: { include: { account: true } } } },
      },
    }),
    prisma.account.findMany({ where: { isCash: true }, orderBy: { code: "asc" } }),
  ]);

  if (!invoice || invoice.type !== "PURCHASE") notFound();

  const cashSums = await prisma.journalLine.groupBy({
    by: ["accountId"],
    _sum: { debit: true, credit: true },
    where: { accountId: { in: cashAccounts.map((a) => a.id) } },
  });
  const balances: Record<number, number> = {};
  for (const s of cashSums) {
    balances[s.accountId] = (s._sum.debit ?? 0) - (s._sum.credit ?? 0);
  }

  const remaining = invoice.total - invoice.paid;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{invoice.number}</h1>
          <p className="text-sm text-slate-500">
            {invoice.partner.name} · {formatTanggal(invoice.date)} · Jatuh tempo{" "}
            {formatTanggal(invoice.dueDate)}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            invoice.status === "PAID"
              ? "bg-emerald-100 text-emerald-700"
              : invoice.status === "PARTIAL"
              ? "bg-amber-100 text-amber-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {invoice.status}
        </span>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="th">Deskripsi</th>
              <th className="th text-right">Qty</th>
              <th className="th text-right">Harga</th>
              <th className="th text-right">Diskon</th>
              <th className="th text-right">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lines.map((l) => (
              <tr key={l.id} className="border-b border-slate-100">
                <td className="td">
                  {l.description}
                  {l.item && (
                    <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-500">
                      {l.item.code}
                    </span>
                  )}
                </td>
                <td className="td text-right">{l.qty}</td>
                <td className="td text-right">{formatRp(l.price)}</td>
                <td className="td text-right">{formatRp(l.discount)}</td>
                <td className="td text-right">{formatRp(l.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-200">
              <td colSpan={4} className="td text-right text-slate-500">
                Subtotal
              </td>
              <td className="td text-right">{formatRp(invoice.subtotal)}</td>
            </tr>
            <tr>
              <td colSpan={4} className="td text-right text-slate-500">
                Diskon
              </td>
              <td className="td text-right">{formatRp(invoice.discount)}</td>
            </tr>
            <tr>
              <td colSpan={4} className="td text-right text-slate-500">
                PPN Masukan
              </td>
              <td className="td text-right">{formatRp(invoice.taxAmount)}</td>
            </tr>
            <tr className="font-semibold">
              <td colSpan={4} className="td text-right">
                Grand Total
              </td>
              <td className="td text-right">{formatRp(invoice.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card">
          <h2 className="mb-3 font-semibold">Jurnal Otomatis</h2>
          {invoice.journalEntry ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="th">Akun</th>
                  <th className="th text-right">Debit</th>
                  <th className="th text-right">Kredit</th>
                </tr>
              </thead>
              <tbody>
                {invoice.journalEntry.lines.map((l) => (
                  <tr key={l.id} className="border-b border-slate-100">
                    <td className="td">{l.account.name}</td>
                    <td className="td text-right">{l.debit ? formatRp(l.debit) : "-"}</td>
                    <td className="td text-right">{l.credit ? formatRp(l.credit) : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-slate-400">Belum ada jurnal.</p>
          )}
        </div>

        <div className="card">
          <h2 className="mb-3 font-semibold">Pembayaran Utang</h2>
          <p className="mb-3 text-sm text-slate-500">
            Sisa utang: <span className="font-semibold text-slate-800">{formatRp(remaining)}</span>
          </p>

          {remaining > 0 && cashAccounts.length > 0 && (
            <PayForm
              invoiceId={invoice.id}
              remaining={remaining}
              cashAccounts={cashAccounts}
              balances={balances}
            />
          )}

          {remaining <= 0 && invoice.total > 0 && (
            <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
              Utang sudah lunas.
            </p>
          )}

          {invoice.payments.length > 0 && (
            <table className="mt-4 w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="th">No.</th>
                  <th className="th">Tanggal</th>
                  <th className="th text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {invoice.payments.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100">
                    <td className="td">{p.number}</td>
                    <td className="td">{formatTanggal(p.date)}</td>
                    <td className="td text-right">{formatRp(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {cashAccounts.length === 0 && (
            <p className="text-sm text-amber-600">
              Set dulu minimal satu akun Kas/Bank (centang isCash) di menu Akun untuk membayar utang.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
