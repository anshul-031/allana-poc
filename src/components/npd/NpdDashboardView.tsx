'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CustomProductRequestDTO } from '@/server/actions/npd.actions';
import NpdRequestTable from './NpdRequestTable';
import NpdDetailModal from './NpdDetailModal';

export interface NpdDashboardViewProps {
  initialRequests: CustomProductRequestDTO[];
}

export default function NpdDashboardView({ initialRequests }: NpdDashboardViewProps) {
  const [selectedRequest, setSelectedRequest] = useState<CustomProductRequestDTO | null>(null);

  return (
    <div data-testid="npd-dashboard-view">
      {/* Top Action Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1
            data-testid="npd-dashboard-title"
            style={{
              fontSize: 'var(--font-size-2xl, 24px)',
              fontWeight: 800,
              color: 'var(--color-primary-dark, #0a192f)',
              margin: '0 0 6px 0',
            }}
          >
            Customized Products &amp; NPD Requests
          </h1>
          <p
            style={{
              fontSize: 'var(--font-size-sm, 14px)',
              color: 'var(--color-text-secondary, #64748b)',
              margin: 0,
            }}
          >
            Track your new product development tickets, custom cut formulations, and plant feasibility reviews.
          </p>
        </div>

        <Link
          href="/customized-products/new"
          data-testid="create-npd-request-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--color-primary-dark, #0a192f)',
            color: '#ffffff',
            padding: '10px 20px',
            borderRadius: 'var(--border-radius-lg, 10px)',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 700,
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--color-gold, #c5a059)',
            cursor: 'pointer',
          }}
        >
          <span>➕</span> Create New Request
        </Link>
      </div>

      {/* Requests Table */}
      <NpdRequestTable
        requests={initialRequests}
        onSelectRequest={(req) => setSelectedRequest(req)}
      />

      {/* Detail Inspection Modal */}
      <NpdDetailModal
        request={selectedRequest}
        isOpen={Boolean(selectedRequest)}
        onClose={() => setSelectedRequest(null)}
      />
    </div>
  );
}
