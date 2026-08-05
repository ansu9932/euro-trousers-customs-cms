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

- **Frontend**: Vite + React 19 + TypeScript + Tailwind CSS v4 SPA deployed on **Cloudflare Pages**.
- **Backend**: Node.js + Express REST API running on **Oracle Cloud Infrastructure (OCI) Always Free Ampere A1 ARM VM** with PM2 and Nginx.
- **Database**: MariaDB / MySQL 8.0+ transactional database (`backend/schema.sql`).

---

## ⚙️ ENVIRONMENT VARIABLES (`.env`)

```env
# Server Configuration
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://euro-trousers-cms.pages.dev

# Database Configuration (MySQL / MariaDB)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=customsuser
DB_PASSWORD=SecurePassword2026!
DB_NAME=customsdb

# Security & Authentication
JWT_SECRET=super-secret-jwt-key-euro-trousers-2026
GM_APPROVAL_THRESHOLD_AED=100000

# Google Gemini AI Integration
GEMINI_API_KEY=your_gemini_api_key_here

# Email Notification (SMTP / Nodemailer)
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=customs-alerts@eurotrousers.ae
SMTP_PASS=YourEmailPassword2026!
SMTP_FROM="EURO TROUSERS Customs System" <customs-alerts@eurotrousers.ae>

# Meta WhatsApp Cloud API
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

# Make deployment script executable & run
chmod +x backend/deploy.sh
./backend/deploy.sh
```

### 2. Frontend → Cloudflare Pages

```bash
# Build production static SPA
npm run build

# Deploy via Wrangler CLI or Cloudflare Dashboard
npx wrangler pages deploy dist --project-name=euro-trousers-cms
```

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
