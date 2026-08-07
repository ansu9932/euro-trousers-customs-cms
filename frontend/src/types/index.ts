export type UserRole =
  | 'ADMIN' // System Administrator - full access
  | 'CUSTOMS_MGR' // Customs Manager - reviews/approves, compliance
  | 'DOC_OFFICER' // Documentation Officer - prepares invoices, packing lists, COOs, declarations
  | 'DATA_ENTRY' // Data Entry Officer - enters shipments, invoices, items
  | 'WAREHOUSE' // Warehouse Officer - container receiving, stock, dispatch
  | 'FINANCE' // Finance Officer - duty, VAT, payments, refunds, BGs
  | 'LOGISTICS' // Logistics Officer - shipment, container, transport tracking
  | 'GM' // General Manager - final approval for high-value shipments, dashboards
  | 'VIEWER' // Viewer - read-only reports and shipment status
  | 'AUDITOR'; // Auditor - read-only EVERYTHING including audit logs

export interface User {
  id: string;
  loginId?: string;
  name: string;
  nameAr?: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
  passwordHash?: string;
  isActive?: boolean;
  isLocked?: boolean;
  failedAttempts?: number;
  lockedUntil?: string | null;
  mustChangePassword?: boolean;
  lastLoginAt?: string;
}

export type PermissionAction = 'view' | 'create' | 'edit' | 'approve' | 'delete';

export type SystemModule =
  | 'dashboard'
  | 'masters'
  | 'import_declarations'
  | 'export_declarations'
  | 'transfer_declarations'
  | 'duty_finance'
  | 'documents'
  | 'containers'
  | 'inspections'
  | 'clearance'
  | 'stock_reconciliation'
  | 'reports'
  | 'integrations'
  | 'audit_trail'
  | 'settings'
  | 'api_docs';

export interface CompanySettings {
  id: string;
  companyNameEn: string;
  companyNameAr: string;
  trn: string;
  saifZoneLicenceNo: string;
  plotNo: string;
  addressEn: string;
  addressAr: string;
  poBox: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  currency: string;
  gmApprovalThresholdAED: number; // default 100,000 AED
  defaultDutyRate: number; // default 5%
  defaultVatRate: number; // default 5%
  retentionYears: number; // default 5 years
  sharjahCustomsEPortalMode: 'manual' | 'api_mock' | 'live';
  tallyExportEnabled: boolean;
  logoUrl?: string;
}

// Master Data Types
export interface HsCode {
  id: string;
  code: string; // e.g. "6203.4200"
  descriptionEn: string;
  descriptionAr: string;
  dutyRatePercent: number; // e.g. 5
  vatRatePercent: number; // e.g. 5
  unitOfMeasure?: string; // PCS, KGS, MTR
  applicableUom?: string;
  category?: 'FABRIC' | 'ACCESSORY' | 'FINISHED_GOODS' | 'PACKAGING' | 'OTHER';
  isFreeZoneExemptEligible?: boolean;
  freeZoneExemptionEligible?: boolean;
  isRestricted?: boolean;
  restrictionNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Country {
  code: string; // ISO 2 (e.g. "AE", "CN", "IN")
  nameEn: string;
  nameAr: string;
}

export interface Port {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  countryCode: string;
  type: 'SEA' | 'AIR' | 'LAND';
}

export interface CustomsOffice {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  emirate: 'Sharjah' | 'Dubai' | 'Abu Dhabi' | 'Other';
  isDefaultSaifZone?: boolean;
}

export interface Incoterm {
  code: string; // EXW, FOB, CIF, etc.
  name: string;
  description: string;
}

export interface UnitOfMeasure {
  code: string; // PCS, MTR, KGS, DOZ, ROLLS, YDS
  nameEn: string;
  nameAr: string;
}

export interface BusinessPartner {
  id: string;
  code: string;
  nameEn: string;
  nameAr?: string;
  type: 'SUPPLIER' | 'CUSTOMER' | 'FORWARDER' | 'SHIPPING_LINE' | 'BOTH';
  countryCode: string;
  country?: string;
  trn?: string;
  customsCode?: string;
  contactEmail?: string;
  email?: string;
  phone?: string;
  currency: string;
  address?: string;
  isActive: boolean;
}

export interface ItemMaster {
  id: string;
  itemCode: string; // e.g. "FAB-COT-001"
  descriptionEn: string;
  descriptionAr: string;
  category: 'FABRIC' | 'ACCESSORY' | 'FINISHED_GOODS' | 'PACKAGING' | 'TRIMMING';
  garmentCategory?: string;
  hsCodeId: string;
  hsCode: string;
  uom: string;
  standardCostAED: number;
  unitValueAED?: number;
  currency: string;
  reorderLevel: number;
  totalStockCustoms: number;
  totalStockWarehouse: number;
}

// Declaration Workflow States (4-level state machine)
export type DeclarationStatus =
  | 'DRAFT' // Initial draft by Data Entry
  | 'L1_PREPARED' // L1: Documentation Officer prepared
  | 'L2_REVIEWED' // L2: Customs Manager reviewed & verified
  | 'L3_FINANCE_APPROVED' // L3: Finance Officer approved duty/VAT (skipped if 0 duty/VAT)
  | 'L4_GM_APPROVED' // L4: GM Approved (required if value >= threshold)
  | 'APPROVED' // Fully approved, ready for customs submission
  | 'SUBMITTED' // Submitted to SAIF Zone Customs, staff recorded ref no.
  | 'UNDER_INSPECTION' // Customs inspection initiated
  | 'CLEARED' // Customs clearance issued, stock auto-incremented
  | 'GATE_PASS_ISSUED' // Gate pass issued for physical movement
  | 'CLOSED' // Shipment received/dispatched, declaration closed
  | 'ON_HOLD' // Customs or internal hold
  | 'REJECTED' // Rejected at any stage back to DRAFT with reason
  | 'AMENDED' // Amended (creates new version, archive old)
  | 'CANCELLED';

export type TransportMode = 'Sea' | 'Air' | 'Land' | 'Courier';

export interface DeclarationItem {
  id: string;
  itemNo?: number;
  itemCode?: string;
  hsCode: string;
  descriptionEn: string;
  descriptionAr?: string;
  originCountry?: string;
  quantity: number;
  uom: string;
  unitPrice?: number;
  unitPriceOriginal?: number;
  totalPriceOriginalCurrency?: number;
  cifValueOriginalCurrency?: number;
  cifValueAED?: number;
  dutyRatePercent: number;
  dutyAmountAED: number;
  vatRatePercent: number;
  vatAmountAED: number;
  isFreeZoneExempt?: boolean;
  freeZoneExempt?: boolean;
  freeZoneExemption?: boolean;
  totalAmountAED?: number;
  grossWeightKg?: number;
  netWeightKg?: number;
  packageCount?: number;
  packagesCount?: number;
  packageType?: string;
}

export type TransferType = 'FZ_TO_FZ' | 'FZ_TO_MAINLAND' | 'MAINLAND_TO_FZ' | 'TEMP_TRANSFER' | 'RETURN_TRANSFER';

export interface Declaration {
  id: string;
  declarationNo: string; // e.g. "IMP-2026-0001", "EXP-2026-0001", "TRN-2026-0001"
  version?: number;
  declarationType: 'IMPORT' | 'EXPORT' | 'TRANSFER';
  transferType?: TransferType;
  linkedOriginalDeclarationId?: string; // For Return Transfer or Amendments
  dueBackDate?: string; // For Temporary Transfer
  status: DeclarationStatus;
  declarationDate: string;
  shipmentRef?: string;
  invoiceNo?: string;
  invoiceDate?: string;
  poSoNumber?: string;
  partnerId?: string;
  partnerName?: string;
  countryOfOrigin?: string;
  countryOfDestination?: string;
  portOfLoading?: string;
  portOfDischarge?: string;
  customsOfficeId?: string;
  customsOfficeName?: string;
  transportMode?: TransportMode;
  blAwbNo?: string;
  containerNos?: string[]; // Array of container numbers
  sealNumbers?: string[];
  currency?: string;
  exchangeRateToAED?: number;
  totalValueOriginalCurrency?: number;
  totalValueAED: number;
  totalDutyAED: number;
  totalVatAED: number;
  totalCustomsChargesAED?: number;
  items: DeclarationItem[];
  attachedDocumentIds?: string[];
  remarks?: string;
  rejectionReason?: string;
  holdReason?: string;
  saifZoneCustomsRefNo?: string; // Official Sharjah Customs Bayan Ref #
  clearanceDate?: string;
  gatePassNo?: string;
  exitPassNo?: string;
  hasViolations?: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
  workflowHistory?: WorkflowTransition[];
}

export interface WorkflowTransition {
  id: string;
  fromStatus: DeclarationStatus;
  toStatus: DeclarationStatus;
  action: string;
  performedBy: string;
  userRole: UserRole;
  timestamp: string;
  remarks?: string;
  ipAddress?: string;
}

// Module 5: Duty, VAT & Finance
export interface ExchangeRate {
  currency: string;
  rateToAED: number;
  lastUpdated: string;
}

export interface BankGuarantee {
  id: string;
  guaranteeNo: string;
  bankName: string;
  amountAED: number;
  issueDate: string;
  expiryDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'RELEASED' | 'CLAIMED';
  utilizedAmountAED: number;
  runningBalanceAED: number;
  linkedDeclarationNos: string[];
  remarks?: string;
  alertDaysBeforeExpiry: number;
}

export interface DutyRefund {
  id: string;
  refundNo: string; // e.g. "REF-2026-0001"
  declarationId: string;
  declarationNo: string;
  reason: 'RE_EXPORT' | 'EXCESS_DUTY' | 'CUSTOMS_APPROVED_EXEMPTION' | 'TRANSIT_CANCELLATION';
  claimReason?: string;
  claimedAmountAED: number;
  approvedAmountAED: number;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'REFUNDED';
  submissionDate: string;
  approvalDate?: string;
  refundDate?: string;
  customsVoucherNo?: string;
  attachedDocIds: string[];
  remarks?: string;
}

export interface CustomsDeposit {
  id: string;
  depositRef: string;
  declarationNo: string;
  amountAED: number;
  depositDate: string;
  purpose: string;
  status: 'ACTIVE' | 'REFUNDED' | 'FORFEITED';
  refundDate?: string;
  receiptDocId?: string;
}

// Module 6: Customs Documents & Generation
export type DocumentType =
  | 'COMMERCIAL_INVOICE'
  | 'PACKING_LIST'
  | 'BILL_OF_LADING'
  | 'AIR_WAYBILL'
  | 'CERTIFICATE_OF_ORIGIN'
  | 'DELIVERY_ORDER'
  | 'IMPORT_PERMIT'
  | 'EXPORT_PERMIT'
  | 'CUSTOMS_DECLARATION_COPY'
  | 'GATE_PASS'
  | 'EXIT_PASS'
  | 'GOODS_TRANSFER_NOTE'
  | 'INSURANCE_CERTIFICATE'
  | 'INSPECTION_CERTIFICATE'
  | 'FUMIGATION_CERTIFICATE'
  | 'OTHER';

export interface CustomsDocument {
  id: string;
  documentNo: string;
  documentType: DocumentType;
  title: string;
  fileName: string;
  fileSizeKb: number;
  fileUrl?: string;
  version: number;
  linkedEntityType: 'DECLARATION' | 'SHIPMENT' | 'CONTAINER' | 'ITEM' | 'GENERAL';
  linkedEntityId: string;
  linkedEntityRef: string;
  issueDate: string;
  expiryDate?: string;
  uploadedBy: string;
  uploadedAt: string;
  isGeneratedBySystem: boolean;
  qrCodeData?: string;
  tags?: string[];
}

// Module 7: Container Management
export interface ContainerRecord {
  id: string;
  containerNo: string;
  isoType: '20GP' | '40GP' | '40HQ' | '45HQ' | 'LCL' | 'AIR_PALLET';
  sealNo?: string;
  shippingLine: string;
  blAwbNo: string;
  vesselName?: string;
  portOfDischarge?: string;
  dischargeDate?: string;
  freeDaysAllowed?: number;
  declarationNo?: string;
  transportMode?: TransportMode;
  eta?: string;
  actualArrivalDate?: string;
  freeDays?: number; // Configurable free days, e.g., 5 or 7
  returnDueDate: string;
  actualReturnDate?: string;
  status: 'IN_TRANSIT' | 'ARRIVED' | 'AT_WAREHOUSE' | 'UNLOADED' | 'RETURNED_EMPTY' | 'OVERDUE';
  demurrageRatePerDayAED?: number;
  calculatedDemurrageAED?: number;
  dailyDemurrageRateAED?: number;
  accruedDemurrageAED?: number;
  warehouseLocation?: string;
  remarks?: string;
}

// Module 8: Inspection & Hold/Release
export type CustomsInspection = InspectionRecord;
export interface InspectionRecord {
  id: string;
  inspectionNo: string;
  declarationNo: string;
  type?: 'PHYSICAL' | 'DOCUMENT_VERIFICATION' | 'X_RAY';
  inspectionType?: string;
  customsOffice?: string;
  location?: string;
  customsOfficerName?: string;
  inspectorName?: string;
  customsRefNo?: string;
  requestDate?: string;
  inspectionDate?: string;
  scheduledDate?: string;
  completionDate?: string;
  status: 'REQUESTED' | 'SCHEDULED' | 'IN_PROGRESS' | 'PASSED' | 'FAILED' | 'CONDITIONAL_RELEASE';
  resultNotes?: string;
  findings?: string;
  attachedDocIds?: string[];
}

export interface HoldRecord {
  id: string;
  declarationNo: string;
  heldAtDate: string;
  holdReason: string;
  assignedOwner: string; // User or Role responsible for follow up
  status: 'ACTIVE_HOLD' | 'ESCALATED' | 'RESOLVED_RELEASED';
  escalationThresholdDays: number; // default 3 days
  releaseDate?: string;
  releaseRemarks?: string;
  notifiedRoles: UserRole[];
  notesHistory: { date: string; user: string; note: string }[];
}

// Module 9: Clearance & Gate Pass
export type GatePass = GatePassRecord;
export interface GatePassRecord {
  id: string;
  gatePassNo?: string; // e.g. "GP-2026-0001"
  passNo?: string;
  passType?: 'INWARD_IMPORT' | 'OUTWARD_EXPORT' | 'TRANSFER' | 'DISPATCH';
  declarationNo: string;
  deliveryOrderNo?: string;
  saifZoneOfficialGatePassRef?: string;
  issueDate?: string;
  issuedAt?: string;
  validUntil?: string;
  destination?: string;
  vehiclePlateNo: string;
  vehicleType?: string;
  driverName: string;
  driverMobile: string;
  driverIdPassport?: string;
  transporterName?: string;
  cargoDescription?: string;
  totalPackages?: number;
  grossWeightKg?: number;
  status: 'ISSUED' | 'VEHICLE_ARRIVED' | 'LOADED_UNLOADED' | 'USED_EXITED' | 'CANCELLED';
  qrVerificationCode?: string;
  issuedBy?: string;
  approvedBy?: string;
  remarks?: string;
}

// Module 10: Stock & Reconciliation
export interface CustomsStockItem {
  id: string;
  itemCode: string;
  descriptionEn: string;
  hsCode: string;
  uom: string;
  openingStock: number;
  importedQty: number;
  exportedQty: number;
  transferredInQty: number;
  transferredOutQty: number;
  closingCustomsBalance: number;
  lastMovementDate: string;
}

export interface WarehouseStockItem {
  id: string;
  itemCode: string;
  descriptionEn: string;
  uom: string;
  warehouseLocation: string;
  physicalCountQty: number;
  tallySystemQty: number;
  lastUpdated: string;
}

export interface StockReconciliationRun {
  id: string;
  reconciliationNo: string; // e.g. "REC-2026-07"
  periodMonth: string; // "2026-07"
  runDate: string;
  performedBy: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'ADJUSTED';
  totalItemsChecked: number;
  itemsWithVariance: number;
  netVarianceQty: number;
  lines: StockReconciliationLine[];
  adjustmentApprovedBy?: string;
  adjustmentDate?: string;
  remarks?: string;
}

export interface StockReconciliationLine {
  itemCode: string;
  descriptionEn: string;
  hsCode: string;
  uom: string;
  customsQty: number;
  warehouseQty: number;
  varianceQty: number; // warehouseQty - customsQty
  varianceReason?: 'CUTTING_WASTE' | 'PRODUCTION_SCRAP' | 'SAMPLE_CONSUMPTION' | 'DATA_ENTRY_ERROR' | 'UNRECORDED_DISPATCH' | 'OTHER';
  proposedAdjustmentQty?: number;
  remarks?: string;
}

// Module 12: Integrations & Notifications
export interface TallyExportLog {
  id: string;
  exportNo: string;
  exportType: 'PURCHASE_VOUCHER' | 'SALES_VOUCHER' | 'STOCK_JOURNAL' | 'DUTY_PAYMENT_VOUCHER';
  recordCount: number;
  generatedXmlString: string;
  exportedBy: string;
  exportedAt: string;
}

export interface NotificationLog {
  id: string;
  channel: 'EMAIL' | 'WHATSAPP' | 'SYSTEM_ALERT';
  recipient: string;
  recipientRole?: UserRole;
  subject: string;
  body: string;
  status: 'SENT' | 'PENDING' | 'FAILED';
  sentAt: string;
  relatedEntity: string;
}

// Audit Trail
export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  module: SystemModule;
  action: string;
  entityType: string;
  entityId: string;
  entityRef: string;
  timestamp: string;
  ipAddress: string;
  details: string;
  beforeState?: any;
  afterState?: any;
}

// Authentication & Session Management
export interface UserSession {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  lastActiveAt: string;
  isCurrent?: boolean;
}

export type RolePermissionsMap = Record<
  UserRole,
  Record<SystemModule, Record<'view' | 'create' | 'edit' | 'approve' | 'delete', boolean>>
>;

// Notification Outbox Queue
export interface OutboxMessage {
  id: string;
  event: string;
  channel: 'EMAIL' | 'WHATSAPP' | 'SYSTEM';
  recipient: string;
  recipientName?: string;
  subject: string;
  content: string;
  status: 'QUEUED' | 'SENT' | 'FAILED' | 'RETRYING';
  attempts: number;
  maxAttempts: number;
  lastAttemptAt?: string;
  errorMessage?: string;
  createdAt: string;
  sentAt?: string;
  metadata?: Record<string, any>;
}

// Saved Report Snapshots
export interface ReportSnapshot {
  id: string;
  reportCode: string;
  reportTitle: string;
  generatedBy: string;
  generatedAt: string;
  filtersUsed: Record<string, any>;
  totalRows: number;
  summaryMetrics: Record<string, any>;
  dataPreview: any[];
}

// Data Migration Staging Batch
export interface DataMigrationJob {
  id: string;
  entityName: string;
  fileName: string;
  uploadedBy: string;
  uploadedAt: string;
  totalRows: number;
  validRows: number;
  errorRows: number;
  status: 'STAGED' | 'VALIDATED' | 'COMMITTED' | 'ROLLED_BACK';
  committedAt?: string;
  committedBy?: string;
  errors: { rowNumber: number; column: string; message: string }[];
  stagedDataPreview: any[];
}
