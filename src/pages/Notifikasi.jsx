import PageHead from '../components/PageHead.jsx';
import { ICON } from '../icons.jsx';

const NOTIFS = [
  {
    id: 1,
    title: 'Selamat datang di baikboss!',
    body: 'Yuk lengkapi alamat kamu biar pemesanan makin cepat.',
    time: 'Baru saja',
    unread: true,
  },
  {
    id: 2,
    title: 'Promo Bersih Rumah',
    body: 'Diskon spesial pembersihan 2 kamar tidur + 1 kamar mandi. Mulai Rp 600rb.',
    time: 'Kemarin',
    unread: true,
  },
  {
    id: 3,
    title: 'BossGlow hadir di kotamu',
    body: 'Massage pria/wanita dan facial wanita kini bisa dipesan dari rumah.',
    time: '2 hari lalu',
    unread: false,
  },
];

export default function Notifikasi() {
  const Bell = ICON.bell;
  return (
    <div className="page">
      <PageHead title="Notifikasi" />
      <div className="content">
        {NOTIFS.length === 0 ? (
          <div className="empty">
            <Bell size={44} />
            <h4>Belum ada notifikasi</h4>
            <p>Semua pemberitahuan penting akan muncul di sini.</p>
          </div>
        ) : (
          NOTIFS.map((n) => (
            <div key={n.id} className={`notif-card${n.unread ? ' unread' : ''}`}>
              <div className="n-ico"><Bell size={19} /></div>
              <div style={{ flex: 1 }}>
                <div className="n-title">{n.title}</div>
                <div className="n-body">{n.body}</div>
                <div className="n-time">{n.time}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
