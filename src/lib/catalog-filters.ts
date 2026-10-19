export interface CatalogFilterState {
  categories: string[];
  subcategories: string[];
  packagingTypes: string[];
  productStates: string[];
  brands: string[];
  searchQuery?: string;
}

export const INITIAL_FILTER_STATE: CatalogFilterState = {
  categories: [],
  subcategories: [],
  packagingTypes: [],
  productStates: [],
  brands: [],
  searchQuery: '',
};

export const CATALOG_FILTER_OPTIONS = {
  categories: [
    { id: 'frozen-buffalo', label: 'Frozen Buffalo Meat Products' },
    { id: 'further-processing', label: 'Further Processing Products' },
    { id: 'new-products', label: 'New Products' },
    { id: 'customized-products', label: 'Customized Products' },
  ],
  subcategories: [
    { id: 'hindquarter', label: 'Hindquarter Cuts' },
    { id: 'forequarter', label: 'Forequarter Cuts' },
    { id: 'tenderloin', label: 'Tenderloin & Fillet' },
    { id: 'offal', label: 'Offal & Edible Byproducts' },
    { id: 'special-trimmings', label: 'Special Trimmings' },
    { id: 'mince', label: 'Mince & Burger Raw Material' },
  ],
  packagingTypes: [
    { id: 'vacuum-block', label: 'Vacuum Block' },
    { id: 'carton', label: 'Carton' },
    { id: 'polybag', label: 'Polybag' },
    { id: 'tray', label: 'Tray' },
    { id: 'packaged-stretch', label: 'Packaged Stretch' },
    { id: 'carton-box', label: 'Carton Box' },
  ],
  productStates: [
    { id: 'bf', label: 'BF (Block Frozen)' },
    { id: 'iqf', label: 'IQF (Individually Quick Frozen)' },
    { id: 'ipbf', label: 'IPBF (Individually Polywrapped Block Frozen)' },
    { id: 'bqf', label: 'BQF (Block Quick Frozen)' },
  ],
  brands: [
    { id: 'allana', label: 'Allana' },
    { id: 'al-tamam', label: 'Al-Tamam' },
    { id: 'omar', label: 'OMAR' },
    { id: 'premium-gold', label: 'Premium Gold' },
  ],
};

/**
 * Parses URL search params into typed filter state
 */
export function parseFilterParams(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>
): CatalogFilterState {
  const getArray = (key: string): string[] => {
    if (searchParams instanceof URLSearchParams) {
      const val = searchParams.get(key);
      return val ? val.split(',').filter(Boolean) : [];
    }
    const val = searchParams[key];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string' && val.trim()) return val.split(',').filter(Boolean);
    return [];
  };

  const getSingle = (key: string): string => {
    if (searchParams instanceof URLSearchParams) {
      return searchParams.get(key) || '';
    }
    const val = searchParams[key];
    if (Array.isArray(val)) return val[0] || '';
    return typeof val === 'string' ? val : '';
  };

  return {
    categories: getArray('category'),
    subcategories: getArray('subcategory'),
    packagingTypes: getArray('packaging'),
    productStates: getArray('state'),
    brands: getArray('brand'),
    searchQuery: getSingle('q'),
  };
}

/**
 * Serializes filter state into URL search query string
 */
export function serializeFilterParams(state: CatalogFilterState): string {
  const params = new URLSearchParams();

  if (state.categories.length > 0) {
    params.set('category', state.categories.join(','));
  }
  if (state.subcategories.length > 0) {
    params.set('subcategory', state.subcategories.join(','));
  }
  if (state.packagingTypes.length > 0) {
    params.set('packaging', state.packagingTypes.join(','));
  }
  if (state.productStates.length > 0) {
    params.set('state', state.productStates.join(','));
  }
  if (state.brands.length > 0) {
    params.set('brand', state.brands.join(','));
  }
  if (state.searchQuery && state.searchQuery.trim()) {
    params.set('q', state.searchQuery.trim());
  }

  const str = params.toString();
  return str ? `?${str}` : '';
}

export interface ActiveFilterTag {
  id: string;
  categoryKey: 'categories' | 'subcategories' | 'packagingTypes' | 'productStates' | 'brands';
  value: string;
  label: string;
}

/**
 * Returns human-readable removable tags for all active filter options
 */
export function getActiveFilterTags(state: CatalogFilterState): ActiveFilterTag[] {
  const tags: ActiveFilterTag[] = [];

  const findLabel = (options: { id: string; label: string }[], val: string) => {
    const opt = options.find((o) => o.id.toLowerCase() === val.toLowerCase());
    return opt ? opt.label : val;
  };

  state.categories.forEach((cat) => {
    tags.push({
      id: `cat-${cat}`,
      categoryKey: 'categories',
      value: cat,
      label: findLabel(CATALOG_FILTER_OPTIONS.categories, cat),
    });
  });

  state.subcategories.forEach((sub) => {
    tags.push({
      id: `sub-${sub}`,
      categoryKey: 'subcategories',
      value: sub,
      label: findLabel(CATALOG_FILTER_OPTIONS.subcategories, sub),
    });
  });

  state.packagingTypes.forEach((pkg) => {
    tags.push({
      id: `pkg-${pkg}`,
      categoryKey: 'packagingTypes',
      value: pkg,
      label: findLabel(CATALOG_FILTER_OPTIONS.packagingTypes, pkg),
    });
  });

  state.productStates.forEach((st) => {
    tags.push({
      id: `st-${st}`,
      categoryKey: 'productStates',
      value: st,
      label: findLabel(CATALOG_FILTER_OPTIONS.productStates, st),
    });
  });

  state.brands.forEach((b) => {
    tags.push({
      id: `brand-${b}`,
      categoryKey: 'brands',
      value: b,
      label: findLabel(CATALOG_FILTER_OPTIONS.brands, b),
    });
  });

  return tags;
}

/**
 * Checks if a product matches the specified active filter state in-memory
 */
export function matchesCatalogFilter(
  product: {
    categorySlug?: string;
    subcategorySlug?: string | null;
    primaryPackaging?: string;
    productState?: string;
    brand?: string;
    name?: string;
    sku?: string;
  },
  state: CatalogFilterState
): boolean {
  if (state.categories.length > 0 && product.categorySlug) {
    if (!state.categories.includes(product.categorySlug)) return false;
  }

  if (state.subcategories.length > 0 && product.subcategorySlug) {
    if (!state.subcategories.includes(product.subcategorySlug)) return false;
  }

  if (state.brands.length > 0 && product.brand) {
    const matchesBrand = state.brands.some(
      (b) => b.toLowerCase() === product.brand?.toLowerCase()
    );
    if (!matchesBrand) return false;
  }

  if (state.productStates.length > 0 && product.productState) {
    const matchesState = state.productStates.some((ps) =>
      product.productState?.toLowerCase().includes(ps.toLowerCase())
    );
    if (!matchesState) return false;
  }

  if (state.packagingTypes.length > 0 && product.primaryPackaging) {
    const matchesPkg = state.packagingTypes.some((pkg) =>
      product.primaryPackaging?.toLowerCase().includes(pkg.toLowerCase().replace('-', ' '))
    );
    if (!matchesPkg) return false;
  }

  if (state.searchQuery && state.searchQuery.trim()) {
    const q = state.searchQuery.toLowerCase().trim();
    const nameMatch = product.name?.toLowerCase().includes(q);
    const skuMatch = product.sku?.toLowerCase().includes(q);
    if (!nameMatch && !skuMatch) return false;
  }

  return true;
}
