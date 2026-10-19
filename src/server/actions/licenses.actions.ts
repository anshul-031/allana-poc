'use server';

import { prisma } from '@/lib/prisma';
import { createPresignedDownloadUrl } from '@/lib/r2';
import { ACTIVE_COMPANY_COOKIE } from '@/lib/company-context';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export type LicenseStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED';

export interface ComplianceLicenseDTO {
  id: string;
  companyId: string;
  country: string;
  licenseName: string;
  licenseNumber: string;
  issueDate: string;
  expiryDate: string;
  documentUrl: string | null;
  daysRemaining: number;
  status: LicenseStatus;
}

export interface GetLicensesResult {
  success: boolean;
  licenses: ComplianceLicenseDTO[];
  companyName?: string;
  companyCountry?: string;
  isRegulatedJurisdiction: boolean;
  error?: string;
}

export interface UploadLicenseInput {
  licenseName: string;
  licenseNumber: string;
  country: string;
  issueDate: string;
  expiryDate: string;
  documentUrl?: string;
  authorId?: string;
  companyId?: string;
}

const REGULATED_COUNTRIES = [
  'saudi arabia',
  'ksa',
  'united arab emirates',
  'uae',
  'qatar',
  'kuwait',
  'egypt',
  'oman',
  'bahrain',
];

export function isRegulatedJurisdictionCountry(country?: string): boolean {
  if (!country) return false;
  return REGULATED_COUNTRIES.includes(country.trim().toLowerCase());
}

export function calculateLicenseStatus(expiryDate: Date | string): {
  daysRemaining: number;
  status: LicenseStatus;
} {
  const expiryTime = new Date(expiryDate).getTime();
  const now = Date.now();
  const diffDays = Math.ceil((expiryTime - now) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return { daysRemaining: diffDays, status: 'EXPIRED' };
  }
  if (diffDays <= 60) {
    return { daysRemaining: diffDays, status: 'EXPIRING_SOON' };
  }
  return { daysRemaining: diffDays, status: 'ACTIVE' };
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
 * Fetch all regulatory and compliance licenses for the active company
 */
export async function getCompanyLicenses(options?: {
  companyId?: string;
  authorId?: string;
}): Promise<GetLicensesResult> {
  const companyId = options?.companyId || (await getActiveCompanyIdFromCookies());
  if (!companyId) {
    return {
      success: false,
      licenses: [],
      isRegulatedJurisdiction: false,
      error: 'No active company context selected',
    };
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    return {
      success: false,
      licenses: [],
      isRegulatedJurisdiction: false,
      error: 'Active company record not found',
    };
  }

  const isRegulated = isRegulatedJurisdictionCountry(company.country);

  const records = await prisma.complianceLicense.findMany({
    where: { companyId },
    orderBy: { expiryDate: 'asc' },
  });

  const licenses: ComplianceLicenseDTO[] = records.map((rec: (typeof records)[number]) => {
    const { daysRemaining, status } = calculateLicenseStatus(rec.expiryDate);
    return {
      id: rec.id,
      companyId: rec.companyId,
      country: rec.country,
      licenseName: rec.licenseName,
      licenseNumber: rec.licenseNumber,
      issueDate: rec.issueDate.toISOString(),
      expiryDate: rec.expiryDate.toISOString(),
      documentUrl: rec.documentUrl,
      daysRemaining,
      status,
    };
  });

  return {
    success: true,
    licenses,
    companyName: company.name,
    companyCountry: company.country,
    isRegulatedJurisdiction: isRegulated,
  };
}

/**
 * Generate secure presigned R2 download URL for a compliance license document
 */
export async function getLicenseDownloadUrl(
  licenseId: string,
  options?: { companyId?: string }
): Promise<{
  success: boolean;
  downloadUrl?: string;
  error?: string;
}> {
  if (!licenseId) {
    return { success: false, error: 'License ID is required' };
  }

  const companyId = options?.companyId || (await getActiveCompanyIdFromCookies());

  const whereClause: { id: string; companyId?: string } = { id: licenseId };
  if (companyId) {
    whereClause.companyId = companyId;
  }

  const license = await prisma.complianceLicense.findFirst({
    where: whereClause,
  });

  if (!license) {
    return { success: false, error: 'Compliance license not found for this company' };
  }

  if (!license.documentUrl) {
    return { success: false, error: 'No document attached to this compliance license' };
  }

  try {
    const downloadUrl = await createPresignedDownloadUrl(license.documentUrl);
    return { success: true, downloadUrl };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to generate download URL';
    return { success: false, error: message };
  }
}

/**
 * Upload and register a renewed compliance certificate for the active company
 */
export async function uploadRenewedLicense(input: UploadLicenseInput): Promise<{
  success: boolean;
  licenseId?: string;
  error?: string;
}> {
  // Permission check if authorId provided
  if (input.authorId) {
    const author = await prisma.user.findUnique({
      where: { id: input.authorId },
    });
    if (!author) {
      return { success: false, error: 'Author record not found' };
    }
    const hasPermission =
      author.role === 'ADMIN' ||
      author.permissions?.includes('MANAGE_MEMBERS') ||
      author.permissions?.includes('CLIENT_MANAGEMENT');

    if (!hasPermission) {
      return {
        success: false,
        error: 'Forbidden: Insufficient permissions to manage compliance licenses',
      };
    }
  }

  if (!input.licenseName?.trim() || !input.licenseNumber?.trim() || !input.country?.trim()) {
    return {
      success: false,
      error: 'Validation failed: License name, number, and jurisdiction country are required',
    };
  }

  const issueDate = new Date(input.issueDate);
  const expiryDate = new Date(input.expiryDate);

  if (isNaN(issueDate.getTime()) || isNaN(expiryDate.getTime())) {
    return {
      success: false,
      error: 'Validation failed: Invalid issue or expiry date format',
    };
  }

  if (expiryDate <= issueDate) {
    return {
      success: false,
      error: 'Validation failed: Expiry date must be after issue date',
    };
  }

  const companyId = input.companyId || (await getActiveCompanyIdFromCookies());
  if (!companyId) {
    return { success: false, error: 'No active company context selected' };
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    return { success: false, error: 'Active company not found' };
  }

  const created = await prisma.complianceLicense.create({
    data: {
      companyId: company.id,
      country: input.country.trim(),
      licenseName: input.licenseName.trim(),
      licenseNumber: input.licenseNumber.trim(),
      issueDate,
      expiryDate,
      documentUrl: input.documentUrl?.trim() || null,
    },
  });

  // Security action audit log
  await prisma.actionLog.create({
    data: {
      companyId: company.id,
      authorId: input.authorId || 'system-admin',
      action: 'COMPLIANCE_LICENSE_UPLOADED',
      comment: `Uploaded renewed regulatory license: ${created.licenseName} (${created.licenseNumber}) for ${company.name}`,
    },
  });

  try {
    revalidatePath('/settings/licenses');
  } catch {
    // Graceful in tests
  }

  return { success: true, licenseId: created.id };
}
