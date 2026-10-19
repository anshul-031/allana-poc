import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LicenseAlertBanner from '@/components/dashboard/LicenseAlertBanner';
import * as dashboardActions from '@/server/actions/dashboard.actions';

vi.mock('@/server/actions/dashboard.actions', () => ({
  getDashboardAlerts: vi.fn(),
}));

describe('LicenseAlertBanner component', () => {
  const mockAlerts = {
    hasShipmentUpdates: true,
    shipmentCount: 3,
    expiringLicense: {
      id: 'lic-1',
      companyId: 'comp-1',
      country: 'Saudi Arabia',
      licenseName: 'SFDA Meat Import License',
      licenseNumber: 'SFDA-99',
      issueDate: '2025-10-01',
      expiryDate: '2026-11-01',
      documentUrl: null,
      daysRemaining: 14,
      status: 'EXPIRING_SOON' as const,
    },
    licenseAlertMessage: 'Please, notice: Your licence document will expire in 2 weeks.',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders both shipment update and license expiry alerts when provided', () => {
    render(<LicenseAlertBanner initialAlerts={mockAlerts} />);

    expect(screen.getByTestId('license-alert-banner')).toBeInTheDocument();

    // Shipment alert
    expect(
      screen.getByText('Dear Partner, We have some shipments updates for you. Please, check your shipments.')
    ).toBeInTheDocument();
    expect(screen.getByText(/3 active shipments with tracking milestones/i)).toBeInTheDocument();
    expect(screen.getByTestId('see-shipments-btn')).toHaveAttribute('href', '/shipments');

    // License alert
    expect(
      screen.getByText('Please, notice: Your licence document will expire in 2 weeks.')
    ).toBeInTheDocument();
    expect(screen.getByTestId('see-licenses-btn')).toHaveAttribute('href', '/settings/licenses');
  });

  it('dismisses shipment alert when close button is clicked, keeping license alert visible', () => {
    render(<LicenseAlertBanner initialAlerts={mockAlerts} />);

    expect(screen.getByTestId('shipment-alert-box')).toBeInTheDocument();
    expect(screen.getByTestId('license-expiry-box')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('dismiss-shipment-alert'));

    expect(screen.queryByTestId('shipment-alert-box')).not.toBeInTheDocument();
    expect(screen.getByTestId('license-expiry-box')).toBeInTheDocument();
  });

  it('dismisses license alert when close button is clicked, keeping shipment alert visible', () => {
    render(<LicenseAlertBanner initialAlerts={mockAlerts} />);

    fireEvent.click(screen.getByTestId('dismiss-license-alert'));

    expect(screen.getByTestId('shipment-alert-box')).toBeInTheDocument();
    expect(screen.queryByTestId('license-expiry-box')).not.toBeInTheDocument();
  });

  it('renders null when both alerts are dismissed', () => {
    render(<LicenseAlertBanner initialAlerts={mockAlerts} />);

    fireEvent.click(screen.getByTestId('dismiss-shipment-alert'));
    fireEvent.click(screen.getByTestId('dismiss-license-alert'));

    expect(screen.queryByTestId('license-alert-banner')).not.toBeInTheDocument();
  });

  it('renders null when initialAlerts has neither shipment updates nor license alert message', () => {
    render(
      <LicenseAlertBanner
        initialAlerts={{
          hasShipmentUpdates: false,
          shipmentCount: 0,
          expiringLicense: null,
          licenseAlertMessage: null,
        }}
      />
    );

    expect(screen.queryByTestId('license-alert-banner')).not.toBeInTheDocument();
  });

  it('fetches alerts from server when initialAlerts is not provided', async () => {
    vi.mocked(dashboardActions.getDashboardAlerts).mockResolvedValueOnce({
      success: true,
      alerts: mockAlerts,
    });

    render(<LicenseAlertBanner companyId="comp-1" />);

    await waitFor(() => {
      expect(screen.getByTestId('license-alert-banner')).toBeInTheDocument();
    });

    expect(dashboardActions.getDashboardAlerts).toHaveBeenCalledWith('comp-1');
  });

  it('fetches alerts for default company when neither initialAlerts nor companyId is provided', async () => {
    vi.mocked(dashboardActions.getDashboardAlerts).mockResolvedValueOnce({
      success: true,
      alerts: mockAlerts,
    });

    render(<LicenseAlertBanner />);

    await waitFor(() => {
      expect(dashboardActions.getDashboardAlerts).toHaveBeenCalledWith('comp-lulu-uae');
    });
  });

  it('renders singular shipment text when shipmentCount is 1', () => {
    render(
      <LicenseAlertBanner
        initialAlerts={{
          ...mockAlerts,
          shipmentCount: 1,
        }}
      />
    );

    expect(screen.getByText(/1 active shipment with tracking milestones/i)).toBeInTheDocument();
  });
});
