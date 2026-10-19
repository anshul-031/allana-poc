import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import LoginPage from '@/app/(auth)/login/page';
import * as authActions from '@/server/actions/auth.actions';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('@/server/actions/auth.actions', () => ({
  loginUser: vi.fn(),
}));

describe('LoginPage Component (src/app/(auth)/login/page.tsx)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login header, inputs, and submit button', () => {
    render(<LoginPage />);
    expect(screen.getByText('ALLANA')).toBeInTheDocument();
    expect(screen.getByText('Sign In to Your Account')).toBeInTheDocument();
    expect(screen.getByLabelText(/Login \(E-mail\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password \*/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('toggles password visibility when eye icon is clicked', () => {
    render(<LoginPage />);
    const pwdInput = screen.getByLabelText(/Password \*/i);
    expect(pwdInput).toHaveAttribute('type', 'password');

    const toggleBtn = screen.getByLabelText(/Show password/i);
    fireEvent.click(toggleBtn);
    expect(pwdInput).toHaveAttribute('type', 'text');

    fireEvent.click(screen.getByLabelText(/Hide password/i));
    expect(pwdInput).toHaveAttribute('type', 'password');
  });

  it('shows error banner when loginUser fails', async () => {
    vi.mocked(authActions.loginUser).mockResolvedValueOnce({
      success: false,
      error: 'Invalid credentials or inactive account',
    });

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/Login \(E-mail\)/i), {
      target: { value: 'buyer@wrong.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password \*/i), {
      target: { value: 'wrongpass' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials or inactive account/i)).toBeInTheDocument();
    });
  });

  it('redirects to /2fa if user requires 2FA', async () => {
    vi.mocked(authActions.loginUser).mockResolvedValueOnce({
      success: true,
      requires2FA: true,
      userId: 'u-2fa-1',
    });

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/Login \(E-mail\)/i), {
      target: { value: 'buyer@2fa.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password \*/i), {
      target: { value: 'secret' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/2fa?userId=u-2fa-1');
    });
  });

  it('redirects to /settings/change-password if isFirstLogin is true', async () => {
    vi.mocked(authActions.loginUser).mockResolvedValueOnce({
      success: true,
      requiresPasswordChange: true,
      userId: 'u-first-1',
    });

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/Login \(E-mail\)/i), {
      target: { value: 'newuser@lulu.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password \*/i), {
      target: { value: 'temppass' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/settings/change-password?userId=u-first-1&forced=true');
    });
  });

  it('redirects to / on normal successful login and sets active company cookie', async () => {
    vi.mocked(authActions.loginUser).mockResolvedValueOnce({
      success: true,
      user: {
        id: 'u-ok',
        email: 'buyer@lulu.com',
        firstName: 'Ahmed',
        role: 'BUYER',
        companyId: 'comp-lulu-uae',
        isFirstLogin: false,
      },
    });

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/Login \(E-mail\)/i), {
      target: { value: 'buyer@lulu.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password \*/i), {
      target: { value: 'goodpass' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
      expect(document.cookie).toContain('allana_active_company_id=comp-lulu-uae');
    });
  });
});
