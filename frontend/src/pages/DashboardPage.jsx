import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, Users, ShieldAlert, Award, FileText, 
  MessageSquare, LogOut, CheckCircle2, AlertTriangle, Clock, 
  Search, Plus, Printer, Eye, ChevronRight, School, Send, RefreshCw,
  QrCode, Settings, Trash2, Smartphone, ShieldCheck, Check, X, CreditCard
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function DashboardPage({ user, onLogout }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ringkasan');
  const [currentUser, setCurrentUser] = useState(user || null);

  // Data States
  const [siswaList, setSiswaList] = useState([]);
  const [kategoriList, setKategoriList] = useState([]);
  const [riwayatPelanggaran, setRiwayatPelanggaran] = useState([]);
  const [radarBK, setRadarBK] = useState([]);
  const [sesiBK, setSesiBK] = useState([]);
  const [waLogs, setWaLogs] = useState([]);
  const [waConfig, setWaConfig] = useState({
    wa_provider: 'fonnte',
    wa_api_key: 'DEMO_KEY_998',
    wa_sender_number: '081298765432',
    wa_status: 'CONNECTED',
    template_alpa: '',
    template_pelanggaran: '',
    template_sp: '',
    template_panggilan: ''
  });
  const [pengaturan, setPengaturan] = useState({
    nama_madrasah: '',
    npsn: '',
    alamat: '',
    no_telp: '',
    email: '',
    nama_kepala: '',
    nip_kepala: '',
    jam_masuk: '07:00',
    jam_toleransi: '07:15',
    jam_alpa_otomatis: '07:30'
  });
  const [stats, setStats] = useState({ total_siswa: 0, hadir: 0, terlambat: 0, sakit: 0, izin: 0, alpa: 0, belum_scan: 0 });

  // Notifications
  const [toast, setToast] = useState({ show: false, text: '', type: 'success' });

  // Forms
  const [formPelanggaran, setFormPelanggaran] = useState({ siswa_id: '', kategori_pelanggaran_id: '', catatan: '' });
  const [formKategoriBaru, setFormKategoriBaru] = useState({ kode: '', nama_pelanggaran: '', kategori: 'RINGAN', bobot_poin: 5 });
  const [formSiswaBaru, setFormSiswaBaru] = useState({ nisn: '', barcode_id: '', nama: '', jenis_kelamin: 'L', kelas_id: 1, no_wa_ortu: '', nama_ortu: '' });
  const [formSesiBK, setFormSesiBK] = useState({ siswa_id: '', keluhan: '', tindakan: '', hasil_kesepakatan: '' });
  const [testWA, setTestWA] = useState({ no_tujuan: '081234567890', pesan: 'Halo! Ini adalah pesan uji coba dari Sistem Disiplin & BK MTsN/MA Teladan.' });

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
      const [sRes, kRes, rRes, bRes, wRes, stRes, cfgRes, bkRes, setRes] = await Promise.all([
        fetch(`${API_BASE}/siswa`).then(r => r.json()),
        fetch(`${API_BASE}/pelanggaran/kategori`).then(r => r.json()),
        fetch(`${API_BASE}/pelanggaran/riwayat`).then(r => r.json()),
        fetch(`${API_BASE}/bk/radar-kasus`).then(r => r.json()),
        fetch(`${API_BASE}/wa/logs`).then(r => r.json()),
        fetch(`${API_BASE}/presensi/statistik-hari-ini`).then(r => r.json()),
        fetch(`${API_BASE}/wa/config`).then(r => r.json()),
        fetch(`${API_BASE}/bk/sesi`).then(r => r.json()),
        fetch(`${API_BASE}/pengaturan`).then(r => r.json())
      ]);

      if (sRes.success) setSiswaList(sRes.data);
      if (kRes.success) setKategoriList(kRes.data);
      if (rRes.success) setRiwayatPelanggaran(rRes.data);
      if (bRes.success) setRadarBK(bRes.data);
      if (wRes.success) setWaLogs(wRes.data);
      if (stRes.success) setStats(stRes);
      if (cfgRes.success && cfgRes.data) setWaConfig(cfgRes.data);
      if (bkRes.success) setSesiBK(bkRes.data);
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
        { id: 2, kode: 'IBD-02', nama_pelanggaran: 'Tidak membawa kelengkapan ibadah (mukena/sarung/Al-Quran)', kategori: 'IBADAH', bobot_poin: 5 },
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
        { id: 1, no_tujuan: '081234567892', tipe: 'PELANGGARAN', pesan: 'Assalamu’alaikum Wr. Wb. Yth. Bpk. Herman Susanto. Pihak madrasah menginformasikan bahwa ananda Muhammad Daffa Al-Fatih (IX A) tercatat melakukan pelanggaran: "Merokok" (+25 pt). Total akumulasi poin: 55 pt (SP1). Mohon bimbingan bersama.', status: 'SENT', created_at: '2026-10-27 10:15:22' },
        { id: 2, no_tujuan: '081234567890', tipe: 'TEST', pesan: 'Tes kirim notifikasi via Botcake WhatsApp API (Status: SENT)', status: 'SENT', created_at: '2026-10-27 18:48:30' }
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

  // 1. Submit Pelanggaran
  const handleSubmitPelanggaran = async (e) => {
    e.preventDefault();
    if (!formPelanggaran.siswa_id || !formPelanggaran.kategori_pelanggaran_id) return;

    try {
      const res = await fetch(`${API_BASE}/pelanggaran/input`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formPelanggaran,
          pelapor_guru_id: currentUser?.id || 1
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        setFormPelanggaran({ siswa_id: '', kategori_pelanggaran_id: '', catatan: '' });
        loadAllData();
      }
    } catch (err) {
      showToast('Gagal mencatat pelanggaran', 'error');
    }
  };

  // 2. Tambah Kategori Pelanggaran
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
      showToast('Gagal menambah kategori', 'error');
    }
  };

  // 3. Hapus Kategori Pelanggaran
  const handleHapusKategori = async (id) => {
    if (!window.confirm('Yakin ingin menghapus jenis pelanggaran ini?')) return;
    try {
      const res = await fetch(`${API_BASE}/pelanggaran/kategori/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Kategori pelanggaran berhasil dihapus');
        loadAllData();
      }
    } catch (err) {
      showToast('Gagal menghapus kategori', 'error');
    }
  };

  // 4. Presensi Manual
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
      showToast('Gagal update status presensi', 'error');
    }
  };

  // 5. Eksekusi Auto-Alpa
  const handleJalankanAutoAlpa = async () => {
    if (!window.confirm('Jalankan Auto-Cutoff? Semua siswa yang belum scan akan otomatis ditandai ALPA (+5 poin) dan orang tua menerima WA.')) return;
    try {
      const res = await fetch(`${API_BASE}/presensi/jalankan-alpa`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        loadAllData();
      }
    } catch (err) {
      showToast('Gagal menjalankan auto-alpa', 'error');
    }
  };

  // 6. Simpan Pengaturan WhatsApp
  const handleSimpanWA = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/wa/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(waConfig)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Konfigurasi WhatsApp Gateway berhasil disimpan!');
        loadAllData();
      }
    } catch (err) {
      showToast('Gagal menyimpan konfigurasi WA', 'error');
    }
  };

  // 7. Tes Kirim WhatsApp
  const handleKirimTesWA = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/wa/test-send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testWA)
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        loadAllData();
      }
    } catch (err) {
      showToast('Gagal mengirim pesan uji coba', 'error');
    }
  };

  // 8. Tambah Siswa Baru
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
      showToast('Gagal menambah siswa', 'error');
    }
  };

  // 9. Simpan Pengaturan Identitas Madrasah
  const handleSimpanPengaturan = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/pengaturan`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pengaturan)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Identitas madrasah & jam sekolah berhasil diperbarui');
        loadAllData();
      }
    } catch (err) {
      showToast('Gagal menyimpan identitas madrasah', 'error');
    }
  };

  const filteredSiswa = filterKelas === 'ALL' ? siswaList : siswaList.filter(s => s.nama_kelas === filterKelas);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* ========================================================= */}
      {/* SIDEBAR NAVIGATION */}
      {/* ========================================================= */}
      <aside className="w-full md:w-72 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo Brand */}
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <School className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white leading-tight tracking-tight">SI-DISIPLIN &amp; BK</h2>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Madrasah Teladan</p>
            </div>
          </div>

          {/* User Profile Mini */}
          <div className="p-4 mx-4 my-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm border border-emerald-500/30">
              {currentUser?.nama?.charAt(0) || 'G'}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">{currentUser?.nama || 'Guru'}</div>
              <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">{currentUser?.role || 'Staff'}</div>
            </div>
          </div>

          {/* Navigasi Menu */}
          <nav className="p-3 space-y-1 text-xs font-semibold">
            {[
              { id: 'ringkasan', label: '1. Dashboard Eksekutif', icon: LayoutDashboard },
              { id: 'presensi', label: '2. Presensi & Rekap Harian', icon: Clock },
              { id: 'pelanggaran', label: '3. Tata Tertib & Buku Poin', icon: ShieldAlert },
              { id: 'bk', label: '4. Bimbingan Konseling & SP', icon: Award },
              { id: 'siswa', label: '5. Data Siswa & Cetak Kartu', icon: CreditCard },
              { id: 'wa', label: '6. Konfigurasi WhatsApp', icon: MessageSquare },
              { id: 'pengaturan', label: '7. Pengaturan Madrasah', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition cursor-pointer text-left ${
                    isActive 
                      ? 'bg-emerald-600 text-slate-950 font-bold shadow-lg shadow-emerald-600/20' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            to="/"
            target="_blank"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-emerald-400 text-xs font-bold transition border border-slate-700 hover:border-emerald-500 shadow"
          >
            <Eye className="w-4 h-4" />
            <span>Buka Layar Kios Gerbang</span>
          </Link>

          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition border border-rose-500/20 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* MAIN CONTENT AREA */}
      {/* ========================================================= */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {/* Global Toast */}
        {toast.show && (
          <div className={`mb-6 p-4 rounded-2xl text-xs font-semibold flex items-center gap-3 shadow-xl border ${
            toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}>
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{toast.text}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 1: DASHBOARD EKSEKUTIF */}
        {/* ========================================================= */}
        {activeTab === 'ringkasan' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-white">Dashboard Eksekutif Madrasah</h1>
                <p className="text-xs text-slate-400">Ikhtisar kehadiran siswa, grafik poin kedisiplinan, dan radar kasus bimbingan konseling.</p>
              </div>
              <button onClick={loadAllData} className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Segarkan Data</span>
              </button>
            </div>

            {/* Metrik Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 mb-1">Total Siswa Terdaftar</div>
                <div className="text-3xl font-black text-white">{stats.total_siswa}</div>
                <div className="text-[10px] text-emerald-400 mt-2 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3 h-3" /> Data Tersinkron
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-xs text-emerald-400 mb-1">Hadir Tepat Waktu</div>
                <div className="text-3xl font-black text-emerald-400">{stats.hadir}</div>
                <div className="text-[10px] text-slate-400 mt-2">Sebelum {pengaturan.jam_masuk || '07:00'} WIB</div>
              </div>

              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <div className="text-xs text-amber-400 mb-1">Terlambat Masuk</div>
                <div className="text-3xl font-black text-amber-400">{stats.terlambat}</div>
                <div className="text-[10px] text-amber-400 mt-2">+5 poin per keterlambatan</div>
              </div>

              <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                <div className="text-xs text-rose-400 mb-1">Alpa / Belum Scan</div>
                <div className="text-3xl font-black text-rose-400">{stats.alpa + stats.belum_scan}</div>
                <div className="text-[10px] text-rose-400 mt-2">Perlu dipantau wali kelas</div>
              </div>
            </div>

            {/* Radar Siswa Bermasalah */}
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Radar Siswa Bermasalah (Poin &gt;= 25)</h3>
                </div>
                <button onClick={() => setActiveTab('bk')} className="text-xs text-emerald-400 hover:underline font-semibold">
                  Buka Modul BK &rarr;
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-3">Siswa</th>
                      <th className="pb-3">Kelas</th>
                      <th className="pb-3">Total Poin</th>
                      <th className="pb-3">Status Surat Peringatan</th>
                      <th className="pb-3">Orang Tua / No WA</th>
                      <th className="pb-3 text-right">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {radarBK.length > 0 ? (
                      radarBK.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-800/30">
                          <td className="py-3 font-bold text-white">{s.nama}</td>
                          <td className="py-3 text-slate-300">{s.nama_kelas}</td>
                          <td className="py-3">
                            <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
                              {s.total_poin_pelanggaran} pt
                            </span>
                          </td>
                          <td className="py-3 font-semibold text-amber-400">{s.status_sp}</td>
                          <td className="py-3 text-slate-400">{s.nama_ortu} ({s.no_wa_ortu})</td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => {
                                setSelectedSP(s);
                                setActiveTab('bk');
                              }}
                              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-semibold cursor-pointer"
                            >
                              Buka Dokumen SP
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-6 text-center text-slate-500">
                          Alhamdulillah, belum ada siswa yang melewati ambang batas 25 poin.
                        </td>
                      </tr>
                    )}
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
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-white">Presensi &amp; Rekap Harian</h1>
                <p className="text-xs text-slate-400">Monitoring kehadiran siswa dari gerbang dan kelola perizinan (Sakit/Izin/Alpa).</p>
              </div>

              {/* Tombol Eksekusi Cut-Off Alpa */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleJalankanAutoAlpa}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/20 cursor-pointer"
                  title="Otomatis menandai siswa yang belum scan jam 07.30 sebagai Alpa dan kirim WA"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Jalankan Cut-Off Alpa ({pengaturan.jam_alpa_otomatis || '07:30'})
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 border border-slate-700"
                >
                  <Printer className="w-4 h-4" />
                  Cetak Rekap PDF
                </button>
              </div>
            </div>

            {/* Filter Kelas */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">Filter Kelas:</span>
              {['ALL', 'VII A', 'VIII B', 'IX A'].map((kls) => (
                <button
                  key={kls}
                  onClick={() => setFilterKelas(kls)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    filterKelas === kls ? 'bg-emerald-600 text-slate-950' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {kls === 'ALL' ? 'Semua Kelas' : kls}
                </button>
              ))}
            </div>

            {/* Tabel Presensi */}
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-3">NISN / Barcode</th>
                      <th className="pb-3">Nama Siswa</th>
                      <th className="pb-3">Kelas</th>
                      <th className="pb-3">Kontak Orang Tua</th>
                      <th className="pb-3 text-center">Tandai Status Presensi Hari Ini</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredSiswa.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-800/30">
                        <td className="py-3 font-mono text-emerald-400">{s.barcode_id}</td>
                        <td className="py-3 font-bold text-white">{s.nama}</td>
                        <td className="py-3 text-slate-300">{s.nama_kelas}</td>
                        <td className="py-3 text-slate-400">{s.nama_ortu} ({s.no_wa_ortu})</td>
                        <td className="py-3 text-center">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handlePresensiManual(s.id, 'HADIR')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold border border-emerald-500/30 cursor-pointer"
                            >
                              Hadir
                            </button>
                            <button
                              onClick={() => handlePresensiManual(s.id, 'SAKIT')}
                              className="px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 font-bold border border-sky-500/30 cursor-pointer"
                            >
                              Sakit
                            </button>
                            <button
                              onClick={() => handlePresensiManual(s.id, 'IZIN')}
                              className="px-2.5 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 font-bold border border-teal-500/30 cursor-pointer"
                            >
                              Izin
                            </button>
                            <button
                              onClick={() => handlePresensiManual(s.id, 'ALPA')}
                              className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-bold border border-rose-500/30 cursor-pointer"
                              title="Tandai Alpa + Tambah 5 Poin + Kirim WA ke Orang Tua"
                            >
                              Alpa (+5 pt &amp; WA)
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
        {/* TAB 3: TATA TERTIB & POIN PELANGGARAN */}
        {/* ========================================================= */}
        {activeTab === 'pelanggaran' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white">Tata Tertib &amp; Buku Poin Pelanggaran</h1>
              <p className="text-xs text-slate-400">Pencatatan pelanggaran disiplin dan ibadah siswa oleh Tim Kesiswaan/Tatib.</p>
            </div>

            {/* FORM INPUT PELANGGARAN SISWA */}
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Form Input Pelanggaran Lapangan (Auto Blast WA)</span>
              </h3>

              <form onSubmit={handleSubmitPelanggaran} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Pilih Siswa</label>
                  <select
                    value={formPelanggaran.siswa_id}
                    onChange={(e) => setFormPelanggaran({ ...formPelanggaran, siswa_id: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">-- Pilih Siswa --</option>
                    {siswaList.map((s) => (
                      <option key={s.id} value={s.id}>{s.nama} ({s.nama_kelas}) - Total: {s.total_poin_pelanggaran} pt</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Jenis Pelanggaran</label>
                  <select
                    value={formPelanggaran.kategori_pelanggaran_id}
                    onChange={(e) => setFormPelanggaran({ ...formPelanggaran, kategori_pelanggaran_id: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">-- Pilih Jenis Pelanggaran --</option>
                    {kategoriList.map((k) => (
                      <option key={k.id} value={k.id}>
                        [{k.kategori}] {k.nama_pelanggaran} (+{k.bobot_poin} pt)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Catatan Kejadian</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formPelanggaran.catatan}
                      onChange={(e) => setFormPelanggaran({ ...formPelanggaran, catatan: e.target.value })}
                      placeholder="Misal: Ditemukan merokok di kantin belakang..."
                      className="flex-1 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-slate-950 text-xs transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Simpan &amp; WA
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* MASTER KATEGORI PELANGGARAN */}
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Master Kategori Pelanggaran Madrasah ({kategoriList.length})
                </h3>
              </div>

              {/* Form Tambah Kategori */}
              <form onSubmit={handleTambahKategori} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Kode</label>
                  <input
                    type="text"
                    value={formKategoriBaru.kode}
                    onChange={(e) => setFormKategoriBaru({ ...formKategoriBaru, kode: e.target.value })}
                    placeholder="Misal: IBD-04"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Nama Pelanggaran</label>
                  <input
                    type="text"
                    value={formKategoriBaru.nama_pelanggaran}
                    onChange={(e) => setFormKategoriBaru({ ...formKategoriBaru, nama_pelanggaran: e.target.value })}
                    placeholder="Nama pelanggaran..."
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Kategori</label>
                  <select
                    value={formKategoriBaru.kategori}
                    onChange={(e) => setFormKategoriBaru({ ...formKategoriBaru, kategori: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value="IBADAH">IBADAH</option>
                    <option value="RINGAN">RINGAN</option>
                    <option value="SEDANG">SEDANG</option>
                    <option value="BERAT">BERAT</option>
                    <option value="SANGAT BERAT">SANGAT BERAT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Poin</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={formKategoriBaru.bobot_poin}
                      onChange={(e) => setFormKategoriBaru({ ...formKategoriBaru, bobot_poin: Number(e.target.value) })}
                      min="1"
                      max="100"
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                    <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs cursor-pointer">
                      Tambah
                    </button>
                  </div>
                </div>
              </form>

              {/* Tabel Kategori */}
              <div className="overflow-x-auto max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-3">Kode</th>
                      <th className="pb-3">Nama Pelanggaran</th>
                      <th className="pb-3">Kategori</th>
                      <th className="pb-3">Poin</th>
                      <th className="pb-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {kategoriList.map((k) => (
                      <tr key={k.id} className="hover:bg-slate-800/30">
                        <td className="py-2.5 font-mono text-emerald-400">{k.kode}</td>
                        <td className="py-2.5 font-semibold text-white">{k.nama_pelanggaran}</td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            k.kategori === 'IBADAH' ? 'bg-teal-500/20 text-teal-400' :
                            k.kategori === 'RINGAN' ? 'bg-emerald-500/20 text-emerald-400' :
                            k.kategori === 'SEDANG' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-rose-500/20 text-rose-400'
                          }`}>
                            {k.kategori}
                          </span>
                        </td>
                        <td className="py-2.5 font-bold text-rose-400">+{k.bobot_poin} pt</td>
                        <td className="py-2.5 text-right">
                          <button onClick={() => handleHapusKategori(k.id)} className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TABEL RIWAYAT PELANGGARAN TERAKHIR */}
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Riwayat Pelanggaran Terakhir</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-3">Tanggal</th>
                      <th className="pb-3">Siswa</th>
                      <th className="pb-3">Kelas</th>
                      <th className="pb-3">Pelanggaran</th>
                      <th className="pb-3">Poin</th>
                      <th className="pb-3">Catatan</th>
                      <th className="pb-3">Guru Pencatat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {riwayatPelanggaran.length > 0 ? (
                      riwayatPelanggaran.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-800/30">
                          <td className="py-3 text-slate-400">{r.tanggal}</td>
                          <td className="py-3 font-bold text-white">{r.nama_siswa}</td>
                          <td className="py-3 text-slate-300">{r.nama_kelas}</td>
                          <td className="py-3 font-semibold text-amber-300">{r.nama_pelanggaran}</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold">
                              +{r.poin_diberikan} pt
                            </span>
                          </td>
                          <td className="py-3 text-slate-400">{r.catatan || '-'}</td>
                          <td className="py-3 text-slate-400">{r.nama_pelapor || 'Ustadz Hendra'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="py-6 text-center text-slate-500">Belum ada riwayat pelanggaran tercatat.</td>
                      </tr>
                    )}
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
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white">Bimbingan Konseling (BK) &amp; Generator Dokumen SP</h1>
              <p className="text-xs text-slate-400">Pengelolaan radar kasus poin tinggi, sesi konseling rahasia, dan generator surat resmi Kemenag.</p>
            </div>

            {/* Threshold Guide */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <div className="font-bold text-amber-400 mb-1">Ambang 25 Poin</div>
                <div className="text-slate-300">Peringatan Lisan &amp; Notifikasi Perhatian ke Wali Siswa</div>
              </div>
              <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20">
                <div className="font-bold text-orange-400 mb-1">Ambang 50 Poin</div>
                <div className="text-slate-300">Penerbitan SP 1 + Undangan Pemanggilan Orang Tua Tahap 1</div>
              </div>
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                <div className="font-bold text-rose-400 mb-1">Ambang 75 Poin</div>
                <div className="text-slate-300">Penerbitan SP 2 + Skorsing Pembinaan di Rumah (3 Hari)</div>
              </div>
              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                <div className="font-bold text-purple-400 mb-1">Ambang 100 Poin</div>
                <div className="text-slate-300">Penerbitan SP 3 / Konferensi Kasus Terakhir (Pindah Sekolah)</div>
              </div>
            </div>

            {/* DAFTAR SISWA KASUS BK */}
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Daftar Siswa Dalam Pembinaan BK (Radar Kasus)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-3">Siswa</th>
                      <th className="pb-3">Kelas</th>
                      <th className="pb-3">Total Poin</th>
                      <th className="pb-3">Status Surat Peringatan</th>
                      <th className="pb-3">Kontak Orang Tua</th>
                      <th className="pb-3 text-right">Generator Dokumen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {radarBK.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-800/30">
                        <td className="py-3 font-bold text-white">{s.nama}</td>
                        <td className="py-3 text-slate-300">{s.nama_kelas}</td>
                        <td className="py-3">
                          <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
                            {s.total_poin_pelanggaran} pt
                          </span>
                        </td>
                        <td className="py-3 font-bold text-amber-400">{s.status_sp}</td>
                        <td className="py-3 text-slate-400">{s.nama_ortu} ({s.no_wa_ortu})</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => setSelectedSP(s)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition flex items-center gap-1.5 ml-auto cursor-pointer shadow-lg shadow-emerald-600/20"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            Cetak Surat Resmi
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MODAL PRATINJAU SURAT RESMI */}
            {selectedSP && (
              <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="max-w-2xl w-full bg-white text-slate-900 rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                  {/* KOP MADRASAH RESMI */}
                  <div className="border-b-4 border-double border-slate-900 pb-4 mb-6 text-center">
                    <h3 className="font-serif font-black text-sm tracking-wider uppercase">KEMENTERIAN AGAMA REPUBLIK INDONESIA</h3>
                    <h2 className="font-serif font-bold text-lg uppercase">{pengaturan.nama_madrasah || 'MADRASAH TSANAWIYAH NEGERI 1 TELADAN'}</h2>
                    <p className="text-[11px] text-slate-600">NPSN: {pengaturan.npsn || '20109988'} • {pengaturan.alamat || 'Jl. Pendidikan Karakter No. 45'} • Telp: {pengaturan.no_telp || '(021) 555-1234'}</p>
                  </div>

                  {/* ISI SURAT */}
                  <div className="space-y-4 text-xs leading-relaxed">
                    <div className="flex justify-between font-medium">
                      <div>Nomor: 045/MTsN.1/BK/X/2026<br />Lampiran: -<br />Hal: {selectedSP.status_sp}</div>
                      <div>Kota Teladan, {new Date().toLocaleDateString('id-ID')}</div>
                    </div>

                    <p>Kepada Yth.<br /><strong>Bapak/Ibu Wali dari: {selectedSP.nama}</strong><br />Di Tempat</p>

                    <p>
                      Assalamu’alaikum Warahmatullahi Wabarakatuh.<br />
                      Sehubungan dengan rekapitulasi data kedisiplinan dan tata tertib madrasah, kami menginformasikan bahwa ananda:
                    </p>

                    <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 space-y-1.5">
                      <div><strong>Nama Siswa:</strong> {selectedSP.nama}</div>
                      <div><strong>NISN:</strong> {selectedSP.nisn}</div>
                      <div><strong>Kelas:</strong> {selectedSP.nama_kelas}</div>
                      <div><strong>Akumulasi Poin Pelanggaran:</strong> <span className="text-rose-600 font-bold">{selectedSP.total_poin_pelanggaran} Poin</span></div>
                      <div><strong>Status Pembinaan:</strong> <span className="font-bold text-amber-700">{selectedSP.status_sp}</span></div>
                    </div>

                    <p>
                      Maka dengan ini pihak madrasah menerbitkan <strong>{selectedSP.status_sp}</strong> dan mengharap kehadiran Bapak/Ibu Wali Siswa di <strong>Ruang Bimbingan Konseling (BK)</strong> guna bersama-sama memberikan pembinaan terarah bagi ananda.
                    </p>

                    <p>Demikian surat ini kami sampaikan. Atas perhatian dan kerja samanya kami ucapkan terima kasih.<br />Wassalamu’alaikum Warahmatullahi Wabarakatuh.</p>

                    <div className="pt-8 flex justify-between text-center">
                      <div>
                        Mengetahui,<br />Kepala Madrasah<br /><br /><br /><br />
                        <strong>({pengaturan.nama_kepala || 'Drs. H. Ahmad Subagio, M.Pd'})</strong><br />
                        <span className="text-[10px] text-slate-500">NIP. {pengaturan.nip_kepala || '197508152000031001'}</span>
                      </div>
                      <div>
                        Guru Bimbingan Konseling,<br /><br /><br /><br /><br />
                        <strong>(Ustadzah Siti Rahmawati, S.Psi)</strong>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-200 flex justify-end gap-3">
                    <button
                      onClick={() => setSelectedSP(null)}
                      className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs"
                    >
                      Tutup
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      Cetak / Download PDF
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: DATA SISWA & CETAK KARTU BARCODE */}
        {/* ========================================================= */}
        {activeTab === 'siswa' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-white">Data Siswa &amp; Generator Kartu Barcode</h1>
                <p className="text-xs text-slate-400">Manajemen siswa dan cetak kartu pelajar ber-barcode ukuran standar CR80 siap pakai di gerbang.</p>
              </div>
            </div>

            {/* FORM TAMBAH SISWA */}
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Tambah Siswa Baru</span>
              </h3>

              <form onSubmit={handleTambahSiswa} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">NISN</label>
                  <input
                    type="text"
                    value={formSiswaBaru.nisn}
                    onChange={(e) => setFormSiswaBaru({ ...formSiswaBaru, nisn: e.target.value })}
                    placeholder="0081234567"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    value={formSiswaBaru.nama}
                    onChange={(e) => setFormSiswaBaru({ ...formSiswaBaru, nama: e.target.value })}
                    placeholder="Nama siswa..."
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Nama Orang Tua</label>
                  <input
                    type="text"
                    value={formSiswaBaru.nama_ortu}
                    onChange={(e) => setFormSiswaBaru({ ...formSiswaBaru, nama_ortu: e.target.value })}
                    placeholder="Bpk / Ibu..."
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">No. WhatsApp Orang Tua</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formSiswaBaru.no_wa_ortu}
                      onChange={(e) => setFormSiswaBaru({ ...formSiswaBaru, no_wa_ortu: e.target.value })}
                      placeholder="081234567890"
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                    <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-slate-950 text-xs cursor-pointer">
                      Simpan
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* TABEL SISWA & GENERATOR KARTU */}
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Daftar Siswa Madrasah ({siswaList.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-3">Barcode ID</th>
                      <th className="pb-3">Nama Siswa</th>
                      <th className="pb-3">NISN</th>
                      <th className="pb-3">Kelas</th>
                      <th className="pb-3">Orang Tua</th>
                      <th className="pb-3">Total Poin</th>
                      <th className="pb-3 text-right">Cetak Kartu Pelajar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {siswaList.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-800/30">
                        <td className="py-3 font-mono font-bold text-emerald-400">{s.barcode_id}</td>
                        <td className="py-3 font-bold text-white">{s.nama}</td>
                        <td className="py-3 text-slate-400 font-mono">{s.nisn}</td>
                        <td className="py-3 text-slate-300">{s.nama_kelas}</td>
                        <td className="py-3 text-slate-400">{s.nama_ortu} ({s.no_wa_ortu})</td>
                        <td className="py-3 font-bold text-rose-400">{s.total_poin_pelanggaran} pt</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => setSelectedKartu(s)}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-bold text-xs flex items-center gap-1.5 ml-auto cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            Kartu Barcode
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MODAL CETAK KARTU PELAJAR BARCODE */}
            {selectedKartu && (
              <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center">
                  <h3 className="text-sm font-bold text-slate-300 uppercase mb-4">Pratinjau Kartu Pelajar Madrasah</h3>

                  {/* KARTU CR80 RATIO */}
                  <div className="w-80 h-52 mx-auto rounded-2xl bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-950 border-2 border-emerald-500/40 p-4 flex flex-col justify-between text-white shadow-2xl relative overflow-hidden text-left">
                    <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2">
                      <div>
                        <div className="text-[10px] font-bold text-emerald-300 tracking-wider uppercase">{pengaturan.nama_madrasah || 'MTsN 1 TELADAN'}</div>
                        <div className="text-[8px] text-slate-300">KARTU PRESENSI SANTRI / SISWA</div>
                      </div>
                      <School className="w-6 h-6 text-emerald-400" />
                    </div>

                    <div className="flex items-center gap-3 my-auto">
                      <div className="w-16 h-20 rounded-lg bg-slate-800 border border-emerald-500/40 flex items-center justify-center overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${selectedKartu.nama}`} alt="" className="w-full h-full object-cover p-1" />
                      </div>
                      <div className="text-xs">
                        <div className="font-black text-sm text-white leading-tight">{selectedKartu.nama}</div>
                        <div className="text-[10px] text-emerald-300 mt-1">NISN: {selectedKartu.nisn}</div>
                        <div className="text-[10px] text-slate-300">Kelas: {selectedKartu.nama_kelas}</div>
                      </div>
                    </div>

                    <div className="bg-white p-1.5 rounded-lg text-center flex flex-col items-center justify-center">
                      <div className="font-mono font-black text-xs text-slate-900 tracking-widest">{selectedKartu.barcode_id}</div>
                      <div className="text-[8px] text-slate-600 font-mono tracking-tighter">||| | |||| || ||| |||| | ||| || ||||</div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-center gap-3">
                    <button onClick={() => setSelectedKartu(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold">
                      Tutup
                    </button>
                    <button onClick={() => window.print()} className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer">
                      <Printer className="w-4 h-4" />
                      Cetak Kartu Fisik
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: KONFIGURASI WHATSAPP GATEWAY (DETAIL SIAP JUAL) */}
        {/* ========================================================= */}
        {activeTab === 'wa' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-white">Konfigurasi WhatsApp Gateway</h1>
                <p className="text-xs text-slate-400">Atur provider WhatsApp, tautkan nomor madrasah via QR, kelola template pesan dinamis, dan tes kirim.</p>
              </div>

              {/* Status Badge */}
              <div className={`px-4 py-2 rounded-2xl border text-xs font-bold flex items-center gap-2.5 ${
                waConfig.wa_status === 'CONNECTED' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}>
                <div className={`w-2.5 h-2.5 rounded-full ${waConfig.wa_status === 'CONNECTED' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                <span>Status WA: {waConfig.wa_status === 'CONNECTED' ? 'TERHUBUNG (READY)' : 'TERPUTUS (OFFLINE)'}</span>
              </div>
            </div>

            {/* GRID UTAMA KONFIGURASI */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* SISI KIRI: DEVICE & PROVIDER SETTINGS (7 Cols) */}
              <div className="lg:col-span-7 space-y-6">
                {/* DEVICE SCANNER & ENGINE */}
                <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>Perangkat WhatsApp Madrasah</span>
                  </h3>

                  <div className="flex flex-col md:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                    {/* QR Code Card */}
                    <div className="w-36 h-36 bg-white p-2.5 rounded-2xl flex flex-col items-center justify-center shadow-lg shrink-0">
                      <QrCode className="w-full h-full text-slate-900" />
                      <span className="text-[9px] font-mono font-bold text-slate-700 mt-1">SCAN WA QR</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="font-bold text-white text-sm">Tautkan Perangkat WhatsApp</div>
                      <p className="text-slate-400 leading-relaxed">
                        Buka WhatsApp di HP Madrasah ➔ Perangkat Tertaut ➔ Arahkan kamera ke QR di samping untuk menghubungkan gateway.
                      </p>
                      <div className="pt-2 flex items-center gap-3">
                        <button
                          onClick={() => {
                            setWaConfig({ ...waConfig, wa_status: waConfig.wa_status === 'CONNECTED' ? 'DISCONNECTED' : 'CONNECTED' });
                            showToast(`Status WA diubah menjadi: ${waConfig.wa_status === 'CONNECTED' ? 'DISCONNECTED' : 'CONNECTED'}`);
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                            waConfig.wa_status === 'CONNECTED' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-600 text-slate-950'
                          }`}
                        >
                          {waConfig.wa_status === 'CONNECTED' ? 'Putuskan Koneksi' : 'Sambungkan Ulang'}
                        </button>
                        <span className="text-slate-500">Nomor Aktif: <strong className="text-emerald-400 font-mono">{waConfig.wa_sender_number}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FORM PROVIDER & API KEY */}
                <form onSubmit={handleSimpanWA} className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Settings className="w-4 h-4 text-emerald-400" />
                    <span>Provider Gateway &amp; Template Pesan</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">Pilihan Provider Gateway</label>
                      <select
                        value={waConfig.wa_provider}
                        onChange={(e) => setWaConfig({ ...waConfig, wa_provider: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-emerald-400 font-bold"
                      >
                        <option value="botcake">🥞 Botcake / Pancake WhatsApp (Utama &amp; Terverifikasi PT)</option>
                        <option value="fonnte">Fonnte Gateway</option>
                        <option value="baileys">Node.js Baileys (Self-Hosted)</option>
                        <option value="waha">WAHA (WhatsApp HTTP API)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                        {waConfig.wa_provider === 'botcake' ? 'Botcake API Access Token' : 'API Token / Secret Key'}
                      </label>
                      <input
                        type="text"
                        value={waConfig.wa_api_key}
                        onChange={(e) => setWaConfig({ ...waConfig, wa_api_key: e.target.value })}
                        placeholder={waConfig.wa_provider === 'botcake' ? 'Masukkan Botcake Access Token...' : 'API Key...'}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  {waConfig.wa_provider === 'botcake' && (
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <span>🥞 Mode Botcake / Pancake Aktif</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Sistem terhubung langsung menggunakan arsitektur <strong>Botcake.io / Pancake WhatsApp API</strong> yang terbukti stabil &amp; resmi untuk pengiriman notifikasi otomatis massal tanpa risiko blokir nomor.
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Template Notifikasi Siswa Alpa</label>
                    <textarea
                      rows="2"
                      value={waConfig.template_alpa}
                      onChange={(e) => setWaConfig({ ...waConfig, template_alpa: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                    <div className="text-[10px] text-slate-500 mt-1">Variabel: {'{nama_siswa}'}, {'{kelas}'}, {'{nama_ortu}'}, {'{tanggal}'}</div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Template Notifikasi Pelanggaran Baru</label>
                    <textarea
                      rows="2"
                      value={waConfig.template_pelanggaran}
                      onChange={(e) => setWaConfig({ ...waConfig, template_pelanggaran: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                    <div className="text-[10px] text-slate-500 mt-1">Variabel: {'{nama_siswa}'}, {'{nama_pelanggaran}'}, {'{poin}'}, {'{total_poin}'}, {'{status_sp}'}</div>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-slate-950 text-xs transition cursor-pointer shadow-lg shadow-emerald-600/20"
                  >
                    Simpan Konfigurasi WhatsApp
                  </button>
                </form>
              </div>

              {/* SISI KANAN: TEST KIRIM & LOGS (5 Cols) */}
              <div className="lg:col-span-5 space-y-6">
                {/* FORM UJI COBA KIRIM PESAN */}
                <form onSubmit={handleKirimTesWA} className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Send className="w-4 h-4 text-teal-400" />
                    <span>Uji Coba Kirim Pesan WhatsApp</span>
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Nomor Tujuan (HP Anda)</label>
                    <input
                      type="text"
                      value={testWA.no_tujuan}
                      onChange={(e) => setTestWA({ ...testWA, no_tujuan: e.target.value })}
                      placeholder="081234567890"
                      required
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Isi Pesan Uji Coba</label>
                    <textarea
                      rows="3"
                      value={testWA.pesan}
                      onChange={(e) => setTestWA({ ...testWA, pesan: e.target.value })}
                      required
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 font-bold text-slate-950 text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Kirim Pesan Uji Coba Sekarang
                  </button>
                </form>

                {/* LOGS TERAKHIR */}
                <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center justify-between">
                    <span>Log Pengiriman Terakhir ({waLogs.length})</span>
                    <button onClick={loadAllData} className="text-slate-400 hover:text-white">
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </h3>

                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1 text-xs">
                    {waLogs.length > 0 ? (
                      waLogs.map((w) => (
                        <div key={w.id} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-emerald-400">{w.no_tujuan}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              {w.status}
                            </span>
                          </div>
                          <p className="text-slate-300 line-clamp-2 text-[11px]">{w.pesan}</p>
                          <div className="text-[10px] text-slate-500">{w.created_at} • Tipe: {w.tipe}</div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-slate-500">Belum ada riwayat pesan WA terkirim.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 7: PENGATURAN IDENTITAS MADRASAH */}
        {/* ========================================================= */}
        {activeTab === 'pengaturan' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white">Pengaturan Identitas Madrasah &amp; Jam Sekolah</h1>
              <p className="text-xs text-slate-400">Data di bawah ini akan otomatis muncul pada KOP Surat Peringatan (SP) resmi dan menentukan jam toleransi presensi.</p>
            </div>

            <form onSubmit={handleSimpanPengaturan} className="rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-xl space-y-6 max-w-4xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3">Identitas Lembaga (KOP Surat)</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Nama Madrasah / Sekolah</label>
                  <input
                    type="text"
                    value={pengaturan.nama_madrasah}
                    onChange={(e) => setPengaturan({ ...pengaturan, nama_madrasah: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">NPSN / Nomor Statistik</label>
                  <input
                    type="text"
                    value={pengaturan.npsn}
                    onChange={(e) => setPengaturan({ ...pengaturan, npsn: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Alamat Lengkap</label>
                  <input
                    type="text"
                    value={pengaturan.alamat}
                    onChange={(e) => setPengaturan({ ...pengaturan, alamat: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Nomor Telepon &amp; Email</label>
                  <input
                    type="text"
                    value={pengaturan.no_telp}
                    onChange={(e) => setPengaturan({ ...pengaturan, no_telp: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Nama Kepala Madrasah</label>
                  <input
                    type="text"
                    value={pengaturan.nama_kepala}
                    onChange={(e) => setPengaturan({ ...pengaturan, nama_kepala: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">NIP Kepala Madrasah</label>
                  <input
                    type="text"
                    value={pengaturan.nip_kepala}
                    onChange={(e) => setPengaturan({ ...pengaturan, nip_kepala: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3 pt-4">Aturan Waktu Presensi Gerbang</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Batas Jam Masuk Tepat Waktu</label>
                  <input
                    type="time"
                    value={pengaturan.jam_masuk}
                    onChange={(e) => setPengaturan({ ...pengaturan, jam_masuk: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Batas Toleransi Terlambat</label>
                  <input
                    type="time"
                    value={pengaturan.jam_toleransi}
                    onChange={(e) => setPengaturan({ ...pengaturan, jam_toleransi: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Jam Eksekusi Otomatis Alpa</label>
                  <input
                    type="time"
                    value={pengaturan.jam_alpa_otomatis}
                    onChange={(e) => setPengaturan({ ...pengaturan, jam_alpa_otomatis: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-slate-950 text-xs transition cursor-pointer shadow-lg shadow-emerald-600/20"
              >
                Simpan Perubahan Pengaturan
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
