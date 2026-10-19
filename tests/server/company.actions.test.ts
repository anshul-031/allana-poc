import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getRelatedCompanies,
  getActiveCompanyContext,
  switchCompanyContext,
  getCompanyProfile,
} from '@/server/actions/company.actions';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    company: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    actionLog: {
      create: vi.fn(),
    },
  },
}));

const mockCookieSet = vi.fn();
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockImplementation(() =>
    Promise.resolve({
      set: mockCookieSet,
    })
  ),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Company Server Actions (src/server/actions/company.actions.ts)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getRelatedCompanies', () => {
    it('returns empty array if userId is not provided', async () => {
      const res = await getRelatedCompanies('');
      expect(res).toEqual([]);
    });

    it('returns empty array if user or user.company is not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
      const res = await getRelatedCompanies('u-missing');
      expect(res).toEqual([]);

      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: 'u-no-comp',
        company: null,
      } as any);
      const res2 = await getRelatedCompanies('u-no-comp');
      expect(res2).toEqual([]);
    });

    it('fetches related companies for a subsidiary user (using parentCompanyId)', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: 'u-sub-1',
        company: {
          id: 'comp-sub-uae',
          name: 'LuLu UAE',
          parentCompanyId: 'comp-parent-lulu',
          subsidiaries: [],
        },
      } as any);

      vi.mocked(prisma.company.findMany).mockResolvedValueOnce([
        {
          id: 'comp-parent-lulu',
          name: 'LuLu International Holdings',
          code: 'LULU-HQ',
          country: 'United Arab Emirates',
          region: 'Middle East',
          telephone: '+971-4-111111',
          email: 'hq@lulu.ae',
          parentCompanyId: null,
          managerName: 'Kareem Al-Sayed',
          managerEmail: 'kareem@allana.com',
          managerPhone: '+971-50-1234567',
        },
        {
          id: 'comp-sub-uae',
          name: 'LuLu UAE',
          code: 'LULU-UAE',
          country: 'United Arab Emirates',
          region: 'Middle East',
          telephone: '+971-4-222222',
          email: 'uae@lulu.ae',
          parentCompanyId: 'comp-parent-lulu',
          managerName: 'Kareem Al-Sayed',
          managerEmail: 'kareem@allana.com',
          managerPhone: '+971-50-1234567',
        },
      ] as any);

      const res = await getRelatedCompanies('u-sub-1');
      expect(res).toHaveLength(2);
      expect(res[0].id).toBe('comp-parent-lulu');
      expect(res[0].isParent).toBe(true);
      expect(res[1].id).toBe('comp-sub-uae');
      expect(res[1].isParent).toBe(false);
    });

    it('fetches related companies when user company is itself the parent', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: 'u-parent-1',
        company: {
          id: 'comp-parent-carrefour',
          name: 'Carrefour Group',
          parentCompanyId: null,
          subsidiaries: [],
        },
      } as any);

      vi.mocked(prisma.company.findMany).mockResolvedValueOnce([
        {
          id: 'comp-parent-carrefour',
          name: 'Carrefour Group',
          code: 'CRF-HQ',
          country: 'France',
          region: 'Europe',
          telephone: '+33-1-000000',
          email: 'corp@carrefour.com',
          parentCompanyId: null,
        },
      ] as any);

      const res = await getRelatedCompanies('u-parent-1');
      expect(res).toHaveLength(1);
      expect(res[0].isParent).toBe(true);
    });
  });

  describe('getActiveCompanyContext', () => {
    it('returns null activeCompany if userId is empty', async () => {
      const res = await getActiveCompanyContext('');
      expect(res).toEqual({ activeCompany: null, relatedCompanies: [] });
    });

    it('returns null activeCompany if related companies list is empty', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
      const res = await getActiveCompanyContext('u-empty');
      expect(res).toEqual({ activeCompany: null, relatedCompanies: [] });
    });

    it('returns requested company if it exists in related companies', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: 'u-ctx-1',
        company: {
          id: 'comp-1',
          parentCompanyId: 'comp-1',
        },
      } as any);

      vi.mocked(prisma.company.findMany).mockResolvedValueOnce([
        {
          id: 'comp-1',
          name: 'Company 1',
          code: 'C1',
          country: 'UAE',
          region: 'ME',
          telephone: '123',
          email: 'c1@test.com',
        },
        {
          id: 'comp-2',
          name: 'Company 2',
          code: 'C2',
          country: 'KSA',
          region: 'ME',
          telephone: '456',
          email: 'c2@test.com',
        },
      ] as any);

      const res = await getActiveCompanyContext('u-ctx-1', 'comp-2');
      expect(res.activeCompany?.id).toBe('comp-2');
      expect(res.relatedCompanies).toHaveLength(2);
    });

    it('falls back to first company if requested company ID is not in related list', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: 'u-ctx-1',
        company: {
          id: 'comp-1',
          parentCompanyId: 'comp-1',
        },
      } as any);

      vi.mocked(prisma.company.findMany).mockResolvedValueOnce([
        {
          id: 'comp-1',
          name: 'Company 1',
          code: 'C1',
          country: 'UAE',
          region: 'ME',
          telephone: '123',
          email: 'c1@test.com',
        },
      ] as any);

      const res = await getActiveCompanyContext('u-ctx-1', 'comp-non-existent');
      expect(res.activeCompany?.id).toBe('comp-1');
    });
  });

  describe('switchCompanyContext', () => {
    it('returns error if userId or targetCompanyId is missing', async () => {
      const res1 = await switchCompanyContext('', 'comp-1');
      expect(res1.success).toBe(false);

      const res2 = await switchCompanyContext('u-1', '');
      expect(res2.success).toBe(false);
    });

    it('returns error if user or user company is missing', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
      const res = await switchCompanyContext('u-missing', 'comp-1');
      expect(res.success).toBe(false);
      expect(res.error).toBe('User or primary company not found');
    });

    it('returns error if target company does not exist', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: 'u-1',
        company: { id: 'comp-1' },
      } as any);
      vi.mocked(prisma.company.findUnique).mockResolvedValueOnce(null);

      const res = await switchCompanyContext('u-1', 'comp-missing');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Target company not found');
    });

    it('returns error if user is not authorized to switch to target company', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: 'u-1',
        company: {
          id: 'comp-lulu',
          parentCompanyId: 'comp-lulu-parent',
        },
      } as any);

      // Target belongs to a completely different organization (Carrefour)
      vi.mocked(prisma.company.findUnique).mockResolvedValueOnce({
        id: 'comp-carrefour',
        parentCompanyId: 'comp-carrefour-parent',
      } as any);

      const res = await switchCompanyContext('u-1', 'comp-carrefour');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Unauthorized to switch to this entity');
    });

    it('successfully switches company, sets cookie, logs audit action, and revalidates path', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: 'u-1',
        company: {
          id: 'comp-lulu-uae',
          parentCompanyId: 'comp-lulu-parent',
        },
      } as any);

      vi.mocked(prisma.company.findUnique).mockResolvedValueOnce({
        id: 'comp-lulu-ksa',
        name: 'LuLu Hypermarket Riyadh',
        code: 'LULU-KSA',
        country: 'Saudi Arabia',
        region: 'Middle East',
        telephone: '+966-11-000000',
        email: 'ksa@lulu.com',
        parentCompanyId: 'comp-lulu-parent',
        managerName: 'Kareem Al-Sayed',
        managerEmail: 'kareem@allana.com',
        managerPhone: '+971-50-1234567',
      } as any);

      const res = await switchCompanyContext('u-1', 'comp-lulu-ksa');
      expect(res.success).toBe(true);
      expect(res.activeCompany?.id).toBe('comp-lulu-ksa');
      expect(res.activeCompany?.name).toBe('LuLu Hypermarket Riyadh');
      expect(mockCookieSet).toHaveBeenCalledWith(
        'allana_active_company_id',
        'comp-lulu-ksa',
        expect.objectContaining({ path: '/', maxAge: 86400 * 30 })
      );
      expect(prisma.actionLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          companyId: 'comp-lulu-ksa',
          authorId: 'u-1',
          action: 'COMPANY_SWITCHED',
        }),
      });
      expect(revalidatePath).toHaveBeenCalledWith('/', 'layout');
    });

    it('gracefully handles cookie or revalidatePath throws', async () => {
      vi.mocked(cookies).mockRejectedValueOnce(new Error('Cannot set headers'));
      vi.mocked(revalidatePath).mockImplementationOnce(() => {
        throw new Error('Cache error');
      });

      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: 'u-1',
        company: {
          id: 'comp-lulu-uae',
          parentCompanyId: 'comp-lulu-parent',
        },
      } as any);

      vi.mocked(prisma.company.findUnique).mockResolvedValueOnce({
        id: 'comp-lulu-uae',
        name: 'LuLu Hypermarket Dubai',
        code: 'LULU-UAE',
        country: 'United Arab Emirates',
        region: 'Middle East',
        telephone: '+971-4-000000',
        email: 'dubai@lulu.com',
        parentCompanyId: 'comp-lulu-parent',
      } as any);

      const res = await switchCompanyContext('u-1', 'comp-lulu-uae');
      expect(res.success).toBe(true);
      expect(res.activeCompany?.id).toBe('comp-lulu-uae');
    });
  });

  describe('getCompanyProfile', () => {
    it('returns null if companyId is empty or falsy', async () => {
      const res = await getCompanyProfile('');
      expect(res).toBeNull();
    });

    it('returns null if company is not found in database', async () => {
      vi.mocked(prisma.company.findUnique).mockResolvedValueOnce(null);
      const res = await getCompanyProfile('comp-not-found');
      expect(res).toBeNull();
    });

    it('returns formatted company profile if company exists', async () => {
      vi.mocked(prisma.company.findUnique).mockResolvedValueOnce({
        id: 'comp-profile-1',
        name: 'LuLu Hypermarket UAE',
        code: 'LULU-UAE',
        country: 'United Arab Emirates',
        region: 'Middle East',
        telephone: '+971-4-1234567',
        email: 'info@lulu.ae',
        parentCompanyId: null,
        managerName: 'Kareem Al-Sayed',
        managerEmail: 'kareem@allana.com',
        managerPhone: '+971-50-1234567',
      } as any);

      const res = await getCompanyProfile('comp-profile-1');
      expect(res).not.toBeNull();
      expect(res?.id).toBe('comp-profile-1');
      expect(res?.name).toBe('LuLu Hypermarket UAE');
      expect(res?.isParent).toBe(true);
      expect(res?.managerName).toBe('Kareem Al-Sayed');
    });
  });
});
