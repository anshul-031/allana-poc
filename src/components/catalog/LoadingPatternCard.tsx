'use client';

import React from 'react';
import { ProductDetailDTO } from '@/server/actions/catalog.actions';

export interface LoadingPatternCardProps {
  product: ProductDetailDTO;
}

export default function LoadingPatternCard({ product }: LoadingPatternCardProps) {
  const totalCartons = product.cartonsPerPallet * product.palletsPerContainer;

  return (
    <div
      data-testid="loading-pattern-card"
      style={{
        backgroundColor: 'var(--color-surface, #ffffff)',
        border: '1px solid var(--color-border, #e2e8f0)',
        borderRadius: 'var(--border-radius-xl, 16px)',
        padding: 'var(--spacing-xl, 22px)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: 'var(--spacing-xl, 24px)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--spacing-md, 16px)',
          paddingBottom: 'var(--spacing-sm, 10px)',
          borderBottom: '1px solid var(--color-border-subtle, #f1f5f9)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>🚢</span>
          <h4
            style={{
              fontSize: 'var(--font-size-md, 16px)',
              fontWeight: 800,
              color: 'var(--color-primary-dark, #0a192f)',
              margin: 0,
            }}
          >
            40ft High Cube Reefer Container Loading Pattern
          </h4>
        </div>

        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--color-gold, #c5a059)',
            backgroundColor: 'rgba(197, 160, 89, 0.1)',
            padding: '3px 10px',
            borderRadius: 'var(--border-radius-pill, 9999px)',
            border: '1px solid rgba(197, 160, 89, 0.3)',
          }}
        >
          Cold Chain Matrix &bull; -18&deg;C
        </span>
      </div>

      {/* Grid of Container Loading Parameters */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 'var(--spacing-md, 14px)',
        }}
      >
        {/* Metric 1: Cartons per pallet */}
        <div
          data-testid="metric-cartons-per-pallet"
          style={{
            backgroundColor: 'var(--color-background-subtle, #f8fafc)',
            border: '1px solid var(--color-border-subtle, #e2e8f0)',
            borderRadius: 'var(--border-radius-lg, 12px)',
            padding: '14px 16px',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary, #94a3b8)', fontWeight: 600 }}>
            Cartons Per Pallet
          </div>
          <div
            style={{
              fontSize: 'var(--font-size-xl, 22px)',
              fontWeight: 800,
              color: 'var(--color-primary-dark, #0a192f)',
              marginTop: '4px',
            }}
          >
            {product.cartonsPerPallet}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-secondary, #64748b)', marginTop: '2px' }}>
            Euro / ISO palletized layer
          </div>
        </div>

        {/* Metric 2: Pallets per container */}
        <div
          data-testid="metric-pallets-per-container"
          style={{
            backgroundColor: 'var(--color-background-subtle, #f8fafc)',
            border: '1px solid var(--color-border-subtle, #e2e8f0)',
            borderRadius: 'var(--border-radius-lg, 12px)',
            padding: '14px 16px',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary, #94a3b8)', fontWeight: 600 }}>
            Pallets Per Container
          </div>
          <div
            style={{
              fontSize: 'var(--font-size-xl, 22px)',
              fontWeight: 800,
              color: 'var(--color-primary-dark, #0a192f)',
              marginTop: '4px',
            }}
          >
            {product.palletsPerContainer}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-secondary, #64748b)', marginTop: '2px' }}>
            Full 40ft HC stowage
          </div>
        </div>

        {/* Metric 3: Total Cartons */}
        <div
          data-testid="metric-total-cartons"
          style={{
            backgroundColor: 'var(--color-background-subtle, #f8fafc)',
            border: '1px solid var(--color-border-subtle, #e2e8f0)',
            borderRadius: 'var(--border-radius-lg, 12px)',
            padding: '14px 16px',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary, #94a3b8)', fontWeight: 600 }}>
            Total Cartons
          </div>
          <div
            style={{
              fontSize: 'var(--font-size-xl, 22px)',
              fontWeight: 800,
              color: 'var(--color-primary-dark, #0a192f)',
              marginTop: '4px',
            }}
          >
            {totalCartons.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-secondary, #64748b)', marginTop: '2px' }}>
            Cartons per container load
          </div>
        </div>

        {/* Metric 4: Total Payload Weight MT */}
        <div
          data-testid="metric-total-payload-weight"
          style={{
            backgroundColor: 'rgba(197, 160, 89, 0.08)',
            border: '1px solid rgba(197, 160, 89, 0.35)',
            borderRadius: 'var(--border-radius-lg, 12px)',
            padding: '14px 16px',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--color-gold, #c5a059)', fontWeight: 700 }}>
            Total Container Net Payload
          </div>
          <div
            style={{
              fontSize: 'var(--font-size-xl, 22px)',
              fontWeight: 800,
              color: 'var(--color-primary-dark, #0a192f)',
              marginTop: '4px',
            }}
          >
            {product.totalContainerWeightMt} MT
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-secondary, #64748b)', marginTop: '2px' }}>
            {(product.totalContainerWeightMt * 1000).toLocaleString()} kg net export weight
          </div>
        </div>
      </div>
    </div>
  );
}
