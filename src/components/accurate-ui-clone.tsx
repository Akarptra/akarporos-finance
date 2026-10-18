"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings, Building2, BookOpen, Landmark, Coins, ShoppingCart,
  Truck, Package, FileSpreadsheet, Users, Search, HelpCircle,
  Bell, User, X, Plus, Save, Paperclip, Lightbulb, List,
  ChevronDown, Check, Trash2, Image as ImageIcon, History,
  RefreshCw, MoreVertical, ChevronLeft, ChevronRight, FileText,
  Calendar, Calculator, CreditCard, ArrowRightLeft, Percent,
  ClipboardList, Warehouse, MapPin, Mail, Sparkles, UserCheck,
  TrendingUp, DollarSign
} from 'lucide-react';

const ALL_WIDGETS = [
  { id: 'aktifitas', title: 'Aktifitas Terakhir Anda', desc: 'Menampilkan transaksi dan aktifitas jurnal terbaru dari database' },
  { id: 'arus_kas', title: 'Arus Kas', desc: 'Menampilkan total saldo kas & bank operasional saat ini' },
  { id: 'aset_saat_ini', title: 'Aset saat ini', desc: 'Menampilkan pertumbuhan nilai aset lancar dan tetap' },
  { id: 'barang_stok_min', title: 'Barang Stok Minimum', desc: 'Menampilkan barang-barang yang perlu dipesan bagian pembelian' },
  { id: 'beban_perusahaan', title: 'Beban Perusahaan', desc: 'Menampilkan total akumulasi beban operasional periode ini' },
  { id: 'faktur_terlewat', title: 'Faktur Terlewat', desc: 'Menampilkan faktur penjualan/pembelian jatuh tempo' },
  { id: 'kegiatan_mendatang', title: 'Kegiatan Mendatang', desc: 'Menampilkan jadwal transaksi & penagihan beberapa hari kedepan' },
  { id: 'ketersediaan_kas', title: 'Ketersediaan Kas', desc: 'Grafik likuiditas kas atas potensi pengeluaran dan penerimaan' },
  { id: 'laba_rugi', title: 'Laba/Rugi Tahun ini', desc: 'Nilai dan persentase laba bersih komprehensif PSAK tahun berjalan' },
  { id: 'pelanggan_berutang', title: 'Pelanggan Berutang (Piutang)', desc: 'Daftar piutang dagang dan saldo tagihan pelanggan belum lunas' },
  { id: 'pembelian', title: 'Pembelian', desc: 'Nilai dan akumulasi faktur pembelian periode berjalan' },
  { id: 'penjualan', title: 'Penjualan', desc: 'Total akumulasi omset dan faktur penjualan periode berjalan' },
  { id: 'penjualan_barang', title: 'Penjualan Barang', desc: 'Barang-barang dengan volume dan nilai penjualan tertinggi' },
  { id: 'rekonsiliasi_bank', title: 'Rekonsiliasi Bank', desc: 'Status pencocokan rekening koran dengan buku kas bank' },
  { id: 'tren_penjualan', title: 'Tren Penjualan', desc: 'Grafik tren omset penjualan mingguan' }
];

const SIDEBAR_MENUS: Record<string, any> = {
  pengaturan: {
    title: 'Pengaturan',
    cols: 3,
    items: [
      { label: 'Preferensi', color: 'blue', icon: Settings, href: '/setup' },
      { label: 'Penomoran', color: 'blue', icon: FileText, href: '/setup' },
      { label: 'Desain Cetakan', color: 'blue', icon: ClipboardList },
      { label: 'Akses Grup', color: 'green', icon: Users },
      { label: 'Pengguna', color: 'green', icon: UserCheck },
      { label: 'accurate Store', color: 'purple', icon: ShoppingCart }
    ]
  },
  perusahaan: {
    title: 'Perusahaan',
    cols: 4,
    items: [
      { label: 'Pajak', color: 'blue', icon: FileText, href: '/taxes' },
      { label: 'Syarat Pembayaran', color: 'blue', icon: Coins, href: '/setup' },
      { label: 'Pengiriman', color: 'blue', icon: Truck },
      { label: 'FOB', color: 'blue', icon: Package },
      { label: 'Gaji/Tunjangan', color: 'blue', icon: CreditCard },
      { label: 'Karyawan', color: 'blue', icon: Users },
      { label: 'Transaksi Berulang', color: 'green', icon: RefreshCw },
      { label: 'Proses Akhir Bulan', color: 'green', icon: Calendar, href: '/journal' },
      { label: 'Kontak', color: 'purple', icon: User, href: '/partners' },
      { label: 'Transaksi Favorit', color: 'purple', icon: FileSpreadsheet },
      { label: 'Kalender', color: 'purple', icon: Calendar },
      { label: 'Log Aktifitas', color: 'purple', icon: History }
    ]
  },
  bukubesar: {
    title: 'Buku Besar',
    cols: 3,
    items: [
      { label: 'Akun Perkiraan', color: 'blue', icon: BookOpen, href: '/accounts' },
      { label: 'Pencatatan Beban', color: 'green', icon: ClipboardList, href: '/cash' },
      { label: 'Pencatatan Gaji', color: 'green', icon: CreditCard, href: '/cash' },
      { label: 'Jurnal Umum', color: 'green', icon: FileSpreadsheet, href: '/journal' },
      { label: 'Monitor Anggaran', color: 'purple', icon: Landmark },
      { label: 'Transfer Anggaran', color: 'green', icon: ArrowRightLeft },
      { label: 'Anggaran', color: 'orange', icon: Coins },
      { label: 'Histori Akun', color: 'purple', icon: History, href: '/journal' },
      { label: 'Log Aktifitas Jurnal', color: 'purple', icon: FileText, href: '/journal' }
    ]
  },
  kasbank: {
    title: 'Kas & Bank',
    cols: 3,
    items: [
      { label: 'Pembayaran', color: 'green', icon: CreditCard, href: '/cash' },
      { label: 'Penerimaan', color: 'green', icon: Coins, href: '/cash' },
      { label: 'Transfer Bank', color: 'green', icon: ArrowRightLeft, href: '/cash' },
      { label: 'SmartLink e-Banking', color: 'blue', icon: Landmark },
      { label: 'Rekening Koran', color: 'purple', icon: FileSpreadsheet, href: '/cash' },
      { label: 'Histori Bank', color: 'purple', icon: History, href: '/cash' },
      { label: 'Rekonsiliasi Bank', color: 'purple', icon: Check, href: '/cash' },
      { label: 'SmartLink Virtual Account', color: 'purple', icon: FileText },
      { label: 'SmartLink e-Payment', color: 'purple', icon: CreditCard }
    ]
  },
  penjualan: {
    title: 'Penjualan',
    cols: 5,
    items: [
      { label: 'Penawaran Penjualan', color: 'green', icon: Coins },
      { label: 'Pesanan Penjualan', color: 'green', icon: ClipboardList },
      { label: 'Pengiriman Pesanan', color: 'green', icon: Truck },
      { label: 'Uang Muka Penjualan', color: 'green', icon: CreditCard },
      { label: 'Faktur Penjualan', color: 'green', icon: FileText, href: '/sales-invoices' },
      { label: 'Penerimaan Penjualan', color: 'green', icon: Coins, href: '/cash' },
      { label: 'Retur Penjualan', color: 'green', icon: RefreshCw },
      { label: 'Kategori Pelanggan', color: 'blue', icon: Users, href: '/partners' },
      { label: 'Kategori Penjualan', color: 'blue', icon: Percent },
      { label: 'Pelanggan', color: 'blue', icon: User, action: 'pelanggan' },
      { label: 'Penyesuaian Harga/Diskon', color: 'orange', icon: Percent },
      { label: 'Komisi Penjual', color: 'orange', icon: UserCheck },
      { label: 'Target Penjualan', color: 'orange', icon: Landmark },
      { label: 'SmartLink e-Commerce', color: 'orange', icon: ShoppingCart },
      { label: 'Check In', color: 'purple', icon: MapPin }
    ]
  },
  pembelian: {
    title: 'Pembelian',
    cols: 4,
    items: [
      { label: 'Pesanan Pembelian', color: 'green', icon: ClipboardList },
      { label: 'Penerimaan Barang', color: 'green', icon: Package, href: '/stock' },
      { label: 'Uang Muka Pembelian', color: 'green', icon: CreditCard },
      { label: 'Faktur Pembelian', color: 'green', icon: FileText, href: '/purchase-invoices' },
      { label: 'Pembayaran Pembelian', color: 'green', icon: Coins, href: '/cash' },
      { label: 'Retur Pembelian', color: 'green', icon: RefreshCw },
      { label: 'Harga Pemasok', color: 'orange', icon: FileSpreadsheet },
      { label: 'Kategori Pemasok', color: 'blue', icon: Users, href: '/partners' },
      { label: 'Pemasok', color: 'blue', icon: Truck, action: 'pemasok' },
      { label: 'Perintah Pembayaran', color: 'green', icon: FileText },
      { label: 'Transfer Pemasok', color: 'purple', icon: ArrowRightLeft }
    ]
  },
  persediaan: {
    title: 'Persediaan',
    cols: 6,
    items: [
      { label: 'Permintaan Barang', color: 'green', icon: ClipboardList },
      { label: 'Pemindahan Barang', color: 'green', icon: Truck, href: '/stock' },
      { label: 'Penyesuaian Persediaan', color: 'green', icon: FileSpreadsheet, href: '/stock' },
      { label: 'Pekerjaan Pesanan', color: 'green', icon: Package },
      { label: 'Penambahan Bahan Baku', color: 'green', icon: Plus },
      { label: 'Penyelesaian Pesanan', color: 'green', icon: Check },
      { label: 'Perintah Stok Opname', color: 'green', icon: ClipboardList, href: '/stock' },
      { label: 'Hasil Stok Opname', color: 'green', icon: FileText, href: '/stock' },
      { label: 'Barang & Jasa', color: 'blue', icon: Package, action: 'barang' },
      { label: 'Gudang', color: 'blue', icon: Warehouse, href: '/stock' },
      { label: 'Satuan Barang', color: 'blue', icon: Coins },
      { label: 'Kategori Barang', color: 'blue', icon: List },
      { label: 'Merek Barang', color: 'blue', icon: FileText },
      { label: 'Pemenuhan Pesanan', color: 'purple', icon: Search },
      { label: 'Barang per Gudang', color: 'purple', icon: Warehouse, href: '/stock' },
      { label: 'Barang Stok Minimum', color: 'purple', icon: Package, href: '/stock' }
    ]
  },
  asettetap: {
    title: 'Aset Tetap',
    cols: 3,
    items: [
      { label: 'Aset Tetap', color: 'blue', icon: Building2, href: '/accounts' },
      { label: 'Kategori Aset', color: 'blue', icon: List, href: '/accounts' },
      { label: 'Kategori Aset Tetap Pajak', color: 'blue', icon: FileText, href: '/taxes' },
      { label: 'Perubahan Aset Tetap', color: 'green', icon: RefreshCw, href: '/journal' },
      { label: 'Disposisi Aset Tetap', color: 'green', icon: Trash2, href: '/journal' },
      { label: 'Pindah Aset', color: 'green', icon: Truck, href: '/accounts' },
      { label: 'Aset per Lokasi', color: 'purple', icon: MapPin }
    ]
  },
  smartlinktax: {
    title: 'SmartLink Tax',
    cols: 2,
    items: [
      { label: 'e-Faktur CTAS', color: 'purple', icon: FileSpreadsheet, href: '/taxes' },
      { label: 'Email Faktur Pajak', color: 'purple', icon: Mail, href: '/taxes' }
    ]
  },
  laporan: {
    title: 'Daftar Laporan',
    cols: 3,
    items: [
      { label: 'Daftar Laporan', color: 'purple', icon: FileText, href: '/reports' },
      { label: 'Neraca & Laba Rugi', color: 'purple', icon: FileSpreadsheet, href: '/reports' },
      { label: 'Arus Kas PSAK', color: 'purple', icon: Sparkles, href: '/reports/arus-kas' }
    ]
  }
};

const TILE_COLOR_CLASSES: Record<string, string> = {
  blue: 'bg-[#d0ebff] border-[#74c0fc] text-[#0b5ed7] hover:bg-[#bae0ff]',
  green: 'bg-[#d3f9d8] border-[#8ce99a] text-[#2b8a3e] hover:bg-[#b2f2bb]',
  purple: 'bg-[#f3d9fa] border-[#e599f7] text-[#862e9c] hover:bg-[#eebefa]',
  orange: 'bg-[#ffe8cc] border-[#ffc078] text-[#d9480f] hover:bg-[#ffd8a8]'
};

function formatRupiah(val: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val || 0);
}

const FormRow = ({ label, required, children, alignTop }: { label: string; required?: boolean; children: React.ReactNode; alignTop?: boolean }) => (
  <div className={`grid grid-cols-[160px_1fr] gap-3 mb-2.5 items-${alignTop ? 'start' : 'center'}`}>
    <div className="text-[12px] text-[#333333]">
      {label} {required && <span className="text-[#e31b23] font-bold">*</span>}
    </div>
    <div>{children}</div>
  </div>
);

const SearchInput = ({ placeholder }: { placeholder?: string }) => (
  <div className="relative flex items-center w-full">
    <input
      type="text"
      placeholder={placeholder || 'Cari/Pilih...'}
      className="w-full h-[26px] pl-2.5 pr-7 border border-[#c6cbd4] rounded-[3px] text-[11.5px] bg-white focus:outline-none focus:border-[#2b579a]"
    />
    <Search size={12} className="absolute right-2.5 text-gray-500 pointer-events-none" />
  </div>
);

const TagSearchInput = ({ initialTag }: { initialTag: string }) => (
  <div className="relative flex items-center w-full h-[26px] border border-[#c6cbd4] rounded-[3px] bg-white px-2">
    <span className="bg-[#e0f2fe] border border-[#bae6fd] text-[#0369a1] text-[11px] px-1.5 py-0.5 rounded flex items-center gap-1.5">
      {initialTag}
      <X size={11} className="cursor-pointer hover:text-red-500" />
    </span>
    <Search size={12} className="absolute right-2.5 text-gray-500" />
  </div>
);

const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: (val: boolean) => void }) => (
  <div
    onClick={() => onChange(!checked)}
    className={`w-7 h-[15px] rounded-full p-0.5 cursor-pointer transition-colors ${
      checked ? 'bg-[#1d4f91]' : 'bg-gray-300'
    }`}
  >
    <div
      className={`w-3.5 h-3.5 rounded-full bg-white shadow-md transform transition-transform ${
        checked ? 'translate-x-3.5' : 'translate-x-0'
      }`}
    />
  </div>
);

const AddressFields = ({ value, onChange, disabled }: { value?: string; onChange?: (val: string) => void; disabled?: boolean }) => (
  <div className={`space-y-2 w-full ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
    <div className="flex border border-[#c6cbd4] rounded-[3px] overflow-hidden bg-white">
      <div className="w-[50px] bg-[#f8f9fb] border-r border-[#c6cbd4] text-[11px] text-gray-500 p-1.5 flex items-start">
        Jalan
      </div>
      <textarea
        rows={3}
        value={value || ''}
        onChange={(e) => onChange && onChange(e.target.value)}
        disabled={disabled}
        placeholder="Nama jalan, gedung, nomor..."
        className="w-full p-1.5 text-[11.5px] focus:outline-none resize-none"
      />
    </div>
    <div className="grid grid-cols-[1fr_120px] gap-2">
      <div className="flex border border-[#c6cbd4] rounded-[3px] overflow-hidden bg-white h-[26px] items-center">
        <div className="w-[50px] bg-[#f8f9fb] border-r border-[#c6cbd4] text-[11px] text-gray-500 px-1.5">Kota</div>
        <input type="text" disabled={disabled} placeholder="Bandung" className="w-full px-2 text-[11.5px] focus:outline-none" />
      </div>
      <div className="flex border border-[#c6cbd4] rounded-[3px] overflow-hidden bg-white h-[26px] items-center">
        <div className="w-[50px] bg-[#f8f9fb] border-r border-[#c6cbd4] text-[11px] text-gray-500 px-1.5">K.Pos</div>
        <input type="text" disabled={disabled} placeholder="40132" className="w-full px-2 text-[11.5px] focus:outline-none" />
      </div>
    </div>
    <div className="flex border border-[#c6cbd4] rounded-[3px] overflow-hidden bg-white h-[26px] items-center">
      <div className="w-[50px] bg-[#f8f9fb] border-r border-[#c6cbd4] text-[11px] text-gray-500 px-1.5">Provinsi</div>
      <input type="text" disabled={disabled} placeholder="Jawa Barat" className="w-full px-2 text-[11.5px] focus:outline-none" />
    </div>
    <div className="flex border border-[#c6cbd4] rounded-[3px] overflow-hidden bg-white h-[26px] items-center">
      <div className="w-[50px] bg-[#f8f9fb] border-r border-[#c6cbd4] text-[11px] text-gray-500 px-1.5">Negara</div>
      <input type="text" disabled={disabled} defaultValue="Indonesia" className="w-full px-2 text-[11.5px] focus:outline-none" />
    </div>
  </div>
);

export default function AccurateMergedApp() {
  const router = useRouter();

  const [openTabs, setOpenTabs] = useState([
    { id: 'dashboard', label: 'Dashboard', closable: false },
    { id: 'persiapan', label: 'Persiapan Data Perusahaan', closable: false }
  ]);
  const [activeMainTab, setActiveMainTab] = useState('dashboard');
  const [activeSidebarMenu, setActiveSidebarMenu] = useState<string | null>(null);

  const [showWidgetList, setShowWidgetList] = useState(false);
  const [widgetSearch, setWidgetSearch] = useState('');
  const [activeWidgets, setActiveWidgets] = useState([
    'aktifitas',
    'arus_kas',
    'penjualan',
    'laba_rugi',
    'pelanggan_berutang',
    'tren_penjualan'
  ]);

  // LIVE BACKEND DATA STATES
  const [stats, setStats] = useState({
    kas: 11100000,
    piutang: 0,
    penjualan: 10000000,
    beban: 0,
    labaRugi: 10000000,
    invoiceCount: 1,
    itemCount: 2,
    partnerCount: 2
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // MASTER DATA FORM STATES
  // Barang & Jasa
  const [namaBarang, setNamaBarang] = useState('');
  const [kodeBarang, setKodeBarang] = useState('');
  const [satuanBarang, setSatuanBarang] = useState('PCS');
  const [hargaJual, setHargaJual] = useState('');
  const [hargaBeli, setHargaBeli] = useState('');

  // Pelanggan
  const [namaPelanggan, setNamaPelanggan] = useState('');
  const [emailPelanggan, setEmailPelanggan] = useState('');
  const [telpPelanggan, setTelpPelanggan] = useState('');
  const [alamatPelanggan, setAlamatPelanggan] = useState('');

  // Pemasok
  const [namaPemasok, setNamaPemasok] = useState('');
  const [emailPemasok, setEmailPemasok] = useState('');
  const [telpPemasok, setTelpPemasok] = useState('');
  const [alamatPemasok, setAlamatPemasok] = useState('');

  // Modal Kas & Bank
  const [showKasBankModal, setShowKasBankModal] = useState(false);
  const [kasBankName, setKasBankName] = useState('');
  const [kasBankSaldo, setKasBankSaldo] = useState('');

  // Tab selections
  const [barangTab, setBarangTab] = useState('Umum');
  const [pelangganTab, setPelangganTab] = useState('Umum');
  const [pemasokTab, setPemasokTab] = useState('Umum');

  const [idPemasokToggle, setIdPemasokToggle] = useState(true);
  const [idPelangganToggle, setIdPelangganToggle] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [stokAwalRows, setStokAwalRows] = useState<any[]>([]);
  const [pelangganKontakRows, setPelangganKontakRows] = useState<any[]>([]);
  const [pelangganPiutangRows, setPelangganPiutangRows] = useState<any[]>([]);
  const [pemasokKontakRows, setPemasokKontakRows] = useState<any[]>([]);
  const [pemasokUtangRows, setPemasokUtangRows] = useState<any[]>([]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // FETCH LIVE DATA DARI PRISMA BACKEND
  const fetchDashboardData = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setActivities(data.activities);
      }
    } catch (e) {
      console.error('Gagal mengambil data dashboard:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // SUBMIT HANDLERS TO BACKEND
  const handleSaveBarang = async () => {
    if (!namaBarang.trim()) {
      showToast('Nama Barang wajib diisi!');
      return;
    }
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: namaBarang,
          code: kodeBarang || `BRG-${Date.now().toString().slice(-4)}`,
          unit: satuanBarang,
          sellPrice: hargaJual.replace(/[^0-9]/g, '') || 0,
          costPrice: hargaBeli.replace(/[^0-9]/g, '') || 0
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✅ Barang "${namaBarang}" berhasil disimpan ke database!`);
        setNamaBarang('');
        setKodeBarang('');
        setHargaJual('');
        setHargaBeli('');
        fetchDashboardData();
      } else {
        showToast(`Gagal: ${data.error}`);
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  const handleSavePelanggan = async () => {
    if (!namaPelanggan.trim()) {
      showToast('Nama Pelanggan wajib diisi!');
      return;
    }
    try {
      const res = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: namaPelanggan,
          type: 'CUSTOMER',
          email: emailPelanggan,
          phone: telpPelanggan,
          address: alamatPelanggan
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✅ Pelanggan "${namaPelanggan}" berhasil disimpan ke database!`);
        setNamaPelanggan('');
        setEmailPelanggan('');
        setTelpPelanggan('');
        setAlamatPelanggan('');
        fetchDashboardData();
      } else {
        showToast(`Gagal: ${data.error}`);
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  const handleSavePemasok = async () => {
    if (!namaPemasok.trim()) {
      showToast('Nama Pemasok wajib diisi!');
      return;
    }
    try {
      const res = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: namaPemasok,
          type: 'VENDOR',
          email: emailPemasok,
          phone: telpPemasok,
          address: alamatPemasok
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✅ Pemasok "${namaPemasok}" berhasil disimpan ke database!`);
        setNamaPemasok('');
        setEmailPemasok('');
        setTelpPemasok('');
        setAlamatPemasok('');
        fetchDashboardData();
      } else {
        showToast(`Gagal: ${data.error}`);
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  const handleSaveKasBank = async () => {
    if (!kasBankName.trim()) {
      showToast('Nama kas & bank wajib diisi!');
      return;
    }
    try {
      const res = await fetch('/api/cash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: kasBankName,
          balance: kasBankSaldo.replace(/[^0-9]/g, '') || 0
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowKasBankModal(false);
        showToast(`✅ Rekening "${kasBankName}" berhasil dibuat di database!`);
        setKasBankName('');
        setKasBankSaldo('');
        fetchDashboardData();
      } else {
        showToast(`Gagal: ${data.error}`);
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  const handleOpenModuleTab = (id: string, label: string) => {
    if (!openTabs.find((t) => t.id === id)) {
      setOpenTabs([...openTabs, { id, label, closable: true }]);
    }
    setActiveMainTab(id);
  };

  const handleCloseMainTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const filtered = openTabs.filter((t) => t.id !== id);
    setOpenTabs(filtered);
    if (activeMainTab === id && filtered.length > 0) {
      setActiveMainTab('dashboard');
    }
  };

  const handleToggleWidget = (id: string, title: string) => {
    if (activeWidgets.includes(id)) {
      setActiveWidgets(activeWidgets.filter((w) => w !== id));
      showToast(`Widget "${title}" dihapus`);
    } else {
      setActiveWidgets([...activeWidgets, id]);
      showToast(`Widget "${title}" ditambahkan`);
    }
  };

  const sidebarNavItems = [
    { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
    { id: 'perusahaan', label: 'Perusahaan', icon: Building2 },
    { id: 'bukubesar', label: 'Buku Besar', icon: BookOpen },
    { id: 'kasbank', label: 'Kas & Bank', icon: Landmark },
    { id: 'penjualan', label: 'Penjualan', icon: Coins },
    { id: 'pembelian', label: 'Pembelian', icon: ShoppingCart },
    { id: 'persediaan', label: 'Persediaan', icon: Truck },
    { id: 'asettetap', label: 'Aset Tetap', icon: Package },
    { id: 'smartlinktax', label: 'SmartLink', icon: Calculator },
    { id: 'laporan', label: 'Laporan', icon: History }
  ];

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#eef1f6] font-sans select-none">
      {toastMsg && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#14234b] text-white text-[12px] px-4 py-2.5 rounded shadow-xl flex items-center gap-2 border border-blue-400/40 animate-fade-in">
          <Check size={14} className="text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. TOP HEADER */}
      <header className="h-[42px] bg-gradient-to-r from-[#14234b] via-[#1a2f66] to-[#0b142c] text-white flex items-center justify-between px-3 shrink-0 relative overflow-hidden shadow-md">
        <div className="flex items-center gap-2 z-10">
          <div className="w-6 h-6 rounded-full bg-[#e31b23] flex items-center justify-center font-bold text-xs shadow">
            a
          </div>
          <div className="leading-none">
            <span className="font-bold tracking-tight text-[15px]">accurate</span>
            <span className="text-[9px] text-gray-300 block">v1.0.1#4986-3026256 · PSAK Live</span>
          </div>

          <div className="ml-4 flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] px-2 py-0.5 rounded font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              DB SQLite Connected
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 z-10 text-[12px]">
          <span className="bg-[#e31b23] text-white text-[9px] px-1.5 py-0.5 rounded font-bold">NEW</span>
          <span className="bg-[#00a2ed] text-white text-[9px] px-1.5 py-0.5 rounded font-bold">PSAK</span>
          <button onClick={fetchDashboardData} title="Sinkronkan data database" className="p-1 text-white/80 hover:text-white transition">
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          <Search size={15} className="cursor-pointer text-white/80 hover:text-white" />
          <HelpCircle size={15} className="cursor-pointer text-white/80 hover:text-white" />
          <Bell size={15} className="cursor-pointer text-white/80 hover:text-white" />
          <div className="flex items-center gap-2 pl-2 border-l border-white/20">
            <div className="text-right leading-tight">
              <div className="font-medium text-[12px]">Operator</div>
              <div className="text-[10px] text-gray-300">Akar Poros Finance</div>
            </div>
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
              <User size={14} />
            </div>
          </div>
        </div>
      </header>

      {/* 2. BODY WORKSPACE */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* SIDEBAR DENGAN TEKS KECIL */}
        <aside className="w-[64px] bg-[#14234b] flex flex-col items-center py-2 gap-1 text-white/85 shrink-0 z-30 border-r border-[#0f1b3a] overflow-y-auto no-scrollbar">
          {sidebarNavItems.map((item) => {
            const IconComp = item.icon;
            const isSelected = activeSidebarMenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSidebarMenu(isSelected ? null : item.id)}
                className={`w-[56px] py-1.5 px-0.5 flex flex-col items-center justify-center rounded transition gap-1 ${
                  isSelected ? 'bg-white/25 text-white shadow-inner' : 'hover:text-white hover:bg-white/10'
                }`}
                title={item.label}
              >
                <IconComp size={17} strokeWidth={1.8} />
                <span className="text-[9px] leading-tight text-center font-normal tracking-tight truncate w-full">
                  {item.label}
                </span>
              </button>
            );
          })}
        </aside>

        {/* POP-UP MENU SIDEBAR KIRI */}
        {activeSidebarMenu && SIDEBAR_MENUS[activeSidebarMenu] && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setActiveSidebarMenu(null)} />
            <div className="absolute left-[68px] top-4 z-30 bg-white border border-gray-300 rounded-[4px] shadow-2xl p-4 min-w-[240px] max-h-[90vh] overflow-y-auto">
              <div className="text-[14px] text-[#333333] font-medium pb-2 mb-3 border-b-2 border-[#e31b23] flex items-center justify-between">
                <span>{SIDEBAR_MENUS[activeSidebarMenu].title}</span>
                <span className="text-[10px] text-gray-400 font-mono">Modul PSAK</span>
              </div>
              <div
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${SIDEBAR_MENUS[activeSidebarMenu].cols}, minmax(78px, 1fr))` }}
              >
                {SIDEBAR_MENUS[activeSidebarMenu].items.map((sub: any, idx: number) => {
                  const SubIcon = sub.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveSidebarMenu(null);
                        if (sub.href) {
                          router.push(sub.href);
                        } else if (sub.action === 'pelanggan') {
                          handleOpenModuleTab('pelanggan', 'Pelanggan');
                        } else if (sub.action === 'pemasok') {
                          handleOpenModuleTab('pemasok', 'Pemasok');
                        } else if (sub.action === 'barang') {
                          handleOpenModuleTab('barang', 'Barang & Jasa');
                        } else {
                          showToast(`Membuka menu ${sub.label}...`);
                        }
                      }}
                      className={`w-[82px] h-[76px] border rounded-[3px] p-1.5 flex flex-col items-center justify-center text-center gap-1.5 transition shadow-sm ${
                        TILE_COLOR_CLASSES[sub.color]
                      }`}
                    >
                      <SubIcon size={22} strokeWidth={1.7} />
                      <span className="text-[10px] leading-tight font-medium text-[#222222] line-clamp-2">
                        {sub.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* 3. MAIN WORKSPACE CANVAS */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#eef1f6]">
          {/* TOP TABS */}
          <div className="h-[34px] bg-[#dfe3e8] border-b border-[#cbd0d8] px-2 flex items-end gap-1 shrink-0 overflow-x-auto no-scrollbar">
            {openTabs.map((tab) => {
              const isActive = activeMainTab === tab.id;
              return (
                <div
                  key={tab.id}
                  onClick={() => setActiveMainTab(tab.id)}
                  className={`px-3.5 h-[28px] text-[12px] rounded-t-[3px] border-t border-l border-r cursor-pointer flex items-center gap-2 transition select-none shrink-0 ${
                    isActive
                      ? 'bg-white border-[#c8ccd4] text-[#111111] font-medium z-10 shadow-sm'
                      : 'bg-[#cfd4dc] border-[#b8bec9] text-[#555555] hover:bg-[#d8dce4]'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.closable && (
                    <X
                      size={12}
                      onClick={(e) => handleCloseMainTab(e, tab.id)}
                      className="hover:text-red-600 stroke-[2.5]"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* TAB: DASHBOARD */}
          {activeMainTab === 'dashboard' && (
            <div className="flex-1 flex flex-col overflow-hidden bg-[#eef1f6]">
              {/* TOP ACTION BAR DASHBOARD */}
              <div className="h-[40px] bg-white border-b border-[#d0d5dd] px-3 flex items-center justify-between shrink-0 relative">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowWidgetList(!showWidgetList)}
                    className="h-[27px] px-6 bg-[#d8eafe] hover:bg-[#c3dffd] border border-[#6ca6e8] text-[#0c4da2] text-[12px] font-medium rounded-[2px] flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Plus size={13} strokeWidth={2.5} />
                    <span>Widget</span>
                  </button>

                  <button
                    onClick={fetchDashboardData}
                    className="h-[27px] px-3 bg-white hover:bg-gray-50 border border-[#c6cbd4] text-gray-700 text-[11.5px] rounded-[2px] flex items-center gap-1.5 shadow-sm"
                  >
                    <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
                    <span>Sinkronisasi</span>
                  </button>

                  {showWidgetList && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setShowWidgetList(false)} />
                      <div className="absolute left-0 top-[32px] z-40 w-[370px] bg-white border border-[#b8c0cc] rounded-[3px] shadow-2xl overflow-hidden">
                        <div className="bg-[#14234b] text-white px-3 py-2 flex items-center justify-between text-[12px] font-medium">
                          <span>Kelola Widget Dashboard ({ALL_WIDGETS.length})</span>
                          <X size={14} onClick={() => setShowWidgetList(false)} className="cursor-pointer hover:text-red-300" />
                        </div>
                        <div className="p-2 border-b border-gray-200 bg-[#f8f9fb]">
                          <div className="relative">
                            <input
                              type="text"
                              value={widgetSearch}
                              onChange={(e) => setWidgetSearch(e.target.value)}
                              placeholder="Cari widget..."
                              className="w-full h-[26px] pl-2.5 pr-7 border border-[#c6cbd4] rounded-[3px] text-[11.5px] focus:outline-none"
                            />
                            <Search size={12} className="absolute right-2 top-1.5 text-gray-500" />
                          </div>
                        </div>
                        <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-200">
                          {ALL_WIDGETS.filter(
                            (w) =>
                              w.title.toLowerCase().includes(widgetSearch.toLowerCase()) ||
                              w.desc.toLowerCase().includes(widgetSearch.toLowerCase())
                          ).map((w) => {
                            const isAdded = activeWidgets.includes(w.id);
                            return (
                              <div
                                key={w.id}
                                onClick={() => handleToggleWidget(w.id, w.title)}
                                className="p-2.5 hover:bg-[#f0f6ff] cursor-pointer flex items-start justify-between gap-3 transition"
                              >
                                <div>
                                  <div className="text-[12px] font-bold text-[#1d4f91]">{w.title}</div>
                                  <div className="text-[11px] text-[#555555] leading-snug mt-0.5">{w.desc}</div>
                                </div>
                                <span
                                  className={`shrink-0 mt-0.5 px-2 py-0.5 rounded text-[10px] font-medium border ${
                                    isAdded ? 'bg-green-50 text-green-700 border-green-300' : 'bg-gray-100 text-gray-600 border-gray-300'
                                  }`}
                                >
                                  {isAdded ? 'Aktif' : '+ Tambah'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-[11px] text-gray-500">
                    <span className="font-semibold text-gray-700">{stats.invoiceCount}</span> Faktur · <span className="font-semibold text-gray-700">{stats.itemCount}</span> Barang · <span className="font-semibold text-gray-700">{stats.partnerCount}</span> Mitra
                  </div>
                  <select className="w-[180px] h-[27px] px-2 border border-[#c6cbd4] rounded-[2px] text-[12px] text-[#333333] bg-white focus:outline-none">
                    <option>Dashboard Utama</option>
                  </select>
                </div>
              </div>

              {/* DASHBOARD WIDGETS GRID */}
              <div className="flex-1 p-2.5 overflow-y-auto space-y-2.5">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
                  {/* WIDGET 1: AKTIFITAS TERAKHIR ANDA */}
                  {activeWidgets.includes('aktifitas') && (
                    <div className="bg-white border border-[#cfd4dc] rounded-[2px] shadow-sm h-[230px] flex flex-col">
                      <div className="h-[28px] px-3 border-b border-gray-200 flex items-center justify-between text-[11.5px] font-bold text-[#333333]">
                        <span>Aktifitas Jurnal Terakhir (Live)</span>
                        <RefreshCw size={12} onClick={fetchDashboardData} className="cursor-pointer hover:text-blue-600" />
                      </div>
                      <div className="p-3 flex-1 overflow-y-auto divide-y divide-gray-100 text-[11.5px]">
                        {activities.length === 0 ? (
                          <div className="h-full flex items-center justify-center text-gray-400 italic">
                            Belum ada aktifitas jurnal
                          </div>
                        ) : (
                          activities.map((act) => (
                            <div key={act.id} className="py-2 flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#1d64b8] mt-1.5 shrink-0" />
                                <div>
                                  <div className="font-semibold text-[#222222] line-clamp-1">{act.memo}</div>
                                  <div className="text-[10px] text-gray-500">{new Date(act.date).toLocaleDateString('id-ID')} · {act.ref || 'Jurnal'}</div>
                                </div>
                              </div>
                              <span className="font-mono text-[11px] font-semibold text-slate-700 shrink-0">
                                {formatRupiah(act.amount)}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* WIDGET 2: ARUS KAS & SALDO BANK */}
                  {activeWidgets.includes('arus_kas') && (
                    <div className="bg-white border border-[#cfd4dc] rounded-[2px] shadow-sm h-[230px] flex flex-col">
                      <div className="h-[28px] px-3 border-b border-gray-200 flex items-center justify-between text-[11.5px] font-bold text-[#333333]">
                        <span>Kas & Bank (Saldo Nyata)</span>
                        <Landmark size={12} className="text-emerald-600" />
                      </div>
                      <div className="flex-1 p-4 flex flex-col justify-between">
                        <div>
                          <div className="text-[11px] text-gray-500 mb-1">Total Saldo Likuid Kas/Bank</div>
                          <div className="text-[24px] font-bold text-emerald-600 font-mono">
                            {formatRupiah(stats.kas)}
                          </div>
                          <div className="text-[10.5px] text-gray-400 mt-1">Dihitung otomatis dari debit/kredit akun kas dan bank</div>
                        </div>
                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                          <button onClick={() => setShowKasBankModal(true)} className="text-[11.5px] text-blue-700 hover:underline flex items-center gap-1 font-medium">
                            <Plus size={12} /> Tambah Rekening
                          </button>
                          <button onClick={() => router.push('/cash')} className="text-[11.5px] text-gray-600 hover:text-black">
                            Lihat Mutasi →
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* WIDGET 3: TREN PENJUALAN */}
                  {activeWidgets.includes('tren_penjualan') && (
                    <div className="bg-white border border-[#cfd4dc] rounded-[2px] shadow-sm h-[230px] flex flex-col">
                      <div className="h-[28px] px-3 border-b border-gray-200 flex items-center justify-between text-[11.5px] font-bold text-[#333333]">
                        <span>Tren Penjualan (Omset PSAK)</span>
                        <TrendingUp size={12} className="text-blue-600" />
                      </div>
                      <div className="flex-1 p-3 flex flex-col justify-between text-[10px] text-gray-600">
                        <div>
                          <div className="text-right text-[9.5px] text-gray-500">(Bulan berjalan)</div>
                          <div className="text-[20px] font-bold text-[#0c4da2] font-mono mt-0.5">
                            {formatRupiah(stats.penjualan)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 my-auto">
                          <span>0</span>
                          <div className="flex-1 relative h-[2px] bg-[#0088cc] flex items-center justify-between px-4">
                            {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Kemarin', 'Hari ini'].map((_, i) => (
                              <div key={i} className="w-2 h-2 rounded-full bg-[#0088cc]" />
                            ))}
                          </div>
                          <span>{formatRupiah(stats.penjualan)}</span>
                        </div>
                        <div className="border-t border-gray-200 pt-1.5 flex justify-between px-3 text-[10px] text-gray-600">
                          <span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Kemarin</span><span className="font-bold text-blue-700">Hari ini</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ROW 2: LABA RUGI & PIUTANG */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
                  {/* LABA RUGI TAHUN INI */}
                  {activeWidgets.includes('laba_rugi') && (
                    <div className="bg-white border border-[#cfd4dc] rounded-[2px] shadow-sm h-[200px] flex flex-col">
                      <div className="h-[28px] px-3 border-b border-gray-200 flex items-center justify-between text-[11.5px] font-bold text-[#333333]">
                        <span>Laba / Rugi Bersih Tahun Ini</span>
                        <Percent size={12} className="text-indigo-600" />
                      </div>
                      <div className="flex-1 p-4 flex flex-col justify-between">
                        <div>
                          <div className="text-[11px] text-gray-500">Pendapatan Bersih - Beban Operasional</div>
                          <div className="text-[24px] font-bold text-indigo-700 font-mono mt-1">
                            {formatRupiah(stats.labaRugi)}
                          </div>
                        </div>
                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                          <span className="text-gray-500">Beban: {formatRupiah(stats.beban)}</span>
                          <button onClick={() => router.push('/reports/laba-rugi')} className="text-blue-700 hover:underline">
                            Laporan Lengkap →
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PELANGGAN BERUTANG (PIUTANG) */}
                  {activeWidgets.includes('pelanggan_berutang') && (
                    <div className="bg-white border border-[#cfd4dc] rounded-[2px] shadow-sm h-[200px] flex flex-col">
                      <div className="h-[28px] px-3 border-b border-gray-200 flex items-center justify-between text-[11.5px] font-bold text-[#333333]">
                        <span>Piutang Usaha (AR)</span>
                        <DollarSign size={12} className="text-amber-600" />
                      </div>
                      <div className="flex-1 p-4 flex flex-col justify-between">
                        <div>
                          <div className="text-[11px] text-gray-500">Total Tagihan Berjalan ke Pelanggan</div>
                          <div className="text-[24px] font-bold text-amber-700 font-mono mt-1">
                            {formatRupiah(stats.piutang)}
                          </div>
                        </div>
                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                          <span className="text-gray-500">Status: {stats.piutang === 0 ? 'Semua Lunas' : 'Menunggu Pelunasan'}</span>
                          <button onClick={() => router.push('/reports/piutang')} className="text-blue-700 hover:underline">
                            Daftar Piutang →
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* KEGIATAN MENDATANG */}
                  {activeWidgets.includes('kegiatan_mendatang') && (
                    <div className="bg-white border border-[#cfd4dc] rounded-[2px] shadow-sm h-[200px] flex flex-col">
                      <div className="h-[28px] px-3 border-b border-gray-200 flex items-center justify-between text-[11.5px] font-bold text-[#333333]">
                        <span>Kegiatan Mendatang</span>
                        <Calendar size={12} className="text-gray-500" />
                      </div>
                      <div className="flex-1 p-4 flex items-center justify-center text-[11.5px] italic text-gray-500">
                        Tidak ada transaksi jatuh tempo terdekat
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: PERSIAPAN DATA PERUSAHAAN */}
          {activeMainTab === 'persiapan' && (
            <div className="flex-1 p-3 overflow-y-auto">
              <div className="max-w-[1300px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                <div className="lg:col-span-5 bg-white border border-[#cfd4dc] rounded-[3px] shadow-sm p-6 flex flex-col items-center text-center">
                  <div className="w-[180px] h-[160px] my-3 relative flex items-center justify-center">
                    <div className="w-[150px] h-[150px] rounded-full bg-[#fde8ed] flex items-center justify-center relative">
                      <div className="text-center">
                        <Users size={52} className="text-[#14234b] mx-auto mb-2" />
                        <div className="flex gap-2 justify-center">
                          <span className="bg-[#e8f5e9] text-green-700 text-[10px] px-2 py-0.5 rounded font-medium">PSAK Ready</span>
                          <span className="bg-[#e3f2fd] text-blue-700 text-[10px] px-2 py-0.5 rounded font-medium">Double-Entry</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <h2 className="text-[15px] font-bold text-[#222222] mb-2">Selamat Datang di Accurate Online</h2>
                  <p className="text-[12px] text-gray-600 leading-relaxed mb-6">
                    Sistem akuntansi terintegrasi standar PSAK Indonesia. Lengkapi master data awal untuk mulai mencatat transaksi faktur, stok perpetual, dan penerimaan kas.
                  </p>
                  <div className="flex items-center justify-center gap-4 w-full">
                    <button onClick={() => router.push('/setup')} className="w-[130px] h-[32px] bg-[#0c4da2] hover:bg-[#093b7d] text-white text-[12px] font-medium rounded-[3px] shadow-sm">
                      Kelola Fitur
                    </button>
                    <button onClick={() => router.push('/reports')} className="w-[130px] h-[32px] bg-[#63b521] hover:bg-[#549c1b] text-white text-[12px] font-medium rounded-[3px] shadow-sm">
                      Daftar Laporan
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-white border border-[#cfd4dc] rounded-[3px] shadow-sm p-5">
                  <h2 className="text-[14px] font-medium text-[#222222] mb-4">Lengkapi data perusahaan untuk memulai transaksi</h2>
                  <div className="space-y-3">
                    <div className="border border-[#d0d5dd] rounded-[3px] p-3.5 flex items-center justify-between hover:bg-gray-50 transition">
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded border border-rose-300 bg-rose-50 text-rose-600 flex items-center justify-center mt-0.5">
                          <Landmark size={15} />
                        </div>
                        <div>
                          <div className="font-bold text-[#222222] text-[12.5px]">Kas & Bank</div>
                          <div className="text-[11px] text-gray-500">Masukkan rekening bank operasional beserta saldo awal saat ini</div>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowKasBankModal(true)}
                        className="px-5 h-[28px] border border-[#1d4f91] text-[#1d4f91] hover:bg-blue-50 text-[12px] rounded-[3px] font-medium shrink-0"
                      >
                        Buat Data
                      </button>
                    </div>

                    <div className="border border-[#d0d5dd] rounded-[3px] p-3.5 flex items-center justify-between hover:bg-gray-50 transition">
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded border border-rose-300 bg-rose-50 text-rose-600 flex items-center justify-center mt-0.5">
                          <Package size={15} />
                        </div>
                        <div>
                          <div className="font-bold text-[#222222] text-[12.5px]">Barang & Jasa ({stats.itemCount})</div>
                          <div className="text-[11px] text-gray-500">Daftar barang persediaan perpetual dan jasa yang dijual</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span onClick={() => router.push('/items')} className="text-[12px] text-[#0c4da2] hover:underline cursor-pointer">Lihat Semua</span>
                        <button
                          onClick={() => handleOpenModuleTab('barang', 'Barang & Jasa')}
                          className="px-5 h-[28px] border border-[#1d4f91] text-[#1d4f91] hover:bg-blue-50 text-[12px] rounded-[3px] font-medium"
                        >
                          Buat Data
                        </button>
                      </div>
                    </div>

                    <div className="border border-[#d0d5dd] rounded-[3px] p-3.5 flex items-center justify-between hover:bg-gray-50 transition">
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded border border-rose-300 bg-rose-50 text-rose-600 flex items-center justify-center mt-0.5">
                          <User size={15} />
                        </div>
                        <div>
                          <div className="font-bold text-[#222222] text-[12.5px]">Pelanggan</div>
                          <div className="text-[11px] text-gray-500">Daftar pelanggan beserta saldo piutang awal dagang</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span onClick={() => router.push('/partners')} className="text-[12px] text-[#0c4da2] hover:underline cursor-pointer">Lihat Semua</span>
                        <button
                          onClick={() => handleOpenModuleTab('pelanggan', 'Pelanggan')}
                          className="px-5 h-[28px] border border-[#1d4f91] text-[#1d4f91] hover:bg-blue-50 text-[12px] rounded-[3px] font-medium"
                        >
                          Buat Data
                        </button>
                      </div>
                    </div>

                    <div className="border border-[#d0d5dd] rounded-[3px] p-3.5 flex items-center justify-between hover:bg-gray-50 transition">
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded border border-rose-300 bg-rose-50 text-rose-600 flex items-center justify-center mt-0.5">
                          <Truck size={15} />
                        </div>
                        <div>
                          <div className="font-bold text-[#222222] text-[12.5px]">Pemasok</div>
                          <div className="text-[11px] text-gray-500">Daftar pemasok vendor beserta saldo utang awal dagang</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span onClick={() => router.push('/partners')} className="text-[12px] text-[#0c4da2] hover:underline cursor-pointer">Lihat Semua</span>
                        <button
                          onClick={() => handleOpenModuleTab('pemasok', 'Pemasok')}
                          className="px-5 h-[28px] border border-[#1d4f91] text-[#1d4f91] hover:bg-blue-50 text-[12px] rounded-[3px] font-medium"
                        >
                          Buat Data
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: BARANG & JASA */}
          {activeMainTab === 'barang' && (
            <div className="flex-1 flex flex-col overflow-hidden bg-[#f4f6f9]">
              <div className="h-[35px] bg-white border-b border-[#d0d5dd] flex items-center justify-between px-1.5 shrink-0">
                <div className="flex items-center gap-1 h-full pt-1">
                  <button onClick={() => router.push('/items')} className="w-8 h-[26px] bg-[#63b521] text-white rounded-[2px] flex items-center justify-center shadow-sm" title="Lihat Daftar Barang">
                    <List size={15} />
                  </button>
                  <div className="h-full px-3 bg-[#f4f6f9] border-t border-l border-r border-[#c8ccd4] rounded-t-[3px] flex items-center gap-2 text-[12px] text-[#222222]">
                    <span>Data Baru</span>
                    <X size={12} onClick={(e) => handleCloseMainTab(e, 'barang')} className="cursor-pointer hover:text-red-600 stroke-[2.5]" />
                  </div>
                </div>
                <button className="w-6 h-6 bg-[#ffa800] text-white rounded-[3px] flex items-center justify-center mr-1 shadow-sm">
                  <Lightbulb size={13} />
                </button>
              </div>

              <div className="px-2 pt-2 flex items-end gap-1 flex-wrap">
                {['Umum', 'Penjualan / Pembelian', 'Stok', 'Akun', 'Gambar', 'Lain-lain'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setBarangTab(t)}
                    className={`h-[26px] px-3 text-[12px] rounded-t-[3px] border-t border-l border-r transition ${
                      barangTab === t ? 'bg-white border-[#c8ccd4] text-[#111111] font-medium relative -mb-[1px] z-10' : 'bg-[#dfe3e8] border-[#c8ccd4] text-[#555555]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="flex-1 flex px-2 pb-3 gap-2.5 overflow-hidden">
                <div className="flex-1 bg-white border border-[#c8ccd4] rounded-b-[2px] rounded-tr-[2px] p-4 overflow-y-auto shadow-sm">
                  {barangTab === 'Umum' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-[1300px]">
                      <div>
                        <h3 className="text-[13.5px] text-[#1d64b8] border-b border-gray-200 pb-1.5 mb-3 font-semibold">Informasi Barang & Jasa</h3>
                        <FormRow label="Nama Barang" required>
                          <input
                            type="text"
                            value={namaBarang}
                            onChange={(e) => setNamaBarang(e.target.value)}
                            placeholder="Contoh: Kopi Arabika 1kg"
                            className="w-full h-[26px] px-2.5 border border-[#c6cbd4] rounded-[3px] focus:outline-none"
                          />
                        </FormRow>
                        <FormRow label="Kategori Barang"><TagSearchInput initialTag="Umum" /></FormRow>
                        <FormRow label="Jenis Barang">
                          <select className="w-full h-[26px] px-2 border border-[#c6cbd4] rounded-[3px] bg-white focus:outline-none">
                            <option>Persediaan (Perpetual)</option>
                            <option>Jasa</option>
                          </select>
                        </FormRow>
                        <FormRow label="Kode Barang" required>
                          <div className="flex items-center w-full">
                            <ToggleSwitch checked={true} onChange={() => {}} />
                            <input
                              type="text"
                              value={kodeBarang}
                              onChange={(e) => setKodeBarang(e.target.value)}
                              placeholder="Otomatis (BRG-XXXX)"
                              className="w-[260px] h-[26px] px-2.5 border border-[#c6cbd4] rounded-[3px] focus:outline-none ml-3"
                            />
                          </div>
                        </FormRow>
                        <FormRow label="Satuan" required>
                          <input
                            type="text"
                            value={satuanBarang}
                            onChange={(e) => setSatuanBarang(e.target.value)}
                            className="w-[140px] h-[26px] px-2.5 border border-[#c6cbd4] rounded-[3px]"
                          />
                        </FormRow>
                      </div>
                      <div>
                        <h3 className="text-[13.5px] text-[#1d64b8] border-b border-gray-200 pb-1.5 mb-3 font-semibold">Informasi Lainnya</h3>
                        <FormRow label="Merek Barang"><SearchInput placeholder="Cari/Pilih Merek..." /></FormRow>
                        <FormRow label="Aktifkan No. Seri/Produksi"><ToggleSwitch checked={false} onChange={() => {}} /></FormRow>
                      </div>
                    </div>
                  )}

                  {barangTab === 'Penjualan / Pembelian' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-[1300px]">
                      <div>
                        <h3 className="text-[13.5px] text-[#1d64b8] border-b border-gray-200 pb-1.5 mb-3 font-semibold">Informasi Penjualan</h3>
                        <FormRow label="Def. Hrg. Jual Satuan #1">
                          <div className="flex w-[220px] h-[26px] border border-[#c6cbd4] rounded-[3px] overflow-hidden bg-white">
                            <span className="bg-[#f0f2f5] text-gray-600 px-2 flex items-center border-r border-[#c6cbd4] text-[11px]">Rp</span>
                            <input
                              type="text"
                              value={hargaJual}
                              onChange={(e) => setHargaJual(e.target.value)}
                              placeholder="0"
                              className="w-full px-2 focus:outline-none"
                            />
                          </div>
                        </FormRow>
                      </div>
                      <div>
                        <h3 className="text-[13.5px] text-[#1d64b8] border-b border-gray-200 pb-1.5 mb-3 font-semibold">Informasi Pembelian</h3>
                        <FormRow label="Harga Beli">
                          <div className="flex w-[220px] h-[26px] border border-[#c6cbd4] rounded-[3px] overflow-hidden bg-white">
                            <span className="bg-[#f0f2f5] text-gray-600 px-2 flex items-center border-r border-[#c6cbd4] text-[11px]">Rp</span>
                            <input
                              type="text"
                              value={hargaBeli}
                              onChange={(e) => setHargaBeli(e.target.value)}
                              placeholder="0"
                              className="w-full px-2 focus:outline-none"
                            />
                          </div>
                        </FormRow>
                      </div>
                    </div>
                  )}

                  {barangTab === 'Stok' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <span className="text-[14px] font-semibold">Saldo Stok Awal</span>
                        <button
                          onClick={() =>
                            setStokAwalRows([
                              ...stokAwalRows,
                              { id: Date.now(), tanggal: '01/10/2026', kuantitas: 10, satuan: 'PCS', biaya: 'Rp 50.000', gudang: 'Utama' }
                            ])
                          }
                          className="px-2.5 h-[25px] border border-[#5b83b8] text-[#1d4f91] rounded-[3px] flex items-center gap-1 text-[11px] hover:bg-blue-50"
                        >
                          <Plus size={13} strokeWidth={2.5} /> Tambah Baris
                        </button>
                      </div>
                      <div className="border border-gray-200 rounded-[2px] overflow-hidden">
                        <div className="grid grid-cols-5 bg-[#52647c] text-white text-[11px] font-medium h-[26px] items-center text-center">
                          <div>Tanggal</div><div>Kuantitas</div><div>Satuan</div><div>Biaya Satuan</div><div>Gudang</div>
                        </div>
                        {stokAwalRows.length === 0 ? (
                          <div className="h-20 flex items-center justify-center text-[11px] text-gray-500 bg-white">Belum ada baris stok awal</div>
                        ) : (
                          stokAwalRows.map((r) => (
                            <div key={r.id} className="grid grid-cols-5 h-7 items-center text-center hover:bg-gray-50 text-[11.5px] border-b border-gray-100">
                              <div>{r.tanggal}</div><div>{r.kuantitas}</div><div>{r.satuan}</div><div>{r.biaya}</div><div>{r.gudang}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {barangTab === 'Akun' && (
                    <div className="max-w-xl space-y-2">
                      <h3 className="text-[13.5px] text-[#1d64b8] border-b border-gray-200 pb-1.5 mb-3 font-semibold">Pemetaan Akun Perkiraan (COA)</h3>
                      <FormRow label="Persediaan"><TagSearchInput initialTag="[110401] Persediaan Barang Dagang" /></FormRow>
                      <FormRow label="Penjualan"><TagSearchInput initialTag="[400001] Pendapatan Penjualan" /></FormRow>
                      <FormRow label="HPP / Beban Pokok"><TagSearchInput initialTag="[500001] Beban Pokok Penjualan" /></FormRow>
                    </div>
                  )}
                  {barangTab === 'Gambar' && <div className="p-4 text-gray-500 text-[12px]">Unggah foto barang persediaan</div>}
                  {barangTab === 'Lain-lain' && <div className="p-4 text-gray-500 text-[12px]">Catatan internal master barang</div>}
                </div>

                <div className="w-[80px] shrink-0 flex flex-col gap-2">
                  <button
                    onClick={handleSaveBarang}
                    className="w-full h-[40px] bg-[#1d4f91] hover:bg-[#163e72] text-white rounded-[3px] flex flex-col items-center justify-center shadow transition"
                    title="Simpan ke Database"
                  >
                    <Save size={16} />
                    <span className="text-[9px] mt-0.5 font-bold uppercase">Simpan</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PELANGGAN */}
          {activeMainTab === 'pelanggan' && (
            <div className="flex-1 flex flex-col overflow-hidden bg-[#f4f6f9]">
              <div className="h-[35px] bg-white border-b border-[#d0d5dd] flex items-center justify-between px-1.5 shrink-0">
                <div className="flex items-center gap-1 h-full pt-1">
                  <button onClick={() => router.push('/partners')} className="w-8 h-[26px] bg-[#63b521] text-white rounded-[2px] flex items-center justify-center shadow-sm" title="Lihat Daftar Pelanggan">
                    <List size={15} />
                  </button>
                  <div className="h-full px-3 bg-[#f4f6f9] border-t border-l border-r border-[#c8ccd4] rounded-t-[3px] flex items-center gap-2 text-[12px] text-[#222222]">
                    <span>Data Baru Pelanggan</span>
                    <X size={12} onClick={(e) => handleCloseMainTab(e, 'pelanggan')} className="cursor-pointer hover:text-red-600 stroke-[2.5]" />
                  </div>
                </div>
              </div>

              <div className="px-2 pt-2 flex items-end gap-1 flex-wrap">
                {['Umum', 'Kontak', 'Pengiriman', 'Penjualan', 'Pajak', 'Saldo Piutang'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setPelangganTab(t)}
                    className={`h-[26px] px-3 text-[12px] rounded-t-[3px] border-t border-l border-r transition ${
                      pelangganTab === t ? 'bg-white border-[#c8ccd4] text-[#111111] font-medium relative -mb-[1px] z-10' : 'bg-[#dfe3e8] border-[#c8ccd4] text-[#555555]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="flex-1 flex px-2 pb-3 gap-2.5 overflow-hidden">
                <div className="flex-1 bg-white border border-[#c8ccd4] rounded-b-[2px] rounded-tr-[2px] p-4 overflow-y-auto shadow-sm">
                  {pelangganTab === 'Umum' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-[1300px]">
                      <div>
                        <h3 className="text-[13.5px] text-[#1d64b8] border-b border-gray-200 pb-1.5 mb-3 font-semibold">Info Umum Pelanggan</h3>
                        <FormRow label="Nama Pelanggan" required>
                          <input
                            type="text"
                            value={namaPelanggan}
                            onChange={(e) => setNamaPelanggan(e.target.value)}
                            placeholder="PT Mitra Sukses Mandiri"
                            className="w-full h-[26px] px-2.5 border border-[#c6cbd4] rounded-[3px] focus:outline-none"
                          />
                        </FormRow>
                        <FormRow label="Email">
                          <input
                            type="email"
                            value={emailPelanggan}
                            onChange={(e) => setEmailPelanggan(e.target.value)}
                            placeholder="finance@mitra.com"
                            className="w-full h-[26px] px-2.5 border border-[#c6cbd4] rounded-[3px]"
                          />
                        </FormRow>
                        <FormRow label="Handphone / Telp">
                          <input
                            type="text"
                            value={telpPelanggan}
                            onChange={(e) => setTelpPelanggan(e.target.value)}
                            placeholder="0812-XXXX-XXXX"
                            className="w-full h-[26px] px-2.5 border border-[#c6cbd4] rounded-[3px]"
                          />
                        </FormRow>
                      </div>
                      <div>
                        <h3 className="text-[13.5px] text-[#1d64b8] border-b border-gray-200 pb-1.5 mb-3 font-semibold">Alamat Penagihan</h3>
                        <FormRow label="Alamat Lengkap" alignTop>
                          <AddressFields value={alamatPelanggan} onChange={setAlamatPelanggan} />
                        </FormRow>
                      </div>
                    </div>
                  )}
                  {pelangganTab === 'Kontak' && <div className="p-4 text-gray-500 text-[12px]">Daftar PIC / kontak pelanggan</div>}
                  {pelangganTab === 'Pengiriman' && <div className="p-4 text-gray-500 text-[12px]">Alamat cabang pengiriman barang</div>}
                  {pelangganTab === 'Penjualan' && (
                    <div className="max-w-xl space-y-2">
                      <FormRow label="Syarat Pembayaran"><TagSearchInput initialTag="Net 30 Days" /></FormRow>
                    </div>
                  )}
                  {pelangganTab === 'Pajak' && <div className="p-4 text-gray-500 text-[12px]">NPWP / NIK e-Faktur Pajak</div>}
                  {pelangganTab === 'Saldo Piutang' && <div className="p-4 text-gray-500 text-[12px]">Saldo piutang awal usaha</div>}
                </div>

                <div className="w-[80px] shrink-0 flex flex-col gap-2">
                  <button
                    onClick={handleSavePelanggan}
                    className="w-full h-[40px] bg-[#1d4f91] hover:bg-[#163e72] text-white rounded-[3px] flex flex-col items-center justify-center shadow transition"
                    title="Simpan ke Database"
                  >
                    <Save size={16} />
                    <span className="text-[9px] mt-0.5 font-bold uppercase">Simpan</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PEMASOK */}
          {activeMainTab === 'pemasok' && (
            <div className="flex-1 flex flex-col overflow-hidden bg-[#f4f6f9]">
              <div className="h-[35px] bg-white border-b border-[#d0d5dd] flex items-center justify-between px-1.5 shrink-0">
                <div className="flex items-center gap-1 h-full pt-1">
                  <button onClick={() => router.push('/partners')} className="w-8 h-[26px] bg-[#63b521] text-white rounded-[2px] flex items-center justify-center shadow-sm" title="Lihat Daftar Pemasok">
                    <List size={15} />
                  </button>
                  <div className="h-full px-3 bg-[#f4f6f9] border-t border-l border-r border-[#c8ccd4] rounded-t-[3px] flex items-center gap-2 text-[12px] text-[#222222]">
                    <span>Data Baru Pemasok</span>
                    <X size={12} onClick={(e) => handleCloseMainTab(e, 'pemasok')} className="cursor-pointer hover:text-red-600 stroke-[2.5]" />
                  </div>
                </div>
              </div>

              <div className="px-2 pt-2 flex items-end gap-1 flex-wrap">
                {['Umum', 'Kontak', 'Pembelian', 'Pajak', 'Saldo Utang'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setPemasokTab(t)}
                    className={`h-[26px] px-3 text-[12px] rounded-t-[3px] border-t border-l border-r transition ${
                      pemasokTab === t ? 'bg-white border-[#c8ccd4] text-[#111111] font-medium relative -mb-[1px] z-10' : 'bg-[#dfe3e8] border-[#c8ccd4] text-[#555555]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="flex-1 flex px-2 pb-3 gap-2.5 overflow-hidden">
                <div className="flex-1 bg-white border border-[#c8ccd4] rounded-b-[2px] rounded-tr-[2px] p-4 overflow-y-auto shadow-sm">
                  {pemasokTab === 'Umum' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-[1300px]">
                      <div>
                        <h3 className="text-[13.5px] text-[#1d64b8] border-b border-gray-200 pb-1.5 mb-3 font-semibold">Info Umum Pemasok</h3>
                        <FormRow label="Nama Pemasok" required>
                          <input
                            type="text"
                            value={namaPemasok}
                            onChange={(e) => setNamaPemasok(e.target.value)}
                            placeholder="CV Sumber Makmur"
                            className="w-full h-[26px] px-2.5 border border-[#c6cbd4] rounded-[3px] focus:outline-none"
                          />
                        </FormRow>
                        <FormRow label="Email">
                          <input
                            type="email"
                            value={emailPemasok}
                            onChange={(e) => setEmailPemasok(e.target.value)}
                            placeholder="sales@makmur.com"
                            className="w-full h-[26px] px-2.5 border border-[#c6cbd4] rounded-[3px]"
                          />
                        </FormRow>
                        <FormRow label="Handphone / Telp">
                          <input
                            type="text"
                            value={telpPemasok}
                            onChange={(e) => setTelpPemasok(e.target.value)}
                            placeholder="0813-XXXX-XXXX"
                            className="w-full h-[26px] px-2.5 border border-[#c6cbd4] rounded-[3px]"
                          />
                        </FormRow>
                      </div>
                      <div>
                        <h3 className="text-[13.5px] text-[#1d64b8] border-b border-gray-200 pb-1.5 mb-3 font-semibold">Alamat Pembayaran</h3>
                        <FormRow label="Alamat Lengkap" alignTop>
                          <AddressFields value={alamatPemasok} onChange={setAlamatPemasok} />
                        </FormRow>
                      </div>
                    </div>
                  )}
                  {pemasokTab === 'Kontak' && <div className="p-4 text-gray-500 text-[12px]">Daftar kontak vendor pemasok</div>}
                  {pemasokTab === 'Pembelian' && (
                    <div className="max-w-xl space-y-2">
                      <FormRow label="Syarat Pembayaran"><TagSearchInput initialTag="C.O.D" /></FormRow>
                    </div>
                  )}
                  {pemasokTab === 'Pajak' && <div className="p-4 text-gray-500 text-[12px]">NPWP Pemasok e-Faktur</div>}
                  {pemasokTab === 'Saldo Utang' && <div className="p-4 text-gray-500 text-[12px]">Saldo utang awal usaha</div>}
                </div>

                <div className="w-[80px] shrink-0 flex flex-col gap-2">
                  <button
                    onClick={handleSavePemasok}
                    className="w-full h-[40px] bg-[#1d4f91] hover:bg-[#163e72] text-white rounded-[3px] flex flex-col items-center justify-center shadow transition"
                    title="Simpan ke Database"
                  >
                    <Save size={16} />
                    <span className="text-[9px] mt-0.5 font-bold uppercase">Simpan</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL KAS & BANK */}
      {showKasBankModal && (
        <div className="fixed inset-0 bg-black/55 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-[500px] rounded-[2px] shadow-2xl overflow-hidden border border-[#14234b]">
            <div className="h-[32px] bg-[#14234b] text-white px-3.5 flex items-center justify-between text-[12px] font-medium">
              <span>Kas & bank Baru</span>
              <button onClick={() => setShowKasBankModal(false)} className="text-white/80 hover:text-white"><X size={14} /></button>
            </div>
            <div className="p-5 text-[12px] text-[#333333] space-y-3">
              <div className="flex items-center">
                <div className="w-36 shrink-0">Nama Akun <span className="text-[#e31b23] font-bold">*</span></div>
                <input
                  type="text"
                  value={kasBankName}
                  onChange={(e) => setKasBankName(e.target.value)}
                  placeholder="Contoh: Bank Mandiri Operasional"
                  className="w-[200px] h-[26px] px-2 border border-[#c6cbd4] rounded-[3px] focus:outline-none"
                />
              </div>
              <div className="flex items-center">
                <div className="w-36 shrink-0">Saldo Awal</div>
                <div className="flex w-[160px] h-[26px] border border-[#c6cbd4] rounded-[3px] overflow-hidden bg-white">
                  <span className="bg-[#f0f2f5] text-gray-600 px-1.5 flex items-center border-r border-[#c6cbd4] text-[11px]">Rp</span>
                  <input
                    type="text"
                    value={kasBankSaldo}
                    onChange={(e) => setKasBankSaldo(e.target.value)}
                    placeholder="0"
                    className="w-full px-2 focus:outline-none"
                  />
                </div>
              </div>
              <div className="border-l-2 border-[#e31b23] pl-2 py-0.5 text-[11px] italic text-[#e31b23]">
                Saldo awal kas/bank akan otomatis dijurnal ke akun ekuitas penyesuaian modal.
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  onClick={() => setShowKasBankModal(false)}
                  className="px-4 h-[28px] border border-gray-300 hover:bg-gray-50 text-[12px] rounded-[3px]"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveKasBank}
                  className="px-5 h-[28px] bg-[#0c4da2] hover:bg-[#093b7d] text-white text-[12px] font-medium rounded-[3px]"
                >
                  Simpan ke DB
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
