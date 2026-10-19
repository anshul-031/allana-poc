'use client';

import React, { useState, useCallback } from 'react';
import {
  GetSalesPlanResult,
  SalesPlanFilterOptions,
  getSalesPlanData,
} from '@/server/actions/sales-plan.actions';
import { SalesPlanSummary } from '@/lib/sales-plan-calc';
import SalesPlanFilterBar from './SalesPlanFilterBar';
import SalesPlanGrid from './SalesPlanGrid';

export interface SalesPlanPortalViewProps {
  initialData: GetSalesPlanResult;
}

export default function SalesPlanPortalView({ initialData }: SalesPlanPortalViewProps) {
  const [filters, setFilters] = useState<SalesPlanFilterOptions>({
    month: initialData.filters.month,
    year: initialData.filters.year,
    salesOrgId: initialData.filters.salesOrgId,
    country: initialData.filters.country,
    shipToParty: initialData.filters.shipToParty,
    uom: initialData.filters.uom,
    sortBy: initialData.filters.sortBy,
  });

  const [summary, setSummary] = useState<SalesPlanSummary>(initialData.summary);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchPlan = useCallback(
    async (overrideFilters: Partial<SalesPlanFilterOptions>) => {
      setIsLoading(true);

      const activeFilters: SalesPlanFilterOptions = {
        ...filters,
        ...overrideFilters,
      };

      const res = await getSalesPlanData(activeFilters);

      setIsLoading(false);

      if (res.success) {
        setSummary(res.summary);
      }
    },
    [filters]
  );

  const handleFilterChange = (newFilters: Partial<SalesPlanFilterOptions>) => {
    setFilters((prev) => {
      const updated = { ...prev, ...newFilters };
      // If UOM changed, no need to refetch unless needed, but re-fetching ensures clean sort if target_desc
      fetchPlan(updated);
      return updated;
    });
  };

  const handleApplyFilters = () => {
    fetchPlan(filters);
  };

  const handleResetFilters = () => {
    const emptyFilters: SalesPlanFilterOptions = {
      month: 10,
      year: 2026,
      salesOrgId: 'ALL',
      country: 'ALL',
      shipToParty: 'ALL',
      uom: filters.uom,
      sortBy: 'country_asc',
    };
    setFilters(emptyFilters);
    fetchPlan(emptyFilters);
  };

  return (
    <div data-testid="sales-plan-portal-view">
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1
          data-testid="sales-plan-page-title"
          style={{
            fontSize: 'var(--font-size-2xl, 24px)',
            fontWeight: 800,
            color: 'var(--color-primary-dark, #0a192f)',
            margin: '0 0 6px 0',
          }}
        >
          Sales Plan &amp; Export Volume Forecasting
        </h1>
        <p
          style={{
            fontSize: 'var(--font-size-sm, 14px)',
            color: 'var(--color-text-secondary, #64748b)',
            margin: 0,
          }}
        >
          Multi-destination supply chain quota matrix, shipment pipeline execution, and delta variance
          tracking across international import markets.
        </p>
      </div>

      {/* Filter Bar */}
      <SalesPlanFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        onApplyFilters={handleApplyFilters}
        availableMonths={initialData.availableMonths}
        availableYears={initialData.availableYears}
        availableSalesOrgs={initialData.availableSalesOrgs}
        availableCountries={initialData.availableCountries}
        availableShipToParties={initialData.availableShipToParties}
        totalCountries={summary.grandTotal.totalCountries}
        totalShipTo={summary.grandTotal.totalShipToParties}
        totalSkus={summary.grandTotal.totalSkus}
      />

      {/* Loading Indicator or Data Grid */}
      {isLoading ? (
        <div
          data-testid="sales-plan-loading-indicator"
          style={{
            padding: '48px',
            textAlign: 'center',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--color-border, #e2e8f0)',
            color: 'var(--color-text-secondary, #64748b)',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          Updating sales plan quotas &amp; pipeline metrics...
        </div>
      ) : (
        <SalesPlanGrid summary={summary} uom={(filters.uom as any) || 'TONNES'} />
      )}
    </div>
  );
}
