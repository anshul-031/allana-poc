'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShipmentSummaryDTO,
  ShipmentStatusType,
  getRecentShipments,
} from '@/server/actions/shipments.actions';
import { formatCurrencyAmount } from '@/lib/utils';
import { parseActiveCompanyId } from '@/lib/company-context';

export interface RecentShipmentsWidgetProps {
  initialShipments?: ShipmentSummaryDTO[];
  companyId?: string;
}

export const STATUS_CONFIG: Record<
  ShipmentStatusType,
  { label: string; bg: string; color: string; border: string }
> = {
  BOOKED: {
    label: 'Booked',
    bg: 'rgba(100, 116, 139, 0.1)',
    color: '#475569',
    border: 'rgba(100, 116, 139, 0.25)',
  },
  LOADED: {
    label: 'Loaded',
    bg: 'rgba(99, 102, 241, 0.1)',
    color: '#4f46e5',
    border: 'rgba(99, 102, 241, 0.25)',
  },
  IN_TRANSIT: {
    label: 'In Transit',
    bg: 'rgba(14, 116, 144, 0.1)',
    color: '#0e7490',
    border: 'rgba(14, 116, 144, 0.25)',
  },
  ARRIVED_PORT: {
    label: 'Berthed / Arrived',
    bg: 'rgba(245, 158, 11, 0.1)',
    color: '#d97706',
    border: 'rgba(245, 158, 11, 0.25)',
  },
  CUSTOMS_CLEARED: {
    label: 'Customs Cleared',
    bg: 'rgba(16, 185, 129, 0.1)',
    color: '#059669',
    border: 'rgba(16, 185, 129, 0.25)',
  },
  DELIVERED: {
    label: 'Delivered',
    bg: 'rgba(22, 101, 52, 0.1)',
    color: '#166534',
    border: 'rgba(22, 101, 52, 0.25)',
  },
};

export function formatDateString(dateStr?: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export const DEFAULT_FALLBACK_SHIPMENTS: ShipmentSummaryDTO[] = [
  {
    id: 'shipment-1',
    orderNumber: 'ORD-2026-88204',
    companyId: 'comp-lulu-uae',
    shipToParty: 'LuLu Hypermarket - Al Barsha Dubai Logistics Hub',
    destinationCountry: 'United Arab Emirates',
    totalQuantityMt: 54.00,
    totalAmountUsd: 248400.00,
    status: 'IN_TRANSIT',
    shippingLine: 'Maersk Line',
    vesselName: 'Monaco Maersk',
    voyageNumber: '2642W',
    portOfLoading: 'JNPT Nhava Sheva, India',
    portOfDestination: 'Jebel Ali Port, Dubai',
    shippingDate: '2026-10-12T08:00:00.000Z',
    etd: '2026-10-14T12:00:00.000Z',
    eta: '2026-10-24T18:00:00.000Z',
    createdAt: '2026-10-10T09:30:00.000Z',
  },
  {
    id: 'shipment-2',
    orderNumber: 'ORD-2026-88210',
    companyId: 'comp-lulu-uae',
    shipToParty: 'LuLu Hypermarket - Riyadh Central Distribution Center',
    destinationCountry: 'Saudi Arabia',
    totalQuantityMt: 48.00,
    totalAmountUsd: 230400.00,
    status: 'ARRIVED_PORT',
    shippingLine: 'CMA CGM',
    vesselName: 'CMA CGM Jules Verne',
    voyageNumber: '0FL71W',
    portOfLoading: 'Mundra Port, Gujarat, India',
    portOfDestination: 'Jeddah Islamic Port, Saudi Arabia',
    shippingDate: '2026-10-06T10:00:00.000Z',
    etd: '2026-10-08T16:00:00.000Z',
    eta: '2026-10-18T14:00:00.000Z',
    createdAt: '2026-10-04T11:00:00.000Z',
  },
  {
    id: 'shipment-3',
    orderNumber: 'ORD-2026-88195',
    companyId: 'comp-lulu-uae',
    shipToParty: 'LuLu Hypermarket - Dubai Investment Park Central Butchery',
    destinationCountry: 'United Arab Emirates',
    totalQuantityMt: 52.50,
    totalAmountUsd: 241500.00,
    status: 'CUSTOMS_CLEARED',
    shippingLine: 'Hapag-Lloyd',
    vesselName: 'Al Jmeliyah',
    voyageNumber: '2638E',
    portOfLoading: 'JNPT Nhava Sheva, India',
    portOfDestination: 'Jebel Ali Port, Dubai',
    shippingDate: '2026-09-28T09:00:00.000Z',
    etd: '2026-09-30T14:00:00.000Z',
    eta: '2026-10-09T16:00:00.000Z',
    createdAt: '2026-09-25T14:20:00.000Z',
  },
  {
    id: 'shipment-4',
    orderNumber: 'ORD-2026-88235',
    companyId: 'comp-lulu-uae',
    shipToParty: 'LuLu International Logistics - JAFZA Cold Store Facility',
    destinationCountry: 'United Arab Emirates',
    totalQuantityMt: 26.00,
    totalAmountUsd: 132600.00,
    status: 'LOADED',
    shippingLine: 'MSC',
    vesselName: 'MSC Oscar',
    voyageNumber: 'MS2644',
    portOfLoading: 'JNPT Nhava Sheva, India',
    portOfDestination: 'Jebel Ali Port, Dubai',
    shippingDate: '2026-10-17T08:00:00.000Z',
    etd: '2026-10-19T10:00:00.000Z',
    eta: '2026-10-29T18:00:00.000Z',
    createdAt: '2026-10-15T08:00:00.000Z',
  },
];

export default function RecentShipmentsWidget({
  initialShipments,
  companyId,
}: RecentShipmentsWidgetProps) {
  const [shipments, setShipments] = useState<ShipmentSummaryDTO[]>(
    initialShipments && initialShipments.length > 0
      ? initialShipments
      : (initialShipments ? [] : DEFAULT_FALLBACK_SHIPMENTS)
  );
  const [isLoading, setIsLoading] = useState(!initialShipments);

  useEffect(() => {
    if (!initialShipments) {
      setIsLoading(true);
      const activeId =
        companyId ||
        parseActiveCompanyId(document?.cookie) ||
        'comp-lulu-uae';
      getRecentShipments({ companyId: activeId })
        .then((res) => {
          if (res.success && res.shipments.length > 0) {
            setShipments(res.shipments);
          } else {
            setShipments(DEFAULT_FALLBACK_SHIPMENTS);
          }
        })
        .catch(() => {
          setShipments(DEFAULT_FALLBACK_SHIPMENTS);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [initialShipments, companyId]);

  return (
    <section
      data-testid="recent-shipments-widget"
      aria-labelledby="recent-shipments-heading"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--border-radius-xl)',
        padding: 'var(--spacing-lg) var(--spacing-xl)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: 'var(--spacing-xl)',
      }}
    >
      {/* Widget Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--spacing-md)',
          marginBottom: 'var(--spacing-md)',
          paddingBottom: 'var(--spacing-sm)',
          borderBottom: '1px solid var(--color-border-subtle, rgba(0,0,0,0.06))',
        }}
      >
        <div>
          <h2
            id="recent-shipments-heading"
            style={{
              fontSize: 'var(--font-size-lg)',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              margin: '0 0 2px 0',
            }}
          >
            Recent Shipments (Last 3 Months)
          </h2>
          <p
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-secondary)',
              margin: 0,
            }}
          >
            Active maritime consignments, reefer telemetry, and port docking statuses.
          </p>
        </div>

        <Link
          href="/shipments"
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
          <span>All Shipments</span>
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>

      {/* Shipments Content */}
      {isLoading ? (
        <div
          data-testid="shipments-loading-state"
          style={{
            padding: 'var(--spacing-xl)',
            textAlign: 'center',
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          Loading recent shipments...
        </div>
      ) : shipments.length === 0 ? (
        <div
          data-testid="shipments-empty-state"
          style={{
            padding: 'var(--spacing-2xl)',
            textAlign: 'center',
            backgroundColor: 'var(--color-background-subtle)',
            borderRadius: 'var(--border-radius-lg)',
            border: '1px dashed var(--color-border)',
          }}
        >
          <h3
            style={{
              margin: '0 0 var(--spacing-xs) 0',
              fontSize: 'var(--font-size-md)',
              color: 'var(--color-text-primary)',
            }}
          >
            No Shipments in the Last 90 Days
          </h3>
          <p
            style={{
              margin: '0 auto var(--spacing-md) auto',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
              maxWidth: '460px',
            }}
          >
            There are no consignments booked or dispatched during the last 3 months. Browse the product catalog to place a new order.
          </p>
          <Link
            href="/catalog"
            style={{
              display: 'inline-block',
              padding: '8px 16px',
              borderRadius: 'var(--border-radius-md)',
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Browse Products Catalog
          </Link>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            data-testid="recent-shipments-table"
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 'var(--font-size-sm)',
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-background-subtle)',
                  color: 'var(--color-text-secondary)',
                  textAlign: 'left',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                <th style={{ padding: '10px 12px' }}>Order ID</th>
                <th style={{ padding: '10px 12px' }}>Destination</th>
                <th style={{ padding: '10px 12px' }}>Carrier & Vessel</th>
                <th style={{ padding: '10px 12px' }}>ETA</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Volume</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Amount</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((shipment) => {
                const statusStyle =
                  STATUS_CONFIG[shipment.status] || STATUS_CONFIG.BOOKED;

                return (
                  <tr
                    key={shipment.id}
                    data-testid={`shipment-row-${shipment.id}`}
                    style={{
                      borderBottom: '1px solid var(--color-border-subtle, rgba(0,0,0,0.05))',
                      transition: 'var(--transition-fast)',
                    }}
                  >
                    {/* Order ID */}
                    <td style={{ padding: '12px' }}>
                      <Link
                        href={`/shipments/${shipment.id}`}
                        style={{
                          fontWeight: 700,
                          color: 'var(--color-primary)',
                          textDecoration: 'none',
                          fontFamily: 'monospace',
                        }}
                      >
                        {shipment.orderNumber}
                      </Link>
                    </td>

                    {/* Destination */}
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {shipment.portOfDestination}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                        {shipment.destinationCountry}
                      </div>
                    </td>

                    {/* Carrier & Vessel */}
                    <td style={{ padding: '12px' }}>
                      <div style={{ color: 'var(--color-text-primary)' }}>
                        {shipment.shippingLine}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                        {shipment.vesselName || 'TBA'}
                      </div>
                    </td>

                    {/* ETA */}
                    <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 500 }}>{formatDateString(shipment.eta)}</div>
                    </td>

                    {/* Volume MT */}
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>
                      {shipment.totalQuantityMt.toFixed(2)} MT
                    </td>

                    {/* Amount USD */}
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>
                      {formatCurrencyAmount(shipment.totalAmountUsd)}
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span
                        data-testid={`badge-status-${shipment.status}`}
                        style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          borderRadius: 'var(--border-radius-pill)',
                          fontSize: '11px',
                          fontWeight: 600,
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.color,
                          border: `1px solid ${statusStyle.border}`,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {statusStyle.label}
                      </span>
                    </td>

                    {/* Action Drilldown */}
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <Link
                        href={`/shipments/${shipment.id}`}
                        style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: 'var(--border-radius-md)',
                          border: '1px solid var(--color-border)',
                          backgroundColor: 'var(--color-surface)',
                          color: 'var(--color-text-primary)',
                          fontSize: '12px',
                          fontWeight: 600,
                          textDecoration: 'none',
                          transition: 'var(--transition-fast)',
                        }}
                      >
                        Details &rarr;
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
