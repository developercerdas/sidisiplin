import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import KioskPage from './pages/KioskPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('user_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <Router>
      <Routes>
        {/* 1. Layar Kios Monitor Presensi (Lobi/Gerbang) - TANPA LOGIN */}
        <Route path="/" element={<KioskPage />} />

        {/* 2. Halaman Login Portal Guru & Staf */}
        <Route 
          path="/login" 
          element={<LoginPage onLoginSuccess={handleLoginSuccess} />} 
        />

        {/* 3. Dashboard Manajemen Terpadu (BK, Tatib, Presensi, WA Logs) */}
        <Route 
          path="/dashboard" 
          element={<DashboardPage user={currentUser} onLogout={handleLogout} />} 
        />

        {/* Fallback ke Kios */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
