'use client';

import React, { useState } from 'react';
import {
  StatementOfAccountDTO,
} from '@/server/actions/reports.actions';
import { ReceivablesAgingSchedule } from '@/lib/aging-calc';
import StatementReportCard from './StatementReportCard';
import ReceivablesReportCard from './ReceivablesReportCard';

export interface ReportsPortalViewProps {
  initialStatement: StatementOfAccountDTO | null;
  initialAging: ReceivablesAgingSchedule | null;
  primaryEmail: string;
}

export type ReportTabType = 'STATEMENT' | 'AGING' | 'ALL';

export default function ReportsPortalView({
  initialStatement,
  initialAging,
  primaryEmail,
}: ReportsPortalViewProps) {
  const [activeTab, setActiveTab] = useState<ReportTabType>('STATEMENT');

  return (
    <div data-testid="reports-portal-view">
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1
          data-testid="reports-page-title"
          style={{
            fontSize: 'var(--font-size-2xl, 24px)',
            fontWeight: 800,
            color: 'var(--color-primary-dark, #0a192f)',
            margin: '0 0 6px 0',
          }}
        >
          Financial Reports &amp; Reconciliation Center
        </h1>
        <p
          style={{
            fontSize: 'var(--font-size-sm, 14px)',
            color: 'var(--color-text-secondary, #64748b)',
            margin: 0,
          }}
        >
          Generate certified Statements of Account (SOA), inspect payment reconciliation schedules, and
          analyze Accounts Receivables aging brackets with direct exports.
        </p>
      </div>

      {/* Report Type Navigation Tabs */}
      <div
        data-testid="reports-tab-nav"
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          borderBottom: '1px solid var(--color-border, #e2e8f0)',
          paddingBottom: '8px',
        }}
      >
        <button
          type="button"
          data-testid="tab-statement"
          onClick={() => setActiveTab('STATEMENT')}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            backgroundColor: activeTab === 'STATEMENT' ? 'var(--color-primary-dark, #0a192f)' : 'transparent',
            color: activeTab === 'STATEMENT' ? '#ffffff' : 'var(--color-text-secondary, #64748b)',
            transition: 'all 0.2s',
          }}
        >
          Statement of Account (SOA)
        </button>

        <button
          type="button"
          data-testid="tab-aging"
          onClick={() => setActiveTab('AGING')}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            backgroundColor: activeTab === 'AGING' ? 'var(--color-primary-dark, #0a192f)' : 'transparent',
            color: activeTab === 'AGING' ? '#ffffff' : 'var(--color-text-secondary, #64748b)',
            transition: 'all 0.2s',
          }}
        >
          Accounts Receivables Aging
        </button>

        <button
          type="button"
          data-testid="tab-all"
          onClick={() => setActiveTab('ALL')}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            backgroundColor: activeTab === 'ALL' ? 'var(--color-primary-dark, #0a192f)' : 'transparent',
            color: activeTab === 'ALL' ? '#ffffff' : 'var(--color-text-secondary, #64748b)',
            transition: 'all 0.2s',
          }}
        >
          All Reports View
        </button>
      </div>

      {/* Render Active Cards */}
      {(activeTab === 'STATEMENT' || activeTab === 'ALL') && (
        <StatementReportCard initialStatement={initialStatement} />
      )}

      {(activeTab === 'AGING' || activeTab === 'ALL') && (
        <ReceivablesReportCard initialAging={initialAging} primaryEmail={primaryEmail} />
      )}
    </div>
  );
}
