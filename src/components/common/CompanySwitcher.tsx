'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { switchCompanyContext, RelatedCompanyDTO } from '@/server/actions/company.actions';

interface CompanySwitcherProps {
  userId: string;
  initialActiveCompany: RelatedCompanyDTO | null;
  relatedCompanies: RelatedCompanyDTO[];
}

export default function CompanySwitcher({
  userId,
  initialActiveCompany,
  relatedCompanies,
}: CompanySwitcherProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeCompany, setActiveCompany] = useState<RelatedCompanyDTO | null>(initialActiveCompany);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSwitching, setIsSwitching] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input on open
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Filter companies by searchQuery
  const filteredCompanies = relatedCompanies.filter((comp) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      comp.name.toLowerCase().includes(q) ||
      comp.code.toLowerCase().includes(q) ||
      comp.country.toLowerCase().includes(q)
    );
  });

  const handleSelectCompany = async (company: RelatedCompanyDTO) => {
    if (activeCompany?.id === company.id) {
      setIsOpen(false);
      return;
    }

    setIsSwitching(true);
    setSwitchError(null);

    try {
      const res = await switchCompanyContext(userId, company.id);

      if (!res.success) {
        setSwitchError(res.error || 'Failed to switch entity.');
        setIsSwitching(false);
        return;
      }

      // Update client-side cookie directly as well
      document.cookie = `allana_active_company_id=${encodeURIComponent(company.id)}; path=/; max-age=2592000; SameSite=Lax;`;

      setActiveCompany(company);
      setIsOpen(false);
      router.refresh();
    } catch {
      setSwitchError('An error occurred while switching counterpart context.');
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className="company-switcher-container" ref={containerRef}>
      <button
        type="button"
        className="company-trigger-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        disabled={isSwitching}
      >
        <span className="building-icon" aria-hidden="true">🏢</span>
        <div className="trigger-info">
          <span className="company-name">
            {activeCompany ? activeCompany.name : 'Select Company'}
          </span>
          {activeCompany && (
            <span className="country-badge">
              {activeCompany.country} • {activeCompany.code}
            </span>
          )}
        </div>
        <span className="chevron-icon" aria-hidden="true">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="switcher-dropdown" role="dialog" aria-label="Related Counterparts Switcher">
          <div className="search-box-wrapper">
            <label htmlFor="counterpart-search" className="search-label">
              Counterpart:
            </label>
            <div className="input-icon-wrapper">
              <span className="search-icon" aria-hidden="true">🔍</span>
              <input
                id="counterpart-search"
                ref={searchInputRef}
                type="text"
                className="counterpart-input"
                placeholder="Search subsidiaries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear counterpart search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {switchError && (
            <div className="dropdown-error-banner" role="alert">
              ⚠️ {switchError}
            </div>
          )}

          <div className="companies-list" role="listbox">
            {filteredCompanies.length === 0 ? (
              <div className="no-results-msg">No counterparts found matching &ldquo;{searchQuery}&rdquo;</div>
            ) : (
              filteredCompanies.map((comp) => {
                const isCurrent = activeCompany?.id === comp.id;
                return (
                  <button
                    key={comp.id}
                    type="button"
                    className={`company-item-btn ${isCurrent ? 'selected' : ''}`}
                    onClick={() => handleSelectCompany(comp)}
                    role="option"
                    aria-selected={isCurrent}
                  >
                    <div className="item-details">
                      <div className="item-title-row">
                        <span className="item-name">{comp.name}</span>
                        {comp.isParent && <span className="parent-pill">HQ</span>}
                      </div>
                      <span className="item-meta">
                        {comp.country} | Code: {comp.code}
                      </span>
                    </div>
                    {isCurrent && <span className="current-checkmark" aria-label="Current entity">✓</span>}
                  </button>
                );
              })
            )}
          </div>

          <div className="dropdown-footer">
            <span>{relatedCompanies.length} related corporate subsidiaries</span>
          </div>
        </div>
      )}

      <style jsx>{`
        .company-switcher-container {
          position: relative;
          display: inline-block;
          font-family: inherit;
        }

        .company-trigger-btn {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 0.5rem 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .company-trigger-btn:hover {
          border-color: #94a3b8;
          background: #f8fafc;
        }

        .company-trigger-btn:focus-visible {
          outline: 2px solid #0a192f;
          outline-offset: 2px;
        }

        .building-icon {
          font-size: 1.125rem;
        }

        .trigger-info {
          display: flex;
          flex-direction: column;
        }

        .company-name {
          font-size: 0.875rem;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.2;
          max-width: 220px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .country-badge {
          font-size: 0.6875rem;
          color: #64748b;
          font-weight: 500;
        }

        .chevron-icon {
          font-size: 0.625rem;
          color: #64748b;
          margin-left: 0.35rem;
        }

        .switcher-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          width: 320px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
          z-index: 1000;
          overflow: hidden;
          animation: fadeIn 0.15s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .search-box-wrapper {
          padding: 0.75rem;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .search-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 700;
          color: #334155;
          margin-bottom: 0.35rem;
          letter-spacing: 0.02em;
        }

        .input-icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 0.625rem;
          font-size: 0.8125rem;
          color: #94a3b8;
          pointer-events: none;
        }

        .counterpart-input {
          width: 100%;
          padding: 0.5rem 1.8rem 0.5rem 2rem;
          font-size: 0.8125rem;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          background: #ffffff;
          color: #0f172a;
          outline: none;
        }

        .counterpart-input:focus {
          border-color: #0a192f;
          box-shadow: 0 0 0 1px #0a192f;
        }

        .clear-search-btn {
          position: absolute;
          right: 0.5rem;
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 0.75rem;
          cursor: pointer;
          padding: 0.2rem;
        }

        .clear-search-btn:hover {
          color: #475569;
        }

        .dropdown-error-banner {
          padding: 0.5rem 0.75rem;
          background-color: #fef2f2;
          color: #991b1b;
          font-size: 0.75rem;
          border-bottom: 1px solid #fecaca;
        }

        .companies-list {
          max-height: 260px;
          overflow-y: auto;
          padding: 0.35rem 0;
        }

        .company-item-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.625rem 0.875rem;
          border: none;
          background: transparent;
          cursor: pointer;
          text-align: left;
          transition: background-color 0.15s ease;
        }

        .company-item-btn:hover {
          background-color: #f1f5f9;
        }

        .company-item-btn.selected {
          background-color: #eff6ff;
        }

        .item-details {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .item-title-row {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .item-name {
          font-size: 0.8125rem;
          font-weight: 600;
          color: #0f172a;
        }

        .parent-pill {
          background: #dbeafe;
          color: #1e40af;
          font-size: 0.625rem;
          font-weight: 700;
          padding: 0.1rem 0.35rem;
          border-radius: 4px;
        }

        .item-meta {
          font-size: 0.6875rem;
          color: #64748b;
        }

        .current-checkmark {
          color: #16a34a;
          font-weight: 800;
          font-size: 0.875rem;
        }

        .no-results-msg {
          padding: 1.25rem 0.75rem;
          text-align: center;
          font-size: 0.8125rem;
          color: #64748b;
        }

        .dropdown-footer {
          padding: 0.5rem 0.75rem;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
          font-size: 0.6875rem;
          color: #94a3b8;
          text-align: right;
        }
      `}</style>
    </div>
  );
}
