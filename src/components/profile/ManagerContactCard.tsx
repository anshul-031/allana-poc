'use client';

import React, { useState } from 'react';

export interface ManagerInfo {
  name: string;
  email: string;
  phone: string;
  title?: string;
  location?: string;
}

interface ManagerContactCardProps {
  manager: ManagerInfo;
}

export default function ManagerContactCard({ manager }: ManagerContactCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const textToCopy = `${manager.name} | Email: ${manager.email} | Phone: ${manager.phone}`;
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="manager-card" data-testid="manager-contact-card">
      <div className="card-top-badge">
        <span className="badge-icon">⭐</span>
        <span>YOUR DEDICATED ALLANA EXPORT MANAGER</span>
      </div>

      <div className="card-main">
        <div className="avatar-wrapper">
          <div className="avatar-circle">
            {getInitials(manager.name || 'Allana Manager')}
          </div>
          <span className="online-indicator" title="Available during trade hours" />
        </div>

        <div className="manager-details">
          <h3 className="manager-name">{manager.name}</h3>
          <p className="manager-title">{manager.title || 'Senior Commercial Director – Global Agro & Meat Exports'}</p>
          <p className="manager-location">
            📍 {manager.location || 'Allana Corporate Center, Mumbai & Dubai Trade Hub'}
          </p>

          <div className="contact-methods">
            <div className="contact-row">
              <span className="contact-label">Direct Phone:</span>
              <a href={`tel:${manager.phone}`} className="contact-value link">
                📞 {manager.phone}
              </a>
            </div>

            <div className="contact-row">
              <span className="contact-label">Official Email:</span>
              <a href={`mailto:${manager.email}`} className="contact-value link">
                ✉️ {manager.email}
              </a>
            </div>

            <div className="contact-row">
              <span className="contact-label">Trading Hours:</span>
              <span className="contact-value">Mon – Fri: 09:00 – 18:00 (GST / UTC+4)</span>
            </div>
          </div>

          <div className="action-buttons-row">
            <a href={`mailto:${manager.email}`} className="btn-send-email">
              Send Email
            </a>
            <button
              type="button"
              className="btn-copy-contact"
              onClick={handleCopy}
              aria-label="Copy manager contact details"
            >
              {copied ? '✓ Copied!' : '📋 Copy Contact'}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .manager-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          overflow: hidden;
          margin-bottom: 2rem;
        }

        .card-top-badge {
          background: #0a192f;
          color: #c5a059;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          padding: 0.625rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .card-main {
          display: flex;
          gap: 1.5rem;
          padding: 1.5rem;
          align-items: flex-start;
        }

        .avatar-wrapper {
          position: relative;
          flex-shrink: 0;
        }

        .avatar-circle {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0a192f 0%, #1e3a8a 100%);
          color: #c5a059;
          font-size: 1.5rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid #f8fafc;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
        }

        .online-indicator {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 14px;
          height: 14px;
          background-color: #22c55e;
          border: 2px solid #ffffff;
          border-radius: 50%;
        }

        .manager-details {
          flex: 1;
        }

        .manager-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 0.25rem;
        }

        .manager-title {
          font-size: 0.875rem;
          color: #475569;
          font-weight: 500;
          margin-bottom: 0.25rem;
        }

        .manager-location {
          font-size: 0.8125rem;
          color: #64748b;
          margin-bottom: 1rem;
        }

        .contact-methods {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 8px;
          padding: 0.875rem;
          margin-bottom: 1.25rem;
        }

        .contact-row {
          display: flex;
          font-size: 0.8125rem;
          gap: 0.5rem;
        }

        .contact-label {
          width: 110px;
          font-weight: 600;
          color: #475569;
        }

        .contact-value {
          color: #0f172a;
          font-weight: 500;
        }

        .contact-value.link {
          color: #1e3a8a;
          text-decoration: none;
        }

        .contact-value.link:hover {
          text-decoration: underline;
        }

        .action-buttons-row {
          display: flex;
          gap: 0.75rem;
        }

        .btn-send-email {
          background-color: #0a192f;
          color: #ffffff;
          padding: 0.5rem 1.125rem;
          font-size: 0.8125rem;
          font-weight: 600;
          border-radius: 6px;
          text-decoration: none;
          transition: background-color 0.15s ease;
        }

        .btn-send-email:hover {
          background-color: #17335d;
        }

        .btn-copy-contact {
          background-color: #f1f5f9;
          color: #334155;
          border: 1px solid #cbd5e1;
          padding: 0.5rem 1.125rem;
          font-size: 0.8125rem;
          font-weight: 600;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-copy-contact:hover {
          background-color: #e2e8f0;
          color: #0f172a;
        }
      `}</style>
    </div>
  );
}
