"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { payPayableAction } from "@/lib/purchase-actions";
import { formatRp } from "@/lib/format";

interface CashAccount {
  id: number;
  code: string;
  name: string;
}

export function PayForm({
  invoiceId,
  remaining,
  cashAccounts,
  balances,
}: {
  invoiceId: number;
  remaining: number;
  cashAccounts: CashAccount[];
  balances: Record<number, number>;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<number>(cashAccounts[0]?.id ?? 0);
  const [amount, setAmount] = useState<number>(remaining);
  const [allowOverdraw, setAllowOverdraw] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const prefix = "BYR-";
  const saldo = balances[accountId] ?? 0;
  const willOverdraw = saldo - amount < 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const fd = new FormData(e.target as HTMLFormElement);
    fd.set("invoiceId", String(invoiceId));
    if (allowOverdraw) fd.set("allowOverdraw", "1");
    const res = await payPayableAction(fd);
    setSaving(false);
    if (res.ok) {
      router.refresh();
    } else {
      setError(res.error ?? "Gagal menyimpan pembayaran.");
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-lg border border-slate-200 p-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Nomor Bayar</label>
          <input
            name="number"
            className="input"
            defaultValue={`${prefix}${Date.now().toString().slice(-6)}`}
            required
          />
        </div>
        <div>
          <label className="label">Tanggal</label>
          <input name="date" type="date" className="input" defaultValue={today} required />
        </div>
        <div>
          <label className="label">Jumlah</label>
          <input
            name="amount"
            type="number"
            className="input"
            value={amount}
            min={1}
            onChange={(e) => setAmount(Number(e.target.value || 0))}
            required
          />
        </div>
        <div>
          <label className="label">Dari Akun</label>
          <select
            name="accountId"
            className="input"
            value={accountId}
            onChange={(e) => setAccountId(Number(e.target.value))}
          >
            {cashAccounts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Saldo akun terpilih: <span className="font-medium text-slate-700">{formatRp(saldo)}</span>
        {willOverdraw && (
          <span className="ml-1 font-medium text-amber-600">
            → sisa {formatRp(saldo - amount)} (negatif)
          </span>
        )}
      </p>

      {willOverdraw && (
        <label className="flex items-start gap-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-800">
          <input
            type="checkbox"
            className="mt-0.5 h-3.5 w-3.5"
            checked={allowOverdraw}
            onChange={(e) => setAllowOverdraw(e.target.checked)}
          />
          <span>
            Saldo tidak cukup. Centang untuk tetap membayar dan membuat saldo akun menjadi negatif.
          </span>
        </label>
      )}

      {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}

      <button type="submit" className="btn" disabled={saving}>
        {saving ? "Menyimpan..." : `Bayar ${formatRp(amount)}`}
      </button>
    </form>
  );
}
