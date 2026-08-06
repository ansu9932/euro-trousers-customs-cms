import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowLeftRight,
  Search,
  Plus,
  Printer,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Building,
  Clock,
} from 'lucide-react';
import { Declaration, TransferType } from '../../types';
import { KpiCard } from '../common/KpiCard';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';

export const TransferDeclarationsModule: React.FC = () => {
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

  const [selectedDecl, setSelectedDecl] = useState<Declaration | null>(
    declarations.find((d) => d.declarationType === 'TRANSFER') || null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [transferTypeFilter, setTransferTypeFilter] = useState<string>('ALL');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // New Transfer Form State
  const [newTransfer, setNewTransfer] = useState({
    transferType: 'TEMPORARY_TRANSFER' as TransferType,
    partnerName: 'Ajman Industrial Garment Washing & Finishing Works LLC',
    countryOfDestination: 'United Arab Emirates (Ajman Mainland)',
    dueBackDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    remarks: 'Temporary transfer of cut trouser panels for stone washing and finishing. Due back in 14 days.',
    itemCode: 'WIP-TRS-001',
    descriptionEn: 'Cut & Stitched Denim Trousers (Unwashed, Semi-Finished)',
    hsCode: '6203.4200',
    quantity: 1500,
    uom: 'PCS',
    unitPrice: 8.5,
    cifValueAED: 46824.38,
  });

  const query = (searchTerm || globalSearch).toLowerCase();

  const transferList = declarations
    .filter((d) => d.declarationType === 'TRANSFER')
    .filter((d) => (transferTypeFilter === 'ALL' ? true : d.transferType === transferTypeFilter))
    .filter(
      (d) =>
        (d.declarationNo || '').toLowerCase().includes(query) ||
        (d.partnerName || '').toLowerCase().includes(query) ||
        (d.saifZoneCustomsRefNo ? d.saifZoneCustomsRefNo.toLowerCase().includes(query) : false)
    );

  const handleCreateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const year = new Date().getFullYear();
    const count = declarations.filter((d) => d.declarationType === 'TRANSFER').length + 1;
    const declNo = `TRN-${year}-${String(count).padStart(4, '0')}`;

    const newDecl: Declaration = {
      id: `decl-trn-${Date.now()}`,
      declarationNo: declNo,
      version: 1,
      status: 'DRAFT',
      declarationDate: new Date().toISOString().split('T')[0],
      shipmentRef: `SHP-${year}-TRN-${String(count).padStart(3, '0')}`,
      invoiceNo: `TRN-NOTE-${year}-${String(count).padStart(3, '0')}`,
      invoiceDate: new Date().toISOString().split('T')[0],
      poSoNumber: 'JOB-ORDER-2026-881',
      partnerId: 'bp-3',
      partnerName: newTransfer.partnerName,
      countryOfOrigin: 'United Arab Emirates (SAIF Zone)',
      countryOfDestination: newTransfer.countryOfDestination,
      portOfLoading: 'SAIF Zone Warehouse Gate',
      portOfDischarge: newTransfer.countryOfDestination,
      customsOfficeId: 'co-1',
      customsOfficeName: 'Sharjah Airport International Free Zone Customs Authority',
      transportMode: 'Land',
      blAwbNo: `DEL-NOTE-${declNo}`,
      containerNos: [],
      sealNumbers: ['SL-TRN-7718'],
      currency: 'AED',
      exchangeRateToAED: 1.0,
      totalValueOriginalCurrency: newTransfer.cifValueAED,
      totalValueAED: newTransfer.cifValueAED,
      totalDutyAED: newTransfer.transferType === 'FZ_TO_MAINLAND' ? newTransfer.cifValueAED * 0.05 : 0,
      totalVatAED: newTransfer.transferType === 'FZ_TO_MAINLAND' ? newTransfer.cifValueAED * 1.05 * 0.05 : 0,
      totalCustomsChargesAED: 200,
      items: [
        {
          id: `item-trn-${Date.now()}`,
          itemNo: 1,
          itemCode: newTransfer.itemCode,
          descriptionEn: newTransfer.descriptionEn,
          descriptionAr: 'بناطيل جينز نصف مصنعة لغرض الغسيل والتجهيز',
          hsCode: newTransfer.hsCode,
          originCountry: 'UAE (SAIF Zone)',
          quantity: newTransfer.quantity,
          uom: newTransfer.uom,
          unitPriceOriginal: newTransfer.unitPrice,
          cifValueAED: newTransfer.cifValueAED,
          dutyRatePercent: 0,
          dutyAmountAED: 0,
          vatRatePercent: 0,
          vatAmountAED: 0,
          netWeightKg: 750,
          grossWeightKg: 800,
          packagesCount: 60,
          packageType: 'Cartons',
          freeZoneExemption: true,
        },
      ],
      declarationType: 'TRANSFER',
      transferType: newTransfer.transferType,
      dueBackDate: newTransfer.dueBackDate,
      createdBy: currentUser.name,
      createdAt: new Date().toISOString(),
      remarks: newTransfer.remarks,
      hasViolations: false,
    };

    setDeclarations([newDecl, ...declarations]);
    setSelectedDecl(newDecl);
    setIsNewModalOpen(false);
    addAuditLog('CREATE_TRANSFER', 'transfer_declarations', 'Declaration', newDecl.id, newDecl.declarationNo, `Created transfer declaration ${newDecl.declarationNo}`);
    showToast(`Transfer declaration ${newDecl.declarationNo} drafted`);
  };

  const handlePrintTransfer = (decl: Declaration) => {
    setPrintDocData({
      titleEn: 'SAIF ZONE CUSTOMS TRANSFER DECLARATION (FZ-MAINLAND / TEMPORARY)',
      titleAr: 'بيان تحويل جمركي رسمي - المنطقة الحرة لمطار الشارقة الدولي',
      docNumber: decl.declarationNo,
      declarationNo: decl.declarationNo,
      bayanRef: decl.saifZoneCustomsRefNo || 'SZ-TRN-2026-PENDING',
      issueDate: decl.declarationDate,
      preparedBy: currentUser.name,
      sections: [
        {
          title: 'Transfer Classification & Destination',
          fields: [
            { label: 'Transfer Type', value: decl.transferType || 'TEMPORARY_TRANSFER' },
            { label: 'Consignee / Facility', value: decl.partnerName },
            { label: 'Destination', value: decl.countryOfDestination },
            { label: 'Return Due Date', value: decl.dueBackDate || 'N/A (Permanent)' },
          ],
        },
        {
          title: 'Transferred Goods Valuation',
          fields: [
            { label: 'Total Value (AED)', value: `AED ${decl.totalValueAED.toLocaleString()}` },
            { label: 'Customs Duty Status', value: decl.transferType === 'FZ_TO_MAINLAND' ? `AED ${decl.totalDutyAED.toLocaleString()} Payable` : 'Duty Suspended (Temporary)' },
          ],
        },
      ],
    });
  };

  return (
    <div className="space-y-5">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E5E7EB] rounded-lg p-5 shadow-xs">
        <div>
          <h2 className="text-base font-semibold text-[#111827] flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-[#1E3A5F]" />
            <span>{t.nav_transfer_declarations}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#1E3A5F] border border-[#E2E8F0] font-medium">
              {transferList.length} Declarations
            </span>
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Inter-Free Zone Transfers, SAIF to Mainland Domestic Clearance & Temporary Outward Processing
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasPermission('transfer_declarations', 'create') && (
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium bg-[#1E3A5F] hover:bg-[#152B47] text-white shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New Transfer Bayan</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Active Temporary Transfers"
          value={declarations.filter((d) => d.transferType === 'TEMPORARY_TRANSFER').length}
          subtitle="Out for washing & finishing"
          icon={Clock}
        />
        <KpiCard
          title="FZ to Mainland Dispatches"
          value={declarations.filter((d) => d.transferType === 'FZ_TO_MAINLAND').length}
          subtitle="Local UAE domestic sale"
          icon={Building}
        />
        <KpiCard
          title="Return Overdue Exposure"
          value="0 Overdue"
          subtitle="All temporary transfers on schedule"
          trend={{ value: 'Zero Penalties', isPositive: true }}
          icon={CheckCircle2}
        />
        <KpiCard
          title="Duty Suspended Guarantee"
          value="AED 12,400"
          subtitle="Guaranteed against return date"
          icon={ArrowLeftRight}
        />
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-3 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {['ALL', 'TEMPORARY_TRANSFER', 'INTER_FREEZONE', 'FZ_TO_MAINLAND'].map((tt) => (
              <button
                key={tt}
                onClick={() => setTransferTypeFilter(tt)}
                className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors border text-xs ${
                  transferTypeFilter === tt
                    ? 'bg-[#1E3A5F] text-white border-[#1E3A5F] font-medium'
                    : 'bg-[#F9FAFB] text-[#4B5563] border-[#E5E7EB] hover:bg-[#F3F4F6] hover:text-[#111827]'
                }`}
              >
                {tt === 'ALL'
                  ? (language === 'ar' ? 'جميع التحويلات' : 'All Transfers')
                  : ((tt || '').replace(/_/g, ' '))}
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 absolute inset-y-0 start-2.5 my-auto text-[#9CA3AF]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search transfer #, partner..."
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
                <th className="py-2.5 px-3.5 text-start">Transfer #</th>
                <th className="py-2.5 px-3.5 text-start">Category</th>
                <th className="py-2.5 px-3.5 text-start">Transferee / Processor</th>
                <th className="py-2.5 px-3.5 text-end">Value (AED)</th>
                <th className="py-2.5 px-3.5 text-start">Date / Due Back</th>
                <th className="py-2.5 px-3.5 text-center">Status</th>
                <th className="py-2.5 px-3.5 text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {transferList.map((d) => (
                <tr key={d.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="py-3 px-3.5 font-semibold font-mono text-[#111827]">
                    {d.declarationNo}
                  </td>
                  <td className="py-3 px-3.5">
                    <span className="px-1.5 py-0.2 rounded bg-[#F1F5F9] text-[#1E3A5F] text-[11px] border border-[#E2E8F0] font-medium">
                      {d.transferType ? d.transferType.replace(/_/g, ' ') : 'Transfer'}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 font-medium text-[#374151]">{d.partnerName}</td>
                  <td className="py-3 px-3.5 text-end font-semibold font-mono text-[#111827] tabular-nums">
                    AED {d.totalValueAED.toLocaleString()}
                  </td>
                  <td className="py-3 px-3.5">
                    <div className="font-mono text-[#111827]">{d.declarationDate}</div>
                    {d.dueBackDate && (
                      <div className="text-[11px] text-[#6B7280]">Due: {d.dueBackDate}</div>
                    )}
                  </td>
                  <td className="py-3 px-3.5 text-center">
                    <StatusBadge status={d.status} />
                  </td>
                  <td className="py-3 px-3.5 text-end">
                    <button
                      onClick={() => handlePrintTransfer(d)}
                      className="p-1 rounded-md text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] border border-transparent hover:border-[#E5E7EB] transition-colors inline-flex items-center gap-1 text-[11px]"
                      title="Print Official Transfer Declaration"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Print</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New Transfer */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Create Transfer Bayan Declaration"
        subtitle="Inter-Free Zone, Temporary Outward Processing, or Mainland Clearance"
        footer={
          <>
            <button
              onClick={() => setIsNewModalOpen(false)}
              className="h-9 px-3.5 rounded-lg border border-[#E5E7EB] bg-white text-xs font-medium text-[#374151]"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateTransfer}
              className="h-9 px-4 rounded-lg bg-[#1E3A5F] hover:bg-[#152B47] text-white text-xs font-medium"
            >
              Draft Transfer Bayan
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateTransfer} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#374151] mb-1">Transfer Regime *</label>
              <select
                value={newTransfer.transferType}
                onChange={(e) => setNewTransfer({ ...newTransfer, transferType: e.target.value as any })}
                className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#E5E7EB]"
              >
                <option value="TEMPORARY_TRANSFER">Temporary Transfer (Washing / Job-Work)</option>
                <option value="INTER_FREEZONE">Inter-Free Zone Transfer (SAIF to DAFZA/JAFZA)</option>
                <option value="FZ_TO_MAINLAND">Free Zone to UAE Mainland (Duty Payable)</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-[#374151] mb-1">Transferee / Processing Facility *</label>
              <input
                type="text"
                value={newTransfer.partnerName}
                onChange={(e) => setNewTransfer({ ...newTransfer, partnerName: e.target.value })}
                className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#E5E7EB]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#374151] mb-1">Destination Facility Location *</label>
              <input
                type="text"
                value={newTransfer.countryOfDestination}
                onChange={(e) => setNewTransfer({ ...newTransfer, countryOfDestination: e.target.value })}
                className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#E5E7EB]"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-[#374151] mb-1">Due Back Date (Temporary Transfer)</label>
              <input
                type="date"
                value={newTransfer.dueBackDate}
                onChange={(e) => setNewTransfer({ ...newTransfer, dueBackDate: e.target.value })}
                className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#E5E7EB]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-[#374151] mb-1">Item Description *</label>
              <input
                type="text"
                value={newTransfer.descriptionEn}
                onChange={(e) => setNewTransfer({ ...newTransfer, descriptionEn: e.target.value })}
                className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#E5E7EB]"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-[#374151] mb-1">Quantity (PCS) *</label>
              <input
                type="number"
                value={newTransfer.quantity}
                onChange={(e) => {
                  const q = parseFloat(e.target.value) || 0;
                  setNewTransfer({ ...newTransfer, quantity: q, cifValueAED: q * newTransfer.unitPrice * 3.6725 });
                }}
                className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#E5E7EB] font-mono"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-[#374151] mb-1">CIF Value (AED) *</label>
              <input
                type="number"
                value={newTransfer.cifValueAED}
                onChange={(e) => setNewTransfer({ ...newTransfer, cifValueAED: parseFloat(e.target.value) || 0 })}
                className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#E5E7EB] font-mono"
                required
              />
            </div>
          </div>
        </form>
      </Modal>

    </div>
  );
};
