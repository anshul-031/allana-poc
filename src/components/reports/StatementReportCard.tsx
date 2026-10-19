'use client';

import React, { useState } from 'react';
import {
  StatementOfAccountDTO,
  dispatchReportEmail,
  getStatementOfAccount,
} from '@/server/actions/reports.actions';

export interface StatementReportCardProps {
  initialStatement: StatementOfAccountDTO | null;
}

export default function StatementReportCard({ initialStatement }: StatementReportCardProps) {
  const [statement, setStatement] = useState<StatementOfAccountDTO | null>(initialStatement);
  const [fromDate, setFromDate] = useState<string>(initialStatement?.fromDate || '2026-10-01');
  const [toDate, setToDate] = useState<string>(initialStatement?.toDate || '2026-10-31');
  const [additionalEmail, setAdditionalEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const handleDateFilterChange = async (newFrom: string, newTo: string) => {
    setFromDate(newFrom);
    setToDate(newTo);
    setIsSubmitting(true);
    const res = await getStatementOfAccount({ fromDate: newFrom, toDate: newTo });
    setIsSubmitting(false);
    if (res.success && res.statement) {
      setStatement(res.statement);
    }
  };

  const handleSendEmail = async () => {
    setIsSubmitting(true);
    setFeedback(null);

    const res = await dispatchReportEmail({
      reportType: 'STATEMENT_OF_ACCOUNT',
      fromDate,
      toDate,
      additionalEmail: additionalEmail.trim() || null,
    });

    setIsSubmitting(false);

    if (res.success) {
      setFeedback({
        type: 'success',
        message: res.message || 'Statement of Account has been dispatched.',
      });
    } else {
      setFeedback({
        type: 'error',
        message: res.error || 'Failed to dispatch Statement of Account.',
      });
    }
  };

  const handleDownloadCsv = () => {
    if (!statement) return;

    const headers = ['Date', 'Document Number', 'Document Type', 'Description', 'Debit USD', 'Credit USD', 'Balance USD'];
    const rows = statement.transactions.map((t) => [
      t.date,
      t.docNumber,
      t.docType,
      `"${t.description.replace(/"/g, '""')}"`,
      t.debitUsd.toFixed(2),
      t.creditUsd.toFixed(2),
      t.balanceUsd.toFixed(2),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Statement_of_Account_${fromDate}_to_${toDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = () => {
    // Generates browser print dialog / simulated download
    window.print();
  };

  return (
    <div
      data-testid="statement-report-card"
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid var(--color-border, #e2e8f0)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
        marginBottom: '24px',
      }}
    >
      <div style={{ marginBottom: '20px' }}>
        <h2
          data-testid="statement-report-title"
          style={{
            fontSize: '18px',
            fontWeight: 800,
            color: 'var(--color-primary-dark, #0a192f)',
            margin: '0 0 6px 0',
          }}
        >
          Statement of Account (SOA)
        </h2>
        <p
          style={{
            fontSize: '13px',
            color: 'var(--color-text-secondary, #64748b)',
            margin: 0,
          }}
        >
          Reconcile commercial invoices, payments received, credit allowances, and running balances.
        </p>
      </div>

      {/* Date Range & Additional Email Form */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          alignItems: 'flex-start',
          marginBottom: '20px',
        }}
      >
        {/* Period (From - To) */}
        <div>
          <label
            htmlFor="soa-from-date"
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--color-text-secondary, #64748b)',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Period (From - To)
          </label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              id="soa-from-date"
              data-testid="soa-from-date"
              type="date"
              value={fromDate}
              onChange={(e) => handleDateFilterChange(e.target.value, toDate)}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid var(--color-border, #cbd5e1)',
                fontSize: '13px',
                color: 'var(--color-primary-dark, #0a192f)',
              }}
            />
            <span style={{ color: 'var(--color-text-secondary, #94a3b8)' }}>&ndash;</span>
            <input
              id="soa-to-date"
              data-testid="soa-to-date"
              type="date"
              value={toDate}
              onChange={(e) => handleDateFilterChange(fromDate, e.target.value)}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid var(--color-border, #cbd5e1)',
                fontSize: '13px',
                color: 'var(--color-primary-dark, #0a192f)',
              }}
            />
          </div>
        </div>

        {/* Additional Email */}
        <div>
          <label
            htmlFor="soa-additional-email"
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--color-text-secondary, #64748b)',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Additional e-mail
          </label>
          <input
            id="soa-additional-email"
            data-testid="soa-additional-email"
            type="email"
            placeholder="e.g. finance.controller@partner.com"
            value={additionalEmail}
            onChange={(e) => setAdditionalEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: '8px',
              border: '1px solid var(--color-border, #cbd5e1)',
              fontSize: '13px',
              color: 'var(--color-primary-dark, #0a192f)',
            }}
          />
          <span
            data-testid="soa-email-note"
            style={{
              display: 'block',
              fontSize: '11px',
              color: 'var(--color-text-secondary, #64748b)',
              marginTop: '4px',
              lineHeight: 1.4,
            }}
          >
            The report will be sent to the email specified in your account. To send a report to an
            additional email, add it to the appropriate field.
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          marginBottom: '24px',
          paddingBottom: '20px',
          borderBottom: '1px solid var(--color-border, #f1f5f9)',
        }}
      >
        <button
          type="button"
          data-testid="soa-send-email-btn"
          onClick={handleSendEmail}
          disabled={isSubmitting}
          style={{
            padding: '10px 18px',
            backgroundColor: 'var(--color-primary, #0f2b48)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>✉</span> Send to e-mail
        </button>

        <button
          type="button"
          data-testid="soa-download-pdf-btn"
          onClick={handleDownloadPdf}
          style={{
            padding: '10px 18px',
            backgroundColor: '#ffffff',
            color: 'var(--color-primary-dark, #0a192f)',
            border: '1px solid var(--color-border, #cbd5e1)',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>📄</span> Download PDF
        </button>

        <button
          type="button"
          data-testid="soa-download-excel-btn"
          onClick={handleDownloadCsv}
          style={{
            padding: '10px 18px',
            backgroundColor: '#ffffff',
            color: '#16a34a',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>📊</span> Download Excel
        </button>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          data-testid={`soa-alert-${feedback.type}`}
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '13px',
            fontWeight: 600,
            backgroundColor: feedback.type === 'success' ? '#f0fdf4' : '#fef2f2',
            color: feedback.type === 'success' ? '#15803d' : '#b91c1c',
            border: feedback.type === 'success' ? '1px solid #bbf7d0' : '1px solid #fecaca',
          }}
        >
          {feedback.message}
        </div>
      )}

      {/* Transactions Summary Table */}
      {statement && statement.transactions.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table
            data-testid="soa-transactions-table"
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13px',
              textAlign: 'left',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px 14px', color: '#64748b', fontWeight: 700 }}>Date</th>
                <th style={{ padding: '12px 14px', color: '#64748b', fontWeight: 700 }}>Document</th>
                <th style={{ padding: '12px 14px', color: '#64748b', fontWeight: 700 }}>Description</th>
                <th style={{ padding: '12px 14px', textAlign: 'right', color: '#64748b', fontWeight: 700 }}>
                  Debit ($)
                </th>
                <th style={{ padding: '12px 14px', textAlign: 'right', color: '#64748b', fontWeight: 700 }}>
                  Credit ($)
                </th>
                <th style={{ padding: '12px 14px', textAlign: 'right', color: '#0a192f', fontWeight: 800 }}>
                  Balance ($)
                </th>
              </tr>
            </thead>
            <tbody>
              {statement.transactions.map((tx) => (
                <tr
                  key={tx.id}
                  data-testid={`soa-tx-row-${tx.docNumber}`}
                  style={{ borderBottom: '1px solid #f1f5f9' }}
                >
                  <td style={{ padding: '12px 14px', color: '#475569' }}>{tx.date}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0f2b48' }}>
                    {tx.docNumber}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#64748b' }}>{tx.description}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 600 }}>
                    {tx.debitUsd > 0 ? `$${tx.debitUsd.toLocaleString('en-US')}` : '-'}
                  </td>
                  <td
                    style={{
                      padding: '12px 14px',
                      textAlign: 'right',
                      fontWeight: 600,
                      color: tx.creditUsd > 0 ? '#16a34a' : 'inherit',
                    }}
                  >
                    {tx.creditUsd > 0 ? `$${tx.creditUsd.toLocaleString('en-US')}` : '-'}
                  </td>
                  <td
                    style={{
                      padding: '12px 14px',
                      textAlign: 'right',
                      fontWeight: 800,
                      color: '#0a192f',
                    }}
                  >
                    ${tx.balanceUsd.toLocaleString('en-US')}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr
                style={{
                  backgroundColor: '#f8fafc',
                  borderTop: '2px solid #e2e8f0',
                  fontWeight: 800,
                }}
              >
                <td colSpan={3} style={{ padding: '14px' }}>
                  Closing Balance as of {statement.toDate}
                </td>
                <td style={{ padding: '14px', textAlign: 'right' }}>
                  ${statement.totalDebitsUsd.toLocaleString('en-US')}
                </td>
                <td style={{ padding: '14px', textAlign: 'right', color: '#16a34a' }}>
                  ${statement.totalCreditsUsd.toLocaleString('en-US')}
                </td>
                <td
                  data-testid="soa-closing-balance"
                  style={{
                    padding: '14px',
                    textAlign: 'right',
                    color: 'var(--color-primary-dark, #0a192f)',
                    fontSize: '14px',
                  }}
                >
                  ${statement.closingBalanceUsd.toLocaleString('en-US')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <div data-testid="soa-empty-notice" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
          No transactions found for the specified period.
        </div>
      )}
    </div>
  );
}
