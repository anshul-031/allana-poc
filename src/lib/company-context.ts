export const ACTIVE_COMPANY_COOKIE = 'allana_active_company_id';

/**
 * Extracts the active company ID from cookies or headers
 */
export function parseActiveCompanyId(cookieHeader: string | null | undefined): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${ACTIVE_COMPANY_COOKIE}=`));

  if (!match) return null;
  const value = match.split('=')[1];
  return value ? decodeURIComponent(value) : null;
}

/**
 * Validates whether a user can switch context to the target company ID
 */
export function canSwitchCompany(
  userCompanyId: string,
  targetCompanyId: string,
  userParentCompanyId: string | null | undefined,
  targetParentCompanyId: string | null | undefined
): boolean {
  // If target is user's direct company, always allowed
  if (userCompanyId === targetCompanyId) return true;

  // If user belongs to parent company, they can switch to any of their subsidiaries
  if (targetParentCompanyId === userCompanyId) return true;

  // If both share the same parent company, they can switch between peer subsidiaries
  if (
    userParentCompanyId &&
    targetParentCompanyId &&
    userParentCompanyId === targetParentCompanyId
  ) {
    return true;
  }

  return false;
}
