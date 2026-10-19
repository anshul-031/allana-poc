import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCompanyActionLogs } from '@/server/actions/audit.actions';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    actionLog: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

describe('Audit Actions (src/server/actions/audit.actions.ts)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fails if companyId or authorId is missing', async () => {
    const res1 = await getCompanyActionLogs({ companyId: '', authorId: 'u-1' });
    expect(res1.success).toBe(false);

    const res2 = await getCompanyActionLogs({ companyId: 'comp-1', authorId: '' });
    expect(res2.success).toBe(false);
  });

  it('fails if author account is not found', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);

    const res = await getCompanyActionLogs({ companyId: 'comp-1', authorId: 'u-ghost' });
    expect(res.success).toBe(false);
    expect(res.error).toBe('Author account not found');
  });

  it('fails if author belongs to another company and is not admin', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: 'u-foreign',
      role: 'BUYER',
      companyId: 'comp-different',
      permissions: ['VIEW_LOGS'],
    } as any);

    const res = await getCompanyActionLogs({ companyId: 'comp-1', authorId: 'u-foreign' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('Permission denied');
  });

  it('fails if author has matching company but lacks VIEW_LOGS, CLIENT_MANAGEMENT, or MANAGE_MEMBERS', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: 'u-no-perm',
      role: 'BUYER',
      companyId: 'comp-1',
      permissions: ['VIEW_CATALOG'],
    } as any);

    const res = await getCompanyActionLogs({ companyId: 'comp-1', authorId: 'u-no-perm' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('Permission denied');
  });

  it('allows ADMIN author to retrieve logs', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: 'u-admin',
      role: 'ADMIN',
      companyId: 'comp-hq',
      permissions: [],
    } as any);

    vi.mocked(prisma.actionLog.count).mockResolvedValueOnce(1);
    vi.mocked(prisma.actionLog.findMany).mockResolvedValueOnce([
      {
        id: 'log-1',
        action: 'COMPANY_SWITCHED',
        comment: 'Switched context',
        createdAt: new Date('2026-02-01T12:00:00Z'),
        author: {
          id: 'u-admin',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@allana.com',
          role: 'ADMIN',
        },
      },
    ] as any);

    const res = await getCompanyActionLogs({ companyId: 'comp-1', authorId: 'u-admin' });
    expect(res.success).toBe(true);
    expect(res.total).toBe(1);
    expect(res.logs).toHaveLength(1);
    expect(res.totalPages).toBe(1);
  });

  it('fetches logs with action and search query filters for company member with VIEW_LOGS', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: 'u-logger',
      role: 'BUYER',
      companyId: 'comp-1',
      permissions: ['VIEW_LOGS'],
    } as any);

    vi.mocked(prisma.actionLog.count).mockResolvedValueOnce(25);
    vi.mocked(prisma.actionLog.findMany).mockResolvedValueOnce([
      {
        id: 'log-1',
        action: 'USER_CREATED',
        comment: 'Created user john@lulu.com',
        createdAt: new Date('2026-02-01T12:00:00Z'),
        author: {
          id: 'u-logger',
          firstName: 'Logger',
          lastName: null,
          email: 'logger@lulu.com',
          role: 'BUYER',
        },
      },
    ] as any);

    const res = await getCompanyActionLogs({
      companyId: 'comp-1',
      authorId: 'u-logger',
      action: 'USER_CREATED',
      search: 'john@lulu.com',
      page: 2,
      limit: 10,
    });

    expect(res.success).toBe(true);
    expect(res.page).toBe(2);
    expect(res.totalPages).toBe(3);
    expect(prisma.actionLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
        where: expect.objectContaining({
          companyId: 'comp-1',
          action: 'USER_CREATED',
          OR: expect.any(Array),
        }),
      })
    );
  });

  it('handles 0 total records gracefully with totalPages default 1', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: 'u-logger',
      role: 'BUYER',
      companyId: 'comp-1',
      permissions: ['CLIENT_MANAGEMENT'],
    } as any);

    vi.mocked(prisma.actionLog.count).mockResolvedValueOnce(0);
    vi.mocked(prisma.actionLog.findMany).mockResolvedValueOnce([]);

    const res = await getCompanyActionLogs({
      companyId: 'comp-1',
      authorId: 'u-logger',
    });

    expect(res.success).toBe(true);
    expect(res.total).toBe(0);
    expect(res.totalPages).toBe(1);
    expect(res.logs).toHaveLength(0);
  });
});
