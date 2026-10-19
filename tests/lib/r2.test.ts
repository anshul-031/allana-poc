import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPresignedUploadUrl, createPresignedDownloadUrl } from '@/lib/r2';
import * as presigner from '@aws-sdk/s3-request-presigner';

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn(),
}));

describe('src/lib/r2.ts - Cloudflare R2 Client & Presigned URLs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createPresignedUploadUrl', () => {
    it('generates a presigned PUT upload URL with default 300s expiry', async () => {
      const mockUrl = 'https://mock-account-id.r2.cloudflarestorage.com/allana-export-portal/test.pdf?X-Amz-Signature=xyz';
      vi.mocked(presigner.getSignedUrl).mockResolvedValueOnce(mockUrl);

      const result = await createPresignedUploadUrl('claims/CLM-001/evidence.pdf', 'application/pdf');

      expect(presigner.getSignedUrl).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        uploadUrl: mockUrl,
        key: 'claims/CLM-001/evidence.pdf',
      });
    });

    it('respects custom expiration seconds when provided', async () => {
      const mockUrl = 'https://mock-account-id.r2.cloudflarestorage.com/allana-export-portal/photo.jpg?X-Amz-Signature=abc';
      vi.mocked(presigner.getSignedUrl).mockResolvedValueOnce(mockUrl);

      const result = await createPresignedUploadUrl('claims/CLM-002/photo.jpg', 'image/jpeg', 600);

      expect(result.uploadUrl).toBe(mockUrl);
      expect(result.key).toBe('claims/CLM-002/photo.jpg');
    });
  });

  describe('createPresignedDownloadUrl', () => {
    it('generates a presigned GET download URL with default 900s expiry', async () => {
      const mockDownloadUrl = 'https://mock-account-id.r2.cloudflarestorage.com/allana-export-portal/shipments/SHP-001/bl.pdf?X-Amz-Signature=123';
      vi.mocked(presigner.getSignedUrl).mockResolvedValueOnce(mockDownloadUrl);

      const result = await createPresignedDownloadUrl('shipments/SHP-001/bl.pdf');

      expect(presigner.getSignedUrl).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockDownloadUrl);
    });

    it('respects custom expiration seconds for download URL', async () => {
      const mockDownloadUrl = 'https://mock-account-id.r2.cloudflarestorage.com/allana-export-portal/licenses/SFDA.pdf?X-Amz-Signature=456';
      vi.mocked(presigner.getSignedUrl).mockResolvedValueOnce(mockDownloadUrl);

      const result = await createPresignedDownloadUrl('licenses/SFDA.pdf', 1800);

      expect(result).toBe(mockDownloadUrl);
    });
  });
});
