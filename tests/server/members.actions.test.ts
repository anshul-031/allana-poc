import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getCompanyMembers,
  createMember,
  updateMember,
  deleteMember,
} from '@/server/actions/members.actions';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    actionLog: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth', () => ({
  hashPassword: vi.fn().mockResolvedValue('mock-hashed-pwd'),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Members Server Actions (src/server/actions/members.actions.ts)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCompanyMembers', () => {
    it('returns error if companyId or authorId is missing', async () => {
      const res1 = await getCompanyMembers('', 'author-1');
      expect(res1.success).toBe(false);

      const res2 = await getCompanyMembers('comp-1', '');
      expect(res2.success).toBe(false);
    });

    it('returns error if author is not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
      const res = await getCompanyMembers('comp-1', 'author-missing');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Author not found');
    });

    it('returns error if non-admin author belongs to another company', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: 'author-1',
        role: 'BUYER',
        companyId: 'comp-other',
      } as any);

      const res = await getCompanyMembers('comp-1', 'author-1');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Unauthorized to view members of another company');
    });

    it('allows ADMIN author to view members even from different company', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: 'admin-1',
        role: 'ADMIN',
        companyId: 'comp-hq',
      } as any);

      vi.mocked(prisma.user.findMany).mockResolvedValueOnce([
        {
          id: 'u-1',
          email: 'sub@lulu.com',
          firstName: 'Sub',
          permissions: [],
          isActive: true,
          twoFactorEnabled: false,
          createdAt: new Date(),
        },
      ] as any);

      const res = await getCompanyMembers('comp-sub', 'admin-1');
      expect(res.success).toBe(true);
      expect(res.members).toHaveLength(1);
    });

    it('returns members list for authorized author', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: 'author-1',
        role: 'BUYER',
        companyId: 'comp-1',
      } as any);

      vi.mocked(prisma.user.findMany).mockResolvedValueOnce([
        {
          id: 'u-1',
          email: 'user1@lulu.com',
          firstName: 'Farhan',
          lastName: 'Akhtar',
          patronymic: null,
          phone: '+971-50-0000',
          comment: 'Lead buyer',
          jobTitle: 'Buyer',
          role: 'BUYER',
          permissions: ['VIEW_CATALOG', 'VIEW_SHIPMENTS'],
          isActive: true,
          twoFactorEnabled: true,
          createdAt: new Date('2026-01-01'),
        },
      ] as any);

      const res = await getCompanyMembers('comp-1', 'author-1');
      expect(res.success).toBe(true);
      expect(res.members).toHaveLength(1);
      expect(res.members?.[0].firstName).toBe('Farhan');
    });
  });

  describe('createMember', () => {
    it('fails on schema validation error', async () => {
      const res = await createMember(
        {
          firstName: '',
          email: 'invalid-email',
          permissions: [],
          isActive: true,
          twoFactorEnabled: false,
        } as any,
        'author-1',
        'comp-1'
      );

      expect(res.success).toBe(false);
      expect(res.error).toBeDefined();
    });

    it('fails if author does not have management permissions', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: 'author-1',
        role: 'BUYER',
        companyId: 'comp-1',
        permissions: ['VIEW_CATALOG'],
      } as any);

      const res = await createMember(
        {
          firstName: 'John',
          email: 'john@lulu.com',
          permissions: ['VIEW_CATALOG'],
          isActive: true,
          twoFactorEnabled: false,
        },
        'author-1',
        'comp-1'
      );

      expect(res.success).toBe(false);
      expect(res.error).toContain('Permission denied');
    });

    it('fails if author is from different company and not ADMIN', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: 'author-diff',
        role: 'BUYER',
        companyId: 'comp-other',
        permissions: ['MANAGE_MEMBERS'],
      } as any);

      const res = await createMember(
        {
          firstName: 'John',
          email: 'john@lulu.com',
          permissions: [],
          isActive: true,
          twoFactorEnabled: false,
        },
        'author-diff',
        'comp-1'
      );

      expect(res.success).toBe(false);
      expect(res.error).toContain('Permission denied');
    });

    it('fails if author is missing in database', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);

      const res = await createMember(
        {
          firstName: 'John',
          email: 'john@lulu.com',
          permissions: [],
          isActive: true,
          twoFactorEnabled: false,
        },
        'author-ghost',
        'comp-1'
      );

      expect(res.success).toBe(false);
      expect(res.error).toContain('Permission denied');
    });

    it('fails if email is already taken', async () => {
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce({
          id: 'admin-1',
          role: 'ADMIN',
          companyId: 'comp-1',
          permissions: [],
        } as any)
        .mockResolvedValueOnce({
          id: 'existing-u',
          email: 'john@lulu.com',
        } as any);

      const res = await createMember(
        {
          firstName: 'John',
          email: 'john@lulu.com',
          permissions: ['VIEW_CATALOG'],
          isActive: true,
          twoFactorEnabled: false,
        },
        'admin-1',
        'comp-1'
      );

      expect(res.success).toBe(false);
      expect(res.error).toContain('already exists');
    });

    it('successfully creates member, logs action, and handles revalidatePath catch', async () => {
      vi.mocked(revalidatePath).mockImplementationOnce(() => {
        throw new Error('Revalidation failure');
      });

      // Author has CLIENT_MANAGEMENT
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce({
          id: 'manager-1',
          role: 'BUYER',
          companyId: 'comp-1',
          permissions: ['CLIENT_MANAGEMENT'],
        } as any)
        .mockResolvedValueOnce(null); // No existing email

      vi.mocked(prisma.user.create).mockResolvedValueOnce({
        id: 'new-u-1',
        email: 'john@lulu.com',
        firstName: 'John',
        lastName: null,
        patronymic: null,
        phone: null,
        comment: null,
        jobTitle: null,
        role: 'BUYER',
        permissions: [],
        isActive: true,
        twoFactorEnabled: true,
        createdAt: new Date(),
      } as any);

      const res = await createMember(
        {
          firstName: 'John',
          email: 'john@lulu.com',
          permissions: [],
          isActive: true,
          twoFactorEnabled: true,
        },
        'manager-1',
        'comp-1'
      );

      expect(res.success).toBe(true);
      expect(res.member?.id).toBe('new-u-1');
      expect(prisma.actionLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          companyId: 'comp-1',
          authorId: 'manager-1',
          action: 'USER_CREATED',
          comment: expect.stringContaining('NONE'),
        }),
      });
    });
  });

  describe('updateMember', () => {
    it('fails on schema validation error', async () => {
      const res = await updateMember(
        {
          id: '',
          firstName: '',
          permissions: [],
          isActive: true,
          twoFactorEnabled: false,
        } as any,
        'author-1',
        'comp-1'
      );

      expect(res.success).toBe(false);
    });

    it('fails if author lacks management permissions', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: 'author-1',
        role: 'BUYER',
        companyId: 'comp-1',
        permissions: [],
      } as any);

      const res = await updateMember(
        {
          id: 'u-1',
          firstName: 'John',
          permissions: [],
          isActive: true,
          twoFactorEnabled: false,
        },
        'author-1',
        'comp-1'
      );

      expect(res.success).toBe(false);
      expect(res.error).toContain('Permission denied');
    });

    it('fails if target member does not belong to company context', async () => {
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce({
          id: 'author-1',
          role: 'ADMIN',
          companyId: 'comp-1',
          permissions: [],
        } as any)
        .mockResolvedValueOnce({
          id: 'u-foreign',
          companyId: 'comp-different',
        } as any);

      const res = await updateMember(
        {
          id: 'u-foreign',
          firstName: 'John',
          permissions: [],
          isActive: true,
          twoFactorEnabled: false,
        },
        'author-1',
        'comp-1'
      );

      expect(res.success).toBe(false);
      expect(res.error).toContain('Member not found within this company context');
    });

    it('successfully updates member details with empty permissions, logs action, and handles catch', async () => {
      vi.mocked(revalidatePath).mockImplementationOnce(() => {
        throw new Error('Revalidation failure');
      });

      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce({
          id: 'author-1',
          role: 'ADMIN',
          companyId: 'comp-1',
          permissions: [],
        } as any)
        .mockResolvedValueOnce({
          id: 'u-1',
          companyId: 'comp-1',
        } as any);

      vi.mocked(prisma.user.update).mockResolvedValueOnce({
        id: 'u-1',
        email: 'john@lulu.com',
        firstName: 'Johnathan',
        lastName: null,
        patronymic: null,
        phone: null,
        comment: null,
        jobTitle: null,
        role: 'BUYER',
        permissions: [],
        isActive: false,
        twoFactorEnabled: false,
        createdAt: new Date(),
      } as any);

      const res = await updateMember(
        {
          id: 'u-1',
          firstName: 'Johnathan',
          permissions: [],
          isActive: false,
          twoFactorEnabled: false,
        },
        'author-1',
        'comp-1'
      );

      expect(res.success).toBe(true);
      expect(res.member?.firstName).toBe('Johnathan');
      expect(prisma.actionLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          comment: expect.stringContaining('NONE'),
        }),
      });
    });
  });

  describe('deleteMember', () => {
    it('fails if required parameters are missing', async () => {
      expect((await deleteMember('', 'author-1', 'comp-1')).success).toBe(false);
      expect((await deleteMember('u-1', '', 'comp-1')).success).toBe(false);
      expect((await deleteMember('u-1', 'author-1', '')).success).toBe(false);
    });

    it('prevents author from deleting self', async () => {
      const res = await deleteMember('author-1', 'author-1', 'comp-1');
      expect(res.success).toBe(false);
      expect(res.error).toBe('You cannot remove or deactivate your own account');
    });

    it('fails if author lacks management permissions', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: 'author-1',
        role: 'BUYER',
        companyId: 'comp-1',
        permissions: [],
      } as any);

      const res = await deleteMember('u-target', 'author-1', 'comp-1');
      expect(res.success).toBe(false);
      expect(res.error).toContain('Permission denied');
    });

    it('fails if target member is not found in company', async () => {
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce({
          id: 'author-1',
          role: 'ADMIN',
          companyId: 'comp-1',
          permissions: [],
        } as any)
        .mockResolvedValueOnce(null);

      const res = await deleteMember('u-target', 'author-1', 'comp-1');
      expect(res.success).toBe(false);
      expect(res.error).toContain('Member not found');
    });

    it('successfully deactivates member, logs action, and handles revalidatePath catch', async () => {
      vi.mocked(revalidatePath).mockImplementationOnce(() => {
        throw new Error('Revalidation failure');
      });

      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce({
          id: 'author-1',
          role: 'ADMIN',
          companyId: 'comp-1',
          permissions: [],
        } as any)
        .mockResolvedValueOnce({
          id: 'u-target',
          email: 'deactivate@lulu.com',
          firstName: 'Target',
          companyId: 'comp-1',
        } as any);

      const res = await deleteMember('u-target', 'author-1', 'comp-1');
      expect(res.success).toBe(true);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u-target' },
        data: { isActive: false },
      });
      expect(prisma.actionLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          companyId: 'comp-1',
          authorId: 'author-1',
          action: 'USER_DEACTIVATED',
        }),
      });
    });
  });
});
