import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as financialsActions from '@/server/actions/financials.actions';
import { formatCurrencyAmount } from '@/lib/utils';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    companyFinancial: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

describe('financials.actions Server Actions (FEAT-2.2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('formatCurrencyAmount', () => {
    it('formats positive and negative amounts with thousand separators and ISO currency code', () => {
      expect(formatCurrencyAmount(1079500)).toBe('$1,079,500.00 USD');
      expect(formatCurrencyAmount(-272796.96)).toBe('-$272,796.96 USD');
      expect(formatCurrencyAmount(0)).toBe('$0.00 USD');
      expect(formatCurrencyAmount(450.5, 'EUR')).toBe('$450.50 EUR');
    });
  });


  describe('getActiveCompanyIdFromCookies', () => {
    it('returns company ID from cookie store', async () => {
      vi.mocked(cookies).mockResolvedValue({
        get: vi.fn().mockReturnValue({ value: 'comp-cookie-123' }),
      } as any);

      const id = await financialsActions.getActiveCompanyIdFromCookies();
      expect(id).toBe('comp-cookie-123');
    });

    it('returns null if cookie is missing', async () => {
      vi.mocked(cookies).mockResolvedValue({
        get: vi.fn().mockReturnValue(undefined),
      } as any);

      const id = await financialsActions.getActiveCompanyIdFromCookies();
      expect(id).toBeNull();
    });

    it('returns null if cookies() throws an error', async () => {
      vi.mocked(cookies).mockRejectedValue(new Error('Headers unavailable'));

      const id = await financialsActions.getActiveCompanyIdFromCookies();
      expect(id).toBeNull();
    });
  });

  describe('getCompanyFinancials', () => {
    it('returns error if no company ID is provided and no cookie exists', async () => {
      vi.mocked(cookies).mockResolvedValue({
        get: vi.fn().mockReturnValue(undefined),
      } as any);

      const res = await financialsActions.getCompanyFinancials();
      expect(res.success).toBe(false);
      expect(res.error).toContain('No active company context selected');
    });

    it('returns empty financials when company has no financial records', async () => {
      vi.mocked(prisma.companyFinancial.findMany).mockResolvedValue([]);

      const res = await financialsActions.getCompanyFinancials({ companyId: 'comp-empty' });
      expect(res.success).toBe(true);
      expect(res.financials).toBeNull();
      expect(res.availableSalesOrgs).toEqual([]);
    });

    it('successfully retrieves financial indicators with default first sales organization', async () => {
      const mockRecords = [
        {
          id: 'cf-1',
          companyId: 'comp-1',
          salesOrgId: 'so-1',
          creditLimit: 2500000,
          receivables: 1420500,
          overdueReceivables: 185000,
          availableLimit: 1079500,
          updatedAt: new Date('2026-10-18T12:00:00Z'),
          salesOrganization: {
            id: 'so-1',
            code: 'SO-1010',
            name: 'Allana Frozen Buffalo Meat Division',
            currency: 'USD',
          },
        },
        {
          id: 'cf-2',
          companyId: 'comp-1',
          salesOrgId: 'so-2',
          creditLimit: 500000,
          receivables: 650000,
          overdueReceivables: 120000,
          availableLimit: -150000, // Deficit!
          updatedAt: new Date('2026-10-18T12:00:00Z'),
          salesOrganization: {
            id: 'so-2',
            code: 'SO-2020',
            name: 'IRAPL Retail & Consumer Pack Division',
            currency: 'USD',
          },
        },
      ];

      vi.mocked(prisma.companyFinancial.findMany).mockResolvedValue(mockRecords as any);

      const res = await financialsActions.getCompanyFinancials({ companyId: 'comp-1' });
      expect(res.success).toBe(true);
      expect(res.availableSalesOrgs).toHaveLength(2);
      expect(res.selectedSalesOrgId).toBe('so-1');
      expect(res.financials).not.toBeNull();
      expect(res.financials?.creditLimit).toBe(2500000);
      expect(res.financials?.availableLimit).toBe(1079500);
      expect(res.financials?.isDeficit).toBe(false);
    });

    it('correctly identifies negative availableLimit as isDeficit when specific salesOrgId requested', async () => {
      const mockRecords = [
        {
          id: 'cf-1',
          companyId: 'comp-1',
          salesOrgId: 'so-1',
          creditLimit: 2500000,
          receivables: 1420500,
          overdueReceivables: 0,
          availableLimit: 1079500,
          updatedAt: new Date('2026-10-18T12:00:00Z'),
          salesOrganization: {
            id: 'so-1',
            code: 'SO-1010',
            name: 'Allana Frozen Buffalo Meat Division',
            currency: 'USD',
          },
        },
        {
          id: 'cf-2',
          companyId: 'comp-1',
          salesOrgId: 'so-2',
          creditLimit: 500000,
          receivables: 772796.96,
          overdueReceivables: 272796.96,
          availableLimit: -272796.96, // Deficit!
          updatedAt: new Date('2026-10-18T12:00:00Z'),
          salesOrganization: {
            id: 'so-2',
            code: 'SO-2020',
            name: 'IRAPL Retail Division',
            currency: 'USD',
          },
        },
      ];

      vi.mocked(prisma.companyFinancial.findMany).mockResolvedValue(mockRecords as any);

      const res = await financialsActions.getCompanyFinancials({
        companyId: 'comp-1',
        salesOrgId: 'so-2',
      });

      expect(res.success).toBe(true);
      expect(res.selectedSalesOrgId).toBe('so-2');
      expect(res.financials?.availableLimit).toBe(-272796.96);
      expect(res.financials?.isDeficit).toBe(true);
    });

    it('handles database exceptions gracefully and returns error', async () => {
      vi.mocked(prisma.companyFinancial.findMany).mockRejectedValue(new Error('Connection failure'));

      const res = await financialsActions.getCompanyFinancials({ companyId: 'comp-1' });
      expect(res.success).toBe(false);
      expect(res.error).toBe('Connection failure');
    });

    it('handles non-Error database exceptions gracefully', async () => {
      vi.mocked(prisma.companyFinancial.findMany).mockRejectedValue('Fatal DB string');

      const res = await financialsActions.getCompanyFinancials({ companyId: 'comp-1' });
      expect(res.success).toBe(false);
      expect(res.error).toBe('Failed to fetch financial indicators');
    });
  });
});
