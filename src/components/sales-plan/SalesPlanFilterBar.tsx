'use client';

import React from 'react';
import {
  SalesPlanFilterOptions,
  SalesPlanSalesOrgOption,
} from '@/server/actions/sales-plan.actions';
import { UnitOfMeasureType } from '@/lib/sales-plan-calc';

export interface SalesPlanFilterBarProps {
  filters: SalesPlanFilterOptions;
  onFilterChange: (newFilters: Partial<SalesPlanFilterOptions>) => void;
  onResetFilters: () => void;
  onApplyFilters: () => void;
  availableMonths: { month: number; label: string }[];
  availableYears: number[];
  availableSalesOrgs: SalesPlanSalesOrgOption[];
  availableCountries: string[];
  availableShipToParties: string[];
  totalCountries: number;
  totalShipTo: number;
  totalSkus: number;
}

export default function SalesPlanFilterBar({
  filters,
  onFilterChange,
  onResetFilters,
  onApplyFilters,
  availableMonths,
  availableYears,
  availableSalesOrgs,
  availableCountries,
  availableShipToParties,
  totalCountries,
  totalShipTo,
  totalSkus,
}: SalesPlanFilterBarProps) {
  const currentMonth = filters.month ?? 10;
  const currentYear = filters.year ?? 2026;
  const currentSalesOrg = filters.salesOrgId ?? 'ALL';
  const currentCountry = filters.country ?? 'ALL';
  const currentShipTo = filters.shipToParty ?? 'ALL';
  const currentUom = filters.uom ?? 'TONNES';
  const currentSortBy = filters.sortBy ?? 'country_asc';

  return (
    <div
      data-testid="sales-plan-filter-bar"
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        border: '1px solid var(--color-border, #e2e8f0)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Top Header Row with Found Counter and UOM Switcher */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--color-border, #f1f5f9)',
        }}
      >
        {/* Found Records Counter */}
        <div
          data-testid="found-records-counter"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: 'var(--font-size-sm, 14px)',
            fontWeight: 700,
            color: 'var(--color-primary-dark, #0a192f)',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-gold, #c5a059)',
            }}
          />
          Found {totalCountries} Countries &bull; {totalShipTo} Destinations &bull; {totalSkus} SKUs
        </div>

        {/* UOM Switcher & Sorter */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          {/* UOM Toggle */}
          <div
            data-testid="uom-toggle-group"
            style={{
              display: 'inline-flex',
              borderRadius: '10px',
              padding: '3px',
              backgroundColor: '#f1f5f9',
              border: '1px solid var(--color-border, #e2e8f0)',
            }}
          >
            <button
              type="button"
              data-testid="uom-btn-tonnes"
              onClick={() => onFilterChange({ uom: 'TONNES' })}
              style={
                currentUom === 'TONNES'
                  ? {
                      border: 'none',
                      borderRadius: '8px',
                      padding: '6px 14px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      backgroundColor: 'var(--color-primary-dark, #0a192f)',
                      color: '#ffffff',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    }
                  : {
                      border: 'none',
                      borderRadius: '8px',
                      padding: '6px 14px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      backgroundColor: 'transparent',
                      color: 'var(--color-text-secondary, #64748b)',
                    }
              }
            >
              Metric Tonnes (MT)
            </button>
            <button
              type="button"
              data-testid="uom-btn-usd"
              onClick={() => onFilterChange({ uom: 'USD' })}
              style={
                currentUom === 'USD'
                  ? {
                      border: 'none',
                      borderRadius: '8px',
                      padding: '6px 14px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      backgroundColor: 'var(--color-primary-dark, #0a192f)',
                      color: '#ffffff',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    }
                  : {
                      border: 'none',
                      borderRadius: '8px',
                      padding: '6px 14px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      backgroundColor: 'transparent',
                      color: 'var(--color-text-secondary, #64748b)',
                    }
              }
            >
              Currency (USD $)
            </button>
          </div>

          {/* Sorter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label
              htmlFor="sales-plan-sort-select"
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-text-secondary, #64748b)',
              }}
            >
              Sort by:
            </label>
            <select
              id="sales-plan-sort-select"
              data-testid="sales-plan-sort-select"
              value={currentSortBy}
              onChange={(e) =>
                onFilterChange({
                  sortBy: e.target.value as SalesPlanFilterOptions['sortBy'],
                })
              }
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid var(--color-border, #cbd5e1)',
                backgroundColor: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-primary-dark, #0a192f)',
                cursor: 'pointer',
              }}
            >
              <option value="country_asc">Country A &rarr; Z</option>
              <option value="country_desc">Country Z &rarr; A</option>
              <option value="target_desc">Highest Target Volume</option>
            </select>
          </div>
        </div>
      </div>

      {/* Primary Filters Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '16px',
          alignItems: 'flex-end',
        }}
      >
        {/* Month Selector */}
        <div>
          <label
            htmlFor="filter-month"
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
            Month
          </label>
          <select
            id="filter-month"
            data-testid="filter-month"
            value={currentMonth}
            onChange={(e) => onFilterChange({ month: Number(e.target.value) })}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: '8px',
              border: '1px solid var(--color-border, #cbd5e1)',
              backgroundColor: '#ffffff',
              fontSize: '13px',
              color: 'var(--color-primary-dark, #0a192f)',
              fontWeight: 500,
            }}
          >
            {availableMonths.map((m) => (
              <option key={m.month} value={m.month}>
                {m.label} ({m.month})
              </option>
            ))}
          </select>
        </div>

        {/* Year Selector */}
        <div>
          <label
            htmlFor="filter-year"
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
            Year
          </label>
          <select
            id="filter-year"
            data-testid="filter-year"
            value={currentYear}
            onChange={(e) => onFilterChange({ year: Number(e.target.value) })}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: '8px',
              border: '1px solid var(--color-border, #cbd5e1)',
              backgroundColor: '#ffffff',
              fontSize: '13px',
              color: 'var(--color-primary-dark, #0a192f)',
              fontWeight: 500,
            }}
          >
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>

        {/* Sales Organization */}
        <div>
          <label
            htmlFor="filter-sales-org"
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
            Sales Organization
          </label>
          <select
            id="filter-sales-org"
            data-testid="filter-sales-org"
            value={currentSalesOrg}
            onChange={(e) => onFilterChange({ salesOrgId: e.target.value })}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: '8px',
              border: '1px solid var(--color-border, #cbd5e1)',
              backgroundColor: '#ffffff',
              fontSize: '13px',
              color: 'var(--color-primary-dark, #0a192f)',
              fontWeight: 500,
            }}
          >
            <option value="ALL">All Sales Organizations</option>
            {availableSalesOrgs.map((so) => (
              <option key={so.id} value={so.id}>
                {so.name} ({so.code})
              </option>
            ))}
          </select>
        </div>

        {/* Country */}
        <div>
          <label
            htmlFor="filter-country"
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
            Country
          </label>
          <select
            id="filter-country"
            data-testid="filter-country"
            value={currentCountry}
            onChange={(e) => onFilterChange({ country: e.target.value })}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: '8px',
              border: '1px solid var(--color-border, #cbd5e1)',
              backgroundColor: '#ffffff',
              fontSize: '13px',
              color: 'var(--color-primary-dark, #0a192f)',
              fontWeight: 500,
            }}
          >
            <option value="ALL">All Countries</option>
            {availableCountries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Ship-To Party */}
        <div>
          <label
            htmlFor="filter-ship-to"
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
            Ship-To Party
          </label>
          <select
            id="filter-ship-to"
            data-testid="filter-ship-to"
            value={currentShipTo}
            onChange={(e) => onFilterChange({ shipToParty: e.target.value })}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: '8px',
              border: '1px solid var(--color-border, #cbd5e1)',
              backgroundColor: '#ffffff',
              fontSize: '13px',
              color: 'var(--color-primary-dark, #0a192f)',
              fontWeight: 500,
            }}
          >
            <option value="ALL">All Destinations</option>
            {availableShipToParties.map((stp) => (
              <option key={stp} value={stp}>
                {stp}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons: Get List & Reset */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            data-testid="get-list-btn"
            onClick={onApplyFilters}
            style={{
              flex: 1,
              padding: '9px 16px',
              backgroundColor: 'var(--color-primary, #0f2b48)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'background-color 0.2s',
            }}
          >
            <span>&bull;</span> Get List
          </button>

          <button
            type="button"
            data-testid="reset-filters-btn"
            onClick={onResetFilters}
            style={{
              padding: '9px 14px',
              backgroundColor: 'transparent',
              color: 'var(--color-text-secondary, #64748b)',
              border: '1px solid var(--color-border, #cbd5e1)',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            title="Reset Filters"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
