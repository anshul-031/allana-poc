'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { switchCompanyContext, RelatedCompanyDTO } from '@/server/actions/company.actions';

interface RelatedCompaniesTableProps {
  relatedCompanies: RelatedCompanyDTO[];
  activeCompanyId: string;
  userId: string;
}

export default function RelatedCompaniesTable({
  relatedCompanies,
  activeCompanyId,
  userId,
}: RelatedCompaniesTableProps) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState('');

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleSwitch = async (targetCompany: RelatedCompanyDTO) => {
    if (targetCompany.id === activeCompanyId) return;

    setSwitchingId(targetCompany.id);
    setError(null);

    try {
      const res = await switchCompanyContext(userId, targetCompany.id);
      if (!res.success) {
        setError(res.error || 'Failed to switch entity.');
        setSwitchingId(null);
        return;
      }

      document.cookie = `allana_active_company_id=${encodeURIComponent(targetCompany.id)}; path=/; max-age=2592000; SameSite=Lax;`;
      router.refresh();
    } catch {
      setError('An unexpected error occurred while switching entity context.');
    } finally {
      setSwitchingId(null);
    }
  };

  const filtered = relatedCompanies.filter((comp) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase().trim();
    return (
      comp.name.toLowerCase().includes(q) ||
      comp.code.toLowerCase().includes(q) ||
      comp.country.toLowerCase().includes(q) ||
      comp.region.toLowerCase().includes(q)
    );
  });

  return (
    <div className="related-companies-section" data-testid="related-companies-table">
      <div className="section-header">
        <div>
          <h3 className="section-title">Related Corporate Entities & Subsidiaries</h3>
          <p className="section-subtitle">
            Allana export contracts, logistics vaults, and billing accounts associated with your holding organization.
          </p>
        </div>
        <div className="table-search">
          <input
            type="text"
            className="search-input"
            placeholder="Filter entities..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            aria-label="Filter entities table"
          />
        </div>
      </div>

      {error && (
        <div className="alert-error" role="alert">
          ⚠️ {error}
        </div>
      )}

      <div className="table-container">
        <table className="entities-table">
          <thead>
            <tr>
              <th scope="col">Entity / Counterpart</th>
              <th scope="col">Country</th>
              <th scope="col">Region</th>
              <th scope="col">Assigned Manager</th>
              <th scope="col" className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="no-data-cell">
                  No related companies found matching &ldquo;{filterQuery}&rdquo;
                </td>
              </tr>
            ) : (
              filtered.map((comp) => {
                const isActive = comp.id === activeCompanyId;
                const isExpanded = expandedId === comp.id;
                const isCurrentSwitching = switchingId === comp.id;

                return (
                  <React.Fragment key={comp.id}>
                    <tr className={`data-row ${isActive ? 'row-active' : ''}`}>
                      <td>
                        <div className="entity-name-cell">
                          <button
                            type="button"
                            className="toggle-expand-btn"
                            onClick={() => toggleExpand(comp.id)}
                            aria-expanded={isExpanded}
                            aria-label={`Toggle details for ${comp.name}`}
                          >
                            <span className="expand-arrow">{isExpanded ? '▼' : '▶'}</span>
                          </button>
                          <div>
                            <span className="comp-name">{comp.name}</span>
                            <div className="comp-meta-pills">
                              <span className="code-pill">{comp.code}</span>
                              {comp.isParent && <span className="hq-pill">Corporate HQ</span>}
                              {isActive && <span className="active-badge">ACTIVE</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{comp.country}</td>
                      <td>{comp.region}</td>
                      <td>{comp.managerName || 'Allana Export Desk'}</td>
                      <td className="text-right">
                        {isActive ? (
                          <span className="current-entity-label">Current Active</span>
                        ) : (
                          <button
                            type="button"
                            className="btn-switch"
                            onClick={() => handleSwitch(comp)}
                            disabled={isCurrentSwitching}
                          >
                            {isCurrentSwitching ? 'Switching...' : 'Sign In / Switch'}
                          </button>
                        )}
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="expanded-row">
                        <td colSpan={5}>
                          <div className="expanded-details-card">
                            <div className="detail-item">
                              <span className="detail-key">Official Telephone:</span>
                              <span className="detail-val">{comp.telephone || '—'}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-key">Official Email:</span>
                              <span className="detail-val">{comp.email || '—'}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-key">Account Manager Email:</span>
                              <span className="detail-val">{comp.managerEmail || 'desk@allana.com'}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-key">Account Manager Phone:</span>
                              <span className="detail-val">{comp.managerPhone || '—'}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .related-companies-section {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .section-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 0.25rem;
        }

        .section-subtitle {
          font-size: 0.8125rem;
          color: #64748b;
        }

        .search-input {
          padding: 0.5rem 0.875rem;
          font-size: 0.8125rem;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          outline: none;
          min-width: 200px;
        }

        .search-input:focus {
          border-color: #0a192f;
        }

        .alert-error {
          padding: 0.75rem 1rem;
          background-color: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
          border-radius: 6px;
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }

        .table-container {
          overflow-x: auto;
        }

        .entities-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.875rem;
        }

        .entities-table th {
          background-color: #f8fafc;
          color: #475569;
          font-weight: 600;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .data-row {
          border-bottom: 1px solid #f1f5f9;
          transition: background-color 0.15s ease;
        }

        .data-row:hover {
          background-color: #f8fafc;
        }

        .data-row.row-active {
          background-color: #f0fdf4;
        }

        .data-row td {
          padding: 0.875rem 1rem;
          color: #334155;
          vertical-align: middle;
        }

        .entity-name-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .toggle-expand-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #64748b;
          padding: 0.25rem;
          font-size: 0.6875rem;
        }

        .toggle-expand-btn:hover {
          color: #0f172a;
        }

        .comp-name {
          font-weight: 600;
          color: #0f172a;
          display: block;
        }

        .comp-meta-pills {
          display: flex;
          gap: 0.35rem;
          margin-top: 0.2rem;
        }

        .code-pill {
          font-size: 0.6875rem;
          color: #64748b;
          background: #f1f5f9;
          padding: 0.1rem 0.35rem;
          border-radius: 4px;
        }

        .hq-pill {
          font-size: 0.6875rem;
          color: #1e40af;
          background: #dbeafe;
          padding: 0.1rem 0.35rem;
          border-radius: 4px;
          font-weight: 600;
        }

        .active-badge {
          font-size: 0.6875rem;
          color: #15803d;
          background: #dcfce7;
          padding: 0.1rem 0.35rem;
          border-radius: 4px;
          font-weight: 700;
        }

        .current-entity-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #16a34a;
        }

        .btn-switch {
          background-color: #0a192f;
          color: #ffffff;
          border: none;
          padding: 0.45rem 0.875rem;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.15s ease;
        }

        .btn-switch:hover:not(:disabled) {
          background-color: #17335d;
        }

        .btn-switch:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .text-right {
          text-align: right;
        }

        .no-data-cell {
          text-align: center;
          padding: 2rem 1rem;
          color: #64748b;
        }

        .expanded-row td {
          background: #fafafa;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .expanded-details-card {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .detail-key {
          font-size: 0.6875rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
        }

        .detail-val {
          font-size: 0.8125rem;
          color: #0f172a;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
