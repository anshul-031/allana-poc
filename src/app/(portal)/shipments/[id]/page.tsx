import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { getShipmentDetails } from '@/server/actions/shipments.actions';
import ContainerDrilldown from '@/components/shipments/ContainerDrilldown';
import DocumentVault from '@/components/shipments/DocumentVault';
import { formatCurrencyAmount } from '@/lib/utils';
import { STATUS_CONFIG, formatDateString } from '@/components/dashboard/RecentShipmentsWidget';
import { FALLBACK_DETAILED_SHIPMENTS } from '@/lib/fallback-shipments';

interface ShipmentDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ShipmentDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const res = await getShipmentDetails(id);
  const shipment =
    res.success && res.shipment
      ? res.shipment
      : (FALLBACK_DETAILED_SHIPMENTS.find((s) => s.id === id || s.orderNumber === id) || null);

  if (shipment) {
    return {
      title: `${shipment.orderNumber} - Consignment Tracking | Allana Portal`,
      description: `Live container telemetry, voyage manifest, and document vault for shipment ${shipment.orderNumber}.`,
    };
  }
  return {
    title: 'Shipment Details | Allana Customer Portal',
  };
}

export default async function ShipmentDetailPage({ params }: ShipmentDetailPageProps) {
  const { id } = await params;
  const res = await getShipmentDetails(id);
  const shipment =
    res.success && res.shipment
      ? res.shipment
      : (FALLBACK_DETAILED_SHIPMENTS.find((s) => s.id === id || s.orderNumber === id) || null);

  if (!shipment) {
    return (
      <div
        data-testid="shipment-not-found"
        style={{
          maxWidth: '600px',
          margin: '3rem auto',
          padding: '2.5rem',
          borderRadius: 'var(--border-radius-xl, 16px)',
          backgroundColor: 'var(--color-surface, #ffffff)',
          border: '1px solid var(--color-border, #e2e8f0)',
          textAlign: 'center',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🚢</div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary, #0f172a)', margin: '0 0 0.5rem 0' }}>
          Shipment Not Found
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary, #64748b)', margin: '0 0 1.5rem 0' }}>
          {res.error || 'The requested shipment consignment could not be found or does not belong to your organization.'}
        </p>
        <Link
          href="/shipments"
          style={{
            display: 'inline-block',
            padding: '0.5rem 1.25rem',
            borderRadius: 'var(--border-radius-pill, 9999px)',
            backgroundColor: 'var(--color-primary-dark, #0a192f)',
            color: '#ffffff',
            fontSize: '0.875rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Back to All Shipments
        </Link>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[shipment.status] || STATUS_CONFIG.BOOKED;

  return (
    <div
      data-testid="shipment-detail-page"
      style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: 'var(--spacing-xl) var(--spacing-lg)',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-xl)',
      }}
    >
      {/* Breadcrumb & Header */}
      <div>
        <div
          style={{
            fontSize: 'var(--font-size-xs, 12px)',
            color: 'var(--color-text-secondary, #64748b)',
            marginBottom: 'var(--spacing-xs, 6px)',
          }}
        >
          <Link href="/dashboard" style={{ color: 'inherit', textDecoration: 'none' }}>
            Dashboard
          </Link>{' '}
          &gt;{' '}
          <Link href="/shipments" style={{ color: 'inherit', textDecoration: 'none' }}>
            Shipments
          </Link>{' '}
          &gt;{' '}
          <span style={{ color: 'var(--color-gold, #c5a059)', fontWeight: 600 }}>
            {shipment.orderNumber}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 'var(--font-size-2xl, 26px)',
                fontWeight: 800,
                color: 'var(--color-primary-dark, #0a192f)',
                margin: '0 0 4px 0',
              }}
            >
              Consignment {shipment.orderNumber}
            </h1>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary, #64748b)' }}>
              Consignee: {shipment.shipToParty} &bull; {shipment.destinationCountry}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 12px',
                borderRadius: 'var(--border-radius-pill, 9999px)',
                fontSize: '12px',
                fontWeight: 700,
                backgroundColor: statusCfg.bg,
                color: statusCfg.color,
                border: `1px solid ${statusCfg.border}`,
              }}
            >
              {statusCfg.label}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--color-surface, #ffffff)',
            border: '1px solid var(--color-border, #e2e8f0)',
            borderRadius: 'var(--border-radius-lg, 12px)',
            padding: '16px 20px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-secondary, #64748b)', fontWeight: 600 }}>
            Net Cargo Weight
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-primary-dark, #0a192f)', marginTop: '4px' }}>
            {Number(shipment.totalQuantityMt).toFixed(2)} MT
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary, #94a3b8)', marginTop: '2px' }}>
            {shipment.totalContainers} Container(s) &bull; {shipment.totalSkus} Cut SKUs
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--color-surface, #ffffff)',
            border: '1px solid var(--color-border, #e2e8f0)',
            borderRadius: 'var(--border-radius-lg, 12px)',
            padding: '16px 20px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-secondary, #64748b)', fontWeight: 600 }}>
            Invoice Value
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-gold, #c5a059)', marginTop: '4px' }}>
            {formatCurrencyAmount(Number(shipment.totalAmountUsd), 'USD')}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary, #94a3b8)', marginTop: '2px' }}>
            {shipment.salesOrgName}
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--color-surface, #ffffff)',
            border: '1px solid var(--color-border, #e2e8f0)',
            borderRadius: 'var(--border-radius-lg, 12px)',
            padding: '16px 20px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-secondary, #64748b)', fontWeight: 600 }}>
            Vessel &amp; Carrier
          </div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary-dark, #0a192f)', marginTop: '4px' }}>
            {shipment.vesselName || 'TBA'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-secondary, #64748b)', marginTop: '2px' }}>
            {shipment.shippingLine} &bull; Voy: {shipment.voyageNumber || 'TBA'}
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--color-surface, #ffffff)',
            border: '1px solid var(--color-border, #e2e8f0)',
            borderRadius: 'var(--border-radius-lg, 12px)',
            padding: '16px 20px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-secondary, #64748b)', fontWeight: 600 }}>
            Voyage Schedule
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-primary-dark, #0a192f)', marginTop: '4px' }}>
            ETA: {formatDateString(shipment.eta)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-secondary, #64748b)', marginTop: '2px' }}>
            ETD: {formatDateString(shipment.etd)} &bull; {shipment.portOfDestination}
          </div>
        </div>
      </div>

      {/* Container Drilldown & Document Vault */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
        <ContainerDrilldown
          containers={shipment.containers}
          shippingLine={shipment.shippingLine}
          vesselName={shipment.vesselName}
          voyageNumber={shipment.voyageNumber}
          portOfLoading={shipment.portOfLoading}
          portOfDestination={shipment.portOfDestination}
        />

        <DocumentVault
          documents={shipment.documents}
          orderNumber={shipment.orderNumber}
        />
      </div>
    </div>
  );
}
