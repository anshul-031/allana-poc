import React from 'react';
import { Metadata } from 'next';
import {
  getStatementOfAccount,
  getReceivablesAging,
} from '@/server/actions/reports.actions';
import ReportsPortalView from '@/components/reports/ReportsPortalView';

export const metadata: Metadata = {
  title: 'Financial Reports Center | Allana Customer Portal',
  description:
    'Statement of Account reconciliation, invoice schedules, and accounts receivables aging report center.',
};

export default async function ReportsPage() {
  const [statementRes, agingRes] = await Promise.all([
    getStatementOfAccount(),
    getReceivablesAging(),
  ]);

  return (
    <div data-testid="reports-page">
      <ReportsPortalView
        initialStatement={statementRes.statement}
        initialAging={agingRes.aging}
        primaryEmail={agingRes.primaryEmail}
      />
    </div>
  );
}
