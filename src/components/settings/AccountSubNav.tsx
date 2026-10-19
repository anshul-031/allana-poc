'use client';

import React from 'react';
import Link from 'next/link';

export interface AccountSubNavProps {
  activeTab: 'profile' | 'members' | 'licenses' | 'action-log' | 'password';
  showLicenses?: boolean;
  country?: string;
}

const REGULATED_COUNTRIES = [
  'saudi arabia',
  'ksa',
  'united arab emirates',
  'uae',
  'qatar',
  'kuwait',
  'egypt',
  'oman',
  'bahrain',
];

export function isRegulatedCountry(country?: string): boolean {
  if (!country) return false;
  return REGULATED_COUNTRIES.includes(country.trim().toLowerCase());
}

export default function AccountSubNav({
  activeTab,
  showLicenses = true,
  country,
}: AccountSubNavProps) {
  // Determine if licenses tab should be displayed
  // Show if explicitly enabled OR if the company belongs to a regulated jurisdiction
  const displayLicenses = showLicenses && (country ? isRegulatedCountry(country) : true);

  const navItems = [
    { id: 'profile', label: 'Company Profile', href: '/settings/profile' },
    { id: 'members', label: 'Members List', href: '/settings/members' },
    ...(displayLicenses
      ? [{ id: 'licenses', label: 'Compliance & Licenses (SFDA)', href: '/settings/licenses' }]
      : []),
    { id: 'action-log', label: 'Security Action Log', href: '/settings/action-log' },
    { id: 'password', label: 'Change Password', href: '/settings/change-password' },
  ];

  return (
    <nav
      aria-label="Account Settings Navigation"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--spacing-md)',
        padding: 'var(--spacing-md) var(--spacing-lg)',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--border-radius-lg)',
        border: '1px solid var(--color-border)',
        marginBottom: 'var(--spacing-xl)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
        <Link
          href="/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
            textDecoration: 'none',
            padding: '6px 12px',
            borderRadius: 'var(--border-radius-md)',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface-hover)',
            transition: 'var(--transition-fast)',
          }}
          title="Back to Main Dashboard"
        >
          <span aria-hidden="true">&larr;</span>
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div
        role="tablist"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 'var(--spacing-xs)',
        }}
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              role="tab"
              aria-selected={isActive}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '8px 16px',
                fontSize: 'var(--font-size-sm)',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)',
                backgroundColor: isActive ? 'var(--color-primary-light)' : 'transparent',
                border: isActive
                  ? '1px solid var(--color-primary-border)'
                  : '1px solid transparent',
                borderRadius: 'var(--border-radius-md)',
                textDecoration: 'none',
                transition: 'var(--transition-fast)',
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
