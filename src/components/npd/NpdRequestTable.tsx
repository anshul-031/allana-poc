'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { CustomProductRequestDTO, CustomProductStatus } from '@/server/actions/npd.actions';

export interface NpdRequestTableProps {
  requests: CustomProductRequestDTO[];
  onSelectRequest: (request: CustomProductRequestDTO) => void;
}

export default function NpdRequestTable({ requests, onSelectRequest }: NpdRequestTableProps) {
  const [activeStatus, setActiveStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesStatus = activeStatus === 'ALL' || req.status === activeStatus;
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        req.requestNumber.toLowerCase().includes(term) ||
        req.categoryName.toLowerCase().includes(term) ||
        (req.cutSpecification && req.cutSpecification.toLowerCase().includes(term)) ||
        req.targetCountry.toLowerCase().includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [requests, activeStatus, searchTerm]);

  const getStatusBadge = (status: CustomProductStatus) => {
    switch (status) {
      case 'ACCEPTED':
        return {
          bg: 'var(--color-success-bg, #f0fdf4)',
          text: 'var(--color-success-text, #166534)',
          border: 'var(--color-success-border, #bbf7d0)',
          label: 'Accepted',
        };
      case 'DECLINED':
        return {
          bg: 'var(--color-danger-bg, #fef2f2)',
          text: 'var(--color-danger-text, #991b1b)',
          border: 'var(--color-danger-border, #fecaca)',
          label: 'Declined',
        };
      case 'ANALYSIS':
        return {
          bg: 'rgba(197, 160, 89, 0.1)',
          text: 'var(--color-gold-700, #9c7b39)',
          border: 'var(--color-gold, #c5a059)',
          label: 'Under Analysis',
        };
      default:
        return {
          bg: 'var(--color-info-bg, #eff6ff)',
          text: 'var(--color-info-text, #1e40af)',
          border: 'var(--color-info-border, #bfdbfe)',
          label: 'In Review',
        };
    }
  };

  const statusTabs: { id: string; label: string }[] = [
    { id: 'ALL', label: 'All Requests' },
    { id: 'IN_REVIEW', label: 'In Review' },
    { id: 'ANALYSIS', label: 'Under Analysis' },
    { id: 'ACCEPTED', label: 'Accepted' },
    { id: 'DECLINED', label: 'Declined' },
  ];

  return (
    <div
      data-testid="npd-request-table-container"
      style={{
        backgroundColor: 'var(--color-surface, #ffffff)',
        border: '1px solid var(--color-border, #e2e8f0)',
        borderRadius: 'var(--border-radius-xl, 16px)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Controls Bar: Search & Status Filter Tabs */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--color-border, #e2e8f0)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {/* Status Tabs */}
          <div
            role="tablist"
            aria-label="Filter requests by status"
            style={{
              display: 'flex',
              gap: '6px',
              flexWrap: 'wrap',
            }}
          >
            {statusTabs.map((tab) => {
              const isActive = activeStatus === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  data-testid={`status-tab-${tab.id}`}
                  onClick={() => setActiveStatus(tab.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--border-radius-pill, 9999px)',
                    fontSize: '12px',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)',
                    backgroundColor: isActive
                      ? 'var(--color-primary-dark, #0a192f)'
                      : 'var(--color-background-subtle, #f8fafc)',
                    color: isActive ? '#ffffff' : 'var(--color-text-secondary, #475569)',
                    border: isActive
                      ? '1px solid var(--color-primary-dark, #0a192f)'
                      : '1px solid var(--color-border, #e2e8f0)',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Instant Search Bar */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
            <input
              type="text"
              data-testid="npd-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Ticket, Category..."
              aria-label="Search requests"
              style={{
                width: '100%',
                padding: '8px 12px 8px 32px',
                fontSize: '13px',
                borderRadius: 'var(--border-radius-md, 8px)',
                border: '1px solid var(--color-border, #e2e8f0)',
                backgroundColor: 'var(--color-background-subtle, #f8fafc)',
                color: 'var(--color-text-primary, #0f172a)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <span
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '13px',
                color: 'var(--color-slate-400, #94a3b8)',
                pointerEvents: 'none',
              }}
            >
              🔍
            </span>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      {filteredRequests.length === 0 ? (
        <div
          data-testid="npd-empty-state"
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            color: 'var(--color-text-secondary, #64748b)',
          }}
        >
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>📋</div>
          <h4
            style={{
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--color-primary-dark, #0a192f)',
              margin: '0 0 6px 0',
            }}
          >
            No Customized Product Requests Found
          </h4>
          <p style={{ fontSize: '13px', margin: '0 0 16px 0' }}>
            {searchTerm || activeStatus !== 'ALL'
              ? 'No requests match your current search and status filters.'
              : 'You have not submitted any customized NPD product requests yet.'}
          </p>
          <Link
            href="/customized-products/new"
            data-testid="empty-create-npd-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--color-primary-dark, #0a192f)',
              color: '#ffffff',
              padding: '8px 16px',
              borderRadius: 'var(--border-radius-md, 8px)',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 700,
              border: '1px solid var(--color-gold, #c5a059)',
            }}
          >
            + Create New Request
          </Link>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            data-testid="npd-table"
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '13px',
              minWidth: '800px',
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: 'var(--color-background-subtle, #f8fafc)',
                  borderBottom: '1px solid var(--color-border, #e2e8f0)',
                  color: 'var(--color-text-secondary, #64748b)',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                <th style={{ padding: '12px 16px' }}>Ticket ID</th>
                <th style={{ padding: '12px 16px' }}>Category &amp; Specification</th>
                <th style={{ padding: '12px 16px' }}>Target Market</th>
                <th style={{ padding: '12px 16px' }}>Est. Volume</th>
                <th style={{ padding: '12px 16px' }}>Est. Price ($)</th>
                <th style={{ padding: '12px 16px' }}>Created Date</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req) => {
                const badge = getStatusBadge(req.status);
                return (
                  <tr
                    key={req.id}
                    data-testid={`npd-row-${req.id}`}
                    onClick={() => onSelectRequest(req)}
                    style={{
                      borderBottom: '1px solid var(--color-border-subtle, #f1f5f9)',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    {/* Ticket ID */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <span
                        data-testid={`req-number-${req.id}`}
                        style={{
                          fontSize: '12px',
                          fontWeight: 800,
                          color: 'var(--color-gold, #c5a059)',
                          backgroundColor: 'rgba(197, 160, 89, 0.1)',
                          border: '1px solid rgba(197, 160, 89, 0.3)',
                          padding: '3px 8px',
                          borderRadius: '4px',
                        }}
                      >
                        {req.requestNumber}
                      </span>
                    </td>

                    {/* Category & Specification */}
                    <td style={{ padding: '14px 16px' }}>
                      <div
                        style={{
                          fontWeight: 700,
                          color: 'var(--color-text-primary, #0f172a)',
                        }}
                      >
                        {req.categoryName}
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: 'var(--color-text-secondary, #64748b)',
                          marginTop: '2px',
                          maxWidth: '240px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {req.cutSpecification || 'Custom cut specification'}
                      </div>
                    </td>

                    {/* Target Market */}
                    <td style={{ padding: '14px 16px' }}>{req.targetCountry}</td>

                    {/* Est. Volume */}
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                      {req.targetVolumeMt ? `${req.targetVolumeMt} MT` : '-'}
                    </td>

                    {/* Est. Price */}
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                      {req.estimatedFcaPricePerTon
                        ? `$${req.estimatedFcaPricePerTon.toLocaleString()}`
                        : '-'}
                    </td>

                    {/* Created Date */}
                    <td style={{ padding: '14px 16px', color: 'var(--color-text-secondary, #64748b)' }}>
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        data-testid={`status-badge-${req.id}`}
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor: badge.bg,
                          color: badge.text,
                          border: `1px solid ${badge.border}`,
                          padding: '3px 8px',
                          borderRadius: 'var(--border-radius-pill, 9999px)',
                          whiteSpace: 'nowrap',
                          textTransform: 'uppercase',
                        }}
                      >
                        {badge.label}
                      </span>
                    </td>

                    {/* Action */}
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        type="button"
                        data-testid={`view-details-btn-${req.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectRequest(req);
                        }}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 700,
                          backgroundColor: 'var(--color-background-subtle, #f8fafc)',
                          color: 'var(--color-primary-dark, #0a192f)',
                          border: '1px solid var(--color-border, #cbd5e1)',
                          cursor: 'pointer',
                        }}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
