'use server';

import { prisma } from '@/lib/prisma';
import { ACTIVE_COMPANY_COOKIE } from '@/lib/company-context';
import { cookies } from 'next/headers';

export interface SalesOrgDTO {
  id: string;
  code: string;
  name: string;
  currency: string;
}

export interface FinancialMetricDTO {
  creditLimit: number;
  receivables: number;
  overdueReceivables: number;
  availableLimit: number;
  currency: string;
  salesOrgId: string;
  salesOrgName: string;
  salesOrgCode: string;
  updatedAt: string;
  isDeficit: boolean;
}

export interface GetFinancialsResult {
  success: boolean;
  financials: FinancialMetricDTO | null;
  availableSalesOrgs: SalesOrgDTO[];
  selectedSalesOrgId?: string;
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
 * Fetch financial indicators (Credit Limit, Receivables, Overdue, Available)
 * for a specific company and sales organization
 */
export async function getCompanyFinancials(options?: {
  companyId?: string;
  salesOrgId?: string;
}): Promise<GetFinancialsResult> {
  const companyId = options?.companyId || (await getActiveCompanyIdFromCookies());

  if (!companyId) {
    return {
      success: false,
      financials: null,
      availableSalesOrgs: [],
      error: 'No active company context selected',
    };
  }

  try {
    // 1. Fetch all financial records with their sales organization for this company
    const records = await prisma.companyFinancial.findMany({
      where: { companyId },
      include: {
        salesOrganization: true,
      },
      orderBy: {
        salesOrganization: {
          code: 'asc',
        },
      },
    });

    if (records.length === 0) {
      return {
        success: true,
        financials: null,
        availableSalesOrgs: [],
      };
    }

    const availableSalesOrgs: SalesOrgDTO[] = records.map((r: (typeof records)[number]) => ({
      id: r.salesOrganization.id,
      code: r.salesOrganization.code,
      name: r.salesOrganization.name,
      currency: r.salesOrganization.currency,
    }));

    // Pick requested salesOrg or default to the first one
    const selectedRecord =
      (options?.salesOrgId &&
        records.find((r: (typeof records)[number]) => r.salesOrgId === options.salesOrgId)) ||
      records[0];

    const creditLimit = Number(selectedRecord.creditLimit);
    const receivables = Number(selectedRecord.receivables);
    const overdueReceivables = Number(selectedRecord.overdueReceivables);
    const availableLimit = Number(selectedRecord.availableLimit);

    const financials: FinancialMetricDTO = {
      creditLimit,
      receivables,
      overdueReceivables,
      availableLimit,
      currency: selectedRecord.salesOrganization.currency || 'USD',
      salesOrgId: selectedRecord.salesOrgId,
      salesOrgName: selectedRecord.salesOrganization.name,
      salesOrgCode: selectedRecord.salesOrganization.code,
      updatedAt: selectedRecord.updatedAt.toISOString(),
      isDeficit: availableLimit < 0,
    };

    return {
      success: true,
      financials,
      availableSalesOrgs,
      selectedSalesOrgId: selectedRecord.salesOrgId,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch financial indicators';
    return {
      success: false,
      financials: null,
      availableSalesOrgs: [],
      error: message,
    };
  }
}
