import { PrismaClient, UserRole, Permission, ShipmentStatus, CustomProductStatus, ClaimStatus, ClaimType, FreezingType, InfoRequestCategory } from '@prisma/client';

const prisma = new PrismaClient();

// Pre-hashed bcrypt password for "Allana@2026!"
const DEFAULT_PASSWORD_HASH = '$2a$12$4eL2eZ1xT.u8Jp6pCj/98eE/PZ5G3kC9r21YvQ3w9P4l0Fk1S0C3K';

async function main() {
  console.log('Seeding B2B Export Portal Database with Allana Mock Data...');

  // 1. Clean up existing records in reverse dependency order
  await prisma.notification.deleteMany();
  await prisma.claimAttachment.deleteMany();
  await prisma.claimProductItem.deleteMany();
  await prisma.claim.deleteMany();
  await prisma.shipmentDocument.deleteMany();
  await prisma.shipmentItem.deleteMany();
  await prisma.container.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.salesPlan.deleteMany();
  await prisma.customProductRequest.deleteMany();
  await prisma.product.deleteMany();
  await prisma.subcategory.deleteMany();
  await prisma.category.deleteMany();
  await prisma.actionLog.deleteMany();
  await prisma.complianceLicense.deleteMany();
  await prisma.companyFinancial.deleteMany();
  await prisma.user.deleteMany();
  await prisma.salesOrganization.deleteMany();
  await prisma.company.deleteMany();
  await prisma.newsArticle.deleteMany();

  // 2. Sales Organizations
  const soFrozen = await prisma.salesOrganization.create({
    data: {
      code: 'SO-1010',
      name: 'Allana Frozen Buffalo Meat Division',
      description: 'Primary frozen boneless buffalo cuts and offals export unit',
      currency: 'USD',
    },
  });

  const soFze = await prisma.salesOrganization.create({
    data: {
      code: 'SO-2020',
      name: 'Allana International FZE (Dubai Logistics)',
      description: 'Regional distribution and JAFZA bonded re-export operations',
      currency: 'USD',
    },
  });

  const soRetail = await prisma.salesOrganization.create({
    data: {
      code: 'SO-3030',
      name: 'IRAPL Retail & Consumer Pack Division',
      description: 'Processed RTE/RTC retail vacuum packs and patties',
      currency: 'USD',
    },
  });

  // 3. Companies (Parent Conglomerate & Country Subsidiaries)
  const luluHQ = await prisma.company.create({
    data: {
      id: 'comp-lulu-corp',
      name: 'LuLu Group International (HQ)',
      code: 'LULU-HQ',
      region: 'Middle East',
      country: 'United Arab Emirates',
      telephone: '+971-2-6421800',
      email: 'procurement@ae.lulumea.com',
      managerName: 'Rajesh Sharma',
      managerEmail: 'rajesh.sharma@allana.com',
      managerPhone: '+91-22-22811000',
    },
  });

  const luluDubai = await prisma.company.create({
    data: {
      id: 'comp-lulu-uae',
      name: 'LuLu Hypermarket LLC (Dubai Branch)',
      code: 'LULU-DXB',
      region: 'Middle East',
      country: 'United Arab Emirates',
      telephone: '+971-4-2988880',
      email: 'meatbuyer.dxb@luluhypermarket.com',
      parentCompanyId: luluHQ.id,
      managerName: 'Rajesh Sharma',
      managerEmail: 'rajesh.sharma@allana.com',
      managerPhone: '+91-22-22811000',
    },
  });

  const luluRiyadh = await prisma.company.create({
    data: {
      id: 'comp-lulu-ksa',
      name: 'LuLu Saudi Hypermarkets Co. (Riyadh)',
      code: 'LULU-RUH',
      region: 'Gulf',
      country: 'Saudi Arabia',
      telephone: '+966-11-4091100',
      email: 'meatimports.ksa@luluhypermarket.com',
      parentCompanyId: luluHQ.id,
      managerName: 'Rajesh Sharma',
      managerEmail: 'rajesh.sharma@allana.com',
      managerPhone: '+91-22-22811000',
    },
  });

  // 4. Financial Indicators
  await prisma.companyFinancial.createMany({
    data: [
      {
        companyId: luluDubai.id,
        salesOrgId: soFrozen.id,
        creditLimit: 2500000.00,
        receivables: 1420500.00,
        overdueReceivables: 185000.00,
        availableLimit: 1079500.00,
      },
      {
        companyId: luluDubai.id,
        salesOrgId: soRetail.id,
        creditLimit: 800000.00,
        receivables: 310200.00,
        overdueReceivables: 0.00,
        availableLimit: 489800.00,
      },
      {
        companyId: luluRiyadh.id,
        salesOrgId: soFrozen.id,
        creditLimit: 3500000.00,
        receivables: 2180000.00,
        overdueReceivables: 420000.00,
        availableLimit: 1320000.00,
      },
    ],
  });

  // 5. Users with Granular Permissions
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin.lulu@lulumea.com',
      passwordHash: DEFAULT_PASSWORD_HASH,
      firstName: 'Ahmed',
      lastName: 'Mansoori',
      phone: '+971-50-1234567',
      role: UserRole.ADMIN,
      permissions: [
        Permission.VIEW_CATALOG,
        Permission.ORDER_CUSTOM_PRODUCT,
        Permission.VIEW_SHIPMENTS,
        Permission.VIEW_FINANCIALS,
        Permission.SUBMIT_CLAIMS,
        Permission.MANAGE_MEMBERS,
        Permission.VIEW_REPORTS,
        Permission.DOWNLOAD_DOCUMENTS,
      ],
      isFirstLogin: false,
      companyId: luluHQ.id,
    },
  });

  const buyerUser = await prisma.user.create({
    data: {
      email: 'buyer.dxb@lulumea.com',
      passwordHash: DEFAULT_PASSWORD_HASH,
      firstName: 'Hamdan',
      lastName: 'Al-Falasi',
      phone: '+971-52-9876543',
      role: UserRole.BUYER,
      permissions: [
        Permission.VIEW_CATALOG,
        Permission.ORDER_CUSTOM_PRODUCT,
        Permission.VIEW_SHIPMENTS,
      ],
      isFirstLogin: false,
      companyId: luluDubai.id,
    },
  });

  const financeUser = await prisma.user.create({
    data: {
      email: 'finance.dxb@lulumea.com',
      passwordHash: DEFAULT_PASSWORD_HASH,
      firstName: 'Fatima',
      lastName: 'Zahra',
      phone: '+971-55-2345678',
      role: UserRole.FINANCE,
      permissions: [
        Permission.VIEW_FINANCIALS,
        Permission.VIEW_REPORTS,
      ],
      isFirstLogin: false,
      companyId: luluDubai.id,
    },
  });

  const logisticsUser = await prisma.user.create({
    data: {
      email: 'logistics.ksa@lulumea.com',
      passwordHash: DEFAULT_PASSWORD_HASH,
      firstName: 'Tariq',
      lastName: 'Al-Amri',
      phone: '+966-50-8765432',
      role: UserRole.LOGISTICS,
      permissions: [
        Permission.VIEW_SHIPMENTS,
        Permission.DOWNLOAD_DOCUMENTS,
      ],
      isFirstLogin: false,
      companyId: luluRiyadh.id,
    },
  });

  const qaUser = await prisma.user.create({
    data: {
      email: 'qa.dxb@lulumea.com',
      passwordHash: DEFAULT_PASSWORD_HASH,
      firstName: 'Karen',
      lastName: 'White',
      phone: '+971-54-3456789',
      role: UserRole.QA,
      permissions: [
        Permission.VIEW_CATALOG,
        Permission.SUBMIT_CLAIMS,
        Permission.DOWNLOAD_DOCUMENTS,
      ],
      isFirstLogin: false,
      companyId: luluDubai.id,
    },
  });

  // User with mandatory first-time password reset
  await prisma.user.create({
    data: {
      email: 'onboarding.buyer@lulumea.com',
      passwordHash: DEFAULT_PASSWORD_HASH,
      firstName: 'Zayd',
      lastName: 'Ibrahim',
      phone: '+971-56-1122334',
      role: UserRole.BUYER,
      permissions: [Permission.VIEW_CATALOG],
      isFirstLogin: true, // Forces redirect to /settings/change-password
      companyId: luluDubai.id,
    },
  });

  // Action Log entries
  await prisma.actionLog.createMany({
    data: [
      {
        companyId: luluDubai.id,
        authorId: adminUser.id,
        action: 'USER_CREATED',
        comment: 'Added Hamdan Al-Falasi (buyer.dxb@lulumea.com) with Buyer permissions',
      },
      {
        companyId: luluDubai.id,
        authorId: adminUser.id,
        action: 'PERMISSIONS_UPDATED',
        comment: 'Granted DOWNLOAD_DOCUMENTS permission to QA Officer Karen White',
      },
    ],
  });

  // 6. Product Categories & Subcategories
  const catBuffalo = await prisma.category.create({
    data: {
      name: 'Frozen Buffalo Meat',
      slug: 'frozen-buffalo-meat',
      description: 'Premium quality boneless frozen Indian buffalo meat cuts',
    },
  });

  const catSheepGoat = await prisma.category.create({
    data: {
      name: 'Sheep & Goat',
      slug: 'sheep-and-goat',
      description: 'Chilled and frozen carcass and consumer portions',
    },
  });

  const catProcessed = await prisma.category.create({
    data: {
      name: 'Further Processed / Retail',
      slug: 'further-processed-retail',
      description: 'Value-added RTE/RTC burger patties, mince, and diced cuts',
    },
  });

  const subHind = await prisma.subcategory.create({
    data: {
      name: 'Hindquarter Cuts',
      slug: 'hindquarter-cuts',
      categoryId: catBuffalo.id,
    },
  });

  const subFore = await prisma.subcategory.create({
    data: {
      name: 'Forequarter Cuts',
      slug: 'forequarter-cuts',
      categoryId: catBuffalo.id,
    },
  });

  const subPortion = await prisma.subcategory.create({
    data: {
      name: 'Consumer Portion Packs',
      slug: 'consumer-portion-packs',
      categoryId: catSheepGoat.id,
    },
  });

  // 7. Products
  const pSilverside = await prisma.product.create({
    data: {
      sku: 'AL-BUF-SIL-01',
      name: 'Frozen Boneless Buffalo Silverside',
      slug: 'frozen-boneless-buffalo-silverside',
      brand: 'Allana',
      categoryId: catBuffalo.id,
      subcategoryId: subHind.id,
      productState: 'Frozen (-18°C)',
      primaryPackaging: 'Vacuum Pack (IWP)',
      storageTemperature: '-18°C',
      shelfLifeMonths: 24,
      cartonNetWeightKg: 20.00,
      cartonDimensionsMm: '580 x 380 x 140',
      cartonsPerPallet: 60,
      palletsPerContainer: 20,
      totalContainerWeightMt: 24.00,
      imageUrl: 'products/images/AL-BUF-SIL-01-sample.webp',
      packagingImageUrl: 'products/packaging/AL-BUF-SIL-01-carton.webp',
      specSheetPdfUrl: 'products/specs/AL-BUF-SIL-01-specification.pdf',
      certifications: ['HALAL', 'ISO_22000', 'HACCP', 'SFDA'],
      description: 'Prime Hindquarter cut derived from the thigh muscle. Rich lean meat suitable for roasting, slicing, and further processing. Individually vacuum packed.',
      isUnderDevelopment: false,
    },
  });

  const pTopside = await prisma.product.create({
    data: {
      sku: 'AL-BUF-TOP-02',
      name: 'Frozen Boneless Buffalo Topside',
      slug: 'frozen-boneless-buffalo-topside',
      brand: 'Allana',
      categoryId: catBuffalo.id,
      subcategoryId: subHind.id,
      productState: 'Frozen (-18°C)',
      primaryPackaging: 'Vacuum Pack (IWP)',
      storageTemperature: '-18°C',
      shelfLifeMonths: 24,
      cartonNetWeightKg: 20.00,
      cartonDimensionsMm: '580 x 380 x 140',
      cartonsPerPallet: 60,
      palletsPerContainer: 20,
      totalContainerWeightMt: 24.00,
      imageUrl: 'products/images/AL-BUF-TOP-02-sample.webp',
      packagingImageUrl: 'products/packaging/AL-BUF-TOP-02-carton.webp',
      specSheetPdfUrl: 'products/specs/AL-BUF-TOP-02-specification.pdf',
      certifications: ['HALAL', 'ISO_22000', 'HACCP', 'SFDA'],
      description: 'Large inner thigh muscle cut with minimal connective tissue. Excellent for retail steaks, tender biltong, and premium mince.',
      isUnderDevelopment: false,
    },
  });

  const pTenderloin = await prisma.product.create({
    data: {
      sku: 'AL-BUF-TEN-03',
      name: 'Frozen Buffalo Tenderloin (Fillet)',
      slug: 'frozen-buffalo-tenderloin-fillet',
      brand: 'Allana',
      categoryId: catBuffalo.id,
      subcategoryId: subHind.id,
      productState: 'Frozen (-18°C)',
      primaryPackaging: 'Individual Vacuum Pack (IWP)',
      storageTemperature: '-18°C',
      shelfLifeMonths: 24,
      cartonNetWeightKg: 18.00,
      cartonDimensionsMm: '560 x 360 x 130',
      cartonsPerPallet: 64,
      palletsPerContainer: 20,
      totalContainerWeightMt: 23.04,
      imageUrl: 'products/images/AL-BUF-TEN-03-sample.webp',
      packagingImageUrl: 'products/packaging/AL-BUF-TEN-03-carton.webp',
      specSheetPdfUrl: 'products/specs/AL-BUF-TEN-03-specification.pdf',
      certifications: ['HALAL', 'ISO_22000', 'HACCP', 'SFDA'],
      description: 'The most tender muscle cut running along the spine. Defatted, chain-on/chain-off options available. Ideal for luxury foodservice and steak cuts.',
      isUnderDevelopment: false,
    },
  });

  const pShinShank = await prisma.product.create({
    data: {
      sku: 'AL-BUF-SHN-05',
      name: 'Frozen Buffalo Shin Shank',
      slug: 'frozen-buffalo-shin-shank',
      brand: 'Al-Tamam',
      categoryId: catBuffalo.id,
      subcategoryId: subFore.id,
      productState: 'Frozen (-18°C)',
      primaryPackaging: 'Polywrapped Bulk Pack',
      storageTemperature: '-18°C',
      shelfLifeMonths: 24,
      cartonNetWeightKg: 25.00,
      cartonDimensionsMm: '600 x 400 x 150',
      cartonsPerPallet: 48,
      palletsPerContainer: 20,
      totalContainerWeightMt: 24.00,
      imageUrl: 'products/images/AL-BUF-SHN-05-sample.webp',
      packagingImageUrl: 'products/packaging/AL-BUF-SHN-05-carton.webp',
      specSheetPdfUrl: 'products/specs/AL-BUF-SHN-05-specification.pdf',
      certifications: ['HALAL', 'ISO_22000', 'HACCP'],
      description: 'Flavorful cut rich in collagen and natural gelatin. High demand for traditional Middle Eastern stews, soups, and slow-cook recipes.',
      isUnderDevelopment: false,
    },
  });

  const pGoatCubes = await prisma.product.create({
    data: {
      sku: 'AL-VPCM-CUB-08',
      name: 'Chilled Vacuum-Packed Goat Cubes (450g)',
      slug: 'chilled-vacuum-packed-goat-cubes-450g',
      brand: 'Allana',
      categoryId: catSheepGoat.id,
      subcategoryId: subPortion.id,
      productState: 'Chilled (0°C to 2°C)',
      primaryPackaging: 'Thermoformed MAP Tray',
      storageTemperature: '0°C to 2°C',
      shelfLifeMonths: 2, // 60 days
      cartonNetWeightKg: 10.80, // 24 trays x 450g
      cartonDimensionsMm: '480 x 320 x 160',
      cartonsPerPallet: 80,
      palletsPerContainer: 20,
      totalContainerWeightMt: 17.28,
      imageUrl: 'products/images/AL-VPCM-CUB-08-sample.webp',
      packagingImageUrl: 'products/packaging/AL-VPCM-CUB-08-tray.webp',
      specSheetPdfUrl: 'products/specs/AL-VPCM-CUB-08-specification.pdf',
      certifications: ['HALAL', 'HACCP', 'SFDA'],
      description: 'Fresh Indian goat diced into uniform 25mm curry cubes. Retail-ready modified atmosphere tray packaging with barcode and Arabic labeling.',
      isUnderDevelopment: false,
    },
  });

  // 8. Custom Product Requests (NPD)
  await prisma.customProductRequest.create({
    data: {
      requestNumber: 'NPD-2026-014',
      companyId: luluDubai.id,
      createdById: buyerUser.id,
      categoryName: 'Sheep & Goat Retail',
      targetCountry: 'United Arab Emirates',
      cutSpecification: '450g vacuum-packed fresh chilled goat curry cut (25mm bone-in cubes). Must have tamper-evident top seal.',
      recipeNotes: 'No marinade; raw fresh cuts with fat cap trimmed to max 5mm.',
      packagingFormat: 'Skin-pack black rigid tray, 24 units per master carton.',
      individualPackagingWeight: '450g',
      freezingType: FreezingType.CHILLED,
      estimatedFcaPricePerTon: 8400.00,
      targetVolumeMt: 35.00,
      targetPriceUsd: 8.40,
      isCalibrated: true,
      isMarinated: false,
      isBoneless: false,
      isSkinless: false,
      hasSpecification: true,
      additionalComments: 'Urgent launch for Q4 retail campaign across Dubai and Abu Dhabi outlets.',
      status: CustomProductStatus.ANALYSIS,
      managerComments: 'R&D verified tray tooling and shelf life stability (60 days under 0°C-2°C). Awaiting QA factory trial validation.',
    },
  });

  await prisma.customProductRequest.create({
    data: {
      requestNumber: 'NPD-2026-009',
      companyId: luluRiyadh.id,
      createdById: logisticsUser.id,
      categoryName: 'Processed RTE/RTC',
      targetCountry: 'Saudi Arabia',
      cutSpecification: 'Pre-seasoned buffalo shawarma strips, marinated with Arabic spice blend.',
      packagingFormat: '1.0 kg vacuum pouch with LuLu private label branding.',
      individualPackagingWeight: '1.0 kg',
      freezingType: FreezingType.BLOCK_FROZEN,
      estimatedFcaPricePerTon: 4900.00,
      targetVolumeMt: 80.00,
      targetPriceUsd: 4.90,
      isCalibrated: false,
      isMarinated: true,
      isBoneless: true,
      isSkinless: true,
      hasSpecification: true,
      additionalComments: 'LuLu private label artwork ready in vector format.',
      status: CustomProductStatus.ACCEPTED,
      managerComments: 'Recipe accepted by LuLu food services team. SFDA formulation clearance received. Production scheduled for Nov 2026.',
    },
  });

  // 9. Shipments with Reefer Containers and Cargo Items
  const shipment1 = await prisma.shipment.create({
    data: {
      orderNumber: 'ORD-2026-88192',
      companyId: luluDubai.id,
      salesOrgId: soFrozen.id,
      shipToParty: 'LuLu Central Logistics JAFZA, Dubai',
      destinationCountry: 'United Arab Emirates',
      totalQuantityMt: 48.00,
      totalAmountUsd: 220800.00,
      status: ShipmentStatus.IN_TRANSIT,
      shippingLine: 'Maersk Line',
      vesselName: 'Maersk Mc-Kinney Moller',
      voyageNumber: '2604W',
      portOfLoading: 'JNPT Nhava Sheva, India',
      portOfDestination: 'Jebel Ali Port, UAE',
      shippingDate: new Date('2026-10-10T14:00:00Z'),
      etd: new Date('2026-10-12T08:00:00Z'),
      eta: new Date('2026-10-24T18:00:00Z'),
    },
  });

  const c1 = await prisma.container.create({
    data: {
      shipmentId: shipment1.id,
      containerNumber: 'MSKU9482710',
      sealNumber: 'ML-IN-88901',
      reeferSetTemp: '-18.0°C',
    },
  });

  await prisma.shipmentItem.createMany({
    data: [
      {
        containerId: c1.id,
        productId: pSilverside.id,
        quantityMt: 14.00,
        amountUsd: 64400.00,
      },
      {
        containerId: c1.id,
        productId: pTopside.id,
        quantityMt: 10.00,
        amountUsd: 46000.00,
      },
    ],
  });

  const c2 = await prisma.container.create({
    data: {
      shipmentId: shipment1.id,
      containerNumber: 'MSKU3109284',
      sealNumber: 'ML-IN-88902',
      reeferSetTemp: '-18.0°C',
    },
  });

  await prisma.shipmentItem.createMany({
    data: [
      {
        containerId: c2.id,
        productId: pTenderloin.id,
        quantityMt: 12.00,
        amountUsd: 74400.00,
      },
      {
        containerId: c2.id,
        productId: pShinShank.id,
        quantityMt: 12.00,
        amountUsd: 36000.00,
      },
    ],
  });

  // Shipping Documents in Cloudflare R2
  await prisma.shipmentDocument.createMany({
    data: [
      {
        shipmentId: shipment1.id,
        documentType: 'BILL_OF_LADING',
        fileName: 'bill-of-lading-MAEU9482710.pdf',
        fileUrl: 'shipments/ORD-2026-88192/bill-of-lading-MAEU9482710.pdf',
        fileSizeBytes: 420800,
      },
      {
        shipmentId: shipment1.id,
        documentType: 'VET_CERT',
        fileName: 'health-vet-certificate-IN-2601.pdf',
        fileUrl: 'shipments/ORD-2026-88192/health-vet-certificate-IN-2601.pdf',
        fileSizeBytes: 310500,
      },
      {
        shipmentId: shipment1.id,
        documentType: 'HALAL_CERT',
        fileName: 'halal-slaughter-cert-JAMIAT.pdf',
        fileUrl: 'shipments/ORD-2026-88192/halal-slaughter-cert-JAMIAT.pdf',
        fileSizeBytes: 290400,
      },
    ],
  });

  // 10. Sales Plan Records
  await prisma.salesPlan.createMany({
    data: [
      {
        companyId: luluDubai.id,
        salesOrgId: soFrozen.id,
        month: 10,
        year: 2026,
        country: 'United Arab Emirates',
        shipToParty: 'LuLu Central Logistics JAFZA',
        sku: 'AL-BUF-SIL-01',
        skuName: 'Frozen Boneless Buffalo Silverside',
        targetTonnes: 50.00,
        targetUsd: 230000.00,
        lastMonthBalance: 10.00,
        shippedTonnes: 35.00,
        shippedUsd: 161000.00,
        pipelineTonnes: 20.00,
        pipelineUsd: 92000.00,
      },
      {
        companyId: luluDubai.id,
        salesOrgId: soFrozen.id,
        month: 10,
        year: 2026,
        country: 'United Arab Emirates',
        shipToParty: 'LuLu Central Logistics JAFZA',
        sku: 'AL-BUF-TOP-02',
        skuName: 'Frozen Boneless Buffalo Topside',
        targetTonnes: 40.00,
        targetUsd: 184000.00,
        lastMonthBalance: 0.00,
        shippedTonnes: 30.00,
        shippedUsd: 138000.00,
        pipelineTonnes: 15.00,
        pipelineUsd: 69000.00,
      },
    ],
  });

  // 11. Claims & Service Desk (Claim Form & Info Request)
  const claim1 = await prisma.claim.create({
    data: {
      claimNumber: 'CLM-2026-0038',
      companyId: luluDubai.id,
      submittedById: qaUser.id,
      type: ClaimType.CLAIM,
      status: ClaimStatus.INVESTIGATION,
      subject: 'Temperature rise and carton softening in Reefer MSKU9482710',
      categoryOfRequest: 'Temperature Abuse',
      supplierName: 'Allanasons Private Limited - Aligarh Processing Unit',
      shipmentId: shipment1.id,
      containerNumber: 'MSKU9482710',
      invoiceNumber: 'INV-2026-04192',
      deliveryDate: new Date('2026-10-05T00:00:00Z'),
      description: 'Container reefer unit recorded temperature rise to -8°C for 48 hours between Salalah and Jebel Ali. Meat cartons in bottom two tiers show surface softening and ice crystal buildup.',
      additionalEmails: 'coldchain.claims@lulumea.com; logistics@lulumea.com',
      companyResponse: 'Allana technical team is analyzing temperature logger download data and shipping line transit logs.',
    },
  });

  await prisma.claimProductItem.create({
    data: {
      claimId: claim1.id,
      productId: pTopside.id,
      productArticle: '8320L',
      productName: 'Frozen Boneless Buffalo Topside',
      producerName: 'Allanasons Pvt Ltd - Aligarh',
      country: 'United Arab Emirates',
      vehicleNumber: 'MSKU9482710',
      nonConformWeightKg: 1840.0000,
      receivedQuantityKg: 10000.0000,
      lotNumber: 'B-260904-1',
      productionDate: new Date('2026-09-04T00:00:00Z'),
    },
  });

  // Info Request Example (Shelf Life Extension Declaration)
  await prisma.claim.create({
    data: {
      claimNumber: 'REQ-2026-0012',
      companyId: luluDubai.id,
      submittedById: buyerUser.id,
      type: ClaimType.INFO_REQUEST,
      status: ClaimStatus.REGISTERED,
      subject: 'Request for Shelf Life Extension Declaration for Buffalo Silverside',
      infoCategory: InfoRequestCategory.DOCS_DECLARATION_SHELF_LIFE,
      targetCountry: 'United Arab Emirates',
      supplierName: 'Allanasons Private Limited - Sahibabad Plant',
      requestedShelfLifeDate: new Date('2027-04-30T00:00:00Z'),
      shelfLifeExtensionVolumeKg: 5000.0000,
      reasonForShelfLifeExtension: 'Port congestion delayed customs clearance by 3 weeks; retailer requires manufacturer validation for 60-day shelf life extension.',
      additionalEmails: 'procurement@ae.lulumea.com',
      description: 'Please issue official manufacturer declaration confirming stability under continuous -18°C storage.',
    },
  });

  await prisma.claimAttachment.createMany({
    data: [
      {
        claimId: claim1.id,
        fileName: 'temp_logger_graph_container_MSKU9482710.pdf',
        fileUrl: 'claims/CLM-2026-0038/temp_logger_graph_container_MSKU9482710.pdf',
        fileSizeBytes: 845100,
      },
      {
        claimId: claim1.id,
        fileName: 'photo_carton_softening_01.jpg',
        fileUrl: 'claims/CLM-2026-0038/photo_carton_softening_01.jpg',
        fileSizeBytes: 1920300,
      },
    ],
  });

  // 12. Regulatory Licenses (Saudi Arabia SFDA expiring soon)
  await prisma.complianceLicense.createMany({
    data: [
      {
        companyId: luluRiyadh.id,
        country: 'Saudi Arabia',
        licenseName: 'Saudi SFDA Facility Meat Import Approval',
        licenseNumber: 'SFDA-IMP-2024-8841',
        issueDate: new Date('2024-11-15T00:00:00Z'),
        expiryDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // Expiring in 20 days!
        documentUrl: 'licenses/LULU-RUH/SFDA-MEAT-IMPORT-FACILITY-2026.pdf',
      },
      {
        companyId: luluDubai.id,
        country: 'United Arab Emirates',
        licenseName: 'Dubai Municipality Food Trade Registration',
        licenseNumber: 'DM-FTR-99120',
        issueDate: new Date('2025-01-01T00:00:00Z'),
        expiryDate: new Date('2027-01-01T00:00:00Z'),
        documentUrl: 'licenses/LULU-DXB/DUBAI-MUNICIPALITY-FOOD-IMPORT-PERMIT.pdf',
      },
    ],
  });

  // 13. News & Hero Slider Articles
  await prisma.newsArticle.createMany({
    data: [
      {
        title: 'Allana Expands Ultra-Low Temperature Cold Chain Fleet for GCC Trade',
        slug: 'allana-expands-cold-chain-fleet-gcc',
        summary: 'Commissioning 50 new smart reefer containers equipped with real-time IoT temperature and GPS telemetry.',
        contentHtml: '<p>Allanasons Private Limited has inducted 50 state-of-the-art reefer containers equipped with Carrier Transicold PrimeLINE units and cellular IoT sensors to guarantee unbroken -18°C cold chain visibility across Mumbai-Jebel Ali-Dammam corridors.</p>',
        imageUrl: 'news/smart-reefer-fleet.webp',
        isSlider: true,
      },
      {
        title: 'New Value-Added Chilled Goat Cubes Launch in LuLu UAE Outlets',
        slug: 'chilled-goat-cubes-lulu-uae',
        summary: 'Retail skin-pack MAP trays launched across 40 hypermarket locations with 60-day shelf stability.',
        contentHtml: '<p>Developed through our collaborative Customized Product NPD pipeline with LuLu Group, the fresh 450g chilled goat cubes have achieved record consumer pickup in Dubai and Abu Dhabi.</p>',
        imageUrl: 'news/goat-tray-retail.webp',
        isSlider: true,
      },
      {
        title: 'Global Meat Market Update: Q4 Buffalo Export Trends & Ocean Freight Forecast',
        slug: 'global-meat-market-update-q4-2026',
        summary: 'Analysis of cattle livestock cycles, port congestion at Nhava Sheva, and freight rate stabilization.',
        contentHtml: '<p>Ocean freight rates on West Coast India to Arabian Gulf lanes stabilized at $1,250/FEU. Processing capacity across Allana UP and Punjab abattoirs remains at 100% capacity heading into festive demand.</p>',
        imageUrl: 'news/market-update-q4.webp',
        isSlider: false,
      },
      {
        title: 'Halal Assurance & SFDA Compliance Audit Completed Successfully',
        slug: 'halal-assurance-sfda-compliance-audit-2026',
        summary: 'Annual reassessment by Jamiat Ulama-i-Hind Halal Trust and SFDA supervisory delegation.',
        contentHtml: '<p>Allana export slaughterhouses in Aligarh and Sahibabad achieved 100% compliance score in the comprehensive veterinary hygiene, stunned-free halal slaughter protocol, and microbiological testing audit.</p>',
        imageUrl: 'news/halal-audit-certified.webp',
        isSlider: false,
      },
    ],
  });

  // 14. Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: buyerUser.id,
        title: 'Custom Product Update: NPD-2026-014',
        message: 'Your request for 450g Goat Cubes moved to Analysis stage by R&D.',
        link: '/customized-products',
        isRead: false,
      },
      {
        userId: logisticsUser.id,
        title: 'Shipment Arrival Notice: ORD-2026-88045',
        message: 'Vessel CMA CGM Palais Royal has berthed at King Abdulaziz Port, Dammam.',
        link: '/shipments',
        isRead: false,
      },
      {
        userId: adminUser.id,
        title: 'Urgent License Renewal: SFDA Approval',
        message: 'Saudi SFDA Facility Meat Import Approval expires in 20 days.',
        link: '/settings/licenses',
        isRead: false,
      },
    ],
  });

  console.log('Database seeding successfully finished.');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
