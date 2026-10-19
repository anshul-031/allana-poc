import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getStatementOfAccount,
  getReceivablesAging,
  dispatchReportEmail,
  getActiveCompanyIdFromCookies,
} from '@/server/actions/reports.actions';
import { prisma } from '@/lib/prisma';
import * as nextHeaders from 'next/headers';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    company: {
      findUnique: vi.fn(),
    },
    user: {
      findFirst: vi.fn(),
    },
    actionLog: {
      create: vi.fn(),
    },
  },
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

describe('Financial Reports Server Actions (FEAT-7.1, FEAT-7.2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getActiveCompanyIdFromCookies', () => {
    it('returns company id when cookie exists', async () => {
      vi.spyOn(nextHeaders, 'cookies').mockResolvedValue({
        get: vi.fn().mockReturnValue({ value: 'comp-101' }),
      } as any);

      const res = await getActiveCompanyIdFromCookies();
      expect(res).toBe('comp-101');
    });

    it('returns null when cookie is absent or cookies() throws', async () => {
      vi.spyOn(nextHeaders, 'cookies').mockResolvedValue({
        get: vi.fn().mockReturnValue(undefined),
      } as any);

      const res = await getActiveCompanyIdFromCookies();
      expect(res).toBeNull();

      vi.spyOn(nextHeaders, 'cookies').mockRejectedValue(new Error('Cookie store failure'));
      const resError = await getActiveCompanyIdFromCookies();
      expect(resError).toBeNull();
    });
  });

  describe('getStatementOfAccount', () => {
    it('returns statement data with defaults when no company cookie is found', async () => {
      vi.spyOn(nextHeaders, 'cookies').mockResolvedValue({
        get: vi.fn().mockReturnValue(undefined),
      } as any);

      const result = await getStatementOfAccount();

      expect(result.success).toBe(true);
      expect(result.statement).toBeDefined();
      expect(result.statement?.companyName).toBe('Global Foods Trading LLC');
      expect(result.statement?.transactions.length).toBeGreaterThan(0);
      expect(result.statement?.closingBalanceUsd).toBeGreaterThan(0);
    });

    it('fetches company details from database when company cookie is present', async () => {
      vi.spyOn(nextHeaders, 'cookies').mockResolvedValue({
        get: vi.fn().mockReturnValue({ value: 'comp-101' }),
      } as any);

      vi.mocked(prisma.company.findUnique).mockResolvedValueOnce({
        name: 'LuLu Saudi Hypermarkets Co.',
        code: 'COMP-LULU-SA',
        email: 'accounts@luluhypermarket.com',
      } as any);

      const result = await getStatementOfAccount({
        fromDate: '2026-10-01',
        toDate: '2026-10-10',
      });

      expect(result.success).toBe(true);
      expect(result.statement?.companyName).toBe('LuLu Saudi Hypermarkets Co.');
      expect(result.statement?.primaryEmail).toBe('accounts@luluhypermarket.com');
      expect(result.statement?.fromDate).toBe('2026-10-01');
      expect(result.statement?.toDate).toBe('2026-10-10');
    });

    it('catches unexpected critical errors and returns failure response', async () => {
      vi.spyOn(nextHeaders, 'cookies').mockResolvedValue({
        get: vi.fn().mockReturnValue({ value: 'comp-101' }),
      } as any);

      vi.mocked(prisma.company.findUnique).mockRejectedValueOnce(
        new Error('Critical crash')
      );

      const result = await getStatementOfAccount();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Critical crash');
      expect(result.statement).toBeNull();
    });
  });

  describe('getReceivablesAging', () => {
    it('returns aging schedule for specified asOfDate', async () => {
      vi.spyOn(nextHeaders, 'cookies').mockResolvedValue({
        get: vi.fn().mockReturnValue(undefined),
      } as any);

      const result = await getReceivablesAging({ asOfDate: '2026-10-20' });

      expect(result.success).toBe(true);
      expect(result.aging).toBeDefined();
      expect(result.aging?.asOfDate).toBe('2026-10-20');
      expect(result.aging?.buckets).toHaveLength(5);
      expect(result.primaryEmail).toBe('procurement@globalfoods.com');
    });

    it('fetches primary email from company database if available', async () => {
      vi.spyOn(nextHeaders, 'cookies').mockResolvedValue({
        get: vi.fn().mockReturnValue({ value: 'comp-101' }),
      } as any);

      vi.mocked(prisma.company.findUnique).mockResolvedValueOnce({
        email: 'finance@carrefour-ksa.com',
      } as any);

      const result = await getReceivablesAging();

      expect(result.success).toBe(true);
      expect(result.primaryEmail).toBe('finance@carrefour-ksa.com');
    });

    it('catches unexpected exceptions during aging calculation', async () => {
      const calcModule = await import('@/lib/aging-calc');
      vi.spyOn(calcModule, 'calculateReceivablesAging').mockImplementationOnce(() => {
        throw new Error('Aging math crash');
      });

      const result = await getReceivablesAging();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Aging math crash');
      expect(result.aging).toBeNull();
    });
  });

  describe('dispatchReportEmail', () => {
    it('dispatches statement email and records action log audit entry', async () => {
      vi.spyOn(nextHeaders, 'cookies').mockResolvedValue({
        get: vi.fn().mockReturnValue({ value: 'comp-101' }),
      } as any);

      vi.mocked(prisma.company.findUnique).mockResolvedValueOnce({
        name: 'Al-Madina Hypermarket',
        email: 'almadina@partner.com',
      } as any);

      vi.mocked(prisma.user.findFirst).mockResolvedValueOnce({
        id: 'usr-1',
        companyId: 'comp-101',
      } as any);

      vi.mocked(prisma.actionLog.create).mockResolvedValueOnce({ id: 'log-1' } as any);

      const result = await dispatchReportEmail({
        reportType: 'STATEMENT_OF_ACCOUNT',
        fromDate: '2026-10-01',
        toDate: '2026-10-31',
        additionalEmail: 'audit@almadina.com',
      });

      expect(result.success).toBe(true);
      expect(result.recipients).toContain('almadina@partner.com');
      expect(result.recipients).toContain('audit@almadina.com');
      expect(prisma.actionLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'EXPORT_REPORT',
            companyId: 'comp-101',
          }),
        })
      );
    });

    it('handles author null and actionLog create exception without failing email dispatch', async () => {
      vi.spyOn(nextHeaders, 'cookies').mockResolvedValue({
        get: vi.fn().mockReturnValue({ value: 'comp-101' }),
      } as any);

      vi.mocked(prisma.company.findUnique).mockResolvedValueOnce({
        name: 'Al-Madina',
        email: 'almadina@partner.com',
      } as any);
      vi.mocked(prisma.user.findFirst).mockResolvedValueOnce(null);

      const res1 = await dispatchReportEmail({
        reportType: 'STATEMENT_OF_ACCOUNT',
      });
      expect(res1.success).toBe(true);

      vi.mocked(prisma.company.findUnique).mockResolvedValueOnce({
        name: 'Al-Madina',
        email: 'almadina@partner.com',
      } as any);
      vi.mocked(prisma.user.findFirst).mockResolvedValueOnce({ id: 'usr-1' } as any);
      vi.mocked(prisma.actionLog.create).mockRejectedValueOnce(new Error('DB failure'));

      const res2 = await dispatchReportEmail({
        reportType: 'STATEMENT_OF_ACCOUNT',
      });
      expect(res2.success).toBe(true);
    });

    it('dispatches receivables aging report email with asOfDate', async () => {
      vi.spyOn(nextHeaders, 'cookies').mockResolvedValue({
        get: vi.fn().mockReturnValue(undefined),
      } as any);

      const result = await dispatchReportEmail({
        reportType: 'RECEIVABLES_AGING',
        asOfDate: '2026-10-15',
      });

      expect(result.success).toBe(true);
      expect(result.recipients).toContain('procurement@globalfoods.com');
    });

    it('handles failure when primary email is invalid', async () => {
      vi.spyOn(nextHeaders, 'cookies').mockResolvedValue({
        get: vi.fn().mockReturnValue({ value: 'comp-101' }),
      } as any);

      vi.mocked(prisma.company.findUnique).mockResolvedValueOnce({
        name: 'Broken Partner',
        email: 'invalid-email',
      } as any);

      const result = await dispatchReportEmail({
        reportType: 'STATEMENT_OF_ACCOUNT',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid primary email');
    });

    it('proceeds successfully even if actionLog.create rejects during dispatch', async () => {
      vi.spyOn(nextHeaders, 'cookies').mockResolvedValue({
        get: vi.fn().mockReturnValue({ value: 'comp-101' }),
      } as any);

      vi.mocked(prisma.company.findUnique).mockResolvedValueOnce({
        name: 'Al-Madina Hypermarket',
        email: 'almadina@partner.com',
      } as any);

      vi.mocked(prisma.actionLog.create).mockRejectedValueOnce(new Error('Log write failure'));

      // Also omit fromDate/toDate to test default fallback period label
      const result = await dispatchReportEmail({
        reportType: 'STATEMENT_OF_ACCOUNT',
      });

      expect(result.success).toBe(true);
      expect(result.recipients).toContain('almadina@partner.com');
    });

    it('catches top-level unexpected errors gracefully', async () => {
      vi.spyOn(nextHeaders, 'cookies').mockResolvedValue({
        get: vi.fn().mockReturnValue({ value: 'comp-101' }),
      } as any);

      vi.mocked(prisma.company.findUnique).mockRejectedValueOnce(
        new Error('Dispatch system crashed')
      );

      const result = await dispatchReportEmail({
        reportType: 'STATEMENT_OF_ACCOUNT',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Dispatch system crashed');
    });
  });
});
