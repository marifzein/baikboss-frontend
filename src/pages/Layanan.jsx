import { useNavigate } from 'react-router-dom';
import { SERVICE_ICONS, ICON } from '../icons.jsx';
import Swal from '../swal.js';

const SERVICES = [
  { key: 'bossmove', to: '/bossmove', name: 'BossMove', desc: 'Pindahan jadi lebih mudah', avail: true },
  { key: 'bossglow', to: '/bossglow', name: 'BossGlow', desc: 'Saatnya rileks, saatnya glow', avail: true },
  { key: 'bossclean', to: null, name: 'BossClean', desc: 'Bersih tanpa repot', avail: false },
  { key: 'bossfix', to: null, name: 'BossFix', desc: 'Perbaikan tanpa drama', avail: false },
];

export default function Layanan() {
  const navigate = useNavigate();
  const Chev = ICON.chev;

  return (
    <div className="page with-nav">
      <div className="hero" style={{ paddingBottom: 54 }}>
        <h1>Layanan</h1>
        <p className="sub">Semua kebutuhan rumah tangga dalam satu app</p>
      </div>

      <div className="overlap">
        <div className="card menu-card">
          {SERVICES.map((s) => {
            const Ico = SERVICE_ICONS[s.key];
            return (
              <button
                key={s.key}
                className="menu-item"
                onClick={() => (s.to ? navigate(s.to) : Swal.fire({ icon: 'info', title: 'Segera Hadir', text: `Maaf kak, saat ini layanan ${s.name} masih belum tersedia di kotamu.`, confirmButtonText: 'Oke !' }))}
              >
                <span className="mi-ico"><Ico size={22} /></span>
                <span style={{ flex: 1 }}>
                  <span style={{ display: 'block' }}>{s.name}</span>
                  <span style={{ display: 'block', fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>{s.desc}</span>
                </span>
                {!s.avail && <span className="badge gray">Segera</span>}
                <Chev size={18} className="chev" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
