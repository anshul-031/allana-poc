import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CatalogSearch, { highlightMatches } from '@/components/catalog/CatalogSearch';
import * as catalogActions from '@/server/actions/catalog.actions';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('@/server/actions/catalog.actions', () => ({
  searchCatalogProducts: vi.fn(),
  formatPackagingSummary: vi.fn((p) => `vacuum film, corrugated box ${p.cartonNetWeightKg || 20} kg, TM "Allana"`),
}));

describe('CatalogSearch Component & Helpers (FEAT-3.1)', () => {
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
      subcategoryName: 'Hindquarter Cuts',
      primaryPackaging: 'Vacuum Pack (IWP)',
      cartonNetWeightKg: 20,
      packagesPerCarton: 4,
      cutSize: 'Uncalibrated',
      productState: 'Frozen (-18°C)',
      packagingDescription: 'Vacuum Pack (IWP), corrugated box 20 kg, TM "Allana"',
      imageUrl: 'products/silverside.webp',
      isUnderDevelopment: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('highlightMatches helper', () => {
    it('returns raw text unchanged if query is empty or whitespace', () => {
      const result = highlightMatches('Frozen Boneless Buffalo Topside', '');
      expect(result).toBe('Frozen Boneless Buffalo Topside');
    });

    it('wraps matched substrings in <strong> tag with bold styling', () => {
      const { container } = render(
        <div>{highlightMatches('Frozen Buffalo Topside', 'Top')}</div>
      );
      const strongEl = container.querySelector('strong');
      expect(strongEl).toBeInTheDocument();
      expect(strongEl?.textContent).toBe('Top');
    });
  });

  describe('CatalogSearch Interactive Behaviors', () => {
    it('renders input, search icon, and placeholder correctly', () => {
      render(<CatalogSearch placeholder="Custom placeholder" debounceMs={10} />);

      expect(screen.getByTestId('catalog-search-container')).toBeInTheDocument();
      expect(screen.getByTestId('catalog-search-icon')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument();
      expect(screen.queryByTestId('catalog-search-clear-btn')).not.toBeInTheDocument();
    });

    it('triggers debounced search on input change and renders results dropdown with Article tag and packaging', async () => {
      vi.mocked(catalogActions.searchCatalogProducts).mockResolvedValueOnce({
        success: true,
        products: sampleProducts,
      });

      render(<CatalogSearch debounceMs={10} />);

      const input = screen.getByTestId('catalog-search-input');
      fireEvent.change(input, { target: { value: 'buffalo' } });

      expect(screen.getByTestId('catalog-search-clear-btn')).toBeInTheDocument();

      await waitFor(() => {
        expect(catalogActions.searchCatalogProducts).toHaveBeenCalledWith('buffalo');
      });

      expect(screen.getByTestId('catalog-search-dropdown')).toBeInTheDocument();
      expect(screen.getByTestId('catalog-search-item-prod-topside')).toBeInTheDocument();
      expect(screen.getByTestId('catalog-item-article-prod-topside')).toHaveTextContent(
        'Article: AL-BUF-TOP-02'
      );
      expect(screen.getByTestId('catalog-item-packaging-prod-topside')).toHaveTextContent(
        'Vacuum Pack (IWP), corrugated box 20 kg, TM "Allana"'
      );
    });

    it('clears query and resets dropdown when clicking clear button (X)', async () => {
      vi.mocked(catalogActions.searchCatalogProducts).mockResolvedValueOnce({
        success: true,
        products: sampleProducts,
      });

      render(<CatalogSearch debounceMs={10} />);
      const input = screen.getByTestId('catalog-search-input');
      fireEvent.change(input, { target: { value: 'top' } });

      await waitFor(() => {
        expect(screen.getByTestId('catalog-search-dropdown')).toBeInTheDocument();
      });

      const clearBtn = screen.getByTestId('catalog-search-clear-btn');
      fireEvent.click(clearBtn);

      expect(input).toHaveValue('');
      expect(screen.queryByTestId('catalog-search-dropdown')).not.toBeInTheDocument();
    });

    it('displays empty state when search returns no matching products', async () => {
      vi.mocked(catalogActions.searchCatalogProducts).mockResolvedValueOnce({
        success: true,
        products: [],
      });

      render(<CatalogSearch debounceMs={10} />);
      const input = screen.getByTestId('catalog-search-input');
      fireEvent.change(input, { target: { value: 'nonexistent-cut' } });

      await waitFor(() => {
        expect(screen.getByTestId('catalog-search-empty-state')).toBeInTheDocument();
      });
      expect(screen.getByTestId('catalog-search-empty-state')).toHaveTextContent(
        /No cuts found matching.*nonexistent-cut/i
      );
    });

    it('navigates to product detail page on item click', async () => {
      vi.mocked(catalogActions.searchCatalogProducts).mockResolvedValueOnce({
        success: true,
        products: sampleProducts,
      });

      render(<CatalogSearch debounceMs={10} />);
      const input = screen.getByTestId('catalog-search-input');
      fireEvent.change(input, { target: { value: 'topside' } });

      await waitFor(() => {
        expect(screen.getByTestId('catalog-search-item-prod-topside')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('catalog-search-item-prod-topside'));

      expect(mockPush).toHaveBeenCalledWith('/catalog/frozen-boneless-buffalo-topside');
      expect(screen.queryByTestId('catalog-search-dropdown')).not.toBeInTheDocument();
    });

    it('calls custom onSelectProduct callback when provided instead of default router.push', async () => {
      const handleSelect = vi.fn();
      vi.mocked(catalogActions.searchCatalogProducts).mockResolvedValueOnce({
        success: true,
        products: sampleProducts,
      });

      render(<CatalogSearch debounceMs={10} onSelectProduct={handleSelect} />);
      const input = screen.getByTestId('catalog-search-input');
      fireEvent.change(input, { target: { value: 'topside' } });

      await waitFor(() => {
        expect(screen.getByTestId('catalog-search-item-prod-topside')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('catalog-search-item-prod-topside'));

      expect(handleSelect).toHaveBeenCalledWith(sampleProducts[0]);
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('supports keyboard navigation (ArrowDown, ArrowUp, Enter, Escape)', async () => {
      vi.mocked(catalogActions.searchCatalogProducts).mockResolvedValueOnce({
        success: true,
        products: sampleProducts,
      });

      render(<CatalogSearch debounceMs={10} />);
      const input = screen.getByTestId('catalog-search-input');
      fireEvent.change(input, { target: { value: 'buffalo' } });

      await waitFor(() => {
        expect(screen.getByTestId('catalog-search-dropdown')).toBeInTheDocument();
      });

      // ArrowDown to first item
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      expect(screen.getByTestId('catalog-search-item-prod-topside')).toHaveAttribute(
        'aria-selected',
        'true'
      );

      // ArrowDown to second item
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      expect(screen.getByTestId('catalog-search-item-prod-silverside')).toHaveAttribute(
        'aria-selected',
        'true'
      );

      // ArrowUp back to first item
      fireEvent.keyDown(input, { key: 'ArrowUp' });
      expect(screen.getByTestId('catalog-search-item-prod-topside')).toHaveAttribute(
        'aria-selected',
        'true'
      );

      // Enter key submits selected item
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(mockPush).toHaveBeenCalledWith('/catalog/frozen-boneless-buffalo-topside');
    });

    it('navigates to /catalog?q=query when Enter is pressed without an item selected', async () => {
      vi.mocked(catalogActions.searchCatalogProducts).mockResolvedValueOnce({
        success: true,
        products: sampleProducts,
      });

      render(<CatalogSearch debounceMs={10} />);
      const input = screen.getByTestId('catalog-search-input');
      fireEvent.change(input, { target: { value: 'halal cuts' } });

      await waitFor(() => {
        expect(screen.getByTestId('catalog-search-dropdown')).toBeInTheDocument();
      });

      // Enter without ArrowDown
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(mockPush).toHaveBeenCalledWith('/catalog?q=halal%20cuts');
    });

    it('closes dropdown when Escape key is pressed', async () => {
      vi.mocked(catalogActions.searchCatalogProducts).mockResolvedValueOnce({
        success: true,
        products: sampleProducts,
      });

      render(<CatalogSearch debounceMs={10} />);
      const input = screen.getByTestId('catalog-search-input');
      fireEvent.change(input, { target: { value: 'buffalo' } });

      await waitFor(() => {
        expect(screen.getByTestId('catalog-search-dropdown')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'Escape' });
      expect(screen.queryByTestId('catalog-search-dropdown')).not.toBeInTheDocument();
    });

    it('closes dropdown when clicking outside the container and reopens on input focus', async () => {
      vi.mocked(catalogActions.searchCatalogProducts).mockResolvedValueOnce({
        success: true,
        products: sampleProducts,
      });

      render(
        <div>
          <CatalogSearch debounceMs={10} />
          <div data-testid="outside-element">Outside</div>
        </div>
      );

      const input = screen.getByTestId('catalog-search-input');
      fireEvent.change(input, { target: { value: 'buffalo' } });

      await waitFor(() => {
        expect(screen.getByTestId('catalog-search-dropdown')).toBeInTheDocument();
      });

      // Click outside
      fireEvent.mouseDown(screen.getByTestId('outside-element'));
      expect(screen.queryByTestId('catalog-search-dropdown')).not.toBeInTheDocument();

      // Focus on input reopens dropdown because results exist
      fireEvent.focus(input);
      expect(screen.getByTestId('catalog-search-dropdown')).toBeInTheDocument();
    });

    it('sets selected index on mouseEnter on item', async () => {
      vi.mocked(catalogActions.searchCatalogProducts).mockResolvedValueOnce({
        success: true,
        products: sampleProducts,
      });

      render(<CatalogSearch debounceMs={10} />);
      const input = screen.getByTestId('catalog-search-input');
      fireEvent.change(input, { target: { value: 'buffalo' } });

      await waitFor(() => {
        expect(screen.getByTestId('catalog-search-dropdown')).toBeInTheDocument();
      });

      const item2 = screen.getByTestId('catalog-search-item-prod-silverside');
      fireEvent.mouseEnter(item2);
      expect(item2).toHaveAttribute('aria-selected', 'true');
    });

    it('reopens dropdown on ArrowDown when previously closed but results exist', async () => {
      vi.mocked(catalogActions.searchCatalogProducts).mockResolvedValueOnce({
        success: true,
        products: sampleProducts,
      });

      render(<CatalogSearch debounceMs={10} />);
      const input = screen.getByTestId('catalog-search-input');
      fireEvent.change(input, { target: { value: 'buffalo' } });

      await waitFor(() => {
        expect(screen.getByTestId('catalog-search-dropdown')).toBeInTheDocument();
      });

      // Close with Escape
      fireEvent.keyDown(input, { key: 'Escape' });
      expect(screen.queryByTestId('catalog-search-dropdown')).not.toBeInTheDocument();

      // ArrowDown reopens and selects index 0
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      expect(screen.getByTestId('catalog-search-dropdown')).toBeInTheDocument();
      expect(screen.getByTestId('catalog-search-item-prod-topside')).toHaveAttribute(
        'aria-selected',
        'true'
      );
    });
  });
});
