const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const TOKEN_KEY = "bb_token";
const USER_KEY = "bb_user";

export const store = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  getUser: () => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
  },
  setSession: (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  setUser: (user) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

async function req(path, options = {}) {
  const headers = { "Content-Type": "application/json", Accept: "application/json", ...options.headers };
  const token = store.getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });
  const json = await res.json().catch(() => ({}));

  if (res.status === 401) {
    store.clear();
    // biarkan komponen menangani pesan; App akan redirect ke login
  }
  if (!res.ok) {
    const msg = json?.message || Object.values(json?.errors || {})[0]?.[0] || "Terjadi kesalahan, coba lagi.";
    throw new Error(msg);
  }
  return json;
}

/* ---------- auth ---------- */
export const register = (payload) => req("/auth/register", { method: "POST", body: JSON.stringify(payload) });
export const login = (identifier, password) =>
  req("/auth/login", { method: "POST", body: JSON.stringify({ identifier, password }) });
export const logout = () => req("/auth/logout", { method: "POST" });
export const getMe = () => req("/me");

/* ---------- alamat tersimpan ---------- */
export const getAddresses = () => req("/addresses");
export const createAddress = (payload) => req("/addresses", { method: "POST", body: JSON.stringify(payload) });
export const updateAddress = (id, payload) => req(`/addresses/${id}`, { method: "PUT", body: JSON.stringify(payload) });
export const deleteAddress = (id) => req(`/addresses/${id}`, { method: "DELETE" });

/* ---------- BossGlow ---------- */
export const getGlowServices = () => req("/glow/services");
export const getTherapists = (gender) => req(`/glow/therapists${gender ? `?gender=${gender}` : ""}`);
export const postGlowBooking = (payload) => req("/glow/bookings", { method: "POST", body: JSON.stringify(payload) });
export const getGlowBookings = () => req("/glow/bookings");
export const getGlowBooking = (code) => req(`/glow/bookings/${code}`);

/* ---------- BossMove (pindahan) ---------- */
export const getBarang = () => req("/barang");
export const getTarif = () => req("/tarif");
export const getProvinsi = () => req("/wilayah/provinsi");
export const getKota = (pid) => req(`/wilayah/kota/${pid}`);
export const getKecamatan = (kid) => req(`/wilayah/kecamatan/${kid}`);
export const postQuote = (payload) => req("/quote", { method: "POST", body: JSON.stringify(payload) });
export const postOrder = (payload) => req("/orders", { method: "POST", body: JSON.stringify(payload) });
export const getMyOrders = () => req("/my-orders");

/* ---------- master ---------- */
export const getRekening = () => req("/rekening");

/* ---------- helpers ---------- */
export const rupiah = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");

export async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=17&accept-language=id`,
    );
    const json = await res.json();
    return json?.display_name || `${lat}, ${lng}`;
  } catch {
    return `${lat}, ${lng}`;
  }
}

export function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Perangkat tidak mendukung GPS."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => reject(new Error("Izin lokasi ditolak. Pin lokasi di peta saja ya.")),
      { enableHighAccuracy: true, timeout: 12000 },
    );
  });
}
