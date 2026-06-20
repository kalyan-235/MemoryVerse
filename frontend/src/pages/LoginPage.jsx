import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { IoMailOutline, IoLockClosedOutline, IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import { useAuth } from '../context/AuthContext';
import '../css/AuthPages.css';

function LoginPage() {
  const location = useLocation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setErrorMessage(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-split-layout">
        {/* Branding Panel */}
        <div className="auth-branding-panel">
          <div className="auth-branding-logo">
            <span className="auth-branding-logo-icon">📖</span>
            <span className="auth-branding-logo-name">MemoryVerse</span>
          </div>
          <p className="auth-branding-tagline">
            Your personal digital universe for memories, diaries, and stories.
          </p>
          <div className="auth-branding-features">
            {[
              { icon: '🗺️', text: 'Interactive Memory Journey Map' },
              { icon: '📅', text: 'Calendar-based Memory View' },
              { icon: '📖', text: 'Private Diary & Story Writing' },
              { icon: '🔒', text: 'Secure & Private by Default' },
            ].map((f) => (
              <div key={f.text} className="auth-branding-feature-item">
                <div className="auth-branding-feature-icon">{f.icon}</div>
                {f.text}
              </div>
            ))}
          </div>
        </div>

        {/* Form Panel */}
        <div className="auth-form-panel">
          <h2 className="auth-form-title">Welcome Back 👋</h2>
          <p className="auth-form-subtitle">Sign in to continue your journey</p>

          {successMessage && (
            <div style={{
              background: 'rgba(100,180,140,0.1)', border: '1px solid #64b48c',
              borderRadius: '10px', padding: '10px 14px', fontSize: '13px',
              color: '#3a8a5a', marginBottom: '16px',
            }}>
              ✓ {successMessage}
            </div>
          )}

          {errorMessage && (
            <div style={{
              background: 'rgba(224, 112, 112, 0.1)',
              border: '1px solid #e07070',
              borderRadius: '10px',
              padding: '10px 14px',
              fontSize: '13px',
              color: '#e07070',
              marginBottom: '16px',
            }}>
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="auth-input-group">
              <label className="auth-input-label" htmlFor="login-email">Email</label>
              <div className="auth-input-wrapper">
                <IoMailOutline className="auth-input-icon" />
                <input
                  id="login-email"
                  type="email"
                  className="auth-input-field"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth-input-group">
              <label className="auth-input-label" htmlFor="login-password">Password</label>
              <div className="auth-input-wrapper">
                <IoLockClosedOutline className="auth-input-icon" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input-field"
                  placeholder="Your password"
                  value={formData.password}
                  onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-input-eye-toggle"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                </button>
              </div>
            </div>

            <Link to="/forgot-password" className="auth-forgot-password-link">
              Forgot password?
            </Link>

            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="auth-link-row">
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
