import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowDownToLine,
  Search,
  Plus,
  FileText,
  Printer,
  History,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building,
  Edit,
  Tag,
  Paperclip,
  Share2,
  Trash2,
  Check,
  Eye,
  Filter,
  Download,
} from 'lucide-react';
import { Declaration, DeclarationItem, DeclarationStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Drawer } from '../common/Drawer';
import { Modal } from '../common/Modal';

export const ImportDeclarationsModule: React.FC = () => {
  const {
    language,
    t,
    declarations,
    setDeclarations,
    currentUser,
    companySettings,
    hsCodes,
    partners,
    hasPermission,
    showToast,
    addAuditLog,
    setPrintDocData,
    globalSearch,
  } = useApp();

  const [selectedDecl, setSelectedDecl] = useState<Declaration | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isNewDrawerOpen, setIsNewDrawerOpen] = useState(false);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [isBayanModalOpen, setIsBayanModalOpen] = useState(false);
  const [bayanInput, setBayanInput] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isSignOffModalOpen, setIsSignOffModalOpen] = useState(false);
  const [signOffNote, setSignOffNote] = useState('');

  // New Declaration Form State
  const [newForm, setNewForm] = useState({
    invoiceNo: 'INV-2026-0892',
    invoiceDate: new Date().toISOString().split('T')[0],
    poSoNumber: 'PO-ET-2026-095',
    partnerId: partners[0]?.id || '',
    countryOfOrigin: 'China',
    countryOfDestination: 'United Arab Emirates',
    portOfLoading: 'Shanghai Port, China',
    portOfDischarge: 'Sharjah Khalid Port, UAE',
    transportMode: 'Sea' as any,
    blAwbNo: 'MSCU-SH-DXB-99844',
    currency: 'USD',
    exchangeRateToAED: 3.6725,
    containerNos: 'TGHU9918231',
    remarks: 'Import of raw cotton fabric for trousers production in SAIF Zone.',
  });

  const [formItems, setFormItems] = useState<DeclarationItem[]>([
    {
      id: 'item-new-1',
      itemCode: 'RAW-DNM-001',
      descriptionEn: 'Indigo Blue Woven Denim Fabric 100% Cotton 12oz',
      hsCode: '5209.4200',
      quantity: 5000,
      uom: 'MTR',
      unitPrice: 3.8,
      cifValueOriginalCurrency: 19000,
      cifValueAED: 69777.5,
      dutyRatePercent: 5,
      dutyAmountAED: 3488.88,
      vatRatePercent: 5,
      vatAmountAED: 3663.32,
      totalAmountAED: 69777.5,
      freeZoneExempt: true,
    },
  ]);

  const query = (searchTerm || globalSearch).toLowerCase();

  const importList = declarations
    .filter((d) => d.declarationType === 'IMPORT')
    .filter((d) => (statusFilter === 'ALL' ? true : d.status === statusFilter))
    .filter(
      (d) =>
        (d.declarationNo || '').toLowerCase().includes(query) ||
        (d.invoiceNo || '').toLowerCase().includes(query) ||
        (d.partnerName || '').toLowerCase().includes(query) ||
        (d.saifZoneCustomsRefNo ? d.saifZoneCustomsRefNo.toLowerCase().includes(query) : false)
    );

  // Auto Calculate Form Totals
  const calculateTotals = () => {
    const totalOriginal = formItems.reduce(
      (acc, item) => acc + (item.cifValueOriginalCurrency || item.quantity * item.unitPrice),
      0
    );
    const totalAED = totalOriginal * newForm.exchangeRateToAED;
    const totalDuty = formItems.reduce(
      (acc, item) => acc + (item.freeZoneExempt ? 0 : (item.cifValueAED || 0) * (item.dutyRatePercent / 100)),
      0
    );
    const totalVat = formItems.reduce(
      (acc, item) =>
        acc + (item.freeZoneExempt ? 0 : ((item.cifValueAED || 0) + item.dutyAmountAED) * (item.vatRatePercent / 100)),
      0
    );
    return { totalOriginal, totalAED, totalDuty, totalVat };
  };

  const totals = calculateTotals();

  // Create New Declaration
  const handleCreateDeclaration = () => {
    const partner = partners.find((p) => p.id === newForm.partnerId) || partners[0];
    const newNo = `IMP-2026-${String(declarations.length + 1).padStart(4, '0')}`;

    const newDecl: Declaration = {
      id: `decl-imp-${Date.now()}`,
      declarationNo: newNo,
      version: 1,
      declarationType: 'IMPORT',
      status: 'DRAFT',
      declarationDate: new Date().toISOString().split('T')[0],
      shipmentRef: `SHP-${newNo}`,
      invoiceNo: newForm.invoiceNo,
      invoiceDate: newForm.invoiceDate,
      poSoNumber: newForm.poSoNumber,
      partnerId: partner?.id || 'part-1',
      partnerName: partner?.nameEn || 'Direct Supplier',
      countryOfOrigin: newForm.countryOfOrigin,
      countryOfDestination: newForm.countryOfDestination,
      portOfLoading: newForm.portOfLoading,
      portOfDischarge: newForm.portOfDischarge,
      customsOfficeId: 'co-1',
      customsOfficeName: 'SAIF Zone Customs Center, Sharjah',
      transportMode: newForm.transportMode,
      blAwbNo: newForm.blAwbNo,
      containerNos: [newForm.containerNos],
      currency: newForm.currency,
      exchangeRateToAED: newForm.exchangeRateToAED,
      totalValueOriginalCurrency: totals.totalOriginal,
      totalValueAED: totals.totalAED,
      totalDutyAED: totals.totalDuty,
      totalVatAED: totals.totalVat,
      totalCustomsChargesAED: 150, // Standard Bayan processing charge
      items: formItems,
      attachedDocumentIds: [],
      remarks: newForm.remarks,
      createdBy: currentUser.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      workflowHistory: [
        {
          id: `wf-${Date.now()}`,
          fromStatus: 'DRAFT',
          toStatus: 'DRAFT',
          action: 'Created Initial Draft',
          performedBy: currentUser.name,
          userRole: currentUser.role,
          timestamp: new Date().toISOString(),
          remarks: 'Initial data entry from invoice',
        },
      ],
    };

    setDeclarations([newDecl, ...declarations]);
    addAuditLog('CREATE_DECLARATION', 'import_declarations', 'DECLARATION', newDecl.id, newDecl.declarationNo, 'Created draft import declaration');
    showToast(`Draft declaration ${newNo} created successfully`);
    setIsNewDrawerOpen(false);
  };

  // 4-Tier Workflow Advance
  const handleWorkflowAdvance = (decl: Declaration, targetStatus: DeclarationStatus, reason?: string) => {
    setDeclarations((prev) =>
      prev.map((d) => {
        if (d.id !== decl.id) return d;
        return {
          ...d,
          status: targetStatus,
          updatedAt: new Date().toISOString(),
          workflowHistory: [
            ...d.workflowHistory,
            {
              id: `wf-${Date.now()}`,
              fromStatus: d.status,
              toStatus: targetStatus,
              action: `Transitioned to ${targetStatus}`,
              performedBy: currentUser.name,
              userRole: currentUser.role,
              timestamp: new Date().toISOString(),
              remarks: reason || 'Approved via workflow system',
            },
          ],
        };
      })
    );

    addAuditLog(
      'WORKFLOW_CHANGE',
      'import_declarations',
      'DECLARATION',
      decl.id,
      decl.declarationNo,
      `Advanced workflow to ${targetStatus}`
    );

    showToast(`${decl.declarationNo} moved to ${targetStatus}`);
    if (selectedDecl?.id === decl.id) {
      setSelectedDecl({ ...decl, status: targetStatus });
    }
    setIsSignOffModalOpen(false);
    setIsRejectModalOpen(false);
  };

  // Record Sharjah Customs Bayan Number
  const handleRecordBayan = () => {
    if (!selectedDecl || !bayanInput.trim()) return;

    setDeclarations((prev) =>
      prev.map((d) =>
        d.id === selectedDecl.id
          ? {
              ...d,
              saifZoneCustomsRefNo: bayanInput.trim(),
              status: 'CLEARED',
              clearanceDate: new Date().toISOString().split('T')[0],
              updatedAt: new Date().toISOString(),
              workflowHistory: [
                ...d.workflowHistory,
                {
                  id: `wf-${Date.now()}`,
                  fromStatus: d.status,
                  toStatus: 'CLEARED',
                  action: `Recorded Sharjah Bayan #${bayanInput.trim()}`,
                  performedBy: currentUser.name,
                  userRole: currentUser.role,
                  timestamp: new Date().toISOString(),
                  remarks: 'Customs clearance officially recorded and verified',
                },
              ],
            }
          : d
      )
    );

    addAuditLog(
      'CUSTOMS_CLEARANCE',
      'import_declarations',
      'DECLARATION',
      selectedDecl.id,
      selectedDecl.declarationNo,
      `Recorded Sharjah Customs Bayan #${bayanInput.trim()}`
    );

    showToast(`Sharjah Customs Bayan #${bayanInput.trim()} recorded. Consignment CLEARED.`);
    setIsBayanModalOpen(false);
    setBayanInput('');
    if (selectedDecl) {
      setSelectedDecl({ ...selectedDecl, saifZoneCustomsRefNo: bayanInput.trim(), status: 'CLEARED' });
    }
  };

  return (
    <div className="space-y-5">
      
      {/* Module Title & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E5E7EB] rounded-lg p-5 shadow-xs">
        <div>
          <h2 className="text-base font-semibold text-[#111827] flex items-center gap-2">
            <ArrowDownToLine className="w-4 h-4 text-[#1E3A5F]" />
            <span>{t.nav_import}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#1E3A5F] border border-[#E2E8F0] font-medium">
              {importList.length} Declarations
            </span>
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            4-Tier Approval Workflow: L1 (Doc Officer) → L2 (Customs Mgr) → L3 (Finance) → L4 (GM &gt;100k)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {hasPermission('import_declarations', 'create') && (
            <button
              id="btn-new-import-declaration"
              onClick={() => setIsNewDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium bg-[#1E3A5F] hover:bg-[#152B47] text-white shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.btn_new_import}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-3 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {['ALL', 'DRAFT', 'L1_PREPARED', 'L2_REVIEWED', 'L3_FINANCE_APPROVED', 'L4_GM_APPROVED', 'CLEARED', 'ON_HOLD'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors border text-xs ${
                  statusFilter === st
                    ? 'bg-[#1E3A5F] text-white border-[#1E3A5F] font-medium'
                    : 'bg-[#F9FAFB] text-[#4B5563] border-[#E5E7EB] hover:bg-[#F3F4F6] hover:text-[#111827]'
                }`}
              >
                {st === 'ALL'
                  ? (language === 'ar' ? 'جميع بيانات الاستيراد' : 'All Imports')
                  : ((st || '').replace(/_/g, ' '))}
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 absolute inset-y-0 start-2.5 my-auto text-[#9CA3AF]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Bayan #, Inv #, Supplier..."
              className="w-full h-8 ps-8 pe-3 bg-[#F9FAFB] text-xs rounded-lg border border-[#E5E7EB] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#1E3A5F]"
            />
          </div>

        </div>
      </div>

      {/* Dense Sortable Enterprise Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start border-collapse">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#4B5563] font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3.5 text-start">Declaration #</th>
                <th className="py-2.5 px-3.5 text-start">Invoice / B/L</th>
                <th className="py-2.5 px-3.5 text-start">Supplier / Origin</th>
                <th className="py-2.5 px-3.5 text-start">Mode</th>
                <th className="py-2.5 px-3.5 text-end">Value (AED)</th>
                <th className="py-2.5 px-3.5 text-end">Duty (AED)</th>
                <th className="py-2.5 px-3.5 text-center">Status</th>
                <th className="py-2.5 px-3.5 text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {importList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#6B7280]">
                    No import declarations match the selected filter.
                  </td>
                </tr>
              ) : (
                importList.map((decl) => (
                  <tr
                    key={decl.id}
                    className="hover:bg-[#F9FAFB] transition-colors group"
                  >
                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-[#111827] font-mono">
                        {decl.declarationNo}
                      </div>
                      {decl.saifZoneCustomsRefNo && (
                        <div className="text-[11px] font-mono text-[#1E3A5F]">
                          Bayan: {decl.saifZoneCustomsRefNo}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="font-mono text-[#111827]">{decl.invoiceNo}</div>
                      <div className="text-[11px] text-[#6B7280] font-mono">{decl.blAwbNo || '—'}</div>
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="font-medium text-[#111827] truncate max-w-[180px]">
                        {decl.partnerName}
                      </div>
                      <div className="text-[11px] text-[#6B7280]">
                        {decl.countryOfOrigin} → Sharjah
                      </div>
                    </td>
                    <td className="py-3 px-3.5">
                      <span className="px-1.5 py-0.2 rounded bg-[#F3F4F6] text-[#374151] border border-[#E5E7EB] font-medium">
                        {decl.transportMode}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-end font-semibold font-mono text-[#111827] tabular-nums">
                      {decl.totalValueAED.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3.5 text-end font-mono text-[#4B5563] tabular-nums">
                      {decl.totalDutyAED === 0 ? (
                        <span className="text-emerald-700 font-medium">0% Free Zone</span>
                      ) : (
                        `AED ${decl.totalDutyAED.toLocaleString()}`
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <StatusBadge status={decl.status} />
                    </td>
                    <td className="py-3 px-3.5 text-end">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View & Detail Button */}
                        <button
                          onClick={() => {
                            setSelectedDecl(decl);
                            setIsDetailsDrawerOpen(true);
                          }}
                          className="p-1 rounded-md text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] border border-transparent hover:border-[#E5E7EB] transition-colors"
                          title="View Declaration Details & Items"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Print Document Button */}
                        <button
                          onClick={() => {
                            setPrintDocData({
                              docType: 'IMPORT_DECLARATION',
                              declaration: decl,
                            });
                          }}
                          className="p-1 rounded-md text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] border border-transparent hover:border-[#E5E7EB] transition-colors"
                          title="Print Official Declaration Copy"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {/* Record Official Bayan (If approved/submitted) */}
                        {['APPROVED', 'SUBMITTED', 'L4_GM_APPROVED'].includes(decl.status) && (
                          <button
                            onClick={() => {
                              setSelectedDecl(decl);
                              setIsBayanModalOpen(true);
                            }}
                            className="h-7 px-2 bg-[#1E3A5F] hover:bg-[#152B47] text-white rounded text-[11px] font-medium"
                          >
                            Record Bayan
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SLIDE-IN DRAWER: DECLARATION DETAILS & LINE ITEMS                         */}
      {/* ========================================================================= */}
      <Drawer
        isOpen={isDetailsDrawerOpen}
        onClose={() => setIsDetailsDrawerOpen(false)}
        title={`Import Declaration: ${selectedDecl?.declarationNo}`}
        subtitle={`Invoice: ${selectedDecl?.invoiceNo} • Supplier: ${selectedDecl?.partnerName}`}
        width="2xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <button
              onClick={() => {
                if (selectedDecl) {
                  setPrintDocData({
                    docType: 'IMPORT_DECLARATION',
                    declaration: selectedDecl,
                  });
                }
              }}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-[#E5E7EB] bg-white text-xs font-medium text-[#374151] hover:bg-[#F9FAFB]"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Official Declaration Copy</span>
            </button>

            <div className="flex items-center gap-2">
              {/* Advance Workflow Step */}
              {selectedDecl?.status === 'DRAFT' && hasPermission('import_declarations', 'create') && (
                <button
                  onClick={() => selectedDecl && handleWorkflowAdvance(selectedDecl, 'L1_PREPARED')}
                  className="h-9 px-3.5 rounded-lg bg-[#1E3A5F] hover:bg-[#152B47] text-white text-xs font-medium"
                >
                  Submit for L1 Review
                </button>
              )}

              {selectedDecl?.status === 'L1_PREPARED' && (currentUser.role === 'CUSTOMS_MGR' || currentUser.role === 'ADMIN') && (
                <button
                  onClick={() => selectedDecl && handleWorkflowAdvance(selectedDecl, 'L2_REVIEWED')}
                  className="h-9 px-3.5 rounded-lg bg-[#1E3A5F] hover:bg-[#152B47] text-white text-xs font-medium"
                >
                  Verify L2 (Customs Mgr)
                </button>
              )}

              {selectedDecl?.status === 'L2_REVIEWED' && (currentUser.role === 'FINANCE' || currentUser.role === 'ADMIN') && (
                <button
                  onClick={() => selectedDecl && handleWorkflowAdvance(selectedDecl, 'L3_FINANCE_APPROVED')}
                  className="h-9 px-3.5 rounded-lg bg-[#1E3A5F] hover:bg-[#152B47] text-white text-xs font-medium"
                >
                  Approve L3 (Finance)
                </button>
              )}

              {selectedDecl?.status === 'L3_FINANCE_APPROVED' && selectedDecl.totalValueAED >= 100000 && (currentUser.role === 'GM' || currentUser.role === 'ADMIN') && (
                <button
                  onClick={() => selectedDecl && handleWorkflowAdvance(selectedDecl, 'L4_GM_APPROVED')}
                  className="h-9 px-3.5 rounded-lg bg-[#1E3A5F] hover:bg-[#152B47] text-white text-xs font-medium"
                >
                  Sign Off L4 (GM)
                </button>
              )}

              {['L3_FINANCE_APPROVED', 'L4_GM_APPROVED', 'APPROVED'].includes(selectedDecl?.status || '') && (
                <button
                  onClick={() => {
                    setIsDetailsDrawerOpen(false);
                    setIsBayanModalOpen(true);
                  }}
                  className="h-9 px-3.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium"
                >
                  Record Sharjah Bayan
                </button>
              )}
            </div>
          </div>
        }
      >
        {selectedDecl && (
          <div className="space-y-6 text-xs">
            
            {/* Top Status & Summary Card */}
            <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm font-mono text-[#0F172A]">
                    {selectedDecl.declarationNo}
                  </span>
                  <StatusBadge status={selectedDecl.status} />
                </div>
                <div className="text-end">
                  <div className="font-semibold text-sm text-[#0F172A] tabular-nums font-mono">
                    AED {selectedDecl.totalValueAED.toLocaleString()}
                  </div>
                  <div className="text-[#64748B] text-[11px]">
                    Duty: AED {selectedDecl.totalDutyAED.toLocaleString()} • VAT: AED {selectedDecl.totalVatAED.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[#E2E8F0]">
                <div>
                  <span className="text-[#64748B] block">Invoice Date:</span>
                  <span className="font-medium text-[#0F172A]">{selectedDecl.invoiceDate}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block">Origin Country:</span>
                  <span className="font-medium text-[#0F172A]">{selectedDecl.countryOfOrigin}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block">Port of Loading:</span>
                  <span className="font-medium text-[#0F172A]">{selectedDecl.portOfLoading || 'Shanghai'}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block">Discharge Port:</span>
                  <span className="font-medium text-[#0F172A]">{selectedDecl.portOfDischarge || 'Sharjah Khalid Port'}</span>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="space-y-2">
              <h4 className="font-semibold text-xs text-[#111827] uppercase tracking-wider">
                Consignment Items & HS Code Tariff Breakdown
              </h4>

              <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
                <table className="w-full text-xs text-start">
                  <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#4B5563] font-semibold">
                    <tr>
                      <th className="py-2 px-3 text-start">Item & Description</th>
                      <th className="py-2 px-3 text-start">HS Code</th>
                      <th className="py-2 px-3 text-end">Quantity</th>
                      <th className="py-2 px-3 text-end">Unit Price</th>
                      <th className="py-2 px-3 text-end">CIF Value (AED)</th>
                      <th className="py-2 px-3 text-end">Duty / Exemption</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {selectedDecl.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#F9FAFB]">
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-[#111827]">{item.descriptionEn}</div>
                          <div className="text-[11px] font-mono text-[#6B7280]">{item.itemCode}</div>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-medium text-[#1E3A5F]">
                          {item.hsCode}
                        </td>
                        <td className="py-2.5 px-3 text-end font-mono tabular-nums">
                          {item.quantity.toLocaleString()} {item.uom}
                        </td>
                        <td className="py-2.5 px-3 text-end font-mono tabular-nums">
                          ${item.unitPrice.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-end font-semibold font-mono tabular-nums">
                          AED {(item.cifValueAED || item.quantity * item.unitPrice * 3.6725).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-end font-medium">
                          {item.freeZoneExempt ? (
                            <span className="text-emerald-700 font-medium">0% SAIF Exempt</span>
                          ) : (
                            <span className="font-mono">AED {item.dutyAmountAED.toLocaleString()}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Workflow Audit Trail History */}
            <div className="space-y-2">
              <h4 className="font-semibold text-xs text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-[#6B7280]" />
                <span>Declaration Workflow Progression Trail</span>
              </h4>

              <div className="border border-[#E5E7EB] rounded-lg p-3 divide-y divide-[#E5E7EB] bg-white">
                {selectedDecl.workflowHistory.map((wf, idx) => (
                  <div key={idx} className="py-2 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#111827]">{wf.action}</span>
                        <span className="text-[10px] text-[#6B7280] font-mono">{wf.performedBy} ({wf.userRole})</span>
                      </div>
                      {wf.remarks && <p className="text-[#6B7280] text-[11px] mt-0.5">{wf.remarks}</p>}
                    </div>
                    <span className="text-[11px] font-mono text-[#9CA3AF] shrink-0">
                      {new Date(wf.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </Drawer>

      {/* ========================================================================= */}
      {/* SLIDE-IN DRAWER: NEW DECLARATION CREATOR                                  */}
      {/* ========================================================================= */}
      <Drawer
        isOpen={isNewDrawerOpen}
        onClose={() => setIsNewDrawerOpen(false)}
        title="Create Import Customs Declaration (Bayan)"
        subtitle="SAIF Zone Free Zone Raw Material Inward Consignment"
        width="2xl"
        footer={
          <>
            <button
              onClick={() => setIsNewDrawerOpen(false)}
              className="h-9 px-3.5 rounded-lg border border-[#E5E7EB] bg-white text-xs font-medium text-[#374151] hover:bg-[#F9FAFB]"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateDeclaration}
              className="h-9 px-4 rounded-lg bg-[#1E3A5F] hover:bg-[#152B47] text-white text-xs font-medium shadow-2xs"
            >
              Save & Generate Declaration
            </button>
          </>
        }
      >
        <div className="space-y-5 text-xs">
          
          {/* Shipment & Commercial Invoice Info */}
          <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-4">
            <h4 className="font-semibold text-xs text-[#0F172A] uppercase tracking-wider">
              1. Commercial Invoice & Shipping Reference
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-[#334155] mb-1">Invoice Number *</label>
                <input
                  type="text"
                  value={newForm.invoiceNo}
                  onChange={(e) => setNewForm({ ...newForm, invoiceNo: e.target.value })}
                  className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#CBD5E1] focus:ring-1 focus:ring-[#1E3A5F]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#334155] mb-1">Invoice Date *</label>
                <input
                  type="date"
                  value={newForm.invoiceDate}
                  onChange={(e) => setNewForm({ ...newForm, invoiceDate: e.target.value })}
                  className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#CBD5E1] focus:ring-1 focus:ring-[#1E3A5F]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#334155] mb-1">Purchase Order #</label>
                <input
                  type="text"
                  value={newForm.poSoNumber}
                  onChange={(e) => setNewForm({ ...newForm, poSoNumber: e.target.value })}
                  className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#CBD5E1] focus:ring-1 focus:ring-[#1E3A5F]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#334155] mb-1">Supplier / Partner *</label>
                <select
                  value={newForm.partnerId}
                  onChange={(e) => setNewForm({ ...newForm, partnerId: e.target.value })}
                  className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#CBD5E1] focus:ring-1 focus:ring-[#1E3A5F]"
                >
                  {partners.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nameEn} ({p.countryCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-[#334155] mb-1">Country of Origin *</label>
                <input
                  type="text"
                  value={newForm.countryOfOrigin}
                  onChange={(e) => setNewForm({ ...newForm, countryOfOrigin: e.target.value })}
                  className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#CBD5E1] focus:ring-1 focus:ring-[#1E3A5F]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#334155] mb-1">Transport Mode</label>
                <select
                  value={newForm.transportMode}
                  onChange={(e) => setNewForm({ ...newForm, transportMode: e.target.value as any })}
                  className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#CBD5E1] focus:ring-1 focus:ring-[#1E3A5F]"
                >
                  <option value="Sea">Sea Freight (Khalid Port)</option>
                  <option value="Air">Air Freight (Sharjah Airport)</option>
                  <option value="Land">Land Border (Khatm Al Shikla)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-[#334155] mb-1">B/L or AWB Number</label>
                <input
                  type="text"
                  value={newForm.blAwbNo}
                  onChange={(e) => setNewForm({ ...newForm, blAwbNo: e.target.value })}
                  className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#CBD5E1] focus:ring-1 focus:ring-[#1E3A5F]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#334155] mb-1">Container Number</label>
                <input
                  type="text"
                  value={newForm.containerNos}
                  onChange={(e) => setNewForm({ ...newForm, containerNos: e.target.value })}
                  className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#CBD5E1] focus:ring-1 focus:ring-[#1E3A5F]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#334155] mb-1">Exchange Rate (USD → AED)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={newForm.exchangeRateToAED}
                  onChange={(e) => setNewForm({ ...newForm, exchangeRateToAED: parseFloat(e.target.value) || 3.6725 })}
                  className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#CBD5E1] focus:ring-1 focus:ring-[#1E3A5F]"
                />
              </div>
            </div>
          </div>

          {/* Line Items Editor */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-xs text-[#111827] uppercase tracking-wider">
                2. Consignment Items & Tariff Codes
              </h4>
              <button
                type="button"
                onClick={() =>
                  setFormItems([
                    ...formItems,
                    {
                      id: `item-${Date.now()}`,
                      itemCode: 'RAW-ZIP-001',
                      descriptionEn: 'Brass Metal Zippers #5 Heavy Duty',
                      hsCode: '9607.1100',
                      quantity: 10000,
                      uom: 'PCS',
                      unitPrice: 0.25,
                      cifValueOriginalCurrency: 2500,
                      cifValueAED: 9181.25,
                      dutyRatePercent: 5,
                      dutyAmountAED: 459.06,
                      vatRatePercent: 5,
                      vatAmountAED: 482.02,
                      totalAmountAED: 9181.25,
                      freeZoneExempt: true,
                    },
                  ])
                }
                className="inline-flex items-center gap-1 text-xs text-[#1E3A5F] hover:underline font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Item Row</span>
              </button>
            </div>

            <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
              <table className="w-full text-xs text-start">
                <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#4B5563] font-semibold">
                  <tr>
                    <th className="py-2 px-3 text-start">Description</th>
                    <th className="py-2 px-3 text-start">HS Code</th>
                    <th className="py-2 px-3 text-end">Qty</th>
                    <th className="py-2 px-3 text-end">Price ($)</th>
                    <th className="py-2 px-3 text-end">Total (AED)</th>
                    <th className="py-2 px-3 text-center">SAIF Exempt</th>
                    <th className="py-2 px-2 text-center">Del</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {formItems.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-[#F9FAFB]">
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.descriptionEn}
                          onChange={(e) => {
                            const updated = [...formItems];
                            updated[idx].descriptionEn = e.target.value;
                            setFormItems(updated);
                          }}
                          className="w-full h-7 px-2 bg-white rounded border border-[#E5E7EB]"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.hsCode}
                          onChange={(e) => {
                            const updated = [...formItems];
                            updated[idx].hsCode = e.target.value;
                            setFormItems(updated);
                          }}
                          className="w-24 h-7 px-2 bg-white rounded border border-[#E5E7EB] font-mono"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const updated = [...formItems];
                            const qty = parseFloat(e.target.value) || 0;
                            updated[idx].quantity = qty;
                            updated[idx].cifValueOriginalCurrency = qty * updated[idx].unitPrice;
                            updated[idx].cifValueAED = updated[idx].cifValueOriginalCurrency * newForm.exchangeRateToAED;
                            setFormItems(updated);
                          }}
                          className="w-20 h-7 px-2 text-end bg-white rounded border border-[#E5E7EB] font-mono"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => {
                            const updated = [...formItems];
                            const prc = parseFloat(e.target.value) || 0;
                            updated[idx].unitPrice = prc;
                            updated[idx].cifValueOriginalCurrency = updated[idx].quantity * prc;
                            updated[idx].cifValueAED = updated[idx].cifValueOriginalCurrency * newForm.exchangeRateToAED;
                            setFormItems(updated);
                          }}
                          className="w-20 h-7 px-2 text-end bg-white rounded border border-[#E5E7EB] font-mono"
                        />
                      </td>
                      <td className="p-2 text-end font-semibold font-mono tabular-nums">
                        AED {((item.quantity * item.unitPrice) * newForm.exchangeRateToAED).toLocaleString()}
                      </td>
                      <td className="p-2 text-center">
                        <input
                          type="checkbox"
                          checked={item.freeZoneExempt}
                          onChange={(e) => {
                            const updated = [...formItems];
                            updated[idx].freeZoneExempt = e.target.checked;
                            setFormItems(updated);
                          }}
                          className="rounded border-[#CBD5E1] text-[#1E3A5F] focus:ring-[#1E3A5F]"
                        />
                      </td>
                      <td className="p-2 text-center">
                        {formItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setFormItems(formItems.filter((_, i) => i !== idx))}
                            className="text-[#9CA3AF] hover:text-[#DC2626]"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals Summary Footer */}
          <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] flex items-center justify-between">
            <span className="font-semibold text-xs text-[#0F172A]">Calculated Consignment Value:</span>
            <div className="text-end">
              <span className="text-base font-bold text-[#0F172A] font-mono tabular-nums">
                AED {totals.totalAED.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <p className="text-[11px] text-[#64748B]">
                Duty Exemption: 100% Free Zone Manufacturing Rate
              </p>
            </div>
          </div>

        </div>
      </Drawer>

      {/* ========================================================================= */}
      {/* MODAL: RECORD SHARJAH CUSTOMS BAYAN NUMBER                                */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isBayanModalOpen}
        onClose={() => setIsBayanModalOpen(false)}
        title="Record Official Sharjah Customs Bayan Reference #"
        subtitle={`Linking official Bayan clearance for declaration ${selectedDecl?.declarationNo}`}
        footer={
          <>
            <button
              onClick={() => setIsBayanModalOpen(false)}
              className="h-9 px-3.5 rounded-lg border border-[#E5E7EB] bg-white text-xs font-medium text-[#374151] hover:bg-[#F9FAFB]"
            >
              Cancel
            </button>
            <button
              onClick={handleRecordBayan}
              className="h-9 px-4 rounded-lg bg-[#1E3A5F] hover:bg-[#152B47] text-white text-xs font-medium"
            >
              Confirm Clearance
            </button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <p className="text-[#6B7280]">
            Enter the 12-digit official Bayan reference number issued by Sharjah Customs Authority upon document clearance:
          </p>

          <div>
            <label className="block font-medium text-[#374151] mb-1">
              Sharjah Customs Bayan Ref # *
            </label>
            <input
              type="text"
              value={bayanInput}
              onChange={(e) => setBayanInput(e.target.value)}
              placeholder="e.g. BYN-2026-SHJ-098231"
              className="w-full h-9 px-3 bg-white text-xs rounded-lg border border-[#E5E7EB] focus:outline-none focus:ring-1 focus:ring-[#1E3A5F] font-mono"
            />
          </div>
        </div>
      </Modal>

    </div>
  );
};
