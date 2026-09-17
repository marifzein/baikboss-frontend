import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHead from '../components/PageHead.jsx';
import Steps from '../components/Steps.jsx';
import LocationPicker from '../components/LocationPicker.jsx';
import { getGlowServices, getTherapists, getAddresses, postGlowBooking, rupiah, store } from '../api.js';
import { ICON } from '../icons.jsx';
import { Sparkles, Hand, Dices } from 'lucide-react';

const HOURS = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '19:00', '20:00'];
const ONGKIR = 10000; // sinkron dengan BAIKBOSS_ONGKIR backend

function formatDay(iso) {
  if (!iso) return '-';
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function GlowBooking() {
  const { itemKey } = useParams();
  const navigate = useNavigate();
  const user = store.getUser() || {};

  const [step, setStep] = useState(1);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [service, setService] = useState(null);
  const [pkgIdx, setPkgIdx] = useState(0);

  // step 2 — alamat
  const [savedAddrs, setSavedAddrs] = useState([]);
  const [loc, setLoc] = useState({ lat: null, lng: null, text: '' });
  const [detail, setDetail] = useState('');

  // step 3 — terapis + jadwal
  const [therapists, setTherapists] = useState([]);
  const [therapistId, setTherapistId] = useState('auto');
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [time, setTime] = useState('10:00');

  // step 4
  const [notes, setNotes] = useState('');
  const [done, setDone] = useState(null);

  /* ---------- load service + alamat tersimpan ---------- */
  useEffect(() => {
    getGlowServices()
      .then((r) => {
        const s = r.data.find((x) => x.key === itemKey);
        if (!s) setErr('Layanan tidak ditemukan.');
        else setService(s);
      })
      .catch((e) => setErr(e.message));

    getAddresses()
      .then((r) => {
        setSavedAddrs(r.data);
        const primary = r.data.find((a) => a.is_primary) || r.data[0];
        if (primary) {
          setLoc({ lat: primary.lat, lng: primary.lng, text: primary.address_text });
          setDetail(primary.address_text);
        }
      })
      .catch(() => {});
  }, [itemKey]);

  /* ---------- terapis sesuai gender layanan ---------- */
  useEffect(() => {
    if (!service) return;
    getTherapists(service.gender)
      .then((r) => setTherapists(r.data))
      .catch(() => {});
  }, [service]);

  const pkg = service?.packages?.[pkgIdx];

  const fullAddress = useMemo(
    () => [detail || loc.text].filter(Boolean).join(' — '),
    [detail, loc.text],
  );

  const nextFrom1 = () => {
    setErr('');
    if (!pkg) return setErr('Pilih paket dulu ya.');
    setStep(2);
  };
  const nextFrom2 = () => {
    setErr('');
    if (!loc.lat && !fullAddress) return setErr('Isi alamat lengkap atau pin lokasi.');
    setStep(3);
  };
  const nextFrom3 = () => {
    setErr('');
    setStep(4);
  };

  const submit = async () => {
    setErr('');
    setLoading(true);
    try {
      const res = await postGlowBooking({
        item_key: service.key,
        duration_hours: pkg?.duration_hours,
        price: pkg?.price,
        therapist_id: therapistId === 'auto' ? null : Number(therapistId),
        address_text: fullAddress,
        address_lat: loc.lat,
        address_lng: loc.lng,
        schedule_date: date,
        schedule_time: time,
        notes: notes || null,
      });
      setDone(res.data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------- LOADING / ERROR ------------------------- */
  if (!service) {
    return (
      <div className="page">
        <PageHead title="BossGlow" />
        <div className="content">
          {err ? <div className="err-banner">{err}</div> : <div style={{ color: 'var(--muted)', padding: 20, textAlign: 'center' }}>Memuat…</div>}
        </div>
      </div>
    );
  }

  /* ------------------------- SUCCESS ------------------------- */
  if (done) {
    return (
      <div className="page">
        <PageHead title="Booking Terkirim" onBack={() => navigate('/pesanan')} />
        <div className="content">
          <div className="card" style={{ textAlign: 'center', padding: '28px 20px' }}>
            <div style={{ color: 'var(--success)', marginBottom: 10 }}><ICON.success size={54} /></div>
            <h3 style={{ margin: '0 0 6px', fontSize: 18 }}>Booking diterima!</h3>
            <p style={{ margin: '0 0 14px', fontSize: 13.5, color: 'var(--muted)' }}>
              Terapis <b>{done.therapist?.name}</b> akan menemuimu di lokasi. Catatanmu sudah dishare ke terapis.
            </p>
            <div className="badge" style={{ fontSize: 14, padding: '8px 16px' }}>{done.booking_code}</div>
            <div style={{ marginTop: 16, textAlign: 'left' }}>
              <div className="sumrow"><span className="k">Layanan</span><span className="v">{done.item_label}</span></div>
              <div className="sumrow"><span className="k">Jadwal</span><span className="v">{formatDay(done.schedule?.date)} · {done.schedule?.time}</span></div>
              <div className="sumrow"><span className="k">Ongkir</span><span className="v">{rupiah(done.ongkir)}</span></div>
              <div className="sumrow total"><span className="k">Total</span><span className="v">{rupiah(done.total)}</span></div>
            </div>
            <button className="btn" style={{ marginTop: 16 }} onClick={() => navigate('/pesanan')}>Lihat di halaman Pesanan</button>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------- WIZARD ------------------------- */
  return (
    <div className="page">
      <PageHead title={service.label} />
      <div className="content">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--purple-100)', display: 'grid', placeItems: 'center', fontSize: 22 }}>
            {service.category === 'facial' ? <Sparkles size={20} /> : <Hand size={20} />}
          </div>
          <div>                <div style={{ fontWeight: 600, fontSize: 15.5 }}>{service.label}</div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>Terapis {service.gender_label} · dipesan atas nama {user.name}</div>
          </div>
        </div>

        <Steps current={step} total={4} />
        {err && <div className="err-banner">{err}</div>}

        {/* ---------- STEP 1: paket ---------- */}
        {step === 1 && (
          <>
            <div className="section-label" style={{ marginTop: 4 }}>Pilih paket</div>
            {service.packages.map((p, i) => (
              <button key={i} className={`pick${pkgIdx === i ? ' active' : ''}`} onClick={() => setPkgIdx(i)}>
                <div className="p-ico">{service.category === 'facial' ? <Sparkles size={20} /> : <Hand size={20} />}</div>
                <div style={{ flex: 1 }}>
                  <h4>{p.label}</h4>
                  <p>Durasi {p.duration_hours} jam</p>
                </div>
                <div className="price">{rupiah(p.price)}</div>
              </button>
            ))}
            <button className="btn" onClick={nextFrom1}>Lanjut</button>
          </>
        )}

        {/* ---------- STEP 2: alamat ---------- */}
        {step === 2 && (
          <>
            <div className="section-label" style={{ marginTop: 4 }}>Alamat kunjungan</div>

            {savedAddrs.length > 0 && (
              <>
                <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 8 }}>Pakai alamat tersimpan:</div>
                {savedAddrs.map((a) => (
                  <button
                    key={a.id}
                    className={`pick${detail === a.address_text ? ' active' : ''}`}
                    onClick={() => {
                      setDetail(a.address_text);
                      setLoc({ lat: a.lat, lng: a.lng, text: a.address_text });
                    }}
                  >
                    <div className="p-ico"><ICON.location size={20} /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4>{a.label} — {a.recipient}</h4>
                      <p style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.address_text}</p>
                    </div>
                  </button>
                ))}
              </>
            )}

            <div className="field" style={{ marginTop: 12 }}>
              <label>Alamat Lengkap <span className="req">*</span></label>
              <div className="input-wrap">
                <textarea
                  placeholder="Nama jalan, no. rumah, patokan…"
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label>Set Lokasi (opsional, bantu terapis)</label>
              <LocationPicker value={loc} onChange={(v) => setLoc(v)} />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn outline" onClick={() => setStep(1)}>Kembali</button>
              <button className="btn" onClick={nextFrom2}>Lanjut</button>
            </div>
          </>
        )}

        {/* ---------- STEP 3: terapis + jadwal ---------- */}
        {step === 3 && (
          <>
            <div className="section-label" style={{ marginTop: 4 }}>Pilih terapis {service.gender_label}</div>
            <button className={`pick${therapistId === 'auto' ? ' active' : ''}`} onClick={() => setTherapistId('auto')}>
              <div className="p-ico"><Dices size={20} /></div>
              <div style={{ flex: 1 }}>
                <h4>Bebas (dipilihkan system)</h4>
                <p>Cari terapis {service.gender_label} yang free</p>
              </div>
            </button>
            {therapists.map((t) => (
              <button key={t.id} className={`pick${String(therapistId) === String(t.id) ? ' active' : ''}`} onClick={() => setTherapistId(t.id)}>
                <div className="p-ico" style={{ fontWeight: 600 }}>{t.name.charAt(0)}</div>
                <div style={{ flex: 1 }}>
                  <h4>{t.name}</h4>
                  <p>⭐ {t.rating} · {t.experience_years} th pengalaman</p>
                </div>
              </button>
            ))}
            {therapists.length === 0 && (
              <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>Memuat daftar terapis…</div>
            )}

            <div className="section-label" style={{ marginTop: 16 }}>Jadwal</div>
            <div className="field">
              <div className="input-wrap">
                <ICON.calendar size={18} />
                <input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>
            <div className="chips">
              {HOURS.map((h) => (
                <button key={h} className={`chip${time === h ? ' active' : ''}`} onClick={() => setTime(h)}>
                  <ICON.clock size={14} /> {h}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <button className="btn outline" onClick={() => setStep(2)}>Kembali</button>
              <button className="btn" onClick={nextFrom3}>Lanjut</button>
            </div>
          </>
        )}

        {/* ---------- STEP 4: ringkasan ---------- */}
        {step === 4 && (
          <>
            <div className="card" style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Ringkasan Pesanan</div>
              <div className="sumrow"><span className="k">Alamat</span><span className="v" style={{ maxWidth: '62%', whiteSpace: 'normal' }}>{fullAddress}</span></div>
              <div className="sumrow"><span className="k">Layanan</span><span className="v">{pkg?.label}</span></div>
              <div className="sumrow"><span className="k">Durasi</span><span className="v">{pkg?.duration_hours} jam</span></div>
              <div className="sumrow"><span className="k">Terapis</span><span className="v">{therapistId === 'auto' ? 'Dipilihkan system' : therapists.find((t) => String(t.id) === String(therapistId))?.name || '-'}</span></div>
              <div className="sumrow"><span className="k">Jadwal</span><span className="v">{formatDay(date)}, {time}</span></div>
              <div className="sumrow"><span className="k">Harga</span><span className="v">{rupiah(pkg?.price)}</span></div>
              <div className="sumrow"><span className="k">Ongkir</span><span className="v">{rupiah(ONGKIR)}</span></div>
              <div className="sumrow total"><span className="k">Total</span><span className="v">{rupiah((pkg?.price || 0) + ONGKIR)}</span></div>
            </div>

            <div className="field">
              <label>Catatan untuk terapis</label>
              <div className="input-wrap">
                <textarea
                  placeholder="Contoh: fokus bahu, bawa matras, ada kucing di rumah"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Catatan langsung dishare ke terapis.</div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn outline" onClick={() => setStep(3)}>Kembali</button>
              <button className="btn" onClick={submit} disabled={loading}>
                {loading ? 'Mengirim…' : 'Submit Booking'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
