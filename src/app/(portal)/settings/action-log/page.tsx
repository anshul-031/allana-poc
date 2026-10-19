'use client';

import React, { useState } from 'react';
import ActionLogTable from '@/components/settings/ActionLogTable';
import { AuditLogEntry } from '@/server/actions/audit.actions';

export interface ActionLogPageProps {
  initialLogs?: AuditLogEntry[];
}

const defaultLogs: AuditLogEntry[] = [
  {
    id: 'log-1',
    action: 'USER_CREATED',
    comment: 'Added member rashid.alnoor@lulugroup.com (Rashid Al-Noor) with permissions: VIEW_FINANCIALS, VIEW_REPORTS, DOWNLOAD_DOCUMENTS',
    createdAt: new Date('2026-02-18T10:30:00Z'),
    author: {
      id: 'u-1',
      firstName: 'Tariq',
      lastName: 'Mansoor',
      email: 'tariq.mansoor@lulugroup.com',
      role: 'ADMIN',
    },
  },
  {
    id: 'log-2',
    action: 'PERMISSIONS_UPDATED',
    comment: 'Updated member zayn.malik@lulugroup.com details and permissions: VIEW_CATALOG, VIEW_SHIPMENTS, DOWNLOAD_DOCUMENTS, SUBMIT_CLAIMS',
    createdAt: new Date('2026-02-17T14:15:00Z'),
    author: {
      id: 'u-1',
      firstName: 'Tariq',
      lastName: 'Mansoor',
      email: 'tariq.mansoor@lulugroup.com',
      role: 'ADMIN',
    },
  },
  {
    id: 'log-3',
    action: 'COMPANY_SWITCHED',
    comment: 'Switched active company context to LuLu Saudi Hypermarkets LLC (LULU-KSA)',
    createdAt: new Date('2026-02-16T09:00:00Z'),
    author: {
      id: 'u-1',
      firstName: 'Tariq',
      lastName: 'Mansoor',
      email: 'tariq.mansoor@lulugroup.com',
      role: 'ADMIN',
    },
  },
  {
    id: 'log-4',
    action: 'PASSWORD_CHANGED',
    comment: 'Password changed successfully for user tariq.mansoor@lulugroup.com',
    createdAt: new Date('2026-02-15T11:45:00Z'),
    author: {
      id: 'u-1',
      firstName: 'Tariq',
      lastName: 'Mansoor',
      email: 'tariq.mansoor@lulugroup.com',
      role: 'ADMIN',
    },
  },
  {
    id: 'log-5',
    action: 'USER_DEACTIVATED',
    comment: 'Deactivated member account for former.buyer@lulugroup.com (Salim)',
    createdAt: new Date('2026-02-10T16:20:00Z'),
    author: {
      id: 'u-1',
      firstName: 'Tariq',
      lastName: 'Mansoor',
      email: 'tariq.mansoor@lulugroup.com',
      role: 'ADMIN',
    },
  },
];

export default function ActionLogPage({ initialLogs = defaultLogs }: ActionLogPageProps) {
  const [logs] = useState<AuditLogEntry[]>(initialLogs);

  return (
    <div className="action-log-page-container">
      <header className="page-header">
        <div className="breadcrumb">Settings &gt; Action Log</div>
        <h1 className="page-title">Security Action Audit Log</h1>
        <p className="page-description">
          Review chronological audit records of administrative operations, security authorizations, counterpart switches, and team access modifications for your corporate entity.
        </p>
      </header>

      <section aria-label="Security Audit Trail Table">
        <ActionLogTable initialLogs={logs} />
      </section>

      <style jsx>{`
        .action-log-page-container {
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
      `}</style>
    </div>
  );
}
