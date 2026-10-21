import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NpdStatusTimeline from '@/components/npd/NpdStatusTimeline';
import NpdDetailModal from '@/components/npd/NpdDetailModal';
import NpdRequestTable from '@/components/npd/NpdRequestTable';
import NpdDashboardView from '@/components/npd/NpdDashboardView';
import CustomizedProductsPage from '@/app/(portal)/customized-products/page';
import * as npdActions from '@/server/actions/npd.actions';
import { CustomProductRequestDTO } from '@/server/actions/npd.actions';

const mockRequestInReview: CustomProductRequestDTO = {
  id: 'npd-1',
  requestNumber: 'NPD-2026-001',
  companyId: 'comp-1',
  companyName: 'LuLu Hypermarket',
  createdById: 'user-1',
  createdByName: 'Ahmed Al-Harbi',
  categoryName: 'Frozen Buffalo Meat',
  targetCountry: 'Saudi Arabia',
  cutSpecification: 'Boneless buffalo topside 95VL',
  recipeNotes: 'Light brine, vacuum block',
  packagingFormat: '450g retail vacuum cube',
  individualPackagingWeight: '450g',
  freezingType: 'BLOCK_FROZEN',
  estimatedFcaPricePerTon: 4800,
  targetVolumeMt: 54,
  targetPriceUsd: 259200,
  isCalibrated: true,
  isMarinated: false,
  isBoneless: true,
  isSkinless: true,
  hasSpecification: true,
  additionalComments: 'Halal certified SFDA standards',
  attachmentUrl: 'https://r2.allana.com/specs/spec-001.pdf',
  status: 'IN_REVIEW',
  managerComments: null,
  createdAt: '2026-03-15T10:00:00.000Z',
  updatedAt: '2026-03-15T10:00:00.000Z',
};

const mockRequestAnalysis: CustomProductRequestDTO = {
  ...mockRequestInReview,
  id: 'npd-2',
  requestNumber: 'NPD-2026-002',
  status: 'ANALYSIS',
  managerComments: 'Plant yield analysis underway for 450g retail sizing.',
};

const mockRequestAccepted: CustomProductRequestDTO = {
  ...mockRequestInReview,
  id: 'npd-3',
  requestNumber: 'NPD-2026-003',
  status: 'ACCEPTED',
  managerComments: 'Approved by Quality Assurance. Production scheduled.',
};

const mockRequestDeclined: CustomProductRequestDTO = {
  ...mockRequestInReview,
  id: 'npd-4',
  requestNumber: 'NPD-2026-004',
  status: 'DECLINED',
  managerComments: 'Cut thickness requirement exceeds blast freezer tolerance.',
};

describe('Module 4: Customized Products & NPD Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('NpdStatusTimeline', () => {
    it('renders In Review state correctly', () => {
      render(<NpdStatusTimeline status="IN_REVIEW" />);
      expect(screen.getByTestId('npd-status-timeline')).toBeInTheDocument();
      expect(screen.getByTestId('timeline-step-IN_REVIEW')).toBeInTheDocument();
      expect(screen.getByTestId('timeline-step-ANALYSIS')).toBeInTheDocument();
      expect(screen.getByTestId('timeline-step-ACCEPTED')).toBeInTheDocument();
    });

    it('renders Under Analysis state correctly', () => {
      render(<NpdStatusTimeline status="ANALYSIS" />);
      const step1 = screen.getByTestId('timeline-step-IN_REVIEW');
      expect(step1).toHaveTextContent('✓');
    });

    it('renders Accepted state correctly', () => {
      render(<NpdStatusTimeline status="ACCEPTED" />);
      const step3 = screen.getByTestId('timeline-step-ACCEPTED');
      expect(step3).toHaveTextContent('Approved for Export Production');
    });

    it('renders Declined state correctly with warning badge', () => {
      render(<NpdStatusTimeline status="DECLINED" />);
      const declinedStep = screen.getByTestId('timeline-step-DECLINED');
      expect(declinedStep).toBeInTheDocument();
      expect(declinedStep).toHaveTextContent('Declined');
      expect(declinedStep).toHaveTextContent('Specification Unviable');
    });
  });

  describe('NpdDetailModal', () => {
    it('returns null if isOpen is false or request is null', () => {
      const { container: c1 } = render(
        <NpdDetailModal request={mockRequestInReview} isOpen={false} onClose={vi.fn()} />
      );
      expect(c1.firstChild).toBeNull();

      const { container: c2 } = render(
        <NpdDetailModal request={null} isOpen={true} onClose={vi.fn()} />
      );
      expect(c2.firstChild).toBeNull();
    });

    it('renders complete ticket details, timeline, criteria badges, and manager comments', () => {
      const onClose = vi.fn();
      render(
        <NpdDetailModal request={mockRequestAnalysis} isOpen={true} onClose={onClose} />
      );

      expect(screen.getByTestId('npd-detail-modal')).toBeInTheDocument();
      expect(screen.getByText('Ticket: NPD-2026-002')).toBeInTheDocument();
      expect(screen.getByTestId('modal-status-badge')).toHaveTextContent('Under Analysis');
      expect(screen.getByTestId('manager-comments-text')).toHaveTextContent(
        'Plant yield analysis underway'
      );
      expect(screen.getByTestId('criteria-calibrated')).toHaveTextContent('✓ Calibrated');
      expect(screen.getByTestId('criteria-marinated')).toHaveTextContent('- Marinated');
      expect(screen.getByTestId('criteria-boneless')).toHaveTextContent('✓ Boneless');
      expect(screen.getByTestId('criteria-skinless')).toHaveTextContent('✓ Skinless / Defatted');
      expect(screen.getByTestId('criteria-spec')).toHaveTextContent('✓ Spec Attached');

      // Attachment link
      const attachLink = screen.getByTestId('modal-attachment-link');
      expect(attachLink).toHaveAttribute('href', 'https://r2.allana.com/specs/spec-001.pdf');

      // Close button
      fireEvent.click(screen.getByTestId('close-npd-modal-btn'));
      expect(onClose).toHaveBeenCalled();
    });

    it('closes when clicking the modal backdrop overlay', () => {
      const onClose = vi.fn();
      render(
        <NpdDetailModal request={mockRequestInReview} isOpen={true} onClose={onClose} />
      );

      const overlay = screen.getByTestId('npd-detail-modal');
      fireEvent.click(overlay);
      expect(onClose).toHaveBeenCalled();
    });

    it('displays fallback text when manager comments are not yet provided', () => {
      render(
        <NpdDetailModal request={mockRequestInReview} isOpen={true} onClose={vi.fn()} />
      );

      expect(screen.getByTestId('manager-comments-text')).toHaveTextContent(
        'R&D team has received your ticket'
      );
    });

    it('renders Accepted and Declined status badges correctly', () => {
      const { rerender } = render(
        <NpdDetailModal request={mockRequestAccepted} isOpen={true} onClose={vi.fn()} />
      );
      expect(screen.getByTestId('modal-status-badge')).toHaveTextContent('Accepted');

      rerender(
        <NpdDetailModal request={mockRequestDeclined} isOpen={true} onClose={vi.fn()} />
      );
      expect(screen.getByTestId('modal-status-badge')).toHaveTextContent('Declined');
    });

    it('handles requests with null criteria, null recipe notes, and null attachment url', () => {
      const requestMinimal: CustomProductRequestDTO = {
        ...mockRequestInReview,
        cutSpecification: null,
        recipeNotes: null,
        packagingFormat: null,
        individualPackagingWeight: null,
        estimatedFcaPricePerTon: null,
        targetVolumeMt: null,
        isCalibrated: false,
        isMarinated: false,
        isBoneless: false,
        isSkinless: false,
        hasSpecification: false,
        attachmentUrl: null,
      };

      render(
        <NpdDetailModal request={requestMinimal} isOpen={true} onClose={vi.fn()} />
      );

      expect(screen.getByTestId('modal-cut-spec')).toHaveTextContent('Standard export primal cut');
      expect(screen.getByText('None specified')).toBeInTheDocument();
      expect(screen.getByText('Pending quotation')).toBeInTheDocument();
      expect(screen.getByText('Sample consignment')).toBeInTheDocument();
      expect(screen.queryByTestId('modal-attachment-link')).not.toBeInTheDocument();
    });
  });

  describe('NpdRequestTable', () => {
    const sampleList = [
      mockRequestInReview,
      mockRequestAnalysis,
      mockRequestAccepted,
      mockRequestDeclined,
    ];

    it('renders list of requests and handles status filter tabs', () => {
      const onSelect = vi.fn();
      render(<NpdRequestTable requests={sampleList} onSelectRequest={onSelect} />);

      expect(screen.getByTestId('npd-request-table-container')).toBeInTheDocument();
      expect(screen.getByTestId('npd-table')).toBeInTheDocument();

      // All 4 rows visible initially
      expect(screen.getByTestId('npd-row-npd-1')).toBeInTheDocument();
      expect(screen.getByTestId('npd-row-npd-2')).toBeInTheDocument();
      expect(screen.getByTestId('npd-row-npd-3')).toBeInTheDocument();
      expect(screen.getByTestId('npd-row-npd-4')).toBeInTheDocument();

      // Filter by Accepted
      fireEvent.click(screen.getByTestId('status-tab-ACCEPTED'));
      expect(screen.queryByTestId('npd-row-npd-1')).not.toBeInTheDocument();
      expect(screen.getByTestId('npd-row-npd-3')).toBeInTheDocument();

      // Filter by Analysis
      fireEvent.click(screen.getByTestId('status-tab-ANALYSIS'));
      expect(screen.getByTestId('npd-row-npd-2')).toBeInTheDocument();

      // Filter by In Review
      fireEvent.click(screen.getByTestId('status-tab-IN_REVIEW'));
      expect(screen.getByTestId('npd-row-npd-1')).toBeInTheDocument();

      // Filter by Declined
      fireEvent.click(screen.getByTestId('status-tab-DECLINED'));
      expect(screen.getByTestId('npd-row-npd-4')).toBeInTheDocument();

      // Filter back to ALL
      fireEvent.click(screen.getByTestId('status-tab-ALL'));
      expect(screen.getByTestId('npd-row-npd-1')).toBeInTheDocument();
    });

    it('filters requests by search input term', () => {
      render(<NpdRequestTable requests={sampleList} onSelectRequest={vi.fn()} />);

      const searchInput = screen.getByTestId('npd-search-input');
      fireEvent.change(searchInput, { target: { value: 'NPD-2026-003' } });

      expect(screen.getByTestId('npd-row-npd-3')).toBeInTheDocument();
      expect(screen.queryByTestId('npd-row-npd-1')).not.toBeInTheDocument();
    });

    it('displays empty state when no requests match filter', () => {
      render(<NpdRequestTable requests={sampleList} onSelectRequest={vi.fn()} />);

      const searchInput = screen.getByTestId('npd-search-input');
      fireEvent.change(searchInput, { target: { value: 'NonExistentCutXYZ' } });

      expect(screen.getByTestId('npd-empty-state')).toBeInTheDocument();
      expect(screen.getByText('No requests match your current search and status filters.')).toBeInTheDocument();
      expect(screen.getByTestId('empty-create-npd-btn')).toHaveAttribute(
        'href',
        '/customized-products/new'
      );
    });

    it('displays initial empty state when requests list is completely empty', () => {
      render(<NpdRequestTable requests={[]} onSelectRequest={vi.fn()} />);

      expect(screen.getByTestId('npd-empty-state')).toBeInTheDocument();
      expect(screen.getByText('You have not submitted any customized NPD product requests yet.')).toBeInTheDocument();
    });

    it('renders placeholder dash and fallback cut specification when volume, price, or spec are null', () => {
      const minimalItem: CustomProductRequestDTO = {
        ...mockRequestInReview,
        id: 'npd-nulls',
        cutSpecification: null,
        targetVolumeMt: null,
        estimatedFcaPricePerTon: null,
      };

      render(<NpdRequestTable requests={[minimalItem]} onSelectRequest={vi.fn()} />);

      expect(screen.getByText('Custom cut specification')).toBeInTheDocument();
      const dashes = screen.getAllByText('-');
      expect(dashes.length).toBeGreaterThanOrEqual(2);
    });

    it('triggers onSelectRequest when clicking row or Details button', () => {
      const onSelect = vi.fn();
      render(<NpdRequestTable requests={sampleList} onSelectRequest={onSelect} />);

      fireEvent.click(screen.getByTestId('npd-row-npd-1'));
      expect(onSelect).toHaveBeenCalledWith(mockRequestInReview);

      fireEvent.click(screen.getByTestId('view-details-btn-npd-2'));
      expect(onSelect).toHaveBeenCalledWith(mockRequestAnalysis);
    });
  });

  describe('NpdDashboardView & CustomizedProductsPage', () => {
    it('manages modal opening and closing on row selection in NpdDashboardView', () => {
      render(<NpdDashboardView initialRequests={[mockRequestInReview]} />);

      expect(screen.getByTestId('npd-dashboard-title')).toHaveTextContent(
        'Customized Products & NPD Requests'
      );
      expect(screen.getByTestId('create-npd-request-btn')).toHaveAttribute(
        'href',
        '/customized-products/new'
      );

      // Modal closed initially
      expect(screen.queryByTestId('npd-detail-modal')).not.toBeInTheDocument();

      // Click row opens modal
      fireEvent.click(screen.getByTestId('npd-row-npd-1'));
      expect(screen.getByTestId('npd-detail-modal')).toBeInTheDocument();

      // Close modal
      fireEvent.click(screen.getByTestId('close-npd-modal-btn'));
      expect(screen.queryByTestId('npd-detail-modal')).not.toBeInTheDocument();
    });

    it('renders CustomizedProductsPage server component and fetches requests', async () => {
      vi.spyOn(npdActions, 'getCustomProductRequests').mockResolvedValueOnce({
        success: true,
        requests: [mockRequestInReview],
        total: 1,
      });

      const element = await CustomizedProductsPage();
      render(element);

      expect(screen.getByTestId('customized-products-page')).toBeInTheDocument();
      expect(screen.getByTestId('req-number-npd-1')).toHaveTextContent('NPD-2026-001');
    });

    it('renders CustomizedProductsPage with fallback requests when getCustomProductRequests returns empty or fails', async () => {
      vi.spyOn(npdActions, 'getCustomProductRequests').mockResolvedValueOnce({
        success: false,
        requests: [],
        total: 0,
      });

      const element = await CustomizedProductsPage();
      render(element);

      expect(screen.getByTestId('customized-products-page')).toBeInTheDocument();
      expect(screen.getByText('NPD-2026-014')).toBeInTheDocument();
    });
  });
});
