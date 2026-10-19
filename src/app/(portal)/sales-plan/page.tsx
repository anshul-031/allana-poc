import React from 'react';
import { Metadata } from 'next';
import { getSalesPlanData } from '@/server/actions/sales-plan.actions';
import SalesPlanPortalView from '@/components/sales-plan/SalesPlanPortalView';

export const metadata: Metadata = {
  title: 'Sales Plan & Forecasting | Allana Customer Portal',
  description:
    'Interactive multi-destination supply chain quota matrix, shipment pipeline execution, and delta variance tracking.',
};

export default async function SalesPlanPage() {
  const initialData = await getSalesPlanData();

  return (
    <div
      data-testid="sales-plan-page"
      style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: 'var(--spacing-xl) var(--spacing-lg)',
        width: '100%',
      }}
    >
      <SalesPlanPortalView initialData={initialData} />
    </div>
  );
}
