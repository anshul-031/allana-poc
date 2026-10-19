'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import CatalogLanding from '@/components/catalog/CatalogLanding';
import SubcategoryPills from '@/components/catalog/SubcategoryPills';
import FilterSidebar from '@/components/catalog/FilterSidebar';
import CatalogViewControls, { CatalogViewMode } from '@/components/catalog/CatalogViewControls';
import ProductGrid from '@/components/catalog/ProductGrid';
import ProductTable from '@/components/catalog/ProductTable';
import {
  CatalogFilterState,
  parseFilterParams,
  serializeFilterParams,
  INITIAL_FILTER_STATE,
  matchesCatalogFilter,
} from '@/lib/catalog-filters';
import {
  CatalogSearchProductDTO,
  getCatalogProducts,
} from '@/server/actions/catalog.actions';

function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();


  // Filter state synced from URL
  const [filterState, setFilterState] = useState<CatalogFilterState>(() =>
    parseFilterParams(searchParams)
  );

  const [viewMode, setViewMode] = useState<CatalogViewMode>('grid');
  const [pageSize, setPageSize] = useState<number>(12);
  const [sortBy, setSortBy] = useState<'name_asc' | 'name_desc' | 'sku_asc' | 'sku_desc'>('name_asc');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [products, setProducts] = useState<CatalogSearchProductDTO[]>([]);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const isAppendingRef = React.useRef<boolean>(false);

  // Sync state if URL changes externally
  useEffect(() => {
    setFilterState(parseFilterParams(searchParams));
  }, [searchParams]);

  // Fetch products matching state
  const fetchProducts = useCallback(async () => {
    const isAppending = isAppendingRef.current;
    isAppendingRef.current = false;

    if (isAppending) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    const res = await getCatalogProducts({
      category: filterState.categories[0],
      subcategory: filterState.subcategories[0],
      brand: filterState.brands[0],
      packaging: filterState.packagingTypes[0],
      state: filterState.productStates[0],
      search: filterState.searchQuery,
      page: currentPage,
      limit: pageSize,
      sortBy,
    });

    if (res.success) {
      if (isAppending) {
        setProducts((prev) => [...prev, ...res.products]);
      } else {
        setProducts(res.products);
      }
      setTotalProducts(res.total);
      setTotalPages(res.totalPages);
    }

    setIsLoading(false);
    setIsLoadingMore(false);
  }, [filterState, currentPage, pageSize, sortBy]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = (newState: CatalogFilterState) => {
    setFilterState(newState);
    setCurrentPage(1);
    const query = serializeFilterParams(newState);
    router.push(`/catalog${query}`);
  };

  const handleClearAll = () => {
    setFilterState(INITIAL_FILTER_STATE);
    setCurrentPage(1);
    router.push('/catalog');
  };

  const handleSubcategorySelect = (subcategoryId: string | null) => {
    const updatedSubs = subcategoryId ? [subcategoryId] : [];
    const newState: CatalogFilterState = {
      ...filterState,
      subcategories: updatedSubs,
    };
    handleFilterChange(newState);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      isAppendingRef.current = true;
      setCurrentPage((prev) => prev + 1);
    }
  };

  const activeSubcategory = filterState.subcategories[0] || null;

  return (
    <div
      data-testid="catalog-page-container"
      style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: 'var(--spacing-xl, 24px) var(--spacing-lg, 16px)',
        width: '100%',
      }}
    >
      {/* 1. Category Hero Cards & Search Header Landing Banner */}
      <CatalogLanding />

      {/* 2. Top Subcategory Anatomical Cut Pills */}
      <SubcategoryPills
        activeSubcategory={activeSubcategory}
        onSelectSubcategory={handleSubcategorySelect}
      />

      {/* 3. Main Catalog Two-Column Layout (Sidebar + Results) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(240px, 280px) 1fr',
          gap: 'var(--spacing-xl, 24px)',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Multi-Facet Filter Sidebar */}
        <FilterSidebar
          filterState={filterState}
          onChangeFilter={handleFilterChange}
          onClearAll={handleClearAll}
        />

        {/* Right Column: View Controls, Grid/Table View, and Dual Pagination */}
        <div>
          <CatalogViewControls
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            pageSize={pageSize}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            totalProducts={totalProducts}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            onLoadMore={handleLoadMore}
            hasMore={currentPage < totalPages}
            isLoadingMore={isLoadingMore}
          />

          {viewMode === 'grid' ? (
            <ProductGrid products={products} isLoading={isLoading} />
          ) : (
            <ProductTable products={products} isLoading={isLoading} />
          )}
        </div>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <React.Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading Catalog...</div>}>
      <CatalogContent />
    </React.Suspense>
  );
}

