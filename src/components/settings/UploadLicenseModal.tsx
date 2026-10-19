'use client';

import React, { useState, useEffect } from 'react';
import { ComplianceLicenseDTO, uploadRenewedLicense } from '@/server/actions/licenses.actions';

export interface UploadLicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialLicense?: ComplianceLicenseDTO | null;
  defaultCountry?: string;
}

export default function UploadLicenseModal({
  isOpen,
  onClose,
  onSuccess,
  initialLicense,
  defaultCountry = 'Saudi Arabia',
}: UploadLicenseModalProps) {
  const [formData, setFormData] = useState({
    licenseName: '',
    licenseNumber: '',
    country: defaultCountry,
    issueDate: '',
    expiryDate: '',
    documentUrl: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialLicense) {
      setFormData({
        licenseName: initialLicense.licenseName,
        licenseNumber: initialLicense.licenseNumber,
        country: initialLicense.country,
        issueDate: initialLicense.issueDate.slice(0, 10),
        expiryDate: initialLicense.expiryDate.slice(0, 10),
        documentUrl: initialLicense.documentUrl || '',
      });
    } else {
      setFormData({
        licenseName: '',
        licenseNumber: '',
        country: defaultCountry,
        issueDate: '',
        expiryDate: '',
        documentUrl: '',
      });
    }
    setErrorMessage(null);
  }, [initialLicense, defaultCountry, isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (
      !formData.licenseName.trim() ||
      !formData.licenseNumber.trim() ||
      !formData.country.trim() ||
      !formData.issueDate ||
      !formData.expiryDate
    ) {
      setErrorMessage('Please fill in all mandatory fields');
      return;
    }

    if (new Date(formData.expiryDate) <= new Date(formData.issueDate)) {
      setErrorMessage('Expiry date must be after the issue date');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await uploadRenewedLicense({
        licenseName: formData.licenseName,
        licenseNumber: formData.licenseNumber,
        country: formData.country,
        issueDate: formData.issueDate,
        expiryDate: formData.expiryDate,
        documentUrl: formData.documentUrl || undefined,
      });

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMessage(res.error || 'Failed to submit license renewal');
      }
    } catch {
      setErrorMessage('An unexpected error occurred while submitting license');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 25, 47, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 'var(--spacing-md)',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--border-radius-xl)',
          border: '1px solid var(--color-border)',
          width: '100%',
          maxWidth: '560px',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            padding: 'var(--spacing-lg)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2
              id="modal-title"
              style={{
                fontSize: 'var(--font-size-lg)',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                margin: 0,
              }}
            >
              {initialLicense ? 'Renew Compliance License' : 'Register Regulatory License'}
            </h2>
            <p
              style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-secondary)',
                marginTop: '4px',
                marginBottom: 0,
              }}
            >
              Upload updated statutory health/import certificate (SFDA / Municipality)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: 'var(--color-text-secondary)',
            }}
          >
            &times;
          </button>
        </div>

        <form
          data-testid="upload-license-form"
          onSubmit={handleSubmit}
          style={{ padding: 'var(--spacing-lg)' }}
        >
          {errorMessage && (
            <div
              role="alert"
              style={{
                backgroundColor: 'var(--color-error-bg, rgba(239, 68, 68, 0.1))',
                color: 'var(--color-error, #dc2626)',
                border: '1px solid var(--color-error-border, rgba(239, 68, 68, 0.25))',
                padding: 'var(--spacing-sm) var(--spacing-md)',
                borderRadius: 'var(--border-radius-md)',
                fontSize: 'var(--font-size-sm)',
                marginBottom: 'var(--spacing-md)',
              }}
            >
              {errorMessage}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <div>
              <label
                htmlFor="licenseName"
                style={{
                  display: 'block',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 600,
                  marginBottom: '4px',
                }}
              >
                License / Approval Name *
              </label>
              <input
                id="licenseName"
                name="licenseName"
                type="text"
                required
                value={formData.licenseName}
                onChange={handleChange}
                placeholder="e.g. SFDA Meat Import Facility License"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--border-radius-md)',
                  border: '1px solid var(--color-border)',
                  fontSize: 'var(--font-size-sm)',
                  backgroundColor: 'var(--color-background)',
                }}
              />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--spacing-md)',
              }}
            >
              <div>
                <label
                  htmlFor="licenseNumber"
                  style={{
                    display: 'block',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 600,
                    marginBottom: '4px',
                  }}
                >
                  Permit / License No. *
                </label>
                <input
                  id="licenseNumber"
                  name="licenseNumber"
                  type="text"
                  required
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  placeholder="e.g. SFDA-IMP-2026-9021"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--border-radius-md)',
                    border: '1px solid var(--color-border)',
                    fontSize: 'var(--font-size-sm)',
                    backgroundColor: 'var(--color-background)',
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="country"
                  style={{
                    display: 'block',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 600,
                    marginBottom: '4px',
                  }}
                >
                  Issuing Jurisdiction *
                </label>
                <input
                  id="country"
                  name="country"
                  type="text"
                  required
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="e.g. Saudi Arabia"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--border-radius-md)',
                    border: '1px solid var(--color-border)',
                    fontSize: 'var(--font-size-sm)',
                    backgroundColor: 'var(--color-background)',
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--spacing-md)',
              }}
            >
              <div>
                <label
                  htmlFor="issueDate"
                  style={{
                    display: 'block',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 600,
                    marginBottom: '4px',
                  }}
                >
                  Effective / Issue Date *
                </label>
                <input
                  id="issueDate"
                  name="issueDate"
                  type="date"
                  required
                  value={formData.issueDate}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--border-radius-md)',
                    border: '1px solid var(--color-border)',
                    fontSize: 'var(--font-size-sm)',
                    backgroundColor: 'var(--color-background)',
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="expiryDate"
                  style={{
                    display: 'block',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 600,
                    marginBottom: '4px',
                  }}
                >
                  Expiration Date *
                </label>
                <input
                  id="expiryDate"
                  name="expiryDate"
                  type="date"
                  required
                  value={formData.expiryDate}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--border-radius-md)',
                    border: '1px solid var(--color-border)',
                    fontSize: 'var(--font-size-sm)',
                    backgroundColor: 'var(--color-background)',
                  }}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="documentUrl"
                style={{
                  display: 'block',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 600,
                  marginBottom: '4px',
                }}
              >
                R2 Certificate Key / Path
              </label>
              <input
                id="documentUrl"
                name="documentUrl"
                type="text"
                value={formData.documentUrl}
                onChange={handleChange}
                placeholder="licenses/SFDA-PERMIT-2026.pdf"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--border-radius-md)',
                  border: '1px solid var(--color-border)',
                  fontSize: 'var(--font-size-sm)',
                  backgroundColor: 'var(--color-background)',
                }}
              />
              <span
                style={{
                  display: 'block',
                  fontSize: '11px',
                  color: 'var(--color-text-secondary)',
                  marginTop: '4px',
                }}
              >
                Enter the uploaded Cloudflare R2 document storage key or path.
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 'var(--spacing-sm)',
              marginTop: 'var(--spacing-xl)',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--border-radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'transparent',
                color: 'var(--color-text-primary)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '8px 20px',
                borderRadius: 'var(--border-radius-md)',
                border: 'none',
                backgroundColor: 'var(--color-primary)',
                color: '#ffffff',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Register Renewal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
