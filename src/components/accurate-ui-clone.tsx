"use client";
import React, { useState } from 'react';
import {
  Settings, Building2, BookOpen, Landmark, Coins, ShoppingCart,
  Truck, Package, FileSpreadsheet, Users, Search, HelpCircle,
  Bell, User, X, Plus, Save, Paperclip, Lightbulb, List,
  ChevronDown, Check, Trash2, Image as ImageIcon, History,
  RefreshCw, MoreVertical, ChevronLeft, ChevronRight, FileText,
  Calendar, Calculator, CreditCard, ArrowRightLeft, Percent,
  ClipboardList, Warehouse, MapPin, Mail, Sparkles, UserCheck
} from 'lucide-react';

const ALL_WIDGETS = [
  { id: 'aktifitas', title: 'Aktifitas Terakhir Anda', desc: 'Menampilkan 30 aktifitas terakhir dari pengguna' },
  { id: 'arus_kas', title: 'Arus Kas', desc: 'Menampilkan arus kas' },
  { id: 'aset_saat_ini', title: 'Aset saat ini', desc: 'Menampilkan pertumbuhan nilai aset dan perbandingan dengan bulan dan tahun lalu' },
  { id: 'barang_stok_min', title: 'Barang Stok Minimum', desc: 'Menampilkan barang-barang yang perlu dipesan bagian pembelian' },
  { id: 'beban_perusahaan', title: 'Beban Perusahaan', desc: 'Menampilkan beban-beban tertinggi dalam perusahaan' },
  { id: 'faktur_terlewat', title: 'Faktur Terlewat', desc: 'Menampilkan faktur terlewat' },
  { id: 'keberhasilan_penawaran', title: 'Keberhasilan Penawaran', desc: 'Menampilkan jumlah keberhasilan penawaran penjualan yang diproses menjadi pesanan penjualan' },
  { id: 'kegiatan_mendatang', title: 'Kegiatan Mendatang', desc: 'Menampilkan transaksi/kegiatan beberapa hari kedepan' },
  { id: 'kegiatan_terlewat', title: 'Kegiatan Terlewat', desc: 'Menampilkan transaksi/kegiatan terlewat beberapa hari kebelakang' },
  { id: 'ketersediaan_kas', title: 'Ketersediaan Kas', desc: 'Menampilkan grafik ketersedian kas atas potensi pengeluaran dan juga pendapatan' },
  { id: 'laba_rugi', title: 'Laba/Rugi Tahun ini', desc: 'Menampilkan Nilai dan persentase kenaikan/penuruan laba/rugi tahun ini' },
  { id: 'monitoring_hpp', title: 'Monitoring HPP', desc: 'Menampilkan jumlah persentase barang yang akan mengalamai kenaikan harga' },
  { id: 'pelanggan_berutang', title: 'Pelanggan Berutang', desc: 'Menampilkan Pelanggan-pelanggan dengan nilai tunggakan tertinggi' },
  { id: 'pembelian', title: 'Pembelian', desc: 'Menampilkan nilai dan persentase kenaikan/penurunan pembelian bulan ini' },
  { id: 'penawaran_terabaikan', title: 'Penawaran Terabaikan', desc: 'Penawaran Terabaikan' },
  { id: 'pengguna_aktif', title: 'Pengguna Aktif', desc: 'Menampilkan daftar pengguna yang sedang aktif/login pada database' },
  { id: 'penjualan', title: 'Penjualan', desc: 'Menampilkan nilai dan persentase kenaikan/penurunan penjualan bulan ini' },
  { id: 'penjualan_barang', title: 'Penjualan Barang', desc: 'Menampilkan Barang-barang dengan nilai penjualan tertinggi' },
  { id: 'penjualan_pelanggan', title: 'Penjualan Pelanggan', desc: 'Menampilkan Pelanggan-pelanggan dengan nilai penjualan tertinggi' },
  { id: 'penjualan_kategori', title: 'Penjualan Per Kategori', desc: 'Menampilkan kategori barang dengan nilai penjualan tertinggi' },
  { id: 'penjualan_merek', title: 'Penjualan Per Merek', desc: 'Menampilkan merek barang dengan nilai penjualan tertinggi' },
  { id: 'penjualan_hari', title: 'Penjualan per Hari', desc: 'Menampilkan jumlah transaksi, jumlah omset dan kuantitas barang penjualan per hari' },
  { id: 'performa_penjual', title: 'Performa Penjual', desc: 'Menampilkan nilai persentase target penjual' },
  { id: 'permintaan_barang', title: 'Permintaan Barang', desc: 'Menampilkan jumlah yang belum diproses' },
  { id: 'persetujuan_terproses', title: 'Persetujuan Terproses', desc: 'Menampilkan 10 terakhir pengajuan persetujuan yang sudah diproses' },
  { id: 'pertumbuhan_pelanggan', title: 'Pertumbuhan Pelanggan', desc: 'Menampilkan jumlah berapa banyak penambahan pelanggan baru per bulan' },
  { id: 'pesanan_pembelian', title: 'Pesanan Pembelian', desc: 'Menampilkan jumlah pesanan pembelian yang belum diterima / diproses' },
  { id: 'pesanan_penjualan', title: 'Pesanan Penjualan', desc: 'Menampilkan jumlah pesanan penjualan yang belum dikirim / diproses' },
  { id: 'rekonsiliasi_bank', title: 'Rekonsiliasi Bank', desc: 'Menampilkan rekonsiliasi bank' },
  { id: 'tren_penjualan', title: 'Tren Penjualan', desc: 'Menampilkan grafik tren penjualan per akun penjualan' }
];

const SIDEBAR_MENUS: Record<string, any> = {
  pengaturan: {
    title: 'Pengaturan',
    cols: 3,
    items: [
      { label: 'Preferensi', color: 'blue', icon: Settings },
      { label: 'Penomoran', color: 'blue', icon: FileText },
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
      { label: 'Pajak', color: 'blue', icon: FileText },
      { label: 'Syarat Pembayaran', color: 'blue', icon: Coins },
      { label: 'Pengiriman', color: 'blue', icon: Truck },
      { label: 'FOB', color: 'blue', icon: Package },
      { label: 'Gaji/Tunjangan', color: 'blue', icon: CreditCard },
      { label: 'Karyawan', color: 'blue', icon: Users },
      { label: 'Transaksi Berulang', color: 'green', icon: RefreshCw },
      { label: 'Proses Akhir Bulan', color: 'green', icon: Calendar },
      { label: 'Kontak', color: 'purple', icon: User },
      { label: 'Transaksi Favorit', color: 'purple', icon: FileSpreadsheet },
      { label: 'Kalender', color: 'purple', icon: Calendar },
      { label: 'Log Aktifitas', color: 'purple', icon: History }
    ]
  },
  bukubesar: {
    title: 'Buku Besar',
    cols: 3,
    items: [
      { label: 'Akun Perkiraan', color: 'blue', icon: BookOpen },
      { label: 'Pencatatan Beban', color: 'green', icon: ClipboardList },
      { label: 'Pencatatan Gaji', color: 'green', icon: CreditCard },
      { label: 'Jurnal Umum', color: 'green', icon: FileSpreadsheet },
      { label: 'Monitor Anggaran', color: 'purple', icon: Landmark },
      { label: 'Transfer Anggaran', color: 'green', icon: ArrowRightLeft },
      { label: 'Anggaran', color: 'orange', icon: Coins },
      { label: 'Histori Akun', color: 'purple', icon: History },
      { label: 'Log Aktifitas Jurnal', color: 'purple', icon: FileText }
    ]
  },
  kasbank: {
    title: 'Kas & Bank',
    cols: 3,
    items: [
      { label: 'Pembayaran', color: 'green', icon: CreditCard },
      { label: 'Penerimaan', color: 'green', icon: Coins },
      { label: 'Transfer Bank', color: 'green', icon: ArrowRightLeft },
      { label: 'SmartLink e-Banking', color: 'blue', icon: Landmark },
      { label: 'Rekening Koran', color: 'purple', icon: FileSpreadsheet },
      { label: 'Histori Bank', color: 'purple', icon: History },
      { label: 'Rekonsiliasi Bank', color: 'purple', icon: Check },
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
      { label: 'Faktur Penjualan', color: 'green', icon: FileText },
      { label: 'Penerimaan Penjualan', color: 'green', icon: Coins },
      { label: 'Retur Penjualan', color: 'green', icon: RefreshCw },
      { label: 'Kategori Pelanggan', color: 'blue', icon: Users },
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
      { label: 'Penerimaan Barang', color: 'green', icon: Package },
      { label: 'Uang Muka Pembelian', color: 'green', icon: CreditCard },
      { label: 'Faktur Pembelian', color: 'green', icon: FileText },
      { label: 'Pembayaran Pembelian', color: 'green', icon: Coins },
      { label: 'Retur Pembelian', color: 'green', icon: RefreshCw },
      { label: 'Harga Pemasok', color: 'orange', icon: FileSpreadsheet },
      { label: 'Kategori Pemasok', color: 'blue', icon: Users },
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
      { label: 'Pemindahan Barang', color: 'green', icon: Truck },
      { label: 'Penyesuaian Persediaan', color: 'green', icon: FileSpreadsheet },
      { label: 'Pekerjaan Pesanan', color: 'green', icon: Package },
      { label: 'Penambahan Bahan Baku', color: 'green', icon: Plus },
      { label: 'Penyelesaian Pesanan', color: 'green', icon: Check },
      { label: 'Perintah Stok Opname', color: 'green', icon: ClipboardList },
      { label: 'Hasil Stok Opname', color: 'green', icon: FileText },
      { label: 'Barang & Jasa', color: 'blue', icon: Package, action: 'barang' },
      { label: 'Gudang', color: 'blue', icon: Warehouse },
      { label: 'Satuan Barang', color: 'blue', icon: Coins },
      { label: 'Kategori Barang', color: 'blue', icon: List },
      { label: 'Merek Barang', color: 'blue', icon: FileText },
      { label: 'Pemenuhan Pesanan', color: 'purple', icon: Search },
      { label: 'Barang per Gudang', color: 'purple', icon: Warehouse },
      { label: 'Barang Stok Minimum', color: 'purple', icon: Package }
    ]
  },
  asettetap: {
    title: 'Aset Tetap',
    cols: 3,
    items: [
      { label: 'Aset Tetap', color: 'blue', icon: Building2 },
      { label: 'Kategori Aset', color: 'blue', icon: List },
      { label: 'Kategori Aset Tetap Pajak', color: 'blue', icon: FileText },
      { label: 'Perubahan Aset Tetap', color: 'green', icon: RefreshCw },
      { label: 'Disposisi Aset Tetap', color: 'green', icon: Trash2 },
      { label: 'Pindah Aset', color: 'green', icon: Truck },
      { label: 'Aset per Lokasi', color: 'purple', icon: MapPin }
    ]
  },
  smartlinktax: {
    title: 'SmartLink Tax',
    cols: 2,
    items: [
      { label: 'e-Faktur CTAS', color: 'purple', icon: FileSpreadsheet },
      { label: 'Email Faktur Pajak', color: 'purple', icon: Mail }
    ]
  },
  laporan: {
    title: 'Daftar Laporan',
    cols: 3,
    items: [
      { label: 'Daftar Laporan', color: 'purple', icon: FileText },
      { label: 'SPT PPN / PPNBM', color: 'purple', icon: FileSpreadsheet },
      { label: 'Analisa AI', color: 'purple', icon: Sparkles }
    ]
  }
};

const TILE_COLOR_CLASSES: Record<string, string> = {
  blue: 'bg-[#d0ebff] border-[#74c0fc] text-[#0b5ed7] hover:bg-[#bae0ff]',
  green: 'bg-[#d3f9d8] border-[#8ce99a] text-[#2b8a3e] hover:bg-[#b2f2bb]',
  purple: 'bg-[#f3d9fa] border-[#e599f7] text-[#862e9c] hover:bg-[#eebefa]',
  orange: 'bg-[#ffe8cc] border-[#ffc078] text-[#d9480f] hover:bg-[#ffd8a8]'
};

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

const AddressFields = ({ disabled }: { disabled?: boolean }) => (
  <div className={`space-y-2 w-full ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
    <div className="flex border border-[#c6cbd4] rounded-[3px] overflow-hidden bg-white">
      <div className="w-[50px] bg-[#f8f9fb] border-r border-[#c6cbd4] text-[11px] text-gray-500 p-1.5 flex items-start">
        Jalan
      </div>
      <textarea rows={3} disabled={disabled} className="w-full p-1.5 text-[11.5px] focus:outline-none resize-none" />
    </div>
    <div className="grid grid-cols-[1fr_120px] gap-2">
      <div className="flex border border-[#c6cbd4] rounded-[3px] overflow-hidden bg-white h-[26px] items-center">
        <div className="w-[50px] bg-[#f8f9fb] border-r border-[#c6cbd4] text-[11px] text-gray-500 px-1.5">Kota</div>
        <input type="text" disabled={disabled} className="w-full px-2 text-[11.5px] focus:outline-none" />
      </div>
      <div className="flex border border-[#c6cbd4] rounded-[3px] overflow-hidden bg-white h-[26px] items-center">
        <div className="w-[50px] bg-[#f8f9fb] border-r border-[#c6cbd4] text-[11px] text-gray-500 px-1.5">K.Pos</div>
        <input type="text" disabled={disabled} className="w-full px-2 text-[11.5px] focus:outline-none" />
      </div>
    </div>
    <div className="flex border border-[#c6cbd4] rounded-[3px] overflow-hidden bg-white h-[26px] items-center">
      <div className="w-[50px] bg-[#f8f9fb] border-r border-[#c6cbd4] text-[11px] text-gray-500 px-1.5">Provinsi</div>
      <input type="text" disabled={disabled} className="w-full px-2 text-[11.5px] focus:outline-none" />
    </div>
    <div className="flex border border-[#c6cbd4] rounded-[3px] overflow-hidden bg-white h-[26px] items-center">
      <div className="w-[50px] bg-[#f8f9fb] border-r border-[#c6cbd4] text-[11px] text-gray-500 px-1.5">Negara</div>
      <input type="text" disabled={disabled} className="w-full px-2 text-[11.5px] focus:outline-none" />
    </div>
  </div>
);

export default function App() {
  const [openTabs, setOpenTabs] = useState([
    { id: 'dashboard', label: 'Dashboard', closable: false },
    { id: 'persiapan', label: 'Persiapan Data Perusahaan', closable: false }
  ]);
  const [activeMainTab, setActiveMainTab] = useState('persiapan');
  const [activeSidebarMenu, setActiveSidebarMenu] = useState<string|null>(null);

  const [showWidgetList, setShowWidgetList] = useState(false);
  const [widgetSearch, setWidgetSearch] = useState('');
  const [activeWidgets, setActiveWidgets] = useState([
    'aktifitas',
    'kegiatan_mendatang',
    'tren_penjualan',
    'laba_rugi',
    'beban_perusahaan',
    'arus_kas',
    'penjualan',
    'pembelian',
    'pesanan_pembelian'
  ]);

  const [showKasBankModal, setShowKasBankModal] = useState(false);
  const [kasBankName, setKasBankName] = useState('');
  const [kasBankSaldo, setKasBankSaldo] = useState('');

  const [barangTab, setBarangTab] = useState('Umum');
  const [pelangganTab, setPelangganTab] = useState('Umum');
  const [pemasokTab, setPemasokTab] = useState('Umum');

  const [idPemasokToggle, setIdPemasokToggle] = useState(true);
  const [idPelangganToggle, setIdPelangganToggle] = useState(true);
  const [limitPiutangMode, setLimitPiutangMode] = useState('per_pelanggan');
  const [limitUmurChecked, setLimitUmurChecked] = useState(false);
  const [limitNominalChecked, setLimitNominalChecked] = useState(false);
  const [samaAlamatPajakPel, setSamaAlamatPajakPel] = useState(true);
  const [samaAlamatPajakPem, setSamaAlamatPajakPem] = useState(true);

  const [toastMsg, setToastMsg] = useState<string|null>(null);

  const [stokAwalRows, setStokAwalRows] = useState<any[]>([]);
  const [pelangganKontakRows, setPelangganKontakRows] = useState<any[]>([]);
  const [pelangganPiutangRows, setPelangganPiutangRows] = useState<any[]>([]);
  const [pemasokKontakRows, setPemasokKontakRows] = useState<any[]>([]);
  const [pemasokRekeningRows, setPemasokRekeningRows] = useState<any[]>([]);
  const [pemasokUtangRows, setPemasokUtangRows] = useState<any[]>([]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
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
      setActiveMainTab('persiapan');
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
        <div className="fixed bottom-4 right-4 z-50 bg-[#14234b] text-white text-[12px] px-4 py-2.5 rounded shadow-lg flex items-center gap-2 border border-blue-400/30">
          <Check size={14} className="text-green-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* TOP HEADER */}
      <header className="h-[42px] bg-gradient-to-r from-[#14234b] via-[#1a2f66] to-[#0b142c] text-white flex items-center justify-between px-3 shrink-0 relative overflow-hidden shadow-md">
        <div className="flex items-center gap-2 z-10">
          <div className="w-6 h-6 rounded-full bg-[#e31b23] flex items-center justify-center font-bold text-xs shadow">
            a
          </div>
          <div className="leading-none">
            <span className="font-bold tracking-tight text-[15px]">accurate</span>
            <span className="text-[9px] text-gray-300 block">v1.0.1#4986-3026256</span>
          </div>
          <a href="/" className="ml-4 px-2.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] border border-white/20 flex items-center gap-1 transition" title="Beralih ke Live Backend Ledger">
            ← Mode Live Ledger
          </a>
        </div>
        <div className="flex items-center gap-3 z-10 text-[12px]">
          <span className="bg-[#e31b23] text-white text-[9px] px-1.5 py-0.5 rounded font-bold">NEW</span>
          <span className="bg-[#00a2ed] text-white text-[9px] px-1.5 py-0.5 rounded font-bold">NEW</span>
          <Search size={15} className="cursor-pointer text-white/80 hover:text-white" />
          <HelpCircle size={15} className="cursor-pointer text-white/80 hover:text-white" />
          <Bell size={15} className="cursor-pointer text-white/80 hover:text-white" />
          <div className="flex items-center gap-2 pl-2 border-l border-white/20">
            <div className="text-right leading-tight">
              <div className="font-medium text-[12px]">ejen</div>
              <div className="text-[10px] text-gray-300">ejen</div>
            </div>
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
              <User size={14} />
            </div>
          </div>
        </div>
      </header>

      {/* BODY WORKSPACE */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* SIDEBAR DENGAN TEKS KECIL */}
        <aside className="w-[64px] bg-[#14234b] flex flex-col items-center py-2 gap-1 text-white/85 shrink-0 z-30 border-r border-[#0f1b3a] overflow-y-auto">
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
            <div className="absolute left-[68px] top-10 z-30 bg-white border border-gray-300 rounded-[4px] shadow-2xl p-4 min-w-[240px]">
              <div className="text-[14px] text-[#333333] font-normal pb-2 mb-3 border-b-2 border-[#e31b23]">
                {SIDEBAR_MENUS[activeSidebarMenu].title}
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
                        if (sub.action === 'pelanggan') handleOpenModuleTab('pelanggan', 'Pelanggan');
                        else if (sub.action === 'pemasok') handleOpenModuleTab('pemasok', 'Pemasok');
                        else if (sub.action === 'barang') handleOpenModuleTab('barang', 'Barang & Jasa');
                        else showToast(`Membuka menu ${sub.label}...`);
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

        {/* MAIN AREA */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#eef1f6]">
          {/* TOP TABS */}
          <div className="h-[34px] bg-[#dfe3e8] border-b border-[#cbd0d8] px-2 flex items-end gap-1 shrink-0">
            {openTabs.map((tab) => {
              const isActive = activeMainTab === tab.id;
              return (
                <div
                  key={tab.id}
                  onClick={() => setActiveMainTab(tab.id)}
                  className={`px-3.5 h-[28px] text-[12px] rounded-t-[3px] border-t border-l border-r cursor-pointer flex items-center gap-2 transition select-none ${
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

          {}
          {activeMainTab === 'dashboard' && (
            <div className="flex-1 flex flex-col overflow-hidden bg-[#eef1f6]">
              <div className="h-[40px] bg-white border-b border-[#d0d5dd] px-3 flex items-center justify-between shrink-0 relative">
                <div className="relative">
                  <button
                    onClick={() => setShowWidgetList(!showWidgetList)}
                    className="h-[27px] px-6 bg-[#d8eafe] hover:bg-[#c3dffd] border border-[#6ca6e8] text-[#0c4da2] text-[12px] font-medium rounded-[2px] flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Plus size={13} strokeWidth={2.5} />
                    <span>Widget</span>
                  </button>

                  {showWidgetList && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setShowWidgetList(false)} />
                      <div className="absolute left-0 top-[32px] z-40 w-[370px] bg-white border border-[#b8c0cc] rounded-[3px] shadow-2xl overflow-hidden">
                        <div className="bg-[#14234b] text-white px-3 py-2 flex items-center justify-between text-[12px] font-medium">
                          <span>Tambah / Kelola Widget Dashboard ({ALL_WIDGETS.length})</span>
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

                <div className="flex items-center gap-2">
                  <select className="w-[220px] h-[27px] px-2 border border-[#c6cbd4] rounded-[2px] text-[12px] text-[#333333] bg-white focus:outline-none">
                    <option>Dashboard Utama</option>
                  </select>
                  <button className="p-1 text-gray-500 hover:text-gray-800"><MoreVertical size={14} /></button>
                </div>
              </div>

              {/* DASHBOARD WIDGETS GRID */}
              <div className="flex-1 p-2.5 overflow-y-auto space-y-2.5">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
                  <div className="bg-white border border-[#cfd4dc] rounded-[2px] shadow-sm h-[230px] flex flex-col">
                    <div className="h-[28px] px-3 border-b border-gray-200 flex items-center justify-between text-[11.5px] font-bold text-[#333333]">
                      <span>Aktifitas Terakhir Anda (ejen)</span>
                      <RefreshCw size={12} className="cursor-pointer hover:text-blue-600" />
                    </div>
                    <div className="p-4 flex items-start gap-5 text-[11.5px] text-[#333333]">
                      <div className="text-center leading-tight">
                        <div className="text-[10px] text-gray-500">Hari ini</div>
                        <div className="text-[22px] font-normal">18</div>
                        <div className="text-[11px] text-gray-600">Okt</div>
                      </div>
                      <div className="flex items-start gap-3 pt-1 flex-1 border-b border-gray-100 pb-4">
                        <div className="w-2.5 h-2.5 rounded-full border-2 border-[#1d64b8] mt-1 shrink-0" />
                        <div>
                          <div className="font-bold text-[#222222] mb-1">21:19</div>
                          <div className="text-gray-600">Buat Preferensi</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-[#cfd4dc] rounded-[2px] shadow-sm h-[230px] flex flex-col">
                    <div className="h-[28px] px-3 border-b border-gray-200 flex items-center justify-between text-[11.5px] font-bold text-[#333333]">
                      <span>Kegiatan Mendatang</span>
                      <RefreshCw size={12} className="cursor-pointer hover:text-blue-600" />
                    </div>
                    <div className="flex-1 p-3 flex items-center justify-center text-[11.5px] italic text-gray-500">
                      Tidak ada kegiatan
                    </div>
                  </div>

                  <div className="bg-white border border-[#cfd4dc] rounded-[2px] shadow-sm h-[230px] flex flex-col">
                    <div className="h-[28px] px-3 border-b border-gray-200 flex items-center justify-between text-[11.5px] font-bold text-[#333333]">
                      <span>Tren Penjualan</span>
                      <RefreshCw size={12} className="cursor-pointer hover:text-blue-600" />
                    </div>
                    <div className="flex-1 p-3 flex flex-col justify-between text-[10px] text-gray-600">
                      <div className="text-right text-[9.5px] text-gray-500">(Seminggu terakhir)</div>
                      <div className="flex items-center gap-2 my-auto">
                        <span>0</span>
                        <div className="flex-1 relative h-[2px] bg-[#0088cc] flex items-center justify-between px-4">
                          {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Kemarin', 'Hari ini'].map((_, i) => (
                            <div key={i} className="w-2 h-2 rounded-full bg-[#0088cc]" />
                          ))}
                        </div>
                      </div>
                      <div className="border-t border-gray-200 pt-1.5 flex justify-between px-5 text-[10px] text-gray-600">
                        <span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Kemarin</span><span>Hari ini</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional dynamic custom widgets */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
                  {ALL_WIDGETS.filter(
                    (w) =>
                      activeWidgets.includes(w.id) &&
                      ![
                        'aktifitas',
                        'kegiatan_mendatang',
                        'tren_penjualan',
                        'laba_rugi',
                        'beban_perusahaan',
                        'arus_kas',
                        'penjualan',
                        'pembelian',
                        'pesanan_pembelian'
                      ].includes(w.id)
                  ).map((extra) => (
                    <div key={extra.id} className="bg-white border border-[#cfd4dc] rounded-[2px] shadow-sm h-[200px] flex flex-col">
                      <div className="h-[28px] px-3 border-b border-gray-200 flex items-center justify-between text-[11.5px] font-bold text-[#333333]">
                        <span>{extra.title}</span>
                        <X
                          size={12}
                          onClick={() => handleToggleWidget(extra.id, extra.title)}
                          className="cursor-pointer hover:text-red-600"
                        />
                      </div>
                      <div className="flex-1 p-4 flex flex-col items-center justify-center text-center">
                        <div className="text-[11.5px] text-gray-600 mb-1">{extra.desc}</div>
                        <div className="text-[11px] italic text-gray-400">Belum ada data transaksi</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {}
          {activeMainTab === 'persiapan' && (
            <div className="flex-1 p-3 overflow-y-auto">
              <div className="max-w-[1300px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                <div className="lg:col-span-5 bg-white border border-[#cfd4dc] rounded-[3px] shadow-sm p-6 flex flex-col items-center text-center">
                  <div className="w-[180px] h-[160px] my-3 relative flex items-center justify-center">
                    <div className="w-[150px] h-[150px] rounded-full bg-[#fde8ed] flex items-center justify-center relative">
                      <div className="text-center">
                        <Users size={52} className="text-[#14234b] mx-auto mb-2" />
                        <div className="flex gap-2 justify-center">
                          <span className="bg-[#e8f5e9] text-green-700 text-[10px] px-2 py-0.5 rounded">Data</span>
                          <span className="bg-[#e3f2fd] text-blue-700 text-[10px] px-2 py-0.5 rounded">Laporan</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <h2 className="text-[15px] font-bold text-[#222222] mb-2">Selamat Datang di Accurate Online</h2>
                  <p className="text-[12px] text-gray-600 leading-relaxed mb-6">
                    Kami memahami bahwa setiap usaha memiliki kebutuhan yang unik. Sesuaikan fitur sesuai dengan kebutuhan bisnis Anda untuk pengalaman yang lebih optimal.
                  </p>
                  <div className="flex items-center justify-center gap-4 w-full">
                    <button className="w-[130px] h-[32px] bg-[#0c4da2] hover:bg-[#093b7d] text-white text-[12px] font-medium rounded-[3px] shadow-sm">
                      Kelola Fitur
                    </button>
                    <button className="w-[130px] h-[32px] bg-[#63b521] hover:bg-[#549c1b] text-white text-[12px] font-medium rounded-[3px] shadow-sm">
                      Tutorial
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
                          <div className="text-[11px] text-gray-500">Anda dapat memasukan rekening bank beserta saldo saat ini</div>
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
                          <div className="font-bold text-[#222222] text-[12.5px]">Barang & Jasa</div>
                          <div className="text-[11px] text-gray-500">Anda dapat memasukan daftar barang dan jasa yang akan dijual</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[12px] text-[#0c4da2] hover:underline cursor-pointer">Impor Data</span>
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
                          <div className="text-[11px] text-gray-500">Anda dapat memasukan daftar pelanggan beserta Piutang awal</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[12px] text-[#0c4da2] hover:underline cursor-pointer">Impor Data</span>
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
                          <div className="text-[11px] text-gray-500">Anda dapat memasukan daftar pemasok beserta Utang awal</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[12px] text-[#0c4da2] hover:underline cursor-pointer">Impor Data</span>
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

          {}
          {activeMainTab === 'barang' && (
            <div className="flex-1 flex flex-col overflow-hidden bg-[#f4f6f9]">
              <div className="h-[35px] bg-white border-b border-[#d0d5dd] flex items-center justify-between px-1.5 shrink-0">
                <div className="flex items-center gap-1 h-full pt-1">
                  <button className="w-8 h-[26px] bg-[#63b521] text-white rounded-[2px] flex items-center justify-center shadow-sm">
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
                        <h3 className="text-[13.5px] text-[#1d64b8] border-b border-gray-200 pb-1.5 mb-3">Informasi Barang & Jasa</h3>
                        <FormRow label="Nama Barang" required><input type="text" className="w-full h-[26px] px-2.5 border border-[#c6cbd4] rounded-[3px] focus:outline-none" /></FormRow>
                        <FormRow label="Kategori Barang"><TagSearchInput initialTag="Umum" /></FormRow>
                        <FormRow label="Jenis Barang"><select className="w-full h-[26px] px-2 border border-[#c6cbd4] rounded-[3px] bg-white focus:outline-none"><option>Persediaan</option></select></FormRow>
                        <FormRow label="Kode Barang" required>
                          <div className="flex items-center w-full">
                            <ToggleSwitch checked={true} onChange={() => {}} />
                            <select className="w-[260px] h-[26px] px-2 border border-[#c6cbd4] rounded-[3px] bg-white focus:outline-none ml-3"><option>Barang & Jasa</option></select>
                          </div>
                        </FormRow>
                        <FormRow label="UPC/Barcode"><input type="text" className="w-[260px] h-[26px] px-2.5 border border-[#c6cbd4] rounded-[3px] focus:outline-none" /></FormRow>
                        <FormRow label="Satuan" required><div className="w-[220px]"><SearchInput /></div></FormRow>
                      </div>
                      <div>
                        <h3 className="text-[13.5px] text-[#1d64b8] border-b border-gray-200 pb-1.5 mb-3">Informasi Lainnya</h3>
                        <FormRow label="Merek Barang"><SearchInput placeholder="Cari/Pilih Merek..." /></FormRow>
                        <FormRow label="Aktifkan No. Seri/Produksi"><ToggleSwitch checked={false} onChange={() => {}} /></FormRow>
                      </div>
                    </div>
                  )}
                  {barangTab === 'Penjualan / Pembelian' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-[1300px]">
                      <div>
                        <h3 className="text-[13.5px] text-[#1d64b8] border-b border-gray-200 pb-1.5 mb-3">Informasi Penjualan</h3>
                        <FormRow label="Default Diskon (%)"><div className="flex items-center gap-2"><input type="text" className="w-[140px] h-[26px] px-2.5 border border-[#c6cbd4] rounded-[3px]" /><span>/ Semua Satuan</span></div></FormRow>
                        <FormRow label="Def. Hrg. Jual Satuan #1"><input type="text" className="w-[180px] h-[26px] px-2.5 border border-[#c6cbd4] rounded-[3px]" /></FormRow>
                        <FormRow label="Minimum Jual"><input type="text" className="w-[180px] h-[26px] px-2.5 border border-[#c6cbd4] rounded-[3px]" /></FormRow>
                        <FormRow label="Menerapkan Harga Grosir"><ToggleSwitch checked={false} onChange={() => {}} /></FormRow>
                        <FormRow label="Substitusi dengan"><ToggleSwitch checked={false} onChange={() => {}} /></FormRow>
                      </div>
                      <div>
                        <h3 className="text-[13.5px] text-[#1d64b8] border-b border-gray-200 pb-1.5 mb-3">Informasi Pembelian</h3>
                        <FormRow label="Pemasok Utama"><SearchInput placeholder="Cari/Pilih Pemasok..." /></FormRow>
                        <FormRow label="Satuan Beli"><div className="w-[220px]"><SearchInput /></div></FormRow>
                        <FormRow label="Harga Beli">
                          <div className="flex w-[220px] h-[26px] border border-[#c6cbd4] rounded-[3px] overflow-hidden bg-white">
                            <span className="bg-[#f0f2f5] text-gray-600 px-2 flex items-center border-r border-[#c6cbd4]">Rp</span>
                            <input type="text" className="w-full px-2 focus:outline-none" />
                          </div>
                        </FormRow>
                      </div>
                    </div>
                  )}
                  {barangTab === 'Stok' && (
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center gap-6 mb-2">
                          <span className="text-[14px]">Stok Awal</span>
                          <button
                            onClick={() =>
                              setStokAwalRows([
                                ...stokAwalRows,
                                { id: Date.now(), tanggal: '01/10/2026', kuantitas: 10, satuan: 'PCS', biaya: 'Rp 50.000', gudang: 'Utama' }
                              ])
                            }
                            className="w-8 h-[25px] border border-[#5b83b8] text-[#1d4f91] rounded-[3px] flex items-center justify-center hover:bg-blue-50"
                          >
                            <Plus size={14} strokeWidth={2.5} />
                          </button>
                        </div>
                        <div className="border border-gray-200 rounded-[2px] overflow-hidden">
                          <div className="grid grid-cols-5 bg-[#52647c] text-white text-[11px] font-medium h-[26px] items-center text-center divide-x divide-gray-400/40">
                            <div>Tanggal</div><div>Kuantitas</div><div>Satuan</div><div>Biaya Satuan</div><div>Gudang</div>
                          </div>
                          {stokAwalRows.length === 0 ? (
                            <div className="h-24 flex items-start justify-center pt-2 text-[11px] text-gray-700 bg-white">Belum ada data</div>
                          ) : (
                            <div className="divide-y divide-gray-200 text-[11.5px]">
                              {stokAwalRows.map((r) => (
                                <div key={r.id} className="grid grid-cols-5 h-7 items-center text-center hover:bg-gray-50">
                                  <div>{r.tanggal}</div><div>{r.kuantitas}</div><div>{r.satuan}</div><div>{r.biaya}</div>
                                  <div className="flex items-center justify-center gap-2">
                                    <span>{r.gudang}</span>
                                    <Trash2 size={12} onClick={() => setStokAwalRows(stokAwalRows.filter((i) => i.id !== r.id))} className="text-red-500 cursor-pointer" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {barangTab === 'Akun' && (
                    <div className="max-w-xl space-y-2">
                      <h3 className="text-[13.5px] text-[#1d64b8] border-b border-gray-200 pb-1.5 mb-3">Akun Perkiraan</h3>
                      <FormRow label="Persediaan"><TagSearchInput initialTag="[110401] Persediaan" /></FormRow>
                      <FormRow label="Penjualan"><TagSearchInput initialTag="[400001] Penjualan" /></FormRow>
                      <FormRow label="Retur Penjualan"><TagSearchInput initialTag="[400003] Retur Penjualan" /></FormRow>
                      <FormRow label="Diskon Penjualan"><TagSearchInput initialTag="[400004] Diskon Penjualan" /></FormRow>
                    </div>
                  )}
                  {barangTab === 'Gambar' && <div><button className="w-8 h-[25px] border border-[#5b83b8] text-[#1d4f91] rounded-[3px] flex items-center justify-center"><Plus size={14} /></button></div>}
                  {barangTab === 'Lain-lain' && (
                    <div className="max-w-xl space-y-4">
                      <h3 className="text-[13.5px] text-[#1d64b8] border-b border-gray-200 pb-1.5 mb-3">Info Lainnya</h3>
                      <FormRow label="Catatan" alignTop><textarea rows={4} className="w-full p-2 border border-[#c6cbd4] rounded-[3px] focus:outline-none" /></FormRow>
                    </div>
                  )}
                </div>

                <div className="w-[80px] shrink-0 flex flex-col gap-2">
                  <button onClick={() => showToast('Data Barang berhasil disimpan!')} className="w-full h-[38px] bg-[#e4e6eb] hover:bg-[#d8dade] border border-[#c8ccd4] rounded-[3px] flex items-center justify-center text-gray-500 shadow-sm" title="Simpan">
                    <Save size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {}
          {activeMainTab === 'pelanggan' && (
            <div className="flex-1 flex flex-col overflow-hidden bg-[#f4f6f9]">
              <div className="h-[35px] bg-white border-b border-[#d0d5dd] flex items-center justify-between px-1.5 shrink-0">
                <div className="flex items-center gap-1 h-full pt-1">
                  <button className="w-8 h-[26px] bg-[#63b521] text-white rounded-[2px] flex items-center justify-center shadow-sm"><List size={15} /></button>
                  <div className="h-full px-3 bg-[#f4f6f9] border-t border-l border-r border-[#c8ccd4] rounded-t-[3px] flex items-center gap-2 text-[12px] text-[#222222]">
                    <span>Data Baru</span>
                    <X size={12} onClick={(e) => handleCloseMainTab(e, 'pelanggan')} className="cursor-pointer hover:text-red-600 stroke-[2.5]" />
                  </div>
                </div>
                <button className="w-6 h-6 bg-[#ffa800] text-white rounded-[3px] flex items-center justify-center mr-1 shadow-sm"><Lightbulb size={13} /></button>
              </div>

              <div className="px-2 pt-2 flex items-end gap-1 flex-wrap">
                {['Umum', 'Kontak', 'Pengiriman', 'Penjualan', 'Pajak', 'Saldo Piutang', 'Lain-lain'].map((t) => (
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
                        <h3 className="text-[13.5px] text-[#1d64b8] border-b border-gray-200 pb-1.5 mb-3">Info Umum</h3>
                        <FormRow label="Nama" required><input type="text" className="w-full h-[26px] px-2.5 border border-[#c6cbd4] rounded-[3px] focus:outline-none" /></FormRow>
                        <FormRow label="ID Pelanggan" required>
                          <div className="flex items-center w-full">
                            <ToggleSwitch checked={idPelangganToggle} onChange={setIdPelangganToggle} />
                            <select className="w-[260px] h-[26px] px-2 border border-[#c6cbd4] rounded-[3px] bg-white focus:outline-none ml-3"><option>Pelanggan</option></select>
                          </div>
                        </FormRow>
                        <FormRow label="Kategori"><SearchInput /></FormRow>
                        <FormRow label="No. Telp. Bisnis"><input type="text" className="w-full h-[26px] px-2.5 border border-[#c6cbd4] rounded-[3px]" /></FormRow>
                        <FormRow label="Handphone"><input type="text" className="w-full h-[26px] px-2.5 border border-[#c6cbd4] rounded-[3px]" /></FormRow>
                        <FormRow label="Email"><input type="text" className="w-full h-[26px] px-2.5 border border-[#c6cbd4] rounded-[3px]" /></FormRow>
                      </div>
                      <div>
                        <h3 className="text-[13.5px] text-[#1d64b8] border-b border-gray-200 pb-1.5 mb-3">Info Lainnya</h3>
                        <FormRow label="Alamat Penagihan" alignTop><AddressFields /></FormRow>
                      </div>
                    </div>
                  )}
                  {pelangganTab === 'Kontak' && (
                    <div>
                      <div className="flex items-center gap-6 mb-2">
                        <span className="text-[14px]">Kontak</span>
                        <button onClick={() => setPelangganKontakRows([...pelangganKontakRows, { id: Date.now(), nama: 'Budi', jabatan: 'Manajer', email: 'budi@mail.com', hp: '08123' }])} className="w-8 h-[25px] border border-[#5b83b8] text-[#1d4f91] rounded-[3px] flex items-center justify-center"><Plus size={14} /></button>
                      </div>
                      <div className="border border-gray-200 rounded-[2px] overflow-hidden">
                        <div className="grid grid-cols-4 bg-[#52647c] text-white text-[11px] font-medium h-[26px] items-center text-center">
                          <div>Nama Lengkap</div><div>Posisi Jabatan</div><div>Email</div><div>Handphone</div>
                        </div>
                        {pelangganKontakRows.length === 0 ? (
                          <div className="h-24 flex items-start justify-center pt-2 text-[11px] text-gray-700 bg-white">Belum ada data</div>
                        ) : (
                          pelangganKontakRows.map(r => <div key={r.id} className="grid grid-cols-4 h-7 text-center items-center text-[11.5px]"><div>{r.nama}</div><div>{r.jabatan}</div><div>{r.email}</div><div>{r.hp}</div></div>)
                        )}
                      </div>
                    </div>
                  )}
                  {pelangganTab === 'Pengiriman' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-[1300px]">
                      <div>
                        <h3 className="text-[13.5px] text-[#1d64b8] border-b border-gray-200 pb-1.5 mb-3">Alamat Utama</h3>
                        <label className="flex items-center gap-2 mb-3 text-[12px]"><input type="checkbox" defaultChecked /><span>Sama dengan alamat penagihan</span></label>
                        <AddressFields />
                      </div>
                    </div>
                  )}
                  {pelangganTab === 'Penjualan' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-[1300px]">
                      <div>
                        <h3 className="text-[13.5px] text-[#1d64b8] border-b border-gray-200 pb-1.5 mb-3">Penjualan</h3>
                        <FormRow label="Kategori Harga" required><TagSearchInput initialTag="Umum" /></FormRow>
                        <FormRow label="Syarat Pembayaran"><TagSearchInput initialTag="C.O.D" /></FormRow>
                      </div>
                    </div>
                  )}
                  {pelangganTab === 'Pajak' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-[1300px]">
                      <div>
                        <h3 className="text-[13.5px] text-[#1d64b8] border-b border-gray-200 pb-1.5 mb-3">Pajak</h3>
                        <FormRow label="Tipe ID Pajak"><select className="w-[100px] h-[26px] border border-[#c6cbd4] rounded-[3px]"><option>NIK</option></select></FormRow>
                      </div>
                    </div>
                  )}
                  {pelangganTab === 'Saldo Piutang' && (
                    <div>
                      <div className="flex items-center gap-6 mb-2">
                        <span className="text-[14px]">Piutang Awal</span>
                        <button onClick={() => setPelangganPiutangRows([...pelangganPiutangRows, { id: Date.now(), tanggal: '01/10/2026', jumlah: 'Rp 1.000.000', mataUang: 'IDR', syarat: 'C.O.D', nomor: '001', ket: 'Saldo Awal' }])} className="w-8 h-[25px] border border-[#5b83b8] text-[#1d4f91] rounded-[3px] flex items-center justify-center"><Plus size={14} /></button>
                      </div>
                      <div className="border border-gray-200 rounded-[2px] overflow-hidden">
                        <div className="grid grid-cols-6 bg-[#52647c] text-white text-[11px] font-medium h-[26px] items-center text-center">
                          <div>Tanggal</div><div>Jumlah</div><div>Mata Uang</div><div>Syarat</div><div>Nomor #</div><div>Keterangan</div>
                        </div>
                        {pelangganPiutangRows.length === 0 ? (
                          <div className="h-24 flex items-start justify-center pt-2 text-[11px] text-gray-700 bg-white">Belum ada data</div>
                        ) : (
                          pelangganPiutangRows.map(r => <div key={r.id} className="grid grid-cols-6 h-7 text-center items-center text-[11.5px]"><div>{r.tanggal}</div><div>{r.jumlah}</div><div>{r.mataUang}</div><div>{r.syarat}</div><div>{r.nomor}</div><div>{r.ket}</div></div>)
                        )}
                      </div>
                    </div>
                  )}
                  {pelangganTab === 'Lain-lain' && (
                    <div className="max-w-lg space-y-4">
                      <h3 className="text-[13.5px] text-[#1d64b8] border-b border-gray-200 pb-1.5 mb-3">Lain-lain</h3>
                      <FormRow label="Catatan" alignTop><textarea rows={4} className="w-full p-2 border border-[#c6cbd4] rounded-[3px]" /></FormRow>
                    </div>
                  )}
                </div>

                <div className="w-[80px] shrink-0 flex flex-col gap-2">
                  <button onClick={() => showToast('Data Pelanggan berhasil disimpan!')} className="w-full h-[38px] bg-[#e4e6eb] hover:bg-[#d8dade] border border-[#c8ccd4] rounded-[3px] flex items-center justify-center text-gray-500 shadow-sm" title="Simpan"><Save size={18} /></button>
                </div>
              </div>
            </div>
          )}

          {}
          {activeMainTab === 'pemasok' && (
            <div className="flex-1 flex flex-col overflow-hidden bg-[#f4f6f9]">
              <div className="h-[35px] bg-white border-b border-[#d0d5dd] flex items-center justify-between px-1.5 shrink-0">
                <div className="flex items-center gap-1 h-full pt-1">
                  <button className="w-8 h-[26px] bg-[#63b521] text-white rounded-[2px] flex items-center justify-center shadow-sm"><List size={15} /></button>
                  <div className="h-full px-3 bg-[#f4f6f9] border-t border-l border-r border-[#c8ccd4] rounded-t-[3px] flex items-center gap-2 text-[12px] text-[#222222]">
                    <span>Data Baru</span>
                    <X size={12} onClick={(e) => handleCloseMainTab(e, 'pemasok')} className="cursor-pointer hover:text-red-600 stroke-[2.5]" />
                  </div>
                </div>
                <button className="w-6 h-6 bg-[#ffa800] text-white rounded-[3px] flex items-center justify-center mr-1 shadow-sm"><Lightbulb size={13} /></button>
              </div>

              <div className="px-2 pt-2 flex items-end gap-1 flex-wrap">
                {['Umum', 'Kontak', 'Pembelian', 'Pajak', 'Saldo Utang', 'Lain-lain'].map((t) => (
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
                        <h3 className="text-[13.5px] text-[#1d64b8] border-b border-gray-200 pb-1.5 mb-3">Info Umum</h3>
                        <FormRow label="Nama" required><input type="text" className="w-full h-[26px] px-2.5 border border-[#c6cbd4] rounded-[3px]" /></FormRow>
                        <FormRow label="ID Pemasok" required>
                          <div className="flex items-center w-full">
                            <ToggleSwitch checked={idPemasokToggle} onChange={setIdPemasokToggle} />
                            <select className="w-[260px] h-[26px] px-2 border border-[#c6cbd4] rounded-[3px] bg-white ml-3"><option>Pemasok</option></select>
                          </div>
                        </FormRow>
                        <FormRow label="Kategori"><SearchInput /></FormRow>
                      </div>
                      <div>
                        <h3 className="text-[13.5px] text-[#1d64b8] border-b border-gray-200 pb-1.5 mb-3">Info Lainnya</h3>
                        <FormRow label="Alamat Pembayaran" alignTop><AddressFields /></FormRow>
                      </div>
                    </div>
                  )}
                  {pemasokTab === 'Kontak' && (
                    <div>
                      <div className="flex items-center gap-6 mb-2">
                        <span className="text-[14px]">Kontak</span>
                        <button onClick={() => setPemasokKontakRows([...pemasokKontakRows, { id: Date.now(), nama: 'Andi', jabatan: 'Sales', email: 'andi@sup.com', hp: '0813' }])} className="w-8 h-[25px] border border-[#5b83b8] text-[#1d4f91] rounded-[3px] flex items-center justify-center"><Plus size={14} /></button>
                      </div>
                      <div className="border border-gray-200 rounded-[2px] overflow-hidden">
                        <div className="grid grid-cols-4 bg-[#52647c] text-white text-[11px] font-medium h-[26px] items-center text-center">
                          <div>Nama Lengkap</div><div>Posisi Jabatan</div><div>Email</div><div>Handphone</div>
                        </div>
                        {pemasokKontakRows.length === 0 ? (
                          <div className="h-24 flex items-start justify-center pt-2 text-[11px] text-gray-700 bg-white">Belum ada data</div>
                        ) : (
                          pemasokKontakRows.map(r => <div key={r.id} className="grid grid-cols-4 h-7 text-center items-center text-[11.5px]"><div>{r.nama}</div><div>{r.jabatan}</div><div>{r.email}</div><div>{r.hp}</div></div>)
                        )}
                      </div>
                    </div>
                  )}
                  {pemasokTab === 'Pembelian' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-[1300px]">
                      <div>
                        <h3 className="text-[13.5px] text-[#1d64b8] border-b border-gray-200 pb-1.5 mb-3">Pembelian</h3>
                        <FormRow label="Syarat Pembayaran"><TagSearchInput initialTag="C.O.D" /></FormRow>
                      </div>
                    </div>
                  )}
                  {pemasokTab === 'Pajak' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-[1300px]">
                      <div>
                        <h3 className="text-[13.5px] text-[#1d64b8] border-b border-gray-200 pb-1.5 mb-3">Pajak</h3>
                        <FormRow label="Tipe ID Pajak"><select className="w-[100px] h-[26px] border border-[#c6cbd4] rounded-[3px]"><option>NIK</option></select></FormRow>
                      </div>
                    </div>
                  )}
                  {pemasokTab === 'Saldo Utang' && (
                    <div>
                      <div className="flex items-center gap-6 mb-2">
                        <span className="text-[14px]">Utang Awal</span>
                        <button onClick={() => setPemasokUtangRows([...pemasokUtangRows, { id: Date.now(), tanggal: '01/10/2026', jumlah: 'Rp 500.000', mataUang: 'IDR', syarat: 'C.O.D', nomor: '002', ket: 'Utang Awal' }])} className="w-8 h-[25px] border border-[#5b83b8] text-[#1d4f91] rounded-[3px] flex items-center justify-center"><Plus size={14} /></button>
                      </div>
                      <div className="border border-gray-200 rounded-[2px] overflow-hidden">
                        <div className="grid grid-cols-6 bg-[#52647c] text-white text-[11px] font-medium h-[26px] items-center text-center">
                          <div>Tanggal</div><div>Jumlah</div><div>Mata Uang</div><div>Syarat</div><div>Nomor #</div><div>Keterangan</div>
                        </div>
                        {pemasokUtangRows.length === 0 ? (
                          <div className="h-24 flex items-start justify-center pt-2 text-[11px] text-gray-700 bg-white">Belum ada data</div>
                        ) : (
                          pemasokUtangRows.map(r => <div key={r.id} className="grid grid-cols-6 h-7 text-center items-center text-[11.5px]"><div>{r.tanggal}</div><div>{r.jumlah}</div><div>{r.mataUang}</div><div>{r.syarat}</div><div>{r.nomor}</div><div>{r.ket}</div></div>)
                        )}
                      </div>
                    </div>
                  )}
                  {pemasokTab === 'Lain-lain' && (
                    <div className="max-w-lg space-y-4">
                      <h3 className="text-[13.5px] text-[#1d64b8] border-b border-gray-200 pb-1.5 mb-3">Lain-lain</h3>
                      <FormRow label="Catatan" alignTop><textarea rows={4} className="w-full p-2 border border-[#c6cbd4] rounded-[3px]" /></FormRow>
                    </div>
                  )}
                </div>

                <div className="w-[80px] shrink-0 flex flex-col gap-2">
                  <button onClick={() => showToast('Data Pemasok berhasil disimpan!')} className="w-full h-[38px] bg-[#e4e6eb] hover:bg-[#d8dade] border border-[#c8ccd4] rounded-[3px] flex items-center justify-center text-gray-500 shadow-sm" title="Simpan"><Save size={18} /></button>
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
              <span>Kas & bank</span>
              <button onClick={() => setShowKasBankModal(false)} className="text-white/80 hover:text-white"><X size={14} /></button>
            </div>
            <div className="p-5 text-[12px] text-[#333333] space-y-3">
              <div className="flex items-center">
                <div className="w-36 shrink-0">Nama <span className="text-[#e31b23] font-bold">*</span></div>
                <input type="text" value={kasBankName} onChange={(e) => setKasBankName(e.target.value)} className="w-[155px] h-[26px] px-2 border border-[#c6cbd4] rounded-[3px] focus:outline-none" />
                <span className="ml-2.5 text-[11px] italic text-gray-500">Contoh: BCA a/c XXX-XXX, dll</span>
              </div>
              <div className="flex items-center">
                <div className="w-36 shrink-0">Saldo per 01/10/2026</div>
                <div className="flex w-[115px] h-[26px] border border-[#c6cbd4] rounded-[3px] overflow-hidden bg-white">
                  <span className="bg-[#f0f2f5] text-gray-600 px-1.5 flex items-center border-r border-[#c6cbd4] text-[11px]">Rp</span>
                  <input type="text" value={kasBankSaldo} onChange={(e) => setKasBankSaldo(e.target.value)} className="w-full px-2 focus:outline-none" />
                </div>
              </div>
              <div className="border-l-2 border-[#e31b23] pl-2 py-0.5 text-[11px] italic text-[#e31b23]">
                Saldo terakhir kas dapat dimasukkan lain waktu melalui menu "Akun Perkiraan"
              </div>
              <div className="flex justify-end pt-3">
                <button
                  onClick={() => {
                    setShowKasBankModal(false);
                    showToast(kasBankName ? `Rekening "${kasBankName}" ditambahkan!` : 'Data Kas & Bank disimpan!');
                    setKasBankName('');
                    setKasBankSaldo('');
                  }}
                  className="px-5 h-[28px] bg-[#0c4da2] hover:bg-[#093b7d] text-white text-[12px] font-medium rounded-[3px]"
                >
                  Lanjut
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}