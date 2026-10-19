import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as shipmentsActions from '@/server/actions/shipments.actions';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    shipment: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
    },
    shipmentDocument: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@/lib/r2', () => ({
  createPresignedDownloadUrl: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

describe('shipments.actions Server Actions (FEAT-2.3)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getActiveCompanyIdFromCookies', () => {
    it('returns company ID from cookie store', async () => {
      vi.mocked(cookies).mockResolvedValue({
        get: vi.fn().mockReturnValue({ value: 'comp-cookie-ship' }),
      } as any);

      const id = await shipmentsActions.getActiveCompanyIdFromCookies();
      expect(id).toBe('comp-cookie-ship');
    });

    it('returns null when cookie is missing', async () => {
      vi.mocked(cookies).mockResolvedValue({
        get: vi.fn().mockReturnValue(undefined),
      } as any);

      const id = await shipmentsActions.getActiveCompanyIdFromCookies();
      expect(id).toBeNull();
    });

    it('returns null when cookies() throws', async () => {
      vi.mocked(cookies).mockRejectedValue(new Error('Headers unavailable'));

      const id = await shipmentsActions.getActiveCompanyIdFromCookies();
      expect(id).toBeNull();
    });
  });

  describe('getRecentShipments', () => {
    it('returns error if no active company context is selected or found in cookies', async () => {
      vi.mocked(cookies).mockResolvedValue({
        get: vi.fn().mockReturnValue(undefined),
      } as any);

      const res = await shipmentsActions.getRecentShipments();
      expect(res.success).toBe(false);
      expect(res.error).toContain('No active company context selected');
    });

    it('successfully queries shipments with default 90 days cutoff and maps to DTO', async () => {
      const mockRecords = [
        {
          id: 's-1',
          orderNumber: 'ORD-2026-88192',
          companyId: 'comp-1',
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
          shippingDate: new Date('2026-10-10T14:00:00Z'),
          etd: new Date('2026-10-12T08:00:00Z'),
          eta: new Date('2026-10-24T18:00:00Z'),
          createdAt: new Date('2026-10-10T00:00:00Z'),
        },
        {
          id: 's-2',
          orderNumber: 'ORD-2026-88045',
          companyId: 'comp-1',
          shipToParty: 'LuLu Dammam Cold Store',
          destinationCountry: 'Saudi Arabia',
          totalQuantityMt: 24,
          totalAmountUsd: 110400,
          status: 'ARRIVED_PORT',
          shippingLine: 'CMA CGM',
          vesselName: null,
          voyageNumber: null,
          portOfLoading: 'JNPT Nhava Sheva, India',
          portOfDestination: 'King Abdulaziz Port, Dammam',
          shippingDate: null,
          etd: new Date('2026-09-20T08:00:00Z'),
          eta: new Date('2026-10-05T18:00:00Z'),
          createdAt: new Date('2026-09-15T00:00:00Z'),
        },
      ];

      vi.mocked(prisma.shipment.findMany).mockResolvedValue(mockRecords as any);

      const res = await shipmentsActions.getRecentShipments({ companyId: 'comp-1' });
      expect(res.success).toBe(true);
      expect(res.shipments).toHaveLength(2);
      expect(res.totalCount).toBe(2);
      expect(res.shipments[0].orderNumber).toBe('ORD-2026-88192');
      expect(res.shipments[0].totalQuantityMt).toBe(48);
      expect(res.shipments[0].totalAmountUsd).toBe(220800);
      expect(res.shipments[1].vesselName).toBeNull();
      expect(res.shipments[1].shippingDate).toBeNull();
    });

    it('respects custom days and limit options', async () => {
      vi.mocked(prisma.shipment.findMany).mockResolvedValue([]);

      const res = await shipmentsActions.getRecentShipments({
        companyId: 'comp-1',
        days: 30,
        limit: 5,
      });

      expect(res.success).toBe(true);
      expect(prisma.shipment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            companyId: 'comp-1',
          }),
          take: 5,
        })
      );
    });

    it('handles unexpected database errors gracefully', async () => {
      vi.mocked(prisma.shipment.findMany).mockRejectedValue(new Error('DB Query Timeout'));

      const res = await shipmentsActions.getRecentShipments({ companyId: 'comp-1' });
      expect(res.success).toBe(false);
      expect(res.error).toBe('DB Query Timeout');
    });

    it('handles non-Error database exceptions gracefully', async () => {
      vi.mocked(prisma.shipment.findMany).mockRejectedValue('Fatal string query error');

      const res = await shipmentsActions.getRecentShipments({ companyId: 'comp-1' });
      expect(res.success).toBe(false);
      expect(res.error).toBe('Failed to fetch recent shipments');
    });
  });

  describe('getShipmentsList (FEAT-5.1)', () => {
    const mockDetailedShipment = {
      id: 'ship-123',
      orderNumber: 'ORD-2026-9901',
      companyId: 'comp-1',
      salesOrgId: 'so-1',
      shipToParty: 'LuLu Central Cold Chain, Riyadh',
      destinationCountry: 'Saudi Arabia',
      totalQuantityMt: '48.00',
      totalAmountUsd: '230400.00',
      status: 'IN_TRANSIT',
      shippingLine: 'Maersk Line',
      vesselName: 'Maersk Genoa',
      voyageNumber: '2410W',
      portOfLoading: 'JNPT Nhava Sheva, India',
      portOfDestination: 'Jeddah Islamic Port',
      shippingDate: new Date('2026-10-10T14:00:00Z'),
      etd: new Date('2026-10-12T08:00:00Z'),
      eta: new Date('2026-10-24T18:00:00Z'),
      createdAt: new Date('2026-10-10T00:00:00Z'),
      salesOrganization: { id: 'so-1', name: 'Allana Sons Meat Exports', code: 'SO-ALLANA-01' },
      containers: [
        {
          id: 'cnt-1',
          containerNumber: 'MSKU1092831',
          sealNumber: 'SL-88192',
          reeferSetTemp: '-18.0°C',
          items: [
            {
              id: 'item-1',
              productId: 'prod-topside-123',
              quantityMt: '24.00',
              amountUsd: '115200.00',
              product: {
                sku: 'AL-BUF-TOP-02',
                name: 'Frozen Boneless Buffalo Topside',
                brand: 'Allana',
                primaryPackaging: 'Vacuum Pack (IWP)',
                cutSize: '1.5kg - 2.5kg',
                imageUrl: 'products/topside.webp',
              },
            },
          ],
        },
      ],
      documents: [
        {
          id: 'doc-bl-1',
          documentType: 'BILL_OF_LADING',
          fileName: 'BL-MSKU-9901.pdf',
          fileUrl: 'shipments/docs/BL-9901.pdf',
          fileSizeBytes: 245000,
          createdAt: new Date('2026-10-10T00:00:00Z'),
        },
      ],
    };

    it('returns shipments with default options and resolves active company from cookies', async () => {
      vi.mocked(cookies).mockResolvedValueOnce({
        get: vi.fn().mockReturnValue({ value: 'comp-1' }),
      } as any);
      vi.mocked(prisma.shipment.count).mockResolvedValueOnce(1);
      vi.mocked(prisma.shipment.findMany)
        .mockResolvedValueOnce([mockDetailedShipment] as any)
        .mockResolvedValueOnce([
          {
            destinationCountry: 'Saudi Arabia',
            salesOrganization: { id: 'so-1', name: 'Allana Meat', code: 'SO-01' },
          },
        ] as any);

      const res = await shipmentsActions.getShipmentsList();

      expect(res.success).toBe(true);
      expect(res.shipments).toHaveLength(1);
      expect(res.total).toBe(1);
      expect(res.page).toBe(1);
      expect(res.pageSize).toBe(10);
      expect(res.countries).toEqual(['Saudi Arabia']);
      expect(res.salesOrgs).toHaveLength(1);
      expect(res.shipments[0].totalContainers).toBe(1);
      expect(res.shipments[0].totalSkus).toBe(1);
    });

    it('filters by salesOrgId, country, shipTo, status, date range, search query, and sorting', async () => {
      vi.mocked(prisma.shipment.count).mockResolvedValueOnce(1);
      vi.mocked(prisma.shipment.findMany)
        .mockResolvedValueOnce([mockDetailedShipment] as any)
        .mockResolvedValueOnce([] as any);

      const res = await shipmentsActions.getShipmentsList({
        companyId: 'comp-1',
        salesOrgId: 'so-1',
        destinationCountry: 'Saudi Arabia',
        shipToParty: 'LuLu',
        status: 'IN_TRANSIT',
        startDate: '2026-10-01',
        endDate: '2026-10-31',
        search: 'Genoa',
        sortBy: 'orderNumber_desc',
        page: 2,
        limit: 20,
      });

      expect(res.success).toBe(true);
      expect(res.page).toBe(2);
      expect(res.pageSize).toBe(20);
      expect(prisma.shipment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 20,
          orderBy: { orderNumber: 'desc' },
        })
      );
    });

    it('supports all sorting options and limit -1 for All records', async () => {
      vi.mocked(prisma.shipment.count).mockResolvedValue(1);
      vi.mocked(prisma.shipment.findMany).mockResolvedValue([mockDetailedShipment] as any);

      const sortCases = [
        { sortBy: 'orderNumber_asc' as const, expected: { orderNumber: 'asc' } },
        { sortBy: 'totalQuantityMt_asc' as const, expected: { totalQuantityMt: 'asc' } },
        { sortBy: 'totalQuantityMt_desc' as const, expected: { totalQuantityMt: 'desc' } },
        { sortBy: 'totalAmountUsd_asc' as const, expected: { totalAmountUsd: 'asc' } },
        { sortBy: 'totalAmountUsd_desc' as const, expected: { totalAmountUsd: 'desc' } },
        { sortBy: 'status_asc' as const, expected: { status: 'asc' } },
        { sortBy: 'status_desc' as const, expected: { status: 'desc' } },
        { sortBy: 'shippingDate_asc' as const, expected: { shippingDate: 'asc' } },
        { sortBy: 'shippingDate_desc' as const, expected: { shippingDate: 'desc' } },
      ];

      for (const sc of sortCases) {
        await shipmentsActions.getShipmentsList({ sortBy: sc.sortBy, limit: -1 });
        expect(prisma.shipment.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            take: 1000,
            orderBy: sc.expected,
          })
        );
      }
    });

    it('handles database error in getShipmentsList', async () => {
      vi.mocked(prisma.shipment.count).mockRejectedValueOnce(new Error('DB disconnect'));

      const res = await shipmentsActions.getShipmentsList({ companyId: 'comp-1' });
      expect(res.success).toBe(false);
      expect(res.error).toBe('DB disconnect');
    });

    it('handles non-Error thrown in getShipmentsList', async () => {
      vi.mocked(prisma.shipment.count).mockRejectedValueOnce('raw db failure');

      const res = await shipmentsActions.getShipmentsList({ companyId: 'comp-1' });
      expect(res.success).toBe(false);
      expect(res.error).toBe('Failed to fetch shipments list');
    });
  });

  describe('getShipmentDetails (FEAT-5.2)', () => {
    const mockDetailedShipment = {
      id: 'ship-123',
      orderNumber: 'ORD-2026-9901',
      companyId: 'comp-1',
      salesOrgId: 'so-1',
      shipToParty: 'LuLu Riyadh',
      destinationCountry: 'Saudi Arabia',
      totalQuantityMt: '48.00',
      totalAmountUsd: '230400.00',
      status: 'IN_TRANSIT',
      shippingLine: 'Maersk Line',
      vesselName: 'Maersk Genoa',
      voyageNumber: '2410W',
      portOfLoading: 'JNPT Nhava Sheva',
      portOfDestination: 'Jeddah',
      shippingDate: new Date('2026-10-10T14:00:00Z'),
      etd: new Date('2026-10-12T08:00:00Z'),
      eta: new Date('2026-10-24T18:00:00Z'),
      createdAt: new Date('2026-10-10T00:00:00Z'),
      salesOrganization: { id: 'so-1', name: 'Allana Meat', code: 'SO-01' },
      containers: [],
      documents: [],
    };

    it('returns error when orderNumberOrId is empty or whitespace', async () => {
      const res1 = await shipmentsActions.getShipmentDetails('');
      expect(res1.success).toBe(false);
      expect(res1.error).toBe('Order Number or ID is required');

      const res2 = await shipmentsActions.getShipmentDetails('   ');
      expect(res2.success).toBe(false);
      expect(res2.error).toBe('Order Number or ID is required');
    });

    it('returns error when shipment not found', async () => {
      vi.mocked(prisma.shipment.findFirst).mockResolvedValueOnce(null);

      const res = await shipmentsActions.getShipmentDetails('NON-EXISTENT');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Shipment not found');
    });

    it('returns error when companyId mismatch (access denied)', async () => {
      vi.mocked(prisma.shipment.findFirst).mockResolvedValueOnce(mockDetailedShipment as any);

      const res = await shipmentsActions.getShipmentDetails('ORD-2026-9901', {
        companyId: 'other-company',
      });

      expect(res.success).toBe(false);
      expect(res.error).toBe('Access denied to this shipment');
    });

    it('returns detailed shipment DTO when found and authorized', async () => {
      vi.mocked(prisma.shipment.findFirst).mockResolvedValueOnce(mockDetailedShipment as any);

      const res = await shipmentsActions.getShipmentDetails('ORD-2026-9901', {
        companyId: 'comp-1',
      });

      expect(res.success).toBe(true);
      expect(res.shipment).not.toBeNull();
      expect(res.shipment?.orderNumber).toBe('ORD-2026-9901');
      expect(res.shipment?.totalQuantityMt).toBe(48);
    });

    it('handles Error thrown in getShipmentDetails', async () => {
      vi.mocked(prisma.shipment.findFirst).mockRejectedValueOnce(new Error('Network error'));

      const res = await shipmentsActions.getShipmentDetails('ORD-2026-9901');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Network error');
    });

    it('handles non-Error thrown in getShipmentDetails', async () => {
      vi.mocked(prisma.shipment.findFirst).mockRejectedValueOnce('raw db failure');

      const res = await shipmentsActions.getShipmentDetails('ORD-2026-9901');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Failed to fetch shipment details');
    });
  });

  describe('getShipmentDocumentPresignedUrl (FEAT-5.3)', () => {
    const mockDocRecord = {
      id: 'doc-bl-123',
      fileName: 'Bill-Of-Lading.pdf',
      fileUrl: 'shipments/docs/BL-123.pdf',
      shipment: { companyId: 'comp-1' },
    };

    it('returns error when documentId is empty', async () => {
      const res = await shipmentsActions.getShipmentDocumentPresignedUrl('');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Document ID is required');
    });

    it('returns error when document is not found', async () => {
      vi.mocked(prisma.shipmentDocument.findUnique).mockResolvedValueOnce(null);

      const res = await shipmentsActions.getShipmentDocumentPresignedUrl('doc-missing');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Document not found');
    });

    it('returns error when companyId mismatch (access denied)', async () => {
      vi.mocked(prisma.shipmentDocument.findUnique).mockResolvedValueOnce(mockDocRecord as any);

      const res = await shipmentsActions.getShipmentDocumentPresignedUrl('doc-bl-123', {
        companyId: 'unauthorized-comp',
      });

      expect(res.success).toBe(false);
      expect(res.error).toBe('Access denied to this document');
    });

    it('generates presigned download URL when document found and authorized', async () => {
      const r2 = await import('@/lib/r2');
      vi.mocked(prisma.shipmentDocument.findUnique).mockResolvedValueOnce(mockDocRecord as any);
      vi.mocked(r2.createPresignedDownloadUrl).mockResolvedValueOnce(
        'https://r2.allana.com/download/presigned-bl.pdf'
      );

      const res = await shipmentsActions.getShipmentDocumentPresignedUrl('doc-bl-123', {
        companyId: 'comp-1',
      });

      expect(res.success).toBe(true);
      expect(res.downloadUrl).toBe('https://r2.allana.com/download/presigned-bl.pdf');
      expect(res.fileName).toBe('Bill-Of-Lading.pdf');
    });

    it('handles Error thrown in getShipmentDocumentPresignedUrl', async () => {
      vi.mocked(prisma.shipmentDocument.findUnique).mockRejectedValueOnce(
        new Error('R2 S3 error')
      );

      const res = await shipmentsActions.getShipmentDocumentPresignedUrl('doc-1');
      expect(res.success).toBe(false);
      expect(res.error).toBe('R2 S3 error');
    });

    it('handles non-Error thrown in getShipmentDocumentPresignedUrl', async () => {
      vi.mocked(prisma.shipmentDocument.findUnique).mockRejectedValueOnce('raw r2 error');

      const res = await shipmentsActions.getShipmentDocumentPresignedUrl('doc-1');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Failed to generate download URL');
    });

    it('resolves active company from cookies when options is omitted in getShipmentDocumentPresignedUrl', async () => {
      const r2 = await import('@/lib/r2');
      vi.mocked(cookies).mockResolvedValueOnce({
        get: vi.fn().mockReturnValue({ value: 'comp-1' }),
      } as any);
      vi.mocked(prisma.shipmentDocument.findUnique).mockResolvedValueOnce(mockDocRecord as any);
      vi.mocked(r2.createPresignedDownloadUrl).mockResolvedValueOnce(
        'https://r2.allana.com/download/presigned-bl.pdf'
      );

      const res = await shipmentsActions.getShipmentDocumentPresignedUrl('doc-bl-123');
      expect(res.success).toBe(true);
    });

    it('filters shipments by startDate only, endDate only, and null companyId', async () => {
      vi.mocked(cookies).mockResolvedValue({
        get: vi.fn().mockReturnValue(undefined),
      } as any);
      vi.mocked(prisma.shipment.count).mockResolvedValue(0);
      vi.mocked(prisma.shipment.findMany).mockResolvedValue([]);

      // startDate only
      await shipmentsActions.getShipmentsList({ startDate: '2026-10-01' });
      expect(prisma.shipment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.objectContaining({
              gte: new Date('2026-10-01'),
            }),
          }),
        })
      );

      // endDate only
      await shipmentsActions.getShipmentsList({ endDate: '2026-10-31' });
      expect(prisma.shipment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.objectContaining({
              lte: new Date('2026-10-31'),
            }),
          }),
        })
      );
    });

    it('resolves company from cookies in getShipmentDetails when options is omitted', async () => {
      vi.mocked(cookies).mockResolvedValueOnce({
        get: vi.fn().mockReturnValue({ value: 'comp-1' }),
      } as any);
      vi.mocked(prisma.shipment.findFirst).mockResolvedValueOnce({
        id: 'ship-123',
        orderNumber: 'ORD-2026-9901',
        companyId: 'comp-1',
        salesOrgId: 'so-1',
        shipToParty: 'LuLu',
        destinationCountry: 'Saudi Arabia',
        totalQuantityMt: '48.00',
        totalAmountUsd: '230400.00',
        status: 'IN_TRANSIT',
        shippingLine: 'Maersk',
        vesselName: null,
        voyageNumber: null,
        portOfLoading: 'JNPT',
        portOfDestination: 'Jeddah',
        shippingDate: null,
        etd: new Date(),
        eta: new Date(),
        createdAt: new Date(),
        salesOrganization: null,
        containers: [],
        documents: [],
      } as any);

      const res = await shipmentsActions.getShipmentDetails('ORD-2026-9901');
      expect(res.success).toBe(true);
      expect(res.shipment?.salesOrgName).toBe('Allana Sales Organization');
      expect(res.shipment?.salesOrgCode).toBe('SO-01');
    });
  });
});
