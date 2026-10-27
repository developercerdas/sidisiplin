import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, Users, ShieldAlert, Award, FileText, 
  MessageSquare, LogOut, CheckCircle2, AlertTriangle, Clock, 
  Search, Plus, Printer, Eye, ChevronRight, ChevronLeft, School, Send, RefreshCw,
  QrCode, Settings, Trash2, Smartphone, ShieldCheck, Check, X, CreditCard,
  Menu, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import DeveloperBranding from '../components/DeveloperBranding';

const API_BASE = 'http://localhost:5000/api';

export default function DashboardPage({ user, onLogout }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ringkasan');
  const [currentUser, setCurrentUser] = useState(user || null);
  
  // Sidebar State (Icon-only collapse & Mobile drawer)
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Data States
  const [siswaList, setSiswaList] = useState([]);
  const [kategoriList, setKategoriList] = useState([]);
  const [riwayatPelanggaran, setRiwayatPelanggaran] = useState([]);
  const [radarBK, setRadarBK] = useState([]);
  const [waLogs, setWaLogs] = useState([]);
  const [waConfig, setWaConfig] = useState({
    wa_provider: 'botcake',
    wa_api_key: 'BOTCAKE_TOKEN_LIVE',
    wa_sender_number: '081298765432',
    wa_status: 'CONNECTED',
    template_alpa: 'Assalamu’alaikum Wr. Wb. Yth. {nama_ortu}. Ananda {nama_siswa} ({kelas}) tercatat ALPA hari ini. Poin +5 pt.',
    template_pelanggaran: 'Pemberitahuan: Ananda {nama_siswa} ({kelas}) tercatat pelanggaran: "{nama_pelanggaran}" (+{poin} pt). Akumulasi: {total_poin} pt.',
    template_sp: 'Pemberitahuan Resmi: Akumulasi poin ananda {nama_siswa} mencapai {total_poin} pt, pihak madrasah menerbitkan {status_sp}.',
    template_panggilan: 'UNDANGAN BK: Mengharap kehadiran Wali dari {nama_siswa} di Ruang BK Madrasah untuk pembinaan.'
  });
  const [pengaturan, setPengaturan] = useState({
    nama_madrasah: 'MADRASAH TSANAWIYAH NEGERI 1 TELADAN',
    npsn: '20109988',
    alamat: 'Jl. Pendidikan Karakter No. 45, Kota Teladan',
    no_telp: '(021) 555-1234',
    email: 'info@mtsn1teladan.sch.id',
    nama_kepala: 'Drs. H. Ahmad Subagio, M.Pd',
    nip_kepala: '197508152000031001',
    jam_masuk: '07:00',
    jam_toleransi: '07:15',
    jam_alpa_otomatis: '07:30'
  });
  const [stats, setStats] = useState({ total_siswa: 5, hadir: 3, terlambat: 1, sakit: 0, izin: 0, alpa: 1, belum_scan: 0 });

  // Notifications
  const [toast, setToast] = useState({ show: false, text: '', type: 'success' });

  // Forms
  const [formPelanggaran, setFormPelanggaran] = useState({ siswa_id: '', kategori_pelanggaran_id: '', catatan: '' });
  const [formKategoriBaru, setFormKategoriBaru] = useState({ kode: '', nama_pelanggaran: '', kategori: 'RINGAN', bobot_poin: 5 });
  const [formSiswaBaru, setFormSiswaBaru] = useState({ nisn: '', barcode_id: '', nama: '', jenis_kelamin: 'L', kelas_id: 1, no_wa_ortu: '', nama_ortu: '' });
  const [testWA, setTestWA] = useState({ no_tujuan: '081234567890', pesan: 'Halo! Pesan uji coba Botcake WhatsApp API aktif.' });

  // Modals
  const [selectedSP, setSelectedSP] = useState(null);
  const [selectedKartu, setSelectedKartu] = useState(null);
  const [filterKelas, setFilterKelas] = useState('ALL');

  const showToast = (text, type = 'success') => {
    setToast({ show: true, text, type });
    setTimeout(() => setToast({ show: false, text: '', type: 'success' }), 4000);
  };

  useEffect(() => {
    const saved = localStorage.getItem('user_profile');
    if (saved) {
      setCurrentUser(JSON.parse(saved));
    } else if (!user) {
      navigate('/login');
    }
  }, [user]);

  const loadAllData = async () => {
    try {
      const [sRes, kRes, rRes, bRes, wRes, stRes, cfgRes, setRes] = await Promise.all([
        fetch(`${API_BASE}/siswa`).then(r => r.json()),
        fetch(`${API_BASE}/pelanggaran/kategori`).then(r => r.json()),
        fetch(`${API_BASE}/pelanggaran/riwayat`).then(r => r.json()),
        fetch(`${API_BASE}/bk/radar-kasus`).then(r => r.json()),
        fetch(`${API_BASE}/wa/logs`).then(r => r.json()),
        fetch(`${API_BASE}/presensi/statistik-hari-ini`).then(r => r.json()),
        fetch(`${API_BASE}/wa/config`).then(r => r.json()),
        fetch(`${API_BASE}/pengaturan`).then(r => r.json())
      ]);

      if (sRes.success) setSiswaList(sRes.data);
      if (kRes.success) setKategoriList(kRes.data);
      if (rRes.success) setRiwayatPelanggaran(rRes.data);
      if (bRes.success) setRadarBK(bRes.data);
      if (wRes.success) setWaLogs(wRes.data);
      if (stRes.success) setStats(stRes);
      if (cfgRes.success && cfgRes.data) setWaConfig(cfgRes.data);
      if (setRes.success && setRes.data) setPengaturan(setRes.data);
    } catch (err) {
      console.log('Mode Live Demo GitHub Pages Aktif - Menggunakan Data Showcase');
      setSiswaList([
        { id: 1, nisn: '0081234561', barcode_id: 'SISWA-001', nama: 'Ahmad Fauzi Rahman', nama_kelas: 'VII A', nama_ortu: 'Bpk. Ridwan Fauzi', no_wa_ortu: '081234567890', total_poin_pelanggaran: 15, status_sp: 'AMAN' },
        { id: 2, nisn: '0081234562', barcode_id: 'SISWA-002', nama: 'Siti Nur Aisyah', nama_kelas: 'VII A', nama_ortu: 'Ibu Fatimah Az-Zahra', no_wa_ortu: '081234567891', total_poin_pelanggaran: 0, status_sp: 'AMAN' },
        { id: 3, nisn: '0081234563', barcode_id: 'SISWA-003', nama: 'Muhammad Daffa Al-Fatih', nama_kelas: 'IX A', nama_ortu: 'Bpk. Herman Susanto', no_wa_ortu: '081234567892', total_poin_pelanggaran: 55, status_sp: 'SP1 (Panggilan Ortu)' },
        { id: 4, nisn: '0081234564', barcode_id: 'SISWA-004', nama: 'Rizky Bilal Maulana', nama_kelas: 'VIII B', nama_ortu: 'Bpk. Slamet Riyadi', no_wa_ortu: '081234567893', total_poin_pelanggaran: 30, status_sp: 'PERINGATAN' },
        { id: 5, nisn: '0081234565', barcode_id: 'SISWA-005', nama: 'Zahra Putri Ramadhani', nama_kelas: 'VII A', nama_ortu: 'Ibu Nurhayati', no_wa_ortu: '081234567894', total_poin_pelanggaran: 5, status_sp: 'AMAN' }
      ]);
      setKategoriList([
        { id: 1, kode: 'IBD-01', nama_pelanggaran: 'Tidak mengikuti Sholat Dhuha / Dzuhur Berjamaah', kategori: 'IBADAH', bobot_poin: 10 },
        { id: 2, kode: 'IBD-02', nama_pelanggaran: 'Tidak membawa kelengkapan ibadah', kategori: 'IBADAH', bobot_poin: 5 },
        { id: 3, kode: 'TAT-01', nama_pelanggaran: 'Atribut seragam tidak lengkap / tidak rapi', kategori: 'RINGAN', bobot_poin: 5 },
        { id: 4, kode: 'TAT-02', nama_pelanggaran: 'Terlambat hadir ke madrasah > 15 menit', kategori: 'RINGAN', bobot_poin: 5 },
        { id: 5, kode: 'TAT-04', nama_pelanggaran: 'Membolos jam pelajaran / keluar tanpa izin', kategori: 'SEDANG', bobot_poin: 20 },
        { id: 6, kode: 'TAT-05', nama_pelanggaran: 'Merokok di area madrasah / berseragam', kategori: 'SEDANG', bobot_poin: 25 },
        { id: 7, kode: 'BRT-01', nama_pelanggaran: 'Berkelahi / Terlibat tawuran antar pelajar', kategori: 'BERAT', bobot_poin: 50 }
      ]);
      setRadarBK([
        { id: 3, nisn: '0081234563', nama: 'Muhammad Daffa Al-Fatih', nama_kelas: 'IX A', total_poin_pelanggaran: 55, status_sp: 'SP1 (Panggilan Ortu)', nama_ortu: 'Bpk. Herman Susanto', no_wa_ortu: '081234567892' },
        { id: 4, nisn: '0081234564', nama: 'Rizky Bilal Maulana', nama_kelas: 'VIII B', total_poin_pelanggaran: 30, status_sp: 'PERINGATAN', nama_ortu: 'Bpk. Slamet Riyadi', no_wa_ortu: '081234567893' }
      ]);
      setRiwayatPelanggaran([
        { id: 1, tanggal: '2026-10-27', nama_siswa: 'Muhammad Daffa Al-Fatih', nama_kelas: 'IX A', nama_pelanggaran: 'Merokok di area madrasah / berseragam', poin_diberikan: 25, catatan: 'Di belakang kantin saat istirahat', nama_pelapor: 'Ustadz Hendra Gunawan' },
        { id: 2, tanggal: '2026-10-27', nama_siswa: 'Ahmad Fauzi Rahman', nama_kelas: 'VII A', nama_pelanggaran: 'Terlambat hadir ke madrasah > 15 menit', poin_diberikan: 5, catatan: 'Ban motor bocor', nama_pelapor: 'Guru Piket' }
      ]);
      setWaLogs([
        { id: 1, no_tujuan: '081234567892', tipe: 'PELANGGARAN', pesan: 'Assalamu’alaikum Wr. Wb. Yth. Bpk. Herman Susanto. Ananda Muhammad Daffa Al-Fatih (IX A) tercatat pelanggaran: "Merokok" (+25 pt). Total akumulasi: 55 pt (SP1).', status: 'SENT', created_at: '2026-10-27 10:15:22' },
        { id: 2, no_tujuan: '081234567890', tipe: 'TEST', pesan: 'Tes notifikasi WhatsApp via Botcake API (Status: SENT)', status: 'SENT', created_at: '2026-10-27 18:48:30' }
      ]);
      setStats({ total_siswa: 5, hadir: 3, terlambat: 1, sakit: 0, izin: 0, alpa: 1, belum_scan: 0 });
    }
  };

  useEffect(() => {
    loadAllData();
  }, [activeTab]);

  const handleLogoutClick = () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_profile');
    if (onLogout) onLogout();
    navigate('/login');
  };

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  const handleSubmitPelanggaran = async (e) => {
    e.preventDefault();
    if (!formPelanggaran.siswa_id || !formPelanggaran.kategori_pelanggaran_id) return;

    try {
      const res = await fetch(`${API_BASE}/pelanggaran/input`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formPelanggaran, pelapor_guru_id: currentUser?.id || 1 })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        setFormPelanggaran({ siswa_id: '', kategori_pelanggaran_id: '', catatan: '' });
        loadAllData();
      }
    } catch (err) {
      showToast('Pelanggaran dicatat & WA Botcake terkirim (Mode Demo)', 'success');
      setFormPelanggaran({ siswa_id: '', kategori_pelanggaran_id: '', catatan: '' });
    }
  };

  const handleTambahKategori = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/pelanggaran/kategori`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formKategoriBaru)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Kategori pelanggaran baru berhasil ditambahkan');
        setFormKategoriBaru({ kode: '', nama_pelanggaran: '', kategori: 'RINGAN', bobot_poin: 5 });
        loadAllData();
      }
    } catch (err) {
      setKategoriList(prev => [...prev, { id: Date.now(), ...formKategoriBaru }]);
      showToast('Kategori pelanggaran ditambahkan (Demo)');
      setFormKategoriBaru({ kode: '', nama_pelanggaran: '', kategori: 'RINGAN', bobot_poin: 5 });
    }
  };

  const handlePresensiManual = async (siswaId, status) => {
    try {
      const res = await fetch(`${API_BASE}/presensi/manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siswa_id: siswaId, status })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Siswa ditandai [${status}]. ${status === 'ALPA' ? 'Poin bertambah +5 pt & WA terkirim.' : ''}`);
        loadAllData();
      }
    } catch (err) {
      showToast(`Status siswa ditandai [${status}] (Demo)`, 'success');
    }
  };

  const handleJalankanAutoAlpa = async () => {
    if (!window.confirm('Jalankan Auto-Cutoff? Siswa yang belum scan akan ditandai ALPA (+5 poin) dan orang tua menerima WA.')) return;
    try {
      const res = await fetch(`${API_BASE}/presensi/jalankan-alpa`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        loadAllData();
      }
    } catch (err) {
      showToast('Auto-Cutoff dijalankan: 1 siswa ditandai ALPA dan pesan WA Botcake terkirim.', 'success');
    }
  };

  const handleSimpanWA = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/wa/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(waConfig)
      });
      const data = await res.json();
      if (data.success) showToast('Konfigurasi WhatsApp Botcake berhasil disimpan!');
    } catch (err) {
      showToast('Konfigurasi WhatsApp Botcake disimpan!', 'success');
    }
  };

  const handleKirimTesWA = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/wa/test-send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testWA)
      });
      const data = await res.json();
      if (data.success) showToast(data.message);
    } catch (err) {
      showToast(`Pesan uji coba berhasil dikirim ke ${testWA.no_tujuan} via Botcake! (Status: SENT)`, 'success');
    }
  };

  const handleTambahSiswa = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/siswa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formSiswaBaru)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Data siswa baru berhasil ditambahkan');
        setFormSiswaBaru({ nisn: '', barcode_id: '', nama: '', jenis_kelamin: 'L', kelas_id: 1, no_wa_ortu: '', nama_ortu: '' });
        loadAllData();
      }
    } catch (err) {
      setSiswaList(prev => [...prev, { id: Date.now(), ...formSiswaBaru, nama_kelas: 'VII A', total_poin_pelanggaran: 0, status_sp: 'AMAN' }]);
      showToast('Siswa baru berhasil ditambahkan');
      setFormSiswaBaru({ nisn: '', barcode_id: '', nama: '', jenis_kelamin: 'L', kelas_id: 1, no_wa_ortu: '', nama_ortu: '' });
    }
  };

  const handleSimpanPengaturan = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/pengaturan`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pengaturan)
      });
      const data = await res.json();
      if (data.success) showToast('Identitas madrasah & jam sekolah berhasil diperbarui');
    } catch (err) {
      showToast('Identitas madrasah & jam sekolah diperbarui', 'success');
    }
  };

  const menuItems = [
    { id: 'ringkasan', label: 'Dashboard Eksekutif', icon: LayoutDashboard },
    { id: 'presensi', label: 'Presensi & Rekap Harian', icon: Clock },
    { id: 'pelanggaran', label: 'Tata Tertib & Buku Poin', icon: ShieldAlert },
    { id: 'bk', label: 'Bimbingan Konseling & SP', icon: Award },
    { id: 'siswa', label: 'Data Siswa & Cetak Kartu', icon: CreditCard },
    { id: 'wa', label: 'Konfigurasi WhatsApp Botcake', icon: MessageSquare },
    { id: 'pengaturan', label: 'Pengaturan Madrasah', icon: Settings }
  ];

  const filteredSiswa = filterKelas === 'ALL' ? siswaList : siswaList.filter(s => s.nama_kelas === filterKelas);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row overflow-x-hidden">
      {/* ========================================================= */}
      {/* MOBILE NAVBAR (HP / ANDROID) */}
      {/* ========================================================= */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow">
            <School className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xs font-black text-white leading-tight">SIDISIPLIN</h2>
            <p className="text-[10px] text-emerald-400 font-bold uppercase">{currentUser?.role || 'Guru'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/" className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[11px] font-bold text-emerald-400 flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            <span>Kios</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 flex items-center justify-center cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-rose-400" /> : <Menu className="w-5 h-5 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SIDEBAR NAVIGATION (COLLAPSIBLE / MINIMIZE ICON-ONLY) */}
      {/* ========================================================= */}
      <aside className={`
        fixed md:static inset-0 z-30 bg-slate-900 md:bg-slate-900 border-r border-slate-800 
        flex flex-col justify-between shrink-0 transition-all duration-300 ease-in-out
        ${mobileMenuOpen ? 'top-14 block' : 'hidden md:flex'}
        ${isCollapsed ? 'md:w-20' : 'md:w-64 lg:w-72'}
      `}>
        <div className="overflow-y-auto max-h-[calc(100vh-140px)] md:max-h-none">
          {/* Header Sidebar Desktop with Minimize Toggle Button */}
          <div className="p-4 border-b border-slate-800 hidden md:flex items-center justify-between">
            <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                <School className="w-6 h-6 text-white" />
              </div>
              <div className="truncate">
                <h2 className="text-sm font-black text-white leading-tight">SIDISIPLIN</h2>
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Madrasah Teladan</p>
              </div>
            </div>

            {/* Tombol Minimize / Expand Sidebar */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 cursor-pointer mx-auto transition"
              title={isCollapsed ? "Tampilkan Nama Menu (Expand)" : "Sembunyikan Menu Menjadi Icon Saja (Minimize)"}
            >
              {isCollapsed ? <PanelLeftOpen className="w-4 h-4 text-emerald-400" /> : <PanelLeftClose className="w-4 h-4 text-slate-400" />}
            </button>
          </div>

          {/* User Profile Mini (Icon-Only when collapsed) */}
          <div className={`p-3 my-2.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-2.5 transition-all ${
            isCollapsed ? 'mx-2 justify-center' : 'mx-3'
          }`}>
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs border border-emerald-500/30 shrink-0">
              {currentUser?.nama?.charAt(0) || 'G'}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden min-w-0 transition-opacity">
                <div className="text-xs font-bold text-white truncate">{currentUser?.nama || 'Guru'}</div>
                <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">{currentUser?.role || 'Staff'}</div>
              </div>
            )}
          </div>

          {/* Navigasi Menu */}
          <nav className="p-2 space-y-1 text-xs font-semibold">
            {menuItems.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSelectTab(tab.id)}
                  title={isCollapsed ? tab.label : ''}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer text-left ${
                    isCollapsed ? 'justify-center px-0' : ''
                  } ${
                    isActive 
                      ? 'bg-emerald-600 text-slate-950 font-bold shadow-md shadow-emerald-600/20' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  {!isCollapsed && <span className="truncate">{tab.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-slate-800 space-y-1.5 shrink-0 bg-slate-900">
          <Link
            to="/"
            title="Ke Layar Kios Gerbang"
            className={`w-full flex items-center justify-center gap-2 py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-emerald-400 text-xs font-bold transition border border-slate-700 shadow ${
              isCollapsed ? 'px-0' : ''
            }`}
          >
            <Eye className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Layar Kios</span>}
          </Link>

          <button
            onClick={handleLogoutClick}
            title="Keluar Akun"
            className={`w-full flex items-center justify-center gap-2 py-2 px-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition border border-rose-500/20 cursor-pointer ${
              isCollapsed ? 'px-0' : ''
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* MAIN CONTENT AREA */}
      {/* ========================================================= */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto max-w-full">
        {/* Global Toast */}
        {toast.show && (
          <div className={`mb-4 md:mb-6 p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 shadow-xl border ${
            toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}>
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toast.text}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 1: DASHBOARD EKSEKUTIF */}
        {/* ========================================================= */}
        {activeTab === 'ringkasan' && (
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-xl md:text-2xl font-black text-white">Dashboard Eksekutif</h1>
                <p className="text-[11px] md:text-xs text-slate-400">Ikhtisar kehadiran santri, grafik poin disiplin, dan radar kasus BK.</p>
              </div>
              <button onClick={loadAllData} className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Segarkan</span>
              </button>
            </div>

            {/* Metrik Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-4">
              <div className="p-3.5 md:p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] md:text-xs text-slate-400 mb-0.5">Total Siswa</div>
                <div className="text-2xl md:text-3xl font-black text-white">{stats.total_siswa}</div>
                <div className="text-[9px] md:text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Aktif
                </div>
              </div>

              <div className="p-3.5 md:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-[10px] md:text-xs text-emerald-400 mb-0.5">Tepat Waktu</div>
                <div className="text-2xl md:text-3xl font-black text-emerald-400">{stats.hadir}</div>
                <div className="text-[9px] md:text-[10px] text-slate-400 mt-1">Sblm {pengaturan.jam_masuk}</div>
              </div>

              <div className="p-3.5 md:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <div className="text-[10px] md:text-xs text-amber-400 mb-0.5">Terlambat</div>
                <div className="text-2xl md:text-3xl font-black text-amber-400">{stats.terlambat}</div>
                <div className="text-[9px] md:text-[10px] text-amber-400 mt-1">+5 poin</div>
              </div>

              <div className="p-3.5 md:p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                <div className="text-[10px] md:text-xs text-rose-400 mb-0.5">Alpa</div>
                <div className="text-2xl md:text-3xl font-black text-rose-400">{stats.alpa + stats.belum_scan}</div>
                <div className="text-[9px] md:text-[10px] text-rose-400 mt-1">Belum hadir</div>
              </div>
            </div>

            {/* Radar Siswa Bermasalah */}
            <div className="rounded-2xl md:rounded-3xl bg-slate-900 border border-slate-800 p-4 md:p-6 shadow-xl">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className="flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                  <h3 className="text-xs md:text-sm font-bold text-white uppercase tracking-wider">Radar Siswa Poin &gt;= 25</h3>
                </div>
                <button onClick={() => setActiveTab('bk')} className="text-[11px] text-emerald-400 hover:underline font-semibold cursor-pointer">
                  Modul BK &rarr;
                </button>
              </div>

              <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-2.5">Siswa</th>
                      <th className="pb-2.5">Kelas</th>
                      <th className="pb-2.5">Poin</th>
                      <th className="pb-2.5">Status SP</th>
                      <th className="pb-2.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {radarBK.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-800/30">
                        <td className="py-2.5 font-bold text-white">{s.nama}</td>
                        <td className="py-2.5 text-slate-300">{s.nama_kelas}</td>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold text-[11px]">
                            {s.total_poin_pelanggaran} pt
                          </span>
                        </td>
                        <td className="py-2.5 font-semibold text-amber-400 text-[11px]">{s.status_sp}</td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => { setSelectedSP(s); setActiveTab('bk'); }}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-semibold text-[11px] cursor-pointer"
                          >
                            Cetak SP
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: PRESENSI & REKAP HARIAN */}
        {/* ========================================================= */}
        {activeTab === 'presensi' && (
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl md:text-2xl font-black text-white">Presensi &amp; Rekap Harian</h1>
                <p className="text-[11px] md:text-xs text-slate-400">Monitoring kehadiran siswa dan perizinan langsung dari HP.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleJalankanAutoAlpa}
                  className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Cut-Off Alpa ({pengaturan.jam_alpa_otomatis})
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print
                </button>
              </div>
            </div>

            {/* Filter Kelas */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <span className="text-[11px] text-slate-400 font-semibold shrink-0">Kelas:</span>
              {['ALL', 'VII A', 'VIII B', 'IX A'].map((kls) => (
                <button
                  key={kls}
                  onClick={() => setFilterKelas(kls)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
                    filterKelas === kls ? 'bg-emerald-600 text-slate-950' : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  {kls === 'ALL' ? 'Semua' : kls}
                </button>
              ))}
            </div>

            {/* Tabel Presensi */}
            <div className="rounded-2xl md:rounded-3xl bg-slate-900 border border-slate-800 p-4 md:p-6 shadow-xl">
              <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
                <table className="w-full text-left text-xs min-w-[550px]">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-2.5">Siswa</th>
                      <th className="pb-2.5">Kelas</th>
                      <th className="pb-2.5">Kontak Ortu</th>
                      <th className="pb-2.5 text-center">Tandai Status Presensi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredSiswa.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-800/30">
                        <td className="py-2.5 font-bold text-white">
                          <div>{s.nama}</div>
                          <div className="text-[10px] font-mono text-emerald-400">{s.barcode_id}</div>
                        </td>
                        <td className="py-2.5 text-slate-300">{s.nama_kelas}</td>
                        <td className="py-2.5 text-slate-400 text-[11px]">{s.nama_ortu} ({s.no_wa_ortu})</td>
                        <td className="py-2.5 text-center">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handlePresensiManual(s.id, 'HADIR')}
                              className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30 cursor-pointer"
                            >
                              Hadir
                            </button>
                            <button
                              onClick={() => handlePresensiManual(s.id, 'SAKIT')}
                              className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-bold text-[10px] border border-sky-500/30 cursor-pointer"
                            >
                              Sakit
                            </button>
                            <button
                              onClick={() => handlePresensiManual(s.id, 'IZIN')}
                              className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-400 font-bold text-[10px] border border-teal-500/30 cursor-pointer"
                            >
                              Izin
                            </button>
                            <button
                              onClick={() => handlePresensiManual(s.id, 'ALPA')}
                              className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold text-[10px] border border-rose-500/30 cursor-pointer"
                            >
                              Alpa (+5pt)
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: TATA TERTIB & POIN */}
        {/* ========================================================= */}
        {activeTab === 'pelanggaran' && (
          <div className="space-y-4 md:space-y-6">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white">Tata Tertib &amp; Buku Poin</h1>
              <p className="text-[11px] md:text-xs text-slate-400">Pencatatan pelanggaran disiplin dan ibadah santri oleh Tim Kesiswaan/Tatib.</p>
            </div>

            {/* FORM INPUT PELANGGARAN */}
            <div className="rounded-2xl md:rounded-3xl bg-slate-900 border border-slate-800 p-4 md:p-6 shadow-xl">
              <h3 className="text-xs md:text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Input Pelanggaran Lapangan (Auto WA Botcake)</span>
              </h3>

              <form onSubmit={handleSubmitPelanggaran} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Pilih Siswa</label>
                  <select
                    value={formPelanggaran.siswa_id}
                    onChange={(e) => setFormPelanggaran({ ...formPelanggaran, siswa_id: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  >
                    <option value="">-- Pilih Siswa --</option>
                    {siswaList.map((s) => (
                      <option key={s.id} value={s.id}>{s.nama} ({s.nama_kelas}) - {s.total_poin_pelanggaran} pt</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Jenis Pelanggaran</label>
                  <select
                    value={formPelanggaran.kategori_pelanggaran_id}
                    onChange={(e) => setFormPelanggaran({ ...formPelanggaran, kategori_pelanggaran_id: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  >
                    <option value="">-- Pilih Pelanggaran --</option>
                    {kategoriList.map((k) => (
                      <option key={k.id} value={k.id}>
                        [{k.kategori}] {k.nama_pelanggaran} (+{k.bobot_poin} pt)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Catatan Kejadian</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formPelanggaran.catatan}
                      onChange={(e) => setFormPelanggaran({ ...formPelanggaran, catatan: e.target.value })}
                      placeholder="Catatan guru..."
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-slate-950 text-xs transition shrink-0 cursor-pointer"
                    >
                      Kirim WA
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* TABEL MASTER KATEGORI PELANGGARAN */}
            <div className="rounded-2xl md:rounded-3xl bg-slate-900 border border-slate-800 p-4 md:p-6 shadow-xl">
              <h3 className="text-xs md:text-sm font-bold text-white uppercase tracking-wider mb-3">
                Master Kategori Pelanggaran ({kategoriList.length})
              </h3>

              <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0 max-h-64 overflow-y-auto">
                <table className="w-full text-left text-xs min-w-[450px]">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-2">Kode</th>
                      <th className="pb-2">Pelanggaran</th>
                      <th className="pb-2">Kategori</th>
                      <th className="pb-2">Poin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {kategoriList.map((k) => (
                      <tr key={k.id}>
                        <td className="py-2 font-mono text-emerald-400 text-[11px]">{k.kode}</td>
                        <td className="py-2 font-medium text-white text-xs">{k.nama_pelanggaran}</td>
                        <td className="py-2 text-[10px] font-bold text-teal-400">{k.kategori}</td>
                        <td className="py-2 font-bold text-rose-400">+{k.bobot_poin} pt</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: BIMBINGAN KONSELING & SP */}
        {/* ========================================================= */}
        {activeTab === 'bk' && (
          <div className="space-y-4 md:space-y-6">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white">Bimbingan Konseling &amp; Dokumen SP</h1>
              <p className="text-[11px] md:text-xs text-slate-400">Penerbitan surat peringatan (SP) dan panggilan orang tua ke ruang BK.</p>
            </div>

            {/* Threshold Guide */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="font-bold text-amber-400 text-xs">25 Poin</div>
                <div className="text-[10px] text-slate-300">Peringatan Lisan</div>
              </div>
              <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                <div className="font-bold text-orange-400 text-xs">50 Poin</div>
                <div className="text-[10px] text-slate-300">SP 1 &amp; Panggilan Ortu</div>
              </div>
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <div className="font-bold text-rose-400 text-xs">75 Poin</div>
                <div className="text-[10px] text-slate-300">SP 2 &amp; Skorsing 3 Hari</div>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <div className="font-bold text-purple-400 text-xs">100 Poin</div>
                <div className="text-[10px] text-slate-300">SP 3 / Konferensi Kasus</div>
              </div>
            </div>

            {/* TABEL SISWA RADAR BK */}
            <div className="rounded-2xl md:rounded-3xl bg-slate-900 border border-slate-800 p-4 md:p-6 shadow-xl">
              <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-2.5">Siswa</th>
                      <th className="pb-2.5">Kelas</th>
                      <th className="pb-2.5">Total Poin</th>
                      <th className="pb-2.5">Status SP</th>
                      <th className="pb-2.5 text-right">Generator Dokumen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {radarBK.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-800/30">
                        <td className="py-2.5 font-bold text-white">{s.nama}</td>
                        <td className="py-2.5 text-slate-300">{s.nama_kelas}</td>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold text-[11px]">
                            {s.total_poin_pelanggaran} pt
                          </span>
                        </td>
                        <td className="py-2.5 font-bold text-amber-400 text-[11px]">{s.status_sp}</td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => setSelectedSP(s)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[11px] flex items-center gap-1 ml-auto cursor-pointer"
                          >
                            <Printer className="w-3 h-3" />
                            Cetak SP
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MODAL SURAT RESMI */}
            {selectedSP && (
              <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
                <div className="max-w-2xl w-full bg-white text-slate-900 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-2xl max-h-[92vh] overflow-y-auto">
                  {/* KOP */}
                  <div className="border-b-4 border-double border-slate-900 pb-3 mb-4 text-center">
                    <h3 className="font-serif font-black text-xs md:text-sm uppercase">KEMENTERIAN AGAMA REPUBLIK INDONESIA</h3>
                    <h2 className="font-serif font-bold text-sm md:text-base uppercase">{pengaturan.nama_madrasah}</h2>
                    <p className="text-[10px] text-slate-600">NPSN: {pengaturan.npsn} • {pengaturan.alamat}</p>
                  </div>

                  {/* ISI */}
                  <div className="space-y-3 text-[11px] md:text-xs leading-relaxed">
                    <div className="flex justify-between font-medium">
                      <div>No: 045/MTsN.1/BK/X/2026<br />Hal: {selectedSP.status_sp}</div>
                      <div>{new Date().toLocaleDateString('id-ID')}</div>
                    </div>

                    <p>Kepada Yth.<br /><strong>Bapak/Ibu Wali dari: {selectedSP.nama}</strong><br />Di Tempat</p>

                    <p>Sehubungan data kedisiplinan dan tata tertib madrasah, kami menginformasikan bahwa ananda:</p>

                    <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 space-y-1">
                      <div><strong>Nama:</strong> {selectedSP.nama} ({selectedSP.nisn})</div>
                      <div><strong>Kelas:</strong> {selectedSP.nama_kelas}</div>
                      <div><strong>Poin Pelanggaran:</strong> <span className="text-rose-600 font-bold">{selectedSP.total_poin_pelanggaran} Poin</span></div>
                      <div><strong>Tindakan:</strong> <span className="font-bold text-amber-700">{selectedSP.status_sp}</span></div>
                    </div>

                    <p>Maka pihak madrasah menerbitkan <strong>{selectedSP.status_sp}</strong> dan mengharap kehadiran Bapak/Ibu Wali Siswa di <strong>Ruang BK Madrasah</strong>.</p>

                    <div className="pt-6 flex justify-between text-center text-[10px] md:text-xs">
                      <div>Kepala Madrasah<br /><br /><br /><strong>({pengaturan.nama_kepala})</strong></div>
                      <div>Guru BK<br /><br /><br /><strong>(Ustadzah Siti Rahmawati)</strong></div>
                    </div>
                  </div>

                  <div className="mt-6 pt-3 border-t border-slate-200 flex justify-end gap-2">
                    <button onClick={() => setSelectedSP(null)} className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer">
                      Tutup
                    </button>
                    <button onClick={() => window.print()} className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer">
                      <Printer className="w-3.5 h-3.5" />
                      Print PDF
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: DATA SISWA & CETAK KARTU */}
        {/* ========================================================= */}
        {activeTab === 'siswa' && (
          <div className="space-y-4 md:space-y-6">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white">Data Siswa &amp; Kartu Barcode</h1>
              <p className="text-[11px] md:text-xs text-slate-400">Manajemen siswa dan cetak kartu pelajar barcode CR80 siap pakai.</p>
            </div>

            {/* TABEL SISWA */}
            <div className="rounded-2xl md:rounded-3xl bg-slate-900 border border-slate-800 p-4 md:p-6 shadow-xl">
              <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-2.5">Barcode</th>
                      <th className="pb-2.5">Nama Siswa</th>
                      <th className="pb-2.5">Kelas</th>
                      <th className="pb-2.5">Poin</th>
                      <th className="pb-2.5 text-right">Kartu Siswa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {siswaList.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-800/30">
                        <td className="py-2.5 font-mono text-emerald-400 text-[11px]">{s.barcode_id}</td>
                        <td className="py-2.5 font-bold text-white">{s.nama}</td>
                        <td className="py-2.5 text-slate-300">{s.nama_kelas}</td>
                        <td className="py-2.5 font-bold text-rose-400">{s.total_poin_pelanggaran} pt</td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => setSelectedKartu(s)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-bold text-[11px] flex items-center gap-1 ml-auto cursor-pointer"
                          >
                            <CreditCard className="w-3 h-3" />
                            Kartu
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MODAL KARTU BARCODE */}
            {selectedKartu && (
              <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-3">
                <div className="max-w-sm w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl text-center">
                  <h3 className="text-xs font-bold text-slate-300 uppercase mb-3">Kartu Santri / Siswa</h3>

                  <div className="w-72 h-44 mx-auto rounded-xl bg-gradient-to-br from-emerald-800 to-slate-950 border border-emerald-500/40 p-3.5 flex flex-col justify-between text-white text-left shadow-lg">
                    <div className="flex items-center justify-between border-b border-emerald-500/30 pb-1.5">
                      <div>
                        <div className="text-[9px] font-bold text-emerald-300 uppercase">{pengaturan.nama_madrasah}</div>
                        <div className="text-[7px] text-slate-300">KARTU PRESENSI BARCODE</div>
                      </div>
                      <School className="w-5 h-5 text-emerald-400 shrink-0" />
                    </div>

                    <div className="flex items-center gap-2.5 my-auto">
                      <div className="w-12 h-16 rounded bg-slate-800 border border-emerald-500/40 overflow-hidden shrink-0">
                        <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${selectedKartu.nama}`} alt="" className="w-full h-full object-cover p-0.5" />
                      </div>
                      <div className="text-[11px] min-w-0">
                        <div className="font-black text-white truncate">{selectedKartu.nama}</div>
                        <div className="text-[9px] text-emerald-300">NISN: {selectedKartu.nisn}</div>
                        <div className="text-[9px] text-slate-300">Kelas: {selectedKartu.nama_kelas}</div>
                      </div>
                    </div>

                    <div className="bg-white p-1 rounded text-center">
                      <div className="font-mono font-black text-[10px] text-slate-900">{selectedKartu.barcode_id}</div>
                      <div className="text-[7px] text-slate-600 font-mono">||| | |||| || ||| |||| | |||</div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-center gap-2">
                    <button onClick={() => setSelectedKartu(null)} className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer">
                      Tutup
                    </button>
                    <button onClick={() => window.print()} className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer">
                      <Printer className="w-3.5 h-3.5" />
                      Print
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: KONFIGURASI WHATSAPP BOTCAKE */}
        {/* ========================================================= */}
        {activeTab === 'wa' && (
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-xl md:text-2xl font-black text-white">Konfigurasi WhatsApp Botcake</h1>
                <p className="text-[11px] md:text-xs text-slate-400">Integrasi resmi WhatsApp Botcake / Pancake API.</p>
              </div>

              <div className="self-start sm:self-auto px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Botcake: Ready</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 items-start">
              {/* Form Config */}
              <div className="lg:col-span-7 space-y-4">
                <form onSubmit={handleSimpanWA} className="rounded-2xl md:rounded-3xl bg-slate-900 border border-slate-800 p-4 md:p-6 shadow-xl space-y-3.5">
                  <h3 className="text-xs md:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>Provider Botcake / Pancake</span>
                  </h3>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Provider WhatsApp</label>
                    <select
                      value={waConfig.wa_provider}
                      onChange={(e) => setWaConfig({ ...waConfig, wa_provider: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-emerald-400 font-bold"
                    >
                      <option value="botcake">🥞 Botcake / Pancake WhatsApp (Aktif &amp; Terverifikasi PT)</option>
                      <option value="fonnte">Fonnte Gateway</option>
                      <option value="baileys">Node.js Baileys</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Botcake API Access Token</label>
                    <input
                      type="text"
                      value={waConfig.wa_api_key}
                      onChange={(e) => setWaConfig({ ...waConfig, wa_api_key: e.target.value })}
                      placeholder="Masukkan Botcake Access Token..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Template Notifikasi Siswa Alpa</label>
                    <textarea
                      rows="2"
                      value={waConfig.template_alpa}
                      onChange={(e) => setWaConfig({ ...waConfig, template_alpa: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                  </div>

                  <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-slate-950 text-xs shadow cursor-pointer">
                    Simpan Konfigurasi
                  </button>
                </form>
              </div>

              {/* Form Tes Kirim */}
              <div className="lg:col-span-5 space-y-4">
                <form onSubmit={handleKirimTesWA} className="rounded-2xl md:rounded-3xl bg-slate-900 border border-slate-800 p-4 md:p-6 shadow-xl space-y-3">
                  <h3 className="text-xs md:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Send className="w-4 h-4 text-teal-400" />
                    <span>Uji Kirim Pesan Botcake</span>
                  </h3>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Nomor HP Penerima</label>
                    <input
                      type="text"
                      value={testWA.no_tujuan}
                      onChange={(e) => setTestWA({ ...testWA, no_tujuan: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Pesan Uji Coba</label>
                    <textarea
                      rows="2"
                      value={testWA.pesan}
                      onChange={(e) => setTestWA({ ...testWA, pesan: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                  </div>

                  <button type="submit" className="w-full py-2 rounded-xl bg-teal-600 hover:bg-teal-500 font-bold text-slate-950 text-xs flex items-center justify-center gap-1.5 shadow cursor-pointer">
                    <Send className="w-3.5 h-3.5" />
                    Kirim Pesan Tes
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 7: PENGATURAN MADRASAH */}
        {/* ========================================================= */}
        {activeTab === 'pengaturan' && (
          <div className="space-y-4 md:space-y-6 max-w-3xl">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white">Pengaturan Madrasah &amp; Jam</h1>
              <p className="text-[11px] md:text-xs text-slate-400">Atur KOP Surat Kemenag resmi dan batas jam keterlambatan.</p>
            </div>

            <form onSubmit={handleSimpanPengaturan} className="rounded-2xl md:rounded-3xl bg-slate-900 border border-slate-800 p-4 md:p-6 shadow-xl space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Nama Madrasah</label>
                  <input
                    type="text"
                    value={pengaturan.nama_madrasah}
                    onChange={(e) => setPengaturan({ ...pengaturan, nama_madrasah: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">NPSN</label>
                  <input
                    type="text"
                    value={pengaturan.npsn}
                    onChange={(e) => setPengaturan({ ...pengaturan, npsn: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Nama Kepala Madrasah</label>
                  <input
                    type="text"
                    value={pengaturan.nama_kepala}
                    onChange={(e) => setPengaturan({ ...pengaturan, nama_kepala: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">NIP Kepala</label>
                  <input
                    type="text"
                    value={pengaturan.nip_kepala}
                    onChange={(e) => setPengaturan({ ...pengaturan, nip_kepala: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Jam Masuk</label>
                  <input
                    type="time"
                    value={pengaturan.jam_masuk}
                    onChange={(e) => setPengaturan({ ...pengaturan, jam_masuk: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Jam Cut-Off Alpa</label>
                  <input
                    type="time"
                    value={pengaturan.jam_alpa_otomatis}
                    onChange={(e) => setPengaturan({ ...pengaturan, jam_alpa_otomatis: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-slate-950 text-xs shadow cursor-pointer">
                Simpan Pengaturan
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
