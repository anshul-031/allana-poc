export type ClaimStatus =
  | 'REGISTERED'
  | 'UNDER_REVIEW'
  | 'INVESTIGATION'
  | 'CLARIFICATION_REQUIRED'
  | 'PARTLY_ACCEPTED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'COMPLETED';

export type ClaimType = 'CLAIM' | 'INFO_REQUEST';

export type InfoRequestCategory =
  | 'QUESTIONNAIRE'
  | 'DOCS_SPECIFICATION'
  | 'DOCS_SURVEY_REPORT'
  | 'DOCS_CERTIFICATE'
  | 'DOCS_DECLARATION_QUALITY'
  | 'DOCS_DECLARATION_SHELF_LIFE'
  | 'DOCS_DECLARATION_LEGISLATION'
  | 'DOCS_DECLARATION_OTHER'
  | 'OTHER_QUALITY_SAFETY'
  | 'OTHER_AUDIT'
  | 'OTHER_CLARIFYING_INFO';

export interface ClaimProductItemDTO {
  id: string;
  claimId: string;
  productId: string | null;
  productArticle: string;
  productName: string;
  producerName: string | null;
  country: string | null;
  productionDate: string | null;
  lotNumber: string | null;
  vehicleNumber: string | null;
  nonConformWeightKg: number;
  receivedQuantityKg: number | null;
}

export interface ClaimAttachmentDTO {
  id: string;
  claimId: string;
  fileName: string;
  fileUrl: string;
  fileSizeBytes: number;
  createdAt: string;
}

export interface ClaimDTO {
  id: string;
  claimNumber: string;
  companyId: string;
  companyName: string;
  submittedById: string;
  submittedByName: string;
  submittedByEmail?: string;
  type: ClaimType;
  status: ClaimStatus;
  subject: string;
  categoryOfRequest: string | null;
  supplierName: string | null;
  infoCategory: InfoRequestCategory | null;
  targetCountry: string | null;
  requestedShelfLifeDate: string | null;
  reasonForShelfLifeExtension: string | null;
  shelfLifeExtensionVolumeKg: number | null;
  shipmentId: string | null;
  containerNumber: string | null;
  invoiceNumber: string | null;
  deliveryDate: string | null;
  description: string | null;
  additionalEmails: string | null;
  companyResponse: string | null;
  resolvedAt: string | null;
  products: ClaimProductItemDTO[];
  attachments: ClaimAttachmentDTO[];
  createdAt: string;
  updatedAt: string;
}

export function mapProductItemToDTO(item: any): ClaimProductItemDTO {
  return {
    id: item.id,
    claimId: item.claimId,
    productId: item.productId ?? null,
    productArticle: item.productArticle,
    productName: item.productName,
    producerName: item.producerName ?? null,
    country: item.country ?? null,
    productionDate: item.productionDate ? new Date(item.productionDate).toISOString() : null,
    lotNumber: item.lotNumber ?? null,
    vehicleNumber: item.vehicleNumber ?? null,
    nonConformWeightKg: Number(item.nonConformWeightKg),
    receivedQuantityKg: item.receivedQuantityKg != null ? Number(item.receivedQuantityKg) : null,
  };
}

export function mapAttachmentToDTO(att: any): ClaimAttachmentDTO {
  return {
    id: att.id,
    claimId: att.claimId,
    fileName: att.fileName,
    fileUrl: att.fileUrl,
    fileSizeBytes: att.fileSizeBytes,
    createdAt: new Date(att.createdAt).toISOString(),
  };
}

export function mapClaimToDTO(record: any): ClaimDTO {
  let authorName = 'Portal User';
  if (record.submittedBy) {
    const parts = [record.submittedBy.firstName, record.submittedBy.lastName].filter(Boolean);
    if (parts.length > 0) {
      authorName = parts.join(' ');
    }
  }

  return {
    id: record.id,
    claimNumber: record.claimNumber,
    companyId: record.companyId,
    companyName: record.company?.name || 'Company',
    submittedById: record.submittedById,
    submittedByName: authorName,
    submittedByEmail: record.submittedBy?.email,
    type: record.type as ClaimType,
    status: record.status as ClaimStatus,
    subject: record.subject,
    categoryOfRequest: record.categoryOfRequest ?? null,
    supplierName: record.supplierName ?? null,
    infoCategory: record.infoCategory ?? null,
    targetCountry: record.targetCountry ?? null,
    requestedShelfLifeDate: record.requestedShelfLifeDate
      ? new Date(record.requestedShelfLifeDate).toISOString()
      : null,
    reasonForShelfLifeExtension: record.reasonForShelfLifeExtension ?? null,
    shelfLifeExtensionVolumeKg:
      record.shelfLifeExtensionVolumeKg != null ? Number(record.shelfLifeExtensionVolumeKg) : null,
    shipmentId: record.shipmentId ?? null,
    containerNumber: record.containerNumber ?? null,
    invoiceNumber: record.invoiceNumber ?? null,
    deliveryDate: record.deliveryDate ? new Date(record.deliveryDate).toISOString() : null,
    description: record.description ?? null,
    additionalEmails: record.additionalEmails ?? null,
    companyResponse: record.companyResponse ?? null,
    resolvedAt: record.resolvedAt ? new Date(record.resolvedAt).toISOString() : null,
    products: Array.isArray(record.products) ? record.products.map(mapProductItemToDTO) : [],
    attachments: Array.isArray(record.attachments) ? record.attachments.map(mapAttachmentToDTO) : [],
    createdAt: new Date(record.createdAt).toISOString(),
    updatedAt: new Date(record.updatedAt).toISOString(),
  };
}
