'use client';

import React, { useState } from 'react';
import { deleteMember, SanitizedMember } from '@/server/actions/members.actions';

interface DeleteMemberModalProps {
  isOpen: boolean;
  member: SanitizedMember | null;
  onClose: () => void;
  onSuccess: () => void;
  authorId: string;
  companyId: string;
}

export default function DeleteMemberModal({
  isOpen,
  member,
  onClose,
  onSuccess,
  authorId,
  companyId,
}: DeleteMemberModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !member) return null;

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await deleteMember(member.id, authorId, companyId);

      if (!res.success) {
        setError(res.error || 'Failed to deactivate member account');
        setIsLoading(false);
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setError('An unexpected error occurred while deactivating member');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
      <div className="modal-card">
        <div className="modal-header">
          <div className="warning-icon-wrapper">⚠️</div>
          <h2 id="delete-modal-title" className="modal-title">
            Deactivate User Account
          </h2>
        </div>

        <p className="modal-prompt">
          Are you sure you want to deactivate{' '}
          <strong>
            {member.firstName} {member.lastName || ''} ({member.email})
          </strong>
          ?
        </p>
        <p className="modal-subtext">
          The user will no longer be able to log in to the portal or access company documents, shipments, and financial orders.
        </p>

        {error && (
          <div className="alert-error" role="alert">
            ⚠️ {error}
          </div>
        )}

        <div className="modal-actions">
          <button type="button" className="btn-cancel" onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button type="button" className="btn-delete" onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? 'Deactivating...' : 'Deactivate Member'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(10, 25, 47, 0.65);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-card {
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
          max-width: 480px;
          width: 100%;
          padding: 1.75rem;
          text-align: center;
        }

        .warning-icon-wrapper {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .modal-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 0.75rem;
        }

        .modal-prompt {
          font-size: 0.9375rem;
          color: #334155;
          margin-bottom: 0.5rem;
          line-height: 1.45;
        }

        .modal-subtext {
          font-size: 0.8125rem;
          color: #64748b;
          margin-bottom: 1.5rem;
          line-height: 1.4;
        }

        .alert-error {
          background-color: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
          padding: 0.625rem 0.875rem;
          border-radius: 6px;
          margin-bottom: 1.25rem;
          font-size: 0.8125rem;
          text-align: left;
        }

        .modal-actions {
          display: flex;
          justify-content: center;
          gap: 1rem;
        }

        .btn-cancel {
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #cbd5e1;
          padding: 0.5rem 1.25rem;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-delete {
          background: #dc2626;
          color: #ffffff;
          border: none;
          padding: 0.5rem 1.25rem;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-delete:hover:not(:disabled) {
          background: #b91c1c;
        }

        .btn-delete:disabled,
        .btn-cancel:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
