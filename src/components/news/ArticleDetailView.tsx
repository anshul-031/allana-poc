'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import NewsCard, { getArticleCategory } from '@/components/news/NewsCard';
import { NewsArticleDTO } from '@/server/actions/news.actions';
import { formatNewsDate, calculateReadTime } from '@/lib/utils';


export interface ArticleDetailViewProps {
  article: NewsArticleDTO | null;
  relatedArticles?: NewsArticleDTO[];
}

export default function ArticleDetailView({
  article,
  relatedArticles = [],
}: ArticleDetailViewProps) {
  const [copied, setCopied] = useState(false);

  if (!article) {
    return (
      <div
        data-testid="article-not-found"
        style={{
          maxWidth: '800px',
          margin: 'var(--spacing-2xl) auto',
          padding: 'var(--spacing-2xl)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--border-radius-xl)',
          textAlign: 'center',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ fontSize: '40px', marginBottom: 'var(--spacing-md)' }}>📰</div>
        <h1
          style={{
            fontSize: 'var(--font-size-xl)',
            fontWeight: 800,
            color: 'var(--color-text-primary)',
            margin: '0 0 var(--spacing-sm) 0',
          }}
        >
          Article Not Found
        </h1>
        <p
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--spacing-lg)',
          }}
        >
          The requested market update or announcement could not be found or may have been archived.
        </p>
        <Link
          href="/news"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 20px',
            backgroundColor: 'var(--color-primary, #0e7490)',
            color: '#ffffff',
            borderRadius: 'var(--border-radius-pill)',
            textDecoration: 'none',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 600,
          }}
        >
          <span>&larr;</span>
          <span>Back to All News</span>
        </Link>
      </div>
    );
  }

  const category = getArticleCategory(article.title, article.summary);
  const readTime = calculateReadTime(article.contentHtml);
  const dateStr = formatNewsDate(article.publishedAt);

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <article
      data-testid="article-detail-view"
      style={{
        maxWidth: '1040px',
        margin: '0 auto',
        padding: 'var(--spacing-xl) var(--spacing-lg)',
      }}
    >
      {/* Top Breadcrumb & Back Navigation */}
      <nav
        aria-label="Breadcrumbs"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--spacing-sm)',
          marginBottom: 'var(--spacing-lg)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-secondary)',
          }}
        >
          <Link href="/dashboard" style={{ color: 'inherit', textDecoration: 'none' }}>
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/news" style={{ color: 'inherit', textDecoration: 'none' }}>
            News
          </Link>
          <span>/</span>
          <span
            style={{
              color: 'var(--color-text-primary)',
              fontWeight: 600,
              maxWidth: '300px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {article.title}
          </span>
        </div>

        <Link
          href="/news"
          data-testid="back-to-news-link"
          style={{
            fontSize: 'var(--font-size-xs)',
            fontWeight: 600,
            color: 'var(--color-primary, #0e7490)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span>&larr;</span>
          <span>Back to News</span>
        </Link>
      </nav>

      {/* Main Article Container */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--border-radius-xl)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)',
          marginBottom: 'var(--spacing-2xl)',
        }}
      >
        {/* Hero Header Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0a192f 0%, #1e3a5f 100%)',
            padding: 'var(--spacing-2xl) var(--spacing-xl)',
            color: '#ffffff',
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              marginBottom: 'var(--spacing-md)',
            }}
          >
            <span
              style={{
                backgroundColor: 'rgba(197, 160, 89, 0.2)',
                color: 'var(--color-gold, #c5a059)',
                border: '1px solid rgba(197, 160, 89, 0.5)',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '4px 10px',
                borderRadius: 'var(--border-radius-pill)',
              }}
            >
              {category}
            </span>
            <span
              style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              Published {dateStr} &bull; {readTime}
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
              fontWeight: 800,
              lineHeight: 1.25,
              margin: '0 0 var(--spacing-md) 0',
              color: '#ffffff',
            }}
          >
            {article.title}
          </h1>

          <p
            style={{
              fontSize: 'var(--font-size-md)',
              lineHeight: 1.6,
              color: 'rgba(255, 255, 255, 0.9)',
              margin: 0,
              maxWidth: '820px',
            }}
          >
            {article.summary}
          </p>
        </div>

        {/* Content & Action Bar Body */}
        <div style={{ padding: 'var(--spacing-xl)' }}>
          {/* Action Toolbar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: 'var(--spacing-md)',
              marginBottom: 'var(--spacing-xl)',
              borderBottom: '1px solid var(--color-border)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Author:</span>
              <strong style={{ color: 'var(--color-text-primary)' }}>
                Allana Global Trade & Regulatory Intelligence
              </strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="button"
                data-testid="print-article-btn"
                onClick={handlePrint}
                style={{
                  background: 'none',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--border-radius-pill)',
                  padding: '4px 12px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                }}
              >
                🖨️ Print
              </button>

              <button
                type="button"
                data-testid="share-article-btn"
                onClick={handleShare}
                style={{
                  background: 'none',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--border-radius-pill)',
                  padding: '4px 12px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--color-primary, #0e7490)',
                }}
              >
                {copied ? '✓ Copied Link' : '🔗 Share Link'}
              </button>
            </div>
          </div>

          {/* Rich Content View */}
          <div
            data-testid="article-content-body"
            style={{
              fontSize: 'var(--font-size-base)',
              lineHeight: 1.8,
              color: 'var(--color-text-primary)',
            }}
            dangerouslySetInnerHTML={{ __html: article.contentHtml }}
          />

          {/* Key Strategic Takeaways Box */}
          <div
            style={{
              marginTop: 'var(--spacing-2xl)',
              padding: 'var(--spacing-lg) var(--spacing-xl)',
              backgroundColor: 'var(--color-background-subtle)',
              borderLeft: '4px solid var(--color-gold, #c5a059)',
              borderRadius: '0 var(--border-radius-lg) var(--border-radius-lg) 0',
            }}
          >
            <h3
              style={{
                fontSize: 'var(--font-size-md)',
                fontWeight: 700,
                color: 'var(--color-primary-dark, #0a192f)',
                margin: '0 0 var(--spacing-xs) 0',
              }}
            >
              Key Partner Highlights & Next Steps
            </h3>
            <ul
              style={{
                margin: 0,
                paddingLeft: '20px',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.6,
              }}
            >
              <li>Allana export shipments strictly observe temperature logging protocols during transit.</li>
              <li>Veterinary certificates and SFDA compliance documents are archived in the Logistics Vault.</li>
              <li>For custom packaging inquiries or volume allocations, submit an inquiry ticket.</li>
            </ul>

            <div style={{ marginTop: 'var(--spacing-md)' }}>
              <Link
                href="/claims/new-request"
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
                <span>Submit partner inquiry about this release</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Related Articles Section */}
      {relatedArticles.length > 0 && (
        <section
          data-testid="related-articles-section"
          aria-labelledby="related-articles-heading"
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--spacing-lg)',
            }}
          >
            <h2
              id="related-articles-heading"
              style={{
                fontSize: 'var(--font-size-xl)',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                margin: 0,
              }}
            >
              Related Market Updates
            </h2>
            <Link
              href="/news"
              style={{
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                color: 'var(--color-primary, #0e7490)',
                textDecoration: 'none',
              }}
            >
              View all news &rarr;
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 'var(--spacing-lg)',
            }}
          >
            {relatedArticles.map((rel) => (
              <NewsCard key={rel.id} article={rel} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
