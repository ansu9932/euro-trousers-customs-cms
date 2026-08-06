import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowUpFromLine,
  Search,
  Plus,
  Printer,
  History,
  CheckCircle2,
  ShieldCheck,
  Building,
  Sparkles,
  FileText,
  Boxes,
  Truck,
  Eye,
  Trash2,
} from 'lucide-react';
import { Declaration, DeclarationItem, DeclarationStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Drawer } from '../common/Drawer';

export const ExportDeclarationsModule: React.FC = () => {
  const {
    language,
    t,
    declarations,
    setDeclarations,
    currentUser,
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

  // New Export Form State
  const [newExportForm, setNewExportForm] = useState({
    invoiceNo: 'INV-EXP-2026-0312',
    invoiceDate: new Date().toISOString().split('T')[0],
    poSoNumber: 'PO-UK-RETAIL-449',
    partnerId: partners.find((p) => p.type === 'CUSTOMER')?.id || partners[1]?.id || '',
    countryOfDestination: 'United Kingdom',
    portOfLoading: 'Sharjah Khalid Port, UAE',
    portOfDischarge: 'Felixstowe Port, United Kingdom',
    transportMode: 'Sea' as any,
    blAwbNo: 'HLCU-EXP-LON-77182',
    currency: 'USD',
    exchangeRateToAED: 3.6725,
    containerNos: 'HLXU1129482',
    remarks: 'Export of finished men trousers manufactured in SAIF Zone Free Zone.',
  });

  const [exportItems, setExportItems] = useState<DeclarationItem[]>([
    {
      id: 'exp-item-1',
      itemCode: 'FIN-TRS-001',
      descriptionEn: "Men's 5-Pocket Indigo Denim Trousers 100% Cotton",
      hsCode: '6203.4200',
      quantity: 3500,
      uom: 'PCS',
      unitPrice: 16.5,
      cifValueOriginalCurrency: 57750,
      cifValueAED: 212086.88,
      dutyRatePercent: 0,
      dutyAmountAED: 0,
      vatRatePercent: 0,
      vatAmountAED: 0,
      totalAmountAED: 212086.88,
      freeZoneExempt: true,
    },
  ]);

  const query = (searchTerm || globalSearch).toLowerCase();

  const exportList = declarations
    .filter((d) => d.declarationType === 'EXPORT')
    .filter((d) => (statusFilter === 'ALL' ? true : d.status === statusFilter))
    .filter(
      (d) =>
        (d.declarationNo || '').toLowerCase().includes(query) ||
        (d.invoiceNo || '').toLowerCase().includes(query) ||
        (d.partnerName || '').toLowerCase().includes(query) ||
        (d.saifZoneCustomsRefNo ? d.saifZoneCustomsRefNo.toLowerCase().includes(query) : false)
    );

  const calculateTotals = () => {
    const totalOriginal = exportItems.reduce(
      (acc, item) => acc + (item.cifValueOriginalCurrency || item.quantity * item.unitPrice),
      0
    );
    const totalAED = totalOriginal * newExportForm.exchangeRateToAED;
    return { totalOriginal, totalAED };
  };

  const totals = calculateTotals();

  const handleCreateExport = () => {
    const partner = partners.find((p) => p.id === newExportForm.partnerId) || partners[1];
    const newNo = `EXP-2026-${String(declarations.length + 1).padStart(4, '0')}`;

    const newDecl: Declaration = {
      id: `decl-exp-${Date.now()}`,
      declarationNo: newNo,
      version: 1,
      declarationType: 'EXPORT',
      status: 'APPROVED',
      declarationDate: new Date().toISOString().split('T')[0],
      shipmentRef: `SHP-${newNo}`,
      invoiceNo: newExportForm.invoiceNo,
      invoiceDate: newExportForm.invoiceDate,
      poSoNumber: newExportForm.poSoNumber,
      partnerId: partner?.id || 'part-2',
      partnerName: partner?.nameEn || 'UK Fashion Brands Ltd',
      countryOfOrigin: 'United Arab Emirates (SAIF Zone)',
      countryOfDestination: newExportForm.countryOfDestination,
      portOfLoading: newExportForm.portOfLoading,
      portOfDischarge: newExportForm.portOfDischarge,
      customsOfficeId: 'co-1',
      customsOfficeName: 'SAIF Zone Customs Center, Sharjah',
      transportMode: newExportForm.transportMode,
      blAwbNo: newExportForm.blAwbNo,
      containerNos: [newExportForm.containerNos],
      currency: newExportForm.currency,
      exchangeRateToAED: newExportForm.exchangeRateToAED,
      totalValueOriginalCurrency: totals.totalOriginal,
      totalValueAED: totals.totalAED,
      totalDutyAED: 0, // 0% Free Zone Export
      totalVatAED: 0,
      totalCustomsChargesAED: 150,
      items: exportItems,
      attachedDocumentIds: [],
      remarks: newExportForm.remarks,
      createdBy: currentUser.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      workflowHistory: [
        {
          id: `wf-${Date.now()}`,
          fromStatus: 'DRAFT',
          toStatus: 'APPROVED',
          action: 'Export Declaration Approved (0% Free Zone Tariff)',
          performedBy: currentUser.name,
          userRole: currentUser.role,
          timestamp: new Date().toISOString(),
          remarks: 'Manufactured in SAIF Zone - 100% Export Exemption verified',
        },
      ],
    };

    setDeclarations([newDecl, ...declarations]);
    addAuditLog('CREATE_EXPORT_DECLARATION', 'export_declarations', 'DECLARATION', newDecl.id, newDecl.declarationNo, 'Created export declaration for finished garments');
    showToast(`Export declaration ${newNo} created successfully`);
    setIsNewDrawerOpen(false);
  };

  return (
    <div className="space-y-5">
      
      {/* Module Title & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E5E7EB] rounded-lg p-5 shadow-xs">
        <div>
          <h2 className="text-base font-semibold text-[#111827] flex items-center gap-2">
            <ArrowUpFromLine className="w-4 h-4 text-emerald-700" />
            <span>{t.nav_export}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
              0% Free Zone Tariff
            </span>
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Finished Garment Dispatches to UK, EU & GCC • Certificate of Origin Validation
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {hasPermission('export_declarations', 'create') && (
            <button
              onClick={() => setIsNewDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium bg-[#1E3A5F] hover:bg-[#152B47] text-white shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.btn_new_export}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-3 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {['ALL', 'APPROVED', 'CLEARED', 'GATE_PASS_ISSUED', 'CLOSED'].map((st) => (
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
                  ? (language === 'ar' ? 'جميع بيانات التصدير' : 'All Exports')
                  : ((st || '').replace(/_/g, ' '))}
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 absolute inset-y-0 start-2.5 my-auto text-[#9CA3AF]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search export declarations, buyer..."
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
                <th className="py-2.5 px-3.5 text-start">Destination / Buyer</th>
                <th className="py-2.5 px-3.5 text-start">Mode</th>
                <th className="py-2.5 px-3.5 text-end">Value (AED)</th>
                <th className="py-2.5 px-3.5 text-center">Export Duty</th>
                <th className="py-2.5 px-3.5 text-center">Status</th>
                <th className="py-2.5 px-3.5 text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {exportList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#6B7280]">
                    No export declarations match the selected filter.
                  </td>
                </tr>
              ) : (
                exportList.map((decl) => (
                  <tr key={decl.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-[#111827] font-mono">{decl.declarationNo}</div>
                      <div className="text-[11px] text-[#6B7280]">{decl.declarationDate}</div>
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="font-mono text-[#111827]">{decl.invoiceNo}</div>
                      <div className="text-[11px] text-[#6B7280] font-mono">{decl.blAwbNo || '—'}</div>
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="font-medium text-[#111827]">{decl.partnerName}</div>
                      <div className="text-[11px] text-[#6B7280]">Dest: {decl.countryOfDestination}</div>
                    </td>
                    <td className="py-3 px-3.5">
                      <span className="px-1.5 py-0.2 rounded bg-[#F3F4F6] text-[#374151] border border-[#E5E7EB] font-medium">
                        {decl.transportMode}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-end font-semibold font-mono text-[#111827] tabular-nums">
                      AED {decl.totalValueAED.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        0% Free Zone Exemption
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <StatusBadge status={decl.status} />
                    </td>
                    <td className="py-3 px-3.5 text-end">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedDecl(decl);
                            setIsDetailsDrawerOpen(true);
                          }}
                          className="p-1 rounded-md text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] border border-transparent hover:border-[#E5E7EB] transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setPrintDocData({
                              docType: 'EXPORT_DECLARATION',
                              declaration: decl,
                            });
                          }}
                          className="p-1 rounded-md text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] border border-transparent hover:border-[#E5E7EB] transition-colors"
                          title="Print Official Export Declaration"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Drawer */}
      <Drawer
        isOpen={isDetailsDrawerOpen}
        onClose={() => setIsDetailsDrawerOpen(false)}
        title={`Export Declaration: ${selectedDecl?.declarationNo}`}
        subtitle={`Buyer: ${selectedDecl?.partnerName} • Dest: ${selectedDecl?.countryOfDestination}`}
        width="xl"
      >
        {selectedDecl && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-2">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Invoice Value:</span>
                <span className="font-semibold text-[#0F172A] font-mono">AED {selectedDecl.totalValueAED.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Origin / Location:</span>
                <span className="text-[#0F172A]">Euro Trousers Warehouse Q4-081, SAIF Zone</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Discharge Port:</span>
                <span className="text-[#0F172A]">{selectedDecl.portOfDischarge || 'Felixstowe Port, UK'}</span>
              </div>
            </div>

            <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
              <table className="w-full text-xs text-start">
                <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#4B5563] font-semibold">
                  <tr>
                    <th className="py-2 px-3 text-start">Item</th>
                    <th className="py-2 px-3 text-start">HS Code</th>
                    <th className="py-2 px-3 text-end">Quantity</th>
                    <th className="py-2 px-3 text-end">CIF Value (AED)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {selectedDecl.items.map((item, i) => (
                    <tr key={i}>
                      <td className="py-2 px-3 font-medium text-[#111827]">{item.descriptionEn}</td>
                      <td className="py-2 px-3 font-mono text-[#1E3A5F]">{item.hsCode}</td>
                      <td className="py-2 px-3 text-end font-mono">{item.quantity.toLocaleString()} {item.uom}</td>
                      <td className="py-2 px-3 text-end font-mono font-semibold">
                        AED {(item.cifValueAED || item.quantity * item.unitPrice * 3.6725).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Drawer>

      {/* New Export Drawer */}
      <Drawer
        isOpen={isNewDrawerOpen}
        onClose={() => setIsNewDrawerOpen(false)}
        title="Create Export Declaration (Exit Bayan)"
        subtitle="SAIF Zone Finished Garments Export"
        width="2xl"
        footer={
          <>
            <button
              onClick={() => setIsNewDrawerOpen(false)}
              className="h-9 px-3.5 rounded-lg border border-[#E5E7EB] bg-white text-xs font-medium text-[#374151]"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateExport}
              className="h-9 px-4 rounded-lg bg-[#1E3A5F] text-white text-xs font-medium"
            >
              Create Export Bayan
            </button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-[#334155] mb-1">Invoice Number *</label>
              <input
                type="text"
                value={newExportForm.invoiceNo}
                onChange={(e) => setNewExportForm({ ...newExportForm, invoiceNo: e.target.value })}
                className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#CBD5E1]"
              />
            </div>
            <div>
              <label className="block font-medium text-[#334155] mb-1">Destination Country *</label>
              <input
                type="text"
                value={newExportForm.countryOfDestination}
                onChange={(e) => setNewExportForm({ ...newExportForm, countryOfDestination: e.target.value })}
                className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#CBD5E1]"
              />
            </div>
            <div>
              <label className="block font-medium text-[#334155] mb-1">Discharge Port</label>
              <input
                type="text"
                value={newExportForm.portOfDischarge}
                onChange={(e) => setNewExportForm({ ...newExportForm, portOfDischarge: e.target.value })}
                className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#CBD5E1]"
              />
            </div>
          </div>
        </div>
      </Drawer>

    </div>
  );
};
