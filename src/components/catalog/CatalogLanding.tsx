'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CatalogSearch from './CatalogSearch';

export interface CategoryHeroCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  badge: string;
  isUnderDevelopment: boolean;
  href?: string;
}

export const CATEGORY_HERO_CARDS: CategoryHeroCard[] = [
  {
    id: 'further-processing',
    title: 'Further Processing Products',
    description: 'Sausages, burger patties, marinated strips, and value-added culinary items.',
    icon: '🍔',
    badge: 'Value Added',
    isUnderDevelopment: true,
  },
  {
    id: 'frozen-buffalo',
    title: 'Frozen Buffalo Meat Products',
    description: 'Allana flagship Indian buffalo meat: prime hindquarter, forequarter, and fillet cuts.',
    icon: '🥩',
    badge: '100% Halal Certified',
    isUnderDevelopment: false,
    href: '/catalog?category=frozen-buffalo',
  },
  {
    id: 'new-products',
    title: 'New Products',
    description: 'Latest product formulations, vacuum skin-pack trays, and retail-ready MAP portions.',
    icon: '📢',
    badge: 'Innovation NPD',
    isUnderDevelopment: true,
  },
  {
    id: 'customized-products',
    title: 'Customized Products',
    description: 'Tailored meat cuts, custom calibers, private label, and special export specifications.',
    icon: '✨',
    badge: 'Tailored NPD Pipeline',
    isUnderDevelopment: false,
    href: '/customized-products/new',
  },
];

export const BRAND_SHOWCASE = [
  { name: 'Allana', subtitle: 'Global Flagship Brand' },
  { name: 'Al-Tamam', subtitle: 'Middle East Choice' },
  { name: 'OMAR', subtitle: 'Prime Export Selection' },
  { name: 'Premium Gold', subtitle: 'Hand-Selected Cuts' },
];

export default function CatalogLanding() {
  const router = useRouter();
  const [devNoticeCard, setDevNoticeCard] = useState<string | null>(null);

  const handleCardClick = (card: CategoryHeroCard) => {
    if (card.isUnderDevelopment) {
      setDevNoticeCard(card.title);
    } else if (card.href) {
      router.push(card.href);
    }
  };

  return (
    <div
      data-testid="catalog-landing"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-2xl, 32px)',
        marginBottom: 'var(--spacing-2xl, 32px)',
      }}
    >
      {/* Search Header Banner */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: 'var(--spacing-xl, 24px) var(--spacing-lg, 16px)',
          backgroundColor: 'var(--color-primary-dark, #0a192f)',
          borderRadius: 'var(--border-radius-xl, 16px)',
          color: '#ffffff',
          backgroundImage:
            'radial-gradient(circle at 80% 20%, rgba(197, 160, 89, 0.15) 0%, transparent 60%)',
          border: '1px solid rgba(197, 160, 89, 0.25)',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--color-gold, #c5a059)',
            marginBottom: 'var(--spacing-xs, 4px)',
          }}
        >
          Export Specifications Catalog
        </span>
        <h1
          style={{
            fontSize: 'var(--font-size-2xl, 28px)',
            fontWeight: 800,
            margin: '0 0 var(--spacing-sm, 8px) 0',
          }}
        >
          Digital Product Catalog &amp; Anatomical Cuts
        </h1>
        <p
          style={{
            fontSize: 'var(--font-size-sm, 14px)',
            color: 'rgba(255, 255, 255, 0.8)',
            maxWidth: '620px',
            margin: '0 0 var(--spacing-lg, 16px) 0',
            lineHeight: 1.5,
          }}
        >
          Explore certified Halal buffalo meat, value-added products, and tailored specifications
          meeting SFDA, ISO 22000, and global veterinary compliance standards.
        </p>

        {/* Prominent Autocomplete Search */}
        <CatalogSearch placeholder="Search by cut name (e.g. Topside, Silverside), SKU article, or brand..." />
      </div>

      {/* 4 Hero Category Blocks */}
      <div>
        <h2
          style={{
            fontSize: 'var(--font-size-lg, 18px)',
            fontWeight: 700,
            color: 'var(--color-text-primary, #0f172a)',
            marginBottom: 'var(--spacing-md, 14px)',
          }}
        >
          Select Product Category
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 'var(--spacing-lg, 16px)',
          }}
        >
          {CATEGORY_HERO_CARDS.map((card) => (
            <div
              key={card.id}
              data-testid={`category-card-${card.id}`}
              role="button"
              tabIndex={0}
              onClick={() => handleCardClick(card)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCardClick(card);
                }
              }}
              style={{
                backgroundColor: 'var(--color-surface, #ffffff)',
                border: '1px solid var(--color-border, #e2e8f0)',
                borderRadius: 'var(--border-radius-xl, 16px)',
                padding: 'var(--spacing-xl, 20px)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'var(--transition-fast)',
                boxShadow: 'var(--shadow-sm)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 'var(--spacing-md, 12px)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '52px',
                      height: '52px',
                      borderRadius: '12px',
                      backgroundColor: 'var(--color-background-subtle, #f8fafc)',
                      border: '1px solid var(--color-border-subtle, #e2e8f0)',
                    }}
                  >
                    {card.icon}
                  </span>

                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: card.isUnderDevelopment ? '#64748b' : 'var(--color-gold, #c5a059)',
                      backgroundColor: card.isUnderDevelopment
                        ? '#f1f5f9'
                        : 'rgba(197, 160, 89, 0.12)',
                      padding: '3px 8px',
                      borderRadius: 'var(--border-radius-pill, 9999px)',
                      border: card.isUnderDevelopment
                        ? '1px solid #cbd5e1'
                        : '1px solid rgba(197, 160, 89, 0.3)',
                    }}
                  >
                    {card.badge}
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: 'var(--font-size-md, 16px)',
                    fontWeight: 700,
                    color: 'var(--color-text-primary, #0f172a)',
                    margin: '0 0 var(--spacing-xs, 6px) 0',
                  }}
                >
                  {card.title}
                </h3>

                <p
                  style={{
                    fontSize: 'var(--font-size-xs, 13px)',
                    color: 'var(--color-text-secondary, #64748b)',
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  {card.description}
                </p>
              </div>

              <div
                style={{
                  marginTop: 'var(--spacing-lg, 16px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: card.isUnderDevelopment
                    ? 'var(--color-text-tertiary, #94a3b8)'
                    : 'var(--color-primary, #0e7490)',
                  fontSize: 'var(--font-size-xs, 12px)',
                  fontWeight: 700,
                }}
              >
                <span>{card.isUnderDevelopment ? 'Under Development' : 'Browse Cuts'}</span>
                <span aria-hidden="true">&rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Brand Portfolio Showcase Bar */}
      <div
        data-testid="catalog-brands-showcase"
        style={{
          backgroundColor: 'var(--color-surface, #ffffff)',
          border: '1px solid var(--color-border, #e2e8f0)',
          borderRadius: 'var(--border-radius-xl, 16px)',
          padding: 'var(--spacing-lg, 18px) var(--spacing-xl, 24px)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--color-text-tertiary, #94a3b8)',
            marginBottom: 'var(--spacing-md, 12px)',
          }}
        >
          Allana Enterprise Brands Portfolio
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 'var(--spacing-md, 14px)',
          }}
        >
          {BRAND_SHOWCASE.map((brand) => (
            <div
              key={brand.name}
              data-testid={`brand-showcase-${brand.name.toLowerCase().replace(' ', '-')}`}
              style={{
                backgroundColor: 'var(--color-background-subtle, #f8fafc)',
                border: '1px solid var(--color-border-subtle, #e2e8f0)',
                borderRadius: 'var(--border-radius-md, 8px)',
                padding: '12px 16px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <span
                style={{
                  fontSize: 'var(--font-size-sm, 14px)',
                  fontWeight: 800,
                  color: 'var(--color-primary-dark, #0a192f)',
                  letterSpacing: '0.05em',
                }}
              >
                {brand.name}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  color: 'var(--color-text-secondary, #64748b)',
                  marginTop: '2px',
                }}
              >
                {brand.subtitle}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Development Notice Modal */}
      {devNoticeCard && (
        <div
          data-testid="dev-notice-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dev-notice-title"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(10, 25, 47, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: 'var(--spacing-md, 16px)',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface, #ffffff)',
              borderRadius: 'var(--border-radius-xl, 16px)',
              padding: 'var(--spacing-xl, 24px)',
              maxWidth: '440px',
              width: '100%',
              boxShadow: 'var(--shadow-xl)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'rgba(197, 160, 89, 0.15)',
                color: 'var(--color-gold, #c5a059)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                margin: '0 auto var(--spacing-md, 14px) auto',
              }}
            >
              &#9888;
            </div>

            <h3
              id="dev-notice-title"
              style={{
                fontSize: 'var(--font-size-lg, 18px)',
                fontWeight: 800,
                color: 'var(--color-primary-dark, #0a192f)',
                margin: '0 0 var(--spacing-sm, 8px) 0',
              }}
            >
              This part is under development
            </h3>

            <p
              style={{
                fontSize: 'var(--font-size-sm, 14px)',
                color: 'var(--color-text-secondary, #64748b)',
                lineHeight: 1.5,
                margin: '0 0 var(--spacing-xl, 20px) 0',
              }}
            >
              The {devNoticeCard} section is currently being expanded. Check the details with your
              assigned export manager or submit a customized request.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--spacing-sm, 8px)' }}>
              <button
                type="button"
                data-testid="dev-notice-close-btn"
                onClick={() => setDevNoticeCard(null)}
                style={{
                  backgroundColor: 'var(--color-primary-dark, #0a192f)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--border-radius-pill, 9999px)',
                  padding: '8px 24px',
                  fontSize: 'var(--font-size-xs, 12px)',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Close Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
