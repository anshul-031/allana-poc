import { describe, it, expect } from 'vitest';
import { generateProductSpecSheetPdf, escapePdfText } from '@/lib/pdf';
import { ProductDetailDTO } from '@/server/actions/catalog.actions';

const mockProduct: ProductDetailDTO = {
  id: 'prod-topside-123',
  sku: 'AL-BUF-TOP-02',
  name: 'Frozen Boneless Buffalo Topside (Special)',
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

describe('FEAT-3.5 PDF Spec Sheet Generator (src/lib/pdf.ts)', () => {
  describe('escapePdfText', () => {
    it('escapes parentheses, backslashes, and newlines', () => {
      expect(escapePdfText('')).toBe('');
      expect(escapePdfText('Normal text')).toBe('Normal text');
      expect(escapePdfText('Text (with parens)')).toBe('Text \\(with parens\\)');
      expect(escapePdfText('Backslash \\ test')).toBe('Backslash \\\\ test');
      expect(escapePdfText("Line 1\r\nLine 2\nLine 3")).toBe('Line 1 Line 2 Line 3');
    });
  });

  describe('generateProductSpecSheetPdf', () => {
    it('generates a valid binary PDF buffer with header, objects, xref, and trailer', () => {
      const buffer = generateProductSpecSheetPdf(mockProduct);
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(500);

      const pdfString = buffer.toString('utf-8');

      // Valid PDF-1.4 header
      expect(pdfString.startsWith('%PDF-1.4')).toBe(true);

      // Contains required PDF structural objects
      expect(pdfString).toContain('/Type /Catalog');
      expect(pdfString).toContain('/Type /Pages');
      expect(pdfString).toContain('/Type /Page');
      expect(pdfString).toContain('/Type /Font');
      expect(pdfString).toContain('/BaseFont /Helvetica');
      expect(pdfString).toContain('/BaseFont /Helvetica-Bold');

      // Contains Product details
      expect(pdfString).toContain('ALLANA SONS PRIVATE LIMITED');
      expect(pdfString).toContain('AL-BUF-TOP-02');
      expect(pdfString).toContain('Frozen Boneless Buffalo Topside \\(Special\\)');
      expect(pdfString).toContain('Hindquarter Cuts');
      expect(pdfString).toContain('20 kg');
      expect(pdfString).toContain('21.2 kg');
      expect(pdfString).toContain('24 Months');
      expect(pdfString).toContain('22.4 MT');
      expect(pdfString).toContain('Commercial Export Standard');

      // Cross-reference table and EOF
      expect(pdfString).toContain('xref');
      expect(pdfString).toContain('trailer');
      expect(pdfString).toContain('startxref');
      expect(pdfString.trim().endsWith('%%EOF')).toBe(true);
    });

    it('handles under development status and empty subcategory or description fallbacks', () => {
      const underDevProduct: ProductDetailDTO = {
        ...mockProduct,
        subcategoryName: null,
        subcategorySlug: null,
        description: '',
        certifications: [],
        isUnderDevelopment: true,
      };

      const buffer = generateProductSpecSheetPdf(underDevProduct);
      const pdfString = buffer.toString('utf-8');

      expect(pdfString).toContain('Under Development \\(QA Review\\)');
      expect(pdfString).toContain('Premium export grade cut processed under international standards.');
      expect(pdfString).toContain('HALAL, ISO 22000, HACCP, SFDA');
    });
  });
});
