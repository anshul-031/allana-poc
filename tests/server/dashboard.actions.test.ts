import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDashboardAlerts } from '@/server/actions/dashboard.actions';
import * as licensesActions from '@/server/actions/licenses.actions';
import * as shipmentsActions from '@/server/actions/shipments.actions';

vi.mock('@/server/actions/licenses.actions', () => ({
  getCompanyLicenses: vi.fn(),
}));

vi.mock('@/server/actions/shipments.actions', () => ({
  getRecentShipments: vi.fn(),
}));

describe('dashboard.actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns both shipments update and license expiry alerts when both are active', async () => {
    vi.mocked(licensesActions.getCompanyLicenses).mockResolvedValueOnce({
      success: true,
      isRegulatedJurisdiction: true,
      licenses: [
        {
          id: 'lic-1',
          companyId: 'comp-1',
          country: 'Saudi Arabia',
          licenseName: 'SFDA Red Meat Import Permit',
          licenseNumber: 'SFDA-2026-99',
          issueDate: '2025-10-01',
          expiryDate: '2026-11-01',
          documentUrl: 'licenses/sfda.pdf',
          daysRemaining: 12,
          status: 'EXPIRING_SOON',
        },
      ],
    });

    vi.mocked(shipmentsActions.getRecentShipments).mockResolvedValueOnce({
      success: true,
      shipments: [
        {
          id: 'ship-1',
          orderNumber: 'ORD-101',
          companyId: 'comp-1',
          shipToParty: 'Jeddah Central',
          destinationCountry: 'Saudi Arabia',
          totalQuantityMt: 26.5,
          totalAmountUsd: 125000,
          status: 'IN_TRANSIT',
          shippingLine: 'Maersk',
          vesselName: null,
          voyageNumber: null,
          portOfLoading: 'Nhava Sheva',
          portOfDestination: 'Jeddah',
          shippingDate: null,
          etd: '2026-10-15',
          eta: '2026-10-25',
          createdAt: '2026-10-15',
        },
      ],
      totalCount: 1,
    });

    const res = await getDashboardAlerts('comp-1');

    expect(res.success).toBe(true);
    expect(res.alerts.hasShipmentUpdates).toBe(true);
    expect(res.alerts.shipmentCount).toBe(1);
    expect(res.alerts.expiringLicense?.id).toBe('lic-1');
    expect(res.alerts.licenseAlertMessage).toBe(
      'Please, notice: Your licence document will expire in 2 weeks.'
    );
  });

  it('formats expired license message when status is EXPIRED', async () => {
    vi.mocked(licensesActions.getCompanyLicenses).mockResolvedValueOnce({
      success: true,
      isRegulatedJurisdiction: true,
      licenses: [
        {
          id: 'lic-exp',
          companyId: 'comp-1',
          country: 'Saudi Arabia',
          licenseName: 'Halal Certificate',
          licenseNumber: 'HL-2025',
          issueDate: '2024-10-01',
          expiryDate: '2025-10-01',
          documentUrl: null,
          daysRemaining: 0,
          status: 'EXPIRED',
        },
      ],
    });

    vi.mocked(shipmentsActions.getRecentShipments).mockResolvedValueOnce({
      success: true,
      shipments: [],
      totalCount: 0,
    });

    const res = await getDashboardAlerts('comp-1');

    expect(res.success).toBe(true);
    expect(res.alerts.hasShipmentUpdates).toBe(false);
    expect(res.alerts.licenseAlertMessage).toBe(
      'Please, notice: Your licence document (Halal Certificate) has expired.'
    );
  });

  it('formats days message when days remaining is between 15 and 30 days', async () => {
    vi.mocked(licensesActions.getCompanyLicenses).mockResolvedValueOnce({
      success: true,
      isRegulatedJurisdiction: true,
      licenses: [
        {
          id: 'lic-25',
          companyId: 'comp-1',
          country: 'UAE',
          licenseName: 'MOIAT Import Certificate',
          licenseNumber: 'MOIAT-88',
          issueDate: '2025-11-01',
          expiryDate: '2026-11-20',
          documentUrl: null,
          daysRemaining: 25,
          status: 'EXPIRING_SOON',
        },
      ],
    });

    vi.mocked(shipmentsActions.getRecentShipments).mockResolvedValueOnce({
      success: false,
      shipments: [],
      totalCount: 0,
    });

    const res = await getDashboardAlerts('comp-1');

    expect(res.success).toBe(true);
    expect(res.alerts.hasShipmentUpdates).toBe(false);
    expect(res.alerts.licenseAlertMessage).toBe(
      'Please, notice: Your licence document (MOIAT Import Certificate) will expire in 25 days.'
    );
  });

  it('returns no alerts when licenses are active and there are no shipments', async () => {
    vi.mocked(licensesActions.getCompanyLicenses).mockResolvedValueOnce({
      success: true,
      isRegulatedJurisdiction: false,
      licenses: [
        {
          id: 'lic-active',
          companyId: 'comp-1',
          country: 'UAE',
          licenseName: 'Trade License',
          licenseNumber: 'TL-100',
          issueDate: '2026-01-01',
          expiryDate: '2027-01-01',
          documentUrl: null,
          daysRemaining: 300,
          status: 'ACTIVE',
        },
      ],
    });

    vi.mocked(shipmentsActions.getRecentShipments).mockResolvedValueOnce({
      success: true,
      shipments: [],
      totalCount: 0,
    });

    const res = await getDashboardAlerts('comp-1');

    expect(res.success).toBe(true);
    expect(res.alerts.hasShipmentUpdates).toBe(false);
    expect(res.alerts.expiringLicense).toBeNull();
    expect(res.alerts.licenseAlertMessage).toBeNull();
  });

  it('handles error when one of the sub-actions throws an exception', async () => {
    vi.mocked(licensesActions.getCompanyLicenses).mockRejectedValueOnce(
      new Error('Database connectivity failure')
    );

    const res = await getDashboardAlerts('comp-1');

    expect(res.success).toBe(false);
    expect(res.error).toBe('Database connectivity failure');
    expect(res.alerts.hasShipmentUpdates).toBe(false);
  });

  it('handles non-Error thrown in getDashboardAlerts', async () => {
    vi.mocked(licensesActions.getCompanyLicenses).mockRejectedValueOnce('raw string error');

    const res = await getDashboardAlerts('comp-1');

    expect(res.success).toBe(false);
    expect(res.error).toBe('Failed to fetch dashboard alerts');
  });
});
