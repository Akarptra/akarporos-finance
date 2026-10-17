"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPurchaseInvoiceAction, RawPurchaseLine } from "@/lib/purchase-actions";
import { formatRp } from "@/lib/format";

interface Option {
  id: number;
  name: string;
}
interface Tax {
  id: number;
  name: string;
  rate: number;
}
interface ItemLite {
  id: number;
  name: string;
  type: string;
  costPrice: number;
  expenseAcctId: number | null;
}
interface DebitAccount {
  id: number;
  label: string;
}

const EMPTY_LINE: RawPurchaseLine = {
  description: "",
  qty: "1",
  price: "0",
  discount: "0",
  taxId: "",
  accountId: "",
  itemId: "",
};

export function NewPurchaseForm({
  partners,
  taxes,
  items,
  debitAccounts,
  inventoryId,
  defaultExpenseId,
  defaultNumber,
}: {
  partners: Option[];
  taxes: Tax[];
  items: ItemLite[];
  debitAccounts: DebitAccount[];
  inventoryId: number | null;
  defaultExpenseId: number | null;
  defaultNumber: string;
}) {
  const router = useRouter();
  const [lines, setLines] = useState<RawPurchaseLine[]>([{ ...EMPTY_LINE }]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  // Total real-time di klien (sama rumusnya dengan engine)
  const [totals, setTotals] = useState({ subtotal: 0, discount: 0, tax: 0, total: 0 });
  useEffect(() => {
    let subtotal = 0,
      discount = 0,
      tax = 0;
    for (const l of lines) {
      const gross = Number(l.qty || 0) * Number(l.price || 0);
      subtotal += gross;
      discount += Number(l.discount || 0);
      const t = taxes.find((x) => x.id === Number(l.taxId));
      tax += Math.round((gross - Number(l.discount || 0)) * (t?.rate ?? 0));
    }
    setTotals({ subtotal, discount, tax, total: subtotal - discount + tax });
  }, [lines, taxes]);

  function updateLine(i: number, patch: Partial<RawPurchaseLine>) {
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }

  // Pilih barang → isi otomatis harga & akun debit
  function pickItem(i: number, itemId: string) {
    const item = items.find((x) => x.id === Number(itemId));
    if (!item) {
      updateLine(i, { itemId: "", accountId: "" });
      return;
    }
    const accountId =
      item.type === "PRODUCT"
        ? inventoryId ?? ""
        : item.expenseAcctId ?? defaultExpenseId ?? "";
    updateLine(i, {
      itemId,
      description: item.name,
      price: String(item.costPrice || 0),
      accountId: String(accountId),
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const fd = new FormData(e.target as HTMLFormElement);
    fd.set("number", (fd.get("number") as string) || defaultNumber);
    const res = await createPurchaseInvoiceAction(buildFormData(fd, lines));
    setSaving(false);
    if (res.ok && res.id) {
      router.push(`/purchase-invoices/${res.id}`);
      router.refresh();
    } else {
      setError(res.error ?? "Gagal menyimpan.");
    }
  }

  const missingAccount = lines.some((l) => !l.accountId);

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div>
          <label className="label">Nomor</label>
          <input name="number" className="input" defaultValue={defaultNumber} />
        </div>
        <div>
          <label className="label">Tanggal</label>
          <input name="date" type="date" className="input" defaultValue={today} required />
        </div>
        <div>
          <label className="label">Jatuh Tempo</label>
          <input name="dueDate" type="date" className="input" defaultValue={today} />
        </div>
        <div>
          <label className="label">Pemasok</label>
          <select name="partnerId" className="input" required>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {partners.length === 0 && (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
          Belum ada pemasok. Tambah dulu di menu Mitra (tipe Pemasok).
        </p>
      )}

      <div className="card overflow-x-auto p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="th">Barang / Jasa</th>
              <th className="th">Deskripsi</th>
              <th className="th">Qty</th>
              <th className="th">Harga</th>
              <th className="th">Diskon</th>
              <th className="th">Pajak</th>
              <th className="th">Akun Debit</th>
              <th className="th text-right">Jumlah</th>
              <th className="th" />
            </tr>
          </thead>
          <tbody>
            {lines.map((l, i) => {
              const gross = Number(l.qty || 0) * Number(l.price || 0);
              const t = taxes.find((x) => x.id === Number(l.taxId));
              const net = gross - Number(l.discount || 0);
              const lineTotal = net + Math.round(net * (t?.rate ?? 0));
              return (
                <tr key={i} className="border-b border-slate-100">
                  <td className="p-2">
                    <select
                      className="input w-44"
                      value={l.itemId}
                      onChange={(e) => pickItem(i, e.target.value)}
                    >
                      <option value="">— bebas —</option>
                      {items.map((it) => (
                        <option key={it.id} value={it.id}>
                          {it.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <input
                      className="input w-48"
                      value={l.description}
                      onChange={(e) => updateLine(i, { description: e.target.value })}
                      placeholder="Nama barang / jasa"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      className="input w-20"
                      type="number"
                      min={1}
                      value={l.qty}
                      onChange={(e) => updateLine(i, { qty: e.target.value })}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      className="input w-32"
                      type="number"
                      min={0}
                      value={l.price}
                      onChange={(e) => updateLine(i, { price: e.target.value })}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      className="input w-24"
                      type="number"
                      min={0}
                      value={l.discount}
                      onChange={(e) => updateLine(i, { discount: e.target.value })}
                    />
                  </td>
                  <td className="p-2">
                    <select
                      className="input w-32"
                      value={l.taxId}
                      onChange={(e) => updateLine(i, { taxId: e.target.value })}
                    >
                      <option value="">—</option>
                      {taxes.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <select
                      className="input w-52"
                      value={l.accountId}
                      onChange={(e) => updateLine(i, { accountId: e.target.value })}
                      required
                    >
                      <option value="">— pilih —</option>
                      {debitAccounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2 text-right tabular-nums">{formatRp(lineTotal)}</td>
                  <td className="p-2 text-center">
                    <button
                      type="button"
                      onClick={() => setLines((prev) => prev.filter((_, idx) => idx !== i))}
                      className="text-slate-400 hover:text-red-500"
                      disabled={lines.length === 1}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {inventoryId === null && (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
          Akun Persediaan (alias INVENTORY) belum di-set. Atur dulu di menu Akun supaya pembelian
          barang terposting benar.
        </p>
      )}

      <button
        type="button"
        onClick={() => setLines((prev) => [...prev, { ...EMPTY_LINE }])}
        className="btn-ghost"
      >
        + Tambah Baris
      </button>

      <div className="flex justify-end">
        <div className="card w-72 space-y-1">
          <Row label="Subtotal" value={formatRp(totals.subtotal)} />
          <Row label="Diskon" value={formatRp(totals.discount)} />
          <Row label="Pajak" value={formatRp(totals.tax)} />
          <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 font-semibold">
            <span>Grand Total</span>
            <span>{formatRp(totals.total)}</span>
          </div>
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" className="btn" disabled={saving || missingAccount}>
          {saving ? "Menyimpan..." : "Simpan & Posting Jurnal"}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-ghost">
          Batal
        </button>
      </div>

      {missingAccount && (
        <p className="text-xs text-amber-600">
          Setiap baris wajib punya akun debit (Persediaan untuk barang, akun beban untuk jasa).
        </p>
      )}
    </form>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

// Bangun FormData bersih untuk server action (baris dikirim sebagai JSON string)
function buildFormData(fd: FormData, lines: RawPurchaseLine[]): FormData {
  const out = new FormData();
  ["number", "date", "dueDate", "partnerId", "memo"].forEach((k) => {
    const v = fd.get(k);
    if (v !== null) out.append(k, v as string);
  });
  lines.forEach((l) => out.append("line", JSON.stringify(l)));
  return out;
}
