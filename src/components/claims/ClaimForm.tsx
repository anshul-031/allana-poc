'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ClaimProductLineInput } from '@/server/validators/claim.schema';
import { submitQualityClaim, ClaimDTO } from '@/server/actions/claims.actions';
import { ClaimProductLines } from './ClaimProductLines';

interface ClaimFormProps {
  userEmail: string;
  userName: string;
  companyName: string;
  initialLines?: ClaimProductLineInput[];
}

export const ClaimForm: React.FC<ClaimFormProps> = ({
  userEmail,
  userName,
  companyName,
  initialLines,
}) => {
  const router = useRouter();
  const [subject, setSubject] = useState('');
  const [categoryOfRequest, setCategoryOfRequest] = useState('Quality Defect');
  const [supplierName, setSupplierName] = useState('Allana Cold Storage Plant 4, Mumbai');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [containerNumber, setContainerNumber] = useState('');
  const [country, setCountry] = useState('Saudi Arabia');
  const [description, setDescription] = useState('');
  const [additionalEmails, setAdditionalEmails] = useState('');
  const [productLines, setProductLines] = useState<ClaimProductLineInput[]>(
    initialLines ?? [
      {
        productArticle: '',
        productName: '',
        producerName: '',
        country: '',
        productionDate: '',
        lotNumber: '',
        vehicleNumber: '',
        nonConformWeightKg: 0,
        receivedQuantityKg: null,
      },
    ]
  );
  const [attachmentKeys, setAttachmentKeys] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdClaim, setCreatedClaim] = useState<ClaimDTO | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setErrorMessage(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 20 * 1024 * 1024) {
          throw new Error(`File ${file.name} exceeds maximum allowed size of 20MB.`);
        }

        // Request presigned URL from route
        const presignRes = await fetch('/api/storage/presign-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type || 'application/octet-stream',
            size: file.size,
          }),
        });

        if (!presignRes.ok) {
          throw new Error('Failed to generate upload URL for ' + file.name);
        }

        const { uploadUrl, key } = await presignRes.json();

        // Direct upload to R2
        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type || 'application/octet-stream' },
          body: file,
        });

        if (!uploadRes.ok) {
          throw new Error('Failed to upload file to Cloudflare storage');
        }

        setAttachmentKeys((prev) => [...prev, key]);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Error uploading evidence file');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const removeAttachment = (keyToRemove: string) => {
    setAttachmentKeys((prev) => prev.filter((k) => k !== keyToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation checks
    if (!subject.trim()) {
      setErrorMessage('Subject is required');
      return;
    }

    if (productLines.length === 0) {
      setErrorMessage('At least one product line is required');
      return;
    }

    for (let i = 0; i < productLines.length; i++) {
      const p = productLines[i];
      if (!p.productArticle.trim()) {
        setErrorMessage(`Product article is required on Line #${i + 1}`);
        return;
      }
      if (!p.productName.trim()) {
        setErrorMessage(`Product name is required on Line #${i + 1}`);
        return;
      }
      if (!p.nonConformWeightKg || p.nonConformWeightKg <= 0) {
        setErrorMessage(`Non-conforming weight must be greater than 0 on Line #${i + 1}`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const res = await submitQualityClaim({
        subject: subject.trim(),
        categoryOfRequest,
        supplierName,
        invoiceNumber: invoiceNumber.trim() || undefined,
        containerNumber: containerNumber.trim() || undefined,
        country: country.trim() || undefined,
        description: description.trim() || undefined,
        additionalEmails: additionalEmails.trim() || undefined,
        products: productLines,
        attachmentKeys,
      });

      if (!res.success || !res.claim) {
        setErrorMessage(res.error || 'Failed to submit quality claim');
        setIsSubmitting(false);
        return;
      }

      setCreatedClaim(res.claim);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (createdClaim) {
    return (
      <div
        data-testid="claim-success-card"
        style={{
          padding: '2.5rem',
          borderRadius: 'var(--radius-xl)',
          backgroundColor: 'var(--color-white)',
          border: '1px solid var(--color-success-border)',
          boxShadow: 'var(--shadow-md)',
          textAlign: 'center',
          maxWidth: '680px',
          margin: '2rem auto',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-success-bg)',
            color: 'var(--color-success-text)',
            fontSize: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto',
          }}
        >
          ✓
        </div>

        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: 'var(--color-primary-900)',
            margin: '0 0 0.5rem 0',
          }}
        >
          Quality Claim Registered Successfully
        </h2>

        <p style={{ fontSize: '0.9375rem', color: 'var(--color-slate-600)', margin: '0 0 1.5rem 0' }}>
          Your complaint ticket has been generated and queued for inspection by Allana Quality Assurance and Logistics teams.
        </p>

        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-slate-50)',
            border: '1px solid var(--color-slate-200)',
            display: 'inline-block',
            marginBottom: '2rem',
          }}
        >
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-slate-500)', display: 'block' }}>
            Ticket Number:
          </span>
          <strong
            data-testid="created-claim-number"
            style={{ fontSize: '1.375rem', color: 'var(--color-primary-700)' }}
          >
            {createdClaim.claimNumber}
          </strong>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link
            href={`/claims/${createdClaim.id}`}
            data-testid="view-details-link"
            style={{
              padding: '0.625rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary-600)',
              color: 'var(--color-white)',
              fontWeight: 600,
              fontSize: '0.875rem',
              textDecoration: 'none',
            }}
          >
            View Ticket Details
          </Link>
          <Link
            href="/claims"
            data-testid="back-to-claims-link"
            style={{
              padding: '0.625rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-slate-300)',
              backgroundColor: 'var(--color-white)',
              color: 'var(--color-slate-700)',
              fontWeight: 600,
              fontSize: '0.875rem',
              textDecoration: 'none',
            }}
          >
            Back to Claims Desk
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      data-testid="quality-claim-form"
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        maxWidth: '960px',
        margin: '0 auto',
      }}
    >
      {/* Official Mandatory Notice Banner (User Manual Section 14) */}
      <div
        data-testid="claim-notice-banner"
        style={{
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-notice-pink-bg)',
          border: '1px solid var(--color-notice-pink-border)',
          color: 'var(--color-notice-pink-text)',
          fontSize: '0.875rem',
          lineHeight: 1.5,
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
        }}
      >
        <span style={{ fontSize: '1.25rem' }}>⚠️</span>
        <div>
          <strong>Important Instructions:</strong> Please create one request for one separate complaint.
          Do not combine multiple shipments or unrelated issues in a single claim. Ensure logger charts and photo evidence clearly display batch numbers.
        </div>
      </div>

      {/* User Information Card (Locked email) */}
      <div
        style={{
          padding: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-white)',
          border: '1px solid var(--color-slate-200)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <h2
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--color-primary-900)',
            margin: '0 0 1rem 0',
          }}
        >
          Claimant Information
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
          }}
        >
          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-slate-500)', marginBottom: '0.25rem' }}>
              Claimant Name
            </span>
            <div style={{ fontWeight: 600, color: 'var(--color-slate-800)', fontSize: '0.875rem' }}>
              {userName || 'Authorized Buyer'}
            </div>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-slate-500)', marginBottom: '0.25rem' }}>
              Company
            </span>
            <div style={{ fontWeight: 600, color: 'var(--color-slate-800)', fontSize: '0.875rem' }}>
              {companyName}
            </div>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-slate-500)', marginBottom: '0.25rem' }}>
              Primary E-mail (Locked)
            </span>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontWeight: 600,
                color: 'var(--color-slate-700)',
                fontSize: '0.875rem',
                backgroundColor: 'var(--color-slate-100)',
                padding: '0.25rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <span>🔒</span>
              <span>{userEmail}</span>
            </div>
          </div>
        </div>
      </div>

      {/* General Claim Metadata */}
      <div
        style={{
          padding: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-white)',
          border: '1px solid var(--color-slate-200)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <h2
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--color-primary-900)',
            margin: '0',
          }}
        >
          Claim Overview
        </h2>

        <div>
          <label
            htmlFor="claim-subject-input"
            style={{
              display: 'block',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--color-slate-700)',
              marginBottom: '0.35rem',
            }}
          >
            Subject / Headline *
          </label>
          <input
            id="claim-subject-input"
            type="text"
            data-testid="claim-subject-input"
            placeholder="e.g. Temperature Deviation & Damaged Cartons in Container MSKU9482710"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-slate-300)',
              fontSize: '0.875rem',
            }}
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
          }}
        >
          {/* Category of Request */}
          <div>
            <label
              htmlFor="claim-category-select"
              style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--color-slate-700)',
                marginBottom: '0.35rem',
              }}
            >
              Category of Request *
            </label>
            <select
              id="claim-category-select"
              data-testid="claim-category-select"
              value={categoryOfRequest}
              onChange={(e) => setCategoryOfRequest(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-slate-300)',
                fontSize: '0.875rem',
                backgroundColor: 'var(--color-white)',
              }}
            >
              <option value="Quality Defect">Quality Defect</option>
              <option value="Underload / Shortage">Underload / Shortage</option>
              <option value="Damaged Packaging">Damaged Packaging</option>
              <option value="Temperature Abuse / Thawed">Temperature Abuse / Thawed</option>
              <option value="Foreign Matter / Contamination">Foreign Matter / Contamination</option>
              <option value="Documentation Discrepancy">Documentation Discrepancy</option>
              <option value="Other Complaint">Other Complaint</option>
            </select>
          </div>

          {/* Supplier Name */}
          <div>
            <label
              htmlFor="claim-supplier-select"
              style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--color-slate-700)',
                marginBottom: '0.35rem',
              }}
            >
              Supplier / Processing Facility *
            </label>
            <select
              id="claim-supplier-select"
              data-testid="claim-supplier-select"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-slate-300)',
                fontSize: '0.875rem',
                backgroundColor: 'var(--color-white)',
              }}
            >
              <option value="Allana Cold Storage Plant 4, Mumbai">Allana Cold Storage Plant 4, Mumbai</option>
              <option value="Frigerio Conserva Allana, Aligarh">Frigerio Conserva Allana, Aligarh</option>
              <option value="Allana Processing Complex, Aurangabad">Allana Processing Complex, Aurangabad</option>
              <option value="Allanasons Export Depot, Navi Mumbai">Allanasons Export Depot, Navi Mumbai</option>
            </select>
          </div>

          {/* Container Number */}
          <div>
            <label
              htmlFor="claim-container-input"
              style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--color-slate-700)',
                marginBottom: '0.35rem',
              }}
            >
              Container Number
            </label>
            <input
              id="claim-container-input"
              type="text"
              data-testid="claim-container-input"
              placeholder="e.g. MSKU9482710"
              value={containerNumber}
              onChange={(e) => setContainerNumber(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-slate-300)',
                fontSize: '0.875rem',
              }}
            />
          </div>

          {/* Invoice Number */}
          <div>
            <label
              htmlFor="claim-invoice-input"
              style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--color-slate-700)',
                marginBottom: '0.35rem',
              }}
            >
              Invoice Number
            </label>
            <input
              id="claim-invoice-input"
              type="text"
              data-testid="claim-invoice-input"
              placeholder="e.g. INV-2026-9021"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-slate-300)',
                fontSize: '0.875rem',
              }}
            />
          </div>
        </div>

        {/* Detailed Description */}
        <div>
          <label
            htmlFor="claim-description-input"
            style={{
              display: 'block',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--color-slate-700)',
              marginBottom: '0.35rem',
            }}
          >
            Detailed Description of Non-Conformity (max 1000 characters)
          </label>
          <textarea
            id="claim-description-input"
            data-testid="claim-description-input"
            rows={4}
            maxLength={1000}
            placeholder="Describe the nature of defect, temperature abuse, seal integrity, and physical condition upon devanning..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-slate-300)',
              fontSize: '0.875rem',
              resize: 'vertical',
            }}
          />
          <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--color-slate-400)' }}>
            {description.length}/1000
          </div>
        </div>

        {/* Additional E-mails */}
        <div>
          <label
            htmlFor="claim-emails-input"
            style={{
              display: 'block',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--color-slate-700)',
              marginBottom: '0.35rem',
            }}
          >
            Additional E-mail (Semicolon separated)
          </label>
          <input
            id="claim-emails-input"
            type="text"
            data-testid="claim-emails-input"
            placeholder="e.g. qa.team@company.com; warehouse@company.com"
            value={additionalEmails}
            onChange={(e) => setAdditionalEmails(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-slate-300)',
              fontSize: '0.875rem',
            }}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>
            All formal notices and manager resolution updates will be mirrored to these addresses.
          </span>
        </div>
      </div>

      {/* Product Lines Dynamic Table */}
      <div
        style={{
          padding: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-white)',
          border: '1px solid var(--color-slate-200)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <ClaimProductLines
          lines={productLines}
          onChange={setProductLines}
        />
      </div>

      {/* Attachments & Evidence Section */}
      <div
        style={{
          padding: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-white)',
          border: '1px solid var(--color-slate-200)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <h2
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--color-primary-900)',
            margin: '0 0 0.25rem 0',
          }}
        >
          Supporting Evidence & Documents
        </h2>
        <p style={{ margin: '0 0 1rem 0', fontSize: '0.8125rem', color: 'var(--color-slate-500)' }}>
          Upload high-resolution damage photos, temp logger CSV/PDF records, or devanning survey reports (Max 20MB per file).
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <label
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--color-primary-600)',
              backgroundColor: 'var(--color-primary-50)',
              color: 'var(--color-primary-700)',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: isUploading ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span>📎</span>
            <span>{isUploading ? 'Uploading to R2...' : 'Select Files to Attach'}</span>
            <input
              type="file"
              data-testid="file-upload-input"
              multiple
              disabled={isUploading}
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {attachmentKeys.length > 0 && (
          <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {attachmentKeys.map((key) => {
              const displayName = key.split('/').pop() || key;
              return (
                <div
                  key={key}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-slate-100)',
                    border: '1px solid var(--color-slate-200)',
                    fontSize: '0.8125rem',
                  }}
                >
                  <span>📄 {displayName}</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(key)}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: 'var(--color-danger)',
                      cursor: 'pointer',
                      fontWeight: 700,
                    }}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {errorMessage && (
        <div
          data-testid="claim-form-error"
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-danger-bg)',
            color: 'var(--color-danger-text)',
            fontSize: '0.875rem',
            border: '1px solid var(--color-danger-border)',
          }}
        >
          {errorMessage}
        </div>
      )}

      {/* Form Submission Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', alignItems: 'center' }}>
        <Link
          href="/claims"
          style={{
            padding: '0.625rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-slate-300)',
            backgroundColor: 'var(--color-white)',
            color: 'var(--color-slate-700)',
            fontSize: '0.875rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Cancel
        </Link>
        <button
          type="submit"
          data-testid="submit-claim-button"
          disabled={isSubmitting || isUploading}
          style={{
            padding: '0.625rem 1.75rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor:
              isSubmitting || isUploading ? 'var(--color-slate-400)' : 'var(--color-success-text)',
            color: 'var(--color-white)',
            fontSize: '0.875rem',
            fontWeight: 700,
            border: 'none',
            cursor: isSubmitting || isUploading ? 'not-allowed' : 'pointer',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {isSubmitting ? 'Registering Claim...' : 'Submit Quality Claim'}
        </button>
      </div>
    </form>
  );
};
