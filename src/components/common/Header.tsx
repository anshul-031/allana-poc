'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import CompanySwitcher from '@/components/common/CompanySwitcher';
import NotificationBell from '@/components/common/NotificationBell';
import LogoutModal from '@/components/common/LogoutModal';
import { RelatedCompanyDTO } from '@/server/actions/company.actions';

export interface HeaderUser {
  id: string;
  firstName: string;
  lastName?: string | null;
  email: string;
  role?: string;
}

export interface HeaderProps {
  user?: HeaderUser;
  activeCompany?: RelatedCompanyDTO | null;
  relatedCompanies?: RelatedCompanyDTO[];
  unreadNotificationCount?: number;
}

export const NAV_LINKS = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
  { id: 'catalog', label: 'Products Catalog', href: '/catalog' },
  { id: 'customized-products', label: 'Customized Product', href: '/customized-products' },
  { id: 'shipments', label: 'Shipments List', href: '/shipments' },
  { id: 'sales-plan', label: 'Sales Plan', href: '/sales-plan' },
  { id: 'reports', label: 'Reports', href: '/reports' },
  { id: 'news', label: 'News', href: '/news' },
  { id: 'claims', label: 'Claims and Requests', href: '/claims' },
];

export default function Header({
  user,
  activeCompany,
  relatedCompanies = [],
  unreadNotificationCount,
}: HeaderProps) {
  const pathname = usePathname() || '/dashboard';
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const settingsRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setIsSettingsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSettingsOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Close mobile menu on pathname change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const toggleSettings = () => {
    setIsSettingsOpen((prev) => !prev);
  };

  const closeSettings = () => {
    setIsSettingsOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleOpenLogout = () => {
    setIsSettingsOpen(false);
    setIsLogoutModalOpen(true);
  };

  const handleCloseLogout = () => {
    setIsLogoutModalOpen(false);
  };

  const initials = user
    ? `${user.firstName[0] || ''}${user.lastName ? user.lastName[0] : ''}`.toUpperCase()
    : 'AL';

  return (
    <header
      style={{
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        position: 'sticky',
        top: 0,
        zIndex: 900,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Top Corporate Bar */}
      <div
        style={{
          borderBottom: '1px solid var(--color-border-subtle, rgba(0,0,0,0.06))',
          backgroundColor: 'var(--color-background-subtle)',
          padding: '6px var(--spacing-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--spacing-md)',
          fontSize: 'var(--font-size-xs)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <CompanySwitcher
            userId={user?.id || 'usr-default'}
            initialActiveCompany={activeCompany || null}
            relatedCompanies={relatedCompanies}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <span style={{ color: 'var(--color-text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span>Worldwide Customer Support:</span>
            <strong style={{ color: 'var(--color-text-primary)' }}>+91 22 2281 1000</strong>
          </span>
        </div>
      </div>

      {/* Main Header Row */}
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 var(--spacing-lg)',
          height: '70px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--spacing-lg)',
        }}
      >
        {/* Brand Logo */}
        <Link
          href="/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none',
          }}
          aria-label="Allana Portal Dashboard"
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--border-radius-md)',
              backgroundColor: 'var(--color-primary-dark, #0a192f)',
              border: '2px solid var(--color-gold, #c5a059)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-gold, #c5a059)',
              fontWeight: 800,
              fontSize: '18px',
              letterSpacing: '1px',
            }}
          >
            A
          </div>
          <div>
            <div
              style={{
                fontSize: '18px',
                fontWeight: 800,
                letterSpacing: '0.12em',
                color: 'var(--color-primary-dark, #0a192f)',
                lineHeight: 1.1,
              }}
            >
              ALLANA
            </div>
            <div
              style={{
                fontSize: '9px',
                fontWeight: 600,
                letterSpacing: '0.18em',
                color: 'var(--color-gold, #c5a059)',
                textTransform: 'uppercase',
              }}
            >
              Customer Export Portal
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          aria-label="Primary Navigation"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            height: '100%',
          }}
        >
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === '/dashboard'
                ? pathname === '/dashboard' || pathname === '/'
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.id}
                href={link.href}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '8px 12px',
                  height: '100%',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive
                    ? 'var(--color-primary-dark, #071120)'
                    : 'var(--color-text-secondary)',
                  textDecoration: 'none',
                  borderBottom: isActive
                    ? '3px solid var(--color-gold, #c5a059)'
                    : '3px solid transparent',
                  transition: 'var(--transition-fast)',
                  whiteSpace: 'nowrap',
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Icons: Notification Bell & Settings Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <NotificationBell
            userId={user?.id}
            initialUnreadCount={unreadNotificationCount}
          />

          {/* User Settings Dropdown */}
          <div ref={settingsRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={toggleSettings}
              aria-label="Account Settings and Profile"
              aria-expanded={isSettingsOpen}
              aria-haspopup="true"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'none',
                border: '1px solid var(--color-border)',
                padding: '4px 8px 4px 4px',
                borderRadius: 'var(--border-radius-pill)',
                cursor: 'pointer',
                backgroundColor: isSettingsOpen ? 'var(--color-surface-hover)' : 'transparent',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                {initials}
              </div>
              <span
                style={{
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  maxWidth: '100px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user ? user.firstName : 'Account'}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>▼</span>
            </button>

            {isSettingsOpen && (
              <div
                role="menu"
                aria-label="Account Menu"
                data-testid="settings-dropdown"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '240px',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--border-radius-lg)',
                  boxShadow: 'var(--shadow-xl)',
                  padding: 'var(--spacing-xs) 0',
                  zIndex: 1000,
                }}
              >
                {/* User Header */}
                <div
                  style={{
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    borderBottom: '1px solid var(--color-border)',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                    {user ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Guest User'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                    {user ? user.email : 'guest@allana.com'}
                  </div>
                </div>

                <Link
                  href="/settings/profile"
                  role="menuitem"
                  onClick={closeSettings}
                  style={{
                    display: 'block',
                    padding: '8px var(--spacing-md)',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-primary)',
                    textDecoration: 'none',
                  }}
                >
                  Company Profile
                </Link>

                <Link
                  href="/settings/members"
                  role="menuitem"
                  onClick={closeSettings}
                  style={{
                    display: 'block',
                    padding: '8px var(--spacing-md)',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-primary)',
                    textDecoration: 'none',
                  }}
                >
                  Members List
                </Link>

                <Link
                  href="/settings/licenses"
                  role="menuitem"
                  onClick={closeSettings}
                  style={{
                    display: 'block',
                    padding: '8px var(--spacing-md)',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-primary)',
                    textDecoration: 'none',
                  }}
                >
                  Regulatory Licenses (SFDA)
                </Link>

                <Link
                  href="/settings/action-log"
                  role="menuitem"
                  onClick={closeSettings}
                  style={{
                    display: 'block',
                    padding: '8px var(--spacing-md)',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-primary)',
                    textDecoration: 'none',
                  }}
                >
                  Security Action Log
                </Link>

                <Link
                  href="/settings/change-password"
                  role="menuitem"
                  onClick={closeSettings}
                  style={{
                    display: 'block',
                    padding: '8px var(--spacing-md)',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-primary)',
                    textDecoration: 'none',
                  }}
                >
                  Change Password
                </Link>

                <div style={{ borderTop: '1px solid var(--color-border)', margin: '4px 0' }} />

                <button
                  type="button"
                  role="menuitem"
                  onClick={handleOpenLogout}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px var(--spacing-md)',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-error, #dc2626)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            data-testid="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '20px',
              padding: '4px',
            }}
          >
            &#9776;
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <nav
          aria-label="Mobile Navigation"
          data-testid="mobile-nav"
          style={{
            borderTop: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            padding: 'var(--spacing-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              onClick={closeMobileMenu}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--border-radius-md)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                textDecoration: 'none',
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={handleCloseLogout}
      />
    </header>
  );
}
