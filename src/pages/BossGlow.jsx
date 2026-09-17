import { useNavigate } from 'react-router-dom';
import { ICON } from '../icons.jsx';
import PageHead from '../components/PageHead.jsx';
import { Sparkles, Hand, Dices } from 'lucide-react';

const GLOW = [
  { key: 'massage_male', title: 'Massage Pria', desc: 'Pijat oleh terapis pria berpengalaman', IconComp: Hand, from: 75000 },
  { key: 'massage_female', title: 'Massage Wanita', desc: 'Pijat oleh terapis wanita berpengalaman', IconComp: Hand, from: 75000 },
  { key: 'facial', title: 'Facial Wanita', desc: 'Perawatan wajah + totok (opsional)', IconComp: Sparkles, from: 120000 },
];

export default function BossGlow() {
  const navigate = useNavigate();
  const Chev = ICON.chev;

  return (
    <div className="page">
      <PageHead title="BossGlow · Rileks & Glow" />
      <div className="content">
        <div
          className="card"
          style={{
            marginBottom: 14,
            background: 'linear-gradient(135deg, var(--purple-700), var(--purple-500))',
            color: '#fff',
          }}
        >
          <div style={{ marginBottom: 6 }}><Sparkles size={26} /></div>
          <div style={{ fontWeight: 600, fontSize: 16 }}>Saatnya rileks, saatnya glow</div>
          <p style={{ margin: '6px 0 0', fontSize: 13, opacity: 0.9 }}>
            Terapis datang ke lokasimu. Pilih layanan, atur jadwal, sisanya biar kami.
          </p>
        </div>

        <div className="section-label">Pilih layanan</div>
        {GLOW.map((g) => (
          <button key={g.key} className="pick" onClick={() => navigate(`/glow/${g.key}`)}>
            <div className="p-ico"><g.IconComp size={20} /></div>
            <div style={{ flex: 1 }}>
              <h4>{g.title}</h4>
              <p>{g.desc}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>Mulai</div>
              <div className="price">Rp {g.from.toLocaleString('id-ID')}</div>
            </div>
            <Chev size={18} className="chev" />
          </button>
        ))}
      </div>
    </div>
  );
}
