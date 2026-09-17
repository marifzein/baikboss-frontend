import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { store } from '../api.js';
import { SERVICE_ICONS, ICON } from '../icons.jsx';
import Swal from '../swal.js';

const SERVICES = [
  { key: 'bossmove', to: '/bossmove', name: 'BossMove', desc: 'Pindahan jadi lebih mudah', img: '/img/bossmove.webp' },
  { key: 'bossglow', to: '/bossglow', name: 'BossGlow', desc: 'Saatnya rileks, saatnya glow', img: '/img/bossglow.webp' },
  { key: 'bossclean', to: null, name: 'BossClean', desc: 'Bersih tanpa repot', img: '/img/bossclean.webp' },
  { key: 'bossfix', to: null, name: 'BossFix', desc: 'Perbaikan tanpa drama', img: '/img/bossfix.webp' },
];

const PROMOS = [
  {
    title: 'Paket Beauty Care Mingguan',
    meta1: 'Facial, Massage',
    meta2: 'Durasi 1 jam',
    price: 'Rp 120.000',
    img: '/img/glow.jpg',
    to: '/bossglow',
  },
  {
    title: 'Promo Bersih Rumah',
    meta1: '2 Kamar Tidur · 1 Kamar Mandi',
    meta2: 'Durasi 2 jam',
    price: 'Rp 600rb',
    img: '/img/clean.jpg',
    to: null,
  },
  {
    title: 'Promo Bersih Kost',
    meta1: '3x Kunjungan',
    meta2: 'Durasi 1 jam',
    price: 'Rp 330rb',
    img: '/img/mop.jpg',
    to: null,
  },
];

function greeting() {
  const h = new Date().getHours();
  if (h >= 4 && h < 11) return 'pagi';
  if (h >= 11 && h < 15) return 'siang';
  if (h >= 15 && h < 18) return 'sore';
  return 'malam';
}

export default function Dashboard() {
  const navigate = useNavigate();
  const user = store.getUser() || { name: 'Kak' };
  const firstName = user.name?.split(' ')[0] || 'Kak';
  const Pin = ICON.pin;
  const Bell = ICON.bell;
  const Chev = ICON.chev;

  // alamat utama disimpan di localStorage setelah user setting alamat
  const primaryAddr = useMemo(() => {
    try {
      const list = JSON.parse(localStorage.getItem('bb_addresses_cache') || '[]');
      return list.find((a) => a.is_primary) || list[0] || null;
    } catch {
      return null;
    }
  }, []);

  const tapUnavailable = (name) =>
    Swal.fire({ icon: 'info', title: 'Segera Hadir', text: `Maaf kak, saat ini layanan ${name} masih belum tersedia di kotamu.`, confirmButtonText: 'Mengerti' });

  return (
    <div className="page with-nav">
      {/* ---------- hero: greeting + alamat + lonceng ---------- */}
      <div className="hero" style={{ display: 'flex', alignItems: 'flex-start', gap: 12, paddingBottom: 64 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link to="/alamat" style={{ textDecoration: 'none', color: '#fff', display: 'block' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, opacity: 0.9 }}>
              <Pin size={14} />
              <span style={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {primaryAddr ? primaryAddr.address_text : 'Atur alamat kamu'}
              </span>
              <Chev size={13} />
            </div>
          </Link>
          <h1 style={{ marginTop: 8 }}>
            Hi, {firstName} selamat {greeting()} <span aria-hidden style={{ marginLeft: 4, verticalAlign: 'middle' }}>{greeting() === 'malam' ? <ICON.moon size={20} /> : <ICON.sun size={20} />}</span>
          </h1>
          <p className="sub">Mau kami bantu apa hari ini?</p>
        </div>
        <Link
          to="/notifikasi"
          aria-label="Notifikasi"
          style={{
            width: 42, height: 42, borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            display: 'grid', placeItems: 'center',
            color: '#fff', flexShrink: 0,
          }}
        >
          <Bell size={20} />
        </Link>
      </div>

      {/* ---------- 4 kartu layanan ---------- */}
      <div className="overlap" style={{ marginTop: -44 }}>
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="svc-grid">
            {SERVICES.map((s) => {
              const inner = (
                <>
                  <div className="svc-ico">
                    {s.img ? (
                      <img src={s.img} alt={s.name} style={{ width: 56, height: 56, objectFit: 'contain' }} />
                    ) : (() => {
                      const Ico = SERVICE_ICONS[s.key];
                      return Ico ? <Ico size={26} /> : null;
                    })()}
                  </div>
                  <h3>{s.name}</h3>
                  <p>{s.desc}</p>
                </>
              );
              return s.to ? (
                <button key={s.key} className="svc-card" onClick={() => navigate(s.to)}>{inner}</button>
              ) : (
                <button key={s.key} className="svc-card" onClick={() => tapUnavailable(s.name)}>{inner}</button>
              );
            })}
          </div>
        </div>

        {/* ---------- carousel promo ---------- */}
        <div className="section-label" style={{ marginTop: 14 }}>Promo spesial untukmu</div>
        <div className="carousel">
          {PROMOS.map((p) => {
            const body = (
              <div className="card promo-card">
                <img src={p.img} alt={p.title} />
                <div className="promo-body">
                  <h4>{p.title}</h4>
                  <div className="meta">{p.meta1}</div>
                  <div className="meta">{p.meta2}</div>
                  <div className="price">{p.price}</div>
                </div>
              </div>
            );
            return p.to ? (
              <Link key={p.title} to={p.to} style={{ textDecoration: 'none', color: 'inherit', display: 'flex' }}>{body}</Link>
            ) : (
              <button
                key={p.title}
                onClick={() => tapUnavailable('BossClean')}
                style={{ border: 0, background: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}
              >
                {body}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
