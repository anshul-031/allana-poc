import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { getClaimantProfile } from '@/server/actions/claims.actions';
import { InfoRequestForm } from '@/components/claims/InfoRequestForm';

export const metadata: Metadata = {
  title: 'Submit Information Request | Allana Customer Portal',
  description:
    'Request questionnaires, specification sheets, shelf life extensions, and export compliance documents.',
};

export default async function NewRequestPage() {
  const profile = await getClaimantProfile();

  return (
    <div
      data-testid="new-request-page"
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '1.5rem',
      }}
    >
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.8125rem',
          color: 'var(--color-slate-500)',
          marginBottom: '1.5rem',
        }}
      >
        <Link href="/" style={{ color: 'var(--color-slate-600)', textDecoration: 'none' }}>
          Home
        </Link>
        <span>/</span>
        <Link href="/claims" style={{ color: 'var(--color-slate-600)', textDecoration: 'none' }}>
          Claims & Inquiries
        </Link>
        <span>/</span>
        <span style={{ color: 'var(--color-primary-700)', fontWeight: 600 }}>
          New Information Request
        </span>
      </nav>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: 'var(--color-primary-900)',
            margin: '0 0 0.35rem 0',
            fontFamily: 'var(--font-family-heading)',
          }}
        >
          Submit Information Request
        </h1>
        <p style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--color-slate-600)' }}>
          Request official technical questionnaires, regulatory declarations, and shelf life extension approvals.
        </p>
      </div>

      <InfoRequestForm
        userEmail={profile.userEmail}
        userName={profile.userName}
        companyName={profile.companyName}
      />
    </div>
  );
}
