'use client';

import React, { useState } from 'react';
import {
  CatalogFilterState,
  CATALOG_FILTER_OPTIONS,
  getActiveFilterTags,
  ActiveFilterTag,
} from '@/lib/catalog-filters';

export interface FilterSidebarProps {
  filterState: CatalogFilterState;
  onChangeFilter: (newState: CatalogFilterState) => void;
  onClearAll: () => void;
}

export default function FilterSidebar({
  filterState,
  onChangeFilter,
  onClearAll,
}: FilterSidebarProps) {
  // Collapsible state for each section (all open by default)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionKey: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const activeTags = getActiveFilterTags(filterState);
  const hasActiveFilters = activeTags.length > 0 || Boolean(filterState.searchQuery);

  const toggleFilterItem = (
    categoryKey: 'categories' | 'subcategories' | 'packagingTypes' | 'productStates' | 'brands',
    itemValue: string
  ) => {
    const currentList = filterState[categoryKey];
    const exists = currentList.includes(itemValue);
    const updatedList = exists
      ? currentList.filter((x) => x !== itemValue)
      : [...currentList, itemValue];

    onChangeFilter({
      ...filterState,
      [categoryKey]: updatedList,
    });
  };

  const removeSingleTag = (tag: ActiveFilterTag) => {
    const updatedList = filterState[tag.categoryKey].filter((x) => x !== tag.value);
    onChangeFilter({
      ...filterState,
      [tag.categoryKey]: updatedList,
    });
  };

  const renderSectionHeader = (title: string, sectionKey: string, activeCount: number) => {
    const isCollapsed = Boolean(collapsedSections[sectionKey]);
    return (
      <button
        type="button"
        data-testid={`filter-toggle-${sectionKey}`}
        onClick={() => toggleSection(sectionKey)}
        aria-expanded={!isCollapsed}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 0',
          border: 'none',
          backgroundColor: 'transparent',
          fontSize: 'var(--font-size-sm, 14px)',
          fontWeight: 700,
          color: 'var(--color-text-primary, #0f172a)',
          cursor: 'pointer',
          textAlign: 'left',
          borderBottom: '1px solid var(--color-border-subtle, #f1f5f9)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>{title}</span>
          {activeCount > 0 && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--color-gold, #c5a059)',
                backgroundColor: 'rgba(197, 160, 89, 0.15)',
                padding: '1px 6px',
                borderRadius: 'var(--border-radius-pill, 9999px)',
              }}
            >
              ({activeCount})
            </span>
          )}
        </span>
        <span
          aria-hidden="true"
          style={{
            transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
            transition: 'var(--transition-fast)',
            color: 'var(--color-text-tertiary, #94a3b8)',
            fontSize: '12px',
          }}
        >
          &#9660;
        </span>
      </button>
    );
  };

  return (
    <aside
      data-testid="filter-sidebar"
      aria-label="Product Catalog Filters"
      style={{
        width: '100%',
        backgroundColor: 'var(--color-surface, #ffffff)',
        border: '1px solid var(--color-border, #e2e8f0)',
        borderRadius: 'var(--border-radius-xl, 16px)',
        padding: 'var(--spacing-lg, 20px)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Sidebar Header & Clear All */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--spacing-md, 12px)',
          paddingBottom: 'var(--spacing-sm, 8px)',
          borderBottom: '1.5px solid var(--color-border, #e2e8f0)',
        }}
      >
        <h3
          style={{
            fontSize: 'var(--font-size-md, 16px)',
            fontWeight: 800,
            color: 'var(--color-primary-dark, #0a192f)',
            margin: 0,
            letterSpacing: '0.02em',
          }}
        >
          Filters
        </h3>

        {hasActiveFilters && (
          <button
            type="button"
            data-testid="filter-clear-all-btn"
            onClick={onClearAll}
            style={{
              backgroundColor: '#10b981', // Solid green per acceptance criteria
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--border-radius-pill, 9999px)',
              padding: '4px 12px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
            }}
          >
            Clear All
          </button>
        )}
      </div>

      {/* Active Filter Tags */}
      {activeTags.length > 0 && (
        <div
          data-testid="active-filter-tags-area"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            marginBottom: 'var(--spacing-md, 14px)',
            paddingBottom: 'var(--spacing-sm, 10px)',
            borderBottom: '1px solid var(--color-border-subtle, #f1f5f9)',
          }}
        >
          {activeTags.map((tag) => (
            <span
              key={tag.id}
              data-testid={`active-filter-tag-${tag.id}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(197, 160, 89, 0.12)',
                color: 'var(--color-primary-dark, #0a192f)',
                border: '1px solid rgba(197, 160, 89, 0.35)',
                borderRadius: 'var(--border-radius-pill, 9999px)',
                padding: '3px 10px',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              <span>{tag.label}</span>
              <button
                type="button"
                data-testid={`remove-filter-${tag.id}`}
                aria-label={`Remove filter ${tag.label}`}
                onClick={() => removeSingleTag(tag)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-gold, #c5a059)',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  padding: 0,
                  lineHeight: 1,
                }}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}

      {/* 1. Category Facet */}
      <div style={{ marginBottom: 'var(--spacing-sm, 8px)' }}>
        {renderSectionHeader('Category', 'categories', filterState.categories.length)}
        {!collapsedSections.categories && (
          <div
            data-testid="filter-group-categories"
            style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}
          >
            {CATALOG_FILTER_OPTIONS.categories.map((opt) => {
              const isChecked = filterState.categories.includes(opt.id);
              return (
                <label
                  key={opt.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: 'var(--font-size-xs, 13px)',
                    color: 'var(--color-text-secondary, #475569)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    data-testid={`filter-checkbox-${opt.id}`}
                    checked={isChecked}
                    onChange={() => toggleFilterItem('categories', opt.id)}
                    style={{ accentColor: 'var(--color-gold, #c5a059)', cursor: 'pointer' }}
                  />
                  <span>{opt.label}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Subcategory Facet */}
      <div style={{ marginBottom: 'var(--spacing-sm, 8px)' }}>
        {renderSectionHeader('Subcategory', 'subcategories', filterState.subcategories.length)}
        {!collapsedSections.subcategories && (
          <div
            data-testid="filter-group-subcategories"
            style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}
          >
            {CATALOG_FILTER_OPTIONS.subcategories.map((opt) => {
              const isChecked = filterState.subcategories.includes(opt.id);
              return (
                <label
                  key={opt.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: 'var(--font-size-xs, 13px)',
                    color: 'var(--color-text-secondary, #475569)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    data-testid={`filter-checkbox-${opt.id}`}
                    checked={isChecked}
                    onChange={() => toggleFilterItem('subcategories', opt.id)}
                    style={{ accentColor: 'var(--color-gold, #c5a059)', cursor: 'pointer' }}
                  />
                  <span>{opt.label}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Primary Package Facet */}
      <div style={{ marginBottom: 'var(--spacing-sm, 8px)' }}>
        {renderSectionHeader('Primary Package', 'packagingTypes', filterState.packagingTypes.length)}
        {!collapsedSections.packagingTypes && (
          <div
            data-testid="filter-group-packaging"
            style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}
          >
            {CATALOG_FILTER_OPTIONS.packagingTypes.map((opt) => {
              const isChecked = filterState.packagingTypes.includes(opt.id);
              return (
                <label
                  key={opt.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: 'var(--font-size-xs, 13px)',
                    color: 'var(--color-text-secondary, #475569)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    data-testid={`filter-checkbox-${opt.id}`}
                    checked={isChecked}
                    onChange={() => toggleFilterItem('packagingTypes', opt.id)}
                    style={{ accentColor: 'var(--color-gold, #c5a059)', cursor: 'pointer' }}
                  />
                  <span>{opt.label}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Product State Facet */}
      <div style={{ marginBottom: 'var(--spacing-sm, 8px)' }}>
        {renderSectionHeader('Product State', 'productStates', filterState.productStates.length)}
        {!collapsedSections.productStates && (
          <div
            data-testid="filter-group-states"
            style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}
          >
            {CATALOG_FILTER_OPTIONS.productStates.map((opt) => {
              const isChecked = filterState.productStates.includes(opt.id);
              return (
                <label
                  key={opt.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: 'var(--font-size-xs, 13px)',
                    color: 'var(--color-text-secondary, #475569)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    data-testid={`filter-checkbox-${opt.id}`}
                    checked={isChecked}
                    onChange={() => toggleFilterItem('productStates', opt.id)}
                    style={{ accentColor: 'var(--color-gold, #c5a059)', cursor: 'pointer' }}
                  />
                  <span>{opt.label}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Brand Facet */}
      <div style={{ marginBottom: 'var(--spacing-sm, 8px)' }}>
        {renderSectionHeader('Brand', 'brands', filterState.brands.length)}
        {!collapsedSections.brands && (
          <div
            data-testid="filter-group-brands"
            style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}
          >
            {CATALOG_FILTER_OPTIONS.brands.map((opt) => {
              const isChecked = filterState.brands.includes(opt.id);
              return (
                <label
                  key={opt.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: 'var(--font-size-xs, 13px)',
                    color: 'var(--color-text-secondary, #475569)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    data-testid={`filter-checkbox-${opt.id}`}
                    checked={isChecked}
                    onChange={() => toggleFilterItem('brands', opt.id)}
                    style={{ accentColor: 'var(--color-gold, #c5a059)', cursor: 'pointer' }}
                  />
                  <span>{opt.label}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
