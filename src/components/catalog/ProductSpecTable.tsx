'use client';

import React from 'react';
import { ProductDetailDTO } from '@/server/actions/catalog.actions';

export interface ProductSpecTableProps {
  product: ProductDetailDTO;
  activePackagingId?: string;
}

export default function ProductSpecTable({
  product,
  activePackagingId,
}: ProductSpecTableProps) {
  return (
    <div
      data-testid="product-spec-table-container"
      style={{
        backgroundColor: 'var(--color-surface, #ffffff)',
        border: '1px solid var(--color-border, #e2e8f0)',
        borderRadius: 'var(--border-radius-xl, 16px)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: 'var(--spacing-xl, 24px)',
      }}
    >
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--color-border, #e2e8f0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <h4
          style={{
            fontSize: 'var(--font-size-md, 16px)',
            fontWeight: 800,
            color: 'var(--color-primary-dark, #0a192f)',
            margin: 0,
          }}
        >
          10-Column Export Logistics Specifications
        </h4>

        <span
          style={{
            fontSize: '11px',
            color: 'var(--color-gold, #c5a059)',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Export Grade &bull; SFDA Verified
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table
          data-testid="product-spec-table"
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '13px',
            minWidth: '920px',
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
                letterSpacing: '0.04em',
              }}
            >
              <th style={{ padding: '12px 14px' }}>1. SKU Article</th>
              <th style={{ padding: '12px 14px' }}>2. Nett Wt (kg)</th>
              <th style={{ padding: '12px 14px' }}>3. Primary Packaging</th>
              <th style={{ padding: '12px 14px' }}>4. Cut Size</th>
              <th style={{ padding: '12px 14px' }}>5. Pkgs / Carton</th>
              <th style={{ padding: '12px 14px' }}>6. Gross Wt (kg)</th>
              <th style={{ padding: '12px 14px' }}>7. Dimensions (mm)</th>
              <th style={{ padding: '12px 14px' }}>8. Shelf Life</th>
              <th style={{ padding: '12px 14px' }}>9. Storage Temp</th>
              <th style={{ padding: '12px 14px' }}>10. Freezing Type</th>
            </tr>
          </thead>
          <tbody>
            <tr
              data-testid="product-spec-row"
              style={{
                backgroundColor: activePackagingId ? 'rgba(197, 160, 89, 0.04)' : '#ffffff',
                borderBottom: '1px solid var(--color-border-subtle, #f1f5f9)',
                fontWeight: 500,
                color: 'var(--color-text-primary, #0f172a)',
              }}
            >
              {/* 1. Article / SKU */}
              <td style={{ padding: '14px' }}>
                <span
                  data-testid="spec-sku"
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: 'var(--color-gold, #c5a059)',
                    backgroundColor: 'rgba(197, 160, 89, 0.1)',
                    border: '1px solid rgba(197, 160, 89, 0.3)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  {product.sku}
                </span>
              </td>

              {/* 2. Nett Weight */}
              <td data-testid="spec-net-wt" style={{ padding: '14px', fontWeight: 700 }}>
                {product.cartonNetWeightKg} kg
              </td>

              {/* 3. Primary Packaging */}
              <td data-testid="spec-primary-packaging" style={{ padding: '14px' }}>
                {product.primaryPackaging}
              </td>

              {/* 4. Cut Size */}
              <td data-testid="spec-cut-size" style={{ padding: '14px' }}>
                {product.cutSize}
              </td>

              {/* 5. Packages per Carton */}
              <td data-testid="spec-pkgs-carton" style={{ padding: '14px' }}>
                {product.packagesPerCarton}
              </td>

              {/* 6. Carton Gross Weight */}
              <td data-testid="spec-gross-wt" style={{ padding: '14px', fontWeight: 600 }}>
                {product.cartonWeightKg} kg
              </td>

              {/* 7. Carton Dimensions */}
              <td data-testid="spec-dimensions" style={{ padding: '14px', whiteSpace: 'nowrap' }}>
                {product.cartonDimensionsMm}
              </td>

              {/* 8. Shelf Life */}
              <td data-testid="spec-shelf-life" style={{ padding: '14px' }}>
                {product.shelfLifeMonths} Months
              </td>

              {/* 9. Storage Conditions */}
              <td data-testid="spec-storage-temp" style={{ padding: '14px', whiteSpace: 'nowrap' }}>
                {product.storageTemperature}
              </td>

              {/* 10. Freezing Type */}
              <td data-testid="spec-freezing-type" style={{ padding: '14px', whiteSpace: 'nowrap' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#0e7490',
                    backgroundColor: '#e0f2fe',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: '1px solid #bae6fd',
                  }}
                >
                  {product.freezingType}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
