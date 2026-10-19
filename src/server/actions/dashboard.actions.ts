'use server';

import { getCompanyLicenses, ComplianceLicenseDTO } from './licenses.actions';
import { getRecentShipments, ShipmentSummaryDTO } from './shipments.actions';

export interface DashboardAlertsDTO {
  hasShipmentUpdates: boolean;
  shipmentCount: number;
  expiringLicense: ComplianceLicenseDTO | null;
  licenseAlertMessage: string | null;
}

export interface GetDashboardAlertsResult {
  success: boolean;
  alerts: DashboardAlertsDTO;
  error?: string;
}

/**
 * Fetch contextual action alerts for the active company:
 * 1. Shipments updates trigger
 * 2. Regulatory license expiry trigger (<= 30 days remaining or expired)
 */
export async function getDashboardAlerts(companyId?: string): Promise<GetDashboardAlertsResult> {
  try {
    const [licenseRes, shipmentRes] = await Promise.all([
      getCompanyLicenses({ companyId }),
      getRecentShipments({ companyId, days: 90, limit: 10 }),
    ]);

    // Check for active shipments that have recent milestone updates
    const activeShipments = shipmentRes.success ? shipmentRes.shipments : [];
    const hasShipmentUpdates = activeShipments.length > 0;

    // Check for licenses that are EXPIRING_SOON or EXPIRED
    let expiringLicense: ComplianceLicenseDTO | null = null;
    let licenseAlertMessage: string | null = null;

    if (licenseRes.success && licenseRes.licenses.length > 0) {
      const expiringOrExpired = licenseRes.licenses.find(
        (lic) => lic.status === 'EXPIRING_SOON' || lic.status === 'EXPIRED'
      );

      if (expiringOrExpired) {
        expiringLicense = expiringOrExpired;
        if (expiringOrExpired.status === 'EXPIRED') {
          licenseAlertMessage = `Please, notice: Your licence document (${expiringOrExpired.licenseName}) has expired.`;
        } else if (expiringOrExpired.daysRemaining <= 14) {
          licenseAlertMessage = 'Please, notice: Your licence document will expire in 2 weeks.';
        } else {
          licenseAlertMessage = `Please, notice: Your licence document (${expiringOrExpired.licenseName}) will expire in ${expiringOrExpired.daysRemaining} days.`;
        }
      }
    }

    return {
      success: true,
      alerts: {
        hasShipmentUpdates,
        shipmentCount: activeShipments.length,
        expiringLicense,
        licenseAlertMessage,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch dashboard alerts';
    return {
      success: false,
      alerts: {
        hasShipmentUpdates: false,
        shipmentCount: 0,
        expiringLicense: null,
        licenseAlertMessage: null,
      },
      error: message,
    };
  }
}
