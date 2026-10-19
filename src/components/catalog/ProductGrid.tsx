'use client';

import React from 'react';
import { CatalogSearchProductDTO } from '@/server/actions/catalog.actions';
import ProductCard from './ProductCard';

export interface ProductGridProps {
  products: CatalogSearchProductDTO[];
  isLoading?: boolean;
}

export default function ProductGrid({ products, isLoading = false }: ProductGridProps) {
  if (isLoading) {
    return (
      <div
        data-testid="product-grid-loading"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 'var(--spacing-lg, 18px)',
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            style={{
              height: '320px',
              borderRadius: 'var(--border-radius-xl, 16px)',
              backgroundColor: 'var(--color-background-subtle, #f8fafc)',
              border: '1px solid var(--color-border-subtle, #e2e8f0)',
              animation: 'pulse 1.5s infinite',
            }}
          />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div
        data-testid="product-grid-empty"
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
      data-testid="product-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 'var(--spacing-lg, 18px)',
      }}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
