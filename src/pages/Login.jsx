import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, store } from '../api.js';
import { ICON } from '../icons.jsx';

export default function Login() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const Mail = ICON.user;
  const Lock = ICON.shield;

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const res = await login(identifier.trim(), password);
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
        <div className="auth-hero">
          <div className="logo">baikboss!</div>
          <div className="tag">Solusi harian rumah tangga — pindahan, glow, bersih, dan perbaikan.</div>
        </div>

        <div className="overlap">
          <div className="card">
            <h2 style={{ margin: '2px 0 4px', fontSize: 20, fontWeight: 600 }}>Masuk</h2>
            <p style={{ margin: '0 0 18px', fontSize: 13, color: 'var(--muted)' }}>
              Selamat datang kembali! Masuk dengan email/no HP kamu.
            </p>

            {err && <div className="err-banner">{err}</div>}

            <form onSubmit={submit}>
              <div className="field">
                <label>Email / No. HP</label>
                <div className="input-wrap">
                  <Mail size={18} />
                  <input
                    type="text"
                    placeholder="email@contoh.com atau 08xxxxxxxxxx"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label>Password</label>
                <div className="input-wrap">
                  <Lock size={18} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Password kamu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    style={{ background: 'none', border: 0, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: 'var(--purple-700)' }}
                  >
                    {showPass ? 'Sembunyi' : 'Lihat'}
                  </button>
                </div>
              </div>

              <button className="btn" type="submit" disabled={loading} style={{ marginTop: 6 }}>
                {loading ? 'Memproses…' : 'Masuk'}
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: 13.5, marginTop: 18, marginBottom: 0, color: 'var(--muted)' }}>
              Belum punya akun?{' '}
              <Link to="/register" style={{ color: 'var(--purple-700)', fontWeight: 600, textDecoration: 'none' }}>
                Daftar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
