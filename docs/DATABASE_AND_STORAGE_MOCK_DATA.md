# Database & Object Store Mock Data Specification

This document details the complete mock data sets designed for both **PostgreSQL (via Prisma ORM)** and **Cloudflare R2 Object Storage**. The data realistically mirrors Allana's commercial export operations for buffalo meat, sheep, and goat cuts across the Middle East, North Africa, and Southeast Asia.

---

## 1. Domain Entities & Business Context

The mock data models realistic operations between **Allanasons Private Limited (Allana)** and premier international retail conglomerates and distributors:
- **Parent Client**: LuLu International Group (Headquarters: Abu Dhabi, UAE)
- **Subsidiaries (Related Companies)**:
  * LuLu Hypermarket LLC (Dubai & Northern Emirates, UAE)
  * LuLu Saudi Hypermarkets Co. (Riyadh, Saudi Arabia)
  * LuLu Hypermarket Egypt (Cairo, Egypt)
- **Secondary Client**: Carrefour Middle East / Majid Al Futtaim (Dubai, UAE)
- **Assigned Allana Export Managers**:
  * Rajesh Sharma (Senior Export Manager, GCC & MEA)
  * Tariq Mansoor (Logistics & Regulatory Documentation Lead)
- **Sales Organizations**:
  * `SO-1010`: Allana Frozen Buffalo Meat Division (India)
  * `SO-2020`: Allana International FZE (Dubai Logistics Hub)
  * `SO-3030`: IRAPL Retail & Consumer Pack Division (Processed RTC/RTE)

---

## 2. PostgreSQL Mock Data Entities (Prisma Seed Structure)

### 2.1 Companies & Related Subsidiaries
```json
[
  {
    "id": "comp-lulu-corp",
    "name": "LuLu Group International (HQ)",
    "code": "LULU-HQ",
    "region": "Middle East",
    "country": "United Arab Emirates",
    "telephone": "+971-2-6421800",
    "email": "procurement@ae.lulumea.com",
    "parentCompanyId": null,
    "managerName": "Rajesh Sharma",
    "managerEmail": "rajesh.sharma@allana.com",
    "managerPhone": "+91-22-22811000"
  },
  {
    "id": "comp-lulu-uae",
    "name": "LuLu Hypermarket LLC (Dubai Branch)",
    "code": "LULU-DXB",
    "region": "Middle East",
    "country": "United Arab Emirates",
    "telephone": "+971-4-2988880",
    "email": "meatbuyer.dxb@luluhypermarket.com",
    "parentCompanyId": "comp-lulu-corp",
    "managerName": "Rajesh Sharma",
    "managerEmail": "rajesh.sharma@allana.com",
    "managerPhone": "+91-22-22811000"
  },
  {
    "id": "comp-lulu-ksa",
    "name": "LuLu Saudi Hypermarkets Co. (Riyadh)",
    "code": "LULU-RUH",
    "region": "Gulf",
    "country": "Saudi Arabia",
    "telephone": "+966-11-4091100",
    "email": "meatimports.ksa@luluhypermarket.com",
    "parentCompanyId": "comp-lulu-corp",
    "managerName": "Rajesh Sharma",
    "managerEmail": "rajesh.sharma@allana.com",
    "managerPhone": "+91-22-22811000"
  }
]
```

### 2.2 Financial Indicators per Sales Organization
```json
[
  {
    "companyId": "comp-lulu-uae",
    "salesOrgCode": "SO-1010",
    "creditLimit": 2500000.00,
    "receivables": 1420500.00,
    "overdueReceivables": 185000.00,
    "availableLimit": 1079500.00
  },
  {
    "companyId": "comp-lulu-uae",
    "salesOrgCode": "SO-3030",
    "creditLimit": 800000.00,
    "receivables": 310200.00,
    "overdueReceivables": 0.00,
    "availableLimit": 489800.00
  },
  {
    "companyId": "comp-lulu-ksa",
    "salesOrgCode": "SO-1010",
    "creditLimit": 3500000.00,
    "receivables": 2180000.00,
    "overdueReceivables": 420000.00,
    "availableLimit": 1320000.00
  }
]
```

### 2.3 User Personas & Credentials
*(Passwords for all seed users are hashed with bcrypt: `Allana@2026!`)*

| Name | Email | Job Title | Role | Permissions | Company | First Login |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Hamdan Al-Falasi** | `buyer.dxb@lulumea.com` | Category Buyer - Meat | BUYER | `VIEW_CATALOG`, `ORDER_CUSTOM_PRODUCT`, `VIEW_SHIPMENTS` | LuLu Dubai | `false` |
| **Suresh Menon** | `procurement.corp@lulumea.com` | VP Procurement | PROCUREMENT | `VIEW_CATALOG`, `VIEW_SHIPMENTS`, `ORDER_CUSTOM_PRODUCT` | LuLu HQ | `false` |
| **Fatima Zahra** | `finance.dxb@lulumea.com` | Senior Financial Controller | FINANCE | `VIEW_FINANCIALS`, `VIEW_REPORTS` | LuLu Dubai | `false` |
| **Tariq Al-Amri** | `logistics.ksa@lulumea.com` | Import Clearance Lead | LOGISTICS | `VIEW_SHIPMENTS`, `DOWNLOAD_DOCUMENTS` | LuLu Riyadh | `false` |
| **Dr. Karen White** | `qa.dxb@lulumea.com` | QA & Food Safety Lead | QA | `VIEW_CATALOG`, `SUBMIT_CLAIMS`, `DOWNLOAD_DOCUMENTS` | LuLu Dubai | `false` |
| **Ahmed Mansoori** | `admin.lulu@lulumea.com` | Enterprise IT Admin | ADMIN | *All Permissions* | LuLu HQ | `false` |
| **New User** | `onboarding.buyer@lulumea.com`| Junior Buyer | BUYER | `VIEW_CATALOG` | LuLu Dubai | `true` *(triggers mandatory reset)* |

### 2.4 Product Catalog SKUs (10-Column Export Logistics Specifications)

| SKU | Name | Category | Primary Packaging | Cut Size | Pkgs/Crtn | Net/Gross Wt | Dimensions (mm) | Shelf / Temp | Freezing |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `AL-BUF-SIL-01` | **Frozen Boneless Buffalo Silverside** | Buffalo Meat | Vacuum Pack (IWP) | Uncalibrated | 4 | 20.0 / 21.2 kg | 580 x 380 x 140 | 24 Mo / -18°C | BF |
| `AL-BUF-TOP-02` | **Frozen Boneless Buffalo Topside** | Buffalo Meat | Vacuum Pack (IWP) | Uncalibrated | 4 | 20.0 / 21.2 kg | 580 x 380 x 140 | 24 Mo / -18°C | BF |
| `AL-BUF-TEN-03` | **Frozen Buffalo Tenderloin (Fillet)** | Buffalo Meat | Individual Vacuum Pack | 1.8-2.2 kg | 8 | 18.0 / 19.1 kg | 560 x 360 x 130 | 24 Mo / -18°C | BF |
| `AL-BUF-STR-04` | **Frozen Buffalo Striploin** | Buffalo Meat | Vacuum Pack (IWP) | Uncalibrated | 4 | 20.0 / 21.2 kg | 580 x 380 x 140 | 24 Mo / -18°C | BF |
| `AL-BUF-SHN-05` | **Frozen Buffalo Shin Shank** | Buffalo Meat | Polywrapped Bulk Pack | Uncalibrated | 1 | 25.0 / 26.1 kg | 590 x 390 x 150 | 24 Mo / -18°C | BF |
| `AL-BUF-TRM-06` | **Frozen Buffalo Trimmings 85CL** | Buffalo Meat | Polywrapped Block | Block | 1 | 20.0 / 20.8 kg | 500 x 350 x 120 | 24 Mo / -18°C | BQF |
| `AL-BUF-OFF-07` | **Frozen Buffalo Liver** | Offals | Waxed Carton Bulk | Whole lobes | 3 | 15.0 / 15.9 kg | 480 x 320 x 110 | 18 Mo / -18°C | BF |
| `AL-VPCM-CUB-08`| **Chilled Vacuum-Packed Goat Cubes (450g)** | Sheep & Goat | Thermoformed MAP Tray | 25mm cubes | 24 | 10.8 / 11.6 kg | 400 x 300 x 180 | 60 Days / 0-2°C | Chilled |
| `AL-RTE-PAT-09` | **Allana Halal Buffalo Burger Patties** | Further Processed | Printed Retail Carton | 100g patty | 12 | 9.6 / 10.4 kg | 380 x 280 x 160 | 12 Mo / -18°C | IQF |

### 2.5 Active Shipments & Reefer Containers
```json
[
  {
    "orderNumber": "ORD-2026-88192",
    "companyCode": "LULU-DXB",
    "salesOrgCode": "SO-1010",
    "shipToParty": "LuLu Central Logistics JAFZA, Dubai",
    "destinationCountry": "United Arab Emirates",
    "totalQuantityMt": 54.00,
    "totalAmountUsd": 248400.00,
    "status": "IN_TRANSIT",
    "shippingLine": "Maersk Line",
    "vesselName": "Maersk Mc-Kinney Moller",
    "voyageNumber": "2604W",
    "portOfLoading": "JNPT Nhava Sheva, India",
    "portOfDestination": "Jebel Ali Port, UAE",
    "shippingDate": "2026-10-10T14:00:00Z",
    "etd": "2026-10-12T08:00:00Z",
    "eta": "2026-10-24T18:00:00Z",
    "containers": [
      {
        "containerNumber": "MSKU9482710",
        "sealNumber": "ML-IN-88901",
        "reeferSetTemp": "-18.0°C",
        "items": [
          { "sku": "AL-BUF-SIL-01", "quantityMt": 15.00, "amountUsd": 69000.00 },
          { "sku": "AL-BUF-TOP-02", "quantityMt": 12.00, "amountUsd": 55200.00 }
        ]
      },
      {
        "containerNumber": "MSKU3109284",
        "sealNumber": "ML-IN-88902",
        "reeferSetTemp": "-18.0°C",
        "items": [
          { "sku": "AL-BUF-TEN-03", "quantityMt": 10.00, "amountUsd": 62000.00 },
          { "sku": "AL-BUF-STR-04", "quantityMt": 17.00, "amountUsd": 62200.00 }
        ]
      }
    ]
  },
  {
    "orderNumber": "ORD-2026-88045",
    "companyCode": "LULU-RUH",
    "salesOrgCode": "SO-1010",
    "shipToParty": "LuLu Riyadh Regional Distribution Hub",
    "destinationCountry": "Saudi Arabia",
    "totalQuantityMt": 27.50,
    "totalAmountUsd": 126500.00,
    "status": "ARRIVED_PORT",
    "shippingLine": "CMA CGM",
    "vesselName": "CMA CGM Palais Royal",
    "voyageNumber": "02G8S",
    "portOfLoading": "JNPT Nhava Sheva, India",
    "portOfDestination": "King Abdulaziz Port, Dammam, KSA",
    "shippingDate": "2026-09-28T10:00:00Z",
    "etd": "2026-09-30T16:00:00Z",
    "eta": "2026-10-18T12:00:00Z",
    "containers": [
      {
        "containerNumber": "CMAU7182934",
        "sealNumber": "CGM-91024",
        "reeferSetTemp": "-18.0°C",
        "items": [
          { "sku": "AL-BUF-SIL-01", "quantityMt": 27.50, "amountUsd": 126500.00 }
        ]
      }
    ]
  }
]
```

### 2.6 Customized Product Requests (NPD)
```json
[
  {
    "requestNumber": "NPD-2026-014",
    "companyCode": "LULU-DXB",
    "categoryName": "Sheep & Goat Retail",
    "targetCountry": "United Arab Emirates",
    "cutSpecification": "450g vacuum-packed fresh chilled goat curry cut (25mm bone-in cubes). Must have tamper-evident top seal.",
    "recipeNotes": "No marinade; raw fresh cuts with fat cap trimmed to max 5mm.",
    "packagingFormat": "Skin-pack black rigid tray, 450g net, 24 units per master carton.",
    "targetVolumeMt": 35.00,
    "targetPriceUsd": 8.40,
    "status": "ANALYSIS",
    "managerComments": "R&D verified tray tooling and shelf life stability (60 days under 0°C-2°C). Awaiting QA factory trial validation."
  },
  {
    "requestNumber": "NPD-2026-009",
    "companyCode": "LULU-RUH",
    "categoryName": "Processed RTE/RTC",
    "targetCountry": "Saudi Arabia",
    "cutSpecification": "Pre-seasoned buffalo shawarma strips, marinated with Arabic spice blend.",
    "packagingFormat": "1.0 kg vacuum pouch with LuLu private label branding.",
    "targetVolumeMt": 80.00,
    "targetPriceUsd": 4.90,
    "status": "ACCEPTED",
    "managerComments": "Recipe accepted by LuLu food services team. SFDA formulation clearance received. Production scheduled for Nov 2026."
  }
]
```

### 2.7 Claims & Complaints
```json
[
  {
    "claimNumber": "CLM-2026-0038",
    "companyCode": "LULU-DXB",
    "type": "TEMPERATURE_ABUSE",
    "status": "INVESTIGATION",
    "orderNumber": "ORD-2026-87901",
    "containerNumber": "MSKU7712039",
    "invoiceNumber": "INV-2026-04192",
    "deliveryDate": "2026-10-05T00:00:00Z",
    "description": "Container reefer unit recorded temperature rise to -8°C for 48 hours between Salalah and Jebel Ali. Meat cartons in bottom two tiers show surface softening and ice crystal buildup.",
    "additionalEmail": "coldchain.claims@lulumea.com",
    "companyResponse": "Allana technical team is analyzing temperature logger download data and shipping line transit logs.",
    "items": [
      { "sku": "AL-BUF-TOP-02", "affectedWeightKg": 1840.00, "batchNumber": "B-260904-1" }
    ],
    "attachments": [
      { "fileName": "temp_logger_graph_container_MSKU7712039.pdf", "fileSizeBytes": 845100 },
      { "fileName": "photo_carton_softening_01.jpg", "fileSizeBytes": 1920300 }
    ]
  }
]
```

### 2.8 Regulatory Compliance Licenses (SFDA & Municipal Accreditations)
```json
[
  {
    "companyCode": "LULU-RUH",
    "country": "Saudi Arabia",
    "licenseName": "Saudi SFDA Facility Meat Import Approval",
    "licenseNumber": "SFDA-IMP-2024-8841",
    "issueDate": "2024-11-15T00:00:00Z",
    "expiryDate": "2026-11-08T00:00:00Z",
    "documentUrl": "licenses/LULU-RUH/SFDA-MEAT-IMPORT-FACILITY-2026.pdf",
    "status": "EXPIRING_SOON",
    "daysRemaining": 20
  },
  {
    "companyCode": "LULU-DXB",
    "country": "United Arab Emirates",
    "licenseName": "Dubai Municipality Food Trade Registration",
    "licenseNumber": "DM-FTR-99120",
    "issueDate": "2025-01-01T00:00:00Z",
    "expiryDate": "2027-01-01T00:00:00Z",
    "documentUrl": "licenses/LULU-DXB/DUBAI-MUNICIPALITY-FOOD-IMPORT-PERMIT.pdf",
    "status": "ACTIVE",
    "daysRemaining": 438
  }
]
```

---

## 3. Cloudflare R2 Mock Storage Structure & Seed Assets

### 3.1 Object Tree in Cloudflare R2

```
r2://allana-export-portal/
├── products/
│   ├── images/
│   │   ├── AL-BUF-SIL-01-sample.webp         # Cut cross-section image
│   │   ├── AL-BUF-TOP-02-sample.webp
│   │   ├── AL-BUF-TEN-03-sample.webp
│   │   └── AL-VPCM-CUB-08-sample.webp
│   ├── packaging/
│   │   ├── AL-BUF-SIL-01-carton.webp         # 20kg export carton visual
│   │   └── AL-VPCM-CUB-08-tray.webp          # 450g retail tray visual
│   └── specs/
│       ├── AL-BUF-SIL-01-specification.pdf   # Full technical datasheet
│       └── AL-BUF-TEN-03-specification.pdf
├── shipments/
│   ├── ORD-2026-88192/
│   │   ├── bill-of-lading-MAEU9482710.pdf    # Original Bill of Lading
│   │   ├── health-vet-certificate-IN-2601.pdf# Official Gov of India Vet Cert
│   │   ├── halal-slaughter-cert-JAMIAT.pdf   # Certified Halal Slaughter Document
│   │   ├── commercial-invoice-INV-88192.pdf
│   │   └── packing-list-PL-88192.pdf
│   └── ORD-2026-88045/
│       ├── bill-of-lading-CMAU7182934.pdf
│       ├── sfda-customs-clearance-permit.pdf
│       └── halal-certificate.pdf
├── claims/
│   └── CLM-2026-0038/
│       ├── temp_logger_graph_container_MSKU7712039.pdf
│       ├── photo_carton_softening_01.jpg
│       └── surveyor_inspection_report.pdf
├── licenses/
│   ├── LULU-RUH/
│   │   └── SFDA-MEAT-IMPORT-FACILITY-2026.pdf # Expiring within 25 days (alert banner)
│   └── LULU-DXB/
│       └── DUBAI-MUNICIPALITY-FOOD-IMPORT-PERMIT.pdf
└── reports/
    └── sample-statement-of-account-LULU-DXB.pdf
```

### 3.2 Automated Cloudflare R2 Mock Seeder (`scripts/seed-r2.ts`)

This script connects to Cloudflare R2 (or any local S3-compatible mock such as MinIO / localstack) and uploads placeholder PDF specification sheets, certificates, and images:

```typescript
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

const MOCK_FILES = [
  {
    key: 'shipments/ORD-2026-88192/bill-of-lading-MAEU9482710.pdf',
    contentType: 'application/pdf',
    content: Buffer.from('%PDF-1.4 Mock Bill of Lading for Order ORD-2026-88192 ...'),
  },
  {
    key: 'shipments/ORD-2026-88192/halal-slaughter-cert-JAMIAT.pdf',
    contentType: 'application/pdf',
    content: Buffer.from('%PDF-1.4 Mock Halal Certificate ...'),
  },
  {
    key: 'licenses/LULU-RUH/SFDA-MEAT-IMPORT-FACILITY-2026.pdf',
    contentType: 'application/pdf',
    content: Buffer.from('%PDF-1.4 Saudi SFDA Facility Import License ...'),
  },
  {
    key: 'claims/CLM-2026-0038/temp_logger_graph_container_MSKU7712039.pdf',
    contentType: 'application/pdf',
    content: Buffer.from('%PDF-1.4 Cold Chain Reefer Temp Logger Data ...'),
  },
];

export async function seedR2Storage() {
  console.log(`Seeding mock assets to Cloudflare R2 bucket: ${BUCKET}...`);
  for (const file of MOCK_FILES) {
    await r2.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: file.key,
        Body: file.content,
        ContentType: file.contentType,
      })
    );
    console.log(`Uploaded: ${file.key}`);
  }
  console.log('R2 Mock Assets successfully seeded.');
}
```
