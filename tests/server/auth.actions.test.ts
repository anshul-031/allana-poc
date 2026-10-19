import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loginUser, verify2FACode, changePassword, requestPasswordReset } from '@/server/actions/auth.actions';
import { prisma } from '@/lib/prisma';
import * as auth from '@/lib/auth';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    actionLog: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth', () => ({
  verifyPassword: vi.fn(),
  hashPassword: vi.fn(),
}));

describe('Auth Server Actions (src/server/actions/auth.actions.ts)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loginUser', () => {
    it('returns error if email or password missing', async () => {
      const res = await loginUser('', 'secret');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Email and password are required');
    });

    it('returns error if user not found or inactive', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
      const res = await loginUser('nonexistent@allana.com', 'secret');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Invalid credentials or inactive account');
    });

    it('returns error if password does not match hash', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: 'u-1',
        email: 'buyer@lulu.com',
        passwordHash: 'hash',
        isActive: true,
      } as never);
      vi.mocked(auth.verifyPassword).mockResolvedValueOnce(false);

      const res = await loginUser('buyer@lulu.com', 'wrongpassword');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Invalid credentials');
    });

    it('returns requires2FA if user has 2FA enabled', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: 'u-2fa',
        email: 'admin@lulu.com',
        passwordHash: 'hash',
        isActive: true,
        twoFactorEnabled: true,
      } as never);
      vi.mocked(auth.verifyPassword).mockResolvedValueOnce(true);

      const res = await loginUser('admin@lulu.com', 'validpass');
      expect(res.success).toBe(true);
      expect(res.requires2FA).toBe(true);
      expect(res.userId).toBe('u-2fa');
    });

    it('returns requiresPasswordChange if user is on first login', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: 'u-first',
        email: 'newuser@lulu.com',
        firstName: 'New',
        role: 'BUYER',
        companyId: 'comp-1',
        passwordHash: 'hash',
        isActive: true,
        twoFactorEnabled: false,
        isFirstLogin: true,
      } as never);
      vi.mocked(auth.verifyPassword).mockResolvedValueOnce(true);

      const res = await loginUser('newuser@lulu.com', 'temp-password');
      expect(res.success).toBe(true);
      expect(res.requiresPasswordChange).toBe(true);
      expect(res.user?.isFirstLogin).toBe(true);
    });

    it('returns user session on successful standard login', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: 'u-ok',
        email: 'buyer@lulu.com',
        firstName: 'Ahmed',
        role: 'BUYER',
        companyId: 'comp-1',
        passwordHash: 'hash',
        isActive: true,
        twoFactorEnabled: false,
        isFirstLogin: false,
      } as never);
      vi.mocked(auth.verifyPassword).mockResolvedValueOnce(true);

      const res = await loginUser('buyer@lulu.com', 'correctpass');
      expect(res.success).toBe(true);
      expect(res.user?.email).toBe('buyer@lulu.com');
      expect(res.user?.isFirstLogin).toBe(false);
    });
  });

  describe('verify2FACode', () => {
    it('rejects invalid code length or empty inputs', async () => {
      const res = await verify2FACode('u-1', '123');
      expect(res.success).toBe(false);
      expect(res.error).toBe('A valid 6-digit verification code is required');
    });

    it('returns error if user not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
      const res = await verify2FACode('u-ghost', '123456');
      expect(res.success).toBe(false);
      expect(res.error).toBe('User not found or account inactive');
    });

    it('rejects incorrect 2FA code', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: 'u-1',
        isActive: true,
        twoFactorSecret: '999999',
      } as never);

      const res = await verify2FACode('u-1', '000000');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Invalid verification code');
    });

    it('accepts valid 2FA code and grants session', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: 'u-1',
        email: 'verified@lulu.com',
        firstName: 'Tariq',
        role: 'FINANCE',
        companyId: 'comp-1',
        isActive: true,
        isFirstLogin: false,
        twoFactorSecret: '654321',
      } as never);

      const res = await verify2FACode('u-1', '654321');
      expect(res.success).toBe(true);
      expect(res.user?.email).toBe('verified@lulu.com');
    });

    it('flags password change if 2FA user is first login', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: 'u-1',
        email: 'verified@lulu.com',
        firstName: 'Tariq',
        role: 'FINANCE',
        companyId: 'comp-1',
        isActive: true,
        isFirstLogin: true,
        twoFactorSecret: '123456',
      } as never);

      const res = await verify2FACode('u-1', '123456');
      expect(res.success).toBe(true);
      expect(res.requiresPasswordChange).toBe(true);
    });
  });

  describe('changePassword', () => {
    it('validates missing fields and password matching', async () => {
      const res1 = await changePassword('', 'old', 'new', 'new');
      expect(res1.success).toBe(false);
      expect(res1.error).toBe('All fields are required');

      const res2 = await changePassword('u-1', 'old', 'newpass123', 'different');
      expect(res2.success).toBe(false);
      expect(res2.error).toBe('New password and confirmation do not match');

      const res3 = await changePassword('u-1', 'old', 'short', 'short');
      expect(res3.success).toBe(false);
      expect(res3.error).toBe('New password must be at least 8 characters long');
    });

    it('returns error if user not found or current password invalid', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
      const res1 = await changePassword('u-ghost', 'old', 'newpass123', 'newpass123');
      expect(res1.success).toBe(false);
      expect(res1.error).toBe('User not found');

      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: 'u-1',
        passwordHash: 'old-hash',
      } as never);
      vi.mocked(auth.verifyPassword).mockResolvedValueOnce(false);

      const res2 = await changePassword('u-1', 'wrong-old', 'newpass123', 'newpass123');
      expect(res2.success).toBe(false);
      expect(res2.error).toBe('Current password is incorrect');
    });

    it('successfully changes password and creates action log entry', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: 'u-1',
        email: 'user@lulu.com',
        companyId: 'comp-1',
        passwordHash: 'old-hash',
      } as never);
      vi.mocked(auth.verifyPassword).mockResolvedValueOnce(true);
      vi.mocked(auth.hashPassword).mockResolvedValueOnce('new-hash');

      const res = await changePassword('u-1', 'correct-old', 'brandNewPass@123', 'brandNewPass@123');
      expect(res.success).toBe(true);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u-1' },
        data: {
          passwordHash: 'new-hash',
          isFirstLogin: false,
        },
      });
      expect(prisma.actionLog.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('requestPasswordReset', () => {
    it('returns error if email missing', async () => {
      const res = await requestPasswordReset('');
      expect(res.success).toBe(false);
      expect(res.message).toBe('Email address is required');
    });

    it('returns generic safe success message even if email not registered', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
      const res = await requestPasswordReset('unknown@random.com');
      expect(res.success).toBe(true);
      expect(res.message).toContain('If an account exists');
    });

    it('sets resetToken and expiry for registered user', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: 'u-reset',
        email: 'target@lulu.com',
      } as never);

      const res = await requestPasswordReset('target@lulu.com');
      expect(res.success).toBe(true);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u-reset' },
        data: expect.objectContaining({
          resetToken: expect.stringContaining('reset-'),
          resetTokenExpiry: expect.any(Date),
        }),
      });
    });
  });
});
