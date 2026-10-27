import React, { useState, useEffect, useRef } from 'react';
import { 
  Scan, CheckCircle2, AlertTriangle, Clock, Users, 
  Calendar, ShieldAlert, Award, Volume2, VolumeX, School, Sparkles, LogIn
} from 'lucide-react';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';
import DeveloperBranding from '../components/DeveloperBranding';

const API_BASE = 'http://localhost:5000/api';

export default function KioskPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [barcodeInput, setBarcodeInput] = useState('');
  const [latestScan, setLatestScan] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [stats, setStats] = useState({
    total_siswa: 5,
    hadir: 3,
    terlambat: 1,
    sakit: 0,
    izin: 0,
    alpa: 1,
    belum_scan: 0
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef(null);

  const playBeep = (type = 'success') => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else {
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        osc.frequency.setValueAtTime(200, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      }
    } catch (e) {
      console.log('Audio Context error:', e);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/presensi/statistik-hari-ini`);
      const data = await res.json();
      if (data.success) setStats(data);
    } catch (err) {
      console.log('Backend offline - menggunakan state demo');
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchStats();
    let socket;
    try {
      socket = io('http://localhost:5000', { autoConnect: false });
      socket.connect();
      socket.on('presensi:baru', (data) => {
        setLatestScan(data);
        setScanHistory((prev) => [data, ...prev.slice(0, 7)]);
        fetchStats();
        playBeep(data.status === 'HADIR' ? 'success' : 'warning');
      });
    } catch (e) {
      console.log('Socket offline');
    }
    return () => socket && socket.disconnect();
  }, [soundEnabled]);

  useEffect(() => {
    const handleKeyDown = () => {
      if (document.activeElement !== inputRef.current && window.innerWidth > 768) {
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleScan = async (e) => {
    e?.preventDefault();
    const code = barcodeInput.trim();
    if (!code || isProcessing) return;

    setIsProcessing(true);
    setMessage({ text: 'Memverifikasi kartu...', type: 'info' });

    try {
      const res = await fetch(`${API_BASE}/presensi/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode_id: code })
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ text: data.message, type: data.data.status === 'HADIR' ? 'success' : 'warning' });
      } else {
        setMessage({ text: data.message, type: 'error' });
        playBeep('error');
      }
    } catch (err) {
      // Fallback Demo Online GitHub Pages
      const mockDb = {
        'SISWA-001': { id: 1, nama: 'Ahmad Fauzi Rahman', nisn: '0081234561', kelas: 'VII A', poin: 15, status_sp: 'AMAN' },
        'SISWA-002': { id: 2, nama: 'Siti Nur Aisyah', nisn: '0081234562', kelas: 'VII A', poin: 0, status_sp: 'AMAN' },
        'SISWA-003': { id: 3, nama: 'Muhammad Daffa Al-Fatih', nisn: '0081234563', kelas: 'IX A', poin: 55, status_sp: 'SP1 (Panggilan Ortu)' }
      };

      const found = mockDb[code] || { id: 99, nama: `Santri Baru (${code})`, nisn: '0089998811', kelas: 'VII A', poin: 5, status_sp: 'AMAN' };
      const timeStr = new Date().toTimeString().split(' ')[0];
      const isLate = new Date().getHours() >= 7;

      const mockData = {
        siswa: found,
        status: isLate ? 'TERLAMBAT' : 'HADIR',
        jam_masuk: timeStr,
        menit_terlambat: isLate ? 15 : 0
      };

      setLatestScan(mockData);
      setScanHistory((prev) => [mockData, ...prev.slice(0, 7)]);
      setStats((prev) => ({
        ...prev,
        total_siswa: 5,
        hadir: isLate ? prev.hadir : prev.hadir + 1,
        terlambat: isLate ? prev.terlambat + 1 : prev.terlambat,
        belum_scan: Math.max(0, prev.belum_scan - 1)
      }));

      setMessage({ 
        text: `Presensi Berhasil (${mockData.status === 'HADIR' ? 'Tepat Waktu' : 'Terlambat 15 Menit'})`, 
        type: mockData.status === 'HADIR' ? 'success' : 'warning' 
      });
      playBeep(mockData.status === 'HADIR' ? 'success' : 'warning');
    } finally {
      setBarcodeInput('');
      setIsProcessing(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white overflow-x-hidden">
      {/* 1. HEADER KIOS (RESPONSIF HP & DESKTOP) */}
      <header className="bg-slate-900/90 border-b border-slate-800 backdrop-blur px-4 md:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-emerald-500/20 shadow-lg shrink-0">
              <School className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  KIOS GERBANG
                </span>
                <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">• MTsN / MA TELADAN</span>
              </div>
              <h1 className="text-base md:text-xl font-black tracking-tight text-white leading-tight">
                SIDISIPLIN MADRASAH
              </h1>
              <p className="text-[10px] md:text-[11px] text-emerald-400/90 font-medium tracking-wide leading-none mt-0.5 hidden xs:block">
                Sistem Informasi Disiplin Siswa, Presensi Barcode &amp; Layanan Konseling
              </p>
            </div>
          </div>

          {/* Tombol Login Mobile */}
          <Link
            to="/login"
            className="sm:hidden px-3 py-1.5 rounded-lg bg-emerald-600 text-slate-950 text-[11px] font-bold flex items-center gap-1 shadow"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Login</span>
          </Link>
        </div>

        {/* CLOCK & ACTIONS DESKTOP / TABLET */}
        <div className="flex items-center justify-between sm:justify-end gap-3 md:gap-5 w-full sm:w-auto border-t sm:border-t-0 border-slate-800/80 pt-2 sm:pt-0">
          <Link
            to="/login"
            className="hidden sm:flex px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition items-center gap-2 border border-slate-700 hover:border-emerald-500 shadow-md shrink-0"
          >
            <LogIn className="w-4 h-4 text-emerald-400" />
            <span>Login Guru / BK</span>
          </Link>

          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 md:p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1.5 text-xs border border-slate-700 shrink-0"
            title="Aktif/Nonaktifkan Suara Bel"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
            <span className="text-[11px] hidden md:inline">{soundEnabled ? 'Suara' : 'Hening'}</span>
          </button>

          <div className="text-right sm:border-l sm:border-slate-800 sm:pl-4">
            <div className="text-lg md:text-2xl font-mono font-bold tracking-wider text-emerald-400 leading-none">
              {currentTime.toTimeString().split(' ')[0]} <span className="text-[10px] text-slate-400">WIB</span>
            </div>
            <div className="text-[10px] md:text-xs text-slate-400 flex items-center justify-end gap-1 font-medium mt-0.5">
              <Calendar className="w-3 h-3 text-slate-500" />
              <span>{dayNames[currentTime.getDay()]}, {currentTime.getDate()} {monthNames[currentTime.getMonth()]}</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. MAIN BODY (RESPONSIF HP) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6 items-start">
        {/* SISI KIRI: DISPLAY HASIL SCAN (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4 md:gap-5 w-full">
          <div className="relative rounded-2xl md:rounded-3xl bg-gradient-to-b from-slate-900 to-slate-900/60 border border-slate-800 p-5 md:p-8 shadow-2xl overflow-hidden min-h-[340px] md:min-h-[440px] flex flex-col justify-center">
            <div className="absolute -top-20 -left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

            {latestScan ? (
              <div className="flex flex-col sm:flex-row items-center gap-5 md:gap-8 relative z-10 animate-fade-in text-center sm:text-left">
                {/* Foto Siswa */}
                <div className="relative shrink-0">
                  <div className={`w-32 h-40 sm:w-40 sm:h-48 rounded-2xl overflow-hidden border-4 shadow-xl flex items-center justify-center bg-slate-800 ${
                    latestScan.status === 'HADIR' ? 'border-emerald-500 shadow-emerald-500/20' : 'border-amber-500 shadow-amber-500/20'
                  }`}>
                    <img 
                      src={`https://api.dicebear.com/7.x/bottts/svg?seed=${latestScan.siswa.nama}`}
                      alt="Foto Siswa" 
                      className="w-full h-full object-cover p-2"
                    />
                  </div>
                  <span className={`absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-black tracking-wider shadow-lg uppercase whitespace-nowrap ${
                    latestScan.status === 'HADIR' ? 'bg-emerald-500 text-slate-950' : 'bg-amber-500 text-slate-950'
                  }`}>
                    {latestScan.status}
                  </span>
                </div>

                {/* Detail Siswa */}
                <div className="flex-1 min-w-0">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-semibold mb-2 border border-slate-700">
                    <span>NISN: {latestScan.siswa.nisn}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-bold">{latestScan.siswa.kelas}</span>
                  </div>

                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight mb-2 break-words">
                    {latestScan.siswa.nama}
                  </h2>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 sm:gap-3 my-3 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Masuk: <strong className="text-white">{latestScan.jam_masuk} WIB</strong></span>
                    </div>

                    {latestScan.status === 'TERLAMBAT' && (
                      <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-[11px]">
                        <AlertTriangle className="w-3 h-3" />
                        Terlambat {latestScan.menit_terlambat}m
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <div className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center gap-1.5 text-[11px]">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                      <span>Poin: <strong className="text-white">{latestScan.siswa.poin} pt</strong></span>
                    </div>

                    <div className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center gap-1.5 text-[11px]">
                      <Award className="w-3.5 h-3.5 text-teal-400" />
                      <span>BK: <strong className="text-emerald-400">{latestScan.siswa.status_sp}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 md:py-10 flex flex-col items-center justify-center">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-center mb-4 animate-pulse">
                  <Scan className="w-8 h-8 md:w-10 md:h-10 text-emerald-400" />
                </div>
                <h3 className="text-lg md:text-2xl font-bold text-white mb-1.5">SIAP SCAN KARTU SISWA</h3>
                <p className="text-slate-400 text-xs md:text-sm max-w-sm px-2">
                  Arahkan barcode/QR kartu santri ke scanner di depan Anda. Presensi selesai dalam 1 detik.
                </p>
              </div>
            )}
          </div>

          {/* INPUT FORM SCANNER */}
          <form onSubmit={handleScan} className="rounded-xl md:rounded-2xl bg-slate-900 border border-slate-800 p-2.5 md:p-3.5 flex items-center gap-2">
            <div className="relative flex-1">
              <Scan className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                ref={inputRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Scan barcode kartu atau ketik..."
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition font-mono text-xs md:text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-4 md:px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-bold text-slate-950 transition flex items-center gap-1.5 text-xs md:text-sm shrink-0 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Scan</span>
            </button>
          </form>

          {/* QUICK TEST CHIPS (SCROLLABLE ON MOBILE) */}
          <div className="flex items-center gap-2 text-xs text-slate-400 px-1 overflow-x-auto pb-1">
            <span className="shrink-0 text-[11px]">Uji Coba:</span>
            {['SISWA-001', 'SISWA-002', 'SISWA-003'].map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => {
                  setBarcodeInput(code);
                  setTimeout(() => handleScan(), 100);
                }}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 font-mono text-[11px] border border-slate-700 shrink-0 cursor-pointer"
              >
                {code}
              </button>
            ))}
          </div>

          {/* TOAST MESSAGE */}
          {message.text && (
            <div className={`p-3 md:p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 border ${
              message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
              message.type === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
              message.type === 'info' ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' :
              'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}>
              {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}
        </div>

        {/* SISI KANAN: STATISTIK & REKAP (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4 md:gap-6 w-full">
          {/* STATS GRID */}
          <div className="rounded-2xl md:rounded-3xl bg-slate-900 border border-slate-800 p-4 md:p-6 shadow-xl">
            <h3 className="text-xs md:text-sm font-bold tracking-wider text-slate-400 uppercase mb-3 flex items-center justify-between">
              <span>Statistik Kehadiran Hari Ini</span>
              <span className="text-[10px] md:text-xs text-emerald-400 font-normal">Real-Time</span>
            </h3>

            <div className="grid grid-cols-2 gap-2.5 md:gap-4">
              <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] md:text-xs text-slate-400 mb-0.5">Total Santri/Siswa</div>
                <div className="text-xl md:text-2xl font-black text-white">{stats.total_siswa}</div>
              </div>
              <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-[10px] md:text-xs text-emerald-400 mb-0.5">Hadir Tepat Waktu</div>
                <div className="text-xl md:text-2xl font-black text-emerald-400">{stats.hadir}</div>
              </div>
              <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <div className="text-[10px] md:text-xs text-amber-400 mb-0.5">Terlambat Masuk</div>
                <div className="text-xl md:text-2xl font-black text-amber-400">{stats.terlambat}</div>
              </div>
              <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-rose-500/10 border border-rose-500/20">
                <div className="text-[10px] md:text-xs text-rose-400 mb-0.5">Alpa / Belum Scan</div>
                <div className="text-xl md:text-2xl font-black text-rose-400">{stats.alpa + stats.belum_scan}</div>
              </div>
            </div>
          </div>

          {/* AKTIVITAS LIVE FEED */}
          <div className="rounded-2xl md:rounded-3xl bg-slate-900 border border-slate-800 p-4 md:p-6 shadow-xl flex flex-col">
            <h3 className="text-xs md:text-sm font-bold tracking-wider text-slate-400 uppercase mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Aktivitas Scan Terkini</span>
            </h3>

            <div className="space-y-2.5 overflow-y-auto max-h-[220px] md:max-h-[280px] pr-1">
              {scanHistory.length > 0 ? (
                scanHistory.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${item.status === 'HADIR' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                      <div className="truncate">
                        <div className="font-bold text-white truncate text-xs">{item.siswa.nama}</div>
                        <div className="text-[10px] text-slate-400">{item.siswa.kelas} • NISN: {item.siswa.nisn}</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-2">
                      <div className="font-mono font-bold text-emerald-400 text-xs">{item.jam_masuk}</div>
                      <div className={`text-[9px] font-bold ${item.status === 'HADIR' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {item.status}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-slate-500 text-xs">
                  Belum ada riwayat scan hari ini.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 3. RUNNING TEXT FOOTER & DEVELOPER BRANDING */}
      <footer className="bg-slate-900/95 border-t border-slate-800 px-4 py-3 flex flex-col gap-3 text-xs shrink-0">
        {/* WIDGET BRANDING RESMI DI KIOS */}
        <div className="w-full">
          <DeveloperBranding />
        </div>

        {/* RUNNING TEXT */}
        <div className="flex items-center gap-2.5 w-full pt-1 border-t border-slate-800/60">
          <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-black uppercase text-[9px] md:text-[10px] shrink-0">
            INFO MADRASAH
          </span>
          <div className="overflow-hidden whitespace-nowrap flex-1 text-slate-300 font-medium text-[11px] md:text-xs">
            <marquee behavior="scroll" direction="left" scrollamount="5">
              ✨ Selamat Datang di MTsN / MA Teladan • Budayakan 5S (Senyum, Salam, Sapa, Sopan, Santun) • Batas akhir presensi masuk tepat waktu pukul 07.00 WIB • Didukung Hardware POS Barcode Scanner &amp; WhatsApp Botcake ✨
            </marquee>
          </div>
        </div>
      </footer>
    </div>
  );
}
