'use client';

import React from 'react';

export type CatalogViewMode = 'grid' | 'table';

export interface CatalogViewControlsProps {
  viewMode: CatalogViewMode;
  onViewModeChange: (mode: CatalogViewMode) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  sortBy: string;
  onSortByChange: (sortBy: 'name_asc' | 'name_desc' | 'sku_asc' | 'sku_desc') => void;
  totalProducts: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

export const CATALOG_DISCLAIMER_TEXT =
  'Attention: the presented list of products and their characteristics are incomplete. Check the details with the manager. The catalog does not contain all products available for order, and is advertising material.';

export default function CatalogViewControls({
  viewMode,
  onViewModeChange,
  pageSize,
  onPageSizeChange,
  sortBy,
  onSortByChange,
  totalProducts,
  currentPage,
  totalPages,
  onPageChange,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
}: CatalogViewControlsProps) {
  return (
    <div
      data-testid="catalog-view-controls"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-md, 16px)',
        marginBottom: 'var(--spacing-lg, 18px)',
      }}
    >
      {/* Official Incomplete Characteristics Disclaimer Banner */}
      <div
        data-testid="catalog-disclaimer-banner"
        role="note"
        style={{
          backgroundColor: 'rgba(197, 160, 89, 0.08)',
          border: '1px solid rgba(197, 160, 89, 0.35)',
          borderRadius: 'var(--border-radius-lg, 12px)',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '12px',
          color: 'var(--color-primary-dark, #0a192f)',
          lineHeight: 1.5,
        }}
      >
        <span
          style={{
            fontSize: '16px',
            color: 'var(--color-gold, #c5a059)',
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          &#9888;
        </span>
        <span>{CATALOG_DISCLAIMER_TEXT}</span>
      </div>

      {/* Top Controls Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--spacing-md, 14px)',
          paddingBottom: 'var(--spacing-sm, 10px)',
          borderBottom: '1px solid var(--color-border-subtle, #f1f5f9)',
        }}
      >
        {/* Left: Total Records Count */}
        <div
          data-testid="catalog-results-counter"
          style={{
            fontSize: 'var(--font-size-sm, 14px)',
            fontWeight: 700,
            color: 'var(--color-text-primary, #0f172a)',
          }}
        >
          Found <span style={{ color: 'var(--color-gold, #c5a059)' }}>{totalProducts}</span> products
        </div>

        {/* Right: Sorter, Items per page, View Mode Toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--spacing-md, 14px)',
          }}
        >
          {/* Sorter Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label
              htmlFor="catalog-sort-select"
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--color-text-secondary, #64748b)',
              }}
            >
              Sort by:
            </label>
            <select
              id="catalog-sort-select"
              data-testid="catalog-sort-select"
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as any)}
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--color-text-primary, #0f172a)',
                backgroundColor: 'var(--color-surface, #ffffff)',
                border: '1px solid var(--color-border, #cbd5e1)',
                borderRadius: 'var(--border-radius-md, 6px)',
                padding: '4px 8px',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
              <option value="sku_asc">SKU Article (Asc)</option>
              <option value="sku_desc">SKU Article (Desc)</option>
            </select>
          </div>

          {/* Items Per Page Selector (12, 24, All) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--color-text-secondary, #64748b)',
              }}
            >
              Show:
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[12, 24, 100].map((size) => {
                const label = size === 100 ? 'All' : size.toString();
                const isSelected = pageSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    data-testid={`page-size-${label.toLowerCase()}`}
                    onClick={() => onPageSizeChange(size)}
                    style={{
                      border: isSelected
                        ? '1px solid var(--color-gold, #c5a059)'
                        : '1px solid var(--color-border, #cbd5e1)',
                      backgroundColor: isSelected
                        ? 'var(--color-primary-dark, #0a192f)'
                        : 'transparent',
                      color: isSelected ? '#ffffff' : 'var(--color-text-secondary, #64748b)',
                      borderRadius: 'var(--border-radius-sm, 4px)',
                      padding: '2px 8px',
                      fontSize: '11px',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* View Mode Toggle (Card Grid vs Table List) with Green Active State Indicator */}
          <div
            data-testid="catalog-view-toggle"
            role="radiogroup"
            aria-label="Catalog View Mode"
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--color-background-subtle, #f1f5f9)',
              borderRadius: 'var(--border-radius-md, 8px)',
              padding: '2px',
              border: '1px solid var(--color-border, #e2e8f0)',
            }}
          >
            <button
              type="button"
              role="radio"
              aria-checked={viewMode === 'grid'}
              data-testid="view-toggle-grid"
              onClick={() => onViewModeChange('grid')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: viewMode === 'grid' ? '#10b981' : 'transparent', // Solid green active indicator per spec
                color: viewMode === 'grid' ? '#ffffff' : 'var(--color-text-secondary, #64748b)',
                fontSize: '12px',
                fontWeight: viewMode === 'grid' ? 700 : 500,
                cursor: 'pointer',
                transition: 'var(--transition-fast)',
              }}
            >
              <span>&#8862;</span>
              <span>Grid</span>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={viewMode === 'table'}
              data-testid="view-toggle-table"
              onClick={() => onViewModeChange('table')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: viewMode === 'table' ? '#10b981' : 'transparent', // Solid green active indicator per spec
                color: viewMode === 'table' ? '#ffffff' : 'var(--color-text-secondary, #64748b)',
                fontSize: '12px',
                fontWeight: viewMode === 'table' ? 700 : 500,
                cursor: 'pointer',
                transition: 'var(--transition-fast)',
              }}
            >
              <span>&#9776;</span>
              <span>List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dual Pagination: Prominent 'Load More Products' and Numbered < 1 2 > Switcher */}
      {totalPages > 1 && (
        <div
          data-testid="dual-pagination-controls"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--spacing-md, 14px)',
            marginTop: 'var(--spacing-sm, 6px)',
          }}
        >
          {/* Prominent Load More Button (with circular reload icon) */}
          {hasMore && onLoadMore && (
            <button
              type="button"
              data-testid="load-more-products-btn"
              onClick={onLoadMore}
              disabled={isLoadingMore}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--color-primary-dark, #0a192f)',
                color: '#ffffff',
                border: '1px solid var(--color-gold, #c5a059)',
                borderRadius: 'var(--border-radius-pill, 9999px)',
                padding: '8px 20px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: isLoadingMore ? 'not-allowed' : 'pointer',
                transition: 'var(--transition-fast)',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  fontSize: '14px',
                  display: 'inline-block',
                  transform: isLoadingMore ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.4s ease',
                }}
              >
                &#8635;
              </span>
              <span>{isLoadingMore ? 'Loading Cuts...' : 'Load More Products'}</span>
            </button>
          )}

          {/* Numbered Page Switcher < 1 2 3 > */}
          <div
            data-testid="numbered-page-controls"
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            {/* Prev button */}
            <button
              type="button"
              data-testid="pagination-prev-btn"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              aria-label="Previous Page"
              style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--color-border, #cbd5e1)',
                borderRadius: 'var(--border-radius-sm, 4px)',
                backgroundColor: 'var(--color-surface, #ffffff)',
                color: currentPage <= 1 ? '#cbd5e1' : 'var(--color-text-primary, #0f172a)',
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                fontSize: '14px',
              }}
            >
              &lsaquo;
            </button>

            {/* Page number buttons */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              const isCurrent = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  type="button"
                  data-testid={`pagination-page-${pageNum}`}
                  aria-current={isCurrent ? 'page' : undefined}
                  onClick={() => onPageChange(pageNum)}
                  style={{
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: isCurrent
                      ? '1px solid var(--color-gold, #c5a059)'
                      : '1px solid var(--color-border, #cbd5e1)',
                    borderRadius: 'var(--border-radius-sm, 4px)',
                    backgroundColor: isCurrent
                      ? 'var(--color-primary-dark, #0a192f)'
                      : 'var(--color-surface, #ffffff)',
                    color: isCurrent ? '#ffffff' : 'var(--color-text-primary, #0f172a)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: isCurrent ? 700 : 500,
                  }}
                >
                  {pageNum}
                </button>
              );
            })}

            {/* Next button */}
            <button
              type="button"
              data-testid="pagination-next-btn"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              aria-label="Next Page"
              style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--color-border, #cbd5e1)',
                borderRadius: 'var(--border-radius-sm, 4px)',
                backgroundColor: 'var(--color-surface, #ffffff)',
                color: currentPage >= totalPages ? '#cbd5e1' : 'var(--color-text-primary, #0f172a)',
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                fontSize: '14px',
              }}
            >
              &rsaquo;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
