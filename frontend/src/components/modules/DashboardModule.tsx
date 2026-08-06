import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole, Declaration } from '../../types';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Coins,
  ShieldCheck,
  AlertTriangle,
  Container,
  Clock,
  CheckCircle2,
  FileText,
  Plus,
  Scale,
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FileCheck2,
  Lock,
  Eye,
  History,
  Truck,
  Building,
  DollarSign,
  Layers,
  Check,
} from 'lucide-react';
import { KpiCard } from '../common/KpiCard';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { Drawer } from '../common/Drawer';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';

export const DashboardModule: React.FC = () => {
  const {
    t,
    declarations,
    setDeclarations,
    bankGuarantees,
    containers,
    holds,
    reconciliations,
    customsStock,
    warehouseStock,
    auditLogs,
    addAuditLog,
    setActiveModule,
    setIsAiModalOpen,
    currentUser,
    setCurrentUser,
    allUsers,
    showToast,
    setPrintDocData,
  } = useApp();

  const [selectedDeclForAction, setSelectedDeclForAction] = useState<Declaration | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [approvalNote, setApprovalNote] = useState('');
  const [approvalPin, setApprovalPin] = useState('');

  // Calculations
  const importCount = declarations.filter((d) => d.declarationType === 'IMPORT').length;
  const exportCount = declarations.filter((d) => d.declarationType === 'EXPORT').length;
  const transferCount = declarations.filter((d) => d.declarationType === 'TRANSFER').length;

  const pendingApprovals = declarations.filter((d) =>
    ['L1_PREPARED', 'L2_REVIEWED', 'L3_FINANCE_APPROVED', 'L4_GM_APPROVED'].includes(d.status)
  );

  const activeHolds = holds.filter((h) => h.status === 'ACTIVE_HOLD');
  const urgentContainers = containers.filter((c) => c.status === 'AT_WAREHOUSE');
  const totalBgAmount = bankGuarantees.reduce((acc, b) => acc + b.amountAED, 0);
  const totalBgUtilized = bankGuarantees.reduce((acc, b) => acc + b.utilizedAmountAED, 0);
  const bgAvailable = totalBgAmount - totalBgUtilized;

  const totalCustomsQty = customsStock.reduce((acc, c) => acc + c.closingCustomsBalance, 0);
  const totalVariances = reconciliations[0]?.itemsWithVariance || 0;

  // Chart Data: Monthly Customs Clearance Volume (Muted, professional palette)
  const monthlyData = [
    { month: 'Mar', imports: 410, exports: 320, dutySaved: 38 },
    { month: 'Apr', imports: 460, exports: 380, dutySaved: 42 },
    { month: 'May', imports: 490, exports: 410, dutySaved: 46 },
    { month: 'Jun', imports: 520, exports: 470, dutySaved: 51 },
    { month: 'Jul', imports: 580, exports: 510, dutySaved: 58 },
    { month: 'Aug (Cur)', imports: 520, exports: 490, dutySaved: 54 },
  ];

  // Quick Approval Handler
  const handleSignOff = () => {
    if (!selectedDeclForAction) return;

    let nextStatus: any = 'APPROVED';
    if (selectedDeclForAction.status === 'L1_PREPARED') nextStatus = 'L2_REVIEWED';
    else if (selectedDeclForAction.status === 'L2_REVIEWED') nextStatus = 'L3_FINANCE_APPROVED';
    else if (selectedDeclForAction.status === 'L3_FINANCE_APPROVED') {
      nextStatus = selectedDeclForAction.totalValueAED >= 100000 ? 'L4_GM_APPROVED' : 'APPROVED';
    } else if (selectedDeclForAction.status === 'L4_GM_APPROVED') {
      nextStatus = 'APPROVED';
    }

    setDeclarations((prev) =>
      prev.map((d) =>
        d.id === selectedDeclForAction.id
          ? {
              ...d,
              status: nextStatus,
              updatedAt: new Date().toISOString(),
              workflowHistory: [
                ...d.workflowHistory,
                {
                  id: `wf-${Date.now()}`,
                  fromStatus: d.status,
                  toStatus: nextStatus,
                  action: `Approved by ${currentUser.name} (${currentUser.role})`,
                  performedBy: currentUser.name,
                  userRole: currentUser.role,
                  timestamp: new Date().toISOString(),
                  remarks: approvalNote || 'Direct approval from dashboard',
                },
              ],
            }
          : d
      )
    );

    addAuditLog(
      'WORKFLOW_APPROVAL',
      'import_declarations',
      'DECLARATION',
      selectedDeclForAction.id,
      selectedDeclForAction.declarationNo,
      `Advanced workflow to ${nextStatus}. Note: ${approvalNote || 'None'}`
    );

    showToast(`${selectedDeclForAction.declarationNo} advanced to ${nextStatus}`);
    setIsApproveModalOpen(false);
    setSelectedDeclForAction(null);
    setApprovalNote('');
    setApprovalPin('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header: Title, Live Status & Role Context Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-[#E5E7EB] rounded-lg p-5 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-lg font-semibold text-[#111827] tracking-tight">
              {t.dashboard_title}
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              SAIF Zone Live Link
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#F1F5F9] text-[#1E3A5F] border border-[#E2E8F0]">
              Role: {currentUser.role}
            </span>
          </div>
          <p className="text-xs text-[#6B7280]">
            EURO TROUSERS MFG. CO. (FZC) • Plot Q4-081 & Q4-082 • Sharjah Customs ePortal Gateway
          </p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn-quick-import"
            onClick={() => setActiveModule('import_declarations')}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium bg-[#1E3A5F] hover:bg-[#152B47] text-white shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.btn_new_import}</span>
          </button>
          <button
            id="btn-quick-export"
            onClick={() => setActiveModule('export_declarations')}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#374151] hover:text-[#111827] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.btn_new_export}</span>
          </button>
          <button
            id="btn-quick-ai"
            onClick={() => setIsAiModalOpen(true)}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#374151] hover:text-[#111827] transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#1E3A5F]" />
            <span>HS Code Advisor</span>
          </button>
        </div>
      </div>

      {/* Role-Specific Perspective Bar: Allows one-click role switching */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-3 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#111827] uppercase tracking-wider">
              10 Role-Based Landing Views
            </span>
            <span className="text-[11px] text-[#6B7280]">
              Switch perspective to view tailored workspace for each role
            </span>
          </div>
          <span className="text-[11px] text-[#1E3A5F] font-medium">
            Active: {currentUser.name} ({currentUser.role})
          </span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {allUsers.map((u) => (
            <button
              key={u.id}
              onClick={() => setCurrentUser(u)}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors border text-xs ${
                currentUser.id === u.id
                  ? 'bg-[#1E3A5F] text-white border-[#1E3A5F] font-medium'
                  : 'bg-[#F9FAFB] text-[#4B5563] border-[#E5E7EB] hover:bg-[#F3F4F6] hover:text-[#111827]'
              }`}
            >
              {u.role}: {u.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 10 TAILORED ROLE WORKSPACES                                               */}
      {/* ========================================================================= */}

      {/* ROLE 1: DATA ENTRY OFFICER */}
      {currentUser.role === 'DATA_ENTRY' && (
        <div className="space-y-4">
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A]">
                Data Entry Command Center — My Drafts & Invoices
              </h3>
              <p className="text-xs text-[#64748B]">
                Enter raw material shipments, verify supplier commercial invoices, and create L1 preparation drafts.
              </p>
            </div>
            <button
              onClick={() => setActiveModule('import_declarations')}
              className="h-8 px-3 rounded-lg bg-[#1E3A5F] text-white text-xs font-medium hover:bg-[#152B47]"
            >
              + Create Declaration Draft
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="My Incomplete Drafts"
              value={declarations.filter((d) => d.status === 'DRAFT').length}
              subtitle="Pending HS item additions"
              trend={{ value: '2 Needs Review', isPositive: true }}
              onClick={() => setActiveModule('import_declarations')}
            />
            <KpiCard
              title="Recent Invoices Entered"
              value="18 This Month"
              subtitle="Cotton yarn, denim, zippers"
              trend={{ value: '↑ 14% MoM', isPositive: true }}
            />
            <KpiCard
              title="Item Master Database"
              value="142 Codes"
              subtitle="SAIF Zone pre-approved"
              onClick={() => setActiveModule('masters')}
            />
            <KpiCard
              title="Ready for L1 Review"
              value="3 Shipments"
              subtitle="Submitted to Doc Officer"
            />
          </div>
        </div>
      )}

      {/* ROLE 2: DOCUMENTATION OFFICER */}
      {currentUser.role === 'DOC_OFFICER' && (
        <div className="space-y-4">
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A]">
                Documentation & Bayan Preparation Desk
              </h3>
              <p className="text-xs text-[#64748B]">
                Verify Certificate of Origin (COO), Commercial Invoices, B/L, and prepare official Sharjah Bayan declaration files.
              </p>
            </div>
            <button
              onClick={() => setActiveModule('documents')}
              className="h-8 px-3 rounded-lg bg-[#1E3A5F] text-white text-xs font-medium hover:bg-[#152B47]"
            >
              Open Document Vault
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Ready for L1 Preparation"
              value={declarations.filter((d) => d.status === 'DRAFT').length}
              subtitle="Awaiting document verification"
              trend={{ value: 'Action Required', isPositive: false }}
              onClick={() => setActiveModule('import_declarations')}
            />
            <KpiCard
              title="Prepared This Week"
              value="12 Declarations"
              subtitle="Forwarded to Customs Mgr"
              trend={{ value: '↑ 8% vs Avg', isPositive: true }}
            />
            <KpiCard
              title="Documents in Vault"
              value="156 Records"
              subtitle="COO, Invoices, Delivery Orders"
              onClick={() => setActiveModule('documents')}
            />
            <KpiCard
              title="Missing Document Alerts"
              value="0 Missing"
              subtitle="100% compliance rate"
              trend={{ value: 'Clean', isPositive: true }}
            />
          </div>
        </div>
      )}

      {/* ROLE 3: CUSTOMS MANAGER */}
      {currentUser.role === 'CUSTOMS_MGR' && (
        <div className="space-y-4">
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A]">
                Customs Compliance & Tariff Review Desk
              </h3>
              <p className="text-xs text-[#64748B]">
                Verify L2 declarations, confirm Free Zone tariff exemption criteria, and manage customs inspection holds.
              </p>
            </div>
            <button
              onClick={() => setActiveModule('inspections')}
              className="h-8 px-3 rounded-lg bg-[#1E3A5F] text-white text-xs font-medium hover:bg-[#152B47]"
            >
              View Active Holds ({activeHolds.length})
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Awaiting L2 Verification"
              value={declarations.filter((d) => d.status === 'L1_PREPARED').length}
              subtitle="Customs Manager review queue"
              trend={{ value: 'Immediate Priority', isPositive: false }}
              onClick={() => setActiveModule('import_declarations')}
            />
            <KpiCard
              title="Active Customs Holds"
              value={`${activeHolds.length} Shipment`}
              subtitle="Escalation countdown active"
              trend={{ value: 'Under follow-up', isPositive: false }}
              onClick={() => setActiveModule('inspections')}
            />
            <KpiCard
              title="Exemption Audit Score"
              value="100%"
              subtitle="0% Duty on SAIF exports"
              trend={{ value: 'Fully compliant', isPositive: true }}
            />
            <KpiCard
              title="Clearance Cycle Time"
              value="1.8 Hours"
              subtitle="Submission to approval"
              trend={{ value: 'Fast Turnaround', isPositive: true }}
            />
          </div>
        </div>
      )}

      {/* ROLE 4: FINANCE OFFICER */}
      {currentUser.role === 'FINANCE' && (
        <div className="space-y-4">
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A]">
                Customs Duty, VAT & Bank Guarantee Desk
              </h3>
              <p className="text-xs text-[#64748B]">
                Authorize L3 duty signoffs, track Bank Guarantee running balance, and monitor duty refund claims.
              </p>
            </div>
            <button
              onClick={() => setActiveModule('duty_finance')}
              className="h-8 px-3 rounded-lg bg-[#1E3A5F] text-white text-xs font-medium hover:bg-[#152B47]"
            >
              Open Finance Ledger
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Awaiting L3 Signoff"
              value={declarations.filter((d) => d.status === 'L2_REVIEWED').length}
              subtitle="Duty & VAT authorization"
              onClick={() => setActiveModule('import_declarations')}
            />
            <KpiCard
              title="Bank Guarantee Balance"
              value={`AED ${(bgAvailable / 1000).toFixed(0)}k`}
              subtitle={`AED ${(totalBgAmount / 1000).toFixed(0)}k Facility`}
              trend={{ value: '64% Available', isPositive: true }}
              onClick={() => setActiveModule('duty_finance')}
            />
            <KpiCard
              title="Duty Refunds Under Review"
              value="AED 12,450"
              subtitle="2 claims with Sharjah Customs"
              onClick={() => setActiveModule('duty_finance')}
            />
            <KpiCard
              title="Demurrage Exposure"
              value="AED 0.00"
              subtitle="Zero late fees accrued"
              trend={{ value: 'Safe', isPositive: true }}
            />
          </div>
        </div>
      )}

      {/* ROLE 5: GENERAL MANAGER */}
      {currentUser.role === 'GM' && (
        <div className="space-y-4">
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A]">
                Executive Approval & High-Value Signoff Desk (&gt;AED 100,000)
              </h3>
              <p className="text-xs text-[#64748B]">
                Final executive signoff for high-value raw material import consignments and multi-container dispatches.
              </p>
            </div>
            <button
              onClick={() => setActiveModule('reports')}
              className="h-8 px-3 rounded-lg bg-[#1E3A5F] text-white text-xs font-medium hover:bg-[#152B47]"
            >
              Generate Executive Report
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Pending GM Signoff"
              value={
                declarations.filter(
                  (d) => d.status === 'L3_FINANCE_APPROVED' && d.totalValueAED >= 100000
                ).length
              }
              subtitle="Shipments > AED 100,000"
              trend={{ value: 'Sign-off Required', isPositive: false }}
              onClick={() => setActiveModule('import_declarations')}
            />
            <KpiCard
              title="Total Import Volume"
              value="AED 520,800"
              subtitle="Current month throughput"
              trend={{ value: '↑ 6.4% MoM', isPositive: true }}
            />
            <KpiCard
              title="Export Exemption Rate"
              value="100%"
              subtitle="AED 42.5k Duty Saved"
              trend={{ value: 'Optimal Free Zone', isPositive: true }}
            />
            <KpiCard
              title="SAIF Compliance Rating"
              value="100% Pass"
              subtitle="Zero customs penalties"
              trend={{ value: 'Audit-ready', isPositive: true }}
            />
          </div>
        </div>
      )}

      {/* ROLE 6: WAREHOUSE OFFICER */}
      {currentUser.role === 'WAREHOUSE' && (
        <div className="space-y-4">
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A]">
                Warehouse Receiving, Gate Passes & Unloading Dock
              </h3>
              <p className="text-xs text-[#64748B]">
                Issue security Gate Passes for trucks, inspect unloading seal numbers, and record physical inventory balances.
              </p>
            </div>
            <button
              onClick={() => setActiveModule('clearance')}
              className="h-8 px-3 rounded-lg bg-[#1E3A5F] text-white text-xs font-medium hover:bg-[#152B47]"
            >
              Issue Gate Pass
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Active Gate Passes"
              value="4 Issued"
              subtitle="SAIF security validated"
              onClick={() => setActiveModule('clearance')}
            />
            <KpiCard
              title="Containers at Warehouse"
              value={`${urgentContainers.length} Active`}
              subtitle="Unloading dock Q4-081"
              onClick={() => setActiveModule('containers')}
            />
            <KpiCard
              title="Stock Ledger Balance"
              value={`${totalCustomsQty.toLocaleString()} Units`}
              subtitle="Customs official ledger"
              onClick={() => setActiveModule('stock_reconciliation')}
            />
            <KpiCard
              title="Physical Count Variances"
              value={`${totalVariances} Items`}
              subtitle="Awaiting reconciliation"
              trend={{ value: 'Cutting scrap noted', isPositive: true }}
              onClick={() => setActiveModule('stock_reconciliation')}
            />
          </div>
        </div>
      )}

      {/* ROLE 7: LOGISTICS OFFICER */}
      {currentUser.role === 'LOGISTICS' && (
        <div className="space-y-4">
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A]">
                Shipping Line Demurrage Clock & Container Tracking
              </h3>
              <p className="text-xs text-[#64748B]">
                Monitor shipping line free days countdown (COSCO, Maersk, MSC) to guarantee zero late demurrage charges.
              </p>
            </div>
            <button
              onClick={() => setActiveModule('containers')}
              className="h-8 px-3 rounded-lg bg-[#1E3A5F] text-white text-xs font-medium hover:bg-[#152B47]"
            >
              Open Container Tracker
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Containers at Risk (<3 Free Days)"
              value="1 Container"
              subtitle="TGHU9918231 (COSCO)"
              trend={{ value: 'Return by 08-07', isPositive: false }}
              onClick={() => setActiveModule('containers')}
            />
            <KpiCard
              title="Containers In Transit"
              value="3 Units"
              subtitle="ETA Sharjah Khalid Port"
              onClick={() => setActiveModule('containers')}
            />
            <KpiCard
              title="Average Return Speed"
              value="3.2 Days"
              subtitle="Within 5-day free limit"
              trend={{ value: 'Excellent', isPositive: true }}
            />
            <KpiCard
              title="Active B/L Shipments"
              value="5 Shipments"
              subtitle="Sea & Air freight"
              onClick={() => setActiveModule('containers')}
            />
          </div>
        </div>
      )}

      {/* ROLE 8: AUDITOR */}
      {currentUser.role === 'AUDITOR' && (
        <div className="space-y-4">
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A]">
                Customs Audit Trail & Dual-Ledger Reconciliation
              </h3>
              <p className="text-xs text-[#64748B]">
                Immutable chronological log of all customs events, dual-ledger variance audits, and SAIF Zone tax proofs.
              </p>
            </div>
            <button
              onClick={() => setActiveModule('audit_trail')}
              className="h-8 px-3 rounded-lg bg-[#1E3A5F] text-white text-xs font-medium hover:bg-[#152B47]"
            >
              Export Audit Register
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Audit Log Entries"
              value={`${auditLogs.length} Records`}
              subtitle="Immutable SHA-verified"
              onClick={() => setActiveModule('audit_trail')}
            />
            <KpiCard
              title="Stock Reconciliation Variance"
              value={`${totalVariances} Items`}
              subtitle="Cutting scrap & sample consumption"
              onClick={() => setActiveModule('stock_reconciliation')}
            />
            <KpiCard
              title="Exemption Document Proofs"
              value="100% Verified"
              subtitle="Ready for FTA / Customs audit"
              trend={{ value: 'Full Compliance', isPositive: true }}
            />
            <KpiCard
              title="Record Retention"
              value="5 Years"
              subtitle="SAIF Zone compliance statute"
            />
          </div>
        </div>
      )}

      {/* ROLE 9: SYSTEM ADMIN */}
      {currentUser.role === 'ADMIN' && (
        <div className="space-y-4">
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A]">
                System Health, Security & RBAC Configuration
              </h3>
              <p className="text-xs text-[#64748B]">
                System Administrator control plane: 10 active RBAC roles, Sharjah ePortal gateway latency, and Tally ERP sync.
              </p>
            </div>
            <button
              onClick={() => setActiveModule('settings')}
              className="h-8 px-3 rounded-lg bg-[#1E3A5F] text-white text-xs font-medium hover:bg-[#152B47]"
            >
              System Settings
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Active RBAC Roles"
              value="10 Personas"
              subtitle="Fine-grained module access"
              onClick={() => setActiveModule('settings')}
            />
            <KpiCard
              title="Sharjah Gateway Link"
              value="14 ms Latency"
              subtitle="Direct API Mock Online"
              trend={{ value: 'Operational', isPositive: true }}
              onClick={() => setActiveModule('integrations')}
            />
            <KpiCard
              title="Tally XML Exports"
              value="4 Vouchers"
              subtitle="Accounting sync ready"
              onClick={() => setActiveModule('integrations')}
            />
            <KpiCard
              title="Audit Integrity"
              value="100% OK"
              subtitle="Zero tamper flags"
              trend={{ value: 'Protected', isPositive: true }}
            />
          </div>
        </div>
      )}

      {/* ROLE 10: VIEWER */}
      {currentUser.role === 'VIEWER' && (
        <div className="space-y-4">
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A]">
                Executive Trade & Operations Overview (Read-Only)
              </h3>
              <p className="text-xs text-[#64748B]">
                Aggregated business intelligence on import/export turnover, clearance cycle time, and customs duty savings.
              </p>
            </div>
            <button
              onClick={() => setActiveModule('reports')}
              className="h-8 px-3 rounded-lg bg-[#1E3A5F] text-white text-xs font-medium hover:bg-[#152B47]"
            >
              View Reports
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Total Declarations"
              value={declarations.length}
              subtitle="Imports, Exports, Transfers"
            />
            <KpiCard
              title="Cleared Shipments"
              value={declarations.filter((d) => d.status === 'CLEARED' || d.status === 'CLOSED').length}
              subtitle="Completed customs cycle"
            />
            <KpiCard
              title="Duty Saved in SAIF Zone"
              value="AED 54,200"
              subtitle="Free Zone tax exemption"
            />
            <KpiCard
              title="Gate Passes Issued"
              value="4 Passes"
              subtitle="Movement records"
            />
          </div>
        </div>
      )}

      {/* Critical Operational Alerts Banner */}
      {(urgentContainers.length > 0 || activeHolds.length > 0 || pendingApprovals.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {urgentContainers.length > 0 && (
            <div
              onClick={() => setActiveModule('containers')}
              className="p-3.5 bg-[#FFFBEB] border border-[#FDE68A] rounded-lg flex items-start gap-3 cursor-pointer hover:bg-[#FEF3C7] transition-colors"
            >
              <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold text-[#92400E]">
                  Demurrage Countdown (2 Days Left)
                </p>
                <p className="text-[#B45309] mt-0.5 leading-relaxed">
                  Container TGHU9918231 at warehouse. Return empty by 2026-08-07 to avoid AED 200/day.
                </p>
              </div>
            </div>
          )}

          {activeHolds.length > 0 && (
            <div
              onClick={() => setActiveModule('inspections')}
              className="p-3.5 bg-[#FEF2F2] border border-[#FECACA] rounded-lg flex items-start gap-3 cursor-pointer hover:bg-[#FEE2E2] transition-colors"
            >
              <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold text-[#991B1B]">
                  {activeHolds.length} Shipment Under Customs Hold
                </p>
                <p className="text-[#B91C1C] mt-0.5 leading-relaxed">
                  Physical inspection required for raw denim lot. Follow-up timer running.
                </p>
              </div>
            </div>
          )}

          {pendingApprovals.length > 0 && (
            <div
              onClick={() => setActiveModule('import_declarations')}
              className="p-3.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg flex items-start gap-3 cursor-pointer hover:bg-[#DBEAFE] transition-colors"
            >
              <Clock className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold text-[#1E40AF]">
                  {pendingApprovals.length} Declarations In Workflow
                </p>
                <p className="text-[#1D4ED8] mt-0.5 leading-relaxed">
                  Multi-tier signoff required before submission to Sharjah Customs ePortal.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Grid: Multi-Tier Workflow Approval Queue & Visual Clearance Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: 4-Tier Approval Workflow Action Queue */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
            <div>
              <h3 className="text-sm font-semibold text-[#111827] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#1E3A5F]" />
                <span>Multi-Tier Declaration Approval Workflow</span>
              </h3>
              <p className="text-xs text-[#6B7280]">
                L1 (Doc Officer) → L2 (Customs Mgr) → L3 (Finance) → L4 (GM &gt;100k)
              </p>
            </div>
            <button
              onClick={() => setActiveModule('import_declarations')}
              className="text-xs text-[#1E3A5F] hover:underline font-medium inline-flex items-center gap-1"
            >
              <span>{t.view_all}</span>
              <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </button>
          </div>

          <div className="space-y-2.5">
            {declarations.slice(0, 5).map((decl) => (
              <div
                key={decl.id}
                className="p-3 rounded-lg border border-[#E5E7EB] hover:border-[#1E3A5F]/30 bg-white hover:bg-[#F9FAFB] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-xs font-mono text-[#111827]">
                      {decl.declarationNo}
                    </span>
                    <StatusBadge status={decl.status} />
                    <span className="text-[11px] text-[#6B7280] font-mono">
                      Inv: {decl.invoiceNo}
                    </span>
                    {decl.saifZoneCustomsRefNo && (
                      <span className="text-[11px] px-1.5 py-0.2 rounded bg-[#F1F5F9] text-[#1E3A5F] font-mono border border-[#E2E8F0]">
                        Bayan: {decl.saifZoneCustomsRefNo}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#374151] truncate">
                    {decl.partnerName} • Origin: {decl.countryOfOrigin} • Dest: {decl.countryOfDestination}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <div className="text-end">
                    <div className="font-semibold text-xs text-[#111827] tabular-nums">
                      AED {decl.totalValueAED.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[11px] text-[#6B7280]">
                      Duty: AED {decl.totalDutyAED.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Quick Sign-off Button if in review */}
                    {['L1_PREPARED', 'L2_REVIEWED', 'L3_FINANCE_APPROVED', 'L4_GM_APPROVED'].includes(decl.status) && (
                      <button
                        onClick={() => {
                          setSelectedDeclForAction(decl);
                          setIsApproveModalOpen(true);
                        }}
                        className="h-8 px-2.5 rounded-md bg-[#1E3A5F] hover:bg-[#152B47] text-white text-xs font-medium transition-colors shadow-2xs"
                        title="Sign off workflow step"
                      >
                        Sign Off
                      </button>
                    )}

                    {/* View Details */}
                    <button
                      onClick={() => setActiveModule('import_declarations')}
                      className="p-1.5 rounded-md text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] border border-[#E5E7EB] transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Monthly Trade Volume & Exemption Statistics Chart */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div>
                <h3 className="text-sm font-semibold text-[#111827]">
                  Monthly Customs Throughput
                </h3>
                <p className="text-xs text-[#6B7280]">
                  Import vs Export volume (k AED)
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                +12% YoY
              </span>
            </div>

            {/* Muted, Professional Recharts Chart */}
            <div className="h-56 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      fontSize: '12px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                    }}
                  />
                  <Bar dataKey="imports" name="Imports (k AED)" fill="#1E3A5F" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="exports" name="Exports (k AED)" fill="#16A34A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#6B7280]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#1E3A5F]"></span>
              <span>Raw Materials</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#16A34A]"></span>
              <span>Finished Goods</span>
            </div>
            <button
              onClick={() => setActiveModule('reports')}
              className="text-[#1E3A5F] hover:underline font-medium"
            >
              Full Register →
            </button>
          </div>
        </div>

      </div>

      {/* Quick Approval Modal */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => {
          setIsApproveModalOpen(false);
          setSelectedDeclForAction(null);
        }}
        title="Workflow Sign-off Authorization"
        subtitle={`Advancing ${selectedDeclForAction?.declarationNo} (Current: ${selectedDeclForAction?.status})`}
        footer={
          <>
            <button
              onClick={() => setIsApproveModalOpen(false)}
              className="h-9 px-3.5 rounded-lg border border-[#E5E7EB] bg-white text-xs font-medium text-[#374151] hover:bg-[#F9FAFB]"
            >
              Cancel
            </button>
            <button
              onClick={handleSignOff}
              className="h-9 px-4 rounded-lg bg-[#1E3A5F] hover:bg-[#152B47] text-white text-xs font-medium shadow-2xs"
            >
              Confirm Sign-off
            </button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-1.5">
            <div className="flex justify-between">
              <span className="text-[#64748B]">Signee:</span>
              <span className="font-semibold text-[#0F172A]">{currentUser.name} ({currentUser.role})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Invoice:</span>
              <span className="font-mono text-[#0F172A]">{selectedDeclForAction?.invoiceNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Consignment Value:</span>
              <span className="font-semibold text-[#0F172A]">AED {selectedDeclForAction?.totalValueAED.toLocaleString()}</span>
            </div>
          </div>

          <div>
            <label className="block font-medium text-[#374151] mb-1">
              Sign-off Notes / Remarks
            </label>
            <input
              type="text"
              value={approvalNote}
              onChange={(e) => setApprovalNote(e.target.value)}
              placeholder="e.g. Commercial invoice verified against packing list"
              className="w-full h-9 px-3 bg-white text-xs rounded-lg border border-[#E5E7EB] focus:outline-none focus:ring-1 focus:ring-[#1E3A5F] focus:border-[#1E3A5F]"
            />
          </div>
        </div>
      </Modal>

    </div>
  );
};
