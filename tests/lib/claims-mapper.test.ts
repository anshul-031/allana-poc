import { describe, it, expect } from 'vitest';
import {
  mapProductItemToDTO,
  mapAttachmentToDTO,
  mapClaimToDTO,
} from '@/lib/claims-mapper';

describe('src/lib/claims-mapper.ts - Claims DTO Mappers', () => {
  const sampleClaimRecord = {
    id: 'clm-uuid-001',
    claimNumber: 'CLM-2026-0001',
    companyId: 'comp-100',
    company: { name: 'LuLu Hypermarket KSA' },
    submittedById: 'user-001',
    submittedBy: {
      firstName: 'Ahmed',
      lastName: 'Al-Harbi',
      email: 'ahmed@lulu.com',
    },
    type: 'CLAIM',
    status: 'REGISTERED',
    subject: 'Packaging tear in lot AL-99',
    categoryOfRequest: null,
    supplierName: 'Allana Frigorifico',
    infoCategory: null,
    targetCountry: 'Saudi Arabia',
    requestedShelfLifeDate: '2027-01-01T00:00:00Z',
    reasonForShelfLifeExtension: 'Port clearance delay',
    shelfLifeExtensionVolumeKg: 2500,
    shipmentId: 'ship-1',
    containerNumber: 'MSCU-1234567',
    invoiceNumber: 'INV-2026-001',
    deliveryDate: '2026-02-15T00:00:00Z',
    description: 'Minor damage to outer master carton.',
    additionalEmails: 'qa@lulu.com',
    companyResponse: 'Under review by QC team',
    resolvedAt: '2026-02-20T10:00:00Z',
    products: [
      {
        id: 'prod-item-1',
        claimId: 'clm-uuid-001',
        productId: 'prod-1',
        productArticle: '8310',
        productName: 'Frozen Boneless Buffalo Topside',
        producerName: 'Allana Frigorifico',
        country: 'India',
        productionDate: '2025-12-01T00:00:00Z',
        lotNumber: 'LOT-9988',
        vehicleNumber: 'MH-04-1234',
        nonConformWeightKg: 1420.5,
        receivedQuantityKg: 5000,
      },
    ],
    attachments: [
      {
        id: 'att-1',
        claimId: 'clm-uuid-001',
        fileName: 'damage-photo-1.jpg',
        fileUrl: 'claims/damage-photo-1.jpg',
        fileSizeBytes: 1048576,
        createdAt: '2026-02-16T08:00:00Z',
      },
    ],
    createdAt: '2026-02-16T07:30:00Z',
    updatedAt: '2026-02-16T07:30:00Z',
  };

  it('maps complete claim record to DTO correctly', () => {
    const dto = mapClaimToDTO(sampleClaimRecord);
    expect(dto.id).toBe('clm-uuid-001');
    expect(dto.claimNumber).toBe('CLM-2026-0001');
    expect(dto.companyName).toBe('LuLu Hypermarket KSA');
    expect(dto.submittedByName).toBe('Ahmed Al-Harbi');
    expect(dto.submittedByEmail).toBe('ahmed@lulu.com');
    expect(dto.products.length).toBe(1);
    expect(dto.products[0].nonConformWeightKg).toBe(1420.5);
    expect(dto.products[0].receivedQuantityKg).toBe(5000);
    expect(dto.attachments.length).toBe(1);
    expect(dto.attachments[0].fileName).toBe('damage-photo-1.jpg');
    expect(dto.resolvedAt).toBe(new Date('2026-02-20T10:00:00Z').toISOString());
  });

  it('handles partial names and fallback author name', () => {
    const singleNameRecord = {
      ...sampleClaimRecord,
      submittedBy: { firstName: 'Fatima', lastName: '' },
    };
    expect(mapClaimToDTO(singleNameRecord).submittedByName).toBe('Fatima');

    const noNameRecord = {
      ...sampleClaimRecord,
      submittedBy: { firstName: '', lastName: '' },
    };
    expect(mapClaimToDTO(noNameRecord).submittedByName).toBe('Portal User');
  });

  it('handles minimal/null fields gracefully in mapClaimToDTO and mapProductItemToDTO', () => {
    const minimalClaim = {
      id: 'clm-2',
      claimNumber: 'REQ-2026-0002',
      companyId: 'comp-1',
      submittedById: 'user-1',
      type: 'INFO_REQUEST',
      status: 'UNDER_REVIEW',
      subject: 'General Question',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    };
    const dto = mapClaimToDTO(minimalClaim);
    expect(dto.submittedByName).toBe('Portal User');
    expect(dto.companyName).toBe('Company');
    expect(dto.products).toEqual([]);
    expect(dto.attachments).toEqual([]);
    expect(dto.requestedShelfLifeDate).toBeNull();
    expect(dto.shelfLifeExtensionVolumeKg).toBeNull();
    expect(dto.deliveryDate).toBeNull();
    expect(dto.resolvedAt).toBeNull();

    const itemWithoutOptionals = mapProductItemToDTO({
      id: 'item-2',
      claimId: 'clm-2',
      productArticle: '8320',
      productName: 'Buffalo Tenderloin',
      nonConformWeightKg: '500',
    });
    expect(itemWithoutOptionals.producerName).toBeNull();
    expect(itemWithoutOptionals.receivedQuantityKg).toBeNull();
    expect(itemWithoutOptionals.productionDate).toBeNull();
    expect(itemWithoutOptionals.country).toBeNull();
    expect(itemWithoutOptionals.lotNumber).toBeNull();
    expect(itemWithoutOptionals.vehicleNumber).toBeNull();
    expect(itemWithoutOptionals.productId).toBeNull();
  });

  it('maps attachment correctly in mapAttachmentToDTO', () => {
    const att = mapAttachmentToDTO({
      id: 'att-2',
      claimId: 'clm-1',
      fileName: 'spec.pdf',
      fileUrl: 'claims/spec.pdf',
      fileSizeBytes: 2048,
      createdAt: new Date('2026-01-01T12:00:00Z'),
    });
    expect(att.fileName).toBe('spec.pdf');
    expect(att.fileSizeBytes).toBe(2048);
    expect(att.createdAt).toBe(new Date('2026-01-01T12:00:00Z').toISOString());
  });
});
