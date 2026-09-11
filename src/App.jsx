import { useEffect, useMemo, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import {
  getLayanan,
  getBarang,
  getTarif,
  getProvinsi,
  getKota,
  getKecamatan,
  getRekening,
  getFaq,
  postQuote,
  postOrder,
  postPay,
  rupiah,
  reverseGeocode,
} from "./api";
import MapPicker from "./MapPicker";
import { NAV_ICONS, SERVICE_ICONS, ITEM_ICONS, ICON, Icon } from "./icons.jsx";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

/* ================= Shared bits ================= */

function Header() {
  return (
    <div className="header">
      <div className="brand">
        <img src="/logo.png" alt="baikboss!" />
      </div>
      <div className="avatar">BB</div>
    </div>
  );
}

function Steps({ step, total = 6 }) {
  return (
    <div className="steps">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className={`dot ${i + 1 <= step ? (i + 1 === step ? "active" : "done") : ""}`} />
      ))}
    </div>
  );
}

function FooterNav({ route }) {
  const nav = useNavigate();
  const items = [
    { key: "home", icon: NAV_ICONS.home, label: "Home", to: "/" },
    { key: "tarif", icon: NAV_ICONS.tarif, label: "Tarif", to: "/tarif" },
    { key: "faq", icon: NAV_ICONS.faq, label: "FAQ", to: "/faq" },
  ];
  return (
    <div className="footer-nav">
      {items.map((it) => (
        <button key={it.key} className={route === it.key ? "active" : ""} onClick={() => nav(it.to)}>
          <span className="ico">
            <it.icon size={18} />
          </span>
          {it.label}
        </button>
      ))}
    </div>
  );
}

function WaButton({ text }) {
  return (
    <a
      className="btn btn-ghost"
      style={{ textDecoration: "none", textAlign: "center" }}
      target="_blank"
      rel="noreferrer"
      href={`https://wa.me/6281234567890?text=${encodeURIComponent(text || "Halo tim baikboss!")}`}
    >
      <ICON.whatsapp size={16} style={{ marginRight: 6 }} /> Hubungi Tim via WhatsApp
    </a>
  );
}

/* ================= Screen 1: Home ================= */

function ScreenHome({ data, onStart, onFaq }) {
  return (
    <>
      <Header />
      <div className="screen">
        <h1>Halo, Boss!</h1>
        <p className="sub">Mau pindahan apa hari ini?</p>
        <div className="hero">
          <h2>Jasa pindahan aman &amp; rapi</h2>
          <p>Rumah, kos, warung, dan kantor — baikboss siap dan sigap!</p>
        </div>
        <div className="svc-grid">
          {(data?.layanan || []).map((s) => {
            const SvcIcon = SERVICE_ICONS[s.code];
            return (
              <div key={s.code} className="svc" onClick={() => onStart(s)}>
                <span className="emoji">
                  <SvcIcon size={30} />
                </span>
                {s.label}
              </div>
            );
          })}
        </div>
        <p className="map-hint" style={{ textAlign: "center" }}>
          ↑ Pilih jenis pindahan untuk mulai order
        </p>
        <button className="btn btn-ghost" onClick={onFaq}>
          <ICON.faq size={16} style={{ marginRight: 6 }} /> Tanya Dulu (FAQ)
        </button>
        <p className="map-hint" style={{ textAlign: "center" }}>
          Jam operasional 07.00–17.00 WIB · Bojonegoro &amp; sekitarnya
        </p>
      </div>
      <FooterNav route="home" />
    </>
  );
}

/* ================= Screen 2: Kontak ================= */

function ScreenKontak({ form, setForm, next, back, error }) {
  const valid = form.name.trim().length >= 3 && /^08\d{7,13}$/.test(form.phone);
  return (
    <>
      <Header />
      <Steps step={2} />
      <div className="screen">
        <button className="btn-back" onClick={back}>
          <ICON.back size={16} /> Kembali
        </button>
        <h1>Data Pemesan</h1>
        <p className="sub">Tim kami menghubungi lewat nomor ini.</p>
        {error && <div className="err">{error}</div>}
        <div className="field">
          <label>Nama Lengkap</label>
          <input
            placeholder="cth. Budi Santoso"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="field">
          <label>No. WhatsApp</label>
          <input
            placeholder="08xxxxxxxxxx"
            inputMode="numeric"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })}
          />
        </div>
        <button className="btn" disabled={!valid} onClick={next}>
          Lanjut → Lokasi
        </button>
      </div>
    </>
  );
}

/* ================= Screen 3: Lokasi ================= */

function ScreenLokasi({ form, setForm, tarif, next, back, error }) {
  const [originMode, setOriginMode] = useState("gps"); // gps | manual
  const [destMode, setDestMode] = useState("bojonegoro"); // bojonegoro | luar
  const [pin, setPin] = useState({ lat: form.origin_lat, lng: form.origin_lng });
  const [geoMsg, setGeoMsg] = useState("");

  // wilayah luar bojonegoro
  const [provs, setProvs] = useState([]);
  const [kotas, setKotas] = useState([]);
  const [kecs, setKecs] = useState([]);

  useEffect(() => {
    getProvinsi()
      .then((r) => setProvs(r.data))
      .catch(() => {});
  }, []);

  const pickOrigin = async (lat, lng) => {
    setPin({ lat, lng });
    setForm((f) => ({ ...f, origin_lat: lat, origin_lng: lng }));
    const label = await reverseGeocode(lat, lng);
    setForm((f) => ({ ...f, origin_label: label, origin_label_edited: true }));
  };

  const useGps = () => {
    if (!navigator.geolocation) return setGeoMsg("GPS tidak didukung browser ini.");
    setGeoMsg("Mengambil lokasi…");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setGeoMsg("");
        await pickOrigin(latitude, longitude);
        setOriginMode("gps");
      },
      () => setGeoMsg("Gagal mengambil GPS. Coba pin di peta atau isi manual."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const originValid = form.origin_label.trim().length >= 5;
  const destValid =
    destMode === "bojonegoro"
      ? !!form.dest_tarif_id && form.dest_label.trim().length >= 5
      : !!form.dest_wilayah_id && form.dest_label.trim().length >= 5;

  const destTarifInfo = useMemo(() => {
    const t = (tarif || []).find((x) => x.id === Number(form.dest_tarif_id));
    return t ? `${t.kecamatan} · ${rupiah(t.tarif)}` : "Pilih kecamatan";
  }, [form.dest_tarif_id, tarif]);

  return (
    <>
      <Header />
      <Steps step={3} />
      <div className="screen">
        <button className="btn-back" onClick={back}>
          <ICON.back size={16} /> Kembali
        </button>
        <h1>Dari mana ke mana?</h1>
        <p className="sub">Titik asal &amp; tujuan pindahan.</p>
        {error && <div className="err">{error}</div>}

        {/* ---- DARI ---- */}
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <b>
            <ICON.location size={16} style={{ marginRight: 4 }} /> Dari (asal)
          </b>
          <div className="seg">
            <button className={originMode === "gps" ? "active" : ""} onClick={() => setOriginMode("gps")}>
              Lokasi Saya
            </button>
            <button className={originMode === "manual" ? "active" : ""} onClick={() => setOriginMode("manual")}>
              Pilih Kecamatan
            </button>
          </div>

          {originMode === "gps" ? (
            <>
              <MapPicker lat={pin.lat} lng={pin.lng} onPick={pickOrigin} />
              <span className="map-hint">Ketuk peta untuk pindahkan pin, atau pakai GPS.</span>
              <button className="btn btn-ghost" onClick={useGps}>
                <ICON.gps size={16} style={{ marginRight: 6 }} /> Deteksi GPS Otomatis
              </button>
              {geoMsg && <span className="map-hint">{geoMsg}</span>}
              <div className="field">
                <label>Alamat asal (boleh diubah)</label>
                <textarea
                  rows={2}
                  placeholder="cth. Jl. Merdeka No. 10, Bojonegoro"
                  value={form.origin_label}
                  onChange={(e) => setForm({ ...form, origin_label: e.target.value })}
                />
              </div>
            </>
          ) : (
            <div className="field">
              <label>Kecamatan asal</label>
              <select
                value={form.origin_kecamatan_id || ""}
                onChange={(e) => setForm({ ...form, origin_kecamatan_id: e.target.value || null })}
              >
                <option value="">— Pilih kecamatan —</option>
                {(tarif || []).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.kecamatan} — {rupiah(t.tarif)}
                  </option>
                ))}
              </select>
              <div className="field">
                <label>Detail alamat asal</label>
                <input
                  placeholder="cth. Jl. Merdeka No. 10"
                  value={form.origin_label}
                  onChange={(e) => setForm({ ...form, origin_label: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>

        {/* ---- KE ---- */}
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <b>
            <ICON.destination size={16} style={{ marginRight: 4 }} /> Ke (tujuan)
          </b>
          <div className="seg">
            <button className={destMode === "bojonegoro" ? "active" : ""} onClick={() => setDestMode("bojonegoro")}>
              Dalam Bojonegoro
            </button>
            <button className={destMode === "luar" ? "active" : ""} onClick={() => setDestMode("luar")}>
              Luar Bojonegoro
            </button>
          </div>

          {destMode === "bojonegoro" ? (
            <div className="field">
              <label>Kecamatan tujuan (tarif per kecamatan)</label>
              <select
                value={form.dest_tarif_id || ""}
                onChange={(e) => setForm({ ...form, dest_tarif_id: e.target.value || null })}
              >
                <option value="">— Pilih kecamatan —</option>
                {(tarif || []).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.kecamatan} — {rupiah(t.tarif)}
                  </option>
                ))}
              </select>
              <span className="map-hint">{destTarifInfo}</span>
            </div>
          ) : (
            <>
              <div className="field">
                <label>Provinsi</label>
                <select
                  value={form._prov || ""}
                  onChange={async (e) => {
                    const v = e.target.value;
                    setForm({ ...form, _prov: v, dest_wilayah_id: null });
                    if (v) setKotas((await getKota(v)).data);
                  }}
                >
                  <option value="">— Pilih provinsi —</option>
                  {provs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nama}
                    </option>
                  ))}
                </select>
              </div>
              {form._prov && (
                <div className="field">
                  <label>Kota/Kabupaten</label>
                  <select
                    value={form._kota || ""}
                    onChange={async (e) => {
                      const v = e.target.value;
                      setForm({ ...form, _kota: v, dest_wilayah_id: null });
                      if (v) setKecs((await getKecamatan(v)).data);
                    }}
                  >
                    <option value="">— Pilih kota/kabupaten —</option>
                    {kotas.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.nama}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {form._kota && (
                <div className="field">
                  <label>Kecamatan</label>
                  <select
                    value={form.dest_wilayah_id || ""}
                    onChange={(e) => setForm({ ...form, dest_wilayah_id: e.target.value || null })}
                  >
                    <option value="">— Pilih kecamatan —</option>
                    {kecs.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.nama}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          <div className="field">
            <label>Detail alamat tujuan {destMode === "luar" ? "" : "(map/ketik)"}</label>
            <textarea
              rows={2}
              placeholder="cth. Perum Griya Asri Blok C No. 4"
              value={form.dest_label}
              onChange={(e) => setForm({ ...form, dest_label: e.target.value })}
            />
          </div>
          {destMode === "bojonegoro" && (
            <MapPicker
              lat={form.dest_lat}
              lng={form.dest_lng}
              onPick={(lat, lng) => setForm({ ...form, dest_lat: lat, dest_lng: lng })}
            />
          )}
        </div>

        <button className="btn" disabled={!(originValid && destValid)} onClick={next}>
          Lanjut → Barang
        </button>
      </div>
    </>
  );
}

/* ================= Screen 4a: Barang ================= */

function ScreenBarang({ form, setForm, barang, next, back }) {
  const total = Object.values(form.items).reduce((a, b) => a + b, 0);
  const setQty = (code, q) => setForm({ ...form, items: { ...form.items, [code]: Math.max(0, Math.min(99, q)) } });

  return (
    <>
      <Header />
      <Steps step={4} />
      <div className="screen">
        <button className="btn-back" onClick={back}>
          <ICON.back size={16} /> Kembali
        </button>
        <h1>Barang apa saja?</h1>
        <p className="sub">Isi jumlah barang besar yang perlu dibantu.</p>

        {(barang || []).map((b) => {
          const ItemIcon = ITEM_ICONS[b.code];
          return (
            <div className="item-row" key={b.code}>
              <div className="info">
                <span className="emoji">
                  <ItemIcon size={22} />
                </span>
                <div>
                  {b.label}
                  <small>{rupiah(b.price)} /unit handling</small>
                </div>
              </div>
              <div className="qty">
                <button onClick={() => setQty(b.code, (form.items[b.code] || 0) - 1)}>−</button>
                <span>{form.items[b.code] || 0}</span>
                <button onClick={() => setQty(b.code, (form.items[b.code] || 0) + 1)}>+</button>
              </div>
            </div>
          );
        })}

        <button className="btn" disabled={total === 0} onClick={next}>
          Lanjut → Jadwal
        </button>
      </div>
    </>
  );
}

/* ================= Screen 4b: Jadwal ================= */

function ScreenJadwal({ form, setForm, next, back, error }) {
  const today = new Date().toISOString().slice(0, 10);
  const valid = !!form.schedule_date && !!form.schedule_time;
  return (
    <>
      <Header />
      <Steps step={5} />
      <div className="screen">
        <button className="btn-back" onClick={back}>
          <ICON.back size={16} /> Kembali
        </button>
        <h1>Jadwal pindahan</h1>
        <p className="sub">Kapan tim kami datang?</p>
        {error && <div className="err">{error}</div>}

        <div className="field">
          <label>Tanggal</label>
          <input
            type="date"
            min={today}
            value={form.schedule_date}
            onChange={(e) => setForm({ ...form, schedule_date: e.target.value })}
          />
        </div>
        <div className="field">
          <label>Jam</label>
          <select value={form.schedule_time} onChange={(e) => setForm({ ...form, schedule_time: e.target.value })}>
            <option value="">— Pilih jam —</option>
            {["07:00", "08:00", "09:00", "10:00", "13:00", "14:00", "15:00"].map((t) => (
              <option key={t} value={t}>
                {t} WIB
              </option>
            ))}
          </select>
        </div>

        <button className="btn" disabled={!valid} onClick={next}>
          Lanjut → Ringkasan
        </button>
      </div>
    </>
  );
}

/* ================= Screen 5: Ringkasan & Bayar ================= */

function ScreenRingkasan({ form, setForm, quote, onBayar, paying, error, back, rekening }) {
  return (
    <>
      <Header />
      <Steps step={6} />
      <div className="screen">
        <button className="btn-back" onClick={back}>
          <ICON.back size={16} /> Kembali
        </button>
        <h1>Ringkasan Pesanan</h1>
        <p className="sub">Periksa detail sebelum bayar.</p>
        {error && <div className="err">{error}</div>}

        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="sum-row">
            <span className="lbl">Layanan</span>
            <b>{form.service_label}</b>
          </div>
          <div className="sum-row">
            <span className="lbl">Nama</span>
            <span>{form.name}</span>
          </div>
          <div className="sum-row">
            <span className="lbl">No. WA</span>
            <span>{form.phone}</span>
          </div>
          <div className="sum-row">
            <span className="lbl">Dari</span>
            <span style={{ textAlign: "right", maxWidth: "60%" }}>{form.origin_label}</span>
          </div>
          <div className="sum-row">
            <span className="lbl">Ke</span>
            <span style={{ textAlign: "right", maxWidth: "60%" }}>{form.dest_label}</span>
          </div>
          <div className="sum-row">
            <span className="lbl">Jadwal</span>
            <b>
              {formatDate(form.schedule_date)} · {form.schedule_time} WIB
            </b>
          </div>
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <b style={{ fontSize: 14 }}>Barang</b>
          {quote?.items?.map((i) => {
            const info = (form._barang || []).find((b) => b.code === i.item_name);
            return (
              <div className="sum-row" key={i.item_name}>
                <span className="lbl">
                  {info ? <Icon name={info.icon} size={14} /> : null} {info?.label || i.item_name} ×{i.qty}
                </span>
                <span>{rupiah(i.subtotal)}</span>
              </div>
            );
          })}
          <div className="sum-row">
            <span className="lbl">Tarif kecamatan</span>
            <span>{rupiah(quote?.tarif_amount)}</span>
          </div>
          <div className="sum-row total">
            <span>Total</span>
            <span>{rupiah(quote?.total_amount)}</span>
          </div>
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <b style={{ fontSize: 14 }}>Transfer ke rekening</b>
          {(rekening || []).map((r) => (
            <div className="rek" key={r.no}>
              <span>
                <b>{r.bank}</b> {r.no}
              </span>
              <span>a.n. {r.nama}</span>
            </div>
          ))}
          <span className="map-hint">Setelah transfer, klik tombol di bawah. Tim akan verifikasi via WhatsApp.</span>
        </div>

        <WaButton text={`Halo tim baikboss! Saya ${form.name} (${form.phone}) ingin bertanya soal pindahan.`} />

        <button className="btn" onClick={onBayar} disabled={paying}>
          {paying ? (
            "Memproses…"
          ) : (
            <>
              <ICON.success size={16} style={{ marginRight: 6 }} />
              Bayar {rupiah(quote?.total_amount)} (Konfirmasi Transfer)
            </>
          )}
        </button>
      </div>
    </>
  );
}

/* ================= Helpers ================= */

/** Format ISO date string to "Hari, DD Month YYYY" in Indonesian */
const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];
function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

/* ================= Screen 6: Sukses ================= */

function ScreenSukses({ order, onSelesai }) {
  return (
    <>
      <Header />
      <div className="success-wrap">
        <div className="success-icon">
          <ICON.success size={48} />
        </div>
        <h1>
          Pembayaran Berhasil! <ICON.party size={28} />
        </h1>
        <p className="sub">Tim akan segera menghubungi anda.</p>
        <div className="estimate">
          Estimasi tim siap &amp; sampai alamat anda:
          <br />
          {formatDate(order?.schedule?.date)} pukul {order?.schedule?.time} WIB
        </div>
        <div className="card" style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
          <div className="sum-row">
            <span className="lbl">Kode pesanan</span>
            <b>{order?.order_code}</b>
          </div>
          <div className="sum-row">
            <span className="lbl">Total dibayar</span>
            <b style={{ color: "var(--purple)" }}>{rupiah(order?.amounts?.total)}</b>
          </div>
        </div>
        <WaButton text={`Halo tim baikboss! Saya sudah bayar pesanan ${order?.order_code}. Kapan tim berangkat?`} />
        <button className="btn btn-ghost" onClick={onSelesai}>
          Selesai
        </button>
      </div>
    </>
  );
}

/* ================= FAQ page ================= */

function ScreenFaq() {
  const [open, setOpen] = useState(null);
  const [faq, setFaq] = useState([]);
  useEffect(() => {
    getFaq()
      .then((r) => setFaq(r.data))
      .catch(() => {});
  }, []);
  return (
    <>
      <Header />
      <div className="screen">
        <h1>
          Tanya Dulu <ICON.faq size={28} />
        </h1>
        <p className="sub">Pertanyaan yang sering diajukan.</p>
        {(faq || []).map((f, i) => (
          <div className="faq-item" key={i}>
            <button onClick={() => setOpen(open === i ? null : i)}>
              {f.q}
              <span className={`chev ${open === i ? "open" : ""}`}>›</span>
            </button>
            {open === i && <div className="ans">{f.a}</div>}
          </div>
        ))}
        <WaButton text="Halo tim baikboss! Saya mau tanya-tanya dulu soal layanan pindahan." />
        <button className="btn" onClick={() => window.history.back()}>
          <ICON.back size={16} /> Kembali
        </button>
      </div>
      <FooterNav route="faq" />
    </>
  );
}

/* ================= Tarif page ================= */

function ScreenTarif() {
  const [tarif, setTarif] = useState([]);
  useEffect(() => {
    getTarif()
      .then((r) => setTarif(r.data))
      .catch(() => {});
  }, []);
  return (
    <>
      <Header />
      <div className="screen">
        <h1>Tarif per Kecamatan</h1>
        <p className="sub">Kabupaten Bojonegoro · sudah termasuk bongkar-muat.</p>
        <div className="card tarif-scroll">
          <table className="tarif-table">
            <thead>
              <tr>
                <th>Kecamatan</th>
                <th>Tarif</th>
              </tr>
            </thead>
            <tbody>
              {tarif.map((t) => (
                <tr key={t.id}>
                  <td>{t.kecamatan}</td>
                  <td>{rupiah(t.tarif)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="map-hint">
          Luar Bojonegoro: tarif flat {rupiah(250000)} (dihitung dari provinsi/kota/kecamatan tujuan).
        </p>
      </div>
      <FooterNav route="tarif" />
    </>
  );
}

/* ================= Wizard root ================= */

const emptyForm = {
  service_type: null,
  service_label: "",
  name: "",
  phone: "",
  origin_label: "",
  origin_lat: null,
  origin_lng: null,
  origin_kecamatan_id: null,
  dest_type: "bojonegoro",
  dest_tarif_id: null,
  dest_wilayah_id: null,
  dest_label: "",
  dest_lat: null,
  dest_lng: null,
  items: {},
  schedule_date: "",
  schedule_time: "",
  notes: "",
};

function Wizard() {
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [master, setMaster] = useState({ layanan: [], barang: [], tarif: [], rekening: [] });
  const [quote, setQuote] = useState(null);
  const [order, setOrder] = useState(null);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getLayanan(), getBarang(), getTarif(), getRekening()])
      .then(([layanan, barang, tarif, rekening]) =>
        setMaster({
          layanan: layanan.data,
          barang: barang.data,
          tarif: tarif.data,
          rekening: rekening.data,
        }),
      )
      .catch((e) => setError(e.message));
  }, []);

  const payload = useMemo(
    () => ({
      service_type: form.service_type,
      name: form.name,
      phone: form.phone,
      origin_label: form.origin_label,
      origin_lat: form.origin_lat,
      origin_lng: form.origin_lng,
      origin_kecamatan_id: form.origin_kecamatan_id,
      dest_type: form.dest_type,
      dest_tarif_id: form.dest_tarif_id,
      dest_wilayah_id: form.dest_wilayah_id,
      dest_label: form.dest_label,
      dest_lat: form.dest_lat,
      dest_lng: form.dest_lng,
      schedule_date: form.schedule_date,
      schedule_time: form.schedule_time,
      notes: form.notes,
      items: Object.entries(form.items)
        .filter(([, q]) => q > 0)
        .map(([item_name, qty]) => ({ item_name, qty })),
    }),
    [form],
  );

  const refreshQuote = async () => {
    setError("");
    const r = await postQuote(payload);
    setQuote(r.data);
  };

  const startOrder = (svc) => {
    setForm({ ...emptyForm, service_type: svc?.code || null, service_label: svc?.label || "Pindahan" });
    setStep(2);
  };

  const toRingkasan = async () => {
    try {
      setError("");
      await refreshQuote();
      setStep(6); // ringkasan
    } catch (e) {
      setError(e.message);
    }
  };

  const bayar = async () => {
    try {
      setPaying(true);
      setError("");
      const r = await postOrder(payload);
      const created = r.data;
      await postPay(created.order_code, created.wa_number, "BCA");
      setOrder(created);
      setStep(7); // sukses
    } catch (e) {
      setError(e.message);
    } finally {
      setPaying(false);
    }
  };

  const selesai = () => {
    setForm(emptyForm);
    setQuote(null);
    setOrder(null);
    setStep(1);
  };

  switch (step) {
    case 1:
      return <ScreenHome data={master} onStart={startOrder} onFaq={() => nav("/faq")} />;
    case 2:
      return (
        <ScreenKontak form={form} setForm={setForm} next={() => setStep(3)} back={() => setStep(1)} error={error} />
      );
    case 3:
      return (
        <ScreenLokasi
          form={form}
          setForm={setForm}
          tarif={master.tarif}
          next={() => setStep(4)}
          back={() => setStep(2)}
          error={error}
        />
      );
    case 4:
      return (
        <ScreenBarang
          form={form}
          setForm={setForm}
          barang={master.barang}
          next={() => setStep(5)}
          back={() => setStep(3)}
        />
      );
    case 5:
      return <ScreenJadwal form={form} setForm={setForm} next={toRingkasan} back={() => setStep(4)} error={error} />;
    case 6:
      return (
        <ScreenRingkasan
          form={form}
          setForm={setForm}
          quote={quote}
          onBayar={bayar}
          paying={paying}
          error={error}
          back={() => setStep(5)}
          rekening={master.rekening}
        />
      );
    case 7:
      return <ScreenSukses order={order} onSelesai={selesai} />;
    default:
      return null;
  }
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Wizard />} />
      <Route path="/faq" element={<ScreenFaq />} />
      <Route path="/tarif" element={<ScreenTarif />} />
    </Routes>
  );
}
