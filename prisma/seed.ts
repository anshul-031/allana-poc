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
        companyId: luluRiyadh.id,
        salesOrgId: soRetail.id,
        creditLimit: 1800000.00,
        receivables: 650000.00,
        overdueReceivables: 45000.00,
        availableLimit: 1150000.00,
      },
      {
        companyId: luluRiyadh.id,
        salesOrgId: soAgro.id,
        creditLimit: 2000000.00,
        receivables: 780000.00,
        overdueReceivables: 0.00,
        availableLimit: 1220000.00,
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
      {
        companyId: luluHQ.id,
        salesOrgId: soRetail.id,
        creditLimit: 3000000.00,
        receivables: 1100000.00,
        overdueReceivables: 0.00,
        availableLimit: 1900000.00,
      },
      {
        companyId: luluHQ.id,
        salesOrgId: soFze.id,
        creditLimit: 4000000.00,
        receivables: 1450000.00,
        overdueReceivables: 0.00,
        availableLimit: 2550000.00,
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

  // Corporate HQ Users (LuLu Group International Holding HQ)
  const corpDirUser = await prisma.user.create({
    data: {
      id: 'usr-corp-dir',
      email: 'director.corp@lulumea.com',
      passwordHash: DEFAULT_PASSWORD_HASH,
      firstName: 'M. A.',
      lastName: 'Yusuff',
      phone: '+971-2-6421800',
      jobTitle: 'Group Chairman & Managing Director',
      comment: 'Group executive director overseeing global supply contracts and investments',
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
      companyId: luluHQ.id,
    },
  });

  const corpProcUser = await prisma.user.create({
    data: {
      id: 'usr-corp-proc',
      email: 'procurement.corp@lulumea.com',
      passwordHash: DEFAULT_PASSWORD_HASH,
      firstName: 'Salim',
      lastName: 'M.A.',
      phone: '+971-2-6421801',
      jobTitle: 'Group Director of Global Procurement',
      comment: 'Directs strategic meat, poultry, and commodity procurement across GCC',
      role: UserRole.BUYER,
      permissions: [
        Permission.VIEW_CATALOG,
        Permission.ORDER_CUSTOM_PRODUCT,
        Permission.VIEW_SHIPMENTS,
        Permission.DOWNLOAD_DOCUMENTS,
        Permission.VIEW_REPORTS,
      ],
      isFirstLogin: false,
      twoFactorEnabled: true,
      companyId: luluHQ.id,
    },
  });

  const corpFinUser = await prisma.user.create({
    data: {
      id: 'usr-corp-fin',
      email: 'finance.corp@lulumea.com',
      passwordHash: DEFAULT_PASSWORD_HASH,
      firstName: 'Nandakumar',
      lastName: 'V.',
      phone: '+971-2-6421802',
      jobTitle: 'Group Chief Financial Officer',
      comment: 'Consolidated treasury, foreign exchange, and credit exposure director',
      role: UserRole.FINANCE,
      permissions: [
        Permission.VIEW_FINANCIALS,
        Permission.VIEW_REPORTS,
        Permission.DOWNLOAD_DOCUMENTS,
      ],
      isFirstLogin: false,
      twoFactorEnabled: true,
      companyId: luluHQ.id,
    },
  });

  // Saudi Arabia Regional Subsidiary Management Users
  const buyerKsaUser = await prisma.user.create({
    data: {
      id: 'usr-buyer-ksa',
      email: 'buyer.ksa@lulumea.com',
      passwordHash: DEFAULT_PASSWORD_HASH,
      firstName: 'Fahad',
      lastName: 'Al-Otaibi',
      phone: '+966-55-1239876',
      jobTitle: 'Senior Meat Category Manager (KSA)',
      comment: 'Manages fresh and frozen buffalo procurement for 50+ Saudi hypermarkets',
      role: UserRole.BUYER,
      permissions: [
        Permission.VIEW_CATALOG,
        Permission.ORDER_CUSTOM_PRODUCT,
        Permission.VIEW_SHIPMENTS,
        Permission.DOWNLOAD_DOCUMENTS,
      ],
      isFirstLogin: false,
      twoFactorEnabled: true,
      companyId: luluRiyadh.id,
    },
  });

  const financeKsaUser = await prisma.user.create({
    data: {
      id: 'usr-finance-ksa',
      email: 'finance.ksa@lulumea.com',
      passwordHash: DEFAULT_PASSWORD_HASH,
      firstName: 'Mansour',
      lastName: 'Al-Ghamdi',
      phone: '+966-50-4455667',
      jobTitle: 'Head of Saudi Trade Finance',
      comment: 'SFDA import tax, Saudi customs VAT, and supplier settlements controller',
      role: UserRole.FINANCE,
      permissions: [
        Permission.VIEW_FINANCIALS,
        Permission.VIEW_REPORTS,
        Permission.DOWNLOAD_DOCUMENTS,
      ],
      isFirstLogin: false,
      twoFactorEnabled: true,
      companyId: luluRiyadh.id,
    },
  });

  const qaKsaUser = await prisma.user.create({
    data: {
      id: 'usr-qa-ksa',
      email: 'qa.ksa@lulumea.com',
      passwordHash: DEFAULT_PASSWORD_HASH,
      firstName: 'Dr. Abdullah',
      lastName: 'Al-Shehri',
      phone: '+966-53-7788990',
      jobTitle: 'SFDA Quarantine & Food Safety Specialist',
      comment: 'Port health inspection clearance and microbiological sampling supervisor',
      role: UserRole.QA,
      permissions: [
        Permission.VIEW_CATALOG,
        Permission.SUBMIT_CLAIMS,
        Permission.DOWNLOAD_DOCUMENTS,
      ],
      isFirstLogin: false,
      twoFactorEnabled: true,
      companyId: luluRiyadh.id,
    },
  });

  // 6. Action Log entries (Multi-Company Audit Trail)
  await prisma.actionLog.createMany({
    data: [
      // LuLu Hypermarket LLC (Dubai Branch)
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
      // LuLu Saudi Hypermarkets Co. (KSA) Audit Logs
      {
        companyId: luluRiyadh.id,
        authorId: adminUser.id,
        action: 'USER_CREATED',
        comment: 'Added Fahad Al-Otaibi (buyer.ksa@lulumea.com) with Regional Buyer permissions',
        createdAt: new Date('2026-10-02T10:00:00Z'),
      },
      {
        companyId: luluRiyadh.id,
        authorId: adminUser.id,
        action: 'PERMISSIONS_UPDATED',
        comment: 'Granted SUBMIT_CLAIMS privilege to SFDA Quarantine Specialist Dr. Abdullah Al-Shehri',
        createdAt: new Date('2026-10-04T12:30:00Z'),
      },
      {
        companyId: luluRiyadh.id,
        authorId: qaKsaUser.id,
        action: 'SUBMIT_QUALITY_CLAIM',
        comment: 'Filed temperature abuse claim CLM-2026-0044 for Jeddah Islamic Port container CMAU8192033',
        createdAt: new Date('2026-10-07T14:45:00Z'),
      },
      {
        companyId: luluRiyadh.id,
        authorId: adminUser.id,
        action: 'LICENSE_UPLOADED',
        comment: 'Uploaded renewed SFDA Meat Import Facility Approval (SFDA-IMP-2024-8841)',
        createdAt: new Date('2026-10-11T11:20:00Z'),
      },
      {
        companyId: luluRiyadh.id,
        authorId: financeKsaUser.id,
        action: 'SOA_REPORT_GENERATED',
        comment: 'Generated Saudi SAR-USD customs duty reconciliation and SOA for September consignments',
        createdAt: new Date('2026-10-14T09:10:00Z'),
      },
      // LuLu Group International (Holding HQ) Audit Logs
      {
        companyId: luluHQ.id,
        authorId: corpDirUser.id,
        action: 'USER_CREATED',
        comment: 'Added Salim M.A. (procurement.corp@lulumea.com) as Group Director of Global Procurement',
        createdAt: new Date('2026-09-28T09:00:00Z'),
      },
      {
        companyId: luluHQ.id,
        authorId: corpDirUser.id,
        action: 'PERMISSIONS_UPDATED',
        comment: 'Delegated group-wide multi-entity auditing & financial oversight to CFO Nandakumar V.',
        createdAt: new Date('2026-10-01T14:00:00Z'),
      },
      {
        companyId: luluHQ.id,
        authorId: corpProcUser.id,
        action: 'SUBMIT_INFO_REQUEST',
        comment: 'Submitted Annual Group Vendor ESG & Traceability Audit Questionnaire (REQ-2026-0020)',
        createdAt: new Date('2026-10-05T16:30:00Z'),
      },
      {
        companyId: luluHQ.id,
        authorId: corpDirUser.id,
        action: 'LICENSE_UPLOADED',
        comment: 'Uploaded UAE Ministry of Economy Corporate Commercial Registration (MOE-CORP-2024-88)',
        createdAt: new Date('2026-10-10T10:15:00Z'),
      },
      {
        companyId: luluHQ.id,
        authorId: corpFinUser.id,
        action: 'SOA_REPORT_GENERATED',
        comment: 'Consolidated GCC group trade finance receivables exposure report across UAE & KSA',
        createdAt: new Date('2026-10-15T08:45:00Z'),
      },
    ],
  });

  // 7. Product Categories & Subcategories
  const catBuffalo = await prisma.category.create({
    data: {
      name: 'Frozen Buffalo Meat Products',
      slug: 'frozen-buffalo',
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
      name: 'Further Processing Products',
      slug: 'further-processing',
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

  const catNewProducts = await prisma.category.create({
    data: {
      name: 'New Products',
      slug: 'new-products',
      description: 'Newly developed and launched innovations from Allana culinary labs',
    },
  });

  const catCustomizedProducts = await prisma.category.create({
    data: {
      name: 'Customized Products',
      slug: 'customized-products',
      description: 'Bespoke cuts, private label formulations, and custom client packagings',
    },
  });

  const subHind = await prisma.subcategory.create({
    data: {
      name: 'Hindquarter Cuts',
      slug: 'hindquarter',
      categoryId: catBuffalo.id,
    },
  });

  const subFore = await prisma.subcategory.create({
    data: {
      name: 'Forequarter Cuts',
      slug: 'forequarter',
      categoryId: catBuffalo.id,
    },
  });

  const subTenderloin = await prisma.subcategory.create({
    data: {
      name: 'Tenderloin & Fillet',
      slug: 'tenderloin',
      categoryId: catBuffalo.id,
    },
  });

  const subOffal = await prisma.subcategory.create({
    data: {
      name: 'Offal & Edible Byproducts',
      slug: 'offal',
      categoryId: catBuffalo.id,
    },
  });

  const subTrimmings = await prisma.subcategory.create({
    data: {
      name: 'Special Trimmings',
      slug: 'special-trimmings',
      categoryId: catBuffalo.id,
    },
  });

  const subMince = await prisma.subcategory.create({
    data: {
      name: 'Mince & Burger Raw Material',
      slug: 'mince',
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

  const subNewDeli = await prisma.subcategory.create({
    data: {
      name: 'Deli & Charcuterie',
      slug: 'deli-charcuterie',
      categoryId: catNewProducts.id,
    },
  });

  const subCustBespoke = await prisma.subcategory.create({
    data: {
      name: 'Bespoke Formulations',
      slug: 'bespoke-formulations',
      categoryId: catCustomizedProducts.id,
    },
  });

  // 8. Products Catalog (Comprehensive enterprise cuts portfolio across all brands, states, and packagings)
  const pSilverside = await prisma.product.create({
    data: {
      sku: 'AL-BUF-SIL-01',
      name: 'Frozen Boneless Buffalo Silverside',
      slug: 'frozen-boneless-buffalo-silverside',
      brand: 'Allana',
      categoryId: catBuffalo.id,
      subcategoryId: subHind.id,
      productState: 'Frozen (-18°C) BF',
      freezingType: 'BF',
      primaryPackaging: 'Vacuum Block (IWP)',
      storageTemperature: '-18°C',
      shelfLifeMonths: 24,
      cartonNetWeightKg: 20.00,
      cutSize: '5-7 kg per primal cut',
      packagesPerCarton: 4,
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
      productState: 'Frozen (-18°C) BF',
      freezingType: 'BF',
      primaryPackaging: 'Vacuum Block (IWP)',
      storageTemperature: '-18°C',
      shelfLifeMonths: 24,
      cartonNetWeightKg: 20.00,
      cutSize: '6-8 kg per primal cut',
      packagesPerCarton: 3,
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
      subcategoryId: subTenderloin.id,
      productState: 'Frozen (-18°C) BF',
      freezingType: 'BF',
      primaryPackaging: 'Vacuum Block (IWP)',
      storageTemperature: '-18°C',
      shelfLifeMonths: 24,
      cartonNetWeightKg: 18.00,
      cutSize: '1.2 - 2.0 kg whole fillet',
      packagesPerCarton: 10,
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
      productState: 'Frozen (-18°C) BF',
      freezingType: 'BF',
      primaryPackaging: 'Vacuum Block (IWP)',
      storageTemperature: '-18°C',
      shelfLifeMonths: 24,
      cartonNetWeightKg: 18.00,
      cutSize: '2.5 - 3.5 kg',
      packagesPerCarton: 6,
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
      productState: 'Frozen (-18°C) BF',
      freezingType: 'BF',
      primaryPackaging: 'Vacuum Block (IWP)',
      storageTemperature: '-18°C',
      shelfLifeMonths: 24,
      cartonNetWeightKg: 20.00,
      cutSize: '3 - 5 kg',
      packagesPerCarton: 5,
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
      productState: 'Frozen (-18°C) BF',
      freezingType: 'BF',
      primaryPackaging: 'Polywrapped Bulk Pack (Carton)',
      storageTemperature: '-18°C',
      shelfLifeMonths: 24,
      cartonNetWeightKg: 25.00,
      cutSize: 'Bone-out whole shank',
      packagesPerCarton: 1,
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
      brand: 'OMAR',
      categoryId: catBuffalo.id,
      subcategoryId: subFore.id,
      productState: 'Frozen (-18°C) BF',
      freezingType: 'BF',
      primaryPackaging: 'Polywrapped Bulk Pack (Carton)',
      storageTemperature: '-18°C',
      shelfLifeMonths: 24,
      cartonNetWeightKg: 25.00,
      cutSize: 'Natural proportions',
      packagesPerCarton: 1,
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

  const pTenderloinGold = await prisma.product.create({
    data: {
      sku: 'PG-BUF-TEN-07',
      name: 'Premium Gold Buffalo Tenderloin Fillet',
      slug: 'premium-gold-buffalo-tenderloin-fillet',
      brand: 'Premium Gold',
      categoryId: catBuffalo.id,
      subcategoryId: subTenderloin.id,
      productState: 'IPBF (Individually Polywrapped Block Frozen)',
      freezingType: 'IPBF',
      primaryPackaging: 'Packaged Stretch Film (IWP)',
      storageTemperature: '-18°C',
      shelfLifeMonths: 24,
      cartonNetWeightKg: 18.00,
      cutSize: '1.4 - 2.2 kg center cut',
      packagesPerCarton: 10,
      cartonDimensionsMm: '560 x 360 x 130',
      cartonsPerPallet: 64,
      palletsPerContainer: 20,
      totalContainerWeightMt: 23.04,
      imageUrl: 'products/images/AL-BUF-TEN-03-sample.webp',
      packagingImageUrl: 'products/packaging/AL-BUF-TEN-03-carton.webp',
      specSheetPdfUrl: 'products/specs/AL-BUF-TEN-03-specification.pdf',
      certifications: ['HALAL', 'ISO_22000', 'HACCP', 'SFDA'],
      description: 'Hand-selected center-cut buffalo tenderloins. Defatted 99VL and wrapped in premium stretch film.',
      isUnderDevelopment: false,
    },
  });

  const pChuckTender = await prisma.product.create({
    data: {
      sku: 'AL-BUF-CHK-08',
      name: 'Frozen Boneless Buffalo Chuck Tender',
      slug: 'frozen-boneless-buffalo-chuck-tender',
      brand: 'Allana',
      categoryId: catBuffalo.id,
      subcategoryId: subFore.id,
      productState: 'Frozen (-18°C) BF',
      freezingType: 'BF',
      primaryPackaging: 'Vacuum Block (IWP)',
      storageTemperature: '-18°C',
      shelfLifeMonths: 24,
      cartonNetWeightKg: 20.00,
      cutSize: '1.5 - 2.5 kg',
      packagesPerCarton: 8,
      cartonDimensionsMm: '580 x 380 x 140',
      cartonsPerPallet: 60,
      palletsPerContainer: 20,
      totalContainerWeightMt: 24.00,
      imageUrl: 'products/images/AL-BUF-SHN-05-sample.webp',
      packagingImageUrl: 'products/packaging/AL-BUF-SHN-05-carton.webp',
      specSheetPdfUrl: 'products/specs/AL-BUF-SHN-05-specification.pdf',
      certifications: ['HALAL', 'ISO_22000', 'HACCP', 'SFDA'],
      description: 'Conical muscle situated adjacent to the blade bone. Tender with fine grain, ideal for stewing, cubing, or roasting.',
      isUnderDevelopment: false,
    },
  });

  const pBlade = await prisma.product.create({
    data: {
      sku: 'AT-BUF-BLD-09',
      name: 'Al-Tamam Frozen Buffalo Blade / Clod',
      slug: 'al-tamam-frozen-buffalo-blade-clod',
      brand: 'Al-Tamam',
      categoryId: catBuffalo.id,
      subcategoryId: subFore.id,
      productState: 'BQF (Block Quick Frozen)',
      freezingType: 'BQF',
      primaryPackaging: 'Carton Box with Poly Liner',
      storageTemperature: '-18°C',
      shelfLifeMonths: 24,
      cartonNetWeightKg: 25.00,
      cutSize: '3 - 6 kg',
      packagesPerCarton: 4,
      cartonDimensionsMm: '600 x 400 x 150',
      cartonsPerPallet: 48,
      palletsPerContainer: 20,
      totalContainerWeightMt: 24.00,
      imageUrl: 'products/images/AL-BUF-SHN-05-sample.webp',
      packagingImageUrl: 'products/packaging/AL-BUF-SHN-05-carton.webp',
      specSheetPdfUrl: 'products/specs/AL-BUF-SHN-05-specification.pdf',
      certifications: ['HALAL', 'ISO_22000', 'HACCP'],
      description: 'Forequarter shoulder cut trimmed of excess surface fat and cartilage. Prime raw material for institutional catering.',
      isUnderDevelopment: false,
    },
  });

  const pLiver = await prisma.product.create({
    data: {
      sku: 'AL-BUF-LIV-10',
      name: 'Frozen Buffalo Liver (Export Grade)',
      slug: 'frozen-buffalo-liver-export-grade',
      brand: 'Allana',
      categoryId: catBuffalo.id,
      subcategoryId: subOffal.id,
      productState: 'BQF (Block Quick Frozen)',
      freezingType: 'BQF',
      primaryPackaging: 'Polybag in Master Carton',
      storageTemperature: '-18°C',
      shelfLifeMonths: 24,
      cartonNetWeightKg: 20.00,
      cutSize: 'Whole liver lobes',
      packagesPerCarton: 2,
      cartonDimensionsMm: '580 x 380 x 130',
      cartonsPerPallet: 60,
      palletsPerContainer: 20,
      totalContainerWeightMt: 24.00,
      imageUrl: 'products/images/AL-BUF-SIL-01-sample.webp',
      packagingImageUrl: 'products/packaging/AL-BUF-SIL-01-carton.webp',
      specSheetPdfUrl: 'products/specs/AL-BUF-SIL-01-specification.pdf',
      certifications: ['HALAL', 'ISO_22000', 'HACCP', 'SFDA'],
      description: 'Fresh sound buffalo liver, blood vessel tubes trimmed. Block quick frozen into polybag inner packs within corrugated export master carton.',
      isUnderDevelopment: false,
    },
  });

  const pHeart = await prisma.product.create({
    data: {
      sku: 'OM-BUF-HRT-11',
      name: 'OMAR Frozen Buffalo Heart & Kidney Mix',
      slug: 'omar-frozen-buffalo-heart-kidney-mix',
      brand: 'OMAR',
      categoryId: catBuffalo.id,
      subcategoryId: subOffal.id,
      productState: 'IPBF (Individually Polywrapped Block Frozen)',
      freezingType: 'IPBF',
      primaryPackaging: 'Polybag (2 x 10kg)',
      storageTemperature: '-18°C',
      shelfLifeMonths: 24,
      cartonNetWeightKg: 20.00,
      cutSize: 'Whole organ portions',
      packagesPerCarton: 2,
      cartonDimensionsMm: '580 x 380 x 130',
      cartonsPerPallet: 60,
      palletsPerContainer: 20,
      totalContainerWeightMt: 24.00,
      imageUrl: 'products/images/AL-BUF-SHN-05-sample.webp',
      packagingImageUrl: 'products/packaging/AL-BUF-SHN-05-carton.webp',
      specSheetPdfUrl: 'products/specs/AL-BUF-SHN-05-specification.pdf',
      certifications: ['HALAL', 'ISO_22000', 'HACCP'],
      description: 'Cleaned, defatted export grade hearts and kidneys. Individually polywrapped blocks inside corrugated shipper cartons.',
      isUnderDevelopment: false,
    },
  });

  const pTongue = await prisma.product.create({
    data: {
      sku: 'AT-BUF-TNG-12',
      name: 'Al-Tamam Swiss-Cut Buffalo Tongue (Short Cut)',
      slug: 'al-tamam-swiss-cut-buffalo-tongue',
      brand: 'Al-Tamam',
      categoryId: catBuffalo.id,
      subcategoryId: subOffal.id,
      productState: 'Frozen (-18°C) BF',
      freezingType: 'BF',
      primaryPackaging: 'Vacuum Block (IWP)',
      storageTemperature: '-18°C',
      shelfLifeMonths: 24,
      cartonNetWeightKg: 15.00,
      cutSize: '0.8 - 1.4 kg short cut',
      packagesPerCarton: 12,
      cartonDimensionsMm: '520 x 340 x 120',
      cartonsPerPallet: 72,
      palletsPerContainer: 20,
      totalContainerWeightMt: 21.60,
      imageUrl: 'products/images/AL-BUF-SHN-05-sample.webp',
      packagingImageUrl: 'products/packaging/AL-BUF-SHN-05-carton.webp',
      specSheetPdfUrl: 'products/specs/AL-BUF-SHN-05-specification.pdf',
      certifications: ['HALAL', 'ISO_22000', 'HACCP', 'SFDA'],
      description: 'Swiss-cut short-cut buffalo tongue with hyoid bones and salivary glands completely removed. Individually vacuum packed.',
      isUnderDevelopment: false,
    },
  });

  const pTrimmings = await prisma.product.create({
    data: {
      sku: 'AL-BUF-TRM-13',
      name: 'Frozen Buffalo Special Trimmings 85/15 CL',
      slug: 'frozen-buffalo-special-trimmings-85cl',
      brand: 'Allana',
      categoryId: catBuffalo.id,
      subcategoryId: subTrimmings.id,
      productState: 'Frozen (-18°C) BF',
      freezingType: 'BF',
      primaryPackaging: 'Polybag in Carton Box',
      storageTemperature: '-18°C',
      shelfLifeMonths: 24,
      cartonNetWeightKg: 25.00,
      cutSize: 'Manufacturing trimmings',
      packagesPerCarton: 1,
      cartonDimensionsMm: '600 x 400 x 150',
      cartonsPerPallet: 48,
      palletsPerContainer: 20,
      totalContainerWeightMt: 24.00,
      imageUrl: 'products/images/AL-BUF-SIL-01-sample.webp',
      packagingImageUrl: 'products/packaging/AL-BUF-SIL-01-carton.webp',
      specSheetPdfUrl: 'products/specs/AL-BUF-SIL-01-specification.pdf',
      certifications: ['HALAL', 'ISO_22000', 'HACCP'],
      description: 'Lean manufacturing trimmings calibrated to 85% chemical lean (CL). Perfect raw material for sausage production, burgers, and canned corned beef.',
      isUnderDevelopment: false,
    },
  });

  const pFlankTrimmings = await prisma.product.create({
    data: {
      sku: 'PG-BUF-FLK-14',
      name: 'Premium Gold Buffalo Flank Trimmings 90CL',
      slug: 'premium-gold-buffalo-flank-trimmings-90cl',
      brand: 'Premium Gold',
      categoryId: catBuffalo.id,
      subcategoryId: subTrimmings.id,
      productState: 'BQF (Block Quick Frozen)',
      freezingType: 'BQF',
      primaryPackaging: 'Vacuum Block (IWP)',
      storageTemperature: '-18°C',
      shelfLifeMonths: 24,
      cartonNetWeightKg: 20.00,
      cutSize: '90CL premium flank trimmings',
      packagesPerCarton: 4,
      cartonDimensionsMm: '580 x 380 x 140',
      cartonsPerPallet: 60,
      palletsPerContainer: 20,
      totalContainerWeightMt: 24.00,
      imageUrl: 'products/images/AL-BUF-TOP-02-sample.webp',
      packagingImageUrl: 'products/packaging/AL-BUF-SIL-01-carton.webp',
      specSheetPdfUrl: 'products/specs/AL-BUF-TOP-02-specification.pdf',
      certifications: ['HALAL', 'ISO_22000', 'HACCP', 'SFDA'],
      description: 'High-lean 90CL thick flank trimmings. Individually vacuum packed blocks with superior protein binding capacity.',
      isUnderDevelopment: false,
    },
  });

  const pMince = await prisma.product.create({
    data: {
      sku: 'OM-BUF-MNC-15',
      name: 'OMAR Premium Coarse Buffalo Mince (80/20 VL)',
      slug: 'omar-premium-coarse-buffalo-mince',
      brand: 'OMAR',
      categoryId: catBuffalo.id,
      subcategoryId: subMince.id,
      productState: 'BQF (Block Quick Frozen)',
      freezingType: 'BQF',
      primaryPackaging: 'Carton Box with Poly Liner',
      storageTemperature: '-18°C',
      shelfLifeMonths: 24,
      cartonNetWeightKg: 20.00,
      cutSize: '8mm coarse grind',
      packagesPerCarton: 1,
      cartonDimensionsMm: '580 x 380 x 140',
      cartonsPerPallet: 60,
      palletsPerContainer: 20,
      totalContainerWeightMt: 24.00,
      imageUrl: 'products/images/AL-BUF-SHN-05-sample.webp',
      packagingImageUrl: 'products/packaging/AL-BUF-SHN-05-carton.webp',
      specSheetPdfUrl: 'products/specs/AL-BUF-SHN-05-specification.pdf',
      certifications: ['HALAL', 'ISO_22000', 'HACCP'],
      description: 'Coarse minced boneless buffalo meat ground to 8mm plate size. 80% visual lean consistency ideal for commercial patty forming.',
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
      freezingType: 'CHILLED',
      primaryPackaging: 'Thermoformed MAP Tray',
      storageTemperature: '0°C to 2°C',
      shelfLifeMonths: 2, // 60 days
      cartonNetWeightKg: 10.80, // 24 trays x 450g
      cutSize: '25mm cubes',
      packagesPerCarton: 24,
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

  const pLambChops = await prisma.product.create({
    data: {
      sku: 'PG-MUT-CHP-16',
      name: 'Premium Gold Chilled Indian Lamb Chops',
      slug: 'premium-gold-chilled-indian-lamb-chops',
      brand: 'Premium Gold',
      categoryId: catSheepGoat.id,
      subcategoryId: subPortion.id,
      productState: 'Chilled (0°C to 2°C)',
      freezingType: 'CHILLED',
      primaryPackaging: 'Thermoformed MAP Tray',
      storageTemperature: '0°C to 2°C',
      shelfLifeMonths: 2,
      cartonNetWeightKg: 10.00,
      cutSize: 'French-trimmed 8-rib rack cutlets',
      packagesPerCarton: 20,
      cartonDimensionsMm: '480 x 320 x 160',
      cartonsPerPallet: 80,
      palletsPerContainer: 20,
      totalContainerWeightMt: 16.00,
      imageUrl: 'products/images/AL-VPCM-CUB-08-sample.webp',
      packagingImageUrl: 'products/packaging/AL-VPCM-CUB-08-tray.webp',
      specSheetPdfUrl: 'products/specs/AL-VPCM-CUB-08-specification.pdf',
      certifications: ['HALAL', 'ISO_22000', 'HACCP', 'SFDA'],
      description: 'Fresh French-trimmed lamb cutlets and chops in retail-ready modified atmosphere packaging.',
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
      productState: 'Frozen (-18°C) BF',
      freezingType: 'BF',
      primaryPackaging: 'Vacuum Block (IWP)',
      storageTemperature: '-18°C',
      shelfLifeMonths: 24,
      cartonNetWeightKg: 18.00,
      cutSize: '1.8 - 2.8 kg whole leg',
      packagesPerCarton: 8,
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
      productState: 'IQF (Individually Quick Frozen)',
      freezingType: 'IQF',
      primaryPackaging: 'Printed Retail Carton Box',
      storageTemperature: '-18°C',
      shelfLifeMonths: 18,
      cartonNetWeightKg: 11.52, // 12 boxes x 960g
      cutSize: '120g patty diameter 100mm',
      packagesPerCarton: 12,
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

  const pKebab = await prisma.product.create({
    data: {
      sku: 'AL-PRC-KBB-17',
      name: 'Allana Shami Buffalo Seekh Kebabs (IQF)',
      slug: 'allana-shami-buffalo-seekh-kebabs-iqf',
      brand: 'Allana',
      categoryId: catProcessed.id,
      subcategoryId: subProcessed.id,
      productState: 'IQF (Individually Quick Frozen)',
      freezingType: 'IQF',
      primaryPackaging: 'Printed Retail Carton Box',
      storageTemperature: '-18°C',
      shelfLifeMonths: 18,
      cartonNetWeightKg: 12.00,
      cutSize: '65g skewers x 12 per retail box',
      packagesPerCarton: 15,
      cartonDimensionsMm: '460 x 310 x 170',
      cartonsPerPallet: 72,
      palletsPerContainer: 20,
      totalContainerWeightMt: 17.28,
      imageUrl: 'products/images/AL-VPCM-CUB-08-sample.webp',
      packagingImageUrl: 'products/packaging/AL-VPCM-CUB-08-tray.webp',
      specSheetPdfUrl: 'products/specs/AL-VPCM-CUB-08-specification.pdf',
      certifications: ['HALAL', 'ISO_22000', 'HACCP', 'SFDA'],
      description: 'Authentic spiced buffalo seekh kebabs individually quick frozen and packed in retail consumer boxes.',
      isUnderDevelopment: false,
    },
  });

  const pMeatballs = await prisma.product.create({
    data: {
      sku: 'AT-PRC-MTB-18',
      name: 'Al-Tamam Homestyle Buffalo Meatballs (IQF)',
      slug: 'al-tamam-homestyle-buffalo-meatballs-iqf',
      brand: 'Al-Tamam',
      categoryId: catProcessed.id,
      subcategoryId: subProcessed.id,
      productState: 'IQF (Individually Quick Frozen)',
      freezingType: 'IQF',
      primaryPackaging: 'Carton Box with Polybags',
      storageTemperature: '-18°C',
      shelfLifeMonths: 18,
      cartonNetWeightKg: 12.00,
      cutSize: '25g meatballs',
      packagesPerCarton: 12,
      cartonDimensionsMm: '460 x 310 x 170',
      cartonsPerPallet: 72,
      palletsPerContainer: 20,
      totalContainerWeightMt: 17.28,
      imageUrl: 'products/images/AL-VPCM-CUB-08-sample.webp',
      packagingImageUrl: 'products/packaging/AL-VPCM-CUB-08-tray.webp',
      specSheetPdfUrl: 'products/specs/AL-VPCM-CUB-08-specification.pdf',
      certifications: ['HALAL', 'ISO_22000', 'HACCP'],
      description: 'Seasoned 25g buffalo meatballs individually quick-frozen for catering and quick-service restaurant kitchens.',
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
      freezingType: null,
      primaryPackaging: 'Embroidered Jute Handle Bag',
      storageTemperature: 'Ambient Dry (Cool & Ventilated)',
      shelfLifeMonths: 36,
      cartonNetWeightKg: 20.00, // 4 x 5kg bags
      cutSize: '8.35mm aged grain',
      packagesPerCarton: 4,
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

  const pNewPastrami = await prisma.product.create({
    data: {
      sku: 'AL-NEW-PAS-01',
      name: 'Allana Smoked Buffalo Pastrami',
      slug: 'allana-smoked-buffalo-pastrami',
      brand: 'Allana',
      categoryId: catNewProducts.id,
      subcategoryId: subNewDeli.id,
      productState: 'BF',
      freezingType: 'BF',
      primaryPackaging: 'Vacuum Block',
      storageTemperature: '-18°C',
      shelfLifeMonths: 18,
      cartonNetWeightKg: 15.00,
      cutSize: '1.5kg cooked smoked brisket loaf',
      packagesPerCarton: 10,
      cartonDimensionsMm: '520 x 340 x 140',
      cartonsPerPallet: 64,
      palletsPerContainer: 20,
      totalContainerWeightMt: 19.20,
      imageUrl: 'products/images/AL-NEW-PAS-01-sample.webp',
      packagingImageUrl: 'products/packaging/AL-NEW-PAS-01-carton.webp',
      specSheetPdfUrl: 'products/specs/AL-NEW-PAS-01-specification.pdf',
      certifications: ['HALAL', 'ISO_22000', 'HACCP', 'SFDA'],
      description: 'Cured, hardwood-smoked deli pastrami crafted from selected prime buffalo brisket. Ready to slice for gourmet sandwiches and charcuterie platters.',
      isUnderDevelopment: false,
    },
  });

  const pNewShortRibs = await prisma.product.create({
    data: {
      sku: 'TM-NEW-RIB-02',
      name: 'Al-Tamam Sous-Vide Buffalo Short Ribs',
      slug: 'al-tamam-sous-vide-buffalo-short-ribs',
      brand: 'Al-Tamam',
      categoryId: catNewProducts.id,
      subcategoryId: subNewDeli.id,
      productState: 'IQF',
      freezingType: 'IQF',
      primaryPackaging: 'Tray',
      storageTemperature: '-18°C',
      shelfLifeMonths: 18,
      cartonNetWeightKg: 12.00,
      cutSize: '350g single bone portion',
      packagesPerCarton: 12,
      cartonDimensionsMm: '480 x 320 x 160',
      cartonsPerPallet: 56,
      palletsPerContainer: 20,
      totalContainerWeightMt: 13.44,
      imageUrl: 'products/images/TM-NEW-RIB-02-sample.webp',
      packagingImageUrl: 'products/packaging/TM-NEW-RIB-02-carton.webp',
      specSheetPdfUrl: 'products/specs/TM-NEW-RIB-02-specification.pdf',
      certifications: ['HALAL', 'ISO_22000', 'HACCP', 'SFDA'],
      description: 'Slow-cooked 12-hour sous-vide seasoned bone-in short ribs. Deep, rich marbling with fall-off-the-bone tenderness, individually quick frozen.',
      isUnderDevelopment: false,
    },
  });

  const pNewSteaks = await prisma.product.create({
    data: {
      sku: 'PG-NEW-STR-03',
      name: 'Premium Gold Black Garlic Striploin Steaks',
      slug: 'premium-gold-black-garlic-striploin-steaks',
      brand: 'Premium Gold',
      categoryId: catNewProducts.id,
      subcategoryId: subNewDeli.id,
      productState: 'IPBF',
      freezingType: 'IPBF',
      primaryPackaging: 'Vacuum Block',
      storageTemperature: '-18°C',
      shelfLifeMonths: 24,
      cartonNetWeightKg: 16.00,
      cutSize: '250g centre cut portion',
      packagesPerCarton: 16,
      cartonDimensionsMm: '540 x 350 x 140',
      cartonsPerPallet: 60,
      palletsPerContainer: 20,
      totalContainerWeightMt: 19.20,
      imageUrl: 'products/images/PG-NEW-STR-03-sample.webp',
      packagingImageUrl: 'products/packaging/PG-NEW-STR-03-carton.webp',
      specSheetPdfUrl: 'products/specs/PG-NEW-STR-03-specification.pdf',
      certifications: ['HALAL', 'ISO_22000', 'HACCP', 'SFDA'],
      description: 'Aged buffalo striploin infused with fermented black garlic essence, portion-cut and individually poly-wrapped for luxury culinary dining.',
      isUnderDevelopment: false,
    },
  });

  const pCustBurger = await prisma.product.create({
    data: {
      sku: 'LL-CUST-PAT-01',
      name: 'LuLu Select Buffalo Burger Patty 150g',
      slug: 'lulu-select-buffalo-burger-patty',
      brand: 'Allana',
      categoryId: catCustomizedProducts.id,
      subcategoryId: subCustBespoke.id,
      productState: 'BQF',
      freezingType: 'BQF',
      primaryPackaging: 'Carton Box',
      storageTemperature: '-18°C',
      shelfLifeMonths: 12,
      cartonNetWeightKg: 15.00,
      cutSize: '150g homestyle smash patty',
      packagesPerCarton: 20,
      cartonDimensionsMm: '500 x 350 x 150',
      cartonsPerPallet: 50,
      palletsPerContainer: 20,
      totalContainerWeightMt: 15.00,
      imageUrl: 'products/images/LL-CUST-PAT-01-sample.webp',
      packagingImageUrl: 'products/packaging/LL-CUST-PAT-01-carton.webp',
      specSheetPdfUrl: 'products/specs/LL-CUST-PAT-01-specification.pdf',
      certifications: ['HALAL', 'ISO_22000', 'HACCP', 'SFDA'],
      description: 'Exclusive custom formulation for LuLu Hypermarkets. 85/15 lean-to-fat ratio seasoned buffalo patty engineered for fast grilling retention.',
      isUnderDevelopment: false,
    },
  });

  const pCustGoatCurry = await prisma.product.create({
    data: {
      sku: 'LL-CUST-GT-02',
      name: 'LuLu Private Reserve Goat Curry Cut 450g',
      slug: 'lulu-private-reserve-goat-curry-cut',
      brand: 'Allana',
      categoryId: catCustomizedProducts.id,
      subcategoryId: subCustBespoke.id,
      productState: 'CHILLED',
      freezingType: 'CHILLED',
      primaryPackaging: 'Packaged Stretch',
      storageTemperature: '0°C to 2°C',
      shelfLifeMonths: 1,
      cartonNetWeightKg: 9.00,
      cutSize: '25mm bone-in curry cubes',
      packagesPerCarton: 20,
      cartonDimensionsMm: '460 x 310 x 130',
      cartonsPerPallet: 60,
      palletsPerContainer: 18,
      totalContainerWeightMt: 9.72,
      imageUrl: 'products/images/LL-CUST-GT-02-sample.webp',
      packagingImageUrl: 'products/packaging/LL-CUST-GT-02-carton.webp',
      specSheetPdfUrl: 'products/specs/LL-CUST-GT-02-specification.pdf',
      certifications: ['HALAL', 'ISO_22000', 'HACCP', 'SFDA'],
      description: 'Client-tailored fresh chilled goat curry cut packed in modified atmosphere trays with tamper-evident top seal. Under active validation trial.',
      isUnderDevelopment: true,
    },
  });

  const pCustDicedStrips = await prisma.product.create({
    data: {
      sku: 'AL-CUST-DIC-03',
      name: 'Allana Foodservice Pre-Portioned Diced Buffalo',
      slug: 'allana-foodservice-pre-portioned-diced-buffalo',
      brand: 'OMAR',
      categoryId: catCustomizedProducts.id,
      subcategoryId: subCustBespoke.id,
      productState: 'IQF',
      freezingType: 'IQF',
      primaryPackaging: 'Polybag',
      storageTemperature: '-18°C',
      shelfLifeMonths: 24,
      cartonNetWeightKg: 20.00,
      cutSize: '20mm uniform cubes',
      packagesPerCarton: 10,
      cartonDimensionsMm: '560 x 360 x 140',
      cartonsPerPallet: 64,
      palletsPerContainer: 20,
      totalContainerWeightMt: 25.60,
      imageUrl: 'products/images/AL-CUST-DIC-03-sample.webp',
      packagingImageUrl: 'products/packaging/AL-CUST-DIC-03-carton.webp',
      specSheetPdfUrl: 'products/specs/AL-CUST-DIC-03-specification.pdf',
      certifications: ['HALAL', 'ISO_22000', 'HACCP', 'SFDA'],
      description: 'Individually quick frozen 20mm diced buffalo meat tailored for commercial institutional catering, commissary prep, and bulk stew processing.',
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
      {
        requestNumber: 'NPD-2026-029',
        companyId: luluHQ.id,
        createdById: corpProcUser.id,
        categoryName: 'Further Processed / Retail',
        targetCountry: 'United Arab Emirates',
        cutSpecification: 'Private Label "LuLu Select" 100% Buffalo Burger Patties 800g retail consumer box (8 x 100g patties).',
        recipeNotes: 'Coarse ground premium buffalo forequarter meat, onion powder, white pepper, sea salt.',
        packagingFormat: 'Interleaved wax paper, 8 patties per printed carton, 12 boxes per outer case.',
        individualPackagingWeight: '800g',
        freezingType: FreezingType.BLAST_FROZEN,
        estimatedFcaPricePerTon: 4800.00,
        targetVolumeMt: 45.00,
        targetPriceUsd: 4.80,
        isCalibrated: true,
        isMarinated: false,
        isBoneless: true,
        isSkinless: true,
        hasSpecification: true,
        additionalComments: 'Consolidated private label program for LuLu retail supermarkets across GCC.',
        status: CustomProductStatus.IN_REVIEW,
        managerComments: 'Artwork packaging approved. Sample batch undergoing sensory panel in Dubai.',
      },
      {
        requestNumber: 'NPD-2026-031',
        companyId: luluRiyadh.id,
        createdById: buyerKsaUser.id,
        categoryName: 'Sheep & Goat Retail',
        targetCountry: 'Saudi Arabia',
        cutSpecification: 'SFDA-compliant chilled vacuum-packed lamb primal cuts (rack, loin, leg portions in MAP trays 500g).',
        recipeNotes: 'Fresh chilled trimming, fat cap trimmed to max 5mm.',
        packagingFormat: 'MAP rigid barrier tray, gas-flushed for 70-day shelf life.',
        individualPackagingWeight: '500g',
        freezingType: FreezingType.CHILLED,
        estimatedFcaPricePerTon: 9200.00,
        targetVolumeMt: 40.00,
        targetPriceUsd: 9.20,
        isCalibrated: true,
        isMarinated: false,
        isBoneless: false,
        isSkinless: false,
        hasSpecification: true,
        additionalComments: 'For LuLu Riyadh and Jeddah flagship hypermarket butchery counters.',
        status: CustomProductStatus.IN_REVIEW,
        managerComments: 'Awaiting abattoir packaging machine calibration schedule.',
      },
      {
        requestNumber: 'NPD-2026-033',
        companyId: luluHQ.id,
        createdById: corpProcUser.id,
        categoryName: 'Further Processed / Retail',
        targetCountry: 'United Arab Emirates',
        cutSpecification: 'Allana MasterChef IQF Seasoned Buffalo Strips 2.5kg commercial foodservice pack.',
        recipeNotes: 'Mild tandoori marinade, pre-cooked, blast frozen.',
        packagingFormat: '4 x 2.5kg barrier polybags per master case (10kg net).',
        individualPackagingWeight: '2.5 kg',
        freezingType: FreezingType.IQF,
        estimatedFcaPricePerTon: 4600.00,
        targetVolumeMt: 60.00,
        targetPriceUsd: 4.60,
        isCalibrated: true,
        isMarinated: true,
        isBoneless: true,
        isSkinless: true,
        hasSpecification: true,
        additionalComments: 'Consolidated airline catering and quick-service restaurant tender.',
        status: CustomProductStatus.ANALYSIS,
        managerComments: 'Sample formulation submitted to food service panel in Dubai.',
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

  // Shipment 6: IN_TRANSIT (JNPT -> Jebel Ali for LuLu HQ Agro Commodities)
  const shipment6 = await prisma.shipment.create({
    data: {
      orderNumber: 'ORD-2026-88301',
      companyId: luluHQ.id,
      salesOrgId: soAgro.id,
      shipToParty: 'LuLu Group Central Logistics DC, Dubai',
      destinationCountry: 'United Arab Emirates',
      totalQuantityMt: 50.00,
      totalAmountUsd: 145000.00,
      status: ShipmentStatus.IN_TRANSIT,
      shippingLine: 'Hapag-Lloyd',
      vesselName: 'Al Jmeliyah',
      voyageNumber: '2630E',
      portOfLoading: 'JNPT Nhava Sheva, India',
      portOfDestination: 'Jebel Ali Port, UAE',
      shippingDate: new Date('2026-10-12T10:00:00Z'),
      etd: new Date('2026-10-14T08:00:00Z'),
      eta: new Date('2026-10-25T14:00:00Z'),
    },
  });

  const c7 = await prisma.container.create({
    data: {
      shipmentId: shipment6.id,
      containerNumber: 'HLCU9920141',
      sealNumber: 'HL-88190',
      reeferSetTemp: 'Ambient',
    },
  });

  await prisma.shipmentItem.create({
    data: {
      containerId: c7.id,
      productId: pBasmatiRice.id,
      quantityMt: 50.00,
      amountUsd: 145000.00,
    },
  });

  // Shipment 7: BOOKED (JNPT -> Khalifa Port for LuLu HQ Retail Division)
  const shipment7 = await prisma.shipment.create({
    data: {
      orderNumber: 'ORD-2026-88315',
      companyId: luluHQ.id,
      salesOrgId: soRetail.id,
      shipToParty: 'LuLu Group Regional Logistics Hub, Abu Dhabi',
      destinationCountry: 'United Arab Emirates',
      totalQuantityMt: 32.00,
      totalAmountUsd: 210000.00,
      status: ShipmentStatus.BOOKED,
      shippingLine: 'Maersk Line',
      vesselName: 'Madrid Maersk',
      voyageNumber: '2640W',
      portOfLoading: 'JNPT Nhava Sheva, India',
      portOfDestination: 'Khalifa Port, Abu Dhabi',
      shippingDate: new Date('2026-10-20T08:00:00Z'),
      etd: new Date('2026-10-22T10:00:00Z'),
      eta: new Date('2026-10-31T18:00:00Z'),
    },
  });

  const c8 = await prisma.container.create({
    data: {
      shipmentId: shipment7.id,
      containerNumber: 'MSKU4401928',
      sealNumber: 'ML-77192',
      reeferSetTemp: '-18.0°C',
    },
  });

  await prisma.shipmentItem.create({
    data: {
      containerId: c8.id,
      productId: pBurgerPatties.id,
      quantityMt: 32.00,
      amountUsd: 210000.00,
    },
  });

  // Shipment 8: IN_TRANSIT (SO-2020 Allana International FZE - Dubai Logistics)
  const shipment8 = await prisma.shipment.create({
    data: {
      orderNumber: 'ORD-2026-88330',
      companyId: luluDubai.id,
      salesOrgId: soFze.id,
      shipToParty: 'LuLu Central Logistics JAFZA, Dubai',
      destinationCountry: 'United Arab Emirates',
      totalQuantityMt: 56.00,
      totalAmountUsd: 268800.00,
      status: ShipmentStatus.IN_TRANSIT,
      shippingLine: 'MSC',
      vesselName: 'MSC Oscar',
      voyageNumber: '2642E',
      portOfLoading: 'JNPT Nhava Sheva, India',
      portOfDestination: 'Jebel Ali Port, Dubai',
      shippingDate: new Date('2026-10-14T12:00:00Z'),
      etd: new Date('2026-10-16T08:00:00Z'),
      eta: new Date('2026-10-27T16:00:00Z'),
    },
  });

  const c9 = await prisma.container.create({
    data: {
      shipmentId: shipment8.id,
      containerNumber: 'MEDU4419201',
      sealNumber: 'MSC-991201',
      reeferSetTemp: '-18.0°C',
    },
  });

  const c10 = await prisma.container.create({
    data: {
      shipmentId: shipment8.id,
      containerNumber: 'MEDU4419202',
      sealNumber: 'MSC-991202',
      reeferSetTemp: '-18.0°C',
    },
  });

  await prisma.shipmentItem.createMany({
    data: [
      {
        containerId: c9.id,
        productId: pTopside.id,
        quantityMt: 28.00,
        amountUsd: 134400.00,
      },
      {
        containerId: c10.id,
        productId: pStriploin.id,
        quantityMt: 28.00,
        amountUsd: 134400.00,
      },
    ],
  });

  // Shipment 9: LOADED (SO-3030 IRAPL Retail - Riyadh Central DC)
  const shipment9 = await prisma.shipment.create({
    data: {
      orderNumber: 'ORD-2026-88342',
      companyId: luluRiyadh.id,
      salesOrgId: soRetail.id,
      shipToParty: 'LuLu Hypermarket Central DC, Riyadh',
      destinationCountry: 'Saudi Arabia',
      totalQuantityMt: 26.00,
      totalAmountUsd: 172000.00,
      status: ShipmentStatus.LOADED,
      shippingLine: 'Hapag-Lloyd',
      vesselName: 'Al Jmeliyah',
      voyageNumber: '2618W',
      portOfLoading: 'JNPT Nhava Sheva, India',
      portOfDestination: 'Riyadh Dry Port, KSA',
      shippingDate: new Date('2026-10-18T14:00:00Z'),
      etd: new Date('2026-10-20T18:00:00Z'),
      eta: new Date('2026-11-02T10:00:00Z'),
    },
  });

  const c11 = await prisma.container.create({
    data: {
      shipmentId: shipment9.id,
      containerNumber: 'HLCU6619281',
      sealNumber: 'HL-771829',
      reeferSetTemp: '-18.5°C',
    },
  });

  await prisma.shipmentItem.createMany({
    data: [
      {
        containerId: c11.id,
        productId: pKebab.id,
        quantityMt: 14.00,
        amountUsd: 92400.00,
      },
      {
        containerId: c11.id,
        productId: pMeatballs.id,
        quantityMt: 12.00,
        amountUsd: 79600.00,
      },
    ],
  });

  // Shipment 10: BOOKED (SO-2020 Allana International FZE - Dammam Port)
  const shipment10 = await prisma.shipment.create({
    data: {
      orderNumber: 'ORD-2026-88355',
      companyId: luluRiyadh.id,
      salesOrgId: soFze.id,
      shipToParty: 'LuLu Central Logistics, Dammam',
      destinationCountry: 'Saudi Arabia',
      totalQuantityMt: 48.00,
      totalAmountUsd: 230400.00,
      status: ShipmentStatus.BOOKED,
      shippingLine: 'Maersk Line',
      vesselName: 'Maersk Mc-Kinney Moller',
      voyageNumber: '2648W',
      portOfLoading: 'JNPT Nhava Sheva, India',
      portOfDestination: 'King Abdulaziz Port, Dammam',
      shippingDate: new Date('2026-10-22T08:00:00Z'),
      etd: new Date('2026-10-25T12:00:00Z'),
      eta: new Date('2026-11-06T14:00:00Z'),
    },
  });

  const c12 = await prisma.container.create({
    data: {
      shipmentId: shipment10.id,
      containerNumber: 'MSKU8829101',
      sealNumber: 'ML-99201',
      reeferSetTemp: '-18.0°C',
    },
  });

  await prisma.shipmentItem.createMany({
    data: [
      {
        containerId: c12.id,
        productId: pShinShank.id,
        quantityMt: 24.00,
        amountUsd: 115200.00,
      },
      {
        containerId: c12.id,
        productId: pBlade.id,
        quantityMt: 24.00,
        amountUsd: 115200.00,
      },
    ],
  });

  // Shipment 11: DELIVERED (SO-4040 Agro - Jeddah Food Hub)
  const shipment11 = await prisma.shipment.create({
    data: {
      orderNumber: 'ORD-2026-88360',
      companyId: luluRiyadh.id,
      salesOrgId: soAgro.id,
      shipToParty: 'LuLu Saudi Food Distribution Hub, Jeddah',
      destinationCountry: 'Saudi Arabia',
      totalQuantityMt: 50.00,
      totalAmountUsd: 145000.00,
      status: ShipmentStatus.DELIVERED,
      shippingLine: 'CMA CGM',
      vesselName: 'CMA CGM Palais Royal',
      voyageNumber: '2615W',
      portOfLoading: 'Mundra Port, Gujarat, India',
      portOfDestination: 'Jeddah Islamic Port, KSA',
      shippingDate: new Date('2026-09-20T10:00:00Z'),
      etd: new Date('2026-09-22T06:00:00Z'),
      eta: new Date('2026-10-06T18:00:00Z'),
    },
  });

  const c13 = await prisma.container.create({
    data: {
      shipmentId: shipment11.id,
      containerNumber: 'CMAU9910281',
      sealNumber: 'CGM-55201',
      reeferSetTemp: '-18.0°C',
    },
  });

  await prisma.shipmentItem.create({
    data: {
      containerId: c13.id,
      productId: pBasmatiRice.id,
      quantityMt: 50.00,
      amountUsd: 145000.00,
    },
  });

  // Shipment 12: CUSTOMS_CLEARED (SO-4040 Agro - Dubai JAFZA)
  const shipment12 = await prisma.shipment.create({
    data: {
      orderNumber: 'ORD-2026-88375',
      companyId: luluDubai.id,
      salesOrgId: soAgro.id,
      shipToParty: 'LuLu Central Logistics JAFZA, Dubai',
      destinationCountry: 'United Arab Emirates',
      totalQuantityMt: 40.00,
      totalAmountUsd: 116000.00,
      status: ShipmentStatus.CUSTOMS_CLEARED,
      shippingLine: 'Maersk Line',
      vesselName: 'Maren Maersk',
      voyageNumber: '2620E',
      portOfLoading: 'Mundra Port, Gujarat, India',
      portOfDestination: 'Jebel Ali Port, Dubai',
      shippingDate: new Date('2026-10-01T08:00:00Z'),
      etd: new Date('2026-10-03T12:00:00Z'),
      eta: new Date('2026-10-14T20:00:00Z'),
    },
  });

  const c14 = await prisma.container.create({
    data: {
      shipmentId: shipment12.id,
      containerNumber: 'MSKU3319020',
      sealNumber: 'ML-33102',
      reeferSetTemp: '-18.0°C',
    },
  });

  await prisma.shipmentItem.create({
    data: {
      containerId: c14.id,
      productId: pBasmatiRice.id,
      quantityMt: 40.00,
      amountUsd: 116000.00,
    },
  });

  // Shipment 13: BOOKED (SO-1010 Frozen - Abu Dhabi Distribution)
  const shipment13 = await prisma.shipment.create({
    data: {
      orderNumber: 'ORD-2026-88388',
      companyId: luluDubai.id,
      salesOrgId: soFrozen.id,
      shipToParty: 'LuLu Hypermarket Distribution, Abu Dhabi',
      destinationCountry: 'United Arab Emirates',
      totalQuantityMt: 25.00,
      totalAmountUsd: 165000.00,
      status: ShipmentStatus.BOOKED,
      shippingLine: 'MSC',
      vesselName: 'MSC Gulsun',
      voyageNumber: '2650W',
      portOfLoading: 'JNPT Nhava Sheva, India',
      portOfDestination: 'Mina Zayed / Khalifa Port, Abu Dhabi',
      shippingDate: new Date('2026-10-24T06:00:00Z'),
      etd: new Date('2026-10-26T10:00:00Z'),
      eta: new Date('2026-11-05T14:00:00Z'),
    },
  });

  const c15 = await prisma.container.create({
    data: {
      shipmentId: shipment13.id,
      containerNumber: 'MEDU5510293',
      sealNumber: 'MSC-55102',
      reeferSetTemp: '-18.0°C',
    },
  });

  await prisma.shipmentItem.createMany({
    data: [
      {
        containerId: c15.id,
        productId: pTenderloinGold.id,
        quantityMt: 15.00,
        amountUsd: 99000.00,
      },
      {
        containerId: c15.id,
        productId: pChuckTender.id,
        quantityMt: 10.00,
        amountUsd: 66000.00,
      },
    ],
  });

  // Shipment 14: ARRIVED_PORT (SO-2020 Allana International FZE - Jebel Ali)
  const shipment14 = await prisma.shipment.create({
    data: {
      orderNumber: 'ORD-2026-88392',
      companyId: luluDubai.id,
      salesOrgId: soFze.id,
      shipToParty: 'LuLu Logistics JAFZA, Dubai',
      destinationCountry: 'United Arab Emirates',
      totalQuantityMt: 28.00,
      totalAmountUsd: 156800.00,
      status: ShipmentStatus.ARRIVED_PORT,
      shippingLine: 'Hapag-Lloyd',
      vesselName: 'Berlin Express',
      voyageNumber: '2635E',
      portOfLoading: 'JNPT Nhava Sheva, India',
      portOfDestination: 'Jebel Ali Port, UAE',
      shippingDate: new Date('2026-10-06T10:00:00Z'),
      etd: new Date('2026-10-08T14:00:00Z'),
      eta: new Date('2026-10-19T22:00:00Z'),
    },
  });

  const c16 = await prisma.container.create({
    data: {
      shipmentId: shipment14.id,
      containerNumber: 'HLCU8810291',
      sealNumber: 'HL-88102',
      reeferSetTemp: '-18.0°C',
    },
  });

  await prisma.shipmentItem.create({
    data: {
      containerId: c16.id,
      productId: pForequarterComp.id,
      quantityMt: 28.00,
      amountUsd: 156800.00,
    },
  });

  // Shipment 15: CUSTOMS_CLEARED (SO-2020 Allana International FZE - Corporate HQ)
  const shipment15 = await prisma.shipment.create({
    data: {
      orderNumber: 'ORD-2026-88405',
      companyId: luluHQ.id,
      salesOrgId: soFze.id,
      shipToParty: 'LuLu Group Central Coldstore JAFZA',
      destinationCountry: 'United Arab Emirates',
      totalQuantityMt: 52.00,
      totalAmountUsd: 249600.00,
      status: ShipmentStatus.CUSTOMS_CLEARED,
      shippingLine: 'Maersk Line',
      vesselName: 'Monaco Maersk',
      voyageNumber: '2645W',
      portOfLoading: 'JNPT Nhava Sheva, India',
      portOfDestination: 'Jebel Ali Port, Dubai',
      shippingDate: new Date('2026-10-04T08:00:00Z'),
      etd: new Date('2026-10-06T12:00:00Z'),
      eta: new Date('2026-10-17T16:00:00Z'),
    },
  });

  const c17 = await prisma.container.create({
    data: {
      shipmentId: shipment15.id,
      containerNumber: 'MSKU9918204',
      sealNumber: 'ML-99182',
      reeferSetTemp: '-18.0°C',
    },
  });

  const c18 = await prisma.container.create({
    data: {
      shipmentId: shipment15.id,
      containerNumber: 'MSKU9918205',
      sealNumber: 'ML-99183',
      reeferSetTemp: '-18.0°C',
    },
  });

  await prisma.shipmentItem.createMany({
    data: [
      {
        containerId: c17.id,
        productId: pLambChops.id,
        quantityMt: 24.00,
        amountUsd: 115200.00,
      },
      {
        containerId: c18.id,
        productId: pMuttonLeg.id,
        quantityMt: 28.00,
        amountUsd: 134400.00,
      },
    ],
  });

  // Shipment Documents in Cloudflare R2
  await prisma.shipmentDocument.createMany({
    data: [
      // Shipment 1: IN_TRANSIT (ORD-2026-88192)
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
        shipmentId: shipment1.id,
        documentType: 'INVOICE',
        fileName: 'commercial-invoice-ORD-2026-88192.pdf',
        fileUrl: 'shipments/ORD-2026-88192/commercial-invoice-ORD-2026-88192.pdf',
        fileSizeBytes: 365000,
      },
      {
        shipmentId: shipment1.id,
        documentType: 'PACKING_LIST',
        fileName: 'packing-list-MAEU9482710.pdf',
        fileUrl: 'shipments/ORD-2026-88192/packing-list-MAEU9482710.pdf',
        fileSizeBytes: 245000,
      },
      // Shipment 2: ARRIVED_PORT (ORD-2026-88204)
      {
        shipmentId: shipment2.id,
        documentType: 'BILL_OF_LADING',
        fileName: 'cma-cgm-bl-CMAU8192033.pdf',
        fileUrl: 'shipments/ORD-2026-88204/cma-cgm-bl-CMAU8192033.pdf',
        fileSizeBytes: 380400,
      },
      {
        shipmentId: shipment2.id,
        documentType: 'VET_CERT',
        fileName: 'vet-sanitary-cert-KSA-2602.pdf',
        fileUrl: 'shipments/ORD-2026-88204/vet-sanitary-cert-KSA-2602.pdf',
        fileSizeBytes: 345000,
      },
      {
        shipmentId: shipment2.id,
        documentType: 'HALAL_CERT',
        fileName: 'halal-slaughter-cert-SFDA-2602.pdf',
        fileUrl: 'shipments/ORD-2026-88204/halal-slaughter-cert-SFDA-2602.pdf',
        fileSizeBytes: 310000,
      },
      {
        shipmentId: shipment2.id,
        documentType: 'INVOICE',
        fileName: 'commercial-invoice-ORD-2026-88204.pdf',
        fileUrl: 'shipments/ORD-2026-88204/commercial-invoice-ORD-2026-88204.pdf',
        fileSizeBytes: 398000,
      },
      {
        shipmentId: shipment2.id,
        documentType: 'PACKING_LIST',
        fileName: 'packing-list-CMAU8192033.pdf',
        fileUrl: 'shipments/ORD-2026-88204/packing-list-CMAU8192033.pdf',
        fileSizeBytes: 252000,
      },
      // Shipment 3: DELIVERED (ORD-2026-88175)
      {
        shipmentId: shipment3.id,
        documentType: 'BILL_OF_LADING',
        fileName: 'msc-bill-of-lading-MEDU8192044.pdf',
        fileUrl: 'shipments/ORD-2026-88175/msc-bill-of-lading-MEDU8192044.pdf',
        fileSizeBytes: 412000,
      },
      {
        shipmentId: shipment3.id,
        documentType: 'VET_CERT',
        fileName: 'vet-health-cert-UAE-2603.pdf',
        fileUrl: 'shipments/ORD-2026-88175/vet-health-cert-UAE-2603.pdf',
        fileSizeBytes: 320000,
      },
      {
        shipmentId: shipment3.id,
        documentType: 'HALAL_CERT',
        fileName: 'halal-slaughter-cert-JAMIAT-2603.pdf',
        fileUrl: 'shipments/ORD-2026-88175/halal-slaughter-cert-JAMIAT-2603.pdf',
        fileSizeBytes: 295000,
      },
      {
        shipmentId: shipment3.id,
        documentType: 'INVOICE',
        fileName: 'commercial-invoice-ORD-2026-88175.pdf',
        fileUrl: 'shipments/ORD-2026-88175/commercial-invoice-ORD-2026-88175.pdf',
        fileSizeBytes: 440000,
      },
      {
        shipmentId: shipment3.id,
        documentType: 'PACKING_LIST',
        fileName: 'packing-list-MEDU8192044.pdf',
        fileUrl: 'shipments/ORD-2026-88175/packing-list-MEDU8192044.pdf',
        fileSizeBytes: 265000,
      },
      // Shipment 4: CUSTOMS_CLEARED (ORD-2026-88219)
      {
        shipmentId: shipment4.id,
        documentType: 'BILL_OF_LADING',
        fileName: 'hapag-lloyd-bl-HLCU5510294.pdf',
        fileUrl: 'shipments/ORD-2026-88219/hapag-lloyd-bl-HLCU5510294.pdf',
        fileSizeBytes: 395000,
      },
      {
        shipmentId: shipment4.id,
        documentType: 'VET_CERT',
        fileName: 'vet-health-cert-KSA-2604.pdf',
        fileUrl: 'shipments/ORD-2026-88219/vet-health-cert-KSA-2604.pdf',
        fileSizeBytes: 335000,
      },
      {
        shipmentId: shipment4.id,
        documentType: 'HALAL_CERT',
        fileName: 'halal-slaughter-cert-SFDA-2604.pdf',
        fileUrl: 'shipments/ORD-2026-88219/halal-slaughter-cert-SFDA-2604.pdf',
        fileSizeBytes: 305000,
      },
      {
        shipmentId: shipment4.id,
        documentType: 'INVOICE',
        fileName: 'commercial-invoice-ORD-2026-88219.pdf',
        fileUrl: 'shipments/ORD-2026-88219/commercial-invoice-ORD-2026-88219.pdf',
        fileSizeBytes: 380000,
      },
      {
        shipmentId: shipment4.id,
        documentType: 'PACKING_LIST',
        fileName: 'packing-list-HLCU5510294.pdf',
        fileUrl: 'shipments/ORD-2026-88219/packing-list-HLCU5510294.pdf',
        fileSizeBytes: 250000,
      },
      // Shipment 5: DELIVERED (ORD-2026-87910)
      {
        shipmentId: shipment5.id,
        documentType: 'BILL_OF_LADING',
        fileName: 'maersk-bl-MSKU7712390.pdf',
        fileUrl: 'shipments/ORD-2026-87910/maersk-bl-MSKU7712390.pdf',
        fileSizeBytes: 430000,
      },
      {
        shipmentId: shipment5.id,
        documentType: 'VET_CERT',
        fileName: 'vet-health-cert-UAE-2605.pdf',
        fileUrl: 'shipments/ORD-2026-87910/vet-health-cert-UAE-2605.pdf',
        fileSizeBytes: 315000,
      },
      {
        shipmentId: shipment5.id,
        documentType: 'INVOICE',
        fileName: 'commercial-invoice-ORD-2026-87910.pdf',
        fileUrl: 'shipments/ORD-2026-87910/commercial-invoice-ORD-2026-87910.pdf',
        fileSizeBytes: 410000,
      },
      {
        shipmentId: shipment5.id,
        documentType: 'PACKING_LIST',
        fileName: 'packing-list-MSKU7712390.pdf',
        fileUrl: 'shipments/ORD-2026-87910/packing-list-MSKU7712390.pdf',
        fileSizeBytes: 260000,
      },
      // Shipment 6: IN_TRANSIT (ORD-2026-88301)
      {
        shipmentId: shipment6.id,
        documentType: 'BILL_OF_LADING',
        fileName: 'hapag-lloyd-bl-HLCU9920141.pdf',
        fileUrl: 'shipments/ORD-2026-88301/hapag-lloyd-bl-HLCU9920141.pdf',
        fileSizeBytes: 415000,
      },
      {
        shipmentId: shipment6.id,
        documentType: 'PHYTOSANITARY_CERT',
        fileName: 'phytosanitary-inspection-rice-2026.pdf',
        fileUrl: 'shipments/ORD-2026-88301/phytosanitary-inspection-rice-2026.pdf',
        fileSizeBytes: 298000,
      },
      {
        shipmentId: shipment6.id,
        documentType: 'INVOICE',
        fileName: 'commercial-invoice-ORD-2026-88301.pdf',
        fileUrl: 'shipments/ORD-2026-88301/commercial-invoice-ORD-2026-88301.pdf',
        fileSizeBytes: 390000,
      },
      {
        shipmentId: shipment6.id,
        documentType: 'PACKING_LIST',
        fileName: 'packing-list-HLCU9920141.pdf',
        fileUrl: 'shipments/ORD-2026-88301/packing-list-HLCU9920141.pdf',
        fileSizeBytes: 240000,
      },
      // Shipment 7: BOOKED (ORD-2026-88315)
      {
        shipmentId: shipment7.id,
        documentType: 'BILL_OF_LADING',
        fileName: 'maersk-booking-MSKU4401928.pdf',
        fileUrl: 'shipments/ORD-2026-88315/maersk-booking-MSKU4401928.pdf',
        fileSizeBytes: 320000,
      },
      {
        shipmentId: shipment7.id,
        documentType: 'INVOICE',
        fileName: 'proforma-invoice-ORD-2026-88315.pdf',
        fileUrl: 'shipments/ORD-2026-88315/proforma-invoice-ORD-2026-88315.pdf',
        fileSizeBytes: 360000,
      },
      // Shipment 8: IN_TRANSIT (ORD-2026-88330)
      {
        shipmentId: shipment8.id,
        documentType: 'BILL_OF_LADING',
        fileName: 'msc-bill-of-lading-MEDU4419201.pdf',
        fileUrl: 'shipments/ORD-2026-88330/msc-bill-of-lading-MEDU4419201.pdf',
        fileSizeBytes: 425000,
      },
      {
        shipmentId: shipment8.id,
        documentType: 'VET_CERT',
        fileName: 'vet-health-cert-UAE-2608.pdf',
        fileUrl: 'shipments/ORD-2026-88330/vet-health-cert-UAE-2608.pdf',
        fileSizeBytes: 310000,
      },
      {
        shipmentId: shipment8.id,
        documentType: 'HALAL_CERT',
        fileName: 'halal-slaughter-cert-JAMIAT-2608.pdf',
        fileUrl: 'shipments/ORD-2026-88330/halal-slaughter-cert-JAMIAT-2608.pdf',
        fileSizeBytes: 295000,
      },
      {
        shipmentId: shipment8.id,
        documentType: 'INVOICE',
        fileName: 'commercial-invoice-ORD-2026-88330.pdf',
        fileUrl: 'shipments/ORD-2026-88330/commercial-invoice-ORD-2026-88330.pdf',
        fileSizeBytes: 410000,
      },
      {
        shipmentId: shipment8.id,
        documentType: 'PACKING_LIST',
        fileName: 'packing-list-MEDU4419201.pdf',
        fileUrl: 'shipments/ORD-2026-88330/packing-list-MEDU4419201.pdf',
        fileSizeBytes: 260000,
      },
      // Shipment 9: LOADED (ORD-2026-88342)
      {
        shipmentId: shipment9.id,
        documentType: 'BILL_OF_LADING',
        fileName: 'hapag-lloyd-bl-HLCU6619281.pdf',
        fileUrl: 'shipments/ORD-2026-88342/hapag-lloyd-bl-HLCU6619281.pdf',
        fileSizeBytes: 410000,
      },
      {
        shipmentId: shipment9.id,
        documentType: 'VET_CERT',
        fileName: 'vet-health-cert-KSA-2609.pdf',
        fileUrl: 'shipments/ORD-2026-88342/vet-health-cert-KSA-2609.pdf',
        fileSizeBytes: 330000,
      },
      {
        shipmentId: shipment9.id,
        documentType: 'HALAL_CERT',
        fileName: 'halal-slaughter-cert-SFDA-2609.pdf',
        fileUrl: 'shipments/ORD-2026-88342/halal-slaughter-cert-SFDA-2609.pdf',
        fileSizeBytes: 300000,
      },
      {
        shipmentId: shipment9.id,
        documentType: 'INVOICE',
        fileName: 'commercial-invoice-ORD-2026-88342.pdf',
        fileUrl: 'shipments/ORD-2026-88342/commercial-invoice-ORD-2026-88342.pdf',
        fileSizeBytes: 385000,
      },
      {
        shipmentId: shipment9.id,
        documentType: 'PACKING_LIST',
        fileName: 'packing-list-HLCU6619281.pdf',
        fileUrl: 'shipments/ORD-2026-88342/packing-list-HLCU6619281.pdf',
        fileSizeBytes: 245000,
      },
      // Shipment 10: BOOKED (ORD-2026-88355)
      {
        shipmentId: shipment10.id,
        documentType: 'BILL_OF_LADING',
        fileName: 'maersk-booking-MSKU8829101.pdf',
        fileUrl: 'shipments/ORD-2026-88355/maersk-booking-MSKU8829101.pdf',
        fileSizeBytes: 340000,
      },
      {
        shipmentId: shipment10.id,
        documentType: 'INVOICE',
        fileName: 'proforma-invoice-ORD-2026-88355.pdf',
        fileUrl: 'shipments/ORD-2026-88355/proforma-invoice-ORD-2026-88355.pdf',
        fileSizeBytes: 370000,
      },
      // Shipment 11: DELIVERED (ORD-2026-88360)
      {
        shipmentId: shipment11.id,
        documentType: 'BILL_OF_LADING',
        fileName: 'cma-cgm-bl-CMAU9910281.pdf',
        fileUrl: 'shipments/ORD-2026-88360/cma-cgm-bl-CMAU9910281.pdf',
        fileSizeBytes: 395000,
      },
      {
        shipmentId: shipment11.id,
        documentType: 'PHYTOSANITARY_CERT',
        fileName: 'phytosanitary-cert-rice-KSA-2611.pdf',
        fileUrl: 'shipments/ORD-2026-88360/phytosanitary-cert-rice-KSA-2611.pdf',
        fileSizeBytes: 290000,
      },
      {
        shipmentId: shipment11.id,
        documentType: 'INVOICE',
        fileName: 'commercial-invoice-ORD-2026-88360.pdf',
        fileUrl: 'shipments/ORD-2026-88360/commercial-invoice-ORD-2026-88360.pdf',
        fileSizeBytes: 375000,
      },
      {
        shipmentId: shipment11.id,
        documentType: 'PACKING_LIST',
        fileName: 'packing-list-CMAU9910281.pdf',
        fileUrl: 'shipments/ORD-2026-88360/packing-list-CMAU9910281.pdf',
        fileSizeBytes: 235000,
      },
      // Shipment 12: CUSTOMS_CLEARED (ORD-2026-88375)
      {
        shipmentId: shipment12.id,
        documentType: 'BILL_OF_LADING',
        fileName: 'maersk-bl-MSKU3319020.pdf',
        fileUrl: 'shipments/ORD-2026-88375/maersk-bl-MSKU3319020.pdf',
        fileSizeBytes: 410000,
      },
      {
        shipmentId: shipment12.id,
        documentType: 'PHYTOSANITARY_CERT',
        fileName: 'phytosanitary-cert-UAE-2612.pdf',
        fileUrl: 'shipments/ORD-2026-88375/phytosanitary-cert-UAE-2612.pdf',
        fileSizeBytes: 285000,
      },
      {
        shipmentId: shipment12.id,
        documentType: 'INVOICE',
        fileName: 'commercial-invoice-ORD-2026-88375.pdf',
        fileUrl: 'shipments/ORD-2026-88375/commercial-invoice-ORD-2026-88375.pdf',
        fileSizeBytes: 360000,
      },
      {
        shipmentId: shipment12.id,
        documentType: 'PACKING_LIST',
        fileName: 'packing-list-MSKU3319020.pdf',
        fileUrl: 'shipments/ORD-2026-88375/packing-list-MSKU3319020.pdf',
        fileSizeBytes: 230000,
      },
      // Shipment 13: BOOKED (ORD-2026-88388)
      {
        shipmentId: shipment13.id,
        documentType: 'BILL_OF_LADING',
        fileName: 'msc-booking-MEDU5510293.pdf',
        fileUrl: 'shipments/ORD-2026-88388/msc-booking-MEDU5510293.pdf',
        fileSizeBytes: 330000,
      },
      {
        shipmentId: shipment13.id,
        documentType: 'INVOICE',
        fileName: 'proforma-invoice-ORD-2026-88388.pdf',
        fileUrl: 'shipments/ORD-2026-88388/proforma-invoice-ORD-2026-88388.pdf',
        fileSizeBytes: 365000,
      },
      // Shipment 14: ARRIVED_PORT (ORD-2026-88392)
      {
        shipmentId: shipment14.id,
        documentType: 'BILL_OF_LADING',
        fileName: 'hapag-lloyd-bl-HLCU8810291.pdf',
        fileUrl: 'shipments/ORD-2026-88392/hapag-lloyd-bl-HLCU8810291.pdf',
        fileSizeBytes: 420000,
      },
      {
        shipmentId: shipment14.id,
        documentType: 'VET_CERT',
        fileName: 'vet-health-cert-UAE-2614.pdf',
        fileUrl: 'shipments/ORD-2026-88392/vet-health-cert-UAE-2614.pdf',
        fileSizeBytes: 315000,
      },
      {
        shipmentId: shipment14.id,
        documentType: 'HALAL_CERT',
        fileName: 'halal-slaughter-cert-JAMIAT-2614.pdf',
        fileUrl: 'shipments/ORD-2026-88392/halal-slaughter-cert-JAMIAT-2614.pdf',
        fileSizeBytes: 300000,
      },
      {
        shipmentId: shipment14.id,
        documentType: 'INVOICE',
        fileName: 'commercial-invoice-ORD-2026-88392.pdf',
        fileUrl: 'shipments/ORD-2026-88392/commercial-invoice-ORD-2026-88392.pdf',
        fileSizeBytes: 395000,
      },
      {
        shipmentId: shipment14.id,
        documentType: 'TEMP_LOG',
        fileName: 'reefer-telematics-log-HLCU8810291.pdf',
        fileUrl: 'shipments/ORD-2026-88392/reefer-telematics-log-HLCU8810291.pdf',
        fileSizeBytes: 540000,
      },
      // Shipment 15: CUSTOMS_CLEARED (ORD-2026-88405)
      {
        shipmentId: shipment15.id,
        documentType: 'BILL_OF_LADING',
        fileName: 'maersk-bl-MSKU9918204.pdf',
        fileUrl: 'shipments/ORD-2026-88405/maersk-bl-MSKU9918204.pdf',
        fileSizeBytes: 435000,
      },
      {
        shipmentId: shipment15.id,
        documentType: 'VET_CERT',
        fileName: 'vet-health-cert-UAE-2615.pdf',
        fileUrl: 'shipments/ORD-2026-88405/vet-health-cert-UAE-2615.pdf',
        fileSizeBytes: 320000,
      },
      {
        shipmentId: shipment15.id,
        documentType: 'HALAL_CERT',
        fileName: 'halal-slaughter-cert-JAMIAT-2615.pdf',
        fileUrl: 'shipments/ORD-2026-88405/halal-slaughter-cert-JAMIAT-2615.pdf',
        fileSizeBytes: 305000,
      },
      {
        shipmentId: shipment15.id,
        documentType: 'INVOICE',
        fileName: 'commercial-invoice-ORD-2026-88405.pdf',
        fileUrl: 'shipments/ORD-2026-88405/commercial-invoice-ORD-2026-88405.pdf',
        fileSizeBytes: 420000,
      },
      {
        shipmentId: shipment15.id,
        documentType: 'PACKING_LIST',
        fileName: 'packing-list-MSKU9918204.pdf',
        fileUrl: 'shipments/ORD-2026-88405/packing-list-MSKU9918204.pdf',
        fileSizeBytes: 270000,
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
      {
        companyId: luluRiyadh.id,
        salesOrgId: soFrozen.id,
        month: 10,
        year: 2026,
        country: 'Saudi Arabia',
        shipToParty: 'LuLu Hypermarket Dammam DC',
        sku: 'AL-BUF-SIL-01',
        skuName: 'Frozen Boneless Buffalo Silverside (SAP: 7941)',
        targetTonnes: 90.00,
        targetUsd: 414000.00,
        lastMonthBalance: 0.00,
        shippedTonnes: 54.00,
        shippedUsd: 248400.00,
        pipelineTonnes: 26.00,
        pipelineUsd: 119600.00,
      },
      {
        companyId: luluRiyadh.id,
        salesOrgId: soFrozen.id,
        month: 10,
        year: 2026,
        country: 'Saudi Arabia',
        shipToParty: 'LuLu Central Coldstore, Jeddah',
        sku: 'AL-BUF-TOP-02',
        skuName: 'Frozen Boneless Buffalo Topside (SAP: 7940)',
        targetTonnes: 120.00,
        targetUsd: 576000.00,
        lastMonthBalance: 15.00,
        shippedTonnes: 72.00,
        shippedUsd: 345600.00,
        pipelineTonnes: 48.00,
        pipelineUsd: 230400.00,
      },
      {
        companyId: luluHQ.id,
        salesOrgId: soAgro.id,
        month: 10,
        year: 2026,
        country: 'United Arab Emirates',
        shipToParty: 'LuLu Group Central Logistics DC, Dubai',
        sku: 'AL-AGRO-RICE-01',
        skuName: 'Royal Basmati Rice 1121 XXL 5kg Bag',
        targetTonnes: 100.00,
        targetUsd: 290000.00,
        lastMonthBalance: 0.00,
        shippedTonnes: 50.00,
        shippedUsd: 145000.00,
        pipelineTonnes: 50.00,
        pipelineUsd: 145000.00,
      },
      // Month 11 & 12 allocations for KSA and HQ
      {
        companyId: luluRiyadh.id,
        salesOrgId: soFrozen.id,
        month: 11,
        year: 2026,
        country: 'Saudi Arabia',
        shipToParty: 'LuLu Hypermarket Dammam DC',
        sku: 'AL-BUF-SIL-01',
        skuName: 'Frozen Boneless Buffalo Silverside (SAP: 7941)',
        targetTonnes: 100.00,
        targetUsd: 460000.00,
        lastMonthBalance: 10.00,
        shippedTonnes: 60.00,
        shippedUsd: 276000.00,
        pipelineTonnes: 40.00,
        pipelineUsd: 184000.00,
      },
      {
        companyId: luluRiyadh.id,
        salesOrgId: soFrozen.id,
        month: 11,
        year: 2026,
        country: 'Saudi Arabia',
        shipToParty: 'LuLu Central Coldstore, Jeddah',
        sku: 'AL-BUF-TOP-02',
        skuName: 'Frozen Boneless Buffalo Topside (SAP: 7940)',
        targetTonnes: 130.00,
        targetUsd: 624000.00,
        lastMonthBalance: 15.00,
        shippedTonnes: 75.00,
        shippedUsd: 360000.00,
        pipelineTonnes: 55.00,
        pipelineUsd: 264000.00,
      },
      {
        companyId: luluHQ.id,
        salesOrgId: soAgro.id,
        month: 11,
        year: 2026,
        country: 'United Arab Emirates',
        shipToParty: 'LuLu Group Central Logistics DC, Dubai',
        sku: 'AL-AGRO-RICE-01',
        skuName: 'Royal Basmati Rice 1121 XXL 5kg Bag',
        targetTonnes: 120.00,
        targetUsd: 348000.00,
        lastMonthBalance: 15.00,
        shippedTonnes: 80.00,
        shippedUsd: 232000.00,
        pipelineTonnes: 40.00,
        pipelineUsd: 116000.00,
      },
      {
        companyId: luluHQ.id,
        salesOrgId: soRetail.id,
        month: 12,
        year: 2026,
        country: 'United Arab Emirates',
        shipToParty: 'LuLu Group Central Logistics DC, Dubai',
        sku: 'AL-PRC-BUR-20',
        skuName: 'Allana Prime Buffalo Burger Patties (120g x 8)',
        targetTonnes: 40.00,
        targetUsd: 192000.00,
        lastMonthBalance: 0.00,
        shippedTonnes: 15.00,
        shippedUsd: 72000.00,
        pipelineTonnes: 25.00,
        pipelineUsd: 120000.00,
      },
      // Month 10: SO-2020 Allana International FZE Quota
      {
        companyId: luluDubai.id,
        salesOrgId: soFze.id,
        month: 10,
        year: 2026,
        country: 'United Arab Emirates',
        shipToParty: 'LuLu Central Logistics JAFZA',
        sku: 'AL-BUF-TOP-02',
        skuName: 'Frozen Boneless Buffalo Topside (JAFZA Re-export)',
        targetTonnes: 80.00,
        targetUsd: 384000.00,
        lastMonthBalance: 10.00,
        shippedTonnes: 60.00,
        shippedUsd: 288000.00,
        pipelineTonnes: 20.00,
        pipelineUsd: 96000.00,
      },
      {
        companyId: luluDubai.id,
        salesOrgId: soFze.id,
        month: 10,
        year: 2026,
        country: 'United Arab Emirates',
        shipToParty: 'LuLu Central Logistics JAFZA',
        sku: 'AL-BUF-STR-04',
        skuName: 'Frozen Boneless Buffalo Striploin',
        targetTonnes: 50.00,
        targetUsd: 250000.00,
        lastMonthBalance: 0.00,
        shippedTonnes: 35.00,
        shippedUsd: 175000.00,
        pipelineTonnes: 15.00,
        pipelineUsd: 75000.00,
      },
      {
        companyId: luluRiyadh.id,
        salesOrgId: soFze.id,
        month: 10,
        year: 2026,
        country: 'Saudi Arabia',
        shipToParty: 'LuLu Central Logistics, Dammam',
        sku: 'AL-BUF-SHN-05',
        skuName: 'Frozen Buffalo Shin Shank (FZE Hub)',
        targetTonnes: 60.00,
        targetUsd: 288000.00,
        lastMonthBalance: 0.00,
        shippedTonnes: 48.00,
        shippedUsd: 230400.00,
        pipelineTonnes: 12.00,
        pipelineUsd: 57600.00,
      },
      // Month 11: SO-2020 Allana International FZE Quota
      {
        companyId: luluDubai.id,
        salesOrgId: soFze.id,
        month: 11,
        year: 2026,
        country: 'United Arab Emirates',
        shipToParty: 'LuLu Central Logistics JAFZA',
        sku: 'AL-BUF-TOP-02',
        skuName: 'Frozen Boneless Buffalo Topside (JAFZA Re-export)',
        targetTonnes: 90.00,
        targetUsd: 432000.00,
        lastMonthBalance: 10.00,
        shippedTonnes: 50.00,
        shippedUsd: 240000.00,
        pipelineTonnes: 40.00,
        pipelineUsd: 192000.00,
      },
      {
        companyId: luluRiyadh.id,
        salesOrgId: soFze.id,
        month: 11,
        year: 2026,
        country: 'Saudi Arabia',
        shipToParty: 'LuLu Central Logistics, Dammam',
        sku: 'AL-BUF-SHN-05',
        skuName: 'Frozen Buffalo Shin Shank (FZE Hub)',
        targetTonnes: 70.00,
        targetUsd: 336000.00,
        lastMonthBalance: 12.00,
        shippedTonnes: 40.00,
        shippedUsd: 192000.00,
        pipelineTonnes: 30.00,
        pipelineUsd: 144000.00,
      },
      // Month 12: Full Multi-Entity Q4 Holiday Delivery Matrix
      {
        companyId: luluDubai.id,
        salesOrgId: soFrozen.id,
        month: 12,
        year: 2026,
        country: 'United Arab Emirates',
        shipToParty: 'LuLu Central Logistics JAFZA',
        sku: 'AL-BUF-SIL-01',
        skuName: 'Frozen Boneless Buffalo Silverside',
        targetTonnes: 80.00,
        targetUsd: 368000.00,
        lastMonthBalance: 15.00,
        shippedTonnes: 20.00,
        shippedUsd: 92000.00,
        pipelineTonnes: 60.00,
        pipelineUsd: 276000.00,
      },
      {
        companyId: luluDubai.id,
        salesOrgId: soRetail.id,
        month: 12,
        year: 2026,
        country: 'United Arab Emirates',
        shipToParty: 'LuLu Central Coldstore JAFZA',
        sku: 'AL-VPCM-CUB-08',
        skuName: 'Chilled Vacuum-Packed Goat Cubes (450g)',
        targetTonnes: 35.00,
        targetUsd: 294000.00,
        lastMonthBalance: 5.00,
        shippedTonnes: 10.00,
        shippedUsd: 84000.00,
        pipelineTonnes: 25.00,
        pipelineUsd: 210000.00,
      },
      {
        companyId: luluDubai.id,
        salesOrgId: soFze.id,
        month: 12,
        year: 2026,
        country: 'United Arab Emirates',
        shipToParty: 'LuLu Central Logistics JAFZA',
        sku: 'AL-BUF-TOP-02',
        skuName: 'Frozen Boneless Buffalo Topside (JAFZA Re-export)',
        targetTonnes: 100.00,
        targetUsd: 480000.00,
        lastMonthBalance: 20.00,
        shippedTonnes: 30.00,
        shippedUsd: 144000.00,
        pipelineTonnes: 70.00,
        pipelineUsd: 336000.00,
      },
      {
        companyId: luluRiyadh.id,
        salesOrgId: soFrozen.id,
        month: 12,
        year: 2026,
        country: 'Saudi Arabia',
        shipToParty: 'LuLu Central Coldstore, Jeddah',
        sku: 'AL-BUF-TOP-02',
        skuName: 'Frozen Boneless Buffalo Topside (SAP: 7940)',
        targetTonnes: 140.00,
        targetUsd: 672000.00,
        lastMonthBalance: 20.00,
        shippedTonnes: 40.00,
        shippedUsd: 192000.00,
        pipelineTonnes: 100.00,
        pipelineUsd: 480000.00,
      },
      {
        companyId: luluRiyadh.id,
        salesOrgId: soFze.id,
        month: 12,
        year: 2026,
        country: 'Saudi Arabia',
        shipToParty: 'LuLu Central Logistics, Dammam',
        sku: 'AL-BUF-STR-04',
        skuName: 'Frozen Boneless Buffalo Striploin (FZE Hub)',
        targetTonnes: 60.00,
        targetUsd: 300000.00,
        lastMonthBalance: 0.00,
        shippedTonnes: 20.00,
        shippedUsd: 100000.00,
        pipelineTonnes: 40.00,
        pipelineUsd: 200000.00,
      },
      {
        companyId: luluRiyadh.id,
        salesOrgId: soAgro.id,
        month: 12,
        year: 2026,
        country: 'Saudi Arabia',
        shipToParty: 'LuLu Saudi Food Distribution Hub, Jeddah',
        sku: 'AL-AGRO-RICE-01',
        skuName: 'Royal Basmati Rice 1121 XXL 5kg Bag',
        targetTonnes: 120.00,
        targetUsd: 348000.00,
        lastMonthBalance: 10.00,
        shippedTonnes: 30.00,
        shippedUsd: 87000.00,
        pipelineTonnes: 90.00,
        pipelineUsd: 261000.00,
      },
      {
        companyId: luluHQ.id,
        salesOrgId: soFze.id,
        month: 12,
        year: 2026,
        country: 'United Arab Emirates',
        shipToParty: 'LuLu Group Central Coldstore JAFZA',
        sku: 'AL-VPCM-CUB-08',
        skuName: 'Chilled Vacuum-Packed Goat Cubes (FZE)',
        targetTonnes: 50.00,
        targetUsd: 420000.00,
        lastMonthBalance: 0.00,
        shippedTonnes: 20.00,
        shippedUsd: 168000.00,
        pipelineTonnes: 30.00,
        pipelineUsd: 252000.00,
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

  // Quality Claim 4: Under Investigation for LuLu Riyadh (comp-lulu-ksa)
  const claim4 = await prisma.claim.create({
    data: {
      claimNumber: 'CLM-2026-0044',
      companyId: luluRiyadh.id,
      submittedById: logisticsUser.id,
      type: ClaimType.CLAIM,
      status: ClaimStatus.INVESTIGATION,
      subject: 'Transit temperature deviation alert at Jeddah Islamic Port in Container CMAU8192033',
      categoryOfRequest: 'Temperature Abuse',
      supplierName: 'Allanasons Private Limited - Aligarh Processing Unit',
      shipmentId: shipment2.id,
      containerNumber: 'CMAU8192033',
      invoiceNumber: 'INV-2026-04210',
      deliveryDate: new Date('2026-10-18T00:00:00Z'),
      description: 'SFDA port veterinary inspection logged temporary temperature rise to -12°C during vessel discharge. Product cores remain at -17.5°C.',
      companyResponse: 'Carrier CMA CGM data log requested. Preliminary inspection shows product remained deep frozen.',
    },
  });

  await prisma.claimProductItem.create({
    data: {
      claimId: claim4.id,
      productId: pSilverside.id,
      productArticle: '8310S',
      productName: 'Frozen Boneless Buffalo Silverside',
      producerName: 'Allanasons Pvt Ltd - Aligarh',
      country: 'Saudi Arabia',
      vehicleNumber: 'CMAU8192033',
      nonConformWeightKg: 1200.0,
      receivedQuantityKg: 16000.0,
      lotNumber: 'A-261002-1',
      productionDate: new Date('2026-10-02T00:00:00Z'),
    },
  });

  // Info Request 3: SFDA Compliance for LuLu Riyadh (comp-lulu-ksa)
  await prisma.claim.create({
    data: {
      claimNumber: 'REQ-2026-0018',
      companyId: luluRiyadh.id,
      submittedById: buyerUser.id,
      type: ClaimType.INFO_REQUEST,
      status: ClaimStatus.ACCEPTED,
      subject: 'SFDA Abattoir Health Certificate & Microbial Microbiological Analysis for Riyadh Central DC',
      infoCategory: InfoRequestCategory.DOCS_CERTIFICATE,
      targetCountry: 'Saudi Arabia',
      supplierName: 'Allanasons Private Limited - Sahibabad Plant',
      description: 'Annual regulatory dossier required for SFDA Saudi compliance file.',
      companyResponse: 'Certified veterinary inspection certificate provided by Indian Ministry of Agriculture & Allanasons QA.',
      resolvedAt: new Date('2026-10-17T12:00:00Z'),
    },
  });

  // Info Request 4: Group ESG & Traceability Audit for LuLu HQ (comp-lulu-corp)
  const req4 = await prisma.claim.create({
    data: {
      claimNumber: 'REQ-2026-0020',
      companyId: luluHQ.id,
      submittedById: corpDirUser.id,
      type: ClaimType.INFO_REQUEST,
      status: ClaimStatus.COMPLETED,
      subject: 'LuLu Group International Annual Vendor Quality Assurance Audit 2026',
      infoCategory: InfoRequestCategory.QUESTIONNAIRE,
      targetCountry: 'United Arab Emirates',
      description: 'Group-wide ESG, supplier traceability and cold chain governance compliance questionnaire.',
      companyResponse: 'Completed questionnaire and audit certificates provided to LuLu corporate compliance committee.',
      resolvedAt: new Date('2026-10-15T09:00:00Z'),
    },
  });

  // Quality Claim 5: Outer container seal discrepancy for LuLu HQ (comp-lulu-corp)
  const claim5 = await prisma.claim.create({
    data: {
      claimNumber: 'CLM-2026-0050',
      companyId: luluHQ.id,
      submittedById: corpProcUser.id,
      type: ClaimType.CLAIM,
      status: ClaimStatus.REGISTERED,
      subject: 'Container bolt seal serial mismatch noted on arrival notice for ORD-2026-88301',
      categoryOfRequest: 'Documentation / Seal Mismatch',
      supplierName: 'Allanasons Agro-Commodities Division - Taloja',
      shipmentId: shipment6.id,
      containerNumber: 'MSCU4019284',
      invoiceNumber: 'INV-2026-088301',
      deliveryDate: new Date('2026-10-24T00:00:00Z'),
      description: 'Carrier arrival advisory lists bolt seal as MSC-994182 whereas Bill of Lading notes MSC-994180. Requires verification before customs clearance.',
      companyResponse: 'Discrepancy logged with shipping line MSC. Official carrier amendment letter requested.',
    },
  });

  await prisma.claimProductItem.create({
    data: {
      claimId: claim5.id,
      productId: pBasmatiRice.id,
      productArticle: '8390R',
      productName: 'Allana Royal Platinum 1121 XXL Basmati Rice',
      producerName: 'Allanasons Agro Division',
      country: 'United Arab Emirates',
      vehicleNumber: 'MSCU4019284',
      nonConformWeightKg: 0.0000,
      receivedQuantityKg: 50000.0000,
      lotNumber: 'R-261008-1',
      productionDate: new Date('2026-10-08T00:00:00Z'),
    },
  });

  // Claim 6: UNDER_REVIEW (Packaging Delamination & Purge Leakage)
  const claim6 = await prisma.claim.create({
    data: {
      claimNumber: 'CLM-2026-0052',
      companyId: luluDubai.id,
      submittedById: qaUser.id,
      type: ClaimType.CLAIM,
      status: ClaimStatus.UNDER_REVIEW,
      subject: 'Vacuum barrier seal failure & purge leakage in 50 cartons of Boneless Buffalo Striploin',
      categoryOfRequest: 'Packaging Integrity / Purge Leakage',
      supplierName: 'Allana Integrated Abattoir Plant 1, Aligarh',
      shipmentId: shipment1.id,
      containerNumber: 'MSKU9482710',
      invoiceNumber: 'INV-2026-88192',
      deliveryDate: new Date('2026-10-16T00:00:00Z'),
      description: 'During destuffing at JAFZA coldstore, 50 master cartons exhibited broken outer strapping and primary vacuum bag delamination resulting in excessive red blood purge.',
      companyResponse: 'Sample pouches dispatched to Allana central analytical lab for seal strength test. Awaiting technical dossier.',
    },
  });

  await prisma.claimProductItem.create({
    data: {
      claimId: claim6.id,
      productId: pStriploin.id,
      productArticle: '8324S',
      productName: 'Frozen Boneless Buffalo Striploin',
      producerName: 'Allana Integrated Abattoir Plant 1',
      country: 'United Arab Emirates',
      vehicleNumber: 'MSKU9482710',
      nonConformWeightKg: 1000.0000,
      receivedQuantityKg: 24000.0000,
      lotNumber: 'STR-261002',
      productionDate: new Date('2026-10-02T00:00:00Z'),
    },
  });

  // Claim 7: PARTLY_ACCEPTED (Trimming Specification Non-Conformity)
  const claim7 = await prisma.claim.create({
    data: {
      claimNumber: 'CLM-2026-0055',
      companyId: luluRiyadh.id,
      submittedById: qaKsaUser.id,
      type: ClaimType.CLAIM,
      status: ClaimStatus.PARTLY_ACCEPTED,
      subject: 'Fat cap trimming thickness exceeding 10mm specification on 40 cartons of Bobby Veal',
      categoryOfRequest: 'Trimming Specification Non-Conformity',
      supplierName: 'Allana Cold Storage Plant 4, Mumbai',
      shipmentId: shipment2.id,
      containerNumber: 'CMAU8192033',
      invoiceNumber: 'INV-2026-88204',
      deliveryDate: new Date('2026-10-10T00:00:00Z'),
      description: 'Client butchery inspection identified fat cover averaging 14-16mm against contractual limit of 8-10mm max.',
      companyResponse: 'Partly Accepted: Technical committee approved $2,400 re-trimming goodwill commercial allowance. Credit Note CN-2026-008 issued.',
      resolvedAt: new Date('2026-10-14T15:00:00Z'),
    },
  });

  await prisma.claimProductItem.create({
    data: {
      claimId: claim7.id,
      productId: pTenderloin.id,
      productArticle: '8320T',
      productName: 'Frozen Buffalo Tenderloin',
      producerName: 'Allana Cold Storage Plant 4',
      country: 'Saudi Arabia',
      vehicleNumber: 'CMAU8192033',
      nonConformWeightKg: 800.0000,
      receivedQuantityKg: 12000.0000,
      lotNumber: 'BV-260928',
      productionDate: new Date('2026-09-28T00:00:00Z'),
    },
  });

  // Claim 8: REJECTED (Commercial Transit Penalty - Force Majeure)
  const claim8 = await prisma.claim.create({
    data: {
      claimNumber: 'CLM-2026-0058',
      companyId: luluDubai.id,
      submittedById: buyerUser.id,
      type: ClaimType.CLAIM,
      status: ClaimStatus.REJECTED,
      subject: 'Transit delivery delay compensation claim for consignment ORD-2026-88175',
      categoryOfRequest: 'Commercial Transit Penalty',
      supplierName: 'Allana International FZE - Dubai Logistics',
      shipmentId: shipment3.id,
      invoiceNumber: 'INV-2026-88175',
      deliveryDate: new Date('2026-10-09T00:00:00Z'),
      description: 'LuLu retail operations requested 5% invoice penalty due to 3-day vessel delay into Jebel Ali.',
      companyResponse: 'Claim Rejected: Ocean freight bill of lading demonstrates ocean carrier issued force majeure certificate due to Severe Cyclonic Storm closing Nhava Sheva port approach channel. Force majeure events are excluded under CIF Incoterms 2020.',
      resolvedAt: new Date('2026-10-12T11:00:00Z'),
    },
  });

  await prisma.claimProductItem.create({
    data: {
      claimId: claim8.id,
      productId: pSilverside.id,
      productArticle: '8321S',
      productName: 'Frozen Boneless Buffalo Silverside',
      producerName: 'Allana International FZE',
      country: 'United Arab Emirates',
      nonConformWeightKg: 0.0000,
      receivedQuantityKg: 48000.0000,
      lotNumber: 'SIL-260915',
      productionDate: new Date('2026-09-15T00:00:00Z'),
    },
  });

  // Info Request 5: UNDER_REVIEW (SFDA Shelf Life Extension Validation)
  const req5 = await prisma.claim.create({
    data: {
      claimNumber: 'REQ-2026-0024',
      companyId: luluRiyadh.id,
      submittedById: buyerKsaUser.id,
      type: ClaimType.INFO_REQUEST,
      status: ClaimStatus.UNDER_REVIEW,
      infoCategory: InfoRequestCategory.DOCS_DECLARATION_SHELF_LIFE,
      targetCountry: 'Saudi Arabia',
      requestedShelfLifeDate: new Date('2026-12-31T00:00:00Z'),
      shelfLifeExtensionVolumeKg: 25000.0000,
      reasonForShelfLifeExtension: 'SFDA technical regulation amendment allows 90-day shelf life for vacuum packed chilled cuts subject to certified microbiological validation.',
      subject: 'Request for SFDA 90-day chilled vacuum buffalo shelf-life validation study',
      description: 'Urgent technical dossier required for SFDA customs pre-clearance on upcoming Riyadh chilled primal retail campaign.',
      companyResponse: 'Dossier in review with Allanasons Central Research Laboratory. Challenge testing data to be compiled.',
    },
  });

  // Info Request 6: CLARIFICATION_REQUIRED (Sedex SMETA Social Audit)
  const req6 = await prisma.claim.create({
    data: {
      claimNumber: 'REQ-2026-0027',
      companyId: luluHQ.id,
      submittedById: corpProcUser.id,
      type: ClaimType.INFO_REQUEST,
      status: ClaimStatus.CLARIFICATION_REQUIRED,
      infoCategory: InfoRequestCategory.OTHER_AUDIT,
      targetCountry: 'United Arab Emirates',
      subject: 'Annual Supplier Social Responsibility & Sedex SMETA 4-Pillar Audit Report',
      description: 'LuLu Group Corporate Sustainability governance committee requires updated 2026 Sedex audit certification for Indian processing units.',
      companyResponse: 'Clarification requested: Please confirm whether the scope should cover Aligarh Plant 1 or both Aligarh and Sahibabad plants.',
    },
  });

  // Evidence Attachments & Inspection Reports for Claims
  await prisma.claimAttachment.createMany({
    data: [
      {
        claimId: claim2.id,
        fileName: 'surveyor_crush_report_MEDU8192044.pdf',
        fileUrl: 'claims/CLM-2026-0041/surveyor_crush_report_MEDU8192044.pdf',
        fileSizeBytes: 712000,
      },
      {
        claimId: claim2.id,
        fileName: 'photo_damaged_cartons_tier1.jpg',
        fileUrl: 'claims/CLM-2026-0041/photo_damaged_cartons_tier1.jpg',
        fileSizeBytes: 1450000,
      },
      {
        claimId: claim3.id,
        fileName: 'port_seal_tally_discrepancy.pdf',
        fileUrl: 'claims/CLM-2026-0032/port_seal_tally_discrepancy.pdf',
        fileSizeBytes: 520000,
      },
      {
        claimId: claim3.id,
        fileName: 'credit_note_CN-2026-004.pdf',
        fileUrl: 'claims/CLM-2026-0032/credit_note_CN-2026-004.pdf',
        fileSizeBytes: 310000,
      },
      {
        claimId: claim4.id,
        fileName: 'sfda_jeddah_temp_logger_graph.pdf',
        fileUrl: 'claims/CLM-2026-0044/sfda_jeddah_temp_logger_graph.pdf',
        fileSizeBytes: 890000,
      },
      {
        claimId: claim4.id,
        fileName: 'jeddah_port_vet_quarantine_notice.pdf',
        fileUrl: 'claims/CLM-2026-0044/jeddah_port_vet_quarantine_notice.pdf',
        fileSizeBytes: 440000,
      },
      {
        claimId: claim5.id,
        fileName: 'customs_seal_mismatch_manifest.pdf',
        fileUrl: 'claims/CLM-2026-0050/customs_seal_mismatch_manifest.pdf',
        fileSizeBytes: 380000,
      },
      {
        claimId: claim6.id,
        fileName: 'photo_seal_delamination_carton_08.jpg',
        fileUrl: 'claims/CLM-2026-0052/photo_seal_delamination_carton_08.jpg',
        fileSizeBytes: 980000,
      },
      {
        claimId: claim7.id,
        fileName: 'credit_note_CN-2026-008.pdf',
        fileUrl: 'claims/CLM-2026-0055/credit_note_CN-2026-008.pdf',
        fileSizeBytes: 340000,
      },
      {
        claimId: claim8.id,
        fileName: 'carrier_force_majeure_cyclone_tej.pdf',
        fileUrl: 'claims/CLM-2026-0058/carrier_force_majeure_cyclone_tej.pdf',
        fileSizeBytes: 520000,
      },
      {
        claimId: req4.id,
        fileName: 'lulu_group_esg_questionnaire_allana_signed.pdf',
        fileUrl: 'claims/REQ-2026-0020/lulu_group_esg_questionnaire_allana_signed.pdf',
        fileSizeBytes: 620000,
      },
      {
        claimId: req5.id,
        fileName: 'sfda_shelf_life_validation_protocol_draft.pdf',
        fileUrl: 'claims/REQ-2026-0024/sfda_shelf_life_validation_protocol_draft.pdf',
        fileSizeBytes: 780000,
      },
    ],
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
      {
        companyId: luluHQ.id,
        country: 'United Arab Emirates',
        licenseName: 'UAE Ministry of Economy Corporate Commercial Registration',
        licenseNumber: 'MOE-CORP-2024-88',
        issueDate: new Date('2024-01-01T00:00:00Z'),
        expiryDate: new Date('2027-01-01T00:00:00Z'),
        documentUrl: 'licenses/LULU-HQ/MOE-COMMERCIAL-REG-2027.pdf',
      },
      {
        companyId: luluHQ.id,
        country: 'United Arab Emirates',
        licenseName: 'Global Food Safety Initiative (GFSI) Quality Certification',
        licenseNumber: 'GFSI-INT-2025-01',
        issueDate: new Date('2025-02-15T00:00:00Z'),
        expiryDate: new Date('2027-02-15T00:00:00Z'),
        documentUrl: 'licenses/LULU-HQ/GFSI-CERT-2027.pdf',
      },
      {
        companyId: luluHQ.id,
        country: 'United Arab Emirates',
        licenseName: 'UAE MOIAT National Halal Group Accreditation',
        licenseNumber: 'MOIAT-HQ-2025',
        issueDate: new Date('2025-11-01T00:00:00Z'),
        expiryDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), // EXPIRING IN 28 DAYS! Triggers banner!
        documentUrl: 'licenses/LULU-HQ/MOIAT-HALAL-ACCREDITATION-2026.pdf',
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
      {
        userId: logisticsUser.id,
        title: 'Vessel Berthed: CMA CGM Jacques Saadé arrived at Jeddah',
        message: 'Container CMAU8192033 (ORD-2026-88204) berthed at Jeddah Islamic Port. Demurrage free time: 5 days.',
        link: '/shipments',
        isRead: false,
        createdAt: new Date('2026-10-18T09:30:00Z'),
      },
      {
        userId: logisticsUser.id,
        title: 'Customs Clearance Completed: King Abdulaziz Port Dammam',
        message: 'Shipment ORD-2026-88219 cleared SFDA inspection. Release note issued for transfer to LuLu Dammam DC.',
        link: '/shipments',
        isRead: true,
        createdAt: new Date('2026-10-12T16:00:00Z'),
      },
      {
        userId: logisticsDubaiUser.id,
        title: 'Gate Pass Ready: Jebel Ali Container Terminal 2',
        message: 'Consignment ORD-2026-88192 gate pass ready for collection at JAFZA customs gate 4.',
        link: '/shipments',
        isRead: false,
        createdAt: new Date('2026-10-17T11:20:00Z'),
      },
      {
        userId: logisticsDubaiUser.id,
        title: 'Cold Chain Alert: Madrid Maersk ETA Updated',
        message: 'Vessel Madrid Maersk (ORD-2026-88250) scheduled to berth at Jebel Ali on Oct 28.',
        link: '/shipments',
        isRead: true,
        createdAt: new Date('2026-10-16T18:00:00Z'),
      },
      {
        userId: 'usr-onboarding-dxb',
        title: 'Welcome to Allana Customer Export Portal',
        message: 'Your corporate enterprise buyer account is active. Browse the Product Catalog and download official specifications.',
        link: '/catalog',
        isRead: false,
        createdAt: new Date('2026-10-19T08:00:00Z'),
      },
      {
        userId: 'usr-onboarding-dxb',
        title: 'Security Alert: Update Temporary Password',
        message: 'Please update your temporary password to secure your account credentials.',
        link: '/settings/change-password',
        isRead: false,
        createdAt: new Date('2026-10-19T08:05:00Z'),
      },
      // LuLu Group International (HQ) Notifications
      {
        userId: corpDirUser.id,
        title: 'Group Trade Overview: Q4 Shipment Pipeline',
        message: 'Consolidated GCC volume on track with 7 maritime consignments and $3.5M credit facility active.',
        link: '/dashboard',
        isRead: false,
        createdAt: new Date('2026-10-19T09:00:00Z'),
      },
      {
        userId: corpProcUser.id,
        title: 'Custom Product Update: NPD-2026-029',
        message: 'Sensory panel trial for "LuLu Select" 800g Buffalo Patties approved for GCC distribution.',
        link: '/customized-products',
        isRead: false,
        createdAt: new Date('2026-10-18T14:30:00Z'),
      },
      {
        userId: corpFinUser.id,
        title: 'Monthly Financial Audit: Q3 Consolidated Statement Ready',
        message: 'GCC group trade receivables and multi-entity credit aging schedule available for download.',
        link: '/reports',
        isRead: false,
        createdAt: new Date('2026-10-17T10:00:00Z'),
      },
      // LuLu Saudi Hypermarkets Co. (KSA) Notifications
      {
        userId: buyerKsaUser.id,
        title: 'Regulatory Clearance: SFDA Abattoir Renewal Dossier',
        message: 'Indian Ministry of Agriculture veterinary certificate issued for Riyadh Central DC orders.',
        link: '/claims',
        isRead: false,
        createdAt: new Date('2026-10-18T11:15:00Z'),
      },
      {
        userId: financeKsaUser.id,
        title: 'Customs Duty Notice: Jeddah Islamic Port Consignment',
        message: 'SFDA import tax clearance confirmed for reefer container CMAU8192033 (ORD-2026-88204).',
        link: '/reports',
        isRead: false,
        createdAt: new Date('2026-10-18T13:40:00Z'),
      },
      {
        userId: qaKsaUser.id,
        title: 'Cold Chain Alert: Port Inspection Underway',
        message: 'SFDA veterinary temperature deviation inquiry opened for container CMAU8192033.',
        link: '/claims',
        isRead: false,
        createdAt: new Date('2026-10-18T15:00:00Z'),
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
