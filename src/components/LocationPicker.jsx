import { useEffect, useState } from 'react';
import MapPicker from '../MapPicker.jsx';
import { ICON } from '../icons.jsx';
import { getUserLocation, reverseGeocode } from '../api.js';

/**
 * Pemilih lokasi: deteksi otomatis posisi (GPS) atau pin di peta.
 * value: { lat, lng, text } — onChangeText dipanggil setelah reverse geocode.
 */
export default function LocationPicker({ value, onChange }) {
  const [locating, setLocating] = useState(false);
  const [err, setErr] = useState('');
  const Pin = ICON.pin;
  const Gps = ICON.gps;

  // reverse geocode tiap pin berubah
  useEffect(() => {
    if (!value.lat || !value.lng) return;
    let alive = true;
    reverseGeocode(value.lat, value.lng).then((text) => {
      if (alive && text && text !== value.text) onChange({ ...value, text });
    });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.lat, value.lng]);

  const detect = async () => {
    setErr('');
    setLocating(true);
    try {
      const { lat, lng } = await getUserLocation();
      onChange({ ...value, lat, lng });
    } catch (e) {
      setErr(e.message);
    } finally {
      setLocating(false);
    }
  };

  return (
    <div>
      <div className="pin-box" style={{ marginBottom: 10 }}>
        <div className="pb-ico"><Pin size={20} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="pb-title">{value.lat ? 'Pin tersimpan' : 'Belum ada pin'}</div>
          <div className="pb-text">{value.text || 'Pin lokasi di peta atau deteksi otomatis.'}</div>
          {value.lat != null && (
            <div className="pb-coord">{Number(value.lat).toFixed(6)}, {Number(value.lng).toFixed(6)}</div>
          )}
        </div>
      </div>
      <button type="button" className="btn outline small" onClick={detect} disabled={locating} style={{ marginBottom: 10 }}>
        <Gps size={15} /> {locating ? 'Mendeteksi…' : 'Deteksi lokasi saya (GPS)'}
      </button>
      {err && <div className="err-banner">{err}</div>}
      <MapPicker
        lat={value.lat}
        lng={value.lng}
        onPick={(lat, lng) => onChange({ ...value, lat, lng })}
        height={210}
      />
    </div>
  );
}
