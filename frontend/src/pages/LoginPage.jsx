import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { School, Lock, Mail, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('bk@madrasah.sch.id');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('user_token', data.token);
        localStorage.setItem('user_profile', JSON.stringify(data.user));
        if (onLoginSuccess) onLoginSuccess(data.user);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Login gagal');
      }
    } catch (err) {
      // Fallback untuk Live Demo Online GitHub Pages (tanpa backend lokal)
      console.log('Mode Live Demo GitHub Pages Aktif');
      const mockUser = {
        id: 2,
        nama: email.includes('bk') ? 'Ustadzah Siti Rahmawati, S.Psi (Guru BK)' :
              email.includes('tatib') ? 'Ustadz Hendra Gunawan, S.Pd (Kesiswaan)' :
              email.includes('kepala') ? 'Drs. H. Ahmad Subagio, M.Pd (Kepala)' :
              email.includes('walikelas') ? 'Ustadzah Nurul Hidayah, S.Pd (Wali Kelas)' : 'Administrator IT',
        email: email,
        role: email.includes('bk') ? 'bk' :
              email.includes('tatib') ? 'tatib' :
              email.includes('kepala') ? 'kepala' :
              email.includes('walikelas') ? 'wali_kelas' : 'admin',
        no_wa: '081234567890'
      };
      localStorage.setItem('user_token', 'demo-token-live');
      localStorage.setItem('user_profile', JSON.stringify(mockUser));
      if (onLoginSuccess) onLoginSuccess(mockUser);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const setDemoAccount = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('admin123');
    setTimeout(() => {
      // Trigger login
      fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, password: 'admin123' })
      })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          localStorage.setItem('user_token', data.token);
          localStorage.setItem('user_profile', JSON.stringify(data.user));
          if (onLoginSuccess) onLoginSuccess(data.user);
          navigate('/dashboard');
        }
      });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative">
      {/* Background Ornaments */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Back to Kiosk */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 text-xs font-semibold transition"
      >
        <ArrowLeft className="w-4 h-4 text-emerald-400" />
        Kembali ke Monitor Gerbang (Kios)
      </Link>

      <div className="max-w-md w-full rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl relative z-10">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
            <School className="w-9 h-9 text-white" />
          </div>
          <span className="text-[11px] font-bold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            PORTAL GURU & STAF
          </span>
          <h2 className="text-2xl font-black text-white mt-2">Masuk ke Sistem</h2>
          <p className="text-xs text-slate-400 mt-1">SI-DISIPLIN & BK MADRASAH</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email Pengguna</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition"
                placeholder="nama@madrasah.sch.id"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Kata Sandi</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-slate-950 transition flex items-center justify-center gap-2 text-sm shadow-lg shadow-emerald-600/20 disabled:opacity-50 cursor-pointer mt-2"
          >
            <ShieldCheck className="w-4 h-4" />
            {loading ? 'Memverifikasi...' : 'Masuk ke Dashboard'}
          </button>
        </form>

        {/* 1-Click Demo Role Switcher */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase text-center mb-3">
            🎯 Klik 1-Kali Masuk Sebagai Role:
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => setDemoAccount('bk@madrasah.sch.id')}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-emerald-400 font-semibold border border-slate-700 hover:border-emerald-500 text-left transition flex items-center gap-2"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Guru BK</span>
            </button>

            <button
              onClick={() => setDemoAccount('tatib@madrasah.sch.id')}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-amber-400 font-semibold border border-slate-700 hover:border-amber-500 text-left transition flex items-center gap-2"
            >
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Tim Tatib</span>
            </button>

            <button
              onClick={() => setDemoAccount('walikelas@madrasah.sch.id')}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-teal-400 font-semibold border border-slate-700 hover:border-teal-500 text-left transition flex items-center gap-2"
            >
              <div className="w-2 h-2 rounded-full bg-teal-400" />
              <span>Wali Kelas</span>
            </button>

            <button
              onClick={() => setDemoAccount('kepala@madrasah.sch.id')}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-indigo-400 font-semibold border border-slate-700 hover:border-indigo-500 text-left transition flex items-center gap-2"
            >
              <div className="w-2 h-2 rounded-full bg-indigo-400" />
              <span>Kepala Madrasah</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
