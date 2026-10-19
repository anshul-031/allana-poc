import React from 'react';
import Link from 'next/link';
import CustomProductWizard from '@/components/npd/CustomProductWizard';

export default function NewCustomProductPage() {
  return (
    <div
      data-testid="new-custom-product-page"
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: 'var(--spacing-xl, 24px) var(--spacing-lg, 16px)',
      }}
    >
      {/* Navigation Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        data-testid="npd-wizard-breadcrumbs"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: 'var(--font-size-sm, 13px)',
          color: 'var(--color-text-secondary, #64748b)',
          marginBottom: 'var(--spacing-lg, 20px)',
        }}
      >
        <Link
          href="/"
          style={{
            color: 'var(--color-primary-dark, #0a192f)',
            textDecoration: 'none',
            fontWeight: 500,
          }}
        >
          Home
        </Link>
        <span style={{ color: 'var(--color-slate-400, #94a3b8)' }}>/</span>
        <Link
          href="/customized-products"
          style={{
            color: 'var(--color-primary-dark, #0a192f)',
            textDecoration: 'none',
            fontWeight: 500,
          }}
        >
          Customized Products
        </Link>
        <span style={{ color: 'var(--color-slate-400, #94a3b8)' }}>/</span>
        <span style={{ color: 'var(--color-gold, #c5a059)', fontWeight: 700 }}>
          New NPD Request
        </span>
      </nav>

      {/* Header Banner */}
      <div
        style={{
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 'var(--font-size-2xl, 24px)',
              fontWeight: 800,
              color: 'var(--color-primary-dark, #0a192f)',
              margin: '0 0 6px 0',
            }}
          >
            New Product Development (NPD) Wizard
          </h1>
          <p
            style={{
              fontSize: 'var(--font-size-sm, 14px)',
              color: 'var(--color-text-secondary, #64748b)',
              margin: 0,
            }}
          >
            Submit custom formulations, trim tolerances, marination recipes, and packaging formats for
            R&amp;D export feasibility review.
          </p>
        </div>

        <Link
          href="/customized-products"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--color-text-secondary, #475569)',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: 600,
            padding: '8px 14px',
            borderRadius: 'var(--border-radius-md, 8px)',
            backgroundColor: 'var(--color-background-subtle, #f8fafc)',
            border: '1px solid var(--color-border, #e2e8f0)',
          }}
        >
          &larr; Back to Requests
        </Link>
      </div>

      {/* Multi-Step Wizard Form */}
      <CustomProductWizard />
    </div>
  );
}
