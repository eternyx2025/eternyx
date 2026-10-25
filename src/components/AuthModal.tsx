'use client';

import React, { useState, useEffect } from 'react';
import { useCustomerAuth, AuthModalTab } from '@/context/CustomerAuthContext';

export default function AuthModal() {
  const {
    isAuthModalOpen,
    authModalTab,
    openAuthModal,
    closeAuthModal,
    loginWithPassword,
    sendLoginOtp,
    verifyLoginOtp,
    sendForgotOtp,
    resetPassword,
    register,
  } = useCustomerAuth();

  // Mode states: 'password' | 'otp' | 'register' | 'forgot'
  const [activeTab, setActiveTab] = useState<AuthModalTab>('login');
  const [otpSent, setOtpSent] = useState(false);
  const [forgotOtpSent, setForgotOtpSent] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Sync internal activeTab with context
  useEffect(() => {
    setActiveTab(authModalTab);
    setError('');
    setSuccessMsg('');
    setOtpSent(false);
    setForgotOtpSent(false);
  }, [authModalTab, isAuthModalOpen]);

  // Handle ESC key and scroll lock
  useEffect(() => {
    if (isAuthModalOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') closeAuthModal();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isAuthModalOpen, closeAuthModal]);

  // Resend cooldown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  if (!isAuthModalOpen) return null;

  // Handlers
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await loginWithPassword(email, password);
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Authentication failed.');
    }
  };

  const handleSendLoginOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    setError('');
    setLoading(true);
    const result = await sendLoginOtp(email);
    setLoading(false);
    if (result.success) {
      setOtpSent(true);
      setCountdown(45);
      setSuccessMsg(`We dispatched a 6-digit code to ${email}. Check your inbox.`);
    } else {
      setError(result.error || 'Failed to dispatch code.');
    }
  };

  const handleVerifyLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    setError('');
    setLoading(true);
    const result = await verifyLoginOtp(email, otpCode);
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Invalid code.');
    }
  };

  const handleSendForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    setError('');
    setLoading(true);
    const result = await sendForgotOtp(email);
    setLoading(false);
    if (result.success) {
      setForgotOtpSent(true);
      setCountdown(45);
      setSuccessMsg(`Password reset code dispatched to ${email}.`);
    } else {
      setError(result.error || 'Account not found or error sending code.');
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setLoading(true);
    const result = await resetPassword(email, otpCode, newPassword);
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Failed to reset password.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !password) {
      setError('All fields are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setLoading(true);
    const result = await register(name, email, phone, password);
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Registration failed.');
    }
  };

  return (
    <div className="auth-modal-backdrop" onClick={closeAuthModal}>
      <div className="auth-modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="auth-close-btn" onClick={closeAuthModal} aria-label="Close modal">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Brand Header */}
        <div className="auth-header">
          <span className="auth-seal">HAUTE PARFUMERIE</span>
          <h2 className="auth-logo">ETERNYX</h2>
          <p className="auth-subtitle">CLIENT PRIVILEGE &amp; CONCIERGE</p>
        </div>

        {/* Tabs */}
        {activeTab !== 'forgot' && (
          <div className="auth-tabs">
            <button
              className={`auth-tab ${activeTab === 'login' || activeTab === 'otp' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('login');
                setError('');
                setSuccessMsg('');
              }}
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('register');
                setError('');
                setSuccessMsg('');
              }}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Alerts */}
        {error && <div className="auth-alert error">{error}</div>}
        {successMsg && <div className="auth-alert success">{successMsg}</div>}

        {/* ================= 1. PASSWORD SIGN IN ================= */}
        {activeTab === 'login' && (
          <form onSubmit={handlePasswordLogin} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="form-group">
              <div className="label-row">
                <label>Password</label>
                <button
                  type="button"
                  className="link-subtle"
                  onClick={() => {
                    setActiveTab('forgot');
                    setError('');
                    setSuccessMsg('');
                  }}
                >
                  Forgot Password?
                </button>
              </div>
              <div className="input-password-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="eye-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-gold-submit" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In with Password'}
            </button>

            <div className="auth-divider">
              <span>OR</span>
            </div>

            <button
              type="button"
              className="btn-ghost-secondary"
              onClick={() => {
                setActiveTab('otp');
                setError('');
                setSuccessMsg('');
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ marginRight: '8px' }}>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              Sign In with Email OTP (Instant &amp; Free)
            </button>
            <p className="auth-hint">Recommended if you ordered as a guest or do not remember your password.</p>
          </form>
        )}

        {/* ================= 2. EMAIL OTP SIGN IN ================= */}
        {activeTab === 'otp' && (
          <form onSubmit={otpSent ? handleVerifyLoginOtp : handleSendLoginOtp} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={otpSent && loading}
                autoFocus
              />
            </div>

            {otpSent && (
              <div className="form-group">
                <div className="label-row">
                  <label>6-Digit Verification Code</label>
                  <button
                    type="button"
                    className="link-subtle"
                    disabled={countdown > 0 || loading}
                    onClick={() => handleSendLoginOtp()}
                  >
                    {countdown > 0 ? `Resend code (${countdown}s)` : 'Resend Code'}
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="otp-input-code"
                  required
                  autoFocus
                />
              </div>
            )}

            <button type="submit" className="btn-gold-submit" disabled={loading}>
              {loading
                ? 'Processing...'
                : otpSent
                ? 'Verify Code & Sign In'
                : 'Send 6-Digit Login Code'}
            </button>

            <button
              type="button"
              className="btn-link-back"
              onClick={() => {
                setActiveTab('login');
                setError('');
                setSuccessMsg('');
                setOtpSent(false);
              }}
            >
              ← Back to Password Login
            </button>
          </form>
        )}

        {/* ================= 3. FORGOT PASSWORD ================= */}
        {activeTab === 'forgot' && (
          <form onSubmit={forgotOtpSent ? handleResetPasswordSubmit : handleSendForgotOtp} className="auth-form">
            <h3 className="section-title">Reset Your Password</h3>
            <p className="section-desc">
              Enter your registered email address. We will verify your account and send a 6-digit reset code.
            </p>

            <div className="form-group">
              <label>Registered Email</label>
              <input
                type="email"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={forgotOtpSent}
                autoFocus
              />
            </div>

            {forgotOtpSent && (
              <>
                <div className="form-group">
                  <div className="label-row">
                    <label>6-Digit Reset Code</label>
                    <button
                      type="button"
                      className="link-subtle"
                      disabled={countdown > 0 || loading}
                      onClick={handleSendForgotOtp}
                    >
                      {countdown > 0 ? `Resend (${countdown}s)` : 'Resend Code'}
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="otp-input-code"
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label>New Password (min 6 characters)</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </>
            )}

            <button type="submit" className="btn-gold-submit" disabled={loading}>
              {loading
                ? 'Processing...'
                : forgotOtpSent
                ? 'Save New Password & Sign In'
                : 'Send Reset Code'}
            </button>

            <button
              type="button"
              className="btn-link-back"
              onClick={() => {
                setActiveTab('login');
                setError('');
                setSuccessMsg('');
                setForgotOtpSent(false);
              }}
            >
              ← Back to Sign In
            </button>
          </form>
        )}

        {/* ================= 4. CREATE ACCOUNT ================= */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="auth-form">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number (for Courier Dispatch Updates)</label>
              <input
                type="tel"
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Create Password</label>
              <div className="input-password-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="eye-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-gold-submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Client Profile'}
            </button>

            <p className="auth-terms">
              By creating an account, you agree to Eternyx Bespoke terms of service and client privacy charter.
            </p>
          </form>
        )}

      </div>

      <style jsx>{`
        .auth-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.82);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeIn 0.25s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .auth-modal-box {
          background: #0d0d0d;
          border: 1px solid rgba(212, 175, 55, 0.35);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(212, 175, 55, 0.12);
          border-radius: 6px;
          width: 100%;
          max-width: 440px;
          padding: 36px 32px;
          position: relative;
          color: #e5e5e5;
          animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideUp {
          from { transform: translateY(16px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .auth-close-btn {
          position: absolute;
          top: 18px;
          right: 18px;
          background: transparent;
          border: none;
          color: #888;
          cursor: pointer;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }
        .auth-close-btn:hover {
          color: #d4af37;
        }
        .auth-header {
          text-align: center;
          margin-bottom: 24px;
        }
        .auth-seal {
          display: block;
          font-size: 0.65rem;
          letter-spacing: 0.3em;
          color: #d4af37;
          margin-bottom: 4px;
        }
        .auth-logo {
          font-size: 1.8rem;
          font-family: Georgia, serif;
          font-weight: 300;
          letter-spacing: 0.2em;
          color: #fff;
          margin: 0 0 4px 0;
        }
        .auth-subtitle {
          font-size: 0.7rem;
          letter-spacing: 0.18em;
          color: #777;
          margin: 0;
        }
        .auth-tabs {
          display: flex;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          margin-bottom: 24px;
        }
        .auth-tab {
          flex: 1;
          background: transparent;
          border: none;
          padding: 12px 0;
          font-size: 0.8rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #777;
          cursor: pointer;
          position: relative;
          transition: all 0.2s;
        }
        .auth-tab.active {
          color: #d4af37;
          font-weight: 500;
        }
        .auth-tab.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background: #d4af37;
          box-shadow: 0 0 10px rgba(212, 175, 55, 0.6);
        }
        .auth-alert {
          padding: 10px 14px;
          border-radius: 4px;
          font-size: 0.8rem;
          margin-bottom: 20px;
          line-height: 1.4;
        }
        .auth-alert.error {
          background: rgba(229, 62, 62, 0.12);
          border: 1px solid rgba(229, 62, 62, 0.35);
          color: #fc8181;
        }
        .auth-alert.success {
          background: rgba(72, 187, 120, 0.12);
          border: 1px solid rgba(72, 187, 120, 0.35);
          color: #68d391;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .form-group label {
          font-size: 0.74rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #999;
        }
        .label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .link-subtle {
          background: none;
          border: none;
          font-size: 0.74rem;
          color: #d4af37;
          cursor: pointer;
          padding: 0;
          text-decoration: underline;
        }
        .form-group input {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 3px;
          padding: 12px 14px;
          color: #fff;
          font-size: 0.88rem;
          transition: border-color 0.2s;
          outline: none;
        }
        .form-group input:focus {
          border-color: #d4af37;
          background: rgba(255, 255, 255, 0.06);
        }
        .input-password-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-password-wrap input {
          width: 100%;
          padding-right: 40px;
        }
        .eye-toggle {
          position: absolute;
          right: 10px;
          background: transparent;
          border: none;
          color: #777;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .eye-toggle:hover {
          color: #d4af37;
        }
        .otp-input-code {
          font-family: monospace;
          font-size: 1.3rem !important;
          letter-spacing: 8px;
          text-align: center;
          color: #d4af37 !important;
          font-weight: 700;
        }
        .btn-gold-submit {
          background: linear-gradient(135deg, #d4af37 0%, #aa8528 100%);
          color: #000;
          border: none;
          padding: 13px 20px;
          border-radius: 3px;
          font-size: 0.82rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 6px;
        }
        .btn-gold-submit:hover:not(:disabled) {
          box-shadow: 0 0 18px rgba(212, 175, 55, 0.5);
          transform: translateY(-1px);
        }
        .btn-gold-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .auth-divider {
          display: flex;
          align-items: center;
          margin: 6px 0;
          color: #555;
          font-size: 0.72rem;
        }
        .auth-divider::before,
        .auth-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255, 255, 255, 0.08);
        }
        .auth-divider span {
          padding: 0 12px;
          letter-spacing: 0.1em;
        }
        .btn-ghost-secondary {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(212, 175, 55, 0.4);
          color: #d4af37;
          padding: 11px 16px;
          border-radius: 3px;
          font-size: 0.78rem;
          font-weight: 500;
          letter-spacing: 0.08em;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .btn-ghost-secondary:hover {
          background: rgba(212, 175, 55, 0.1);
        }
        .auth-hint {
          font-size: 0.72rem;
          color: #777;
          text-align: center;
          margin: 0;
          line-height: 1.4;
        }
        .btn-link-back {
          background: none;
          border: none;
          color: #888;
          font-size: 0.75rem;
          cursor: pointer;
          padding: 6px;
          text-align: center;
          transition: color 0.2s;
        }
        .btn-link-back:hover {
          color: #d4af37;
        }
        .section-title {
          font-family: Georgia, serif;
          font-size: 1.15rem;
          font-weight: 400;
          color: #fff;
          margin: 0 0 6px 0;
          text-align: center;
        }
        .section-desc {
          font-size: 0.78rem;
          color: #888;
          line-height: 1.5;
          text-align: center;
          margin: 0 0 12px 0;
        }
        .auth-terms {
          font-size: 0.68rem;
          color: #666;
          line-height: 1.4;
          text-align: center;
          margin-top: 6px;
        }
      `}</style>
    </div>
  );
}
