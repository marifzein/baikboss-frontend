const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

async function req(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    ...options,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = json?.message || Object.values(json?.errors || {})[0]?.[0] || "Terjadi kesalahan, coba lagi.";
    throw new Error(msg);
  }
  return json;
}

export const getLayanan = () => req("/layanan");
export const getBarang = () => req("/barang");
export const getTarif = () => req("/tarif");
export const getProvinsi = () => req("/wilayah/provinsi");
export const getKota = (pid) => req(`/wilayah/kota/${pid}`);
export const getKecamatan = (kid) => req(`/wilayah/kecamatan/${kid}`);
export const getRekening = () => req("/rekening");
export const getFaq = () => req("/faq");
export const postQuote = (payload) => req("/quote", { method: "POST", body: JSON.stringify(payload) });
export const postOrder = (payload) => req("/orders", { method: "POST", body: JSON.stringify(payload) });
export const postPay = (code, wa, bank) =>
  req(`/orders/${code}/pay`, {
    method: "POST",
    body: JSON.stringify({ wa, bank_name: bank }),
  });

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
