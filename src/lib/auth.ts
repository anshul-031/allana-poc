import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hash plaintext password using bcryptjs
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify plaintext password against bcrypt hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Check if user permissions list contains required permission
 */
export function hasPermission(userPermissions: string[] | undefined | null, required: string): boolean {
  if (!userPermissions || !Array.isArray(userPermissions)) return false;
  return userPermissions.includes(required);
}

/**
 * Check if user is ADMIN or has specific permission
 */
export function isAdminOrHasPermission(
  role: string | undefined | null,
  userPermissions: string[] | undefined | null,
  required: string
): boolean {
  if (role === 'ADMIN') return true;
  return hasPermission(userPermissions, required);
}
