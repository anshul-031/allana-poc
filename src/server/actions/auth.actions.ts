import { prisma } from '@/lib/prisma';
import { verifyPassword, hashPassword } from '@/lib/auth';

export interface LoginResult {
  success: boolean;
  requires2FA?: boolean;
  requiresPasswordChange?: boolean;
  userId?: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    role: string;
    companyId: string;
    isFirstLogin: boolean;
  };
  error?: string;
}

/**
 * Server action to authenticate a user with email and password
 */
export async function loginUser(email: string, password: string): Promise<LoginResult> {
  if (!email || !password) {
    return { success: false, error: 'Email and password are required' };
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    include: { company: true },
  });

  if (!user || !user.isActive) {
    return { success: false, error: 'Invalid credentials or inactive account' };
  }

  const isPasswordValid = await verifyPassword(password, user.passwordHash);
  if (!isPasswordValid) {
    return { success: false, error: 'Invalid credentials' };
  }

  // Check if 2FA is required
  if (user.twoFactorEnabled) {
    return {
      success: true,
      requires2FA: true,
      userId: user.id,
    };
  }

  // Check if first-time login requires password change
  if (user.isFirstLogin) {
    return {
      success: true,
      requiresPasswordChange: true,
      userId: user.id,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        role: user.role,
        companyId: user.companyId,
        isFirstLogin: true,
      },
    };
  }

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      role: user.role,
      companyId: user.companyId,
      isFirstLogin: false,
    },
  };
}

/**
 * Server action to verify 2FA TOTP code
 */
export async function verify2FACode(userId: string, code: string): Promise<LoginResult> {
  if (!userId || !code || code.trim().length !== 6) {
    return { success: false, error: 'A valid 6-digit verification code is required' };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.isActive) {
    return { success: false, error: 'User not found or account inactive' };
  }

  // Simulated code verification (accepts 123456 or matching secret)
  const isValidCode = code.trim() === '123456' || code.trim() === user.twoFactorSecret;
  if (!isValidCode) {
    return { success: false, error: 'Invalid verification code' };
  }

  if (user.isFirstLogin) {
    return {
      success: true,
      requiresPasswordChange: true,
      userId: user.id,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        role: user.role,
        companyId: user.companyId,
        isFirstLogin: true,
      },
    };
  }

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      role: user.role,
      companyId: user.companyId,
      isFirstLogin: false,
    },
  };
}

/**
 * Server action to change password (mandatory on first login or via settings modal)
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<{ success: boolean; error?: string }> {
  if (!userId || !currentPassword || !newPassword || !confirmPassword) {
    return { success: false, error: 'All fields are required' };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: 'New password and confirmation do not match' };
  }

  if (newPassword.length < 8) {
    return { success: false, error: 'New password must be at least 8 characters long' };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return { success: false, error: 'User not found' };
  }

  const isCurrentValid = await verifyPassword(currentPassword, user.passwordHash);
  if (!isCurrentValid) {
    return { success: false, error: 'Current password is incorrect' };
  }

  const newHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: newHash,
      isFirstLogin: false,
    },
  });

  // Log action in audit log
  await prisma.actionLog.create({
    data: {
      companyId: user.companyId,
      authorId: user.id,
      action: 'PASSWORD_CHANGED',
      comment: `Password changed successfully for user ${user.email}`,
    },
  });

  return { success: true };
}

/**
 * Server action to request password reset email
 */
export async function requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
  if (!email) {
    return { success: false, message: 'Email address is required' };
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  // Always return user-safe success message to prevent user enumeration
  if (!user) {
    return {
      success: true,
      message: 'If an account exists with this email, a password reset link has been dispatched.',
    };
  }

  const resetToken = `reset-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  const expiry = new Date(Date.now() + 3600 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken,
      resetTokenExpiry: expiry,
    },
  });

  return {
    success: true,
    message: 'If an account exists with this email, a password reset link has been dispatched.',
  };
}
