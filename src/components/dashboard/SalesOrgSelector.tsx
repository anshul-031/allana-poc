'use client';

import React from 'react';
import { SalesOrgDTO } from '@/server/actions/financials.actions';

export interface SalesOrgSelectorProps {
  salesOrgs: SalesOrgDTO[];
  selectedSalesOrgId?: string;
  onSelect: (salesOrgId: string) => void;
  disabled?: boolean;
}

export default function SalesOrgSelector({
  salesOrgs,
  selectedSalesOrgId,
  onSelect,
  disabled = false,
}: SalesOrgSelectorProps) {
  if (salesOrgs.length === 0) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSelect(e.target.value);
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--spacing-xs)',
      }}
      data-testid="sales-org-selector-container"
    >
      <label
        htmlFor="sales-org-select"
        style={{
          fontSize: 'var(--font-size-xs)',
          fontWeight: 600,
          color: 'var(--color-text-secondary)',
          whiteSpace: 'nowrap',
        }}
      >
        Sales Organization:
      </label>

      <div style={{ position: 'relative', display: 'inline-block' }}>
        <select
          id="sales-org-select"
          data-testid="sales-org-select"
          value={selectedSalesOrgId || salesOrgs[0]?.id}
          onChange={handleChange}
          disabled={disabled}
          style={{
            appearance: 'none',
            WebkitAppearance: 'none',
            padding: '6px 32px 6px 12px',
            borderRadius: 'var(--border-radius-md)',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 600,
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.7 : 1,
            boxShadow: 'var(--shadow-sm)',
            transition: 'var(--transition-fast)',
          }}
        >
          {salesOrgs.map((org) => (
            <option key={org.id} value={org.id}>
              {org.code} &bull; {org.name}
            </option>
          ))}
        </select>

        {/* Custom Chevron Indicator */}
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            fontSize: '10px',
            color: 'var(--color-text-secondary)',
          }}
        >
          ▼
        </span>
      </div>
    </div>
  );
}
