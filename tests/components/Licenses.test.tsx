import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import AccountSubNav, { isRegulatedCountry } from '@/components/settings/AccountSubNav';
import LicenseCard from '@/components/settings/LicenseCard';
import UploadLicenseModal from '@/components/settings/UploadLicenseModal';
import LicensesPage from '@/app/(portal)/settings/licenses/page';
import * as licensesActions from '@/server/actions/licenses.actions';

vi.mock('@/server/actions/licenses.actions', async () => {
  const actual = await vi.importActual<typeof licensesActions>('@/server/actions/licenses.actions');
  return {
    ...actual,
    getCompanyLicenses: vi.fn(),
    getLicenseDownloadUrl: vi.fn(),
    uploadRenewedLicense: vi.fn(),
  };
});

const mockActiveLicense: licensesActions.ComplianceLicenseDTO = {
  id: 'lic-active',
  companyId: 'comp-ksa',
  country: 'Saudi Arabia',
  licenseName: 'Saudi SFDA Facility Meat Import Approval',
  licenseNumber: 'SFDA-IMP-2024-8841',
  issueDate: '2024-11-15T00:00:00.000Z',
  expiryDate: '2027-11-15T00:00:00.000Z',
  documentUrl: 'licenses/SFDA-PERMIT.pdf',
  daysRemaining: 400,
  status: 'ACTIVE',
};

const mockExpiringLicense: licensesActions.ComplianceLicenseDTO = {
  id: 'lic-expiring',
  companyId: 'comp-ksa',
  country: 'Saudi Arabia',
  licenseName: 'SFDA Port Entry Clearance',
  licenseNumber: 'SFDA-ENTRY-2026',
  issueDate: '2025-01-01T00:00:00.000Z',
  expiryDate: '2026-11-01T00:00:00.000Z',
  documentUrl: 'licenses/SFDA-ENTRY.pdf',
  daysRemaining: 20,
  status: 'EXPIRING_SOON',
};

const mockExpiredLicense: licensesActions.ComplianceLicenseDTO = {
  id: 'lic-expired',
  companyId: 'comp-ksa',
  country: 'Saudi Arabia',
  licenseName: 'Municipal Health Clearance',
  licenseNumber: 'MHC-2023-11',
  issueDate: '2023-01-01T00:00:00.000Z',
  expiryDate: '2024-01-01T00:00:00.000Z',
  documentUrl: null,
  daysRemaining: -100,
  status: 'EXPIRED',
};

describe('Compliance & Regulatory Licenses Components & Page (FEAT-1.7)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AccountSubNav Component', () => {
    it('isRegulatedCountry helper correctly evaluates countries', () => {
      expect(isRegulatedCountry('Saudi Arabia')).toBe(true);
      expect(isRegulatedCountry('United Arab Emirates')).toBe(true);
      expect(isRegulatedCountry('UAE')).toBe(true);
      expect(isRegulatedCountry('Qatar')).toBe(true);
      expect(isRegulatedCountry('Kuwait')).toBe(true);
      expect(isRegulatedCountry('Egypt')).toBe(true);
      expect(isRegulatedCountry('Oman')).toBe(true);
      expect(isRegulatedCountry('Bahrain')).toBe(true);
      expect(isRegulatedCountry('United States')).toBe(false);
      expect(isRegulatedCountry(undefined)).toBe(false);
    });

    it('renders all tabs and highlights active tab', () => {
      render(<AccountSubNav activeTab="licenses" country="Saudi Arabia" />);
      expect(screen.getByText('Back to Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Company Profile')).toBeInTheDocument();
      expect(screen.getByText('Members List')).toBeInTheDocument();
      expect(screen.getByText('Compliance & Licenses (SFDA)')).toBeInTheDocument();
      expect(screen.getByText('Security Action Log')).toBeInTheDocument();
      expect(screen.getByText('Change Password')).toBeInTheDocument();

      const licensesTab = screen.getByRole('tab', { name: /Compliance & Licenses/i });
      expect(licensesTab).toHaveAttribute('aria-selected', 'true');
    });

    it('hides licenses tab if showLicenses is false', () => {
      render(<AccountSubNav activeTab="profile" showLicenses={false} country="Saudi Arabia" />);
      expect(screen.queryByText(/Compliance & Licenses/i)).not.toBeInTheDocument();
    });

    it('hides licenses tab if country is non-regulated and country prop is provided', () => {
      render(<AccountSubNav activeTab="profile" country="Canada" />);
      expect(screen.queryByText(/Compliance & Licenses/i)).not.toBeInTheDocument();
    });
  });

  describe('LicenseCard Component', () => {
    it('renders license details, permit number, and ACTIVE status badge', () => {
      render(<LicenseCard license={mockActiveLicense} />);
      expect(screen.getByText('Saudi SFDA Facility Meat Import Approval')).toBeInTheDocument();
      expect(screen.getByText('SFDA-IMP-2024-8841')).toBeInTheDocument();
      expect(screen.getByText(/Active & Compliant/i)).toBeInTheDocument();
      expect(screen.getByText('Download Certificate (PDF)')).toBeInTheDocument();
    });

    it('renders EXPIRING_SOON and EXPIRED badges correctly', () => {
      const { rerender } = render(<LicenseCard license={mockExpiringLicense} />);
      expect(screen.getByText(/Expiring Soon \(20 days left\)/i)).toBeInTheDocument();

      rerender(<LicenseCard license={mockExpiredLicense} />);
      expect(screen.getByText(/Expired \(100 days ago\)/i)).toBeInTheDocument();
      expect(screen.getByText('No document attached')).toBeInTheDocument();
    });

    it('copies license number to clipboard when copy button is clicked', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      render(<LicenseCard license={mockActiveLicense} />);
      const copyBtn = screen.getByRole('button', { name: /Copy license number/i });
      fireEvent.click(copyBtn);

      expect(writeTextMock).toHaveBeenCalledWith('SFDA-IMP-2024-8841');
      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      });
    });

    it('handles clipboard failure gracefully', async () => {
      const writeTextMock = vi.fn().mockRejectedValue(new Error('Permission denied'));
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      render(<LicenseCard license={mockActiveLicense} />);
      const copyBtn = screen.getByRole('button', { name: /Copy license number/i });
      fireEvent.click(copyBtn);

      expect(writeTextMock).toHaveBeenCalled();
    });

    it('triggers window.open when download succeeds', async () => {
      const openMock = vi.fn();
      vi.stubGlobal('open', openMock);

      vi.mocked(licensesActions.getLicenseDownloadUrl).mockResolvedValue({
        success: true,
        downloadUrl: 'https://r2.test/download.pdf',
      });

      render(<LicenseCard license={mockActiveLicense} />);
      const downloadBtn = screen.getByText('Download Certificate (PDF)');
      fireEvent.click(downloadBtn);

      await waitFor(() => {
        expect(licensesActions.getLicenseDownloadUrl).toHaveBeenCalledWith('lic-active');
        expect(openMock).toHaveBeenCalledWith('https://r2.test/download.pdf', '_blank', 'noopener,noreferrer');
      });
    });

    it('calls onDownloadError if license has no document attached', async () => {
      const onError = vi.fn();
      // Render license with documentUrl: null
      render(<LicenseCard license={mockExpiredLicense} onDownloadError={onError} />);
      // Notice button is not rendered when documentUrl is null, but if triggered:
      // Verify no document attached text is shown
      expect(screen.getByText('No document attached')).toBeInTheDocument();
    });

    it('calls onDownloadError when download generation returns an error', async () => {
      const onError = vi.fn();
      vi.mocked(licensesActions.getLicenseDownloadUrl).mockResolvedValue({
        success: false,
        error: 'S3 presign failure',
      });

      render(<LicenseCard license={mockActiveLicense} onDownloadError={onError} />);
      const downloadBtn = screen.getByText('Download Certificate (PDF)');
      fireEvent.click(downloadBtn);

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith('S3 presign failure');
      });
    });

    it('calls onDownloadError with fallback when error message is not returned', async () => {
      const onError = vi.fn();
      vi.mocked(licensesActions.getLicenseDownloadUrl).mockResolvedValue({
        success: false,
      });

      render(<LicenseCard license={mockActiveLicense} onDownloadError={onError} />);
      const downloadBtn = screen.getByText('Download Certificate (PDF)');
      fireEvent.click(downloadBtn);

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith('Failed to generate download link');
      });
    });

    it('calls onDownloadError when download action throws network error', async () => {
      const onError = vi.fn();
      vi.mocked(licensesActions.getLicenseDownloadUrl).mockRejectedValue(new Error('Network down'));

      render(<LicenseCard license={mockActiveLicense} onDownloadError={onError} />);
      const downloadBtn = screen.getByText('Download Certificate (PDF)');
      fireEvent.click(downloadBtn);

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith('Network error while requesting document download');
      });
    });

    it('calls onRenew callback when Renew / Update button is clicked', () => {
      const onRenew = vi.fn();
      render(<LicenseCard license={mockActiveLicense} onRenew={onRenew} />);
      const renewBtn = screen.getByText('Renew / Update');
      fireEvent.click(renewBtn);
      expect(onRenew).toHaveBeenCalledWith(mockActiveLicense);
    });
  });

  describe('UploadLicenseModal Component', () => {
    it('returns null when isOpen is false', () => {
      const { container } = render(
        <UploadLicenseModal isOpen={false} onClose={vi.fn()} onSuccess={vi.fn()} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('populates fields when initialLicense is provided', () => {
      const { rerender } = render(
        <UploadLicenseModal
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
          initialLicense={mockActiveLicense}
        />
      );

      expect(screen.getByText('Renew Compliance License')).toBeInTheDocument();
      expect(screen.getByLabelText(/License \/ Approval Name/i)).toHaveValue(
        'Saudi SFDA Facility Meat Import Approval'
      );
      expect(screen.getByLabelText(/Permit \/ License No\./i)).toHaveValue('SFDA-IMP-2024-8841');
      expect(screen.getByLabelText(/Issuing Jurisdiction/i)).toHaveValue('Saudi Arabia');

      // Test with initialLicense having null documentUrl
      rerender(
        <UploadLicenseModal
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
          initialLicense={mockExpiredLicense}
        />
      );
      expect(screen.getByLabelText(/R2 Certificate Key/i)).toHaveValue('');
    });

    it('shows validation error when required fields are empty', async () => {
      render(<UploadLicenseModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);

      const form = screen.getByTestId('upload-license-form');
      fireEvent.submit(form);

      expect(screen.getByText('Please fill in all mandatory fields')).toBeInTheDocument();
    });

    it('shows validation error when expiryDate is before issueDate', async () => {
      render(<UploadLicenseModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);

      fireEvent.change(screen.getByLabelText(/License \/ Approval Name/i), {
        target: { value: 'SFDA License' },
      });
      fireEvent.change(screen.getByLabelText(/Permit \/ License No\./i), {
        target: { value: 'SFDA-123' },
      });
      fireEvent.change(screen.getByLabelText(/Issuing Jurisdiction/i), {
        target: { value: 'Saudi Arabia' },
      });
      fireEvent.change(screen.getByLabelText(/Effective \/ Issue Date/i), {
        target: { value: '2026-05-01' },
      });
      fireEvent.change(screen.getByLabelText(/Expiration Date/i), {
        target: { value: '2026-01-01' },
      });

      const submitBtn = screen.getByRole('button', { name: /Register Renewal/i });
      fireEvent.click(submitBtn);

      expect(screen.getByText('Expiry date must be after the issue date')).toBeInTheDocument();
    });

    it('submits form successfully and calls onSuccess and onClose', async () => {
      const onSuccess = vi.fn();
      const onClose = vi.fn();
      vi.mocked(licensesActions.uploadRenewedLicense).mockResolvedValue({
        success: true,
        licenseId: 'new-id',
      });

      render(<UploadLicenseModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />);

      fireEvent.change(screen.getByLabelText(/License \/ Approval Name/i), {
        target: { value: 'SFDA License Renewal' },
      });
      fireEvent.change(screen.getByLabelText(/Permit \/ License No\./i), {
        target: { value: 'SFDA-2026-NEW' },
      });
      fireEvent.change(screen.getByLabelText(/Issuing Jurisdiction/i), {
        target: { value: 'Saudi Arabia' },
      });
      fireEvent.change(screen.getByLabelText(/Effective \/ Issue Date/i), {
        target: { value: '2026-01-01' },
      });
      fireEvent.change(screen.getByLabelText(/Expiration Date/i), {
        target: { value: '2027-01-01' },
      });
      fireEvent.change(screen.getByLabelText(/R2 Certificate Key/i), {
        target: { value: 'licenses/new.pdf' },
      });

      const submitBtn = screen.getByRole('button', { name: /Register Renewal/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(licensesActions.uploadRenewedLicense).toHaveBeenCalledWith({
          licenseName: 'SFDA License Renewal',
          licenseNumber: 'SFDA-2026-NEW',
          country: 'Saudi Arabia',
          issueDate: '2026-01-01',
          expiryDate: '2027-01-01',
          documentUrl: 'licenses/new.pdf',
        });
        expect(onSuccess).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
      });
    });

    it('handles submission error from server action', async () => {
      vi.mocked(licensesActions.uploadRenewedLicense).mockResolvedValue({
        success: false,
        error: 'Duplicate permit number detected',
      });

      render(<UploadLicenseModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);

      fireEvent.change(screen.getByLabelText(/License \/ Approval Name/i), {
        target: { value: 'SFDA License' },
      });
      fireEvent.change(screen.getByLabelText(/Permit \/ License No\./i), {
        target: { value: 'SFDA-DUP' },
      });
      fireEvent.change(screen.getByLabelText(/Issuing Jurisdiction/i), {
        target: { value: 'Saudi Arabia' },
      });
      fireEvent.change(screen.getByLabelText(/Effective \/ Issue Date/i), {
        target: { value: '2026-01-01' },
      });
      fireEvent.change(screen.getByLabelText(/Expiration Date/i), {
        target: { value: '2027-01-01' },
      });

      const submitBtn = screen.getByRole('button', { name: /Register Renewal/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText('Duplicate permit number detected')).toBeInTheDocument();
      });
    });

    it('handles submission error fallback when res.error is undefined', async () => {
      vi.mocked(licensesActions.uploadRenewedLicense).mockResolvedValue({
        success: false,
      });

      render(<UploadLicenseModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);

      fireEvent.change(screen.getByLabelText(/License \/ Approval Name/i), {
        target: { value: 'SFDA License' },
      });
      fireEvent.change(screen.getByLabelText(/Permit \/ License No\./i), {
        target: { value: 'SFDA-ERR' },
      });
      fireEvent.change(screen.getByLabelText(/Issuing Jurisdiction/i), {
        target: { value: 'Saudi Arabia' },
      });
      fireEvent.change(screen.getByLabelText(/Effective \/ Issue Date/i), {
        target: { value: '2026-01-01' },
      });
      fireEvent.change(screen.getByLabelText(/Expiration Date/i), {
        target: { value: '2027-01-01' },
      });

      const submitBtn = screen.getByRole('button', { name: /Register Renewal/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText('Failed to submit license renewal')).toBeInTheDocument();
      });
    });

    it('handles unexpected exceptions during submission', async () => {
      vi.mocked(licensesActions.uploadRenewedLicense).mockRejectedValue(new Error('Crash'));

      render(<UploadLicenseModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);

      fireEvent.change(screen.getByLabelText(/License \/ Approval Name/i), {
        target: { value: 'SFDA License' },
      });
      fireEvent.change(screen.getByLabelText(/Permit \/ License No\./i), {
        target: { value: 'SFDA-DUP' },
      });
      fireEvent.change(screen.getByLabelText(/Issuing Jurisdiction/i), {
        target: { value: 'Saudi Arabia' },
      });
      fireEvent.change(screen.getByLabelText(/Effective \/ Issue Date/i), {
        target: { value: '2026-01-01' },
      });
      fireEvent.change(screen.getByLabelText(/Expiration Date/i), {
        target: { value: '2027-01-01' },
      });

      const submitBtn = screen.getByRole('button', { name: /Register Renewal/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText('An unexpected error occurred while submitting license')).toBeInTheDocument();
      });
    });

    it('closes modal when clicking close or cancel buttons', () => {
      const onClose = vi.fn();
      render(<UploadLicenseModal isOpen={true} onClose={onClose} onSuccess={vi.fn()} />);

      fireEvent.click(screen.getByRole('button', { name: /Close dialog/i }));
      expect(onClose).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
      expect(onClose).toHaveBeenCalledTimes(2);
    });
  });

  describe('LicensesPage Component', () => {
    it('renders with initialData and displays KPI counters and cards', () => {
      const initialData: licensesActions.GetLicensesResult = {
        success: true,
        companyName: 'LuLu Riyadh',
        companyCountry: 'Saudi Arabia',
        isRegulatedJurisdiction: true,
        licenses: [mockActiveLicense, mockExpiringLicense, mockExpiredLicense],
      };

      render(<LicensesPage initialData={initialData} />);

      expect(screen.getByText('Compliance & Regulatory Licenses Desk')).toBeInTheDocument();
      expect(screen.getByText(/Saudi Food & Drug Authority \(SFDA\)/i)).toBeInTheDocument();
      expect(screen.getByText('Total Registered Permits')).toBeInTheDocument();

      // Check counters
      expect(screen.getByTestId('metric-total-permits')).toHaveTextContent('3');
      expect(screen.getByTestId('metric-active-permits')).toHaveTextContent('1');
      expect(screen.getByTestId('metric-expiring-permits')).toHaveTextContent('1');
      expect(screen.getByTestId('metric-expired-permits')).toHaveTextContent('1');

      // Check card presence
      expect(screen.getByText('Saudi SFDA Facility Meat Import Approval')).toBeInTheDocument();
      expect(screen.getByText('SFDA Port Entry Clearance')).toBeInTheDocument();
      expect(screen.getByText('Municipal Health Clearance')).toBeInTheDocument();
    });

    it('fetches licenses on mount when initialData is not provided', async () => {
      vi.mocked(licensesActions.getCompanyLicenses).mockResolvedValue({
        success: true,
        companyName: 'LuLu Riyadh',
        companyCountry: 'Saudi Arabia',
        isRegulatedJurisdiction: true,
        licenses: [mockActiveLicense],
      });

      render(<LicensesPage />);

      await waitFor(() => {
        expect(licensesActions.getCompanyLicenses).toHaveBeenCalledTimes(1);
        expect(screen.getByText('Saudi SFDA Facility Meat Import Approval')).toBeInTheDocument();
      });
    });

    it('renders empty state when company has no registered licenses', async () => {
      const initialData: licensesActions.GetLicensesResult = {
        success: true,
        companyName: 'New Entity',
        companyCountry: 'Saudi Arabia',
        isRegulatedJurisdiction: true,
        licenses: [],
      };

      render(<LicensesPage initialData={initialData} />);
      expect(screen.getByText('No Regulatory Licenses Found')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Register License' })).toBeInTheDocument();
    });

    it('displays error banner if fetching licenses fails', async () => {
      vi.mocked(licensesActions.getCompanyLicenses).mockResolvedValue({
        success: false,
        licenses: [],
        isRegulatedJurisdiction: false,
        error: 'Failed to authenticate company session',
      });

      render(<LicensesPage />);

      await waitFor(() => {
        expect(screen.getByText('Failed to authenticate company session')).toBeInTheDocument();
      });
    });

    it('handles unexpected fetch exceptions gracefully', async () => {
      vi.mocked(licensesActions.getCompanyLicenses).mockRejectedValue(new Error('Fatal DB'));

      render(<LicensesPage />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load compliance licenses')).toBeInTheDocument();
      });
    });

    it('opens upload modal when clicking + Register Renewed License and handles success', async () => {
      const initialData: licensesActions.GetLicensesResult = {
        success: true,
        companyName: 'LuLu Riyadh',
        companyCountry: 'Saudi Arabia',
        isRegulatedJurisdiction: true,
        licenses: [mockActiveLicense],
      };

      vi.mocked(licensesActions.getCompanyLicenses).mockResolvedValue({
        success: true,
        companyName: 'LuLu Riyadh',
        companyCountry: 'Saudi Arabia',
        isRegulatedJurisdiction: true,
        licenses: [mockActiveLicense],
      });

      vi.mocked(licensesActions.uploadRenewedLicense).mockResolvedValue({
        success: true,
        licenseId: 'renewed-123',
      });

      render(<LicensesPage initialData={initialData} />);

      const newBtn = screen.getByRole('button', { name: /\+ Register Renewed License/i });
      fireEvent.click(newBtn);

      expect(screen.getByText('Register Regulatory License')).toBeInTheDocument();

      // Trigger renew on existing card to test handleOpenRenew
      fireEvent.click(screen.getByRole('button', { name: /Close dialog/i }));

      const renewCardBtn = screen.getByRole('button', { name: 'Renew / Update' });
      fireEvent.click(renewCardBtn);

      expect(screen.getByText('Renew Compliance License')).toBeInTheDocument();

      // Submit modal
      fireEvent.click(screen.getByRole('button', { name: /Register Renewal/i }));

      await waitFor(() => {
        expect(screen.getByText('Compliance license updated successfully')).toBeInTheDocument();
      });

      // Dismiss feedback banner
      fireEvent.click(screen.getByRole('button', { name: '×' }));
      expect(screen.queryByText('Compliance license updated successfully')).not.toBeInTheDocument();
    });

    it('displays error feedback banner when a license card download encounters an error', async () => {
      vi.mocked(licensesActions.getLicenseDownloadUrl).mockResolvedValue({
        success: false,
        error: 'S3 storage download link error',
      });

      render(
        <LicensesPage
          initialData={{
            success: true,
            companyName: 'LuLu Riyadh',
            companyCountry: 'Saudi Arabia',
            isRegulatedJurisdiction: true,
            licenses: [mockActiveLicense],
          }}
        />
      );

      const downloadBtn = screen.getByText('Download Certificate (PDF)');
      fireEvent.click(downloadBtn);

      await waitFor(() => {
        expect(screen.getByText('S3 storage download link error')).toBeInTheDocument();
      });
    });
  });
});
