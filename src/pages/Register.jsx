import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register, store } from '../api.js';
import { ICON } from '../icons.jsx';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const User = ICON.user;
  const Phone = ICON.phone;
  const Mail = ICON.user;
  const Lock = ICON.shield;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const res = await register({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        password: form.password,
      });
      store.setSession(res.token, res.data);
      navigate('/', { replace: true });
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ paddingBottom: 24 }}>
      <div className="auth-wrap">
        <div className="auth-hero" style={{ paddingTop: 34, paddingBottom: 70 }}>
          <div className="logo">baikboss!</div>
          <div className="tag">Daftar sekali, semua layanan jadi gampang.</div>
        </div>

        <div className="overlap">
          <div className="card">
            <h2 style={{ margin: '2px 0 4px', fontSize: 20, fontWeight: 600 }}>Daftar</h2>
            <p style={{ margin: '0 0 18px', fontSize: 13, color: 'var(--muted)' }}>
              Isi data kamu — cepat dan gratis.
            </p>

            {err && <div className="err-banner">{err}</div>}

            <form onSubmit={submit}>
              <div className="field">
                <label>Nama Lengkap <span className="req">*</span></label>
                <div className="input-wrap">
                  <User size={18} />
                  <input placeholder="Nama sesuai identitas" value={form.name} onChange={set('name')} required />
                </div>
              </div>

              <div className="field">
                <label>No. HP <span className="req">*</span></label>
                <div className="input-wrap">
                  <Phone size={18} />
                  <input
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    value={form.phone}
                    onChange={set('phone')}
                    pattern="08[0-9]{7,13}"
                    title="Format: 08xxxxxxxxxx"
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label>Email</label>
                <div className="input-wrap">
                  <Mail size={18} />
                  <input type="email" placeholder="email@contoh.com (opsional)" value={form.email} onChange={set('email')} />
                </div>
              </div>

              <div className="field">
                <label>Password <span className="req">*</span></label>
                <div className="input-wrap">
                  <Lock size={18} />
                  <input
                    type="password"
                    placeholder="Minimal 6 karakter"
                    value={form.password}
                    onChange={set('password')}
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <button className="btn" type="submit" disabled={loading} style={{ marginTop: 6 }}>
                {loading ? 'Menyimpan…' : 'Daftar Sekarang'}
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: 13.5, marginTop: 18, marginBottom: 0, color: 'var(--muted)' }}>
              Sudah punya akun?{' '}
              <Link to="/login" style={{ color: 'var(--purple-700)', fontWeight: 600, textDecoration: 'none' }}>
                Masuk
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
