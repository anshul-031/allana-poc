'use server';

import { prisma } from '@/lib/prisma';
import { ACTIVE_COMPANY_COOKIE } from '@/lib/company-context';
import {
  aggregateSalesPlan,
  SalesPlanSummary,
  UnitOfMeasureType,
} from '@/lib/sales-plan-calc';
import { cookies } from 'next/headers';

export interface SalesPlanFilterOptions {
  month?: number;
  year?: number;
  salesOrgId?: string;
  country?: string;
  shipToParty?: string;
  uom?: UnitOfMeasureType;
  sortBy?: 'country_asc' | 'country_desc' | 'target_desc';
}

export interface SalesPlanSalesOrgOption {
  id: string;
  name: string;
  code: string;
}

export interface GetSalesPlanResult {
  success: boolean;
  error?: string;
  summary: SalesPlanSummary;
  filters: {
    month: number;
    year: number;
    salesOrgId: string;
    country: string;
    shipToParty: string;
    uom: UnitOfMeasureType;
    sortBy: 'country_asc' | 'country_desc' | 'target_desc';
  };
  availableYears: number[];
  availableMonths: { month: number; label: string }[];
  availableSalesOrgs: SalesPlanSalesOrgOption[];
  availableCountries: string[];
  availableShipToParties: string[];
}

export async function getActiveCompanyIdFromCookies(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(ACTIVE_COMPANY_COOKIE)?.value || null;
  } catch {
    return null;
  }
}

const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const AVAILABLE_MONTHS = MONTH_LABELS.map((label, idx) => ({
  month: idx + 1,
  label,
}));

const AVAILABLE_YEARS = [2024, 2025, 2026, 2027];

/**
 * Enterprise seed sales plan data for Allana meat & agro exports
 */
const SEED_SALES_PLAN_RECORDS = [
  // Saudi Arabia - Carrefour Riyadh
  {
    id: 'plan-sa-cr-1',
    companyId: 'comp-1',
    salesOrgId: 'so-1',
    month: 10,
    year: 2026,
    country: 'Saudi Arabia',
    shipToParty: 'Carrefour Riyadh Central Logistics Hub',
    sku: 'AL-BUF-TOP-01',
    skuName: 'Frozen Boneless Buffalo Topside 20kg (SAP: 7940)',
    targetTonnes: 120.0,
    targetUsd: 576000.0,
    lastMonthBalanceTonnes: 15.0,
    lastMonthBalanceUsd: 72000.0,
    shippedTonnes: 72.0,
    shippedUsd: 345600.0,
    pipelineTonnes: 48.0,
    pipelineUsd: 230400.0,
  },
  {
    id: 'plan-sa-cr-2',
    companyId: 'comp-1',
    salesOrgId: 'so-1',
    month: 10,
    year: 2026,
    country: 'Saudi Arabia',
    shipToParty: 'Carrefour Riyadh Central Logistics Hub',
    sku: 'AL-BUF-SIL-01',
    skuName: 'Frozen Boneless Buffalo Silverside 20kg (SAP: 7941)',
    targetTonnes: 90.0,
    targetUsd: 414000.0,
    lastMonthBalanceTonnes: 0.0,
    lastMonthBalanceUsd: 0.0,
    shippedTonnes: 54.0,
    shippedUsd: 248400.0,
    pipelineTonnes: 26.0,
    pipelineUsd: 119600.0,
  },
  {
    id: 'plan-sa-cr-3',
    companyId: 'comp-1',
    salesOrgId: 'so-1',
    month: 10,
    year: 2026,
    country: 'Saudi Arabia',
    shipToParty: 'Carrefour Riyadh Central Logistics Hub',
    sku: 'AL-BUF-TEN-01',
    skuName: 'Frozen Boneless Buffalo Tenderloin IWP (SAP: 3358)',
    targetTonnes: 35.0,
    targetUsd: 262500.0,
    lastMonthBalanceTonnes: 5.0,
    lastMonthBalanceUsd: 37500.0,
    shippedTonnes: 20.0,
    shippedUsd: 150000.0,
    pipelineTonnes: 10.0,
    pipelineUsd: 75000.0,
  },

  // Saudi Arabia - LuLu Dammam
  {
    id: 'plan-sa-ld-1',
    companyId: 'comp-1',
    salesOrgId: 'so-1',
    month: 10,
    year: 2026,
    country: 'Saudi Arabia',
    shipToParty: 'LuLu Hypermarket Dammam DC',
    sku: 'AL-BUF-CHK-01',
    skuName: 'Frozen Boneless Buffalo Chuck Roll 20kg (SAP: 7943)',
    targetTonnes: 80.0,
    targetUsd: 360000.0,
    lastMonthBalanceTonnes: 10.0,
    lastMonthBalanceUsd: 45000.0,
    shippedTonnes: 60.0,
    shippedUsd: 270000.0,
    pipelineTonnes: 30.0,
    pipelineUsd: 135000.0,
  },
  {
    id: 'plan-sa-ld-2',
    companyId: 'comp-1',
    salesOrgId: 'so-1',
    month: 10,
    year: 2026,
    country: 'Saudi Arabia',
    shipToParty: 'LuLu Hypermarket Dammam DC',
    sku: 'AL-BUF-STR-01',
    skuName: 'Frozen Boneless Buffalo Striploin 20kg (SAP: 7942)',
    targetTonnes: 60.0,
    targetUsd: 312000.0,
    lastMonthBalanceTonnes: 0.0,
    lastMonthBalanceUsd: 0.0,
    shippedTonnes: 40.0,
    shippedUsd: 208000.0,
    pipelineTonnes: 20.0,
    pipelineUsd: 104000.0,
  },

  // United Arab Emirates - LuLu JAFZA
  {
    id: 'plan-ae-lj-1',
    companyId: 'comp-1',
    salesOrgId: 'so-1',
    month: 10,
    year: 2026,
    country: 'United Arab Emirates',
    shipToParty: 'LuLu Group Logistics JAFZA Dubai',
    sku: 'AL-BUF-TOP-01',
    skuName: 'Frozen Boneless Buffalo Topside 20kg (SAP: 7940)',
    targetTonnes: 150.0,
    targetUsd: 720000.0,
    lastMonthBalanceTonnes: 20.0,
    lastMonthBalanceUsd: 96000.0,
    shippedTonnes: 110.0,
    shippedUsd: 528000.0,
    pipelineTonnes: 50.0,
    pipelineUsd: 240000.0,
  },
  {
    id: 'plan-ae-lj-2',
    companyId: 'comp-1',
    salesOrgId: 'so-1',
    month: 10,
    year: 2026,
    country: 'United Arab Emirates',
    shipToParty: 'LuLu Group Logistics JAFZA Dubai',
    sku: 'AL-BUF-FLK-01',
    skuName: 'Frozen Boneless Buffalo Flank 20kg (SAP: 7944)',
    targetTonnes: 70.0,
    targetUsd: 294000.0,
    lastMonthBalanceTonnes: 0.0,
    lastMonthBalanceUsd: 0.0,
    shippedTonnes: 50.0,
    shippedUsd: 210000.0,
    pipelineTonnes: 20.0,
    pipelineUsd: 84000.0,
  },

  // United Arab Emirates - Spinneys Sharjah
  {
    id: 'plan-ae-ss-1',
    companyId: 'comp-1',
    salesOrgId: 'so-1',
    month: 10,
    year: 2026,
    country: 'United Arab Emirates',
    shipToParty: 'Spinneys Distribution Centre Sharjah',
    sku: 'AL-BUF-TEN-01',
    skuName: 'Frozen Boneless Buffalo Tenderloin IWP (SAP: 3358)',
    targetTonnes: 45.0,
    targetUsd: 337500.0,
    lastMonthBalanceTonnes: 8.0,
    lastMonthBalanceUsd: 60000.0,
    shippedTonnes: 30.0,
    shippedUsd: 225000.0,
    pipelineTonnes: 15.0,
    pipelineUsd: 112500.0,
  },

  // Jordan - Amman Distribution Hub
  {
    id: 'plan-jo-am-1',
    companyId: 'comp-1',
    salesOrgId: 'so-1',
    month: 10,
    year: 2026,
    country: 'Jordan',
    shipToParty: 'Amman Cold Storage & Logistics Center',
    sku: 'AL-BUF-SIL-01',
    skuName: 'Frozen Boneless Buffalo Silverside 20kg (SAP: 7941)',
    targetTonnes: 50.0,
    targetUsd: 230000.0,
    lastMonthBalanceTonnes: 0.0,
    lastMonthBalanceUsd: 0.0,
    shippedTonnes: 30.0,
    shippedUsd: 138000.0,
    pipelineTonnes: 15.0,
    pipelineUsd: 69000.0,
  },
];

/**
 * Fetches sales plan data for the active company and given filter options
 */
export async function getSalesPlanData(
  filters?: SalesPlanFilterOptions
): Promise<GetSalesPlanResult> {
  try {
    const activeCompanyId = await getActiveCompanyIdFromCookies();

    // Default parameters
    const now = new Date();
    const activeMonth = filters?.month ?? (now.getMonth() + 1);
    const activeYear = filters?.year ?? now.getFullYear();
    const activeSalesOrg = filters?.salesOrgId || 'ALL';
    const activeCountry = filters?.country || 'ALL';
    const activeShipTo = filters?.shipToParty || 'ALL';
    const activeUom = filters?.uom || 'TONNES';
    const activeSortBy = filters?.sortBy || 'country_asc';

    let salesOrgsList: SalesPlanSalesOrgOption[] = [
      { id: 'so-1', name: 'Allana Meat Exports', code: 'SO-01' },
      { id: 'so-2', name: 'Allana Agro & Poultry', code: 'SO-02' },
    ];

    try {
      const dbSalesOrgs = await prisma.salesOrganization.findMany({
        select: { id: true, name: true, code: true },
      });
      if (dbSalesOrgs && dbSalesOrgs.length > 0) {
        salesOrgsList = dbSalesOrgs;
      }
    } catch {
      // Use fallback salesOrgsList
    }

    let records: typeof SEED_SALES_PLAN_RECORDS = [];

    // Try fetching from Prisma if company exists
    if (activeCompanyId) {
      try {
        const whereClause: any = {
          companyId: activeCompanyId,
          month: activeMonth,
          year: activeYear,
        };

        if (activeSalesOrg !== 'ALL') {
          whereClause.salesOrgId = activeSalesOrg;
        }
        if (activeCountry !== 'ALL') {
          whereClause.country = activeCountry;
        }
        if (activeShipTo !== 'ALL') {
          whereClause.shipToParty = activeShipTo;
        }

        const dbRecords = await prisma.salesPlan.findMany({
          where: whereClause,
        });

        if (dbRecords && dbRecords.length > 0) {
          records = dbRecords.map((r: any) => ({
            id: r.id,
            companyId: r.companyId,
            salesOrgId: r.salesOrgId,
            month: r.month,
            year: r.year,
            country: r.country,
            shipToParty: r.shipToParty,
            sku: r.sku,
            skuName: r.skuName,
            targetTonnes: Number(r.targetTonnes),
            targetUsd: Number(r.targetUsd),
            lastMonthBalanceTonnes: Number(r.lastMonthBalance),
            lastMonthBalanceUsd: Math.round(Number(r.lastMonthBalance) * 4800),
            shippedTonnes: Number(r.shippedTonnes),
            shippedUsd: Number(r.shippedUsd),
            pipelineTonnes: Number(r.pipelineTonnes),
            pipelineUsd: Number(r.pipelineUsd),
          }));
        }
      } catch {
        // Fallback to seed
      }
    }

    // If records are empty, use curated seed records filtered appropriately
    if (records.length === 0) {
      records = SEED_SALES_PLAN_RECORDS.filter((r) => {
        if (activeCountry !== 'ALL' && r.country !== activeCountry) return false;
        if (activeShipTo !== 'ALL' && r.shipToParty !== activeShipTo) return false;
        if (activeSalesOrg !== 'ALL' && r.salesOrgId !== activeSalesOrg) return false;
        return true;
      });
    }

    // Extract available filter metadata
    const availableCountriesSet = new Set<string>();
    const availableShipToSet = new Set<string>();

    for (const r of SEED_SALES_PLAN_RECORDS) {
      availableCountriesSet.add(r.country);
      availableShipToSet.add(r.shipToParty);
    }

    const availableCountries = Array.from(availableCountriesSet).sort();
    const availableShipToParties = Array.from(availableShipToSet).sort();

    // Aggregate into 3-tier summary
    const summary = aggregateSalesPlan(records);

    // Apply sorting
    if (activeSortBy === 'country_desc') {
      summary.countries.sort((a, b) => b.country.localeCompare(a.country));
    } else if (activeSortBy === 'target_desc') {
      summary.countries.sort((a, b) => {
        const valA = activeUom === 'USD' ? a.totals.targetUsd : a.totals.targetTonnes;
        const valB = activeUom === 'USD' ? b.totals.targetUsd : b.totals.targetTonnes;
        return valB - valA;
      });
    } else {
      // Default: country_asc
      summary.countries.sort((a, b) => a.country.localeCompare(b.country));
    }

    return {
      success: true,
      summary,
      filters: {
        month: activeMonth,
        year: activeYear,
        salesOrgId: activeSalesOrg,
        country: activeCountry,
        shipToParty: activeShipTo,
        uom: activeUom,
        sortBy: activeSortBy,
      },
      availableYears: AVAILABLE_YEARS,
      availableMonths: AVAILABLE_MONTHS,
      availableSalesOrgs: salesOrgsList,
      availableCountries,
      availableShipToParties,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to retrieve sales plan',
      summary: {
        countries: [],
        grandTotal: {
          targetTonnes: 0,
          targetUsd: 0,
          lastMonthBalanceTonnes: 0,
          lastMonthBalanceUsd: 0,
          shippedTonnes: 0,
          shippedUsd: 0,
          pipelineTonnes: 0,
          pipelineUsd: 0,
          deltaTonnes: 0,
          deltaUsd: 0,
          statusTonnes: 'SURPLUS',
          statusUsd: 'SURPLUS',
          totalCountries: 0,
          totalShipToParties: 0,
          totalSkus: 0,
        },
      },
      filters: {
        month: 10,
        year: 2026,
        salesOrgId: 'ALL',
        country: 'ALL',
        shipToParty: 'ALL',
        uom: 'TONNES',
        sortBy: 'country_asc',
      },
      availableYears: AVAILABLE_YEARS,
      availableMonths: AVAILABLE_MONTHS,
      availableSalesOrgs: [],
      availableCountries: [],
      availableShipToParties: [],
    };
  }
}
