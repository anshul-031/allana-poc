'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DashboardAlertsDTO,
  getDashboardAlerts,
} from '@/server/actions/dashboard.actions';
import { parseActiveCompanyId } from '@/lib/company-context';

export interface LicenseAlertBannerProps {
  initialAlerts?: DashboardAlertsDTO;
  companyId?: string;
}

export default function LicenseAlertBanner({
  initialAlerts,
  companyId,
}: LicenseAlertBannerProps) {
  const [alerts, setAlerts] = useState<DashboardAlertsDTO | null>(initialAlerts || null);
  const [isShipmentAlertDismissed, setIsShipmentAlertDismissed] = useState(false);
  const [isLicenseAlertDismissed, setIsLicenseAlertDismissed] = useState(false);

  useEffect(() => {
    if (!initialAlerts) {
      const activeId =
        companyId ||
        parseActiveCompanyId(document?.cookie) ||
        'comp-lulu-uae';
      getDashboardAlerts(activeId).then((res) => {
        if (res.success) {
          setAlerts(res.alerts);
        }
      });
    }
  }, [initialAlerts, companyId]);

  if (!alerts) {
    return null;
  }

  const showShipments = alerts.hasShipmentUpdates && !isShipmentAlertDismissed;
  const showLicense = Boolean(alerts.licenseAlertMessage) && !isLicenseAlertDismissed;

  if (!showShipments && !showLicense) {
    return null;
  }

  return (
    <div
      data-testid="license-alert-banner"
      role="region"
      aria-label="Important Account Notices"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-sm)',
        marginBottom: 'var(--spacing-xl)',
      }}
    >
      {/* Trigger 1: Shipments Update Alert */}
      {showShipments && (
        <div
          data-testid="shipment-alert-box"
          role="alert"
          style={{
            backgroundColor: '#0a192f',
            border: '1px solid rgba(197, 160, 89, 0.45)',
            borderRadius: 'var(--border-radius-lg)',
            padding: 'var(--spacing-md) var(--spacing-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--spacing-md)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(197, 160, 89, 0.15)',
                border: '1px solid var(--color-gold, #c5a059)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-gold, #c5a059)',
                fontSize: '18px',
                flexShrink: 0,
              }}
            >
              &#128674;
            </div>

            <div>
              <div
                style={{
                  color: '#ffffff',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 600,
                  lineHeight: 1.4,
                }}
              >
                Dear Partner, We have some shipments updates for you. Please, check your shipments.
              </div>
              <div
                style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: 'var(--font-size-xs)',
                  marginTop: '2px',
                }}
              >
                {alerts.shipmentCount} active shipment{alerts.shipmentCount === 1 ? '' : 's'} with tracking milestones and bill of lading documents.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
            <Link
              href="/shipments"
              data-testid="see-shipments-btn"
              style={{
                backgroundColor: 'var(--color-gold, #c5a059)',
                color: '#0a192f',
                padding: '8px 16px',
                borderRadius: 'var(--border-radius-pill)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'var(--transition-fast)',
              }}
            >
              <span>See my shipments</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>

            <button
              type="button"
              data-testid="dismiss-shipment-alert"
              aria-label="Dismiss shipments update alert"
              onClick={() => setIsShipmentAlertDismissed(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '4px 8px',
                lineHeight: 1,
              }}
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Trigger 2: Regulatory License Expiry Alert */}
      {showLicense && (
        <div
          data-testid="license-expiry-box"
          role="alert"
          style={{
            backgroundColor: '#1e1b18',
            border: '1px solid #f59e0b',
            borderRadius: 'var(--border-radius-lg)',
            padding: 'var(--spacing-md) var(--spacing-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--spacing-md)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                border: '1px solid #f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f59e0b',
                fontWeight: 800,
                fontSize: '16px',
                flexShrink: 0,
              }}
            >
              !
            </div>

            <div>
              <div
                style={{
                  color: '#ffffff',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 600,
                  lineHeight: 1.4,
                }}
              >
                {alerts.licenseAlertMessage}
              </div>
              <div
                style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: 'var(--font-size-xs)',
                  marginTop: '2px',
                }}
              >
                Renew your import/SFDA compliance documents to prevent customs clearance delays.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
            <Link
              href="/settings/licenses"
              data-testid="see-licenses-btn"
              style={{
                backgroundColor: '#f59e0b',
                color: '#1a1005',
                padding: '8px 16px',
                borderRadius: 'var(--border-radius-pill)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'var(--transition-fast)',
              }}
            >
              <span>See my licenses</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>

            <button
              type="button"
              data-testid="dismiss-license-alert"
              aria-label="Dismiss license expiry alert"
              onClick={() => setIsLicenseAlertDismissed(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '4px 8px',
                lineHeight: 1,
              }}
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
