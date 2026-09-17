import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { store, getMe } from './api.js';
import BottomNav from './components/BottomNav.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Layanan from './pages/Layanan.jsx';
import Notifikasi from './pages/Notifikasi.jsx';
import BossMove from './pages/BossMove.jsx';
import BossGlow from './pages/BossGlow.jsx';
import GlowBooking from './pages/GlowBooking.jsx';
import Pesanan from './pages/Pesanan.jsx';
import Pesan from './pages/Pesan.jsx';
import Profil from './pages/Profil.jsx';
import Alamat from './pages/Alamat.jsx';
import DetailIklan from './pages/DetailIklan.jsx';

function RequireAuth({ children }) {
  const token = store.getToken();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function Shell({ children }) {
  const location = useLocation();
  const hideNav = ['/login', '/register'].includes(location.pathname);
  return (
    <div className="phone">
      {children}
      {!hideNav && <BottomNav />}
    </div>
  );
}

export default function App() {
  // sinkronkan user terbaru tiap app dibuka (bila token masih valid)
  const [, force] = useState(0);
  useEffect(() => {
    if (!store.getToken()) return;
    getMe()
      .then((res) => {
        store.setUser(res.data);
        force((n) => n + 1);
      })
      .catch(() => {});
  }, []);

  return (
    <BrowserRouter>
      <Shell>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/layanan" element={<RequireAuth><Layanan /></RequireAuth>} />
          <Route path="/notifikasi" element={<RequireAuth><Notifikasi /></RequireAuth>} />
          <Route path="/bossmove" element={<RequireAuth><BossMove /></RequireAuth>} />
          <Route path="/bossglow" element={<RequireAuth><BossGlow /></RequireAuth>} />
          <Route path="/glow/:itemKey" element={<RequireAuth><GlowBooking /></RequireAuth>} />
          <Route path="/pesanan" element={<RequireAuth><Pesanan /></RequireAuth>} />
          <Route path="/pesan" element={<RequireAuth><Pesan /></RequireAuth>} />
          <Route path="/profil" element={<RequireAuth><Profil /></RequireAuth>} />
          <Route path="/alamat" element={<RequireAuth><Alamat /></RequireAuth>} />
          <Route path="/iklan/:id" element={<RequireAuth><DetailIklan /></RequireAuth>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Shell>
    </BrowserRouter>
  );
}
