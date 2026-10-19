'use client';

import React, { useState } from 'react';
import { AuditLogEntry } from '@/server/actions/audit.actions';

interface ActionLogTableProps {
  initialLogs: AuditLogEntry[];
  totalLogs?: number;
}

const ACTION_TYPES = [
  { value: '', label: 'All Operations' },
  { value: 'USER_CREATED', label: 'User Created' },
  { value: 'PERMISSIONS_UPDATED', label: 'Permissions Updated' },
  { value: 'USER_DEACTIVATED', label: 'User Deactivated' },
  { value: 'PASSWORD_CHANGED', label: 'Password Changed' },
  { value: 'COMPANY_SWITCHED', label: 'Company Switched' },
];

export default function ActionLogTable({ initialLogs }: ActionLogTableProps) {
  const [logs] = useState<AuditLogEntry[]>(initialLogs);
  const [selectedAction, setSelectedAction] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter logs locally
  const filteredLogs = logs.filter((log) => {
    if (selectedAction && log.action !== selectedAction) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const authorText = `${log.author.firstName} ${log.author.lastName || ''} ${log.author.email}`.toLowerCase();
      return log.comment.toLowerCase().includes(q) || authorText.includes(q);
    }
    return true;
  });

  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getActionBadgeClass = (action: string) => {
    switch (action) {
      case 'USER_CREATED':
        return 'badge-created';
      case 'PERMISSIONS_UPDATED':
        return 'badge-updated';
      case 'USER_DEACTIVATED':
        return 'badge-deactivated';
      case 'PASSWORD_CHANGED':
        return 'badge-security';
      case 'COMPANY_SWITCHED':
        return 'badge-context';
      default:
        return 'badge-default';
    }
  };

  return (
    <div className="action-log-wrapper" data-testid="action-log-table">
      <div className="log-toolbar">
        <div className="search-filter-group">
          <input
            type="text"
            className="search-input"
            placeholder="Search by author or description..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter action logs"
          />

          <select
            className="action-select"
            value={selectedAction}
            onChange={(e) => {
              setSelectedAction(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by action type"
          >
            {ACTION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="log-summary">
          Showing {paginatedLogs.length} of {filteredLogs.length} audit events
        </div>
      </div>

      <div className="table-responsive">
        <table className="audit-table">
          <thead>
            <tr>
              <th scope="col">Timestamp</th>
              <th scope="col">Author</th>
              <th scope="col">Action Type</th>
              <th scope="col">Description / Details</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLogs.length === 0 ? (
              <tr>
                <td colSpan={4} className="no-data-cell">
                  No security action logs found matching your criteria.
                </td>
              </tr>
            ) : (
              paginatedLogs.map((log) => (
                <tr key={log.id} className="log-row">
                  <td className="timestamp-cell">
                    <span className="date-part">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </span>
                    <span className="time-part">
                      {new Date(log.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </td>
                  <td>
                    <div className="author-cell">
                      <span className="author-name">
                        {log.author.firstName} {log.author.lastName || ''}
                      </span>
                      <span className="author-email">{log.author.email}</span>
                      <span className="author-role">{log.author.role}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`action-badge ${getActionBadgeClass(log.action)}`}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="comment-cell">{log.comment}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination-bar">
          <button
            type="button"
            className="btn-page"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            ← Previous
          </button>
          <span className="page-indicator">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            className="btn-page"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Next →
          </button>
        </div>
      )}

      <style jsx>{`
        .action-log-wrapper {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }

        .log-toolbar {
          padding: 1.25rem;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .search-filter-group {
          display: flex;
          gap: 0.75rem;
          flex: 1;
          max-width: 600px;
        }

        .search-input {
          flex: 1;
          padding: 0.5rem 0.875rem;
          font-size: 0.875rem;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          outline: none;
        }

        .search-input:focus,
        .action-select:focus {
          border-color: #0a192f;
        }

        .action-select {
          padding: 0.5rem 0.875rem;
          font-size: 0.875rem;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          background-color: #ffffff;
          color: #0f172a;
          outline: none;
        }

        .log-summary {
          font-size: 0.8125rem;
          color: #64748b;
          font-weight: 500;
        }

        .table-responsive {
          overflow-x: auto;
        }

        .audit-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.875rem;
        }

        .audit-table th {
          background-color: #ffffff;
          color: #475569;
          font-weight: 600;
          padding: 0.875rem 1rem;
          border-bottom: 1px solid #e2e8f0;
          white-space: nowrap;
        }

        .log-row {
          border-bottom: 1px solid #f1f5f9;
          transition: background-color 0.15s ease;
        }

        .log-row:hover {
          background-color: #f8fafc;
        }

        .log-row td {
          padding: 1rem;
          color: #334155;
          vertical-align: middle;
        }

        .timestamp-cell {
          white-space: nowrap;
        }

        .date-part {
          font-weight: 600;
          color: #0f172a;
          display: block;
        }

        .time-part {
          font-size: 0.75rem;
          color: #64748b;
        }

        .author-cell {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .author-name {
          font-weight: 600;
          color: #0f172a;
        }

        .author-email {
          font-size: 0.75rem;
          color: #64748b;
        }

        .author-role {
          font-size: 0.6875rem;
          color: #475569;
          background: #f1f5f9;
          padding: 0.1rem 0.35rem;
          border-radius: 4px;
          width: fit-content;
        }

        .action-badge {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
          white-space: nowrap;
        }

        .badge-created {
          background-color: #dcfce7;
          color: #166534;
        }

        .badge-updated {
          background-color: #dbeafe;
          color: #1e40af;
        }

        .badge-deactivated {
          background-color: #fee2e2;
          color: #991b1b;
        }

        .badge-security {
          background-color: #fef3c7;
          color: #92400e;
        }

        .badge-context {
          background-color: #f3e8ff;
          color: #6b21a8;
        }

        .badge-default {
          background-color: #f1f5f9;
          color: #475569;
        }

        .comment-cell {
          color: #1e293b;
          font-size: 0.8125rem;
          line-height: 1.45;
          max-width: 440px;
        }

        .no-data-cell {
          text-align: center;
          padding: 3rem 1rem;
          color: #64748b;
          font-size: 0.875rem;
        }

        .pagination-bar {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1.5rem;
          padding: 1rem;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
        }

        .btn-page {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #334155;
          padding: 0.4rem 0.875rem;
          font-size: 0.8125rem;
          font-weight: 600;
          border-radius: 6px;
          cursor: pointer;
        }

        .btn-page:hover:not(:disabled) {
          background: #f1f5f9;
          border-color: #94a3b8;
        }

        .btn-page:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-indicator {
          font-size: 0.8125rem;
          font-weight: 600;
          color: #64748b;
        }
      `}</style>
    </div>
  );
}
