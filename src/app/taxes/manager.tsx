"use client";

import { CrudManager, type ColumnSpec } from "@/components/crud/manager";
import { createTaxAction, updateTaxAction, deleteTaxAction } from "@/lib/master-actions";

export interface TaxRow {
  id: number;
  code: string;
  name: string;
  rate: number;
  type: string;
  active: boolean;
  rateLabel: string;
  typeLabel: string;
}

const TYPE_BADGE: Record<string, string> = {
  OUTPUT: "bg-blue-100 text-blue-700",
  INPUT: "bg-amber-100 text-amber-700",
  NONE: "bg-slate-100 text-slate-600",
};

const columns: ColumnSpec<TaxRow>[] = [
  { key: "code", label: "Kode", render: (t) => <span className="font-mono">{t.code}</span> },
  { key: "name", label: "Nama", render: (t) => <span className="font-medium">{t.name}</span> },
  {
    key: "type",
    label: "Jenis",
    render: (t) => (
      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_BADGE[t.type] ?? "bg-slate-100 text-slate-600"}`}>
        {t.typeLabel}
      </span>
    ),
  },
  { key: "rate", label: "Tarif", align: "right", render: (t) => t.rateLabel },
  {
    key: "active",
    label: "Aktif",
    render: (t) =>
      t.active ? <span className="text-emerald-600">ya</span> : <span className="text-slate-400">tidak</span>,
  },
];

export function TaxesManager({ taxes }: { taxes: TaxRow[] }) {
  return (
    <CrudManager<TaxRow>
      title="Pajak"
      subtitle="Tarif dipakai otomatis di baris faktur jual dan beli."
      addLabel="+ Tambah Pajak"
      rows={taxes}
      columns={columns}
      createAction={createTaxAction}
      updateAction={updateTaxAction}
      deleteAction={deleteTaxAction}
      deleteMessage={(t) => (
        <>
          Yakin hapus pajak <span className="font-mono font-semibold">{t.code}</span> — {t.name}?
          Pajak yang sudah dipakai di faktur tidak bisa dihapus, hanya dinonaktifkan.
        </>
      )}
      fields={[
        { name: "code", label: "Kode", required: true, placeholder: "PPN11" },
        { name: "type", label: "Jenis", type: "select", required: true, options: [
          { value: "OUTPUT", label: "Keluaran (dipungut)" },
          { value: "INPUT", label: "Masukan (dibayar)" },
          { value: "NONE", label: "Tanpa Pajak" },
        ]},
        { name: "name", label: "Nama", required: true, placeholder: "PPN 11%" },
        { name: "rate", label: "Tarif (desimal)", type: "rate", required: true, placeholder: "0.11", hint: "11% ditulis 0.11" },
        { name: "active", label: "Aktif", type: "checkbox" },
      ]}
    />
  );
}
