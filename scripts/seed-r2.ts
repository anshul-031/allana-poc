import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET = process.env.R2_BUCKET_NAME || 'allana-export-portal';

interface MockAsset {
  key: string;
  contentType: string;
  description: string;
  content: Buffer;
}

const MOCK_ASSETS: MockAsset[] = [
  // Products Technical Datasheets
  {
    key: 'products/specs/AL-BUF-SIL-01-specification.pdf',
    contentType: 'application/pdf',
    description: 'Technical Data Sheet: Frozen Boneless Buffalo Silverside',
    content: Buffer.from('%PDF-1.4 Mock Specification: Allana Boneless Buffalo Silverside, 20kg IWP, -18C, 24 Mo Shelf Life.'),
  },
  {
    key: 'products/specs/AL-BUF-TOP-02-specification.pdf',
    contentType: 'application/pdf',
    description: 'Technical Data Sheet: Frozen Boneless Buffalo Topside',
    content: Buffer.from('%PDF-1.4 Mock Specification: Allana Boneless Buffalo Topside, 20kg IWP, -18C, 24 Mo Shelf Life.'),
  },
  {
    key: 'products/specs/AL-BUF-TEN-03-specification.pdf',
    contentType: 'application/pdf',
    description: 'Technical Data Sheet: Frozen Buffalo Tenderloin Fillet',
    content: Buffer.from('%PDF-1.4 Mock Specification: Allana Buffalo Tenderloin Fillet, 18kg IWP.'),
  },
  {
    key: 'products/specs/AL-VPCM-CUB-08-specification.pdf',
    contentType: 'application/pdf',
    description: 'Technical Data Sheet: Chilled Vacuum-Packed Goat Cubes 450g',
    content: Buffer.from('%PDF-1.4 Mock Specification: Allana Goat Cubes, 450g Skin-pack MAP Tray, 0-2C, 60 Days.'),
  },

  // Logistics Documents for Shipment ORD-2026-88192
  {
    key: 'shipments/ORD-2026-88192/bill-of-lading-MAEU9482710.pdf',
    contentType: 'application/pdf',
    description: 'Original Bill of Lading (Maersk Line)',
    content: Buffer.from('%PDF-1.4 Mock Ocean Bill of Lading: Maersk Line, Vessel Maersk Mc-Kinney Moller 2604W, 2x40ft Reefer, POL: Nhava Sheva, POD: Jebel Ali.'),
  },
  {
    key: 'shipments/ORD-2026-88192/health-vet-certificate-IN-2601.pdf',
    contentType: 'application/pdf',
    description: 'Official Veterinary Health Certificate',
    content: Buffer.from('%PDF-1.4 Mock Export Inspection Council / Department of Animal Husbandry Veterinary Health Certificate for Frozen Buffalo Meat.'),
  },
  {
    key: 'shipments/ORD-2026-88192/halal-slaughter-cert-JAMIAT.pdf',
    contentType: 'application/pdf',
    description: 'Certified Halal Slaughter Certificate',
    content: Buffer.from('%PDF-1.4 Mock Halal Slaughter Certificate issued by Jamiat Ulama-i-Hind Halal Trust.'),
  },

  // Logistics Documents for Shipment ORD-2026-88045 (Dammam, KSA)
  {
    key: 'shipments/ORD-2026-88045/bill-of-lading-CMAU7182934.pdf',
    contentType: 'application/pdf',
    description: 'Original Bill of Lading (CMA CGM)',
    content: Buffer.from('%PDF-1.4 Mock Bill of Lading: CMA CGM Palais Royal, POL: Nhava Sheva, POD: King Abdulaziz Port, Dammam, KSA.'),
  },

  // Claims Evidence Files for Claim CLM-2026-0038
  {
    key: 'claims/CLM-2026-0038/temp_logger_graph_container_MSKU9482710.pdf',
    contentType: 'application/pdf',
    description: 'Sensitech Reefer Temperature Logger Graph Showing -8C Spike',
    content: Buffer.from('%PDF-1.4 Cold Chain Temperature Logger Graph: Container MSKU9482710 showing temp rise to -8C for 48 hrs.'),
  },
  {
    key: 'claims/CLM-2026-0038/photo_carton_softening_01.jpg',
    contentType: 'image/jpeg',
    description: 'Defect Photograph: Surface softening on bottom tier cartons',
    content: Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x60, 0x00, 0x60, 0x00, 0x00, 0xff, 0xd9]), // Minimal valid JPEG bytes
  },

  // Compliance Licenses
  {
    key: 'licenses/LULU-RUH/SFDA-MEAT-IMPORT-FACILITY-2026.pdf',
    contentType: 'application/pdf',
    description: 'Saudi SFDA Facility Meat Import Approval Certificate',
    content: Buffer.from('%PDF-1.4 Saudi Food & Drug Authority (SFDA) Foreign Meat Processing Facility Approval Certificate.'),
  },
  {
    key: 'licenses/LULU-DXB/DUBAI-MUNICIPALITY-FOOD-IMPORT-PERMIT.pdf',
    contentType: 'application/pdf',
    description: 'Dubai Municipality Food Trade Registration Certificate',
    content: Buffer.from('%PDF-1.4 Dubai Municipality Food Safety Department Import Permit.'),
  },
];

export async function seedR2Storage() {
  console.log(`Starting mock asset upload to Cloudflare R2 bucket: "${BUCKET}"...`);

  for (const asset of MOCK_ASSETS) {
    try {
      await r2.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: asset.key,
          Body: asset.content,
          ContentType: asset.contentType,
          Metadata: {
            description: asset.description,
          },
        })
      );
      console.log(` [R2 Uploaded] ${asset.key} (${asset.description})`);
    } catch (err: any) {
      console.error(` [R2 Failed] ${asset.key}: ${err.message}`);
    }
  }

  console.log(`Finished seeding ${MOCK_ASSETS.length} mock objects to Cloudflare R2.`);
}

// Allow direct CLI execution: ts-node scripts/seed-r2.ts
if (require.main === module) {
  seedR2Storage().catch((err) => {
    console.error('Failed to seed R2 storage:', err);
    process.exit(1);
  });
}
