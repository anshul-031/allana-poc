import React from 'react';
import { getCustomProductRequests } from '@/server/actions/npd.actions';
import NpdDashboardView from '@/components/npd/NpdDashboardView';
import { FALLBACK_NPD_REQUESTS } from '@/lib/fallback-npd';

export default async function CustomizedProductsPage() {
  const result = await getCustomProductRequests();
  const requests =
    result.success && result.requests.length > 0
      ? result.requests
      : FALLBACK_NPD_REQUESTS;

  return (
    <div
      data-testid="customized-products-page"
      style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: 'var(--spacing-xl) var(--spacing-lg)',
        width: '100%',
      }}
    >
      <NpdDashboardView initialRequests={requests} />
    </div>
  );
}
