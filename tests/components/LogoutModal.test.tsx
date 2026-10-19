import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import LogoutModal from '@/components/common/LogoutModal';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('LogoutModal component (src/components/common/LogoutModal.tsx)', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(<LogoutModal isOpen={false} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders modal dialog when isOpen is true', () => {
    render(<LogoutModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText('Exit from the personal cabinet?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /no/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /yes/i })).toBeInTheDocument();
  });

  it('calls onClose when "No" button is clicked', () => {
    const onClose = vi.fn();
    render(<LogoutModal isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /no/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls custom onConfirm and onClose when "Yes" is clicked', async () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    render(<LogoutModal isOpen={true} onClose={onClose} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByRole('button', { name: /yes/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('clears cookie and redirects to /login if onConfirm is not provided', () => {
    const onClose = vi.fn();
    render(<LogoutModal isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /yes/i }));
    expect(mockPush).toHaveBeenCalledWith('/login');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
