'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/server/actions/auth.actions';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await loginUser(email, password);

      if (!res.success) {
        setError(res.error || 'Authentication failed. Please check your credentials.');
        setIsLoading(false);
        return;
      }

      if (res.requires2FA && res.userId) {
        router.push(`/2fa?userId=${encodeURIComponent(res.userId)}`);
        return;
      }

      if (res.requiresPasswordChange && res.userId) {
        router.push(`/settings/change-password?userId=${encodeURIComponent(res.userId)}&forced=true`);
        return;
      }

      // Successful login - set active company cookie if available
      if (res.user?.companyId) {
        document.cookie = `allana_active_company_id=${encodeURIComponent(res.user.companyId)}; path=/; max-age=86400; SameSite=Lax;`;
      }

      router.push('/');
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-badge">EST. 1865</span>
          <h1 className="brand-logo">ALLANA</h1>
          <p className="brand-subtitle">B2B Customer Self-Service Export Portal</p>
        </div>

        <h2 className="auth-title">Sign In to Your Account</h2>
        <p className="auth-instruction">
          Enter your registered email and password provided in your welcome letter.
        </p>

        {error && (
          <div className="alert-error" role="alert">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Login (E-mail) *</label>
            <input
              id="email"
              type="email"
              placeholder="e.g. buyer@luluhypermarket.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <div className="label-row">
              <label htmlFor="password">Password *</label>
              <Link href="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="btn-toggle-pwd"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️' : '🔒'}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={isLoading}>
            {isLoading ? 'Authorizing...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer-help">
          <p>
            First time logging in? Use the temporary password from your official Allana welcome letter.
          </p>
        </div>
      </div>

      <style jsx>{`
        .auth-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at 50% 20%, #0f2342 0%, #0a192f 60%, #071120 100%);
          padding: 1.5rem;
        }
        .auth-card {
          background-color: #ffffff;
          border-radius: 16px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
          width: 100%;
          max-width: 480px;
          padding: 2.5rem;
        }
        .auth-brand {
          text-align: center;
          margin-bottom: 2rem;
        }
        .brand-badge {
          display: inline-block;
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          color: #c5a059;
          background: #fbf8f1;
          border: 1px solid #d4b474;
          padding: 0.2rem 0.6rem;
          border-radius: 9999px;
          margin-bottom: 0.5rem;
        }
        .brand-logo {
          font-size: 2.25rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          color: #0a192f;
          margin-bottom: 0.25rem;
        }
        .brand-subtitle {
          font-size: 0.8125rem;
          color: #64748b;
          font-weight: 500;
        }
        .auth-title {
          font-size: 1.375rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 0.35rem;
        }
        .auth-instruction {
          font-size: 0.875rem;
          color: #64748b;
          margin-bottom: 1.5rem;
          line-height: 1.4;
        }
        .alert-error {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          color: #991b1b;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          margin-bottom: 1.25rem;
        }
        .alert-icon {
          font-size: 1rem;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        label {
          font-size: 0.8125rem;
          font-weight: 600;
          color: #334155;
        }
        .label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .forgot-link {
          font-size: 0.8125rem;
          color: #1e427b;
          text-decoration: none;
          font-weight: 500;
        }
        .forgot-link:hover {
          color: #c5a059;
          text-decoration: underline;
        }
        .password-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .password-input-wrapper input {
          width: 100%;
          padding-right: 2.75rem;
        }
        .btn-toggle-pwd {
          position: absolute;
          right: 0.75rem;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1rem;
        }
        .btn-submit {
          background-color: #0a192f;
          color: #ffffff;
          padding: 0.75rem;
          font-size: 0.9375rem;
          font-weight: 600;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: background-color 0.2s ease;
          margin-top: 0.5rem;
        }
        .btn-submit:hover:not(:disabled) {
          background-color: #17335d;
        }
        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .auth-footer-help {
          margin-top: 2rem;
          padding-top: 1.25rem;
          border-top: 1px solid #f1f5f9;
          font-size: 0.75rem;
          color: #94a3b8;
          text-align: center;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
}
