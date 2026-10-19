import { z } from 'zod';

export const PermissionEnum = z.enum([
  'VIEW_CATALOG',
  'ORDER_CUSTOM_PRODUCT',
  'VIEW_SHIPMENTS',
  'VIEW_FINANCIALS',
  'SUBMIT_CLAIMS',
  'MANAGE_MEMBERS',
  'VIEW_REPORTS',
  'DOWNLOAD_DOCUMENTS',
  'CLIENT_MANAGEMENT',
  'VIEW_CLIENTS',
  'VIEW_LOGS',
]);

export const CreateMemberSchema = z.object({
  firstName: z.string().min(1, 'First name is required').trim(),
  lastName: z.string().optional(),
  patronymic: z.string().optional(),
  email: z.string().email('Valid corporate email is required').toLowerCase().trim(),
  phone: z.string().optional(),
  comment: z.string().optional(),
  jobTitle: z.string().optional(),
  isActive: z.boolean().default(true),
  twoFactorEnabled: z.boolean().default(false),
  permissions: z.array(PermissionEnum).default([]),
});

export const UpdateMemberSchema = z.object({
  id: z.string().min(1, 'Member ID is required'),
  firstName: z.string().min(1, 'First name is required').trim(),
  lastName: z.string().optional(),
  patronymic: z.string().optional(),
  phone: z.string().optional(),
  comment: z.string().optional(),
  jobTitle: z.string().optional(),
  isActive: z.boolean().default(true),
  twoFactorEnabled: z.boolean().default(false),
  permissions: z.array(PermissionEnum).default([]),
});

export type CreateMemberInput = z.infer<typeof CreateMemberSchema>;
export type UpdateMemberInput = z.infer<typeof UpdateMemberSchema>;
