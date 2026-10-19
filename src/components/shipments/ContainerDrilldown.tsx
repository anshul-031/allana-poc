'use client';

import React, { useState } from 'react';
import { ContainerDTO } from '@/server/actions/shipments.actions';

export interface ContainerDrilldownProps {
  containers: ContainerDTO[];
  shippingLine: string;
  vesselName: string | null;
  voyageNumber: string | null;
  portOfLoading: string;
  portOfDestination: string;
}

export default function ContainerDrilldown({
  containers,
  shippingLine,
  vesselName,
  voyageNumber,
  portOfLoading,
  portOfDestination,
}: ContainerDrilldownProps) {
  // Set of container IDs whose Level 2 SKU items are expanded
  const [expandedContainerIds, setExpandedContainerIds] = useState<Set<string>>(() => {
    // Default: expand first container if present
    const initial = new Set<string>();
    if (containers[0]) initial.add(containers[0].id);
    return initial;
  });

  const toggleContainerItems = (containerId: string) => {
    setExpandedContainerIds((prev) => {
      const next = new Set(prev);
      if (next.has(containerId)) {
        next.delete(containerId);
      } else {
        next.add(containerId);
      }
      return next;
    });
  };

  if (!containers || containers.length === 0) {
    return (
      <div
        data-testid="no-containers-notice"
        style={{
          padding: '16px',
          color: 'var(--color-text-secondary, #64748b)',
          fontSize: '13px',
          fontStyle: 'italic',
        }}
      >
        No container stowage records assigned yet for this ocean consignment.
      </div>
    );
  }

  return (
    <div data-testid="container-drilldown-container">
      <div
        style={{
          fontSize: '12px',
          fontWeight: 800,
          color: 'var(--color-primary-dark, #0a192f)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <span>🚢</span> Reefer Container Manifest &amp; Stowage ({containers.length} Containers)
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {containers.map((c) => {
          const isExpanded = expandedContainerIds.has(c.id);

          return (
            <div
              key={c.id}
              data-testid={`container-card-${c.id}`}
              style={{
                backgroundColor: 'var(--color-background-subtle, #f8fafc)',
                border: '1px solid var(--color-border, #e2e8f0)',
                borderRadius: 'var(--border-radius-lg, 12px)',
                overflow: 'hidden',
              }}
            >
              {/* Level 1: Container Header with GPS Pin Icon */}
              <div
                style={{
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  borderBottom: isExpanded ? '1px solid var(--color-border, #e2e8f0)' : 'none',
                  backgroundColor: '#ffffff',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  {/* Green GPS Pin Icon */}
                  <span
                    data-testid={`gps-pin-${c.id}`}
                    title="Live Reefer Telematics Active"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-success-bg, #f0fdf4)',
                      border: '1px solid var(--color-success-border, #bbf7d0)',
                      fontSize: '14px',
                    }}
                  >
                    📍
                  </span>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong
                        data-testid={`container-number-${c.id}`}
                        style={{ fontSize: '14px', color: 'var(--color-primary-dark, #0a192f)' }}
                      >
                        {c.containerNumber}
                      </strong>
                      {c.sealNumber && (
                        <span
                          style={{
                            fontSize: '11px',
                            color: 'var(--color-text-secondary, #64748b)',
                            backgroundColor: 'var(--color-slate-100, #f1f5f9)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          Seal: {c.sealNumber}
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        fontSize: '11px',
                        color: 'var(--color-text-secondary, #64748b)',
                        marginTop: '2px',
                      }}
                    >
                      {shippingLine} &bull; {vesselName || 'Vessel TBA'} ({voyageNumber || 'Voyage TBA'}) &bull;{' '}
                      {portOfLoading} &rarr; {portOfDestination}
                    </div>
                  </div>
                </div>

                {/* Right Metrics & Level 2 SKU Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  {/* Cold Chain Temp Badge */}
                  <span
                    data-testid={`reefer-temp-${c.id}`}
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--color-info-text, #1e40af)',
                      backgroundColor: 'var(--color-info-bg, #eff6ff)',
                      border: '1px solid var(--color-info-border, #bfdbfe)',
                      padding: '3px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    ❄️ {c.reeferSetTemp}
                  </span>

                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-primary, #0f172a)' }}>
                    {c.totalQuantityMt} MT &bull; ${c.totalAmountUsd.toLocaleString()}
                  </span>

                  {/* Level 2 Toggle Button */}
                  <button
                    type="button"
                    data-testid={`toggle-sku-btn-${c.id}`}
                    onClick={() => toggleContainerItems(c.id)}
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: isExpanded ? 'var(--color-gold, #c5a059)' : 'var(--color-primary-dark, #0a192f)',
                      backgroundColor: 'var(--color-background-subtle, #f8fafc)',
                      border: '1px solid var(--color-border, #cbd5e1)',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      cursor: 'pointer',
                    }}
                  >
                    {isExpanded ? `▲ Hide SKUs (${c.items.length})` : `▼ ${c.items.length} SKU Items`}
                  </button>
                </div>
              </div>

              {/* Level 2: Cargo Item Lines Table */}
              {isExpanded && (
                <div data-testid={`container-items-table-${c.id}`} style={{ padding: '12px 18px' }}>
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: '12px',
                      textAlign: 'left',
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          color: 'var(--color-text-secondary, #64748b)',
                          borderBottom: '1px solid var(--color-border, #e2e8f0)',
                          fontSize: '11px',
                          textTransform: 'uppercase',
                        }}
                      >
                        <th style={{ padding: '8px 10px' }}>Product Cut / SKU</th>
                        <th style={{ padding: '8px 10px' }}>Brand &amp; Packaging</th>
                        <th style={{ padding: '8px 10px' }}>Cut Size</th>
                        <th style={{ padding: '8px 10px' }}>Weight (MT)</th>
                        <th style={{ padding: '8px 10px', textAlign: 'right' }}>Amount USD</th>
                      </tr>
                    </thead>
                    <tbody>
                      {c.items.map((item) => (
                        <tr
                          key={item.id}
                          data-testid={`sku-item-row-${item.id}`}
                          style={{ borderBottom: '1px solid var(--color-border-subtle, #f1f5f9)' }}
                        >
                          {/* Cut & SKU */}
                          <td style={{ padding: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '18px' }}>🥩</span>
                              <div>
                                <strong style={{ color: 'var(--color-text-primary, #0f172a)' }}>
                                  {item.productName}
                                </strong>
                                <div style={{ fontSize: '10px', color: 'var(--color-gold, #c5a059)', fontWeight: 700 }}>
                                  {item.sku}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Brand & Packaging */}
                          <td style={{ padding: '10px' }}>
                            <div>{item.brand}</div>
                            <div style={{ fontSize: '10px', color: 'var(--color-text-secondary, #64748b)' }}>
                              {item.primaryPackaging}
                            </div>
                          </td>

                          {/* Cut Size */}
                          <td style={{ padding: '10px' }}>{item.cutSize}</td>

                          {/* Weight */}
                          <td style={{ padding: '10px', fontWeight: 600 }}>{item.quantityMt} MT</td>

                          {/* Amount */}
                          <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700 }}>
                            ${item.amountUsd.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
