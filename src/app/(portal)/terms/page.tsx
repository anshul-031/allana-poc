'use client';

import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="terms-page-container">
      <div className="terms-header">
        <div className="breadcrumb">
          <Link href="/" className="breadcrumb-link">
            Dashboard
          </Link>{' '}
          &gt; <span>General Terms and Conditions</span>
        </div>
        <h1 className="terms-title">General Export Terms &amp; Conditions</h1>
        <p className="terms-subtitle">
          Commercial, Quality, and Cold Chain Governance for International Meat &amp; Agro-Commodity Export Trade
        </p>
        <div className="terms-meta">
          <span>Effective: Calendar Year 2026</span>
          <span className="meta-dot">•</span>
          <span>Allanasons Private Limited &amp; Affiliated Subsidiaries</span>
          <span className="meta-dot">•</span>
          <span>Version 3.2</span>
        </div>
      </div>

      <div className="terms-card">
        <section className="terms-section">
          <h2>1. Scope &amp; Applicable Regulatory Standards</h2>
          <p>
            These General Terms and Conditions govern all sales contracts, order commitments, shipments,
            and deliveries of frozen boneless buffalo meat, chilled sheep/goat meat, value-added consumer portions,
            and agro-commodities executed by <strong>Allanasons Private Limited</strong> (and its export production facilities)
            to accredited corporate buyers and their authorized subsidiaries.
          </p>
          <p>
            All production processes, slaughter protocols, and processing facilities operate in strict compliance with:
          </p>
          <ul>
            <li><strong>FSSAI &amp; APEDA</strong> export standards (Government of India).</li>
            <li><strong>100% Halal Slaughter</strong> certified by accredited Halal Certification bodies (including Jamiat Ulama-i-Hind Halal Trust).</li>
            <li><strong>SFDA</strong> (Saudi Food and Drug Authority) and <strong>GCC Standardization Organization (GSO)</strong> requirements.</li>
            <li><strong>ISO 22000:2018 &amp; HACCP</strong> food safety management systems.</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>2. Delivery Terms &amp; Incoterms 2020</h2>
          <p>
            Unless explicitly agreed otherwise in a confirmed Sales Order or Proforma Invoice:
          </p>
          <ul>
            <li>
              <strong>FCA / FOB Shipments:</strong> Risk of loss or damage passes to the Buyer once the container is loaded
              and placed in the custody of the designated ocean carrier or port terminal operator at Nhava Sheva (JNPT) or Mundra port.
            </li>
            <li>
              <strong>CIF / CFR Shipments:</strong> The Seller contracts and prepays ocean freight to the agreed Port of Discharge (e.g., Jebel Ali, Dammam, Jeddah, Shuwaikh).
              Risk transfers upon vessel loading; marine cargo insurance covers Institute Frozen Meat Clauses (A) 24 hours.
            </li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>3. Cold Chain Integrity &amp; Transport Standards</h2>
          <p>
            Frozen meat products must be stored and transported under continuous refrigeration at or below <strong>-18°C (0°F)</strong>.
            Chilled vacuum-packed products must be maintained strictly between <strong>0°C and +2°C</strong>.
          </p>
          <p>
            Containers are pre-tripped and temperature-monitored. The Buyer or consignee must extract and archive the digital
            data logger record upon opening container seals at destination port prior to devanning.
          </p>
        </section>

        <section className="terms-section">
          <h2>4. Inspection, Claims &amp; Non-Conformity Protocol</h2>
          <p>
            The Buyer must inspect cargo immediately upon container discharge and customs clearance:
          </p>
          <ul>
            <li>
              <strong>Notice Period:</strong> Any claim regarding quality defects, packaging integrity, temperature deviation,
              or quantity discrepancies must be formally registered via the <em>Customer Claims and Requests Portal</em> within
              <strong> 14 calendar days</strong> of vessel discharge.
            </li>
            <li>
              <strong>Required Evidence:</strong> All claims must specify the container number, bill of lading, affected product articles,
              lot numbers, non-conforming weight (kg to 4 decimal precision), and be accompanied by photographic evidence of carton labels
              and continuous temperature data logger graphs.
            </li>
            <li>
              <strong>Resolution:</strong> Claims are reviewed collaboratively by Allana Quality Control and Commercial management,
              yielding an official formal response, credit note issuance, or replacement authorization.
            </li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>5. Payment Terms &amp; Credit Limits</h2>
          <p>
            Payment terms are established per approved corporate credit limits displayed on the Customer Portal dashboard.
            Invoices not settled within the agreed credit cycle (e.g., CAD, 30 days, 60 days) will automatically trigger
            commercial hold status on pending dispatch orders until accounts receivable reconciliation is finalized.
          </p>
        </section>

        <section className="terms-section">
          <h2>6. Customer Self-Service Portal &amp; Data Security</h2>
          <p>
            Authorized customer personnel are issued individual login credentials with role-based permissions (Buyer, Finance, Logistics, QA, Admin).
            Two-factor authorization (2FA) is enforced. Users are strictly responsible for safeguarding their login credentials.
            All administrative actions, member modifications, and document downloads are archived in the immutable <em>Security Action Audit Log</em>.
          </p>
        </section>

        <div className="terms-footer-actions">
          <Link href="/" className="btn-primary">
            Return to Dashboard
          </Link>
          <Link href="/claims/new-request" className="btn-secondary">
            Submit Inquiries &amp; Support
          </Link>
        </div>
      </div>

      <style jsx>{`
        .terms-page-container {
          max-width: 1040px;
          margin: 0 auto;
          padding: 2.5rem 1.5rem 4rem;
        }
        .terms-header {
          margin-bottom: 2rem;
        }
        .breadcrumb {
          font-size: 0.8125rem;
          color: #64748b;
          margin-bottom: 0.75rem;
        }
        .breadcrumb-link {
          color: #c5a059;
          text-decoration: none;
        }
        .breadcrumb-link:hover {
          text-decoration: underline;
        }
        .terms-title {
          font-size: 2rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.02em;
          margin-bottom: 0.5rem;
        }
        .terms-subtitle {
          font-size: 1rem;
          color: #475569;
          line-height: 1.5;
          margin-bottom: 0.75rem;
        }
        .terms-meta {
          font-size: 0.8125rem;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .meta-dot {
          color: #cbd5e1;
        }
        .terms-card {
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .terms-section h2 {
          font-size: 1.125rem;
          font-weight: 700;
          color: #0a192f;
          margin-bottom: 0.75rem;
          padding-bottom: 0.35rem;
          border-bottom: 1px solid #f1f5f9;
        }
        .terms-section p {
          font-size: 0.9375rem;
          color: #334155;
          line-height: 1.6;
          margin-bottom: 0.75rem;
        }
        .terms-section ul {
          margin-left: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          font-size: 0.875rem;
          color: #334155;
          line-height: 1.5;
        }
        .terms-footer-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: 1rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e2e8f0;
        }
        .btn-primary {
          background-color: #0a192f;
          color: #ffffff;
          font-size: 0.875rem;
          font-weight: 600;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          text-decoration: none;
          transition: background-color 0.15s ease;
        }
        .btn-primary:hover {
          background-color: #17335d;
        }
        .btn-secondary {
          background-color: #f1f5f9;
          color: #334155;
          font-size: 0.875rem;
          font-weight: 600;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          text-decoration: none;
          transition: background-color 0.15s ease;
        }
        .btn-secondary:hover {
          background-color: #e2e8f0;
        }
        @media (max-width: 640px) {
          .terms-card {
            padding: 1.5rem;
          }
          .terms-title {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
