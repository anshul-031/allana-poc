'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ProductDetailDTO, ProductPackagingOption } from '@/server/actions/catalog.actions';
import PackagingSwitcher from './PackagingSwitcher';
import ProductSpecTable from './ProductSpecTable';
import LoadingPatternCard from './LoadingPatternCard';

export interface ProductDetailViewProps {
  product: ProductDetailDTO;
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const [selectedPackaging, setSelectedPackaging] = useState<ProductPackagingOption>(
    product.packagingOptions[0] || {
      id: 'vacuum-block',
      label: 'Vacuum Block (IWP)',
      format: 'Individually vacuum packed in food-grade multilayer barrier shrink film',
      imageUrl: 'products/packaging/sample-vacuum.webp',
    }
  );

  return (
    <div
      data-testid="product-detail-view"
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: 'var(--spacing-xl, 24px) var(--spacing-lg, 16px)',
      }}
    >
      {/* 1. Clickable Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        data-testid="product-breadcrumbs"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: 'var(--font-size-sm, 13px)',
          color: 'var(--color-text-secondary, #64748b)',
          marginBottom: 'var(--spacing-lg, 20px)',
          flexWrap: 'wrap',
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
          href="/catalog"
          style={{
            color: 'var(--color-primary-dark, #0a192f)',
            textDecoration: 'none',
            fontWeight: 500,
          }}
        >
          Catalog
        </Link>
        <span style={{ color: 'var(--color-slate-400, #94a3b8)' }}>/</span>

        <Link
          href={`/catalog?category=${encodeURIComponent(product.categorySlug)}`}
          style={{
            color: 'var(--color-primary-dark, #0a192f)',
            textDecoration: 'none',
            fontWeight: 500,
          }}
        >
          {product.categoryName}
        </Link>

        {product.subcategoryName && product.subcategorySlug && (
          <>
            <span style={{ color: 'var(--color-slate-400, #94a3b8)' }}>/</span>
            <Link
              href={`/catalog?category=${encodeURIComponent(product.categorySlug)}&subcategory=${encodeURIComponent(
                product.subcategorySlug
              )}`}
              style={{
                color: 'var(--color-primary-dark, #0a192f)',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              {product.subcategoryName}
            </Link>
          </>
        )}

        <span style={{ color: 'var(--color-slate-400, #94a3b8)' }}>/</span>
        <span
          data-testid="breadcrumb-active"
          style={{
            color: 'var(--color-gold, #c5a059)',
            fontWeight: 700,
          }}
        >
          {product.name}
        </span>
      </nav>

      {/* Top Action Bar: Back Button & Spec Sheet Download */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--spacing-xl, 24px)',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <Link
          href="/catalog"
          data-testid="back-to-catalog-link"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--color-text-secondary, #475569)',
            textDecoration: 'none',
            fontSize: 'var(--font-size-sm, 14px)',
            fontWeight: 600,
            padding: '8px 14px',
            borderRadius: 'var(--border-radius-md, 8px)',
            backgroundColor: 'var(--color-background-subtle, #f8fafc)',
            border: '1px solid var(--color-border, #e2e8f0)',
            transition: 'var(--transition-fast)',
          }}
        >
          <span>&larr;</span> Back to Product Catalog
        </Link>

        <a
          href={`/api/catalog/${encodeURIComponent(product.slug)}/spec-sheet`}
          download={`Allana-Spec-${product.sku}.pdf`}
          data-testid="download-spec-sheet-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--color-primary-dark, #0a192f)',
            color: '#ffffff',
            padding: '10px 18px',
            borderRadius: 'var(--border-radius-lg, 10px)',
            textDecoration: 'none',
            fontSize: 'var(--font-size-sm, 14px)',
            fontWeight: 700,
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--color-gold, #c5a059)',
            cursor: 'pointer',
          }}
        >
          <span>📥</span> Download Spec Sheet (PDF)
        </a>
      </div>

      {/* Under Development Alert Banner */}
      {product.isUnderDevelopment && (
        <div
          data-testid="under-development-banner"
          style={{
            backgroundColor: 'var(--color-warning-bg, #fffbeb)',
            border: '1px solid var(--color-warning-border, #fde68a)',
            borderRadius: 'var(--border-radius-lg, 12px)',
            padding: '14px 18px',
            marginBottom: 'var(--spacing-xl, 24px)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: 'var(--color-warning-text, #92400e)',
            fontSize: 'var(--font-size-sm, 14px)',
          }}
        >
          <span style={{ fontSize: '20px' }}>⚠️</span>
          <div>
            <strong>Product Specification Under Development:</strong> This product specification is
            currently undergoing R&amp;D and QA standardization. Metrics and logistics configurations
            are preliminary and subject to final export quality validation.
          </div>
        </div>
      )}

      {/* Hero Overview: Imagery & Key Commercial Attributes */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--spacing-2xl, 32px)',
          backgroundColor: 'var(--color-surface, #ffffff)',
          border: '1px solid var(--color-border, #e2e8f0)',
          borderRadius: 'var(--border-radius-xl, 16px)',
          padding: 'var(--spacing-2xl, 28px)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: 'var(--spacing-2xl, 28px)',
        }}
      >
        {/* Left Column: Visual Media Gallery */}
        <div data-testid="pdp-media-gallery">
          <div
            data-testid="pdp-main-image-container"
            style={{
              width: '100%',
              height: '320px',
              backgroundColor: 'var(--color-primary-dark, #0a192f)',
              borderRadius: 'var(--border-radius-lg, 12px)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--color-border, #e2e8f0)',
              color: '#ffffff',
            }}
          >
            {/* Visual Icon Illustration / Fallback */}
            <div style={{ fontSize: '64px', marginBottom: '8px' }}>🥩</div>
            <div
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: 'var(--color-gold, #c5a059)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {product.brand} Export Cut
            </div>
            <div
              style={{
                fontSize: '12px',
                color: 'var(--color-slate-400, #94a3b8)',
                marginTop: '4px',
              }}
            >
              {product.name}
            </div>

            {/* Overlays / Badges */}
            <div
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                backgroundColor: 'rgba(10, 25, 47, 0.85)',
                backdropFilter: 'blur(4px)',
                border: '1px solid var(--color-gold, #c5a059)',
                padding: '4px 10px',
                borderRadius: 'var(--border-radius-pill, 9999px)',
                fontSize: '11px',
                fontWeight: 800,
                color: 'var(--color-gold, #c5a059)',
                letterSpacing: '0.04em',
              }}
            >
              {product.brand}
            </div>

            <div
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                backgroundColor: 'rgba(14, 116, 144, 0.9)',
                padding: '4px 10px',
                borderRadius: 'var(--border-radius-pill, 9999px)',
                fontSize: '11px',
                fontWeight: 700,
                color: '#ffffff',
              }}
            >
              {product.freezingType}
            </div>
          </div>

          {/* Active Packaging Format Showcase */}
          <div
            data-testid="active-packaging-showcase"
            style={{
              marginTop: '16px',
              padding: '12px 16px',
              backgroundColor: 'var(--color-background-subtle, #f8fafc)',
              borderRadius: 'var(--border-radius-md, 8px)',
              border: '1px solid var(--color-border-subtle, #e2e8f0)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span style={{ fontSize: '24px' }}>📦</span>
            <div>
              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--color-text-tertiary, #94a3b8)',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}
              >
                Selected Secondary Packaging
              </div>
              <div
                data-testid="selected-packaging-label"
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--color-text-primary, #0f172a)',
                }}
              >
                {selectedPackaging.label}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Commercial Specifications & Certifications */}
        <div data-testid="pdp-info-column">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '8px',
              flexWrap: 'wrap',
            }}
          >
            <span
              data-testid="pdp-sku-badge"
              style={{
                fontSize: '12px',
                fontWeight: 800,
                color: 'var(--color-gold, #c5a059)',
                backgroundColor: 'rgba(197, 160, 89, 0.1)',
                border: '1px solid rgba(197, 160, 89, 0.3)',
                padding: '3px 10px',
                borderRadius: '6px',
                letterSpacing: '0.04em',
              }}
            >
              SKU: {product.sku}
            </span>

            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--color-success-text, #166534)',
                backgroundColor: 'var(--color-success-bg, #f0fdf4)',
                border: '1px solid var(--color-success-border, #bbf7d0)',
                padding: '3px 10px',
                borderRadius: '6px',
              }}
            >
              {product.productState}
            </span>
          </div>

          <h1
            data-testid="pdp-product-title"
            style={{
              fontSize: 'var(--font-size-2xl, 26px)',
              fontWeight: 800,
              color: 'var(--color-primary-dark, #0a192f)',
              margin: '0 0 12px 0',
              lineHeight: 1.25,
            }}
          >
            {product.name}
          </h1>

          <p
            data-testid="pdp-product-description"
            style={{
              fontSize: 'var(--font-size-sm, 14px)',
              color: 'var(--color-text-secondary, #475569)',
              lineHeight: 1.6,
              marginBottom: '20px',
            }}
          >
            {product.description}
          </p>

          {/* Quick Spec Highlights Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                backgroundColor: 'var(--color-background-subtle, #f8fafc)',
                padding: '10px 14px',
                borderRadius: 'var(--border-radius-md, 8px)',
                border: '1px solid var(--color-border-subtle, #e2e8f0)',
              }}
            >
              <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary, #94a3b8)', display: 'block' }}>
                Primary Packaging
              </span>
              <strong style={{ fontSize: '13px', color: 'var(--color-text-primary, #0f172a)' }}>
                {product.primaryPackaging}
              </strong>
            </div>

            <div
              style={{
                backgroundColor: 'var(--color-background-subtle, #f8fafc)',
                padding: '10px 14px',
                borderRadius: 'var(--border-radius-md, 8px)',
                border: '1px solid var(--color-border-subtle, #e2e8f0)',
              }}
            >
              <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary, #94a3b8)', display: 'block' }}>
                Storage Temperature
              </span>
              <strong style={{ fontSize: '13px', color: 'var(--color-text-primary, #0f172a)' }}>
                {product.storageTemperature}
              </strong>
            </div>

            <div
              style={{
                backgroundColor: 'var(--color-background-subtle, #f8fafc)',
                padding: '10px 14px',
                borderRadius: 'var(--border-radius-md, 8px)',
                border: '1px solid var(--color-border-subtle, #e2e8f0)',
              }}
            >
              <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary, #94a3b8)', display: 'block' }}>
                Shelf Life
              </span>
              <strong style={{ fontSize: '13px', color: 'var(--color-text-primary, #0f172a)' }}>
                {product.shelfLifeMonths} Months
              </strong>
            </div>

            <div
              style={{
                backgroundColor: 'var(--color-background-subtle, #f8fafc)',
                padding: '10px 14px',
                borderRadius: 'var(--border-radius-md, 8px)',
                border: '1px solid var(--color-border-subtle, #e2e8f0)',
              }}
            >
              <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary, #94a3b8)', display: 'block' }}>
                Net Carton Weight
              </span>
              <strong style={{ fontSize: '13px', color: 'var(--color-text-primary, #0f172a)' }}>
                {product.cartonNetWeightKg} kg / Carton
              </strong>
            </div>
          </div>

          {/* International Certifications Strip */}
          <div data-testid="pdp-certifications-strip">
            <h4
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--color-text-tertiary, #94a3b8)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '10px',
              }}
            >
              Certified Compliance Standards
            </h4>
            <div
              style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
              }}
            >
              {product.certifications.map((cert) => (
                <span
                  key={cert}
                  data-testid={`cert-badge-${cert}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    fontWeight: 700,
                    backgroundColor: 'rgba(197, 160, 89, 0.1)',
                    color: 'var(--color-gold-700, #9c7b39)',
                    border: '1px solid var(--color-gold, #c5a059)',
                    padding: '4px 10px',
                    borderRadius: 'var(--border-radius-pill, 9999px)',
                  }}
                >
                  <span>✓</span> {cert.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Packaging Switcher */}
      <PackagingSwitcher
        options={product.packagingOptions}
        onSelectOption={(opt) => setSelectedPackaging(opt)}
      />

      {/* 3. 10-Column Logistics Specs Table */}
      <ProductSpecTable product={product} activePackagingId={selectedPackaging.id} />

      {/* 4. 40ft High Cube Container Loading Pattern Matrix */}
      <LoadingPatternCard product={product} />

      {/* 5. Food Safety & Export Quality Assurance Notice */}
      <div
        data-testid="food-safety-assurance"
        style={{
          backgroundColor: 'var(--color-surface, #ffffff)',
          border: '1px solid var(--color-border, #e2e8f0)',
          borderRadius: 'var(--border-radius-xl, 16px)',
          padding: '20px 24px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '20px' }}>🛡️</span>
          <h4
            style={{
              fontSize: '15px',
              fontWeight: 800,
              color: 'var(--color-primary-dark, #0a192f)',
              margin: 0,
            }}
          >
            Allana Global Export Quality Guarantee
          </h4>
        </div>
        <p
          style={{
            fontSize: '13px',
            color: 'var(--color-text-secondary, #64748b)',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          All cuts are processed in state-of-the-art export plants accredited by APEDA, SFDA, and
          international food authorities. Every consignment undergoes rigorous microbiological testing,
          continuous temperature data logging from cold room to destination port, and Halal certification
          under supervision of approved Islamic authorities.
        </p>
      </div>
    </div>
  );
}
