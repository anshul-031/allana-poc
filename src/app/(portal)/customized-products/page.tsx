import React from 'react';
import { getCustomProductRequests } from '@/server/actions/npd.actions';
import NpdDashboardView from '@/components/npd/NpdDashboardView';

export default async function CustomizedProductsPage() {
  const result = await getCustomProductRequests();

  return (
    <div
      data-testid="customized-products-page"
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: 'var(--spacing-xl, 24px) var(--spacing-lg, 16px)',
      }}
    >
      <NpdDashboardView initialRequests={result.requests} />
    </div>
  );
}
