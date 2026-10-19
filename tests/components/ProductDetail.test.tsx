import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PackagingSwitcher from '@/components/catalog/PackagingSwitcher';
import ProductSpecTable from '@/components/catalog/ProductSpecTable';
import LoadingPatternCard from '@/components/catalog/LoadingPatternCard';
import ProductDetailView from '@/components/catalog/ProductDetailView';
import ProductDetailPage from '@/app/(portal)/catalog/[slug]/page';
import * as catalogActions from '@/server/actions/catalog.actions';
import { ProductDetailDTO, ProductPackagingOption } from '@/server/actions/catalog.actions';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  notFound: vi.fn(),
}));

const mockPackagingOptions: ProductPackagingOption[] = [
  {
    id: 'vacuum-block',
    label: 'Vacuum Block (IWP)',
    format: 'Individually vacuum packed in food-grade multilayer barrier shrink film',
    imageUrl: 'products/packaging/sample-vacuum.webp',
  },
  {
    id: 'carton',
    label: 'Master Carton',
    format: 'Heavy-duty 5-ply corrugated export carton with strap reinforcement',
    imageUrl: 'products/packaging/sample-carton.webp',
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
  packagingOptions: mockPackagingOptions,
};

describe('FEAT-3.4 Product Detail Page Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('PackagingSwitcher', () => {
    it('returns null if options array is empty', () => {
      const { container } = render(<PackagingSwitcher options={[]} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders all packaging formats and allows switching', () => {
      const onSelect = vi.fn();
      render(<PackagingSwitcher options={mockPackagingOptions} onSelectOption={onSelect} />);

      expect(screen.getByTestId('packaging-switcher')).toBeInTheDocument();
      expect(screen.getByText('Packaging Formats & Secondary Containers')).toBeInTheDocument();

      const vacuumOpt = screen.getByTestId('packaging-opt-vacuum-block');
      const cartonOpt = screen.getByTestId('packaging-opt-carton');
      const polybagOpt = screen.getByTestId('packaging-opt-polybag');
      const trayOpt = screen.getByTestId('packaging-opt-tray');

      expect(vacuumOpt).toHaveAttribute('aria-checked', 'true');
      expect(cartonOpt).toHaveAttribute('aria-checked', 'false');

      // Click Carton
      fireEvent.click(cartonOpt);
      expect(cartonOpt).toHaveAttribute('aria-checked', 'true');
      expect(onSelect).toHaveBeenCalledWith(mockPackagingOptions[1]);

      // Check note displayed
      expect(screen.getByTestId('packaging-format-note')).toHaveTextContent(
        'Heavy-duty 5-ply corrugated export carton'
      );

      // Click Polybag
      fireEvent.click(polybagOpt);
      expect(polybagOpt).toHaveAttribute('aria-checked', 'true');
      expect(onSelect).toHaveBeenCalledWith(mockPackagingOptions[2]);

      // Click Tray
      fireEvent.click(trayOpt);
      expect(trayOpt).toHaveAttribute('aria-checked', 'true');
      expect(onSelect).toHaveBeenCalledWith(mockPackagingOptions[3]);
    });

    it('handles packaging selection without onSelectOption callback gracefully', () => {
      render(<PackagingSwitcher options={mockPackagingOptions} />);
      const cartonOpt = screen.getByTestId('packaging-opt-carton');
      fireEvent.click(cartonOpt);
      expect(cartonOpt).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('ProductSpecTable', () => {
    it('renders all 10 logistics specification columns with correct values', () => {
      render(<ProductSpecTable product={mockProduct} />);

      expect(screen.getByTestId('product-spec-table')).toBeInTheDocument();
      expect(screen.getByTestId('spec-sku')).toHaveTextContent('AL-BUF-TOP-02');
      expect(screen.getByTestId('spec-net-wt')).toHaveTextContent('20 kg');
      expect(screen.getByTestId('spec-primary-packaging')).toHaveTextContent('Vacuum Pack (IWP)');
      expect(screen.getByTestId('spec-cut-size')).toHaveTextContent('1.5kg - 2.5kg per piece');
      expect(screen.getByTestId('spec-pkgs-carton')).toHaveTextContent('4');
      expect(screen.getByTestId('spec-gross-wt')).toHaveTextContent('21.2 kg');
      expect(screen.getByTestId('spec-dimensions')).toHaveTextContent('580 x 380 x 140');
      expect(screen.getByTestId('spec-shelf-life')).toHaveTextContent('24 Months');
      expect(screen.getByTestId('spec-storage-temp')).toHaveTextContent('-18°C or below');
      expect(screen.getByTestId('spec-freezing-type')).toHaveTextContent('BF (Block Frozen)');
    });

    it('applies subtle highlighting when activePackagingId is provided', () => {
      render(<ProductSpecTable product={mockProduct} activePackagingId="vacuum-block" />);
      const row = screen.getByTestId('product-spec-row');
      expect(row).toBeInTheDocument();
    });
  });

  describe('LoadingPatternCard', () => {
    it('calculates and renders 40ft High Cube reefer logistics correctly', () => {
      render(<LoadingPatternCard product={mockProduct} />);

      expect(screen.getByTestId('loading-pattern-card')).toBeInTheDocument();
      expect(screen.getByTestId('metric-cartons-per-pallet')).toHaveTextContent('40');
      expect(screen.getByTestId('metric-pallets-per-container')).toHaveTextContent('28');
      expect(screen.getByTestId('metric-total-cartons')).toHaveTextContent('1,120'); // 40 * 28 = 1120
      expect(screen.getByTestId('metric-total-payload-weight')).toHaveTextContent('22.4 MT');
    });
  });

  describe('ProductDetailView', () => {
    it('renders complete product details, breadcrumbs, action links, and quick specs', () => {
      render(<ProductDetailView product={mockProduct} />);

      expect(screen.getByTestId('product-breadcrumbs')).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Catalog')).toBeInTheDocument();
      expect(screen.getByText('Frozen Buffalo Meat')).toBeInTheDocument();
      expect(screen.getByText('Hindquarter Cuts')).toBeInTheDocument();
      expect(screen.getByTestId('breadcrumb-active')).toHaveTextContent(
        'Frozen Boneless Buffalo Topside'
      );

      // Action links
      const backLink = screen.getByTestId('back-to-catalog-link');
      expect(backLink).toHaveAttribute('href', '/catalog');

      const downloadBtn = screen.getByTestId('download-spec-sheet-btn');
      expect(downloadBtn).toHaveAttribute(
        'href',
        '/api/catalog/frozen-boneless-buffalo-topside/spec-sheet'
      );
      expect(downloadBtn).toHaveAttribute('download', 'Allana-Spec-AL-BUF-TOP-02.pdf');

      // Product titles & description
      expect(screen.getByTestId('pdp-product-title')).toHaveTextContent(
        'Frozen Boneless Buffalo Topside'
      );
      expect(screen.getByTestId('pdp-sku-badge')).toHaveTextContent('SKU: AL-BUF-TOP-02');
      expect(screen.getByTestId('pdp-product-description')).toHaveTextContent(
        'Premium export grade buffalo topside'
      );

      // Certifications
      expect(screen.getByTestId('cert-badge-HALAL')).toBeInTheDocument();
      expect(screen.getByTestId('cert-badge-ISO_22000')).toBeInTheDocument();
      expect(screen.getByTestId('cert-badge-HACCP')).toBeInTheDocument();
      expect(screen.getByTestId('cert-badge-SFDA')).toBeInTheDocument();

      // Food safety assurance
      expect(screen.getByTestId('food-safety-assurance')).toBeInTheDocument();
    });

    it('renders without subcategory breadcrumb when subcategory is null', () => {
      const productNoSub = {
        ...mockProduct,
        subcategoryName: null,
        subcategorySlug: null,
      };

      render(<ProductDetailView product={productNoSub} />);
      expect(screen.queryByText('Hindquarter Cuts')).not.toBeInTheDocument();
      expect(screen.getByTestId('breadcrumb-active')).toHaveTextContent(
        'Frozen Boneless Buffalo Topside'
      );
    });

    it('renders under development alert banner when product.isUnderDevelopment is true', () => {
      const underDevProduct = {
        ...mockProduct,
        isUnderDevelopment: true,
      };

      render(<ProductDetailView product={underDevProduct} />);
      expect(screen.getByTestId('under-development-banner')).toBeInTheDocument();
    });

    it('does not render under development alert banner when product.isUnderDevelopment is false', () => {
      render(<ProductDetailView product={mockProduct} />);
      expect(screen.queryByTestId('under-development-banner')).not.toBeInTheDocument();
    });

    it('updates packaging showcase when packaging option is clicked', () => {
      render(<ProductDetailView product={mockProduct} />);

      expect(screen.getByTestId('selected-packaging-label')).toHaveTextContent(
        'Vacuum Block (IWP)'
      );

      const cartonOpt = screen.getByTestId('packaging-opt-carton');
      fireEvent.click(cartonOpt);

      expect(screen.getByTestId('selected-packaging-label')).toHaveTextContent('Master Carton');
    });

    it('uses fallback default packaging option when product packagingOptions is empty', () => {
      const productEmptyPackaging = {
        ...mockProduct,
        packagingOptions: [],
      };

      render(<ProductDetailView product={productEmptyPackaging} />);
      expect(screen.getByTestId('selected-packaging-label')).toHaveTextContent(
        'Vacuum Block (IWP)'
      );
    });
  });

  describe('ProductDetailPage Route Server Component', () => {
    it('renders ProductDetailView when getProductBySlug succeeds', async () => {
      vi.spyOn(catalogActions, 'getProductBySlug').mockResolvedValueOnce({
        success: true,
        product: mockProduct,
      });

      const element = await ProductDetailPage({
        params: Promise.resolve({ slug: 'frozen-boneless-buffalo-topside' }),
      });

      render(element);

      expect(screen.getByTestId('product-detail-view')).toBeInTheDocument();
      expect(screen.getByTestId('pdp-product-title')).toHaveTextContent(
        'Frozen Boneless Buffalo Topside'
      );
    });

    it('renders not found error state when product is not found or fails', async () => {
      vi.spyOn(catalogActions, 'getProductBySlug').mockResolvedValueOnce({
        success: false,
        product: null,
        error: 'Product not found',
      });

      const element = await ProductDetailPage({
        params: Promise.resolve({ slug: 'unknown-cut' }),
      });

      render(element);

      expect(screen.getByTestId('pdp-not-found')).toBeInTheDocument();
      expect(screen.getByText('Product Specification Not Found')).toBeInTheDocument();
      expect(screen.getByTestId('return-to-catalog-link')).toHaveAttribute('href', '/catalog');
    });
  });
});
