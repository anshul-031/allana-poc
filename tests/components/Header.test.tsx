import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import Header, { NAV_LINKS, HeaderUser } from '@/components/common/Header';
import { RelatedCompanyDTO } from '@/server/actions/company.actions';

let mockCurrentPath = '/dashboard';
vi.mock('next/navigation', () => ({
  usePathname: () => mockCurrentPath,
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock('@/components/common/CompanySwitcher', () => ({
  default: () => <div data-testid="mock-company-switcher">Company Switcher</div>,
}));

vi.mock('@/components/common/NotificationBell', () => ({
  default: ({ initialUnreadCount }: { initialUnreadCount?: number }) => (
    <div data-testid="mock-notification-bell">Bell ({initialUnreadCount || 0})</div>
  ),
}));

vi.mock('@/components/common/LogoutModal', () => ({
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="mock-logout-modal">
        <span>Logout Confirmation Modal</span>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

const mockUser: HeaderUser = {
  id: 'usr-1',
  firstName: 'Ahmed',
  lastName: 'Mansoori',
  email: 'ahmed.mansoori@lulumea.com',
  role: 'ADMIN',
};

const mockCompany: RelatedCompanyDTO = {
  id: 'comp-1',
  name: 'LuLu Hypermarket LLC',
  code: 'LULU-DXB',
  country: 'United Arab Emirates',
  region: 'Middle East',
  telephone: '+971-4-2988880',
  email: 'meatbuyer.dxb@luluhypermarket.com',
  isParent: false,
  isActive: true,
};

describe('Header Component (FEAT-2.1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCurrentPath = '/dashboard';
  });

  it('renders brand logo, typography, and customer support number', () => {
    render(<Header user={mockUser} activeCompany={mockCompany} />);

    expect(screen.getByText('ALLANA')).toBeInTheDocument();
    expect(screen.getByText('Customer Export Portal')).toBeInTheDocument();
    expect(screen.getByText('+91 22 2281 1000')).toBeInTheDocument();
    expect(screen.getByTestId('mock-company-switcher')).toBeInTheDocument();
    expect(screen.getByTestId('mock-notification-bell')).toBeInTheDocument();
  });

  it('renders all 8 primary navigation links', () => {
    render(<Header user={mockUser} activeCompany={mockCompany} />);

    for (const nav of NAV_LINKS) {
      expect(screen.getByRole('link', { name: nav.label })).toBeInTheDocument();
    }
  });

  it('highlights the active link correctly for dashboard and subroutes', () => {
    mockCurrentPath = '/dashboard';
    const { rerender } = render(<Header user={mockUser} activeCompany={mockCompany} />);

    const dashboardLink = screen.getByRole('link', { name: 'Dashboard' });
    expect(dashboardLink).toHaveStyle({ fontWeight: 600 });

    mockCurrentPath = '/catalog';
    rerender(<Header user={mockUser} activeCompany={mockCompany} />);

    const catalogLink = screen.getByRole('link', { name: 'Products Catalog' });
    expect(catalogLink).toHaveStyle({ fontWeight: 600 });
  });

  it('renders user initials avatar and toggles settings dropdown', () => {
    render(<Header user={mockUser} activeCompany={mockCompany} />);

    // Initials "AM"
    expect(screen.getByText('AM')).toBeInTheDocument();
    expect(screen.getByText('Ahmed')).toBeInTheDocument();

    const settingsBtn = screen.getByRole('button', { name: /Account Settings/i });
    fireEvent.click(settingsBtn);

    expect(screen.getByTestId('settings-dropdown')).toBeInTheDocument();
    expect(screen.getByText('Ahmed Mansoori')).toBeInTheDocument();
    expect(screen.getByText('ahmed.mansoori@lulumea.com')).toBeInTheDocument();

    expect(screen.getByRole('menuitem', { name: 'Company Profile' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Members List' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Regulatory Licenses (SFDA)' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Security Action Log' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Change Password' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Logout' })).toBeInTheDocument();
  });

  it('renders fallback initials and labels when user prop is undefined', () => {
    render(<Header />);
    expect(screen.getByText('AL')).toBeInTheDocument();
    expect(screen.getByText('Account')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Account Settings/i }));
    expect(screen.getByText('Guest User')).toBeInTheDocument();
    expect(screen.getByText('guest@allana.com')).toBeInTheDocument();
  });

  it('renders single initial when user has no lastName', () => {
    render(
      <Header
        user={{
          id: 'u-single',
          firstName: 'Tariq',
          lastName: null,
          email: 'tariq@allana.com',
        }}
      />
    );
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('opens LogoutModal when Logout menuitem is clicked and can close it', () => {
    render(<Header user={mockUser} activeCompany={mockCompany} />);

    fireEvent.click(screen.getByRole('button', { name: /Account Settings/i }));
    const logoutBtn = screen.getByRole('menuitem', { name: 'Logout' });
    fireEvent.click(logoutBtn);

    expect(screen.getByTestId('mock-logout-modal')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Close'));
    expect(screen.queryByTestId('mock-logout-modal')).not.toBeInTheDocument();
  });

  it('closes settings dropdown when clicking outside', () => {
    render(
      <div>
        <div data-testid="outside-box">Outside Box</div>
        <Header user={mockUser} activeCompany={mockCompany} />
      </div>
    );

    fireEvent.click(screen.getByRole('button', { name: /Account Settings/i }));
    expect(screen.getByTestId('settings-dropdown')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByTestId('outside-box'));
    expect(screen.queryByTestId('settings-dropdown')).not.toBeInTheDocument();
  });

  it('closes settings dropdown when pressing Escape', () => {
    render(<Header user={mockUser} activeCompany={mockCompany} />);

    fireEvent.click(screen.getByRole('button', { name: /Account Settings/i }));
    expect(screen.getByTestId('settings-dropdown')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByTestId('settings-dropdown')).not.toBeInTheDocument();
  });

  it('toggles mobile menu and closes links on click', () => {
    render(<Header user={mockUser} activeCompany={mockCompany} />);

    const mobileToggle = screen.getByRole('button', { name: /Toggle navigation menu/i });
    fireEvent.click(mobileToggle);
    expect(mobileToggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('mobile-nav')).toBeInTheDocument();

    // Click link in mobile nav to close drawer
    const mobileLink = screen.getAllByRole('link', { name: 'Products Catalog' })[1];
    fireEvent.click(mobileLink);
    expect(screen.queryByTestId('mobile-nav')).not.toBeInTheDocument();

    // Click menuitem in settings to close
    fireEvent.click(screen.getByRole('button', { name: /Account Settings/i }));
    const profileLink = screen.getByRole('menuitem', { name: 'Company Profile' });
    fireEvent.click(profileLink);
    expect(screen.queryByTestId('settings-dropdown')).not.toBeInTheDocument();
  });
});
