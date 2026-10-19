import React from 'react';
import { getShipmentsList } from '@/server/actions/shipments.actions';
import ShipmentsPortalView from '@/components/shipments/ShipmentsPortalView';

export default async function ShipmentsPage() {
  const result = await getShipmentsList({ limit: 10 });

  return (
    <div
      data-testid="shipments-page"
      style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: 'var(--spacing-xl) var(--spacing-lg)',
        width: '100%',
      }}
    >
      <ShipmentsPortalView initialData={result} />
    </div>
  );
}
