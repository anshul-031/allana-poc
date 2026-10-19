'use client';

import React, { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import {
  ClaimDTO,
  ClaimStatus,
  ClaimType,
  getClaimAttachmentPresignedUrl,
} from '@/server/actions/claims.actions';
import { ClaimsTable } from './ClaimsTable';

interface ClaimsPortalViewProps {
  initialClaims: ClaimDTO[];
  initialTotal: number;
}

export const ClaimsPortalView: React.FC<ClaimsPortalViewProps> = ({
  initialClaims,
  initialTotal,
}) => {
  const [claims] = useState<ClaimDTO[]>(initialClaims);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | ClaimType>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ClaimStatus>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pageSize, setPageSize] = useState<number>(12);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<'claimNumber' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isPending, startTransition] = useTransition();

  const handleDownloadAttachment = async (attachmentId: string) => {
    try {
      const res = await getClaimAttachmentPresignedUrl(attachmentId);
      if (res.success && res.url) {
        window.open(res.url, '_blank', 'noopener,noreferrer');
      } else {
        alert(res.error || 'Failed to download document');
      }
    } catch {
      alert('Network error while requesting document download');
    }
  };

  const handleSort = (field: 'claimNumber' | 'createdAt') => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const resetFilters = () => {
    setSearch('');
    setTypeFilter('ALL');
    setStatusFilter('ALL');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  // Filter & sort claims in memory for fast interactive response
  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      // Type filter
      if (typeFilter !== 'ALL' && claim.type !== typeFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'ALL' && claim.status !== statusFilter) {
        return false;
      }

      // Date range filter
      if (startDate) {
        const claimTime = new Date(claim.createdAt).getTime();
        const startTime = new Date(startDate).getTime();
        if (claimTime < startTime) return false;
      }
      if (endDate) {
        const claimTime = new Date(claim.createdAt).getTime();
        const endTime = new Date(endDate);
        endTime.setHours(23, 59, 59, 999);
        if (claimTime > endTime.getTime()) return false;
      }

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchNumber = claim.claimNumber.toLowerCase().includes(q);
        const matchSubject = claim.subject.toLowerCase().includes(q);
        const matchContainer = (claim.containerNumber || '').toLowerCase().includes(q);
        const matchInvoice = (claim.invoiceNumber || '').toLowerCase().includes(q);
        const matchProducts = claim.products.some(
          (p) =>
            p.productArticle.toLowerCase().includes(q) ||
            p.productName.toLowerCase().includes(q) ||
            (p.vehicleNumber || '').toLowerCase().includes(q)
        );

        if (!matchNumber && !matchSubject && !matchContainer && !matchInvoice && !matchProducts) {
          return false;
        }
      }

      return true;
    });
  }, [claims, typeFilter, statusFilter, startDate, endDate, search]);

  const sortedClaims = useMemo(() => {
    return [...filteredClaims].sort((a, b) => {
      if (sortField === 'claimNumber') {
        return sortOrder === 'asc'
          ? a.claimNumber.localeCompare(b.claimNumber)
          : b.claimNumber.localeCompare(a.claimNumber);
      }
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    });
  }, [filteredClaims, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedClaims.length / pageSize));
  const paginatedClaims = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedClaims.slice(start, start + pageSize);
  }, [sortedClaims, currentPage, pageSize]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Action Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--color-slate-200)',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'var(--color-primary-900)',
              margin: '0 0 0.35rem 0',
              fontFamily: 'var(--font-family-heading)',
            }}
          >
            Claims & Complaints Desk
          </h1>
          <p style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--color-slate-600)' }}>
            Track quality deviations, transit temperature exceptions, and file official regulatory document requests.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link
            href="/claims/new-claim"
            data-testid="create-claim-button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-success-text)',
              color: 'var(--color-white)',
              fontSize: '0.875rem',
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: 'var(--shadow-sm)',
              transition: 'background-color 0.15s ease',
            }}
          >
            <span>+</span>
            <span>Claim Form</span>
          </Link>

          <Link
            href="/claims/new-request"
            data-testid="create-request-button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-white)',
              color: 'var(--color-gold-700)',
              border: '2px solid var(--color-gold-500)',
              fontSize: '0.875rem',
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.15s ease',
            }}
          >
            <span>+</span>
            <span>Info Request</span>
          </Link>
        </div>
      </div>

      {/* Multi-Facet Filter Bar */}
      <div
        data-testid="claims-filter-bar"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          padding: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-white)',
          border: '1px solid var(--color-slate-200)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
          {/* Search Input */}
          <div style={{ flex: '2 1 240px', minWidth: '220px' }}>
            <label
              htmlFor="claims-search-input"
              style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--color-slate-700)',
                marginBottom: '0.35rem',
              }}
            >
              Search
            </label>
            <input
              id="claims-search-input"
              type="text"
              data-testid="claims-search"
              placeholder="Ticket ID, subject, vehicle, article..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-slate-300)',
                fontSize: '0.875rem',
                color: 'var(--color-slate-800)',
              }}
            />
          </div>

          {/* Type Filter */}
          <div style={{ flex: '1 1 140px', minWidth: '130px' }}>
            <label
              htmlFor="claims-type-select"
              style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--color-slate-700)',
                marginBottom: '0.35rem',
              }}
            >
              Request Type
            </label>
            <select
              id="claims-type-select"
              data-testid="claims-type-filter"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-slate-300)',
                fontSize: '0.875rem',
                backgroundColor: 'var(--color-white)',
                color: 'var(--color-slate-800)',
              }}
            >
              <option value="ALL">All Types</option>
              <option value="CLAIM">Quality Claims</option>
              <option value="INFO_REQUEST">Info Requests</option>
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ flex: '1 1 160px', minWidth: '150px' }}>
            <label
              htmlFor="claims-status-select"
              style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--color-slate-700)',
                marginBottom: '0.35rem',
              }}
            >
              Status
            </label>
            <select
              id="claims-status-select"
              data-testid="claims-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-slate-300)',
                fontSize: '0.875rem',
                backgroundColor: 'var(--color-white)',
                color: 'var(--color-slate-800)',
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="REGISTERED">Registered</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="INVESTIGATION">Investigation</option>
              <option value="CLARIFICATION_REQUIRED">Clarification Required</option>
              <option value="PARTLY_ACCEPTED">Partly Accepted</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* Date Period Pickers */}
          <div style={{ flex: '1 1 140px', minWidth: '130px' }}>
            <label
              htmlFor="claims-start-date"
              style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--color-slate-700)',
                marginBottom: '0.35rem',
              }}
            >
              From
            </label>
            <input
              id="claims-start-date"
              type="date"
              data-testid="claims-start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-slate-300)',
                fontSize: '0.875rem',
                color: 'var(--color-slate-800)',
              }}
            />
          </div>

          <div style={{ flex: '1 1 140px', minWidth: '130px' }}>
            <label
              htmlFor="claims-end-date"
              style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--color-slate-700)',
                marginBottom: '0.35rem',
              }}
            >
              To
            </label>
            <input
              id="claims-end-date"
              type="date"
              data-testid="claims-end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-slate-300)',
                fontSize: '0.875rem',
                color: 'var(--color-slate-800)',
              }}
            />
          </div>

          {/* Reset Filters */}
          <div>
            <button
              type="button"
              data-testid="claims-reset-button"
              onClick={resetFilters}
              style={{
                padding: '0.5rem 0.875rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-slate-300)',
                backgroundColor: 'var(--color-slate-100)',
                color: 'var(--color-slate-700)',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Found Records & Page Size Counter */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--color-slate-100)',
            fontSize: '0.8125rem',
            color: 'var(--color-slate-600)',
          }}
        >
          <div data-testid="found-records-counter">
            Found <strong>{sortedClaims.length}</strong> records
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Show on page:</span>
            {[12, 24].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
                style={{
                  padding: '0.2rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${
                    pageSize === size ? 'var(--color-primary-600)' : 'var(--color-slate-300)'
                  }`,
                  backgroundColor:
                    pageSize === size ? 'var(--color-primary-50)' : 'var(--color-white)',
                  color:
                    pageSize === size ? 'var(--color-primary-700)' : 'var(--color-slate-700)',
                  fontWeight: pageSize === size ? 700 : 500,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <ClaimsTable
        claims={paginatedClaims}
        onDownloadAttachment={handleDownloadAttachment}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
      />

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div
          data-testid="claims-pagination"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
            marginTop: '0.5rem',
          }}
        >
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            style={{
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-slate-300)',
              backgroundColor: 'var(--color-white)',
              color: 'var(--color-slate-700)',
              fontSize: '0.8125rem',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage === 1 ? 0.5 : 1,
            }}
          >
            &lt;
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${
                  currentPage === page ? 'var(--color-primary-600)' : 'var(--color-slate-300)'
                }`,
                backgroundColor:
                  currentPage === page ? 'var(--color-primary-600)' : 'var(--color-white)',
                color: currentPage === page ? 'var(--color-white)' : 'var(--color-slate-700)',
                fontSize: '0.8125rem',
                fontWeight: currentPage === page ? 700 : 500,
                cursor: 'pointer',
              }}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            style={{
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-slate-300)',
              backgroundColor: 'var(--color-white)',
              color: 'var(--color-slate-700)',
              fontSize: '0.8125rem',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              opacity: currentPage === totalPages ? 0.5 : 1,
            }}
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
};
