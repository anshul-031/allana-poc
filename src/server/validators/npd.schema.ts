import { z } from 'zod';

export const FreezingTypeEnum = z.enum([
  'BLOCK_FROZEN',
  'IQF',
  'BLAST_FROZEN',
  'CHILLED',
]);

export const CustomProductStatusEnum = z.enum([
  'IN_REVIEW',
  'ANALYSIS',
  'ACCEPTED',
  'DECLINED',
]);

export const CreateCustomProductSchema = z.object({
  categoryName: z.string().min(1, 'Product category is required').trim(),
  targetCountry: z.string().min(1, 'Target country is required').trim(),
  cutSpecification: z.string().min(5, 'Cut specification must be at least 5 characters').trim(),
  recipeNotes: z.string().optional().nullable(),
  packagingFormat: z.string().min(1, 'Packaging format is required').trim(),
  individualPackagingWeight: z.string().min(1, 'Individual packaging weight is required').trim(),
  freezingType: FreezingTypeEnum.default('BLOCK_FROZEN'),
  estimatedFcaPricePerTon: z.number().positive('Estimated FCA price must be positive').optional().nullable(),
  targetVolumeMt: z.number().positive('Target volume must be positive').optional().nullable(),
  targetPriceUsd: z.number().positive('Target price must be positive').optional().nullable(),

  // Meat & poultry processing criteria
  isCalibrated: z.boolean().default(false),
  isMarinated: z.boolean().default(false),
  isBoneless: z.boolean().default(false),
  isSkinless: z.boolean().default(false),
  hasSpecification: z.boolean().default(false),

  additionalComments: z.string().optional().nullable(),
  attachmentUrl: z.string().optional().nullable(),
});

export type CreateCustomProductInput = z.infer<typeof CreateCustomProductSchema>;
