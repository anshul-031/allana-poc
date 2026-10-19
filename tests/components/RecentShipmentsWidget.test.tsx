import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import RecentShipmentsWidget, {
  formatDateString,
  STATUS_CONFIG,
} from '@/components/dashboard/RecentShipmentsWidget';
import * as shipmentsActions from '@/server/actions/shipments.actions';

vi.mock('@/server/actions/shipments.actions', async () => {
  const actual = await vi.importActual<typeof shipmentsActions>(
    '@/server/actions/shipments.actions'
  );
  return {
    ...actual,
    getRecentShipments: vi.fn(),
  };
});

const mockShipments: shipmentsActions.ShipmentSummaryDTO[] = [
  {
    id: 's-1',
    orderNumber: 'ORD-2026-88192',
    companyId: 'comp-1',
    shipToParty: 'LuLu Central Logistics JAFZA',
    destinationCountry: 'United Arab Emirates',
    totalQuantityMt: 48,
    totalAmountUsd: 220800,
    status: 'IN_TRANSIT',
    shippingLine: 'Maersk Line',
    vesselName: 'Maersk Mc-Kinney Moller',
    voyageNumber: '2604W',
    portOfLoading: 'JNPT Nhava Sheva, India',
    portOfDestination: 'Jebel Ali Port, UAE',
    shippingDate: '2026-10-10T14:00:00.000Z',
    etd: '2026-10-12T08:00:00.000Z',
    eta: '2026-10-24T18:00:00.000Z',
    createdAt: '2026-10-10T00:00:00.000Z',
  },
  {
    id: 's-2',
    orderNumber: 'ORD-2026-88045',
    companyId: 'comp-1',
    shipToParty: 'LuLu Dammam Cold Store',
    destinationCountry: 'Saudi Arabia',
    totalQuantityMt: 24,
    totalAmountUsd: 110400,
    status: 'ARRIVED_PORT',
    shippingLine: 'CMA CGM',
    vesselName: null, // Test TBA fallback
    voyageNumber: null,
    portOfLoading: 'JNPT Nhava Sheva, India',
    portOfDestination: 'King Abdulaziz Port, Dammam',
    shippingDate: null,
    etd: '2026-09-20T08:00:00.000Z',
    eta: '2026-10-05T18:00:00.000Z',
    createdAt: '2026-09-15T00:00:00.000Z',
  },
  {
    id: 's-3',
    orderNumber: 'ORD-2026-88001',
    companyId: 'comp-1',
    shipToParty: 'LuLu Riyadh',
    destinationCountry: 'Saudi Arabia',
    totalQuantityMt: 12,
    totalAmountUsd: 55000,
    status: 'DELIVERED',
    shippingLine: 'Hapag-Lloyd',
    vesselName: 'Alula',
    voyageNumber: '112E',
    portOfLoading: 'JNPT Nhava Sheva, India',
    portOfDestination: 'Riyadh Dry Port',
    shippingDate: '2026-08-01T00:00:00.000Z',
    etd: '2026-08-05T00:00:00.000Z',
    eta: '2026-08-20T00:00:00.000Z',
    createdAt: '2026-08-01T00:00:00.000Z',
  },
];

describe('RecentShipmentsWidget Component (FEAT-2.3)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('formatDateString helper', () => {
    it('returns em dash when date string is null or undefined', () => {
      expect(formatDateString(null)).toBe('—');
      expect(formatDateString(undefined)).toBe('—');
    });

    it('formats ISO date string properly', () => {
      const formatted = formatDateString('2026-10-24T18:00:00.000Z');
      expect(formatted).toContain('2026');
      expect(formatted).toContain('Oct');
    });
  });

  describe('STATUS_CONFIG', () => {
    it('provides status configurations for all 6 shipment states', () => {
      const statuses = [
        'BOOKED',
        'LOADED',
        'IN_TRANSIT',
        'ARRIVED_PORT',
        'CUSTOMS_CLEARED',
        'DELIVERED',
      ] as const;

      for (const s of statuses) {
        expect(STATUS_CONFIG[s]).toBeDefined();
        expect(STATUS_CONFIG[s].label).toBeDefined();
        expect(STATUS_CONFIG[s].color).toBeDefined();
      }
    });
  });

  it('renders table with recent shipments, formatted amounts, and status badges', () => {
    render(<RecentShipmentsWidget initialShipments={mockShipments} />);

    expect(screen.getByText('Recent Shipments (Last 3 Months)')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /All Shipments/i })).toBeInTheDocument();
    expect(screen.getByTestId('recent-shipments-table')).toBeInTheDocument();

    // Check rows
    expect(screen.getByText('ORD-2026-88192')).toBeInTheDocument();
    expect(screen.getByText('Jebel Ali Port, UAE')).toBeInTheDocument();
    expect(screen.getByText('48.00 MT')).toBeInTheDocument();
    expect(screen.getByText('$220,800.00 USD')).toBeInTheDocument();
    expect(screen.getByTestId('badge-status-IN_TRANSIT')).toHaveTextContent('In Transit');

    // Check second row with TBA vessel fallback
    expect(screen.getByText('ORD-2026-88045')).toBeInTheDocument();
    expect(screen.getByText('TBA')).toBeInTheDocument();
    expect(screen.getByTestId('badge-status-ARRIVED_PORT')).toHaveTextContent('Berthed / Arrived');

    // Check details drilldown links
    const detailLinks = screen.getAllByRole('link', { name: /Details/i });
    expect(detailLinks).toHaveLength(3);
    expect(detailLinks[0]).toHaveAttribute('href', '/shipments/s-1');
  });

  it('renders empty state when shipments array is empty', () => {
    render(<RecentShipmentsWidget initialShipments={[]} />);

    expect(screen.getByTestId('shipments-empty-state')).toBeInTheDocument();
    expect(screen.getByText('No Shipments in the Last 90 Days')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Browse Products Catalog/i })).toHaveAttribute(
      'href',
      '/catalog'
    );
  });

  it('fetches shipments on mount when initialShipments is not provided', async () => {
    vi.mocked(shipmentsActions.getRecentShipments).mockResolvedValue({
      success: true,
      shipments: mockShipments,
      totalCount: 3,
    });

    render(<RecentShipmentsWidget companyId="comp-1" />);

    expect(screen.getByTestId('shipments-loading-state')).toBeInTheDocument();

    await waitFor(() => {
      expect(shipmentsActions.getRecentShipments).toHaveBeenCalledWith({ companyId: 'comp-1' });
      expect(screen.getByText('ORD-2026-88192')).toBeInTheDocument();
    });
  });

  it('fetches shipments on mount when neither initialShipments nor companyId is provided', async () => {
    vi.mocked(shipmentsActions.getRecentShipments).mockResolvedValue({
      success: true,
      shipments: mockShipments,
      totalCount: 3,
    });

    render(<RecentShipmentsWidget />);

    await waitFor(() => {
      expect(shipmentsActions.getRecentShipments).toHaveBeenCalledWith({ companyId: 'comp-lulu-uae' });
    });
  });
});
