import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import CompanySwitcher from '@/components/common/CompanySwitcher';
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

const mockCompanies: companyActions.RelatedCompanyDTO[] = [
  {
    id: 'comp-parent-lulu',
    name: 'LuLu Group International',
    code: 'LULU-HQ',
    country: 'United Arab Emirates',
    region: 'Middle East',
    telephone: '+971-4-111111',
    email: 'hq@lulu.ae',
    isParent: true,
    isActive: true,
  },
  {
    id: 'comp-sub-uae',
    name: 'LuLu Hypermarket Dubai',
    code: 'LULU-UAE',
    country: 'United Arab Emirates',
    region: 'Middle East',
    telephone: '+971-4-222222',
    email: 'dubai@lulu.ae',
    isParent: false,
    isActive: true,
  },
  {
    id: 'comp-sub-ksa',
    name: 'LuLu Hypermarket Riyadh',
    code: 'LULU-KSA',
    country: 'Saudi Arabia',
    region: 'Middle East',
    telephone: '+966-11-333333',
    email: 'riyadh@lulu.sa',
    isParent: false,
    isActive: true,
  },
];

describe('CompanySwitcher Component (src/components/common/CompanySwitcher.tsx)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders trigger button with initial active company details', () => {
    render(
      <CompanySwitcher
        userId="u-123"
        initialActiveCompany={mockCompanies[1]}
        relatedCompanies={mockCompanies}
      />
    );

    expect(screen.getByText('LuLu Hypermarket Dubai')).toBeInTheDocument();
    expect(screen.getByText(/United Arab Emirates • LULU-UAE/i)).toBeInTheDocument();
  });

  it('renders placeholder if initialActiveCompany is null', () => {
    render(
      <CompanySwitcher
        userId="u-123"
        initialActiveCompany={null}
        relatedCompanies={mockCompanies}
      />
    );

    expect(screen.getByText('Select Company')).toBeInTheDocument();
  });

  it('opens dropdown on trigger click and displays Counterpart search input', () => {
    render(
      <CompanySwitcher
        userId="u-123"
        initialActiveCompany={mockCompanies[1]}
        relatedCompanies={mockCompanies}
      />
    );

    const trigger = screen.getByRole('button', { expanded: false });
    fireEvent.click(trigger);

    expect(screen.getByLabelText(/Counterpart:/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search subsidiaries.../i)).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('filters counterpart companies in real-time by search query', () => {
    render(
      <CompanySwitcher
        userId="u-123"
        initialActiveCompany={mockCompanies[1]}
        relatedCompanies={mockCompanies}
      />
    );

    fireEvent.click(screen.getByRole('button', { expanded: false }));

    const searchInput = screen.getByLabelText(/Counterpart:/i);
    fireEvent.change(searchInput, { target: { value: 'Riyadh' } });

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(1);
    expect(screen.getByText('LuLu Hypermarket Riyadh')).toBeInTheDocument();

    // Click clear search button
    const clearBtn = screen.getByRole('button', { name: /Clear counterpart search/i });
    fireEvent.click(clearBtn);
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('displays no results message when search has no matches', () => {
    render(
      <CompanySwitcher
        userId="u-123"
        initialActiveCompany={mockCompanies[1]}
        relatedCompanies={mockCompanies}
      />
    );

    fireEvent.click(screen.getByRole('button', { expanded: false }));
    const searchInput = screen.getByLabelText(/Counterpart:/i);
    fireEvent.change(searchInput, { target: { value: 'NonExistentSubsidiary' } });

    expect(screen.getByText(/No counterparts found matching/i)).toBeInTheDocument();
  });

  it('closes dropdown when clicking already active company without switching', () => {
    render(
      <CompanySwitcher
        userId="u-123"
        initialActiveCompany={mockCompanies[1]}
        relatedCompanies={mockCompanies}
      />
    );

    fireEvent.click(screen.getByRole('button', { expanded: false }));

    // Click already active option (LuLu Hypermarket Dubai)
    const activeOption = screen.getAllByRole('option')[1];
    fireEvent.click(activeOption);

    expect(companyActions.switchCompanyContext).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('successfully switches counterpart entity on click and refreshes router', async () => {
    vi.mocked(companyActions.switchCompanyContext).mockResolvedValueOnce({
      success: true,
      activeCompany: mockCompanies[2],
    });

    render(
      <CompanySwitcher
        userId="u-123"
        initialActiveCompany={mockCompanies[1]}
        relatedCompanies={mockCompanies}
      />
    );

    fireEvent.click(screen.getByRole('button', { expanded: false }));

    // Select LuLu Hypermarket Riyadh
    const ksaOption = screen.getAllByRole('option')[2];
    fireEvent.click(ksaOption);

    await waitFor(() => {
      expect(companyActions.switchCompanyContext).toHaveBeenCalledWith('u-123', 'comp-sub-ksa');
      expect(document.cookie).toContain('allana_active_company_id=comp-sub-ksa');
      expect(mockRefresh).toHaveBeenCalled();
    });

    expect(screen.getByText('LuLu Hypermarket Riyadh')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows error banner when switchCompanyContext returns error', async () => {
    vi.mocked(companyActions.switchCompanyContext).mockResolvedValueOnce({
      success: false,
      error: 'Access denied to this subsidiary',
    });

    render(
      <CompanySwitcher
        userId="u-123"
        initialActiveCompany={mockCompanies[1]}
        relatedCompanies={mockCompanies}
      />
    );

    fireEvent.click(screen.getByRole('button', { expanded: false }));
    const ksaOption = screen.getAllByRole('option')[2];
    fireEvent.click(ksaOption);

    await waitFor(() => {
      expect(screen.getByText(/Access denied to this subsidiary/i)).toBeInTheDocument();
    });
  });

  it('shows error banner when switchCompanyContext throws an exception', async () => {
    vi.mocked(companyActions.switchCompanyContext).mockRejectedValueOnce(
      new Error('Network failure')
    );

    render(
      <CompanySwitcher
        userId="u-123"
        initialActiveCompany={mockCompanies[1]}
        relatedCompanies={mockCompanies}
      />
    );

    fireEvent.click(screen.getByRole('button', { expanded: false }));
    const ksaOption = screen.getAllByRole('option')[2];
    fireEvent.click(ksaOption);

    await waitFor(() => {
      expect(
        screen.getByText(/An error occurred while switching counterpart context/i)
      ).toBeInTheDocument();
    });
  });

  it('closes dropdown when clicking outside or pressing Escape', () => {
    render(
      <div>
        <div data-testid="outside-element">Outside</div>
        <CompanySwitcher
          userId="u-123"
          initialActiveCompany={mockCompanies[1]}
          relatedCompanies={mockCompanies}
        />
      </div>
    );

    // Open dropdown
    fireEvent.click(screen.getByRole('button', { expanded: false }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Click outside
    fireEvent.mouseDown(screen.getByTestId('outside-element'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Reopen and test Escape
    fireEvent.click(screen.getByRole('button', { expanded: false }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
