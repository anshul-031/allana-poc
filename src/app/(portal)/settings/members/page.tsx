'use client';

import React, { useState } from 'react';
import AddMemberModal from '@/components/members/AddMemberModal';
import EditMemberModal from '@/components/members/EditMemberModal';
import DeleteMemberModal from '@/components/members/DeleteMemberModal';
import { SanitizedMember } from '@/server/actions/members.actions';

export interface MembersPageProps {
  initialMembers?: SanitizedMember[];
  authorId?: string;
  companyId?: string;
}

const defaultMembers: SanitizedMember[] = [
  {
    id: 'u-1',
    email: 'tariq.mansoor@lulugroup.com',
    firstName: 'Tariq',
    lastName: 'Mansoor',
    patronymic: 'Ahmed',
    phone: '+971 50 111 2233',
    comment: 'Senior Meat Procurement Director for UAE & Gulf stores',
    jobTitle: 'VP Procurement',
    role: 'ADMIN',
    permissions: [
      'CLIENT_MANAGEMENT',
      'VIEW_CLIENTS',
      'VIEW_LOGS',
      'VIEW_CATALOG',
      'ORDER_CUSTOM_PRODUCT',
      'VIEW_SHIPMENTS',
      'VIEW_FINANCIALS',
      'SUBMIT_CLAIMS',
      'VIEW_REPORTS',
      'DOWNLOAD_DOCUMENTS',
      'MANAGE_MEMBERS',
    ],
    isActive: true,
    twoFactorEnabled: true,
    createdAt: new Date('2025-10-15T08:30:00Z'),
  },
  {
    id: 'u-2',
    email: 'zayn.malik@lulugroup.com',
    firstName: 'Zayn',
    lastName: 'Malik',
    patronymic: null,
    phone: '+971 55 444 7788',
    comment: 'QA & Cold Chain Compliance Officer',
    jobTitle: 'QA Inspector',
    role: 'QA',
    permissions: [
      'VIEW_CATALOG',
      'VIEW_SHIPMENTS',
      'DOWNLOAD_DOCUMENTS',
      'SUBMIT_CLAIMS',
    ],
    isActive: true,
    twoFactorEnabled: false,
    createdAt: new Date('2025-11-20T10:00:00Z'),
  },
  {
    id: 'u-3',
    email: 'rashid.alnoor@lulugroup.com',
    firstName: 'Rashid',
    lastName: 'Al-Noor',
    patronymic: 'Salem',
    phone: '+971 52 999 8811',
    comment: 'Corporate Finance & Settlement Controller',
    jobTitle: 'Finance Controller',
    role: 'FINANCE',
    permissions: [
      'VIEW_FINANCIALS',
      'VIEW_REPORTS',
      'DOWNLOAD_DOCUMENTS',
    ],
    isActive: false,
    twoFactorEnabled: true,
    createdAt: new Date('2025-12-05T14:15:00Z'),
  },
];

export default function MembersPage({
  initialMembers = defaultMembers,
  authorId = 'u-1',
  companyId = 'comp-sub-uae',
}: MembersPageProps) {
  const [members, setMembers] = useState<SanitizedMember[]>(initialMembers);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<SanitizedMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<SanitizedMember | null>(null);

  const filteredMembers = members.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const fullName = `${m.firstName} ${m.lastName || ''} ${m.patronymic || ''}`.toLowerCase();
    return (
      fullName.includes(q) ||
      m.email.toLowerCase().includes(q) ||
      (m.phone && m.phone.toLowerCase().includes(q)) ||
      (m.jobTitle && m.jobTitle.toLowerCase().includes(q))
    );
  });

  const handleRefresh = () => {
    // In live portal, Server Action or router.refresh will supply updated data
  };

  return (
    <div className="members-page-container">
      <header className="page-header">
        <div className="breadcrumb">Settings &gt; Members List</div>
        <div className="header-actions-row">
          <div>
            <h1 className="page-title">Team Members &amp; Granular Permissions</h1>
            <p className="page-description">
              Manage authorized corporate accounts, assign modular export capabilities, and oversee two-factor security policies.
            </p>
          </div>
          <button
            type="button"
            className="btn-add-user"
            onClick={() => setIsAddOpen(true)}
          >
            + Add User
          </button>
        </div>
      </header>

      <div className="roster-card">
        <div className="roster-toolbar">
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, email, phone, or job title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Filter member roster"
          />
          <div className="members-count">
            {filteredMembers.length} {filteredMembers.length === 1 ? 'user' : 'users'}
          </div>
        </div>

        <div className="table-responsive">
          <table className="roster-table">
            <thead>
              <tr>
                <th scope="col">User / Corporate Email</th>
                <th scope="col">Contact Phone</th>
                <th scope="col">2FA Security</th>
                <th scope="col">Status</th>
                <th scope="col">Assigned Permissions</th>
                <th scope="col">Created Date</th>
                <th scope="col" className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="no-data-cell">
                    No team members found matching &ldquo;{searchQuery}&rdquo;
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="member-row">
                    <td>
                      <div className="user-info-cell">
                        <span className="user-name">
                          {member.firstName} {member.lastName || ''}{' '}
                          {member.patronymic ? `(${member.patronymic})` : ''}
                        </span>
                        <span className="user-email">{member.email}</span>
                        {member.jobTitle && <span className="job-badge">{member.jobTitle}</span>}
                      </div>
                    </td>
                    <td>{member.phone || '—'}</td>
                    <td>
                      <span
                        className={`badge-2fa ${member.twoFactorEnabled ? 'enabled' : 'disabled'}`}
                      >
                        {member.twoFactorEnabled ? '🛡️ Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${member.isActive ? 'active' : 'inactive'}`}>
                        {member.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="permissions-pill-cloud">
                        {member.permissions && member.permissions.length > 0 ? (
                          member.permissions.map((perm) => (
                            <span key={perm} className="perm-pill">
                              {perm.replace(/_/g, ' ')}
                            </span>
                          ))
                        ) : (
                          <span className="no-perms">No specific permissions</span>
                        )}
                      </div>
                    </td>
                    <td className="date-cell">
                      {new Date(member.createdAt).toLocaleDateString()}
                    </td>
                    <td className="text-right">
                      <div className="row-actions">
                        <button
                          type="button"
                          className="btn-action edit"
                          onClick={() => setEditingMember(member)}
                        >
                          EDIT
                        </button>
                        <button
                          type="button"
                          className="btn-action remove"
                          onClick={() => setDeletingMember(member)}
                        >
                          REMOVE
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AddMemberModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={handleRefresh}
        authorId={authorId}
        companyId={companyId}
      />

      <EditMemberModal
        isOpen={!!editingMember}
        member={editingMember}
        onClose={() => setEditingMember(null)}
        onSuccess={handleRefresh}
        authorId={authorId}
        companyId={companyId}
      />

      <DeleteMemberModal
        isOpen={!!deletingMember}
        member={deletingMember}
        onClose={() => setDeletingMember(null)}
        onSuccess={handleRefresh}
        authorId={authorId}
        companyId={companyId}
      />

      <style jsx>{`
        .members-page-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
          font-family: inherit;
        }

        .page-header {
          margin-bottom: 2rem;
        }

        .breadcrumb {
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }

        .header-actions-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .page-title {
          font-size: 1.75rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 0.5rem;
        }

        .page-description {
          font-size: 0.875rem;
          color: #64748b;
          max-width: 720px;
          line-height: 1.5;
        }

        .btn-add-user {
          background-color: #0a192f;
          color: #ffffff;
          border: none;
          padding: 0.625rem 1.25rem;
          font-size: 0.875rem;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.15s ease;
          white-space: nowrap;
        }

        .btn-add-user:hover {
          background-color: #17335d;
        }

        .roster-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }

        .roster-toolbar {
          padding: 1.25rem;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }

        .search-input {
          padding: 0.5rem 0.875rem;
          font-size: 0.875rem;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          outline: none;
          max-width: 420px;
          width: 100%;
        }

        .search-input:focus {
          border-color: #0a192f;
        }

        .members-count {
          font-size: 0.8125rem;
          color: #64748b;
          font-weight: 600;
        }

        .table-responsive {
          overflow-x: auto;
        }

        .roster-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.875rem;
        }

        .roster-table th {
          background-color: #ffffff;
          color: #475569;
          font-weight: 600;
          padding: 0.875rem 1rem;
          border-bottom: 1px solid #e2e8f0;
          white-space: nowrap;
        }

        .member-row {
          border-bottom: 1px solid #f1f5f9;
          transition: background-color 0.15s ease;
        }

        .member-row:hover {
          background-color: #f8fafc;
        }

        .member-row td {
          padding: 1rem;
          color: #334155;
          vertical-align: middle;
        }

        .user-info-cell {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .user-name {
          font-weight: 700;
          color: #0f172a;
        }

        .user-email {
          font-size: 0.8125rem;
          color: #64748b;
        }

        .job-badge {
          font-size: 0.6875rem;
          background: #eff6ff;
          color: #1e40af;
          padding: 0.1rem 0.4rem;
          border-radius: 4px;
          width: fit-content;
          margin-top: 0.15rem;
        }

        .badge-2fa {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
        }

        .badge-2fa.enabled {
          background: #dcfce7;
          color: #15803d;
        }

        .badge-2fa.disabled {
          background: #f1f5f9;
          color: #64748b;
        }

        .status-pill {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.2rem 0.6rem;
          border-radius: 9999px;
        }

        .status-pill.active {
          background: #dcfce7;
          color: #166534;
        }

        .status-pill.inactive {
          background: #fee2e2;
          color: #991b1b;
        }

        .permissions-pill-cloud {
          display: flex;
          flex-wrap: wrap;
          gap: 0.3rem;
          max-width: 280px;
        }

        .perm-pill {
          font-size: 0.6875rem;
          background: #f1f5f9;
          color: #334155;
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
          border: 1px solid #e2e8f0;
        }

        .no-perms {
          font-size: 0.75rem;
          color: #94a3b8;
          font-style: italic;
        }

        .date-cell {
          font-size: 0.8125rem;
          color: #64748b;
          white-space: nowrap;
        }

        .row-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
        }

        .btn-action {
          border: none;
          padding: 0.35rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 700;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-action.edit {
          background: #eff6ff;
          color: #1d4ed8;
          border: 1px solid #bfdbfe;
        }

        .btn-action.edit:hover {
          background: #dbeafe;
        }

        .btn-action.remove {
          background: #fef2f2;
          color: #b91c1c;
          border: 1px solid #fecaca;
        }

        .btn-action.remove:hover {
          background: #fee2e2;
        }

        .text-right {
          text-align: right;
        }

        .no-data-cell {
          text-align: center;
          padding: 2.5rem 1rem;
          color: #64748b;
        }
      `}</style>
    </div>
  );
}
