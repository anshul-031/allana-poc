import { ProductDetailDTO } from '@/server/actions/catalog.actions';

/**
 * Escapes special characters in text for PDF string literals
 */
export function escapePdfText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\r/g, '')
    .replace(/\n/g, ' ');
}

/**
 * Enterprise PDF Spec Sheet Generator for Allana B2B Customer Portal.
 * Produces compliant PDF-1.4 documents without native or external binary dependencies.
 */
export function generateProductSpecSheetPdf(product: ProductDetailDTO): Buffer {
  const currentDate = new Date().toISOString().split('T')[0];
  const totalCartons = product.cartonsPerPallet * product.palletsPerContainer;

  // Stream graphics and text commands
  const contentStream = [
    // Header background banner (Navy #0a192f)
    '0.039 0.098 0.184 rg',
    '30 760 535 55 re f',

    // Gold decorative stripe
    '0.773 0.627 0.349 rg',
    '30 755 535 5 re f',

    // Header Title
    'BT',
    '/F2 16 Tf',
    '1 1 1 rg',
    '45 790 Td',
    '(ALLANA SONS PRIVATE LIMITED - GLOBAL EXPORT SPECIFICATION) Tj',
    'ET',

    // Header Subtitle
    'BT',
    '/F1 9 Tf',
    '0.773 0.627 0.349 rg',
    '45 772 Td',
    '(OFFICIAL TECHNICAL DATA SHEET & COLD-CHAIN LOGISTICS MATRIX) Tj',
    'ET',

    // Product Title Block
    'BT',
    '/F2 15 Tf',
    '0.039 0.098 0.184 rg',
    '30 720 Td',
    `(${escapePdfText(product.name)}) Tj`,
    'ET',

    // Product SKU and Category Meta
    'BT',
    '/F1 10 Tf',
    '0.278 0.333 0.412 rg',
    '30 705 Td',
    `(${escapePdfText(`SKU: ${product.sku}  |  Brand: ${product.brand}  |  Category: ${product.categoryName}${product.subcategoryName ? ` - ${product.subcategoryName}` : ''}`)}) Tj`,
    'ET',

    // Description text block
    'BT',
    '/F1 9 Tf',
    '0.392 0.455 0.545 rg',
    '30 685 Td',
    `(${escapePdfText(`Description: ${product.description || 'Premium export grade cut processed under international standards.'}`)}) Tj`,
    'ET',

    // Section 1: 10-Column Logistics Spec Table Header
    '0.039 0.098 0.184 rg',
    '30 655 535 20 re f',

    'BT',
    '/F2 9 Tf',
    '1 1 1 rg',
    '40 662 Td',
    '(10-COLUMN EXPORT PACKAGING & LOGISTICS SPECIFICATIONS) Tj',
    'ET',

    // Spec Table Rows Background
    '0.973 0.980 0.988 rg',
    '30 520 535 130 re f',
    '0.886 0.910 0.941 RG',
    '1 w',
    '30 520 535 130 re S',

    // Table Content Key-Value Pairs
    'BT',
    '/F2 9 Tf',
    '0.039 0.098 0.184 rg',
    '40 630 Td',
    '(1. SKU / Article Code:) Tj',
    '150 0 Td',
    '/F1 9 Tf',
    '0.059 0.090 0.165 rg',
    `(${escapePdfText(product.sku)}) Tj`,
    'ET',

    'BT',
    '/F2 9 Tf',
    '0.039 0.098 0.184 rg',
    '40 612 Td',
    '(2. Carton Nett Weight:) Tj',
    '150 0 Td',
    '/F1 9 Tf',
    '0.059 0.090 0.165 rg',
    `(${escapePdfText(`${product.cartonNetWeightKg} kg`)}) Tj`,
    'ET',

    'BT',
    '/F2 9 Tf',
    '0.039 0.098 0.184 rg',
    '40 594 Td',
    '(3. Primary Packaging:) Tj',
    '150 0 Td',
    '/F1 9 Tf',
    '0.059 0.090 0.165 rg',
    `(${escapePdfText(product.primaryPackaging)}) Tj`,
    'ET',

    'BT',
    '/F2 9 Tf',
    '0.039 0.098 0.184 rg',
    '40 576 Td',
    '(4. Cut Piece Size:) Tj',
    '150 0 Td',
    '/F1 9 Tf',
    '0.059 0.090 0.165 rg',
    `(${escapePdfText(product.cutSize)}) Tj`,
    'ET',

    'BT',
    '/F2 9 Tf',
    '0.039 0.098 0.184 rg',
    '40 558 Td',
    '(5. Packages Per Carton:) Tj',
    '150 0 Td',
    '/F1 9 Tf',
    '0.059 0.090 0.165 rg',
    `(${escapePdfText(String(product.packagesPerCarton))}) Tj`,
    'ET',

    'BT',
    '/F2 9 Tf',
    '0.039 0.098 0.184 rg',
    '40 540 Td',
    '(6. Carton Gross Weight:) Tj',
    '150 0 Td',
    '/F1 9 Tf',
    '0.059 0.090 0.165 rg',
    `(${escapePdfText(`${product.cartonWeightKg} kg`)}) Tj`,
    'ET',

    // Right Column of Spec Table
    'BT',
    '/F2 9 Tf',
    '0.039 0.098 0.184 rg',
    '310 630 Td',
    '(7. Dimensions (L*W*H):) Tj',
    '130 0 Td',
    '/F1 9 Tf',
    '0.059 0.090 0.165 rg',
    `(${escapePdfText(`${product.cartonDimensionsMm} mm`)}) Tj`,
    'ET',

    'BT',
    '/F2 9 Tf',
    '0.039 0.098 0.184 rg',
    '310 612 Td',
    '(8. Shelf Life:) Tj',
    '130 0 Td',
    '/F1 9 Tf',
    '0.059 0.090 0.165 rg',
    `(${escapePdfText(`${product.shelfLifeMonths} Months`)}) Tj`,
    'ET',

    'BT',
    '/F2 9 Tf',
    '0.039 0.098 0.184 rg',
    '310 594 Td',
    '(9. Storage Temperature:) Tj',
    '130 0 Td',
    '/F1 9 Tf',
    '0.059 0.090 0.165 rg',
    `(${escapePdfText(product.storageTemperature)}) Tj`,
    'ET',

    'BT',
    '/F2 9 Tf',
    '0.039 0.098 0.184 rg',
    '310 576 Td',
    '(10. Freezing Method:) Tj',
    '130 0 Td',
    '/F1 9 Tf',
    '0.059 0.090 0.165 rg',
    `(${escapePdfText(product.freezingType)}) Tj`,
    'ET',

    'BT',
    '/F2 9 Tf',
    '0.039 0.098 0.184 rg',
    '310 558 Td',
    '(Product State:) Tj',
    '130 0 Td',
    '/F1 9 Tf',
    '0.059 0.090 0.165 rg',
    `(${escapePdfText(product.productState)}) Tj`,
    'ET',

    'BT',
    '/F2 9 Tf',
    '0.039 0.098 0.184 rg',
    '310 540 Td',
    '(Status:) Tj',
    '130 0 Td',
    '/F1 9 Tf',
    '0.059 0.090 0.165 rg',
    `(${escapePdfText(product.isUnderDevelopment ? 'Under Development (QA Review)' : 'Commercial Export Standard')}) Tj`,
    'ET',

    // Section 2: 40ft High Cube Container Reefer Pattern
    '0.039 0.098 0.184 rg',
    '30 480 535 20 re f',

    'BT',
    '/F2 9 Tf',
    '1 1 1 rg',
    '40 487 Td',
    '(40FT HIGH CUBE REEFER CONTAINER STOWAGE & LOGISTICS MATRIX) Tj',
    'ET',

    '0.973 0.980 0.988 rg',
    '30 410 535 65 re f',
    '0.886 0.910 0.941 RG',
    '1 w',
    '30 410 535 65 re S',

    'BT',
    '/F2 9 Tf',
    '0.039 0.098 0.184 rg',
    '40 455 Td',
    '(Cartons Per Pallet:) Tj',
    '140 0 Td',
    '/F1 9 Tf',
    '0.059 0.090 0.165 rg',
    `(${escapePdfText(String(product.cartonsPerPallet))}) Tj`,
    'ET',

    'BT',
    '/F2 9 Tf',
    '0.039 0.098 0.184 rg',
    '40 435 Td',
    '(Pallets Per Container:) Tj',
    '140 0 Td',
    '/F1 9 Tf',
    '0.059 0.090 0.165 rg',
    `(${escapePdfText(String(product.palletsPerContainer))}) Tj`,
    'ET',

    'BT',
    '/F2 9 Tf',
    '0.039 0.098 0.184 rg',
    '40 418 Td',
    '(Total Cartons In Container:) Tj',
    '140 0 Td',
    '/F1 9 Tf',
    '0.059 0.090 0.165 rg',
    `(${escapePdfText(String(totalCartons))}) Tj`,
    'ET',

    'BT',
    '/F2 9 Tf',
    '0.039 0.098 0.184 rg',
    '310 455 Td',
    '(Container Net Payload:) Tj',
    '140 0 Td',
    '/F2 9 Tf',
    '0.773 0.627 0.349 rg',
    `(${escapePdfText(`${product.totalContainerWeightMt} MT  (${product.totalContainerWeightMt * 1000} kg)`)}) Tj`,
    'ET',

    'BT',
    '/F2 9 Tf',
    '0.039 0.098 0.184 rg',
    '310 435 Td',
    '(Stowage Factor:) Tj',
    '140 0 Td',
    '/F1 9 Tf',
    '0.059 0.090 0.165 rg',
    '(Euro / ISO Palletized Standard) Tj',
    'ET',

    // Section 3: Regulatory Compliance & Certifications
    '0.039 0.098 0.184 rg',
    '30 370 535 20 re f',

    'BT',
    '/F2 9 Tf',
    '1 1 1 rg',
    '40 377 Td',
    '(INTERNATIONAL FOOD SAFETY & REGULATORY ACCREDITATIONS) Tj',
    'ET',

    '0.973 0.980 0.988 rg',
    '30 300 535 65 re f',
    '0.886 0.910 0.941 RG',
    '1 w',
    '30 300 535 65 re S',

    'BT',
    '/F2 9 Tf',
    '0.039 0.098 0.184 rg',
    '40 345 Td',
    '(Halal Compliance:) Tj',
    '140 0 Td',
    '/F1 9 Tf',
    '0.059 0.090 0.165 rg',
    '(100% Halal Slaughtered according to Islamic Sharia Rites) Tj',
    'ET',

    'BT',
    '/F2 9 Tf',
    '0.039 0.098 0.184 rg',
    '40 327 Td',
    '(Safety Standards:) Tj',
    '140 0 Td',
    '/F1 9 Tf',
    '0.059 0.090 0.165 rg',
    `(${escapePdfText(product.certifications.join(', ') || 'HALAL, ISO 22000, HACCP, SFDA')}) Tj`,
    'ET',

    'BT',
    '/F2 9 Tf',
    '0.039 0.098 0.184 rg',
    '40 309 Td',
    '(Accrediting Bodies:) Tj',
    '140 0 Td',
    '/F1 9 Tf',
    '0.059 0.090 0.165 rg',
    '(APEDA, SFDA (Saudi Food & Drug Authority), EIA, FSSAI) Tj',
    'ET',

    // Official Cold Chain Disclaimer Banner
    '0.996 0.949 0.949 rg',
    '30 220 535 65 re f',
    '0.992 0.804 0.827 RG',
    '1 w',
    '30 220 535 65 re S',

    'BT',
    '/F2 9 Tf',
    '0.624 0.071 0.224 rg',
    '40 268 Td',
    '(MANDATORY COLD-CHAIN & EXPORT HANDLING DIRECTIVE:) Tj',
    'ET',

    'BT',
    '/F1 8 Tf',
    '0.278 0.333 0.412 rg',
    '40 252 Td',
    '(Product must remain maintained at continuous temperatures of -18 deg C or below at all times during sea) Tj',
    '0 -12 Td',
    '(freight transit and destination storage. Consignments undergo continuous electronic temperature logging.) Tj',
    '0 -12 Td',
    '(Allana Sons Pvt Ltd certifies that all cuts adhere strictly to bilateral veterinary health protocols.) Tj',
    'ET',

    // Footer & Signature Block
    '0.773 0.627 0.349 RG',
    '1 w',
    '30 140 535 0 m 565 140 l S',

    'BT',
    '/F2 8 Tf',
    '0.039 0.098 0.184 rg',
    '30 125 Td',
    '(ALLANA SONS PRIVATE LIMITED  |  ALLANA HOUSE, 4 ALLANA ROAD, COLABA, MUMBAI 400 001, INDIA) Tj',
    'ET',

    'BT',
    '/F1 8 Tf',
    '0.392 0.455 0.545 rg',
    '30 110 Td',
    `(${escapePdfText(`Document Generated: ${currentDate}  |  Official Customer Portal Export Spec  |  Ref: SPEC-${product.sku}`)}) Tj`,
    'ET',

    'BT',
    '/F2 8 Tf',
    '0.773 0.627 0.349 rg',
    '430 110 Td',
    '(QUALITY ASSURANCE APPROVED) Tj',
    'ET',
  ];

  const streamContent = contentStream.join('\n');
  const streamLength = Buffer.byteLength(streamContent, 'utf-8');

  // Build PDF 1.4 objects
  const objects: string[] = [];
  objects[1] = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj';
  objects[2] = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj';
  objects[3] =
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj';
  objects[4] = `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj`;
  objects[5] = '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj';
  objects[6] = '6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj';

  let pdfOutput = '%PDF-1.4\n%âãÏÓ\n';
  const offsets: number[] = [0];

  for (let i = 1; i <= 6; i++) {
    offsets[i] = Buffer.byteLength(pdfOutput, 'utf-8');
    pdfOutput += objects[i] + '\n';
  }

  const startXref = Buffer.byteLength(pdfOutput, 'utf-8');
  pdfOutput += 'xref\n0 7\n';
  pdfOutput += '0000000000 65535 f \n';

  for (let i = 1; i <= 6; i++) {
    const padded = String(offsets[i]).padStart(10, '0');
    pdfOutput += `${padded} 00000 n \n`;
  }

  pdfOutput += `trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;

  return Buffer.from(pdfOutput, 'utf-8');
}
