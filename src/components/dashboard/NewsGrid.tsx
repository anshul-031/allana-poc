'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { NewsArticleDTO, getLatestNewsArticles } from '@/server/actions/news.actions';
import { formatDateString } from '@/components/dashboard/RecentShipmentsWidget';

export interface NewsGridProps {
  initialArticles?: NewsArticleDTO[];
}

export const DEFAULT_FALLBACK_NEWS: NewsArticleDTO[] = [
  {
    id: 'news-fallback-1',
    title: 'Global Meat Market Update: Q4 Buffalo Export Trends & Ocean Freight Forecast',
    slug: 'global-meat-market-update-q4-2026',
    summary:
      'Analysis of cattle livestock cycles, port congestion at Nhava Sheva, and freight rate stabilization heading into festive demand across the Middle East.',
    contentHtml: '<p>Ocean freight rates on West Coast India to Arabian Gulf lanes stabilized...</p>',
    imageUrl: 'news/market-update-q4.webp',
    isSlider: false,
    publishedAt: new Date().toISOString(),
  },
  {
    id: 'news-fallback-2',
    title: 'Halal Assurance & SFDA Compliance Audit Completed Successfully',
    slug: 'halal-assurance-sfda-compliance-audit-2026',
    summary:
      'Allana export slaughterhouses in Aligarh and Sahibabad achieved 100% compliance score in the annual reassessment by Jamiat Ulama-i-Hind Halal Trust.',
    contentHtml: '<p>Allana export slaughterhouses in Aligarh and Sahibabad achieved 100% compliance...</p>',
    imageUrl: 'news/halal-audit-certified.webp',
    isSlider: false,
    publishedAt: new Date().toISOString(),
  },
  {
    id: 'news-fallback-3',
    title: 'Allana Expands Ultra-Low Temperature Cold Chain Fleet for GCC Trade',
    slug: 'allana-expands-cold-chain-fleet-gcc',
    summary:
      'Commissioning 50 new smart reefer containers equipped with real-time IoT temperature and GPS telemetry to guarantee unbroken cold chain visibility.',
    contentHtml: '<p>Allanasons Private Limited has inducted 50 state-of-the-art reefer containers...</p>',
    imageUrl: 'news/smart-reefer-fleet.webp',
    isSlider: true,
    publishedAt: new Date().toISOString(),
  },
  {
    id: 'news-fallback-4',
    title: 'New Value-Added Chilled Goat Cubes Launch in LuLu UAE Outlets',
    slug: 'chilled-goat-cubes-lulu-uae',
    summary:
      'Retail skin-pack MAP trays launched across 40 hypermarket locations with 60-day shelf stability developed collaboratively through our NPD pipeline.',
    contentHtml: '<p>Developed through our collaborative Customized Product NPD pipeline...</p>',
    imageUrl: 'news/goat-tray-retail.webp',
    isSlider: true,
    publishedAt: new Date().toISOString(),
  },
];

export default function NewsGrid({ initialArticles }: NewsGridProps) {
  const [articles, setArticles] = useState<NewsArticleDTO[]>(
    initialArticles && initialArticles.length > 0 ? initialArticles : DEFAULT_FALLBACK_NEWS
  );
  const [isLoading, setIsLoading] = useState(!initialArticles);

  useEffect(() => {
    if (!initialArticles) {
      setIsLoading(true);
      getLatestNewsArticles(4)
        .then((res) => {
          if (res.success && res.articles.length > 0) {
            setArticles(res.articles);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [initialArticles]);

  return (
    <section
      data-testid="news-grid-section"
      aria-labelledby="news-grid-heading"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--border-radius-xl)',
        padding: 'var(--spacing-lg) var(--spacing-xl)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: 'var(--spacing-xl)',
      }}
    >
      {/* Header Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--spacing-md)',
          marginBottom: 'var(--spacing-lg)',
          paddingBottom: 'var(--spacing-sm)',
          borderBottom: '1px solid var(--color-border-subtle, rgba(0,0,0,0.06))',
        }}
      >
        <div>
          <h2
            id="news-grid-heading"
            style={{
              fontSize: 'var(--font-size-lg)',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              margin: '0 0 2px 0',
            }}
          >
            Latest Export News & Market Insights
          </h2>
          <p
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-secondary)',
              margin: 0,
            }}
          >
            Veterinary compliance protocols, freight rate forecasts, and product launches.
          </p>
        </div>

        <Link
          href="/news"
          style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 600,
            color: 'var(--color-primary)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span>All News</span>
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>

      {/* Grid Content */}
      {isLoading ? (
        <div
          data-testid="news-loading-state"
          style={{
            padding: 'var(--spacing-xl)',
            textAlign: 'center',
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          Loading latest news articles...
        </div>
      ) : articles.length === 0 ? (
        <div
          data-testid="news-empty-state"
          style={{
            padding: 'var(--spacing-xl)',
            textAlign: 'center',
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          No articles published at this time.
        </div>
      ) : (
        <div
          data-testid="news-cards-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 'var(--spacing-lg)',
          }}
        >
          {articles.map((article) => (
            <article
              key={article.id}
              data-testid={`news-card-${article.id}`}
              style={{
                backgroundColor: 'var(--color-background-subtle)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--border-radius-lg)',
                padding: 'var(--spacing-lg)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'var(--transition-fast)',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 'var(--spacing-xs)',
                    marginBottom: 'var(--spacing-sm)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'var(--color-gold, #c5a059)',
                      backgroundColor: 'rgba(197, 160, 89, 0.1)',
                      padding: '2px 8px',
                      borderRadius: 'var(--border-radius-sm)',
                      border: '1px solid rgba(197, 160, 89, 0.25)',
                    }}
                  >
                    Export Insights
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                    {formatDateString(article.publishedAt)}
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: 'var(--font-size-md)',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                    margin: '0 0 var(--spacing-xs) 0',
                    lineHeight: 1.35,
                  }}
                >
                  <Link
                    href={`/news/${article.slug}`}
                    style={{
                      color: 'inherit',
                      textDecoration: 'none',
                    }}
                  >
                    {article.title}
                  </Link>
                </h3>

                <p
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  {article.summary}
                </p>
              </div>

              <div style={{ marginTop: 'var(--spacing-md)', paddingTop: 'var(--spacing-sm)' }}>
                <Link
                  href={`/news/${article.slug}`}
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 700,
                    color: 'var(--color-primary)',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>Read Article</span>
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
