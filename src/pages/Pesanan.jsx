import { useEffect, useState } from 'react';
import { getMyOrders, getGlowBookings, rupiah } from '../api.js';
import { ICON } from '../icons.jsx';
import { Truck, Sparkles } from 'lucide-react';

const STATUS_LABEL = {
  pending: 'Menunggu konfirmasi',
  paid: 'Dibayar',
  confirmed: 'Dikonfirmasi',
  process: 'Berjalan',
  done: 'Selesai',
  cancelled: 'Dibatalkan',
};

function formatDay(iso) {
  if (!iso) return '-';
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Pesanan() {
  const [orders, setOrders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    Promise.all([getMyOrders(), getGlowBookings()])
      .then(([o, b]) => {
        setOrders(o.data || []);
        setBookings(b.data || []);
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  const Clip = ICON.pesanan || ICON.bell;

  return (
    <div className="page with-nav">
      <div className="hero" style={{ paddingBottom: 54 }}>
        <h1>Pesanan</h1>
        <p className="sub">Riwayat BossMove & BossGlow kamu</p>
      </div>

      <div className="overlap">
        {err && <div className="err-banner">{err}</div>}
        {loading && <div style={{ color: 'var(--muted)', padding: 20, textAlign: 'center' }}>Memuat…</div>}

        {!loading && orders.length === 0 && bookings.length === 0 && (
          <div className="empty">
            <Clip size={44} />
            <h4>Belum ada pesanan</h4>
            <p>Pesanan BossMove dan BossGlow kamu akan tampil di sini.</p>
          </div>
        )}

        {/* ---------- BossGlow ---------- */}
        {bookings.length > 0 && (
          <>
            <div className="section-label">BossGlow</div>
            {bookings.map((b) => (
              <div key={b.id} className="order-card">
                <div className="oc-top">
                  <span className="oc-title"><Sparkles size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />{b.item_label}</span>
                  <span className={`badge${b.status === 'done' ? ' green' : b.status === 'cancelled' ? ' gray' : ''}`}>
                    {STATUS_LABEL[b.status] || b.status}
                  </span>
                </div>
                <div className="sumrow"><span className="k">Kode</span><span className="v">{b.booking_code}</span></div>
                <div className="sumrow"><span className="k">Terapis</span><span className="v">{b.therapist?.name || '-'}</span></div>
                <div className="sumrow"><span className="k">Jadwal</span><span className="v">{formatDay(b.schedule?.date)} · {b.schedule?.time}</span></div>
                <div className="sumrow"><span className="k">Alamat</span><span className="v" style={{ maxWidth: '62%', whiteSpace: 'normal' }}>{b.address?.text}</span></div>
                {b.notes && <div className="sumrow"><span className="k">Catatan</span><span className="v" style={{ maxWidth: '62%', whiteSpace: 'normal', fontWeight: 500 }}>{b.notes}</span></div>}
                <div className="sumrow total"><span className="k">Total</span><span className="v">{rupiah(b.total)}</span></div>
              </div>
            ))}
          </>
        )}

        {/* ---------- BossMove ---------- */}
        {orders.length > 0 && (
          <>
            <div className="section-label">BossMove</div>
            {orders.map((o) => (
              <div key={o.id} className="order-card">
                <div className="oc-top">
                  <span className="oc-title"><Truck size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />Pindahan · {o.service_type}</span>
                  <span className={`badge${o.status === 'done' ? ' green' : o.status === 'cancelled' ? ' gray' : ''}`}>
                    {STATUS_LABEL[o.status] || o.status}
                  </span>
                </div>
                <div className="sumrow"><span className="k">Kode</span><span className="v">{o.order_code}</span></div>
                <div className="sumrow"><span className="k">Dari</span><span className="v" style={{ maxWidth: '62%', whiteSpace: 'normal' }}>{o.origin?.label}</span></div>
                <div className="sumrow"><span className="k">Ke</span><span className="v" style={{ maxWidth: '62%', whiteSpace: 'normal' }}>{o.destination?.label}</span></div>
                <div className="sumrow"><span className="k">Jadwal</span><span className="v">{formatDay(o.schedule?.date)} · {o.schedule?.time}</span></div>
                {(o.items || []).length > 0 && (
                  <div className="sumrow">
                    <span className="k">Barang</span>
                    <span className="v" style={{ maxWidth: '62%', whiteSpace: 'normal', fontWeight: 500 }}>
                      {o.items.map((i) => `${i.item_name} ×${i.qty}`).join(', ')}
                    </span>
                  </div>
                )}
                <div className="sumrow total"><span className="k">Total</span><span className="v">{rupiah(o.amounts?.total)}</span></div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
