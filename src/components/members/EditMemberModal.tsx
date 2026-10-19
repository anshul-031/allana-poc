'use client';

import React, { useState, useEffect } from 'react';
import { updateMember, SanitizedMember } from '@/server/actions/members.actions';
import { UpdateMemberInput } from '@/server/validators/member.schema';

interface EditMemberModalProps {
  isOpen: boolean;
  member: SanitizedMember | null;
  onClose: () => void;
  onSuccess: () => void;
  authorId: string;
  companyId: string;
}

const AVAILABLE_PERMISSIONS = [
  { id: 'CLIENT_MANAGEMENT', label: 'Client Management' },
  { id: 'VIEW_CLIENTS', label: 'View clients' },
  { id: 'VIEW_LOGS', label: 'View logs' },
  { id: 'VIEW_CATALOG', label: 'View Catalog' },
  { id: 'ORDER_CUSTOM_PRODUCT', label: 'Order Custom Product' },
  { id: 'VIEW_SHIPMENTS', label: 'View Shipments' },
  { id: 'VIEW_FINANCIALS', label: 'View Financials' },
  { id: 'SUBMIT_CLAIMS', label: 'Submit Claims' },
  { id: 'VIEW_REPORTS', label: 'View Reports' },
  { id: 'DOWNLOAD_DOCUMENTS', label: 'Download Documents' },
  { id: 'MANAGE_MEMBERS', label: 'Manage Team Members' },
];

export default function EditMemberModal({
  isOpen,
  member,
  onClose,
  onSuccess,
  authorId,
  companyId,
}: EditMemberModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    patronymic: '',
    phone: '',
    jobTitle: '',
    comment: '',
    isActive: true,
    twoFactorEnabled: false,
  });
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (member) {
      setFormData({
        firstName: member.firstName || '',
        lastName: member.lastName || '',
        patronymic: member.patronymic || '',
        phone: member.phone || '',
        jobTitle: member.jobTitle || '',
        comment: member.comment || '',
        isActive: member.isActive,
        twoFactorEnabled: member.twoFactorEnabled,
      });
      setSelectedPermissions(member.permissions || []);
      setError(null);
    }
  }, [member]);

  if (!isOpen || !member) return null;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    setFormData((prev) => ({ ...prev, [target.name]: value }));
  };

  const handleTogglePermission = (permId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const payload: UpdateMemberInput = {
        id: member.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        patronymic: formData.patronymic,
        phone: formData.phone,
        jobTitle: formData.jobTitle,
        comment: formData.comment,
        isActive: formData.isActive,
        twoFactorEnabled: formData.twoFactorEnabled,
        permissions: selectedPermissions as any,
      };

      const res = await updateMember(payload, authorId, companyId);

      if (!res.success) {
        setError(res.error || 'Failed to update user');
        setIsLoading(false);
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setError('An unexpected error occurred while updating user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="edit-member-title">
      <div className="modal-card">
        <div className="modal-header">
          <h2 id="edit-member-title" className="modal-title">
            ✏️ Edit User: {member.email}
          </h2>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        {error && (
          <div className="alert-error" role="alert">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="edit-first-name">Name *</label>
              <input
                id="edit-first-name"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-last-name">Surname</label>
              <input
                id="edit-last-name"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-patronymic">Patronymic</label>
              <input
                id="edit-patronymic"
                name="patronymic"
                type="text"
                value={formData.patronymic}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-phone">Phone</label>
              <input
                id="edit-phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="edit-job-title">Job Title</label>
              <input
                id="edit-job-title"
                name="jobTitle"
                type="text"
                value={formData.jobTitle}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="edit-comment">Comment</label>
            <textarea
              id="edit-comment"
              name="comment"
              rows={2}
              value={formData.comment}
              onChange={handleInputChange}
            />
          </div>

          <div className="settings-section">
            <h4 className="section-label">Account Settings</h4>
            <div className="checkboxes-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                />
                <span>Active Account</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="twoFactorEnabled"
                  checked={formData.twoFactorEnabled}
                  onChange={handleInputChange}
                />
                <span>Two-Factor Authorization</span>
              </label>
            </div>
          </div>

          <div className="permissions-section">
            <h4 className="section-label">Granular RBAC Permissions</h4>
            <div className="permissions-grid">
              {AVAILABLE_PERMISSIONS.map((perm) => (
                <label key={perm.id} className="permission-item">
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(perm.id)}
                    onChange={() => handleTogglePermission(perm.id)}
                  />
                  <span>{perm.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
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
          max-width: 680px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          padding: 1.75rem;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 0.75rem;
        }

        .modal-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.25rem;
          color: #94a3b8;
          cursor: pointer;
        }

        .alert-error {
          background-color: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
          padding: 0.625rem 0.875rem;
          border-radius: 6px;
          margin-bottom: 1rem;
          font-size: 0.8125rem;
        }

        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .full-width {
          grid-column: span 2;
        }

        label {
          font-size: 0.8125rem;
          font-weight: 600;
          color: #334155;
        }

        input[type='text'],
        input[type='tel'],
        textarea {
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          outline: none;
          color: #0f172a;
        }

        input:focus,
        textarea:focus {
          border-color: #0a192f;
        }

        .settings-section,
        .permissions-section {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 1rem;
        }

        .section-label {
          font-size: 0.8125rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .checkboxes-row {
          display: flex;
          gap: 1.5rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
          color: #1e293b;
        }

        .permissions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 0.625rem;
        }

        .permission-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8125rem;
          color: #334155;
          cursor: pointer;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 0.5rem;
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

        .btn-save {
          background: #0a192f;
          color: #ffffff;
          border: none;
          padding: 0.5rem 1.5rem;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-save:hover:not(:disabled) {
          background: #17335d;
        }

        .btn-save:disabled,
        .btn-cancel:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
