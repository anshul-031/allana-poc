import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ShipmentFilterBar from '@/components/shipments/ShipmentFilterBar';
import ContainerDrilldown from '@/components/shipments/ContainerDrilldown';
import DocumentVault from '@/components/shipments/DocumentVault';
import ShipmentsTable from '@/components/shipments/ShipmentsTable';
import ShipmentsPortalView from '@/components/shipments/ShipmentsPortalView';
import ShipmentsPage from '@/app/(portal)/shipments/page';
import * as shipmentsActions from '@/server/actions/shipments.actions';
import {
  ShipmentDetailedDTO,
  ContainerDTO,
  ShipmentDocumentDTO,
  GetShipmentsListResult,
} from '@/server/actions/shipments.actions';

const mockContainers: ContainerDTO[] = [
  {
    id: 'cnt-1',
    containerNumber: 'MSKU1092831',
    sealNumber: 'SL-88192',
    reeferSetTemp: '-18.0°C',
    items: [
      {
        id: 'item-1',
        productId: 'prod-topside-123',
        sku: 'AL-BUF-TOP-02',
        productName: 'Frozen Boneless Buffalo Topside',
        brand: 'Allana',
        primaryPackaging: 'Vacuum Pack (IWP)',
        cutSize: '1.5kg - 2.5kg',
        quantityMt: 24,
        amountUsd: 115200,
        imageUrl: 'products/topside.webp',
      },
    ],
    totalQuantityMt: 24,
    totalAmountUsd: 115200,
  },
  {
    id: 'cnt-2',
    containerNumber: 'MSKU9481022',
    sealNumber: null,
    reeferSetTemp: '-18.5°C',
    items: [],
    totalQuantityMt: 0,
    totalAmountUsd: 0,
  },
];

const mockDocuments: ShipmentDocumentDTO[] = [
  {
    id: 'doc-1',
    documentType: 'BILL_OF_LADING',
    fileName: 'Bill-Of-Lading.pdf',
    fileUrl: 'shipments/docs/BL-101.pdf',
    fileSizeBytes: 245000,
    createdAt: '2026-10-10T00:00:00.000Z',
  },
  {
    id: 'doc-2',
    documentType: 'VET_CERT',
    fileName: 'Vet-Health-Cert.pdf',
    fileUrl: 'shipments/docs/VET-101.pdf',
    fileSizeBytes: 180000,
    createdAt: '2026-10-10T00:00:00.000Z',
  },
  {
    id: 'doc-3',
    documentType: 'HALAL_CERT',
    fileName: 'Halal-Certificate.pdf',
    fileUrl: 'shipments/docs/HALAL-101.pdf',
    fileSizeBytes: 120000,
    createdAt: '2026-10-10T00:00:00.000Z',
  },
];

const mockShipment1: ShipmentDetailedDTO = {
  id: 'ship-1',
  orderNumber: 'ORD-2026-88192',
  companyId: 'comp-1',
  salesOrgId: 'so-1',
  salesOrgName: 'Allana Meat Exports',
  salesOrgCode: 'SO-01',
  shipToParty: 'LuLu Logistics JAFZA',
  destinationCountry: 'United Arab Emirates',
  totalQuantityMt: 48,
  totalAmountUsd: 220800,
  status: 'IN_TRANSIT',
  shippingLine: 'Maersk Line',
  vesselName: 'Maersk Mc-Kinney Moller',
  voyageNumber: '2604W',
  portOfLoading: 'JNPT Nhava Sheva, India',
  portOfDestination: 'Jebel Ali Port, UAE',
  shippingDate: '2026-10-10T14:00:00.000Z',
  etd: '2026-10-12T08:00:00.000Z',
  eta: '2026-10-24T18:00:00.000Z',
  createdAt: '2026-10-10T00:00:00.000Z',
  containers: mockContainers,
  documents: mockDocuments,
  totalContainers: 2,
  totalSkus: 1,
};

const mockShipment2: ShipmentDetailedDTO = {
  ...mockShipment1,
  id: 'ship-2',
  orderNumber: 'ORD-2026-88045',
  destinationCountry: 'Saudi Arabia',
  shipToParty: 'Carrefour Riyadh',
  totalQuantityMt: 28,
  totalAmountUsd: 134400,
  status: 'CUSTOMS_CLEARED',
  shippingDate: null,
  containers: [],
  documents: [],
  totalContainers: 0,
  totalSkus: 0,
};

const mockShipmentDelivered: ShipmentDetailedDTO = {
  ...mockShipment1,
  id: 'ship-3',
  orderNumber: 'ORD-2026-88011',
  status: 'DELIVERED',
};

const mockShipmentLoaded: ShipmentDetailedDTO = {
  ...mockShipment1,
  id: 'ship-4',
  orderNumber: 'ORD-2026-88012',
  status: 'LOADED',
};

const mockShipmentArrived: ShipmentDetailedDTO = {
  ...mockShipment1,
  id: 'ship-5',
  orderNumber: 'ORD-2026-88013',
  status: 'ARRIVED_PORT',
};

const mockShipmentBooked: ShipmentDetailedDTO = {
  ...mockShipment1,
  id: 'ship-6',
  orderNumber: 'ORD-2026-88014',
  status: 'BOOKED',
};

const mockInitialData: GetShipmentsListResult = {
  success: true,
  shipments: [mockShipment1, mockShipment2],
  total: 2,
  page: 1,
  pageSize: 10,
  totalPages: 1,
  countries: ['Saudi Arabia', 'United Arab Emirates'],
  salesOrgs: [{ id: 'so-1', name: 'Allana Meat Exports', code: 'SO-01' }],
};

describe('Module 5: Shipment Tracking & Logistics Vault Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ShipmentFilterBar', () => {
    it('renders found counter, filters, and handles input changes and reset', () => {
      const onFilterChange = vi.fn();
      const onReset = vi.fn();

      render(
        <ShipmentFilterBar
          filters={{
            salesOrgId: 'ALL',
            destinationCountry: 'ALL',
            status: 'ALL',
            startDate: '',
            endDate: '',
            search: '',
          }}
          onFilterChange={onFilterChange}
          onResetFilters={onReset}
          totalFound={42}
          countries={['Saudi Arabia', 'United Arab Emirates']}
          salesOrgs={[{ id: 'so-1', name: 'Allana Meat', code: 'SO-01' }]}
        />
      );

      expect(screen.getByTestId('found-records-counter')).toHaveTextContent('Found 42 records');

      // Change sales org
      fireEvent.change(screen.getByTestId('filter-sales-org'), { target: { value: 'so-1' } });
      expect(onFilterChange).toHaveBeenCalledWith({ salesOrgId: 'so-1' });

      // Change country
      fireEvent.change(screen.getByTestId('filter-country'), {
        target: { value: 'Saudi Arabia' },
      });
      expect(onFilterChange).toHaveBeenCalledWith({ destinationCountry: 'Saudi Arabia' });

      // Change status
      fireEvent.change(screen.getByTestId('filter-status'), { target: { value: 'IN_TRANSIT' } });
      expect(onFilterChange).toHaveBeenCalledWith({ status: 'IN_TRANSIT' });

      // Change dates
      fireEvent.change(screen.getByTestId('filter-start-date'), {
        target: { value: '2026-10-01' },
      });
      expect(onFilterChange).toHaveBeenCalledWith({ startDate: '2026-10-01' });

      fireEvent.change(screen.getByTestId('filter-end-date'), {
        target: { value: '2026-10-31' },
      });
      expect(onFilterChange).toHaveBeenCalledWith({ endDate: '2026-10-31' });

      // Change search
      fireEvent.change(screen.getByTestId('filter-search'), {
        target: { value: 'Maersk' },
      });
      expect(onFilterChange).toHaveBeenCalledWith({ search: 'Maersk' });

      // Reset
      fireEvent.click(screen.getByTestId('reset-filters-btn'));
      expect(onReset).toHaveBeenCalled();
    });

    it('handles undefined filter properties with default ALL fallback values', () => {
      render(
        <ShipmentFilterBar
          filters={{}}
          onFilterChange={vi.fn()}
          onResetFilters={vi.fn()}
          totalFound={0}
          countries={[]}
          salesOrgs={[]}
        />
      );

      const salesOrgSelect = screen.getByTestId('filter-sales-org') as HTMLSelectElement;
      expect(salesOrgSelect.value).toBe('ALL');

      const countrySelect = screen.getByTestId('filter-country') as HTMLSelectElement;
      expect(countrySelect.value).toBe('ALL');

      const statusSelect = screen.getByTestId('filter-status') as HTMLSelectElement;
      expect(statusSelect.value).toBe('ALL');
    });
  });

  describe('ContainerDrilldown', () => {
    it('renders empty notice when containers array is empty', () => {
      render(
        <ContainerDrilldown
          containers={[]}
          shippingLine="Maersk"
          vesselName={null}
          voyageNumber={null}
          portOfLoading="JNPT"
          portOfDestination="Jeddah"
        />
      );

      expect(screen.getByTestId('no-containers-notice')).toBeInTheDocument();
    });

    it('renders Level 1 container card with GPS pin and Level 2 SKU items', () => {
      render(
        <ContainerDrilldown
          containers={mockContainers}
          shippingLine="Maersk Line"
          vesselName="Maersk Mc-Kinney Moller"
          voyageNumber="2604W"
          portOfLoading="JNPT Nhava Sheva"
          portOfDestination="Jebel Ali Port"
        />
      );

      expect(screen.getByTestId('container-drilldown-container')).toBeInTheDocument();
      expect(screen.getByTestId('gps-pin-cnt-1')).toBeInTheDocument();
      expect(screen.getByTestId('container-number-cnt-1')).toHaveTextContent('MSKU1092831');
      expect(screen.getByTestId('reefer-temp-cnt-1')).toHaveTextContent('-18.0°C');

      // First container is expanded by default
      expect(screen.getByTestId('container-items-table-cnt-1')).toBeInTheDocument();
      expect(screen.getByTestId('sku-item-row-item-1')).toBeInTheDocument();
      expect(screen.getByText('Frozen Boneless Buffalo Topside')).toBeInTheDocument();

      // Collapse first container
      const toggleBtn1 = screen.getByTestId('toggle-sku-btn-cnt-1');
      fireEvent.click(toggleBtn1);
      expect(screen.queryByTestId('container-items-table-cnt-1')).not.toBeInTheDocument();

      // Expand second container
      const toggleBtn2 = screen.getByTestId('toggle-sku-btn-cnt-2');
      fireEvent.click(toggleBtn2);
      expect(screen.getByTestId('container-items-table-cnt-2')).toBeInTheDocument();
    });
  });

  describe('DocumentVault', () => {
    it('renders empty notice when documents array is empty', () => {
      render(<DocumentVault documents={[]} orderNumber="ORD-1" />);
      expect(screen.getByTestId('no-documents-notice')).toBeInTheDocument();
    });

    it('renders document items and handles presigned URL download', async () => {
      vi.spyOn(shipmentsActions, 'getShipmentDocumentPresignedUrl').mockResolvedValueOnce({
        success: true,
        downloadUrl: 'https://r2.allana.com/download/presigned-bl.pdf',
        fileName: 'Bill-Of-Lading.pdf',
      });

      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

      render(<DocumentVault documents={mockDocuments} orderNumber="ORD-2026-88192" />);

      expect(screen.getByTestId('document-vault-container')).toBeInTheDocument();
      expect(screen.getByTestId('doc-label-doc-1')).toHaveTextContent(
        'Ocean Bill of Lading (B/L)'
      );
      expect(screen.getByTestId('doc-label-doc-2')).toHaveTextContent(
        'Official Veterinary Health Certificate'
      );
      expect(screen.getByTestId('doc-label-doc-3')).toHaveTextContent(
        'Approved Halal Slaughter Certificate'
      );

      // Download doc 1
      const downloadBtn = screen.getByTestId('download-doc-btn-doc-1');
      fireEvent.click(downloadBtn);

      await waitFor(() => {
        expect(shipmentsActions.getShipmentDocumentPresignedUrl).toHaveBeenCalledWith('doc-1');
        expect(openSpy).toHaveBeenCalledWith(
          'https://r2.allana.com/download/presigned-bl.pdf',
          '_blank',
          'noopener,noreferrer'
        );
      });

      openSpy.mockRestore();
    });

    it('displays error message when presigned URL retrieval fails', async () => {
      vi.spyOn(shipmentsActions, 'getShipmentDocumentPresignedUrl').mockResolvedValueOnce({
        success: false,
        downloadUrl: null,
        fileName: null,
        error: 'Document not found or expired',
      });

      render(<DocumentVault documents={mockDocuments} orderNumber="ORD-2026-88192" />);

      fireEvent.click(screen.getByTestId('download-doc-btn-doc-1'));

      await waitFor(() => {
        expect(screen.getByTestId('vault-error-message')).toHaveTextContent(
          'Document not found or expired'
        );
      });
    });

    it('handles unexpected exceptions thrown during download', async () => {
      vi.spyOn(shipmentsActions, 'getShipmentDocumentPresignedUrl').mockRejectedValueOnce(
        new Error('Network connectivity lost')
      );

      render(<DocumentVault documents={mockDocuments} orderNumber="ORD-2026-88192" />);

      fireEvent.click(screen.getByTestId('download-doc-btn-doc-1'));

      await waitFor(() => {
        expect(screen.getByTestId('vault-error-message')).toHaveTextContent(
          'Network connectivity lost'
        );
      });
    });

    it('renders labels and icons for all document types including SFDA, invoice, packing list, temp log, and fallback', () => {
      const variedDocs: ShipmentDocumentDTO[] = [
        {
          id: 'doc-sfda',
          documentType: 'SFDA_CERT',
          fileName: 'SFDA-Conformity.pdf',
          fileUrl: 'docs/sfda.pdf',
          fileSizeBytes: 50000,
          createdAt: '2026-10-10T00:00:00Z',
        },
        {
          id: 'doc-invoice',
          documentType: 'INVOICE',
          fileName: 'Invoice-99.pdf',
          fileUrl: 'docs/invoice.pdf',
          fileSizeBytes: 60000,
          createdAt: '2026-10-10T00:00:00Z',
        },
        {
          id: 'doc-pack',
          documentType: 'PACKING_LIST',
          fileName: 'Packing-99.pdf',
          fileUrl: 'docs/pack.pdf',
          fileSizeBytes: 70000,
          createdAt: '2026-10-10T00:00:00Z',
        },
        {
          id: 'doc-temp',
          documentType: 'TEMP_LOG',
          fileName: 'Temp-Log-99.pdf',
          fileUrl: 'docs/temp.pdf',
          fileSizeBytes: 80000,
          createdAt: '2026-10-10T00:00:00Z',
        },
        {
          id: 'doc-custom',
          documentType: 'CUSTOM_ANALYSIS',
          fileName: 'Custom-99.pdf',
          fileUrl: 'docs/custom.pdf',
          fileSizeBytes: 90000,
          createdAt: '2026-10-10T00:00:00Z',
        },
      ];

      render(<DocumentVault documents={variedDocs} orderNumber="ORD-99" />);

      expect(screen.getByText('SFDA Certificate of Conformity')).toBeInTheDocument();
      expect(screen.getByText('Commercial Export Invoice')).toBeInTheDocument();
      expect(screen.getByText('Export Master Packing List')).toBeInTheDocument();
      expect(screen.getByText('Cold-Chain Temperature Logger Report')).toBeInTheDocument();
      expect(screen.getByText('CUSTOM ANALYSIS')).toBeInTheDocument();
    });
  });

  describe('ShipmentsTable', () => {
    it('renders empty state when shipments array is empty', () => {
      render(
        <ShipmentsTable
          shipments={[]}
          onSortChange={vi.fn()}
          currentPage={1}
          totalPages={1}
          pageSize={10}
          onPageChange={vi.fn()}
          onPageSizeChange={vi.fn()}
        />
      );

      expect(screen.getByTestId('shipments-empty-state')).toBeInTheDocument();
    });

    it('renders rows, handles sorting clicks, row expansion, and subtabs', () => {
      const onSortChange = vi.fn();
      const onPageChange = vi.fn();
      const onPageSizeChange = vi.fn();

      const { rerender } = render(
        <ShipmentsTable
          shipments={[
            mockShipment1,
            mockShipment2,
            mockShipmentDelivered,
            mockShipmentLoaded,
            mockShipmentArrived,
            mockShipmentBooked,
          ]}
          sortBy="createdAt_desc"
          onSortChange={onSortChange}
          currentPage={1}
          totalPages={3}
          pageSize={10}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      );

      expect(screen.getByTestId('shipments-table')).toBeInTheDocument();
      expect(screen.getByTestId('order-number-badge-ship-1')).toHaveTextContent(
        'ORD-2026-88192'
      );

      // Status badges
      expect(screen.getByTestId('shipment-status-badge-ship-1')).toHaveTextContent('In Transit');
      expect(screen.getByTestId('shipment-status-badge-ship-2')).toHaveTextContent(
        'Customs Cleared'
      );
      expect(screen.getByTestId('shipment-status-badge-ship-3')).toHaveTextContent('Delivered');
      expect(screen.getByTestId('shipment-status-badge-ship-4')).toHaveTextContent('Loaded');
      expect(screen.getByTestId('shipment-status-badge-ship-5')).toHaveTextContent(
        'Arrived at Port'
      );
      expect(screen.getByTestId('shipment-status-badge-ship-6')).toHaveTextContent('Booked');

      // Click sorting headers
      fireEvent.click(screen.getByTestId('sort-order-number'));
      expect(onSortChange).toHaveBeenCalledWith('orderNumber_asc');

      fireEvent.click(screen.getByTestId('sort-quantity'));
      expect(onSortChange).toHaveBeenCalledWith('totalQuantityMt_asc');

      fireEvent.click(screen.getByTestId('sort-amount'));
      expect(onSortChange).toHaveBeenCalledWith('totalAmountUsd_asc');

      fireEvent.click(screen.getByTestId('sort-date'));
      expect(onSortChange).toHaveBeenCalledWith('shippingDate_asc');

      fireEvent.click(screen.getByTestId('sort-status'));
      expect(onSortChange).toHaveBeenCalledWith('status_asc');

      // Expand row details (Details ▾ -> Hide Details ▴)
      const toggleBtn = screen.getByTestId('toggle-details-btn-ship-1');
      expect(toggleBtn).toHaveTextContent('Details ▾');

      fireEvent.click(toggleBtn);
      expect(toggleBtn).toHaveTextContent('Hide Details ▴');
      expect(screen.getByTestId('expanded-drilldown-row-ship-1')).toBeInTheDocument();

      // Switch to Document Vault subtab
      const docsSubtab = screen.getByTestId('subtab-documents-ship-1');
      fireEvent.click(docsSubtab);
      expect(screen.getByTestId('document-vault-container')).toBeInTheDocument();

      // Switch back to Containers subtab
      const containersSubtab = screen.getByTestId('subtab-containers-ship-1');
      fireEvent.click(containersSubtab);
      expect(screen.getByTestId('container-drilldown-container')).toBeInTheDocument();

      // Click master row also toggles
      fireEvent.click(screen.getByTestId('shipment-row-ship-1'));
      expect(screen.queryByTestId('expanded-drilldown-row-ship-1')).not.toBeInTheDocument();

      // Pagination
      fireEvent.click(screen.getByTestId('next-page-btn'));
      expect(onPageChange).toHaveBeenCalledWith(2);

      fireEvent.change(screen.getByTestId('page-size-selector'), { target: { value: '20' } });
      expect(onPageSizeChange).toHaveBeenCalledWith(20);
    });
  });

  describe('ShipmentsPortalView & ShipmentsPage', () => {
    it('manages filter changes, sorting, and pagination in ShipmentsPortalView', async () => {
      vi.spyOn(shipmentsActions, 'getShipmentsList').mockResolvedValue({
        success: true,
        shipments: [mockShipment1],
        total: 25,
        page: 1,
        pageSize: 10,
        totalPages: 3,
        countries: ['Saudi Arabia'],
        salesOrgs: [],
      });

      render(
        <ShipmentsPortalView
          initialData={{
            ...mockInitialData,
            total: 25,
            totalPages: 3,
          }}
        />
      );

      expect(screen.getByTestId('shipments-page-title')).toHaveTextContent(
        'Ocean Freight Shipments & Reefer Tracking'
      );

      // Change country filter
      fireEvent.change(screen.getByTestId('filter-country'), {
        target: { value: 'Saudi Arabia' },
      });

      await waitFor(() => {
        expect(shipmentsActions.getShipmentsList).toHaveBeenCalledWith(
          expect.objectContaining({ destinationCountry: 'Saudi Arabia' })
        );
      });

      // Clear filters
      fireEvent.click(screen.getByTestId('reset-filters-btn'));
      await waitFor(() => {
        expect(shipmentsActions.getShipmentsList).toHaveBeenCalledWith(
          expect.objectContaining({ destinationCountry: 'ALL' })
        );
      });

      // Change sorting
      fireEvent.click(screen.getByTestId('sort-order-number'));
      await waitFor(() => {
        expect(shipmentsActions.getShipmentsList).toHaveBeenCalledWith(
          expect.objectContaining({ sortBy: 'orderNumber_asc' })
        );
      });

      // Test page change
      const nextPageBtn = screen.getByTestId('next-page-btn');
      fireEvent.click(nextPageBtn);
      await waitFor(() => {
        expect(shipmentsActions.getShipmentsList).toHaveBeenCalledWith(
          expect.objectContaining({ page: 2 })
        );
      });

      // Test page size change
      const pageSizeSelector = screen.getByTestId('page-size-selector');
      fireEvent.change(pageSizeSelector, { target: { value: '20' } });
      await waitFor(() => {
        expect(shipmentsActions.getShipmentsList).toHaveBeenCalledWith(
          expect.objectContaining({ page: 1, limit: 20 })
        );
      });
    });

    it('handles unsuccessful fetchShipments gracefully and supports default fallback props', async () => {
      vi.spyOn(shipmentsActions, 'getShipmentsList').mockResolvedValueOnce({
        success: false,
        error: 'Network error',
        shipments: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 1,
        countries: [],
        salesOrgs: [],
      });

      const initialWithoutPaging = {
        success: true,
        shipments: [mockShipment1],
        total: 1,
        totalPages: 1,
        countries: [],
        salesOrgs: [],
      } as unknown as GetShipmentsListResult;

      render(<ShipmentsPortalView initialData={initialWithoutPaging} />);

      // Trigger a filter change which calls fetchShipments and gets res.success = false
      fireEvent.change(screen.getByTestId('filter-search'), { target: { value: 'FAIL' } });
      await waitFor(() => {
        expect(shipmentsActions.getShipmentsList).toHaveBeenCalled();
      });
    });

    it('shows loading indicator while fetching updated shipments', async () => {
      let resolvePromise: (value: unknown) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      vi.spyOn(shipmentsActions, 'getShipmentsList').mockImplementation(
        () => pendingPromise as unknown as Promise<GetShipmentsListResult>
      );

      render(<ShipmentsPortalView initialData={mockInitialData} />);

      // Trigger search filter
      fireEvent.change(screen.getByTestId('filter-search'), { target: { value: 'Loading Test' } });

      expect(screen.getByTestId('shipments-loading-indicator')).toBeInTheDocument();

      // Resolve
      resolvePromise!({
        success: true,
        shipments: [mockShipment1],
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
        countries: [],
        salesOrgs: [],
      });

      await waitFor(() => {
        expect(screen.queryByTestId('shipments-loading-indicator')).not.toBeInTheDocument();
      });
    });

    it('renders ShipmentsPage server component and fetches initial shipments', async () => {
      vi.spyOn(shipmentsActions, 'getShipmentsList').mockResolvedValueOnce(mockInitialData);

      const element = await ShipmentsPage();
      render(element);

      expect(screen.getByTestId('shipments-page')).toBeInTheDocument();
      expect(screen.getByTestId('order-number-badge-ship-1')).toHaveTextContent(
        'ORD-2026-88192'
      );
    });
  });
});
