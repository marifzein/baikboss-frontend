import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck } from 'lucide-react';
import PageHead from '../components/PageHead.jsx';
import Steps from '../components/Steps.jsx';
import LocationPicker from '../components/LocationPicker.jsx';
import {
  getBarang, getTarif, getProvinsi, getKota, getKecamatan,
  postQuote, postOrder, rupiah, store,
} from '../api.js';
import { ICON, ITEM_ICONS, Icon } from '../icons.jsx';

const SERVICE_TYPES = [
  { code: 'rumah', label: 'Rumah', icon: 'home' },
  { code: 'kos', label: 'Kos', icon: 'sofa' },
  { code: 'warung', label: 'Warung', icon: 'package' },
  { code: 'kantor', label: 'Kantor', icon: 'clipboard-list' },
];

const HOURS = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

export default function BossMove() {
  const navigate = useNavigate();
  const user = store.getUser() || {};

  const [step, setStep] = useState(1);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  // step 1 — rute
  const [origin, setOrigin] = useState({ lat: null, lng: null, text: '' });
  const [destType, setDestType] = useState('bojonegoro');
  const [tarifList, setTarifList] = useState([]);
  const [destTarifId, setDestTarifId] = useState('');
  const [provId, setProvId] = useState('');
  const [kotaId, setKotaId] = useState('');
  const [destWilId, setDestWilId] = useState('');
  const [provList, setProvList] = useState([]);
  const [kotaList, setKotaList] = useState([]);
  const [kecList, setKecList] = useState([]);
  const [destDetail, setDestDetail] = useState('');
  const [destPin, setDestPin] = useState({ lat: null, lng: null, text: '' });

  // step 2 — barang
  const [serviceType, setServiceType] = useState('rumah');
  const [barang, setBarang] = useState([]);
  const [qty, setQty] = useState({});

  // step 3 — jadwal
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [time, setTime] = useState('09:00');

  // step 4 — quote & submit
  const [quote, setQuote] = useState(null);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    getTarif().then((r) => setTarifList(r.data)).catch(() => {});
    getBarang().then((r) => setBarang(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (destType === 'luar' && provList.length === 0) {
      getProvinsi().then((r) => setProvList(r.data)).catch(() => {});
    }
  }, [destType, provList.length]);

  useEffect(() => {
    if (provId) getKota(provId).then((r) => setKotaList(r.data)).catch(() => {});
    else setKotaList([]);
    setKotaId('');
    setDestWilId('');
  }, [provId]);

  useEffect(() => {
    if (kotaId) getKecamatan(kotaId).then((r) => setKecList(r.data)).catch(() => {});
    else setKecList([]);
    setDestWilId('');
  }, [kotaId]);

  const destLabel = useMemo(() => {
    if (destType === 'bojonegoro') {
      const t = tarifList.find((x) => String(x.id) === String(destTarifId));
      return destDetail || (t ? `Kec. ${t.kecamatan}, ${t.kota}` : '');
    }
    const w = kecList.find((x) => String(x.id) === String(destWilId));
    return destDetail || (w ? `Kec. ${w.nama}` : '');
  }, [destType, destTarifId, destWilId, destDetail, tarifList, kecList]);

  const itemsPayload = useMemo(
    () =>
      Object.entries(qty)
        .filter(([, q]) => q > 0)
        .map(([code, q]) => ({ item_name: code, qty: q })),
    [qty],
  );

  const quotePayload = useMemo(
    () => ({
      service_type: serviceType,
      origin_label: origin.text || (origin.lat ? `${origin.lat}, ${origin.lng}` : ''),
      origin_lat: origin.lat,
      origin_lng: origin.lng,
      dest_type: destType,
      dest_tarif_id: destType === 'bojonegoro' ? destTarifId || null : null,
      dest_wilayah_id: destType === 'luar' ? destWilId || null : null,
      dest_label: destLabel || (destPin.lat ? `${destPin.lat}, ${destPin.lng}` : ''),
      dest_lat: destPin.lat,
      dest_lng: destPin.lng,
      schedule_date: date,
      schedule_time: time,
      items: itemsPayload.length ? itemsPayload : [{ item_name: barang[0]?.code || 'kursi', qty: 1 }],
    }),
    [serviceType, origin, destType, destTarifId, destWilId, destLabel, destPin, date, time, itemsPayload, barang],
  );

  // hitung quote saat masuk step 4
  useEffect(() => {
    if (step !== 4 || order) return;
    setQuote(null);
    postQuote(quotePayload)
      .then((r) => setQuote(r.data))
      .catch((e) => setErr(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const totalQty = Object.values(qty).reduce((a, b) => a + b, 0);

  const nextFrom1 = () => {
    setErr('');
    if (!origin.lat && !origin.text) return setErr('Isi alamat asal dulu ya — pakai GPS atau pin peta.');
    if (destType === 'bojonegoro' && !destTarifId) return setErr('Pilih kecamatan tujuan (dalam Bojonegoro).');
    if (destType === 'luar' && (!provId || !kotaId || !destWilId)) return setErr('Pilih provinsi, kota, lalu kecamatan tujuan.');
    if (!destLabel && !destPin.lat) return setErr('Isi detail alamat tujuan atau pin lokasinya.');
    setStep(2);
  };

  const nextFrom2 = () => {
    setErr('');
    if (totalQty === 0) return setErr('Pilih minimal satu barang yang mau dipindah.');
    setStep(3);
  };

  const nextFrom3 = () => {
    setErr('');
    if (!date || !time) return setErr('Pilih tanggal dan jam pindahan.');
    setStep(4);
  };

  const submit = async () => {
    setErr('');
    setLoading(true);
    try {
      const res = await postOrder({ ...quotePayload, name: user.name, phone: user.phone });
      setOrder(res.data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------- SUCCESS ------------------------- */
  if (order) {
    const waText = encodeURIComponent(
      `Hai baikboss! Saya ${user.name}, baru saja buat pesanan pindahan ${order.order_code}. Mohon info langkah selanjutnya.`,
    );
    return (
      <div className="page">
        <PageHead title="Pesanan Dibuat" onBack={() => navigate('/pesanan')} />
        <div className="content">
          <div className="card" style={{ textAlign: 'center', padding: '28px 20px' }}>
            <div style={{ color: 'var(--success)', marginBottom: 10 }}>
              <ICON.success size={54} />
            </div>
            <h3 style={{ margin: '0 0 6px', fontSize: 18 }}>Terima kasih, {user.name?.split(' ')[0]}!</h3>
            <p style={{ margin: '0 0 14px', fontSize: 13.5, color: 'var(--muted)' }}>
              Pesanan pindahan kamu sudah masuk. Tim kami akan konfirmasi via WhatsApp.
            </p>
            <div className="badge" style={{ fontSize: 14, padding: '8px 16px' }}>{order.order_code}</div>

            <div style={{ marginTop: 18, textAlign: 'left' }}>
              <div className="sumrow"><span className="k">Total</span><span className="v">{rupiah(order.amounts?.total ?? order.total_amount)}</span></div>
            </div>

            <a
              className="btn wa"
              style={{ marginTop: 16 }}
              href={`https://wa.me/${order.wa_bossmove || order.wa_tim}?text=${waText}`}
              target="_blank"
              rel="noreferrer"
            >
              <ICON.whatsapp size={18} /> Hubungi Tim BossMove via WhatsApp
            </a>
            <button className="btn outline" style={{ marginTop: 10 }} onClick={() => navigate('/pesanan')}>
              Lihat di halaman Pesanan
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------- WIZARD ------------------------- */
  return (
    <div className="page">
      <PageHead title="BossMove · Pindahan" />
      <div className="content">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div className="svc-ico" style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--purple-100)', color: 'var(--purple-700)', display: 'grid', placeItems: 'center' }}>
            <Truck size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15.5 }}>Pindahan jadi lebih mudah</div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>Pemesan: {user.name} · {user.phone}</div>
          </div>
        </div>

        <Steps current={step} total={4} />

        {err && <div className="err-banner">{err}</div>}

        {/* ---------- STEP 1: rute ---------- */}
        {step === 1 && (
          <>
            <div className="section-label" style={{ marginTop: 4 }}>Dari mana?</div>
            <LocationPicker value={origin} onChange={setOrigin} />

            <div className="section-label">Ke mana?</div>
            <div className="chips" style={{ marginBottom: 12 }}>
              <button className={`chip${destType === 'bojonegoro' ? ' active' : ''}`} onClick={() => setDestType('bojonegoro')}>
                Dalam Bojonegoro
              </button>
              <button className={`chip${destType === 'luar' ? ' active' : ''}`} onClick={() => setDestType('luar')}>
                Luar Bojonegoro
              </button>
            </div>

            {destType === 'bojonegoro' ? (
              <div className="field">
                <label>Kecamatan Tujuan</label>
                <div className="input-wrap">
                  <select value={destTarifId} onChange={(e) => setDestTarifId(e.target.value)} style={{ width: '100%' }}>
                    <option value="">— Pilih kecamatan —</option>
                    {tarifList.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.kecamatan} — tarif {rupiah(t.tarif)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <>
                <div className="field">
                  <label>Provinsi</label>
                  <div className="input-wrap">
                    <select value={provId} onChange={(e) => setProvId(e.target.value)} style={{ width: '100%' }}>
                      <option value="">— Pilih provinsi —</option>
                      {provList.map((p) => <option key={p.id} value={p.id}>{p.nama}</option>)}
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label>Kota/Kabupaten</label>
                  <div className="input-wrap">
                    <select value={kotaId} onChange={(e) => setKotaId(e.target.value)} style={{ width: '100%' }} disabled={!provId}>
                      <option value="">— Pilih kota —</option>
                      {kotaList.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label>Kecamatan</label>
                  <div className="input-wrap">
                    <select value={destWilId} onChange={(e) => setDestWilId(e.target.value)} style={{ width: '100%' }} disabled={!kotaId}>
                      <option value="">— Pilih kecamatan —</option>
                      {kecList.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
                    </select>
                  </div>
                </div>
              </>
            )}

            <div className="field">
              <label>Detail Alamat Tujuan</label>
              <div className="input-wrap">
                <input
                  placeholder="Nama jalan, no. rumah, patokan…"
                  value={destDetail}
                  onChange={(e) => setDestDetail(e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label>Atau pin lokasi tujuan</label>
              <LocationPicker value={destPin} onChange={setDestPin} />
            </div>

            <button className="btn" onClick={nextFrom1}>Lanjut</button>
          </>
        )}

        {/* ---------- STEP 2: barang ---------- */}
        {step === 2 && (
          <>
            <div className="section-label" style={{ marginTop: 4 }}>Jenis pindahan</div>
            <div className="chips" style={{ marginBottom: 14 }}>
              {SERVICE_TYPES.map((s) => (
                <button key={s.code} className={`chip${serviceType === s.code ? ' active' : ''}`} onClick={() => setServiceType(s.code)}>
                  <Icon name={s.icon} size={14} /> {s.label}
                </button>
              ))}
            </div>

            <div className="section-label">Pilih barang yang dipindah</div>
            {barang.map((b) => {
              const Ico = ITEM_ICONS[b.code];
              const q = qty[b.code] || 0;
              return (
                <div key={b.code} className="pick" style={{ cursor: 'default' }}>
                  <div className="p-ico">{Ico ? <Ico size={20} /> : <ICON.package size={20} />}</div>
                  <div style={{ flex: 1 }}>
                    <h4>{b.label}</h4>
                    <p>Handling {rupiah(b.price)}/unit</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button
                      onClick={() => setQty((s) => ({ ...s, [b.code]: Math.max(0, q - 1) }))}
                      style={qtyBtn}
                      aria-label={`Kurangi ${b.label}`}
                    >−</button>
                    <span style={{ width: 22, textAlign: 'center', fontWeight: 600 }}>{q}</span>
                    <button
                      onClick={() => setQty((s) => ({ ...s, [b.code]: Math.min(99, q + 1) }))}
                      style={qtyBtn}
                      aria-label={`Tambah ${b.label}`}
                    >+</button>
                  </div>
                </div>
              );
            })}

            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button className="btn outline" onClick={() => setStep(1)}>Kembali</button>
              <button className="btn" onClick={nextFrom2}>Lanjut</button>
            </div>
          </>
        )}

        {/* ---------- STEP 3: jadwal ---------- */}
        {step === 3 && (
          <>
            <div className="section-label" style={{ marginTop: 4 }}>Tanggal pindahan</div>
            <div className="field">
              <div className="input-wrap">
                <ICON.calendar size={18} />
                <input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>

            <div className="section-label">Jam</div>
            <div className="chips">
              {HOURS.map((h) => (
                <button key={h} className={`chip${time === h ? ' active' : ''}`} onClick={() => setTime(h)}>
                  <ICON.clock size={14} /> {h}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="btn outline" onClick={() => setStep(2)}>Kembali</button>
              <button className="btn" onClick={nextFrom3}>Lanjut</button>
            </div>
          </>
        )}

        {/* ---------- STEP 4: ringkasan ---------- */}
        {step === 4 && (
          <>
            <div className="card" style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Ringkasan</div>
              <div className="sumrow"><span className="k">Dari</span><span className="v" style={{ maxWidth: '62%' }}>{origin.text || `${origin.lat}, ${origin.lng}`}</span></div>
              <div className="sumrow"><span className="k">Ke</span><span className="v" style={{ maxWidth: '62%' }}>{destLabel || (destPin.lat ? `${destPin.lat}, ${destPin.lng}` : '-')}</span></div>
              <div className="sumrow"><span className="k">Jadwal</span><span className="v">{formatDay(date)}, {time}</span></div>
            </div>

            <div className="card" style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Barang</div>
              {itemsPayload.length === 0 && <div style={{ fontSize: 13, color: 'var(--muted)' }}>—</div>}
              {itemsPayload.map((it) => {
                const b = barang.find((x) => x.code === it.item_name);
                return (
                  <div className="sumrow" key={it.item_name}>
                    <span className="k">{b?.label || it.item_name} ×{it.qty}</span>
                    <span className="v">{rupiah((b?.price || 0) * it.qty)}</span>
                  </div>
                );
              })}
              <div className="sumrow"><span className="k">Tarif pindahan</span><span className="v">{quote ? rupiah(quote.tarif_amount) : '…'}</span></div>
              <div className="sumrow total"><span className="k">Total Tarif</span><span className="v">{quote ? rupiah(quote.total_amount) : '…'}</span></div>
            </div>

            <div className="card" style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Informasi Pembayaran <span style={{ fontWeight: 400, fontSize: 12, color: 'var(--muted)' }}>(setelah pekerjaan)</span></div>
              <div className="chips">
                <span className="chip active">QRIS</span>
                <span className="chip active">Transfer</span>
                <span className="chip active">Tunai</span>
              </div>
              <p style={{ fontSize: 12.5, color: 'var(--muted)', margin: '10px 0 0' }}>
                Bayar setelah pindahan selesai — bebas pilih QRIS, transfer bank, atau tunai.
              </p>
            </div>

            <a
              className="btn wa"
              href={`https://wa.me/${WA_BOSSMOVE}?text=${encodeURIComponent('Hai tim BossMove baikboss! Saya mau tanya soal layanan pindahan.')}`}
              target="_blank"
              rel="noreferrer"
              style={{ marginBottom: 10 }}
            >
              <ICON.whatsapp size={18} /> Chat Tim BossMove
            </a>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn outline" onClick={() => setStep(3)}>Kembali</button>
              <button className="btn" onClick={submit} disabled={loading || !quote}>
                {loading ? 'Mengirim…' : 'Kirim Pesanan'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const WA_BOSSMOVE = '6281234567891';

const qtyBtn = {
  width: 32, height: 32, borderRadius: 10,
  border: '1.5px solid var(--line)', background: '#fff',
  fontSize: 17, fontWeight: 600, cursor: 'pointer', color: 'var(--purple-700)',
};

function formatDay(iso) {
  if (!iso) return '-';
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
