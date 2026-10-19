export type LicenseStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED';

export const REGULATED_COUNTRIES = [
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
