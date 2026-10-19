'use client';

import React from 'react';

export interface SubcategoryOption {
  id: string;
  label: string;
  count?: number;
  slug: string;
}

export interface SubcategoryPillsProps {
  options?: SubcategoryOption[];
  activeSubcategory: string | null;
  onSelectSubcategory: (subcategoryId: string | null) => void;
}

export const DEFAULT_SUBCATEGORIES: SubcategoryOption[] = [
  { id: 'all', label: 'All Cuts', slug: 'all', count: 18 },
  { id: 'hindquarter', label: 'Hindquarter Cuts', slug: 'hindquarter', count: 6 },
  { id: 'forequarter', label: 'Forequarter Cuts', slug: 'forequarter', count: 5 },
  { id: 'tenderloin', label: 'Tenderloin & Fillet', slug: 'tenderloin', count: 3 },
  { id: 'offal', label: 'Offal & Byproducts', slug: 'offal', count: 2 },
  { id: 'special-trimmings', label: 'Special Trimmings', slug: 'special-trimmings', count: 2 },
];

/**
 * Anatomical Carcass Diagram SVG with muscle section highlighting
 */
export function AnatomicalCutIcon({
  subcategoryId,
  isActive,
}: {
  subcategoryId: string;
  isActive: boolean;
}) {
  const baseColor = isActive ? '#c5a059' : '#94a3b8';
  const highlightColor = isActive ? '#ffffff' : '#0e7490';

  if (subcategoryId === 'hindquarter') {
    return (
      <svg
        data-testid="icon-hindquarter"
        width="22"
        height="18"
        viewBox="0 0 44 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M4 14C4 10 10 7 18 7H30C36 7 40 11 40 17V26H34V19H12V26H6V14H4Z"
          fill={baseColor}
          opacity="0.35"
        />
        {/* Highlighted Hindquarter Rump & Leg */}
        <path
          d="M26 7H34C38 7 40 10 40 15V26H34V18H26V7Z"
          fill={highlightColor}
        />
      </svg>
    );
  }

  if (subcategoryId === 'forequarter') {
    return (
      <svg
        data-testid="icon-forequarter"
        width="22"
        height="18"
        viewBox="0 0 44 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M4 14C4 10 10 7 18 7H30C36 7 40 11 40 17V26H34V19H12V26H6V14H4Z"
          fill={baseColor}
          opacity="0.35"
        />
        {/* Highlighted Forequarter Chuck & Shoulder */}
        <path
          d="M4 14C4 10 10 7 18 7V19H12V26H6V14H4Z"
          fill={highlightColor}
        />
      </svg>
    );
  }

  if (subcategoryId === 'tenderloin') {
    return (
      <svg
        data-testid="icon-tenderloin"
        width="22"
        height="18"
        viewBox="0 0 44 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M4 14C4 10 10 7 18 7H30C36 7 40 11 40 17V26H34V19H12V26H6V14H4Z"
          fill={baseColor}
          opacity="0.3"
        />
        {/* Highlighted Dorsal Tenderloin Spine Strip */}
        <rect
          x="14"
          y="6"
          width="18"
          height="5"
          rx="2"
          fill={highlightColor}
        />
      </svg>
    );
  }

  if (subcategoryId === 'offal') {
    return (
      <svg
        data-testid="icon-offal"
        width="22"
        height="18"
        viewBox="0 0 44 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M4 14C4 10 10 7 18 7H30C36 7 40 11 40 17V26H34V19H12V26H6V14H4Z"
          fill={baseColor}
          opacity="0.3"
        />
        {/* Core Heart / Liver internal organ marker */}
        <circle cx="22" cy="15" r="4.5" fill={highlightColor} />
      </svg>
    );
  }

  // Default Full Carcass Silhouette
  return (
    <svg
      data-testid="icon-full-carcass"
      width="22"
      height="18"
      viewBox="0 0 44 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M4 14C4 10 10 7 18 7H30C36 7 40 11 40 17V26H34V19H12V26H6V14H4Z"
        fill={isActive ? highlightColor : baseColor}
      />
    </svg>
  );
}

export default function SubcategoryPills({
  options = DEFAULT_SUBCATEGORIES,
  activeSubcategory,
  onSelectSubcategory,
}: SubcategoryPillsProps) {
  const isAllActive = !activeSubcategory || activeSubcategory === 'all';

  return (
    <div
      data-testid="subcategory-pills-bar"
      role="tablist"
      aria-label="Subcategory anatomical cut selection"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-sm, 8px)',
        overflowX: 'auto',
        padding: 'var(--spacing-xs, 4px) 0',
        marginBottom: 'var(--spacing-lg, 16px)',
        scrollbarWidth: 'thin',
      }}
    >
      {options.map((option) => {
        const isCurrentActive =
          option.id === 'all' ? isAllActive : activeSubcategory === option.id;

        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={isCurrentActive}
            data-testid={`subcategory-pill-${option.id}`}
            onClick={() => onSelectSubcategory(option.id === 'all' ? null : option.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              borderRadius: 'var(--border-radius-pill, 9999px)',
              border: isCurrentActive
                ? '1px solid var(--color-gold, #c5a059)'
                : '1px solid var(--color-border, #e2e8f0)',
              backgroundColor: isCurrentActive
                ? 'var(--color-primary-dark, #0a192f)'
                : 'var(--color-surface, #ffffff)',
              color: isCurrentActive ? '#ffffff' : 'var(--color-text-primary, #1e293b)',
              fontSize: 'var(--font-size-xs, 12px)',
              fontWeight: isCurrentActive ? 700 : 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: isCurrentActive ? 'var(--shadow-sm)' : 'none',
              transition: 'var(--transition-fast)',
            }}
          >
            <AnatomicalCutIcon subcategoryId={option.id} isActive={isCurrentActive} />
            <span>{option.label}</span>
            {typeof option.count === 'number' && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 6px',
                  borderRadius: 'var(--border-radius-pill, 9999px)',
                  backgroundColor: isCurrentActive
                    ? 'rgba(197, 160, 89, 0.25)'
                    : 'var(--color-background-subtle, #f1f5f9)',
                  color: isCurrentActive ? 'var(--color-gold, #c5a059)' : 'var(--color-text-secondary)',
                }}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
