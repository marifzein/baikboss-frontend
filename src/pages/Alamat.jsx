import { useEffect, useState } from 'react';
import PageHead from '../components/PageHead.jsx';
import LocationPicker from '../components/LocationPicker.jsx';
import Toggle from '../components/Toggle.jsx';
import { getAddresses, createAddress, updateAddress, deleteAddress, store } from '../api.js';
import { ICON } from '../icons.jsx';

const LABELS = ['Rumah', 'Kantor', 'Kos', 'Apartemen', 'Lainnya'];

const EMPTY_FORM = {
  label: 'Rumah',
  recipient: '',
  phone: '',
  address_text: '',
  lat: null,
  lng: null,
  is_primary: false,
};

export default function Alamat() {
  const user = store.getUser() || {};

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('list'); // list | form
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);
  const Chev = ICON.chev;

  const refresh = () =>
    getAddresses()
      .then((r) => {
        setList(r.data || []);
        try {
          localStorage.setItem('bb_addresses_cache', JSON.stringify(r.data || []));
        } catch { /* ignore */ }
      })
      .finally(() => setLoading(false));

  useEffect(() => {
    refresh();
  }, []);

  const openAdd = () => {
    setForm({
      ...EMPTY_FORM,
      recipient: user.name || '',
      phone: user.phone || '',
    });
    setEditId(null);
    setErr('');
    setMode('form');
  };

  const openEdit = (a) => {
    setForm({
      label: a.label,
      recipient: a.recipient,
      phone: a.phone,
      address_text: a.address_text,
      lat: a.lat,
      lng: a.lng,
      is_primary: a.is_primary,
    });
    setEditId(a.id);
    setErr('');
    setMode('form');
  };

  const save = async () => {
    setErr('');
    if (!form.recipient.trim()) return setErr('Isi nama penerima.');
    if (!/^08[0-9]{7,13}$/.test(form.phone.trim())) return setErr('No. HP harus format 08xxxxxxxxxx.');
    if (!form.address_text.trim()) return setErr('Isi detail alamat.');

    setSaving(true);
    try {
      const payload = { ...form, phone: form.phone.trim(), address_text: form.address_text.trim() };
      if (editId) await updateAddress(editId, payload);
      else await createAddress(payload);
      await refresh();
      setMode('list');
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm('Hapus alamat ini?')) return;
    await deleteAddress(id);
    refresh();
  };

  /* ------------------------- FORM ------------------------- */
  if (mode === 'form') {
    return (
      <div className="page">
        <PageHead title={editId ? 'Edit Alamat' : 'Tambah Alamat'} onBack={() => setMode('list')} />
        <div className="content">
          {err && <div className="err-banner">{err}</div>}

          <div className="field">
            <label>Label</label>
            <div className="chips">
              {LABELS.map((l) => (
                <button key={l} className={`chip${form.label === l ? ' active' : ''}`} onClick={() => setForm((f) => ({ ...f, label: l }))}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Nama Penerima <span className="req">*</span></label>
            <div className="input-wrap">
              <ICON.user size={18} />
              <input placeholder="Nama yang menerima tenaga layanan" value={form.recipient} onChange={(e) => setForm((f) => ({ ...f, recipient: e.target.value }))} />
            </div>
          </div>

          <div className="field">
            <label>Nomor HP <span className="req">*</span></label>
            <div className="input-wrap">
              <ICON.phone size={18} />
              <input type="tel" placeholder="08xxxxxxxxxx" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
          </div>

          <div className="field">
            <label>Lokasi <span className="req">*</span></label>
            <LocationPicker
              value={{ lat: form.lat, lng: form.lng, text: form.address_text }}
              onChange={(v) => setForm((f) => ({ ...f, lat: v.lat, lng: v.lng, address_text: v.text || f.address_text }))}
            />
          </div>

          <div className="field">
            <label>Detail Alamat <span className="req">*</span></label>
            <div className="input-wrap">
              <textarea
                placeholder="Wajib: patokan, blok, no. rumah, lantai, kode pintu, dll"
                value={form.address_text}
                onChange={(e) => setForm((f) => ({ ...f, address_text: e.target.value }))}
              />
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
              Tenaga layanan butuh detail spesifik, bukan cuma GPS — biar tidak kesasar.
            </div>
          </div>

          <div className="card" style={{ padding: 0, marginBottom: 16 }}>
            <Toggle
              checked={form.is_primary}
              onChange={(v) => setForm((f) => ({ ...f, is_primary: v }))}
              label="Jadikan alamat utama"
              sub="Otomatis terpilih saat pesan"
            />
          </div>

          <button className="btn" onClick={save} disabled={saving}>
            {saving ? 'Menyimpan…' : 'Simpan Alamat'}
          </button>
        </div>
      </div>
    );
  }

  /* ------------------------- LIST ------------------------- */
  return (
    <div className="page">
      <PageHead title="Setting Alamat" />
      <div className="content">
        {loading && <div style={{ color: 'var(--muted)', padding: 20, textAlign: 'center' }}>Memuat…</div>}

        {!loading && list.length === 0 && (
          <div className="empty">
            <ICON.pin size={44} />
            <h4>Belum ada alamat tersimpan</h4>
            <p>Tambahkan alamat biar pemesanan makin cepat — nggak perlu ketik ulang tiap kali pesan.</p>
          </div>
        )}

        {list.map((a) => (
          <div key={a.id} className={`addr-card${a.is_primary ? ' primary' : ''}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span className="badge">{a.label}</span>
              {a.is_primary && <span className="badge green">Utama</span>}
            </div>
            <div style={{ fontWeight: 700, fontSize: 14.5 }}>{a.recipient} · {a.phone}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 3, lineHeight: 1.5 }}>{a.address_text}</div>
            <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
              <button className="btn outline small" onClick={() => openEdit(a)}>
                <ICON.pencil size={14} /> Edit
              </button>
              <button className="btn outline small" onClick={() => remove(a.id)} style={{ color: 'var(--danger)', borderColor: '#fecaca' }}>
                <ICON.trash size={14} /> Hapus
              </button>
            </div>
          </div>
        ))}

        <button className="btn outline" onClick={openAdd}>
          <ICON.plus size={16} /> Tambah Alamat
        </button>
      </div>
    </div>
  );
}
