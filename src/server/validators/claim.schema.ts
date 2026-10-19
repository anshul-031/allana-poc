import { z } from 'zod';

export const claimProductLineSchema = z.object({
  id: z.string().optional(),
  productArticle: z.string().min(1, 'Product article is required').max(50),
  productName: z.string().min(1, 'Product name is required'),
  producerName: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  productionDate: z.string().optional().nullable(),
  lotNumber: z.string().max(50).optional().nullable(),
  vehicleNumber: z.string().max(100, 'Vehicle number must be under 100 characters').optional().nullable(),
  nonConformWeightKg: z
    .number({ invalid_type_error: 'Non-conforming weight must be a number' })
    .positive('Weight must be greater than 0'),
  receivedQuantityKg: z
    .number({ invalid_type_error: 'Received quantity must be a number' })
    .positive('Received quantity must be greater than 0')
    .optional()
    .nullable(),
});

export const qualityClaimSchema = z.object({
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(200),
  categoryOfRequest: z.string().min(1, 'Category of request is required'),
  supplierName: z.string().min(1, 'Supplier is required'),
  invoiceNumber: z.string().max(100).optional().nullable(),
  containerNumber: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional().nullable(),
  additionalEmails: z.string().max(500).optional().nullable(),
  products: z
    .array(claimProductLineSchema)
    .min(1, 'At least one product line is required')
    .max(10, 'A maximum of 10 product lines per complaint is allowed'),
  attachmentKeys: z.array(z.string()).optional(),
});

export const infoRequestSchema = z.object({
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(200),
  infoCategory: z.enum([
    'QUESTIONNAIRE',
    'DOCS_SPECIFICATION',
    'DOCS_SURVEY_REPORT',
    'DOCS_CERTIFICATE',
    'DOCS_DECLARATION_QUALITY',
    'DOCS_DECLARATION_SHELF_LIFE',
    'DOCS_DECLARATION_LEGISLATION',
    'DOCS_DECLARATION_OTHER',
    'OTHER_QUALITY_SAFETY',
    'OTHER_AUDIT',
    'OTHER_CLARIFYING_INFO',
  ]),
  targetCountry: z.string().max(100).optional().nullable(),
  supplierName: z.string().max(100).optional().nullable(),
  productArticle: z.string().max(50).optional().nullable(),
  productName: z.string().max(200).optional().nullable(),
  requestedShelfLifeDate: z.string().optional().nullable(),
  productionDate: z.string().optional().nullable(),
  reasonForShelfLifeExtension: z.string().max(1000).optional().nullable(),
  shelfLifeExtensionVolumeKg: z.number().positive().optional().nullable(),
  orderNumber: z.string().max(100).optional().nullable(),
  containerNumber: z.string().max(100).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  additionalEmails: z.string().max(500).optional().nullable(),
  attachmentKeys: z.array(z.string()).optional(),
});

export type ClaimProductLineInput = z.infer<typeof claimProductLineSchema>;
export type QualityClaimInput = z.infer<typeof qualityClaimSchema>;
export type InfoRequestInput = z.infer<typeof infoRequestSchema>;
