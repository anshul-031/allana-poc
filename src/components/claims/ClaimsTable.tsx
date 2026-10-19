'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ClaimDTO, ClaimStatus, ClaimType } from '@/server/actions/claims.actions';
import { ClaimRowPreview } from './ClaimRowPreview';

interface ClaimsTableProps {
  claims: ClaimDTO[];
  onDownloadAttachment?: (attachmentId: string) => void;
  sortField?: 'claimNumber' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: 'claimNumber' | 'createdAt') => void;
}

export function getStatusBadgeStyle(status: ClaimStatus) {
  switch (status) {
    case 'REGISTERED':
      return { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af', label: 'Registered' };
    case 'UNDER_REVIEW':
      return { bg: '#fef3c7', border: '#fde68a', text: '#92400e', label: 'Under Review' };
    case 'INVESTIGATION':
      return { bg: '#f3e8ff', border: '#e9d5ff', text: '#6b21a8', label: 'Investigation' };
    case 'CLARIFICATION_REQUIRED':
      return { bg: '#fff7ed', border: '#fed7aa', text: '#c2410c', label: 'Clarification Req.' };
    case 'PARTLY_ACCEPTED':
      return { bg: '#ecfeff', border: '#a5f3fc', text: '#0e7490', label: 'Partly Accepted' };
    case 'ACCEPTED':
      return { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534', label: 'Accepted' };
    case 'REJECTED':
      return { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', label: 'Rejected' };
    case 'COMPLETED':
      return { bg: '#f8fafc', border: '#cbd5e1', text: '#334155', label: 'Completed' };
    default:
      return { bg: '#f1f5f9', border: '#e2e8f0', text: '#475569', label: status };
  }
}

export const ClaimsTable: React.FC<ClaimsTableProps> = ({
  claims,
  onDownloadAttachment,
  sortField = 'createdAt',
  sortOrder = 'desc',
  onSort,
}) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}.${month}.${year}`;
    } catch {
      return isoString;
    }
  };

  return (
    <div
      style={{
        overflowX: 'auto',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-slate-200)',
        backgroundColor: 'var(--color-white)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <table
        data-testid="claims-table"
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.875rem',
          textAlign: 'left',
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: 'var(--color-slate-50)',
              borderBottom: '2px solid var(--color-slate-200)',
            }}
          >
            <th style={{ width: '40px', padding: '0.75rem 0.5rem', textAlign: 'center' }}></th>
            <th
              style={{
                padding: '0.75rem 1rem',
                fontWeight: 600,
                color: 'var(--color-slate-700)',
                cursor: onSort ? 'pointer' : 'default',
              }}
              onClick={() => onSort?.('claimNumber')}
            >
              Ticket ID {sortField === 'claimNumber' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--color-slate-700)' }}>
              Type
            </th>
            <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--color-slate-700)' }}>
              Subject
            </th>
            <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--color-slate-700)' }}>
              Category
            </th>
            <th
              style={{
                padding: '0.75rem 1rem',
                fontWeight: 600,
                color: 'var(--color-slate-700)',
                cursor: onSort ? 'pointer' : 'default',
              }}
              onClick={() => onSort?.('createdAt')}
            >
              Created Date {sortField === 'createdAt' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--color-slate-700)' }}>
              Status
            </th>
            <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--color-slate-700)', textAlign: 'right' }}>
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {claims.length === 0 ? (
            <tr>
              <td
                colSpan={8}
                style={{
                  padding: '3rem 1rem',
                  textAlign: 'center',
                  color: 'var(--color-slate-500)',
                }}
              >
                No claims or inquiries found for the selected criteria.
              </td>
            </tr>
          ) : (
            claims.map((claim) => {
              const isExpanded = expandedIds.has(claim.id);
              const badge = getStatusBadgeStyle(claim.status);
              const isClaim = claim.type === 'CLAIM';

              return (
                <React.Fragment key={claim.id}>
                  <tr
                    data-testid={`claim-row-${claim.id}`}
                    style={{
                      borderBottom: isExpanded ? 'none' : '1px solid var(--color-slate-200)',
                      backgroundColor: isExpanded ? '#f1f5f9' : 'transparent',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    {/* In-place expander button */}
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                      <button
                        type="button"
                        aria-label={isExpanded ? 'Collapse claim preview' : 'Expand claim preview'}
                        data-testid={`toggle-expand-${claim.id}`}
                        onClick={() => toggleRow(claim.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          color: 'var(--color-slate-600)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '24px',
                          height: '24px',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        {isExpanded ? '▼' : '▶'}
                      </button>
                    </td>

                    {/* Ticket ID */}
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                      <Link
                        href={`/claims/${claim.id}`}
                        style={{
                          color: 'var(--color-primary-600)',
                          textDecoration: 'none',
                        }}
                      >
                        {claim.claimNumber}
                      </Link>
                    </td>

                    {/* Type Badge */}
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span
                        style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: isClaim ? 'var(--color-primary-50)' : 'var(--color-gold-50)',
                          color: isClaim ? 'var(--color-primary-700)' : 'var(--color-gold-700)',
                          border: `1px solid ${
                            isClaim ? 'var(--color-primary-100)' : 'var(--color-gold-100)'
                          }`,
                        }}
                      >
                        {isClaim ? 'Claim' : 'Info Request'}
                      </span>
                    </td>

                    {/* Subject */}
                    <td
                      style={{
                        padding: '0.75rem 1rem',
                        color: 'var(--color-slate-800)',
                        maxWidth: '260px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={claim.subject}
                    >
                      {claim.subject}
                    </td>

                    {/* Category */}
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--color-slate-600)' }}>
                      {claim.categoryOfRequest || claim.infoCategory || 'General'}
                    </td>

                    {/* Date */}
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--color-slate-600)' }}>
                      {formatDate(claim.createdAt)}
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: badge.bg,
                          color: badge.text,
                          border: `1px solid ${badge.border}`,
                        }}
                      >
                        {badge.label}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => toggleRow(claim.id)}
                        style={{
                          padding: '0.35rem 0.75rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--color-slate-300)',
                          backgroundColor: 'var(--color-white)',
                          color: 'var(--color-slate-700)',
                          cursor: 'pointer',
                        }}
                      >
                        {isExpanded ? 'Hide ▴' : 'Details ▾'}
                      </button>
                    </td>
                  </tr>

                  {/* Expandable Preview Drawer */}
                  {isExpanded && (
                    <tr>
                      <td colSpan={8} style={{ padding: 0 }}>
                        <ClaimRowPreview
                          claim={claim}
                          onDownloadAttachment={onDownloadAttachment}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
