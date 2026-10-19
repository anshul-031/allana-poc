import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SalesPlanFilterBar from '@/components/sales-plan/SalesPlanFilterBar';
import SalesPlanGrid from '@/components/sales-plan/SalesPlanGrid';
import SalesPlanPortalView from '@/components/sales-plan/SalesPlanPortalView';
import SalesPlanPage from '@/app/(portal)/sales-plan/page';
import * as salesPlanActions from '@/server/actions/sales-plan.actions';
import { GetSalesPlanResult } from '@/server/actions/sales-plan.actions';
import { SalesPlanSummary } from '@/lib/sales-plan-calc';

const mockSummary: SalesPlanSummary = {
  countries: [
    {
      country: 'Saudi Arabia',
      shipToGroups: [
        {
          shipToParty: 'Carrefour Riyadh Central Logistics Hub',
          items: [
            {
              id: 'item-1',
              sku: 'AL-BUF-TOP-01',
              skuName: 'Frozen Boneless Buffalo Topside 20kg (SAP: 7940)',
              targetTonnes: 120,
              targetUsd: 576000,
              lastMonthBalanceTonnes: 15,
              lastMonthBalanceUsd: 72000,
              shippedTonnes: 72,
              shippedUsd: 345600,
              pipelineTonnes: 48,
              pipelineUsd: 230400,
              deltaTonnes: 0,
              deltaUsd: 0,
              statusTonnes: 'SURPLUS',
              statusUsd: 'SURPLUS',
            },
            {
              id: 'item-2',
              sku: 'AL-BUF-SIL-01',
              skuName: 'Frozen Boneless Buffalo Silverside 20kg (SAP: 7941)',
              targetTonnes: 90,
              targetUsd: 414000,
              lastMonthBalanceTonnes: 0,
              lastMonthBalanceUsd: 0,
              shippedTonnes: 54,
              shippedUsd: 248400,
              pipelineTonnes: 26,
              pipelineUsd: 119600,
              deltaTonnes: -10,
              deltaUsd: -46000,
              statusTonnes: 'DEFICIT',
              statusUsd: 'DEFICIT',
            },
          ],
          totals: {
            targetTonnes: 210,
            targetUsd: 990000,
            lastMonthBalanceTonnes: 15,
            lastMonthBalanceUsd: 72000,
            shippedTonnes: 126,
            shippedUsd: 594000,
            pipelineTonnes: 74,
            pipelineUsd: 350000,
            deltaTonnes: -10,
            deltaUsd: -46000,
            statusTonnes: 'DEFICIT',
            statusUsd: 'DEFICIT',
          },
        },
      ],
      totals: {
        targetTonnes: 210,
        targetUsd: 990000,
        lastMonthBalanceTonnes: 15,
        lastMonthBalanceUsd: 72000,
        shippedTonnes: 126,
        shippedUsd: 594000,
        pipelineTonnes: 74,
        pipelineUsd: 350000,
        deltaTonnes: -10,
        deltaUsd: -46000,
        statusTonnes: 'DEFICIT',
        statusUsd: 'DEFICIT',
        totalSkus: 2,
      },
    },
    {
      country: 'United Arab Emirates',
      shipToGroups: [
        {
          shipToParty: 'LuLu Group Logistics JAFZA Dubai',
          items: [
            {
              id: 'item-3',
              sku: 'AL-BUF-STR-01',
              skuName: 'Frozen Boneless Buffalo Striploin 20kg (SAP: 7942)',
              targetTonnes: 100,
              targetUsd: 480000,
              lastMonthBalanceTonnes: 10,
              lastMonthBalanceUsd: 48000,
              shippedTonnes: 90,
              shippedUsd: 432000,
              pipelineTonnes: 30,
              pipelineUsd: 144000,
              deltaTonnes: 20,
              deltaUsd: 96000,
              statusTonnes: 'SURPLUS',
              statusUsd: 'SURPLUS',
            },
          ],
          totals: {
            targetTonnes: 100,
            targetUsd: 480000,
            lastMonthBalanceTonnes: 10,
            lastMonthBalanceUsd: 48000,
            shippedTonnes: 90,
            shippedUsd: 432000,
            pipelineTonnes: 30,
            pipelineUsd: 144000,
            deltaTonnes: 20,
            deltaUsd: 96000,
            statusTonnes: 'SURPLUS',
            statusUsd: 'SURPLUS',
          },
        },
      ],
      totals: {
        targetTonnes: 100,
        targetUsd: 480000,
        lastMonthBalanceTonnes: 10,
        lastMonthBalanceUsd: 48000,
        shippedTonnes: 90,
        shippedUsd: 432000,
        pipelineTonnes: 30,
        pipelineUsd: 144000,
        deltaTonnes: 20,
        deltaUsd: 96000,
        statusTonnes: 'SURPLUS',
        statusUsd: 'SURPLUS',
        totalSkus: 1,
      },
    },
  ],
  grandTotal: {
    targetTonnes: 310,
    targetUsd: 1470000,
    lastMonthBalanceTonnes: 25,
    lastMonthBalanceUsd: 120000,
    shippedTonnes: 216,
    shippedUsd: 1026000,
    pipelineTonnes: 104,
    pipelineUsd: 494000,
    deltaTonnes: 10,
    deltaUsd: 50000,
    statusTonnes: 'SURPLUS',
    statusUsd: 'SURPLUS',
    totalCountries: 2,
    totalShipToParties: 2,
    totalSkus: 3,
  },
};

const mockInitialData: GetSalesPlanResult = {
  success: true,
  summary: mockSummary,
  filters: {
    month: 10,
    year: 2026,
    salesOrgId: 'ALL',
    country: 'ALL',
    shipToParty: 'ALL',
    uom: 'TONNES',
    sortBy: 'country_asc',
  },
  availableYears: [2024, 2025, 2026, 2027],
  availableMonths: [
    { month: 10, label: 'October' },
    { month: 11, label: 'November' },
  ],
  availableSalesOrgs: [{ id: 'so-1', name: 'Allana Meat Exports', code: 'SO-01' }],
  availableCountries: ['Saudi Arabia', 'United Arab Emirates'],
  availableShipToParties: [
    'Carrefour Riyadh Central Logistics Hub',
    'LuLu Group Logistics JAFZA Dubai',
  ],
};

describe('Module 6: Sales Plan & Supply Chain Forecasting Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('SalesPlanFilterBar', () => {
    it('renders all filter controls, found records counter, and triggers change handlers', () => {
      const onFilterChange = vi.fn();
      const onReset = vi.fn();
      const onApply = vi.fn();

      render(
        <SalesPlanFilterBar
          filters={{
            month: 10,
            year: 2026,
            salesOrgId: 'ALL',
            country: 'ALL',
            shipToParty: 'ALL',
            uom: 'TONNES',
            sortBy: 'country_asc',
          }}
          onFilterChange={onFilterChange}
          onResetFilters={onReset}
          onApplyFilters={onApply}
          availableMonths={mockInitialData.availableMonths}
          availableYears={mockInitialData.availableYears}
          availableSalesOrgs={mockInitialData.availableSalesOrgs}
          availableCountries={mockInitialData.availableCountries}
          availableShipToParties={mockInitialData.availableShipToParties}
          totalCountries={2}
          totalShipTo={2}
          totalSkus={3}
        />
      );

      expect(screen.getByTestId('sales-plan-filter-bar')).toBeInTheDocument();
      expect(screen.getByTestId('found-records-counter')).toHaveTextContent(
        'Found 2 Countries • 2 Destinations • 3 SKUs'
      );

      // Change Month
      fireEvent.change(screen.getByTestId('filter-month'), { target: { value: '11' } });
      expect(onFilterChange).toHaveBeenCalledWith({ month: 11 });

      // Change Year
      fireEvent.change(screen.getByTestId('filter-year'), { target: { value: '2025' } });
      expect(onFilterChange).toHaveBeenCalledWith({ year: 2025 });

      // Change Sales Org
      fireEvent.change(screen.getByTestId('filter-sales-org'), { target: { value: 'so-1' } });
      expect(onFilterChange).toHaveBeenCalledWith({ salesOrgId: 'so-1' });

      // Change Country
      fireEvent.change(screen.getByTestId('filter-country'), {
        target: { value: 'Saudi Arabia' },
      });
      expect(onFilterChange).toHaveBeenCalledWith({ country: 'Saudi Arabia' });

      // Change Ship-To Party
      fireEvent.change(screen.getByTestId('filter-ship-to'), {
        target: { value: 'Carrefour Riyadh Central Logistics Hub' },
      });
      expect(onFilterChange).toHaveBeenCalledWith({
        shipToParty: 'Carrefour Riyadh Central Logistics Hub',
      });

      // Toggle UOM to USD
      fireEvent.click(screen.getByTestId('uom-btn-usd'));
      expect(onFilterChange).toHaveBeenCalledWith({ uom: 'USD' });

      // Toggle UOM back to TONNES
      fireEvent.click(screen.getByTestId('uom-btn-tonnes'));
      expect(onFilterChange).toHaveBeenCalledWith({ uom: 'TONNES' });

      // Change Sorter
      fireEvent.change(screen.getByTestId('sales-plan-sort-select'), {
        target: { value: 'target_desc' },
      });
      expect(onFilterChange).toHaveBeenCalledWith({ sortBy: 'target_desc' });

      // Apply Filters
      fireEvent.click(screen.getByTestId('get-list-btn'));
      expect(onApply).toHaveBeenCalled();

      // Reset Filters
      fireEvent.click(screen.getByTestId('reset-filters-btn'));
      expect(onReset).toHaveBeenCalled();
    });

    it('handles empty/undefined filter options with default fallbacks', () => {
      render(
        <SalesPlanFilterBar
          filters={{}}
          onFilterChange={vi.fn()}
          onResetFilters={vi.fn()}
          onApplyFilters={vi.fn()}
          availableMonths={mockInitialData.availableMonths}
          availableYears={mockInitialData.availableYears}
          availableSalesOrgs={[]}
          availableCountries={[]}
          availableShipToParties={[]}
          totalCountries={0}
          totalShipTo={0}
          totalSkus={0}
        />
      );

      const countrySelect = screen.getByTestId('filter-country') as HTMLSelectElement;
      expect(countrySelect.value).toBe('ALL');

      const uomTonnesBtn = screen.getByTestId('uom-btn-tonnes');
      expect(uomTonnesBtn).toHaveStyle({ color: 'rgb(255, 255, 255)' });
    });
  });

  describe('SalesPlanGrid', () => {
    it('renders empty state when summary countries are empty', () => {
      render(
        <SalesPlanGrid
          summary={{
            countries: [],
            grandTotal: mockSummary.grandTotal,
          }}
          uom="TONNES"
        />
      );

      expect(screen.getByTestId('sales-plan-empty-state')).toBeInTheDocument();
      expect(screen.getByText('No sales forecasting data found')).toBeInTheDocument();
    });

    it('renders 3-tier matrix table with country, ship-to, and SKU rows in TONNES mode', () => {
      render(<SalesPlanGrid summary={mockSummary} uom="TONNES" />);

      expect(screen.getByTestId('sales-plan-grid')).toBeInTheDocument();

      // Tier 1: Countries
      expect(screen.getByTestId('country-row-Saudi Arabia')).toBeInTheDocument();
      expect(screen.getByTestId('country-row-United Arab Emirates')).toBeInTheDocument();

      // Deficit badge for Saudi Arabia (-10 MT)
      const saudiBadge = screen.getByTestId('country-delta-badge-Saudi Arabia');
      expect(saudiBadge).toHaveTextContent('-10.00 MT');

      // Surplus badge for UAE (+20 MT)
      const uaeBadge = screen.getByTestId('country-delta-badge-United Arab Emirates');
      expect(uaeBadge).toHaveTextContent('+20.00 MT');

      // Tier 2: Ship-To
      expect(
        screen.getByTestId('shipto-row-Carrefour Riyadh Central Logistics Hub')
      ).toBeInTheDocument();

      // Tier 3: SKU Items
      expect(screen.getByTestId('sku-row-AL-BUF-TOP-01')).toBeInTheDocument();
      expect(screen.getByTestId('sku-row-AL-BUF-SIL-01')).toBeInTheDocument();
      expect(screen.getByText('Frozen Boneless Buffalo Topside 20kg (SAP: 7940)')).toBeInTheDocument();

      // Grand Total Row
      expect(screen.getByTestId('grand-total-row')).toBeInTheDocument();
      expect(screen.getByTestId('grand-total-target')).toHaveTextContent('310.00 MT');
      expect(screen.getByTestId('grand-total-delta')).toHaveTextContent('+10.00 MT');

      // Toggle country collapse
      const toggleCountryBtn = screen.getByTestId('toggle-country-btn-Saudi Arabia');
      expect(toggleCountryBtn).toHaveTextContent('Hide Details ▴');
      fireEvent.click(toggleCountryBtn);
      expect(toggleCountryBtn).toHaveTextContent('Details ▾');
      expect(
        screen.queryByTestId('shipto-row-Carrefour Riyadh Central Logistics Hub')
      ).not.toBeInTheDocument();

      // Expand country again
      fireEvent.click(toggleCountryBtn);
      expect(
        screen.getByTestId('shipto-row-Carrefour Riyadh Central Logistics Hub')
      ).toBeInTheDocument();

      // Toggle SKU items collapse under Ship-To
      const toggleSkusBtn = screen.getByTestId(
        'toggle-skus-btn-Carrefour Riyadh Central Logistics Hub'
      );
      expect(toggleSkusBtn).toHaveTextContent('▲ 2 SKU');
      fireEvent.click(toggleSkusBtn);
      expect(toggleSkusBtn).toHaveTextContent('▼ 2 SKU');
      expect(screen.queryByTestId('sku-row-AL-BUF-TOP-01')).not.toBeInTheDocument();

      // Expand SKUs again
      fireEvent.click(toggleSkusBtn);
      expect(screen.getByTestId('sku-row-AL-BUF-TOP-01')).toBeInTheDocument();
    });

    it('renders currency values and formatting in USD mode', () => {
      render(<SalesPlanGrid summary={mockSummary} uom="USD" />);

      expect(screen.getByTestId('grand-total-target')).toHaveTextContent('$1,470,000');
      expect(screen.getByTestId('grand-total-shipped')).toHaveTextContent('$1,026,000');
      expect(screen.getByTestId('grand-total-delta')).toHaveTextContent('+$50,000');
    });

    it('handles negative grand total delta in deficit styling', () => {
      const deficitSummary: SalesPlanSummary = {
        ...mockSummary,
        grandTotal: {
          ...mockSummary.grandTotal,
          deltaTonnes: -50,
          deltaUsd: -240000,
          statusTonnes: 'DEFICIT',
          statusUsd: 'DEFICIT',
        },
      };

      render(<SalesPlanGrid summary={deficitSummary} uom="TONNES" />);

      const grandDelta = screen.getByTestId('grand-total-delta');
      expect(grandDelta).toHaveTextContent('-50.00 MT');
    });
  });

  describe('SalesPlanPortalView & SalesPlanPage', () => {
    it('manages filter updates, sorting, and displays loading indicator', async () => {
      vi.spyOn(salesPlanActions, 'getSalesPlanData').mockResolvedValue({
        ...mockInitialData,
        summary: mockSummary,
      });

      render(<SalesPlanPortalView initialData={mockInitialData} />);

      expect(screen.getByTestId('sales-plan-page-title')).toHaveTextContent(
        'Sales Plan & Export Volume Forecasting'
      );

      // Change Country filter
      fireEvent.change(screen.getByTestId('filter-country'), {
        target: { value: 'United Arab Emirates' },
      });

      await waitFor(() => {
        expect(salesPlanActions.getSalesPlanData).toHaveBeenCalledWith(
          expect.objectContaining({ country: 'United Arab Emirates' })
        );
      });

      // Apply Filters button
      fireEvent.click(screen.getByTestId('get-list-btn'));
      await waitFor(() => {
        expect(salesPlanActions.getSalesPlanData).toHaveBeenCalled();
      });

      // Reset Filters button
      fireEvent.click(screen.getByTestId('reset-filters-btn'));
      await waitFor(() => {
        expect(salesPlanActions.getSalesPlanData).toHaveBeenCalledWith(
          expect.objectContaining({ country: 'ALL', salesOrgId: 'ALL' })
        );
      });
    });

    it('shows loading indicator during data retrieval', async () => {
      let resolvePromise: (value: unknown) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      vi.spyOn(salesPlanActions, 'getSalesPlanData').mockImplementation(
        () => pendingPromise as unknown as Promise<GetSalesPlanResult>
      );

      render(<SalesPlanPortalView initialData={mockInitialData} />);

      fireEvent.change(screen.getByTestId('filter-month'), { target: { value: '11' } });

      expect(screen.getByTestId('sales-plan-loading-indicator')).toBeInTheDocument();

      resolvePromise!({
        ...mockInitialData,
        success: true,
      });

      await waitFor(() => {
        expect(screen.queryByTestId('sales-plan-loading-indicator')).not.toBeInTheDocument();
      });
    });

    it('handles failure response gracefully without crashing', async () => {
      vi.spyOn(salesPlanActions, 'getSalesPlanData').mockResolvedValueOnce({
        success: false,
        error: 'Failed to fetch sales plan',
        summary: {
          countries: [],
          grandTotal: mockSummary.grandTotal,
        },
        filters: mockInitialData.filters,
        availableYears: [],
        availableMonths: [],
        availableSalesOrgs: [],
        availableCountries: [],
        availableShipToParties: [],
      });

      render(<SalesPlanPortalView initialData={mockInitialData} />);

      fireEvent.change(screen.getByTestId('filter-country'), { target: { value: 'Jordan' } });

      await waitFor(() => {
        expect(salesPlanActions.getSalesPlanData).toHaveBeenCalled();
      });
    });

    it('renders SalesPlanPage server component with initial data', async () => {
      vi.spyOn(salesPlanActions, 'getSalesPlanData').mockResolvedValueOnce(mockInitialData);

      const element = await SalesPlanPage();
      render(element);

      expect(screen.getByTestId('sales-plan-page')).toBeInTheDocument();
      expect(screen.getByTestId('country-row-Saudi Arabia')).toBeInTheDocument();
    });
  });
});
