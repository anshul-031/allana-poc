import { describe, it, expect } from 'vitest';
import {
  FALLBACK_DETAILED_SHIPMENTS,
  filterFallbackShipments,
} from '@/lib/fallback-shipments';

describe('src/lib/fallback-shipments.ts - Fallback Maritime Consignments & Helpers', () => {
  it('contains comprehensive export consignments with authentic containers and items', () => {
    expect(FALLBACK_DETAILED_SHIPMENTS.length).toBeGreaterThanOrEqual(6);
    FALLBACK_DETAILED_SHIPMENTS.forEach((s) => {
      expect(s.id).toBeDefined();
      expect(s.orderNumber).toMatch(/^ORD-2026-/);
      expect(s.shipToParty).toBeTruthy();
      expect(s.containers.length).toBeGreaterThan(0);
      expect(s.containers[0].items.length).toBeGreaterThan(0);
      expect(s.documents.length).toBeGreaterThan(0);
    });
  });

  it('filters by destinationCountry, salesOrgId, status, shipToParty, and search query', () => {
    // 1. Destination Country
    const uaeRes = filterFallbackShipments({ destinationCountry: 'United Arab Emirates' });
    expect(uaeRes.total).toBeGreaterThan(0);
    expect(uaeRes.shipments.every((s) => s.destinationCountry.includes('Emirates'))).toBe(true);

    // 2. Sales Org
    const soRes = filterFallbackShipments({ salesOrgId: 'so-1010' });
    expect(soRes.total).toBeGreaterThan(0);
    expect(soRes.shipments.every((s) => s.salesOrgId === 'so-1010')).toBe(true);

    // 3. Status
    const statusRes = filterFallbackShipments({ status: 'DELIVERED' });
    expect(statusRes.total).toBeGreaterThan(0);
    expect(statusRes.shipments.every((s) => s.status === 'DELIVERED')).toBe(true);

    // 4. Ship To Party
    const partyRes = filterFallbackShipments({ shipToParty: 'LuLu' });
    expect(partyRes.total).toBeGreaterThan(0);

    // 5. Search query
    const searchRes = filterFallbackShipments({ search: 'MSC' });
    expect(searchRes.total).toBeGreaterThan(0);
  });

  it('sorts by orderNumber_asc, orderNumber_desc, totalQuantityMt_asc, totalQuantityMt_desc, totalAmountUsd_asc, totalAmountUsd_desc, and default date', () => {
    const onAsc = filterFallbackShipments({ sortBy: 'orderNumber_asc' });
    expect(onAsc.shipments[0].orderNumber.localeCompare(onAsc.shipments[1].orderNumber)).toBeLessThanOrEqual(0);

    const onDesc = filterFallbackShipments({ sortBy: 'orderNumber_desc' });
    expect(onDesc.shipments[0].orderNumber.localeCompare(onDesc.shipments[1].orderNumber)).toBeGreaterThanOrEqual(0);

    const qtyAsc = filterFallbackShipments({ sortBy: 'totalQuantityMt_asc' });
    expect(qtyAsc.shipments[0].totalQuantityMt).toBeLessThanOrEqual(qtyAsc.shipments[1].totalQuantityMt);

    const qtyDesc = filterFallbackShipments({ sortBy: 'totalQuantityMt_desc' });
    expect(qtyDesc.shipments[0].totalQuantityMt).toBeGreaterThanOrEqual(qtyDesc.shipments[1].totalQuantityMt);

    const amtAsc = filterFallbackShipments({ sortBy: 'totalAmountUsd_asc' });
    expect(amtAsc.shipments[0].totalAmountUsd).toBeLessThanOrEqual(amtAsc.shipments[1].totalAmountUsd);

    const amtDesc = filterFallbackShipments({ sortBy: 'totalAmountUsd_desc' });
    expect(amtDesc.shipments[0].totalAmountUsd).toBeGreaterThanOrEqual(amtDesc.shipments[1].totalAmountUsd);

    const defSort = filterFallbackShipments();
    expect(defSort.shipments.length).toBeGreaterThan(0);
  });

  it('supports pagination and metadata extraction for countries and sales orgs', () => {
    const p1 = filterFallbackShipments({ page: 1, limit: 3 });
    expect(p1.shipments.length).toBe(3);
    expect(p1.page).toBe(1);
    expect(p1.pageSize).toBe(3);
    expect(p1.totalPages).toBe(Math.ceil(p1.total / 3));
    expect(p1.countries.length).toBeGreaterThan(0);
    expect(p1.salesOrgs.length).toBeGreaterThan(0);
  });
});
