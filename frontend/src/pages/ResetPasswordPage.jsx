import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IoLockClosedOutline, IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import { authApi } from '../apis/authApi';
import '../css/AuthPages.css';

function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { email, otp } = location.state || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    setIsLoading(true);
    try {
      await authApi.resetPassword(email, otp, newPassword);
      navigate('/login', { state: { message: 'Password reset successfully! Please sign in.' } });
    } catch (err) {
      setErrorMessage(err.message || 'Failed to reset password.');
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
            Create a new strong password to protect your memories.
          </p>
        </div>

        <div className="auth-form-panel">
          <h2 className="auth-form-title">🔐 New Password</h2>
          <p className="auth-form-subtitle">Choose a strong password for your account</p>

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
            <div className="auth-input-group">
              <label className="auth-input-label" htmlFor="new-password">New Password</label>
              <div className="auth-input-wrapper">
                <IoLockClosedOutline className="auth-input-icon" />
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input-field"
                  placeholder="Min 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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

            <div className="auth-input-group">
              <label className="auth-input-label" htmlFor="confirm-new-password">
                Confirm New Password
              </label>
              <div className="auth-input-wrapper">
                <IoLockClosedOutline className="auth-input-icon" />
                <input
                  id="confirm-new-password"
                  type="password"
                  className="auth-input-field"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
