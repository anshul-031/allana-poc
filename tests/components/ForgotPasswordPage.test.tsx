import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import ForgotPasswordPage from '@/app/(auth)/forgot-password/page';
import * as authActions from '@/server/actions/auth.actions';

vi.mock('@/server/actions/auth.actions', () => ({
  requestPasswordReset: vi.fn(),
}));

describe('ForgotPasswordPage Component (src/app/(auth)/forgot-password/page.tsx)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders restore password title, input, and dispatch button', () => {
    render(<ForgotPasswordPage />);
    expect(screen.getByText('Restore Password')).toBeInTheDocument();
    expect(screen.getByLabelText(/Login \(E-mail\) \*/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send Reset Link/i })).toBeInTheDocument();
  });

  it('submits email and renders success confirmation view', async () => {
    vi.mocked(authActions.requestPasswordReset).mockResolvedValueOnce({
      success: true,
      message: 'If an account exists with this email, a password reset link has been dispatched.',
    });

    render(<ForgotPasswordPage />);
    fireEvent.change(screen.getByLabelText(/Login \(E-mail\) \*/i), {
      target: { value: 'buyer@lulu.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Send Reset Link/i }));

    await waitFor(() => {
      expect(screen.getByText(/password reset link has been dispatched/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Back to Sign In/i })).toBeInTheDocument();
    });
  });

  it('handles submission error gracefully', async () => {
    vi.mocked(authActions.requestPasswordReset).mockRejectedValueOnce(new Error('Network error'));

    render(<ForgotPasswordPage />);
    fireEvent.change(screen.getByLabelText(/Login \(E-mail\) \*/i), {
      target: { value: 'buyer@lulu.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Send Reset Link/i }));

    await waitFor(() => {
      expect(screen.getByText(/Failed to dispatch password reset request/i)).toBeInTheDocument();
    });
  });
});
