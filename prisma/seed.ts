import { PrismaClient, UserRole, Permission, ShipmentStatus, CustomProductStatus, ClaimStatus, ClaimType, FreezingType, InfoRequestCategory } from '@prisma/client';

const prisma = new PrismaClient();

// Pre-hashed bcrypt password for "Allana@2026!"
const DEFAULT_PASSWORD_HASH = '$2a$12$4eL2eZ1xT.u8Jp6pCj/98eE/PZ5G3kC9r21YvQ3w9P4l0Fk1S0C3K';

async function main() {
  console.log('Seeding B2B Export Portal Database with Complete Enterprise Allana Mock Data...');

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

  // 2. Sales Organizations (4 Divisions)
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

  const soAgro = await prisma.salesOrganization.create({
    data: {
      code: 'SO-4040',
      name: 'Allanasons Agro-Commodities Division',
      description: 'Premium Basmati rice, coffee, pulses and agro-commodities export unit',
      currency: 'USD',
    },
  });

  // 3. Companies (Parent Conglomerate & Country Operating Subsidiaries)
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

  // 4. Financial Indicators & Credit Facility
  await prisma.companyFinancial.createMany({
    data: [
      {
        companyId: luluDubai.id,
        salesOrgId: soFrozen.id,
        creditLimit: 3500000.00,
        receivables: 1420500.00,
        overdueReceivables: 185000.00,
        availableLimit: 2079500.00,
      },
      {
        companyId: luluDubai.id,
        salesOrgId: soRetail.id,
        creditLimit: 1200000.00,
        receivables: 310200.00,
        overdueReceivables: 0.00,
        availableLimit: 889800.00,
      },
      {
        companyId: luluDubai.id,
        salesOrgId: soFze.id,
        creditLimit: 2000000.00,
        receivables: 780000.00,
        overdueReceivables: 0.00,
        availableLimit: 1220000.00,
      },
      {
        companyId: luluDubai.id,
        salesOrgId: soAgro.id,
        creditLimit: 1500000.00,
        receivables: 540000.00,
        overdueReceivables: 25000.00,
        availableLimit: 960000.00,
      },
      {
        companyId: luluRiyadh.id,
        salesOrgId: soFrozen.id,
        creditLimit: 4500000.00,
        receivables: 2180000.00,
        overdueReceivables: 420000.00,
        availableLimit: 2320000.00,
      },
      {
        companyId: luluRiyadh.id,
        salesOrgId: soFze.id,
        creditLimit: 2500000.00,
        receivables: 920000.00,
        overdueReceivables: 0.00,
        availableLimit: 1580000.00,
      },
      {
        companyId: luluHQ.id,
        salesOrgId: soFrozen.id,
        creditLimit: 5000000.00,
        receivables: 1850000.00,
        overdueReceivables: 0.00,
        availableLimit: 3150000.00,
      },
      {
        companyId: luluHQ.id,
        salesOrgId: soAgro.id,
        creditLimit: 2500000.00,
        receivables: 620000.00,
        overdueReceivables: 0.00,
        availableLimit: 1880000.00,
      },
    ],
  });

  // 5. Users with Granular Permissions
  const adminUser = await prisma.user.create({
    data: {
      id: 'usr-default',
      email: 'admin.lulu@lulumea.com',
      passwordHash: DEFAULT_PASSWORD_HASH,
      firstName: 'Ahmed',
      lastName: 'Mansoori',
      phone: '+971-50-1234567',
      jobTitle: 'VP Procurement & Group Director',
      comment: 'Chief Meat Procurement & Supply Chain Executive for GCC region',
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
        Permission.CLIENT_MANAGEMENT,
        Permission.VIEW_CLIENTS,
        Permission.VIEW_LOGS,
      ],
      isFirstLogin: false,
      twoFactorEnabled: true,
      companyId: luluDubai.id,
    },
  });

  const buyerUser = await prisma.user.create({
    data: {
      id: 'usr-buyer-dxb',
      email: 'buyer.dxb@lulumea.com',
      passwordHash: DEFAULT_PASSWORD_HASH,
      firstName: 'Hamdan',
      lastName: 'Al-Falasi',
      phone: '+971-52-9876543',
      jobTitle: 'Senior Meat Buyer',
      comment: 'Handles frozen boneless beef and primal hindquarter orders',
      role: UserRole.BUYER,
      permissions: [
        Permission.VIEW_CATALOG,
        Permission.ORDER_CUSTOM_PRODUCT,
        Permission.VIEW_SHIPMENTS,
        Permission.DOWNLOAD_DOCUMENTS,
      ],
      isFirstLogin: false,
      twoFactorEnabled: true,
      companyId: luluDubai.id,
    },
  });

  const financeUser = await prisma.user.create({
    data: {
      id: 'usr-finance-dxb',
      email: 'finance.dxb@lulumea.com',
      passwordHash: DEFAULT_PASSWORD_HASH,
      firstName: 'Fatima',
      lastName: 'Zahra',
      phone: '+971-55-2345678',
      jobTitle: 'Senior Financial Controller',
      comment: 'Trade finance, Letter of Credit (LC) and receivables reconciliation lead',
      role: UserRole.FINANCE,
      permissions: [
        Permission.VIEW_FINANCIALS,
        Permission.VIEW_REPORTS,
        Permission.DOWNLOAD_DOCUMENTS,
      ],
      isFirstLogin: false,
      twoFactorEnabled: true,
      companyId: luluDubai.id,
    },
  });

  const logisticsUser = await prisma.user.create({
    data: {
      id: 'usr-logistics-ksa',
      email: 'logistics.ksa@lulumea.com',
      passwordHash: DEFAULT_PASSWORD_HASH,
      firstName: 'Tariq',
      lastName: 'Al-Amri',
      phone: '+966-50-8765432',
      jobTitle: 'Regional Logistics Lead (KSA)',
      comment: 'Supervises Jeddah Islamic Port and Dammam port customs clearance',
      role: UserRole.LOGISTICS,
      permissions: [
        Permission.VIEW_SHIPMENTS,
        Permission.DOWNLOAD_DOCUMENTS,
      ],
      isFirstLogin: false,
      twoFactorEnabled: true,
      companyId: luluRiyadh.id,
    },
  });

  const qaUser = await prisma.user.create({
    data: {
      id: 'usr-qa-dxb',
      email: 'qa.dxb@lulumea.com',
      passwordHash: DEFAULT_PASSWORD_HASH,
      firstName: 'Karen',
      lastName: 'White',
      phone: '+971-54-3456789',
      jobTitle: 'Cold Chain Quality Officer',
      comment: 'Temperature logger verification, microbiological standards & claims filing',
      role: UserRole.QA,
      permissions: [
        Permission.VIEW_CATALOG,
        Permission.SUBMIT_CLAIMS,
        Permission.DOWNLOAD_DOCUMENTS,
      ],
      isFirstLogin: false,
      twoFactorEnabled: true,
      companyId: luluDubai.id,
    },
  });

  const logisticsDubaiUser = await prisma.user.create({
    data: {
      id: 'usr-logistics-dxb',
      email: 'logistics.dxb@lulumea.com',
      passwordHash: DEFAULT_PASSWORD_HASH,
      firstName: 'Rashid',
      lastName: 'Al-Maktoum',
      phone: '+971-50-8899001',
      jobTitle: 'Terminal Dispatch Officer',
      comment: 'Jebel Ali container gate-out and cold storage devanning coordinator',
      role: UserRole.LOGISTICS,
      permissions: [
        Permission.VIEW_SHIPMENTS,
        Permission.DOWNLOAD_DOCUMENTS,
      ],
      isFirstLogin: false,
      twoFactorEnabled: false,
      companyId: luluDubai.id,
    },
  });

  // User with mandatory first-time password reset
  await prisma.user.create({
    data: {
      id: 'usr-onboarding-dxb',
      email: 'onboarding.buyer@lulumea.com',
      passwordHash: DEFAULT_PASSWORD_HASH,
      firstName: 'Zayd',
      lastName: 'Ibrahim',
      phone: '+971-56-1122334',
      jobTitle: 'Junior Procurement Associate',
      comment: 'New hire undergoing orientation; requires mandatory credential setup',
      role: UserRole.BUYER,
      permissions: [Permission.VIEW_CATALOG],
      isFirstLogin: true, // Forces redirect to /settings/change-password
      twoFactorEnabled: false,
      companyId: luluDubai.id,
    },
  });

  // 6. Action Log entries (Audit Trail)
  await prisma.actionLog.createMany({
    data: [
      {
        companyId: luluDubai.id,
        authorId: adminUser.id,
        action: 'USER_CREATED',
        comment: 'Added Hamdan Al-Falasi (buyer.dxb@lulumea.com) with Buyer permissions',
        createdAt: new Date('2026-10-01T09:15:00Z'),
      },
      {
        companyId: luluDubai.id,
        authorId: adminUser.id,
        action: 'PERMISSIONS_UPDATED',
        comment: 'Granted DOWNLOAD_DOCUMENTS permission to QA Officer Karen White',
        createdAt: new Date('2026-10-05T11:30:00Z'),
      },
      {
        companyId: luluDubai.id,
        authorId: qaUser.id,
        action: 'SUBMIT_QUALITY_CLAIM',
        comment: 'Submitted quality claim CLM-2026-0038 (Temperature Abuse) with 1 product line',
        createdAt: new Date('2026-10-08T14:20:00Z'),
      },
      {
        companyId: luluDubai.id,
        authorId: buyerUser.id,
        action: 'NPD_REQUEST_SUBMITTED',
        comment: 'Submitted Customized Product Request NPD-2026-014 for Chilled Goat Curry Cubes',
        createdAt: new Date('2026-10-10T16:00:00Z'),
      },
      {
        companyId: luluDubai.id,
        authorId: adminUser.id,
        action: 'LICENSE_UPLOADED',
        comment: 'Uploaded renewed UAE MOIAT National Halal Certification (MOIAT-HALAL-2026-04)',
        createdAt: new Date('2026-10-12T10:45:00Z'),
      },
      {
        companyId: luluDubai.id,
        authorId: financeUser.id,
        action: 'SOA_REPORT_GENERATED',
        comment: 'Exported certified Statement of Account (SOA) for September 2026 reconciliation',
        createdAt: new Date('2026-10-14T08:30:00Z'),
      },
    ],
  });

  // 7. Product Categories & Subcategories
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

  const catAgro = await prisma.category.create({
    data: {
      name: 'Agro & Commodities',
      slug: 'agro-commodities',
      description: 'Basmati rice, coffee beans, spices, and premium agro exports',
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

  const subProcessed = await prisma.subcategory.create({
    data: {
      name: 'Processed & Convenience',
      slug: 'processed-convenience',
      categoryId: catProcessed.id,
    },
  });

  const subAgroGrains = await prisma.subcategory.create({
    data: {
      name: 'Grains & Commodities',
      slug: 'grains-commodities',
      categoryId: catAgro.id,
    },
  });

  // 8. Products Catalog (Comprehensive cuts portfolio)
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

  const pStriploin = await prisma.product.create({
    data: {
      sku: 'AL-BUF-STR-04',
      name: 'Frozen Buffalo Striploin (Sirloin)',
      slug: 'frozen-buffalo-striploin-sirloin',
      brand: 'Allana',
      categoryId: catBuffalo.id,
      subcategoryId: subHind.id,
      productState: 'Frozen (-18°C)',
      primaryPackaging: 'Vacuum Pack (IWP)',
      storageTemperature: '-18°C',
      shelfLifeMonths: 24,
      cartonNetWeightKg: 18.00,
      cartonDimensionsMm: '560 x 360 x 130',
      cartonsPerPallet: 64,
      palletsPerContainer: 20,
      totalContainerWeightMt: 23.04,
      imageUrl: 'products/images/AL-BUF-TOP-02-sample.webp',
      packagingImageUrl: 'products/packaging/AL-BUF-SIL-01-carton.webp',
      specSheetPdfUrl: 'products/specs/AL-BUF-TOP-02-specification.pdf',
      certifications: ['HALAL', 'ISO_22000', 'HACCP', 'SFDA'],
      description: 'Boneless striploin with uniform fat cover. Ideal for portion cutting into sirloin steaks and teppanyaki strips.',
      isUnderDevelopment: false,
    },
  });

  const pRump = await prisma.product.create({
    data: {
      sku: 'AL-BUF-RMP-06',
      name: 'Frozen Buffalo Rump Steak',
      slug: 'frozen-buffalo-rump-steak',
      brand: 'Premium Gold',
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
      description: 'Succulent hindquarter rump cut with delicate marbling. Suitable for steaks, skewers, and premium roasting joints.',
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

  const pForequarterComp = await prisma.product.create({
    data: {
      sku: 'AL-BUF-FQC-12',
      name: 'Frozen Buffalo Forequarter 4-Cut Compensated',
      slug: 'frozen-buffalo-forequarter-4-cut-compensated',
      brand: 'Omar',
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
      description: 'Standard export pack containing natural proportions of blade, chuck, brisket, and shank. Ideal for industrial catering and meat grinding.',
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

  const pMuttonLeg = await prisma.product.create({
    data: {
      sku: 'AL-MUT-LEG-16',
      name: 'Frozen Boneless Mutton Leg',
      slug: 'frozen-boneless-mutton-leg',
      brand: 'Allana',
      categoryId: catSheepGoat.id,
      subcategoryId: subPortion.id,
      productState: 'Frozen (-18°C)',
      primaryPackaging: 'Vacuum Pack (IWP)',
      storageTemperature: '-18°C',
      shelfLifeMonths: 24,
      cartonNetWeightKg: 18.00,
      cartonDimensionsMm: '560 x 360 x 130',
      cartonsPerPallet: 64,
      palletsPerContainer: 20,
      totalContainerWeightMt: 23.04,
      imageUrl: 'products/images/AL-VPCM-CUB-08-sample.webp',
      packagingImageUrl: 'products/packaging/AL-VPCM-CUB-08-tray.webp',
      specSheetPdfUrl: 'products/specs/AL-VPCM-CUB-08-specification.pdf',
      certifications: ['HALAL', 'HACCP', 'SFDA'],
      description: 'Prime boneless leg of mutton, trimmed and defatted. Suitable for whole roasting, carving into shanks, or making premium kebabs.',
      isUnderDevelopment: false,
    },
  });

  const pBurgerPatties = await prisma.product.create({
    data: {
      sku: 'AL-PRC-BUR-20',
      name: 'Allana Prime Buffalo Burger Patties (120g x 8)',
      slug: 'allana-prime-buffalo-burger-patties-120g',
      brand: 'Allana',
      categoryId: catProcessed.id,
      subcategoryId: subProcessed.id,
      productState: 'Frozen (-18°C)',
      primaryPackaging: 'Printed Retail Carton Box',
      storageTemperature: '-18°C',
      shelfLifeMonths: 18,
      cartonNetWeightKg: 11.52, // 12 boxes x 960g
      cartonDimensionsMm: '450 x 300 x 180',
      cartonsPerPallet: 72,
      palletsPerContainer: 20,
      totalContainerWeightMt: 16.59,
      imageUrl: 'products/images/AL-VPCM-CUB-08-sample.webp',
      packagingImageUrl: 'products/packaging/AL-VPCM-CUB-08-tray.webp',
      specSheetPdfUrl: 'products/specs/AL-VPCM-CUB-08-specification.pdf',
      certifications: ['HALAL', 'ISO_22000', 'HACCP', 'SFDA'],
      description: 'High-protein, lean buffalo burger patties seasoned with aromatic spices. Individually quick-frozen and interleaved for convenient cooking.',
      isUnderDevelopment: false,
    },
  });

  const pBasmatiRice = await prisma.product.create({
    data: {
      sku: 'AL-AGR-RIC-25',
      name: 'Allana Royal Platinum 1121 XXL Basmati Rice',
      slug: 'allana-royal-platinum-1121-basmati-rice',
      brand: 'Allana',
      categoryId: catAgro.id,
      subcategoryId: subAgroGrains.id,
      productState: 'Ambient',
      primaryPackaging: 'Embroidered Jute Handle Bag',
      storageTemperature: 'Ambient Dry (Cool & Ventilated)',
      shelfLifeMonths: 36,
      cartonNetWeightKg: 20.00, // 4 x 5kg bags
      cartonDimensionsMm: '500 x 350 x 200',
      cartonsPerPallet: 50,
      palletsPerContainer: 22,
      totalContainerWeightMt: 22.00,
      imageUrl: 'products/images/AL-VPCM-CUB-08-sample.webp',
      packagingImageUrl: 'products/packaging/AL-VPCM-CUB-08-tray.webp',
      specSheetPdfUrl: 'products/specs/AL-VPCM-CUB-08-specification.pdf',
      certifications: ['ISO_22000', 'HACCP', 'FSSAI'],
      description: 'Extra-long grain aged aromatic Basmati rice. Average grain length 8.35mm with unmatched elongation ratio and pearlescent white texture.',
      isUnderDevelopment: false,
    },
  });

  // 9. Custom Product Requests (NPD)
  await prisma.customProductRequest.createMany({
    data: [
      {
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
      {
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
      {
        requestNumber: 'NPD-2026-018',
        companyId: luluDubai.id,
        createdById: buyerUser.id,
        categoryName: 'Frozen Buffalo Meat',
        targetCountry: 'United Arab Emirates',
        cutSpecification: 'Calibrated buffalo tenderloin fillet 1.8kg to 2.2kg per piece, skin-packed on gold cardboard base.',
        recipeNotes: 'Natural unmarinated, defatted chain-off tenderloin.',
        packagingFormat: 'Individual vacuum shrink pack, 8 pieces per carton.',
        individualPackagingWeight: '2.0 kg',
        freezingType: FreezingType.BLAST_FROZEN,
        estimatedFcaPricePerTon: 6800.00,
        targetVolumeMt: 25.00,
        targetPriceUsd: 6.80,
        isCalibrated: true,
        isMarinated: false,
        isBoneless: true,
        isSkinless: true,
        hasSpecification: true,
        additionalComments: 'For LuLu Gourmet butchery counters in Dubai Mall and Mall of the Emirates.',
        status: CustomProductStatus.IN_REVIEW,
        managerComments: 'Product specification received and under review with abattoir production team.',
      },
      {
        requestNumber: 'NPD-2026-021',
        companyId: luluDubai.id,
        createdById: buyerUser.id,
        categoryName: 'Processed RTE/RTC',
        targetCountry: 'United Arab Emirates',
        cutSpecification: 'IQF Diced Buffalo Chuck 20mm cubes in 1kg clear foodservice bags.',
        recipeNotes: 'Uniform 20x20mm cubes for commercial catering & biryani preparation.',
        packagingFormat: '10 x 1kg clear bags per master carton.',
        individualPackagingWeight: '1.0 kg',
        freezingType: FreezingType.IQF,
        estimatedFcaPricePerTon: 4400.00,
        targetVolumeMt: 50.00,
        targetPriceUsd: 4.40,
        isCalibrated: true,
        isMarinated: false,
        isBoneless: true,
        isSkinless: true,
        hasSpecification: true,
        additionalComments: 'Foodservice tender contract for hospital & industrial kitchens.',
        status: CustomProductStatus.ANALYSIS,
        managerComments: 'Evaluating freezer capacity at Sahibabad plant for IQF diced line.',
      },
      {
        requestNumber: 'NPD-2026-025',
        companyId: luluDubai.id,
        createdById: buyerUser.id,
        categoryName: 'Frozen Buffalo Meat',
        targetCountry: 'United Arab Emirates',
        cutSpecification: 'Organic grass-fed bone-in short ribs 500g retail cut.',
        packagingFormat: 'Vacuum pack 500g, 20 packs per case.',
        individualPackagingWeight: '500g',
        freezingType: FreezingType.BLOCK_FROZEN,
        estimatedFcaPricePerTon: 9500.00,
        targetVolumeMt: 10.00,
        targetPriceUsd: 9.50,
        isCalibrated: true,
        isMarinated: false,
        isBoneless: false,
        isSkinless: true,
        hasSpecification: false,
        status: CustomProductStatus.DECLINED,
        managerComments: 'Declined: Bone-in bovine products require additional protocol approval under GCC GSO standards; minimum viable order volume is 25 MT.',
      },
    ],
  });

  // 10. Shipments (Maritime consignments with reefer containers and documents)
  // Shipment 1: IN_TRANSIT (JNPT -> Jebel Ali)
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

  // Shipment 2: ARRIVED_PORT (JNPT -> Jeddah)
  const shipment2 = await prisma.shipment.create({
    data: {
      orderNumber: 'ORD-2026-88204',
      companyId: luluRiyadh.id,
      salesOrgId: soFrozen.id,
      shipToParty: 'LuLu Central Coldstore, Jeddah',
      destinationCountry: 'Saudi Arabia',
      totalQuantityMt: 28.00,
      totalAmountUsd: 135600.00,
      status: ShipmentStatus.ARRIVED_PORT,
      shippingLine: 'CMA CGM',
      vesselName: 'CMA CGM Jacques Saadé',
      voyageNumber: '2612S',
      portOfLoading: 'JNPT Nhava Sheva, India',
      portOfDestination: 'Jeddah Islamic Port, KSA',
      shippingDate: new Date('2026-10-02T10:00:00Z'),
      etd: new Date('2026-10-04T06:00:00Z'),
      eta: new Date('2026-10-18T12:00:00Z'),
    },
  });

  const c3 = await prisma.container.create({
    data: {
      shipmentId: shipment2.id,
      containerNumber: 'CMAU8192033',
      sealNumber: 'CGM-882014',
      reeferSetTemp: '-18.0°C',
    },
  });

  await prisma.shipmentItem.createMany({
    data: [
      {
        containerId: c3.id,
        productId: pSilverside.id,
        quantityMt: 16.00,
        amountUsd: 73600.00,
      },
      {
        containerId: c3.id,
        productId: pRump.id,
        quantityMt: 12.00,
        amountUsd: 62000.00,
      },
    ],
  });

  // Shipment 3: DELIVERED (JNPT -> Dubai)
  const shipment3 = await prisma.shipment.create({
    data: {
      orderNumber: 'ORD-2026-88175',
      companyId: luluDubai.id,
      salesOrgId: soFrozen.id,
      shipToParty: 'LuLu Central Logistics JAFZA, Dubai',
      destinationCountry: 'United Arab Emirates',
      totalQuantityMt: 52.00,
      totalAmountUsd: 246400.00,
      status: ShipmentStatus.DELIVERED,
      shippingLine: 'MSC',
      vesselName: 'MSC Gülsün',
      voyageNumber: '2601E',
      portOfLoading: 'JNPT Nhava Sheva, India',
      portOfDestination: 'Jebel Ali Port, UAE',
      shippingDate: new Date('2026-09-18T12:00:00Z'),
      etd: new Date('2026-09-20T08:00:00Z'),
      eta: new Date('2026-09-30T16:00:00Z'),
    },
  });

  const c4 = await prisma.container.create({
    data: {
      shipmentId: shipment3.id,
      containerNumber: 'MEDU8192044',
      sealNumber: 'MSC-99120',
      reeferSetTemp: '-18.0°C',
    },
  });

  await prisma.shipmentItem.createMany({
    data: [
      {
        containerId: c4.id,
        productId: pTopside.id,
        quantityMt: 26.00,
        amountUsd: 119600.00,
      },
      {
        containerId: c4.id,
        productId: pStriploin.id,
        quantityMt: 26.00,
        amountUsd: 126800.00,
      },
    ],
  });

  // Shipment 4: CUSTOMS_CLEARED (JNPT -> Dammam)
  const shipment4 = await prisma.shipment.create({
    data: {
      orderNumber: 'ORD-2026-88219',
      companyId: luluRiyadh.id,
      salesOrgId: soFrozen.id,
      shipToParty: 'LuLu Hypermarket Distribution, Dammam',
      destinationCountry: 'Saudi Arabia',
      totalQuantityMt: 24.00,
      totalAmountUsd: 110400.00,
      status: ShipmentStatus.CUSTOMS_CLEARED,
      shippingLine: 'Hapag-Lloyd',
      vesselName: 'Al Jmeliyah',
      voyageNumber: '2608W',
      portOfLoading: 'JNPT Nhava Sheva, India',
      portOfDestination: 'King Abdulaziz Port, Dammam',
      shippingDate: new Date('2026-09-28T08:00:00Z'),
      etd: new Date('2026-09-30T14:00:00Z'),
      eta: new Date('2026-10-12T20:00:00Z'),
    },
  });

  const c5 = await prisma.container.create({
    data: {
      shipmentId: shipment4.id,
      containerNumber: 'HLCU5510294',
      sealNumber: 'HL-77210',
      reeferSetTemp: '-18.0°C',
    },
  });

  await prisma.shipmentItem.create({
    data: {
      containerId: c5.id,
      productId: pSilverside.id,
      quantityMt: 24.00,
      amountUsd: 110400.00,
    },
  });

  // Shipment 5: LOADED (JNPT -> Dubai)
  const shipment5 = await prisma.shipment.create({
    data: {
      orderNumber: 'ORD-2026-88250',
      companyId: luluDubai.id,
      salesOrgId: soRetail.id,
      shipToParty: 'LuLu Central Coldstore JAFZA',
      destinationCountry: 'United Arab Emirates',
      totalQuantityMt: 22.32,
      totalAmountUsd: 178560.00,
      status: ShipmentStatus.LOADED,
      shippingLine: 'Maersk Line',
      vesselName: 'Madrid Maersk',
      voyageNumber: '2618E',
      portOfLoading: 'JNPT Nhava Sheva, India',
      portOfDestination: 'Jebel Ali Port, UAE',
      shippingDate: new Date('2026-10-16T16:00:00Z'),
      etd: new Date('2026-10-18T10:00:00Z'),
      eta: new Date('2026-10-28T14:00:00Z'),
    },
  });

  const c6 = await prisma.container.create({
    data: {
      shipmentId: shipment5.id,
      containerNumber: 'MSKU7712390',
      sealNumber: 'ML-99182',
      reeferSetTemp: '0.0°C', // Chilled
    },
  });

  await prisma.shipmentItem.createMany({
    data: [
      {
        containerId: c6.id,
        productId: pGoatCubes.id,
        quantityMt: 10.80,
        amountUsd: 90720.00,
      },
      {
        containerId: c6.id,
        productId: pBurgerPatties.id,
        quantityMt: 11.52,
        amountUsd: 87840.00,
      },
    ],
  });

  // Shipment Documents in Cloudflare R2
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
      {
        shipmentId: shipment2.id,
        documentType: 'BILL_OF_LADING',
        fileName: 'cma-cgm-bl-CMAU8192033.pdf',
        fileUrl: 'shipments/ORD-2026-88192/bill-of-lading-MAEU9482710.pdf',
        fileSizeBytes: 380400,
      },
      {
        shipmentId: shipment2.id,
        documentType: 'VET_CERT',
        fileName: 'vet-sanitary-cert-KSA-2602.pdf',
        fileUrl: 'shipments/ORD-2026-88192/health-vet-certificate-IN-2601.pdf',
        fileSizeBytes: 345000,
      },
      {
        shipmentId: shipment3.id,
        documentType: 'BILL_OF_LADING',
        fileName: 'msc-bill-of-lading-MEDU8192044.pdf',
        fileUrl: 'shipments/ORD-2026-88192/bill-of-lading-MAEU9482710.pdf',
        fileSizeBytes: 412000,
      },
    ],
  });

  // 11. Multi-Month, Multi-Country Sales Plan Quota Matrix
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
        targetTonnes: 60.00,
        targetUsd: 276000.00,
        lastMonthBalance: 10.00,
        shippedTonnes: 45.00,
        shippedUsd: 207000.00,
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
        targetTonnes: 50.00,
        targetUsd: 230000.00,
        lastMonthBalance: 5.00,
        shippedTonnes: 40.00,
        shippedUsd: 184000.00,
        pipelineTonnes: 15.00,
        pipelineUsd: 69000.00,
      },
      {
        companyId: luluDubai.id,
        salesOrgId: soFrozen.id,
        month: 10,
        year: 2026,
        country: 'United Arab Emirates',
        shipToParty: 'LuLu Central Logistics JAFZA',
        sku: 'AL-BUF-TEN-03',
        skuName: 'Frozen Buffalo Tenderloin (Fillet)',
        targetTonnes: 30.00,
        targetUsd: 186000.00,
        lastMonthBalance: 0.00,
        shippedTonnes: 24.00,
        shippedUsd: 148800.00,
        pipelineTonnes: 10.00,
        pipelineUsd: 62000.00,
      },
      {
        companyId: luluDubai.id,
        salesOrgId: soFrozen.id,
        month: 10,
        year: 2026,
        country: 'United Arab Emirates',
        shipToParty: 'LuLu Central Logistics JAFZA',
        sku: 'AL-BUF-SHN-05',
        skuName: 'Frozen Buffalo Shin Shank',
        targetTonnes: 40.00,
        targetUsd: 120000.00,
        lastMonthBalance: 8.00,
        shippedTonnes: 35.00,
        shippedUsd: 105000.00,
        pipelineTonnes: 12.00,
        pipelineUsd: 36000.00,
      },
      {
        companyId: luluDubai.id,
        salesOrgId: soRetail.id,
        month: 10,
        year: 2026,
        country: 'United Arab Emirates',
        shipToParty: 'LuLu Central Coldstore JAFZA',
        sku: 'AL-VPCM-CUB-08',
        skuName: 'Chilled Vacuum-Packed Goat Cubes (450g)',
        targetTonnes: 25.00,
        targetUsd: 210000.00,
        lastMonthBalance: 0.00,
        shippedTonnes: 20.00,
        shippedUsd: 168000.00,
        pipelineTonnes: 10.00,
        pipelineUsd: 84000.00,
      },
      {
        companyId: luluDubai.id,
        salesOrgId: soFrozen.id,
        month: 11,
        year: 2026,
        country: 'United Arab Emirates',
        shipToParty: 'LuLu Central Logistics JAFZA',
        sku: 'AL-BUF-SIL-01',
        skuName: 'Frozen Boneless Buffalo Silverside',
        targetTonnes: 70.00,
        targetUsd: 322000.00,
        lastMonthBalance: 5.00,
        shippedTonnes: 25.00,
        shippedUsd: 115000.00,
        pipelineTonnes: 45.00,
        pipelineUsd: 207000.00,
      },
      {
        companyId: luluDubai.id,
        salesOrgId: soFrozen.id,
        month: 11,
        year: 2026,
        country: 'United Arab Emirates',
        shipToParty: 'LuLu Central Logistics JAFZA',
        sku: 'AL-BUF-TOP-02',
        skuName: 'Frozen Boneless Buffalo Topside',
        targetTonnes: 60.00,
        targetUsd: 276000.00,
        lastMonthBalance: 0.00,
        shippedTonnes: 20.00,
        shippedUsd: 92000.00,
        pipelineTonnes: 40.00,
        pipelineUsd: 184000.00,
      },
    ],
  });

  // 12. Claims & Service Desk (Quality Claims & Info Requests)
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

  // Quality Claim 2: Clarification Required (Carton crush)
  const claim2 = await prisma.claim.create({
    data: {
      claimNumber: 'CLM-2026-0041',
      companyId: luluDubai.id,
      submittedById: qaUser.id,
      type: ClaimType.CLAIM,
      status: ClaimStatus.CLARIFICATION_REQUIRED,
      subject: 'Carton crush damage on 24 master cartons during port unloading',
      categoryOfRequest: 'Packaging / Crushing',
      supplierName: 'Allanasons Private Limited - Sahibabad Plant',
      shipmentId: shipment3.id,
      containerNumber: 'MEDU8192044',
      invoiceNumber: 'INV-2026-03980',
      deliveryDate: new Date('2026-09-30T00:00:00Z'),
      description: 'Stowage shift caused lower tier carton crushing. 24 cartons deformed with tear along the bottom glue line.',
      companyResponse: 'Please provide stamped tally sheets from the Jebel Ali port surveyor and container destuffing inspection photos.',
    },
  });

  await prisma.claimProductItem.create({
    data: {
      claimId: claim2.id,
      productId: pSilverside.id,
      productArticle: '8310S',
      productName: 'Frozen Boneless Buffalo Silverside',
      producerName: 'Allanasons Pvt Ltd - Sahibabad',
      country: 'United Arab Emirates',
      vehicleNumber: 'MEDU8192044',
      nonConformWeightKg: 480.0000,
      receivedQuantityKg: 24000.0000,
      lotNumber: 'S-260912-3',
      productionDate: new Date('2026-09-12T00:00:00Z'),
    },
  });

  // Quality Claim 3: Completed / Credit Note Issued
  const claim3 = await prisma.claim.create({
    data: {
      claimNumber: 'CLM-2026-0032',
      companyId: luluDubai.id,
      submittedById: qaUser.id,
      type: ClaimType.CLAIM,
      status: ClaimStatus.COMPLETED,
      subject: 'Weight shortage of 45 cartons against manifest in container MSKU3109284',
      categoryOfRequest: 'Shortage / Missing Cartons',
      supplierName: 'Allanasons Private Limited - Aligarh Processing Unit',
      shipmentId: shipment1.id,
      containerNumber: 'MSKU3109284',
      invoiceNumber: 'INV-2026-03810',
      deliveryDate: new Date('2026-09-15T00:00:00Z'),
      description: 'Physical count verified 45 cartons short of Shin Shank upon container destuffing. Port seal intact.',
      companyResponse: 'Claim fully accepted. Credit Note CN-2026-004 issued for USD $3,375.00 credited to active trade balance.',
      resolvedAt: new Date('2026-09-25T14:00:00Z'),
    },
  });

  await prisma.claimProductItem.create({
    data: {
      claimId: claim3.id,
      productId: pShinShank.id,
      productArticle: '8350M',
      productName: 'Frozen Buffalo Shin Shank',
      producerName: 'Allanasons Pvt Ltd - Aligarh',
      country: 'United Arab Emirates',
      vehicleNumber: 'MSKU3109284',
      nonConformWeightKg: 1125.0000,
      receivedQuantityKg: 12000.0000,
      lotNumber: 'A-260830-2',
      productionDate: new Date('2026-08-30T00:00:00Z'),
    },
  });

  // Info Request 1: Shelf life extension
  await prisma.claim.create({
    data: {
      claimNumber: 'REQ-2026-0012',
      companyId: luluDubai.id,
      submittedById: buyerUser.id,
      type: ClaimType.INFO_REQUEST,
      status: ClaimStatus.ACCEPTED,
      subject: 'Request for Shelf Life Extension Declaration for Buffalo Silverside',
      infoCategory: InfoRequestCategory.DOCS_DECLARATION_SHELF_LIFE,
      targetCountry: 'United Arab Emirates',
      supplierName: 'Allanasons Private Limited - Sahibabad Plant',
      requestedShelfLifeDate: new Date('2027-04-30T00:00:00Z'),
      shelfLifeExtensionVolumeKg: 5000.0000,
      reasonForShelfLifeExtension: 'Port congestion delayed customs clearance by 3 weeks; retailer requires manufacturer validation for 60-day shelf life extension.',
      additionalEmails: 'procurement@ae.lulumea.com',
      description: 'Please issue official manufacturer declaration confirming stability under continuous -18°C storage.',
      companyResponse: 'Official manufacturer certificate issued by QA Department and uploaded to document portal.',
      resolvedAt: new Date('2026-10-11T16:00:00Z'),
    },
  });

  // Info Request 2: SFDA Halal Slaughterhouse Registration
  await prisma.claim.create({
    data: {
      claimNumber: 'REQ-2026-0015',
      companyId: luluDubai.id,
      submittedById: buyerUser.id,
      type: ClaimType.INFO_REQUEST,
      status: ClaimStatus.REGISTERED,
      subject: 'SFDA Halal Slaughterhouse Registration Certificate Renewal Request for 2026',
      infoCategory: InfoRequestCategory.DOCS_CERTIFICATE,
      targetCountry: 'Saudi Arabia',
      supplierName: 'Allanasons Private Limited - Aligarh Processing Unit',
      description: 'Required by LuLu Saudi food import compliance division for annual supplier database validation.',
      companyResponse: 'Renewal application currently submitted with SFDA supervisory board. Expected clearance within 10 business days.',
    },
  });

  // 13. Regulatory Compliance Licenses (EXPIRING SOON TO TRIGGER DASHBOARD BANNER!)
  await prisma.complianceLicense.createMany({
    data: [
      {
        companyId: luluDubai.id,
        country: 'United Arab Emirates',
        licenseName: 'UAE MOIAT National Halal Certification',
        licenseNumber: 'MOIAT-HALAL-2026-04',
        issueDate: new Date('2025-11-01T00:00:00Z'),
        expiryDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000), // EXPIRING IN 18 DAYS! Triggers Alert Banner!
        documentUrl: 'licenses/LULU-DXB/MOIAT-HALAL-CERT-2026.pdf',
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
      {
        companyId: luluDubai.id,
        country: 'United Arab Emirates',
        licenseName: 'Abu Dhabi Agriculture & Food Safety Authority (ADAFSA) Import Permit',
        licenseNumber: 'ADAFSA-IMP-9812',
        issueDate: new Date('2025-03-15T00:00:00Z'),
        expiryDate: new Date('2027-03-15T00:00:00Z'),
        documentUrl: 'licenses/LULU-DXB/ADAFSA-IMPORT-PERMIT.pdf',
      },
      {
        companyId: luluRiyadh.id,
        country: 'Saudi Arabia',
        licenseName: 'Saudi SFDA Facility Meat Import Approval',
        licenseNumber: 'SFDA-IMP-2024-8841',
        issueDate: new Date('2024-11-15T00:00:00Z'),
        expiryDate: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000), // EXPIRING IN 24 DAYS!
        documentUrl: 'licenses/LULU-RUH/SFDA-MEAT-IMPORT-FACILITY-2026.pdf',
      },
      {
        companyId: luluRiyadh.id,
        country: 'Saudi Arabia',
        licenseName: 'SFDA Approved Foreign Abattoir Certificate - Unit 24 Aligarh',
        licenseNumber: 'SFDA-ABAT-009',
        issueDate: new Date('2025-01-01T00:00:00Z'),
        expiryDate: new Date('2027-01-01T00:00:00Z'),
        documentUrl: 'licenses/LULU-RUH/SFDA-ABATTOIR-APPROVAL-ALIGARH.pdf',
      },
    ],
  });

  // 14. News & Corporate Announcement Articles
  await prisma.newsArticle.createMany({
    data: [
      {
        title: 'Allana Expands Ultra-Low Temperature Cold Chain Fleet for GCC Trade',
        slug: 'allana-expands-cold-chain-fleet-gcc',
        summary: 'Commissioning 50 new smart reefer containers equipped with real-time IoT temperature and GPS telemetry to guarantee unbroken -18°C integrity across Arabian Gulf ports.',
        contentHtml: '<p>Allanasons Private Limited has inducted 50 state-of-the-art reefer containers equipped with Carrier Transicold PrimeLINE units and cellular IoT sensors to guarantee unbroken -18°C cold chain visibility across Mumbai-Jebel Ali-Dammam corridors.</p>',
        imageUrl: 'news/smart-reefer-fleet.webp',
        isSlider: true,
      },
      {
        title: 'New Value-Added Chilled Goat Cubes Launch in LuLu UAE Outlets',
        slug: 'chilled-goat-cubes-lulu-uae',
        summary: 'Retail skin-pack MAP trays launched across 40 hypermarket locations with 60-day shelf stability developed collaboratively through our Customized Product NPD pipeline.',
        contentHtml: '<p>Developed through our collaborative Customized Product NPD pipeline with LuLu Group, the fresh 450g chilled goat cubes have achieved record consumer pickup in Dubai and Abu Dhabi.</p>',
        imageUrl: 'news/goat-tray-retail.webp',
        isSlider: true,
      },
      {
        title: 'Global Meat Market Update: Q4 Buffalo Export Trends & Ocean Freight Forecast',
        slug: 'global-meat-market-update-q4-2026',
        summary: 'Analysis of cattle livestock cycles, port congestion at Nhava Sheva, and freight rate stabilization across Red Sea and Gulf sea routes.',
        contentHtml: '<p>Ocean freight rates on West Coast India to Arabian Gulf lanes stabilized at $1,250/FEU. Processing capacity across Allana UP and Punjab abattoirs remains at 100% capacity heading into festive demand.</p>',
        imageUrl: 'news/market-update-q4.webp',
        isSlider: false,
      },
      {
        title: 'Halal Assurance & SFDA Compliance Audit Completed Successfully',
        slug: 'halal-assurance-sfda-compliance-audit-2026',
        summary: 'Annual reassessment by Jamiat Ulama-i-Hind Halal Trust and SFDA supervisory delegation affirms highest global veterinary standards.',
        contentHtml: '<p>Allana export slaughterhouses in Aligarh and Sahibabad achieved 100% compliance score in the comprehensive veterinary hygiene, stunned-free halal slaughter protocol, and microbiological testing audit.</p>',
        imageUrl: 'news/halal-audit-certified.webp',
        isSlider: false,
      },
      {
        title: 'Incoterms 2020 Protocol Advisory for Cold Chain Reefer Consignments',
        slug: 'incoterms-2020-cold-chain-reefer-advisory',
        summary: 'Operational guidelines on CIF and FCA risk-transfer checkpoints, electronic Bill of Lading releases, and demurrage prevention.',
        contentHtml: '<p>Detailed breakdown of carrier liability transfer upon container touchdown at Jebel Ali and Dammam port terminals.</p>',
        imageUrl: 'news/incoterms-advisory.webp',
        isSlider: false,
      },
    ],
  });

  // 15. In-App Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: adminUser.id,
        title: 'Urgent License Renewal: UAE MOIAT Halal Certification',
        message: 'UAE MOIAT National Halal Certification expires in 18 days. Please submit renewal documents.',
        link: '/settings/licenses',
        isRead: false,
        createdAt: new Date('2026-10-18T10:30:00Z'),
      },
      {
        userId: adminUser.id,
        title: 'Shipment Arrival Notice (ETA Today): ORD-2026-88204',
        message: 'Vessel CMA CGM Jacques Saadé has docked at Jeddah Islamic Port. Demurrage clock starts in 48 hours.',
        link: '/shipments',
        isRead: false,
        createdAt: new Date('2026-10-18T08:00:00Z'),
      },
      {
        userId: adminUser.id,
        title: 'Custom Product Update: NPD-2026-014',
        message: 'Your request for 450g Goat Cubes moved to Analysis stage by R&D team.',
        link: '/customized-products',
        isRead: false,
        createdAt: new Date('2026-10-16T14:15:00Z'),
      },
      {
        userId: adminUser.id,
        title: 'Quality Claim Update: CLM-2026-0038',
        message: 'Allana QA engineering team uploaded Reefer temperature logger analysis report.',
        link: '/claims',
        isRead: false,
        createdAt: new Date('2026-10-15T11:00:00Z'),
      },
      {
        userId: adminUser.id,
        title: 'Credit Facility Notice: Q4 Limit Renewal Approved',
        message: 'Approved revolving trade limit of USD $3,500,000 active for Frozen Buffalo Meat Division.',
        link: '/dashboard',
        isRead: true,
        createdAt: new Date('2026-10-10T10:00:00Z'),
      },
      {
        userId: adminUser.id,
        title: 'Upcoming Shipment ETA Alert: ORD-2026-88192',
        message: 'Container vessel Maersk Mc-Kinney Moller is 6 days from Jebel Ali Port docking.',
        link: '/shipments',
        isRead: true,
        createdAt: new Date('2026-10-08T07:45:00Z'),
      },
      {
        userId: buyerUser.id,
        title: 'Shipment Arrival Notice (ETA Today): ORD-2026-88204',
        message: 'Vessel CMA CGM Jacques Saadé has docked at Jeddah Islamic Port. Demurrage clock starts in 48 hours.',
        link: '/shipments',
        isRead: false,
        createdAt: new Date('2026-10-18T08:00:00Z'),
      },
      {
        userId: qaUser.id,
        title: 'Quality Claim Update: CLM-2026-0038',
        message: 'Allana QA engineering team uploaded Reefer temperature logger analysis report.',
        link: '/claims',
        isRead: false,
        createdAt: new Date('2026-10-15T11:00:00Z'),
      },
      {
        userId: financeUser.id,
        title: 'Credit Facility Notice: Q4 Limit Renewal Approved',
        message: 'Approved revolving trade limit of USD $3,500,000 active for Frozen Buffalo Meat Division.',
        link: '/dashboard',
        isRead: true,
        createdAt: new Date('2026-10-10T10:00:00Z'),
      },
    ],
  });

  console.log('Database seeding successfully finished with complete enterprise mock datasets.');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
