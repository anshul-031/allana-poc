'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { requestPasswordReset } from '@/server/actions/auth.actions';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await requestPasswordReset(email);
      setMessage(res.message);
      setSubmitted(true);
    } catch {
      setMessage('Failed to dispatch password reset request. Please try again.');
      setSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="brand-header">
          <span className="brand-kicker">ALLANA EXPORT PORTAL</span>
          <h2 className="auth-title">Restore Password</h2>
        </div>

        <p className="auth-instruction">
          Enter the email address registered with your customer account to receive password reset instructions.
        </p>

        {submitted ? (
          <div className="alert-success">
            <p className="success-text">{message}</p>
            <div className="back-btn-wrapper">
              <Link href="/login" className="btn-return">
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="reset-email">Login (E-mail) *</label>
              <input
                id="reset-email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? 'Dispatching...' : 'Send Reset Link'}
            </button>

            <div className="back-link-wrapper">
              <Link href="/login" className="back-link">
                ← Return to Sign In
              </Link>
            </div>
          </form>
        )}
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
          max-width: 440px;
          padding: 2.5rem;
        }
        .brand-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }
        .brand-kicker {
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          color: #c5a059;
          text-transform: uppercase;
        }
        .auth-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
          margin-top: 0.25rem;
        }
        .auth-instruction {
          font-size: 0.875rem;
          color: #64748b;
          margin-bottom: 1.5rem;
          line-height: 1.5;
          text-align: center;
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
        }
        .btn-submit:hover:not(:disabled) {
          background-color: #17335d;
        }
        .alert-success {
          background-color: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
          padding: 1.5rem;
          text-align: center;
        }
        .success-text {
          font-size: 0.9375rem;
          color: #166534;
          line-height: 1.5;
          margin-bottom: 1.5rem;
        }
        .btn-return {
          display: inline-block;
          background-color: #0a192f;
          color: #ffffff;
          padding: 0.625rem 1.25rem;
          font-size: 0.875rem;
          font-weight: 600;
          border-radius: 6px;
          text-decoration: none;
        }
        .back-link-wrapper {
          text-align: center;
          margin-top: 0.5rem;
        }
        .back-link {
          font-size: 0.8125rem;
          color: #64748b;
          text-decoration: none;
        }
        .back-link:hover {
          color: #0a192f;
        }
      `}</style>
    </div>
  );
}
