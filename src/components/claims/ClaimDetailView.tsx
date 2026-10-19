'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ClaimDTO,
  getClaimAttachmentPresignedUrl,
} from '@/server/actions/claims.actions';
import { getStatusBadgeStyle } from './ClaimsTable';

interface ClaimDetailViewProps {
  claim: ClaimDTO;
}

export const ClaimDetailView: React.FC<ClaimDetailViewProps> = ({ claim }) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const badge = getStatusBadgeStyle(claim.status);
  const isClaim = claim.type === 'CLAIM';

  const handleDownload = async (attachmentId: string) => {
    setDownloadingId(attachmentId);
    setDownloadError(null);

    try {
      const res = await getClaimAttachmentPresignedUrl(attachmentId);
      if (res.success && res.url) {
        window.open(res.url, '_blank', 'noopener,noreferrer');
      } else {
        setDownloadError(res.error || 'Failed to download document');
      }
    } catch {
      setDownloadError('Network error while requesting document download');
    } finally {
      setDownloadingId(null);
    }
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div
      data-testid="claim-detail-view"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        maxWidth: '1000px',
        margin: '0 auto',
      }}
    >
      {/* Back Button */}
      <div>
        <Link
          href="/claims"
          data-testid="back-to-claims-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--color-primary-600)',
            textDecoration: 'none',
          }}
        >
          <span>&larr;</span>
          <span>Back to Claims & Inquiries</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div
        style={{
          padding: '1.5rem',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-white)',
          border: '1px solid var(--color-slate-200)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span
              style={{
                padding: '0.25rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: isClaim ? 'var(--color-primary-50)' : 'var(--color-gold-50)',
                color: isClaim ? 'var(--color-primary-700)' : 'var(--color-gold-700)',
                border: `1px solid ${isClaim ? 'var(--color-primary-100)' : 'var(--color-gold-100)'}`,
              }}
            >
              {isClaim ? 'Quality Claim' : 'Info Request'}
            </span>

            <span
              data-testid="claim-status-badge"
              style={{
                display: 'inline-block',
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: badge.bg,
                color: badge.text,
                border: `1px solid ${badge.border}`,
              }}
            >
              {badge.label}
            </span>
          </div>

          <span style={{ fontSize: '0.8125rem', color: 'var(--color-slate-500)' }}>
            Filed on {formatDate(claim.createdAt)} by <strong>{claim.submittedByName}</strong>
          </span>
        </div>

        <div>
          <div
            style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: 'var(--color-slate-500)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: '0.25rem',
            }}
          >
            Ticket #{claim.claimNumber}
          </div>
          <h1
            data-testid="claim-detail-subject"
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: 'var(--color-primary-900)',
              margin: 0,
              fontFamily: 'var(--font-family-heading)',
            }}
          >
            {claim.subject}
          </h1>
        </div>
      </div>

      {/* Official Company Resolution & Manager Answer */}
      <div
        data-testid="company-response-section"
        style={{
          padding: '1.5rem',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: claim.companyResponse
            ? 'var(--color-answer-green-bg)'
            : 'var(--color-slate-50)',
          border: `1px solid ${
            claim.companyResponse
              ? 'var(--color-answer-green-border)'
              : 'var(--color-slate-200)'
          }`,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.5rem',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div
            style={{
              fontSize: '0.9375rem',
              fontWeight: 700,
              color: claim.companyResponse
                ? 'var(--color-answer-green-text)'
                : 'var(--color-slate-700)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span>{claim.companyResponse ? '✓ Official Allana Resolution' : '⏳ Company Response Pending'}</span>
          </div>

          {claim.resolvedAt && (
            <span
              style={{
                fontSize: '0.8125rem',
                color: 'var(--color-answer-green-text)',
                fontWeight: 600,
              }}
            >
              Resolved on {formatDate(claim.resolvedAt)}
            </span>
          )}
        </div>

        <p
          data-testid="company-response-text"
          style={{
            margin: 0,
            fontSize: '0.9375rem',
            lineHeight: 1.6,
            color: claim.companyResponse
              ? 'var(--color-answer-green-text)'
              : 'var(--color-slate-600)',
          }}
        >
          {claim.companyResponse ||
            'This ticket is currently undergoing formal investigation by Allana Quality Assurance and Cold Chain Logistics departments. You will receive an official response and credit note decision once the laboratory and surveyor logs are fully audited.'}
        </p>
      </div>

      {/* Metadata Overview Grid */}
      <div
        style={{
          padding: '1.5rem',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-white)',
          border: '1px solid var(--color-slate-200)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <h2
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--color-primary-900)',
            margin: '0 0 1rem 0',
          }}
        >
          Ticket Specifications & References
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
          }}
        >
          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-slate-500)', marginBottom: '0.2rem' }}>
              Category
            </span>
            <div style={{ fontWeight: 600, color: 'var(--color-slate-800)', fontSize: '0.875rem' }}>
              {claim.categoryOfRequest || claim.infoCategory || 'General'}
            </div>
          </div>

          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-slate-500)', marginBottom: '0.2rem' }}>
              Processing Facility / Plant
            </span>
            <div style={{ fontWeight: 600, color: 'var(--color-slate-800)', fontSize: '0.875rem' }}>
              {claim.supplierName || 'Allanasons Meat Export Division'}
            </div>
          </div>

          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-slate-500)', marginBottom: '0.2rem' }}>
              Destination Country
            </span>
            <div style={{ fontWeight: 600, color: 'var(--color-slate-800)', fontSize: '0.875rem' }}>
              {claim.targetCountry || '—'}
            </div>
          </div>

          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-slate-500)', marginBottom: '0.2rem' }}>
              Container Number
            </span>
            <div style={{ fontWeight: 600, color: 'var(--color-slate-800)', fontSize: '0.875rem' }}>
              {claim.containerNumber || '—'}
            </div>
          </div>

          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-slate-500)', marginBottom: '0.2rem' }}>
              Invoice / Order Reference
            </span>
            <div style={{ fontWeight: 600, color: 'var(--color-slate-800)', fontSize: '0.875rem' }}>
              {claim.invoiceNumber || '—'}
            </div>
          </div>

          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-slate-500)', marginBottom: '0.2rem' }}>
              Company / Buyer
            </span>
            <div style={{ fontWeight: 600, color: 'var(--color-slate-800)', fontSize: '0.875rem' }}>
              {claim.companyName}
            </div>
          </div>
        </div>

        {/* Specialized Shelf Life Extension Display */}
        {claim.infoCategory === 'DOCS_DECLARATION_SHELF_LIFE' && (
          <div
            data-testid="shelf-life-detail-panel"
            style={{
              marginTop: '1.25rem',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-warning-bg)',
              border: '1px solid var(--color-warning-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-warning-text)' }}>
              Shelf Life Extension Parameters
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.75rem',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-warning-text)', display: 'block' }}>
                  Requested Extended Date:
                </span>
                <strong style={{ fontSize: '0.875rem', color: 'var(--color-slate-800)' }}>
                  {formatDate(claim.requestedShelfLifeDate)}
                </strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-warning-text)', display: 'block' }}>
                  Volume (kg):
                </span>
                <strong style={{ fontSize: '0.875rem', color: 'var(--color-slate-800)' }}>
                  {claim.shelfLifeExtensionVolumeKg != null
                    ? `${claim.shelfLifeExtensionVolumeKg.toFixed(4)} kg`
                    : '—'}
                </strong>
              </div>
            </div>
            {claim.reasonForShelfLifeExtension && (
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-warning-text)', display: 'block' }}>
                  Justification / Reasons:
                </span>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8125rem', color: 'var(--color-slate-800)' }}>
                  {claim.reasonForShelfLifeExtension}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Detailed Description */}
        {claim.description && (
          <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-slate-100)' }}>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-slate-500)', marginBottom: '0.35rem' }}>
              Claimant Problem Description
            </span>
            <p
              style={{
                margin: 0,
                fontSize: '0.875rem',
                lineHeight: 1.6,
                color: 'var(--color-slate-700)',
                whiteSpace: 'pre-line',
              }}
            >
              {claim.description}
            </p>
          </div>
        )}

        {/* Mirrored Emails */}
        {claim.additionalEmails && (
          <div style={{ marginTop: '0.75rem', fontSize: '0.8125rem', color: 'var(--color-slate-500)' }}>
            <strong>Mirrored E-mails:</strong> {claim.additionalEmails}
          </div>
        )}
      </div>

      {/* Affected Products Table */}
      {claim.products && claim.products.length > 0 && (
        <div
          data-testid="claim-products-table-section"
          style={{
            padding: '1.5rem',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-white)',
            border: '1px solid var(--color-slate-200)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <h2
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--color-primary-900)',
              margin: '0 0 1rem 0',
            }}
          >
            Affected Product Lines ({claim.products.length})
          </h2>

          <div
            style={{
              overflowX: 'auto',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-slate-200)',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.8125rem',
                textAlign: 'left',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: 'var(--color-slate-50)', borderBottom: '1px solid var(--color-slate-200)' }}>
                  <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: 'var(--color-slate-600)' }}>Article</th>
                  <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: 'var(--color-slate-600)' }}>Product Name</th>
                  <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: 'var(--color-slate-600)' }}>Vehicle No.</th>
                  <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: 'var(--color-slate-600)' }}>Lot Number</th>
                  <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: 'var(--color-slate-600)' }}>Production Date</th>
                  <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: 'var(--color-slate-600)', textAlign: 'right' }}>
                    Non-Conform Weight (kg)
                  </th>
                  <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: 'var(--color-slate-600)', textAlign: 'right' }}>
                    Received Qty (kg)
                  </th>
                </tr>
              </thead>
              <tbody>
                {claim.products.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--color-slate-100)' }}>
                    <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: 'var(--color-primary-700)' }}>
                      {item.productArticle}
                    </td>
                    <td style={{ padding: '0.6rem 0.75rem', color: 'var(--color-slate-800)' }}>
                      {item.productName}
                    </td>
                    <td style={{ padding: '0.6rem 0.75rem', color: 'var(--color-slate-600)' }}>
                      {item.vehicleNumber || '—'}
                    </td>
                    <td style={{ padding: '0.6rem 0.75rem', color: 'var(--color-slate-600)' }}>
                      {item.lotNumber || '—'}
                    </td>
                    <td style={{ padding: '0.6rem 0.75rem', color: 'var(--color-slate-600)' }}>
                      {formatDate(item.productionDate)}
                    </td>
                    <td
                      style={{
                        padding: '0.6rem 0.75rem',
                        textAlign: 'right',
                        fontWeight: 700,
                        color: 'var(--color-danger-text)',
                      }}
                    >
                      {item.nonConformWeightKg.toFixed(4)} kg
                    </td>
                    <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', color: 'var(--color-slate-600)' }}>
                      {item.receivedQuantityKg != null ? `${item.receivedQuantityKg.toFixed(4)} kg` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Supporting Evidence Vault */}
      {claim.attachments && claim.attachments.length > 0 && (
        <div
          data-testid="claim-attachments-section"
          style={{
            padding: '1.5rem',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-white)',
            border: '1px solid var(--color-slate-200)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <h2
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--color-primary-900)',
              margin: '0 0 1rem 0',
            }}
          >
            Attached Documents & Evidence ({claim.attachments.length})
          </h2>

          {downloadError && (
            <div
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-danger-bg)',
                color: 'var(--color-danger-text)',
                fontSize: '0.8125rem',
                marginBottom: '1rem',
              }}
            >
              {downloadError}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
            {claim.attachments.map((att) => (
              <div
                key={att.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-slate-50)',
                  border: '1px solid var(--color-slate-200)',
                }}
              >
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '0.5rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--color-slate-800)' }}>
                    📎 {att.fileName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>
                    {(att.fileSizeBytes / 1024).toFixed(1)} KB • {formatDate(att.createdAt)}
                  </div>
                </div>

                <button
                  type="button"
                  data-testid={`download-attachment-${att.id}`}
                  disabled={downloadingId === att.id}
                  onClick={() => handleDownload(att.id)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-slate-300)',
                    backgroundColor: 'var(--color-white)',
                    color: 'var(--color-primary-600)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: downloadingId === att.id ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {downloadingId === att.id ? 'Loading...' : 'Download'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
