import React, { useState, useEffect, useRef } from 'react';
import { 
  Scan, CheckCircle2, AlertTriangle, Clock, Users, 
  Calendar, ShieldAlert, Award, Volume2, VolumeX, School, Sparkles, LogIn
} from 'lucide-react';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';

const API_BASE = 'http://localhost:5000/api';

export default function KioskPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [barcodeInput, setBarcodeInput] = useState('');
  const [latestScan, setLatestScan] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [stats, setStats] = useState({
    total_siswa: 0,
    hadir: 0,
    terlambat: 0,
    sakit: 0,
    izin: 0,
    alpa: 0,
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
      console.log('Backend offline or error:', err);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchStats();
    const socket = io('http://localhost:5000');

    socket.on('presensi:baru', (data) => {
      setLatestScan(data);
      setScanHistory((prev) => [data, ...prev.slice(0, 7)]);
      fetchStats();
      playBeep(data.status === 'HADIR' ? 'success' : 'warning');
    });

    return () => socket.disconnect();
  }, [soundEnabled]);

  useEffect(() => {
    const handleKeyDown = () => {
      if (document.activeElement !== inputRef.current) {
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* 1. HEADER KIOS */}
      <header className="bg-slate-900/80 border-b border-slate-800 backdrop-blur px-8 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-emerald-500/20 shadow-lg">
            <School className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                KIOS PRESENSI GERBANG
              </span>
              <span className="text-xs text-slate-400">• MTsN / MA TELADAN</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              SI-DISIPLIN & BK MADRASAH
            </h1>
          </div>
        </div>

        {/* CLOCK & LOGIN LINK */}
        <div className="flex items-center gap-5">
          <Link
            to="/login"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-2 border border-slate-700 hover:border-emerald-500 shadow-md"
          >
            <LogIn className="w-4 h-4 text-emerald-400" />
            <span>Login Guru / BK</span>
          </Link>

          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-2 text-xs border border-slate-700"
            title="Aktif/Nonaktifkan Suara Bel"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
          </button>

          <div className="text-right border-l border-slate-800 pl-5">
            <div className="text-2xl font-mono font-bold tracking-wider text-emerald-400">
              {currentTime.toTimeString().split(' ')[0]} <span className="text-xs text-slate-400">WIB</span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-end gap-1 font-medium">
              <Calendar className="w-3 h-3 text-slate-500" />
              {dayNames[currentTime.getDay()]}, {currentTime.getDate()} {monthNames[currentTime.getMonth()]} {currentTime.getFullYear()}
            </div>
          </div>
        </div>
      </header>

      {/* 2. MAIN BODY */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SISI KIRI: DISPLAY HASIL SCAN (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="relative rounded-3xl bg-gradient-to-b from-slate-900 to-slate-900/60 border border-slate-800 p-8 shadow-2xl overflow-hidden min-h-[460px] flex flex-col justify-center">
            <div className="absolute -top-20 -left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

            {latestScan ? (
              <div className="flex flex-col md:flex-row items-center gap-8 relative z-10 animate-fade-in">
                {/* Foto Siswa */}
                <div className="relative">
                  <div className={`w-44 h-52 rounded-2xl overflow-hidden border-4 shadow-2xl flex items-center justify-center bg-slate-800 ${
                    latestScan.status === 'HADIR' ? 'border-emerald-500 shadow-emerald-500/20' : 'border-amber-500 shadow-amber-500/20'
                  }`}>
                    <img 
                      src={`https://api.dicebear.com/7.x/bottts/svg?seed=${latestScan.siswa.nama}`}
                      alt="Foto Siswa" 
                      className="w-full h-full object-cover p-2"
                    />
                  </div>
                  <span className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-black tracking-wider shadow-lg uppercase ${
                    latestScan.status === 'HADIR' ? 'bg-emerald-500 text-slate-950' : 'bg-amber-500 text-slate-950'
                  }`}>
                    {latestScan.status}
                  </span>
                </div>

                {/* Detail Siswa */}
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold mb-2 border border-slate-700">
                    <span>NISN: {latestScan.siswa.nisn}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-bold">{latestScan.siswa.kelas}</span>
                  </div>

                  <h2 className="text-3xl font-black text-white leading-tight mb-2">
                    {latestScan.siswa.nama}
                  </h2>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 my-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      <span>Masuk: <strong className="text-white">{latestScan.jam_masuk} WIB</strong></span>
                    </div>

                    {latestScan.status === 'TERLAMBAT' && (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold text-xs">
                        <AlertTriangle className="w-4 h-4" />
                        Terlambat {latestScan.menit_terlambat} Menit
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-center md:justify-start gap-3">
                    <div className="px-3 py-1.5 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-center gap-2 text-xs">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      <span>Poin Disiplin: <strong className="text-white">{latestScan.siswa.poin} pt</strong></span>
                    </div>

                    <div className="px-3 py-1.5 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-center gap-2 text-xs">
                      <Award className="w-4 h-4 text-teal-400" />
                      <span>Status BK: <strong className="text-emerald-400">{latestScan.siswa.status_sp}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 flex flex-col items-center justify-center">
                <div className="w-24 h-24 rounded-3xl bg-slate-800/60 border border-slate-700 flex items-center justify-center mb-6 animate-pulse">
                  <Scan className="w-12 h-12 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">SIAP MEN-SCAN KARTU</h3>
                <p className="text-slate-400 text-sm max-w-md">
                  Arahkan kartu ber-barcode ke scanner meja. Sistem mencatat waktu dan menyinkronkan status ke madrasah.
                </p>
              </div>
            )}
          </div>

          {/* INPUT FORM (Auto-focus & Manual Test) */}
          <form onSubmit={handleScan} className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex items-center gap-3">
            <div className="relative flex-1">
              <Scan className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                ref={inputRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Scan kartu dengan Barcode Scanner USB atau ketik barcode..."
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition font-mono text-sm"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-slate-950 transition flex items-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Scan
            </button>
          </form>

          {/* QUICK TEST CHIPS */}
          <div className="flex items-center gap-2 text-xs text-slate-400 px-2">
            <span>Uji Coba Cepat:</span>
            {['SISWA-001', 'SISWA-002', 'SISWA-003'].map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => {
                  setBarcodeInput(code);
                  setTimeout(() => handleScan(), 100);
                }}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 font-mono border border-slate-700 cursor-pointer"
              >
                {code}
              </button>
            ))}
          </div>

          {/* NOTIFICATION TOAST */}
          {message.text && (
            <div className={`p-4 rounded-xl text-sm font-semibold flex items-center gap-3 border ${
              message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
              message.type === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
              message.type === 'info' ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' :
              'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}>
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}
        </div>

        {/* SISI KANAN: STATISTIK & LIVE FEED (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
            <h3 className="text-sm font-bold tracking-wider text-slate-400 uppercase mb-4 flex items-center justify-between">
              <span>Statistik Kehadiran Hari Ini</span>
              <span className="text-xs text-emerald-400 font-normal">Real-Time</span>
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="text-xs text-slate-400 mb-1">Total Siswa</div>
                <div className="text-2xl font-black text-white">{stats.total_siswa}</div>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-xs text-emerald-400 mb-1">Hadir Tepat Waktu</div>
                <div className="text-2xl font-black text-emerald-400">{stats.hadir}</div>
              </div>
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <div className="text-xs text-amber-400 mb-1">Terlambat</div>
                <div className="text-2xl font-black text-amber-400">{stats.terlambat}</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
                <div className="text-xs text-slate-400 mb-1">Belum Masuk / Alpa</div>
                <div className="text-2xl font-black text-slate-300">{stats.belum_scan}</div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl flex-1 flex flex-col">
            <h3 className="text-sm font-bold tracking-wider text-slate-400 uppercase mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>Aktivitas Scan Terkini</span>
            </h3>

            <div className="flex-1 space-y-3 overflow-y-auto max-h-[300px] pr-1">
              {scanHistory.length > 0 ? (
                scanHistory.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs hover:border-slate-700 transition">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${item.status === 'HADIR' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                      <div>
                        <div className="font-bold text-white text-sm">{item.siswa.nama}</div>
                        <div className="text-slate-400">{item.siswa.kelas} • NISN: {item.siswa.nisn}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-emerald-400">{item.jam_masuk}</div>
                      <div className={`text-[10px] font-semibold ${item.status === 'HADIR' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {item.status}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-32 flex items-center justify-center text-slate-500 text-xs text-center">
                  Belum ada aktivitas scan baru hari ini.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 3. RUNNING TEXT FOOTER */}
      <footer className="bg-slate-900/90 border-t border-slate-800 px-6 py-3 flex items-center gap-4 text-xs">
        <span className="px-2.5 py-1 rounded bg-emerald-500 text-slate-950 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap">
          PENGUMUMAN MADRASAH
        </span>
        <div className="overflow-hidden whitespace-nowrap flex-1 text-slate-300 font-medium">
          <marquee behavior="scroll" direction="left" scrollamount="6">
            ✨ Selamat Datang di MTsN / MA Teladan • Budayakan 5S (Senyum, Salam, Sapa, Sopan, Santun) • Batas akhir presensi masuk tepat waktu adalah pukul 07.00 WIB • Jaga kebersihan dan ketertiban bersama demi madrasah yang unggul dan berakhlak mulia ✨
          </marquee>
        </div>
      </footer>
    </div>
  );
}
