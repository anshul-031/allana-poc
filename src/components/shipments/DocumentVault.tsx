'use client';

import React, { useState } from 'react';
import { ShipmentDocumentDTO, getShipmentDocumentPresignedUrl } from '@/server/actions/shipments.actions';

export interface DocumentVaultProps {
  documents: ShipmentDocumentDTO[];
  orderNumber: string;
}

export default function DocumentVault({ documents, orderNumber }: DocumentVaultProps) {
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getDocTypeInfo = (type: string) => {
    switch (type) {
      case 'BILL_OF_LADING':
        return { label: 'Ocean Bill of Lading (B/L)', icon: '📜' };
      case 'VET_CERT':
        return { label: 'Official Veterinary Health Certificate', icon: '🩺' };
      case 'HALAL_CERT':
        return { label: 'Approved Halal Slaughter Certificate', icon: '☪️' };
      case 'SFDA_CERT':
      case 'CONFORMITY_CERT':
        return { label: 'SFDA Certificate of Conformity', icon: '🛡️' };
      case 'INVOICE':
        return { label: 'Commercial Export Invoice', icon: '💰' };
      case 'PACKING_LIST':
        return { label: 'Export Master Packing List', icon: '📦' };
      case 'TEMP_LOG':
        return { label: 'Cold-Chain Temperature Logger Report', icon: '❄️' };
      default:
        return { label: type.replace('_', ' '), icon: '📄' };
    }
  };

  const handleDownload = async (doc: ShipmentDocumentDTO) => {
    setErrorMessage(null);
    setDownloadingDocId(doc.id);

    try {
      const res = await getShipmentDocumentPresignedUrl(doc.id);
      setDownloadingDocId(null);

      if (!res.success || !res.downloadUrl) {
        setErrorMessage(res.error || 'Failed to generate download URL');
        return;
      }

      // Open or trigger download
      window.open(res.downloadUrl, '_blank', 'noopener,noreferrer');
    } catch (err: unknown) {
      setDownloadingDocId(null);
      const message = err instanceof Error ? err.message : 'Error retrieving document';
      setErrorMessage(message);
    }
  };

  if (!documents || documents.length === 0) {
    return (
      <div
        data-testid="no-documents-notice"
        style={{
          padding: '16px',
          color: 'var(--color-text-secondary, #64748b)',
          fontSize: '13px',
          fontStyle: 'italic',
        }}
      >
        No logistics documents have been uploaded to the vault for this consignment yet.
      </div>
    );
  }

  return (
    <div data-testid="document-vault-container">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div
          style={{
            fontSize: '12px',
            fontWeight: 800,
            color: 'var(--color-primary-dark, #0a192f)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>📁</span> Logistics Document Vault ({documents.length} Files)
        </div>

        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--color-gold, #c5a059)',
            backgroundColor: 'rgba(197, 160, 89, 0.1)',
            padding: '2px 8px',
            borderRadius: '4px',
          }}
        >
          Cloudflare R2 Encrypted
        </span>
      </div>

      {errorMessage && (
        <div
          data-testid="vault-error-message"
          style={{
            backgroundColor: 'var(--color-danger-bg, #fef2f2)',
            color: 'var(--color-danger-text, #991b1b)',
            border: '1px solid var(--color-danger-border, #fecaca)',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            marginBottom: '12px',
          }}
        >
          {errorMessage}
        </div>
      )}

      {/* Grid of Documents */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '10px',
        }}
      >
        {documents.map((doc) => {
          const info = getDocTypeInfo(doc.documentType);
          const sizeKb = Math.round(doc.fileSizeBytes / 1024);
          const isDownloading = downloadingDocId === doc.id;

          return (
            <div
              key={doc.id}
              data-testid={`document-item-${doc.id}`}
              style={{
                backgroundColor: 'var(--color-background-subtle, #f8fafc)',
                border: '1px solid var(--color-border, #e2e8f0)',
                borderRadius: 'var(--border-radius-md, 8px)',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <span style={{ fontSize: '24px' }}>{info.icon}</span>
                <div style={{ minWidth: 0 }}>
                  <div
                    data-testid={`doc-label-${doc.id}`}
                    style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: 'var(--color-text-primary, #0f172a)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {info.label}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: 'var(--color-text-secondary, #64748b)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {doc.fileName} &bull; {sizeKb} KB
                  </div>
                </div>
              </div>

              <button
                type="button"
                data-testid={`download-doc-btn-${doc.id}`}
                disabled={isDownloading}
                onClick={() => handleDownload(doc)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: 'var(--color-primary-dark, #0a192f)',
                  color: '#ffffff',
                  border: '1px solid var(--color-gold, #c5a059)',
                  cursor: isDownloading ? 'wait' : 'pointer',
                  flexShrink: 0,
                }}
              >
                {isDownloading ? 'Downloading...' : '📥 Download'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
