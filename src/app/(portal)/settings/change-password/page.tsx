'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { changePassword } from '@/server/actions/auth.actions';
import Link from 'next/link';

function ChangePasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId') || '';
  const isForced = searchParams.get('forced') === 'true';

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await changePassword(userId, currentPassword, newPassword, confirmPassword);

      if (!res.success) {
        setError(res.error || 'Failed to update password. Please check your current password.');
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      // Wait 2 seconds and redirect to login
      setTimeout(() => {
        document.cookie = 'allana_active_company_id=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        router.push('/login');
      }, 2000);
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="change-pwd-container">
      <div className="change-pwd-card">
        <div className="card-header">
          <span className="card-badge">{isForced ? 'MANDATORY SETUP' : 'SECURITY SETTINGS'}</span>
          <h2 className="card-title">
            {isForced ? 'First-Time Password Change' : 'Update Your Password'}
          </h2>
          <p className="card-subtitle">
            {isForced
              ? 'To protect your corporate account, you must replace your initial temporary password with a strong private password before accessing the portal.'
              : 'Enter your current password and choose a secure new password.'}
          </p>
        </div>

        {error && (
          <div className="alert-error" role="alert">
            <span>⚠️ {error}</span>
          </div>
        )}

        {success ? (
          <div className="alert-success" role="status">
            <span className="success-icon">✅</span>
            <h4>Password Successfully Updated!</h4>
            <p>
              As specified in the portal security policy, you will now be redirected to the sign-in page to log in with your new password.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="pwd-form">
            <div className="form-group">
              <label htmlFor="current-pwd">Current Password *</label>
              <input
                id="current-pwd"
                type="password"
                placeholder="Enter current / welcome password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="new-pwd">New Password (min 8 characters) *</label>
              <input
                id="new-pwd"
                type="password"
                placeholder="Enter strong new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm-pwd">Confirm New Password *</label>
              <input
                id="confirm-pwd"
                type="password"
                placeholder="Confirm strong new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <div className="form-actions">
              {!isForced && (
                <Link href="/" className="btn-cancel">
                  Cancel
                </Link>
              )}
              <button type="submit" className="btn-save" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Save New Password'}
              </button>
            </div>
          </form>
        )}
      </div>

      <style jsx>{`
        .change-pwd-container {
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1.5rem;
        }
        .change-pwd-card {
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08);
          max-width: 520px;
          width: 100%;
          padding: 2.25rem;
        }
        .card-header {
          text-align: center;
          margin-bottom: 1.75rem;
        }
        .card-badge {
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
        .card-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 0.35rem;
        }
        .card-subtitle {
          font-size: 0.875rem;
          color: #64748b;
          line-height: 1.45;
        }
        .alert-error {
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          color: #991b1b;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
        }
        .alert-success {
          background-color: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #166534;
          padding: 1.5rem;
          border-radius: 8px;
          text-align: center;
        }
        .success-icon {
          font-size: 2rem;
          display: block;
          margin-bottom: 0.5rem;
        }
        .alert-success h4 {
          font-size: 1.125rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .alert-success p {
          font-size: 0.875rem;
          line-height: 1.4;
        }
        .pwd-form {
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
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 0.75rem;
        }
        .btn-cancel {
          padding: 0.625rem 1.25rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #475569;
          background: #f1f5f9;
          border-radius: 6px;
          text-decoration: none;
        }
        .btn-save {
          padding: 0.625rem 1.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #ffffff;
          background-color: #0a192f;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        .btn-save:hover:not(:disabled) {
          background-color: #17335d;
        }
        .btn-save:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

export default function ChangePasswordPage() {
  return (
    <Suspense fallback={<div>Loading password change interface...</div>}>
      <ChangePasswordForm />
    </Suspense>
  );
}
