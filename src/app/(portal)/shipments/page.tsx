import React from 'react';
import { getShipmentsList } from '@/server/actions/shipments.actions';
import ShipmentsPortalView from '@/components/shipments/ShipmentsPortalView';
import { filterFallbackShipments } from '@/lib/fallback-shipments';

export default async function ShipmentsPage() {
  const result = await getShipmentsList({ limit: 10 });
  const initialData =
    result.success && result.shipments.length > 0
      ? result
      : { success: true, ...filterFallbackShipments({ limit: 10 }) };

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
      <ShipmentsPortalView initialData={initialData} />
    </div>
  );
}
