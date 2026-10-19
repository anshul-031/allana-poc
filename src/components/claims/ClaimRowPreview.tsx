'use client';

import React from 'react';
import Link from 'next/link';
import { ClaimDTO } from '@/server/actions/claims.actions';

interface ClaimRowPreviewProps {
  claim: ClaimDTO;
  onDownloadAttachment?: (attachmentId: string) => void;
}

export const ClaimRowPreview: React.FC<ClaimRowPreviewProps> = ({ claim, onDownloadAttachment }) => {
  return (
    <div
      data-testid={`claim-preview-${claim.id}`}
      style={{
        padding: '1.25rem 1.5rem',
        backgroundColor: '#f8fafc',
        borderTop: '1px solid var(--color-slate-200)',
        borderBottom: '2px solid var(--color-slate-200)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {/* Category & Status Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid var(--color-slate-200)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-slate-600)' }}>
            Category of request:
          </span>
          <span
            style={{
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              backgroundColor: 'var(--color-primary-50)',
              color: 'var(--color-primary-700)',
              border: '1px solid var(--color-primary-100)',
            }}
          >
            {claim.categoryOfRequest || claim.infoCategory || 'General Inquiry'}
          </span>
          {claim.containerNumber && (
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-slate-600)' }}>
              • Container: <strong>{claim.containerNumber}</strong>
            </span>
          )}
          {claim.invoiceNumber && (
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-slate-600)' }}>
              • Invoice: <strong>{claim.invoiceNumber}</strong>
            </span>
          )}
        </div>

        <Link
          href={`/claims/${claim.id}`}
          style={{
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'var(--color-primary-600)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          View Full Ticket Details &rarr;
        </Link>
      </div>

      {/* Official Answer Panel (User Manual Section 14) */}
      <div
        style={{
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: claim.companyResponse
            ? 'var(--color-answer-green-bg)'
            : 'var(--color-slate-100)',
          border: `1px solid ${
            claim.companyResponse
              ? 'var(--color-answer-green-border)'
              : 'var(--color-slate-200)'
          }`,
        }}
      >
        <div
          style={{
            fontSize: '0.8125rem',
            fontWeight: 700,
            color: claim.companyResponse
              ? 'var(--color-answer-green-text)'
              : 'var(--color-slate-700)',
            marginBottom: '0.35rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          {claim.companyResponse ? 'Official Company Answer:' : 'Company Response Status:'}
        </div>
        <p
          style={{
            margin: 0,
            fontSize: '0.875rem',
            lineHeight: 1.5,
            color: claim.companyResponse
              ? 'var(--color-answer-green-text)'
              : 'var(--color-slate-600)',
          }}
        >
          {claim.companyResponse
            ? claim.companyResponse
            : 'Pending official response from Allana Quality Assurance and Logistics teams. Expected response time: 2 business days.'}
        </p>
      </div>

      {/* Nested Product Items Table (if present) */}
      {claim.products && claim.products.length > 0 && (
        <div>
          <div
            style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: 'var(--color-slate-700)',
              marginBottom: '0.5rem',
            }}
          >
            Affected Product Items ({claim.products.length}):
          </div>
          <div
            style={{
              overflowX: 'auto',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-slate-200)',
              backgroundColor: 'var(--color-white)',
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
                  <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: 'var(--color-slate-600)' }}>Article</th>
                  <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: 'var(--color-slate-600)' }}>Product Name</th>
                  <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: 'var(--color-slate-600)' }}>Vehicle No.</th>
                  <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: 'var(--color-slate-600)' }}>Lot / Batch</th>
                  <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: 'var(--color-slate-600)', textAlign: 'right' }}>
                    Non-Conform Weight (kg)
                  </th>
                  <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: 'var(--color-slate-600)', textAlign: 'right' }}>
                    Received Qty (kg)
                  </th>
                </tr>
              </thead>
              <tbody>
                {claim.products.map((item) => (
                  <tr
                    key={item.id}
                    style={{ borderBottom: '1px solid var(--color-slate-100)' }}
                  >
                    <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: 'var(--color-primary-700)' }}>
                      {item.productArticle}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', color: 'var(--color-slate-800)' }}>
                      {item.productName}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', color: 'var(--color-slate-600)' }}>
                      {item.vehicleNumber || '—'}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', color: 'var(--color-slate-600)' }}>
                      {item.lotNumber || '—'}
                    </td>
                    <td
                      style={{
                        padding: '0.5rem 0.75rem',
                        textAlign: 'right',
                        fontWeight: 700,
                        color: 'var(--color-danger-text)',
                      }}
                    >
                      {item.nonConformWeightKg.toFixed(4)} kg
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: 'var(--color-slate-600)' }}>
                      {item.receivedQuantityKg != null ? `${item.receivedQuantityKg.toFixed(4)} kg` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Attachments & Evidence */}
      {claim.attachments && claim.attachments.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-slate-600)' }}>
            Attached Evidence ({claim.attachments.length}):
          </span>
          {claim.attachments.map((att) => (
            <button
              key={att.id}
              type="button"
              onClick={() => onDownloadAttachment?.(att.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.25rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-white)',
                border: '1px solid var(--color-slate-300)',
                fontSize: '0.75rem',
                color: 'var(--color-primary-700)',
                cursor: 'pointer',
              }}
            >
              <span>📎</span>
              <span>{att.fileName}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
