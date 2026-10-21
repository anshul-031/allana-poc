import React from 'react';
import { Metadata } from 'next';
import { getClaimsList } from '@/server/actions/claims.actions';
import { ClaimsPortalView } from '@/components/claims/ClaimsPortalView';
import { filterFallbackClaims } from '@/lib/fallback-claims';

export const metadata: Metadata = {
  title: 'Claims & Complaints Desk | Allana Customer Portal',
  description:
    'Track quality deviations, shortage disputes, transit temperature deviations, and regulatory information requests.',
};

export default async function ClaimsPage() {
  const result = await getClaimsList();
  const fallback = filterFallbackClaims();
  const claims = result.success && result.claims.length > 0 ? result.claims : fallback.claims;
  const total = result.success && result.claims.length > 0 ? result.total : fallback.total;

  return (
    <div
      data-testid="claims-page"
      style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: 'var(--spacing-xl) var(--spacing-lg)',
        width: '100%',
      }}
    >
      <ClaimsPortalView initialClaims={claims} initialTotal={total} />
    </div>
  );
}
