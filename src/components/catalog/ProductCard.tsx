'use client';

import React from 'react';
import Link from 'next/link';
import { CatalogSearchProductDTO } from '@/server/actions/catalog.actions';

export interface ProductCardProps {
  product: CatalogSearchProductDTO;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <article
      data-testid={`product-card-${product.id}`}
      style={{
        backgroundColor: 'var(--color-surface, #ffffff)',
        border: '1px solid var(--color-border, #e2e8f0)',
        borderRadius: 'var(--border-radius-xl, 16px)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: 'var(--shadow-sm)',
        transition: 'var(--transition-fast)',
      }}
    >
      {/* Top Media & Tags Header */}
      <div>
        {/* Top Badges Bar */}
        <div
          style={{
            padding: '12px 16px 8px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: 'var(--color-primary-dark, #0a192f)',
              backgroundColor: 'var(--color-background-subtle, #f1f5f9)',
              padding: '2px 8px',
              borderRadius: 'var(--border-radius-sm, 4px)',
              border: '1px solid var(--color-border-subtle, #e2e8f0)',
            }}
          >
            {product.brand}
          </span>

          <span
            data-testid={`product-card-article-${product.id}`}
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: 'var(--color-gold, #c5a059)',
              backgroundColor: 'rgba(197, 160, 89, 0.1)',
              border: '1px solid rgba(197, 160, 89, 0.3)',
              padding: '2px 8px',
              borderRadius: 'var(--border-radius-sm, 4px)',
            }}
          >
            Article: {product.sku}
          </span>
        </div>

        {/* Thumbnail Preview Area */}
        <div
          style={{
            height: '140px',
            backgroundColor: 'var(--color-background-subtle, #f8fafc)',
            borderTop: '1px solid var(--color-border-subtle, #f1f5f9)',
            borderBottom: '1px solid var(--color-border-subtle, #f1f5f9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <div
            style={{
              fontSize: '44px',
              opacity: 0.85,
            }}
          >
            🥩
          </div>

          {product.isUnderDevelopment && (
            <span
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                fontSize: '10px',
                fontWeight: 700,
                color: '#64748b',
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                padding: '2px 6px',
                borderRadius: 'var(--border-radius-pill, 9999px)',
              }}
            >
              NPD In Review
            </span>
          )}
        </div>

        {/* Card Body */}
        <div style={{ padding: '14px 16px' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--color-text-tertiary, #94a3b8)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '4px',
            }}
          >
            {product.subcategoryName || product.categoryName}
          </div>

          <h3
            style={{
              fontSize: 'var(--font-size-md, 15px)',
              fontWeight: 700,
              color: 'var(--color-text-primary, #0f172a)',
              margin: '0 0 6px 0',
              lineHeight: 1.35,
            }}
          >
            <Link
              href={`/catalog/${product.slug}`}
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              {product.name}
            </Link>
          </h3>

          <p
            data-testid={`product-card-packaging-${product.id}`}
            style={{
              fontSize: '12px',
              color: 'var(--color-text-secondary, #64748b)',
              lineHeight: 1.45,
              margin: '0 0 12px 0',
            }}
          >
            {product.packagingDescription}
          </p>

          {/* Logistics Parameter Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
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
              {product.productState}
            </span>
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
              Carton: {product.cartonNetWeightKg} kg
            </span>
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div
        style={{
          padding: '10px 16px 14px 16px',
          borderTop: '1px solid var(--color-border-subtle, #f1f5f9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        <Link
          href={`/catalog/${product.slug}`}
          data-testid={`product-card-details-btn-${product.id}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--color-primary-dark, #0a192f)',
            textDecoration: 'none',
            padding: '6px 12px',
            borderRadius: 'var(--border-radius-pill, 9999px)',
            backgroundColor: 'rgba(197, 160, 89, 0.15)',
            border: '1px solid rgba(197, 160, 89, 0.4)',
            transition: 'var(--transition-fast)',
          }}
        >
          <span>Details</span>
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </article>
  );
}
