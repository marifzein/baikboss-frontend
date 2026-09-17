import { NavLink } from 'react-router-dom';
import { NAV_ICONS } from '../icons.jsx';

const TABS = [
  { to: '/', label: 'Beranda', icon: 'home' },
  { to: '/layanan', label: 'Layanan', icon: 'layanan' },
  { to: '/pesanan', label: 'Pesanan', icon: 'pesanan' },
  { to: '/pesan', label: 'Pesan', icon: 'pesan' },
  { to: '/profil', label: 'Profil', icon: 'profil' },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {TABS.map((t) => {
        const Ico = NAV_ICONS[t.icon];
        return (
          <NavLink key={t.to} to={t.to} end={t.to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>
            <span className="nav-ico"><Ico size={21} strokeWidth={2} /></span>
            {t.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
