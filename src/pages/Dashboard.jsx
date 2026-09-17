import { useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { store } from "../api.js";
import { SERVICE_ICONS, ICON } from "../icons.jsx";
import Swal from "../swal.js";

const SERVICES = [
  { key: "bossmove", to: "/bossmove", name: "BossMove", desc: "Pindahan jadi lebih mudah", img: "/img/bossmove.webp" },
  {
    key: "bossglow",
    to: "/bossglow",
    name: "BossGlow",
    desc: "Saatnya rileks, saatnya glow",
    img: "/img/bossglow.webp",
  },
  { key: "bossclean", to: null, name: "BossClean", desc: "Bersih tanpa repot", img: "/img/bossclean.webp" },
  { key: "bossfix", to: null, name: "BossFix", desc: "Perbaikan tanpa drama", img: "/img/bossfix.webp" },
];

const PROMOS = [
  {
    title: "Paket Beauty Care Mingguan",
    meta1: "Facial, Massage",
    meta2: "Durasi 1 jam",
    price: "Rp 120.000",
    img: "/img/glow.jpg",
    to: "/bossglow",
  },
  {
    title: "Promo Bersih Rumah",
    meta1: "2 Kamar Tidur · 1 Kamar Mandi",
    meta2: "Durasi 2 jam",
    price: "Rp 600rb",
    img: "/img/clean.jpg",
    to: null,
  },
  {
    title: "Promo BossMove Lite",
    meta1: "Pindahan kost? Gas!",
    meta2: "Motor 3 roda",
    price: "Rp 150rb",
    img: "/img/move-sm.webp",
    to: "/bossmove",
  },
];

/* ---------- data layanan populer ---------- */
const POPULER = [
  {
    title: "BossMove",
    sub: "paket regular, jarak pendek",
    price: "Rp 220.000",
    img: "/img/mop.jpg",
    to: "/bossmove",
  },
  {
    title: "Pijat Capek",
    sub: "BossGlow · durasi 60 menit",
    price: "Rp 100.000",
    img: "/img/glow.jpg",
    to: "/bossglow",
  },
  {
    title: "Facial Bulanan",
    sub: "BossGlow · durasi 60 menit",
    price: "Rp 120.000",
    img: "/img/facial.webp",
    to: "/bossglow",
  },
];

/* ---------- data iklan ---------- */
const IKLAN = [
  {
    id: "ac-changhong",
    title: "AC 1/2 pk Changhong",
    lines: ["Diskon 15%", "Toko Alibaba · s/d 1 November 2026", "Jl. Teuku Umar, Bojonegoro"],
    img: "/img/toko-alibaba.png",
  },
  {
    id: "imam-syamsudin",
    title: "Dr. Ir. Imam Syamsuddin, SE, MSc",
    lines: ["It's time!", "Muda, Energik, kreatif", "Saatnya perubahan untuk Bojonegoro lebih baik!"],
    img: "/img/imam-syamsudin.webp",
  },
];

const WA_ADS = "6285330048180";

function greeting() {
  const h = new Date().getHours();
  if (h >= 4 && h < 11) return "pagi";
  if (h >= 11 && h < 15) return "siang";
  if (h >= 15 && h < 18) return "sore";
  return "malam";
}

/* ---------- auto-slide carousel (geser kiri tiap 2 detik, pause saat disentuh) ---------- */
function useAutoCarousel(count, delay = 2000) {
  const ref = useRef(null);
  const paused = useRef(false);
  useEffect(() => {
    if (count <= 1) return undefined;
    const id = setInterval(() => {
      const el = ref.current;
      if (!el || paused.current) return;
      const step = el.clientWidth * 0.72;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
      el.scrollTo({ left: atEnd ? 0 : el.scrollLeft + step, behavior: "smooth" });
    }, delay);
    return () => clearInterval(id);
  }, [count, delay]);
  const stop = () => {
    paused.current = true;
  };
  const resume = () => {
    paused.current = false;
  };
  return { ref, stop, resume };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const user = store.getUser() || { name: "Kak" };
  const firstName = user.name?.split(" ")[0] || "Kak";
  const Pin = ICON.pin;
  const Bell = ICON.bell;
  const Chev = ICON.chev;

  // alamat utama disimpan di localStorage setelah user setting alamat
  const primaryAddr = useMemo(() => {
    try {
      const list = JSON.parse(localStorage.getItem("bb_addresses_cache") || "[]");
      return list.find((a) => a.is_primary) || list[0] || null;
    } catch {
      return null;
    }
  }, []);

  const tapUnavailable = (name) =>
    Swal.fire({
      icon: "info",
      title: "Segera Hadir",
      text: `Maaf kak, saat ini layanan ${name} masih belum tersedia di kotamu.`,
      confirmButtonText: "Oke !",
    });

  const pop = useAutoCarousel(POPULER.length);
  const ads = useAutoCarousel(IKLAN.length);

  const waAds = () => {
    const msg = encodeURIComponent("Halo BaikBoss! Saya tertarik untuk pasang iklan..");
    window.open(`https://wa.me/${WA_ADS}?text=${msg}`, "_blank");
  };

  return (
    <div className="page with-nav">
      {/* ---------- hero: greeting + alamat + lonceng ---------- */}
      <div className="hero" style={{ display: "flex", alignItems: "flex-start", gap: 12, paddingBottom: 64 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link to="/alamat" style={{ textDecoration: "none", color: "#fff", display: "block" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, opacity: 0.9 }}>
              <Pin size={14} />
              <span style={{ maxWidth: 250, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {primaryAddr ? primaryAddr.address_text : "Atur alamat kamu"}
              </span>
              <Chev size={13} />
            </div>
          </Link>
          <h1 style={{ marginTop: 8 }}>
            Hi, {firstName} selamat {greeting()}{" "}
            <span aria-hidden style={{ marginLeft: 4, verticalAlign: "middle" }}>
              {greeting() === "malam" ? <ICON.moon size={20} /> : <ICON.sun size={20} />}
            </span>
          </h1>
          <p className="sub">Mau kami bantu apa hari ini?</p>
        </div>
        <Link
          to="/notifikasi"
          aria-label="Notifikasi"
          style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
            display: "grid",
            placeItems: "center",
            color: "#fff",
            flexShrink: 0,
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
                      <img src={s.img} alt={s.name} style={{ width: 56, height: 56, objectFit: "contain" }} />
                    ) : (
                      (() => {
                        const Ico = SERVICE_ICONS[s.key];
                        return Ico ? <Ico size={26} /> : null;
                      })()
                    )}
                  </div>
                  <h3>{s.name}</h3>
                  <p>{s.desc}</p>
                </>
              );
              return s.to ? (
                <button key={s.key} className="svc-card" onClick={() => navigate(s.to)}>
                  {inner}
                </button>
              ) : (
                <button key={s.key} className="svc-card" onClick={() => tapUnavailable(s.name)}>
                  {inner}
                </button>
              );
            })}
          </div>
        </div>

        {/* ---------- carousel promo ---------- */}
        <div className="section-label" style={{ marginTop: 14 }}>
          Promo spesial untukmu
        </div>
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
              <Link key={p.title} to={p.to} style={{ textDecoration: "none", color: "inherit", display: "flex" }}>
                {body}
              </Link>
            ) : (
              <button
                key={p.title}
                onClick={() => tapUnavailable("BossClean")}
                style={{ border: 0, background: "none", padding: 0, cursor: "pointer", display: "flex" }}
              >
                {body}
              </button>
            );
          })}
        </div>

        {/* ---------- layanan populer (auto carousel) ---------- */}
        <div className="section-label" style={{ marginTop: 16 }}>
          Layanan Populer
        </div>
        <div
          className="carousel"
          ref={pop.ref}
          onTouchStart={pop.stop}
          onTouchEnd={pop.resume}
          onMouseDown={pop.stop}
          onMouseUp={pop.resume}
        >
          {POPULER.map((p) => (
            <button
              key={p.title}
              className="card promo-card pop-card"
              onClick={() => (p.to ? navigate(p.to) : tapUnavailable(p.title))}
            >
              <img src={p.img} alt={p.title} />
              <div className="promo-body">
                <h4>{p.title}</h4>
                <div className="meta">{p.sub}</div>
                <div className="price" style={{ color: "var(--purple-700)" }}>
                  {p.price}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* ---------- iklan (auto carousel) ---------- */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 16,
            marginBottom: 2,
          }}
        >
          <div className="section-label" style={{ marginTop: 0 }}>
            Iklan
          </div>
          <button
            onClick={waAds}
            style={{
              border: 0,
              background: "none",
              cursor: "pointer",
              fontSize: 11.5,
              fontWeight: 600,
              color: "var(--purple-700)",
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: 4,
            }}
          >
            <ICON.whatsapp size={13} />
            Contact Ads Agent
          </button>
        </div>
        <div
          className="carousel"
          ref={ads.ref}
          onTouchStart={ads.stop}
          onTouchEnd={ads.resume}
          onMouseDown={ads.stop}
          onMouseUp={ads.resume}
        >
          {IKLAN.map((a) => (
            <div
              key={a.title}
              className="card promo-card ad-card"
              onClick={() => navigate(`/iklan/${a.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") navigate(`/iklan/${a.id}`);
              }}
            >
              <div className="ad-img-wrap">
                <img src={a.img} alt={a.title} />
              </div>
              <div className="promo-body">
                <h4>{a.title}</h4>
                {a.lines.map((l) => (
                  <div key={l} className="meta">
                    {l}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
