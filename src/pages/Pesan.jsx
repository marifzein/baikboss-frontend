import { Link } from 'react-router-dom';
import { ICON } from '../icons.jsx';

export default function Pesan() {
  const Chat = ICON.pesan || ICON.whatsapp;
  const Shield = ICON.shield;

  return (
    <div className="page with-nav">
      <div className="hero" style={{ paddingBottom: 54 }}>
        <h1>Pesan</h1>
        <p className="sub">Chat dengan tenaga layanan per pesananmu</p>
      </div>

      <div className="overlap">
        <div
          className="card"
          style={{
            marginBottom: 16,
            background: '#fefce8',
            border: '1px solid #fde68a',
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
          }}
        >
          <Shield size={20} style={{ color: '#b45309', flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: 13 }}>
            <b style={{ color: '#b45309' }}>Chat hanya di baikboss</b>
            <div style={{ color: '#92400e', marginTop: 2, lineHeight: 1.5 }}>
              Jangan share nomor HP, WA, atau bayar di luar app. Transaksi via app dapat garansi pengerjaan.
            </div>
          </div>
        </div>

        <div className="empty">
          <Chat size={44} />
          <h4>Belum ada chat</h4>
          <p>Chat akan tersedia setelah tenaga layanan cocok dengan pesanan kamu. Pesan layanan dulu untuk mulai.</p>
          <Link to="/layanan" className="btn small" style={{ textDecoration: 'none' }}>
            Pesan Layanan
          </Link>
        </div>
      </div>
    </div>
  );
}
