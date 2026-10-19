'use server';

import { prisma } from '@/lib/prisma';

export interface AuditLogEntry {
  id: string;
  action: string;
  comment: string;
  createdAt: Date;
  author: {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string;
    role: string;
  };
}

export interface GetAuditLogsOptions {
  companyId: string;
  authorId: string;
  page?: number;
  limit?: number;
  action?: string;
  search?: string;
}

export interface GetAuditLogsResult {
  success: boolean;
  logs?: AuditLogEntry[];
  total?: number;
  page?: number;
  totalPages?: number;
  error?: string;
}

/**
 * Fetches company security action audit logs with RBAC check and pagination
 */
export async function getCompanyActionLogs({
  companyId,
  authorId,
  page = 1,
  limit = 20,
  action,
  search,
}: GetAuditLogsOptions): Promise<GetAuditLogsResult> {
  if (!companyId || !authorId) {
    return { success: false, error: 'Company ID and Author ID are required' };
  }

  const author = await prisma.user.findUnique({
    where: { id: authorId },
  });

  if (!author) {
    return { success: false, error: 'Author account not found' };
  }

  // Authorization check
  const isAllowed =
    author.role === 'ADMIN' ||
    (author.companyId === companyId &&
      (author.permissions.includes('VIEW_LOGS') ||
        author.permissions.includes('CLIENT_MANAGEMENT') ||
        author.permissions.includes('MANAGE_MEMBERS')));

  if (!isAllowed) {
    return {
      success: false,
      error: 'Permission denied: Requires VIEW_LOGS privilege to access the action log',
    };
  }

  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, Math.min(100, limit));
  const skip = (safePage - 1) * safeLimit;

  // Build where filter
  const where: any = {
    companyId,
  };

  if (action && action.trim() !== '') {
    where.action = action.trim();
  }

  if (search && search.trim() !== '') {
    const q = search.trim();
    where.OR = [
      { comment: { contains: q, mode: 'insensitive' } },
      { author: { email: { contains: q, mode: 'insensitive' } } },
      { author: { firstName: { contains: q, mode: 'insensitive' } } },
      { author: { lastName: { contains: q, mode: 'insensitive' } } },
    ];
  }

  const [total, logs] = await Promise.all([
    prisma.actionLog.count({ where }),
    prisma.actionLog.findMany({
      where,
      skip,
      take: safeLimit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    }),
  ]);

  return {
    success: true,
    logs: logs.map((log) => ({
      id: log.id,
      action: log.action,
      comment: log.comment,
      createdAt: log.createdAt,
      author: log.author,
    })),
    total,
    page: safePage,
    totalPages: Math.ceil(total / safeLimit) || 1,
  };
}
