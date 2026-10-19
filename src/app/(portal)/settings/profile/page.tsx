'use client';

import React, { useState } from 'react';
import ManagerContactCard, { ManagerInfo } from '@/components/profile/ManagerContactCard';
import RelatedCompaniesTable from '@/components/profile/RelatedCompaniesTable';
import { RelatedCompanyDTO } from '@/server/actions/company.actions';

export interface ProfilePageProps {
  initialCompany?: RelatedCompanyDTO;
  initialRelatedCompanies?: RelatedCompanyDTO[];
  initialManager?: ManagerInfo;
  userId?: string;
}

const defaultCompany: RelatedCompanyDTO = {
  id: 'comp-sub-uae',
  name: 'LuLu Hypermarket LLC (Dubai)',
  code: 'LULU-UAE',
  country: 'United Arab Emirates',
  region: 'Middle East & GCC',
  telephone: '+971 4 298 8888',
  email: 'procurement@ae.lulumea.com',
  isParent: false,
  isActive: true,
  managerName: 'Kareem Al-Sayed',
  managerEmail: 'kareem.alsayed@allana.com',
  managerPhone: '+971 50 882 1920',
};

const defaultRelatedCompanies: RelatedCompanyDTO[] = [
  {
    id: 'comp-parent-lulu',
    name: 'LuLu Group International (Holding HQ)',
    code: 'LULU-HQ',
    country: 'United Arab Emirates',
    region: 'Middle East & GCC',
    telephone: '+971 2 418 2000',
    email: 'corporate@lulugroup.com',
    isParent: true,
    isActive: true,
    managerName: 'Kareem Al-Sayed',
    managerEmail: 'kareem.alsayed@allana.com',
    managerPhone: '+971 50 882 1920',
  },
  {
    id: 'comp-sub-uae',
    name: 'LuLu Hypermarket LLC (Dubai)',
    code: 'LULU-UAE',
    country: 'United Arab Emirates',
    region: 'Middle East & GCC',
    telephone: '+971 4 298 8888',
    email: 'procurement@ae.lulumea.com',
    isParent: false,
    isActive: true,
    managerName: 'Kareem Al-Sayed',
    managerEmail: 'kareem.alsayed@allana.com',
    managerPhone: '+971 50 882 1920',
  },
  {
    id: 'comp-sub-ksa',
    name: 'LuLu Saudi Hypermarkets LLC (Riyadh)',
    code: 'LULU-KSA',
    country: 'Saudi Arabia',
    region: 'Middle East & GCC',
    telephone: '+966 11 405 5555',
    email: 'procurement@sa.lulumea.com',
    isParent: false,
    isActive: true,
    managerName: 'Kareem Al-Sayed',
    managerEmail: 'kareem.alsayed@allana.com',
    managerPhone: '+971 50 882 1920',
  },
];

const defaultManager: ManagerInfo = {
  name: 'Kareem Al-Sayed',
  title: 'Senior Commercial Director – Middle East & Africa Export Division',
  email: 'kareem.alsayed@allana.com',
  phone: '+971 50 882 1920',
  location: 'Allana Corporate Center, Dubai Trade Hub & Allanasons House Mumbai',
};

export default function ProfilePage({
  initialCompany = defaultCompany,
  initialRelatedCompanies = defaultRelatedCompanies,
  initialManager = defaultManager,
  userId = 'u-lulu-buyer-1',
}: ProfilePageProps) {
  const [company] = useState<RelatedCompanyDTO>(initialCompany);
  const [relatedCompanies] = useState<RelatedCompanyDTO[]>(initialRelatedCompanies);
  const [manager] = useState<ManagerInfo>(initialManager);

  return (
    <div className="profile-page-container">
      <header className="page-header">
        <div className="breadcrumb">Settings &gt; Company Profile</div>
        <h1 className="page-title">Company Profile &amp; Account Information</h1>
        <p className="page-description">
          Review your organization&apos;s registered corporate details, dedicated Allana Export Manager, and multi-company counterpart contracts.
        </p>
      </header>

      {/* Section 1: Company Profile Card */}
      <section className="profile-section" aria-labelledby="company-details-heading">
        <div className="card-header-row">
          <h2 id="company-details-heading" className="section-title">
            🏢 Corporate Registration Details
          </h2>
          <span className="corporate-badge">{company.isParent ? 'PARENT HOLDING' : 'OPERATING SUBSIDIARY'}</span>
        </div>

        <div className="details-grid">
          <div className="detail-field">
            <span className="field-label">Official Registered Name</span>
            <span className="field-value highlight">{company.name}</span>
          </div>

          <div className="detail-field">
            <span className="field-label">Allana Customer Code</span>
            <span className="field-value code">{company.code}</span>
          </div>

          <div className="detail-field">
            <span className="field-label">Operating Country</span>
            <span className="field-value">{company.country}</span>
          </div>

          <div className="detail-field">
            <span className="field-label">Trading Region</span>
            <span className="field-value">{company.region}</span>
          </div>

          <div className="detail-field">
            <span className="field-label">Registered Phone</span>
            <span className="field-value">{company.telephone || '—'}</span>
          </div>

          <div className="detail-field">
            <span className="field-label">Official Procurement Email</span>
            <span className="field-value">{company.email || '—'}</span>
          </div>
        </div>
      </section>

      {/* Section 2: Assigned Allana Manager */}
      <section aria-label="Assigned Allana Export Manager">
        <ManagerContactCard manager={manager} />
      </section>

      {/* Section 3: Related Counterparts Table */}
      <section aria-label="Related Corporate Entities">
        <RelatedCompaniesTable
          relatedCompanies={relatedCompanies}
          activeCompanyId={company.id}
          userId={userId}
        />
      </section>

      <style jsx>{`
        .profile-page-container {
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

        .profile-section {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.75rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .card-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 1rem;
        }

        .section-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .corporate-badge {
          background: #f1f5f9;
          color: #0f172a;
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          padding: 0.25rem 0.625rem;
          border-radius: 9999px;
          border: 1px solid #cbd5e1;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1.25rem;
        }

        .detail-field {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .field-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .field-value {
          font-size: 0.9375rem;
          color: #1e293b;
          font-weight: 500;
        }

        .field-value.highlight {
          font-weight: 700;
          color: #0f172a;
        }

        .field-value.code {
          font-family: monospace;
          background: #f8fafc;
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
          border: 1px solid #e2e8f0;
          width: fit-content;
        }
      `}</style>
    </div>
  );
}
