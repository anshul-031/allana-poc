import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import {
  getActiveCompanyIdFromCookies,
  generateClaimNumber,
  mapClaimToDTO,
  mapProductItemToDTO,
  mapAttachmentToDTO,
  getClaimsList,
  getClaimDetails,
  lookupProductByArticle,
  submitQualityClaim,
  submitInfoRequest,
  getClaimAttachmentPresignedUrl,
  getClaimantProfile,
} from '@/server/actions/claims.actions';
import {
  qualityClaimSchema,
  infoRequestSchema,
  QualityClaimInput,
  InfoRequestInput,
} from '@/server/validators/claim.schema';
import { createPresignedDownloadUrl } from '@/lib/r2';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    claim: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
    },
    claimAttachment: {
      findUnique: vi.fn(),
    },
    company: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
    },
    user: {
      findFirst: vi.fn(),
    },
    product: {
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

vi.mock('@/lib/r2', () => ({
  createPresignedDownloadUrl: vi.fn(),
}));

const mockQualityInput: QualityClaimInput = {
  subject: 'Temperature Deviation & Damaged Cartons in Container MSKU9482710',
  categoryOfRequest: 'Quality Defect',
  supplierName: 'Allana Cold Storage Plant 4, Mumbai',
  invoiceNumber: 'INV-2026-9021',
  containerNumber: 'MSKU9482710',
  country: 'Saudi Arabia',
  description: 'Upon unsealing container at Dammam Port, boxes in bay 3 were found deformed with ice crystallization.',
  additionalEmails: 'qa@luluhypermarket.com; logistics@luluhypermarket.com',
  products: [
    {
      productArticle: '7940',
      productName: 'Frozen Boneless Buffalo Topside 20kg',
      producerName: 'Allana Foods India Pvt Ltd',
      country: 'India',
      productionDate: '2026-01-15',
      lotNumber: 'LOT-2026-B91',
      vehicleNumber: 'TRUCK-MH-04-1290',
      nonConformWeightKg: 1420.5,
      receivedQuantityKg: 5000,
    },
  ],
  attachmentKeys: ['claims/evidence/damage-photo-1.jpg', 'claims/evidence/logger-data.csv'],
};

const mockInfoInput: InfoRequestInput = {
  subject: 'Request for SFDA Halal Certificate and Product Specification',
  infoCategory: 'DOCS_SPECIFICATION',
  targetCountry: 'Saudi Arabia',
  supplierName: 'Allana Plant 2',
  productArticle: '7940',
  productName: 'Frozen Boneless Buffalo Topside',
  orderNumber: 'ORD-2026-781',
  containerNumber: 'MSKU9482710',
  description: 'Required by customs clearance authorities for SFDA import declaration.',
  additionalEmails: 'customs@luluhypermarket.com',
  attachmentKeys: ['claims/requests/sfda-blank-form.pdf'],
};

const mockDbClaim = {
  id: 'clm-uuid-001',
  claimNumber: 'CLM-2026-0001',
  companyId: 'company-lulu-123',
  submittedById: 'user-ahmed-456',
  type: 'CLAIM',
  status: 'REGISTERED',
  subject: 'Temperature Deviation & Damaged Cartons',
  categoryOfRequest: 'Quality Defect',
  supplierName: 'Allana Cold Storage Plant 4',
  infoCategory: null,
  targetCountry: 'Saudi Arabia',
  requestedShelfLifeDate: null,
  reasonForShelfLifeExtension: null,
  shelfLifeExtensionVolumeKg: null,
  shipmentId: 'ship-001',
  containerNumber: 'MSKU9482710',
  invoiceNumber: 'INV-2026-9021',
  deliveryDate: new Date('2026-02-20T00:00:00Z'),
  description: 'Cartons deformed with ice crystallization',
  additionalEmails: 'qa@luluhypermarket.com',
  companyResponse: null,
  resolvedAt: null,
  createdAt: new Date('2026-02-21T10:00:00Z'),
  updatedAt: new Date('2026-02-21T10:00:00Z'),
  company: { name: 'LuLu Hypermarket KSA' },
  submittedBy: { firstName: 'Ahmed', lastName: 'Al-Harbi', email: 'ahmed@lulu.com' },
  products: [
    {
      id: 'prod-item-1',
      claimId: 'clm-uuid-001',
      productId: 'prod-topside-1',
      productArticle: '7940',
      productName: 'Frozen Boneless Buffalo Topside 20kg',
      producerName: 'Allana Foods',
      country: 'India',
      productionDate: new Date('2026-01-15T00:00:00Z'),
      lotNumber: 'LOT-2026-B91',
      vehicleNumber: 'TRUCK-MH-04-1290',
      nonConformWeightKg: '1420.5000',
      receivedQuantityKg: '5000.0000',
    },
  ],
  attachments: [
    {
      id: 'att-1',
      claimId: 'clm-uuid-001',
      fileName: 'damage-photo-1.jpg',
      fileUrl: 'claims/evidence/damage-photo-1.jpg',
      fileSizeBytes: 51200,
      createdAt: new Date('2026-02-21T10:05:00Z'),
    },
  ],
};

describe('Claims & Complaints Desk Tests (src/server/actions/claims.actions.ts)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Validation Schemas (claim.schema.ts)', () => {
    it('validates quality claim schema successfully', () => {
      const res = qualityClaimSchema.safeParse(mockQualityInput);
      expect(res.success).toBe(true);
    });

    it('rejects quality claim with missing subject or products', () => {
      const invalid = { ...mockQualityInput, subject: 'ab', products: [] };
      const res = qualityClaimSchema.safeParse(invalid);
      expect(res.success).toBe(false);
    });

    it('rejects quality claim with negative weights or >10 products', () => {
      const invalidWeight = {
        ...mockQualityInput,
        products: [
          {
            productArticle: '7940',
            productName: 'Topside',
            nonConformWeightKg: -5,
          },
        ],
      };
      expect(qualityClaimSchema.safeParse(invalidWeight).success).toBe(false);

      const elevenProducts = Array.from({ length: 11 }, (_, i) => ({
        productArticle: `SKU-${i}`,
        productName: `Product ${i}`,
        nonConformWeightKg: 10,
      }));
      expect(qualityClaimSchema.safeParse({ ...mockQualityInput, products: elevenProducts }).success).toBe(false);
    });

    it('validates info request schema successfully for different categories', () => {
      const res = infoRequestSchema.safeParse(mockInfoInput);
      expect(res.success).toBe(true);

      const shelfLifeReq: InfoRequestInput = {
        subject: 'Shelf Life Extension Request for Topside 2000kg',
        infoCategory: 'DOCS_DECLARATION_SHELF_LIFE',
        targetCountry: 'Saudi Arabia',
        requestedShelfLifeDate: '2027-01-01',
        shelfLifeExtensionVolumeKg: 2000,
        reasonForShelfLifeExtension: 'Customs port congestion delayed release by 3 weeks',
      };
      expect(infoRequestSchema.safeParse(shelfLifeReq).success).toBe(true);
    });

    it('rejects info request with invalid category or negative volume', () => {
      const invalidCat = { ...mockInfoInput, infoCategory: 'INVALID_CATEGORY' as any };
      expect(infoRequestSchema.safeParse(invalidCat).success).toBe(false);

      const invalidVol = { ...mockInfoInput, shelfLifeExtensionVolumeKg: -50 };
      expect(infoRequestSchema.safeParse(invalidVol).success).toBe(false);
    });
  });

  describe('getActiveCompanyIdFromCookies', () => {
    it('returns company ID from cookies when cookie exists', async () => {
      vi.mocked(cookies).mockResolvedValueOnce({
        get: vi.fn().mockReturnValue({ value: 'comp-cookie-999' }),
      } as any);

      const id = await getActiveCompanyIdFromCookies();
      expect(id).toBe('comp-cookie-999');
    });

    it('returns null when cookie is absent', async () => {
      vi.mocked(cookies).mockResolvedValueOnce({
        get: vi.fn().mockReturnValue(undefined),
      } as any);

      const id = await getActiveCompanyIdFromCookies();
      expect(id).toBeNull();
    });

    it('returns null when cookies() throws an exception', async () => {
      vi.mocked(cookies).mockRejectedValueOnce(new Error('Cookie context missing'));

      const id = await getActiveCompanyIdFromCookies();
      expect(id).toBeNull();
    });
  });

  describe('generateClaimNumber', () => {
    it('generates sequential ticket number for CLAIM', async () => {
      vi.mocked(prisma.claim.count).mockResolvedValueOnce(0);
      const year = new Date().getFullYear();
      const num1 = await generateClaimNumber('CLAIM');
      expect(num1).toBe(`CLM-${year}-0001`);

      vi.mocked(prisma.claim.count).mockResolvedValueOnce(41);
      const num2 = await generateClaimNumber('CLAIM');
      expect(num2).toBe(`CLM-${year}-0042`);
    });

    it('generates sequential ticket number for INFO_REQUEST', async () => {
      vi.mocked(prisma.claim.count).mockResolvedValueOnce(7);
      const year = new Date().getFullYear();
      const num = await generateClaimNumber('INFO_REQUEST');
      expect(num).toBe(`REQ-${year}-0008`);
    });
  });

  describe('mapClaimToDTO and sub-mappers', () => {
    it('maps complete claim record to DTO correctly', () => {
      const dto = mapClaimToDTO(mockDbClaim);
      expect(dto.id).toBe('clm-uuid-001');
      expect(dto.claimNumber).toBe('CLM-2026-0001');
      expect(dto.companyName).toBe('LuLu Hypermarket KSA');
      expect(dto.submittedByName).toBe('Ahmed Al-Harbi');
      expect(dto.submittedByEmail).toBe('ahmed@lulu.com');
      expect(dto.products.length).toBe(1);
      expect(dto.products[0].nonConformWeightKg).toBe(1420.5);
      expect(dto.products[0].receivedQuantityKg).toBe(5000);
      expect(dto.attachments.length).toBe(1);
      expect(dto.attachments[0].fileName).toBe('damage-photo-1.jpg');
    });

    it('handles minimal/null fields gracefully in mapClaimToDTO and mapProductItemToDTO', () => {
      const minimalClaim = {
        id: 'clm-2',
        claimNumber: 'REQ-2026-0002',
        companyId: 'comp-1',
        submittedById: 'user-1',
        type: 'INFO_REQUEST',
        status: 'UNDER_REVIEW',
        subject: 'General Question',
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      };
      const dto = mapClaimToDTO(minimalClaim);
      expect(dto.submittedByName).toBe('Portal User');
      expect(dto.companyName).toBe('Company');
      expect(dto.products).toEqual([]);
      expect(dto.attachments).toEqual([]);

      const itemWithoutOptionals = mapProductItemToDTO({
        id: 'item-2',
        claimId: 'clm-2',
        productArticle: '8320',
        productName: 'Buffalo Tenderloin',
        nonConformWeightKg: '500',
      });
      expect(itemOptionalsChecked(itemWithoutOptionals)).toBe(true);

      function itemOptionalsChecked(i: any) {
        return i.producerName === null && i.receivedQuantityKg === null && i.productionDate === null;
      }
    });

    it('maps attachment correctly in mapAttachmentToDTO', () => {
      const att = mapAttachmentToDTO({
        id: 'att-2',
        claimId: 'clm-1',
        fileName: 'spec.pdf',
        fileUrl: 'claims/spec.pdf',
        fileSizeBytes: 2048,
        createdAt: new Date('2026-01-01T12:00:00Z'),
      });
      expect(att.fileName).toBe('spec.pdf');
      expect(att.fileSizeBytes).toBe(2048);
    });
  });

  describe('getClaimsList', () => {
    it('fetches list of claims with default pagination and filters', async () => {
      vi.mocked(cookies).mockResolvedValueOnce({
        get: vi.fn().mockReturnValue({ value: 'company-lulu-123' }),
      } as any);
      vi.mocked(prisma.claim.count).mockResolvedValueOnce(1);
      vi.mocked(prisma.claim.findMany).mockResolvedValueOnce([mockDbClaim] as any);

      const res = await getClaimsList();
      expect(res.success).toBe(true);
      expect(res.total).toBe(1);
      expect(res.claims[0].claimNumber).toBe('CLM-2026-0001');
    });

    it('applies filters for type, status, date range, and search query', async () => {
      vi.mocked(prisma.claim.count).mockResolvedValueOnce(1);
      vi.mocked(prisma.claim.findMany).mockResolvedValueOnce([mockDbClaim] as any);

      const res = await getClaimsList({
        companyId: 'company-lulu-123',
        type: 'CLAIM',
        status: 'REGISTERED',
        startDate: '2026-02-01',
        endDate: '2026-02-28',
        search: 'MSKU9482710',
        limit: 10,
        offset: 0,
      });

      expect(res.success).toBe(true);
      expect(prisma.claim.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            companyId: 'company-lulu-123',
            type: 'CLAIM',
            status: 'REGISTERED',
            createdAt: expect.any(Object),
            OR: expect.any(Array),
          }),
          take: 10,
          skip: 0,
        })
      );
    });

    it('falls back to company.findFirst when no cookie or filter companyId exists', async () => {
      vi.mocked(cookies).mockResolvedValueOnce({
        get: vi.fn().mockReturnValue(undefined),
      } as any);
      vi.mocked(prisma.company.findFirst).mockResolvedValueOnce({ id: 'fallback-comp' } as any);
      vi.mocked(prisma.claim.count).mockResolvedValueOnce(0);
      vi.mocked(prisma.claim.findMany).mockResolvedValueOnce([]);

      const res = await getClaimsList();
      expect(res.success).toBe(true);
      expect(prisma.company.findFirst).toHaveBeenCalled();
    });

    it('returns error when prisma query fails', async () => {
      vi.mocked(prisma.claim.count).mockRejectedValueOnce(new Error('Database query timeout'));

      const res = await getClaimsList({ companyId: 'comp-1' });
      expect(res.success).toBe(false);
      expect(res.error).toBe('Database query timeout');
    });
  });

  describe('getClaimDetails', () => {
    it('returns claim details by ID', async () => {
      vi.mocked(prisma.claim.findUnique).mockResolvedValueOnce(mockDbClaim as any);

      const res = await getClaimDetails('clm-uuid-001', { companyId: 'company-lulu-123' });
      expect(res.success).toBe(true);
      expect(res.claim?.id).toBe('clm-uuid-001');
    });

    it('returns error when ID is empty or whitespace', async () => {
      const res = await getClaimDetails('   ');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Claim ID is required');
    });

    it('returns not found error when record is null', async () => {
      vi.mocked(prisma.claim.findUnique).mockResolvedValueOnce(null);

      const res = await getClaimDetails('non-existent-id');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Claim not found');
    });

    it('returns access denied when user company does not match', async () => {
      vi.mocked(prisma.claim.findUnique).mockResolvedValueOnce(mockDbClaim as any);

      const res = await getClaimDetails('clm-uuid-001', { companyId: 'other-company-789' });
      expect(res.success).toBe(false);
      expect(res.error).toBe('Access denied to this claim');
    });

    it('handles database error cleanly', async () => {
      vi.mocked(prisma.claim.findUnique).mockRejectedValueOnce(new Error('Prisma disconnect'));

      const res = await getClaimDetails('clm-uuid-001');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Prisma disconnect');
    });
  });

  describe('lookupProductByArticle', () => {
    it('returns product details when matching article exists', async () => {
      vi.mocked(prisma.product.findFirst).mockResolvedValueOnce({
        id: 'prod-7940',
        sku: '7940',
        name: 'Frozen Boneless Buffalo Topside 20kg',
        brand: 'Allana',
        category: { name: 'Frozen Buffalo Meat' },
      } as any);

      const res = await lookupProductByArticle('7940');
      expect(res.success).toBe(true);
      expect(res.product?.name).toBe('Frozen Boneless Buffalo Topside 20kg');
      expect(res.product?.category).toBe('Frozen Buffalo Meat');
    });

    it('returns null product when no match found', async () => {
      vi.mocked(prisma.product.findFirst).mockResolvedValueOnce(null);

      const res = await lookupProductByArticle('UNKNOWN_SKU');
      expect(res.success).toBe(true);
      expect(res.product).toBeNull();
    });

    it('returns error when article is empty', async () => {
      const res = await lookupProductByArticle('');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Article is required');
    });

    it('handles query error gracefully', async () => {
      vi.mocked(prisma.product.findFirst).mockRejectedValueOnce(new Error('DB search failed'));

      const res = await lookupProductByArticle('7940');
      expect(res.success).toBe(false);
      expect(res.error).toBe('DB search failed');
    });
  });

  describe('submitQualityClaim', () => {
    it('successfully creates quality claim and logs audit action', async () => {
      vi.mocked(prisma.claim.count).mockResolvedValueOnce(0);
      vi.mocked(prisma.claim.create).mockResolvedValueOnce(mockDbClaim as any);
      vi.mocked(prisma.actionLog.create).mockResolvedValueOnce({} as any);

      const res = await submitQualityClaim(mockQualityInput, {
        companyId: 'company-lulu-123',
        authorId: 'user-ahmed-456',
      });

      expect(res.success).toBe(true);
      expect(res.claim).not.toBeNull();
      expect(res.claim?.claimNumber).toBe('CLM-2026-0001');
      expect(prisma.actionLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            companyId: 'company-lulu-123',
            authorId: 'user-ahmed-456',
            action: 'SUBMIT_QUALITY_CLAIM',
          }),
        })
      );
    });

    it('resolves fallback company and user when options are not provided', async () => {
      vi.mocked(cookies).mockResolvedValueOnce({
        get: vi.fn().mockReturnValue(undefined),
      } as any);
      vi.mocked(prisma.company.findFirst).mockResolvedValueOnce({ id: 'fallback-comp-1' } as any);
      vi.mocked(prisma.user.findFirst).mockResolvedValueOnce({ id: 'fallback-user-1' } as any);
      vi.mocked(prisma.claim.count).mockResolvedValueOnce(0);
      vi.mocked(prisma.claim.create).mockResolvedValueOnce(mockDbClaim as any);
      vi.mocked(prisma.actionLog.create).mockResolvedValueOnce({} as any);

      const res = await submitQualityClaim(mockQualityInput);
      expect(res.success).toBe(true);
    });

    it('returns error when fallback company or user cannot be found', async () => {
      vi.mocked(cookies).mockResolvedValueOnce({
        get: vi.fn().mockReturnValue(undefined),
      } as any);
      vi.mocked(prisma.company.findFirst).mockResolvedValueOnce(null);

      const res = await submitQualityClaim(mockQualityInput);
      expect(res.success).toBe(false);
      expect(res.error).toBe('No active company found');

      vi.mocked(cookies).mockResolvedValueOnce({
        get: vi.fn().mockReturnValue({ value: 'comp-1' }),
      } as any);
      vi.mocked(prisma.user.findFirst).mockResolvedValueOnce(null);
      const res2 = await submitQualityClaim(mockQualityInput);
      expect(res2.success).toBe(false);
      expect(res2.error).toBe('No authorized user found');
    });

    it('returns error when validation fails', async () => {
      const invalid = { ...mockQualityInput, subject: '' };
      const res = await submitQualityClaim(invalid);
      expect(res.success).toBe(false);
      expect(res.error).toBeDefined();
    });
  });

  describe('submitInfoRequest', () => {
    it('successfully creates an info request with shelf life fields and product details', async () => {
      vi.mocked(prisma.claim.count).mockResolvedValueOnce(0);
      const dbInfoRecord = {
        ...mockDbClaim,
        claimNumber: 'REQ-2026-0001',
        type: 'INFO_REQUEST',
        infoCategory: 'DOCS_DECLARATION_SHELF_LIFE',
        requestedShelfLifeDate: new Date('2027-01-01'),
        reasonForShelfLifeExtension: 'Port congestion',
        shelfLifeExtensionVolumeKg: '2500.0000',
      };
      vi.mocked(prisma.claim.create).mockResolvedValueOnce(dbInfoRecord as any);
      vi.mocked(prisma.actionLog.create).mockResolvedValueOnce({} as any);

      const inputWithShelfLife: InfoRequestInput = {
        subject: 'Shelf Life Extension Request for Topside 2500kg',
        infoCategory: 'DOCS_DECLARATION_SHELF_LIFE',
        targetCountry: 'Saudi Arabia',
        supplierName: 'Allana Plant 4',
        productArticle: '7940',
        productName: 'Buffalo Topside',
        productionDate: '2026-01-10',
        requestedShelfLifeDate: '2027-01-01',
        shelfLifeExtensionVolumeKg: 2500,
        reasonForShelfLifeExtension: 'Port congestion',
        orderNumber: 'ORD-101',
        containerNumber: 'MSKU101',
        description: 'Need formal manufacturer letter',
        additionalEmails: 'qa@lulu.com',
        attachmentKeys: ['req/customs-notice.pdf'],
      };

      const res = await submitInfoRequest(inputWithShelfLife, {
        companyId: 'company-lulu-123',
        authorId: 'user-ahmed-456',
      });

      expect(res.success).toBe(true);
      expect(res.claim?.type).toBe('INFO_REQUEST');
      expect(prisma.actionLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'SUBMIT_INFO_REQUEST',
          }),
        })
      );
    });

    it('returns error when info request validation fails', async () => {
      const invalid = { ...mockInfoInput, subject: 'ab' };
      const res = await submitInfoRequest(invalid);
      expect(res.success).toBe(false);
      expect(res.error).toBeDefined();
    });

    it('returns error when fallback company or user cannot be found for info request', async () => {
      vi.mocked(cookies).mockResolvedValueOnce({
        get: vi.fn().mockReturnValue(undefined),
      } as any);
      vi.mocked(prisma.company.findFirst).mockResolvedValueOnce(null);

      const res = await submitInfoRequest(mockInfoInput);
      expect(res.success).toBe(false);
      expect(res.error).toBe('No active company found');

      vi.mocked(cookies).mockResolvedValueOnce({
        get: vi.fn().mockReturnValue({ value: 'comp-1' }),
      } as any);
      vi.mocked(prisma.user.findFirst).mockResolvedValueOnce(null);
      const res2 = await submitInfoRequest(mockInfoInput);
      expect(res2.success).toBe(false);
      expect(res2.error).toBe('No authorized user found');
    });
  });

  describe('getClaimAttachmentPresignedUrl', () => {
    it('returns presigned download URL for valid attachment and logs audit action', async () => {
      vi.mocked(prisma.claimAttachment.findUnique).mockResolvedValueOnce({
        id: 'att-1',
        fileName: 'damage-photo-1.jpg',
        fileUrl: 'claims/evidence/damage-photo-1.jpg',
        claim: { companyId: 'company-lulu-123', claimNumber: 'CLM-2026-0001' },
      } as any);
      vi.mocked(createPresignedDownloadUrl).mockResolvedValueOnce('https://presigned.r2.com/claims/download');
      vi.mocked(prisma.actionLog.create).mockResolvedValueOnce({} as any);

      const res = await getClaimAttachmentPresignedUrl('att-1', {
        companyId: 'company-lulu-123',
        authorId: 'user-ahmed-456',
      });

      expect(res.success).toBe(true);
      expect(res.url).toBe('https://presigned.r2.com/claims/download');
      expect(res.fileName).toBe('damage-photo-1.jpg');
      expect(prisma.actionLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'DOWNLOAD_CLAIM_ATTACHMENT',
          }),
        })
      );
    });

    it('rejects empty attachment ID', async () => {
      const res = await getClaimAttachmentPresignedUrl('   ');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Attachment ID is required');
    });

    it('returns error when attachment not found', async () => {
      vi.mocked(prisma.claimAttachment.findUnique).mockResolvedValueOnce(null);

      const res = await getClaimAttachmentPresignedUrl('non-existent');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Attachment not found');
    });

    it('returns access denied when user company does not own claim attachment', async () => {
      vi.mocked(prisma.claimAttachment.findUnique).mockResolvedValueOnce({
        id: 'att-1',
        claim: { companyId: 'company-lulu-123', claimNumber: 'CLM-2026-0001' },
      } as any);

      const res = await getClaimAttachmentPresignedUrl('att-1', {
        companyId: 'other-comp-456',
      });
      expect(res.success).toBe(false);
      expect(res.error).toBe('Access denied to this document');
    });

    it('handles presigned URL creation failure', async () => {
      vi.mocked(prisma.claimAttachment.findUnique).mockResolvedValueOnce({
        id: 'att-1',
        fileName: 'err.pdf',
        fileUrl: 'claims/err.pdf',
        claim: { companyId: 'company-lulu-123', claimNumber: 'CLM-2026-0001' },
      } as any);
      vi.mocked(createPresignedDownloadUrl).mockRejectedValueOnce(new Error('S3 error'));

      const res = await getClaimAttachmentPresignedUrl('att-1', {
        companyId: 'company-lulu-123',
      });
      expect(res.success).toBe(false);
      expect(res.error).toBe('S3 error');
    });

    it('uses cookie company ID and succeeds without authorId', async () => {
      vi.mocked(cookies).mockResolvedValueOnce({
        get: vi.fn().mockReturnValue({ value: 'company-lulu-123' }),
      } as any);
      vi.mocked(prisma.claimAttachment.findUnique).mockResolvedValueOnce({
        id: 'att-1',
        fileName: 'damage-photo-1.jpg',
        fileUrl: 'claims/evidence/damage-photo-1.jpg',
        claim: { companyId: 'company-lulu-123', claimNumber: 'CLM-2026-0001' },
      } as any);
      vi.mocked(createPresignedDownloadUrl).mockResolvedValueOnce('https://presigned.r2.com/claims/download');

      const res = await getClaimAttachmentPresignedUrl('att-1');
      expect(res.success).toBe(true);
      expect(prisma.actionLog.create).not.toHaveBeenCalled();
    });
  });

  describe('Comprehensive Branch Edge Cases', () => {
    it('handles ALL filters and single date boundaries in getClaimsList', async () => {
      vi.mocked(cookies).mockResolvedValueOnce({
        get: vi.fn().mockReturnValue({ value: 'company-lulu-123' }),
      } as any);
      vi.mocked(prisma.claim.count).mockResolvedValueOnce(0);
      vi.mocked(prisma.claim.findMany).mockResolvedValueOnce([]);

      // Test with ALL type and status
      const res1 = await getClaimsList({ type: 'ALL', status: 'ALL', startDate: '2026-01-01' });
      expect(res1.success).toBe(true);

      vi.mocked(cookies).mockResolvedValueOnce({
        get: vi.fn().mockReturnValue({ value: 'company-lulu-123' }),
      } as any);
      vi.mocked(prisma.claim.count).mockResolvedValueOnce(0);
      vi.mocked(prisma.claim.findMany).mockResolvedValueOnce([]);

      // Test with endDate only
      const res2 = await getClaimsList({ endDate: '2026-12-31' });
      expect(res2.success).toBe(true);
    });

    it('handles lookupProductByArticle when category is missing', async () => {
      vi.mocked(prisma.product.findFirst).mockResolvedValueOnce({
        id: 'prod-1',
        sku: '7940',
        name: 'Topside',
        brand: 'Allana',
        category: null,
      } as any);

      const res = await lookupProductByArticle('7940');
      expect(res.success).toBe(true);
      expect(res.product?.category).toBe('General Meat');
    });

    it('handles submitQualityClaim with minimal optional fields and database error', async () => {
      const minimalQualityInput: QualityClaimInput = {
        subject: 'Minimal Complaint',
        categoryOfRequest: 'Shortage',
        supplierName: 'Allana Plant 1',
        products: [
          {
            productArticle: '8320',
            productName: 'Tenderloin',
            nonConformWeightKg: 100,
          },
        ],
      };

      vi.mocked(prisma.claim.count).mockResolvedValueOnce(0);
      vi.mocked(prisma.claim.create).mockResolvedValueOnce(mockDbClaim as any);
      vi.mocked(prisma.actionLog.create).mockResolvedValueOnce({} as any);

      const res = await submitQualityClaim(minimalQualityInput, {
        companyId: 'comp-1',
        authorId: 'user-1',
      });
      expect(res.success).toBe(true);

      // Test database error
      vi.mocked(prisma.claim.create).mockRejectedValueOnce(new Error('Prisma write failed'));
      const errRes = await submitQualityClaim(minimalQualityInput, {
        companyId: 'comp-1',
        authorId: 'user-1',
      });
      expect(errRes.success).toBe(false);
      expect(errRes.error).toBe('Prisma write failed');
    });

    it('handles submitInfoRequest with minimal optional fields and database error', async () => {
      const minimalInfoInput: InfoRequestInput = {
        subject: 'Questionnaire Request',
        infoCategory: 'QUESTIONNAIRE',
      };

      vi.mocked(prisma.claim.count).mockResolvedValueOnce(0);
      vi.mocked(prisma.claim.create).mockResolvedValueOnce({
        ...mockDbClaim,
        type: 'INFO_REQUEST',
        infoCategory: 'QUESTIONNAIRE',
      } as any);
      vi.mocked(prisma.actionLog.create).mockResolvedValueOnce({} as any);

      const res = await submitInfoRequest(minimalInfoInput, {
        companyId: 'comp-1',
        authorId: 'user-1',
      });
      expect(res.success).toBe(true);

      // Test database error
      vi.mocked(prisma.claim.create).mockRejectedValueOnce(new Error('Prisma write failed'));
      const errRes = await submitInfoRequest(minimalInfoInput, {
        companyId: 'comp-1',
        authorId: 'user-1',
      });
      expect(errRes.success).toBe(false);
      expect(errRes.error).toBe('Prisma write failed');
    });

    it('handles getClaimDetails with cookie fallback and resolved claim record', async () => {
      vi.mocked(cookies).mockResolvedValueOnce({
        get: vi.fn().mockReturnValue({ value: 'company-lulu-123' }),
      } as any);
      vi.mocked(prisma.claim.findUnique).mockResolvedValueOnce({
        ...mockDbClaim,
        resolvedAt: new Date('2026-02-28T00:00:00Z'),
        companyResponse: 'Credit note CN-8910 issued.',
      } as any);

      const res = await getClaimDetails('clm-uuid-001');
      expect(res.success).toBe(true);
      expect(res.claim?.resolvedAt).toBeDefined();
      expect(res.claim?.companyResponse).toBe('Credit note CN-8910 issued.');
    });

    it('handles non-Error exceptions in getClaimsList and getClaimDetails', async () => {
      vi.mocked(prisma.claim.count).mockRejectedValueOnce('raw-string-error');
      const res1 = await getClaimsList({ companyId: 'comp-1' });
      expect(res1.success).toBe(false);
      expect(res1.error).toBe('Failed to fetch claims');

      vi.mocked(prisma.claim.findUnique).mockRejectedValueOnce('raw-string-error');
      const res2 = await getClaimDetails('clm-1');
      expect(res2.success).toBe(false);
      expect(res2.error).toBe('Failed to fetch claim details');

      vi.mocked(prisma.product.findFirst).mockRejectedValueOnce('raw-string-error');
      const res3 = await lookupProductByArticle('8320');
      expect(res3.success).toBe(false);
      expect(res3.error).toBe('Failed to lookup product');
    });

    it('handles submitInfoRequest with product article and name without production date', async () => {
      vi.mocked(prisma.claim.count).mockResolvedValueOnce(0);
      vi.mocked(prisma.claim.create).mockResolvedValueOnce({
        ...mockDbClaim,
        type: 'INFO_REQUEST',
      } as any);
      vi.mocked(prisma.actionLog.create).mockResolvedValueOnce({} as any);

      const res = await submitInfoRequest(
        {
          subject: 'Spec for 7940',
          infoCategory: 'DOCS_SPECIFICATION',
          productArticle: '7940',
          productName: 'Buffalo Topside',
        },
        { companyId: 'comp-1', authorId: 'user-1' }
      );

      expect(res.success).toBe(true);
    });

    it('resolves claimant profile with active company cookie and user details', async () => {
      vi.mocked(cookies).mockResolvedValueOnce({
        get: vi.fn().mockReturnValue({ value: 'comp-cookie-id' }),
      } as any);
      vi.mocked(prisma.company.findUnique).mockResolvedValueOnce({
        name: 'LuLu Hypermarket KSA',
        users: [{ firstName: 'Rashid', lastName: 'Al-Otaibi', email: 'rashid@lulu.com' }],
      } as any);

      const profile = await getClaimantProfile();
      expect(profile.companyName).toBe('LuLu Hypermarket KSA');
      expect(profile.userName).toBe('Rashid Al-Otaibi');
      expect(profile.userEmail).toBe('rashid@lulu.com');
    });

    it('resolves claimant profile with empty user list and falls back gracefully', async () => {
      vi.mocked(cookies).mockResolvedValueOnce({
        get: vi.fn().mockReturnValue({ value: 'comp-empty-users' }),
      } as any);
      vi.mocked(prisma.company.findUnique).mockResolvedValueOnce({
        name: 'LuLu Hypermarket KSA',
        users: [],
      } as any);

      const profile = await getClaimantProfile();
      expect(profile.companyName).toBe('LuLu Hypermarket KSA');
      expect(profile.userName).toBe('Procurement Lead');
      expect(profile.userEmail).toBe('procurement@partner.com');
    });

    it('resolves claimant profile with fallback to first company if cookie not found or unique fails', async () => {
      vi.mocked(cookies).mockResolvedValueOnce({
        get: vi.fn().mockReturnValue(undefined),
      } as any);
      vi.mocked(prisma.company.findFirst).mockResolvedValueOnce({
        name: 'Carrefour Middle East',
        users: [{ firstName: 'Jean', lastName: 'Dupont', email: 'jean@carrefour.com' }],
      } as any);

      const profile = await getClaimantProfile();
      expect(profile.companyName).toBe('Carrefour Middle East');
      expect(profile.userName).toBe('Jean Dupont');
      expect(profile.userEmail).toBe('jean@carrefour.com');
    });

    it('resolves claimant profile defaults when no company exists at all', async () => {
      vi.mocked(cookies).mockResolvedValueOnce({
        get: vi.fn().mockReturnValue(undefined),
      } as any);
      vi.mocked(prisma.company.findFirst).mockResolvedValueOnce(null);

      const profile = await getClaimantProfile();
      expect(profile.companyName).toBe('Authorized Buyer Partner');
      expect(profile.userName).toBe('Procurement Lead');
      expect(profile.userEmail).toBe('procurement@partner.com');
    });
  });
});


