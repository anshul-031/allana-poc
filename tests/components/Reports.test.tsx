import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StatementReportCard from '@/components/reports/StatementReportCard';
import ReceivablesReportCard from '@/components/reports/ReceivablesReportCard';
import ReportsPortalView from '@/components/reports/ReportsPortalView';
import ReportsPage from '@/app/(portal)/reports/page';
import * as reportsActions from '@/server/actions/reports.actions';
import {
  StatementOfAccountDTO,
} from '@/server/actions/reports.actions';
import { ReceivablesAgingSchedule } from '@/lib/aging-calc';

const mockStatement: StatementOfAccountDTO = {
  companyName: 'Global Foods Trading LLC',
  companyCode: 'COMP-SA-001',
  primaryEmail: 'procurement@globalfoods.com',
  fromDate: '2026-10-01',
  toDate: '2026-10-31',
  openingBalanceUsd: 145000,
  totalDebitsUsd: 500200,
  totalCreditsUsd: 153500,
  closingBalanceUsd: 346700,
  transactions: [
    {
      id: 'tx-0',
      date: '2026-10-01',
      docNumber: 'OP-BAL',
      docType: 'OPENING_BALANCE',
      description: 'Opening balance',
      debitUsd: 145000,
      creditUsd: 0,
      balanceUsd: 145000,
    },
    {
      id: 'tx-1',
      date: '2026-10-04',
      docNumber: 'INV-2026-88192',
      docType: 'INVOICE',
      description: 'Shipment ORD-2026-88192',
      debitUsd: 220800,
      creditUsd: 0,
      balanceUsd: 365800,
    },
    {
      id: 'tx-2',
      date: '2026-10-08',
      docNumber: 'PAY-77182',
      docType: 'PAYMENT',
      description: 'Payment wire transfer',
      debitUsd: 0,
      creditUsd: 145000,
      balanceUsd: 220800,
    },
  ],
};

const mockAging: ReceivablesAgingSchedule = {
  asOfDate: '2026-10-15',
  totalReceivablesUsd: 457700,
  totalOverdueUsd: 236900,
  overduePercentage: 51.8,
  currentAmountUsd: 220800,
  days1to30AmountUsd: 84400,
  days31to60AmountUsd: 96000,
  days61to90AmountUsd: 26500,
  over90AmountUsd: 30000,
  buckets: [
    {
      bucket: 'CURRENT',
      label: 'Current (Not Due)',
      amountUsd: 220800,
      invoiceCount: 1,
      percentage: 48.2,
    },
    {
      bucket: 'DAYS_1_30',
      label: '1–30 Days Overdue',
      amountUsd: 84400,
      invoiceCount: 1,
      percentage: 18.4,
    },
    {
      bucket: 'DAYS_31_60',
      label: '31–60 Days Overdue',
      amountUsd: 96000,
      invoiceCount: 1,
      percentage: 21.0,
    },
    {
      bucket: 'DAYS_61_90',
      label: '61–90 Days Overdue',
      amountUsd: 26500,
      invoiceCount: 1,
      percentage: 5.8,
    },
    {
      bucket: 'OVER_90',
      label: '>90 Days Overdue',
      amountUsd: 30000,
      invoiceCount: 1,
      percentage: 6.6,
    },
  ],
  invoices: [
    {
      id: 'inv-1',
      invoiceNumber: 'INV-2026-88192',
      orderNumber: 'ORD-2026-88192',
      invoiceDate: '2026-10-04',
      dueDate: '2026-11-03',
      amountUsd: 220800,
      paidAmountUsd: 0,
      outstandingAmountUsd: 220800,
      overdueDays: 0,
      bucket: 'CURRENT',
    },
    {
      id: 'inv-2',
      invoiceNumber: 'INV-2026-88045',
      orderNumber: 'ORD-2026-88045',
      invoiceDate: '2026-09-15',
      dueDate: '2026-10-15',
      amountUsd: 134400,
      paidAmountUsd: 50000,
      outstandingAmountUsd: 84400,
      overdueDays: 4,
      bucket: 'DAYS_1_30',
    },
  ],
};

describe('Module 7: Financial Reports Center Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if (!window.URL.createObjectURL) {
      window.URL.createObjectURL = vi.fn().mockReturnValue('blob:test-url');
    }
    if (!window.URL.revokeObjectURL) {
      window.URL.revokeObjectURL = vi.fn();
    }
  });

  describe('StatementReportCard', () => {
    it('renders statement title, dates, email field, note, and transactions', () => {
      render(<StatementReportCard initialStatement={mockStatement} />);

      expect(screen.getByTestId('statement-report-title')).toHaveTextContent(
        'Statement of Account (SOA)'
      );
      expect(screen.getByTestId('soa-email-note')).toHaveTextContent(
        'The report will be sent to the email specified in your account'
      );
      expect(screen.getByTestId('soa-closing-balance')).toHaveTextContent('$346,700');
      expect(screen.getByTestId('soa-tx-row-INV-2026-88192')).toBeInTheDocument();
    });

    it('handles date filter changes and fetches updated statement', async () => {
      vi.spyOn(reportsActions, 'getStatementOfAccount').mockResolvedValueOnce({
        success: true,
        statement: {
          ...mockStatement,
          fromDate: '2026-10-05',
        },
      });

      render(<StatementReportCard initialStatement={mockStatement} />);

      fireEvent.change(screen.getByTestId('soa-from-date'), {
        target: { value: '2026-10-05' },
      });

      await waitFor(() => {
        expect(reportsActions.getStatementOfAccount).toHaveBeenCalledWith({
          fromDate: '2026-10-05',
          toDate: '2026-10-31',
        });
      });

      // Change to-date
      fireEvent.change(screen.getByTestId('soa-to-date'), {
        target: { value: '2026-10-25' },
      });

      await waitFor(() => {
        expect(reportsActions.getStatementOfAccount).toHaveBeenCalledWith({
          fromDate: '2026-10-05',
          toDate: '2026-10-25',
        });
      });
    });

    it('handles failure when date filter change fails and handles null statement CSV download', async () => {
      vi.spyOn(reportsActions, 'getStatementOfAccount').mockResolvedValueOnce({
        success: false,
        error: 'Failed to retrieve statement',
        statement: null,
      });

      const { rerender } = render(<StatementReportCard initialStatement={null} />);

      // Trigger date change with failure response
      fireEvent.change(screen.getByTestId('soa-from-date'), {
        target: { value: '2026-09-01' },
      });

      // Trigger download CSV when statement is null (early return)
      fireEvent.click(screen.getByTestId('soa-download-excel-btn'));

      await waitFor(() => {
        expect(reportsActions.getStatementOfAccount).toHaveBeenCalled();
      });
    });

    it('dispatches email and displays success alert', async () => {
      vi.spyOn(reportsActions, 'dispatchReportEmail').mockResolvedValueOnce({
        success: true,
        message: 'Statement dispatched successfully',
        recipients: ['finance@partner.com'],
      });

      render(<StatementReportCard initialStatement={mockStatement} />);

      fireEvent.change(screen.getByTestId('soa-additional-email'), {
        target: { value: 'finance@partner.com' },
      });

      fireEvent.click(screen.getByTestId('soa-send-email-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('soa-alert-success')).toHaveTextContent(
          'Statement dispatched successfully'
        );
      });
    });

    it('displays error alert when email dispatch fails', async () => {
      vi.spyOn(reportsActions, 'dispatchReportEmail').mockResolvedValueOnce({
        success: false,
        error: 'Mail server unreachable',
        recipients: [],
      });

      render(<StatementReportCard initialStatement={mockStatement} />);

      fireEvent.click(screen.getByTestId('soa-send-email-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('soa-alert-error')).toHaveTextContent(
          'Mail server unreachable'
        );
      });
    });

    it('handles PDF download via window.print and Excel CSV export', () => {
      const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
      const createObjectURLSpy = vi
        .spyOn(window.URL, 'createObjectURL')
        .mockReturnValue('blob:test-url');
      const revokeObjectURLSpy = vi
        .spyOn(window.URL, 'revokeObjectURL')
        .mockImplementation(() => {});

      render(<StatementReportCard initialStatement={mockStatement} />);

      // Download PDF
      fireEvent.click(screen.getByTestId('soa-download-pdf-btn'));
      expect(printSpy).toHaveBeenCalled();

      // Download Excel CSV
      fireEvent.click(screen.getByTestId('soa-download-excel-btn'));
      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalled();

      printSpy.mockRestore();
      createObjectURLSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
    });

    it('renders empty notice when transactions are empty', () => {
      render(
        <StatementReportCard
          initialStatement={{
            ...mockStatement,
            transactions: [],
          }}
        />
      );

      expect(screen.getByTestId('soa-empty-notice')).toBeInTheDocument();
    });
  });

  describe('ReceivablesReportCard', () => {
    it('renders title, as-of date, 5 aging brackets, and invoices table', () => {
      render(<ReceivablesReportCard initialAging={mockAging} />);

      expect(screen.getByTestId('receivables-report-title')).toHaveTextContent(
        'Accounts Receivables Aging Schedule'
      );
      expect(screen.getByTestId('aging-total-receivables')).toHaveTextContent('$457,700');
      expect(screen.getByTestId('aging-bucket-card-CURRENT')).toHaveTextContent('$220,800');
      expect(screen.getByTestId('aging-bucket-card-DAYS_1_30')).toHaveTextContent('$84,400');
      expect(screen.getByTestId('aging-inv-row-INV-2026-88192')).toBeInTheDocument();
    });

    it('handles as-of date changes and fetches recalculated aging schedule, and handles failure', async () => {
      vi.spyOn(reportsActions, 'getReceivablesAging')
        .mockResolvedValueOnce({
          success: true,
          aging: {
            ...mockAging,
            asOfDate: '2026-10-31',
          },
          primaryEmail: 'procurement@globalfoods.com',
        })
        .mockResolvedValueOnce({
          success: false,
          error: 'Failed to calculate aging',
          aging: null,
          primaryEmail: 'procurement@globalfoods.com',
        });

      render(<ReceivablesReportCard initialAging={mockAging} />);

      fireEvent.change(screen.getByTestId('aging-as-of-date'), {
        target: { value: '2026-10-31' },
      });

      await waitFor(() => {
        expect(reportsActions.getReceivablesAging).toHaveBeenCalledWith({
          asOfDate: '2026-10-31',
        });
      });

      // Second change with failure response
      fireEvent.change(screen.getByTestId('aging-as-of-date'), {
        target: { value: '2026-11-15' },
      });

      await waitFor(() => {
        expect(reportsActions.getReceivablesAging).toHaveBeenCalledWith({
          asOfDate: '2026-11-15',
        });
      });
    });

    it('dispatches aging report email and handles success & error alerts', async () => {
      vi.spyOn(reportsActions, 'dispatchReportEmail')
        .mockResolvedValueOnce({
          success: true,
          message: 'Aging schedule dispatched',
          recipients: ['treasury@partner.com'],
        })
        .mockResolvedValueOnce({
          success: false,
          error: 'SMTP dispatch failed',
          recipients: [],
        });

      render(<ReceivablesReportCard initialAging={mockAging} />);

      fireEvent.change(screen.getByTestId('aging-additional-email'), {
        target: { value: 'treasury@partner.com' },
      });
      fireEvent.click(screen.getByTestId('aging-send-email-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('aging-alert-success')).toHaveTextContent(
          'Aging schedule dispatched'
        );
      });

      // Dispatch failure
      fireEvent.click(screen.getByTestId('aging-send-email-btn'));
      await waitFor(() => {
        expect(screen.getByTestId('aging-alert-error')).toHaveTextContent(
          'SMTP dispatch failed'
        );
      });
    });

    it('handles PDF print, Excel CSV export, and null aging early return', () => {
      const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
      const createObjectURLSpy = vi
        .spyOn(window.URL, 'createObjectURL')
        .mockReturnValue('blob:test-url');
      const revokeObjectURLSpy = vi
        .spyOn(window.URL, 'revokeObjectURL')
        .mockImplementation(() => {});

      const { rerender } = render(<ReceivablesReportCard initialAging={mockAging} />);

      fireEvent.click(screen.getByTestId('aging-download-pdf-btn'));
      expect(printSpy).toHaveBeenCalled();

      fireEvent.click(screen.getByTestId('aging-download-excel-btn'));
      expect(createObjectURLSpy).toHaveBeenCalled();

      // Render with null aging and verify early return
      rerender(<ReceivablesReportCard initialAging={null} />);
      fireEvent.click(screen.getByTestId('aging-download-excel-btn'));

      printSpy.mockRestore();
      createObjectURLSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
    });

    it('renders empty notice when invoices are empty', () => {
      render(
        <ReceivablesReportCard
          initialAging={{
            ...mockAging,
            invoices: [],
          }}
        />
      );

      expect(screen.getByTestId('aging-empty-notice')).toBeInTheDocument();
    });
  });

  describe('ReportsPortalView & ReportsPage', () => {
    it('switches between Statement, Aging, and All report tabs', () => {
      render(
        <ReportsPortalView
          initialStatement={mockStatement}
          initialAging={mockAging}
          primaryEmail="test@domain.com"
        />
      );

      expect(screen.getByTestId('reports-page-title')).toHaveTextContent(
        'Financial Reports & Reconciliation Center'
      );

      // Default: Statement card visible, Aging card not visible
      expect(screen.getByTestId('statement-report-card')).toBeInTheDocument();
      expect(screen.queryByTestId('receivables-report-card')).not.toBeInTheDocument();

      // Switch to Aging tab
      fireEvent.click(screen.getByTestId('tab-aging'));
      expect(screen.queryByTestId('statement-report-card')).not.toBeInTheDocument();
      expect(screen.getByTestId('receivables-report-card')).toBeInTheDocument();

      // Switch to All tab
      fireEvent.click(screen.getByTestId('tab-all'));
      expect(screen.getByTestId('statement-report-card')).toBeInTheDocument();
      expect(screen.getByTestId('receivables-report-card')).toBeInTheDocument();

      // Switch back to Statement tab
      fireEvent.click(screen.getByTestId('tab-statement'));
      expect(screen.getByTestId('statement-report-card')).toBeInTheDocument();
      expect(screen.queryByTestId('receivables-report-card')).not.toBeInTheDocument();
    });

    it('renders ReportsPage server component and fetches initial reports', async () => {
      vi.spyOn(reportsActions, 'getStatementOfAccount').mockResolvedValueOnce({
        success: true,
        statement: mockStatement,
      });

      vi.spyOn(reportsActions, 'getReceivablesAging').mockResolvedValueOnce({
        success: true,
        aging: mockAging,
        primaryEmail: 'test@domain.com',
      });

      const element = await ReportsPage();
      render(element);

      expect(screen.getByTestId('reports-page')).toBeInTheDocument();
      expect(screen.getByTestId('statement-report-card')).toBeInTheDocument();
    });
  });
});
