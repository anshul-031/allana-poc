'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => Promise<void> | void;
}

export default function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleConfirm = async () => {
    onClose();
    if (onConfirm) {
      await onConfirm();
    } else {
      // Clear cookie and redirect
      document.cookie = 'allana_active_company_id=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      router.push('/login');
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="logout-title">
      <div className="modal-content">
        <div className="modal-icon-container">
          <span className="modal-icon">⚠️</span>
        </div>
        <h3 id="logout-title" className="modal-title">
          Exit from the personal cabinet?
        </h3>
        <p className="modal-description">
          You will be logged out of your session. You can sign back in anytime with your credentials.
        </p>
        <div className="modal-actions">
          <button type="button" className="btn-cancel" onClick={onClose}>
            No
          </button>
          <button type="button" className="btn-confirm" onClick={handleConfirm}>
            Yes
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
          background-color: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.15s ease-out;
        }
        .modal-content {
          background-color: #ffffff;
          border-radius: 12px;
          padding: 2rem;
          max-width: 440px;
          width: 90%;
          text-align: center;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
          animation: scaleUp 0.15s ease-out;
        }
        .modal-icon-container {
          width: 52px;
          height: 52px;
          margin: 0 auto 1.25rem;
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal-icon {
          font-size: 1.5rem;
        }
        .modal-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 0.5rem;
        }
        .modal-description {
          font-size: 0.875rem;
          color: #64748b;
          line-height: 1.5;
          margin-bottom: 1.75rem;
        }
        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }
        .btn-cancel {
          flex: 1;
          padding: 0.625rem 1.25rem;
          font-size: 0.875rem;
          font-weight: 600;
          border-radius: 8px;
          background-color: #f1f5f9;
          color: #334155;
          border: 1px solid #cbd5e1;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .btn-cancel:hover {
          background-color: #e2e8f0;
        }
        .btn-confirm {
          flex: 1;
          padding: 0.625rem 1.25rem;
          font-size: 0.875rem;
          font-weight: 600;
          border-radius: 8px;
          background-color: #ef4444;
          color: #ffffff;
          border: none;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .btn-confirm:hover {
          background-color: #dc2626;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
