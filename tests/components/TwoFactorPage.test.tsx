import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import TwoFactorPage from '@/app/(auth)/2fa/page';
import * as authActions from '@/server/actions/auth.actions';

let mockUserId: string | null = 'u-2fa-1';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: (key: string) => (key === 'userId' ? mockUserId : null),
  }),
}));

vi.mock('@/server/actions/auth.actions', () => ({
  verify2FACode: vi.fn(),
}));

describe('TwoFactorPage Component (src/app/(auth)/2fa/page.tsx)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserId = 'u-2fa-1';
  });

  it('renders 2FA title, input, and verify button', () => {
    render(<TwoFactorPage />);
    expect(screen.getByText('Two-Factor Authorization')).toBeInTheDocument();
    expect(screen.getByLabelText(/6-Digit Code \*/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Confirm Authorization/i })).toBeInTheDocument();
  });

  it('handles missing userId gracefully in search params', () => {
    mockUserId = null;
    render(<TwoFactorPage />);
    expect(screen.getByText('Two-Factor Authorization')).toBeInTheDocument();
  });

  it('shows error banner when verify2FACode fails with explicit error message', async () => {
    vi.mocked(authActions.verify2FACode).mockResolvedValueOnce({
      success: false,
      error: 'Invalid verification code',
    });

    render(<TwoFactorPage />);
    const codeInput = screen.getByLabelText(/6-Digit Code \*/i);
    fireEvent.change(codeInput, { target: { value: '000000' } });
    fireEvent.click(screen.getByRole('button', { name: /Confirm Authorization/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid verification code/i)).toBeInTheDocument();
    });
  });

  it('shows default error banner when verify2FACode fails without error message', async () => {
    vi.mocked(authActions.verify2FACode).mockResolvedValueOnce({
      success: false,
    });

    render(<TwoFactorPage />);
    const codeInput = screen.getByLabelText(/6-Digit Code \*/i);
    fireEvent.change(codeInput, { target: { value: '000000' } });
    fireEvent.click(screen.getByRole('button', { name: /Confirm Authorization/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid verification code/i)).toBeInTheDocument();
    });
  });

  it('catches and displays error when verify2FACode rejects', async () => {
    vi.mocked(authActions.verify2FACode).mockRejectedValueOnce(new Error('Network failure'));

    render(<TwoFactorPage />);
    const codeInput = screen.getByLabelText(/6-Digit Code \*/i);
    fireEvent.change(codeInput, { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /Confirm Authorization/i }));

    await waitFor(() => {
      expect(screen.getByText(/An unexpected error occurred during verification/i)).toBeInTheDocument();
    });
  });

  it('redirects to /settings/change-password if isFirstLogin is true', async () => {
    vi.mocked(authActions.verify2FACode).mockResolvedValueOnce({
      success: true,
      requiresPasswordChange: true,
      userId: 'u-2fa-1',
    });

    render(<TwoFactorPage />);
    const codeInput = screen.getByLabelText(/6-Digit Code \*/i);
    fireEvent.change(codeInput, { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /Confirm Authorization/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/settings/change-password?userId=u-2fa-1&forced=true');
    });
  });

  it('redirects to / on valid code for standard user with companyId', async () => {
    vi.mocked(authActions.verify2FACode).mockResolvedValueOnce({
      success: true,
      user: {
        id: 'u-2fa-1',
        email: 'tariq@lulu.com',
        firstName: 'Tariq',
        role: 'FINANCE',
        companyId: 'comp-lulu-uae',
        isFirstLogin: false,
      },
    });

    render(<TwoFactorPage />);
    const codeInput = screen.getByLabelText(/6-Digit Code \*/i);
    fireEvent.change(codeInput, { target: { value: '654321' } });
    fireEvent.click(screen.getByRole('button', { name: /Confirm Authorization/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
      expect(document.cookie).toContain('allana_active_company_id=comp-lulu-uae');
    });
  });

  it('redirects to / on valid code for standard user without companyId', async () => {
    vi.mocked(authActions.verify2FACode).mockResolvedValueOnce({
      success: true,
      user: {
        id: 'u-2fa-2',
        email: 'admin@allana.com',
        firstName: 'Global',
        role: 'SYSTEM_ADMIN',
        companyId: '',
        isFirstLogin: false,
      },
    });

    render(<TwoFactorPage />);
    const codeInput = screen.getByLabelText(/6-Digit Code \*/i);
    fireEvent.change(codeInput, { target: { value: '654321' } });
    fireEvent.click(screen.getByRole('button', { name: /Confirm Authorization/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });
});
