import React from 'react';
import Header from '@/components/common/Header';
import BrandShowcase from '@/components/common/BrandShowcase';
import Footer from '@/components/common/Footer';

export interface PortalLayoutProps {
  children: React.ReactNode;
}

export default function PortalLayout({ children }: PortalLayoutProps) {
  // Default executive user context for portal shell
  const defaultUser = {
    id: 'usr-default',
    firstName: 'Ahmed',
    lastName: 'Mansoori',
    email: 'admin.lulu@lulumea.com',
    role: 'ADMIN',
  };

  const defaultCompany = {
    id: 'comp-lulu-uae',
    name: 'LuLu Hypermarket LLC (Dubai Branch)',
    code: 'LULU-DXB',
    country: 'United Arab Emirates',
    region: 'Middle East',
    telephone: '+971-4-2988880',
    email: 'meatbuyer.dxb@luluhypermarket.com',
    isParent: false,
    isActive: true,
  };

  return (
    <div
      data-testid="portal-layout-wrapper"
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
      }}
    >
      <Header
        user={defaultUser}
        activeCompany={defaultCompany}
        relatedCompanies={[defaultCompany]}
        unreadNotificationCount={3}
      />

      <main
        id="portal-main-content"
        style={{
          flex: 1,
          width: '100%',
        }}
      >
        {children}
      </main>

      <BrandShowcase />
      <Footer />
    </div>
  );
}
