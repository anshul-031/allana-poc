'use server';

import { prisma } from '@/lib/prisma';
import { ACTIVE_COMPANY_COOKIE } from '@/lib/company-context';
import { cookies } from 'next/headers';
import { createPresignedDownloadUrl } from '@/lib/r2';
import {
  QualityClaimInput,
  qualityClaimSchema,
  InfoRequestInput,
  infoRequestSchema,
} from '@/server/validators/claim.schema';

export type ClaimStatus =
  | 'REGISTERED'
  | 'UNDER_REVIEW'
  | 'INVESTIGATION'
  | 'CLARIFICATION_REQUIRED'
  | 'PARTLY_ACCEPTED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'COMPLETED';

export type ClaimType = 'CLAIM' | 'INFO_REQUEST';

export type InfoRequestCategory =
  | 'QUESTIONNAIRE'
  | 'DOCS_SPECIFICATION'
  | 'DOCS_SURVEY_REPORT'
  | 'DOCS_CERTIFICATE'
  | 'DOCS_DECLARATION_QUALITY'
  | 'DOCS_DECLARATION_SHELF_LIFE'
  | 'DOCS_DECLARATION_LEGISLATION'
  | 'DOCS_DECLARATION_OTHER'
  | 'OTHER_QUALITY_SAFETY'
  | 'OTHER_AUDIT'
  | 'OTHER_CLARIFYING_INFO';

export interface ClaimProductItemDTO {
  id: string;
  claimId: string;
  productId: string | null;
  productArticle: string;
  productName: string;
  producerName: string | null;
  country: string | null;
  productionDate: string | null;
  lotNumber: string | null;
  vehicleNumber: string | null;
  nonConformWeightKg: number;
  receivedQuantityKg: number | null;
}

export interface ClaimAttachmentDTO {
  id: string;
  claimId: string;
  fileName: string;
  fileUrl: string;
  fileSizeBytes: number;
  createdAt: string;
}

export interface ClaimDTO {
  id: string;
  claimNumber: string;
  companyId: string;
  companyName: string;
  submittedById: string;
  submittedByName: string;
  submittedByEmail?: string;
  type: ClaimType;
  status: ClaimStatus;
  subject: string;
  categoryOfRequest: string | null;
  supplierName: string | null;
  infoCategory: InfoRequestCategory | null;
  targetCountry: string | null;
  requestedShelfLifeDate: string | null;
  reasonForShelfLifeExtension: string | null;
  shelfLifeExtensionVolumeKg: number | null;
  shipmentId: string | null;
  containerNumber: string | null;
  invoiceNumber: string | null;
  deliveryDate: string | null;
  description: string | null;
  additionalEmails: string | null;
  companyResponse: string | null;
  resolvedAt: string | null;
  products: ClaimProductItemDTO[];
  attachments: ClaimAttachmentDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface ClaimsFilterOptions {
  companyId?: string;
  type?: 'ALL' | ClaimType;
  status?: 'ALL' | ClaimStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface GetClaimsResult {
  success: boolean;
  claims: ClaimDTO[];
  total: number;
  error?: string;
}

export interface GetClaimDetailsResult {
  success: boolean;
  claim: ClaimDTO | null;
  error?: string;
}

export interface SubmitClaimResult {
  success: boolean;
  claim: ClaimDTO | null;
  error?: string;
}

export interface LookupProductResult {
  success: boolean;
  product: {
    id: string;
    sku: string;
    name: string;
    category: string;
    brand: string;
  } | null;
  error?: string;
}

export interface PresignedDownloadResult {
  success: boolean;
  url: string | null;
  fileName?: string;
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

export interface ClaimantProfile {
  companyName: string;
  userEmail: string;
  userName: string;
}

export async function getClaimantProfile(): Promise<ClaimantProfile> {
  const companyId = await getActiveCompanyIdFromCookies();
  let company = null;
  if (companyId) {
    company = await prisma.company.findUnique({
      where: { id: companyId },
      include: { users: { take: 1 } },
    });
  }
  if (!company) {
    company = await prisma.company.findFirst({
      include: { users: { take: 1 } },
    });
  }
  const user = company?.users?.[0];
  const userNameParts = user ? [user.firstName, user.lastName].filter(Boolean) : [];
  return {
    companyName: company?.name || 'Authorized Buyer Partner',
    userEmail: user?.email || 'procurement@partner.com',
    userName: userNameParts.length > 0 ? userNameParts.join(' ') : 'Procurement Lead',
  };
}

export async function generateClaimNumber(type: ClaimType): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = type === 'CLAIM' ? `CLM-${year}-` : `REQ-${year}-`;
  const count = await prisma.claim.count({
    where: {
      claimNumber: { startsWith: prefix },
    },
  });
  const seq = String(count + 1).padStart(4, '0');
  return `${prefix}${seq}`;
}

export function mapProductItemToDTO(item: any): ClaimProductItemDTO {
  return {
    id: item.id,
    claimId: item.claimId,
    productId: item.productId ?? null,
    productArticle: item.productArticle,
    productName: item.productName,
    producerName: item.producerName ?? null,
    country: item.country ?? null,
    productionDate: item.productionDate ? new Date(item.productionDate).toISOString() : null,
    lotNumber: item.lotNumber ?? null,
    vehicleNumber: item.vehicleNumber ?? null,
    nonConformWeightKg: Number(item.nonConformWeightKg),
    receivedQuantityKg: item.receivedQuantityKg != null ? Number(item.receivedQuantityKg) : null,
  };
}

export function mapAttachmentToDTO(att: any): ClaimAttachmentDTO {
  return {
    id: att.id,
    claimId: att.claimId,
    fileName: att.fileName,
    fileUrl: att.fileUrl,
    fileSizeBytes: att.fileSizeBytes,
    createdAt: new Date(att.createdAt).toISOString(),
  };
}

export function mapClaimToDTO(record: any): ClaimDTO {
  let authorName = 'Portal User';
  if (record.submittedBy) {
    const parts = [record.submittedBy.firstName, record.submittedBy.lastName].filter(Boolean);
    if (parts.length > 0) {
      authorName = parts.join(' ');
    }
  }

  return {
    id: record.id,
    claimNumber: record.claimNumber,
    companyId: record.companyId,
    companyName: record.company?.name || 'Company',
    submittedById: record.submittedById,
    submittedByName: authorName,
    submittedByEmail: record.submittedBy?.email,
    type: record.type as ClaimType,
    status: record.status as ClaimStatus,
    subject: record.subject,
    categoryOfRequest: record.categoryOfRequest ?? null,
    supplierName: record.supplierName ?? null,
    infoCategory: record.infoCategory ?? null,
    targetCountry: record.targetCountry ?? null,
    requestedShelfLifeDate: record.requestedShelfLifeDate
      ? new Date(record.requestedShelfLifeDate).toISOString()
      : null,
    reasonForShelfLifeExtension: record.reasonForShelfLifeExtension ?? null,
    shelfLifeExtensionVolumeKg:
      record.shelfLifeExtensionVolumeKg != null ? Number(record.shelfLifeExtensionVolumeKg) : null,
    shipmentId: record.shipmentId ?? null,
    containerNumber: record.containerNumber ?? null,
    invoiceNumber: record.invoiceNumber ?? null,
    deliveryDate: record.deliveryDate ? new Date(record.deliveryDate).toISOString() : null,
    description: record.description ?? null,
    additionalEmails: record.additionalEmails ?? null,
    companyResponse: record.companyResponse ?? null,
    resolvedAt: record.resolvedAt ? new Date(record.resolvedAt).toISOString() : null,
    products: Array.isArray(record.products) ? record.products.map(mapProductItemToDTO) : [],
    attachments: Array.isArray(record.attachments) ? record.attachments.map(mapAttachmentToDTO) : [],
    createdAt: new Date(record.createdAt).toISOString(),
    updatedAt: new Date(record.updatedAt).toISOString(),
  };
}

/**
 * Fetch list of claims/requests with filtering, searching, and pagination
 */
export async function getClaimsList(filters?: ClaimsFilterOptions): Promise<GetClaimsResult> {
  try {
    let companyId = filters?.companyId || (await getActiveCompanyIdFromCookies());
    if (!companyId) {
      const fallback = await prisma.company.findFirst();
      if (fallback) {
        companyId = fallback.id;
      }
    }

    const where: any = {};
    if (companyId) {
      where.companyId = companyId;
    }

    if (filters?.type && filters.type !== 'ALL') {
      where.type = filters.type;
    }

    if (filters?.status && filters.status !== 'ALL') {
      where.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    if (filters?.search && filters.search.trim()) {
      const query = filters.search.trim();
      where.OR = [
        { claimNumber: { contains: query, mode: 'insensitive' } },
        { subject: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { containerNumber: { contains: query, mode: 'insensitive' } },
        { invoiceNumber: { contains: query, mode: 'insensitive' } },
        {
          products: {
            some: {
              OR: [
                { productArticle: { contains: query, mode: 'insensitive' } },
                { productName: { contains: query, mode: 'insensitive' } },
                { vehicleNumber: { contains: query, mode: 'insensitive' } },
              ],
            },
          },
        },
      ];
    }

    const [total, records] = await Promise.all([
      prisma.claim.count({ where }),
      prisma.claim.findMany({
        where,
        include: {
          company: { select: { name: true } },
          submittedBy: { select: { firstName: true, lastName: true, email: true } },
          products: true,
          attachments: true,
        },
        orderBy: { createdAt: 'desc' },
        take: filters?.limit,
        skip: filters?.offset,
      }),
    ]);

    return {
      success: true,
      claims: records.map(mapClaimToDTO),
      total,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch claims';
    return {
      success: false,
      claims: [],
      total: 0,
      error: message,
    };
  }
}

/**
 * Fetch detailed view of a single claim by ID
 */
export async function getClaimDetails(
  id: string,
  options?: { companyId?: string }
): Promise<GetClaimDetailsResult> {
  const trimmed = id ? id.trim() : '';
  if (!trimmed) {
    return { success: false, claim: null, error: 'Claim ID is required' };
  }

  try {
    const record = await prisma.claim.findUnique({
      where: { id: trimmed },
      include: {
        company: { select: { name: true } },
        submittedBy: { select: { firstName: true, lastName: true, email: true } },
        products: true,
        attachments: true,
      },
    });

    if (!record) {
      return { success: false, claim: null, error: 'Claim not found' };
    }

    const companyId = options?.companyId || (await getActiveCompanyIdFromCookies());
    if (companyId && record.companyId !== companyId) {
      return { success: false, claim: null, error: 'Access denied to this claim' };
    }

    return {
      success: true,
      claim: mapClaimToDTO(record),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch claim details';
    return {
      success: false,
      claim: null,
      error: message,
    };
  }
}

/**
 * Lookup product name & details from catalog when entering article number
 */
export async function lookupProductByArticle(article: string): Promise<LookupProductResult> {
  const trimmed = article ? article.trim() : '';
  if (!trimmed) {
    return { success: false, product: null, error: 'Article is required' };
  }

  try {
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { sku: { equals: trimmed, mode: 'insensitive' } },
          { sku: { contains: trimmed, mode: 'insensitive' } },
          { name: { contains: trimmed, mode: 'insensitive' } },
        ],
      },
      include: {
        category: { select: { name: true } },
      },
    });

    if (!product) {
      return {
        success: true,
        product: null,
      };
    }

    return {
      success: true,
      product: {
        id: product.id,
        sku: product.sku,
        name: product.name,
        category: product.category?.name || 'General Meat',
        brand: product.brand,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to lookup product';
    return {
      success: false,
      product: null,
      error: message,
    };
  }
}

/**
 * Submit a comprehensive Quality Claim with up to 10 product lines and attachments
 */
export async function submitQualityClaim(
  input: QualityClaimInput,
  options?: { companyId?: string; authorId?: string }
): Promise<SubmitClaimResult> {
  try {
    const validated = qualityClaimSchema.parse(input);

    let companyId = options?.companyId || (await getActiveCompanyIdFromCookies());
    if (!companyId) {
      const fallbackCompany = await prisma.company.findFirst();
      if (!fallbackCompany) {
        return { success: false, claim: null, error: 'No active company found' };
      }
      companyId = fallbackCompany.id;
    }

    let authorId = options?.authorId;
    if (!authorId) {
      const fallbackUser = await prisma.user.findFirst({
        where: { companyId },
      });
      if (!fallbackUser) {
        return { success: false, claim: null, error: 'No authorized user found' };
      }
      authorId = fallbackUser.id;
    }

    const claimNumber = await generateClaimNumber('CLAIM');

    // Build product line create payload
    const productItemsData = validated.products.map((p) => ({
      productArticle: p.productArticle,
      productName: p.productName,
      producerName: p.producerName ?? null,
      country: p.country ?? null,
      productionDate: p.productionDate ? new Date(p.productionDate) : null,
      lotNumber: p.lotNumber ?? null,
      vehicleNumber: p.vehicleNumber ?? null,
      nonConformWeightKg: p.nonConformWeightKg,
      receivedQuantityKg: p.receivedQuantityKg ?? null,
    }));

    // Build attachments create payload
    const attachmentsData = (validated.attachmentKeys || []).map((key) => {
      const fileName = key.split('/').pop() || key;
      return {
        fileName,
        fileUrl: key,
        fileSizeBytes: 1024 * 50, // default size estimate if not specified
      };
    });

    const record = await prisma.claim.create({
      data: {
        claimNumber,
        companyId,
        submittedById: authorId,
        type: 'CLAIM',
        status: 'REGISTERED',
        subject: validated.subject,
        categoryOfRequest: validated.categoryOfRequest,
        supplierName: validated.supplierName,
        invoiceNumber: validated.invoiceNumber ?? null,
        containerNumber: validated.containerNumber ?? null,
        targetCountry: validated.country ?? null,
        description: validated.description ?? null,
        additionalEmails: validated.additionalEmails ?? null,
        products: {
          create: productItemsData,
        },
        attachments: {
          create: attachmentsData,
        },
      },
      include: {
        company: { select: { name: true } },
        submittedBy: { select: { firstName: true, lastName: true, email: true } },
        products: true,
        attachments: true,
      },
    });

    // Log action in audit trail
    await prisma.actionLog.create({
      data: {
        companyId,
        authorId,
        action: 'SUBMIT_QUALITY_CLAIM',
        comment: `Submitted quality claim ${claimNumber} (${validated.categoryOfRequest}) with ${validated.products.length} product lines`,
      },
    });

    return {
      success: true,
      claim: mapClaimToDTO(record),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to submit quality claim';
    return {
      success: false,
      claim: null,
      error: message,
    };
  }
}

/**
 * Submit an Info Request with categorized request parameters
 */
export async function submitInfoRequest(
  input: InfoRequestInput,
  options?: { companyId?: string; authorId?: string }
): Promise<SubmitClaimResult> {
  try {
    const validated = infoRequestSchema.parse(input);

    let companyId = options?.companyId || (await getActiveCompanyIdFromCookies());
    if (!companyId) {
      const fallbackCompany = await prisma.company.findFirst();
      if (!fallbackCompany) {
        return { success: false, claim: null, error: 'No active company found' };
      }
      companyId = fallbackCompany.id;
    }

    let authorId = options?.authorId;
    if (!authorId) {
      const fallbackUser = await prisma.user.findFirst({
        where: { companyId },
      });
      if (!fallbackUser) {
        return { success: false, claim: null, error: 'No authorized user found' };
      }
      authorId = fallbackUser.id;
    }

    const claimNumber = await generateClaimNumber('INFO_REQUEST');

    // Build attachments create payload
    const attachmentsData = (validated.attachmentKeys || []).map((key) => {
      const fileName = key.split('/').pop() || key;
      return {
        fileName,
        fileUrl: key,
        fileSizeBytes: 1024 * 50,
      };
    });

    // Optional single product line if product article/name supplied
    const productItemsData =
      validated.productArticle && validated.productName
        ? [
            {
              productArticle: validated.productArticle,
              productName: validated.productName,
              producerName: validated.supplierName ?? null,
              country: validated.targetCountry ?? null,
              productionDate: validated.productionDate ? new Date(validated.productionDate) : null,
              nonConformWeightKg: 0,
            },
          ]
        : [];

    const record = await prisma.claim.create({
      data: {
        claimNumber,
        companyId,
        submittedById: authorId,
        type: 'INFO_REQUEST',
        status: 'REGISTERED',
        subject: validated.subject,
        categoryOfRequest: validated.infoCategory,
        infoCategory: validated.infoCategory,
        targetCountry: validated.targetCountry ?? null,
        supplierName: validated.supplierName ?? null,
        requestedShelfLifeDate: validated.requestedShelfLifeDate
          ? new Date(validated.requestedShelfLifeDate)
          : null,
        reasonForShelfLifeExtension: validated.reasonForShelfLifeExtension ?? null,
        shelfLifeExtensionVolumeKg: validated.shelfLifeExtensionVolumeKg ?? null,
        containerNumber: validated.containerNumber ?? null,
        invoiceNumber: validated.orderNumber ?? null,
        description: validated.description ?? null,
        additionalEmails: validated.additionalEmails ?? null,
        products: {
          create: productItemsData,
        },
        attachments: {
          create: attachmentsData,
        },
      },
      include: {
        company: { select: { name: true } },
        submittedBy: { select: { firstName: true, lastName: true, email: true } },
        products: true,
        attachments: true,
      },
    });

    // Log action in audit trail
    await prisma.actionLog.create({
      data: {
        companyId,
        authorId,
        action: 'SUBMIT_INFO_REQUEST',
        comment: `Submitted info request ${claimNumber} [${validated.infoCategory}] - ${validated.subject}`,
      },
    });

    return {
      success: true,
      claim: mapClaimToDTO(record),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to submit info request';
    return {
      success: false,
      claim: null,
      error: message,
    };
  }
}

/**
 * Fetch presigned Cloudflare R2 download URL for a claim attachment
 */
export async function getClaimAttachmentPresignedUrl(
  attachmentId: string,
  options?: { companyId?: string; authorId?: string }
): Promise<PresignedDownloadResult> {
  const trimmed = attachmentId ? attachmentId.trim() : '';
  if (!trimmed) {
    return { success: false, url: null, error: 'Attachment ID is required' };
  }

  try {
    const attachment = await prisma.claimAttachment.findUnique({
      where: { id: trimmed },
      include: {
        claim: { select: { companyId: true, claimNumber: true } },
      },
    });

    if (!attachment) {
      return { success: false, url: null, error: 'Attachment not found' };
    }

    const companyId = options?.companyId || (await getActiveCompanyIdFromCookies());
    if (companyId && attachment.claim.companyId !== companyId) {
      return { success: false, url: null, error: 'Access denied to this document' };
    }

    const url = await createPresignedDownloadUrl(attachment.fileUrl);

    // Audit log
    if (options?.authorId) {
      await prisma.actionLog.create({
        data: {
          companyId: attachment.claim.companyId,
          authorId: options.authorId,
          action: 'DOWNLOAD_CLAIM_ATTACHMENT',
          comment: `Downloaded attachment ${attachment.fileName} for ${attachment.claim.claimNumber}`,
        },
      });
    }

    return {
      success: true,
      url,
      fileName: attachment.fileName,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to generate download URL';
    return {
      success: false,
      url: null,
      error: message,
    };
  }
}
