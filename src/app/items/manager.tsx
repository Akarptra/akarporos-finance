"use client";

import { CrudManager, type ColumnSpec } from "@/components/crud/manager";
import {
  createItemAction,
  updateItemAction,
  deleteItemAction,
} from "@/lib/master-actions";
import { formatRp } from "@/lib/format";

export interface ItemRow {
  id: number;
  code: string;
  name: string;
  type: string;
  unit: string;
  sellPrice: number;
  costPrice: number;
  expenseAcctId: string | number;
  isActive: boolean;
  typeLabel: string;
}

const columns: ColumnSpec<ItemRow>[] = [
  { key: "code", label: "Kode", render: (i) => <span className="font-mono">{i.code}</span> },
  { key: "name", label: "Nama", render: (i) => <span className="font-medium">{i.name}</span> },
  {
    key: "type",
    label: "Tipe",
    render: (i) => (
      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${i.type === "PRODUCT" ? "bg-blue-100 text-blue-700" : "bg-violet-100 text-violet-700"}`}>
        {i.typeLabel}
      </span>
    ),
  },
  { key: "unit", label: "Satuan" },
  { key: "costPrice", label: "Harga Beli", align: "right", render: (i) => formatRp(i.costPrice) },
  { key: "sellPrice", label: "Harga Jual", align: "right", render: (i) => formatRp(i.sellPrice) },
  {
    key: "isActive",
    label: "Aktif",
    render: (i) =>
      i.isActive ? (
        <span className="text-emerald-600">ya</span>
      ) : (
        <span className="text-slate-400">tidak</span>
      ),
  },
];

export function ItemsManager({
  items,
  expenseAccounts,
}: {
  items: ItemRow[];
  expenseAccounts: { value: string; label: string }[];
}) {
  return (
    <CrudManager<ItemRow>
      title="Barang & Jasa"
      subtitle="Barang diposting ke Persediaan saat dibeli; jasa memakai akun beban yang dipilih."
      addLabel="+ Tambah Barang"
      wide
      rows={items}
      columns={columns}
      createAction={createItemAction}
      updateAction={updateItemAction}
      deleteAction={deleteItemAction}
      deleteMessage={(i) => (
        <>
          Yakin hapus barang <span className="font-mono font-semibold">{i.code}</span> — {i.name}?
          Barang yang sudah dipakai di faktur tidak bisa dihapus, hanya dinonaktifkan.
        </>
      )}
      fields={[
        { name: "code", label: "Kode", required: true, placeholder: "PRD-001" },
        { name: "type", label: "Tipe", type: "select", required: true, options: [
          { value: "PRODUCT", label: "Barang" },
          { value: "SERVICE", label: "Jasa" },
        ]},
        { name: "name", label: "Nama", required: true, placeholder: "Laptop Bisnis A" },
        { name: "unit", label: "Satuan", placeholder: "pcs" },
        { name: "costPrice", label: "Harga Beli", type: "number", placeholder: "0" },
        { name: "sellPrice", label: "Harga Jual", type: "number", placeholder: "0" },
        {
          name: "expenseAcctId",
          label: "Akun Beban (untuk jasa)",
          type: "select",
          options: [{ value: "", label: "— Ikut akun default —" }, ...expenseAccounts],
          hint: "Dipakai sebagai akun debit saat membeli jasa ini. Barang selalu masuk Persediaan.",
        },
        { name: "isActive", label: "Aktif", type: "checkbox" },
      ]}
    />
  );
}
