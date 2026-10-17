import type { ReactNode } from "react";

// Form GET → navigasi ke URL ber-query. Server component, tanpa JS klien.
export function PeriodForm({
  action,
  from,
  to,
  single,
  children,
}: {
  action: string;
  from?: string;
  to?: string;
  single?: { name: string; label: string; value: string };
  children?: ReactNode;
}) {
  return (
    <form method="get" action={action} className="flex flex-wrap items-end gap-3">
      {single ? (
        <div>
          <label className="label">{single.label}</label>
          <input type="date" name={single.name} defaultValue={single.value} className="input w-44" />
        </div>
      ) : (
        <>
          <div>
            <label className="label">Dari</label>
            <input type="date" name="from" defaultValue={from} className="input w-44" />
          </div>
          <div>
            <label className="label">Sampai</label>
            <input type="date" name="to" defaultValue={to} className="input w-44" />
          </div>
        </>
      )}
      {children}
      <button type="submit" className="btn-ghost">
        Terapkan
      </button>
    </form>
  );
}

export function Periode({ children }: { children: ReactNode }) {
  return (
    <p className="text-sm text-slate-500">
      Periode: <span className="font-medium text-slate-700">{children}</span>
    </p>
  );
}
