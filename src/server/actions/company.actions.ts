'use server';

import { prisma } from '@/lib/prisma';
import { canSwitchCompany, ACTIVE_COMPANY_COOKIE } from '@/lib/company-context';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export interface RelatedCompanyDTO {
  id: string;
  name: string;
  code: string;
  country: string;
  region: string;
  telephone: string;
  email: string;
  isParent: boolean;
  isActive: boolean;
  managerName?: string | null;
  managerEmail?: string | null;
  managerPhone?: string | null;
}

/**
 * Retrieves all related companies in the user's organizational tree (parent + subsidiaries)
 */
export async function getRelatedCompanies(userId: string): Promise<RelatedCompanyDTO[]> {
  if (!userId) return [];

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      company: {
        include: {
          parentCompany: true,
          subsidiaries: true,
        },
      },
    },
  });

  if (!user || !user.company) {
    return [];
  }

  const primaryCompany = user.company;
  const parentId = primaryCompany.parentCompanyId || primaryCompany.id;

  // Fetch parent company and all subsidiaries under this parent
  const related = await prisma.company.findMany({
    where: {
      OR: [
        { id: parentId },
        { parentCompanyId: parentId },
      ],
    },
    orderBy: {
      name: 'asc',
    },
  });

  return (related as Array<{
    id: string;
    name: string;
    code: string;
    country: string;
    region: string;
    telephone: string;
    email: string;
    parentCompanyId: string | null;
    managerName: string | null;
    managerEmail: string | null;
    managerPhone: string | null;
  }>).map((comp) => ({
    id: comp.id,
    name: comp.name,
    code: comp.code,
    country: comp.country,
    region: comp.region,
    telephone: comp.telephone,
    email: comp.email,
    isParent: comp.id === parentId,
    isActive: true,
    managerName: comp.managerName,
    managerEmail: comp.managerEmail,
    managerPhone: comp.managerPhone,
  }));
}

/**
 * Returns current active company context and available switch targets
 */
export async function getActiveCompanyContext(
  userId: string,
  requestedCompanyId?: string
): Promise<{
  activeCompany: RelatedCompanyDTO | null;
  relatedCompanies: RelatedCompanyDTO[];
}> {
  if (!userId) {
    return { activeCompany: null, relatedCompanies: [] };
  }

  const related = await getRelatedCompanies(userId);
  if (related.length === 0) {
    return { activeCompany: null, relatedCompanies: [] };
  }

  let active = related[0];

  if (requestedCompanyId) {
    const match = related.find((c) => c.id === requestedCompanyId);
    if (match) {
      active = match;
    }
  }

  return {
    activeCompany: active,
    relatedCompanies: related,
  };
}

/**
 * Switches the active company context for the user and updates the session cookie
 */
export async function switchCompanyContext(
  userId: string,
  targetCompanyId: string
): Promise<{ success: boolean; activeCompany?: RelatedCompanyDTO; error?: string }> {
  if (!userId || !targetCompanyId) {
    return { success: false, error: 'User ID and Target Company ID are required' };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { company: true },
  });

  if (!user || !user.company) {
    return { success: false, error: 'User or primary company not found' };
  }

  const targetCompany = await prisma.company.findUnique({
    where: { id: targetCompanyId },
  });

  if (!targetCompany) {
    return { success: false, error: 'Target company not found' };
  }

  const isAllowed = canSwitchCompany(
    user.company.id,
    targetCompany.id,
    user.company.parentCompanyId,
    targetCompany.parentCompanyId
  );

  if (!isAllowed) {
    return { success: false, error: 'Unauthorized to switch to this entity' };
  }

  // Set the active company cookie in Next.js cookie store
  try {
    const cookieStore = await cookies();
    cookieStore.set(ACTIVE_COMPANY_COOKIE, targetCompany.id, {
      path: '/',
      maxAge: 86400 * 30, // 30 days
      sameSite: 'lax',
      httpOnly: false,
    });
  } catch {
    // Gracefully handle environments where cookieStore cannot be modified directly
  }

  // Record audit log
  await prisma.actionLog.create({
    data: {
      companyId: targetCompany.id,
      authorId: user.id,
      action: 'COMPANY_SWITCHED',
      comment: `Switched active company context to ${targetCompany.name} (${targetCompany.code})`,
    },
  });

  // Revalidate server components and layout caches
  try {
    revalidatePath('/', 'layout');
  } catch {
    // Ignore in non-request environments
  }

  return {
    success: true,
    activeCompany: {
      id: targetCompany.id,
      name: targetCompany.name,
      code: targetCompany.code,
      country: targetCompany.country,
      region: targetCompany.region,
      telephone: targetCompany.telephone,
      email: targetCompany.email,
      isParent: !targetCompany.parentCompanyId,
      isActive: true,
      managerName: targetCompany.managerName,
      managerEmail: targetCompany.managerEmail,
      managerPhone: targetCompany.managerPhone,
    },
  };
}

/**
 * Retrieves full company profile details including assigned manager and parent/subsidiaries
 */
export async function getCompanyProfile(companyId: string): Promise<RelatedCompanyDTO | null> {
  if (!companyId) return null;

  const comp = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!comp) return null;

  return {
    id: comp.id,
    name: comp.name,
    code: comp.code,
    country: comp.country,
    region: comp.region,
    telephone: comp.telephone,
    email: comp.email,
    isParent: !comp.parentCompanyId,
    isActive: true,
    managerName: comp.managerName,
    managerEmail: comp.managerEmail,
    managerPhone: comp.managerPhone,
  };
}
