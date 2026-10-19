'use client';

import React from 'react';
import Link from 'next/link';
import { CatalogSearchProductDTO } from '@/server/actions/catalog.actions';

export interface ProductTableProps {
  products: CatalogSearchProductDTO[];
  isLoading?: boolean;
}

export default function ProductTable({ products, isLoading = false }: ProductTableProps) {
  if (isLoading) {
    return (
      <div
        data-testid="product-table-loading"
        style={{
          padding: 'var(--spacing-2xl, 36px)',
          textAlign: 'center',
          color: 'var(--color-text-secondary, #64748b)',
        }}
      >
        Loading catalog products list...
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div
        data-testid="product-table-empty"
        style={{
          backgroundColor: 'var(--color-surface, #ffffff)',
          border: '1px solid var(--color-border, #e2e8f0)',
          borderRadius: 'var(--border-radius-xl, 16px)',
          padding: 'var(--spacing-2xl, 36px)',
          textAlign: 'center',
          color: 'var(--color-text-secondary, #64748b)',
        }}
      >
        <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔍</div>
        <h4
          style={{
            fontSize: 'var(--font-size-md, 16px)',
            fontWeight: 700,
            color: 'var(--color-text-primary, #0f172a)',
            margin: '0 0 6px 0',
          }}
        >
          No products found matching filters
        </h4>
        <p style={{ fontSize: '13px', margin: 0 }}>
          Try clearing some filter facets or adjusting your search term.
        </p>
      </div>
    );
  }

  return (
    <div
      data-testid="product-table-wrapper"
      style={{
        overflowX: 'auto',
        backgroundColor: 'var(--color-surface, #ffffff)',
        border: '1px solid var(--color-border, #e2e8f0)',
        borderRadius: 'var(--border-radius-xl, 16px)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <table
        data-testid="product-table"
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left',
          fontSize: '13px',
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: 'var(--color-background-subtle, #f8fafc)',
              borderBottom: '1px solid var(--color-border, #e2e8f0)',
              color: 'var(--color-text-secondary, #64748b)',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            <th style={{ padding: '12px 16px' }}>Article / SKU</th>
            <th style={{ padding: '12px 16px' }}>Cut Name</th>
            <th style={{ padding: '12px 16px' }}>Brand</th>
            <th style={{ padding: '12px 16px' }}>Category &amp; Subcategory</th>
            <th style={{ padding: '12px 16px' }}>Packaging Specification</th>
            <th style={{ padding: '12px 16px' }}>State</th>
            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Net Wt</th>
            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, idx) => (
            <tr
              key={p.id}
              data-testid={`product-table-row-${p.id}`}
              style={{
                borderBottom:
                  idx < products.length - 1
                    ? '1px solid var(--color-border-subtle, #f1f5f9)'
                    : 'none',
                transition: 'background-color 0.15s ease',
              }}
            >
              {/* SKU */}
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    color: 'var(--color-gold, #c5a059)',
                    backgroundColor: 'rgba(197, 160, 89, 0.1)',
                    border: '1px solid rgba(197, 160, 89, 0.3)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  {p.sku}
                </span>
              </td>

              {/* Cut Name */}
              <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-primary, #0f172a)' }}>
                <Link
                  href={`/catalog/${p.slug}`}
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  {p.name}
                </Link>
              </td>

              {/* Brand */}
              <td style={{ padding: '12px 16px', color: 'var(--color-text-secondary, #475569)' }}>
                {p.brand}
              </td>

              {/* Category / Subcategory */}
              <td style={{ padding: '12px 16px', color: 'var(--color-text-secondary, #475569)' }}>
                <span>{p.subcategoryName || p.categoryName}</span>
              </td>

              {/* Packaging */}
              <td
                style={{
                  padding: '12px 16px',
                  color: 'var(--color-text-secondary, #64748b)',
                  maxWidth: '240px',
                }}
              >
                {p.packagingDescription}
              </td>

              {/* State */}
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                <span
                  style={{
                    fontSize: '11px',
                    color: 'var(--color-text-secondary, #475569)',
                    backgroundColor: 'var(--color-background-subtle, #f1f5f9)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    border: '1px solid var(--color-border-subtle, #e2e8f0)',
                  }}
                >
                  {p.productState}
                </span>
              </td>

              {/* Net Weight */}
              <td
                style={{
                  padding: '12px 16px',
                  textAlign: 'right',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                {p.cartonNetWeightKg} kg
              </td>

              {/* Action */}
              <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                <Link
                  href={`/catalog/${p.slug}`}
                  data-testid={`product-table-details-btn-${p.id}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--color-primary-dark, #0a192f)',
                    textDecoration: 'none',
                    padding: '4px 10px',
                    borderRadius: 'var(--border-radius-pill, 9999px)',
                    backgroundColor: 'rgba(197, 160, 89, 0.15)',
                    border: '1px solid rgba(197, 160, 89, 0.4)',
                  }}
                >
                  <span>Details</span>
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
