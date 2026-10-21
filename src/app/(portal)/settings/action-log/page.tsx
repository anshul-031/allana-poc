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
    comment: 'Added Hamdan Al-Falasi (buyer.dxb@lulumea.com) with Buyer permissions',
    createdAt: new Date('2026-10-01T09:15:00Z'),
    author: {
      id: 'usr-default',
      firstName: 'Ahmed',
      lastName: 'Mansoori',
      email: 'admin.lulu@lulumea.com',
      role: 'ADMIN',
    },
  },
  {
    id: 'log-2',
    action: 'PERMISSIONS_UPDATED',
    comment: 'Granted DOWNLOAD_DOCUMENTS permission to QA Officer Karen White',
    createdAt: new Date('2026-10-05T11:30:00Z'),
    author: {
      id: 'usr-default',
      firstName: 'Ahmed',
      lastName: 'Mansoori',
      email: 'admin.lulu@lulumea.com',
      role: 'ADMIN',
    },
  },
  {
    id: 'log-3',
    action: 'SUBMIT_QUALITY_CLAIM',
    comment: 'Submitted quality claim CLM-2026-0038 (Temperature Abuse) with 1 product line',
    createdAt: new Date('2026-10-08T14:20:00Z'),
    author: {
      id: 'usr-qa-dxb',
      firstName: 'Karen',
      lastName: 'White',
      email: 'qa.dxb@lulumea.com',
      role: 'QA',
    },
  },
  {
    id: 'log-4',
    action: 'NPD_REQUEST_SUBMITTED',
    comment: 'Submitted Customized Product Request NPD-2026-014 for Chilled Goat Curry Cubes',
    createdAt: new Date('2026-10-10T16:00:00Z'),
    author: {
      id: 'usr-buyer-dxb',
      firstName: 'Hamdan',
      lastName: 'Al-Falasi',
      email: 'buyer.dxb@lulumea.com',
      role: 'BUYER',
    },
  },
  {
    id: 'log-5',
    action: 'LICENSE_UPLOADED',
    comment: 'Uploaded renewed UAE MOIAT National Halal Certification (MOIAT-HALAL-2026-04)',
    createdAt: new Date('2026-10-12T10:45:00Z'),
    author: {
      id: 'usr-default',
      firstName: 'Ahmed',
      lastName: 'Mansoori',
      email: 'admin.lulu@lulumea.com',
      role: 'ADMIN',
    },
  },
  {
    id: 'log-6',
    action: 'SOA_REPORT_GENERATED',
    comment: 'Exported certified Statement of Account (SOA) for September 2026 reconciliation',
    createdAt: new Date('2026-10-14T08:30:00Z'),
    author: {
      id: 'usr-finance-dxb',
      firstName: 'Fatima',
      lastName: 'Zahra',
      email: 'finance.dxb@lulumea.com',
      role: 'FINANCE',
    },
  },
  {
    id: 'log-7',
    action: 'USER_CREATED',
    comment: 'Added Fahad Al-Otaibi (buyer.ksa@lulumea.com) with Regional Buyer permissions',
    createdAt: new Date('2026-10-02T10:00:00Z'),
    author: {
      id: 'usr-default',
      firstName: 'Ahmed',
      lastName: 'Mansoori',
      email: 'admin.lulu@lulumea.com',
      role: 'ADMIN',
    },
  },
  {
    id: 'log-8',
    action: 'SUBMIT_QUALITY_CLAIM',
    comment: 'Filed temperature abuse claim CLM-2026-0044 for Jeddah Islamic Port container CMAU8192033',
    createdAt: new Date('2026-10-07T14:45:00Z'),
    author: {
      id: 'usr-qa-ksa',
      firstName: 'Dr. Abdullah',
      lastName: 'Al-Shehri',
      email: 'qa.ksa@lulumea.com',
      role: 'QA',
    },
  },
  {
    id: 'log-9',
    action: 'LICENSE_UPLOADED',
    comment: 'Uploaded renewed SFDA Meat Import Facility Approval (SFDA-IMP-2024-8841)',
    createdAt: new Date('2026-10-11T11:20:00Z'),
    author: {
      id: 'usr-default',
      firstName: 'Ahmed',
      lastName: 'Mansoori',
      email: 'admin.lulu@lulumea.com',
      role: 'ADMIN',
    },
  },
  {
    id: 'log-10',
    action: 'USER_CREATED',
    comment: 'Added Salim M.A. (procurement.corp@lulumea.com) as Group Director of Global Procurement',
    createdAt: new Date('2026-09-28T09:00:00Z'),
    author: {
      id: 'usr-corp-dir',
      firstName: 'M. A.',
      lastName: 'Yusuff',
      email: 'director.corp@lulumea.com',
      role: 'ADMIN',
    },
  },
  {
    id: 'log-11',
    action: 'SUBMIT_INFO_REQUEST',
    comment: 'Submitted Annual Group Vendor ESG & Traceability Audit Questionnaire (REQ-2026-0020)',
    createdAt: new Date('2026-10-05T16:30:00Z'),
    author: {
      id: 'usr-corp-proc',
      firstName: 'Salim',
      lastName: 'M.A.',
      email: 'procurement.corp@lulumea.com',
      role: 'BUYER',
    },
  },
];

export default function ActionLogPage(props?: any) {
  const initialLogs = props?.initialLogs || defaultLogs;
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
