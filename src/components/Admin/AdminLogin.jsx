import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GridScan from '../GridScan/GridScan';
import octalLogo from '../../assets/img/octal-logo-withText.png';
import { apiUrl } from '../../lib/api';
import './AdminLogin.css';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/admin/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed.');
      localStorage.setItem('admin_token', data.token);
      /* Tells the dashboard this arrival is a fresh sign-in, so it shows the
         credential card once rather than on every visit to /admin. */
      sessionStorage.setItem('admin_show_pass', '1');
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login__bg" aria-hidden="true">
        <GridScan
          sensitivity={0.55}
          lineThickness={1}
          linesColor="#2b3a2e"
          gridScale={0.1}
          scanColor="#59a14a"
          scanOpacity={0.45}
          scanDuration={2.4}
          scanDelay={1.6}
          enablePost
          bloomIntensity={0.6}
          chromaticAberration={0.002}
          noiseIntensity={0.01}
        />
      </div>
      <div className="admin-login__veil" aria-hidden="true" />

      <div className="admin-login__card">
        <button type="button" className="admin-login__logo" onClick={() => navigate('/')}>
          <img src={octalLogo} alt="Octal Philippines Inc." className="admin-login__logo-img" />
        </button>
        <h1 className="admin-login__title">Admin Access</h1>
        <p className="admin-login__subtitle">Sign in with your admin account to continue</p>

        <form className="admin-login__form" onSubmit={handleSubmit}>
          <div className="admin-login__field">
            <label htmlFor="email" className="admin-login__label">Email</label>
            <input
              id="email"
              type="email"
              className="admin-login__input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@octaltech.net"
              autoComplete="username"
              required
              autoFocus
            />
          </div>

          <div className="admin-login__field">
            <label htmlFor="password" className="admin-login__label">Password</label>
            <input
              id="password"
              type="password"
              className="admin-login__input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className="admin-login__error">{error}</p>}

          <button type="submit" className="admin-login__btn" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <button type="button" className="admin-login__back" onClick={() => navigate('/')}>
          ← Back to website
        </button>
      </div>
    </div>
  );
}
