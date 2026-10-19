import { describe, it, expect } from 'vitest';
import {
  isRegulatedJurisdictionCountry,
  calculateLicenseStatus,
  REGULATED_COUNTRIES,
} from '@/lib/licenses-util';

describe('src/lib/licenses-util.ts - Compliance & Jurisdiction Helpers', () => {
  describe('isRegulatedJurisdictionCountry', () => {
    it('correctly identifies regulated countries and case insensitivity', () => {
      expect(isRegulatedJurisdictionCountry('Saudi Arabia')).toBe(true);
      expect(isRegulatedJurisdictionCountry('KSA')).toBe(true);
      expect(isRegulatedJurisdictionCountry('United Arab Emirates')).toBe(true);
      expect(isRegulatedJurisdictionCountry('UAE')).toBe(true);
      expect(isRegulatedJurisdictionCountry('Qatar')).toBe(true);
      expect(isRegulatedJurisdictionCountry('Kuwait')).toBe(true);
      expect(isRegulatedJurisdictionCountry('Egypt')).toBe(true);
      expect(isRegulatedJurisdictionCountry('Oman')).toBe(true);
      expect(isRegulatedJurisdictionCountry('Bahrain')).toBe(true);
    });

    it('returns false for unregulated countries or empty/undefined input', () => {
      expect(isRegulatedJurisdictionCountry('Germany')).toBe(false);
      expect(isRegulatedJurisdictionCountry('India')).toBe(false);
      expect(isRegulatedJurisdictionCountry(undefined)).toBe(false);
      expect(isRegulatedJurisdictionCountry('')).toBe(false);
    });
  });

  describe('calculateLicenseStatus', () => {
    it('returns ACTIVE for licenses expiring in > 60 days', () => {
      const futureDate = new Date(Date.now() + 100 * 24 * 60 * 60 * 1000);
      const res = calculateLicenseStatus(futureDate);
      expect(res.status).toBe('ACTIVE');
      expect(res.daysRemaining).toBeGreaterThan(60);
    });

    it('returns EXPIRING_SOON for licenses expiring within 60 days', () => {
      const soonDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const res = calculateLicenseStatus(soonDate);
      expect(res.status).toBe('EXPIRING_SOON');
      expect(res.daysRemaining).toBeLessThanOrEqual(60);
      expect(res.daysRemaining).toBeGreaterThan(0);
    });

    it('returns EXPIRED for licenses with past expiry dates', () => {
      const pastDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
      const res = calculateLicenseStatus(pastDate);
      expect(res.status).toBe('EXPIRED');
      expect(res.daysRemaining).toBeLessThanOrEqual(0);
    });
  });
});
