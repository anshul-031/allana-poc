import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getSalesPlanData,
  getActiveCompanyIdFromCookies,
} from '@/server/actions/sales-plan.actions';
import { prisma } from '@/lib/prisma';
import * as nextHeaders from 'next/headers';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    salesOrganization: {
      findMany: vi.fn(),
    },
    salesPlan: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

describe('Sales Plan Server Actions (FEAT-6.1, FEAT-6.2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getActiveCompanyIdFromCookies', () => {
    it('returns company id when cookie exists', async () => {
      vi.spyOn(nextHeaders, 'cookies').mockResolvedValue({
        get: vi.fn().mockReturnValue({ value: 'comp-test-123' }),
      } as any);

      const result = await getActiveCompanyIdFromCookies();
      expect(result).toBe('comp-test-123');
    });

    it('returns null when cookie does not exist', async () => {
      vi.spyOn(nextHeaders, 'cookies').mockResolvedValue({
        get: vi.fn().mockReturnValue(undefined),
      } as any);

      const result = await getActiveCompanyIdFromCookies();
      expect(result).toBeNull();
    });

    it('returns null when cookies() throws an exception', async () => {
      vi.spyOn(nextHeaders, 'cookies').mockRejectedValue(new Error('Cookie store failure'));

      const result = await getActiveCompanyIdFromCookies();
      expect(result).toBeNull();
    });
  });

  describe('getSalesPlanData', () => {
    it('returns seed data when no active company is set in cookies', async () => {
      vi.spyOn(nextHeaders, 'cookies').mockResolvedValue({
        get: vi.fn().mockReturnValue(undefined),
      } as any);

      const result = await getSalesPlanData();

      expect(result.success).toBe(true);
      expect(result.summary.countries.length).toBeGreaterThan(0);
      expect(result.availableCountries).toContain('Saudi Arabia');
      expect(result.availableCountries).toContain('United Arab Emirates');
      expect(result.filters.uom).toBe('TONNES');
      expect(result.filters.sortBy).toBe('country_asc');
    });

    it('filters by country and shipToParty correctly', async () => {
      vi.spyOn(nextHeaders, 'cookies').mockResolvedValue({
        get: vi.fn().mockReturnValue(undefined),
      } as any);

      const result = await getSalesPlanData({
        country: 'Saudi Arabia',
        shipToParty: 'Carrefour Riyadh Central Logistics Hub',
        uom: 'USD',
      });

      expect(result.success).toBe(true);
      expect(result.summary.countries).toHaveLength(1);
      expect(result.summary.countries[0].country).toBe('Saudi Arabia');
      expect(result.summary.countries[0].shipToGroups).toHaveLength(1);
      expect(result.summary.countries[0].shipToGroups[0].shipToParty).toBe(
        'Carrefour Riyadh Central Logistics Hub'
      );
      expect(result.filters.uom).toBe('USD');
    });

    it('filters by salesOrgId and respects empty results if no match', async () => {
      vi.spyOn(nextHeaders, 'cookies').mockResolvedValue({
        get: vi.fn().mockReturnValue(undefined),
      } as any);

      const result = await getSalesPlanData({
        salesOrgId: 'so-nonexistent',
      });

      expect(result.success).toBe(true);
      expect(result.summary.countries).toHaveLength(0);
    });

    it('sorts countries in descending alphabetical order', async () => {
      vi.spyOn(nextHeaders, 'cookies').mockResolvedValue({
        get: vi.fn().mockReturnValue(undefined),
      } as any);

      const result = await getSalesPlanData({
        sortBy: 'country_desc',
      });

      expect(result.success).toBe(true);
      const countries = result.summary.countries.map((c) => c.country);
      expect(countries[0]).toBe('United Arab Emirates');
      expect(countries[countries.length - 1]).toBe('Jordan');
    });

    it('sorts countries by target in descending order for TONNES and USD', async () => {
      vi.spyOn(nextHeaders, 'cookies').mockResolvedValue({
        get: vi.fn().mockReturnValue(undefined),
      } as any);

      // TONNES target sort
      const resultTonnes = await getSalesPlanData({
        sortBy: 'target_desc',
        uom: 'TONNES',
      });

      expect(resultTonnes.success).toBe(true);
      const firstCountryTonnes = resultTonnes.summary.countries[0];
      const secondCountryTonnes = resultTonnes.summary.countries[1];
      expect(firstCountryTonnes.totals.targetTonnes).toBeGreaterThanOrEqual(
        secondCountryTonnes.totals.targetTonnes
      );

      // USD target sort
      const resultUsd = await getSalesPlanData({
        sortBy: 'target_desc',
        uom: 'USD',
      });

      expect(resultUsd.success).toBe(true);
      const firstCountryUsd = resultUsd.summary.countries[0];
      const secondCountryUsd = resultUsd.summary.countries[1];
      expect(firstCountryUsd.totals.targetUsd).toBeGreaterThanOrEqual(
        secondCountryUsd.totals.targetUsd
      );
    });

    it('retrieves sales plans from prisma database when available', async () => {
      vi.spyOn(nextHeaders, 'cookies').mockResolvedValue({
        get: vi.fn().mockReturnValue({ value: 'comp-1' }),
      } as any);

      vi.mocked(prisma.salesOrganization.findMany).mockResolvedValueOnce([
        { id: 'so-db-1', name: 'DB Sales Org', code: 'SO-DB' } as any,
      ]);

      vi.mocked(prisma.salesPlan.findMany).mockResolvedValueOnce([
        {
          id: 'sp-db-1',
          companyId: 'comp-1',
          salesOrgId: 'so-db-1',
          month: 10,
          year: 2026,
          country: 'Qatar',
          shipToParty: 'Doha Central Cold Store',
          sku: 'AL-BUF-DB-01',
          skuName: 'Buffalo Cube Roll',
          targetTonnes: 100 as any,
          targetUsd: 500000 as any,
          lastMonthBalance: 10 as any,
          shippedTonnes: 70 as any,
          shippedUsd: 350000 as any,
          pipelineTonnes: 30 as any,
          pipelineUsd: 150000 as any,
          updatedAt: new Date(),
        } as any,
      ]);

      const result = await getSalesPlanData({
        month: 10,
        year: 2026,
        salesOrgId: 'so-db-1',
        country: 'Qatar',
        shipToParty: 'Doha Central Cold Store',
      });

      expect(result.success).toBe(true);
      expect(result.availableSalesOrgs).toEqual([
        { id: 'so-db-1', name: 'DB Sales Org', code: 'SO-DB' },
      ]);
      expect(result.summary.countries).toHaveLength(1);
      expect(result.summary.countries[0].country).toBe('Qatar');
      expect(result.summary.countries[0].shipToGroups[0].items[0].sku).toBe('AL-BUF-DB-01');
    });

    it('falls back gracefully to seed data if prisma query fails', async () => {
      vi.spyOn(nextHeaders, 'cookies').mockResolvedValue({
        get: vi.fn().mockReturnValue({ value: 'comp-1' }),
      } as any);

      vi.mocked(prisma.salesOrganization.findMany).mockRejectedValueOnce(
        new Error('DB Connection Refused')
      );
      vi.mocked(prisma.salesPlan.findMany).mockRejectedValueOnce(new Error('DB Query Error'));

      const result = await getSalesPlanData();

      expect(result.success).toBe(true);
      expect(result.summary.countries.length).toBeGreaterThan(0);
    });

    it('catches unexpected critical errors and returns failure response', async () => {
      vi.spyOn(nextHeaders, 'cookies').mockResolvedValue({
        get: vi.fn().mockReturnValue(undefined),
      } as any);

      // Force an error during aggregation or processing
      const calcModule = await import('@/lib/sales-plan-calc');
      vi.spyOn(calcModule, 'aggregateSalesPlan').mockImplementationOnce(() => {
        throw new Error('Fatal calculation crash');
      });

      const result = await getSalesPlanData();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Fatal calculation crash');
      expect(result.summary.countries).toEqual([]);
    });
  });
});
