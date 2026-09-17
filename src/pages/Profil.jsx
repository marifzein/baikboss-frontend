import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { store, logout, getAddresses } from "../api.js";
import { ICON } from "../icons.jsx";
import Swal from "../swal.js";

export default function Profil() {
  const navigate = useNavigate();
  const user = store.getUser() || {};
  const Chev = ICON.chev;
  const [addrCount, setAddrCount] = useState(null);

  useEffect(() => {
    getAddresses()
      .then((r) => setAddrCount(r.data.length))
      .catch(() => setAddrCount(0));
  }, []);

  const doLogout = async () => {
    try {
      await logout();
    } catch {
      /* token mungkin sudah mati */
    }
    store.clear();
    navigate("/login", { replace: true });
  };

  const MenuItem = ({ icon: Ico, label, onClick, right = null, danger = false }) => (
    <button className={`menu-item${danger ? " danger" : ""}`} onClick={onClick}>
      <span className="mi-ico">
        <Ico size={20} />
      </span>
      <span style={{ flex: 1 }}>{label}</span>
      {right}
      <Chev size={18} className="chev" />
    </button>
  );

  return (
    <div className="page with-nav">
      <div className="hero" style={{ paddingBottom: 64 }}>
        <h1>Profil</h1>
      </div>

      <div className="overlap">
        {/* kartu user */}
        <div className="card" style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <div className="avatar">{(user.name || "?").charAt(0).toUpperCase()}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 16.5 }}>{user.name || "-"}</div>
            <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>{user.phone}</div>
            {user.email && <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{user.email}</div>}
            <div style={{ fontSize: 12, marginTop: 4 }}>Member baikboss</div>
          </div>
          <Chev size={18} className="chev" />
        </div>

        <div className="section-label" style={{ marginTop: 0 }}>
          Akun
        </div>
        <div className="card menu-card">
          <MenuItem
            icon={ICON.pin}
            label="Alamat Tersimpan"
            right={addrCount != null ? <span className="badge">{addrCount}</span> : null}
            onClick={() => navigate("/alamat")}
          />
          <MenuItem
            icon={ICON.wallet}
            label="Saldo Saya"
            onClick={() =>
              Swal.fire({
                icon: "info",
                title: "Segera Hadir",
                text: "Fitur Saldo segera hadir!",
                confirmButtonText: "Oke",
              })
            }
          />
          <MenuItem
            icon={ICON.voucher}
            label="Voucher Saya"
            onClick={() =>
              Swal.fire({
                icon: "info",
                title: "Segera Hadir",
                text: "Fitur Voucher segera hadir!",
                confirmButtonText: "Oke",
              })
            }
          />
          <MenuItem
            icon={ICON.gift}
            label="Referral & Bonus"
            onClick={() =>
              Swal.fire({
                icon: "info",
                title: "Segera Hadir",
                text: "Fitur Referral segera hadir!",
                confirmButtonText: "Oke",
              })
            }
          />
          <MenuItem icon={ICON.bell} label="Notifikasi" onClick={() => navigate("/notifikasi")} />
        </div>

        <div className="section-label">Lainnya</div>
        <div className="card menu-card">
          <MenuItem
            icon={ICON.globe}
            label="Bahasa"
            right={<span className="badge gray">ID</span>}
            onClick={() =>
              Swal.fire({ icon: "info", title: "Bahasa", text: "Bahasa: Indonesia", confirmButtonText: "Oke" })
            }
          />
          <MenuItem
            icon={ICON.shield}
            label="Keamanan & Privasi"
            onClick={() =>
              Swal.fire({
                icon: "success",
                title: "Aman!",
                text: "Data kamu aman dan hanya dipakai untuk layanan baikboss.",
                confirmButtonText: "Oke",
              })
            }
          />
          <MenuItem
            icon={ICON.faq}
            label="Pusat Bantuan"
            onClick={() =>
              Swal.fire({
                icon: "question",
                title: "Pusat Bantuan",
                text: "Hubungi kami di hello@baikboss.id",
                confirmButtonText: "Oke",
              })
            }
          />
          <MenuItem
            icon={ICON.settings}
            label="Pengaturan"
            onClick={() =>
              Swal.fire({
                icon: "info",
                title: "Segera Hadir",
                text: "Pengaturan segera hadir!",
                confirmButtonText: "Oke",
              })
            }
          />
        </div>

        <div style={{ height: 14 }} />
        <div className="card">
          <MenuItem icon={ICON.logout} label="Keluar" danger onClick={doLogout} />
        </div>
      </div>
    </div>
  );
}
