import React from 'react';
import HeroSlider from '@/components/dashboard/HeroSlider';
import LicenseAlertBanner from '@/components/dashboard/LicenseAlertBanner';
import FinancialCards from '@/components/dashboard/FinancialCards';
import RecentShipmentsWidget from '@/components/dashboard/RecentShipmentsWidget';
import NewsGrid from '@/components/dashboard/NewsGrid';

export const metadata = {
  title: 'Executive Dashboard | Allana Customer Export Portal',
  description:
    'Overview of credit facility, trade receivables, real-time reefer shipments, SFDA regulatory compliance, and agro-export market intelligence.',
};

export default function DashboardPage() {
  const companyId = 'comp-lulu-uae';
  return (
    <div
      data-testid="dashboard-page-container"
      style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: 'var(--spacing-xl) var(--spacing-lg)',
        width: '100%',
      }}
    >
      {/* 1. Hero Corporate Announcement Slider */}
      <HeroSlider />

      {/* 2. Contextual Action Alert Banner (Shipments Updates & License Expiry) */}
      <LicenseAlertBanner companyId={companyId} />

      {/* 3. Financial KPI Cards & Multi-Sales Organization Selector */}
      <FinancialCards companyId={companyId} />

      {/* 4. Recent Shipments Widget (Last 3 Months) */}
      <RecentShipmentsWidget companyId={companyId} />

      {/* 5. Latest Export News & Market Insights Grid */}
      <NewsGrid />
    </div>
  );
}
