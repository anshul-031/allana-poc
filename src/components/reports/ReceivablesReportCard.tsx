'use client';

import React, { useState } from 'react';
import {
  ReceivablesAgingSchedule,
  AgingBucketSummary,
} from '@/lib/aging-calc';
import {
  dispatchReportEmail,
  getReceivablesAging,
} from '@/server/actions/reports.actions';

export interface ReceivablesReportCardProps {
  initialAging: ReceivablesAgingSchedule | null;
  primaryEmail?: string;
}

export default function ReceivablesReportCard({
  initialAging,
  primaryEmail = 'procurement@partner.com',
}: ReceivablesReportCardProps) {
  const [aging, setAging] = useState<ReceivablesAgingSchedule | null>(initialAging);
  const [asOfDate, setAsOfDate] = useState<string>(
    initialAging?.asOfDate || new Date().toISOString().split('T')[0]
  );
  const [additionalEmail, setAdditionalEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const handleDateChange = async (newDate: string) => {
    setAsOfDate(newDate);
    setIsSubmitting(true);
    const res = await getReceivablesAging({ asOfDate: newDate });
    setIsSubmitting(false);
    if (res.success && res.aging) {
      setAging(res.aging);
    }
  };

  const handleSendEmail = async () => {
    setIsSubmitting(true);
    setFeedback(null);

    const res = await dispatchReportEmail({
      reportType: 'RECEIVABLES_AGING',
      asOfDate,
      additionalEmail: additionalEmail.trim() || null,
    });

    setIsSubmitting(false);

    if (res.success) {
      setFeedback({
        type: 'success',
        message: res.message || 'Receivables Aging report dispatched.',
      });
    } else {
      setFeedback({
        type: 'error',
        message: res.error || 'Failed to dispatch Receivables Aging report.',
      });
    }
  };

  const handleDownloadCsv = () => {
    if (!aging) return;

    const headers = [
      'Invoice Number',
      'Order Number',
      'Invoice Date',
      'Due Date',
      'Overdue Days',
      'Aging Bucket',
      'Total Amount USD',
      'Paid Amount USD',
      'Outstanding USD',
    ];

    const rows = aging.invoices.map((inv) => [
      inv.invoiceNumber,
      inv.orderNumber,
      inv.invoiceDate,
      inv.dueDate,
      inv.overdueDays,
      inv.bucket,
      inv.amountUsd.toFixed(2),
      inv.paidAmountUsd.toFixed(2),
      inv.outstandingAmountUsd.toFixed(2),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receivables_Aging_Report_${asOfDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  return (
    <div
      data-testid="receivables-report-card"
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
          data-testid="receivables-report-title"
          style={{
            fontSize: '18px',
            fontWeight: 800,
            color: 'var(--color-primary-dark, #0a192f)',
            margin: '0 0 6px 0',
          }}
        >
          Accounts Receivables Aging Schedule
        </h2>
        <p
          style={{
            fontSize: '13px',
            color: 'var(--color-text-secondary, #64748b)',
            margin: 0,
          }}
        >
          Monitor outstanding balances categorized by payment due aging brackets (Current, 1–30, 31–60,
          61–90, &gt;90 Days).
        </p>
      </div>

      {/* Date Picker & Additional Email Form */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          alignItems: 'flex-start',
          marginBottom: '20px',
        }}
      >
        {/* As-Of Date */}
        <div>
          <label
            htmlFor="aging-as-of-date"
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
            Period (As of Date)
          </label>
          <input
            id="aging-as-of-date"
            data-testid="aging-as-of-date"
            type="date"
            value={asOfDate}
            onChange={(e) => handleDateChange(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: '8px',
              border: '1px solid var(--color-border, #cbd5e1)',
              fontSize: '13px',
              color: 'var(--color-primary-dark, #0a192f)',
            }}
          />
        </div>

        {/* Additional Email */}
        <div>
          <label
            htmlFor="aging-additional-email"
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
            id="aging-additional-email"
            data-testid="aging-additional-email"
            type="email"
            placeholder="e.g. accounting@partner.com"
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
            data-testid="aging-email-note"
            style={{
              display: 'block',
              fontSize: '11px',
              color: 'var(--color-text-secondary, #64748b)',
              marginTop: '4px',
              lineHeight: 1.4,
            }}
          >
            The report will be sent to {primaryEmail}. To send a copy to an additional recipient, add it
            above.
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
          data-testid="aging-send-email-btn"
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
          data-testid="aging-download-pdf-btn"
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
          data-testid="aging-download-excel-btn"
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
          data-testid={`aging-alert-${feedback.type}`}
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

      {aging && aging.invoices.length > 0 ? (
        <div>
          {/* 5 Aging Bucket Summary Cards */}
          <div
            data-testid="aging-brackets-container"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '12px',
              marginBottom: '24px',
            }}
          >
            {aging.buckets.map((b: AgingBucketSummary) => {
              const isOverdue = b.bucket !== 'CURRENT';
              return (
                <div
                  key={b.bucket}
                  data-testid={`aging-bucket-card-${b.bucket}`}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    backgroundColor: isOverdue && b.amountUsd > 0 ? '#fef2f2' : '#f8fafc',
                    border:
                      isOverdue && b.amountUsd > 0
                        ? '1px solid #fecaca'
                        : '1px solid var(--color-border, #e2e8f0)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: isOverdue && b.amountUsd > 0 ? '#b91c1c' : '#64748b',
                      textTransform: 'uppercase',
                      marginBottom: '4px',
                    }}
                  >
                    {b.label}
                  </div>
                  <div
                    style={{
                      fontSize: '16px',
                      fontWeight: 800,
                      color: isOverdue && b.amountUsd > 0 ? '#b91c1c' : '#0a192f',
                      marginBottom: '4px',
                    }}
                  >
                    ${b.amountUsd.toLocaleString('en-US')}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
                    {b.invoiceCount} invoices &bull; {b.percentage}%
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Invoice Schedule Table */}
          <div style={{ overflowX: 'auto' }}>
            <table
              data-testid="aging-invoices-table"
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '13px',
                textAlign: 'left',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 14px', color: '#64748b', fontWeight: 700 }}>Invoice #</th>
                  <th style={{ padding: '12px 14px', color: '#64748b', fontWeight: 700 }}>Order #</th>
                  <th style={{ padding: '12px 14px', color: '#64748b', fontWeight: 700 }}>Invoice Date</th>
                  <th style={{ padding: '12px 14px', color: '#64748b', fontWeight: 700 }}>Due Date</th>
                  <th style={{ padding: '12px 14px', color: '#64748b', fontWeight: 700 }}>Overdue Days</th>
                  <th style={{ padding: '12px 14px', color: '#64748b', fontWeight: 700 }}>Aging Bucket</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right', color: '#0a192f', fontWeight: 800 }}>
                    Outstanding ($)
                  </th>
                </tr>
              </thead>
              <tbody>
                {aging.invoices.map((inv) => {
                  const isOverdue = inv.bucket !== 'CURRENT';
                  return (
                    <tr
                      key={inv.id}
                      data-testid={`aging-inv-row-${inv.invoiceNumber}`}
                      style={{ borderBottom: '1px solid #f1f5f9' }}
                    >
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0f2b48' }}>
                        {inv.invoiceNumber}
                      </td>
                      <td style={{ padding: '12px 14px', color: '#475569' }}>{inv.orderNumber}</td>
                      <td style={{ padding: '12px 14px', color: '#64748b' }}>{inv.invoiceDate}</td>
                      <td style={{ padding: '12px 14px', color: '#64748b' }}>{inv.dueDate}</td>
                      <td style={{ padding: '12px 14px', fontWeight: isOverdue ? 700 : 500, color: isOverdue ? '#b91c1c' : '#475569' }}>
                        {inv.overdueDays > 0 ? `${inv.overdueDays} days` : 'On time'}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '10px',
                            fontSize: '11px',
                            fontWeight: 700,
                            backgroundColor: isOverdue ? '#fee2e2' : '#f0fdf4',
                            color: isOverdue ? '#b91c1c' : '#15803d',
                          }}
                        >
                          {inv.bucket}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: '12px 14px',
                          textAlign: 'right',
                          fontWeight: 800,
                          color: '#0a192f',
                        }}
                      >
                        ${inv.outstandingAmountUsd.toLocaleString('en-US')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr
                  style={{
                    backgroundColor: '#f8fafc',
                    borderTop: '2px solid #e2e8f0',
                    fontWeight: 800,
                  }}
                >
                  <td colSpan={6} style={{ padding: '14px' }}>
                    Total Outstanding Receivables
                  </td>
                  <td
                    data-testid="aging-total-receivables"
                    style={{
                      padding: '14px',
                      textAlign: 'right',
                      color: 'var(--color-primary-dark, #0a192f)',
                      fontSize: '14px',
                    }}
                  >
                    ${aging.totalReceivablesUsd.toLocaleString('en-US')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : (
        <div data-testid="aging-empty-notice" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
          No outstanding receivables found as of {asOfDate}.
        </div>
      )}
    </div>
  );
}
