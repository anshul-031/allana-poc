import { describe, it, expect } from 'vitest';
import {
  FALLBACK_CATALOG_ITEMS,
  toCatalogSearchDTO,
  filterFallbackCatalog,
} from '@/lib/fallback-catalog';

describe('src/lib/fallback-catalog.ts - Fallback Catalog Dataset & Helpers', () => {
  it('contains comprehensive export cuts with authentic specifications', () => {
    expect(FALLBACK_CATALOG_ITEMS.length).toBeGreaterThanOrEqual(20);
    FALLBACK_CATALOG_ITEMS.forEach((cut) => {
      expect(cut.id).toBeDefined();
      expect(cut.sku).toMatch(/^[A-Z]{2}-/);
      expect(cut.name).toBeTruthy();
      expect(cut.slug).toBeTruthy();
      expect(cut.brand).toBeTruthy();
      expect(cut.categoryName).toBeTruthy();
      expect(cut.cartonNetWeightKg).toBeGreaterThan(0);
    });
  });

  it('converts fallback item to CatalogSearchProductDTO using toCatalogSearchDTO', () => {
    const item = FALLBACK_CATALOG_ITEMS[0];
    const dto = toCatalogSearchDTO(item);
    expect(dto.id).toBe(item.id);
    expect(dto.sku).toBe(item.sku);
    expect(dto.name).toBe(item.name);
    expect(dto.brand).toBe(item.brand);
    expect(dto.packagingDescription).toBeTruthy();
  });

  it('filters by category, subcategory, brand, packaging, state, and search query', () => {
    // 1. By category
    const catResult = filterFallbackCatalog({ category: 'frozen-buffalo' });
    expect(catResult.total).toBeGreaterThan(0);
    expect(catResult.products.every((p) => p.categoryName.includes('Buffalo'))).toBe(true);

    // 2. By subcategory
    const subResult = filterFallbackCatalog({ subcategory: 'hindquarter' });
    expect(subResult.total).toBeGreaterThan(0);

    // 3. By brand
    const brandResult = filterFallbackCatalog({ brand: 'Allana' });
    expect(brandResult.total).toBeGreaterThan(0);
    expect(brandResult.products.every((p) => p.brand.toLowerCase().includes('allana'))).toBe(true);

    // 4. By packaging
    const pkgResult = filterFallbackCatalog({ packaging: 'vacuum' });
    expect(pkgResult.total).toBeGreaterThan(0);

    // 5. By state
    const stateResult = filterFallbackCatalog({ state: 'frozen' });
    expect(stateResult.total).toBeGreaterThan(0);

    // 6. By search query
    const searchResult = filterFallbackCatalog({ search: 'topside' });
    expect(searchResult.total).toBeGreaterThan(0);
    expect(searchResult.products.some((p) => p.name.toLowerCase().includes('topside'))).toBe(true);
  });

  it('sorts results by name_desc, sku_asc, sku_desc, and default name_asc', () => {
    const descResult = filterFallbackCatalog({ sortBy: 'name_desc' });
    expect(descResult.products[0].name.localeCompare(descResult.products[1].name)).toBeGreaterThanOrEqual(0);

    const skuAscResult = filterFallbackCatalog({ sortBy: 'sku_asc' });
    expect(skuAscResult.products[0].sku.localeCompare(skuAscResult.products[1].sku)).toBeLessThanOrEqual(0);

    const skuDescResult = filterFallbackCatalog({ sortBy: 'sku_desc' });
    expect(skuDescResult.products[0].sku.localeCompare(skuDescResult.products[1].sku)).toBeGreaterThanOrEqual(0);

    const defaultResult = filterFallbackCatalog({ sortBy: 'name_asc' });
    expect(defaultResult.products[0].name.localeCompare(defaultResult.products[1].name)).toBeLessThanOrEqual(0);
  });

  it('supports pagination with custom page and limit', () => {
    const p1 = filterFallbackCatalog({ page: 1, limit: 5 });
    expect(p1.products.length).toBe(5);
    expect(p1.page).toBe(1);
    expect(p1.pageSize).toBe(5);
    expect(p1.totalPages).toBe(Math.ceil(p1.total / 5));

    const p2 = filterFallbackCatalog({ page: 2, limit: 5 });
    expect(p2.products.length).toBe(5);
    expect(p2.page).toBe(2);
    expect(p2.products[0].id).not.toBe(p1.products[0].id);

    const unlimited = filterFallbackCatalog({ limit: -1 });
    expect(unlimited.products.length).toBe(unlimited.total);
  });
});
