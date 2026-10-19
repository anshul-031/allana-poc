import React from 'react';
import { getCustomProductRequests } from '@/server/actions/npd.actions';
import NpdDashboardView from '@/components/npd/NpdDashboardView';

export default async function CustomizedProductsPage() {
  const result = await getCustomProductRequests();

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
      <NpdDashboardView initialRequests={result.requests} />
    </div>
  );
}
