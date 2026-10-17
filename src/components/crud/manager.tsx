"use client";

import { useState, useTransition, type ReactNode } from "react";

export interface FieldSpec {
  name: string;
  label: string;
  type?: "text" | "number" | "select" | "textarea" | "checkbox" | "rate";
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  hint?: string;
}

export interface ColumnSpec<Row> {
  key: string;
  label: string;
  align?: "right";
  render?: (row: Row) => ReactNode;
}

type AnyRow = Record<string, any> & { id: number };

/**
 * Manajer CRUD generik: tabel + modal tambah/edit + konfirmasi hapus.
 * Dipakai halaman Mitra, Barang, dan Pajak supaya perilakunya seragam.
 */
export function CrudManager<Row extends AnyRow>({
  title,
  subtitle,
  addLabel = "+ Tambah",
  rows,
  columns,
  fields,
  createAction,
  updateAction,
  deleteAction,
  deleteMessage,
  wide = false,
}: {
  title: string;
  subtitle?: string;
  addLabel?: string;
  rows: Row[];
  columns: ColumnSpec<Row>[];
  fields: FieldSpec[];
  createAction: (fd: FormData) => Promise<{ ok: boolean; error?: string }>;
  updateAction: (fd: FormData) => Promise<{ ok: boolean; error?: string }>;
  deleteAction: (id: number) => Promise<{ ok: boolean; error?: string }>;
  deleteMessage: (row: Row) => ReactNode;
  wide?: boolean;
}) {
  const [editing, setEditing] = useState<{ mode: "create" } | { mode: "edit"; row: Row } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Row | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isEdit = editing?.mode === "edit";
  const current = isEdit ? (editing as { row: Row }).row : null;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    setError(null);
    startTransition(async () => {
      const res = isEdit ? await updateAction(fd) : await createAction(fd);
      if (res.ok) setEditing(null);
      else setError(res.error ?? "Gagal menyimpan.");
    });
  }

  function handleDelete() {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    startTransition(async () => {
      const res = await deleteAction(id);
      if (!res.ok) setError(res.error ?? "Gagal menghapus.");
      setPendingDelete(null);
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
        <button className="btn" onClick={() => { setError(null); setEditing({ mode: "create" }); }} disabled={isPending}>
          {addLabel}
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
              {columns.map((c) => (
                <th key={c.key} className={`th ${c.align === "right" ? "text-right" : ""}`}>
                  {c.label}
                </th>
              ))}
              <th className="th text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td className="td py-8 text-center text-slate-400" colSpan={columns.length + 1}>
                  Belum ada data. Klik {addLabel.replace("+ ", "")}.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                {columns.map((c) => (
                  <td key={c.key} className={`td ${c.align === "right" ? "text-right tabular-nums" : ""}`}>
                    {c.render ? c.render(r) : String(r[c.key] ?? "—")}
                  </td>
                ))}
                <td className="td text-right">
                  <button
                    className="mr-3 text-sm text-brand-600 hover:underline disabled:opacity-40"
                    onClick={() => { setError(null); setEditing({ mode: "edit", row: r }); }}
                    disabled={isPending}
                  >
                    Edit
                  </button>
                  <button
                    className="text-sm text-red-600 hover:underline disabled:opacity-40"
                    onClick={() => { setError(null); setPendingDelete(r); }}
                    disabled={isPending}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className={`w-full ${wide ? "max-w-2xl" : "max-w-md"} rounded-xl bg-white p-6 shadow-xl`}>
            <h2 className="mb-4 text-lg font-semibold">{isEdit ? "Edit" : "Tambah"} {title}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isEdit && <input type="hidden" name="id" value={current!.id} />}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {fields.map((f) => (
                  <div key={f.name} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
                    <label className="label">{f.label}</label>
                    <FieldInput f={f} value={String(current?.[f.name] ?? "")} />
                    {f.hint && <p className="mt-1 text-[11px] text-slate-400">{f.hint}</p>}
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" className="btn-ghost" onClick={() => setEditing(null)} disabled={isPending}>
                  Batal
                </button>
                <button type="submit" className="btn" disabled={isPending}>
                  {isPending ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-red-700">Hapus?</h2>
            <div className="mt-2 text-sm text-slate-600">{deleteMessage(pendingDelete)}</div>
            <div className="mt-5 flex justify-end gap-3">
              <button className="btn-ghost" onClick={() => setPendingDelete(null)} disabled={isPending}>
                Batal
              </button>
              <button
                className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
                onClick={handleDelete}
                disabled={isPending}
              >
                {isPending ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FieldInput({ f, value }: { f: FieldSpec; value: string }) {
  if (f.type === "select") {
    return (
      <select name={f.name} className="input" defaultValue={value} required={f.required}>
        {f.options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }
  if (f.type === "textarea") {
    return (
      <textarea
        name={f.name}
        className="input"
        rows={3}
        defaultValue={value}
        placeholder={f.placeholder}
        required={f.required}
      />
    );
  }
  if (f.type === "checkbox") {
    return (
      <input
        type="checkbox"
        name={f.name}
        value="1"
        defaultChecked={value === "1" || value === "true"}
        className="h-4 w-4 rounded border-slate-300"
      />
    );
  }
  const inputType = f.type === "number" || f.type === "rate" ? "number" : "text";
  return (
    <input
      name={f.name}
      type={inputType}
      step={f.type === "rate" ? "0.0001" : undefined}
      className="input"
      defaultValue={value}
      placeholder={f.placeholder}
      required={f.required}
    />
  );
}
