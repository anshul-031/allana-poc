# Feature Breakdown, Acceptance Criteria & Shorter Execution Prompts

This document breaks down the development of the B2B Export Portal into isolated, incremental features. Each feature includes:
1. **Scope & Technical Files**
2. **Exhaustive Acceptance Criteria**
3. **Unit Test Requirements (Strict 90% Per-File Coverage)**
4. **Short Copy-Paste Execution Prompt** (formatted for instant use by an AI coding agent or developer).

---

## Table of Modules

- **Module 0: Core Foundation, Tooling & Infrastructure**
  - `FEAT-0.1`: Project Setup, Vitest 90% Pipeline & CSS Design System
  - `FEAT-0.2`: Prisma PostgreSQL Schema, Migrations & Database Seeder
  - `FEAT-0.3`: Cloudflare R2 S3 Client, Presigned Upload/Download & Storage Seeder
- **Module 1: Authentication & Multi-Company Tenant Management**
  - `FEAT-1.1`: Authentication, Mandatory First-Time Password Reset & Welcome Flow
  - `FEAT-1.2`: Multi-Company Context Switcher with Counterpart Search
  - `FEAT-1.3`: User Profile & Account Manager Contact Card
  - `FEAT-1.4`: Team Members Management with Granular RBAC Permissions
  - `FEAT-1.5`: Security Action Audit Log
  - `FEAT-1.6`: Logout Confirmation Modal
  - `FEAT-1.7`: Compliance & Regulatory Licenses Management Desk (SFDA Saudi Arabia)
- **Module 2: Executive Dashboard & Global Layout**
  - `FEAT-2.1`: Portal Global Layout, Header, Notification Bell & Dynamic Footer
  - `FEAT-2.2`: Financial KPI Cards & Multi-Sales Organization Selector
  - `FEAT-2.3`: Recent Shipments Widget (Last 3 Months) with Fast Drilldown
  - `FEAT-2.4`: Hero Announcement Slider & News Cards
  - `FEAT-2.5`: Contextual Action Alert Banner (Shipments Updates & License Expiry Alerts)
- **Module 3: Digital Product Catalog & Specifications**
  - `FEAT-3.1`: Live Instant Autocomplete Search
  - `FEAT-3.2`: Multi-Facet Filter Engine (Category, Subcategory, Packaging, State, Brand)
  - `FEAT-3.3`: Catalog Grid / List Toggle, Sorting & Pagination (12, 24, All)
  - `FEAT-3.4`: Product Detail Page (PDP): High-Res Visuals, Technical Specs, Pallet Loading
  - `FEAT-3.5`: Dynamic Branded PDF Spec Sheet Exporter
- **Module 4: Customized Product Requests (NPD Engine)**
  - `FEAT-4.1`: Custom Product Request Wizard (Cuts, Recipe, Retail Packaging, R2 Artwork)
  - `FEAT-4.2`: NPD Status Lifecycle (`In Review` → `Analysis` → `Accepted` → `Declined`)
- **Module 5: Shipment Tracking & Logistics Document Vault**
  - `FEAT-5.1`: Shipment List Filter Bar (Period, Sales Org, Country, Ship-To) & Sorter
  - `FEAT-5.2`: Two-Level Hierarchical Drilldown (Order → Reefer Containers → Cargo Items)
  - `FEAT-5.3`: Cloudflare R2 Logistics Document Vault (Presigned BL, Vet, Halal, CIPL)
- **Module 6: Sales Plan & Supply Chain Forecasting**
  - `FEAT-6.1`: Sales Plan Filter Bar (Month/Year, Sales Org, Country, Ship-To, UOM)
  - `FEAT-6.2`: Multi-Tier Grouping Grid (Country → Ship-To Party → SKU Breakdown)
  - `FEAT-6.3`: Forecast Metrics Calculator (Target, Rollover, Shipped, Pipeline, Delta)
- **Module 7: Financial Reports Center**
  - `FEAT-7.1`: Statement of Account Report Generator (Date Range, On-Demand PDF & Email Dispatch)
  - `FEAT-7.2`: Accounts Receivables Aging Report (Aging Buckets: Current, 1-30, 31-60, 61-90, >90 Days)
- **Module 8: Customer Claims & Inquiries Desk**
  - `FEAT-8.1`: Claims & Complaints Ticket Dashboard (Filter by status, search by Claim No)
  - `FEAT-8.2`: Comprehensive Quality Claim Form (Dynamic Multi-Product Lines & R2 Upload)
  - `FEAT-8.3`: General Information & Certificate Request Form
  - `FEAT-8.4`: Claim Detail View, Immutable Audit Log & Manager Resolution Response
- **Module 9: Real-Time Notifications & News Feed**
  - `FEAT-9.1`: In-App Notification Center (Arrival 14d & Docking alerts, NPD, Claims, Licenses)
  - `FEAT-9.2`: News & Market Updates Article Reader

---

## Detailed Feature Specifications & Short Prompts

### Module 0: Foundation & Infrastructure

#### `FEAT-0.1`: Project Setup, Vitest 90% Pipeline & CSS Design System
- **Scope**: Initialize Next.js 15 TypeScript project with App Router, configure Vitest testing harness with strict 90% per-file coverage enforcement across lines/functions/branches/statements, and set up the CSS token system (`globals.css`, `tokens.css`).
- **Files**: `package.json`, `tsconfig.json`, `vitest.config.ts`, `tests/setup.ts`, `src/styles/tokens.css`, `src/styles/globals.css`, `src/lib/utils.ts`, `tests/lib/utils.test.ts`.
- **Acceptance Criteria**:
  1. `npm test` runs Vitest with jsdom environment and passes.
  2. Coverage report generates with threshold `thresholds: { lines: 90, functions: 90, branches: 90, statements: 90, perFile: true }`.
  3. `src/lib/utils.ts` contains currency formatting (`formatUSD`), date formatting (`formatDate`), and classname merger with 100% unit test coverage in `tests/lib/utils.test.ts`.
  4. CSS tokens define colors (Navy `#0A192F`, Gold `#C5A059`, Slate `#1E293B`, Emerald `#10B981`, Rose `#EF4444`), typography (Inter/Outfit), and card elevation shadows.
- **Short Prompt**:
```text
Implement FEAT-0.1: Initialize Next.js 15 App Router project structure with TypeScript, Vitest unit test configuration with 90% per-file coverage enforcement in vitest.config.ts, CSS design system in src/styles/tokens.css and src/styles/globals.css, and utility helpers in src/lib/utils.ts with unit tests in tests/lib/utils.test.ts achieving >=90% coverage.
```

---

#### `FEAT-0.2`: Prisma PostgreSQL Schema, Migrations & Database Seeder
- **Scope**: Implement complete Prisma schema in `prisma/schema.prisma` and comprehensive seed script in `prisma/seed.ts` with realistic Allana export data (LuLu Group, Carrefour, Buffalo cuts, reefer containers, financials, NPD, claims).
- **Files**: `prisma/schema.prisma`, `prisma/seed.ts`, `src/lib/prisma.ts`.
- **Acceptance Criteria**:
  1. `prisma/schema.prisma` compiles without errors and includes all models, enums, relations, and cascade delete rules.
  2. `prisma/seed.ts` executes and seeds 3 companies (LuLu HQ, LuLu Dubai, LuLu Riyadh), 3 sales orgs, 6 users (Buyer, Procurement, Finance, Logistics, QA, Admin), 9 buffalo/meat SKUs, 2 shipments with reefer containers, 2 NPD requests, 1 claim with line items, and SFDA compliance licenses.
  3. `src/lib/prisma.ts` exports a singleton Prisma client.
- **Short Prompt**:
```text
Implement FEAT-0.2: Create complete Prisma schema in prisma/schema.prisma and realistic B2B meat export seed script in prisma/seed.ts with singleton client in src/lib/prisma.ts. Seed LuLu Group, Allana Buffalo cuts (Silverside, Topside, Tenderloin), reefer containers, financial limits, NPD requests, and claims.
```

---

#### `FEAT-0.3`: Cloudflare R2 S3 Client, Presigned Upload/Download & Storage Seeder
- **Scope**: Implement Cloudflare R2 integration using `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` for direct browser-to-R2 presigned PUT uploads and secure presigned GET downloads. Add unit tests with deep mocking and an automated storage seeder script.
- **Files**: `src/lib/r2.ts`, `src/app/api/storage/presign-upload/route.ts`, `src/app/api/storage/presign-download/route.ts`, `scripts/seed-r2.ts`, `tests/lib/r2.test.ts`, `tests/api/storage.test.ts`.
- **Acceptance Criteria**:
  1. `createPresignedUploadUrl(key, contentType)` returns valid signed PUT URL and key with 5-minute expiry.
  2. `createPresignedDownloadUrl(key)` returns valid signed GET URL with 15-minute expiry.
  3. API route `/api/storage/presign-upload` validates session and file metadata with Zod, rejecting unauthorized mime types.
  4. Unit tests in `tests/lib/r2.test.ts` and `tests/api/storage.test.ts` achieve >=90% branch and line coverage using `vitest-mock-extended`.
- **Short Prompt**:
```text
Implement FEAT-0.3: Create Cloudflare R2 client and presigning functions in src/lib/r2.ts, API routes in src/app/api/storage/presign-upload/route.ts and presign-download/route.ts, mock asset seeder in scripts/seed-r2.ts, and unit tests in tests/lib/r2.test.ts with >=90% test coverage.
```

---

### Module 1: Authentication & Multi-Company Tenant Management

#### `FEAT-1.1`: Authentication, 2FA Verification & Mandatory First-Time Password Reset
- **Scope**: User authentication with credentials provider, session management with JWT, optional Two-Factor Authentication (2FA) code verification if user has `twoFactorEnabled === true`, and mandatory redirection to `/settings/change-password` if `isFirstLogin === true`.
- **Files**: `src/app/(auth)/login/page.tsx`, `src/app/(auth)/2fa/page.tsx`, `src/app/(auth)/forgot-password/page.tsx`, `src/app/(portal)/settings/change-password/page.tsx`, `src/server/actions/auth.actions.ts`, `src/lib/auth.ts`, `tests/server/auth.actions.test.ts`.
- **Acceptance Criteria**:
  1. User logs in with email and password.
  2. If user has `twoFactorEnabled: true`, prompts for 6-digit TOTP / email verification code before granting session.
  3. If `isFirstLogin` is true, user is blocked from accessing the portal and redirected to password change screen.
  4. Changing password updates `passwordHash`, sets `isFirstLogin: false`, logs an `ActionLog` entry, and requires re-login with the new password.
  5. Forgot password generates a time-limited token and sends a reset email (mocked).
  6. Unit tests for `auth.actions.ts` achieve >=90% coverage.
- **Short Prompt**:
```text
Implement FEAT-1.1: Build login, two-factor authentication (2FA) verification, forgot password, and mandatory first-time password reset flow in Next.js App Router using src/server/actions/auth.actions.ts. Ensure twoFactorEnabled prompts for code and isFirstLogin forces password update. Write unit tests in tests/server/auth.actions.test.ts with >=90% coverage.
```

---

#### `FEAT-1.2`: Multi-Company Context Switcher with Counterpart Search
- **Scope**: Global dropdown in the header on the left allowing users belonging to a parent organization (e.g., LuLu Group) to switch active company context between subsidiaries (LuLu Dubai, LuLu Riyadh, LuLu Egypt). Dropdown features a dedicated real-time search field labeled `Counterpart:` with a magnifying glass search icon (`Q`) to filter subsidiaries. Persists active company in a secure cookie and refreshes all page data.
- **Files**: `src/components/common/CompanySwitcher.tsx`, `src/server/actions/company.actions.ts`, `src/lib/company-context.ts`, `tests/components/CompanySwitcher.test.tsx`, `tests/server/company.actions.test.ts`.
- **Acceptance Criteria**:
  1. Header shows current active company name and country flag/indicator on the top left.
  2. Dropdown flyout features a search input labeled `Counterpart:` with magnifying glass icon `Q` that filters companies in real time.
  3. Dropdown lists all subsidiaries linked via `parentCompanyId` matching the filter.
  4. Clicking a company updates the `active_company_id` cookie and triggers server revalidation of all dashboard, shipment, and financial data.
  5. Non-admin users without cross-subsidiary permissions cannot switch to unauthorized entities.
  6. Unit tests achieve >=90% coverage.
- **Short Prompt**:
```text
Implement FEAT-1.2: Build Related Companies switcher in src/components/common/CompanySwitcher.tsx and src/server/actions/company.actions.ts with a 'Counterpart:' live search input and icon, allowing parent company users to filter and switch context between subsidiaries via a secure cookie, revalidating data. Write unit tests with >=90% coverage.
```

---

#### `FEAT-1.3`: User Profile & Account Manager Contact Card
- **Scope**: Profile page displaying company information (name, region, country, phone, email), assigned Allana Account Manager contact card (name, email, phone with quick click-to-email and click-to-call), and table of related companies with expandable row details (name, region, telephone, email) and "Sign In" switch button.
- **Files**: `src/app/(portal)/settings/profile/page.tsx`, `src/components/profile/ManagerContactCard.tsx`, `src/components/profile/RelatedCompaniesTable.tsx`, `tests/components/Profile.test.tsx`.
- **Acceptance Criteria**:
  1. Displays full company registration details.
  2. Highlights assigned Allana Export Manager with photo/avatar, direct phone, and email.
  3. Lists all related entities in a table with Country, Manager, and expandable details arrow showing regional address and email.
  4. Direct "Sign In" button switches active company context.
  5. Unit tests achieve >=90% coverage.
- **Short Prompt**:
```text
Implement FEAT-1.3: Build customer Profile page in src/app/(portal)/settings/profile/page.tsx with company details, assigned Allana Export Manager contact card, and related companies table with expandable rows and Sign In switch button. Write unit tests with >=90% coverage.
```

---

#### `FEAT-1.4`: Team Members Management with Granular RBAC Permissions
- **Scope**: User management page allowing company admins to view member roster, invite new users with detailed name fields (Name, Surname, Patronymic, Email, Phone, Comment), settings toggles (`Active`, `Two-factor authorization`), and permission checkboxes (`Client Management`, `View clients`, `View logs`, `View Catalog`, `Order Custom Product`, `View Shipments`, `View Financials`, `Submit Claims`, `View Reports`, `Download Documents`), edit existing permissions, and remove users with confirmation.
- **Files**: `src/app/(portal)/settings/members/page.tsx`, `src/components/members/AddMemberModal.tsx`, `src/components/members/EditMemberModal.tsx`, `src/components/members/DeleteMemberModal.tsx`, `src/server/actions/members.actions.ts`, `src/server/validators/member.schema.ts`, `tests/server/members.actions.test.ts`.
- **Acceptance Criteria**:
  1. Displays members table: Email, Phone, First Name, Created Date, Actions (`EDIT`, `REMOVE`).
  2. "Add User" form has fields: Name, Surname, Patronymic, Email, Phone, Comment, Settings: Active and Two-factor authorization checkboxes, Permissions checkboxes.
  3. "Remove" button opens confirmation modal, soft-deletes/deactivates user, and logs an action in `ActionLog`.
  4. Enforces RBAC guard: only users with `MANAGE_MEMBERS` or `CLIENT_MANAGEMENT` can mutate users.
  5. Unit tests in `tests/server/members.actions.test.ts` achieve >=90% coverage.
- **Short Prompt**:
```text
Implement FEAT-1.4: Build Team Members management page in src/app/(portal)/settings/members/page.tsx with Add/Edit/Delete modals, Name/Surname/Patronymic/Comment fields, 2FA and Active checkboxes, and granular permission checkboxes. Enforce RBAC in src/server/actions/members.actions.ts with audit logging. Write unit tests with >=90% coverage.
```

---

#### `FEAT-1.5`: Security Action Audit Log
- **Scope**: Chronological audit trail page displaying all administrative operations performed on company users (User Created, Permissions Updated, User Deactivated, Password Changed).
- **Files**: `src/app/(portal)/settings/action-log/page.tsx`, `src/components/settings/ActionLogTable.tsx`, `src/server/actions/audit.actions.ts`, `tests/server/audit.actions.test.ts`.
- **Acceptance Criteria**:
  1. Table displays Date/Time, Author Name & Email, Action Type, and Comment Description.
  2. Server action fetches logs scoped strictly to the current active company.
  3. Supports pagination and date range filtering.
  4. Unit tests achieve >=90% coverage.
- **Short Prompt**:
```text
Implement FEAT-1.5: Build Security Action Log page in src/app/(portal)/settings/action-log/page.tsx showing audit trail of user management actions with author, date, and description. Write unit tests with >=90% coverage.
```

---

#### `FEAT-1.6`: Logout Confirmation Modal
- **Scope**: Confirmation modal triggered when user selects "Logout" from the settings gear menu, prompting "Exit from the personal cabinet?" with "Yes" and "No" buttons.
- **Files**: `src/components/common/LogoutModal.tsx`, `tests/components/LogoutModal.test.tsx`.
- **Acceptance Criteria**:
  1. Clicking Logout opens accessible modal dialog with backdrop blur.
  2. Modal header/text: "Exit from the personal cabinet?".
  3. Clicking "No" or pressing Escape dismisses the modal without logging out.
  4. Clicking "Yes" terminates the session, clears cookies, and redirects to `/login`.
  5. Unit tests achieve >=90% coverage.
- **Short Prompt**:
```text
Implement FEAT-1.6: Build Logout confirmation modal in src/components/common/LogoutModal.tsx prompting 'Exit from the personal cabinet?' with Yes/No buttons and session invalidation. Write unit tests with >=90% coverage.
```

---

#### `FEAT-1.7`: Compliance & Regulatory Licenses Management Desk (SFDA & Regulated Jurisdictions)
- **Scope**: Dedicated compliance desk in `/settings/licenses` accessible conditionally from the Settings gear menu and the persistent Account sub-navigation header (`Back to Dashboard` | `Profile` | `Members List` | `Licenses` | `Action Log` | `Password`) when the user's country is Saudi Arabia or another regulated jurisdiction. Displays active permits, issuing authority (e.g. SFDA), issue/expiry dates, days remaining, presigned R2 downloads of official approval certs, and renewed permit upload.
- **Files**: `src/app/(portal)/settings/licenses/page.tsx`, `src/components/settings/AccountSubNav.tsx`, `src/components/settings/LicenseCard.tsx`, `src/server/actions/licenses.actions.ts`, `tests/components/LicensesPage.test.tsx`, `tests/server/licenses.actions.test.ts`.
- **Acceptance Criteria**:
  1. If `activeCompany.country === 'Saudi Arabia'` or regulated jurisdiction, Settings dropdown and Account sub-nav show `Licenses` link.
  2. Account sub-navigation renders: `Back to Dashboard`, `Profile`, `Members List`, `Licenses`, `Action Log`, `Password`.
  3. Displays active compliance licenses: License Name, License Number, Authority, Issue Date, Expiry Date, and status badge (`ACTIVE`, `EXPIRING_SOON`, `EXPIRED`).
  4. Includes secure presigned Cloudflare R2 download button for official approval PDFs.
  5. Includes modal to upload renewed compliance certificate directly to R2.
  6. Unit tests achieve >=90% coverage.
- **Short Prompt**:
```text
Implement FEAT-1.7: Build Compliance & Regulatory Licenses Management desk in src/app/(portal)/settings/licenses/page.tsx with persistent Account sub-navigation bar (Back to Dashboard, Profile, Members List, Licenses, Action Log, Password), SFDA license expiry tracking, presigned R2 document downloads, renewal certificate upload, and country-based conditional visibility. Write unit tests with >=90% coverage.
```

---

### Module 2: Executive Dashboard & Global Layout

#### `FEAT-2.1`: Portal Global Layout, Header, Notification Bell & Dynamic Footer with Brand Portfolio
- **Scope**: Build primary portal shell layout with responsive navigation bar (Dashboard, Products Catalog, Customized Product, Shipments List, Sales Plan, Reports, News, Claims and Requests), active company selector, notification bell with unread badge and dropdown menu, user settings menu, brand showcase strip (`Allana`, `Al-Tamam`, `OMAR`, `Premium Gold`), and dynamic footer with copyright, social links (Twitter/X, Facebook, LinkedIn), and functional links (`General terms and conditions`, `Manual` PDF download, `Help & Support`).
- **Files**: `src/app/(portal)/layout.tsx`, `src/components/common/Header.tsx`, `src/components/common/NotificationBell.tsx`, `src/components/common/BrandShowcase.tsx`, `src/components/common/Footer.tsx`, `tests/components/Header.test.tsx`, `tests/components/Footer.test.tsx`.
- **Acceptance Criteria**:
  1. Header links highlight the active route with blue indicator.
  2. Notification bell displays count of unread notifications and opens popover listing recent alerts with unread red dots and deep entity links.
  3. Clicking outside closes the notification popover and settings menu.
  4. Brand showcase strip renders above footer displaying Allana export brand logos (`Allana`, `Al-Tamam`, `OMAR`, `Premium Gold`).
  5. Footer contains copyright (`© Allanasons Private Limited 2026`), social media links, `Manual` (download User Manual PDF from R2), `General terms and conditions`, and `Help & Support` link.
  6. Unit tests achieve >=90% coverage across Header and Footer components.
- **Short Prompt**:
```text
Implement FEAT-2.1: Build authenticated portal shell layout in src/app/(portal)/layout.tsx with top navigation Header, NotificationBell with unread counter popover, user settings dropdown, BrandShowcase strip above footer, and Footer with terms, user manual download, and Help & Support links. Write unit tests with >=90% coverage.
```

---

#### `FEAT-2.2`: Financial KPI Cards & Multi-Sales Organization Selector
- **Scope**: Financial indicators widget on dashboard showing Credit Limit, Receivables, Overdue Receivables, and Available Limit in USD, with a dropdown selector for clients with multiple sales organizations. Available Limit supports negative values (deficit) when receivables exceed credit limit.
- **Files**: `src/components/dashboard/FinancialCards.tsx`, `src/components/dashboard/SalesOrgSelector.tsx`, `src/server/actions/financials.actions.ts`, `tests/components/FinancialCards.test.tsx`.
- **Acceptance Criteria**:
  1. Renders 4 cards: Credit Limit, Receivables, Overdue Receivables, Available Limit.
  2. Overdue Receivables highlights in red/amber if > 0.
  3. Available Limit is formatted with positive green styling when >= 0, and critical red deficit styling when negative (e.g., `-$272,796.96 USD`).
  4. Switching Sales Organization dropdown updates the KPI card numbers instantly via Server Action.
  5. Unit tests achieve >=90% coverage.
- **Short Prompt**:
```text
Implement FEAT-2.2: Build Financial KPI widget in src/components/dashboard/FinancialCards.tsx and SalesOrgSelector.tsx displaying Credit Limit, Receivables, Overdue Receivables, and Available Limit (with positive green styling and negative deficit red styling) with multi-sales org switching. Write unit tests with >=90% coverage.
```

---

#### `FEAT-2.3`: Recent Shipments Widget (Last 3 Months) with Fast Drilldown
- **Scope**: Dashboard widget displaying shipments dispatched or delivered within the last 3 months, showing Order ID, Quantity (MT), Amount ($), Status badge, and a "Details" button linking directly to the full shipment view.
- **Files**: `src/components/dashboard/RecentShipmentsWidget.tsx`, `tests/components/RecentShipmentsWidget.test.tsx`.
- **Acceptance Criteria**:
  1. Loads shipments for active company where `createdAt >= now - 90 days`.
  2. Table displays: Order ID, Quantity (MT), Amount ($), Status badge (In Transit, Arrived Port, etc.).
  3. Clicking "Details" navigates to `/shipments/[id]`.
  4. Empty state displayed gracefully if no shipments in 3 months.
  5. Unit tests achieve >=90% coverage.
- **Short Prompt**:
```text
Implement FEAT-2.3: Build Recent Shipments (last 3 months) widget in src/components/dashboard/RecentShipmentsWidget.tsx with status badges and quick drilldown links. Write unit tests with >=90% coverage.
```

---

#### `FEAT-2.4`: Hero Announcement Slider & News Cards
- **Scope**: Dashboard hero banner carousel/slider showcasing strategic announcements and a 4-card grid displaying the latest company news.
- **Files**: `src/components/dashboard/HeroSlider.tsx`, `src/components/dashboard/NewsGrid.tsx`, `tests/components/HeroSlider.test.tsx`.
- **Acceptance Criteria**:
  1. HeroSlider auto-rotates slides with manual prev/next arrow controls and dot indicators.
  2. NewsGrid displays 4 latest published articles with image thumbnail, title, date, and "Read More" button.
  3. Responsive on desktop and mobile viewports.
  4. Unit tests achieve >=90% coverage.
- **Short Prompt**:
```text
Implement FEAT-2.4: Build Hero Announcement Slider and 4-item News Grid widgets in src/components/dashboard/HeroSlider.tsx and NewsGrid.tsx with responsive controls. Write unit tests with >=90% coverage.
```

---

#### `FEAT-2.5`: Contextual Action Alert Banner (Shipments Updates & License Expiry Alerts)
- **Scope**: Dynamic warning banner displayed directly under the dashboard slider supporting dual alert triggers: (1) Shipments updates alert notifying client of status changes with action button `See my shipments`, and (2) Regulatory license expiry alert (SFDA / import permits) expiring within 30 days or already expired with action button `See my licenses`.
- **Files**: `src/components/dashboard/LicenseAlertBanner.tsx`, `src/app/(portal)/settings/licenses/page.tsx`, `tests/components/LicenseAlertBanner.test.tsx`.
- **Acceptance Criteria**:
  1. Trigger 1 (Shipments Update): If recent shipments have status updates, displays banner: "Dear Partner, We have some shipments updates for you. Please, check your shipments." with action button `See my shipments` linking to `/shipments`.
  2. Trigger 2 (License Expiry): If active company has regulatory licenses expiring within 30 days or expired, displays banner: "Please, notice: Your licence document will expire in 2 weeks." with action button `See my licenses` linking to `/settings/licenses`.
  3. Banner renders directly beneath hero slider and dismisses appropriately or navigates to target module.
  4. Banner is hidden if all shipments are reviewed and all licenses are valid (>30 days).
  5. Unit tests achieve >=90% coverage.
- **Short Prompt**:
```text
Implement FEAT-2.5: Build Contextual Action Alert Banner in src/components/dashboard/LicenseAlertBanner.tsx supporting both Shipments Updates ('Dear Partner, We have some shipments updates...') and License Expiry alerts ('Your licence document will expire in 2 weeks...') with 'See my shipments' and 'See my licenses' action buttons. Write unit tests with >=90% coverage.
```

---

### Module 3: Digital Product Catalog & Specifications

#### `FEAT-3.1`: Live Instant Autocomplete Search with Rich Cut & Article Previews
- **Scope**: Live search bar inside the catalog that initiates instant filtering on first keystrokes, displaying matching cuts, SKUs, and article codes in an interactive rich dropdown with query highlighting.
- **Files**: `src/components/catalog/CatalogSearch.tsx`, `src/server/actions/catalog.actions.ts`, `tests/components/CatalogSearch.test.tsx`.
- **Acceptance Criteria**:
  1. Input contains magnifying glass `Q`, placeholder `Search`, and clear icon `X` when text is present.
  2. Debounced search input (250ms) triggers query against SKU, Article number, and Cut Name.
  3. Dropdown preview displays:
     * Cut Name with matched search characters highlighted in **bold** (e.g. searching "7" bolds `7`).
     * Secondary line showing packaging specification (e.g. `vacuum film 2,0 kg, corrugated box 12 kg, TM "Allana"`).
     * Item SKU / Article tag formatted as `Article: 3358`.
  4. Pressing Enter or clicking a result navigates to `/catalog/[slug]`.
  5. Unit tests achieve >=90% coverage.
- **Short Prompt**:
```text
Implement FEAT-3.1: Build CatalogSearch in src/components/catalog/CatalogSearch.tsx with debounced instant autocomplete dropdown, search character bolding, secondary packaging specs, 'Article: XXXX' badge, and clear button. Write unit tests with >=90% coverage.
```

---

#### `FEAT-3.2`: Catalog Landing Page, Multi-Facet Filter Engine & Anatomical Cut Pills
- **Scope**: Catalog landing view with 4 prominent category hero cards and brand portfolio showcase, plus dynamic faceted filter sidebar and top subcategory pills featuring anatomical carcass cut diagrams with highlighted muscle sections. Supports multi-selection for packaging types, frozen formats (BF, IQF, IPBF, BQF), and brands, with removable active filter tags and "Clear All".
- **Files**: `src/components/catalog/CatalogLanding.tsx`, `src/components/catalog/FilterSidebar.tsx`, `src/components/catalog/SubcategoryPills.tsx`, `src/lib/catalog-filters.ts`, `tests/components/CatalogLanding.test.tsx`, `tests/lib/catalog-filters.test.ts`.
- **Acceptance Criteria**:
  1. Default landing page renders 4 hero category blocks with icons: `Further processing product` (burger), `Frozen buffalo meat products` (meat cut), `New products` (megaphone), and `Customized products` (hand with stars), plus brand portfolio logos bar below (`Allana`, `Al-Tamam`, `OMAR`, `Premium Gold`).
  2. Clicking an incomplete category block triggers accessible notice: "This part is under development".
  3. Faceted filter sidebar filters by:
     * Category (collapsible with count e.g. `Category (2) ^`)
     * Subcategory (`Subcategory (8) ^`)
     * Primary Package (`Primary package (7) ^`: Vacuum Block, Carton, Polybag, Tray, Packaged Stretch, Carton Box)
     * Product State (`Product State (4) ^`: BF, IQF, IPBF, BQF)
     * Brand (`Brand (4) ^`: Allana, Al-Tamam, OMAR, Premium Gold).
  4. Top subcategory pills display **anatomical cut diagram icons** with highlighted muscle sections on active pills.
  5. Active filters render removable tags (`[X] Frozen buffalo products`, `[X] Fillet`) with a solid green `Clear All` button.
  6. URL search params synchronize with active filter state (`?category=buffalo&state=frozen`).
  7. Unit tests achieve >=90% coverage.
- **Short Prompt**:
```text
Implement FEAT-3.2: Build Catalog Landing Page with 4 Category hero cards and Brand showcase in src/components/catalog/CatalogLanding.tsx, multi-faceted FilterSidebar with collapsible groups, anatomical cut diagram SubcategoryPills, removable filter tags, and Clear All in src/components/catalog/FilterSidebar.tsx. Write unit tests with >=90% coverage.
```

---

#### `FEAT-3.3`: Catalog Grid / List Toggle, Sorting, Dual Pagination & Disclaimer Banner
- **Scope**: View controls allowing users to switch between grid card view and dense list table view, select page size (12, 24, or All), sort by name or SKU, navigate pages with dual pagination (`Load More Products` button and numbered `< 1 2 >` controls), and display the official catalog incomplete characteristics disclaimer banner.
- **Files**: `src/components/catalog/CatalogViewControls.tsx`, `src/components/catalog/ProductGrid.tsx`, `src/components/catalog/ProductTable.tsx`, `tests/components/CatalogView.test.tsx`.
- **Acceptance Criteria**:
  1. Toggle button switches between Card Grid layout and List Table layout with green active state indicator.
  2. Page size selector supports `12`, `24`, and `All`.
  3. Implements dual pagination: a prominent `Load More Products` button (with circular reload icon) and numbered page switcher `< 1 2 >`.
  4. Renders catalog informational disclaimer banner at the top/bottom: "Attention: the presented list of products and their characteristics are incomplete. Check the details with the manager. The catalog does not contain all products available for order, and is advertising material."
  5. Displays loading skeleton during page transitions and disables Next/Prev buttons appropriately at boundaries.
  6. Unit tests achieve >=90% coverage.
- **Short Prompt**:
```text
Implement FEAT-3.3: Build catalog view controls (Grid vs List toggle, items per page: 12/24/All, sorting, dual pagination with 'Load More Products' and '< 1 2 >' buttons, and the official incomplete characteristics disclaimer banner) in src/components/catalog/CatalogViewControls.tsx. Write unit tests with >=90% coverage.
```

---

#### `FEAT-3.4`: Product Detail Page (PDP): Breadcrumbs, Packaging Switcher & 10-Column Logistics Specs
- **Scope**: Comprehensive product specification page featuring full breadcrumb navigation, high-resolution cut photography, interactive packaging sample switcher (`Vacuum block`, `Carton`, `Polybag`, `Tray`), 10-column logistics specification table, reefer container loading pattern matrix, and certification badges.
- **Files**: `src/app/(portal)/catalog/[slug]/page.tsx`, `src/components/catalog/PackagingSwitcher.tsx`, `src/components/catalog/ProductSpecTable.tsx`, `src/components/catalog/LoadingPatternCard.tsx`, `tests/components/ProductDetail.test.tsx`.
- **Acceptance Criteria**:
  1. Renders clickable breadcrumb navigation: `Home -> Catalog -> Category -> Subcategory -> Product Name`.
  2. Displays interactive `Packaging` row with thumbnails (`Vacuum block`, `Carton`, `Polybag`, `Tray`) that switches the active secondary packaging preview photo and highlights matching rows in the spec table.
  3. Displays 10-column export logistics specification table:
     * `SKU` (Article code)
     * `Nett weight` (e.g. 20 KG, 2 KG)
     * `Primary package` (e.g. Vacuum block, Polybag, Carton)
     * `Cut size` / calibration (e.g. 55-75g, 36-64g, Uncalibrated)
     * `Packages per carton` (e.g. 6, 12, 4, 1)
     * `Carton weight` (e.g. 12 KG, 8 KG, 14 KG)
     * `Carton dimensions` (L × W × H mm, e.g. 583x392x119)
     * `Shelf life months` (e.g. 12, 24)
     * `Storage conditions` (e.g. not higher -18°C)
     * `Freezing type` (BF, IQF, IPBF, BQF).
  4. Shows container loading matrix: Cartons/Pallet, Pallets/Container, Total FCL weight (MT).
  5. Displays Halal, ISO 22000, HACCP, and SFDA badge indicators.
  6. If product has `isUnderDevelopment === true`, displays "This product is under development" banner with "Request Customization" button.
  7. Unit tests achieve >=90% coverage.
- **Short Prompt**:
```text
Implement FEAT-3.4: Build Product Detail Page in src/app/(portal)/catalog/[slug]/page.tsx with clickable breadcrumb trail, interactive PackagingSwitcher row (Vacuum block, Carton, Polybag, Tray), 10-column logistics spec table, reefer container loading pattern calculator, and certifications. Write unit tests with >=90% coverage.
```

---

#### `FEAT-3.5`: Dynamic Branded PDF Spec Sheet Exporter
- **Scope**: Server-side branded PDF datasheet generator allowing users to download an official specification sheet for any catalog cut with Allana branding, technical specs, and loading diagrams.
- **Files**: `src/lib/pdf.ts`, `src/app/api/catalog/[slug]/spec-sheet/route.ts`, `tests/lib/pdf.test.ts`.
- **Acceptance Criteria**:
  1. Generates branded PDF containing Allana logo, cut name, SKU, anatomical diagram, packaging specs, and storage guidelines.
  2. Sets proper headers: `Content-Type: application/pdf` and `Content-Disposition: attachment; filename="{sku}-spec.pdf"`.
  3. Unit tests mock PDF stream generation and verify >=90% coverage.
- **Short Prompt**:
```text
Implement FEAT-3.5: Build server-side PDF specification sheet generator in src/lib/pdf.ts and route handler in src/app/api/catalog/[slug]/spec-sheet/route.ts with branded Allana layout. Write unit tests with >=90% coverage.
```

---

### Module 4: Customized Product Requests (NPD Engine)

#### `FEAT-4.1`: Custom Product Request Wizard with Meat Export Criteria & R2 Specs
- **Scope**: Multi-step request wizard allowing clients to submit new product development requests. Captures Category (dropdown), Freezing Type (Block frozen, IQF, Chilled), Estimated FCA price per ton in $, Weight of individual packaging, specific meat processing checkboxes (`Calibrated`, `Marinated`, `Boneless`, `Skinless`, `Do you have specification?`), Additional comments, and Cloudflare R2 file attachments.
- **Files**: `src/app/(portal)/customized-products/new/page.tsx`, `src/components/custom-products/CustomProductForm.tsx`, `src/server/actions/custom-product.actions.ts`, `src/server/validators/custom-product.schema.ts`, `tests/server/custom-product.actions.test.ts`.
- **Acceptance Criteria**:
  1. Form fields match the user manual screenshot: Category, Freezing type dropdown, FCA price ($), individual packaging weight, and the 5 meat processing checkboxes (Calibrated, Marinated, Boneless, Skinless, Has Specification).
  2. File upload generates presigned R2 PUT URL, uploads artwork/spec, and saves R2 key.
  3. Form submission generates unique request number `NPD-YYYY-XXX` and sets status `IN_REVIEW`.
  4. Unit tests in `tests/server/custom-product.actions.test.ts` achieve >=90% coverage.
- **Short Prompt**:
```text
Implement FEAT-4.1: Build Custom Product Request creation wizard in src/app/(portal)/customized-products/new/page.tsx with specific meat processing checkboxes (Calibrated, Marinated, Boneless, Skinless, Has Specification), freezing type, FCA price per ton, Cloudflare R2 artwork upload, and NPD-YYYY-XXX generation. Write unit tests with >=90% coverage.
```

---

#### `FEAT-4.2`: NPD Status Lifecycle (`In Review` → `Analysis` → `Accepted` → `Declined`)
- **Scope**: Status tracking dashboard for custom product requests displaying table under `Recent Orders` with columns `TICKET ID`, `Details` link, `BRIEF DESCRIPTION`, `CREATED AT`, and `STATUS` badge, plus 4-stage visual timeline.
- **Files**: `src/app/(portal)/customized-products/page.tsx`, `src/components/custom-products/NpdTimeline.tsx`, `src/components/custom-products/CustomProductTable.tsx`, `tests/components/NpdTimeline.test.tsx`.
- **Acceptance Criteria**:
  1. Table displays Recent Orders: Ticket ID (with Details link), Brief description, Created at, and Status badge (`IN REVIEW`, `ANALYSIS`, `ACCEPTED`, `DECLINED`).
  2. Status timeline visualizes progress: `In Review` (Sales) → `Analysis` (R&D / Plant) → `Accepted` / `Declined`.
  3. Displays manager comments/rejection reasons clearly.
  4. Unit tests achieve >=90% coverage.
- **Short Prompt**:
```text
Implement FEAT-4.2: Build Custom Product Request status tracking dashboard in src/app/(portal)/customized-products/page.tsx with Recent Orders table (Ticket ID, Details, Brief Description, Created At, Status) and 4-stage visual timeline. Write unit tests with >=90% coverage.
```

---

### Module 5: Shipment Tracking & Logistics Document Vault

#### `FEAT-5.1`: Shipment List Filter Bar, Sorter & Found Records Counter
- **Scope**: Shipment list header filter bar supporting period selection (default last 3 months, or custom date range with calendar), sales organization, destination country, and ship-to party, with `Found X records` counter and sortable columns with direction toggle icon.
- **Files**: `src/app/(portal)/shipments/page.tsx`, `src/components/shipments/ShipmentFilterBar.tsx`, `src/server/actions/shipments.actions.ts`, `tests/components/ShipmentFilterBar.test.tsx`.
- **Acceptance Criteria**:
  1. Default view fetches last 3 months of shipments for active company.
  2. "Get List" button triggers filtered fetch with selected dropdown criteria (Period, Sales Org, Country, Ship-To).
  3. Displays `Found X records` counter (e.g. "Found 13 records").
  4. Sorter dropdown re-orders records by Order ID, Quantity (MT), Amount ($), or Status, with sort direction toggle icon (`= / =`).
  5. Unit tests achieve >=90% coverage.
- **Short Prompt**:
```text
Implement FEAT-5.1: Build Shipment List filter bar in src/components/shipments/ShipmentFilterBar.tsx with period date range, sales org, country, and ship-to party filters, 'Found X records' counter, and multi-column sorting with direction toggle. Write unit tests with >=90% coverage.
```

---

#### `FEAT-5.2`: Two-Level Hierarchical Drilldown (Order → Reefer Containers → Cargo Items)
- **Scope**: Expandable table rows allowing two levels of drilldown: Level 1 reveals reefer container numbers with green GPS pin icon, shipping lines, port of destination, shipping date, ETD, ETA, container weight KG and amount USD; Level 2 reveals cargo product items via `v X SKU` button with cut photography, title, weight, and line amount. Action link toggles from `Details` to `Hide Details`.
- **Files**: `src/components/shipments/ShipmentRow.tsx`, `src/components/shipments/ContainerAccordion.tsx`, `src/components/shipments/CargoItemsTable.tsx`, `tests/components/ShipmentRow.test.tsx`.
- **Acceptance Criteria**:
  1. Main row displays Order ID, `Details` action link, Shipments count badge, Quantity (KG), Amount (USD), Status badge.
  2. Clicking row expander icon or `Details` reveals container accordion and dynamically changes link text to `Hide Details`.
  3. Level 1 displays `Container No` with **green location/GPS pin icon**, `Sea Line`, `Port of destination`, `Shipping Date`, `ETD`, `ETA`, container weight KG, and container amount USD.
  4. Level 2 features expandable button `v X SKU` (e.g. `v 1 SKU`) displaying cut thumbnail photo, product title (e.g. "Frozen Boneless Buffalo Silverside, crt. 20kg Allana"), line weight in KG, and line amount in USD.
  5. Unit tests achieve >=90% coverage.
- **Short Prompt**:
```text
Implement FEAT-5.2: Build two-level expandable shipment table row in src/components/shipments/ShipmentRow.tsx and ContainerAccordion.tsx displaying 'Hide Details' toggle, reefer container details with green GPS pin, and 'v X SKU' button for cargo item breakdowns. Write unit tests with >=90% coverage.
```

---

#### `FEAT-5.3`: Cloudflare R2 Logistics Document Vault (Presigned BL, Vet, Halal, CIPL)
- **Scope**: Secure document repository integrated within each shipment detail view, allowing users with `DOWNLOAD_DOCUMENTS` permission to download Bill of Lading, Veterinary Health Certificate, Halal Certificate, and Commercial Invoice via time-limited presigned R2 URLs.
- **Files**: `src/components/shipments/DocumentVault.tsx`, `src/server/actions/documents.actions.ts`, `tests/components/DocumentVault.test.tsx`.
- **Acceptance Criteria**:
  1. Lists all official shipping documents attached to the shipment with file name, type badge, and size.
  2. Clicking "Download" requests presigned GET URL from Cloudflare R2 and triggers browser download.
  3. Users lacking `DOWNLOAD_DOCUMENTS` permission see disabled download buttons with explanatory tooltip.
  4. Unit tests achieve >=90% coverage.
- **Short Prompt**:
```text
Implement FEAT-5.3: Build Logistics Document Vault in src/components/shipments/DocumentVault.tsx allowing authorized users to download presigned R2 shipping documents (B/L, Vet Cert, Halal Cert). Write unit tests with >=90% coverage.
```

---

### Module 6: Sales Plan & Supply Chain Forecasting

#### `FEAT-6.1`: Sales Plan Filter Bar (Month/Year, Sales Org, Country, Ship-To, UOM)
- **Scope**: Forecasting filter bar supporting Month/Year selection, Sales Organization, Country, Ship-to Party, and Unit of Measure toggle (**Tonnes** vs **USD / Currency**).
- **Files**: `src/app/(portal)/sales-plan/page.tsx`, `src/components/sales-plan/SalesPlanFilterBar.tsx`, `src/server/actions/sales-plan.actions.ts`, `tests/components/SalesPlanFilterBar.test.tsx`.
- **Acceptance Criteria**:
  1. Defaults to current month and year.
  2. UOM toggle instantly switches numerical display between metric tonnes and currency ($).
  3. Clicking "Get List" triggers fetch with active filters.
  4. Unit tests achieve >=90% coverage.
- **Short Prompt**:
```text
Implement FEAT-6.1: Build Sales Plan filter bar in src/components/sales-plan/SalesPlanFilterBar.tsx with Month/Year picker, Sales Org, Country, Ship-To, and UOM toggle (Tonnes vs USD). Write unit tests with >=90% coverage.
```

---

#### `FEAT-6.2`: Multi-Tier Grouping Grid (Country → Ship-To Party → SKU Breakdown)
- **Scope**: Hierarchical accordion grid grouped by **Country**, expandable to **Ship-To Party**, expandable via `v X SKU` button to individual **SKU lines** with `Code` and `Name`. Displays exact columns: `TARGET`, `LAST MONTH TRANSFER`, `SHIPPED`, `ORDER IN THE PIPELINE`, and `DELTA BETWEEN TARGET AND SHIPPED`.
- **Files**: `src/components/sales-plan/SalesPlanGrid.tsx`, `src/components/sales-plan/CountryGroupRow.tsx`, `src/components/sales-plan/ShipToGroupRow.tsx`, `src/components/sales-plan/SkuItemRow.tsx`, `tests/components/SalesPlanGrid.test.tsx`.
- **Acceptance Criteria**:
  1. Header features `Found X records` counter and `Sort by: Country A-Z v` with sort direction icon.
  2. Tier 1: Grouped by `Country` with `Details` / `Hide Details` toggle link, displaying aggregated metrics across Target, Last Month Transfer, Shipped, Order in Pipeline, and Delta.
  3. Tier 2: Expanding Country reveals `Ship to party` sub-rows with localized totals and an expandable button: `v X SKU` (e.g. `v 6 SKU`).
  4. Tier 3: Clicking `v X SKU` reveals cut line items with `Code` (e.g. 7940), `Name` (e.g. "Frozen Buffalo Silverside 20kg"), Target, Last Month Transfer, Shipped, Order in Pipeline, and Delta.
  5. Unit tests achieve >=90% coverage.
- **Short Prompt**:
```text
Implement FEAT-6.2: Build hierarchical sales plan grid in src/components/sales-plan/SalesPlanGrid.tsx with 3-tier grouping (Country -> Ship-To -> SKU), exact 'LAST MONTH TRANSFER' column, 'v X SKU' expander button, Code/Name cut lines, and sort controls. Write unit tests with >=90% coverage.
```

---

#### `FEAT-6.3`: Forecast Metrics Calculator (Target, Rollover, Shipped, Pipeline, Delta)
- **Scope**: Calculation engine for sales plan columns: Target, Last Month Balance, Shipped, Orders in Pipeline, and Delta.
- **Files**: `src/lib/sales-plan-calc.ts`, `tests/lib/sales-plan-calc.test.ts`.
- **Acceptance Criteria**:
  1. Formula: `Delta = (Shipped + Orders in Pipeline) - Target`.
  2. If Delta < 0, render red badge with deficit amount; if Delta >= 0, render green badge with surplus.
  3. Group headers accurately sum child line metrics.
  4. Unit tests in `tests/lib/sales-plan-calc.test.ts` verify mathematical accuracy with 100% coverage.
- **Short Prompt**:
```text
Implement FEAT-6.3: Build sales plan forecast calculations in src/lib/sales-plan-calc.ts calculating Target, Rollover, Shipped, Pipeline, and Delta with conditional surplus/deficit styling. Write unit tests with >=90% coverage.
```

---

### Module 7: Financial Reports Center

#### `FEAT-7.1`: Statement of Account Report Generator (Date Range, On-Demand PDF/Excel & Email Dispatch)
- **Scope**: Statement of Account generation interface supporting custom date range selection, direct PDF and Excel (`.xlsx`) downloads, and automated email dispatch with an "Additional Email" recipient field and explanatory partner notice.
- **Files**: `src/app/(portal)/reports/page.tsx`, `src/components/reports/StatementReportCard.tsx`, `src/server/actions/reports.actions.ts`, `src/lib/email.ts`, `tests/server/reports.actions.test.ts`.
- **Acceptance Criteria**:
  1. Allows selecting From Date and To Date using an interactive calendar picker (`Period`).
  2. User can enter an optional secondary email address in `Additional e-mail` field for report dispatch.
  3. Displays explanatory note: "The report will be sent to the email specified in your account. To send a report to an additional email, add it to the appropriate field."
  4. "Send to e-mail" button triggers background compilation and email transmission to both primary and additional emails.
  5. Action buttons: "Download PDF" and "Download Excel" directly export branded Statement of Account in `.pdf` and `.xlsx` formats.
  6. Unit tests achieve >=90% coverage.
- **Short Prompt**:
```text
Implement FEAT-7.1: Build Statement of Account generator in src/components/reports/StatementReportCard.tsx and src/server/actions/reports.actions.ts supporting custom period, direct PDF/Excel exports, explanatory notice, and secondary email delivery. Write unit tests with >=90% coverage.
```

---

#### `FEAT-7.2`: Accounts Receivables Aging Report (Aging Buckets: Current, 1-30, 31-60, 61-90, >90 Days)
- **Scope**: Accounts Receivables Aging report generator supporting as-of date selection in the `Period` field, secondary email recipient in `Additional e-mail` field, aging bracket categorization (Current, 1–30, 31–60, 61–90, >90 Days), direct PDF/Excel export, and email dispatch.
- **Files**: `src/components/reports/ReceivablesReportCard.tsx`, `src/lib/aging-calc.ts`, `tests/lib/aging-calc.test.ts`.
- **Acceptance Criteria**:
  1. Select As-Of date using calendar picker in the `Period` field (defaults to today).
  2. Input field `Additional e-mail` allows specifying a secondary email address to receive the aging report.
  3. Calculates aging breakdown across 5 aging buckets: Current, 1–30 Days, 31–60 Days, 61–90 Days, >90 Days overdue.
  4. "Send to e-mail" button dispatches report to primary and secondary emails.
  5. Action buttons: "Download Excel" and "Download PDF" directly export the aging report in `.xlsx` and `.pdf` formats.
  6. Unit tests achieve >=90% coverage.
- **Short Prompt**:
```text
Implement FEAT-7.2: Build Accounts Receivables Aging Report in src/components/reports/ReceivablesReportCard.tsx and aging calculator in src/lib/aging-calc.ts with Period date picker, Additional e-mail input, 5 aging brackets, direct PDF/Excel exports, and email dispatch. Write unit tests with >=90% coverage.
```

---

### Module 8: Customer Claims & Inquiries Desk

#### `FEAT-8.1`: Claims & Complaints Ticket Dashboard with In-Place Row Preview
- **Scope**: Claims dashboard providing prominent action buttons (`Claim Form` and `Info Request`), search by Ticket ID or Subject, period date range picker, sorting by Ticket ID or Date, display selector (12, 24), and table with in-place expandable preview (`>`) showing category of request, company answer panel, status badge, and nested product items table.
- **Files**: `src/app/(portal)/claims/page.tsx`, `src/components/claims/ClaimsTable.tsx`, `src/components/claims/ClaimRowPreview.tsx`, `src/server/actions/claims.actions.ts`, `tests/components/ClaimsTable.test.tsx`.
- **Acceptance Criteria**:
  1. Header features two top buttons: `Claim Form` and `Info Request`.
  2. Search bar filters by ticket ID or subject; period date picker filters records.
  3. Table columns: Expand arrow (`>`), Created On, Ticket ID, Details link, Request Type (`Claim` vs `Info Request`), Subject, Status (`REGISTERED`, `UNDER REVIEW`, `INVESTIGATION`, `CLARIFICATION REQUIRED`, `PARTLY ACCEPTED`, `ACCEPTED`, `REJECTED`, `COMPLETED`).
  4. Clicking expand arrow reveals short in-place preview with Category of request, Answer box (green panel), Claim status, and product items table (Product Name, Article, Production Date, Supplier, Vehicle Number).
  5. Unit tests achieve >=90% coverage.
- **Short Prompt**:
```text
Implement FEAT-8.1: Build Claims dashboard in src/app/(portal)/claims/page.tsx with 'Claim Form' and 'Info Request' action buttons, search, date period filtering, status badges, and in-place expandable row preview showing category, answer, status, and product items table. Write unit tests with >=90% coverage.
```

---

#### `FEAT-8.2`: Comprehensive Quality Claim Form (Multi-Item Table & R2 Evidence)
- **Scope**: Quality claim submission form with auto-filled personal data (email locked), general information (Subject, Category of Request, Supplier), product description block with banner ("Please create one request for one separate complaint"), Invoice Number, Country, Product Article (Invoice SKU), auto-populated Product Name, Production Date (`dd-mm-yyyy`), Producer, Vehicle/Container number (max 100 chars), Non-conform weight in kg (`00.00` with 4 decimals), Received quantity kg, up to 10 products per form (`Add Product +`), 1000 char description, 20MB Cloudflare R2 file attachments, and semicolon-separated additional email contacts.
- **Files**: `src/app/(portal)/claims/new-claim/page.tsx`, `src/components/claims/ClaimForm.tsx`, `src/components/claims/ClaimProductLines.tsx`, `src/server/actions/claims.actions.ts`, `src/server/validators/claim.schema.ts`, `tests/server/claims.actions.test.ts`.
- **Acceptance Criteria**:
  1. Personal data block auto-populates from session with email locked.
  2. Entering Product Article auto-fetches and displays Product Name.
  3. Dynamic product line item table supports up to 10 products with Non-conform weight allowing 4 decimal places.
  4. File upload enforces 20 MB size limit and uploads directly to Cloudflare R2 via presigned URLs.
  5. Additional contact email field allows multiple semicolon-separated email addresses (`user1@domain.com; user2@domain.com`).
  6. Submits form with status `REGISTERED` and generates ticket number `CLM-YYYY-XXXX`.
  7. Unit tests in `tests/server/claims.actions.test.ts` achieve >=90% coverage.
- **Short Prompt**:
```text
Implement FEAT-8.2: Build Quality Claim Form in src/app/(portal)/claims/new-claim/page.tsx with auto-filled personal data, auto-populated product name on article input, up to 10 dynamic product line items with 4-decimal weight precision, 20MB R2 file upload, semicolon-separated additional emails, and CLM-YYYY-XXXX generation. Write unit tests with >=90% coverage.
```

---

#### `FEAT-8.3`: Info Request Form with Hierarchical Dynamic Category Tree
- **Scope**: Multi-category information request form featuring a dynamic category tree on the left supporting 3 branches: `Questionnaire` (manufacturer, factory article, product name), `Provision Of Documents` (Specification, Survey Report, Certificate, Declaration -> Shelf Life Extension / Compliance / Quality), and `Other Requests` (Quality & Safety, Audit, Clarifying Information). Form fields dynamically adapt based on selected category node.
- **Files**: `src/app/(portal)/claims/new-request/page.tsx`, `src/components/claims/InfoRequestForm.tsx`, `src/components/claims/CategoryTreeSelector.tsx`, `src/server/actions/info-request.actions.ts`, `tests/components/InfoRequestForm.test.tsx`.
- **Acceptance Criteria**:
  1. Left panel renders hierarchical category tree with radio buttons.
  2. Selecting `Questionnaire` displays manufacturer dropdown, factory product article (max 40 chars), product name, and questionnaire file attachments.
  3. Selecting `Provision of Documents -> Specification` displays product article and product name inputs with partner notice banner.
  4. Selecting `Provision of Documents -> Declaration -> Expiration of Shelf Life` displays date to extend shelf life (`dd-mm-yyyy`), production date, extension volume in kg (`00.00`), manufacturer, and reasons textarea.
  5. Submitting creates ticket with category tag and sends confirmation.
  6. Unit tests achieve >=90% coverage.
- **Short Prompt**:
```text
Implement FEAT-8.3: Build Info Request form in src/app/(portal)/claims/new-request/page.tsx with hierarchical category tree selector (Questionnaire, Provision of Documents [Specification, Shelf Life Extension Declaration], Other Requests) with dynamic sub-form fields and R2 file attachment. Write unit tests with >=90% coverage.
```

---

#### `FEAT-8.4`: Claim Detail View, Immutable Audit Log & Manager Resolution Response
- **Scope**: Detail page for a submitted claim displaying submitted data in read-only immutable view, list of affected products, downloadable attachments, and official Allana management response / credit note resolution notes.
- **Files**: `src/app/(portal)/claims/[id]/page.tsx`, `src/components/claims/ClaimDetailView.tsx`, `tests/components/ClaimDetailView.test.tsx`.
- **Acceptance Criteria**:
  1. Renders immutable record of original customer submission (preventing post-submit tampering).
  2. Displays attached evidence with presigned download links.
  3. Displays official manager response thread and credit note references if accepted.
  4. Unit tests achieve >=90% coverage.
- **Short Prompt**:
```text
Implement FEAT-8.4: Build Claim Detail view in src/app/(portal)/claims/[id]/page.tsx with immutable submission audit view, R2 attachment downloads, and official resolution response section. Write unit tests with >=90% coverage.
```

---

### Module 9: Real-Time Notifications & News Feed

#### `FEAT-9.1`: In-App Notification Center (14-Day & Docking Arrival Alerts, NPD, Claims, Licenses)
- **Scope**: Real-time notification center delivering alerts for shipment arrivals (**14 days prior to ETA** and **upon vessel docking/arrival**), NPD status changes, claim updates (`Clarification Required`, `Completed`), and license expirations. Includes `Show only unread` toggle, individual checkbox per message to mark read, "Mark all as read", and deep entity links.
- **Files**: `src/components/notifications/NotificationDrawer.tsx`, `src/server/actions/notifications.actions.ts`, `tests/server/notifications.actions.test.ts`.
- **Acceptance Criteria**:
  1. Bell icon displays live unread badge counter.
  2. Dropdown includes `Show only unread` toggle switch.
  3. Notification items display timestamp (`DD.MM.YYYY HH:MM:SS`), unread red dot, individual mark-read checkbox, and clickable entity links (`Claim Request`, `Shipments`, `Licenses`).
  4. Shipment arrival notifications fire at exactly 2 milestones: 14 days before ETA and on docking day.
  5. Unit tests achieve >=90% coverage.
- **Short Prompt**:
```text
Implement FEAT-9.1: Build Notification Center in src/components/notifications/NotificationDrawer.tsx with 14-day and docking arrival triggers, NPD/claim status alerts, 'Show only unread' toggle, individual message mark-read checkboxes, and deep entity links. Write unit tests with >=90% coverage.
```

---

#### `FEAT-9.2`: News & Market Updates Article Reader
- **Scope**: Full news reader page and detail article view showcasing Allana company updates, livestock market trends, and international trade regulatory bulletins.
- **Files**: `src/app/(portal)/news/page.tsx`, `src/app/(portal)/news/[slug]/page.tsx`, `src/components/news/NewsCard.tsx`, `tests/components/NewsReader.test.tsx`.
- **Acceptance Criteria**:
  1. News listing displays publication date, hero image, summary, and read time.
  2. Article view renders rich content with "Back to News" navigation button.
  3. Unit tests achieve >=90% coverage.
- **Short Prompt**:
```text
Implement FEAT-9.2: Build News and Market Updates reader in src/app/(portal)/news/page.tsx and src/app/(portal)/news/[slug]/page.tsx with rich text view and back navigation. Write unit tests with >=90% coverage.
```
