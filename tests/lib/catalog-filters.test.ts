import { describe, it, expect } from 'vitest';
import {
  parseFilterParams,
  serializeFilterParams,
  getActiveFilterTags,
  matchesCatalogFilter,
  INITIAL_FILTER_STATE,
  CatalogFilterState,
} from '@/lib/catalog-filters';

describe('catalog-filters Utility Suite (FEAT-3.2)', () => {
  describe('parseFilterParams', () => {
    it('parses URLSearchParams instance correctly', () => {
      const params = new URLSearchParams('category=frozen-buffalo&packaging=vacuum-block,carton&q=topside');
      const state = parseFilterParams(params);

      expect(state.categories).toEqual(['frozen-buffalo']);
      expect(state.packagingTypes).toEqual(['vacuum-block', 'carton']);
      expect(state.searchQuery).toBe('topside');
      expect(state.subcategories).toEqual([]);
      expect(state.productStates).toEqual([]);
      expect(state.brands).toEqual([]);
    });

    it('parses record with arrays and strings', () => {
      const record = {
        category: ['frozen-buffalo'],
        subcategory: 'hindquarter,tenderloin',
        state: 'bf',
        brand: ['allana', 'omar'],
        q: 'silverside',
      };
      const state = parseFilterParams(record);

      expect(state.categories).toEqual(['frozen-buffalo']);
      expect(state.subcategories).toEqual(['hindquarter', 'tenderloin']);
      expect(state.productStates).toEqual(['bf']);
      expect(state.brands).toEqual(['allana', 'omar']);
      expect(state.searchQuery).toBe('silverside');
    });

    it('handles empty or missing parameters', () => {
      const state = parseFilterParams({});
      expect(state.categories).toEqual([]);
      expect(state.subcategories).toEqual([]);
      expect(state.packagingTypes).toEqual([]);
      expect(state.productStates).toEqual([]);
      expect(state.brands).toEqual([]);
      expect(state.searchQuery).toBe('');
    });
  });

  describe('serializeFilterParams', () => {
    it('returns empty string when no filters are set', () => {
      const query = serializeFilterParams(INITIAL_FILTER_STATE);
      expect(query).toBe('');
    });

    it('serializes all filter properties into query string', () => {
      const state: CatalogFilterState = {
        categories: ['frozen-buffalo'],
        subcategories: ['hindquarter'],
        packagingTypes: ['vacuum-block'],
        productStates: ['bf', 'iqf'],
        brands: ['allana'],
        searchQuery: 'ribs',
      };
      const query = serializeFilterParams(state);

      expect(query).toContain('category=frozen-buffalo');
      expect(query).toContain('subcategory=hindquarter');
      expect(query).toContain('packaging=vacuum-block');
      expect(query).toContain('state=bf%2Ciqf');
      expect(query).toContain('brand=allana');
      expect(query).toContain('q=ribs');
    });
  });

  describe('getActiveFilterTags', () => {
    it('returns empty tags when state is empty', () => {
      const tags = getActiveFilterTags(INITIAL_FILTER_STATE);
      expect(tags).toHaveLength(0);
    });

    it('maps known option IDs to human readable labels', () => {
      const state: CatalogFilterState = {
        categories: ['frozen-buffalo'],
        subcategories: ['hindquarter'],
        packagingTypes: ['vacuum-block'],
        productStates: ['bf'],
        brands: ['allana', 'custom-brand'],
      };

      const tags = getActiveFilterTags(state);
      expect(tags).toHaveLength(6);

      expect(tags[0].label).toBe('Frozen Buffalo Meat Products');
      expect(tags[1].label).toBe('Hindquarter Cuts');
      expect(tags[2].label).toBe('Vacuum Block');
      expect(tags[3].label).toBe('BF (Block Frozen)');
      expect(tags[4].label).toBe('Allana');
      expect(tags[5].label).toBe('custom-brand'); // fallback
    });
  });

  describe('matchesCatalogFilter', () => {
    const sampleProduct = {
      name: 'Frozen Boneless Buffalo Topside',
      sku: 'AL-BUF-TOP-02',
      categorySlug: 'frozen-buffalo',
      subcategorySlug: 'hindquarter',
      brand: 'Allana',
      productState: 'Frozen (-18°C) BF',
      primaryPackaging: 'Vacuum Block (IWP)',
    };

    it('matches when filter state is empty', () => {
      expect(matchesCatalogFilter(sampleProduct, INITIAL_FILTER_STATE)).toBe(true);
    });

    it('filters by categorySlug correctly', () => {
      expect(
        matchesCatalogFilter(sampleProduct, {
          ...INITIAL_FILTER_STATE,
          categories: ['frozen-buffalo'],
        })
      ).toBe(true);

      expect(
        matchesCatalogFilter(sampleProduct, {
          ...INITIAL_FILTER_STATE,
          categories: ['further-processing'],
        })
      ).toBe(false);
    });

    it('filters by subcategorySlug correctly', () => {
      expect(
        matchesCatalogFilter(sampleProduct, {
          ...INITIAL_FILTER_STATE,
          subcategories: ['hindquarter'],
        })
      ).toBe(true);

      expect(
        matchesCatalogFilter(sampleProduct, {
          ...INITIAL_FILTER_STATE,
          subcategories: ['forequarter'],
        })
      ).toBe(false);
    });

    it('filters by brand correctly (case-insensitive)', () => {
      expect(
        matchesCatalogFilter(sampleProduct, {
          ...INITIAL_FILTER_STATE,
          brands: ['allana'],
        })
      ).toBe(true);

      expect(
        matchesCatalogFilter(sampleProduct, {
          ...INITIAL_FILTER_STATE,
          brands: ['omar'],
        })
      ).toBe(false);
    });

    it('filters by productState correctly', () => {
      expect(
        matchesCatalogFilter(sampleProduct, {
          ...INITIAL_FILTER_STATE,
          productStates: ['bf'],
        })
      ).toBe(true);

      expect(
        matchesCatalogFilter(sampleProduct, {
          ...INITIAL_FILTER_STATE,
          productStates: ['iqf'],
        })
      ).toBe(false);
    });

    it('filters by primaryPackaging correctly', () => {
      expect(
        matchesCatalogFilter(sampleProduct, {
          ...INITIAL_FILTER_STATE,
          packagingTypes: ['vacuum-block'],
        })
      ).toBe(true);

      expect(
        matchesCatalogFilter(sampleProduct, {
          ...INITIAL_FILTER_STATE,
          packagingTypes: ['tray'],
        })
      ).toBe(false);
    });

    it('filters by search query matching name or SKU', () => {
      expect(
        matchesCatalogFilter(sampleProduct, {
          ...INITIAL_FILTER_STATE,
          searchQuery: 'topside',
        })
      ).toBe(true);

      expect(
        matchesCatalogFilter(sampleProduct, {
          ...INITIAL_FILTER_STATE,
          searchQuery: 'AL-BUF-TOP',
        })
      ).toBe(true);

      expect(
        matchesCatalogFilter(sampleProduct, {
          ...INITIAL_FILTER_STATE,
          searchQuery: 'nonexistent',
        })
      ).toBe(false);
    });
  });
});
