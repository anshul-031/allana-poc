import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as licensesActions from '@/server/actions/licenses.actions';
import {
  isRegulatedJurisdictionCountry,
  calculateLicenseStatus,
} from '@/lib/licenses-util';
import { prisma } from '@/lib/prisma';
import { createPresignedDownloadUrl } from '@/lib/r2';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    company: {
      findUnique: vi.fn(),
    },
    complianceLicense: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    actionLog: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@/lib/r2', () => ({
  createPresignedDownloadUrl: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('licenses.actions Server Actions (FEAT-1.7)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Utility Functions', () => {
    it('isRegulatedJurisdictionCountry correctly identifies regulated and non-regulated countries', () => {
      expect(isRegulatedJurisdictionCountry('Saudi Arabia')).toBe(true);
      expect(isRegulatedJurisdictionCountry('KSA')).toBe(true);
      expect(isRegulatedJurisdictionCountry('United Arab Emirates')).toBe(true);
      expect(isRegulatedJurisdictionCountry('UAE')).toBe(true);
      expect(isRegulatedJurisdictionCountry('Qatar')).toBe(true);
      expect(isRegulatedJurisdictionCountry('Kuwait')).toBe(true);
      expect(isRegulatedJurisdictionCountry('Egypt')).toBe(true);
      expect(isRegulatedJurisdictionCountry('Germany')).toBe(false);
      expect(isRegulatedJurisdictionCountry(undefined)).toBe(false);
    });

    it('calculateLicenseStatus correctly classifies ACTIVE, EXPIRING_SOON, and EXPIRED', () => {
      // 100 days in the future
      const futureDate = new Date(Date.now() + 100 * 24 * 60 * 60 * 1000);
      const activeRes = calculateLicenseStatus(futureDate);
      expect(activeRes.status).toBe('ACTIVE');
      expect(activeRes.daysRemaining).toBeGreaterThan(60);

      // 30 days in the future
      const soonDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const soonRes = calculateLicenseStatus(soonDate);
      expect(soonRes.status).toBe('EXPIRING_SOON');
      expect(soonRes.daysRemaining).toBeLessThanOrEqual(60);
      expect(soonRes.daysRemaining).toBeGreaterThan(0);

      // 5 days in the past
      const pastDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
      const expiredRes = calculateLicenseStatus(pastDate);
      expect(expiredRes.status).toBe('EXPIRED');
      expect(expiredRes.daysRemaining).toBeLessThanOrEqual(0);
    });


    it('getActiveCompanyIdFromCookies returns cookie value or null on exception', async () => {
      vi.mocked(cookies).mockResolvedValue({
        get: vi.fn().mockReturnValue({ value: 'comp-cookie-id' }),
      } as any);
      const id = await licensesActions.getActiveCompanyIdFromCookies();
      expect(id).toBe('comp-cookie-id');

      vi.mocked(cookies).mockRejectedValue(new Error('Cookie store error'));
      const errorId = await licensesActions.getActiveCompanyIdFromCookies();
      expect(errorId).toBeNull();
    });
  });

  describe('getCompanyLicenses', () => {
    it('returns error if no active company context is selected or found in cookies', async () => {
      vi.mocked(cookies).mockResolvedValue({
        get: vi.fn().mockReturnValue(undefined),
      } as any);

      const res = await licensesActions.getCompanyLicenses();
      expect(res.success).toBe(false);
      expect(res.error).toContain('No active company context');
    });

    it('returns error if active company is not found in database', async () => {
      vi.mocked(prisma.company.findUnique).mockResolvedValue(null);

      const res = await licensesActions.getCompanyLicenses({ companyId: 'comp-missing' });
      expect(res.success).toBe(false);
      expect(res.error).toContain('Active company record not found');
    });

    it('returns licenses for company with calculated statuses', async () => {
      vi.mocked(prisma.company.findUnique).mockResolvedValue({
        id: 'comp-ksa',
        name: 'LuLu Riyadh',
        country: 'Saudi Arabia',
      } as any);

      const mockLicenses = [
        {
          id: 'lic-1',
          companyId: 'comp-ksa',
          country: 'Saudi Arabia',
          licenseName: 'SFDA Meat Import Facility License',
          licenseNumber: 'SFDA-2026-900',
          issueDate: new Date('2024-01-01'),
          expiryDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // expiring soon
          documentUrl: 'licenses/lic1.pdf',
        },
      ];
      vi.mocked(prisma.complianceLicense.findMany).mockResolvedValue(mockLicenses as any);

      const res = await licensesActions.getCompanyLicenses({ companyId: 'comp-ksa' });
      expect(res.success).toBe(true);
      expect(res.isRegulatedJurisdiction).toBe(true);
      expect(res.companyName).toBe('LuLu Riyadh');
      expect(res.licenses).toHaveLength(1);
      expect(res.licenses[0].status).toBe('EXPIRING_SOON');
      expect(res.licenses[0].licenseNumber).toBe('SFDA-2026-900');
    });
  });

  describe('getLicenseDownloadUrl', () => {
    it('returns error if licenseId is empty or not provided', async () => {
      const res = await licensesActions.getLicenseDownloadUrl('');
      expect(res.success).toBe(false);
      expect(res.error).toContain('License ID is required');
    });

    it('returns error if license record is not found', async () => {
      vi.mocked(prisma.complianceLicense.findFirst).mockResolvedValue(null);

      const res = await licensesActions.getLicenseDownloadUrl('lic-unknown', {
        companyId: 'comp-1',
      });
      expect(res.success).toBe(false);
      expect(res.error).toContain('Compliance license not found');
    });

    it('returns error if license has no document attached', async () => {
      vi.mocked(prisma.complianceLicense.findFirst).mockResolvedValue({
        id: 'lic-1',
        companyId: 'comp-1',
        documentUrl: null,
      } as any);

      const res = await licensesActions.getLicenseDownloadUrl('lic-1', { companyId: 'comp-1' });
      expect(res.success).toBe(false);
      expect(res.error).toContain('No document attached');
    });

    it('successfully generates presigned URL for document', async () => {
      vi.mocked(prisma.complianceLicense.findFirst).mockResolvedValue({
        id: 'lic-1',
        companyId: 'comp-1',
        documentUrl: 'licenses/cert.pdf',
      } as any);
      vi.mocked(createPresignedDownloadUrl).mockResolvedValue(
        'https://r2.test/licenses/cert.pdf?sig=123'
      );

      const res = await licensesActions.getLicenseDownloadUrl('lic-1', { companyId: 'comp-1' });
      expect(res.success).toBe(true);
      expect(res.downloadUrl).toBe('https://r2.test/licenses/cert.pdf?sig=123');
    });

    it('handles unexpected exceptions when generating presigned URL', async () => {
      vi.mocked(prisma.complianceLicense.findFirst).mockResolvedValue({
        id: 'lic-1',
        companyId: 'comp-1',
        documentUrl: 'licenses/cert.pdf',
      } as any);
      vi.mocked(createPresignedDownloadUrl).mockRejectedValue(new Error('R2 S3 client timeout'));

      const res = await licensesActions.getLicenseDownloadUrl('lic-1', { companyId: 'comp-1' });
      expect(res.success).toBe(false);
      expect(res.error).toContain('R2 S3 client timeout');
    });

    it('handles unexpected non-Error exceptions when generating presigned URL', async () => {
      vi.mocked(prisma.complianceLicense.findFirst).mockResolvedValue({
        id: 'lic-1',
        companyId: 'comp-1',
        documentUrl: 'licenses/cert.pdf',
      } as any);
      vi.mocked(createPresignedDownloadUrl).mockRejectedValue('string failure');

      const res = await licensesActions.getLicenseDownloadUrl('lic-1', { companyId: 'comp-1' });
      expect(res.success).toBe(false);
      expect(res.error).toBe('Failed to generate download URL');
    });
  });

  describe('uploadRenewedLicense', () => {
    it('returns error if authorId is provided but author is not found in database', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const res = await licensesActions.uploadRenewedLicense({
        licenseName: 'Name',
        licenseNumber: '123',
        country: 'Saudi Arabia',
        issueDate: '2025-01-01',
        expiryDate: '2026-01-01',
        authorId: 'missing-author',
      });
      expect(res.success).toBe(false);
      expect(res.error).toContain('Author record not found');
    });

    it('returns forbidden error if author lacks ADMIN role or MANAGE_MEMBERS/CLIENT_MANAGEMENT permissions', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'u-buyer',
        email: 'buyer@test.com',
        role: 'BUYER',
        permissions: ['VIEW_CATALOG'],
      } as any);

      const res = await licensesActions.uploadRenewedLicense({
        licenseName: 'Name',
        licenseNumber: '123',
        country: 'Saudi Arabia',
        issueDate: '2025-01-01',
        expiryDate: '2026-01-01',
        authorId: 'u-buyer',
      });
      expect(res.success).toBe(false);
      expect(res.error).toContain('Forbidden: Insufficient permissions');
    });

    it('returns validation error if required fields are missing or empty', async () => {
      const res = await licensesActions.uploadRenewedLicense({
        licenseName: '  ',
        licenseNumber: '',
        country: '',
        issueDate: '2025-01-01',
        expiryDate: '2026-01-01',
      });
      expect(res.success).toBe(false);
      expect(res.error).toContain(
        'Validation failed: License name, number, and jurisdiction country are required'
      );
    });

    it('returns validation error if dates are invalid', async () => {
      const res = await licensesActions.uploadRenewedLicense({
        licenseName: 'SFDA License',
        licenseNumber: 'SFDA-123',
        country: 'Saudi Arabia',
        issueDate: 'invalid-date',
        expiryDate: '2026-01-01',
      });
      expect(res.success).toBe(false);
      expect(res.error).toContain('Invalid issue or expiry date format');
    });

    it('returns validation error if expiry date is not after issue date', async () => {
      const res = await licensesActions.uploadRenewedLicense({
        licenseName: 'SFDA License',
        licenseNumber: 'SFDA-123',
        country: 'Saudi Arabia',
        issueDate: '2026-01-01',
        expiryDate: '2025-01-01',
      });
      expect(res.success).toBe(false);
      expect(res.error).toContain('Expiry date must be after issue date');
    });

    it('returns error if no active company context exists', async () => {
      vi.mocked(cookies).mockResolvedValue({
        get: vi.fn().mockReturnValue(undefined),
      } as any);

      const res = await licensesActions.uploadRenewedLicense({
        licenseName: 'SFDA License',
        licenseNumber: 'SFDA-123',
        country: 'Saudi Arabia',
        issueDate: '2025-01-01',
        expiryDate: '2026-01-01',
      });
      expect(res.success).toBe(false);
      expect(res.error).toContain('No active company context');
    });

    it('returns error if active company is not found in database', async () => {
      vi.mocked(prisma.company.findUnique).mockResolvedValue(null);

      const res = await licensesActions.uploadRenewedLicense({
        licenseName: 'SFDA License',
        licenseNumber: 'SFDA-123',
        country: 'Saudi Arabia',
        issueDate: '2025-01-01',
        expiryDate: '2026-01-01',
        companyId: 'comp-missing',
      });
      expect(res.success).toBe(false);
      expect(res.error).toContain('Active company not found');
    });

    it('successfully creates compliance license, writes audit log, and revalidates path with MANAGE_MEMBERS permission', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'u-manager',
        email: 'manager@test.com',
        role: 'FINANCE',
        permissions: ['MANAGE_MEMBERS'],
      } as any);

      vi.mocked(prisma.company.findUnique).mockResolvedValue({
        id: 'comp-1',
        name: 'LuLu Hypermarket',
      } as any);

      vi.mocked(prisma.complianceLicense.create).mockResolvedValue({
        id: 'lic-new-99',
        companyId: 'comp-1',
        country: 'Saudi Arabia',
        licenseName: 'SFDA License Renewal',
        licenseNumber: 'SFDA-9900',
        issueDate: new Date('2025-01-01'),
        expiryDate: new Date('2026-01-01'),
        documentUrl: 'licenses/new-sfda.pdf',
      } as any);

      const res = await licensesActions.uploadRenewedLicense({
        licenseName: 'SFDA License Renewal',
        licenseNumber: 'SFDA-9900',
        country: 'Saudi Arabia',
        issueDate: '2025-01-01',
        expiryDate: '2026-01-01',
        documentUrl: 'licenses/new-sfda.pdf',
        authorId: 'u-manager',
        companyId: 'comp-1',
      });

      expect(res.success).toBe(true);
      expect(res.licenseId).toBe('lic-new-99');
      expect(prisma.actionLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            companyId: 'comp-1',
            action: 'COMPLIANCE_LICENSE_UPLOADED',
          }),
        })
      );
      expect(revalidatePath).toHaveBeenCalledWith('/settings/licenses');
    });

    it('successfully creates compliance license with CLIENT_MANAGEMENT permission without documentUrl', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'u-client-mgr',
        email: 'clientmgr@test.com',
        role: 'BUYER',
        permissions: ['CLIENT_MANAGEMENT'],
      } as any);

      vi.mocked(prisma.company.findUnique).mockResolvedValue({
        id: 'comp-1',
        name: 'LuLu Dubai',
      } as any);

      vi.mocked(prisma.complianceLicense.create).mockResolvedValue({
        id: 'lic-new-100',
        companyId: 'comp-1',
        country: 'UAE',
        licenseName: 'Municipality Permit',
        licenseNumber: 'DM-100',
        issueDate: new Date('2025-01-01'),
        expiryDate: new Date('2026-01-01'),
        documentUrl: null,
      } as any);

      const res = await licensesActions.uploadRenewedLicense({
        licenseName: 'Municipality Permit',
        licenseNumber: 'DM-100',
        country: 'UAE',
        issueDate: '2025-01-01',
        expiryDate: '2026-01-01',
        authorId: 'u-client-mgr',
        companyId: 'comp-1',
      });

      expect(res.success).toBe(true);
      expect(res.licenseId).toBe('lic-new-100');
    });
  });
});
