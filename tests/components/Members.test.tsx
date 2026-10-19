import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import AddMemberModal from '@/components/members/AddMemberModal';
import EditMemberModal from '@/components/members/EditMemberModal';
import DeleteMemberModal from '@/components/members/DeleteMemberModal';
import MembersPage from '@/app/(portal)/settings/members/page';
import * as membersActions from '@/server/actions/members.actions';

vi.mock('@/server/actions/members.actions', () => ({
  createMember: vi.fn(),
  updateMember: vi.fn(),
  deleteMember: vi.fn(),
}));

const mockMember: membersActions.SanitizedMember = {
  id: 'u-101',
  email: 'farhan.khan@lulugroup.com',
  firstName: 'Farhan',
  lastName: 'Khan',
  patronymic: 'Ahmed',
  phone: '+971 50 222 3344',
  comment: 'Procurement manager',
  jobTitle: 'Procurement Specialist',
  role: 'BUYER',
  permissions: ['VIEW_CATALOG', 'VIEW_SHIPMENTS'],
  isActive: true,
  twoFactorEnabled: true,
  createdAt: new Date('2026-01-10T10:00:00Z'),
};

const mockMemberNoPerms: membersActions.SanitizedMember = {
  id: 'u-102',
  email: 'guest@lulugroup.com',
  firstName: 'Guest',
  lastName: null,
  patronymic: null,
  phone: null,
  comment: null,
  jobTitle: null,
  role: 'BUYER',
  permissions: [],
  isActive: false,
  twoFactorEnabled: false,
  createdAt: new Date('2026-01-15T10:00:00Z'),
};

describe('Members Components & Page (FEAT-1.4)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AddMemberModal Component', () => {
    it('returns null when isOpen is false', () => {
      const { container } = render(
        <AddMemberModal
          isOpen={false}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
          authorId="u-admin"
          companyId="comp-1"
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders form inputs and handles permission toggles', () => {
      render(
        <AddMemberModal
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
          authorId="u-admin"
          companyId="comp-1"
        />
      );

      expect(screen.getByText('👤 Add New User')).toBeInTheDocument();
      expect(screen.getByLabelText(/Name \*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email \*/i)).toBeInTheDocument();

      // Toggle permissions
      const catCheckbox = screen.getByLabelText('View Catalog');
      expect(catCheckbox).toBeChecked();
      fireEvent.click(catCheckbox);
      expect(catCheckbox).not.toBeChecked();
      fireEvent.click(catCheckbox);
      expect(catCheckbox).toBeChecked();
    });

    it('submits form with all fields modified, calls createMember, onSuccess, and onClose', async () => {
      const mockOnClose = vi.fn();
      const mockOnSuccess = vi.fn();
      vi.mocked(membersActions.createMember).mockResolvedValueOnce({
        success: true,
        member: mockMember,
      });

      render(
        <AddMemberModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          authorId="u-admin"
          companyId="comp-1"
        />
      );

      fireEvent.change(screen.getByLabelText(/Name \*/i), { target: { value: 'Samir' } });
      fireEvent.change(screen.getByLabelText(/Surname/i), { target: { value: 'Qureshi' } });
      fireEvent.change(screen.getByLabelText(/Patronymic/i), { target: { value: 'Ali' } });
      fireEvent.change(screen.getByLabelText(/Email \*/i), { target: { value: 'samir@lulu.com' } });
      fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '+971 50 1234567' } });
      fireEvent.change(screen.getByLabelText(/Job Title/i), { target: { value: 'QA Lead' } });
      fireEvent.change(screen.getByLabelText(/Comment/i), { target: { value: 'Responsible for meats' } });
      fireEvent.click(screen.getByLabelText(/Active Account/i));
      fireEvent.click(screen.getByLabelText(/Two-Factor Authorization/i));

      fireEvent.click(screen.getByRole('button', { name: /Create User/i }));

      await waitFor(() => {
        expect(membersActions.createMember).toHaveBeenCalledWith(
          expect.objectContaining({
            firstName: 'Samir',
            lastName: 'Qureshi',
            patronymic: 'Ali',
            email: 'samir@lulu.com',
            phone: '+971 50 1234567',
            jobTitle: 'QA Lead',
            comment: 'Responsible for meats',
            isActive: false,
            twoFactorEnabled: true,
          }),
          'u-admin',
          'comp-1'
        );
        expect(mockOnSuccess).toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('displays error banner when createMember fails', async () => {
      vi.mocked(membersActions.createMember).mockResolvedValueOnce({
        success: false,
        error: 'Email already registered',
      });

      render(
        <AddMemberModal
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
          authorId="u-admin"
          companyId="comp-1"
        />
      );

      fireEvent.change(screen.getByLabelText(/Name \*/i), { target: { value: 'Samir' } });
      fireEvent.change(screen.getByLabelText(/Email \*/i), { target: { value: 'samir@lulu.com' } });
      fireEvent.click(screen.getByRole('button', { name: /Create User/i }));

      await waitFor(() => {
        expect(screen.getByText(/Email already registered/i)).toBeInTheDocument();
      });
    });

    it('displays default error banner when createMember fails without error text', async () => {
      vi.mocked(membersActions.createMember).mockResolvedValueOnce({
        success: false,
      });

      render(
        <AddMemberModal
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
          authorId="u-admin"
          companyId="comp-1"
        />
      );

      fireEvent.change(screen.getByLabelText(/Name \*/i), { target: { value: 'Samir' } });
      fireEvent.change(screen.getByLabelText(/Email \*/i), { target: { value: 'samir@lulu.com' } });
      fireEvent.click(screen.getByRole('button', { name: /Create User/i }));

      await waitFor(() => {
        expect(screen.getByText(/Failed to create user/i)).toBeInTheDocument();
      });
    });

    it('catches and displays error when createMember throws exception', async () => {
      vi.mocked(membersActions.createMember).mockRejectedValueOnce(new Error('Network error'));

      render(
        <AddMemberModal
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
          authorId="u-admin"
          companyId="comp-1"
        />
      );

      fireEvent.change(screen.getByLabelText(/Name \*/i), { target: { value: 'Samir' } });
      fireEvent.change(screen.getByLabelText(/Email \*/i), { target: { value: 'samir@lulu.com' } });
      fireEvent.click(screen.getByRole('button', { name: /Create User/i }));

      await waitFor(() => {
        expect(screen.getByText(/An unexpected error occurred while creating user/i)).toBeInTheDocument();
      });
    });
  });

  describe('EditMemberModal Component', () => {
    it('returns null when isOpen is false or member is null', () => {
      const { container } = render(
        <EditMemberModal
          isOpen={false}
          member={mockMember}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
          authorId="u-admin"
          companyId="comp-1"
        />
      );
      expect(container.firstChild).toBeNull();

      const { container: container2 } = render(
        <EditMemberModal
          isOpen={true}
          member={null}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
          authorId="u-admin"
          companyId="comp-1"
        />
      );
      expect(container2.firstChild).toBeNull();
    });

    it('populates default empty strings for member with null optional fields', () => {
      render(
        <EditMemberModal
          isOpen={true}
          member={mockMemberNoPerms}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
          authorId="u-admin"
          companyId="comp-1"
        />
      );

      expect(screen.getByLabelText(/Name \*/i)).toHaveValue('Guest');
      expect(screen.getByLabelText(/Surname/i)).toHaveValue('');
      expect(screen.getByLabelText(/Patronymic/i)).toHaveValue('');
      expect(screen.getByLabelText(/Phone/i)).toHaveValue('');
      expect(screen.getByLabelText(/Job Title/i)).toHaveValue('');
      expect(screen.getByLabelText(/Comment/i)).toHaveValue('');
    });

    it('pre-populates inputs with member data, modifies fields, and saves changes', async () => {
      const mockOnClose = vi.fn();
      const mockOnSuccess = vi.fn();
      vi.mocked(membersActions.updateMember).mockResolvedValueOnce({
        success: true,
        member: mockMember,
      });

      render(
        <EditMemberModal
          isOpen={true}
          member={mockMember}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          authorId="u-admin"
          companyId="comp-1"
        />
      );

      expect(screen.getByText(/Edit User: farhan\.khan@lulugroup\.com/i)).toBeInTheDocument();

      fireEvent.change(screen.getByLabelText(/Name \*/i), { target: { value: 'Farhan Ali' } });
      fireEvent.change(screen.getByLabelText(/Surname/i), { target: { value: 'Qureshi' } });
      fireEvent.change(screen.getByLabelText(/Patronymic/i), { target: { value: 'Ahmed' } });
      fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '+971-55-999999' } });
      fireEvent.change(screen.getByLabelText(/Job Title/i), { target: { value: 'Director' } });
      fireEvent.change(screen.getByLabelText(/Comment/i), { target: { value: 'Updated note' } });
      fireEvent.click(screen.getByLabelText(/Active Account/i));
      fireEvent.click(screen.getByLabelText(/Two-Factor Authorization/i));

      // Toggle permissions
      const permCheckbox = screen.getByLabelText('View Shipments');
      fireEvent.click(permCheckbox); // Uncheck
      fireEvent.click(permCheckbox); // Recheck

      fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

      await waitFor(() => {
        expect(membersActions.updateMember).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'u-101',
            firstName: 'Farhan Ali',
            lastName: 'Qureshi',
            patronymic: 'Ahmed',
            phone: '+971-55-999999',
            jobTitle: 'Director',
            comment: 'Updated note',
            isActive: false,
            twoFactorEnabled: false,
          }),
          'u-admin',
          'comp-1'
        );
        expect(mockOnSuccess).toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('displays error banner when updateMember returns failure with custom error', async () => {
      vi.mocked(membersActions.updateMember).mockResolvedValueOnce({
        success: false,
        error: 'Update rejected',
      });

      render(
        <EditMemberModal
          isOpen={true}
          member={mockMember}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
          authorId="u-admin"
          companyId="comp-1"
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

      await waitFor(() => {
        expect(screen.getByText(/Update rejected/i)).toBeInTheDocument();
      });
    });

    it('displays default error banner when updateMember fails without error text', async () => {
      vi.mocked(membersActions.updateMember).mockResolvedValueOnce({
        success: false,
      });

      render(
        <EditMemberModal
          isOpen={true}
          member={mockMember}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
          authorId="u-admin"
          companyId="comp-1"
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

      await waitFor(() => {
        expect(screen.getByText(/Failed to update user/i)).toBeInTheDocument();
      });
    });

    it('catches and displays error when updateMember throws', async () => {
      vi.mocked(membersActions.updateMember).mockRejectedValueOnce(new Error('Network error'));

      render(
        <EditMemberModal
          isOpen={true}
          member={mockMember}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
          authorId="u-admin"
          companyId="comp-1"
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

      await waitFor(() => {
        expect(screen.getByText(/An unexpected error occurred while updating user/i)).toBeInTheDocument();
      });
    });
  });

  describe('DeleteMemberModal Component', () => {
    it('returns null when isOpen is false or member is null', () => {
      const { container } = render(
        <DeleteMemberModal
          isOpen={false}
          member={mockMember}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
          authorId="u-admin"
          companyId="comp-1"
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders confirmation prompt and deactivates member', async () => {
      const mockOnClose = vi.fn();
      const mockOnSuccess = vi.fn();
      vi.mocked(membersActions.deleteMember).mockResolvedValueOnce({
        success: true,
      });

      render(
        <DeleteMemberModal
          isOpen={true}
          member={mockMember}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          authorId="u-admin"
          companyId="comp-1"
        />
      );

      expect(screen.getByText(/Deactivate User Account/i)).toBeInTheDocument();
      expect(screen.getByText(/Farhan Khan \(farhan\.khan@lulugroup\.com\)/i)).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /Deactivate Member/i }));

      await waitFor(() => {
        expect(membersActions.deleteMember).toHaveBeenCalledWith('u-101', 'u-admin', 'comp-1');
        expect(mockOnSuccess).toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('renders confirmation prompt without lastName for member without surname', () => {
      render(
        <DeleteMemberModal
          isOpen={true}
          member={mockMemberNoPerms}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
          authorId="u-admin"
          companyId="comp-1"
        />
      );

      expect(screen.getByText(/Guest \(guest@lulugroup\.com\)/i)).toBeInTheDocument();
    });

    it('displays error banner when deleteMember returns failure', async () => {
      vi.mocked(membersActions.deleteMember).mockResolvedValueOnce({
        success: false,
        error: 'Cannot deactivate yourself',
      });

      render(
        <DeleteMemberModal
          isOpen={true}
          member={mockMember}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
          authorId="u-admin"
          companyId="comp-1"
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /Deactivate Member/i }));

      await waitFor(() => {
        expect(screen.getByText(/Cannot deactivate yourself/i)).toBeInTheDocument();
      });
    });

    it('displays default error banner when deleteMember fails without error text', async () => {
      vi.mocked(membersActions.deleteMember).mockResolvedValueOnce({
        success: false,
      });

      render(
        <DeleteMemberModal
          isOpen={true}
          member={mockMember}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
          authorId="u-admin"
          companyId="comp-1"
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /Deactivate Member/i }));

      await waitFor(() => {
        expect(screen.getByText(/Failed to deactivate member account/i)).toBeInTheDocument();
      });
    });

    it('catches and displays error when deleteMember throws', async () => {
      vi.mocked(membersActions.deleteMember).mockRejectedValueOnce(new Error('Network failure'));

      render(
        <DeleteMemberModal
          isOpen={true}
          member={mockMember}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
          authorId="u-admin"
          companyId="comp-1"
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /Deactivate Member/i }));

      await waitFor(() => {
        expect(screen.getByText(/An unexpected error occurred while deactivating member/i)).toBeInTheDocument();
      });
    });
  });

  describe('MembersPage Component', () => {
    it('renders roster table, triggers modals, and executes handleRefresh on success', async () => {
      vi.mocked(membersActions.createMember).mockResolvedValueOnce({
        success: true,
        member: mockMember,
      });

      render(
        <MembersPage
          initialMembers={[mockMember, mockMemberNoPerms]}
          authorId="u-admin"
          companyId="comp-1"
        />
      );

      expect(screen.getByText('Team Members & Granular Permissions')).toBeInTheDocument();
      expect(screen.getByText('farhan.khan@lulugroup.com')).toBeInTheDocument();
      expect(screen.getByText('🛡️ Enabled')).toBeInTheDocument();
      expect(screen.getByText('No specific permissions')).toBeInTheDocument();

      // Open Add modal and trigger successful submit to call handleRefresh
      fireEvent.click(screen.getByRole('button', { name: /\+ Add User/i }));
      expect(screen.getByText('👤 Add New User')).toBeInTheDocument();

      fireEvent.change(screen.getByLabelText(/Name \*/i), { target: { value: 'Newbie' } });
      fireEvent.change(screen.getByLabelText(/Email \*/i), { target: { value: 'newbie@lulu.com' } });
      fireEvent.click(screen.getByRole('button', { name: /Create User/i }));

      await waitFor(() => {
        expect(screen.queryByText('👤 Add New User')).not.toBeInTheDocument();
      });

      // Open Edit modal
      const editBtns = screen.getAllByRole('button', { name: /^EDIT$/i });
      fireEvent.click(editBtns[0]);
      expect(screen.getByText(/Edit User: farhan\.khan@lulugroup\.com/i)).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /Close modal/i }));

      // Open Delete modal
      const removeBtns = screen.getAllByRole('button', { name: /^REMOVE$/i });
      fireEvent.click(removeBtns[0]);
      expect(screen.getByText(/Deactivate User Account/i)).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    });

    it('filters member table rows in real-time', () => {
      render(
        <MembersPage
          initialMembers={[mockMember, mockMemberNoPerms]}
          authorId="u-admin"
          companyId="comp-1"
        />
      );

      const searchInput = screen.getByLabelText(/Filter member roster/i);
      fireEvent.change(searchInput, { target: { value: 'Farhan' } });

      expect(screen.getByText('farhan.khan@lulugroup.com')).toBeInTheDocument();
      expect(screen.queryByText('guest@lulugroup.com')).not.toBeInTheDocument();

      // Non-matching query
      fireEvent.change(searchInput, { target: { value: 'NonExistent' } });
      expect(screen.getByText(/No team members found matching/i)).toBeInTheDocument();
    });
  });
});

