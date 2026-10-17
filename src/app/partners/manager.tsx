"use client";

import { CrudManager, type ColumnSpec } from "@/components/crud/manager";
import {
  createPartnerAction,
  updatePartnerAction,
  deletePartnerAction,
} from "@/lib/master-actions";

export interface PartnerRow {
  id: number;
  type: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  npwp: string | null;
  termsDays: number;
  invoiceCount: number;
  typeLabel: string;
}

const TYPE_BADGE: Record<string, string> = {
  CUSTOMER: "bg-blue-100 text-blue-700",
  VENDOR: "bg-amber-100 text-amber-700",
  BOTH: "bg-emerald-100 text-emerald-700",
};

const columns: ColumnSpec<PartnerRow>[] = [
  { key: "name", label: "Nama Mitra", render: (p) => <span className="font-medium">{p.name}</span> },
  {
    key: "type",
    label: "Tipe",
    render: (p) => (
      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_BADGE[p.type] ?? "bg-slate-100 text-slate-600"}`}>
        {p.typeLabel}
      </span>
    ),
  },
  {
    key: "contact",
    label: "Kontak",
    render: (p) => (
      <span className="text-slate-500">
        {[p.email, p.phone].filter(Boolean).join(" · ") || "—"}
      </span>
    ),
  },
  { key: "npwp", label: "NPWP", render: (p) => <span className="font-mono text-xs">{p.npwp || "—"}</span> },
  { key: "termsDays", label: "Tempo", align: "right", render: (p) => `${p.termsDays} hari` },
];

export function PartnersManager({ partners }: { partners: PartnerRow[] }) {
  return (
    <CrudManager<PartnerRow>
      title="Mitra"
      subtitle="Pelanggan dan pemasok. Dipakai di faktur jual/beli dan pembayaran."
      addLabel="+ Tambah Mitra"
      wide
      rows={partners}
      columns={columns}
      createAction={createPartnerAction}
      updateAction={updatePartnerAction}
      deleteAction={deletePartnerAction}
      deleteMessage={(p) => (
        <>
          Yakin hapus mitra <span className="font-semibold">{p.name}</span>? Mitra yang sudah
          punya faktur, pembayaran, atau jurnal tidak bisa dihapus.
        </>
      )}
      fields={[
        { name: "type", label: "Tipe", type: "select", required: true, options: [
          { value: "CUSTOMER", label: "Pelanggan" },
          { value: "VENDOR", label: "Pemasok" },
          { value: "BOTH", label: "Keduanya" },
        ]},
        { name: "termsDays", label: "Tempo Bayar (hari)", type: "number", placeholder: "30" },
        { name: "name", label: "Nama Mitra", required: true, placeholder: "PT Maju Jaya" },
        { name: "npwp", label: "NPWP", placeholder: "00.000.000.0-000.000" },
        { name: "email", label: "Email", placeholder: "finance@perusahaan.co.id" },
        { name: "phone", label: "Telepon", placeholder: "021-555-0100" },
        { name: "address", label: "Alamat", type: "textarea", placeholder: "Jl. ..." },
      ]}
    />
  );
}
