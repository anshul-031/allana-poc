import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import {
  createCustomProductRequest,
  getCustomProductRequests,
  getCustomProductRequestById,
  generateNpdRequestNumber,
  getActiveCompanyIdFromCookies,
} from '@/server/actions/npd.actions';
import { CreateCustomProductInput } from '@/server/validators/npd.schema';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    customProductRequest: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
    },
    company: {
      findFirst: vi.fn(),
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

const mockValidInput: CreateCustomProductInput = {
  categoryName: 'Frozen Buffalo Meat',
  targetCountry: 'Saudi Arabia',
  cutSpecification: 'Frozen boneless buffalo topside 95VL with fat trimmed to max 5mm',
  recipeNotes: 'Vacuum packed with food-grade barrier shrink film, unseasoned',
  packagingFormat: '450g retail vacuum block',
  individualPackagingWeight: '450g',
  freezingType: 'BLOCK_FROZEN',
  estimatedFcaPricePerTon: 4800,
  targetVolumeMt: 54,
  targetPriceUsd: 259200,
  isCalibrated: true,
  isMarinated: false,
  isBoneless: true,
  isSkinless: true,
  hasSpecification: true,
  additionalComments: 'Halal certified according to SFDA export standards',
  attachmentUrl: 'https://r2.allana.com/specs/custom-topside-spec.pdf',
};

const mockDbRecord = {
  id: 'npd-rec-001',
  requestNumber: 'NPD-2026-001',
  companyId: 'company-lulu-123',
  createdById: 'user-ahmed-456',
  categoryName: 'Frozen Buffalo Meat',
  targetCountry: 'Saudi Arabia',
  cutSpecification: 'Frozen boneless buffalo topside 95VL with fat trimmed to max 5mm',
  recipeNotes: 'Vacuum packed with food-grade barrier shrink film, unseasoned',
  packagingFormat: '450g retail vacuum block',
  individualPackagingWeight: '450g',
  freezingType: 'BLOCK_FROZEN',
  estimatedFcaPricePerTon: '4800.00',
  targetVolumeMt: '54.00',
  targetPriceUsd: '259200.00',
  isCalibrated: true,
  isMarinated: false,
  isBoneless: true,
  isSkinless: true,
  hasSpecification: true,
  additionalComments: 'Halal certified according to SFDA export standards',
  attachmentUrl: 'https://r2.allana.com/specs/custom-topside-spec.pdf',
  status: 'IN_REVIEW',
  managerComments: null,
  createdAt: new Date('2026-03-15T10:00:00.000Z'),
  updatedAt: new Date('2026-03-15T10:00:00.000Z'),
  company: { name: 'LuLu Hypermarket KSA' },
  createdBy: { firstName: 'Ahmed', lastName: 'Al-Harbi' },
};

describe('NPD Server Actions (src/server/actions/npd.actions.ts)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getActiveCompanyIdFromCookies', () => {
    it('returns cookie value when cookie exists', async () => {
      vi.mocked(cookies).mockResolvedValueOnce({
        get: vi.fn().mockReturnValue({ value: 'comp-cookie-123' }),
      } as any);

      const id = await getActiveCompanyIdFromCookies();
      expect(id).toBe('comp-cookie-123');
    });

    it('returns null when cookie does not exist', async () => {
      vi.mocked(cookies).mockResolvedValueOnce({
        get: vi.fn().mockReturnValue(undefined),
      } as any);

      const id = await getActiveCompanyIdFromCookies();
      expect(id).toBeNull();
    });

    it('returns null when cookies() throws an exception', async () => {
      vi.mocked(cookies).mockRejectedValueOnce(new Error('Outside request context'));

      const id = await getActiveCompanyIdFromCookies();
      expect(id).toBeNull();
    });
  });

  describe('generateNpdRequestNumber', () => {
    it('generates sequential ticket number padded to 3 digits', async () => {
      vi.mocked(prisma.customProductRequest.count).mockResolvedValueOnce(0);
      const year = new Date().getFullYear();
      const num1 = await generateNpdRequestNumber();
      expect(num1).toBe(`NPD-${year}-001`);

      vi.mocked(prisma.customProductRequest.count).mockResolvedValueOnce(15);
      const num2 = await generateNpdRequestNumber();
      expect(num2).toBe(`NPD-${year}-016`);
    });
  });

  describe('createCustomProductRequest', () => {
    it('successfully creates an NPD request with provided companyId and authorId', async () => {
      vi.mocked(prisma.customProductRequest.count).mockResolvedValueOnce(0);
      vi.mocked(prisma.customProductRequest.create).mockResolvedValueOnce(mockDbRecord as any);
      vi.mocked(prisma.actionLog.create).mockResolvedValueOnce({} as any);

      const res = await createCustomProductRequest(mockValidInput, {
        companyId: 'company-lulu-123',
        authorId: 'user-ahmed-456',
      });

      expect(res.success).toBe(true);
      expect(res.request).not.toBeNull();
      expect(res.request?.requestNumber).toBe('NPD-2026-001');
      expect(res.request?.estimatedFcaPricePerTon).toBe(4800);
      expect(res.request?.status).toBe('IN_REVIEW');
      expect(prisma.actionLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            companyId: 'company-lulu-123',
            authorId: 'user-ahmed-456',
            action: 'CREATE_NPD_REQUEST',
          }),
        })
      );
    });

    it('falls back to database company and user when context IDs not provided', async () => {
      vi.mocked(cookies).mockResolvedValueOnce({
        get: vi.fn().mockReturnValue(undefined),
      } as any);
      vi.mocked(prisma.company.findFirst).mockResolvedValueOnce({ id: 'comp-fallback' } as any);
      vi.mocked(prisma.user.findFirst).mockResolvedValueOnce({ id: 'user-fallback' } as any);
      vi.mocked(prisma.customProductRequest.count).mockResolvedValueOnce(2);
      vi.mocked(prisma.customProductRequest.create).mockResolvedValueOnce({
        ...mockDbRecord,
        companyId: 'comp-fallback',
        createdById: 'user-fallback',
      } as any);
      vi.mocked(prisma.actionLog.create).mockResolvedValueOnce({} as any);

      const res = await createCustomProductRequest(mockValidInput);

      expect(res.success).toBe(true);
      expect(prisma.company.findFirst).toHaveBeenCalled();
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { companyId: 'comp-fallback' },
      });
    });

    it('returns error when no active company can be found in system', async () => {
      vi.mocked(cookies).mockResolvedValueOnce({
        get: vi.fn().mockReturnValue(undefined),
      } as any);
      vi.mocked(prisma.company.findFirst).mockResolvedValueOnce(null);

      const res = await createCustomProductRequest(mockValidInput);

      expect(res.success).toBe(false);
      expect(res.error).toBe('No active company found');
    });

    it('returns error when no authorized user can be found for company', async () => {
      vi.mocked(cookies).mockResolvedValueOnce({
        get: vi.fn().mockReturnValue({ value: 'comp-existing' }),
      } as any);
      vi.mocked(prisma.user.findFirst).mockResolvedValueOnce(null);

      const res = await createCustomProductRequest(mockValidInput);

      expect(res.success).toBe(false);
      expect(res.error).toBe('No authorized user found');
    });

    it('fails validation when required fields are missing or invalid', async () => {
      const invalidInput: any = {
        ...mockValidInput,
        cutSpecification: 'shrt', // less than 5 chars
        estimatedFcaPricePerTon: -100, // must be positive
      };

      const res = await createCustomProductRequest(invalidInput, {
        companyId: 'comp-1',
        authorId: 'user-1',
      });

      expect(res.success).toBe(false);
      expect(res.error).toBeDefined();
    });

    it('handles unexpected database Error', async () => {
      vi.mocked(prisma.customProductRequest.count).mockRejectedValueOnce(
        new Error('Database write conflict')
      );

      const res = await createCustomProductRequest(mockValidInput, {
        companyId: 'comp-1',
        authorId: 'user-1',
      });

      expect(res.success).toBe(false);
      expect(res.error).toBe('Database write conflict');
    });

    it('handles unexpected non-Error thrown in createCustomProductRequest', async () => {
      vi.mocked(prisma.customProductRequest.count).mockRejectedValueOnce('raw string error');

      const res = await createCustomProductRequest(mockValidInput, {
        companyId: 'comp-1',
        authorId: 'user-1',
      });

      expect(res.success).toBe(false);
      expect(res.error).toBe('Failed to create customized product request');
    });
  });

  describe('getCustomProductRequests', () => {
    it('returns all customized product requests for company', async () => {
      vi.mocked(prisma.customProductRequest.findMany).mockResolvedValueOnce([mockDbRecord] as any);

      const res = await getCustomProductRequests({ companyId: 'company-lulu-123' });

      expect(res.success).toBe(true);
      expect(res.requests).toHaveLength(1);
      expect(res.total).toBe(1);
      expect(res.requests[0].requestNumber).toBe('NPD-2026-001');
      expect(res.requests[0].createdByName).toBe('Ahmed Al-Harbi');
    });

    it('filters by status when valid status provided', async () => {
      vi.mocked(prisma.customProductRequest.findMany).mockResolvedValueOnce([]);

      await getCustomProductRequests({
        companyId: 'company-lulu-123',
        status: 'ANALYSIS',
      });

      expect(prisma.customProductRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'ANALYSIS',
          }),
        })
      );
    });

    it('ignores status filter when status is ALL or invalid', async () => {
      vi.mocked(prisma.customProductRequest.findMany).mockResolvedValueOnce([]);

      await getCustomProductRequests({
        companyId: 'company-lulu-123',
        status: 'ALL',
      });

      expect(prisma.customProductRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { companyId: 'company-lulu-123' },
        })
      );
    });

    it('filters by search term against request number, category, or specification', async () => {
      vi.mocked(prisma.customProductRequest.findMany).mockResolvedValueOnce([]);

      await getCustomProductRequests({
        companyId: 'company-lulu-123',
        search: 'topside',
      });

      expect(prisma.customProductRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { requestNumber: { contains: 'topside', mode: 'insensitive' } },
              { categoryName: { contains: 'topside', mode: 'insensitive' } },
              { cutSpecification: { contains: 'topside', mode: 'insensitive' } },
            ],
          }),
        })
      );
    });

    it('handles null author name gracefully in mapToDTO', async () => {
      const recordNoAuthor = {
        ...mockDbRecord,
        createdBy: null,
      };

      vi.mocked(prisma.customProductRequest.findMany).mockResolvedValueOnce([recordNoAuthor] as any);

      const res = await getCustomProductRequests({ companyId: 'company-lulu-123' });
      expect(res.success).toBe(true);
      expect(res.requests[0].createdByName).toBe('Portal User');
    });

    it('handles database error in getCustomProductRequests', async () => {
      vi.mocked(prisma.customProductRequest.findMany).mockRejectedValueOnce(
        new Error('Timeout connecting to DB')
      );

      const res = await getCustomProductRequests();
      expect(res.success).toBe(false);
      expect(res.requests).toHaveLength(0);
      expect(res.error).toBe('Timeout connecting to DB');
    });

    it('handles non-Error thrown in getCustomProductRequests', async () => {
      vi.mocked(prisma.customProductRequest.findMany).mockRejectedValueOnce('raw error');

      const res = await getCustomProductRequests();
      expect(res.success).toBe(false);
      expect(res.error).toBe('Failed to fetch customized product requests');
    });
  });

  describe('getCustomProductRequestById', () => {
    it('returns error when id is empty or whitespace', async () => {
      const res = await getCustomProductRequestById('   ');
      expect(res.success).toBe(false);
      expect(res.request).toBeNull();
      expect(res.error).toBe('Request ID is required');
    });

    it('returns error when request record is not found', async () => {
      vi.mocked(prisma.customProductRequest.findUnique).mockResolvedValueOnce(null);

      const res = await getCustomProductRequestById('npd-non-existent');
      expect(res.success).toBe(false);
      expect(res.request).toBeNull();
      expect(res.error).toBe('Request not found');
    });

    it('returns error when companyId mismatch (access denied)', async () => {
      vi.mocked(prisma.customProductRequest.findUnique).mockResolvedValueOnce(mockDbRecord as any);

      const res = await getCustomProductRequestById('npd-rec-001', {
        companyId: 'different-company-789',
      });

      expect(res.success).toBe(false);
      expect(res.request).toBeNull();
      expect(res.error).toBe('Access denied to this request');
    });

    it('returns request DTO when found and authorized', async () => {
      vi.mocked(prisma.customProductRequest.findUnique).mockResolvedValueOnce(mockDbRecord as any);

      const res = await getCustomProductRequestById('npd-rec-001', {
        companyId: 'company-lulu-123',
      });

      expect(res.success).toBe(true);
      expect(res.request).not.toBeNull();
      expect(res.request?.id).toBe('npd-rec-001');
      expect(res.request?.requestNumber).toBe('NPD-2026-001');
      expect(res.request?.companyName).toBe('LuLu Hypermarket KSA');
    });

    it('creates an NPD request with optional fields omitted or null', async () => {
      const minimalPayload: CreateCustomProductInput = {
        categoryName: 'Frozen Buffalo Meat',
        targetCountry: 'Saudi Arabia',
        cutSpecification: 'Boneless buffalo topside 95VL',
        packagingFormat: 'Master Carton',
        individualPackagingWeight: '20kg',
        freezingType: 'BLOCK_FROZEN',
        isCalibrated: false,
        isMarinated: false,
        isBoneless: false,
        isSkinless: false,
        hasSpecification: false,
      };

      vi.mocked(prisma.customProductRequest.count).mockResolvedValueOnce(0);
      vi.mocked(prisma.customProductRequest.create).mockResolvedValueOnce({
        ...mockDbRecord,
        recipeNotes: null,
        estimatedFcaPricePerTon: null,
        targetVolumeMt: null,
        targetPriceUsd: null,
        additionalComments: null,
        attachmentUrl: null,
        company: null,
        createdBy: { firstName: '', lastName: '' },
      } as any);
      vi.mocked(prisma.actionLog.create).mockResolvedValueOnce({} as any);

      const res = await createCustomProductRequest(minimalPayload, {
        companyId: 'company-lulu-123',
        authorId: 'user-ahmed-456',
      });

      expect(res.success).toBe(true);
      expect(res.request?.companyName).toBe('Company');
      expect(res.request?.createdByName).toBe('Portal User');
      expect(res.request?.recipeNotes).toBeNull();
      expect(res.request?.estimatedFcaPricePerTon).toBeNull();
    });

    it('handles Error thrown in getCustomProductRequestById', async () => {
      vi.mocked(prisma.customProductRequest.findUnique).mockRejectedValueOnce(
        new Error('Query error')
      );

      const res = await getCustomProductRequestById('npd-rec-001');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Query error');
    });

    it('returns error when id is empty string or undefined', async () => {
      const res1 = await getCustomProductRequestById('');
      expect(res1.success).toBe(false);
      expect(res1.error).toBe('Request ID is required');

      const res2 = await getCustomProductRequestById(undefined as any);
      expect(res2.success).toBe(false);
      expect(res2.error).toBe('Request ID is required');
    });

    it('resolves active company from cookies when options is omitted', async () => {
      vi.mocked(cookies).mockResolvedValueOnce({
        get: vi.fn().mockReturnValue({ value: 'company-lulu-123' }),
      } as any);
      vi.mocked(prisma.customProductRequest.findUnique).mockResolvedValueOnce(mockDbRecord as any);

      const res = await getCustomProductRequestById('npd-rec-001');
      expect(res.success).toBe(true);
    });

    it('handles non-Error thrown in getCustomProductRequestById', async () => {
      vi.mocked(prisma.customProductRequest.findUnique).mockRejectedValueOnce('raw db failure');

      const res = await getCustomProductRequestById('npd-rec-001');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Failed to fetch request');
    });
  });
});
