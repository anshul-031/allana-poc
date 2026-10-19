'use server';

import { prisma } from '@/lib/prisma';
import { ACTIVE_COMPANY_COOKIE } from '@/lib/company-context';
import { cookies } from 'next/headers';
import {
  CreateCustomProductInput,
  CreateCustomProductSchema,
  FreezingTypeEnum,
  CustomProductStatusEnum,
} from '@/server/validators/npd.schema';

export type CustomProductStatus = 'IN_REVIEW' | 'ANALYSIS' | 'ACCEPTED' | 'DECLINED';
export type FreezingType = 'BLOCK_FROZEN' | 'IQF' | 'BLAST_FROZEN' | 'CHILLED';

export interface CustomProductRequestDTO {
  id: string;
  requestNumber: string;
  companyId: string;
  companyName: string;
  createdById: string;
  createdByName: string;
  categoryName: string;
  targetCountry: string;
  cutSpecification: string | null;
  recipeNotes: string | null;
  packagingFormat: string | null;
  individualPackagingWeight: string | null;
  freezingType: FreezingType;
  estimatedFcaPricePerTon: number | null;
  targetVolumeMt: number | null;
  targetPriceUsd: number | null;
  isCalibrated: boolean;
  isMarinated: boolean;
  isBoneless: boolean;
  isSkinless: boolean;
  hasSpecification: boolean;
  additionalComments: string | null;
  attachmentUrl: string | null;
  status: CustomProductStatus;
  managerComments: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetCustomProductRequestsResult {
  success: boolean;
  requests: CustomProductRequestDTO[];
  total: number;
  error?: string;
}

export interface GetCustomProductRequestResult {
  success: boolean;
  request: CustomProductRequestDTO | null;
  error?: string;
}

export interface CreateCustomProductResult {
  success: boolean;
  request: CustomProductRequestDTO | null;
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

/**
 * Generates an NPD sequential ticket number: NPD-YYYY-XXX
 */
export async function generateNpdRequestNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.customProductRequest.count({
    where: {
      requestNumber: { startsWith: `NPD-${year}-` },
    },
  });
  const seq = String(count + 1).padStart(3, '0');
  return `NPD-${year}-${seq}`;
}

function mapToDTO(record: any): CustomProductRequestDTO {
  const authorName = record.createdBy
    ? `${record.createdBy.firstName || ''} ${record.createdBy.lastName || ''}`.trim() || 'Portal User'
    : 'Portal User';

  return {
    id: record.id,
    requestNumber: record.requestNumber,
    companyId: record.companyId,
    companyName: record.company?.name || 'Company',
    createdById: record.createdById,
    createdByName: authorName,
    categoryName: record.categoryName,
    targetCountry: record.targetCountry,
    cutSpecification: record.cutSpecification,
    recipeNotes: record.recipeNotes,
    packagingFormat: record.packagingFormat,
    individualPackagingWeight: record.individualPackagingWeight,
    freezingType: record.freezingType as FreezingType,
    estimatedFcaPricePerTon: record.estimatedFcaPricePerTon ? Number(record.estimatedFcaPricePerTon) : null,
    targetVolumeMt: record.targetVolumeMt ? Number(record.targetVolumeMt) : null,
    targetPriceUsd: record.targetPriceUsd ? Number(record.targetPriceUsd) : null,
    isCalibrated: Boolean(record.isCalibrated),
    isMarinated: Boolean(record.isMarinated),
    isBoneless: Boolean(record.isBoneless),
    isSkinless: Boolean(record.isSkinless),
    hasSpecification: Boolean(record.hasSpecification),
    additionalComments: record.additionalComments,
    attachmentUrl: record.attachmentUrl,
    status: record.status as CustomProductStatus,
    managerComments: record.managerComments,
    createdAt: new Date(record.createdAt).toISOString(),
    updatedAt: new Date(record.updatedAt).toISOString(),
  };
}

/**
 * Creates a new Customized Product Request (NPD Ticket)
 */
export async function createCustomProductRequest(
  input: CreateCustomProductInput,
  options?: { companyId?: string; authorId?: string }
): Promise<CreateCustomProductResult> {
  try {
    const validated = CreateCustomProductSchema.parse(input);

    let companyId = options?.companyId || (await getActiveCompanyIdFromCookies());
    if (!companyId) {
      const fallbackCompany = await prisma.company.findFirst();
      if (!fallbackCompany) {
        return { success: false, request: null, error: 'No active company found' };
      }
      companyId = fallbackCompany.id;
    }

    let authorId = options?.authorId;
    if (!authorId) {
      const fallbackUser = await prisma.user.findFirst({
        where: { companyId },
      });
      if (!fallbackUser) {
        return { success: false, request: null, error: 'No authorized user found' };
      }
      authorId = fallbackUser.id;
    }

    const requestNumber = await generateNpdRequestNumber();

    const record = await prisma.customProductRequest.create({
      data: {
        requestNumber,
        companyId,
        createdById: authorId,
        categoryName: validated.categoryName,
        targetCountry: validated.targetCountry,
        cutSpecification: validated.cutSpecification,
        recipeNotes: validated.recipeNotes || null,
        packagingFormat: validated.packagingFormat,
        individualPackagingWeight: validated.individualPackagingWeight,
        freezingType: validated.freezingType,
        estimatedFcaPricePerTon: validated.estimatedFcaPricePerTon ?? null,
        targetVolumeMt: validated.targetVolumeMt ?? null,
        targetPriceUsd: validated.targetPriceUsd ?? null,
        isCalibrated: validated.isCalibrated,
        isMarinated: validated.isMarinated,
        isBoneless: validated.isBoneless,
        isSkinless: validated.isSkinless,
        hasSpecification: validated.hasSpecification,
        additionalComments: validated.additionalComments || null,
        attachmentUrl: validated.attachmentUrl || null,
        status: 'IN_REVIEW',
      },
      include: {
        company: { select: { name: true } },
        createdBy: { select: { firstName: true, lastName: true } },
      },
    });

    // Log security audit action
    await prisma.actionLog.create({
      data: {
        companyId,
        authorId,
        action: 'CREATE_NPD_REQUEST',
        comment: `Submitted customized product request ${requestNumber} for ${validated.categoryName}`,
      },
    });

    return {
      success: true,
      request: mapToDTO(record),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create customized product request';
    return {
      success: false,
      request: null,
      error: message,
    };
  }
}

/**
 * Fetches all Customized Product Requests for the company
 */
export async function getCustomProductRequests(options?: {
  companyId?: string;
  status?: string;
  search?: string;
}): Promise<GetCustomProductRequestsResult> {
  try {
    let companyId = options?.companyId || (await getActiveCompanyIdFromCookies());

    const where: any = {};
    if (companyId) {
      where.companyId = companyId;
    }

    if (options?.status && options.status !== 'ALL') {
      const parsedStatus = CustomProductStatusEnum.safeParse(options.status);
      if (parsedStatus.success) {
        where.status = parsedStatus.data;
      }
    }

    if (options?.search && options.search.trim()) {
      const s = options.search.trim();
      where.OR = [
        { requestNumber: { contains: s, mode: 'insensitive' } },
        { categoryName: { contains: s, mode: 'insensitive' } },
        { cutSpecification: { contains: s, mode: 'insensitive' } },
      ];
    }

    const records = await prisma.customProductRequest.findMany({
      where,
      include: {
        company: { select: { name: true } },
        createdBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const requests = records.map(mapToDTO);

    return {
      success: true,
      requests,
      total: requests.length,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch customized product requests';
    return {
      success: false,
      requests: [],
      total: 0,
      error: message,
    };
  }
}

/**
 * Fetches a single Customized Product Request by ID
 */
export async function getCustomProductRequestById(
  id: string,
  options?: { companyId?: string }
): Promise<GetCustomProductRequestResult> {
  const trimmed = id ? id.trim() : '';
  if (!trimmed) {
    return { success: false, request: null, error: 'Request ID is required' };
  }

  try {
    const record = await prisma.customProductRequest.findUnique({
      where: { id: trimmed },
      include: {
        company: { select: { name: true } },
        createdBy: { select: { firstName: true, lastName: true } },
      },
    });

    if (!record) {
      return { success: false, request: null, error: 'Request not found' };
    }

    const companyId = options?.companyId || (await getActiveCompanyIdFromCookies());
    if (companyId && record.companyId !== companyId) {
      return { success: false, request: null, error: 'Access denied to this request' };
    }

    return {
      success: true,
      request: mapToDTO(record),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch request';
    return {
      success: false,
      request: null,
      error: message,
    };
  }
}
