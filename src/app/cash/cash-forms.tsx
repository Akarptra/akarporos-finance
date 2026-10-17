"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  recordExpenseAction,
  recordReceiptAction,
  transferCashAction,
} from "@/lib/cash-actions";
import { formatRp } from "@/lib/format";

interface CashAcc {
  id: number;
  name: string;
  balance: number;
}
interface Opt {
  id: number;
  label: string;
}
interface PartnerOpt {
  id: number;
  name: string;
}

type Tab = "pengeluaran" | "penerimaan" | "mutasi";

const TABS: { key: Tab; label: string }[] = [
  { key: "pengeluaran", label: "Pengeluaran (Beban)" },
  { key: "penerimaan", label: "Penerimaan (Pendapatan)" },
  { key: "mutasi", label: "Mutasi Antar Kas" },
];

function stamp(prefix: string) {
  return `${prefix}${Date.now().toString().slice(-6)}`;
}

export function CashForms({
  cashAccounts,
  expenseAccounts,
  revenueAccounts,
  partners,
}: {
  cashAccounts: CashAcc[];
  expenseAccounts: Opt[];
  revenueAccounts: Opt[];
  partners: PartnerOpt[];
}) {
  const [tab, setTab] = useState<Tab>("pengeluaran");

  return (
    <div className="card space-y-4">
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              tab === t.key
                ? "bg-brand-600 text-white"
                : "border border-slate-300 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "pengeluaran" && (
        <ExpenseForm cashAccounts={cashAccounts} expenseAccounts={expenseAccounts} partners={partners} />
      )}
      {tab === "penerimaan" && (
        <ReceiptForm cashAccounts={cashAccounts} revenueAccounts={revenueAccounts} partners={partners} />
      )}
      {tab === "mutasi" && <TransferForm cashAccounts={cashAccounts} />}
    </div>
  );
}

/* ---------- Pengeluaran ---------- */

function ExpenseForm({
  cashAccounts,
  expenseAccounts,
  partners,
}: {
  cashAccounts: CashAcc[];
  expenseAccounts: Opt[];
  partners: PartnerOpt[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accId, setAccId] = useState(cashAccounts[0]?.id ?? 0);
  const [amount, setAmount] = useState(0);
  const [allowOverdraw, setAllowOverdraw] = useState(false);

  const saldo = cashAccounts.find((a) => a.id === accId)?.balance ?? 0;
  const willOverdraw = saldo - amount < 0;
  const today = new Date().toISOString().slice(0, 10);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const fd = new FormData(e.target as HTMLFormElement);
    if (allowOverdraw) fd.set("allowOverdraw", "1");
    const res = await recordExpenseAction(fd);
    setSaving(false);
    if (res.ok) {
      router.refresh();
      setAmount(0);
      setAllowOverdraw(false);
    } else setError(res.error ?? "Gagal menyimpan.");
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label className="label">Nomor</label>
          <input name="number" className="input" defaultValue={stamp("KLR")} required />
        </div>
        <div>
          <label className="label">Tanggal</label>
          <input name="date" type="date" className="input" defaultValue={today} required />
        </div>
        <div>
          <label className="label">Dari Kas/Bank</label>
          <select name="cashAccountId" className="input" value={accId} onChange={(e) => setAccId(Number(e.target.value))}>
            {cashAccounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Akun Beban</label>
          <select name="expenseAccountId" className="input" required>
            {expenseAccounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Jumlah</label>
          <input
            name="amount"
            type="number"
            min={1}
            className="input"
            value={amount || ""}
            onChange={(e) => setAmount(Number(e.target.value || 0))}
            required
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Keterangan</label>
          <input name="memo" className="input" placeholder="mis. Bayar listrik bulan ini" />
        </div>
        <div>
          <label className="label">Mitra (opsional)</label>
          <select name="partnerId" className="input" defaultValue="">
            <option value="">—</option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Saldo {cashAccounts.find((a) => a.id === accId)?.name}: {formatRp(saldo)}
        {willOverdraw && (
          <span className="ml-1 font-medium text-amber-600">→ sisa {formatRp(saldo - amount)}</span>
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
          <span>Saldo tidak cukup. Centang untuk tetap mencatat dan membuat saldo negatif.</span>
        </label>
      )}

      {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}

      <button type="submit" className="btn" disabled={saving}>
        {saving ? "Menyimpan..." : "Catat Pengeluaran"}
      </button>
    </form>
  );
}

/* ---------- Penerimaan ---------- */

function ReceiptForm({
  cashAccounts,
  revenueAccounts,
  partners,
}: {
  cashAccounts: CashAcc[];
  revenueAccounts: Opt[];
  partners: PartnerOpt[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const fd = new FormData(e.target as HTMLFormElement);
    const res = await recordReceiptAction(fd);
    setSaving(false);
    if (res.ok) {
      router.refresh();
    } else setError(res.error ?? "Gagal menyimpan.");
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label className="label">Nomor</label>
          <input name="number" className="input" defaultValue={stamp("MSK")} required />
        </div>
        <div>
          <label className="label">Tanggal</label>
          <input name="date" type="date" className="input" defaultValue={today} required />
        </div>
        <div>
          <label className="label">Ke Kas/Bank</label>
          <select name="cashAccountId" className="input" defaultValue={cashAccounts[0]?.id}>
            {cashAccounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Akun Pendapatan</label>
          <select name="revenueAccountId" className="input" required>
            {revenueAccounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Jumlah</label>
          <input name="amount" type="number" min={1} className="input" required />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Keterangan</label>
          <input name="memo" className="input" placeholder="mis. Pendapatan jasa tunai" />
        </div>
        <div>
          <label className="label">Mitra (opsional)</label>
          <select name="partnerId" className="input" defaultValue="">
            <option value="">—</option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}

      <button type="submit" className="btn" disabled={saving}>
        {saving ? "Menyimpan..." : "Catat Penerimaan"}
      </button>
    </form>
  );
}

/* ---------- Mutasi ---------- */

function TransferForm({ cashAccounts }: { cashAccounts: CashAcc[] }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromId, setFromId] = useState(cashAccounts[0]?.id ?? 0);
  const [amount, setAmount] = useState(0);
  const [allowOverdraw, setAllowOverdraw] = useState(false);

  const saldo = cashAccounts.find((a) => a.id === fromId)?.balance ?? 0;
  const willOverdraw = saldo - amount < 0;
  const today = new Date().toISOString().slice(0, 10);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const fd = new FormData(e.target as HTMLFormElement);
    if (allowOverdraw) fd.set("allowOverdraw", "1");
    const res = await transferCashAction(fd);
    setSaving(false);
    if (res.ok) {
      router.refresh();
      setAmount(0);
      setAllowOverdraw(false);
    } else setError(res.error ?? "Gagal menyimpan.");
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label className="label">Nomor</label>
          <input name="number" className="input" defaultValue={stamp("MTS")} required />
        </div>
        <div>
          <label className="label">Tanggal</label>
          <input name="date" type="date" className="input" defaultValue={today} required />
        </div>
        <div>
          <label className="label">Dari</label>
          <select name="fromAccountId" className="input" value={fromId} onChange={(e) => setFromId(Number(e.target.value))}>
            {cashAccounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Ke</label>
          <select name="toAccountId" className="input" defaultValue={cashAccounts[1]?.id ?? cashAccounts[0]?.id}>
            {cashAccounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Jumlah</label>
          <input
            name="amount"
            type="number"
            min={1}
            className="input"
            value={amount || ""}
            onChange={(e) => setAmount(Number(e.target.value || 0))}
            required
          />
        </div>
      </div>

      <div>
        <label className="label">Keterangan</label>
        <input name="memo" className="input" placeholder="mis. Setor tunai ke Bank BCA" />
      </div>

      <p className="text-xs text-slate-500">
        Saldo {cashAccounts.find((a) => a.id === fromId)?.name}: {formatRp(saldo)}
        {willOverdraw && (
          <span className="ml-1 font-medium text-amber-600">→ sisa {formatRp(saldo - amount)}</span>
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
          <span>Saldo asal tidak cukup. Centang untuk tetap mencatat.</span>
        </label>
      )}

      {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}

      <button type="submit" className="btn" disabled={saving}>
        {saving ? "Menyimpan..." : "Catat Mutasi"}
      </button>

      {cashAccounts.length < 2 && (
        <p className="text-xs text-amber-600">Butuh minimal dua akun kas/bank untuk mutasi.</p>
      )}
    </form>
  );
}
