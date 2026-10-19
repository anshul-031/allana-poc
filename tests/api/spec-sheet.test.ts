import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/catalog/[slug]/spec-sheet/route';
import * as catalogActions from '@/server/actions/catalog.actions';
import { ProductDetailDTO } from '@/server/actions/catalog.actions';

const mockProduct: ProductDetailDTO = {
  id: 'prod-topside-123',
  sku: 'AL-BUF-TOP-02',
  name: 'Frozen Boneless Buffalo Topside',
  slug: 'frozen-boneless-buffalo-topside',
  brand: 'Allana',
  categoryName: 'Frozen Buffalo Meat',
  categorySlug: 'frozen-buffalo-meat',
  subcategoryName: 'Hindquarter Cuts',
  subcategorySlug: 'hindquarter-cuts',
  productState: 'Frozen (-18°C)',
  primaryPackaging: 'Vacuum Pack (IWP)',
  storageTemperature: '-18°C or below',
  shelfLifeMonths: 24,
  cartonNetWeightKg: 20,
  cutSize: '1.5kg - 2.5kg per piece',
  packagesPerCarton: 4,
  cartonWeightKg: 21.2,
  cartonDimensionsMm: '580 x 380 x 140',
  cartonsPerPallet: 40,
  palletsPerContainer: 28,
  totalContainerWeightMt: 22.4,
  freezingType: 'BF (Block Frozen)',
  imageUrl: 'products/topside.webp',
  packagingImageUrl: 'products/topside-pack.webp',
  specSheetPdfUrl: '/specs/topside.pdf',
  certifications: ['HALAL', 'ISO_22000', 'HACCP', 'SFDA'],
  description: 'Premium export grade buffalo topside cut from young buffalo.',
  isUnderDevelopment: false,
  packagingOptions: [],
};

describe('FEAT-3.5 GET /api/catalog/[slug]/spec-sheet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with PDF content and attachment disposition headers', async () => {
    vi.spyOn(catalogActions, 'getProductBySlug').mockResolvedValueOnce({
      success: true,
      product: mockProduct,
    });

    const request = new Request('http://localhost:3000/api/catalog/frozen-boneless-buffalo-topside/spec-sheet');
    const response = await GET(request, {
      params: Promise.resolve({ slug: 'frozen-boneless-buffalo-topside' }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/pdf');
    expect(response.headers.get('Content-Disposition')).toBe(
      'attachment; filename="Allana-Spec-AL-BUF-TOP-02.pdf"'
    );

    const blob = await response.arrayBuffer();
    const pdfString = Buffer.from(blob).toString('utf-8');
    expect(pdfString.startsWith('%PDF-1.4')).toBe(true);
    expect(pdfString).toContain('AL-BUF-TOP-02');
  });

  it('returns 404 when product is not found', async () => {
    vi.spyOn(catalogActions, 'getProductBySlug').mockResolvedValueOnce({
      success: false,
      product: null,
      error: 'Product not found',
    });

    const request = new Request('http://localhost:3000/api/catalog/non-existent-cut/spec-sheet');
    const response = await GET(request, {
      params: Promise.resolve({ slug: 'non-existent-cut' }),
    });

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe('Product not found');
  });

  it('returns 404 with default error message when result.error is undefined', async () => {
    vi.spyOn(catalogActions, 'getProductBySlug').mockResolvedValueOnce({
      success: false,
      product: null,
    });

    const request = new Request('http://localhost:3000/api/catalog/non-existent-cut/spec-sheet');
    const response = await GET(request, {
      params: Promise.resolve({ slug: 'non-existent-cut' }),
    });

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe('Product not found');
  });

  it('returns 500 when an unexpected server error occurs', async () => {
    vi.spyOn(catalogActions, 'getProductBySlug').mockRejectedValueOnce(
      new Error('R2 storage connection failed')
    );

    const request = new Request('http://localhost:3000/api/catalog/frozen-boneless-buffalo-topside/spec-sheet');
    const response = await GET(request, {
      params: Promise.resolve({ slug: 'frozen-boneless-buffalo-topside' }),
    });

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('R2 storage connection failed');
  });

  it('handles non-Error thrown in GET handler', async () => {
    vi.spyOn(catalogActions, 'getProductBySlug').mockRejectedValueOnce(
      'raw exception'
    );

    const request = new Request('http://localhost:3000/api/catalog/frozen-boneless-buffalo-topside/spec-sheet');
    const response = await GET(request, {
      params: Promise.resolve({ slug: 'frozen-boneless-buffalo-topside' }),
    });

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Internal server error');
  });
});
