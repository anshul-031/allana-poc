import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';
import {
  searchCatalogProducts,
  getCatalogProducts,
  getProductBySlug,
} from '@/server/actions/catalog.actions';
import { formatPackagingSummary } from '@/lib/utils';


vi.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

describe('catalog.actions Server Actions (FEAT-3.1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('formatPackagingSummary', () => {
    it('formats summary with complete product details', () => {
      const summary = formatPackagingSummary({
        primaryPackaging: 'Vacuum Pack (IWP)',
        cartonNetWeightKg: 20,
        brand: 'Allana',
      });

      expect(summary).toBe('Vacuum Pack (IWP), corrugated box 20 kg, TM "Allana"');
    });

    it('applies fallback defaults when optional properties are omitted', () => {
      const summary = formatPackagingSummary({});

      expect(summary).toBe('vacuum film, corrugated box standard, TM "Allana"');
    });
  });

  describe('searchCatalogProducts', () => {
    const mockProducts = [
      {
        id: 'prod-1',
        sku: 'AL-BUF-TOP-02',
        name: 'Frozen Boneless Buffalo Topside',
        slug: 'frozen-boneless-buffalo-topside',
        brand: 'Allana',
        productState: 'Frozen (-18°C)',
        primaryPackaging: 'Vacuum Pack (IWP)',
        cartonNetWeightKg: '20.00',
        packagesPerCarton: 4,
        cutSize: 'Uncalibrated',
        imageUrl: 'products/topside.webp',
        isUnderDevelopment: false,
        category: { name: 'Frozen Buffalo Meat' },
        subcategory: { name: 'Hindquarter Cuts' },
      },
    ];

    it('returns empty array when query is empty or only whitespace', async () => {
      const res = await searchCatalogProducts('');

      expect(res.success).toBe(true);
      expect(res.products).toHaveLength(0);
      expect(prisma.product.findMany).not.toHaveBeenCalled();
    });

    it('searches products with case-insensitive filters and formats DTOs', async () => {
      vi.mocked(prisma.product.findMany).mockResolvedValueOnce(mockProducts as any);

      const res = await searchCatalogProducts('topside');

      expect(res.success).toBe(true);
      expect(res.products).toHaveLength(1);
      expect(res.products[0].sku).toBe('AL-BUF-TOP-02');
      expect(res.products[0].name).toBe('Frozen Boneless Buffalo Topside');
      expect(res.products[0].categoryName).toBe('Frozen Buffalo Meat');
      expect(res.products[0].subcategoryName).toBe('Hindquarter Cuts');
      expect(res.products[0].cartonNetWeightKg).toBe(20);
      expect(res.products[0].packagingDescription).toBe(
        'Vacuum Pack (IWP), corrugated box 20 kg, TM "Allana"'
      );

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { name: { contains: 'topside', mode: 'insensitive' } },
              { sku: { contains: 'topside', mode: 'insensitive' } },
              { brand: { contains: 'topside', mode: 'insensitive' } },
              { description: { contains: 'topside', mode: 'insensitive' } },
            ],
          },
          take: 8,
        })
      );
    });

    it('handles null subcategory gracefully', async () => {
      const productNoSub = [
        {
          ...mockProducts[0],
          subcategory: null,
        },
      ];
      vi.mocked(prisma.product.findMany).mockResolvedValueOnce(productNoSub as any);

      const res = await searchCatalogProducts('buffalo');

      expect(res.success).toBe(true);
      expect(res.products[0].subcategoryName).toBeNull();
    });

    it('respects custom limit clamp between 1 and 20', async () => {
      vi.mocked(prisma.product.findMany).mockResolvedValueOnce([] as any);

      await searchCatalogProducts('query', 15);

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 15,
        })
      );
    });

    it('returns error when prisma query fails', async () => {
      vi.mocked(prisma.product.findMany).mockRejectedValueOnce(new Error('Postgres connection pool exhausted'));

      const res = await searchCatalogProducts('tenderloin');

      expect(res.success).toBe(false);
      expect(res.products).toHaveLength(0);
      expect(res.error).toBe('Postgres connection pool exhausted');
    });

    it('handles non-Error thrown gracefully', async () => {
      vi.mocked(prisma.product.findMany).mockRejectedValueOnce('string error');

      const res = await searchCatalogProducts('tenderloin');

      expect(res.success).toBe(false);
      expect(res.error).toBe('Failed to search catalog products');
    });
  });

  describe('getCatalogProducts', () => {
    const mockProducts = [
      {
        id: 'prod-1',
        sku: 'AL-BUF-TOP-02',
        name: 'Frozen Boneless Buffalo Topside',
        slug: 'frozen-boneless-buffalo-topside',
        brand: 'Allana',
        productState: 'Frozen (-18°C)',
        primaryPackaging: 'Vacuum Pack (IWP)',
        cartonNetWeightKg: '20.00',
        packagesPerCarton: 4,
        cutSize: 'Uncalibrated',
        imageUrl: 'products/topside.webp',
        isUnderDevelopment: false,
        category: { name: 'Frozen Buffalo Meat' },
        subcategory: { name: 'Hindquarter Cuts' },
      },
      {
        id: 'prod-2',
        sku: 'AL-BUF-SIL-01',
        name: 'Frozen Boneless Buffalo Silverside',
        slug: 'frozen-boneless-buffalo-silverside',
        brand: 'Allana',
        productState: 'Frozen (-18°C)',
        primaryPackaging: 'Vacuum Pack (IWP)',
        cartonNetWeightKg: '20.00',
        packagesPerCarton: 4,
        cutSize: 'Uncalibrated',
        imageUrl: null,
        isUnderDevelopment: true,
        category: { name: 'Frozen Buffalo Meat' },
        subcategory: null,
      },
    ];

    it('fetches products with default options (page 1, limit 12, name_asc)', async () => {
      vi.mocked(prisma.product.count).mockResolvedValueOnce(2);
      vi.mocked(prisma.product.findMany).mockResolvedValueOnce(mockProducts as any);

      const res = await getCatalogProducts();

      expect(res.success).toBe(true);
      expect(res.products).toHaveLength(2);
      expect(res.total).toBe(2);
      expect(res.page).toBe(1);
      expect(res.pageSize).toBe(12);
      expect(res.totalPages).toBe(1);
      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 12,
          orderBy: { name: 'asc' },
        })
      );
    });

    it('filters by category, subcategory, brand, packaging, state, and search query', async () => {
      vi.mocked(prisma.product.count).mockResolvedValueOnce(1);
      vi.mocked(prisma.product.findMany).mockResolvedValueOnce([mockProducts[0]] as any);

      const res = await getCatalogProducts({
        category: 'frozen-buffalo',
        subcategory: 'hindquarter',
        brand: 'Allana',
        packaging: 'Vacuum Pack',
        state: 'Frozen',
        search: 'topside',
        page: 2,
        limit: 24,
        sortBy: 'name_desc',
      });

      expect(res.success).toBe(true);
      expect(res.products).toHaveLength(1);
      expect(res.page).toBe(2);
      expect(res.pageSize).toBe(24);
      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 24,
          take: 24,
          orderBy: { name: 'desc' },
        })
      );
    });

    it('supports sorting by sku_asc and sku_desc', async () => {
      vi.mocked(prisma.product.count).mockResolvedValueOnce(1);
      vi.mocked(prisma.product.findMany).mockResolvedValueOnce([mockProducts[0]] as any);

      await getCatalogProducts({ sortBy: 'sku_asc' });
      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { sku: 'asc' },
        })
      );

      vi.mocked(prisma.product.count).mockResolvedValueOnce(1);
      vi.mocked(prisma.product.findMany).mockResolvedValueOnce([mockProducts[0]] as any);

      await getCatalogProducts({ sortBy: 'sku_desc' });
      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { sku: 'desc' },
        })
      );
    });

    it('handles limit 0 or -1 by defaulting to 100 for All items', async () => {
      vi.mocked(prisma.product.count).mockResolvedValueOnce(2);
      vi.mocked(prisma.product.findMany).mockResolvedValueOnce(mockProducts as any);

      const res = await getCatalogProducts({ limit: -1 });

      expect(res.success).toBe(true);
      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100,
        })
      );
    });

    it('returns error when prisma query fails', async () => {
      vi.mocked(prisma.product.count).mockRejectedValueOnce(new Error('Database offline'));

      const res = await getCatalogProducts();

      expect(res.success).toBe(false);
      expect(res.products).toHaveLength(0);
      expect(res.error).toBe('Database offline');
    });

    it('handles non-Error thrown in getCatalogProducts', async () => {
      vi.mocked(prisma.product.count).mockRejectedValueOnce('raw string error');

      const res = await getCatalogProducts();

      expect(res.success).toBe(false);
      expect(res.error).toBe('Failed to fetch catalog products');
    });
  });

  describe('getProductBySlug (FEAT-3.4)', () => {
    const mockProductRecord = {
      id: 'prod-topside-123',
      sku: 'AL-BUF-TOP-02',
      name: 'Frozen Boneless Buffalo Topside',
      slug: 'frozen-boneless-buffalo-topside',
      brand: 'Allana',
      productState: 'Frozen (-18°C)',
      primaryPackaging: 'Vacuum Pack (IWP)',
      storageTemperature: '-18°C or below',
      shelfLifeMonths: 24,
      cartonNetWeightKg: '20.00',
      cutSize: '1.5kg - 2.5kg per piece',
      packagesPerCarton: 4,
      cartonWeightKg: '21.20',
      cartonDimensionsMm: '580 x 380 x 140',
      cartonsPerPallet: 40,
      palletsPerContainer: 28,
      totalContainerWeightMt: '22.40',
      freezingType: 'BF (Block Frozen)',
      imageUrl: 'products/topside.webp',
      packagingImageUrl: 'products/topside-pack.webp',
      specSheetPdfUrl: '/specs/topside.pdf',
      certifications: ['HALAL', 'ISO_22000', 'HACCP', 'SFDA'],
      description: 'Premium buffalo topside cut from young buffalo.',
      isUnderDevelopment: false,
      category: { name: 'Frozen Buffalo Meat', slug: 'frozen-buffalo-meat' },
      subcategory: { name: 'Hindquarter Cuts', slug: 'hindquarter-cuts' },
    };

    it('returns error when slug is empty or whitespace', async () => {
      const res1 = await getProductBySlug('');
      expect(res1.success).toBe(false);
      expect(res1.product).toBeNull();
      expect(res1.error).toBe('Product slug is required');

      const res2 = await getProductBySlug('   ');
      expect(res2.success).toBe(false);
      expect(res2.product).toBeNull();
      expect(res2.error).toBe('Product slug is required');
    });

    it('returns error when product is not found', async () => {
      vi.mocked(prisma.product.findUnique).mockResolvedValueOnce(null);

      const res = await getProductBySlug('non-existent-cut');
      expect(res.success).toBe(false);
      expect(res.product).toBeNull();
      expect(res.error).toBe('Product not found');
      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { slug: 'non-existent-cut' },
        include: {
          category: { select: { name: true, slug: true } },
          subcategory: { select: { name: true, slug: true } },
        },
      });
    });

    it('returns product details with packaging options and mapped values', async () => {
      vi.mocked(prisma.product.findUnique).mockResolvedValueOnce(mockProductRecord as any);

      const res = await getProductBySlug('frozen-boneless-buffalo-topside');
      expect(res.success).toBe(true);
      expect(res.product).not.toBeNull();
      expect(res.product?.sku).toBe('AL-BUF-TOP-02');
      expect(res.product?.cartonNetWeightKg).toBe(20);
      expect(res.product?.cartonWeightKg).toBe(21.2);
      expect(res.product?.totalContainerWeightMt).toBe(22.4);
      expect(res.product?.packagingOptions).toHaveLength(4);
      expect(res.product?.packagingOptions[0].id).toBe('vacuum-block');
      expect(res.product?.packagingOptions[1].id).toBe('carton');
      expect(res.product?.certifications).toEqual(['HALAL', 'ISO_22000', 'HACCP', 'SFDA']);
    });

    it('calculates fallback weights and defaults when optional fields are null', async () => {
      const recordWithNulls = {
        ...mockProductRecord,
        cartonWeightKg: null,
        totalContainerWeightMt: null,
        packagingImageUrl: null,
        certifications: [],
        cutSize: null,
        packagesPerCarton: null,
        freezingType: null,
        subcategory: null,
      };

      vi.mocked(prisma.product.findUnique).mockResolvedValueOnce(recordWithNulls as any);

      const res = await getProductBySlug('frozen-boneless-buffalo-topside');
      expect(res.success).toBe(true);
      expect(res.product?.cartonWeightKg).toBe(21); // 20 * 1.05 = 21.0
      expect(res.product?.totalContainerWeightMt).toBe(22.4); // (40 * 28 * 20) / 1000 = 22.4
      expect(res.product?.cutSize).toBe('Uncalibrated');
      expect(res.product?.packagesPerCarton).toBe(4);
      expect(res.product?.freezingType).toBe('BF (Block Frozen)');
      expect(res.product?.subcategoryName).toBeNull();
      expect(res.product?.certifications).toEqual(['HALAL', 'ISO_22000', 'HACCP', 'SFDA']);
    });

    it('handles database error thrown as Error instance', async () => {
      vi.mocked(prisma.product.findUnique).mockRejectedValueOnce(new Error('Connection lost'));

      const res = await getProductBySlug('some-slug');
      expect(res.success).toBe(false);
      expect(res.product).toBeNull();
      expect(res.error).toBe('Connection lost');
    });

    it('handles non-Error thrown in getProductBySlug', async () => {
      vi.mocked(prisma.product.findUnique).mockRejectedValueOnce('raw db error');

      const res = await getProductBySlug('some-slug');
      expect(res.success).toBe(false);
      expect(res.product).toBeNull();
      expect(res.error).toBe('Failed to fetch product details');
    });
  });
});

