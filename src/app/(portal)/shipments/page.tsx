import React from 'react';
import { getShipmentsList } from '@/server/actions/shipments.actions';
import ShipmentsPortalView from '@/components/shipments/ShipmentsPortalView';

export default async function ShipmentsPage() {
  const result = await getShipmentsList({ limit: 10 });

  return (
    <div
      data-testid="shipments-page"
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: 'var(--spacing-xl, 24px) var(--spacing-lg, 16px)',
      }}
    >
      <ShipmentsPortalView initialData={result} />
    </div>
  );
}
