'use server';

import { prisma } from '@/lib/prisma';
import { ACTIVE_COMPANY_COOKIE } from '@/lib/company-context';
import { createPresignedDownloadUrl } from '@/lib/r2';
import { cookies } from 'next/headers';

export type ShipmentStatusType =
  | 'BOOKED'
  | 'LOADED'
  | 'IN_TRANSIT'
  | 'ARRIVED_PORT'
  | 'CUSTOMS_CLEARED'
  | 'DELIVERED';

export interface ShipmentSummaryDTO {
  id: string;
  orderNumber: string;
  companyId: string;
  shipToParty: string;
  destinationCountry: string;
  totalQuantityMt: number;
  totalAmountUsd: number;
  status: ShipmentStatusType;
  shippingLine: string;
  vesselName: string | null;
  voyageNumber: string | null;
  portOfLoading: string;
  portOfDestination: string;
  shippingDate: string | null;
  etd: string;
  eta: string;
  createdAt: string;
}

export interface ShipmentItemDTO {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  brand: string;
  primaryPackaging: string;
  cutSize: string;
  quantityMt: number;
  amountUsd: number;
  imageUrl: string | null;
}

export interface ContainerDTO {
  id: string;
  containerNumber: string;
  sealNumber: string | null;
  reeferSetTemp: string;
  items: ShipmentItemDTO[];
  totalQuantityMt: number;
  totalAmountUsd: number;
}

export interface ShipmentDocumentDTO {
  id: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  fileSizeBytes: number;
  createdAt: string;
}

export interface ShipmentDetailedDTO extends ShipmentSummaryDTO {
  salesOrgId: string;
  salesOrgName: string;
  salesOrgCode: string;
  containers: ContainerDTO[];
  documents: ShipmentDocumentDTO[];
  totalContainers: number;
  totalSkus: number;
}

export interface ShipmentFilterOptions {
  companyId?: string;
  salesOrgId?: string;
  destinationCountry?: string;
  shipToParty?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?:
    | 'orderNumber_asc'
    | 'orderNumber_desc'
    | 'totalQuantityMt_asc'
    | 'totalQuantityMt_desc'
    | 'totalAmountUsd_asc'
    | 'totalAmountUsd_desc'
    | 'status_asc'
    | 'status_desc'
    | 'shippingDate_asc'
    | 'shippingDate_desc'
    | 'createdAt_desc';
  page?: number;
  limit?: number;
}

export interface GetRecentShipmentsResult {
  success: boolean;
  shipments: ShipmentSummaryDTO[];
  totalCount: number;
  error?: string;
}

export interface GetShipmentsListResult {
  success: boolean;
  shipments: ShipmentDetailedDTO[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  countries: string[];
  salesOrgs: { id: string; name: string; code: string }[];
  error?: string;
}

export interface GetShipmentDetailsResult {
  success: boolean;
  shipment: ShipmentDetailedDTO | null;
  error?: string;
}

export interface GetShipmentDocumentDownloadResult {
  success: boolean;
  downloadUrl: string | null;
  fileName: string | null;
  error?: string;
}

export async function getActiveCompanyIdFromCookies(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(ACTIVE_COMPANY_COOKIE)?.value || null;
  } catch {
    return null;
  }
}

function mapDetailedRecordToDTO(s: any): ShipmentDetailedDTO {
  const containers: ContainerDTO[] = (s.containers || []).map((c: any) => {
    let containerQty = 0;
    let containerAmount = 0;

    const items: ShipmentItemDTO[] = (c.items || []).map((item: any) => {
      const q = Number(item.quantityMt);
      const a = Number(item.amountUsd);
      containerQty += q;
      containerAmount += a;

      return {
        id: item.id,
        productId: item.productId,
        sku: item.product?.sku || 'SKU-UNKNOWN',
        productName: item.product?.name || 'Product Cut',
        brand: item.product?.brand || 'Allana',
        primaryPackaging: item.product?.primaryPackaging || 'Vacuum Pack',
        cutSize: item.product?.cutSize || 'Uncalibrated',
        quantityMt: q,
        amountUsd: a,
        imageUrl: item.product?.imageUrl || null,
      };
    });

    return {
      id: c.id,
      containerNumber: c.containerNumber,
      sealNumber: c.sealNumber,
      reeferSetTemp: c.reeferSetTemp || '-18.0°C',
      items,
      totalQuantityMt: Math.round(containerQty * 100) / 100,
      totalAmountUsd: Math.round(containerAmount * 100) / 100,
    };
  });

  const documents: ShipmentDocumentDTO[] = (s.documents || []).map((doc: any) => ({
    id: doc.id,
    documentType: doc.documentType,
    fileName: doc.fileName,
    fileUrl: doc.fileUrl,
    fileSizeBytes: doc.fileSizeBytes,
    createdAt: new Date(doc.createdAt).toISOString(),
  }));

  const uniqueSkus = new Set(
    containers.flatMap((c) => c.items.map((i) => i.sku))
  );

  return {
    id: s.id,
    orderNumber: s.orderNumber,
    companyId: s.companyId,
    salesOrgId: s.salesOrgId,
    salesOrgName: s.salesOrganization?.name || 'Allana Sales Organization',
    salesOrgCode: s.salesOrganization?.code || 'SO-01',
    shipToParty: s.shipToParty,
    destinationCountry: s.destinationCountry,
    totalQuantityMt: Number(s.totalQuantityMt),
    totalAmountUsd: Number(s.totalAmountUsd),
    status: s.status as ShipmentStatusType,
    shippingLine: s.shippingLine,
    vesselName: s.vesselName,
    voyageNumber: s.voyageNumber,
    portOfLoading: s.portOfLoading,
    portOfDestination: s.portOfDestination,
    shippingDate: s.shippingDate ? new Date(s.shippingDate).toISOString() : null,
    etd: new Date(s.etd).toISOString(),
    eta: new Date(s.eta).toISOString(),
    createdAt: new Date(s.createdAt).toISOString(),
    containers,
    documents,
    totalContainers: containers.length,
    totalSkus: uniqueSkus.size,
  };
}

/**
 * Fetch shipments for the active company dispatched or booked within the last N days (default 90)
 */
export async function getRecentShipments(options?: {
  companyId?: string;
  days?: number;
  limit?: number;
}): Promise<GetRecentShipmentsResult> {
  const companyId = options?.companyId || (await getActiveCompanyIdFromCookies());

  if (!companyId) {
    return {
      success: false,
      shipments: [],
      totalCount: 0,
      error: 'No active company context selected',
    };
  }

  const days = options?.days ?? 90;
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  try {
    const records = await prisma.shipment.findMany({
      where: {
        companyId,
        createdAt: {
          gte: cutoffDate,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: options?.limit || 10,
    });

    const shipments: ShipmentSummaryDTO[] = records.map((s: any) => ({
      id: s.id,
      orderNumber: s.orderNumber,
      companyId: s.companyId,
      shipToParty: s.shipToParty,
      destinationCountry: s.destinationCountry,
      totalQuantityMt: Number(s.totalQuantityMt),
      totalAmountUsd: Number(s.totalAmountUsd),
      status: s.status as ShipmentStatusType,
      shippingLine: s.shippingLine,
      vesselName: s.vesselName,
      voyageNumber: s.voyageNumber,
      portOfLoading: s.portOfLoading,
      portOfDestination: s.portOfDestination,
      shippingDate: s.shippingDate ? s.shippingDate.toISOString() : null,
      etd: s.etd.toISOString(),
      eta: s.eta.toISOString(),
      createdAt: s.createdAt.toISOString(),
    }));

    return {
      success: true,
      shipments,
      totalCount: shipments.length,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch recent shipments';
    return {
      success: false,
      shipments: [],
      totalCount: 0,
      error: message,
    };
  }
}

/**
 * Fetch filterable, sortable, paginated shipment list for the Shipments portal
 */
export async function getShipmentsList(
  options?: ShipmentFilterOptions
): Promise<GetShipmentsListResult> {
  try {
    const companyId = options?.companyId || (await getActiveCompanyIdFromCookies());
    const where: any = {};

    if (companyId) {
      where.companyId = companyId;
    }

    if (options?.salesOrgId && options.salesOrgId !== 'ALL') {
      where.salesOrgId = options.salesOrgId;
    }

    if (options?.destinationCountry && options.destinationCountry !== 'ALL') {
      where.destinationCountry = {
        contains: options.destinationCountry.trim(),
        mode: 'insensitive',
      };
    }

    if (options?.shipToParty && options.shipToParty.trim()) {
      where.shipToParty = {
        contains: options.shipToParty.trim(),
        mode: 'insensitive',
      };
    }

    if (options?.status && options.status !== 'ALL') {
      where.status = options.status;
    }

    if (options?.startDate || options?.endDate) {
      where.createdAt = {};
      if (options.startDate) {
        where.createdAt.gte = new Date(options.startDate);
      }
      if (options.endDate) {
        where.createdAt.lte = new Date(options.endDate);
      }
    }

    if (options?.search && options.search.trim()) {
      const s = options.search.trim();
      where.OR = [
        { orderNumber: { contains: s, mode: 'insensitive' } },
        { vesselName: { contains: s, mode: 'insensitive' } },
        { voyageNumber: { contains: s, mode: 'insensitive' } },
        { portOfDestination: { contains: s, mode: 'insensitive' } },
        { containers: { some: { containerNumber: { contains: s, mode: 'insensitive' } } } },
      ];
    }

    // Determine sorting
    let orderBy: any = { createdAt: 'desc' };
    if (options?.sortBy === 'orderNumber_asc') orderBy = { orderNumber: 'asc' };
    else if (options?.sortBy === 'orderNumber_desc') orderBy = { orderNumber: 'desc' };
    else if (options?.sortBy === 'totalQuantityMt_asc') orderBy = { totalQuantityMt: 'asc' };
    else if (options?.sortBy === 'totalQuantityMt_desc') orderBy = { totalQuantityMt: 'desc' };
    else if (options?.sortBy === 'totalAmountUsd_asc') orderBy = { totalAmountUsd: 'asc' };
    else if (options?.sortBy === 'totalAmountUsd_desc') orderBy = { totalAmountUsd: 'desc' };
    else if (options?.sortBy === 'status_asc') orderBy = { status: 'asc' };
    else if (options?.sortBy === 'status_desc') orderBy = { status: 'desc' };
    else if (options?.sortBy === 'shippingDate_asc') orderBy = { shippingDate: 'asc' };
    else if (options?.sortBy === 'shippingDate_desc') orderBy = { shippingDate: 'desc' };

    const page = options?.page && options.page > 0 ? options.page : 1;
    const limit = options?.limit === -1 ? 1000 : options?.limit && options.limit > 0 ? options.limit : 10;
    const skip = (page - 1) * limit;

    const [total, records, allShipments] = await Promise.all([
      prisma.shipment.count({ where }),
      prisma.shipment.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          salesOrganization: { select: { id: true, name: true, code: true } },
          containers: {
            include: {
              items: {
                include: {
                  product: {
                    select: {
                      sku: true,
                      name: true,
                      brand: true,
                      primaryPackaging: true,
                      cutSize: true,
                      imageUrl: true,
                    },
                  },
                },
              },
            },
          },
          documents: true,
        },
      }),
      prisma.shipment.findMany({
        where: companyId ? { companyId } : {},
        select: {
          destinationCountry: true,
          salesOrganization: { select: { id: true, name: true, code: true } },
        },
      }),
    ]);

    const shipments = records.map(mapDetailedRecordToDTO);

    // Extract unique countries and sales orgs for filters
    const countrySet = new Set<string>();
    const salesOrgMap = new Map<string, { id: string; name: string; code: string }>();

    allShipments.forEach((s: any) => {
      if (s.destinationCountry) countrySet.add(s.destinationCountry);
      if (s.salesOrganization) {
        salesOrgMap.set(s.salesOrganization.id, s.salesOrganization);
      }
    });

    return {
      success: true,
      shipments,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit) || 1,
      countries: Array.from(countrySet).sort(),
      salesOrgs: Array.from(salesOrgMap.values()),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch shipments list';
    return {
      success: false,
      shipments: [],
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      countries: [],
      salesOrgs: [],
      error: message,
    };
  }
}

/**
 * Fetch detailed shipment by order number or ID
 */
export async function getShipmentDetails(
  orderNumberOrId: string,
  options?: { companyId?: string }
): Promise<GetShipmentDetailsResult> {
  const trimmed = orderNumberOrId ? orderNumberOrId.trim() : '';
  if (!trimmed) {
    return { success: false, shipment: null, error: 'Order Number or ID is required' };
  }

  try {
    const record = await prisma.shipment.findFirst({
      where: {
        OR: [{ id: trimmed }, { orderNumber: trimmed }],
      },
      include: {
        salesOrganization: { select: { id: true, name: true, code: true } },
        containers: {
          include: {
            items: {
              include: {
                product: {
                  select: {
                    sku: true,
                    name: true,
                    brand: true,
                    primaryPackaging: true,
                    cutSize: true,
                    imageUrl: true,
                  },
                },
              },
            },
          },
        },
        documents: true,
      },
    });

    if (!record) {
      return { success: false, shipment: null, error: 'Shipment not found' };
    }

    const companyId = options?.companyId || (await getActiveCompanyIdFromCookies());
    if (companyId && record.companyId !== companyId) {
      return { success: false, shipment: null, error: 'Access denied to this shipment' };
    }

    return {
      success: true,
      shipment: mapDetailedRecordToDTO(record),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch shipment details';
    return {
      success: false,
      shipment: null,
      error: message,
    };
  }
}

/**
 * Generates presigned download URL for a shipment document
 */
export async function getShipmentDocumentPresignedUrl(
  documentId: string,
  options?: { companyId?: string }
): Promise<GetShipmentDocumentDownloadResult> {
  const trimmed = documentId ? documentId.trim() : '';
  if (!trimmed) {
    return {
      success: false,
      downloadUrl: null,
      fileName: null,
      error: 'Document ID is required',
    };
  }

  try {
    const doc = await prisma.shipmentDocument.findUnique({
      where: { id: trimmed },
      include: {
        shipment: { select: { companyId: true } },
      },
    });

    if (!doc) {
      return {
        success: false,
        downloadUrl: null,
        fileName: null,
        error: 'Document not found',
      };
    }

    const companyId = options?.companyId || (await getActiveCompanyIdFromCookies());
    if (companyId && doc.shipment.companyId !== companyId) {
      return {
        success: false,
        downloadUrl: null,
        fileName: null,
        error: 'Access denied to this document',
      };
    }

    const downloadUrl = await createPresignedDownloadUrl(doc.fileUrl);

    return {
      success: true,
      downloadUrl,
      fileName: doc.fileName,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to generate download URL';
    return {
      success: false,
      downloadUrl: null,
      fileName: null,
      error: message,
    };
  }
}
