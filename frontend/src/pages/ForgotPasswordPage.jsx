import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoMailOutline, IoArrowBackOutline } from 'react-icons/io5';
import { authApi } from '../apis/authApi';
import '../css/AuthPages.css';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    try {
      await authApi.forgotPassword(email);
      setMessage('We sent a reset OTP to your email. Please check your inbox.');
      setIsError(false);
      setTimeout(() => navigate('/verify-otp', { state: { email, mode: 'reset' } }), 2000);
    } catch (err) {
      setMessage(err.message || 'Something went wrong. Please try again.');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-split-layout">
        <div className="auth-branding-panel">
          <div className="auth-branding-logo">
            <span className="auth-branding-logo-icon">📖</span>
            <span className="auth-branding-logo-name">MemoryVerse</span>
          </div>
          <p className="auth-branding-tagline">
            Don't worry — we'll help you get back to your memories.
          </p>
        </div>

        <div className="auth-form-panel">
          <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '13px', color: '#9b8ec4', marginBottom: '20px', textDecoration: 'none' }}>
            <IoArrowBackOutline /> Back to login
          </Link>

          <h2 className="auth-form-title">Forgot Password?</h2>
          <p className="auth-form-subtitle">
            Enter your email and we'll send you a reset code.
          </p>

          {message && (
            <div style={{
              background: isError ? 'rgba(224,112,112,0.1)' : 'rgba(100,180,140,0.1)',
              border: `1px solid ${isError ? '#e07070' : '#64b48c'}`,
              borderRadius: '10px',
              padding: '10px 14px',
              fontSize: '13px',
              color: isError ? '#e07070' : '#3a8a5a',
              marginBottom: '16px',
            }}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="auth-input-group">
              <label className="auth-input-label" htmlFor="forgot-email">
                Your Email Address
              </label>
              <div className="auth-input-wrapper">
                <IoMailOutline className="auth-input-icon" />
                <input
                  id="forgot-email"
                  type="email"
                  className="auth-input-field"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
