import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ActionLogTable from '@/components/settings/ActionLogTable';
import ActionLogPage from '@/app/(portal)/settings/action-log/page';
import { AuditLogEntry } from '@/server/actions/audit.actions';

const mockLogs: AuditLogEntry[] = [
  {
    id: 'log-1',
    action: 'USER_CREATED',
    comment: 'Created user tariq@lulu.com',
    createdAt: new Date('2026-02-18T10:00:00Z'),
    author: {
      id: 'u-admin',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@allana.com',
      role: 'ADMIN',
    },
  },
  {
    id: 'log-2',
    action: 'PERMISSIONS_UPDATED',
    comment: 'Updated permissions for tariq@lulu.com',
    createdAt: new Date('2026-02-17T11:00:00Z'),
    author: {
      id: 'u-admin',
      firstName: 'Admin',
      lastName: null,
      email: 'admin@allana.com',
      role: 'ADMIN',
    },
  },
  {
    id: 'log-3',
    action: 'USER_DEACTIVATED',
    comment: 'Deactivated user former@lulu.com',
    createdAt: new Date('2026-02-16T12:00:00Z'),
    author: {
      id: 'u-admin',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@allana.com',
      role: 'ADMIN',
    },
  },
  {
    id: 'log-4',
    action: 'PASSWORD_CHANGED',
    comment: 'Password changed successfully',
    createdAt: new Date('2026-02-15T13:00:00Z'),
    author: {
      id: 'u-admin',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@allana.com',
      role: 'ADMIN',
    },
  },
  {
    id: 'log-5',
    action: 'COMPANY_SWITCHED',
    comment: 'Switched context to Riyadh subsidiary',
    createdAt: new Date('2026-02-14T14:00:00Z'),
    author: {
      id: 'u-admin',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@allana.com',
      role: 'ADMIN',
    },
  },
  {
    id: 'log-6',
    action: 'UNKNOWN_CUSTOM_ACTION',
    comment: 'Custom audit action recorded',
    createdAt: new Date('2026-02-13T15:00:00Z'),
    author: {
      id: 'u-admin',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@allana.com',
      role: 'ADMIN',
    },
  },
];

// Array of 15 logs to test pagination controls (pageSize = 10)
const manyLogs: AuditLogEntry[] = Array.from({ length: 15 }, (_, i) => ({
  id: `log-multi-${i + 1}`,
  action: 'USER_CREATED',
  comment: `User action sequence #${i + 1}`,
  createdAt: new Date(`2026-02-${String(10 + (i % 15)).padStart(2, '0')}T10:00:00Z`),
  author: {
    id: 'u-admin',
    firstName: `Admin${i + 1}`,
    lastName: 'User',
    email: `admin${i + 1}@allana.com`,
    role: 'ADMIN',
  },
}));

describe('Action Log Components & Page (FEAT-1.5)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ActionLogTable Component', () => {
    it('renders audit logs with author, action badges, and description', () => {
      render(<ActionLogTable initialLogs={mockLogs} />);

      expect(screen.getByText('Created user tariq@lulu.com')).toBeInTheDocument();
      expect(screen.getByText('USER CREATED')).toBeInTheDocument();
      expect(screen.getByText('PASSWORD CHANGED')).toBeInTheDocument();
      expect(screen.getByText('COMPANY SWITCHED')).toBeInTheDocument();
      expect(screen.getByText('UNKNOWN CUSTOM ACTION')).toBeInTheDocument();
    });

    it('filters logs by action type dropdown', () => {
      render(<ActionLogTable initialLogs={mockLogs} />);

      const select = screen.getByLabelText(/Filter by action type/i);
      fireEvent.change(select, { target: { value: 'PASSWORD_CHANGED' } });

      expect(screen.getByText('Password changed successfully')).toBeInTheDocument();
      expect(screen.queryByText('Created user tariq@lulu.com')).not.toBeInTheDocument();
    });

    it('filters logs by search query and shows empty message when no matches', () => {
      render(<ActionLogTable initialLogs={mockLogs} />);

      const searchInput = screen.getByLabelText(/Filter action logs/i);
      fireEvent.change(searchInput, { target: { value: 'Riyadh' } });

      expect(screen.getByText('Switched context to Riyadh subsidiary')).toBeInTheDocument();
      expect(screen.queryByText('Created user tariq@lulu.com')).not.toBeInTheDocument();

      // No match
      fireEvent.change(searchInput, { target: { value: 'NonExistentString' } });
      expect(screen.getByText(/No security action logs found matching your criteria/i)).toBeInTheDocument();
    });

    it('handles pagination next and previous transitions', () => {
      render(<ActionLogTable initialLogs={manyLogs} />);

      expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
      expect(screen.getByText('User action sequence #1')).toBeInTheDocument();

      const nextBtn = screen.getByRole('button', { name: /Next →/i });
      fireEvent.click(nextBtn);

      expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
      expect(screen.getByText('User action sequence #11')).toBeInTheDocument();

      const prevBtn = screen.getByRole('button', { name: /← Previous/i });
      fireEvent.click(prevBtn);

      expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
    });
  });

  describe('ActionLogPage Component', () => {
    it('renders page header, breadcrumb, and table with default props', () => {
      render(<ActionLogPage />);

      expect(screen.getByText('Security Action Audit Log')).toBeInTheDocument();
      expect(screen.getByText(/Settings > Action Log/i)).toBeInTheDocument();
      expect(screen.getByTestId('action-log-table')).toBeInTheDocument();
    });

    it('renders page with custom initialLogs', () => {
      render(<ActionLogPage initialLogs={mockLogs} />);

      expect(screen.getByText('Created user tariq@lulu.com')).toBeInTheDocument();
    });
  });
});
