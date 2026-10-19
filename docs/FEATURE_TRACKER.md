# Feature Progress Tracker & Execution Register

This document serves as the single source of truth for tracking the implementation status of the B2B Export Customer Portal. Use this tracker to record completed vs. pending features as the project progresses feature-by-feature.

---

## 1. Project Implementation Status Overview

| Module | Total Features | Completed | In Progress | Pending | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Module 0: Core Foundation & Tooling** | 3 | 0 | 0 | 3 | 🟡 Ready for Execution |
| **Module 1: Authentication & Multi-Tenancy** | 7 | 0 | 0 | 7 | ⚪ Pending |
| **Module 2: Executive Dashboard & Global Shell** | 5 | 0 | 0 | 5 | ⚪ Pending |
| **Module 3: Product Catalog & Specifications** | 5 | 0 | 0 | 5 | ⚪ Pending |
| **Module 4: Customized Products (NPD)** | 2 | 0 | 0 | 2 | ⚪ Pending |
| **Module 5: Shipment Tracking & Logistics Vault** | 3 | 0 | 0 | 3 | ⚪ Pending |
| **Module 6: Sales Plan & Forecasting** | 3 | 0 | 0 | 3 | ⚪ Pending |
| **Module 7: Financial Reports Center** | 2 | 0 | 0 | 2 | ⚪ Pending |
| **Module 8: Claims & Inquiries Desk** | 4 | 0 | 0 | 4 | ⚪ Pending |
| **Module 9: Notifications & News** | 2 | 0 | 0 | 2 | ⚪ Pending |
| **TOTAL** | **36** | **0** | **0** | **36** | **0% Completed** |

---

## 2. Immediate Focus: Active & Pending Features

Development must proceed sequentially according to foundational dependencies. The current immediate focus is **Module 0: Core Foundation & Tooling**, followed by **Module 1: Authentication & Multi-Tenancy**.

### Step 1: Execute `FEAT-0.1` (Project Setup & Vitest 90% Pipeline)
- Run Next.js 15 App Router setup.
- Configure `vitest.config.ts` with strict per-file 90% threshold.
- Define CSS design tokens in `tokens.css`.

### Step 2: Execute `FEAT-0.2` (Prisma PostgreSQL Schema & Seed)
- Apply schema in `prisma/schema.prisma`.
- Run database migrations.
- Execute `prisma/seed.ts` with Allana B2B meat export mock data.

### Step 3: Execute `FEAT-0.3` (Cloudflare R2 Object Store Client & Mock Seeder)
- Configure `@aws-sdk/client-s3` in `src/lib/r2.ts`.
- Build presigned upload/download API routes.
- Run `scripts/seed-r2.ts` to populate mock spec PDFs, Halal certs, and images.

---

## 3. Detailed Feature-by-Feature Checklist

### Module 0: Core Foundation, Tooling & Infrastructure

- [ ] **FEAT-0.1: Project Setup, Vitest 90% Pipeline & CSS Tokens**
  - [ ] Initialize Next.js 15 App Router with TypeScript.
  - [ ] Configure `vitest.config.ts` with 90% lines, functions, branches, statements per file.
  - [ ] Configure `tests/setup.ts` with `vitest-mock-extended`.
  - [ ] Implement CSS design tokens (`tokens.css`, `globals.css`).
  - [ ] Create `src/lib/utils.ts` and verify >=90% test coverage in `tests/lib/utils.test.ts`.

- [ ] **FEAT-0.2: Prisma PostgreSQL Schema, Migrations & Database Seeder**
  - [ ] Finalize `prisma/schema.prisma` with all models, enums, indexes, and relations.
  - [ ] Run Prisma migration generating PostgreSQL tables.
  - [ ] Implement `prisma/seed.ts` with realistic LuLu, Carrefour, Buffalo cuts, and shipments.
  - [ ] Verify database seeder runs idempotently and populates all tables.

- [ ] **FEAT-0.3: Cloudflare R2 S3 Client, Presigned Routes & Storage Seeder**
  - [ ] Implement S3 client in `src/lib/r2.ts`.
  - [ ] Create `/api/storage/presign-upload` route with Zod validation.
  - [ ] Create `/api/storage/presign-download` route with session verification.
  - [ ] Implement `scripts/seed-r2.ts` and upload mock PDFs and images.
  - [ ] Achieve >=90% test coverage in `tests/lib/r2.test.ts` and `tests/api/storage.test.ts`.

---

### Module 1: Authentication & Multi-Company Tenant Management

- [ ] **FEAT-1.1: Authentication, 2FA Verification & First-Time Reset**
  - [ ] Build `/login` page with credentials authentication.
  - [ ] Implement 2FA verification step for accounts with `twoFactorEnabled: true`.
  - [ ] Enforce redirect to `/settings/change-password` if `isFirstLogin === true`.
  - [ ] Implement `/forgot-password` and password reset token validation.
  - [ ] Write unit tests in `tests/server/auth.actions.test.ts` with >=90% coverage.

- [ ] **FEAT-1.2: Multi-Company Context Switcher with Counterpart Search**
  - [ ] Build header dropdown `CompanySwitcher.tsx` on the top left.
  - [ ] Add `Counterpart:` live search input with search icon (`Q`) to filter subsidiaries in real time.
  - [ ] Set up secure `active_company_id` cookie handler.
  - [ ] Ensure all subsequent queries filter strictly by the active company context.
  - [ ] Write unit tests with >=90% coverage.

- [ ] **FEAT-1.3: User Profile & Account Manager Contact Card**
  - [ ] Build `/settings/profile` page.
  - [ ] Render company profile details (Region, Country, Phone, Email).
  - [ ] Display assigned Allana Export Manager card (Name, Phone, Email).
  - [ ] Render related companies table with expandable row address and "Sign In / Switch" action button.
  - [ ] Write unit tests with >=90% coverage.

- [ ] **FEAT-1.4: Team Members Management with Granular RBAC**
  - [ ] Build `/settings/members` roster table with `EDIT` and `REMOVE` actions.
  - [ ] Create "Add User" form with Name, Surname, Patronymic, Email, Phone, Comment.
  - [ ] Add `Active` and `Two-factor authorization` settings checkboxes.
  - [ ] Add granular permission checkboxes (`Client Management`, `View clients`, `View logs`, catalog, orders, claims, financials).
  - [ ] Enforce RBAC guard in Server Actions (`MANAGE_MEMBERS` permission required).
  - [ ] Write unit tests in `tests/server/members.actions.test.ts` with >=90% coverage.

- [ ] **FEAT-1.5: Security Action Audit Log**
  - [ ] Build `/settings/action-log` page.
  - [ ] Render historical table: Timestamp, Author, Action Type, Description.
  - [ ] Scope log query strictly to active company.
  - [ ] Write unit tests with >=90% coverage.

- [ ] **FEAT-1.6: Logout Confirmation Modal**
  - [ ] Build accessible modal dialog: "Exit from the personal cabinet?".
  - [ ] "No" closes modal; "Yes" invalidates JWT session, clears cookies, redirects to `/login`.
  - [ ] Write unit tests in `tests/components/LogoutModal.test.tsx` with >=90% coverage.

- [ ] **FEAT-1.7: Compliance & Regulatory Licenses Management Desk**
  - [ ] Build `/settings/licenses` compliance view with Account sub-navigation.
  - [ ] Conditionally show in settings and sub-nav if company is Saudi Arabia / regulated jurisdiction.
  - [ ] Render active SFDA permits, issue/expiration dates, and status badges.
  - [ ] Enable presigned Cloudflare R2 download of official certificates.
  - [ ] Add renewal document upload modal to Cloudflare R2.
  - [ ] Write unit tests in `tests/components/LicensesPage.test.tsx` with >=90% coverage.

---

### Module 2: Executive Dashboard & Global Shell

- [ ] **FEAT-2.1: Portal Shell Layout, Header, Notification Bell & Dynamic Footer with Brands**
  - [ ] Implement responsive shell in `src/app/(portal)/layout.tsx`.
  - [ ] Build top navigation links with active route indicator.
  - [ ] Build Notification Bell with unread counter and popover list with deep links.
  - [ ] Build Brand Showcase strip above footer (`BrandShowcase.tsx`) with Allana brands.
  - [ ] Build Footer with User Manual PDF download link, terms, and Help & Support link.
  - [ ] Write unit tests with >=90% coverage across Header and Footer.

- [ ] **FEAT-2.2: Financial KPI Cards & Multi-Sales Org Selector**
  - [ ] Build `FinancialCards.tsx` (Credit Limit, Receivables, Overdue, Available with positive green and negative deficit red styling).
  - [ ] Build `SalesOrgSelector.tsx` dropdown.
  - [ ] Update card metrics on sales org change via Server Action.
  - [ ] Write unit tests with >=90% coverage.

- [ ] **FEAT-2.3: Recent Shipments Widget (Last 3 Months)**
  - [ ] Build `RecentShipmentsWidget.tsx` displaying shipments where `createdAt >= now - 90 days`.
  - [ ] Render Order ID, Quantity MT, Amount USD, Status badge.
  - [ ] Add direct "Details" link to `/shipments/[id]` and `All Shipments >` header link.
  - [ ] Write unit tests with >=90% coverage.

- [ ] **FEAT-2.4: Hero Announcement Slider & News Cards**
  - [ ] Build `HeroSlider.tsx` with auto-play and manual navigation controls.
  - [ ] Build `NewsGrid.tsx` rendering 4 latest news cards with `All News >` header link.
  - [ ] Write unit tests with >=90% coverage.

- [ ] **FEAT-2.5: Contextual Action Alert Banner (Shipments Updates & License Expiry Alerts)**
  - [ ] Build `LicenseAlertBanner.tsx` directly beneath hero slider.
  - [ ] Trigger Shipments Alert ("Dear Partner, We have some shipments updates for you...") with `See my shipments` button.
  - [ ] Trigger License Warning if active company license expires within 30 days ("Please, notice: Your licence document will expire in 2 weeks.") with `See my licenses` button.
  - [ ] Write unit tests with >=90% coverage.

---

### Module 3: Digital Product Catalog & Specifications

- [ ] **FEAT-3.1: Live Instant Autocomplete Search with Rich Cut & Article Previews**
  - [ ] Build `CatalogSearch.tsx` with debounced input and clear `X` button.
  - [ ] Bold matched query characters in dropdown preview.
  - [ ] Display Cut Name, secondary packaging format, brand name, and `Article: XXXX` tag.
  - [ ] Write unit tests with >=90% coverage.

- [ ] **FEAT-3.2: Catalog Landing Page, Multi-Facet Filter Engine & Anatomical Cut Pills**
  - [ ] Build `CatalogLanding.tsx` with 4 category hero blocks (Further Processing, Frozen Buffalo, New Products, Customized Products) and Brand showcase strip.
  - [ ] Handle "This part is under development" notice for incomplete categories.
  - [ ] Build collapsible `FilterSidebar.tsx` (Category, Subcategory, Primary package, Product state [BF, IQF, IPBF, BQF], Brand).
  - [ ] Build `SubcategoryPills.tsx` with anatomical carcass cut diagram icons.
  - [ ] Implement removable active filter tags (`[X]`) and solid green `Clear All` button.
  - [ ] Sync filter parameters with browser URL query string.
  - [ ] Write unit tests with >=90% coverage.

- [ ] **FEAT-3.3: Catalog Grid / List Toggle, Sorting, Dual Pagination & Disclaimer Banner**
  - [ ] Build `CatalogViewControls.tsx` (Card Grid vs Table List toggle with green indicator).
  - [ ] Implement page size selector (12, 24, All).
  - [ ] Build dual pagination: `Load More Products` button (with circular reload icon) and numbered `< 1 2 >` controls.
  - [ ] Display official incomplete characteristics disclaimer banner ("Attention: the presented list of products and their characteristics are incomplete...").
  - [ ] Write unit tests with >=90% coverage.

- [ ] **FEAT-3.4: Product Detail Page (PDP): Breadcrumbs, Packaging Switcher & 10-Column Logistics Specs**
  - [ ] Build clickable breadcrumb trail: `Home -> Catalog -> Category -> Subcategory -> Product Name`.
  - [ ] Build interactive `Packaging` row (`PackagingSwitcher.tsx`) switching preview images.
  - [ ] Render 10-column logistics spec table (SKU, Nett weight, Primary package, Cut size, Packages/carton, Carton weight, Dimensions, Shelf life, Storage conditions, Freezing type).
  - [ ] Render Reefer Container Loading Pattern calculator.
  - [ ] Render Halal, ISO 22000, HACCP, and SFDA certification badges.
  - [ ] Handle "Product under development" state with custom request prompt.
  - [ ] Write unit tests with >=90% coverage.

- [ ] **FEAT-3.5: Dynamic Branded PDF Spec Sheet Exporter**
  - [ ] Implement server-side PDF generator in `src/lib/pdf.ts`.
  - [ ] Build route handler `/api/catalog/[slug]/spec-sheet`.
  - [ ] Verify PDF layout and download headers.
  - [ ] Write unit tests with >=90% coverage.

---

### Module 4: Customized Product Requests (NPD Engine)

- [ ] **FEAT-4.1: Custom Product Request Creation Wizard**
  - [ ] Build `/customized-products/new` multi-step form.
  - [ ] Implement meat processing checkboxes: Calibrated, Marinated, Boneless, Skinless, Has Specification.
  - [ ] Implement Freezing type (Block frozen, IQF, Chilled) and Estimated FCA price per ton ($).
  - [ ] Implement direct Cloudflare R2 file upload for packaging artwork/specs.
  - [ ] Validate inputs with Zod and generate `NPD-YYYY-XXX` ticket.
  - [ ] Write unit tests with >=90% coverage.

- [ ] **FEAT-4.2: NPD Status Lifecycle & Feedback Dashboard**
  - [ ] Build `/customized-products` status tracking table under `Recent Orders`.
  - [ ] Render columns: `TICKET ID` (with Details link), `BRIEF DESCRIPTION`, `CREATED AT`, `STATUS`.
  - [ ] Implement 4-stage visual progress timeline (`In Review` → `Analysis` → `Accepted` / `Declined`).
  - [ ] Display manager comments and technical feedback notes.
  - [ ] Write unit tests with >=90% coverage.

---

### Module 5: Shipment Tracking & Logistics Document Vault

- [ ] **FEAT-5.1: Shipment List Filter Bar, Sorter & Found Records Counter**
  - [ ] Build `/shipments` filter bar (Period calendar date range, Sales Org, Country, Ship-To).
  - [ ] Render `Found X records` counter.
  - [ ] Support multi-column sorting (Order ID, Quantity MT, Amount USD, Status) with sort direction toggle icon.
  - [ ] Write unit tests with >=90% coverage.

- [ ] **FEAT-5.2: Two-Level Hierarchical Drilldown with GPS Pin & Hide Details**
  - [ ] Level 1: Expand order row to show reefer containers, sea line, destination port, shipping date, ETD/ETA.
  - [ ] Toggle row action link text dynamically between `Details` and `Hide Details`.
  - [ ] Render green location/GPS pin icon next to `Container No`.
  - [ ] Level 2: Expand cargo item lines via `v X SKU` button to show product photo, cut name, weight KG, amount USD.
  - [ ] Write unit tests with >=90% coverage.

- [ ] **FEAT-5.3: Cloudflare R2 Logistics Document Vault**
  - [ ] Build `DocumentVault.tsx` component inside shipment detail.
  - [ ] Fetch time-limited presigned download URLs for Bill of Lading, Vet Cert, Halal Cert.
  - [ ] Enforce `DOWNLOAD_DOCUMENTS` RBAC permission.
  - [ ] Write unit tests with >=90% coverage.

---

### Module 6: Sales Plan & Supply Chain Forecasting

- [ ] **FEAT-6.1: Sales Plan Filter Bar & UOM Toggle**
  - [ ] Build `/sales-plan` filter bar (Month, Year, Sales Org, Country, Ship-To).
  - [ ] Build UOM toggle (Metric Tonnes vs Currency USD).
  - [ ] Write unit tests with >=90% coverage.

- [ ] **FEAT-6.2: Multi-Tier Grouping Grid with LAST MONTH TRANSFER & SKU Tree**
  - [ ] Implement hierarchical table: Country → Ship-To Party → SKU.
  - [ ] Render columns: `TARGET`, `LAST MONTH TRANSFER`, `SHIPPED`, `ORDER IN THE PIPELINE`, `DELTA BETWEEN TARGET AND SHIPPED`.
  - [ ] Add `v X SKU` expander button under each Ship-To party.
  - [ ] Expand cut lines displaying `Code`, `Name`, and line-level metrics.
  - [ ] Add `Sort by: Country A-Z` with sort direction icon.
  - [ ] Write unit tests with >=90% coverage.

- [ ] **FEAT-6.3: Forecast Metrics Calculator**
  - [ ] Calculate Target, Last Month Balance, Shipped, Pipeline, and Delta.
  - [ ] Apply conditional styling (green for surplus, red for deficit).
  - [ ] Write unit tests with 100% test coverage.

---

### Module 7: Financial Reports Center

- [ ] **FEAT-7.1: Statement of Account Report Generator (Date Range, PDF/Excel & Email)**
  - [ ] Build Statement of Account request card with calendar date range picker (`Period`).
  - [ ] Implement `Additional e-mail` field for secondary recipient dispatch with explanatory note.
  - [ ] Action buttons: "Download PDF" and "Download Excel" directly export `.pdf` and `.xlsx` reports.
  - [ ] "Send to e-mail" button triggers background compilation and dual email transmission.
  - [ ] Write unit tests with >=90% coverage.

- [ ] **FEAT-7.2: Accounts Receivables Aging Report (Aging Buckets & PDF/Excel Export)**
  - [ ] Build Receivables report card with as-of date selector in the `Period` field.
  - [ ] Implement `Additional e-mail` input field for secondary recipient.
  - [ ] Calculate aging brackets: Current, 1–30, 31–60, 61–90, >90 Days overdue.
  - [ ] Action buttons: "Download Excel" and "Download PDF" export `.xlsx` and `.pdf` files.
  - [ ] "Send to e-mail" button dispatches aging report to primary and secondary emails.
  - [ ] Write unit tests with >=90% coverage.

---

### Module 8: Customer Claims & Inquiries Desk

- [ ] **FEAT-8.1: Claims & Complaints Ticket Dashboard with In-Place Row Preview**
  - [ ] Build `/claims` list view with `Claim Form` and `Info Request` top buttons.
  - [ ] Implement in-place expandable row (`>`) displaying Category of request, Answer panel, status, and product items table with Vehicle number.
  - [ ] Filter by date period, sort by Ticket ID/Date, and show count (12, 24).
  - [ ] Write unit tests with >=90% coverage.

- [ ] **FEAT-8.2: Comprehensive Quality Claim Form**
  - [ ] Build `/claims/new-claim` form with auto-filled personal data (email locked).
  - [ ] Add banner "Please create one request for one separate complaint".
  - [ ] Auto-populate Product Name when entering Product Article.
  - [ ] Support up to 10 product lines with 4-decimal weight precision (`00.0000`).
  - [ ] Implement Cloudflare R2 evidence file upload up to 20MB (temp logger data, damage photos).
  - [ ] Support semicolon-separated additional emails.
  - [ ] Generate `CLM-YYYY-XXXX` and write unit tests with >=90% coverage.

- [ ] **FEAT-8.3: Info Request Form with Hierarchical Dynamic Category Tree**
  - [ ] Build `/claims/new-request` form with left category tree (Questionnaire, Provision of Documents, Other requests).
  - [ ] Dynamic sub-forms: Specification request, Expiration of Shelf Life extension request (`dd-mm-yyyy`, volume kg, reasons).
  - [ ] Write unit tests with >=90% coverage.

- [ ] **FEAT-8.4: Claim Detail View & Manager Resolution**
  - [ ] Build `/claims/[id]` immutable detail view.
  - [ ] Render submitted evidence files with presigned download links.
  - [ ] Display official manager response thread and credit note status.
  - [ ] Write unit tests with >=90% coverage.

---

### Module 9: Real-Time Notifications & News Feed

- [ ] **FEAT-9.1: In-App Notification Center with Exact Milestones & Check All**
  - [ ] Build notification drawer with unread badges and red dot indicators.
  - [ ] Format timestamps as `DD.MM.YYYY HH:MM:SS`.
  - [ ] Implement shipment arrival alerts at exactly 2 milestones: 14 days before ETA and on docking day.
  - [ ] Add `Show only unread` toggle switch and individual message mark-read checkboxes.
  - [ ] Add `Check all` master checkbox at bottom right.
  - [ ] Include deep links in notification body (`Claim Request`, `Shipments`, `Licenses`).
  - [ ] Write unit tests with >=90% coverage.

- [ ] **FEAT-9.2: News & Market Updates Article Reader**
  - [ ] Build `/news` card listing and `/news/[slug]` rich article view.
  - [ ] Include back navigation and related articles.
  - [ ] Write unit tests with >=90% coverage.

---

## 4. Verification & Midway Validation Protocol

Before marking any feature as `[x] COMPLETED`:
1. **Unit Test Gate**: Run `npm test` and verify that the file-level coverage report meets or exceeds **90% coverage** for lines, statements, functions, and branches across all touched files.
2. **Type Check Gate**: Run `npx tsc --noEmit` to ensure zero TypeScript errors.
3. **Database Integrity Gate**: Validate that Prisma migrations apply cleanly and queries strictly respect active `companyId` boundaries.
4. **Storage Security Gate**: Verify that files uploaded to Cloudflare R2 are only accessible via time-limited presigned URLs with valid session credentials.
