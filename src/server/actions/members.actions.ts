'use server';

import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import {
  CreateMemberSchema,
  UpdateMemberSchema,
  CreateMemberInput,
  UpdateMemberInput,
} from '@/server/validators/member.schema';
import { revalidatePath } from 'next/cache';

export interface SanitizedMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  patronymic: string | null;
  phone: string | null;
  comment: string | null;
  jobTitle: string | null;
  role: string;
  permissions: string[];
  isActive: boolean;
  twoFactorEnabled: boolean;
  createdAt: Date;
}

/**
 * Checks whether the author has administrative permission to manage team members
 */
async function checkManagePermission(authorId: string, companyId: string): Promise<boolean> {
  if (!authorId || !companyId) return false;

  const author = await prisma.user.findUnique({
    where: { id: authorId },
  });

  if (!author) return false;
  if (author.role === 'ADMIN') return true;
  if (author.companyId !== companyId) return false;

  return (
    author.permissions.includes('MANAGE_MEMBERS') ||
    author.permissions.includes('CLIENT_MANAGEMENT')
  );
}

/**
 * Fetches all team members for a given company context
 */
export async function getCompanyMembers(
  companyId: string,
  authorId: string
): Promise<{ success: boolean; members?: SanitizedMember[]; error?: string }> {
  if (!companyId || !authorId) {
    return { success: false, error: 'Company ID and Author ID are required' };
  }

  const author = await prisma.user.findUnique({
    where: { id: authorId },
  });

  if (!author) {
    return { success: false, error: 'Author not found' };
  }

  if (author.role !== 'ADMIN' && author.companyId !== companyId) {
    return { success: false, error: 'Unauthorized to view members of another company' };
  }

  const members = await prisma.user.findMany({
    where: { companyId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      patronymic: true,
      phone: true,
      comment: true,
      jobTitle: true,
      role: true,
      permissions: true,
      isActive: true,
      twoFactorEnabled: true,
      createdAt: true,
    },
  });

  return {
    success: true,
    members: members.map((m) => ({
      ...m,
      permissions: m.permissions as string[],
    })),
  };
}

/**
 * Creates a new team member with granular RBAC permissions
 */
export async function createMember(
  data: CreateMemberInput,
  authorId: string,
  companyId: string
): Promise<{ success: boolean; member?: SanitizedMember; error?: string }> {
  const parsed = CreateMemberSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid user data provided',
    };
  }

  const isAllowed = await checkManagePermission(authorId, companyId);
  if (!isAllowed) {
    return {
      success: false,
      error: 'Permission denied: Requires MANAGE_MEMBERS or CLIENT_MANAGEMENT privileges',
    };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (existing) {
    return { success: false, error: 'A user with this email address already exists' };
  }

  const defaultPassword = 'Welcome@Allana2026';
  const passwordHash = await hashPassword(defaultPassword);

  const newMember = await prisma.user.create({
    data: {
      email: parsed.data.email,
      passwordHash,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName || null,
      patronymic: parsed.data.patronymic || null,
      phone: parsed.data.phone || null,
      comment: parsed.data.comment || null,
      jobTitle: parsed.data.jobTitle || null,
      isActive: parsed.data.isActive,
      twoFactorEnabled: parsed.data.twoFactorEnabled,
      permissions: parsed.data.permissions as any,
      companyId,
      isFirstLogin: true,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      patronymic: true,
      phone: true,
      comment: true,
      jobTitle: true,
      role: true,
      permissions: true,
      isActive: true,
      twoFactorEnabled: true,
      createdAt: true,
    },
  });

  // Audit log
  await prisma.actionLog.create({
    data: {
      companyId,
      authorId,
      action: 'USER_CREATED',
      comment: `Added member ${newMember.email} (${newMember.firstName}) with permissions: ${newMember.permissions.join(', ') || 'NONE'}`,
    },
  });

  try {
    revalidatePath('/settings/members');
  } catch {
    // Ignore in tests
  }

  return {
    success: true,
    member: {
      ...newMember,
      permissions: newMember.permissions as string[],
    },
  };
}

/**
 * Updates an existing member's profile and granular permissions
 */
export async function updateMember(
  data: UpdateMemberInput,
  authorId: string,
  companyId: string
): Promise<{ success: boolean; member?: SanitizedMember; error?: string }> {
  const parsed = UpdateMemberSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid user data provided',
    };
  }

  const isAllowed = await checkManagePermission(authorId, companyId);
  if (!isAllowed) {
    return {
      success: false,
      error: 'Permission denied: Requires MANAGE_MEMBERS or CLIENT_MANAGEMENT privileges',
    };
  }

  const target = await prisma.user.findUnique({
    where: { id: parsed.data.id },
  });

  if (!target || target.companyId !== companyId) {
    return { success: false, error: 'Member not found within this company context' };
  }

  const updated = await prisma.user.update({
    where: { id: parsed.data.id },
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName || null,
      patronymic: parsed.data.patronymic || null,
      phone: parsed.data.phone || null,
      comment: parsed.data.comment || null,
      jobTitle: parsed.data.jobTitle || null,
      isActive: parsed.data.isActive,
      twoFactorEnabled: parsed.data.twoFactorEnabled,
      permissions: parsed.data.permissions as any,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      patronymic: true,
      phone: true,
      comment: true,
      jobTitle: true,
      role: true,
      permissions: true,
      isActive: true,
      twoFactorEnabled: true,
      createdAt: true,
    },
  });

  // Audit log
  await prisma.actionLog.create({
    data: {
      companyId,
      authorId,
      action: 'PERMISSIONS_UPDATED',
      comment: `Updated member ${updated.email} details and permissions: ${updated.permissions.join(', ') || 'NONE'}`,
    },
  });

  try {
    revalidatePath('/settings/members');
  } catch {
    // Ignore in tests
  }

  return {
    success: true,
    member: {
      ...updated,
      permissions: updated.permissions as string[],
    },
  };
}

/**
 * Deactivates or removes a team member
 */
export async function deleteMember(
  memberId: string,
  authorId: string,
  companyId: string
): Promise<{ success: boolean; error?: string }> {
  if (!memberId || !authorId || !companyId) {
    return { success: false, error: 'Member ID, Author ID, and Company ID are required' };
  }

  if (memberId === authorId) {
    return { success: false, error: 'You cannot remove or deactivate your own account' };
  }

  const isAllowed = await checkManagePermission(authorId, companyId);
  if (!isAllowed) {
    return {
      success: false,
      error: 'Permission denied: Requires MANAGE_MEMBERS or CLIENT_MANAGEMENT privileges',
    };
  }

  const target = await prisma.user.findUnique({
    where: { id: memberId },
  });

  if (!target || target.companyId !== companyId) {
    return { success: false, error: 'Member not found within this company context' };
  }

  await prisma.user.update({
    where: { id: memberId },
    data: { isActive: false },
  });

  // Audit log
  await prisma.actionLog.create({
    data: {
      companyId,
      authorId,
      action: 'USER_DEACTIVATED',
      comment: `Deactivated member account for ${target.email} (${target.firstName})`,
    },
  });

  try {
    revalidatePath('/settings/members');
  } catch {
    // Ignore in tests
  }

  return { success: true };
}
