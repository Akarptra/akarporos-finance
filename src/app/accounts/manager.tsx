"use client";

import { useState, useTransition } from "react";
import {
  createAccountAction,
  updateAccountAction,
  deleteAccountAction,
} from "@/lib/account-actions";
import { formatRp } from "@/lib/format";

interface AccountRow {
  id: number;
  code: string;
  name: string;
  type: string;
  alias: string | null;
  parentId: number | null;
  isGroup: boolean;
}

interface Props {
  accounts: AccountRow[];
  balances: Record<number, number>;
}

const TYPES = [
  { value: "ASSET", label: "Aset", normal: "debit" },
  { value: "LIABILITY", label: "Kewajiban", normal: "credit" },
  { value: "EQUITY", label: "Modal", normal: "credit" },
  { value: "REVENUE", label: "Pendapatan", normal: "credit" },
  { value: "EXPENSE", label: "Beban", normal: "debit" },
] as const;

const TYPE_LABEL: Record<string, string> = Object.fromEntries(
  TYPES.map((t) => [t.value, t.label])
);

const CREDIT_NORMAL = new Set(["LIABILITY", "EQUITY", "REVENUE"]);

type EditingState = { mode: "create" } | { mode: "edit"; acc: AccountRow } | null;

export function AccountsManager({ accounts, balances }: Props) {
  const [editing, setEditing] = useState<EditingState>(null);
  const [pendingDelete, setPendingDelete] = useState<AccountRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function openCreate() {
    setError(null);
    setEditing({ mode: "create" });
  }

  function openEdit(acc: AccountRow) {
    setError(null);
    setEditing({ mode: "edit", acc });
  }

  function confirmDelete(acc: AccountRow) {
    setError(null);
    setPendingDelete(acc);
  }

  function handleDelete() {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    startTransition(async () => {
      const res = await deleteAccountAction(id);
      if (res.ok) {
        setPendingDelete(null);
      } else {
        setError(res.error ?? "Gagal menghapus akun.");
        setPendingDelete(null);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bagan Akun (COA)</h1>
          <p className="text-sm text-slate-500">
            Klik kanan-atau tombol aksi untuk tambah, edit, atau hapus akun.
          </p>
        </div>
        <button className="btn" onClick={openCreate} disabled={isPending}>
          + Tambah Akun
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="card overflow-x-auto p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="th">Kode</th>
              <th className="th">Nama Akun</th>
              <th className="th">Tipe</th>
              <th className="th">Alias</th>
              <th className="th text-right">Saldo</th>
              <th className="th text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {accounts.length === 0 && (
              <tr>
                <td className="td py-8 text-center text-slate-400" colSpan={6}>
                  Belum ada akun. Klik + Tambah Akun.
                </td>
              </tr>
            )}
            {accounts.map((a) => {
              const raw = balances[a.id] ?? 0;
              const display = CREDIT_NORMAL.has(a.type) ? -raw : raw;
              return (
                <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="td font-mono">{a.code}</td>
                  <td className="td">
                    <span className={a.parentId ? "pl-5 text-slate-600" : "font-medium"}>
                      {a.parentId ? "└ " : ""}
                      {a.name}
                    </span>
                    {a.isGroup && (
                      <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
                        grup
                      </span>
                    )}
                  </td>
                  <td className="td text-xs text-slate-500">
                    {TYPE_LABEL[a.type] ?? a.type}
                  </td>
                  <td className="td">
                    {a.alias ? (
                      <span className="rounded bg-brand-50 px-1.5 py-0.5 font-mono text-[11px] text-brand-700">
                        {a.alias}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="td text-right font-medium tabular-nums">
                    {formatRp(display)}
                  </td>
                  <td className="td text-right">
                    <button
                      className="mr-3 text-sm text-brand-600 hover:underline disabled:opacity-40"
                      onClick={() => openEdit(a)}
                      disabled={isPending}
                    >
                      Edit
                    </button>
                    <button
                      className="text-sm text-red-600 hover:underline disabled:opacity-40"
                      onClick={() => confirmDelete(a)}
                      disabled={isPending}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editing && (
        <AccountFormModal
          editing={editing}
          accounts={accounts}
          onClose={() => setEditing(null)}
          startTransition={startTransition}
          isPending={isPending}
          onError={setError}
        />
      )}

      {pendingDelete && (
        <DeleteConfirmModal
          acc={pendingDelete}
          isPending={isPending}
          onCancel={() => setPendingDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

/* ---------- Modal Form (Tambah / Edit) ---------- */

function AccountFormModal({
  editing,
  accounts,
  onClose,
  startTransition,
  isPending,
  onError,
}: {
  editing: EditingState;
  accounts: AccountRow[];
  onClose: () => void;
  startTransition: (fn: () => void | Promise<void>) => void;
  isPending: boolean;
  onError: (msg: string | null) => void;
}) {
  const isEdit = editing !== null && editing.mode === "edit";
  const acc = isEdit ? (editing as { acc: AccountRow }).acc : null;

  // Untuk edit: kecualikan diri sendiri dari opsi induk (hindari siklus)
  const parentOptions = accounts.filter((a) => a.id !== acc?.id);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    onError(null);
    startTransition(async () => {
      const res = isEdit
        ? await updateAccountAction(fd)
        : await createAccountAction(fd);
      if (res.ok) {
        onClose();
      } else {
        onError(res.error ?? "Gagal menyimpan.");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold">
          {isEdit ? "Edit Akun" : "Tambah Akun"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isEdit && <input type="hidden" name="id" value={acc!.id} />}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Kode</label>
              <input
                name="code"
                className="input font-mono"
                defaultValue={acc?.code ?? ""}
                placeholder="mis. 1010"
                required
              />
            </div>
            <div>
              <label className="label">Tipe</label>
              <select name="type" className="input" defaultValue={acc?.type ?? "ASSET"} required>
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Nama Akun</label>
            <input
              name="name"
              className="input"
              defaultValue={acc?.name ?? ""}
              placeholder="mis. Kas"
              required
            />
          </div>

          <div>
            <label className="label">
              Alias Sistem <span className="font-normal text-slate-400">(opsional)</span>
            </label>
            <input
              name="alias"
              className="input font-mono uppercase"
              defaultValue={acc?.alias ?? ""}
              placeholder="KAS, BANK, AR, AP, SALES, VAT_OUT..."
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Dipakai engine untuk posting jurnal otomatis. Kosongkan untuk akun biasa.
            </p>
          </div>

          <div>
            <label className="label">
              Induk <span className="font-normal text-slate-400">(opsional)</span>
            </label>
            <select name="parentId" className="input" defaultValue={acc?.parentId ?? ""}>
              <option value="">— Tanpa induk (akun utama) —</option>
              {parentOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} · {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-ghost" onClick={onClose} disabled={isPending}>
              Batal
            </button>
            <button type="submit" className="btn" disabled={isPending}>
              {isPending ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Akun"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- Modal Konfirmasi Hapus ---------- */

function DeleteConfirmModal({
  acc,
  isPending,
  onCancel,
  onConfirm,
}: {
  acc: AccountRow;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-red-700">Hapus akun?</h2>
        <p className="mt-2 text-sm text-slate-600">
          Kamu yakin ingin menghapus akun{" "}
          <span className="font-mono font-semibold">{acc.code}</span> — {acc.name}?
        </p>
        <p className="mt-2 text-xs text-slate-400">
          Akun yang sudah dipakai di jurnal, pembayaran, atau masih punya sub-akun tidak
          bisa dihapus.
        </p>

        <div className="mt-5 flex justify-end gap-3">
          <button className="btn-ghost" onClick={onCancel} disabled={isPending}>
            Batal
          </button>
          <button
            className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? "Menghapus..." : "Ya, Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}
