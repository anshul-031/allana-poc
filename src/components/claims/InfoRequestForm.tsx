'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  InfoRequestCategory,
  ClaimDTO,
  submitInfoRequest,
  lookupProductByArticle,
} from '@/server/actions/claims.actions';
import { CategoryTreeSelector } from './CategoryTreeSelector';

interface InfoRequestFormProps {
  userEmail: string;
  userName: string;
  companyName: string;
}

export const InfoRequestForm: React.FC<InfoRequestFormProps> = ({
  userEmail,
  userName,
  companyName,
}) => {
  const [selectedCategory, setSelectedCategory] =
    useState<InfoRequestCategory>('QUESTIONNAIRE');
  const [subject, setSubject] = useState('Quality & Supplier Questionnaire Request');
  const [targetCountry, setTargetCountry] = useState('Saudi Arabia');
  const [supplierName, setSupplierName] = useState('Allana Cold Storage Plant 4, Mumbai');
  const [productArticle, setProductArticle] = useState('');
  const [productName, setProductName] = useState('');
  const [productionDate, setProductionDate] = useState('');
  const [requestedShelfLifeDate, setRequestedShelfLifeDate] = useState('');
  const [shelfLifeExtensionVolumeKg, setShelfLifeExtensionVolumeKg] = useState<number | null>(null);
  const [reasonForShelfLifeExtension, setReasonForShelfLifeExtension] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [containerNumber, setContainerNumber] = useState('');
  const [description, setDescription] = useState('');
  const [additionalEmails, setAdditionalEmails] = useState('');
  const [attachmentKeys, setAttachmentKeys] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdRequest, setCreatedRequest] = useState<ClaimDTO | null>(null);

  // Update default subject when category changes if subject wasn't heavily modified
  useEffect(() => {
    switch (selectedCategory) {
      case 'QUESTIONNAIRE':
        setSubject('Quality & Supplier Questionnaire Request');
        break;
      case 'DOCS_SPECIFICATION':
        setSubject('Request for Official Product Specification Sheet');
        break;
      case 'DOCS_SURVEY_REPORT':
        setSubject('Request for Independent Loading Survey Report');
        break;
      case 'DOCS_CERTIFICATE':
        setSubject('Request for Halal & Veterinary Certificate Copy');
        break;
      case 'DOCS_DECLARATION_QUALITY':
        setSubject('Request for Manufacturer Declaration of Quality & Safety');
        break;
      case 'DOCS_DECLARATION_SHELF_LIFE':
        setSubject('Request for Formal Shelf Life Extension Declaration');
        break;
      case 'DOCS_DECLARATION_LEGISLATION':
        setSubject('Request for Food Law Compliance Statement');
        break;
      case 'DOCS_DECLARATION_OTHER':
        setSubject('Request for Regulatory Declaration');
        break;
      case 'OTHER_QUALITY_SAFETY':
        setSubject('Quality & Safety Clarification Inquiry');
        break;
      case 'OTHER_AUDIT':
        setSubject('Facility Audit & Inspection Request');
        break;
      case 'OTHER_CLARIFYING_INFO':
        setSubject('Clarifying Commercial Information Request');
        break;
    }
  }, [selectedCategory]);

  const handleArticleBlur = async (article: string) => {
    const trimmed = article.trim();
    if (!trimmed) return;
    try {
      const res = await lookupProductByArticle(trimmed);
      if (res.success && res.product) {
        setProductName(res.product.name);
      }
    } catch {
      // User can still input manually
    }
  };

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

        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type || 'application/octet-stream' },
          body: file,
        });

        if (!uploadRes.ok) {
          throw new Error('Failed to upload file');
        }

        setAttachmentKeys((prev) => [...prev, key]);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Error uploading file');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!subject.trim()) {
      setErrorMessage('Subject is required');
      return;
    }

    // Specific shelf life extension validations
    if (selectedCategory === 'DOCS_DECLARATION_SHELF_LIFE') {
      if (!requestedShelfLifeDate) {
        setErrorMessage('Requested extended shelf-life date is required');
        return;
      }
      if (!shelfLifeExtensionVolumeKg || shelfLifeExtensionVolumeKg <= 0) {
        setErrorMessage('Shelf life extension volume in kg is required and must be greater than 0');
        return;
      }
      if (!reasonForShelfLifeExtension.trim()) {
        setErrorMessage('Reason for shelf-life extension is required');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const res = await submitInfoRequest({
        subject: subject.trim(),
        infoCategory: selectedCategory,
        targetCountry: targetCountry.trim() || undefined,
        supplierName: supplierName.trim() || undefined,
        productArticle: productArticle.trim() || undefined,
        productName: productName.trim() || undefined,
        productionDate: productionDate || undefined,
        requestedShelfLifeDate: requestedShelfLifeDate || undefined,
        reasonForShelfLifeExtension: reasonForShelfLifeExtension.trim() || undefined,
        shelfLifeExtensionVolumeKg: shelfLifeExtensionVolumeKg || undefined,
        orderNumber: orderNumber.trim() || undefined,
        containerNumber: containerNumber.trim() || undefined,
        description: description.trim() || undefined,
        additionalEmails: additionalEmails.trim() || undefined,
        attachmentKeys,
      });

      if (!res.success || !res.claim) {
        setErrorMessage(res.error || 'Failed to submit info request');
        setIsSubmitting(false);
        return;
      }

      setCreatedRequest(res.claim);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (createdRequest) {
    return (
      <div
        data-testid="request-success-card"
        style={{
          padding: '2.5rem',
          borderRadius: 'var(--radius-xl)',
          backgroundColor: 'var(--color-white)',
          border: '1px solid var(--color-gold-400)',
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
            backgroundColor: 'var(--color-gold-50)',
            color: 'var(--color-gold-700)',
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
          Information Request Submitted
        </h2>

        <p style={{ fontSize: '0.9375rem', color: 'var(--color-slate-600)', margin: '0 0 1.5rem 0' }}>
          Your inquiry has been assigned to the Export Technical & Regulatory team. You will receive email notifications with official documentation.
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
            Request Ticket Number:
          </span>
          <strong
            data-testid="created-request-number"
            style={{ fontSize: '1.375rem', color: 'var(--color-gold-700)' }}
          >
            {createdRequest.claimNumber}
          </strong>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link
            href={`/claims/${createdRequest.id}`}
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
            View Request Details
          </Link>
          <Link
            href="/claims"
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

  const isShelfLife = selectedCategory === 'DOCS_DECLARATION_SHELF_LIFE';
  const isSpec = selectedCategory === 'DOCS_SPECIFICATION';

  return (
    <div
      data-testid="info-request-container"
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(280px, 320px) 1fr',
        gap: '2rem',
        alignItems: 'start',
      }}
    >
      {/* Left Column: Category Tree Selector */}
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
            fontWeight: 800,
            color: 'var(--color-primary-900)',
            margin: '0 0 0.5rem 0',
          }}
        >
          Request Categories
        </h2>
        <p style={{ margin: '0 0 1rem 0', fontSize: '0.8125rem', color: 'var(--color-slate-500)' }}>
          Select the specific category of documentation or clarification required from Allana.
        </p>

        <CategoryTreeSelector
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>

      {/* Right Column: Dynamic Sub-form */}
      <form
        data-testid="info-request-form"
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        {/* Shelf Life Notice Banner */}
        {isShelfLife && (
          <div
            data-testid="shelf-life-notice-banner"
            style={{
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-warning-bg)',
              border: '1px solid var(--color-warning-border)',
              color: 'var(--color-warning-text)',
              fontSize: '0.875rem',
              lineHeight: 1.5,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>⏳</span>
            <div>
              <strong>Shelf Life Extension Formal Declaration:</strong> Manufacturer letters for customs
              clearance (SFDA / GCC) require full traceability: accurate production dates, lot codes,
              container ID, and official justification (e.g. port quarantine delay).
            </div>
          </div>
        )}

        {/* User Card */}
        <div
          style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-white)',
            border: '1px solid var(--color-slate-200)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>
              Requester
            </span>
            <div style={{ fontWeight: 600, color: 'var(--color-slate-800)', fontSize: '0.875rem' }}>
              {userName || 'Buyer Representative'} ({companyName})
            </div>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>
              Primary E-mail (Locked)
            </span>
            <div style={{ fontWeight: 600, color: 'var(--color-slate-700)', fontSize: '0.875rem' }}>
              🔒 {userEmail}
            </div>
          </div>
        </div>

        {/* Form Body Card */}
        <div
          style={{
            padding: '1.5rem',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-white)',
            border: '1px solid var(--color-slate-200)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          <h2
            style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: 'var(--color-primary-900)',
              margin: 0,
            }}
          >
            Request Details
          </h2>

          {/* Subject */}
          <div>
            <label
              htmlFor="info-subject-input"
              style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--color-slate-700)',
                marginBottom: '0.35rem',
              }}
            >
              Subject / Title *
            </label>
            <input
              id="info-subject-input"
              type="text"
              data-testid="info-subject-input"
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
            {/* Target Country */}
            <div>
              <label
                htmlFor="info-target-country"
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--color-slate-700)',
                  marginBottom: '0.35rem',
                }}
              >
                Target Country / Jurisdiction
              </label>
              <input
                id="info-target-country"
                type="text"
                data-testid="info-target-country"
                placeholder="e.g. Saudi Arabia, UAE"
                value={targetCountry}
                onChange={(e) => setTargetCountry(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-slate-300)',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            {/* Supplier / Plant */}
            <div>
              <label
                htmlFor="info-supplier-name"
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--color-slate-700)',
                  marginBottom: '0.35rem',
                }}
              >
                Supplier / Processing Facility
              </label>
              <input
                id="info-supplier-name"
                type="text"
                placeholder="e.g. Allana Cold Storage Plant 4, Mumbai"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
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

          {/* Conditional Product Fields (if Shelf Life or Specification) */}
          {(isShelfLife || isSpec) && (
            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-slate-50)',
                border: '1px solid var(--color-slate-200)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-primary-800)' }}>
                Associated Product Specifications
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <label
                    htmlFor="info-article-input"
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--color-slate-700)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Product Article
                  </label>
                  <input
                    id="info-article-input"
                    type="text"
                    data-testid="info-article-input"
                    placeholder="e.g. 7940"
                    value={productArticle}
                    onChange={(e) => setProductArticle(e.target.value)}
                    onBlur={(e) => handleArticleBlur(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-slate-300)',
                      fontSize: '0.8125rem',
                    }}
                  />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label
                    htmlFor="info-product-name"
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--color-slate-700)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Product Name
                  </label>
                  <input
                    id="info-product-name"
                    type="text"
                    data-testid="info-product-name"
                    placeholder="Product cut title"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-slate-300)',
                      fontSize: '0.8125rem',
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Specialized Shelf Life Fields */}
          {isShelfLife && (
            <div
              data-testid="shelf-life-inputs-section"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-warning-bg)',
                border: '1px solid var(--color-warning-border)',
              }}
            >
              <div>
                <label
                  htmlFor="shelf-production-date"
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--color-warning-text)',
                    marginBottom: '0.25rem',
                  }}
                >
                  Original Production Date *
                </label>
                <input
                  id="shelf-production-date"
                  type="date"
                  data-testid="shelf-production-date"
                  value={productionDate}
                  onChange={(e) => setProductionDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-slate-300)',
                    fontSize: '0.8125rem',
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="shelf-requested-date"
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--color-warning-text)',
                    marginBottom: '0.25rem',
                  }}
                >
                  Requested Extended Date *
                </label>
                <input
                  id="shelf-requested-date"
                  type="date"
                  data-testid="shelf-requested-date"
                  value={requestedShelfLifeDate}
                  onChange={(e) => setRequestedShelfLifeDate(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-slate-300)',
                    fontSize: '0.8125rem',
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="shelf-volume-kg"
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--color-warning-text)',
                    marginBottom: '0.25rem',
                  }}
                >
                  Volume (kg) (4-decimal) *
                </label>
                <input
                  id="shelf-volume-kg"
                  type="number"
                  data-testid="shelf-volume-kg"
                  step="0.0001"
                  min="0.0001"
                  placeholder="e.g. 2500.0000"
                  value={shelfLifeExtensionVolumeKg != null ? shelfLifeExtensionVolumeKg : ''}
                  onChange={(e) =>
                    setShelfLifeExtensionVolumeKg(e.target.value ? parseFloat(e.target.value) : null)
                  }
                  required
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-slate-300)',
                    fontSize: '0.8125rem',
                  }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label
                  htmlFor="shelf-reason-input"
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--color-warning-text)',
                    marginBottom: '0.25rem',
                  }}
                >
                  Detailed Reason for Shelf Life Extension *
                </label>
                <textarea
                  id="shelf-reason-input"
                  data-testid="shelf-reason-input"
                  rows={3}
                  maxLength={1000}
                  placeholder="State the circumstances causing clearance delay (port strike, sanitary laboratory backlog, rerouting)..."
                  value={reasonForShelfLifeExtension}
                  onChange={(e) => setReasonForShelfLifeExtension(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-slate-300)',
                    fontSize: '0.8125rem',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>
          )}

          {/* References: Order & Container */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
            }}
          >
            <div>
              <label
                htmlFor="info-order-input"
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--color-slate-700)',
                  marginBottom: '0.35rem',
                }}
              >
                Order / Invoice Number
              </label>
              <input
                id="info-order-input"
                type="text"
                data-testid="info-order-input"
                placeholder="e.g. ORD-2026-781"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-slate-300)',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            <div>
              <label
                htmlFor="info-container-input"
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
                id="info-container-input"
                type="text"
                data-testid="info-container-input"
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
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="info-desc-input"
              style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--color-slate-700)',
                marginBottom: '0.35rem',
              }}
            >
              Detailed Clarification / Question
            </label>
            <textarea
              id="info-desc-input"
              data-testid="info-desc-input"
              rows={4}
              maxLength={1000}
              placeholder="Provide context, customs requirements, or questionnaire instructions..."
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
          </div>

          {/* Additional E-mails */}
          <div>
            <label
              htmlFor="info-emails-input"
              style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--color-slate-700)',
                marginBottom: '0.35rem',
              }}
            >
              Additional Recipient E-mails (Semicolon separated)
            </label>
            <input
              id="info-emails-input"
              type="text"
              data-testid="info-emails-input"
              placeholder="e.g. customs.agent@partner.com; qa@partner.com"
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
          </div>

          {/* Attachments */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--color-slate-700)',
                marginBottom: '0.35rem',
              }}
            >
              Attach Draft Template or Customs Notice (Optional)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <label
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px dashed var(--color-gold-600)',
                  backgroundColor: 'var(--color-gold-50)',
                  color: 'var(--color-gold-700)',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <span>📎</span>
                <span>{isUploading ? 'Uploading...' : 'Choose File to Attach'}</span>
                <input
                  type="file"
                  multiple
                  data-testid="info-file-upload-input"
                  disabled={isUploading}
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>

              {attachmentKeys.length > 0 && (
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-slate-600)' }}>
                  {attachmentKeys.length} file(s) attached
                </span>
              )}
            </div>
          </div>
        </div>

        {errorMessage && (
          <div
            data-testid="info-form-error"
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

        {/* Action Buttons */}
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
            data-testid="submit-info-request-button"
            disabled={isSubmitting || isUploading}
            style={{
              padding: '0.625rem 1.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor:
                isSubmitting || isUploading ? 'var(--color-slate-400)' : 'var(--color-gold-600)',
              color: 'var(--color-white)',
              fontSize: '0.875rem',
              fontWeight: 700,
              border: 'none',
              cursor: isSubmitting || isUploading ? 'not-allowed' : 'pointer',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            {isSubmitting ? 'Submitting Request...' : 'Submit Information Request'}
          </button>
        </div>
      </form>
    </div>
  );
};
