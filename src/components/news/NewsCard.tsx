'use client';

import React from 'react';
import Link from 'next/link';
import { NewsArticleDTO } from '@/server/actions/news.actions';
import { formatNewsDate, calculateReadTime } from '@/lib/utils';


export interface NewsCardProps {
  article: NewsArticleDTO;
  featured?: boolean;
}

export function getArticleCategory(title: string, summary: string): string {
  const text = `${title} ${summary}`.toLowerCase();
  if (text.includes('sfda') || text.includes('compliance') || text.includes('halal') || text.includes('audit')) {
    return 'SFDA & Compliance';
  }
  if (text.includes('market') || text.includes('trend') || text.includes('freight') || text.includes('price')) {
    return 'Market Trends';
  }
  if (text.includes('npd') || text.includes('custom') || text.includes('launch') || text.includes('product')) {
    return 'Product Launches';
  }
  return 'Export Insights';
}

export default function NewsCard({ article, featured = false }: NewsCardProps) {
  const category = getArticleCategory(article.title, article.summary);
  const readTime = calculateReadTime(article.contentHtml);
  const dateStr = formatNewsDate(article.publishedAt);

  return (
    <article
      data-testid={`news-card-${article.id}`}
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--border-radius-xl)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: featured ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        transition: 'var(--transition-fast)',
      }}
    >
      {/* Top Banner / Image Area */}
      <div
        style={{
          height: featured ? '180px' : '140px',
          backgroundColor: 'var(--color-primary-dark, #0a192f)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--spacing-md)',
          background: 'linear-gradient(135deg, #0a192f 0%, #1e3a5f 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--color-gold, #c5a059)',
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: '28px' }}>📰</span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-gold, #c5a059)',
            }}
          >
            Allana Global Trade Desk
          </span>
        </div>

        {/* Category Pill Tag */}
        <span
          data-testid="article-category-badge"
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            backgroundColor: 'rgba(10, 25, 47, 0.85)',
            color: 'var(--color-gold, #c5a059)',
            border: '1px solid rgba(197, 160, 89, 0.4)',
            fontSize: '10px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            padding: '3px 8px',
            borderRadius: 'var(--border-radius-sm)',
            backdropFilter: 'blur(4px)',
          }}
        >
          {category}
        </span>
      </div>

      {/* Card Content Area */}
      <div
        style={{
          padding: 'var(--spacing-lg)',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'space-between',
        }}
      >
        <div>
          {/* Metadata Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--spacing-xs)',
              marginBottom: 'var(--spacing-xs)',
              fontSize: '11px',
              color: 'var(--color-text-tertiary)',
            }}
          >
            <span data-testid="article-date">{dateStr}</span>
            <span data-testid="article-read-time">{readTime}</span>
          </div>

          {/* Title */}
          <h3
            style={{
              fontSize: featured ? 'var(--font-size-lg)' : 'var(--font-size-md)',
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

          {/* Summary */}
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

        {/* Card Footer Link */}
        <div style={{ marginTop: 'var(--spacing-md)', paddingTop: 'var(--spacing-sm)' }}>
          <Link
            href={`/news/${article.slug}`}
            style={{
              fontSize: 'var(--font-size-xs)',
              fontWeight: 700,
              color: 'var(--color-primary, #0e7490)',
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
      </div>
    </article>
  );
}
