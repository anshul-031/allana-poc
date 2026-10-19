'use client';

import React, { useState } from 'react';
import { ProductPackagingOption } from '@/server/actions/catalog.actions';

export interface PackagingSwitcherProps {
  options: ProductPackagingOption[];
  onSelectOption?: (option: ProductPackagingOption) => void;
}

export default function PackagingSwitcher({
  options,
  onSelectOption,
}: PackagingSwitcherProps) {
  const [selectedId, setSelectedId] = useState<string>(options[0]?.id || '');

  const selectedOption = options.find((opt) => opt.id === selectedId) || options[0];

  const handleSelect = (option: ProductPackagingOption) => {
    setSelectedId(option.id);
    if (onSelectOption) {
      onSelectOption(option);
    }
  };

  if (!options || options.length === 0) {
    return null;
  }

  return (
    <div
      data-testid="packaging-switcher"
      style={{
        backgroundColor: 'var(--color-surface, #ffffff)',
        border: '1px solid var(--color-border, #e2e8f0)',
        borderRadius: 'var(--border-radius-xl, 16px)',
        padding: 'var(--spacing-lg, 18px)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: 'var(--spacing-xl, 24px)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--spacing-md, 14px)',
        }}
      >
        <h4
          style={{
            fontSize: 'var(--font-size-sm, 14px)',
            fontWeight: 700,
            color: 'var(--color-text-primary, #0f172a)',
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          Packaging Formats &amp; Secondary Containers
        </h4>

        <span
          style={{
            fontSize: '11px',
            color: 'var(--color-text-tertiary, #94a3b8)',
            fontWeight: 600,
          }}
        >
          Select format to inspect sample specs
        </span>
      </div>

      {/* Thumbnails Row */}
      <div
        role="radiogroup"
        aria-label="Packaging format selection"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: 'var(--spacing-sm, 10px)',
          marginBottom: 'var(--spacing-md, 12px)',
        }}
      >
        {options.map((opt) => {
          const isSelected = opt.id === selectedOption?.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              data-testid={`packaging-opt-${opt.id}`}
              onClick={() => handleSelect(opt)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                padding: '10px 8px',
                borderRadius: 'var(--border-radius-lg, 10px)',
                border: isSelected
                  ? '2px solid var(--color-gold, #c5a059)'
                  : '1px solid var(--color-border, #e2e8f0)',
                backgroundColor: isSelected
                  ? 'rgba(197, 160, 89, 0.08)'
                  : 'var(--color-background-subtle, #f8fafc)',
                cursor: 'pointer',
                transition: 'var(--transition-fast)',
              }}
            >
              <div
                style={{
                  fontSize: '24px',
                  marginBottom: '4px',
                }}
              >
                {opt.id === 'vacuum-block'
                  ? '📦'
                  : opt.id === 'carton'
                  ? '🏷️'
                  : opt.id === 'polybag'
                  ? '🛍️'
                  : '🍱'}
              </div>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected
                    ? 'var(--color-primary-dark, #0a192f)'
                    : 'var(--color-text-secondary, #475569)',
                }}
              >
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Option Format Note */}
      {selectedOption && (
        <div
          data-testid="packaging-format-note"
          style={{
            backgroundColor: 'var(--color-background-subtle, #f8fafc)',
            border: '1px solid var(--color-border-subtle, #e2e8f0)',
            borderRadius: 'var(--border-radius-md, 8px)',
            padding: '10px 14px',
            fontSize: '12px',
            color: 'var(--color-text-secondary, #64748b)',
            lineHeight: 1.5,
          }}
        >
          <strong style={{ color: 'var(--color-text-primary, #0f172a)' }}>
            {selectedOption.label}:{' '}
          </strong>
          {selectedOption.format}
        </div>
      )}
    </div>
  );
}
