'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  GetShipmentsListResult,
  ShipmentDetailedDTO,
  ShipmentFilterOptions,
  getShipmentsList,
} from '@/server/actions/shipments.actions';
import ShipmentFilterBar from './ShipmentFilterBar';
import ShipmentsTable from './ShipmentsTable';

export interface ShipmentsPortalViewProps {
  initialData: GetShipmentsListResult;
}

export default function ShipmentsPortalView({ initialData }: ShipmentsPortalViewProps) {
  const [filters, setFilters] = useState<ShipmentFilterOptions>({
    salesOrgId: 'ALL',
    destinationCountry: 'ALL',
    status: 'ALL',
    search: '',
    startDate: '',
    endDate: '',
  });

  const [sortBy, setSortBy] = useState<ShipmentFilterOptions['sortBy']>('createdAt_desc');
  const [currentPage, setCurrentPage] = useState<number>(initialData.page || 1);
  const [pageSize, setPageSize] = useState<number>(initialData.pageSize || 10);

  const [shipments, setShipments] = useState<ShipmentDetailedDTO[]>(initialData.shipments);
  const [totalFound, setTotalFound] = useState<number>(initialData.total);
  const [totalPages, setTotalPages] = useState<number>(initialData.totalPages);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchShipments = useCallback(
    async (
      overrideFilters: Partial<ShipmentFilterOptions>,
      overridePage: number,
      overridePageSize: number,
      overrideSortBy: ShipmentFilterOptions['sortBy']
    ) => {
      setIsLoading(true);

      const activeFilters = {
        ...filters,
        ...overrideFilters,
      };

      const res = await getShipmentsList({
        ...activeFilters,
        page: overridePage,
        limit: overridePageSize,
        sortBy: overrideSortBy,
      });

      setIsLoading(false);

      if (res.success) {
        setShipments(res.shipments);
        setTotalFound(res.total);
        setTotalPages(res.totalPages);
        setCurrentPage(res.page);
      }
    },
    [filters]
  );

  const handleFilterChange = (newFilters: Partial<ShipmentFilterOptions>) => {
    setFilters((prev) => {
      const updated = { ...prev, ...newFilters };
      fetchShipments(updated, 1, pageSize, sortBy);
      return updated;
    });
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    const emptyFilters: ShipmentFilterOptions = {
      salesOrgId: 'ALL',
      destinationCountry: 'ALL',
      status: 'ALL',
      search: '',
      startDate: '',
      endDate: '',
    };
    setFilters(emptyFilters);
    setCurrentPage(1);
    fetchShipments(emptyFilters, 1, pageSize, sortBy);
  };

  const handleSortChange = (newSortBy: ShipmentFilterOptions['sortBy']) => {
    setSortBy(newSortBy);
    fetchShipments(filters, currentPage, pageSize, newSortBy);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchShipments(filters, newPage, pageSize, sortBy);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
    fetchShipments(filters, 1, newPageSize, sortBy);
  };

  return (
    <div data-testid="shipments-portal-view">
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1
          data-testid="shipments-page-title"
          style={{
            fontSize: 'var(--font-size-2xl, 24px)',
            fontWeight: 800,
            color: 'var(--color-primary-dark, #0a192f)',
            margin: '0 0 6px 0',
          }}
        >
          Ocean Freight Shipments &amp; Reefer Tracking
        </h1>
        <p
          style={{
            fontSize: 'var(--font-size-sm, 14px)',
            color: 'var(--color-text-secondary, #64748b)',
            margin: 0,
          }}
        >
          Monitor container cold-chain telematics, voyage ETD/ETA, SKU stowage manifests, and official
          customs document vaults.
        </p>
      </div>

      {/* Filter Bar */}
      <ShipmentFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        totalFound={totalFound}
        countries={initialData.countries}
        salesOrgs={initialData.salesOrgs}
      />

      {/* Loading Overlay or Table */}
      {isLoading ? (
        <div
          data-testid="shipments-loading-indicator"
          style={{
            padding: '48px',
            textAlign: 'center',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--color-border, #e2e8f0)',
            color: 'var(--color-text-secondary, #64748b)',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          Refreshing container telematics &amp; shipment manifests...
        </div>
      ) : (
        <ShipmentsTable
          shipments={shipments}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
}
