import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CatalogViewControls, {
  CATALOG_DISCLAIMER_TEXT,
} from '@/components/catalog/CatalogViewControls';
import ProductCard from '@/components/catalog/ProductCard';
import ProductGrid from '@/components/catalog/ProductGrid';
import ProductTable from '@/components/catalog/ProductTable';
import CatalogPage from '@/app/(portal)/catalog/page';
import * as catalogActions from '@/server/actions/catalog.actions';

const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

vi.mock('@/components/catalog/CatalogLanding', () => ({
  default: () => <div data-testid="mock-catalog-landing">Catalog Landing</div>,
}));

vi.mock('@/server/actions/catalog.actions', async (importOriginal) => {
  const actual = await importOriginal<typeof catalogActions>();
  return {
    ...actual,
    getCatalogProducts: vi.fn(),
  };
});

describe('CatalogView Components & Page (FEAT-3.3)', () => {
  const sampleProducts: catalogActions.CatalogSearchProductDTO[] = [
    {
      id: 'prod-topside',
      sku: 'AL-BUF-TOP-02',
      name: 'Frozen Boneless Buffalo Topside',
      slug: 'frozen-boneless-buffalo-topside',
      brand: 'Allana',
      categoryName: 'Frozen Buffalo Meat',
      subcategoryName: 'Hindquarter Cuts',
      primaryPackaging: 'Vacuum Pack (IWP)',
      cartonNetWeightKg: 20,
      packagesPerCarton: 4,
      cutSize: 'Uncalibrated',
      productState: 'Frozen (-18°C)',
      packagingDescription: 'Vacuum Pack (IWP), corrugated box 20 kg, TM "Allana"',
      imageUrl: 'products/topside.webp',
      isUnderDevelopment: false,
    },
    {
      id: 'prod-silverside',
      sku: 'AL-BUF-SIL-01',
      name: 'Frozen Boneless Buffalo Silverside',
      slug: 'frozen-boneless-buffalo-silverside',
      brand: 'Allana',
      categoryName: 'Frozen Buffalo Meat',
      subcategoryName: null, // Test fallback to categoryName
      primaryPackaging: 'Vacuum Pack (IWP)',
      cartonNetWeightKg: 20,
      packagesPerCarton: 4,
      cutSize: 'Uncalibrated',
      productState: 'Frozen (-18°C)',
      packagingDescription: 'Vacuum Pack (IWP), corrugated box 20 kg, TM "Allana"',
      imageUrl: null,
      isUnderDevelopment: true,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  describe('CatalogViewControls Component', () => {
    it('renders disclaimer banner with required text', () => {
      render(
        <CatalogViewControls
          viewMode="grid"
          onViewModeChange={vi.fn()}
          pageSize={12}
          onPageSizeChange={vi.fn()}
          sortBy="name_asc"
          onSortByChange={vi.fn()}
          totalProducts={15}
          currentPage={1}
          totalPages={2}
          onPageChange={vi.fn()}
        />
      );

      expect(screen.getByTestId('catalog-disclaimer-banner')).toBeInTheDocument();
      expect(screen.getByText(CATALOG_DISCLAIMER_TEXT)).toBeInTheDocument();
      expect(screen.getByTestId('catalog-results-counter')).toHaveTextContent('Found 15 products');
    });

    it('toggles view mode between grid and table', () => {
      const onViewModeChange = vi.fn();
      render(
        <CatalogViewControls
          viewMode="grid"
          onViewModeChange={onViewModeChange}
          pageSize={12}
          onPageSizeChange={vi.fn()}
          sortBy="name_asc"
          onSortByChange={vi.fn()}
          totalProducts={15}
          currentPage={1}
          totalPages={2}
          onPageChange={vi.fn()}
        />
      );

      fireEvent.click(screen.getByTestId('view-toggle-table'));
      expect(onViewModeChange).toHaveBeenCalledWith('table');

      fireEvent.click(screen.getByTestId('view-toggle-grid'));
      expect(onViewModeChange).toHaveBeenCalledWith('grid');
    });

    it('triggers page size changes for 12, 24, and All', () => {
      const onPageSizeChange = vi.fn();
      render(
        <CatalogViewControls
          viewMode="grid"
          onViewModeChange={vi.fn()}
          pageSize={12}
          onPageSizeChange={onPageSizeChange}
          sortBy="name_asc"
          onSortByChange={vi.fn()}
          totalProducts={15}
          currentPage={1}
          totalPages={2}
          onPageChange={vi.fn()}
        />
      );

      fireEvent.click(screen.getByTestId('page-size-24'));
      expect(onPageSizeChange).toHaveBeenCalledWith(24);

      fireEvent.click(screen.getByTestId('page-size-all'));
      expect(onPageSizeChange).toHaveBeenCalledWith(100);
    });

    it('triggers sorting change via select dropdown', () => {
      const onSortByChange = vi.fn();
      render(
        <CatalogViewControls
          viewMode="grid"
          onViewModeChange={vi.fn()}
          pageSize={12}
          onPageSizeChange={vi.fn()}
          sortBy="name_asc"
          onSortByChange={onSortByChange}
          totalProducts={15}
          currentPage={1}
          totalPages={2}
          onPageChange={vi.fn()}
        />
      );

      fireEvent.change(screen.getByTestId('catalog-sort-select'), {
        target: { value: 'sku_desc' },
      });
      expect(onSortByChange).toHaveBeenCalledWith('sku_desc');
    });

    it('handles dual pagination: Load More button and numbered page buttons', () => {
      const onPageChange = vi.fn();
      const onLoadMore = vi.fn();

      const { rerender } = render(
        <CatalogViewControls
          viewMode="grid"
          onViewModeChange={vi.fn()}
          pageSize={12}
          onPageSizeChange={vi.fn()}
          sortBy="name_asc"
          onSortByChange={vi.fn()}
          totalProducts={24}
          currentPage={1}
          totalPages={2}
          onPageChange={onPageChange}
          onLoadMore={onLoadMore}
          hasMore={true}
          isLoadingMore={false}
        />
      );

      expect(screen.getByTestId('dual-pagination-controls')).toBeInTheDocument();

      // Click Load More
      fireEvent.click(screen.getByTestId('load-more-products-btn'));
      expect(onLoadMore).toHaveBeenCalled();

      // Click Next page button
      fireEvent.click(screen.getByTestId('pagination-next-btn'));
      expect(onPageChange).toHaveBeenCalledWith(2);

      // Click specific page number 2
      fireEvent.click(screen.getByTestId('pagination-page-2'));
      expect(onPageChange).toHaveBeenCalledWith(2);

      // Rerender at page 2 to test prev button
      rerender(
        <CatalogViewControls
          viewMode="grid"
          onViewModeChange={vi.fn()}
          pageSize={12}
          onPageSizeChange={vi.fn()}
          sortBy="name_asc"
          onSortByChange={vi.fn()}
          totalProducts={24}
          currentPage={2}
          totalPages={2}
          onPageChange={onPageChange}
          onLoadMore={onLoadMore}
          hasMore={false}
          isLoadingMore={false}
        />
      );

      fireEvent.click(screen.getByTestId('pagination-prev-btn'));
      expect(onPageChange).toHaveBeenCalledWith(1);
    });
  });

  describe('ProductCard Component', () => {
    it('renders product details, Article badge, packaging spec, and details link', () => {
      render(<ProductCard product={sampleProducts[0]} />);

      expect(screen.getByTestId('product-card-prod-topside')).toBeInTheDocument();
      expect(screen.getByText('Frozen Boneless Buffalo Topside')).toBeInTheDocument();
      expect(screen.getByTestId('product-card-article-prod-topside')).toHaveTextContent(
        'Article: AL-BUF-TOP-02'
      );
      expect(screen.getByTestId('product-card-packaging-prod-topside')).toHaveTextContent(
        'Vacuum Pack (IWP), corrugated box 20 kg, TM "Allana"'
      );
      expect(screen.getByTestId('product-card-details-btn-prod-topside')).toHaveAttribute(
        'href',
        '/catalog/frozen-boneless-buffalo-topside'
      );
    });

    it('renders NPD In Review badge and falls back to categoryName when subcategoryName is null', () => {
      render(<ProductCard product={sampleProducts[1]} />);

      expect(screen.getByText('NPD In Review')).toBeInTheDocument();
      expect(screen.getByText('Frozen Buffalo Meat')).toBeInTheDocument();
    });
  });

  describe('ProductGrid Component', () => {
    it('renders list of product cards in grid layout', () => {
      render(<ProductGrid products={sampleProducts} />);

      expect(screen.getByTestId('product-grid')).toBeInTheDocument();
      expect(screen.getByTestId('product-card-prod-topside')).toBeInTheDocument();
      expect(screen.getByTestId('product-card-prod-silverside')).toBeInTheDocument();
    });

    it('renders loading skeleton when isLoading is true', () => {
      render(<ProductGrid products={[]} isLoading={true} />);

      expect(screen.getByTestId('product-grid-loading')).toBeInTheDocument();
    });

    it('renders empty state when products list is empty', () => {
      render(<ProductGrid products={[]} isLoading={false} />);

      expect(screen.getByTestId('product-grid-empty')).toBeInTheDocument();
      expect(screen.getByText('No products found matching filters')).toBeInTheDocument();
    });
  });

  describe('ProductTable Component', () => {
    it('renders product rows in dense table format and exercises subcategory fallback', () => {
      render(<ProductTable products={sampleProducts} />);

      expect(screen.getByTestId('product-table')).toBeInTheDocument();
      expect(screen.getByTestId('product-table-row-prod-topside')).toBeInTheDocument();
      expect(screen.getByTestId('product-table-row-prod-silverside')).toBeInTheDocument();
      expect(screen.getByText('Frozen Buffalo Meat')).toBeInTheDocument();
      expect(screen.getByTestId('product-table-details-btn-prod-topside')).toHaveAttribute(
        'href',
        '/catalog/frozen-boneless-buffalo-topside'
      );
    });

    it('renders loading indicator when isLoading is true', () => {
      render(<ProductTable products={[]} isLoading={true} />);

      expect(screen.getByTestId('product-table-loading')).toBeInTheDocument();
    });

    it('renders empty state when products list is empty', () => {
      render(<ProductTable products={[]} isLoading={false} />);

      expect(screen.getByTestId('product-table-empty')).toBeInTheDocument();
      expect(screen.getByText('No products found matching filters')).toBeInTheDocument();
    });
  });

  describe('CatalogPage Assembly (src/app/(portal)/catalog/page.tsx)', () => {
    it('fetches and renders products on mount, supports view mode toggle, subcategory pills, page size, and clear all', async () => {
      vi.mocked(catalogActions.getCatalogProducts).mockResolvedValue({
        success: true,
        products: sampleProducts,
        total: 2,
        page: 1,
        pageSize: 12,
        totalPages: 1,
      });

      render(<CatalogPage />);

      expect(screen.getByTestId('catalog-page-container')).toBeInTheDocument();
      expect(screen.getByTestId('mock-catalog-landing')).toBeInTheDocument();
      expect(screen.getByTestId('subcategory-pills-bar')).toBeInTheDocument();
      expect(screen.getByTestId('filter-sidebar')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByTestId('product-grid')).toBeInTheDocument();
      });

      // Switch to table mode
      fireEvent.click(screen.getByTestId('view-toggle-table'));
      expect(screen.getByTestId('product-table')).toBeInTheDocument();

      // Change page size in CatalogPage
      fireEvent.click(screen.getByTestId('page-size-24'));

      // Click subcategory pill
      fireEvent.click(screen.getByTestId('subcategory-pill-hindquarter'));
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('subcategory=hindquarter'));

      // Click a filter checkbox then Clear All in sidebar
      fireEvent.click(screen.getByTestId('filter-checkbox-allana'));
      expect(screen.getByTestId('filter-clear-all-btn')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('filter-clear-all-btn'));
      expect(mockPush).toHaveBeenCalledWith('/catalog');
    });

    it('handles load more click when hasMore is true', async () => {
      vi.mocked(catalogActions.getCatalogProducts)
        .mockResolvedValueOnce({
          success: true,
          products: [sampleProducts[0]],
          total: 2,
          page: 1,
          pageSize: 1,
          totalPages: 2,
        })
        .mockResolvedValueOnce({
          success: true,
          products: [sampleProducts[1]],
          total: 2,
          page: 2,
          pageSize: 1,
          totalPages: 2,
        });

      render(<CatalogPage />);

      await waitFor(() => {
        expect(screen.getByTestId('load-more-products-btn')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('load-more-products-btn'));

      await waitFor(() => {
        expect(catalogActions.getCatalogProducts).toHaveBeenCalledWith(
          expect.objectContaining({ page: 2 })
        );
      });
    });

    it('renders fallback mock catalog items when getCatalogProducts returns empty or fails', async () => {
      vi.mocked(catalogActions.getCatalogProducts).mockResolvedValue({
        success: false,
        products: [],
        total: 0,
        page: 1,
        pageSize: 12,
        totalPages: 0,
      });

      render(<CatalogPage />);

      await waitFor(() => {
        expect(screen.getByTestId('product-grid')).toBeInTheDocument();
      });
    });
  });
});
