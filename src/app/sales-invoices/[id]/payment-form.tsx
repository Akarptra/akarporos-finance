"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { receivePaymentAction } from "@/lib/actions";
import { formatRp } from "@/lib/format";

interface Bank {
  id: number;
  code: string;
  name: string;
  alias: string | null;
}

export function PaymentForm({
  invoiceId,
  remaining,
  banks,
}: {
  invoiceId: number;
  remaining: number;
  banks: Bank[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().slice(0, 10);
  const prefix = "BYR-";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const fd = new FormData(e.target as HTMLFormElement);
    fd.set("invoiceId", String(invoiceId));
    const res = await receivePaymentAction(fd);
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
          <input name="number" className="input" defaultValue={`${prefix}${Date.now().toString().slice(-6)}`} required />
        </div>
        <div>
          <label className="label">Tanggal</label>
          <input name="date" type="date" className="input" defaultValue={today} required />
        </div>
        <div>
          <label className="label">Jumlah</label>
          <input name="amount" type="number" className="input" defaultValue={remaining} min={1} required />
        </div>
        <div>
          <label className="label">Ke Akun</label>
          <select name="accountId" className="input" defaultValue={banks[0]?.id}>
            {banks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}

      <button type="submit" className="btn" disabled={saving}>
        {saving ? "Menyimpan..." : `Terima ${formatRp(remaining)}`}
      </button>
    </form>
  );
}
