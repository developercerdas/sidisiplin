import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { School, Lock, Mail, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import DeveloperBranding from '../components/DeveloperBranding';

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
      })
      .catch(() => {
        const mockUser = {
          id: 2,
          nama: demoEmail.includes('bk') ? 'Ustadzah Siti Rahmawati, S.Psi (Guru BK)' :
                demoEmail.includes('tatib') ? 'Ustadz Hendra Gunawan, S.Pd (Kesiswaan)' :
                demoEmail.includes('kepala') ? 'Drs. H. Ahmad Subagio, M.Pd (Kepala)' :
                demoEmail.includes('walikelas') ? 'Ustadzah Nurul Hidayah, S.Pd (Wali Kelas)' : 'Administrator IT',
          email: demoEmail,
          role: demoEmail.includes('bk') ? 'bk' :
                demoEmail.includes('tatib') ? 'tatib' :
                demoEmail.includes('kepala') ? 'kepala' :
                demoEmail.includes('walikelas') ? 'wali_kelas' : 'admin',
          no_wa: '081234567890'
        };
        localStorage.setItem('user_token', 'demo-token-live');
        localStorage.setItem('user_profile', JSON.stringify(mockUser));
        if (onLoginSuccess) onLoginSuccess(mockUser);
        navigate('/dashboard');
      });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-x-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-1/4 left-1/3 w-72 md:w-96 h-72 md:h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-72 md:w-96 h-72 md:h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Back to Kiosk */}
      <div className="w-full max-w-md mb-4 flex justify-start">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold transition"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
          <span>Ke Monitor Gerbang</span>
        </Link>
      </div>

      <div className="max-w-md w-full rounded-2xl md:rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-2xl relative z-10">
        {/* Logo & Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/20">
            <School className="w-8 h-8 text-white" />
          </div>
          <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
            PORTAL GURU &amp; STAF
          </span>
          <h2 className="text-xl md:text-2xl font-black text-white mt-2">Masuk ke SIDISIPLIN</h2>
          <p className="text-xs text-slate-400">MTsN / MA Teladan</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleLogin} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Email Pengguna</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs md:text-sm focus:outline-none focus:border-emerald-500 transition"
                placeholder="nama@madrasah.sch.id"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Kata Sandi</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs md:text-sm focus:outline-none focus:border-emerald-500 transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 md:py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-slate-950 transition flex items-center justify-center gap-2 text-xs md:text-sm shadow-lg shadow-emerald-600/20 disabled:opacity-50 cursor-pointer mt-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{loading ? 'Memverifikasi...' : 'Masuk ke Dashboard'}</span>
          </button>
        </form>

        {/* 1-Click Demo Role Switcher */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <div className="text-[10px] md:text-[11px] font-bold tracking-wider text-slate-400 uppercase text-center mb-2.5">
            🎯 Klik 1-Kali Masuk Role (Demo):
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setDemoAccount('bk@madrasah.sch.id')}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-emerald-400 font-bold border border-slate-700 text-left transition flex items-center gap-2 cursor-pointer text-[11px]"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span className="truncate">Guru BK</span>
            </button>

            <button
              type="button"
              onClick={() => setDemoAccount('tatib@madrasah.sch.id')}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-amber-400 font-bold border border-slate-700 text-left transition flex items-center gap-2 cursor-pointer text-[11px]"
            >
              <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
              <span className="truncate">Tim Tatib</span>
            </button>

            <button
              type="button"
              onClick={() => setDemoAccount('walikelas@madrasah.sch.id')}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-teal-400 font-bold border border-slate-700 text-left transition flex items-center gap-2 cursor-pointer text-[11px]"
            >
              <div className="w-2 h-2 rounded-full bg-teal-400 shrink-0" />
              <span className="truncate">Wali Kelas</span>
            </button>

            <button
              type="button"
              onClick={() => setDemoAccount('kepala@madrasah.sch.id')}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-indigo-400 font-bold border border-slate-700 text-left transition flex items-center gap-2 cursor-pointer text-[11px]"
            >
              <div className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
              <span className="truncate">Kepala Madrasah</span>
            </button>
          </div>
        </div>
      </div>

      {/* DEVELOPER & HARDWARE IDENTITY WIDGET */}
      <div className="mt-8 w-full max-w-2xl px-2 z-10">
        <DeveloperBranding />
      </div>
    </div>
  );
}
