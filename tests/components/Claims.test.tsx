import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ClaimRowPreview } from '@/components/claims/ClaimRowPreview';
import { ClaimsTable, getStatusBadgeStyle } from '@/components/claims/ClaimsTable';
import { ClaimsPortalView } from '@/components/claims/ClaimsPortalView';
import { ClaimProductLines } from '@/components/claims/ClaimProductLines';
import { ClaimForm } from '@/components/claims/ClaimForm';
import { CategoryTreeSelector } from '@/components/claims/CategoryTreeSelector';
import { InfoRequestForm } from '@/components/claims/InfoRequestForm';
import { ClaimDetailView } from '@/components/claims/ClaimDetailView';
import ClaimsPage from '@/app/(portal)/claims/page';
import NewClaimPage from '@/app/(portal)/claims/new-claim/page';
import NewRequestPage from '@/app/(portal)/claims/new-request/page';
import ClaimDetailPage, { generateMetadata } from '@/app/(portal)/claims/[id]/page';
import * as claimsActions from '@/server/actions/claims.actions';
import { ClaimDTO } from '@/server/actions/claims.actions';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/claims',
}));

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue({ value: 'company-lulu-123' }),
  }),
}));

const mockClaim1: ClaimDTO = {
  id: 'clm-001',
  claimNumber: 'CLM-2026-0001',
  companyId: 'comp-lulu',
  companyName: 'LuLu Hypermarket KSA',
  submittedById: 'user-ahmed',
  submittedByName: 'Ahmed Al-Harbi',
  submittedByEmail: 'ahmed@lulu.com',
  type: 'CLAIM',
  status: 'REGISTERED',
  subject: 'Temperature Deviation & Damaged Cartons',
  categoryOfRequest: 'Quality Defect',
  supplierName: 'Allana Cold Storage Plant 4, Mumbai',
  infoCategory: null,
  targetCountry: 'Saudi Arabia',
  requestedShelfLifeDate: null,
  reasonForShelfLifeExtension: null,
  shelfLifeExtensionVolumeKg: null,
  shipmentId: 'ship-1',
  containerNumber: 'MSKU9482710',
  invoiceNumber: 'INV-2026-9021',
  deliveryDate: '2026-02-20T00:00:00Z',
  description: 'Upon devanning container at Dammam Port, cartons in bay 3 were found deformed with ice crystallization.',
  additionalEmails: 'qa@lulu.com; logistics@lulu.com',
  companyResponse: null,
  resolvedAt: null,
  createdAt: '2026-02-21T10:00:00Z',
  updatedAt: '2026-02-21T10:00:00Z',
  products: [
    {
      id: 'prod-item-1',
      claimId: 'clm-001',
      productId: 'prod-topside',
      productArticle: '7940',
      productName: 'Frozen Boneless Buffalo Topside 20kg',
      producerName: 'Allana Foods',
      country: 'India',
      productionDate: '2026-01-15T00:00:00Z',
      lotNumber: 'LOT-2026-B91',
      vehicleNumber: 'TRUCK-MH-04-1290',
      nonConformWeightKg: 1420.5,
      receivedQuantityKg: 5000,
    },
  ],
  attachments: [
    {
      id: 'att-1',
      claimId: 'clm-001',
      fileName: 'damage-photo-1.jpg',
      fileUrl: 'claims/evidence/damage-photo-1.jpg',
      fileSizeBytes: 51200,
      createdAt: '2026-02-21T10:05:00Z',
    },
  ],
};

const mockClaimResolved: ClaimDTO = {
  ...mockClaim1,
  id: 'clm-002',
  claimNumber: 'CLM-2026-0002',
  status: 'ACCEPTED',
  companyResponse: 'Formal credit note CN-2026-8910 authorized for $6,818.40 following lab temperature audit.',
  resolvedAt: '2026-02-25T14:30:00Z',
};

const mockInfoRequest: ClaimDTO = {
  id: 'req-001',
  claimNumber: 'REQ-2026-0001',
  companyId: 'comp-lulu',
  companyName: 'LuLu Hypermarket KSA',
  submittedById: 'user-ahmed',
  submittedByName: 'Ahmed Al-Harbi',
  submittedByEmail: 'ahmed@lulu.com',
  type: 'INFO_REQUEST',
  status: 'UNDER_REVIEW',
  subject: 'Shelf Life Extension Declaration for Customs Clearance',
  categoryOfRequest: 'DOCS_DECLARATION_SHELF_LIFE',
  supplierName: 'Allana Cold Storage Plant 4, Mumbai',
  infoCategory: 'DOCS_DECLARATION_SHELF_LIFE',
  targetCountry: 'Saudi Arabia',
  requestedShelfLifeDate: '2027-01-15T00:00:00Z',
  reasonForShelfLifeExtension: 'Port quarantine congestion delayed clearance by 3 weeks.',
  shelfLifeExtensionVolumeKg: 2500,
  shipmentId: null,
  containerNumber: null,
  invoiceNumber: null,
  deliveryDate: null,
  description: 'Need formal manufacturer letter requesting 3-month shelf life extension.',
  additionalEmails: 'customs@lulu.com',
  companyResponse: null,
  resolvedAt: null,
  createdAt: '2026-02-22T08:00:00Z',
  updatedAt: '2026-02-22T08:00:00Z',
  products: [
    {
      id: 'prod-item-2',
      claimId: 'req-001',
      productId: 'prod-topside',
      productArticle: '7940',
      productName: 'Frozen Boneless Buffalo Topside',
      producerName: 'Allana Foods',
      country: 'India',
      productionDate: '2026-01-15T00:00:00Z',
      lotNumber: null,
      vehicleNumber: null,
      nonConformWeightKg: 0,
      receivedQuantityKg: null,
    },
  ],
  attachments: [],
};

const mockMinimalClaim: ClaimDTO = {
  id: 'min-1',
  claimNumber: 'CLM-MIN-1',
  companyId: 'c-1',
  companyName: 'Partner',
  submittedById: 'u-1',
  submittedByName: 'User',
  type: 'CLAIM',
  status: 'REGISTERED',
  subject: 'Minimal Claim',
  categoryOfRequest: null,
  supplierName: null,
  infoCategory: null,
  targetCountry: null,
  requestedShelfLifeDate: null,
  reasonForShelfLifeExtension: null,
  shelfLifeExtensionVolumeKg: null,
  shipmentId: null,
  containerNumber: null,
  invoiceNumber: null,
  deliveryDate: null,
  description: null,
  additionalEmails: null,
  companyResponse: null,
  resolvedAt: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  products: [],
  attachments: [],
};

describe('Claims Desk UI Components (Module 8)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.alert = vi.fn();
    window.open = vi.fn();
  });

  describe('ClaimRowPreview', () => {
    it('renders category of request, container number, invoice, and pending status', () => {
      render(<ClaimRowPreview claim={mockClaim1} />);
      expect(screen.getByText('Quality Defect')).toBeDefined();
      expect(screen.getByText(/MSKU9482710/)).toBeDefined();
      expect(screen.getByText(/INV-2026-9021/)).toBeDefined();
      expect(screen.getByText('Company Response Status:')).toBeDefined();
      expect(screen.getByText(/Pending official response/)).toBeDefined();
    });

    it('renders official company answer panel when response is present', () => {
      render(<ClaimRowPreview claim={mockClaimResolved} />);
      expect(screen.getByText('Official Company Answer:')).toBeDefined();
      expect(screen.getByText(/CN-2026-8910 authorized/)).toBeDefined();
    });

    it('renders affected product items table with 4-decimal weight formatting', () => {
      render(<ClaimRowPreview claim={mockClaim1} />);
      expect(screen.getByText('Affected Product Items (1):')).toBeDefined();
      expect(screen.getByText('7940')).toBeDefined();
      expect(screen.getByText('Frozen Boneless Buffalo Topside 20kg')).toBeDefined();
      expect(screen.getByText('TRUCK-MH-04-1290')).toBeDefined();
      expect(screen.getByText('1420.5000 kg')).toBeDefined();
    });

    it('renders fallback dashes when vehicle, lot, or receivedQuantity are null', () => {
      render(<ClaimRowPreview claim={mockInfoRequest} />);
      const dashes = screen.getAllByText('—');
      expect(dashes.length).toBeGreaterThan(0);
    });

    it('renders General Inquiry fallback when categoryOfRequest and infoCategory are null', () => {
      render(<ClaimRowPreview claim={mockMinimalClaim} />);
      expect(screen.getByText('General Inquiry')).toBeDefined();
    });

    it('triggers attachment download callback when attachment pill is clicked', () => {
      const onDownload = vi.fn();
      render(<ClaimRowPreview claim={mockClaim1} onDownloadAttachment={onDownload} />);
      const btn = screen.getByText('damage-photo-1.jpg');
      fireEvent.click(btn);
      expect(onDownload).toHaveBeenCalledWith('att-1');
    });
  });

  describe('ClaimsTable & getStatusBadgeStyle', () => {
    it('returns badge styles for all status codes including unknown fallback', () => {
      const statuses = [
        'REGISTERED',
        'UNDER_REVIEW',
        'INVESTIGATION',
        'CLARIFICATION_REQUIRED',
        'PARTLY_ACCEPTED',
        'ACCEPTED',
        'REJECTED',
        'COMPLETED',
      ] as const;

      statuses.forEach((s) => {
        const badge = getStatusBadgeStyle(s);
        expect(badge.label).toBeDefined();
        expect(badge.bg).toBeDefined();
      });

      const fallback = getStatusBadgeStyle('UNKNOWN_STATUS' as any);
      expect(fallback.label).toBe('UNKNOWN_STATUS');
    });

    it('renders empty table notice when no claims exist', () => {
      render(<ClaimsTable claims={[]} />);
      expect(screen.getByText(/No claims or inquiries found/)).toBeDefined();
    });

    it('renders claims list and toggles in-place row expansion via arrow and details button', () => {
      render(<ClaimsTable claims={[mockClaim1, mockInfoRequest]} />);
      expect(screen.getByText('CLM-2026-0001')).toBeDefined();
      expect(screen.getByText('REQ-2026-0001')).toBeDefined();

      // Click arrow button to expand
      const expandBtn = screen.getByTestId('toggle-expand-clm-001');
      fireEvent.click(expandBtn);
      expect(screen.getByTestId('claim-preview-clm-001')).toBeDefined();

      // Click Details button to collapse
      const hideBtn = screen.getByText('Hide ▴');
      fireEvent.click(hideBtn);
      expect(screen.queryByTestId('claim-preview-clm-001')).toBeNull();

      // Click Details button to expand again
      const detailsBtn = screen.getAllByText('Details ▾')[0];
      fireEvent.click(detailsBtn);
      expect(screen.getByTestId('claim-preview-clm-001')).toBeDefined();
    });

    it('handles invalid date strings in formatDate gracefully', () => {
      const claimWithInvalidDate: ClaimDTO = {
        ...mockClaim1,
        createdAt: 'invalid-date-string',
      };
      render(<ClaimsTable claims={[claimWithInvalidDate]} />);
      expect(screen.getByText('invalid-date-string')).toBeDefined();
    });

    it('supports column sorting triggers for claimNumber and createdAt', () => {
      const onSort = vi.fn();
      const { rerender } = render(
        <ClaimsTable
          claims={[mockClaim1]}
          onSort={onSort}
          sortField="claimNumber"
          sortOrder="asc"
        />
      );
      const ticketHeader = screen.getByText(/Ticket ID/);
      fireEvent.click(ticketHeader);
      expect(onSort).toHaveBeenCalledWith('claimNumber');

      rerender(
        <ClaimsTable
          claims={[mockClaim1]}
          onSort={onSort}
          sortField="claimNumber"
          sortOrder="desc"
        />
      );
      expect(screen.getByText(/Ticket ID ▼/)).toBeDefined();

      const dateHeader = screen.getByText(/Created Date/);
      fireEvent.click(dateHeader);
      expect(onSort).toHaveBeenCalledWith('createdAt');
    });
  });

  describe('ClaimsPortalView', () => {
    const claims = [mockClaim1, mockClaimResolved, mockInfoRequest];

    it('renders dashboard with filter bar, search input, and action links', () => {
      render(<ClaimsPortalView initialClaims={claims} initialTotal={3} />);
      expect(screen.getByText('Claims & Complaints Desk')).toBeDefined();
      expect(screen.getByTestId('create-claim-button')).toBeDefined();
      expect(screen.getByTestId('create-request-button')).toBeDefined();
      expect(screen.getByTestId('found-records-counter').textContent).toContain('3');
    });

    it('filters claims by search query across ticket number, container, and products', () => {
      render(<ClaimsPortalView initialClaims={claims} initialTotal={3} />);
      const searchInput = screen.getByTestId('claims-search');

      // Search by ticket ID
      fireEvent.change(searchInput, { target: { value: 'CLM-2026-0001' } });
      expect(screen.getByTestId('found-records-counter').textContent).toContain('1');

      // Search by vehicle
      fireEvent.change(searchInput, { target: { value: 'TRUCK-MH-04' } });
      expect(screen.getByTestId('found-records-counter').textContent).toContain('2');

      // Search by non-matching query
      fireEvent.change(searchInput, { target: { value: 'NONEXISTENT' } });
      expect(screen.getByTestId('found-records-counter').textContent).toContain('0');
    });

    it('filters claims by type and status', () => {
      render(<ClaimsPortalView initialClaims={claims} initialTotal={3} />);
      const typeSelect = screen.getByTestId('claims-type-filter');
      const statusSelect = screen.getByTestId('claims-status-filter');

      fireEvent.change(typeSelect, { target: { value: 'INFO_REQUEST' } });
      expect(screen.getByTestId('found-records-counter').textContent).toContain('1');

      fireEvent.change(typeSelect, { target: { value: 'ALL' } });
      fireEvent.change(statusSelect, { target: { value: 'ACCEPTED' } });
      expect(screen.getByTestId('found-records-counter').textContent).toContain('1');
    });

    it('filters claims by date range and resets filters', () => {
      render(<ClaimsPortalView initialClaims={claims} initialTotal={3} />);
      const startInput = screen.getByTestId('claims-start-date');
      const endInput = screen.getByTestId('claims-end-date');

      fireEvent.change(startInput, { target: { value: '2026-02-21' } });
      fireEvent.change(endInput, { target: { value: '2026-02-23' } });
      expect(screen.getByTestId('found-records-counter').textContent).toContain('3');

      // Click reset button
      const resetBtn = screen.getByTestId('claims-reset-button');
      fireEvent.click(resetBtn);
      expect(screen.getByTestId('found-records-counter').textContent).toContain('3');
    });

    it('exercises all ClaimsPortalView pagination, sorting, and page size controls', () => {
      const manyClaims = Array.from({ length: 15 }, (_, i) => ({
        ...mockClaim1,
        id: `clm-many-${i}`,
        claimNumber: `CLM-2026-${String(i + 1).padStart(4, '0')}`,
        createdAt: `2026-02-${String((i % 20) + 1).padStart(2, '0')}T10:00:00Z`,
      }));

      render(<ClaimsPortalView initialClaims={manyClaims} initialTotal={15} />);

      // Switch to page size 24
      const size24Btn = screen.getByText('24');
      fireEvent.click(size24Btn);

      // Switch back to page size 12
      const size12Btn = screen.getByText('12');
      fireEvent.click(size12Btn);

      // Click Next Page button
      const nextBtn = screen.getByText('>');
      fireEvent.click(nextBtn);

      // Click Previous Page button
      const prevBtn = screen.getByText('<');
      fireEvent.click(prevBtn);

      // Click specific page number button
      const page2Btn = screen.getByText('2');
      fireEvent.click(page2Btn);

      // Sort by Ticket ID (toggle asc then desc)
      const ticketIdHeader = screen.getByText(/Ticket ID/);
      fireEvent.click(ticketIdHeader);
      fireEvent.click(ticketIdHeader);

      // Sort by Created Date
      const dateHeader = screen.getByText(/Created Date/);
      fireEvent.click(dateHeader);
    });

    it('handles attachment download trigger in ClaimsPortalView', async () => {
      vi.spyOn(claimsActions, 'getClaimAttachmentPresignedUrl').mockResolvedValueOnce({
        success: true,
        url: 'https://r2.allana.com/download/damage.jpg',
      });

      render(<ClaimsPortalView initialClaims={[mockClaim1]} initialTotal={1} />);
      const expandBtn = screen.getByTestId('toggle-expand-clm-001');
      fireEvent.click(expandBtn);

      const attBtn = screen.getByText('damage-photo-1.jpg');
      fireEvent.click(attBtn);

      await waitFor(() => {
        expect(window.open).toHaveBeenCalledWith(
          'https://r2.allana.com/download/damage.jpg',
          '_blank',
          'noopener,noreferrer'
        );
      });
    });

    it('shows alert on attachment download error', async () => {
      vi.spyOn(claimsActions, 'getClaimAttachmentPresignedUrl').mockResolvedValueOnce({
        success: false,
        url: null,
        error: 'File expired',
      });

      render(<ClaimsPortalView initialClaims={[mockClaim1]} initialTotal={1} />);
      const expandBtn = screen.getByTestId('toggle-expand-clm-001');
      fireEvent.click(expandBtn);

      const attBtn = screen.getByText('damage-photo-1.jpg');
      fireEvent.click(attBtn);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('File expired');
      });
    });

    it('shows alert on attachment download network exception', async () => {
      vi.spyOn(claimsActions, 'getClaimAttachmentPresignedUrl').mockRejectedValueOnce(
        new Error('Network offline')
      );

      render(<ClaimsPortalView initialClaims={[mockClaim1]} initialTotal={1} />);
      const expandBtn = screen.getByTestId('toggle-expand-clm-001');
      fireEvent.click(expandBtn);

      const attBtn = screen.getByText('damage-photo-1.jpg');
      fireEvent.click(attBtn);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Network error while requesting document download');
      });
    });
  });

  describe('ClaimProductLines', () => {
    it('renders product lines table and calculates total weight summary', () => {
      const onChange = vi.fn();
      render(
        <ClaimProductLines
          lines={[
            {
              productArticle: '7940',
              productName: 'Frozen Boneless Buffalo Topside',
              nonConformWeightKg: 1420.5,
            },
            {
              productArticle: '8320',
              productName: 'Frozen Buffalo Tenderloin',
              nonConformWeightKg: 500,
            },
          ]}
          onChange={onChange}
        />
      );

      expect(screen.getByText(/Product Lines/)).toBeDefined();
      expect(screen.getByTestId('total-weight-summary').textContent).toContain('1920.5000 kg');
    });

    it('adds a new product line row when under limit of 10', () => {
      const onChange = vi.fn();
      render(
        <ClaimProductLines
          lines={[{ productArticle: '', productName: '', nonConformWeightKg: 0 }]}
          onChange={onChange}
        />
      );

      const addBtn = screen.getByTestId('add-product-line-btn');
      fireEvent.click(addBtn);

      expect(onChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ productArticle: '' }),
          expect.objectContaining({ productArticle: '' }),
        ])
      );
    });

    it('exercises all input fields in ClaimProductLines and edge cases', async () => {
      const onChange = vi.fn();
      render(
        <ClaimProductLines
          lines={[
            {
              productArticle: '7940',
              productName: 'Topside',
              producerName: 'Allana',
              country: 'India',
              productionDate: '2026-01-01',
              lotNumber: 'LOT-1',
              vehicleNumber: 'V-1',
              nonConformWeightKg: 100,
              receivedQuantityKg: 200,
            },
          ]}
          onChange={onChange}
        />
      );

      // Trigger change on all line inputs
      const producerInput = screen.getByPlaceholderText('e.g. Allana Plant 4');
      fireEvent.change(producerInput, { target: { value: 'Allana Plant 2' } });

      const countryInput = screen.getByPlaceholderText('e.g. India');
      fireEvent.change(countryInput, { target: { value: 'Brazil' } });

      const lotInput = screen.getByPlaceholderText('e.g. LOT-2026-B91');
      fireEvent.change(lotInput, { target: { value: 'LOT-99' } });

      const vehicleInput = screen.getByTestId('vehicle-input-0');
      fireEvent.change(vehicleInput, { target: { value: 'TRUCK-99' } });

      const nonConformInput = screen.getByTestId('nonconform-input-0');
      fireEvent.change(nonConformInput, { target: { value: '' } });

      const receivedInput = screen.getAllByPlaceholderText('00.0000')[1];
      fireEvent.change(receivedInput, { target: { value: '350.5' } });
      fireEvent.change(receivedInput, { target: { value: '' } });

      // Blur with lookup rejection (exercises catch)
      vi.spyOn(claimsActions, 'lookupProductByArticle').mockRejectedValueOnce(new Error('fail'));
      const articleInput = screen.getByTestId('article-input-0');
      fireEvent.blur(articleInput, { target: { value: 'ERR_SKU' } });

      // Blur with empty string
      fireEvent.blur(articleInput, { target: { value: '   ' } });

      // Blur with successful lookup
      vi.spyOn(claimsActions, 'lookupProductByArticle').mockResolvedValueOnce({
        success: true,
        product: { id: 'p', sku: '7940', name: 'Topside Spec', category: 'Meat', brand: 'Allana' },
      });
      fireEvent.blur(articleInput, { target: { value: '7940' } });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
      });
    });

    it('exercises max lines limit and min line limit in ClaimProductLines', () => {
      const tenLines = Array.from({ length: 10 }, (_, i) => ({
        productArticle: `A-${i}`,
        productName: `P-${i}`,
        nonConformWeightKg: 10,
      }));
      const onChange = vi.fn();
      render(<ClaimProductLines lines={tenLines} onChange={onChange} />);

      const addBtn = screen.getByTestId('add-product-line-btn');
      fireEvent.click(addBtn); // Should not add because length >= 10
      expect(onChange).not.toHaveBeenCalled();
    });

    it('removes a line when lines > 1 and displays error banner', () => {
      const onChange = vi.fn();
      render(
        <ClaimProductLines
          lines={[
            { productArticle: '7940', productName: 'Topside', nonConformWeightKg: 50 },
            { productArticle: '8320', productName: 'Tenderloin', nonConformWeightKg: 80 },
          ]}
          onChange={onChange}
          error="Please specify non-conforming weights"
        />
      );

      expect(screen.getByTestId('product-lines-error')).toBeDefined();
      const removeBtn = screen.getByTestId('remove-line-1');
      fireEvent.click(removeBtn);
      expect(onChange).toHaveBeenCalledWith([expect.objectContaining({ productArticle: '7940' })]);
    });
  });

  describe('ClaimForm', () => {
    it('renders form fields with claimant info card and notice banner', () => {
      render(
        <ClaimForm
          userEmail="buyer@lulu.com"
          userName="Rashid Al-Otaibi"
          companyName="LuLu Hypermarket KSA"
        />
      );

      expect(screen.getByTestId('claim-notice-banner')).toBeDefined();
      expect(screen.getByText('Rashid Al-Otaibi')).toBeDefined();
      expect(screen.getByText(/buyer@lulu.com/)).toBeDefined();
    });

    it('validates empty initial lines in ClaimForm', () => {
      render(
        <ClaimForm
          userEmail="buyer@lulu.com"
          userName="Rashid"
          companyName="LuLu"
          initialLines={[]}
        />
      );

      const form = screen.getByTestId('quality-claim-form');
      fireEvent.change(screen.getByTestId('claim-subject-input'), {
        target: { value: 'Valid Subject' },
      });
      fireEvent.submit(form);
      expect(screen.getByTestId('claim-form-error').textContent).toContain('At least one product line is required');
    });

    it('validates subject, product article, and non-conforming weight before submission', async () => {
      render(
        <ClaimForm
          userEmail="buyer@lulu.com"
          userName="Rashid"
          companyName="LuLu"
        />
      );

      const form = screen.getByTestId('quality-claim-form');
      fireEvent.submit(form);

      expect(screen.getByTestId('claim-form-error').textContent).toContain('Subject is required');

      // Provide subject
      fireEvent.change(screen.getByTestId('claim-subject-input'), {
        target: { value: 'Transit Thawing Damage' },
      });
      fireEvent.submit(form);
      expect(screen.getByTestId('claim-form-error').textContent).toContain('Product article is required');

      // Provide article, missing name
      fireEvent.change(screen.getByTestId('article-input-0'), { target: { value: '7940' } });
      fireEvent.submit(form);
      expect(screen.getByTestId('claim-form-error').textContent).toContain('Product name is required');

      // Provide article & name
      fireEvent.change(screen.getByTestId('name-input-0'), { target: { value: 'Topside' } });
      fireEvent.submit(form);
      expect(screen.getByTestId('claim-form-error').textContent).toContain('Non-conforming weight must be greater than 0');
    });

    it('submits valid quality claim and displays success card with generated claim number', async () => {
      vi.spyOn(claimsActions, 'submitQualityClaim').mockResolvedValueOnce({
        success: true,
        claim: mockClaim1,
      });

      render(
        <ClaimForm
          userEmail="buyer@lulu.com"
          userName="Rashid"
          companyName="LuLu"
        />
      );

      fireEvent.change(screen.getByTestId('claim-subject-input'), {
        target: { value: 'Transit Thawing Damage' },
      });
      fireEvent.change(screen.getByTestId('article-input-0'), { target: { value: '7940' } });
      fireEvent.change(screen.getByTestId('name-input-0'), { target: { value: 'Topside' } });
      fireEvent.change(screen.getByTestId('nonconform-input-0'), { target: { value: '500' } });

      const submitBtn = screen.getByTestId('submit-claim-button');
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByTestId('claim-success-card')).toBeDefined();
        expect(screen.getByTestId('created-claim-number').textContent).toBe('CLM-2026-0001');
      });
    });

    it('exercises all input fields and error branches in ClaimForm', async () => {
      render(
        <ClaimForm
          userEmail="buyer@lulu.com"
          userName="Rashid"
          companyName="LuLu"
        />
      );

      // Change category, supplier, container, invoice, country, description, emails
      fireEvent.change(screen.getByTestId('claim-category-select'), {
        target: { value: 'Underload / Shortage' },
      });
      fireEvent.change(screen.getByTestId('claim-supplier-select'), {
        target: { value: 'Frigerio Conserva Allana, Aligarh' },
      });
      fireEvent.change(screen.getByTestId('claim-container-input'), {
        target: { value: 'MSKU-NEW' },
      });
      fireEvent.change(screen.getByTestId('claim-invoice-input'), {
        target: { value: 'INV-NEW' },
      });
      fireEvent.change(screen.getByTestId('claim-description-input'), {
        target: { value: 'Underload on delivery' },
      });
      fireEvent.change(screen.getByTestId('claim-emails-input'), {
        target: { value: 'partner@lulu.com' },
      });

      // Test file size > 20MB
      const bigFile = new File(['a'.repeat(100)], 'huge.pdf', { type: 'application/pdf' });
      Object.defineProperty(bigFile, 'size', { value: 25 * 1024 * 1024 });
      const fileInput = screen.getByTestId('file-upload-input');
      fireEvent.change(fileInput, { target: { files: [bigFile] } });
      expect(screen.getByTestId('claim-form-error').textContent).toContain('20MB');

      // Test presign failure
      global.fetch = vi.fn().mockResolvedValueOnce({ ok: false });
      const normalFile = new File(['abc'], 'test.pdf', { type: 'application/pdf' });
      fireEvent.change(fileInput, { target: { files: [normalFile] } });
      await waitFor(() => {
        expect(screen.getByTestId('claim-form-error').textContent).toContain('Failed to generate upload URL');
      });

      // Test upload PUT failure
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ uploadUrl: 'https://r2.allana.com/up', key: 'key-1' }),
        })
        .mockResolvedValueOnce({ ok: false });
      fireEvent.change(fileInput, { target: { files: [normalFile] } });
      await waitFor(() => {
        expect(screen.getByTestId('claim-form-error').textContent).toContain('Failed to upload file');
      });

      // Test submission failure from action
      vi.spyOn(claimsActions, 'submitQualityClaim').mockResolvedValueOnce({
        success: false,
        claim: null,
        error: 'Backend rejection',
      });
      fireEvent.change(screen.getByTestId('claim-subject-input'), { target: { value: 'Valid Subject' } });
      fireEvent.change(screen.getByTestId('article-input-0'), { target: { value: '7940' } });
      fireEvent.change(screen.getByTestId('name-input-0'), { target: { value: 'Topside' } });
      fireEvent.change(screen.getByTestId('nonconform-input-0'), { target: { value: '100' } });

      const form = screen.getByTestId('quality-claim-form');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByTestId('claim-form-error').textContent).toContain('Backend rejection');
      });

      // Test thrown Error exception
      vi.spyOn(claimsActions, 'submitQualityClaim').mockRejectedValueOnce(new Error('Network crash'));
      fireEvent.submit(form);
      await waitFor(() => {
        expect(screen.getByTestId('claim-form-error').textContent).toContain('Network crash');
      });

      // Test non-Error thrown exception
      vi.spyOn(claimsActions, 'submitQualityClaim').mockRejectedValueOnce('raw-string-rejection');
      fireEvent.submit(form);
      await waitFor(() => {
        expect(screen.getByTestId('claim-form-error').textContent).toContain('Submission failed');
      });
    });

    it('simulates file upload to Cloudflare R2 and attachment removal', async () => {
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ uploadUrl: 'https://r2.allana.com/upload', key: 'claims/photo.jpg' }),
        })
        .mockResolvedValueOnce({
          ok: true,
        });

      render(
        <ClaimForm
          userEmail="buyer@lulu.com"
          userName="Rashid"
          companyName="LuLu"
        />
      );

      const fileInput = screen.getByTestId('file-upload-input');
      const testFile = new File(['mock content'], 'photo.jpg', { type: 'image/jpeg' });
      fireEvent.change(fileInput, { target: { files: [testFile] } });

      await waitFor(() => {
        expect(screen.getByText(/photo\.jpg/)).toBeDefined();
      });

      // Remove attachment
      const removeBtn = screen.getByText('✕');
      fireEvent.click(removeBtn);
      expect(screen.queryByText(/photo\.jpg/)).toBeNull();
    });

    it('handles default claimant name and submission rejection without error message', async () => {
      vi.spyOn(claimsActions, 'submitQualityClaim').mockResolvedValueOnce({
        success: false,
        claim: null,
      });

      render(
        <ClaimForm
          userEmail="buyer@lulu.com"
          userName=""
          companyName="LuLu"
        />
      );

      expect(screen.getByText('Authorized Buyer')).toBeDefined();

      const form = screen.getByTestId('quality-claim-form');
      fireEvent.change(screen.getByTestId('claim-subject-input'), { target: { value: 'Subject' } });
      fireEvent.change(screen.getByTestId('article-input-0'), { target: { value: '7940' } });
      fireEvent.change(screen.getByTestId('name-input-0'), { target: { value: 'Topside' } });
      fireEvent.change(screen.getByTestId('nonconform-input-0'), { target: { value: '10' } });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByTestId('claim-form-error').textContent).toContain('Failed to submit quality claim');
      });
    });
  });

  describe('CategoryTreeSelector & InfoRequestForm', () => {
    it('renders CategoryTreeSelector and switches categories', () => {
      const onSelect = vi.fn();
      render(
        <CategoryTreeSelector
          selectedCategory="QUESTIONNAIRE"
          onSelectCategory={onSelect}
        />
      );

      expect(screen.getByText('Quality & Supplier Questionnaire')).toBeDefined();
      expect(screen.getByText('Shelf Life Extension Declaration')).toBeDefined();

      const shelfLifeBtn = screen.getByTestId('cat-btn-DOCS_DECLARATION_SHELF_LIFE');
      fireEvent.click(shelfLifeBtn);
      expect(onSelect).toHaveBeenCalledWith('DOCS_DECLARATION_SHELF_LIFE');
    });

    it('adapts form fields when switching to Shelf Life Extension declaration', async () => {
      render(
        <InfoRequestForm
          userEmail="buyer@lulu.com"
          userName="Rashid"
          companyName="LuLu"
        />
      );

      const shelfLifeBtn = screen.getByTestId('cat-btn-DOCS_DECLARATION_SHELF_LIFE');
      fireEvent.click(shelfLifeBtn);

      expect(screen.getByTestId('shelf-life-notice-banner')).toBeDefined();
      expect(screen.getByTestId('shelf-life-inputs-section')).toBeDefined();
      expect(screen.getByTestId('shelf-requested-date')).toBeDefined();
      expect(screen.getByTestId('shelf-volume-kg')).toBeDefined();
      expect(screen.getByTestId('shelf-reason-input')).toBeDefined();
    });

    it('submits shelf life request and displays success card', async () => {
      vi.spyOn(claimsActions, 'submitInfoRequest').mockResolvedValueOnce({
        success: true,
        claim: mockInfoRequest,
      });

      render(
        <InfoRequestForm
          userEmail="buyer@lulu.com"
          userName="Rashid"
          companyName="LuLu"
        />
      );

      const shelfLifeBtn = screen.getByTestId('cat-btn-DOCS_DECLARATION_SHELF_LIFE');
      fireEvent.click(shelfLifeBtn);

      fireEvent.change(screen.getByTestId('shelf-requested-date'), { target: { value: '2027-01-15' } });
      fireEvent.change(screen.getByTestId('shelf-volume-kg'), { target: { value: '2500' } });
      fireEvent.change(screen.getByTestId('shelf-reason-input'), { target: { value: 'Port quarantine delay' } });

      const submitBtn = screen.getByTestId('submit-info-request-button');
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByTestId('request-success-card')).toBeDefined();
        expect(screen.getByTestId('created-request-number').textContent).toBe('REQ-2026-0001');
      });
    });

    it('simulates file upload to Cloudflare R2 in InfoRequestForm', async () => {
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ uploadUrl: 'https://r2.allana.com/up', key: 'req/file.pdf' }),
        })
        .mockResolvedValueOnce({ ok: true });

      render(
        <InfoRequestForm
          userEmail="buyer@lulu.com"
          userName="Rashid"
          companyName="LuLu"
        />
      );

      const fileInput = screen.getByTestId('info-file-upload-input');
      const validDoc = new File(['data'], 'license.pdf', { type: 'application/pdf' });
      fireEvent.change(fileInput, { target: { files: [validDoc] } });

      await waitFor(() => {
        expect(screen.getByText(/1 file\(s\) attached/)).toBeDefined();
      });
    });

    it('exercises all category branches and validations in InfoRequestForm', async () => {
      render(
        <InfoRequestForm
          userEmail="buyer@lulu.com"
          userName="Rashid"
          companyName="LuLu"
        />
      );

      const categories = [
        'DOCS_SPECIFICATION',
        'DOCS_SURVEY_REPORT',
        'DOCS_CERTIFICATE',
        'DOCS_DECLARATION_QUALITY',
        'DOCS_DECLARATION_LEGISLATION',
        'DOCS_DECLARATION_OTHER',
        'OTHER_QUALITY_SAFETY',
        'OTHER_AUDIT',
        'OTHER_CLARIFYING_INFO',
        'QUESTIONNAIRE',
      ] as const;

      for (const cat of categories) {
        const catBtn = screen.getByTestId(`cat-btn-${cat}`);
        fireEvent.click(catBtn);
      }

      // Test text inputs
      fireEvent.change(screen.getByTestId('info-target-country'), { target: { value: 'Kuwait' } });
      fireEvent.change(screen.getByPlaceholderText('e.g. Allana Cold Storage Plant 4, Mumbai'), {
        target: { value: 'Plant 4' },
      });
      fireEvent.change(screen.getByTestId('info-order-input'), { target: { value: 'ORD-99' } });
      fireEvent.change(screen.getByTestId('info-container-input'), { target: { value: 'CONT-99' } });
      fireEvent.change(screen.getByTestId('info-desc-input'), { target: { value: 'Questionnaire query' } });
      fireEvent.change(screen.getByTestId('info-emails-input'), { target: { value: 'qa@partner.com' } });

      // Switch to shelf life and test validation errors
      const shelfLifeBtn = screen.getByTestId('cat-btn-DOCS_DECLARATION_SHELF_LIFE');
      fireEvent.click(shelfLifeBtn);

      // Change article, product name, and production date inputs
      fireEvent.change(screen.getByTestId('info-article-input'), { target: { value: '7940' } });
      fireEvent.change(screen.getByTestId('info-product-name'), { target: { value: 'Buffalo Topside' } });
      fireEvent.change(screen.getByTestId('shelf-production-date'), { target: { value: '2026-01-10' } });

      const form = screen.getByTestId('info-request-form');

      // Empty subject validation
      fireEvent.change(screen.getByTestId('info-subject-input'), { target: { value: '   ' } });
      fireEvent.submit(form);
      expect(screen.getByTestId('info-form-error').textContent).toContain('Subject is required');
      fireEvent.change(screen.getByTestId('info-subject-input'), { target: { value: 'Valid Info Request' } });

      // 1. Missing shelf life date
      fireEvent.change(screen.getByTestId('shelf-requested-date'), { target: { value: '' } });
      fireEvent.submit(form);
      expect(screen.getByTestId('info-form-error').textContent).toContain('shelf-life date is required');

      // 2. Missing volume
      fireEvent.change(screen.getByTestId('shelf-requested-date'), { target: { value: '2027-01-01' } });
      fireEvent.submit(form);
      expect(screen.getByTestId('info-form-error').textContent).toContain('volume in kg is required');

      // 3. Missing reason
      fireEvent.change(screen.getByTestId('shelf-volume-kg'), { target: { value: '500' } });
      fireEvent.submit(form);
      expect(screen.getByTestId('info-form-error').textContent).toContain('Reason for shelf-life extension is required');

      // Test file upload input
      const fileInput = screen.getByTestId('info-file-upload-input');

      // Empty files
      fireEvent.change(fileInput, { target: { files: [] } });

      // File > 20MB
      const bigFile = new File(['x'], 'huge.pdf');
      Object.defineProperty(bigFile, 'size', { value: 30 * 1024 * 1024 });
      fireEvent.change(fileInput, { target: { files: [bigFile] } });
      expect(screen.getByTestId('info-form-error').textContent).toContain('20MB');

      const validDoc = new File(['data'], 'license.pdf', { type: 'application/pdf' });

      // Presign URL failure
      global.fetch = vi.fn().mockResolvedValueOnce({ ok: false });
      fireEvent.change(fileInput, { target: { files: [validDoc] } });
      await waitFor(() => {
        expect(screen.getByTestId('info-form-error').textContent).toContain('Failed to generate upload URL');
      });

      // Upload PUT failure
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ uploadUrl: 'https://r2.allana.com/up', key: 'req/file.pdf' }),
        })
        .mockResolvedValueOnce({ ok: false });
      fireEvent.change(fileInput, { target: { files: [validDoc] } });
      await waitFor(() => {
        expect(screen.getByTestId('info-form-error').textContent).toContain('Failed to upload file');
      });

      // Successful file upload in InfoRequestForm (mock fetch)
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ uploadUrl: 'https://r2.allana.com/up', key: 'req/file.pdf' }),
        })
        .mockResolvedValueOnce({ ok: true });

      fireEvent.change(fileInput, { target: { files: [validDoc] } });
      await waitFor(() => {
        expect(screen.getByText(/file\(s\) attached/)).toBeDefined();
      });

      // Article blur with lookup
      const articleInput = screen.getByTestId('info-article-input');
      fireEvent.blur(articleInput, { target: { value: '   ' } });

      vi.spyOn(claimsActions, 'lookupProductByArticle').mockRejectedValueOnce(new Error('fail'));
      fireEvent.blur(articleInput, { target: { value: 'FAIL_SKU' } });

      vi.spyOn(claimsActions, 'lookupProductByArticle').mockResolvedValueOnce({
        success: true,
        product: { id: 'p', sku: '7940', name: 'Topside', category: 'Meat', brand: 'Allana' },
      });
      fireEvent.blur(articleInput, { target: { value: '7940' } });

      // Action failure with error
      vi.spyOn(claimsActions, 'submitInfoRequest').mockResolvedValueOnce({
        success: false,
        claim: null,
        error: 'Failed on server',
      });
      fireEvent.change(screen.getByTestId('shelf-reason-input'), { target: { value: 'Valid reason' } });
      fireEvent.submit(form);
      await waitFor(() => {
        expect(screen.getByTestId('info-form-error').textContent).toContain('Failed on server');
      });

      // Action failure without error
      vi.spyOn(claimsActions, 'submitInfoRequest').mockResolvedValueOnce({
        success: false,
        claim: null,
      });
      fireEvent.submit(form);
      await waitFor(() => {
        expect(screen.getByTestId('info-form-error').textContent).toContain('Failed to submit info request');
      });

      // Action exception Error
      vi.spyOn(claimsActions, 'submitInfoRequest').mockRejectedValueOnce(new Error('Network error'));
      fireEvent.submit(form);
      await waitFor(() => {
        expect(screen.getByTestId('info-form-error').textContent).toContain('Network error');
      });

      // Action exception non-Error string
      vi.spyOn(claimsActions, 'submitInfoRequest').mockRejectedValueOnce('raw-string-rejection');
      fireEvent.submit(form);
      await waitFor(() => {
        expect(screen.getByTestId('info-form-error').textContent).toContain('Submission failed');
      });
    });
  });

  describe('ClaimDetailView', () => {
    it('renders full quality claim details with products schedule and attachments', () => {
      render(<ClaimDetailView claim={mockClaim1} />);
      expect(screen.getByTestId('claim-detail-view')).toBeDefined();
      expect(screen.getByText(/CLM-2026-0001/)).toBeDefined();
      expect(screen.getByText('Temperature Deviation & Damaged Cartons')).toBeDefined();
      expect(screen.getByTestId('claim-products-table-section')).toBeDefined();
      expect(screen.getByTestId('claim-attachments-section')).toBeDefined();
      expect(screen.getByText(/damage-photo-1\.jpg/)).toBeDefined();
      expect(screen.getByText(/qa@lulu.com/)).toBeDefined();
    });

    it('renders resolved claim details with official company response and resolution date', () => {
      render(<ClaimDetailView claim={mockClaimResolved} />);
      expect(screen.getByText(/CN-2026-8910 authorized/)).toBeDefined();
      expect(screen.getByText(/Official Allana Resolution/)).toBeDefined();
    });

    it('renders information request details with shelf life extension block', () => {
      render(<ClaimDetailView claim={mockInfoRequest} />);
      expect(screen.getByTestId('shelf-life-detail-panel')).toBeDefined();
      expect(screen.getByText(/2500\.0000 kg/)).toBeDefined();
      expect(screen.getByText(/Port quarantine congestion/)).toBeDefined();
    });

    it('renders minimal claim with empty fields and handles download error', async () => {
      vi.spyOn(claimsActions, 'getClaimAttachmentPresignedUrl').mockResolvedValueOnce({
        success: false,
        url: null,
        error: 'Presigned download failed',
      });

      const minimalWithAtt: ClaimDTO = {
        ...mockMinimalClaim,
        attachments: [
          {
            id: 'att-err',
            claimId: 'min-1',
            fileName: 'doc.pdf',
            fileUrl: 'claims/doc.pdf',
            fileSizeBytes: 1024,
            createdAt: '2026-01-01T00:00:00Z',
          },
        ],
      };

      render(<ClaimDetailView claim={minimalWithAtt} />);
      const dlBtn = screen.getByTestId('download-attachment-att-err');
      fireEvent.click(dlBtn);

      await waitFor(() => {
        expect(screen.getByText('Presigned download failed')).toBeDefined();
      });
    });

    it('handles successful attachment download in ClaimDetailView', async () => {
      vi.spyOn(claimsActions, 'getClaimAttachmentPresignedUrl').mockResolvedValueOnce({
        success: true,
        url: 'https://r2.allana.com/claims/doc.pdf',
      });

      render(<ClaimDetailView claim={mockClaim1} />);
      const dlBtn = screen.getByTestId('download-attachment-att-1');
      fireEvent.click(dlBtn);

      await waitFor(() => {
        expect(window.open).toHaveBeenCalledWith(
          'https://r2.allana.com/claims/doc.pdf',
          '_blank',
          'noopener,noreferrer'
        );
      });
    });

    it('handles attachment download exception in ClaimDetailView', async () => {
      vi.spyOn(claimsActions, 'getClaimAttachmentPresignedUrl').mockRejectedValueOnce(
        new Error('Network failure')
      );

      render(<ClaimDetailView claim={mockClaim1} />);
      const dlBtn = screen.getByTestId('download-attachment-att-1');
      fireEvent.click(dlBtn);

      await waitFor(() => {
        expect(screen.getByText(/Network error while requesting document download/)).toBeDefined();
      });
    });

    it('handles invalid date strings in ClaimDetailView formatDate', () => {
      const claimWithInvalidDate: ClaimDTO = {
        ...mockMinimalClaim,
        createdAt: 'invalid-iso-date',
      };
      render(<ClaimDetailView claim={claimWithInvalidDate} />);
      expect(screen.getByText(/invalid-iso-date/)).toBeDefined();
    });
  });

  describe('Pages Integration', () => {
    it('renders ClaimsPage when getClaimsList succeeds', async () => {
      vi.spyOn(claimsActions, 'getClaimsList').mockResolvedValueOnce({
        success: true,
        claims: [mockClaim1],
        total: 1,
      });

      const page = await ClaimsPage();
      render(page);
      expect(screen.getByTestId('claims-page')).toBeDefined();
    });

    it('renders ClaimsPage when getClaimsList fails', async () => {
      vi.spyOn(claimsActions, 'getClaimsList').mockResolvedValueOnce({
        success: false,
        claims: [],
        total: 0,
        error: 'Database connection failed',
      });

      const page = await ClaimsPage();
      render(page);
      expect(screen.getByTestId('claims-page')).toBeDefined();
    });

    it('renders NewClaimPage with claimant profile', async () => {
      vi.spyOn(claimsActions, 'getClaimantProfile').mockResolvedValueOnce({
        companyName: 'LuLu Hypermarket',
        userName: 'Rashid',
        userEmail: 'buyer@lulu.com',
      });

      const page = await NewClaimPage();
      render(page);
      expect(screen.getByTestId('new-claim-page')).toBeDefined();
      expect(screen.getByText('Register Quality Claim')).toBeDefined();
    });

    it('renders NewRequestPage with claimant profile', async () => {
      vi.spyOn(claimsActions, 'getClaimantProfile').mockResolvedValueOnce({
        companyName: 'LuLu Hypermarket',
        userName: 'Rashid',
        userEmail: 'buyer@lulu.com',
      });

      const page = await NewRequestPage();
      render(page);
      expect(screen.getByTestId('new-request-page')).toBeDefined();
      expect(screen.getByRole('heading', { level: 1, name: 'Submit Information Request' })).toBeDefined();
    });

    it('renders ClaimDetailPage when claim exists', async () => {
      vi.spyOn(claimsActions, 'getClaimDetails').mockResolvedValueOnce({
        success: true,
        claim: mockClaim1,
      });

      const page = await ClaimDetailPage({ params: Promise.resolve({ id: 'clm-001' }) });
      render(page);
      expect(screen.getByTestId('claim-detail-page')).toBeDefined();
    });

    it('renders not found state on ClaimDetailPage when claim does not exist', async () => {
      vi.spyOn(claimsActions, 'getClaimDetails').mockResolvedValueOnce({
        success: false,
        claim: null,
        error: 'Ticket not found',
      });

      const page = await ClaimDetailPage({ params: Promise.resolve({ id: 'clm-missing' }) });
      render(page);
      expect(screen.getByTestId('claim-not-found')).toBeDefined();
      expect(screen.getByText('Ticket Not Found')).toBeDefined();
    });

    it('renders not found state without custom error message and with success true but null claim', async () => {
      vi.spyOn(claimsActions, 'getClaimDetails').mockResolvedValueOnce({
        success: false,
        claim: null,
      });

      const page1 = await ClaimDetailPage({ params: Promise.resolve({ id: 'clm-missing-1' }) });
      const { unmount } = render(page1);
      expect(screen.getByTestId('claim-not-found')).toBeDefined();
      expect(screen.getByText(/The requested claim ticket could not be found/)).toBeDefined();
      unmount();

      vi.spyOn(claimsActions, 'getClaimDetails').mockResolvedValueOnce({
        success: true,
        claim: null,
      });

      const page2 = await ClaimDetailPage({ params: Promise.resolve({ id: 'clm-missing-2' }) });
      render(page2);
      expect(screen.getByTestId('claim-not-found')).toBeDefined();
    });

    it('generates metadata correctly for ClaimDetailPage', async () => {
      // 1. Found claim
      vi.spyOn(claimsActions, 'getClaimDetails').mockResolvedValueOnce({
        success: true,
        claim: mockClaim1,
      });

      const metaFound = await generateMetadata({ params: Promise.resolve({ id: 'clm-001' }) });
      expect(metaFound.title).toContain('CLM-2026-0001');

      // 2. Missing claim
      vi.spyOn(claimsActions, 'getClaimDetails').mockResolvedValueOnce({
        success: false,
        claim: null,
      });

      const metaNotFound = await generateMetadata({ params: Promise.resolve({ id: 'clm-missing' }) });
      expect(metaNotFound.title).toBe('Claim Details | Allana Customer Portal');
    });
  });
});
