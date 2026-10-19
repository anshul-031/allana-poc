import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CustomProductWizard from '@/components/npd/CustomProductWizard';
import NewCustomProductPage from '@/app/(portal)/customized-products/new/page';
import * as npdActions from '@/server/actions/npd.actions';
import { CustomProductRequestDTO } from '@/server/actions/npd.actions';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

const mockCreatedRequest: CustomProductRequestDTO = {
  id: 'npd-new-123',
  requestNumber: 'NPD-2026-009',
  companyId: 'comp-1',
  companyName: 'LuLu Hypermarket',
  createdById: 'user-1',
  createdByName: 'Ahmed Al-Harbi',
  categoryName: 'Frozen Buffalo Meat',
  targetCountry: 'Saudi Arabia',
  cutSpecification: 'Boneless buffalo topside 95VL with fat trimmed to 3mm',
  recipeNotes: 'Marinated in 2% sea salt brine',
  packagingFormat: '450g retail vacuum cube',
  individualPackagingWeight: '450g',
  freezingType: 'BLOCK_FROZEN',
  estimatedFcaPricePerTon: 4800,
  targetVolumeMt: 28,
  targetPriceUsd: 134400,
  isCalibrated: true,
  isMarinated: true,
  isBoneless: true,
  isSkinless: true,
  hasSpecification: true,
  additionalComments: 'Halal slaughter according to SFDA',
  attachmentUrl: 'https://r2.allana.com/specs/diecut.pdf',
  status: 'IN_REVIEW',
  managerComments: null,
  createdAt: '2026-03-15T10:00:00.000Z',
  updatedAt: '2026-03-15T10:00:00.000Z',
};

describe('FEAT-4.1 CustomProductWizard Component & New NPD Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('CustomProductWizard', () => {
    it('walks through all 4 wizard steps and successfully submits an NPD request', async () => {
      vi.spyOn(npdActions, 'createCustomProductRequest').mockResolvedValueOnce({
        success: true,
        request: mockCreatedRequest,
      });

      const onSuccess = vi.fn();
      render(<CustomProductWizard onSuccess={onSuccess} />);

      // Step 1: Category & Market
      expect(screen.getByTestId('wizard-step-1-content')).toBeInTheDocument();
      fireEvent.change(screen.getByTestId('input-category-name'), {
        target: { value: 'Frozen Buffalo Meat' },
      });
      fireEvent.change(screen.getByTestId('input-target-country'), {
        target: { value: 'Saudi Arabia' },
      });

      fireEvent.click(screen.getByTestId('wizard-next-btn'));

      // Step 2: Cut & Processing
      expect(screen.getByTestId('wizard-step-2-content')).toBeInTheDocument();

      // Next button disabled when cutSpecification < 5 chars
      const nextBtnStep2 = screen.getByTestId('wizard-next-btn');
      expect(nextBtnStep2).toBeDisabled();

      fireEvent.change(screen.getByTestId('input-cut-specification'), {
        target: { value: 'Boneless buffalo topside 95VL with fat trimmed to 3mm' },
      });
      expect(nextBtnStep2).not.toBeDisabled();

      fireEvent.change(screen.getByTestId('input-recipe-notes'), {
        target: { value: 'Marinated in 2% sea salt brine' },
      });
      fireEvent.change(screen.getByTestId('input-freezing-type'), {
        target: { value: 'BLOCK_FROZEN' },
      });

      // Toggle checkboxes
      fireEvent.click(screen.getByTestId('checkbox-calibrated'));
      fireEvent.click(screen.getByTestId('checkbox-marinated'));
      fireEvent.click(screen.getByTestId('checkbox-spec'));

      fireEvent.click(screen.getByTestId('wizard-next-btn'));

      // Step 3: Packaging & Target Commercials
      expect(screen.getByTestId('wizard-step-3-content')).toBeInTheDocument();
      fireEvent.change(screen.getByTestId('input-packaging-format'), {
        target: { value: '450g retail vacuum cube' },
      });
      fireEvent.change(screen.getByTestId('input-pkg-weight'), {
        target: { value: '450g' },
      });
      fireEvent.change(screen.getByTestId('input-fca-price'), {
        target: { value: '4800' },
      });
      fireEvent.change(screen.getByTestId('input-target-volume'), {
        target: { value: '28' },
      });

      fireEvent.click(screen.getByTestId('wizard-next-btn'));

      // Step 4: Artwork & Review
      expect(screen.getByTestId('wizard-step-4-content')).toBeInTheDocument();

      // Test previous step navigation
      fireEvent.click(screen.getByTestId('wizard-prev-btn'));
      expect(screen.getByTestId('wizard-step-3-content')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('wizard-next-btn'));

      // File upload simulation
      const fileInput = screen.getByTestId('file-upload-input');
      const testFile = new File(['mock content'], 'packaging-diecut.pdf', {
        type: 'application/pdf',
      });
      fireEvent.change(fileInput, { target: { files: [testFile] } });

      await waitFor(() => {
        expect(screen.getByTestId('uploaded-file-name')).toHaveTextContent(
          'packaging-diecut.pdf'
        );
      });

      fireEvent.change(screen.getByTestId('input-additional-comments'), {
        target: { value: 'Halal slaughter according to SFDA' },
      });

      // Submit
      fireEvent.click(screen.getByTestId('wizard-submit-btn'));

      await waitFor(() => {
        expect(npdActions.createCustomProductRequest).toHaveBeenCalledWith(
          expect.objectContaining({
            categoryName: 'Frozen Buffalo Meat',
            targetCountry: 'Saudi Arabia',
            cutSpecification: 'Boneless buffalo topside 95VL with fat trimmed to 3mm',
            recipeNotes: 'Marinated in 2% sea salt brine',
            packagingFormat: '450g retail vacuum cube',
            individualPackagingWeight: '450g',
            freezingType: 'BLOCK_FROZEN',
            estimatedFcaPricePerTon: 4800,
            targetVolumeMt: 28,
            targetPriceUsd: 134400,
            isCalibrated: true,
            isMarinated: true,
            hasSpecification: true,
            additionalComments: 'Halal slaughter according to SFDA',
          })
        );
      });

      expect(onSuccess).toHaveBeenCalledWith(mockCreatedRequest);

      // Verify success screen
      expect(screen.getByTestId('npd-success-screen')).toBeInTheDocument();
      expect(screen.getByTestId('assigned-ticket-number')).toHaveTextContent('NPD-2026-009');
      expect(screen.getByTestId('track-status-btn')).toHaveAttribute(
        'href',
        '/customized-products'
      );

      // Click "Submit Another Request"
      fireEvent.click(screen.getByTestId('submit-another-btn'));
      expect(screen.getByTestId('wizard-step-1-content')).toBeInTheDocument();
    });

    it('displays error banner when createCustomProductRequest returns failure', async () => {
      vi.spyOn(npdActions, 'createCustomProductRequest').mockResolvedValueOnce({
        success: false,
        request: null,
        error: 'Active company context required',
      });

      render(<CustomProductWizard />);

      // Navigate to step 4
      fireEvent.click(screen.getByTestId('wizard-next-btn')); // to step 2
      fireEvent.change(screen.getByTestId('input-cut-specification'), {
        target: { value: 'Valid cut specification for test' },
      });
      fireEvent.click(screen.getByTestId('wizard-next-btn')); // to step 3
      fireEvent.click(screen.getByTestId('wizard-next-btn')); // to step 4

      // Submit
      fireEvent.click(screen.getByTestId('wizard-submit-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('wizard-error-banner')).toHaveTextContent(
          'Active company context required'
        );
      });
    });

    it('handles file upload when no file is selected (change event with empty files list)', () => {
      render(<CustomProductWizard />);

      // Navigate to step 4
      fireEvent.click(screen.getByTestId('wizard-next-btn'));
      fireEvent.change(screen.getByTestId('input-cut-specification'), {
        target: { value: 'Valid cut specification for test' },
      });
      fireEvent.click(screen.getByTestId('wizard-next-btn'));
      fireEvent.click(screen.getByTestId('wizard-next-btn'));

      const fileInput = screen.getByTestId('file-upload-input');
      fireEvent.change(fileInput, { target: { files: [] } });

      expect(screen.queryByTestId('uploaded-file-name')).not.toBeInTheDocument();
    });

    it('handles empty pricing and volume gracefully on submission', async () => {
      vi.spyOn(npdActions, 'createCustomProductRequest').mockResolvedValueOnce({
        success: true,
        request: mockCreatedRequest,
      });

      render(<CustomProductWizard />);

      // Step 1
      fireEvent.click(screen.getByTestId('wizard-next-btn'));
      // Step 2
      fireEvent.change(screen.getByTestId('input-cut-specification'), {
        target: { value: 'Valid specification text' },
      });
      fireEvent.click(screen.getByTestId('wizard-next-btn'));
      // Step 3: clear price and volume
      fireEvent.change(screen.getByTestId('input-fca-price'), {
        target: { value: '' },
      });
      fireEvent.change(screen.getByTestId('input-target-volume'), {
        target: { value: '' },
      });
      fireEvent.click(screen.getByTestId('wizard-next-btn'));
      // Step 4
      fireEvent.click(screen.getByTestId('wizard-submit-btn'));

      await waitFor(() => {
        expect(npdActions.createCustomProductRequest).toHaveBeenCalledWith(
          expect.objectContaining({
            estimatedFcaPricePerTon: undefined,
            targetVolumeMt: undefined,
            targetPriceUsd: undefined,
          })
        );
      });
    });
  });

  describe('NewCustomProductPage', () => {
    it('renders breadcrumbs, page title, back link, and CustomProductWizard', () => {
      render(<NewCustomProductPage />);

      expect(screen.getByTestId('new-custom-product-page')).toBeInTheDocument();
      expect(screen.getByTestId('npd-wizard-breadcrumbs')).toBeInTheDocument();
      expect(screen.getByText('New Product Development (NPD) Wizard')).toBeInTheDocument();
      expect(screen.getByTestId('custom-product-wizard')).toBeInTheDocument();
    });
  });
});
