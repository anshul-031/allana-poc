import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardPage from '@/app/(portal)/page';
import DashboardRoutePage, { metadata } from '@/app/(portal)/dashboard/page';

// Mock child widgets to test dashboard page assembly cleanly
vi.mock('@/components/dashboard/HeroSlider', () => ({
  default: () => <div data-testid="mock-hero-slider">Hero Slider</div>,
}));

vi.mock('@/components/dashboard/LicenseAlertBanner', () => ({
  default: () => <div data-testid="mock-license-alert-banner">Alert Banner</div>,
}));

vi.mock('@/components/dashboard/FinancialCards', () => ({
  default: () => <div data-testid="mock-financial-cards">Financial Cards</div>,
}));

vi.mock('@/components/dashboard/RecentShipmentsWidget', () => ({
  default: () => <div data-testid="mock-recent-shipments-widget">Recent Shipments</div>,
}));

vi.mock('@/components/dashboard/NewsGrid', () => ({
  default: () => <div data-testid="mock-news-grid">News Grid</div>,
}));

describe('DashboardPage Component (src/app/(portal)/page.tsx and /dashboard/page.tsx)', () => {
  it('renders complete executive dashboard layout and all widgets from root page', () => {
    render(<DashboardPage />);

    expect(screen.getByTestId('dashboard-page-container')).toBeInTheDocument();
    expect(screen.getByTestId('mock-hero-slider')).toBeInTheDocument();
    expect(screen.getByTestId('mock-license-alert-banner')).toBeInTheDocument();
    expect(screen.getByTestId('mock-financial-cards')).toBeInTheDocument();
    expect(screen.getByTestId('mock-recent-shipments-widget')).toBeInTheDocument();
    expect(screen.getByTestId('mock-news-grid')).toBeInTheDocument();
  });

  it('renders complete executive dashboard from /dashboard re-export and exports metadata', () => {
    render(<DashboardRoutePage />);

    expect(screen.getByTestId('dashboard-page-container')).toBeInTheDocument();
    expect(metadata.title).toContain('Executive Dashboard');
  });
});
