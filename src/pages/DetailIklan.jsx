import { useParams, Navigate } from 'react-router-dom';
import PageHead from '../components/PageHead.jsx';
import { ICON } from '../icons.jsx';

/* ---------- data iklan (sinkron dengan Dashboard.jsx) ---------- */
const IKLAN = [
  {
    id: 'ac-changhong',
    title: 'AC 1/2 pk Changhong',
    lines: ['Diskon 15%', 'Toko Alibaba · s/d 1 November 2026', 'Jl. Teuku Umar, Bojonegoro'],
    desc: 'Nikmati kesejukan maksimal dengan AC Changhong 1/2 PK. hemat listrik dan cocok untuk kamar tidur. Dapatkan sekarang dengan diskon spesial 15% di Toko Alibaba, berlaku sampai 1 November 2026.',
    img: '/img/toko-alibaba.png',
  },
  {
    id: 'imam-syamsudin',
    title: 'Dr. Ir. Imam Syamsuddin, SE, MSc',
    lines: ["It's time!", 'Muda, Energik, kreatif', 'Saatnya perubahan untuk Bojonegoro lebih baik!'],
    desc: 'Dukung Bojonegoro lebih baik! Dr. Ir. Imam Syamsuddin, SE, MSc — muda, energik, dan kreatif. Saatnya perubahan, saatnya kemajuan bersama untuk Bojonegoro yang lebih baik.',
    img: '/img/imam-syamsudin.webp',
  },
];

export default function DetailIklan() {
  const { id } = useParams();
  const ad = IKLAN.find((a) => a.id === id);
  if (!ad) return <Navigate to="/" replace />;

  const Wa = ICON.whatsapp;
  const waHref = `https://wa.me/6285330048180?text=${encodeURIComponent(`Halo BaikBoss! Saya mau tanya soal iklan "${ad.title}"..`)}`;

  return (
    <div className="page">
      <PageHead title="Detail Iklan" />

      {/* gambar utuh, tidak di-crop */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 14 }}>
        <img
          src={ad.img}
          alt={ad.title}
          className="iklan-detail-img"
        />
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 600 }}>{ad.title}</h3>
        {ad.lines.map((l) => (
          <div key={l} style={{ fontSize: 13.5, color: 'var(--muted)', margin: '3px 0', display: 'flex', gap: 6 }}>
            <span style={{ color: 'var(--purple-600)' }}>•</span>
            {l}
          </div>
        ))}
        <p style={{ margin: '12px 0 0', fontSize: 14, lineHeight: 1.65, color: 'var(--ink)' }}>{ad.desc}</p>
      </div>

      <a
        href={waHref}
        target="_blank"
        rel="noreferrer"
        className="btn"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          textDecoration: 'none',
        }}
      >
        <Wa size={18} />
        Hubungi via WhatsApp
      </a>
    </div>
  );
}
