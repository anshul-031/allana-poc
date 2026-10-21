import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { getClaimDetails } from '@/server/actions/claims.actions';
import { ClaimDetailView } from '@/components/claims/ClaimDetailView';
import { FALLBACK_CLAIMS } from '@/lib/fallback-claims';

interface ClaimDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ClaimDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const res = await getClaimDetails(id);
  const claim =
    res.success && res.claim
      ? res.claim
      : (FALLBACK_CLAIMS.find((c) => c.id === id || c.claimNumber === id) || null);

  if (claim) {
    return {
      title: `${claim.claimNumber} - ${claim.subject} | Allana Claims Desk`,
      description: `Audit details and resolution status for ticket ${claim.claimNumber}.`,
    };
  }
  return {
    title: 'Claim Details | Allana Customer Portal',
  };
}

export default async function ClaimDetailPage({ params }: ClaimDetailPageProps) {
  const { id } = await params;
  const res = await getClaimDetails(id);
  const claim =
    res.success && res.claim
      ? res.claim
      : (FALLBACK_CLAIMS.find((c) => c.id === id || c.claimNumber === id) || null);

  if (!claim) {
    return (
      <div
        data-testid="claim-not-found"
        style={{
          maxWidth: '600px',
          margin: '3rem auto',
          padding: '2.5rem',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-white)',
          border: '1px solid var(--color-slate-200)',
          textAlign: 'center',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔍</div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-slate-800)', margin: '0 0 0.5rem 0' }}>
          Ticket Not Found
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-600)', margin: '0 0 1.5rem 0' }}>
          {res.error || 'The requested claim ticket could not be found or you do not have permission to view it.'}
        </p>
        <Link
          href="/claims"
          style={{
            display: 'inline-block',
            padding: '0.5rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-primary-600)',
            color: 'var(--color-white)',
            fontSize: '0.875rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Back to Claims Desk
        </Link>
      </div>
    );
  }

  return (
    <div
      data-testid="claim-detail-page"
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '1.5rem',
      }}
    >
      <ClaimDetailView claim={claim} />
    </div>
  );
}
