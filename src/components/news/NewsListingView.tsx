'use client';

import React, { useState, useMemo } from 'react';
import NewsCard, { getArticleCategory } from '@/components/news/NewsCard';
import { NewsArticleDTO } from '@/server/actions/news.actions';

export interface NewsListingViewProps {
  initialArticles: NewsArticleDTO[];
}

const CATEGORIES = [
  'All Articles',
  'Export Insights',
  'SFDA & Compliance',
  'Market Trends',
  'Product Launches',
];

export default function NewsListingView({ initialArticles }: NewsListingViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Articles');
  const [sortBy, setSortBy] = useState<'desc' | 'asc'>('desc');

  const filteredArticles = useMemo(() => {
    return initialArticles
      .filter((article) => {
        const matchesQuery =
          searchQuery.trim() === '' ||
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.summary.toLowerCase().includes(searchQuery.toLowerCase());

        const articleCategory = getArticleCategory(article.title, article.summary);
        const matchesCategory =
          selectedCategory === 'All Articles' || articleCategory === selectedCategory;

        return matchesQuery && matchesCategory;
      })
      .sort((a, b) => {
        const dateA = new Date(a.publishedAt).getTime();
        const dateB = new Date(b.publishedAt).getTime();
        return sortBy === 'desc' ? dateB - dateA : dateA - dateB;
      });
  }, [initialArticles, searchQuery, selectedCategory, sortBy]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Articles');
    setSortBy('desc');
  };

  return (
    <div
      style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: 'var(--spacing-xl) var(--spacing-lg)',
      }}
    >
      {/* Page Header */}
      <div
        style={{
          marginBottom: 'var(--spacing-xl)',
          paddingBottom: 'var(--spacing-md)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--color-gold, #c5a059)',
            }}
          >
            Market Intelligence & Trade Bulletins
          </span>
        </div>
        <h1
          style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 800,
            color: 'var(--color-text-primary)',
            margin: '0 0 var(--spacing-xs) 0',
          }}
        >
          News & Market Updates
        </h1>
        <p
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            margin: 0,
            maxWidth: '720px',
            lineHeight: 1.5,
          }}
        >
          Official veterinary compliance notices, SFDA import requirements, ocean freight indexes,
          and value-added meat processing developments from Allana Global Export Division.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--border-radius-xl)',
          padding: 'var(--spacing-lg)',
          marginBottom: 'var(--spacing-xl)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-md)',
        }}
      >
        {/* Top Controls: Search Input & Sort Selector */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--spacing-md)',
          }}
        >
          {/* Search Box */}
          <div
            style={{
              position: 'relative',
              flex: '1 1 320px',
              maxWidth: '480px',
            }}
          >
            <input
              type="text"
              data-testid="news-search-input"
              aria-label="Search articles by title or keyword"
              placeholder="Search news by title or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 36px 10px 14px',
                borderRadius: 'var(--border-radius-pill)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-background-subtle)',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-primary)',
                outline: 'none',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                data-testid="clear-search-button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-tertiary)',
                  fontSize: '14px',
                  padding: 0,
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Selector & Counter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            <span
              data-testid="found-articles-count"
              style={{
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
              }}
            >
              Found {filteredArticles.length} article{filteredArticles.length === 1 ? '' : 's'}
            </span>

            <select
              data-testid="news-sort-select"
              aria-label="Sort articles"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'desc' | 'asc')}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--border-radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
              }}
            >
              <option value="desc">Latest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div
          role="tablist"
          aria-label="Article categories"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={isSelected}
                data-testid={`category-filter-${cat.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--border-radius-pill)',
                  border: isSelected
                    ? '1px solid var(--color-primary, #0e7490)'
                    : '1px solid var(--color-border)',
                  backgroundColor: isSelected
                    ? 'var(--color-primary, #0e7490)'
                    : 'var(--color-background-subtle)',
                  color: isSelected ? '#ffffff' : 'var(--color-text-secondary)',
                  fontSize: '12px',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Articles Grid or Empty State */}
      {filteredArticles.length === 0 ? (
        <div
          data-testid="news-empty-state"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--border-radius-xl)',
            padding: 'var(--spacing-2xl)',
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontSize: '36px', marginBottom: 'var(--spacing-sm)' }}>🔍</div>
          <h2
            style={{
              fontSize: 'var(--font-size-lg)',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              margin: '0 0 var(--spacing-xs) 0',
            }}
          >
            No Articles Found
          </h2>
          <p
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
              margin: '0 0 var(--spacing-lg) 0',
            }}
          >
            No market updates or news articles matched your search and filter criteria.
          </p>
          <button
            type="button"
            data-testid="reset-filters-button"
            onClick={handleClearFilters}
            style={{
              padding: '8px 18px',
              backgroundColor: 'var(--color-primary, #0e7490)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--border-radius-pill)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div
          data-testid="news-listing-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 'var(--spacing-xl)',
          }}
        >
          {filteredArticles.map((article, index) => (
            <NewsCard key={article.id} article={article} featured={index === 0} />
          ))}
        </div>
      )}
    </div>
  );
}
