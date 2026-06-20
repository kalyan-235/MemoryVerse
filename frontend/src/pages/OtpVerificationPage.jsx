import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { IoArrowBackOutline } from 'react-icons/io5';
import { authApi } from '../apis/authApi';
import '../css/AuthPages.css';

const OTP_LENGTH = 6;

function OtpVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const email   = location.state?.email   || '';
  const mode    = location.state?.mode    || 'verify'; // 'verify' | 'reset'
  const devOtp  = location.state?.devOtp  || '';       // auto-filled in development

  const [otpDigits, setOtpDigits] = useState(
    devOtp ? devOtp.split('') : Array(OTP_LENGTH).fill('')
  );
  const [isLoading, setIsLoading]         = useState(false);
  const [errorMessage, setErrorMessage]   = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resendCountdown, setResendCountdown] = useState(60);
  const inputRefs = useRef([]);

  // Redirect away if no email provided
  useEffect(() => {
    if (!email) navigate('/register');
  }, [email, navigate]);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  // Focus first empty input on mount
  useEffect(() => {
    if (!devOtp) {
      inputRefs.current[0]?.focus();
    }
  }, [devOtp]);

  const handleDigitChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const updated = [...otpDigits];
    updated[index] = value;
    setOtpDigits(updated);
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const updated = [...otpDigits];
      updated[index - 1] = '';
      setOtpDigits(updated);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (pasted.length === OTP_LENGTH) {
      setOtpDigits(pasted.split(''));
      inputRefs.current[OTP_LENGTH - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otp = otpDigits.join('');
    if (otp.length < OTP_LENGTH) {
      setErrorMessage('Please enter all 6 digits.');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    try {
      if (mode === 'reset') {
        await authApi.verifyResetOtp(email, otp);
        navigate('/reset-password', { state: { email, otp } });
      } else {
        await authApi.verifyEmailOtp(email, otp);
        setSuccessMessage('Email verified! Redirecting to login...');
        setTimeout(() => navigate('/login', {
          state: { message: 'Account verified! Please sign in.' }
        }), 1500);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Invalid or expired OTP. Please try again.');
      // Clear digits on wrong OTP
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCountdown > 0) return;
    setErrorMessage('');
    try {
      const data = await authApi.resendOtp(email);
      setResendCountdown(60);
      setSuccessMessage('New OTP sent to your email.');
      setTimeout(() => setSuccessMessage(''), 3000);
      // Auto-fill in dev mode
      if (data?.devOtp) {
        setOtpDigits(data.devOtp.split(''));
      }
    } catch {
      setErrorMessage('Failed to resend OTP. Please try again.');
    }
  };

  const allFilled = otpDigits.every((d) => d !== '');

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
            {mode === 'reset'
              ? 'Enter your password reset code to continue.'
              : 'One step away from your memory journey!'}
          </p>
          {devOtp && (
            <div style={{
              marginTop: '20px', background: 'rgba(255,255,255,0.15)',
              borderRadius: '12px', padding: '14px 16px',
            }}>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px',
                textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                DEV MODE — OTP
              </p>
              <p style={{ color: '#fff', fontSize: '24px', fontWeight: '700',
                letterSpacing: '8px' }}>
                {devOtp}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', marginTop: '4px' }}>
                Auto-filled above. This only shows in development.
              </p>
            </div>
          )}
        </div>

        {/* Form Panel */}
        <div className="auth-form-panel">
          <Link
            to={mode === 'reset' ? '/forgot-password' : '/register'}
            style={{ display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '13px', color: '#9b8ec4', marginBottom: '20px',
              textDecoration: 'none' }}
          >
            <IoArrowBackOutline /> Back
          </Link>

          <h2 className="auth-form-title">
            {mode === 'reset' ? '🔑 Reset Code' : '✉️ Verify Your Email'}
          </h2>
          <p className="auth-form-subtitle">
            We sent a 6-digit code to{' '}
            <strong style={{ color: '#3d2c1e' }}>{email}</strong>
          </p>

          {/* Error */}
          {errorMessage && (
            <div style={{
              background: 'rgba(224,112,112,0.1)', border: '1px solid #e07070',
              borderRadius: '10px', padding: '10px 14px', fontSize: '13px',
              color: '#e07070', marginBottom: '12px',
            }}>
              {errorMessage}
            </div>
          )}

          {/* Success */}
          {successMessage && (
            <div style={{
              background: 'rgba(100,180,140,0.1)', border: '1px solid #64b48c',
              borderRadius: '10px', padding: '10px 14px', fontSize: '13px',
              color: '#3a8a5a', marginBottom: '12px',
            }}>
              ✓ {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* OTP Digit Inputs */}
            <div className="otp-inputs-row" onPaste={handlePaste} aria-label="OTP input">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="otp-single-input"
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  aria-label={`OTP digit ${idx + 1}`}
                  autoComplete="off"
                />
              ))}
            </div>

            {/* Resend */}
            <div className="otp-resend-row">
              {resendCountdown > 0
                ? `Resend code in ${resendCountdown}s`
                : (
                  <>
                    Didn't receive it?{' '}
                    <button type="button" className="otp-resend-btn" onClick={handleResend}>
                      Resend OTP
                    </button>
                  </>
                )}
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={isLoading || !allFilled}
              style={{ marginTop: '16px' }}
            >
              {isLoading ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default OtpVerificationPage;
