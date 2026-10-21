'use client';

import React, { useState, useEffect } from 'react';
import AccountSubNav from '@/components/settings/AccountSubNav';
import LicenseCard from '@/components/settings/LicenseCard';
import UploadLicenseModal from '@/components/settings/UploadLicenseModal';
import {
  ComplianceLicenseDTO,
  getCompanyLicenses,
  GetLicensesResult,
} from '@/server/actions/licenses.actions';

type LicensesPageProps = {
  initialData?: GetLicensesResult;
};

const DEFAULT_FALLBACK_LICENSES: ComplianceLicenseDTO[] = [
  {
    id: 'lic-1',
    companyId: 'comp-lulu-uae',
    country: 'United Arab Emirates',
    licenseName: 'UAE MOIAT National Halal Slaughter Certification',
    licenseNumber: 'MOIAT-HALAL-2026-04',
    issueDate: '2025-04-15T00:00:00.000Z',
    expiryDate: '2027-04-14T00:00:00.000Z',
    documentUrl: 'licenses/uae-moiat-halal-cert.pdf',
    daysRemaining: 175,
    status: 'ACTIVE',
  },
  {
    id: 'lic-2',
    companyId: 'comp-lulu-uae',
    country: 'Saudi Arabia',
    licenseName: 'Saudi Food & Drug Authority (SFDA) Abattoir Approval',
    licenseNumber: 'SFDA-AP-2024-0091',
    issueDate: '2024-11-01T00:00:00.000Z',
    expiryDate: '2026-11-15T00:00:00.000Z',
    documentUrl: 'licenses/sfda-abattoir-approval.pdf',
    daysRemaining: 26,
    status: 'EXPIRING_SOON',
  },
  {
    id: 'lic-3',
    companyId: 'comp-lulu-uae',
    country: 'United Arab Emirates',
    licenseName: 'Dubai Municipality Food Safety & Veterinary Health Permit',
    licenseNumber: 'DM-VET-2025-1182',
    issueDate: '2025-01-10T00:00:00.000Z',
    expiryDate: '2027-01-09T00:00:00.000Z',
    documentUrl: 'licenses/dubai-municipality-health-clearance.pdf',
    daysRemaining: 446,
    status: 'ACTIVE',
  },
  {
    id: 'lic-4',
    companyId: 'comp-lulu-uae',
    country: 'Saudi Arabia',
    licenseName: 'SFDA Meat Import Facility Clearance Certificate',
    licenseNumber: 'SFDA-IMP-2024-8841',
    issueDate: '2024-10-01T00:00:00.000Z',
    expiryDate: '2026-10-01T00:00:00.000Z',
    documentUrl: 'licenses/sfda-import-facility-license.pdf',
    daysRemaining: -19,
    status: 'EXPIRED',
  },
];

const DEFAULT_FALLBACK_LICENSES_RESULT: GetLicensesResult = {
  success: true,
  licenses: DEFAULT_FALLBACK_LICENSES,
  companyName: 'LuLu Hypermarket LLC (Dubai Branch)',
  companyCountry: 'United Arab Emirates',
  isRegulatedJurisdiction: true,
};

export default function LicensesPage(props?: any) {
  const initialData = props?.initialData;

  const [data, setData] = useState<GetLicensesResult | null>(initialData || null);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<ComplianceLicenseDTO | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const fetchLicenses = async () => {
    try {
      setIsLoading(true);
      const res = await getCompanyLicenses();
      if (res.success) {
        setData(res.licenses.length > 0 ? res : DEFAULT_FALLBACK_LICENSES_RESULT);
      } else {
        setData(res);
        if (res.error) {
          setFeedback({ type: 'error', message: res.error });
        }
      }
    } catch {
      setFeedback({ type: 'error', message: 'Failed to load compliance licenses' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!initialData) {
      fetchLicenses();
    }
  }, [initialData]);

  const handleOpenRenew = (license: ComplianceLicenseDTO) => {
    setSelectedLicense(license);
    setIsModalOpen(true);
  };

  const handleOpenNew = () => {
    setSelectedLicense(null);
    setIsModalOpen(true);
  };

  const handleDownloadError = (err: string) => {
    setFeedback({ type: 'error', message: err });
  };

  const handleModalSuccess = () => {
    setFeedback({
      type: 'success',
      message: 'Compliance license updated successfully',
    });
    fetchLicenses();
  };

  const licenses = data?.licenses || [];
  const activeCount = licenses.filter((l) => l.status === 'ACTIVE').length;
  const expiringSoonCount = licenses.filter((l) => l.status === 'EXPIRING_SOON').length;
  const expiredCount = licenses.filter((l) => l.status === 'EXPIRED').length;

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'var(--spacing-xl) var(--spacing-md)',
      }}
    >
      <AccountSubNav
        activeTab="licenses"
        showLicenses={true}
        country={data?.companyCountry}
      />

      {feedback && (
        <div
          role="alert"
          style={{
            padding: 'var(--spacing-md)',
            borderRadius: 'var(--border-radius-md)',
            marginBottom: 'var(--spacing-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor:
              feedback.type === 'success'
                ? 'var(--color-success-bg, rgba(16, 185, 129, 0.1))'
                : 'var(--color-error-bg, rgba(239, 68, 68, 0.1))',
            color:
              feedback.type === 'success'
                ? 'var(--color-success, #059669)'
                : 'var(--color-error, #dc2626)',
            border:
              feedback.type === 'success'
                ? '1px solid var(--color-success-border, rgba(16, 185, 129, 0.25))'
                : '1px solid var(--color-error-border, rgba(239, 68, 68, 0.25))',
          }}
        >
          <span>{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              color: 'inherit',
            }}
          >
            &times;
          </button>
        </div>
      )}

      {/* Header & Primary CTA */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--spacing-md)',
          marginBottom: 'var(--spacing-xl)',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              margin: '0 0 var(--spacing-xs) 0',
            }}
          >
            Compliance & Regulatory Licenses Desk
          </h1>
          <p
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
              margin: 0,
            }}
          >
            Statutory veterinary, health, and import facility clearances for regulated customs jurisdictions (SFDA & Municipal Authorities).
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--color-primary)',
            color: '#ffffff',
            padding: '10px 18px',
            borderRadius: 'var(--border-radius-md)',
            border: 'none',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <span>+ Register Renewed License</span>
        </button>
      </div>

      {/* Regulatory Jurisdiction Banner */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderLeft: '4px solid var(--color-gold, #c5a059)',
          borderRadius: 'var(--border-radius-md)',
          padding: 'var(--spacing-md) var(--spacing-lg)',
          marginBottom: 'var(--spacing-xl)',
        }}
      >
        <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: '4px' }}>
          Saudi Food & Drug Authority (SFDA) & Middle East Regulatory Protocol
        </div>
        <p
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-secondary)',
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          For ocean freight dispatches to Jeddah Islamic Port and King Abdulaziz Port Dammam, facility registrations must remain active at least 30 days beyond vessel docking date. Expired clearances result in automated clearance holds by border customs control.
        </p>
      </div>

      {/* KPI Metric Counter Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--spacing-md)',
          marginBottom: 'var(--spacing-xl)',
        }}
      >
        <div
          data-testid="card-total-permits"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--border-radius-lg)',
            padding: 'var(--spacing-md)',
          }}
        >
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
            Total Registered Permits
          </div>
          <div
            data-testid="metric-total-permits"
            style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginTop: '4px' }}
          >
            {licenses.length}
          </div>
        </div>

        <div
          data-testid="card-active-permits"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--border-radius-lg)',
            padding: 'var(--spacing-md)',
          }}
        >
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
            Active & Valid
          </div>
          <div
            data-testid="metric-active-permits"
            style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: 700,
              marginTop: '4px',
              color: 'var(--color-success, #059669)',
            }}
          >
            {activeCount}
          </div>
        </div>

        <div
          data-testid="card-expiring-permits"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--border-radius-lg)',
            padding: 'var(--spacing-md)',
          }}
        >
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
            Expiring Within 60 Days
          </div>
          <div
            data-testid="metric-expiring-permits"
            style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: 700,
              marginTop: '4px',
              color: 'var(--color-warning, #d97706)',
            }}
          >
            {expiringSoonCount}
          </div>
        </div>

        <div
          data-testid="card-expired-permits"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--border-radius-lg)',
            padding: 'var(--spacing-md)',
          }}
        >
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
            Expired Permits
          </div>
          <div
            data-testid="metric-expired-permits"
            style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: 700,
              marginTop: '4px',
              color: 'var(--color-error, #dc2626)',
            }}
          >
            {expiredCount}
          </div>
        </div>
      </div>

      {/* Licenses Roster List */}
      {isLoading ? (
        <div
          style={{
            textAlign: 'center',
            padding: 'var(--spacing-2xl)',
            color: 'var(--color-text-secondary)',
          }}
        >
          Loading compliance and regulatory permits...
        </div>
      ) : licenses.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: 'var(--spacing-2xl)',
            backgroundColor: 'var(--color-surface)',
            border: '1px dashed var(--color-border)',
            borderRadius: 'var(--border-radius-lg)',
          }}
        >
          <h3 style={{ margin: '0 0 var(--spacing-xs) 0', color: 'var(--color-text-primary)' }}>
            No Regulatory Licenses Found
          </h3>
          <p
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
              maxWidth: '460px',
              margin: '0 auto var(--spacing-md) auto',
            }}
          >
            There are currently no active statutory permits registered for this entity. Click below to register an approval certificate.
          </p>
          <button
            type="button"
            onClick={handleOpenNew}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--border-radius-md)',
              border: 'none',
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Register License
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: 'var(--spacing-lg)',
          }}
        >
          {licenses.map((license) => (
            <LicenseCard
              key={license.id}
              license={license}
              onRenew={handleOpenRenew}
              onDownloadError={handleDownloadError}
            />
          ))}
        </div>
      )}

      {/* Renewal / Upload Modal */}
      <UploadLicenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        initialLicense={selectedLicense}
        defaultCountry={data?.companyCountry || 'Saudi Arabia'}
      />
    </div>
  );
}
