import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import ManagerContactCard from '@/components/profile/ManagerContactCard';
import RelatedCompaniesTable from '@/components/profile/RelatedCompaniesTable';
import ProfilePage from '@/app/(portal)/settings/profile/page';
import * as companyActions from '@/server/actions/company.actions';

const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

vi.mock('@/server/actions/company.actions', () => ({
  switchCompanyContext: vi.fn(),
}));

const mockManager = {
  name: 'Kareem Al-Sayed',
  title: 'Senior Commercial Director – Middle East & Africa Export Division',
  email: 'kareem.alsayed@allana.com',
  phone: '+971 50 882 1920',
  location: 'Allana Corporate Center, Dubai',
};

const mockEntities: companyActions.RelatedCompanyDTO[] = [
  {
    id: 'comp-parent',
    name: 'LuLu Group International (Holding HQ)',
    code: 'LULU-HQ',
    country: 'United Arab Emirates',
    region: 'Middle East & GCC',
    telephone: '+971 2 418 2000',
    email: 'corporate@lulugroup.com',
    isParent: true,
    isActive: true,
    managerName: 'Kareem Al-Sayed',
    managerEmail: 'kareem.alsayed@allana.com',
    managerPhone: '+971 50 882 1920',
  },
  {
    id: 'comp-sub-uae',
    name: 'LuLu Hypermarket LLC (Dubai)',
    code: 'LULU-UAE',
    country: 'United Arab Emirates',
    region: 'Middle East & GCC',
    telephone: '+971 4 298 8888',
    email: 'procurement@ae.lulumea.com',
    isParent: false,
    isActive: true,
    managerName: 'Kareem Al-Sayed',
    managerEmail: 'kareem.alsayed@allana.com',
    managerPhone: '+971 50 882 1920',
  },
  {
    id: 'comp-sub-ksa',
    name: 'LuLu Saudi Hypermarkets LLC (Riyadh)',
    code: 'LULU-KSA',
    country: 'Saudi Arabia',
    region: 'Middle East & GCC',
    telephone: '',
    email: '',
    isParent: false,
    isActive: true,
    managerName: '',
    managerEmail: '',
    managerPhone: '',
  },
];

describe('Profile Components & Page (FEAT-1.3)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ManagerContactCard Component', () => {
    it('renders assigned manager contact info, designation, and links', () => {
      render(<ManagerContactCard manager={mockManager} />);

      expect(screen.getByText('Kareem Al-Sayed')).toBeInTheDocument();
      expect(screen.getByText(/Senior Commercial Director/i)).toBeInTheDocument();
      expect(screen.getByText(/Allana Corporate Center, Dubai/i)).toBeInTheDocument();
      expect(screen.getByText(/📞 \+971 50 882 1920/i)).toBeInTheDocument();
      expect(screen.getByText(/✉️ kareem\.alsayed@allana\.com/i)).toBeInTheDocument();
      expect(screen.getByText('KA')).toBeInTheDocument(); // Initials
    });

    it('handles clipboard copy of manager details', async () => {
      const mockClipboard = {
        writeText: vi.fn().mockResolvedValue(undefined),
      };
      Object.assign(navigator, { clipboard: mockClipboard });

      render(<ManagerContactCard manager={mockManager} />);

      const copyBtn = screen.getByRole('button', { name: /Copy manager contact details/i });
      fireEvent.click(copyBtn);

      await waitFor(() => {
        expect(mockClipboard.writeText).toHaveBeenCalledWith(
          expect.stringContaining('Kareem Al-Sayed')
        );
        expect(screen.getByText('✓ Copied!')).toBeInTheDocument();
      });
    });

    it('gracefully handles clipboard failure and renders with fallback initials', () => {
      const mockClipboard = {
        writeText: vi.fn().mockRejectedValue(new Error('Clipboard blocked')),
      };
      Object.assign(navigator, { clipboard: mockClipboard });

      render(
        <ManagerContactCard
          manager={{
            name: '',
            email: 'desk@allana.com',
            phone: '123',
          }}
        />
      );

      const copyBtn = screen.getByRole('button', { name: /Copy manager contact details/i });
      fireEvent.click(copyBtn);

      expect(screen.getByText('AM')).toBeInTheDocument(); // Allana Manager initials fallback
    });
  });

  describe('RelatedCompaniesTable Component', () => {
    it('renders entities table with active company status and buttons', () => {
      render(
        <RelatedCompaniesTable
          relatedCompanies={mockEntities}
          activeCompanyId="comp-sub-uae"
          userId="u-123"
        />
      );

      expect(screen.getByText('LuLu Hypermarket LLC (Dubai)')).toBeInTheDocument();
      expect(screen.getByText('Current Active')).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: /Sign In \/ Switch/i })).toHaveLength(2);
    });

    it('expands and collapses counterpart row details', () => {
      render(
        <RelatedCompaniesTable
          relatedCompanies={mockEntities}
          activeCompanyId="comp-sub-uae"
          userId="u-123"
        />
      );

      const expandBtn = screen.getByLabelText('Toggle details for LuLu Hypermarket LLC (Dubai)');
      fireEvent.click(expandBtn);

      expect(screen.getByText('+971 4 298 8888')).toBeInTheDocument();
      expect(screen.getByText('procurement@ae.lulumea.com')).toBeInTheDocument();

      // Collapse
      fireEvent.click(expandBtn);
      expect(screen.queryByText('+971 4 298 8888')).not.toBeInTheDocument();
    });

    it('filters counterparts by search query', () => {
      render(
        <RelatedCompaniesTable
          relatedCompanies={mockEntities}
          activeCompanyId="comp-sub-uae"
          userId="u-123"
        />
      );

      const filterInput = screen.getByLabelText(/Filter entities table/i);
      fireEvent.change(filterInput, { target: { value: 'Riyadh' } });

      expect(screen.getByText('LuLu Saudi Hypermarkets LLC (Riyadh)')).toBeInTheDocument();
      expect(screen.queryByText('LuLu Hypermarket LLC (Dubai)')).not.toBeInTheDocument();

      // Non-matching query
      fireEvent.change(filterInput, { target: { value: 'UnknownEntity' } });
      expect(screen.getByText(/No related companies found matching/i)).toBeInTheDocument();
    });

    it('switches counterpart entity when clicking Sign In / Switch', async () => {
      vi.mocked(companyActions.switchCompanyContext).mockResolvedValueOnce({
        success: true,
        activeCompany: mockEntities[0],
      });

      render(
        <RelatedCompaniesTable
          relatedCompanies={mockEntities}
          activeCompanyId="comp-sub-uae"
          userId="u-123"
        />
      );

      const switchBtns = screen.getAllByRole('button', { name: /Sign In \/ Switch/i });
      fireEvent.click(switchBtns[0]); // Click HQ

      await waitFor(() => {
        expect(companyActions.switchCompanyContext).toHaveBeenCalledWith('u-123', 'comp-parent');
        expect(document.cookie).toContain('allana_active_company_id=comp-parent');
        expect(mockRefresh).toHaveBeenCalled();
      });
    });

    it('displays error banner when switchCompanyContext returns error', async () => {
      vi.mocked(companyActions.switchCompanyContext).mockResolvedValueOnce({
        success: false,
        error: 'Unauthorized entity',
      });

      render(
        <RelatedCompaniesTable
          relatedCompanies={mockEntities}
          activeCompanyId="comp-sub-uae"
          userId="u-123"
        />
      );

      const switchBtns = screen.getAllByRole('button', { name: /Sign In \/ Switch/i });
      fireEvent.click(switchBtns[0]);

      await waitFor(() => {
        expect(screen.getByText(/Unauthorized entity/i)).toBeInTheDocument();
      });
    });

    it('displays default error message when switchCompanyContext fails without error text', async () => {
      vi.mocked(companyActions.switchCompanyContext).mockResolvedValueOnce({
        success: false,
      });

      render(
        <RelatedCompaniesTable
          relatedCompanies={mockEntities}
          activeCompanyId="comp-sub-uae"
          userId="u-123"
        />
      );

      const switchBtns = screen.getAllByRole('button', { name: /Sign In \/ Switch/i });
      fireEvent.click(switchBtns[0]);

      await waitFor(() => {
        expect(screen.getByText(/Failed to switch entity/i)).toBeInTheDocument();
      });
    });

    it('expands row with fallback dash and default desk email for empty fields', () => {
      render(
        <RelatedCompaniesTable
          relatedCompanies={mockEntities}
          activeCompanyId="comp-sub-uae"
          userId="u-123"
        />
      );

      // comp-sub-ksa has empty managerName, telephone, email, managerEmail, managerPhone
      expect(screen.getByText('Allana Export Desk')).toBeInTheDocument();

      const expandBtn = screen.getByLabelText('Toggle details for LuLu Saudi Hypermarkets LLC (Riyadh)');
      fireEvent.click(expandBtn);

      expect(screen.getByText('desk@allana.com')).toBeInTheDocument();
      expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(2);
    });

    it('displays error banner when switchCompanyContext rejects', async () => {
      vi.mocked(companyActions.switchCompanyContext).mockRejectedValueOnce(new Error('Network error'));

      render(
        <RelatedCompaniesTable
          relatedCompanies={mockEntities}
          activeCompanyId="comp-sub-uae"
          userId="u-123"
        />
      );

      const switchBtns = screen.getAllByRole('button', { name: /Sign In \/ Switch/i });
      fireEvent.click(switchBtns[0]);

      await waitFor(() => {
        expect(screen.getByText(/An unexpected error occurred while switching entity context/i)).toBeInTheDocument();
      });
    });
  });

  describe('ProfilePage Component', () => {
    it('renders company details card, manager card, and table with default props', () => {
      render(<ProfilePage />);

      expect(screen.getByText('Company Profile & Account Information')).toBeInTheDocument();
      expect(screen.getAllByText('LuLu Hypermarket LLC (Dubai)').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('LULU-UAE').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('OPERATING SUBSIDIARY')).toBeInTheDocument();
      expect(screen.getByTestId('manager-contact-card')).toBeInTheDocument();
      expect(screen.getByTestId('related-companies-table')).toBeInTheDocument();
    });

    it('renders parent holding badge when isParent is true', () => {
      render(
        <ProfilePage
          initialCompany={mockEntities[0]}
          initialRelatedCompanies={mockEntities}
          initialManager={mockManager}
        />
      );

      expect(screen.getByText('PARENT HOLDING')).toBeInTheDocument();
      expect(screen.getAllByText('LuLu Group International (Holding HQ)').length).toBeGreaterThanOrEqual(1);
    });

    it('handles company with empty phone and email gracefully', () => {
      render(
        <ProfilePage
          initialCompany={mockEntities[2]}
          initialRelatedCompanies={mockEntities}
          initialManager={mockManager}
        />
      );

      expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(2);
    });
  });
});
