import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SubcategoryPills, {
  AnatomicalCutIcon,
  DEFAULT_SUBCATEGORIES,
} from '@/components/catalog/SubcategoryPills';
import FilterSidebar from '@/components/catalog/FilterSidebar';
import CatalogLanding, { CATEGORY_HERO_CARDS } from '@/components/catalog/CatalogLanding';
import { INITIAL_FILTER_STATE, CatalogFilterState } from '@/lib/catalog-filters';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('@/components/catalog/CatalogSearch', () => ({
  default: () => <div data-testid="mock-catalog-search">Search Component</div>,
}));

describe('CatalogLanding, SubcategoryPills & FilterSidebar (FEAT-3.2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('SubcategoryPills Component', () => {
    it('renders all default pills with counts and icons', () => {
      const onSelect = vi.fn();
      render(<SubcategoryPills activeSubcategory={null} onSelectSubcategory={onSelect} />);

      expect(screen.getByTestId('subcategory-pills-bar')).toBeInTheDocument();
      expect(screen.getByTestId('subcategory-pill-all')).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('All Cuts')).toBeInTheDocument();
      expect(screen.getByText('Hindquarter Cuts')).toBeInTheDocument();
    });

    it('renders correct anatomical cut icon variants', () => {
      const { rerender } = render(<AnatomicalCutIcon subcategoryId="hindquarter" isActive={true} />);
      expect(screen.getByTestId('icon-hindquarter')).toBeInTheDocument();

      rerender(<AnatomicalCutIcon subcategoryId="forequarter" isActive={false} />);
      expect(screen.getByTestId('icon-forequarter')).toBeInTheDocument();

      rerender(<AnatomicalCutIcon subcategoryId="tenderloin" isActive={true} />);
      expect(screen.getByTestId('icon-tenderloin')).toBeInTheDocument();

      rerender(<AnatomicalCutIcon subcategoryId="offal" isActive={false} />);
      expect(screen.getByTestId('icon-offal')).toBeInTheDocument();

      rerender(<AnatomicalCutIcon subcategoryId="all" isActive={true} />);
      expect(screen.getByTestId('icon-full-carcass')).toBeInTheDocument();
    });

    it('clicking a specific subcategory calls onSelectSubcategory with subcategory ID', () => {
      const onSelect = vi.fn();
      render(<SubcategoryPills activeSubcategory="hindquarter" onSelectSubcategory={onSelect} />);

      expect(screen.getByTestId('subcategory-pill-hindquarter')).toHaveAttribute(
        'aria-selected',
        'true'
      );

      fireEvent.click(screen.getByTestId('subcategory-pill-forequarter'));
      expect(onSelect).toHaveBeenCalledWith('forequarter');

      fireEvent.click(screen.getByTestId('subcategory-pill-all'));
      expect(onSelect).toHaveBeenCalledWith(null);
    });
  });

  describe('FilterSidebar Component', () => {
    it('renders filter sidebar with sections and collapses on toggle', () => {
      const onChange = vi.fn();
      const onClear = vi.fn();
      render(
        <FilterSidebar
          filterState={INITIAL_FILTER_STATE}
          onChangeFilter={onChange}
          onClearAll={onClear}
        />
      );

      expect(screen.getByTestId('filter-sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('filter-group-categories')).toBeInTheDocument();

      // Toggle category collapse
      fireEvent.click(screen.getByTestId('filter-toggle-categories'));
      expect(screen.queryByTestId('filter-group-categories')).not.toBeInTheDocument();

      // Toggle again to expand
      fireEvent.click(screen.getByTestId('filter-toggle-categories'));
      expect(screen.getByTestId('filter-group-categories')).toBeInTheDocument();
    });

    it('handles checking and unchecking filter checkboxes across groups', () => {
      const onChange = vi.fn();
      const onClear = vi.fn();
      render(
        <FilterSidebar
          filterState={INITIAL_FILTER_STATE}
          onChangeFilter={onChange}
          onClearAll={onClear}
        />
      );

      // Check category
      fireEvent.click(screen.getByTestId('filter-checkbox-frozen-buffalo'));
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          categories: ['frozen-buffalo'],
        })
      );

      // Check brand
      fireEvent.click(screen.getByTestId('filter-checkbox-allana'));
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          brands: ['allana'],
        })
      );

      // Check packaging
      fireEvent.click(screen.getByTestId('filter-checkbox-vacuum-block'));
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          packagingTypes: ['vacuum-block'],
        })
      );

      // Check product state
      fireEvent.click(screen.getByTestId('filter-checkbox-bf'));
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          productStates: ['bf'],
        })
      );

      // Check subcategory
      fireEvent.click(screen.getByTestId('filter-checkbox-hindquarter'));
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          subcategories: ['hindquarter'],
        })
      );
    });

    it('unchecks an already active item when clicked again', () => {
      const onChange = vi.fn();
      const onClear = vi.fn();
      const activeState: CatalogFilterState = {
        ...INITIAL_FILTER_STATE,
        categories: ['frozen-buffalo'],
      };

      render(
        <FilterSidebar
          filterState={activeState}
          onChangeFilter={onChange}
          onClearAll={onClear}
        />
      );

      // Uncheck category
      fireEvent.click(screen.getByTestId('filter-checkbox-frozen-buffalo'));
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          categories: [],
        })
      );
    });

    it('renders active filter tags and allows removing individual tags', () => {
      const onChange = vi.fn();
      const onClear = vi.fn();
      const activeState: CatalogFilterState = {
        ...INITIAL_FILTER_STATE,
        categories: ['frozen-buffalo'],
        brands: ['allana'],
      };

      render(
        <FilterSidebar
          filterState={activeState}
          onChangeFilter={onChange}
          onClearAll={onClear}
        />
      );

      expect(screen.getByTestId('active-filter-tags-area')).toBeInTheDocument();
      expect(screen.getByTestId('active-filter-tag-cat-frozen-buffalo')).toBeInTheDocument();

      // Remove single tag
      fireEvent.click(screen.getByTestId('remove-filter-cat-frozen-buffalo'));
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          categories: [],
        })
      );
    });

    it('triggers onClearAll when solid green Clear All button is clicked', () => {
      const onChange = vi.fn();
      const onClear = vi.fn();
      const activeState: CatalogFilterState = {
        ...INITIAL_FILTER_STATE,
        brands: ['allana'],
      };

      render(
        <FilterSidebar
          filterState={activeState}
          onChangeFilter={onChange}
          onClearAll={onClear}
        />
      );

      const clearAllBtn = screen.getByTestId('filter-clear-all-btn');
      expect(clearAllBtn).toBeInTheDocument();

      fireEvent.click(clearAllBtn);
      expect(onClear).toHaveBeenCalled();
    });
  });

  describe('CatalogLanding Component', () => {
    it('renders search banner, 4 category hero cards, and brands showcase', () => {
      render(<CatalogLanding />);

      expect(screen.getByTestId('catalog-landing')).toBeInTheDocument();
      expect(screen.getByTestId('mock-catalog-search')).toBeInTheDocument();
      expect(screen.getByTestId('category-card-further-processing')).toBeInTheDocument();
      expect(screen.getByTestId('category-card-frozen-buffalo')).toBeInTheDocument();
      expect(screen.getByTestId('category-card-new-products')).toBeInTheDocument();
      expect(screen.getByTestId('category-card-customized-products')).toBeInTheDocument();
      expect(screen.getByTestId('catalog-brands-showcase')).toBeInTheDocument();
    });

    it('opens development notice modal when clicking an incomplete category card, and dismisses it', () => {
      render(<CatalogLanding />);

      // Click Further Processing (incomplete)
      fireEvent.click(screen.getByTestId('category-card-further-processing'));

      expect(screen.getByTestId('dev-notice-modal')).toBeInTheDocument();
      expect(screen.getByText('This part is under development')).toBeInTheDocument();
      expect(
        screen.getByText(/The Further Processing Products section is currently being expanded/i)
      ).toBeInTheDocument();

      // Close modal
      fireEvent.click(screen.getByTestId('dev-notice-close-btn'));
      expect(screen.queryByTestId('dev-notice-modal')).not.toBeInTheDocument();
    });

    it('navigates when clicking active category card (e.g. frozen-buffalo)', () => {
      render(<CatalogLanding />);

      fireEvent.click(screen.getByTestId('category-card-frozen-buffalo'));
      expect(mockPush).toHaveBeenCalledWith('/catalog?category=frozen-buffalo');
    });

    it('handles keyboard Enter and Space on category cards', () => {
      render(<CatalogLanding />);

      const card = screen.getByTestId('category-card-frozen-buffalo');
      fireEvent.keyDown(card, { key: 'Enter' });
      expect(mockPush).toHaveBeenCalledWith('/catalog?category=frozen-buffalo');
    });
  });
});
