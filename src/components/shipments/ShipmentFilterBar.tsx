'use client';

import React from 'react';
import { ShipmentFilterOptions } from '@/server/actions/shipments.actions';

export interface ShipmentFilterBarProps {
  filters: ShipmentFilterOptions;
  onFilterChange: (newFilters: Partial<ShipmentFilterOptions>) => void;
  onResetFilters: () => void;
  totalFound: number;
  countries: string[];
  salesOrgs: { id: string; name: string; code: string }[];
}

export default function ShipmentFilterBar({
  filters,
  onFilterChange,
  onResetFilters,
  totalFound,
  countries,
  salesOrgs,
}: ShipmentFilterBarProps) {
  return (
    <div
      data-testid="shipment-filter-bar"
      style={{
        backgroundColor: 'var(--color-surface, #ffffff)',
        border: '1px solid var(--color-border, #e2e8f0)',
        borderRadius: 'var(--border-radius-xl, 16px)',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Top Row: Found records counter & Clear Filters */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            data-testid="found-records-counter"
            style={{
              fontSize: '13px',
              fontWeight: 800,
              color: 'var(--color-gold, #c5a059)',
              backgroundColor: 'rgba(197, 160, 89, 0.1)',
              border: '1px solid rgba(197, 160, 89, 0.3)',
              padding: '4px 12px',
              borderRadius: 'var(--border-radius-pill, 9999px)',
            }}
          >
            Found {totalFound} records
          </span>
          <span style={{ fontSize: '13px', color: 'var(--color-text-secondary, #64748b)' }}>
            Ocean Freight &amp; Reefer Consignments
          </span>
        </div>

        <button
          type="button"
          data-testid="reset-filters-btn"
          onClick={onResetFilters}
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--color-text-secondary, #64748b)',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          Clear All Filters
        </button>
      </div>

      {/* Grid of Filter Selectors */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
        }}
      >
        {/* Sales Organization */}
        <div>
          <label
            htmlFor="filter-sales-org"
            style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--color-text-tertiary, #94a3b8)', marginBottom: '4px', textTransform: 'uppercase' }}
          >
            Sales Organization
          </label>
          <select
            id="filter-sales-org"
            data-testid="filter-sales-org"
            value={filters.salesOrgId || 'ALL'}
            onChange={(e) => onFilterChange({ salesOrgId: e.target.value })}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: 'var(--border-radius-md, 8px)',
              border: '1px solid var(--color-border, #e2e8f0)',
              fontSize: '13px',
              backgroundColor: '#ffffff',
            }}
          >
            <option value="ALL">All Sales Orgs</option>
            {salesOrgs.map((so) => (
              <option key={so.id} value={so.id}>
                {so.name} ({so.code})
              </option>
            ))}
          </select>
        </div>

        {/* Destination Country */}
        <div>
          <label
            htmlFor="filter-country"
            style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--color-text-tertiary, #94a3b8)', marginBottom: '4px', textTransform: 'uppercase' }}
          >
            Country of Destination
          </label>
          <select
            id="filter-country"
            data-testid="filter-country"
            value={filters.destinationCountry || 'ALL'}
            onChange={(e) => onFilterChange({ destinationCountry: e.target.value })}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: 'var(--border-radius-md, 8px)',
              border: '1px solid var(--color-border, #e2e8f0)',
              fontSize: '13px',
              backgroundColor: '#ffffff',
            }}
          >
            <option value="ALL">All Countries</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Shipment Status */}
        <div>
          <label
            htmlFor="filter-status"
            style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--color-text-tertiary, #94a3b8)', marginBottom: '4px', textTransform: 'uppercase' }}
          >
            Shipment Status
          </label>
          <select
            id="filter-status"
            data-testid="filter-status"
            value={filters.status || 'ALL'}
            onChange={(e) => onFilterChange({ status: e.target.value })}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: 'var(--border-radius-md, 8px)',
              border: '1px solid var(--color-border, #e2e8f0)',
              fontSize: '13px',
              backgroundColor: '#ffffff',
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="BOOKED">Booked</option>
            <option value="LOADED">Loaded</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="ARRIVED_PORT">Arrived at Port</option>
            <option value="CUSTOMS_CLEARED">Customs Cleared</option>
            <option value="DELIVERED">Delivered</option>
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label
            htmlFor="filter-start-date"
            style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--color-text-tertiary, #94a3b8)', marginBottom: '4px', textTransform: 'uppercase' }}
          >
            From Date
          </label>
          <input
            type="date"
            id="filter-start-date"
            data-testid="filter-start-date"
            value={filters.startDate || ''}
            onChange={(e) => onFilterChange({ startDate: e.target.value })}
            style={{
              width: '100%',
              padding: '7px 10px',
              borderRadius: 'var(--border-radius-md, 8px)',
              border: '1px solid var(--color-border, #e2e8f0)',
              fontSize: '13px',
              backgroundColor: '#ffffff',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* End Date */}
        <div>
          <label
            htmlFor="filter-end-date"
            style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--color-text-tertiary, #94a3b8)', marginBottom: '4px', textTransform: 'uppercase' }}
          >
            To Date
          </label>
          <input
            type="date"
            id="filter-end-date"
            data-testid="filter-end-date"
            value={filters.endDate || ''}
            onChange={(e) => onFilterChange({ endDate: e.target.value })}
            style={{
              width: '100%',
              padding: '7px 10px',
              borderRadius: 'var(--border-radius-md, 8px)',
              border: '1px solid var(--color-border, #e2e8f0)',
              fontSize: '13px',
              backgroundColor: '#ffffff',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Search Input */}
        <div>
          <label
            htmlFor="filter-search"
            style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--color-text-tertiary, #94a3b8)', marginBottom: '4px', textTransform: 'uppercase' }}
          >
            Order / Vessel Search
          </label>
          <input
            type="text"
            id="filter-search"
            data-testid="filter-search"
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Order ID, Container, Vessel..."
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: 'var(--border-radius-md, 8px)',
              border: '1px solid var(--color-border, #e2e8f0)',
              fontSize: '13px',
              backgroundColor: '#ffffff',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>
    </div>
  );
}
