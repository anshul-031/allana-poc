'use server';

import { prisma } from '@/lib/prisma';

export interface CatalogSearchProductDTO {
  id: string;
  name: string;
  slug: string;
  sku: string;
  brand: string;
  categoryName: string;
  subcategoryName: string | null;
  primaryPackaging: string;
  cartonNetWeightKg: number;
  packagesPerCarton: number | null;
  cutSize: string | null;
  productState: string;
  packagingDescription: string;
  imageUrl: string | null;
  isUnderDevelopment: boolean;
}

export interface CatalogSearchResult {
  success: boolean;
  products: CatalogSearchProductDTO[];
  error?: string;
}

/**
 * Format packaging secondary line matching enterprise export specifications
 * e.g. "vacuum film 2,0 kg, corrugated box 12 kg, TM \"Allana\""
 */
export function formatPackagingSummary(product: {
  primaryPackaging?: string | null;
  cartonNetWeightKg?: number | string | any;
  brand?: string | null;
}): string {
  const packType = product.primaryPackaging || 'vacuum film';
  const weight = product.cartonNetWeightKg ? `${product.cartonNetWeightKg} kg` : 'standard';
  const brandName = product.brand || 'Allana';
  return `${packType}, corrugated box ${weight}, TM "${brandName}"`;
}

interface RawProductRecord {
  id: string;
  name: string;
  slug: string;
  sku: string;
  brand: string;
  primaryPackaging: string;
  cartonNetWeightKg: number | string | any;
  packagesPerCarton: number | null;
  cutSize: string | null;
  productState: string;
  imageUrl: string | null;
  isUnderDevelopment: boolean;
  category: { name: string };
  subcategory?: { name: string } | null;
}

/**
 * Instant autocomplete live search against SKU, Cut Name, and Brand
 */
export async function searchCatalogProducts(
  query: string,
  limit = 8
): Promise<CatalogSearchResult> {
  const trimmed = query ? query.trim() : '';
  if (!trimmed) {
    return {
      success: true,
      products: [],
    };
  }

  try {
    const records = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: trimmed, mode: 'insensitive' } },
          { sku: { contains: trimmed, mode: 'insensitive' } },
          { brand: { contains: trimmed, mode: 'insensitive' } },
          { description: { contains: trimmed, mode: 'insensitive' } },
        ],
      },
      include: {
        category: { select: { name: true } },
        subcategory: { select: { name: true } },
      },
      take: Math.max(1, Math.min(20, limit)),
      orderBy: { name: 'asc' },
    });

    const products: CatalogSearchProductDTO[] = (records as any[]).map((p: any) => {
      const netWeight = Number(p.cartonNetWeightKg);
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        brand: p.brand,
        categoryName: p.category.name,
        subcategoryName: p.subcategory?.name || null,
        primaryPackaging: p.primaryPackaging,
        cartonNetWeightKg: netWeight,
        packagesPerCarton: p.packagesPerCarton,
        cutSize: p.cutSize,
        productState: p.productState,
        packagingDescription: formatPackagingSummary({
          primaryPackaging: p.primaryPackaging,
          cartonNetWeightKg: netWeight,
          brand: p.brand,
        }),
        imageUrl: p.imageUrl,
        isUnderDevelopment: p.isUnderDevelopment,
      };
    });

    return {
      success: true,
      products,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to search catalog products';
    return {
      success: false,
      products: [],
      error: message,
    };
  }
}

export interface GetCatalogProductsOptions {
  category?: string;
  subcategory?: string;
  brand?: string;
  packaging?: string;
  state?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name_asc' | 'name_desc' | 'sku_asc' | 'sku_desc';
}

export interface GetCatalogProductsResult {
  success: boolean;
  products: CatalogSearchProductDTO[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  error?: string;
}

/**
 * Fetch catalog products with multi-facet filters, sorting, and pagination
 */
export async function getCatalogProducts(
  options?: GetCatalogProductsOptions
): Promise<GetCatalogProductsResult> {
  try {
    const page = Math.max(1, options?.page || 1);
    const limit = options?.limit === 0 || options?.limit === -1 ? 100 : Math.max(1, Math.min(100, options?.limit || 12));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (options?.category && options.category.trim()) {
      const cat = options.category.trim();
      where.OR = [
        { category: { slug: cat } },
        { category: { name: { contains: cat, mode: 'insensitive' } } },
      ];
    }

    if (options?.subcategory && options.subcategory.trim()) {
      const sub = options.subcategory.trim();
      where.subcategory = {
        OR: [
          { slug: sub },
          { name: { contains: sub, mode: 'insensitive' } },
        ],
      };
    }

    if (options?.brand && options.brand.trim()) {
      where.brand = { contains: options.brand.trim(), mode: 'insensitive' };
    }

    if (options?.packaging && options.packaging.trim()) {
      where.primaryPackaging = { contains: options.packaging.trim(), mode: 'insensitive' };
    }

    if (options?.state && options.state.trim()) {
      where.productState = { contains: options.state.trim(), mode: 'insensitive' };
    }

    if (options?.search && options.search.trim()) {
      const s = options.search.trim();
      where.AND = [
        {
          OR: [
            { name: { contains: s, mode: 'insensitive' } },
            { sku: { contains: s, mode: 'insensitive' } },
            { description: { contains: s, mode: 'insensitive' } },
          ],
        },
      ];
    }

    let orderBy: any = { name: 'asc' };
    if (options?.sortBy === 'name_desc') {
      orderBy = { name: 'desc' };
    } else if (options?.sortBy === 'sku_asc') {
      orderBy = { sku: 'asc' };
    } else if (options?.sortBy === 'sku_desc') {
      orderBy = { sku: 'desc' };
    }

    const [total, records] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: { select: { name: true } },
          subcategory: { select: { name: true } },
        },
      }),
    ]);

    const products: CatalogSearchProductDTO[] = (records as any[]).map((p: any) => {
      const netWeight = Number(p.cartonNetWeightKg);
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        brand: p.brand,
        categoryName: p.category.name,
        subcategoryName: p.subcategory?.name || null,
        primaryPackaging: p.primaryPackaging,
        cartonNetWeightKg: netWeight,
        packagesPerCarton: p.packagesPerCarton,
        cutSize: p.cutSize,
        productState: p.productState,
        packagingDescription: formatPackagingSummary({
          primaryPackaging: p.primaryPackaging,
          cartonNetWeightKg: netWeight,
          brand: p.brand,
        }),
        imageUrl: p.imageUrl,
        isUnderDevelopment: p.isUnderDevelopment,
      };
    });

    return {
      success: true,
      products,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch catalog products';
    return {
      success: false,
      products: [],
      total: 0,
      page: 1,
      pageSize: 12,
      totalPages: 1,
      error: message,
    };
  }
}

export interface ProductPackagingOption {
  id: string;
  label: string;
  format: string;
  imageUrl: string;
}

export interface ProductDetailDTO {
  id: string;
  sku: string;
  name: string;
  slug: string;
  brand: string;
  categoryName: string;
  categorySlug: string;
  subcategoryName: string | null;
  subcategorySlug: string | null;
  productState: string;
  primaryPackaging: string;
  storageTemperature: string;
  shelfLifeMonths: number;
  cartonNetWeightKg: number;
  cutSize: string;
  packagesPerCarton: number;
  cartonWeightKg: number;
  cartonDimensionsMm: string;
  cartonsPerPallet: number;
  palletsPerContainer: number;
  totalContainerWeightMt: number;
  freezingType: string;
  imageUrl: string | null;
  packagingImageUrl: string | null;
  specSheetPdfUrl: string | null;
  certifications: string[];
  description: string;
  isUnderDevelopment: boolean;
  packagingOptions: ProductPackagingOption[];
}

export interface GetProductBySlugResult {
  success: boolean;
  product: ProductDetailDTO | null;
  error?: string;
}

/**
 * Fetch complete product specifications by slug
 */
export async function getProductBySlug(slug: string): Promise<GetProductBySlugResult> {
  const trimmed = slug ? slug.trim() : '';
  if (!trimmed) {
    return { success: false, product: null, error: 'Product slug is required' };
  }

  try {
    const record = await prisma.product.findUnique({
      where: { slug: trimmed },
      include: {
        category: { select: { name: true, slug: true } },
        subcategory: { select: { name: true, slug: true } },
      },
    });

    if (!record) {
      return { success: false, product: null, error: 'Product not found' };
    }

    const netWeight = Number(record.cartonNetWeightKg);
    const grossWeight = record.cartonWeightKg
      ? Number(record.cartonWeightKg)
      : Math.round(netWeight * 1.05 * 10) / 10;
    const containerWeight = record.totalContainerWeightMt
      ? Number(record.totalContainerWeightMt)
      : Math.round(((record.cartonsPerPallet * record.palletsPerContainer * netWeight) / 1000) * 100) / 100;

    const packagingOptions: ProductPackagingOption[] = [
      {
        id: 'vacuum-block',
        label: 'Vacuum Block (IWP)',
        format: 'Individually vacuum packed in food-grade multilayer barrier shrink film',
        imageUrl: record.packagingImageUrl || 'products/packaging/sample-vacuum.webp',
      },
      {
        id: 'carton',
        label: 'Master Carton',
        format: 'Heavy-duty 5-ply corrugated export carton with strap reinforcement',
        imageUrl: record.packagingImageUrl || 'products/packaging/sample-carton.webp',
      },
      {
        id: 'polybag',
        label: 'Polybag Bulk',
        format: 'Heavy-duty polyethylene liner inside corrugated master carton',
        imageUrl: 'products/packaging/sample-polybag.webp',
      },
      {
        id: 'tray',
        label: 'Retail MAP Tray',
        format: 'Skin-pack barrier tray in modified atmosphere packaging (MAP)',
        imageUrl: 'products/packaging/sample-tray.webp',
      },
    ];

    return {
      success: true,
      product: {
        id: record.id,
        sku: record.sku,
        name: record.name,
        slug: record.slug,
        brand: record.brand,
        categoryName: record.category.name,
        categorySlug: record.category.slug,
        subcategoryName: record.subcategory?.name || null,
        subcategorySlug: record.subcategory?.slug || null,
        productState: record.productState,
        primaryPackaging: record.primaryPackaging,
        storageTemperature: record.storageTemperature,
        shelfLifeMonths: record.shelfLifeMonths,
        cartonNetWeightKg: netWeight,
        cutSize: record.cutSize || 'Uncalibrated',
        packagesPerCarton: record.packagesPerCarton || 4,
        cartonWeightKg: grossWeight,
        cartonDimensionsMm: record.cartonDimensionsMm,
        cartonsPerPallet: record.cartonsPerPallet,
        palletsPerContainer: record.palletsPerContainer,
        totalContainerWeightMt: containerWeight,
        freezingType: record.freezingType || 'BF (Block Frozen)',
        imageUrl: record.imageUrl,
        packagingImageUrl: record.packagingImageUrl,
        specSheetPdfUrl: record.specSheetPdfUrl,
        certifications:
          record.certifications && record.certifications.length > 0
            ? record.certifications
            : ['HALAL', 'ISO_22000', 'HACCP', 'SFDA'],
        description: record.description,
        isUnderDevelopment: record.isUnderDevelopment,
        packagingOptions,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch product details';
    return {
      success: false,
      product: null,
      error: message,
    };
  }
}


