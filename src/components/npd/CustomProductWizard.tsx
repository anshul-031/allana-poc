'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  createCustomProductRequest,
  CustomProductRequestDTO,
  FreezingType,
} from '@/server/actions/npd.actions';
import { CreateCustomProductInput } from '@/server/validators/npd.schema';

export interface CustomProductWizardProps {
  onSuccess?: (request: CustomProductRequestDTO) => void;
}

export default function CustomProductWizard({ onSuccess }: CustomProductWizardProps) {
  const router = useRouter();

  // Wizard Step (1: Category & Market, 2: Specs & Processing, 3: Packaging & Price, 4: Attachment & Review)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [categoryName, setCategoryName] = useState<string>('Frozen Buffalo Meat');
  const [targetCountry, setTargetCountry] = useState<string>('Saudi Arabia');
  const [cutSpecification, setCutSpecification] = useState<string>('');
  const [recipeNotes, setRecipeNotes] = useState<string>('');
  const [freezingType, setFreezingType] = useState<FreezingType>('BLOCK_FROZEN');

  // Meat Processing Criteria Checkboxes
  const [isCalibrated, setIsCalibrated] = useState<boolean>(false);
  const [isMarinated, setIsMarinated] = useState<boolean>(false);
  const [isBoneless, setIsBoneless] = useState<boolean>(true);
  const [isSkinless, setIsSkinless] = useState<boolean>(true);
  const [hasSpecification, setHasSpecification] = useState<boolean>(false);

  // Commercial & Packaging
  const [packagingFormat, setPackagingFormat] = useState<string>('Master Carton (IWP)');
  const [individualPackagingWeight, setIndividualPackagingWeight] = useState<string>('20kg');
  const [estimatedFcaPricePerTon, setEstimatedFcaPricePerTon] = useState<string>('4800');
  const [targetVolumeMt, setTargetVolumeMt] = useState<string>('28');

  // Attachment & Comments
  const [additionalComments, setAdditionalComments] = useState<string>('');
  const [attachmentUrl, setAttachmentUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadFileName, setUploadFileName] = useState<string>('');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdRequest, setCreatedRequest] = useState<CustomProductRequestDTO | null>(null);

  // Step Validation
  const canProceedStep1 = categoryName.trim() !== '' && targetCountry.trim() !== '';
  const canProceedStep2 = cutSpecification.trim().length >= 5;
  const canProceedStep3 = packagingFormat.trim() !== '' && individualPackagingWeight.trim() !== '';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadFileName(file.name);
    setAttachmentUrl(`https://r2.allana.com/specs/${Date.now()}-${file.name}`);
    setIsUploading(false);
    setHasSpecification(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const payload: CreateCustomProductInput = {
      categoryName: categoryName.trim(),
      targetCountry: targetCountry.trim(),
      cutSpecification: cutSpecification.trim(),
      recipeNotes: recipeNotes.trim() || undefined,
      packagingFormat: packagingFormat.trim(),
      individualPackagingWeight: individualPackagingWeight.trim(),
      freezingType,
      estimatedFcaPricePerTon: estimatedFcaPricePerTon ? Number(estimatedFcaPricePerTon) : undefined,
      targetVolumeMt: targetVolumeMt ? Number(targetVolumeMt) : undefined,
      targetPriceUsd:
        estimatedFcaPricePerTon && targetVolumeMt
          ? Number(estimatedFcaPricePerTon) * Number(targetVolumeMt)
          : undefined,
      isCalibrated,
      isMarinated,
      isBoneless,
      isSkinless,
      hasSpecification,
      additionalComments: additionalComments.trim() || undefined,
      attachmentUrl: attachmentUrl || undefined,
    };

    const res = await createCustomProductRequest(payload);
    setIsSubmitting(false);

    if (!res.success || !res.request) {
      setErrorMessage(res.error || 'Failed to submit customized product request');
      return;
    }

    setCreatedRequest(res.request);
    if (onSuccess) {
      onSuccess(res.request);
    }
  };

  // If submitted successfully, show confirmation screen
  if (createdRequest) {
    return (
      <div
        data-testid="npd-success-screen"
        style={{
          backgroundColor: 'var(--color-surface, #ffffff)',
          border: '1px solid var(--color-border, #e2e8f0)',
          borderRadius: 'var(--border-radius-xl, 16px)',
          padding: '40px 24px',
          textAlign: 'center',
          maxWidth: '680px',
          margin: '0 auto',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
        <h2
          style={{
            fontSize: 'var(--font-size-2xl, 24px)',
            fontWeight: 800,
            color: 'var(--color-primary-dark, #0a192f)',
            marginBottom: '8px',
          }}
        >
          Custom Product Request Submitted!
        </h2>
        <p
          style={{
            fontSize: 'var(--font-size-md, 15px)',
            color: 'var(--color-text-secondary, #64748b)',
            marginBottom: '20px',
          }}
        >
          Your customized formulation ticket has been assigned to the Allana Export R&amp;D desk.
        </p>

        <div
          style={{
            display: 'inline-block',
            backgroundColor: 'rgba(197, 160, 89, 0.1)',
            border: '1px solid var(--color-gold, #c5a059)',
            borderRadius: 'var(--border-radius-lg, 10px)',
            padding: '12px 24px',
            marginBottom: '24px',
          }}
        >
          <div style={{ fontSize: '12px', color: 'var(--color-gold-700, #9c7b39)', fontWeight: 700 }}>
            ASSIGNED TICKET ID
          </div>
          <div
            data-testid="assigned-ticket-number"
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: 'var(--color-primary-dark, #0a192f)',
              letterSpacing: '0.04em',
            }}
          >
            {createdRequest.requestNumber}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <Link
            href="/customized-products"
            data-testid="track-status-btn"
            style={{
              backgroundColor: 'var(--color-primary-dark, #0a192f)',
              color: '#ffffff',
              padding: '10px 20px',
              borderRadius: 'var(--border-radius-md, 8px)',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '14px',
              border: '1px solid var(--color-gold, #c5a059)',
            }}
          >
            Track in NPD Dashboard &rarr;
          </Link>

          <button
            type="button"
            data-testid="submit-another-btn"
            onClick={() => {
              setCreatedRequest(null);
              setCurrentStep(1);
              setCutSpecification('');
              setRecipeNotes('');
              setAttachmentUrl('');
              setUploadFileName('');
            }}
            style={{
              backgroundColor: 'var(--color-background-subtle, #f8fafc)',
              color: 'var(--color-text-primary, #0f172a)',
              padding: '10px 18px',
              borderRadius: 'var(--border-radius-md, 8px)',
              border: '1px solid var(--color-border, #cbd5e1)',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="custom-product-wizard"
      style={{
        backgroundColor: 'var(--color-surface, #ffffff)',
        border: '1px solid var(--color-border, #e2e8f0)',
        borderRadius: 'var(--border-radius-xl, 16px)',
        padding: '28px',
        maxWidth: '840px',
        margin: '0 auto',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Wizard Progress Stepper */}
      <div
        data-testid="wizard-step-indicator"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '28px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--color-border, #e2e8f0)',
          gap: '8px',
        }}
      >
        {[
          { step: 1, title: 'Category & Market' },
          { step: 2, title: 'Cut & Processing' },
          { step: 3, title: 'Packaging & Target' },
          { step: 4, title: 'Artwork & Review' },
        ].map((s) => {
          const isActive = currentStep === s.step;
          const isDone = currentStep > s.step;
          return (
            <div
              key={s.step}
              data-testid={`wizard-step-${s.step}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: isActive || isDone ? 1 : 0.45,
              }}
            >
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 800,
                  backgroundColor: isDone
                    ? 'var(--color-success, #10b981)'
                    : isActive
                    ? 'var(--color-primary-dark, #0a192f)'
                    : 'var(--color-slate-200, #e2e8f0)',
                  color: isDone || isActive ? '#ffffff' : 'var(--color-slate-600, #475569)',
                }}
              >
                {isDone ? '✓' : s.step}
              </div>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive
                    ? 'var(--color-primary-dark, #0a192f)'
                    : 'var(--color-text-secondary, #64748b)',
                  display: 'none',
                }}
                className="step-title-desktop"
              >
                {s.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Form Error Banner */}
      {errorMessage && (
        <div
          data-testid="wizard-error-banner"
          style={{
            backgroundColor: 'var(--color-danger-bg, #fef2f2)',
            border: '1px solid var(--color-danger-border, #fecaca)',
            color: 'var(--color-danger-text, #991b1b)',
            padding: '12px 16px',
            borderRadius: 'var(--border-radius-md, 8px)',
            fontSize: '13px',
            marginBottom: '20px',
          }}
        >
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Step 1: Category & Market Destination */}
        {currentStep === 1 && (
          <div data-testid="wizard-step-1-content">
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>
              Step 1: Product Category &amp; Destination Market
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary, #64748b)', marginBottom: '20px' }}>
              Select the export product line and the bilateral jurisdiction for regulatory compliance.
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label
                htmlFor="categoryName"
                style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}
              >
                Product Category *
              </label>
              <select
                id="categoryName"
                data-testid="input-category-name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--border-radius-md, 8px)',
                  border: '1px solid var(--color-border, #e2e8f0)',
                  fontSize: '14px',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="Frozen Buffalo Meat">Frozen Buffalo Meat (Primal &amp; Offal Cuts)</option>
                <option value="Chilled Buffalo Meat">Chilled Buffalo Meat (Vacuum Chilled)</option>
                <option value="Processed Poultry">Processed Poultry (Further Processing)</option>
                <option value="Specialty Agro-Products">Specialty Agro-Products &amp; Canned Foods</option>
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label
                htmlFor="targetCountry"
                style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}
              >
                Target Destination Country *
              </label>
              <select
                id="targetCountry"
                data-testid="input-target-country"
                value={targetCountry}
                onChange={(e) => setTargetCountry(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--border-radius-md, 8px)',
                  border: '1px solid var(--color-border, #e2e8f0)',
                  fontSize: '14px',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="Saudi Arabia">Saudi Arabia (SFDA Regulated)</option>
                <option value="United Arab Emirates">United Arab Emirates (MOCCAE)</option>
                <option value="Egypt">Egypt (GOVYS)</option>
                <option value="Jordan">Jordan (JFDA)</option>
                <option value="Malaysia">Malaysia (JAKIM Halal)</option>
                <option value="Kuwait">Kuwait (PAFN)</option>
                <option value="Qatar">Qatar (MOPH)</option>
                <option value="Oman">Oman</option>
                <option value="Bahrain">Bahrain</option>
                <option value="Other">Other Global Market</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Cut & Processing Specifications */}
        {currentStep === 2 && (
          <div data-testid="wizard-step-2-content">
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>
              Step 2: Processing &amp; Cut Specifications
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary, #64748b)', marginBottom: '20px' }}>
              Define muscle cuts, trim ratios (e.g. 95VL, 90CL), and specialized butcher criteria.
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label
                htmlFor="cutSpecification"
                style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}
              >
                Cut &amp; Muscle Specification (Min 5 chars) *
              </label>
              <textarea
                id="cutSpecification"
                data-testid="input-cut-specification"
                rows={3}
                value={cutSpecification}
                onChange={(e) => setCutSpecification(e.target.value)}
                placeholder="e.g. Buffalo striploin, trimmed to max 3mm fat, silverskin removed, de-boned"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--border-radius-md, 8px)',
                  border: '1px solid var(--color-border, #e2e8f0)',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label
                htmlFor="recipeNotes"
                style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}
              >
                Recipe Formulation / Marinade Notes (Optional)
              </label>
              <textarea
                id="recipeNotes"
                data-testid="input-recipe-notes"
                rows={2}
                value={recipeNotes}
                onChange={(e) => setRecipeNotes(e.target.value)}
                placeholder="e.g. Marinated with 2% sea salt brine, tenderized, unseasoned"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--border-radius-md, 8px)',
                  border: '1px solid var(--color-border, #e2e8f0)',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label
                htmlFor="freezingType"
                style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}
              >
                Freezing Technology *
              </label>
              <select
                id="freezingType"
                data-testid="input-freezing-type"
                value={freezingType}
                onChange={(e) => setFreezingType(e.target.value as FreezingType)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--border-radius-md, 8px)',
                  border: '1px solid var(--color-border, #e2e8f0)',
                  fontSize: '14px',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="BLOCK_FROZEN">Block Frozen (-18°C)</option>
                <option value="IQF">Individually Quick Frozen (IQF)</option>
                <option value="BLAST_FROZEN">Blast Frozen (-35°C Quick Chilled)</option>
                <option value="CHILLED">Chilled Vacuum Pack (0°C to 2°C)</option>
              </select>
            </div>

            {/* Meat Processing Criteria Checkboxes */}
            <div
              style={{
                backgroundColor: 'var(--color-background-subtle, #f8fafc)',
                padding: '16px',
                borderRadius: 'var(--border-radius-lg, 12px)',
                border: '1px solid var(--color-border-subtle, #e2e8f0)',
                marginBottom: '16px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '10px' }}>
                Meat Processing Criteria:
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '10px',
                }}
              >
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    data-testid="checkbox-calibrated"
                    checked={isCalibrated}
                    onChange={(e) => setIsCalibrated(e.target.checked)}
                  />
                  Calibrated Piece Size
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    data-testid="checkbox-marinated"
                    checked={isMarinated}
                    onChange={(e) => setIsMarinated(e.target.checked)}
                  />
                  Marinated / Pre-seasoned
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    data-testid="checkbox-boneless"
                    checked={isBoneless}
                    onChange={(e) => setIsBoneless(e.target.checked)}
                  />
                  100% Boneless
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    data-testid="checkbox-skinless"
                    checked={isSkinless}
                    onChange={(e) => setIsSkinless(e.target.checked)}
                  />
                  Skinless / Defatted
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    data-testid="checkbox-spec"
                    checked={hasSpecification}
                    onChange={(e) => setHasSpecification(e.target.checked)}
                  />
                  Custom Spec Attached
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Packaging & Target Commercials */}
        {currentStep === 3 && (
          <div data-testid="wizard-step-3-content">
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>
              Step 3: Packaging Format &amp; Commercial Targets
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary, #64748b)', marginBottom: '20px' }}>
              Specify primary packaging formats, net carton weights, and target pricing.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '16px',
                marginBottom: '16px',
              }}
            >
              <div>
                <label
                  htmlFor="packagingFormat"
                  style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}
                >
                  Packaging Format *
                </label>
                <input
                  type="text"
                  id="packagingFormat"
                  data-testid="input-packaging-format"
                  value={packagingFormat}
                  onChange={(e) => setPackagingFormat(e.target.value)}
                  placeholder="e.g. Master Carton (IWP)"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--border-radius-md, 8px)',
                    border: '1px solid var(--color-border, #e2e8f0)',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="individualPackagingWeight"
                  style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}
                >
                  Individual Package Net Weight *
                </label>
                <input
                  type="text"
                  id="individualPackagingWeight"
                  data-testid="input-pkg-weight"
                  value={individualPackagingWeight}
                  onChange={(e) => setIndividualPackagingWeight(e.target.value)}
                  placeholder="e.g. 450g or 20kg"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--border-radius-md, 8px)',
                    border: '1px solid var(--color-border, #e2e8f0)',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="estimatedFcaPricePerTon"
                  style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}
                >
                  Estimated FCA Target Price ($ / MT)
                </label>
                <input
                  type="number"
                  id="estimatedFcaPricePerTon"
                  data-testid="input-fca-price"
                  value={estimatedFcaPricePerTon}
                  onChange={(e) => setEstimatedFcaPricePerTon(e.target.value)}
                  placeholder="e.g. 4800"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--border-radius-md, 8px)',
                    border: '1px solid var(--color-border, #e2e8f0)',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="targetVolumeMt"
                  style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}
                >
                  Target Annual / Order Volume (MT)
                </label>
                <input
                  type="number"
                  id="targetVolumeMt"
                  data-testid="input-target-volume"
                  value={targetVolumeMt}
                  onChange={(e) => setTargetVolumeMt(e.target.value)}
                  placeholder="e.g. 28 (1 Container)"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--border-radius-md, 8px)',
                    border: '1px solid var(--color-border, #e2e8f0)',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Artwork Attachment & Final Review */}
        {currentStep === 4 && (
          <div data-testid="wizard-step-4-content">
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>
              Step 4: Supporting Artwork &amp; Final Review
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary, #64748b)', marginBottom: '20px' }}>
              Attach packaging die-cuts, customer specifications, or regulatory documents.
            </p>

            <div
              style={{
                border: '2px dashed var(--color-border, #cbd5e1)',
                borderRadius: 'var(--border-radius-lg, 12px)',
                padding: '24px',
                textAlign: 'center',
                backgroundColor: 'var(--color-background-subtle, #f8fafc)',
                marginBottom: '20px',
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📁</div>
              <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>
                Upload Custom Specification or Artwork File
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary, #64748b)', marginBottom: '12px' }}>
                Supported formats: PDF, PNG, JPG (Max 25MB)
              </div>

              <input
                type="file"
                id="fileUploadInput"
                data-testid="file-upload-input"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <label
                htmlFor="fileUploadInput"
                data-testid="select-file-btn"
                style={{
                  display: 'inline-block',
                  padding: '8px 16px',
                  backgroundColor: 'var(--color-primary-dark, #0a192f)',
                  color: '#ffffff',
                  borderRadius: 'var(--border-radius-md, 8px)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid var(--color-gold, #c5a059)',
                }}
              >
                {isUploading ? 'Uploading to R2...' : uploadFileName ? 'Change Selected File' : 'Browse File'}
              </label>

              {uploadFileName && (
                <div
                  data-testid="uploaded-file-name"
                  style={{
                    marginTop: '10px',
                    fontSize: '12px',
                    color: 'var(--color-success-text, #166534)',
                    fontWeight: 600,
                  }}
                >
                  ✓ Ready for submission: {uploadFileName}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label
                htmlFor="additionalComments"
                style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}
              >
                Special Quality Assurance or Delivery Instructions
              </label>
              <textarea
                id="additionalComments"
                data-testid="input-additional-comments"
                rows={3}
                value={additionalComments}
                onChange={(e) => setAdditionalComments(e.target.value)}
                placeholder="e.g. Specific Halal certification council required, destination port temperature data logger required"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--border-radius-md, 8px)',
                  border: '1px solid var(--color-border, #e2e8f0)',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid var(--color-border, #e2e8f0)',
          }}
        >
          {currentStep > 1 ? (
            <button
              type="button"
              data-testid="wizard-prev-btn"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              style={{
                padding: '10px 18px',
                borderRadius: 'var(--border-radius-md, 8px)',
                backgroundColor: 'var(--color-background-subtle, #f8fafc)',
                color: 'var(--color-text-secondary, #475569)',
                border: '1px solid var(--color-border, #cbd5e1)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              &larr; Previous Step
            </button>
          ) : (
            <Link
              href="/customized-products"
              data-testid="wizard-cancel-link"
              style={{
                fontSize: '13px',
                color: 'var(--color-text-secondary, #64748b)',
                textDecoration: 'none',
              }}
            >
              Cancel
            </Link>
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              data-testid="wizard-next-btn"
              disabled={
                (currentStep === 1 && !canProceedStep1) ||
                (currentStep === 2 && !canProceedStep2) ||
                (currentStep === 3 && !canProceedStep3)
              }
              onClick={() => setCurrentStep((prev) => prev + 1)}
              style={{
                padding: '10px 22px',
                borderRadius: 'var(--border-radius-md, 8px)',
                backgroundColor: 'var(--color-primary-dark, #0a192f)',
                color: '#ffffff',
                border: '1px solid var(--color-gold, #c5a059)',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Continue &rarr;
            </button>
          ) : (
            <button
              type="submit"
              data-testid="wizard-submit-btn"
              disabled={isSubmitting}
              style={{
                padding: '10px 24px',
                borderRadius: 'var(--border-radius-md, 8px)',
                backgroundColor: 'var(--color-primary-dark, #0a192f)',
                color: '#ffffff',
                border: '1px solid var(--color-gold, #c5a059)',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {isSubmitting ? 'Submitting NPD Ticket...' : 'Submit Customized Product Request'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
