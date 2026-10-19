'use client';

import React, { useState } from 'react';
import {
  ShipmentDetailedDTO,
  ShipmentFilterOptions,
  ShipmentStatusType,
} from '@/server/actions/shipments.actions';
import ContainerDrilldown from './ContainerDrilldown';
import DocumentVault from './DocumentVault';

export interface ShipmentsTableProps {
  shipments: ShipmentDetailedDTO[];
  sortBy?: string;
  onSortChange: (newSortBy: ShipmentFilterOptions['sortBy']) => void;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newPageSize: number) => void;
}

export default function ShipmentsTable({
  shipments,
  sortBy,
  onSortChange,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: ShipmentsTableProps) {
  // Set of shipment IDs that are expanded
  const [expandedShipmentIds, setExpandedShipmentIds] = useState<Set<string>>(new Set());

  // Active sub-tab inside expanded row ('containers' | 'documents')
  const [activeSubTab, setActiveSubTab] = useState<Record<string, 'containers' | 'documents'>>({});

  const toggleExpand = (shipmentId: string) => {
    setExpandedShipmentIds((prev) => {
      const next = new Set(prev);
      if (next.has(shipmentId)) {
        next.delete(shipmentId);
      } else {
        next.add(shipmentId);
      }
      return next;
    });
  };

  const handleHeaderSort = (column: 'orderNumber' | 'totalQuantityMt' | 'totalAmountUsd' | 'status' | 'shippingDate') => {
    const isCurrentAsc = sortBy === `${column}_asc`;
    const nextSort = isCurrentAsc ? `${column}_desc` : `${column}_asc`;
    onSortChange(nextSort as ShipmentFilterOptions['sortBy']);
  };

  const getSortIcon = (column: string) => {
    if (sortBy === `${column}_asc`) return '▲';
    if (sortBy === `${column}_desc`) return '▼';
    return '⇅';
  };

  const getStatusBadge = (status: ShipmentStatusType) => {
    switch (status) {
      case 'DELIVERED':
        return {
          bg: 'var(--color-success-bg, #f0fdf4)',
          text: 'var(--color-success-text, #166534)',
          border: 'var(--color-success-border, #bbf7d0)',
          label: 'Delivered',
        };
      case 'CUSTOMS_CLEARED':
        return {
          bg: '#ecfdf5',
          text: '#047857',
          border: '#a7f3d0',
          label: 'Customs Cleared',
        };
      case 'ARRIVED_PORT':
        return {
          bg: '#e0f2fe',
          text: '#0369a1',
          border: '#bae6fd',
          label: 'Arrived at Port',
        };
      case 'IN_TRANSIT':
        return {
          bg: 'rgba(197, 160, 89, 0.12)',
          text: 'var(--color-gold-700, #9c7b39)',
          border: 'var(--color-gold, #c5a059)',
          label: 'In Transit',
        };
      case 'LOADED':
        return {
          bg: '#f3e8ff',
          text: '#7e22ce',
          border: '#e9d5ff',
          label: 'Loaded',
        };
      default:
        return {
          bg: 'var(--color-info-bg, #eff6ff)',
          text: 'var(--color-info-text, #1e40af)',
          border: 'var(--color-info-border, #bfdbfe)',
          label: 'Booked',
        };
    }
  };

  if (!shipments || shipments.length === 0) {
    return (
      <div
        data-testid="shipments-empty-state"
        style={{
          backgroundColor: 'var(--color-surface, #ffffff)',
          border: '1px solid var(--color-border, #e2e8f0)',
          borderRadius: 'var(--border-radius-xl, 16px)',
          padding: '48px 24px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ fontSize: '36px', marginBottom: '12px' }}>🚢</div>
        <h4
          style={{
            fontSize: '16px',
            fontWeight: 700,
            color: 'var(--color-primary-dark, #0a192f)',
            margin: '0 0 6px 0',
          }}
        >
          No Ocean Shipments Found
        </h4>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary, #64748b)', margin: 0 }}>
          No consignments match the selected sales organization, destination market, or date filters.
        </p>
      </div>
    );
  }

  return (
    <div
      data-testid="shipments-table-container"
      style={{
        backgroundColor: 'var(--color-surface, #ffffff)',
        border: '1px solid var(--color-border, #e2e8f0)',
        borderRadius: 'var(--border-radius-xl, 16px)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table
          data-testid="shipments-table"
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '13px',
            minWidth: '940px',
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: 'var(--color-background-subtle, #f8fafc)',
                borderBottom: '1px solid var(--color-border, #e2e8f0)',
                color: 'var(--color-text-secondary, #64748b)',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {/* Order Number Sortable */}
              <th
                data-testid="sort-order-number"
                onClick={() => handleHeaderSort('orderNumber')}
                style={{ padding: '12px 16px', cursor: 'pointer', userSelect: 'none' }}
              >
                Order ID <span style={{ fontSize: '10px' }}>{getSortIcon('orderNumber')}</span>
              </th>

              <th style={{ padding: '12px 16px' }}>Ship-To Party</th>
              <th style={{ padding: '12px 16px' }}>Destination</th>

              {/* Quantity Sortable */}
              <th
                data-testid="sort-quantity"
                onClick={() => handleHeaderSort('totalQuantityMt')}
                style={{ padding: '12px 16px', cursor: 'pointer', userSelect: 'none' }}
              >
                Qty (MT) <span style={{ fontSize: '10px' }}>{getSortIcon('totalQuantityMt')}</span>
              </th>

              {/* Amount Sortable */}
              <th
                data-testid="sort-amount"
                onClick={() => handleHeaderSort('totalAmountUsd')}
                style={{ padding: '12px 16px', cursor: 'pointer', userSelect: 'none' }}
              >
                Amount ($) <span style={{ fontSize: '10px' }}>{getSortIcon('totalAmountUsd')}</span>
              </th>

              {/* Date Sortable */}
              <th
                data-testid="sort-date"
                onClick={() => handleHeaderSort('shippingDate')}
                style={{ padding: '12px 16px', cursor: 'pointer', userSelect: 'none' }}
              >
                Shipping Date <span style={{ fontSize: '10px' }}>{getSortIcon('shippingDate')}</span>
              </th>

              {/* Status Sortable */}
              <th
                data-testid="sort-status"
                onClick={() => handleHeaderSort('status')}
                style={{ padding: '12px 16px', cursor: 'pointer', userSelect: 'none' }}
              >
                Status <span style={{ fontSize: '10px' }}>{getSortIcon('status')}</span>
              </th>

              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((s) => {
              const isExpanded = expandedShipmentIds.has(s.id);
              const badge = getStatusBadge(s.status);
              const currentTab = activeSubTab[s.id] || 'containers';

              return (
                <React.Fragment key={s.id}>
                  {/* Master Order Row */}
                  <tr
                    data-testid={`shipment-row-${s.id}`}
                    onClick={() => toggleExpand(s.id)}
                    style={{
                      borderBottom: isExpanded ? 'none' : '1px solid var(--color-border-subtle, #f1f5f9)',
                      backgroundColor: isExpanded ? 'rgba(197, 160, 89, 0.04)' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    {/* Order ID */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <span
                        data-testid={`order-number-badge-${s.id}`}
                        style={{
                          fontSize: '12px',
                          fontWeight: 800,
                          color: 'var(--color-primary-dark, #0a192f)',
                          backgroundColor: 'var(--color-background-subtle, #f8fafc)',
                          border: '1px solid var(--color-border, #cbd5e1)',
                          padding: '3px 8px',
                          borderRadius: '4px',
                        }}
                      >
                        {s.orderNumber}
                      </span>
                    </td>

                    {/* Ship To */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-primary, #0f172a)' }}>
                        {s.shipToParty}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-secondary, #64748b)' }}>
                        {s.salesOrgName}
                      </div>
                    </td>

                    {/* Destination */}
                    <td style={{ padding: '14px 16px' }}>
                      <div>{s.destinationCountry}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-secondary, #64748b)' }}>
                        {s.portOfDestination}
                      </div>
                    </td>

                    {/* Quantity */}
                    <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                      {s.totalQuantityMt} MT
                    </td>

                    {/* Amount */}
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--color-primary-dark, #0a192f)' }}>
                      ${s.totalAmountUsd.toLocaleString()}
                    </td>

                    {/* Shipping Date / ETD */}
                    <td style={{ padding: '14px 16px', color: 'var(--color-text-secondary, #64748b)' }}>
                      {s.shippingDate ? new Date(s.shippingDate).toLocaleDateString() : 'Pending ETD'}
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        data-testid={`shipment-status-badge-${s.id}`}
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor: badge.bg,
                          color: badge.text,
                          border: `1px solid ${badge.border}`,
                          padding: '3px 8px',
                          borderRadius: 'var(--border-radius-pill, 9999px)',
                          whiteSpace: 'nowrap',
                          textTransform: 'uppercase',
                        }}
                      >
                        {badge.label}
                      </span>
                    </td>

                    {/* Action: Details / Hide Details */}
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        type="button"
                        data-testid={`toggle-details-btn-${s.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(s.id);
                        }}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 700,
                          backgroundColor: isExpanded
                            ? 'var(--color-gold, #c5a059)'
                            : 'var(--color-background-subtle, #f8fafc)',
                          color: isExpanded ? '#ffffff' : 'var(--color-primary-dark, #0a192f)',
                          border: isExpanded
                            ? '1px solid var(--color-gold-700, #9c7b39)'
                            : '1px solid var(--color-border, #cbd5e1)',
                          cursor: 'pointer',
                        }}
                      >
                        {isExpanded ? 'Hide Details ▴' : 'Details ▾'}
                      </button>
                    </td>
                  </tr>

                  {/* Level 1 & Level 2 Drilldown Accordion Row */}
                  {isExpanded && (
                    <tr
                      data-testid={`expanded-drilldown-row-${s.id}`}
                      style={{
                        backgroundColor: 'rgba(197, 160, 89, 0.04)',
                        borderBottom: '2px solid var(--color-border, #e2e8f0)',
                      }}
                    >
                      <td colSpan={8} style={{ padding: '16px 20px' }}>
                        {/* Sub-Tabs: Containers vs Document Vault */}
                        <div
                          style={{
                            display: 'flex',
                            gap: '8px',
                            marginBottom: '16px',
                            borderBottom: '1px solid var(--color-border, #e2e8f0)',
                            paddingBottom: '8px',
                          }}
                        >
                          <button
                            type="button"
                            data-testid={`subtab-containers-${s.id}`}
                            onClick={() =>
                              setActiveSubTab((prev) => ({ ...prev, [s.id]: 'containers' }))
                            }
                            style={{
                              padding: '6px 14px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: currentTab === 'containers' ? 700 : 500,
                              backgroundColor:
                                currentTab === 'containers'
                                  ? 'var(--color-primary-dark, #0a192f)'
                                  : 'transparent',
                              color: currentTab === 'containers' ? '#ffffff' : 'var(--color-text-secondary, #475569)',
                              border: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            📦 Containers &amp; SKUs ({s.containers.length})
                          </button>

                          <button
                            type="button"
                            data-testid={`subtab-documents-${s.id}`}
                            onClick={() =>
                              setActiveSubTab((prev) => ({ ...prev, [s.id]: 'documents' }))
                            }
                            style={{
                              padding: '6px 14px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: currentTab === 'documents' ? 700 : 500,
                              backgroundColor:
                                currentTab === 'documents'
                                  ? 'var(--color-primary-dark, #0a192f)'
                                  : 'transparent',
                              color: currentTab === 'documents' ? '#ffffff' : 'var(--color-text-secondary, #475569)',
                              border: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            📁 Document Vault ({s.documents.length})
                          </button>
                        </div>

                        {/* Sub-tab Content */}
                        {currentTab === 'containers' ? (
                          <ContainerDrilldown
                            containers={s.containers}
                            shippingLine={s.shippingLine}
                            vesselName={s.vesselName}
                            voyageNumber={s.voyageNumber}
                            portOfLoading={s.portOfLoading}
                            portOfDestination={s.portOfDestination}
                          />
                        ) : (
                          <DocumentVault documents={s.documents} orderNumber={s.orderNumber} />
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination & Page Size Footer */}
      <div
        data-testid="shipments-pagination"
        style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--color-border, #e2e8f0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Page Size Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
          <span style={{ color: 'var(--color-text-secondary, #64748b)' }}>Rows per page:</span>
          <select
            data-testid="page-size-selector"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid var(--color-border, #cbd5e1)',
              fontSize: '13px',
              backgroundColor: '#ffffff',
            }}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="-1">All</option>
          </select>
        </div>

        {/* Page Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            data-testid="prev-page-btn"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid var(--color-border, #cbd5e1)',
              backgroundColor: 'var(--color-background-subtle, #f8fafc)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage <= 1 ? 0.5 : 1,
            }}
          >
            &larr; Prev
          </button>

          <span
            data-testid="pagination-page-indicator"
            style={{
              fontSize: '13px',
              padding: '0 8px',
              color: 'var(--color-text-secondary, #475569)',
              fontWeight: 600,
            }}
          >
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            data-testid="next-page-btn"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid var(--color-border, #cbd5e1)',
              backgroundColor: 'var(--color-background-subtle, #f8fafc)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
              opacity: currentPage >= totalPages ? 0.5 : 1,
            }}
          >
            Next &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
