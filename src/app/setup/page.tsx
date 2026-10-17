import { prisma } from "@/lib/db";
import { updateCompanySettingAction } from "@/lib/master-actions";
import Link from "next/link";
import {
  TbBuilding,
  TbReceiptTax,
  TbCash,
  TbPackage,
  TbUsers,
  TbListDetails,
  TbCheck,
  TbArrowRight,
} from "react-icons/tb";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const [setting, accountCount, partnerCount, itemCount, taxCount] = await Promise.all([
    prisma.setting.findUnique({ where: { id: 1 } }),
    prisma.account.count(),
    prisma.partner.count(),
    prisma.item.count(),
    prisma.tax.count(),
  ]);

  const company = setting || {
    companyName: "Perusahaan Saya",
    npwp: "",
    address: "",
    fiscalYearStart: 1,
  };

  async function handleSaveCompany(formData: FormData) {
    "use server";
    await updateCompanySettingAction(formData);
  }

  const steps = [
    {
      title: "1. Identitas Perusahaan",
      desc: "Nama entitas, NPWP, alamat kantor, dan tahun fiskal.",
      icon: TbBuilding,
      ready: !!company.companyName,
      stats: company.companyName,
      href: "#identitas",
    },
    {
      title: "2. Akun Perkiraan (COA)",
      desc: "Bagan akun standar akuntansi Indonesia (PSAK).",
      icon: TbListDetails,
      ready: accountCount > 0,
      stats: `${accountCount} Akun terkonfigurasi`,
      href: "/accounts",
    },
    {
      title: "3. Kas & Bank",
      desc: "Rekening kas operasional dan rekening bank transaksi.",
      icon: TbCash,
      ready: true,
      stats: "Kas, BCA, Mandiri Aktif",
      href: "/cash",
    },
    {
      title: "4. Pemasok & Pelanggan",
      desc: "Data mitra usaha untuk faktur jual dan beli.",
      icon: TbUsers,
      ready: partnerCount > 0,
      stats: `${partnerCount} Mitra terdaftar`,
      href: "/partners",
    },
    {
      title: "5. Barang & Jasa",
      desc: "Katalog produk, persediaan perpetual, dan harga pokok.",
      icon: TbPackage,
      ready: itemCount > 0,
      stats: `${itemCount} Item terdaftar`,
      href: "/items",
    },
    {
      title: "6. Tarif Pajak",
      desc: "Konfigurasi tarif PPN (11%, 12%) dan bukti potong PPh.",
      icon: TbReceiptTax,
      ready: taxCount > 0,
      stats: `${taxCount} Tarif aktif`,
      href: "/taxes",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-[#D32F2F] px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                Setup Wizard
              </span>
              <h1 className="text-xl font-bold text-slate-800">Persiapan Data Perusahaan</h1>
            </div>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Konfigurasi master data entitas agar transaksi penjualan, pembelian, kas, dan laporan keuangan terhitung akurat.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white font-bold">
              <TbCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-800">Database Siap Pakai</div>
              <div className="text-[11px] text-emerald-600">Standar PSAK Otomatis Aktif</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Setup Steps */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((st) => {
          const Icon = st.icon;
          return (
            <div
              key={st.title}
              className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-[#D32F2F] hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EBF3FC] text-[#1D4ED8] group-hover:bg-[#D32F2F] group-hover:text-white transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  {st.ready ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                      <TbCheck className="h-3.5 w-3.5" /> Siap
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-amber-600">Perlu Diisi</span>
                  )}
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-800">{st.title}</h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">{st.desc}</p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-xs font-semibold text-slate-700">{st.stats}</span>
                <Link
                  href={st.href}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#D32F2F] hover:underline"
                >
                  Buka <TbArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Form Identitas Perusahaan */}
      <div id="identitas" className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 border-b border-slate-200 pb-3">
          <h2 className="text-base font-bold text-slate-800">Form Identitas & Tahun Buku Usaha</h2>
          <p className="text-xs text-slate-500">
            Data ini akan dicetak pada kop faktur penjualan dan kepala laporan keuangan resmi.
          </p>
        </div>

        <form action={handleSaveCompany} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Nama Perusahaan / Entitas Usaha *</label>
              <input
                type="text"
                name="companyName"
                defaultValue={company.companyName}
                required
                className="input"
                placeholder="Contoh: PT Mitra Adhi Pandawa"
              />
            </div>
            <div>
              <label className="label">Nomor Pokok Wajib Pajak (NPWP)</label>
              <input
                type="text"
                name="npwp"
                defaultValue={company.npwp}
                className="input"
                placeholder="00.000.000.0-000.000"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Alamat Kantor / Usaha</label>
              <input
                type="text"
                name="address"
                defaultValue={company.address}
                className="input"
                placeholder="Jl. Jend. Sudirman No. 12, Bandung"
              />
            </div>
            <div>
              <label className="label">Bulan Awal Tahun Buku Fiskal</label>
              <select name="fiscalYearStart" defaultValue={company.fiscalYearStart} className="input">
                <option value={1}>Januari</option>
                <option value={4}>April</option>
                <option value={7}>Juli</option>
                <option value={10}>Oktober</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" className="btn">
              Simpan Data Perusahaan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
