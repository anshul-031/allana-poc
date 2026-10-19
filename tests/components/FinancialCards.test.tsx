import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import FinancialCards from '@/components/dashboard/FinancialCards';
import SalesOrgSelector from '@/components/dashboard/SalesOrgSelector';
import * as financialsActions from '@/server/actions/financials.actions';

vi.mock('@/server/actions/financials.actions', async () => {
  const actual = await vi.importActual<typeof financialsActions>(
    '@/server/actions/financials.actions'
  );
  return {
    ...actual,
    getCompanyFinancials: vi.fn(),
  };
});

const mockSalesOrgs: financialsActions.SalesOrgDTO[] = [
  {
    id: 'so-frozen',
    code: 'SO-1010',
    name: 'Allana Frozen Buffalo Meat Division',
    currency: 'USD',
  },
  {
    id: 'so-retail',
    code: 'SO-3030',
    name: 'IRAPL Retail & Consumer Pack Division',
    currency: 'USD',
  },
];

const mockFinancialsPositive: financialsActions.GetFinancialsResult = {
  success: true,
  financials: {
    creditLimit: 2500000,
    receivables: 1420500,
    overdueReceivables: 185000,
    availableLimit: 1079500,
    currency: 'USD',
    salesOrgId: 'so-frozen',
    salesOrgName: 'Allana Frozen Buffalo Meat Division',
    salesOrgCode: 'SO-1010',
    updatedAt: '2026-10-18T10:00:00.000Z',
    isDeficit: false,
  },
  availableSalesOrgs: mockSalesOrgs,
  selectedSalesOrgId: 'so-frozen',
};

const mockFinancialsDeficit: financialsActions.GetFinancialsResult = {
  success: true,
  financials: {
    creditLimit: 500000,
    receivables: 772796.96,
    overdueReceivables: 0,
    availableLimit: -272796.96,
    currency: 'USD',
    salesOrgId: 'so-retail',
    salesOrgName: 'IRAPL Retail & Consumer Pack Division',
    salesOrgCode: 'SO-3030',
    updatedAt: '2026-10-18T10:00:00.000Z',
    isDeficit: true,
  },
  availableSalesOrgs: mockSalesOrgs,
  selectedSalesOrgId: 'so-retail',
};

describe('Financial KPI Cards & Sales Org Selector (FEAT-2.2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('SalesOrgSelector Component', () => {
    it('returns null if salesOrgs array is empty', () => {
      const { container } = render(
        <SalesOrgSelector salesOrgs={[]} onSelect={vi.fn()} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders selector with options and calls onSelect on change', () => {
      const onSelect = vi.fn();
      render(
        <SalesOrgSelector
          salesOrgs={mockSalesOrgs}
          selectedSalesOrgId="so-frozen"
          onSelect={onSelect}
        />
      );

      const select = screen.getByTestId('sales-org-select');
      expect(select).toBeInTheDocument();
      expect(select).toHaveValue('so-frozen');

      fireEvent.change(select, { target: { value: 'so-retail' } });
      expect(onSelect).toHaveBeenCalledWith('so-retail');
    });
  });

  describe('FinancialCards Component', () => {
    it('renders 4 KPI cards with positive available limit and overdue alert badge', () => {
      render(<FinancialCards initialData={mockFinancialsPositive} />);

      expect(screen.getByText('Financial Indicators & Credit Facility')).toBeInTheDocument();
      expect(screen.getByTestId('sales-org-select')).toBeInTheDocument();

      // Card 1: Credit Limit
      expect(screen.getByTestId('value-credit-limit')).toHaveTextContent('$2,500,000.00 USD');

      // Card 2: Total Receivables
      expect(screen.getByTestId('value-receivables')).toHaveTextContent('$1,420,500.00 USD');

      // Card 3: Overdue Receivables (Action Required badge)
      expect(screen.getByTestId('value-overdue')).toHaveTextContent('$185,000.00 USD');
      expect(screen.getByTestId('badge-overdue-alert')).toHaveTextContent('Action Required');

      // Card 4: Available Limit (Available badge)
      expect(screen.getByTestId('value-available-limit')).toHaveTextContent('$1,079,500.00 USD');
      expect(screen.getByTestId('badge-available-status')).toHaveTextContent('Available');
    });

    it('renders negative available limit with Deficit Warning styling and zero overdue', () => {
      render(<FinancialCards initialData={mockFinancialsDeficit} />);

      // Zero overdue -> no action required badge
      expect(screen.getByTestId('value-overdue')).toHaveTextContent('$0.00 USD');
      expect(screen.queryByTestId('badge-overdue-alert')).not.toBeInTheDocument();

      // Deficit limit -> -$272,796.96 USD and Deficit Warning badge
      expect(screen.getByTestId('value-available-limit')).toHaveTextContent('-$272,796.96 USD');
      expect(screen.getByTestId('badge-available-status')).toHaveTextContent('Deficit Warning');
      expect(screen.getByText(/Credit limit exceeded/i)).toBeInTheDocument();
    });

    it('switches sales organization and updates KPI numbers', async () => {
      const onSalesOrgChange = vi.fn();
      vi.mocked(financialsActions.getCompanyFinancials).mockResolvedValue(mockFinancialsDeficit);

      render(
        <FinancialCards
          initialData={mockFinancialsPositive}
          companyId="comp-1"
          onSalesOrgChange={onSalesOrgChange}
        />
      );

      const select = screen.getByTestId('sales-org-select');
      fireEvent.change(select, { target: { value: 'so-retail' } });

      expect(onSalesOrgChange).toHaveBeenCalledWith('so-retail');

      await waitFor(() => {
        expect(financialsActions.getCompanyFinancials).toHaveBeenCalledWith({
          companyId: 'comp-1',
          salesOrgId: 'so-retail',
        });
        expect(screen.getByTestId('value-available-limit')).toHaveTextContent('-$272,796.96 USD');
      });
    });

    it('renders empty state when financials data is null', () => {
      render(
        <FinancialCards
          initialData={{
            success: true,
            financials: null,
            availableSalesOrgs: [],
          }}
        />
      );

      expect(screen.getByTestId('financial-empty-state')).toBeInTheDocument();
      expect(
        screen.getByText('No financial records configured for this operating entity.')
      ).toBeInTheDocument();
    });

    it('fetches financials on mount when initialData is not provided', async () => {
      vi.mocked(financialsActions.getCompanyFinancials).mockResolvedValue(mockFinancialsPositive);

      render(<FinancialCards companyId="comp-1" />);

      await waitFor(() => {
        expect(financialsActions.getCompanyFinancials).toHaveBeenCalledWith({
          companyId: 'comp-1',
          salesOrgId: undefined,
        });
        expect(screen.getByTestId('value-credit-limit')).toHaveTextContent('$2,500,000.00 USD');
      });
    });

    it('fetches financials on mount when companyId is not provided', async () => {
      vi.mocked(financialsActions.getCompanyFinancials).mockResolvedValue(mockFinancialsPositive);

      render(<FinancialCards />);

      await waitFor(() => {
        expect(financialsActions.getCompanyFinancials).toHaveBeenCalledWith({
          companyId: 'comp-lulu-uae',
          salesOrgId: undefined,
        });
      });
    });
  });
});
