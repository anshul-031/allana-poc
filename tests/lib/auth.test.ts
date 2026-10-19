import { describe, it, expect, vi } from 'vitest';
import { hashPassword, verifyPassword, hasPermission, isAdminOrHasPermission } from '@/lib/auth';
import { parseActiveCompanyId, canSwitchCompany, ACTIVE_COMPANY_COOKIE } from '@/lib/company-context';
import bcrypt from 'bcryptjs';

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

describe('Auth & Permission Helpers (src/lib/auth.ts)', () => {
  describe('hashPassword and verifyPassword', () => {
    it('hashes password with bcrypt', async () => {
      vi.mocked(bcrypt.hash).mockResolvedValueOnce('hashed-secret' as never);
      const hash = await hashPassword('my-password');
      expect(bcrypt.hash).toHaveBeenCalledWith('my-password', 10);
      expect(hash).toBe('hashed-secret');
    });

    it('verifies valid password against hash', async () => {
      vi.mocked(bcrypt.compare).mockResolvedValueOnce(true as never);
      const isValid = await verifyPassword('my-password', 'hashed-secret');
      expect(bcrypt.compare).toHaveBeenCalledWith('my-password', 'hashed-secret');
      expect(isValid).toBe(true);
    });
  });

  describe('hasPermission', () => {
    it('returns true when user has required permission', () => {
      expect(hasPermission(['VIEW_CATALOG', 'SUBMIT_CLAIMS'], 'VIEW_CATALOG')).toBe(true);
      expect(hasPermission(['VIEW_CATALOG', 'SUBMIT_CLAIMS'], 'DOWNLOAD_DOCUMENTS')).toBe(false);
    });

    it('returns false when permissions array is null or undefined', () => {
      expect(hasPermission(null, 'VIEW_CATALOG')).toBe(false);
      expect(hasPermission(undefined, 'VIEW_CATALOG')).toBe(false);
    });
  });

  describe('isAdminOrHasPermission', () => {
    it('always returns true for ADMIN role', () => {
      expect(isAdminOrHasPermission('ADMIN', [], 'MANAGE_MEMBERS')).toBe(true);
      expect(isAdminOrHasPermission('ADMIN', null, 'ANY_PERMISSION')).toBe(true);
    });

    it('checks permissions if role is not ADMIN', () => {
      expect(isAdminOrHasPermission('BUYER', ['VIEW_CATALOG'], 'VIEW_CATALOG')).toBe(true);
      expect(isAdminOrHasPermission('BUYER', ['VIEW_CATALOG'], 'MANAGE_MEMBERS')).toBe(false);
      expect(isAdminOrHasPermission(null, ['VIEW_CATALOG'], 'VIEW_CATALOG')).toBe(true);
    });
  });
});

describe('Company Context Helpers (src/lib/company-context.ts)', () => {
  describe('parseActiveCompanyId', () => {
    it('parses active company cookie from header', () => {
      const header = `foo=bar; ${ACTIVE_COMPANY_COOKIE}=comp-lulu-uae; session=xyz`;
      expect(parseActiveCompanyId(header)).toBe('comp-lulu-uae');
    });

    it('returns null if cookie is missing or header is empty', () => {
      expect(parseActiveCompanyId('foo=bar; session=xyz')).toBeNull();
      expect(parseActiveCompanyId(null)).toBeNull();
      expect(parseActiveCompanyId(undefined)).toBeNull();
    });
  });

  describe('canSwitchCompany', () => {
    it('allows switching to own company', () => {
      expect(canSwitchCompany('comp-1', 'comp-1', null, null)).toBe(true);
    });

    it('allows parent company user to switch to subsidiary', () => {
      expect(canSwitchCompany('comp-parent', 'comp-sub', null, 'comp-parent')).toBe(true);
    });

    it('allows peer subsidiaries of the same parent to switch between each other', () => {
      expect(canSwitchCompany('comp-sub-1', 'comp-sub-2', 'comp-parent', 'comp-parent')).toBe(true);
    });

    it('denies switching to unrelated companies', () => {
      expect(canSwitchCompany('comp-a', 'comp-b', 'comp-parent-1', 'comp-parent-2')).toBe(false);
      expect(canSwitchCompany('comp-sub', 'comp-unrelated', 'comp-parent', null)).toBe(false);
    });
  });
});
