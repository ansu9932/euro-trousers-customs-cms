# EURO TROUSERS CUSTOMS & WAREHOUSE MANAGEMENT SYSTEM (CMS)
**EURO TROUSERS MFG. CO. (FZC) — SAIF Zone, Sharjah, UAE**

---

## 🚀 OVERVIEW

Enterprise Customs & Warehouse Management System designed specifically for **EURO TROUSERS MFG. CO. (FZC)** operating within the **Sharjah Airport International Free Zone (SAIF Zone), UAE**.

### Key Architectural Capabilities:
- **12 Customs Operational Modules**: Import Declarations, Export Declarations, Transfer Declarations, Duty & Finance, Container Management, Inspection & Holds, Clearance & Gate Passes, Stock Reconciliation, Customs Master Data, Reports, Audit Trail, and System Integrations.
- **Strict 4-Tier Role Approval Workflow**:
  - **Level 1 (Preparation & Submission)**: `DOC_OFFICER`
  - **Level 2 (Verification & Review)**: `CUSTOMS_MGR` (Segregation of Duties enforced)
  - **Level 3 (Duty & VAT Finance Gate)**: `FINANCE` (Mandatory if Duty or VAT > AED 0)
  - **Level 4 (High-Value Executive Approval)**: `GM` (Mandatory if CIF Value ≥ AED 100,000 threshold)
- **10 Fine-Grained RBAC Roles**: `ADMIN`, `CUSTOMS_MGR`, `DOC_OFFICER`, `DATA_ENTRY`, `WAREHOUSE`, `FINANCE`, `LOGISTICS`, `GM`, `VIEWER`, `AUDITOR`.
- **Dual-Ledger Inventory & Auto-Posting**: Reconciles Customs Duty-Suspended Ledger with Physical Warehouse Ledger upon `CLEARED` status transition.
- **Bilingual EN/AR RTL UI**: Complete Arabic layout translation with right-to-left document flow.
- **Document Generation with Signed QR Verification**: Offically formatted Bayan, Bill of Entry, and Gate Pass documents with instant QR scanner validation.
- **Notification Outbox & Escalation Engine**: Email (SMTP) & Meta WhatsApp Cloud API integration with automated 3-day hold escalation triggers.
- **Gemini AI Integration**: AI-assisted HS Code classification (`/api/ai/classify-hs`) and automated compliance pre-audit risk checks (`/api/ai/audit-precheck`).
- **Data Migration Staging Pipeline**: Excel template parsing, staging validation, transaction commit, and batch rollback capabilities.

---

## 🏗️ PRODUCTION ARCHITECTURE

- **Frontend**: `frontend/` Vite + React 19 + TypeScript + Tailwind CSS v4 SPA, built as static assets for **Cloudflare Pages**.
- **Backend**: `backend/` Node.js 20 + TypeScript + Express REST API. The current prototype API is preserved while the database-backed services are introduced module by module.
- **Database target**: PostgreSQL 16 via Docker Compose, with Drizzle ORM configuration and initial schema scaffolding in `backend/src/db/schema.ts`.
- **Document storage target**: MinIO S3-compatible storage via Docker Compose.
- **Reverse proxy**: Caddy container forwarding `/api/*` to the Express service.

Repository layout:

```text
frontend/        Vite React SPA
backend/         Express API, Drizzle config, services/routes skeleton
docker-compose.yml
.env.example
```

## 🧑‍💻 LOCAL DEVELOPMENT

```bash
npm install

# terminal 1: API on http://localhost:4000
npm run dev:backend

# terminal 2: Vite SPA on http://localhost:3000
npm run dev:frontend
```

In local development, Vite proxies `/api` to `http://localhost:4000` when `VITE_API_URL` is not set.

Build and typecheck both workspaces:

```bash
npm run build
npm run lint
```

Run the local infrastructure:

```bash
docker compose up -d --build
```

---

## ⚙️ ENVIRONMENT VARIABLES (`.env`)

```env
# Frontend
VITE_API_URL=https://api.example.com

# Backend
PORT=4000
NODE_ENV=production
FRONTEND_URL=https://euro-trousers-cms.pages.dev
DATABASE_URL=postgres://customs:customs@localhost:5432/euro_trousers_customs

# Security & Authentication
JWT_SECRET=replace-with-long-random-access-secret
JWT_REFRESH_SECRET=replace-with-long-random-refresh-secret
GM_APPROVAL_THRESHOLD_AED=100000

# MinIO / S3-compatible document storage
MINIO_ENDPOINT=127.0.0.1
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=customs-documents

# Google Gemini AI Integration
GEMINI_API_KEY=your_gemini_api_key_here

# Email Notification (SMTP / Nodemailer)
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=customs-alerts@eurotrousers.ae
SMTP_PASS=YourEmailPassword2026!
SMTP_FROM="EURO TROUSERS Customs System" <customs-alerts@eurotrousers.ae>

# Meta WhatsApp Cloud API
WHATSAPP_ENABLED=false
WHATSAPP_PHONE_NUMBER_ID=109283746501928
WHATSAPP_ACCESS_TOKEN=EAAG...your_meta_permanent_token
WHATSAPP_WEBHOOK_VERIFY_TOKEN=euro_trousers_wa_token_2026
```

---

## 🌐 META WHATSAPP CLOUD API SETUP PREREQUISITES

1. **Meta Business Manager**: Create a verified business account at [business.facebook.com](https://business.facebook.com).
2. **WhatsApp App**: In Meta Developers Console, add WhatsApp product and register a dedicated phone number (+971...).
3. **Template Messages**: Pre-approve required notification templates in WhatsApp Manager:
   - `declaration_cleared_alert` (Header: Text, Body: "Declaration {{1}} cleared by SAIF Zone Customs.")
   - `hold_escalation_urgency` (Header: Text, Body: "URGENT: Declaration {{1}} held for {{2}} days.")
4. **Permanent System User Token**: Generate a non-expiring Access Token with `whatsapp_business_messaging` permissions.

---

## 🚢 DEPLOYMENT GUIDE

### 1. Backend → Oracle Cloud Infrastructure (OCI) VM

```bash
# SSH into Ubuntu OCI VM
ssh ubuntu@your-oci-ip

# Clone repo and navigate to backend
git clone https://github.com/ansu9932/euro-trousers-customs-cms.git
cd euro-trousers-customs-cms

# Configure .env, then run the production stack
docker compose up -d --build
```

### 2. Frontend → Cloudflare Pages

```bash
# Build production static SPA
npm run build --workspace frontend

# Deploy via Wrangler CLI or Cloudflare Dashboard
npx wrangler pages deploy frontend/dist --project-name=euro-trousers-cms
```

Set `VITE_API_URL` in Cloudflare Pages to the public backend API origin.

---

## ✅ USER ACCEPTANCE TESTING (UAT) CHECKLIST

- [x] **RBAC Authentication**: Verify switching between 10 roles via Security Login Modal.
- [x] **4-Tier Workflow**: Submit Import Declaration as `DOC_OFFICER` → Review as `CUSTOMS_MGR` → Duty/VAT Finance check as `FINANCE` → GM Approval for >AED 100k as `GM`.
- [x] **Gemini AI**: Test auto-suggesting HS Code and running compliance pre-check on new line items.
- [x] **Container Demurrage**: Verify free-days countdown and automatic detention fee calculations.
- [x] **Gate Pass Verification**: Scan QR code via QR Scanner Modal to validate gate pass authenticity.
- [x] **Dual Stock Ledger**: Confirm stock auto-posts to Customs & Warehouse balances upon declaration clearance.
- [x] **Data Migration**: Upload Excel batch template, inspect staging validation report, commit to production, and test rollback.
- [x] **Bilingual RTL Support**: Toggle language between EN/AR and verify complete right-to-left UI mirroring.
