import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import ChangePasswordPage from '@/app/(portal)/settings/change-password/page';
import * as authActions from '@/server/actions/auth.actions';

let mockUserId: string | null = 'u-change-1';
let mockForced: string | null = 'true';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === 'userId') return mockUserId;
      if (key === 'forced') return mockForced;
      return null;
    },
  }),
}));

vi.mock('@/server/actions/auth.actions', () => ({
  changePassword: vi.fn(),
}));

describe('ChangePasswordPage Component (src/app/(portal)/settings/change-password/page.tsx)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserId = 'u-change-1';
    mockForced = 'true';
  });

  it('renders mandatory change password title and inputs', () => {
    render(<ChangePasswordPage />);
    expect(screen.getByText('First-Time Password Change')).toBeInTheDocument();
    expect(screen.getByText('MANDATORY SETUP')).toBeInTheDocument();
    expect(screen.getByLabelText(/Current Password \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^New Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm New Password \*/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save New Password/i })).toBeInTheDocument();
  });

  it('renders regular settings change password UI when forced is false', () => {
    mockForced = 'false';
    render(<ChangePasswordPage />);
    expect(screen.getByText('Update Your Password')).toBeInTheDocument();
    expect(screen.getByText('SECURITY SETTINGS')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Cancel/i })).toBeInTheDocument();
  });

  it('validates password mismatch on client side', async () => {
    render(<ChangePasswordPage />);
    fireEvent.change(screen.getByLabelText(/Current Password \*/i), {
      target: { value: 'oldpass123' },
    });
    fireEvent.change(screen.getByLabelText(/^New Password/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/Confirm New Password \*/i), {
      target: { value: 'mismatch456' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Save New Password/i }));

    await waitFor(() => {
      expect(screen.getByText(/New password and confirmation do not match/i)).toBeInTheDocument();
    });
  });

  it('validates password length min 8 chars', async () => {
    render(<ChangePasswordPage />);
    fireEvent.change(screen.getByLabelText(/Current Password \*/i), {
      target: { value: 'oldpass123' },
    });
    fireEvent.change(screen.getByLabelText(/^New Password/i), {
      target: { value: 'short' },
    });
    fireEvent.change(screen.getByLabelText(/Confirm New Password \*/i), {
      target: { value: 'short' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Save New Password/i }));

    await waitFor(() => {
      expect(screen.getByText(/New password must be at least 8 characters long/i)).toBeInTheDocument();
    });
  });

  it('shows error banner when server action returns failure with custom error', async () => {
    vi.mocked(authActions.changePassword).mockResolvedValueOnce({
      success: false,
      error: 'Current password is incorrect',
    });

    render(<ChangePasswordPage />);
    fireEvent.change(screen.getByLabelText(/Current Password \*/i), {
      target: { value: 'wrong-current' },
    });
    fireEvent.change(screen.getByLabelText(/^New Password/i), {
      target: { value: 'brandNewPass123' },
    });
    fireEvent.change(screen.getByLabelText(/Confirm New Password \*/i), {
      target: { value: 'brandNewPass123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Save New Password/i }));

    await waitFor(() => {
      expect(screen.getByText(/Current password is incorrect/i)).toBeInTheDocument();
    });
  });

  it('shows default error banner when server action returns failure without error text', async () => {
    vi.mocked(authActions.changePassword).mockResolvedValueOnce({
      success: false,
    });

    render(<ChangePasswordPage />);
    fireEvent.change(screen.getByLabelText(/Current Password \*/i), {
      target: { value: 'wrong-current' },
    });
    fireEvent.change(screen.getByLabelText(/^New Password/i), {
      target: { value: 'brandNewPass123' },
    });
    fireEvent.change(screen.getByLabelText(/Confirm New Password \*/i), {
      target: { value: 'brandNewPass123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Save New Password/i }));

    await waitFor(() => {
      expect(screen.getByText(/Failed to update password. Please check your current password/i)).toBeInTheDocument();
    });
  });

  it('catches and displays error when changePassword rejects', async () => {
    vi.mocked(authActions.changePassword).mockRejectedValueOnce(new Error('Network failure'));

    render(<ChangePasswordPage />);
    fireEvent.change(screen.getByLabelText(/Current Password \*/i), {
      target: { value: 'currentpass1' },
    });
    fireEvent.change(screen.getByLabelText(/^New Password/i), {
      target: { value: 'brandNewPass123' },
    });
    fireEvent.change(screen.getByLabelText(/Confirm New Password \*/i), {
      target: { value: 'brandNewPass123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Save New Password/i }));

    await waitFor(() => {
      expect(screen.getByText(/An unexpected error occurred. Please try again/i)).toBeInTheDocument();
    });
  });

  it('submits valid change, displays success status message, and redirects after timeout', async () => {
    vi.useFakeTimers();
    vi.mocked(authActions.changePassword).mockResolvedValueOnce({
      success: true,
    });

    render(<ChangePasswordPage />);
    fireEvent.change(screen.getByLabelText(/Current Password \*/i), {
      target: { value: 'correct-current' },
    });
    fireEvent.change(screen.getByLabelText(/^New Password/i), {
      target: { value: 'StrongPass@2026' },
    });
    fireEvent.change(screen.getByLabelText(/Confirm New Password \*/i), {
      target: { value: 'StrongPass@2026' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Save New Password/i }));

    await vi.waitFor(() => {
      expect(screen.getByText(/Password Successfully Updated!/i)).toBeInTheDocument();
    });

    vi.advanceTimersByTime(2100);

    expect(mockPush).toHaveBeenCalledWith('/login');
    vi.useRealTimers();
  });
});
