import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoPersonOutline, IoMailOutline, IoLockClosedOutline,
         IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import { useAuth } from '../context/AuthContext';
import '../css/AuthPages.css';

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (formData.password.length < 8) {
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }
    setIsLoading(true);
    try {
      const data = await register(formData.name, formData.email, formData.password);
      navigate('/verify-otp', {
        state: {
          email: formData.email,
          // devOtp is only present in development — pre-fills the OTP input for easy testing
          devOtp: data?.devOtp,
        },
      });
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field) => (e) =>
    setFormData((p) => ({ ...p, [field]: e.target.value }));

  return (
    <div className="auth-page-wrapper">
      <div className="auth-split-layout">
        {/* Branding */}
        <div className="auth-branding-panel">
          <div className="auth-branding-logo">
            <span className="auth-branding-logo-icon">📖</span>
            <span className="auth-branding-logo-name">MemoryVerse</span>
          </div>
          <p className="auth-branding-tagline">
            Start preserving your life's most precious moments.
          </p>
          <div className="auth-branding-features">
            {[
              { icon: '✨', text: 'Beautiful Memory Journey Map' },
              { icon: '🗓️', text: 'Calendar-based Memory Explorer' },
              { icon: '📝', text: 'Private Diary & Story Studio' },
              { icon: '☁️', text: 'Cloud Storage via Cloudinary' },
            ].map((f) => (
              <div key={f.text} className="auth-branding-feature-item">
                <div className="auth-branding-feature-icon">{f.icon}</div>
                {f.text}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="auth-form-panel">
          <h2 className="auth-form-title">Create Your Account ✨</h2>
          <p className="auth-form-subtitle">Begin your memory journey today</p>

          {errorMessage && (
            <div style={{
              background: 'rgba(224,112,112,0.1)',
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
            {/* Name */}
            <div className="auth-input-group">
              <label className="auth-input-label" htmlFor="register-name">Full Name</label>
              <div className="auth-input-wrapper">
                <IoPersonOutline className="auth-input-icon" />
                <input
                  id="register-name"
                  type="text"
                  className="auth-input-field"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={updateField('name')}
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email */}
            <div className="auth-input-group">
              <label className="auth-input-label" htmlFor="register-email">Email</label>
              <div className="auth-input-wrapper">
                <IoMailOutline className="auth-input-icon" />
                <input
                  id="register-email"
                  type="email"
                  className="auth-input-field"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={updateField('email')}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth-input-group">
              <label className="auth-input-label" htmlFor="register-password">Password</label>
              <div className="auth-input-wrapper">
                <IoLockClosedOutline className="auth-input-icon" />
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input-field"
                  placeholder="Min 8 characters"
                  value={formData.password}
                  onChange={updateField('password')}
                  required
                  autoComplete="new-password"
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

            {/* Confirm Password */}
            <div className="auth-input-group">
              <label className="auth-input-label" htmlFor="register-confirm">Confirm Password</label>
              <div className="auth-input-wrapper">
                <IoLockClosedOutline className="auth-input-icon" />
                <input
                  id="register-confirm"
                  type="password"
                  className="auth-input-field"
                  placeholder="Repeat your password"
                  value={formData.confirmPassword}
                  onChange={updateField('confirmPassword')}
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create My Account'}
            </button>
          </form>

          <p className="auth-link-row">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
