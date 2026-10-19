'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = 2026;

  return (
    <footer className="portal-footer" role="contentinfo">
      <div className="footer-container">
        <div className="footer-left">
          <p className="footer-copy">
            &copy; {currentYear} Allanasons Private Limited. All rights reserved.
          </p>
          <p className="footer-subcopy">
            ISO 22000 | HACCP | FSSAI | SFDA Approved | 100% Halal Slaughter
          </p>
        </div>

        <div className="footer-center">
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
            aria-label="Twitter / X"
          >
            <span>𝕏</span>
          </a>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
            aria-label="Facebook"
          >
            <span>f</span>
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
            aria-label="LinkedIn"
          >
            <span>in</span>
          </a>
        </div>

        <div className="footer-right">
          <Link href="/terms" className="footer-link">
            General terms and conditions
          </Link>
          <span className="footer-dot">•</span>
          <a
            href="/api/storage/presign-download?key=manuals/allana-user-manual.pdf"
            className="footer-link"
            download
            aria-label="Download User Manual"
          >
            Manual
          </a>
          <span className="footer-dot">•</span>
          <Link href="/claims/new-request" className="footer-link">
            Help & Support
          </Link>
        </div>
      </div>

      <style jsx>{`
        .portal-footer {
          background-color: #071120;
          color: #94a3b8;
          padding: 1.75rem 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 0.8125rem;
        }
        .footer-container {
          max-width: 1380px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1.25rem;
        }
        .footer-left {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .footer-copy {
          color: #cbd5e1;
          font-weight: 500;
        }
        .footer-subcopy {
          color: #64748b;
          font-size: 0.75rem;
        }
        .footer-center {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .social-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          color: #cbd5e1;
          text-decoration: none;
          font-weight: 700;
          font-size: 0.875rem;
          transition: all 0.2s ease;
        }
        .social-link:hover {
          background: #c5a059;
          color: #071120;
          transform: translateY(-2px);
        }
        .footer-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .footer-link {
          color: #94a3b8;
          text-decoration: none;
          transition: color 0.15s ease;
        }
        .footer-link:hover {
          color: #c5a059;
        }
        .footer-dot {
          color: #475569;
        }
        @media (max-width: 768px) {
          .footer-container {
            flex-direction: column;
            text-align: center;
          }
          .footer-center {
            justify-content: center;
          }
          .footer-right {
            justify-content: center;
          }
        }
      `}</style>
    </footer>
  );
}
