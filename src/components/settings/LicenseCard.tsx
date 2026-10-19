'use client';

import React, { useState } from 'react';
import { ComplianceLicenseDTO, getLicenseDownloadUrl } from '@/server/actions/licenses.actions';

export interface LicenseCardProps {
  license: ComplianceLicenseDTO;
  onRenew?: (license: ComplianceLicenseDTO) => void;
  onDownloadError?: (error: string) => void;
}

export default function LicenseCard({ license, onRenew, onDownloadError }: LicenseCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyNumber = async () => {
    try {
      await navigator.clipboard.writeText(license.licenseNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownload = async () => {
    if (!license.documentUrl) {
      if (onDownloadError) {
        onDownloadError('No certificate file attached to this license record');
      }
      return;
    }

    try {
      setIsDownloading(true);
      const res = await getLicenseDownloadUrl(license.id);
      if (res.success && res.downloadUrl) {
        window.open(res.downloadUrl, '_blank', 'noopener,noreferrer');
      } else {
        if (onDownloadError) {
          onDownloadError(res.error || 'Failed to generate download link');
        }
      }
    } catch {
      if (onDownloadError) {
        onDownloadError('Network error while requesting document download');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  // Status configuration
  const statusConfig = {
    ACTIVE: {
      label: 'Active & Compliant',
      bg: 'var(--color-success-bg, rgba(16, 185, 129, 0.1))',
      color: 'var(--color-success, #059669)',
      border: 'var(--color-success-border, rgba(16, 185, 129, 0.25))',
    },
    EXPIRING_SOON: {
      label: `Expiring Soon (${license.daysRemaining} days left)`,
      bg: 'var(--color-warning-bg, rgba(245, 158, 11, 0.1))',
      color: 'var(--color-warning, #d97706)',
      border: 'var(--color-warning-border, rgba(245, 158, 11, 0.25))',
    },
    EXPIRED: {
      label: `Expired (${Math.abs(license.daysRemaining)} days ago)`,
      bg: 'var(--color-error-bg, rgba(239, 68, 68, 0.1))',
      color: 'var(--color-error, #dc2626)',
      border: 'var(--color-error-border, rgba(239, 68, 68, 0.25))',
    },
  }[license.status];

  const formattedIssueDate = new Date(license.issueDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const formattedExpiryDate = new Date(license.expiryDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      data-testid={`license-card-${license.id}`}
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--border-radius-lg)',
        padding: 'var(--spacing-lg)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 'var(--spacing-md)',
        position: 'relative',
        transition: 'var(--transition-fast)',
      }}
    >
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 'var(--spacing-md)',
            marginBottom: 'var(--spacing-xs)',
          }}
        >
          <div>
            <span
              style={{
                display: 'inline-block',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--color-text-secondary)',
                marginBottom: '4px',
              }}
            >
              {license.country} &bull; Statutory Regulatory Permit
            </span>
            <h3
              style={{
                fontSize: 'var(--font-size-md)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                margin: 0,
              }}
            >
              {license.licenseName}
            </h3>
          </div>

          <span
            style={{
              padding: '4px 10px',
              borderRadius: 'var(--border-radius-pill)',
              fontSize: '12px',
              fontWeight: 600,
              backgroundColor: statusConfig.bg,
              color: statusConfig.color,
              border: `1px solid ${statusConfig.border}`,
              whiteSpace: 'nowrap',
            }}
          >
            {statusConfig.label}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-sm)',
            marginTop: 'var(--spacing-xs)',
            marginBottom: 'var(--spacing-md)',
          }}
        >
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            Permit No:
          </span>
          <code
            style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: 600,
              backgroundColor: 'var(--color-background-subtle)',
              padding: '2px 8px',
              borderRadius: 'var(--border-radius-sm)',
              color: 'var(--color-text-primary)',
            }}
          >
            {license.licenseNumber}
          </code>
          <button
            type="button"
            onClick={handleCopyNumber}
            aria-label="Copy license number"
            title="Copy license number"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              color: copied ? 'var(--color-success)' : 'var(--color-text-secondary)',
              padding: '2px 4px',
            }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: 'var(--spacing-sm)',
            padding: 'var(--spacing-sm) var(--spacing-md)',
            backgroundColor: 'var(--color-background-subtle)',
            borderRadius: 'var(--border-radius-md)',
            marginBottom: 'var(--spacing-md)',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Issue Date</div>
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
              {formattedIssueDate}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Valid Until</div>
            <div
              style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                color: license.status === 'ACTIVE' ? 'var(--color-text-primary)' : statusConfig.color,
              }}
            >
              {formattedExpiryDate}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 'var(--spacing-sm)',
          borderTop: '1px solid var(--color-border)',
          paddingTop: 'var(--spacing-md)',
        }}
      >
        {license.documentUrl ? (
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: 'var(--border-radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 500,
              cursor: isDownloading ? 'not-allowed' : 'pointer',
              opacity: isDownloading ? 0.7 : 1,
            }}
          >
            <span>{isDownloading ? 'Generating Link...' : 'Download Certificate (PDF)'}</span>
          </button>
        ) : (
          <span
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-tertiary)',
              fontStyle: 'italic',
            }}
          >
            No document attached
          </span>
        )}

        {onRenew && (
          <button
            type="button"
            onClick={() => onRenew(license)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: 'var(--border-radius-md)',
              border: 'none',
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Renew / Update
          </button>
        )}
      </div>
    </div>
  );
}
