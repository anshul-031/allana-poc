'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  CatalogSearchProductDTO,
  searchCatalogProducts,
} from '@/server/actions/catalog.actions';

export interface CatalogSearchProps {
  placeholder?: string;
  initialQuery?: string;
  onSelectProduct?: (product: CatalogSearchProductDTO) => void;
  debounceMs?: number;
}

/**
 * Split text and highlight query matches in bold
 */
export function highlightMatches(text: string, query: string): React.ReactNode {
  if (!query || !query.trim()) {
    return text;
  }

  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, index) =>
    regex.test(part) ? (
      <strong
        key={index}
        style={{
          color: 'var(--color-gold, #c5a059)',
          fontWeight: 800,
        }}
      >
        {part}
      </strong>
    ) : (
      part
    )
  );
}

export default function CatalogSearch({
  placeholder = 'Search cuts, SKUs, or brands...',
  initialQuery = '',
  onSelectProduct,
  debounceMs = 250,
}: CatalogSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<CatalogSearchProductDTO[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click or escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounced search
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const handler = setTimeout(() => {
      searchCatalogProducts(trimmed).then((res) => {
        setIsLoading(false);
        if (res.success) {
          setResults(res.products);
          setIsOpen(true);
          setSelectedIndex(-1);
        }
      });
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [query, debounceMs]);

  const handleSelect = useCallback(
    (product: CatalogSearchProductDTO) => {
      setIsOpen(false);
      if (onSelectProduct) {
        onSelectProduct(product);
      } else {
        router.push(`/catalog/${product.slug}`);
      }
    },
    [onSelectProduct, router]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen && results.length > 0) {
        setIsOpen(true);
        setSelectedIndex(0);
      } else if (results.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % results.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (results.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      } else if (query.trim()) {
        setIsOpen(false);
        router.push(`/catalog?q=${encodeURIComponent(query.trim())}`);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div
      ref={containerRef}
      data-testid="catalog-search-container"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '680px',
      }}
    >
      {/* Search Input Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--color-surface, #ffffff)',
          border: '1.5px solid var(--color-border, #cbd5e1)',
          borderRadius: 'var(--border-radius-pill, 9999px)',
          padding: '8px 16px',
          boxShadow: 'var(--shadow-sm)',
          transition: 'var(--transition-fast)',
        }}
      >
        {/* Magnifying Glass Icon */}
        <span
          data-testid="catalog-search-icon"
          aria-hidden="true"
          style={{
            color: 'var(--color-gold, #c5a059)',
            fontSize: '16px',
            marginRight: '10px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          &#128269;
        </span>

        {/* Input Field */}
        <input
          ref={inputRef}
          data-testid="catalog-search-input"
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls="catalog-search-dropdown"
          aria-label="Search product cuts and specifications"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: 'var(--font-size-sm, 14px)',
            color: 'var(--color-text-primary, #0f172a)',
            backgroundColor: 'transparent',
          }}
        />

        {/* Spinner */}
        {isLoading && (
          <span
            data-testid="catalog-search-spinner"
            style={{
              fontSize: '12px',
              color: 'var(--color-gold, #c5a059)',
              marginRight: '8px',
            }}
          >
            &#8635;
          </span>
        )}

        {/* Clear Button (X) */}
        {query.length > 0 && (
          <button
            type="button"
            data-testid="catalog-search-clear-btn"
            aria-label="Clear search"
            onClick={handleClear}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-tertiary, #94a3b8)',
              fontSize: '16px',
              cursor: 'pointer',
              padding: '0 4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            &times;
          </button>
        )}
      </div>

      {/* Instant Dropdown Preview */}
      {isOpen && (
        <div
          id="catalog-search-dropdown"
          data-testid="catalog-search-dropdown"
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            backgroundColor: 'var(--color-surface, #ffffff)',
            border: '1px solid var(--color-border, #cbd5e1)',
            borderRadius: 'var(--border-radius-lg, 12px)',
            boxShadow: 'var(--shadow-lg, 0 10px 15px -3px rgba(0,0,0,0.1))',
            zIndex: 1000,
            maxHeight: '380px',
            overflowY: 'auto',
            padding: '6px 0',
          }}
        >
          {results.length === 0 ? (
            <div
              data-testid="catalog-search-empty-state"
              style={{
                padding: 'var(--spacing-md) var(--spacing-lg)',
                color: 'var(--color-text-secondary, #64748b)',
                fontSize: 'var(--font-size-sm, 14px)',
                textAlign: 'center',
              }}
            >
              No cuts found matching &ldquo;{query}&rdquo;. Try searching by SKU, cut name, or brand.
            </div>
          ) : (
            results.map((product, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={product.id}
                  id={`catalog-search-item-${product.id}`}
                  data-testid={`catalog-search-item-${product.id}`}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => handleSelect(product)}
                  style={{
                    padding: '10px 16px',
                    borderBottom:
                      idx < results.length - 1
                        ? '1px solid var(--color-border-subtle, #f1f5f9)'
                        : 'none',
                    backgroundColor: isSelected
                      ? 'var(--color-background-subtle, #f8fafc)'
                      : 'transparent',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)',
                  }}
                >
                  {/* Top Line: Highlighted Cut Name & SKU Article Tag */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      marginBottom: '4px',
                    }}
                  >
                    <span
                      data-testid={`catalog-item-name-${product.id}`}
                      style={{
                        fontSize: 'var(--font-size-sm, 14px)',
                        fontWeight: 600,
                        color: 'var(--color-text-primary, #0f172a)',
                      }}
                    >
                      {highlightMatches(product.name, query)}
                    </span>

                    <span
                      data-testid={`catalog-item-article-${product.id}`}
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        color: 'var(--color-gold, #c5a059)',
                        backgroundColor: 'rgba(197, 160, 89, 0.1)',
                        border: '1px solid rgba(197, 160, 89, 0.3)',
                        padding: '2px 6px',
                        borderRadius: 'var(--border-radius-sm, 4px)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Article: {product.sku}
                    </span>
                  </div>

                  {/* Secondary Line: Packaging Spec and Brand */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      color: 'var(--color-text-secondary, #64748b)',
                      gap: '8px',
                    }}
                  >
                    <span data-testid={`catalog-item-packaging-${product.id}`}>
                      {product.packagingDescription}
                    </span>

                    <span
                      style={{
                        fontSize: '11px',
                        color: 'var(--color-text-tertiary, #94a3b8)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {product.categoryName} &bull; {product.productState}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
