import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StockReconciliationRun, StockReconciliationLine } from '../../types';
import {
  Scale,
  Plus,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Calendar,
  ShieldCheck,
  Search,
  ArrowRight,
  TrendingDown,
  Sparkles,
  Download,
  Building,
  History,
} from 'lucide-react';
import { KpiCard } from '../common/KpiCard';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';

export const StockReconciliationModule: React.FC = () => {
  const {
    customsStock,
    setCustomsStock,
    warehouseStock,
    reconciliations,
    setReconciliations,
    currentUser,
    hasPermission,
    addAuditLog,
    showToast,
    t,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'RECONCILIATIONS' | 'CUSTOMS_LEDGER' | 'WAREHOUSE_STOCK'>('RECONCILIATIONS');
  const [selectedRun, setSelectedRun] = useState<StockReconciliationRun | null>(reconciliations[0] || null);
  const [isCreatingRun, setIsCreatingRun] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // New Run Form State
  const [periodMonth, setPeriodMonth] = useState('2026-08');
  const [runRemarks, setRunRemarks] = useState('Monthly physical inventory reconciliation vs SAIF Zone customs ledger');

  const canApprove = hasPermission('stock_reconciliation', 'approve');

  // Filtered lists
  const query = (searchQuery || '').toLowerCase();
  const filteredCustomsStock = customsStock.filter(
    (item) =>
      (item.itemCode || '').toLowerCase().includes(query) ||
      (item.descriptionEn || '').toLowerCase().includes(query) ||
      (item.hsCode || '').toLowerCase().includes(query)
  );

  const filteredWarehouseStock = warehouseStock.filter(
    (item) =>
      (item.itemCode || '').toLowerCase().includes(query) ||
      (item.descriptionEn || '').toLowerCase().includes(query) ||
      (item.warehouseLocation || '').toLowerCase().includes(query)
  );

  // Auto-Generate Reconciliation Run Lines from Dual Ledgers
  const handleStartNewReconciliation = () => {
    const lines: StockReconciliationLine[] = customsStock.map((cs) => {
      const ws = warehouseStock.find((w) => w.itemCode === cs.itemCode);
      const whQty = ws ? ws.physicalCountQty : cs.closingCustomsBalance;
      const variance = whQty - cs.closingCustomsBalance;

      let reason: StockReconciliationLine['varianceReason'] = undefined;
      if (variance < 0) {
        reason = cs.itemCode.startsWith('FAB') ? 'CUTTING_WASTE' : 'PRODUCTION_SCRAP';
      }

      return {
        itemCode: cs.itemCode,
        descriptionEn: cs.descriptionEn,
        hsCode: cs.hsCode,
        uom: cs.uom,
        customsQty: cs.closingCustomsBalance,
        warehouseQty: whQty,
        varianceQty: variance,
        varianceReason: reason,
        proposedAdjustmentQty: variance !== 0 ? variance : 0,
        remarks: variance !== 0 ? `Variance detected between physical warehouse (${whQty}) and customs ledger (${cs.closingCustomsBalance})` : 'In balance',
      };
    });

    const itemsWithVar = lines.filter((l) => l.varianceQty !== 0).length;
    const netVar = lines.reduce((sum, l) => sum + l.varianceQty, 0);

    const newRun: StockReconciliationRun = {
      id: `rec-${Date.now()}`,
      reconciliationNo: `REC-${periodMonth}-${reconciliations.length + 1}`,
      periodMonth,
      runDate: new Date().toISOString().split('T')[0],
      performedBy: currentUser.name,
      status: 'PENDING_APPROVAL',
      totalItemsChecked: lines.length,
      itemsWithVariance: itemsWithVar,
      netVarianceQty: netVar,
      lines,
      remarks: runRemarks,
    };

    setReconciliations([newRun, ...reconciliations]);
    setSelectedRun(newRun);
    setIsCreatingRun(false);
    addAuditLog('CREATE_RECONCILIATION', 'stock_reconciliation', 'StockReconciliationRun', newRun.id, newRun.reconciliationNo, `Created reconciliation run for period ${periodMonth}`);
    showToast(`Reconciliation ${newRun.reconciliationNo} generated with ${itemsWithVar} variance items`);
  };

  const handleApproveReconciliation = (runId: string) => {
    setReconciliations((prev) =>
      prev.map((r) => {
        if (r.id !== runId) return r;
        return {
          ...r,
          status: 'APPROVED',
          approvedBy: currentUser.name,
          approvedAt: new Date().toISOString(),
        };
      })
    );

    if (selectedRun?.id === runId) {
      setSelectedRun({
        ...selectedRun,
        status: 'APPROVED',
        approvedBy: currentUser.name,
        approvedAt: new Date().toISOString(),
      });
    }

    addAuditLog('APPROVE_RECONCILIATION', 'stock_reconciliation', 'StockReconciliationRun', runId, selectedRun?.reconciliationNo || '', 'Approved stock reconciliation and posted journal adjustments');
    showToast('Reconciliation run approved. Customs ledger synchronized.');
  };

  const totalCustomsQty = customsStock.reduce((acc, c) => acc + c.closingCustomsBalance, 0);
  const totalPhysicalQty = warehouseStock.reduce((acc, w) => acc + w.physicalCountQty, 0);

  return (
    <div className="space-y-5">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E5E7EB] rounded-lg p-5 shadow-xs">
        <div>
          <h2 className="text-base font-semibold text-[#111827] flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#1E3A5F]" />
            <span>{t.nav_stock_reconciliation}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#1E3A5F] border border-[#E2E8F0] font-medium">
              Dual-Ledger Audit
            </span>
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Customs Bonded Inward/Outward Ledger vs. Internal Warehouse ERP Physical Count
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasPermission('stock_reconciliation', 'create') && (
            <button
              onClick={() => setIsCreatingRun(true)}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium bg-[#1E3A5F] hover:bg-[#152B47] text-white shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Run Reconciliation</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Customs Official Ledger Balance"
          value={`${totalCustomsQty.toLocaleString()} Units`}
          subtitle="Sharjah Customs bonded record"
          icon={Scale}
        />
        <KpiCard
          title="Factory Physical Inventory"
          value={`${totalPhysicalQty.toLocaleString()} Units`}
          subtitle="Plot Q4-081 counts"
          icon={FileSpreadsheet}
        />
        <KpiCard
          title="Reconciliation Variances"
          value={`${selectedRun?.itemsWithVariance || 0} Items`}
          subtitle="Cutting waste & sample drawdowns"
          trend={{ value: 'Within SAIF Scrap Tol.', isPositive: true }}
          icon={AlertTriangle}
        />
        <KpiCard
          title="Customs Audit Status"
          value="100% Reconciled"
          subtitle="Audit ready for FTA inspectors"
          trend={{ value: 'Full Compliance', isPositive: true }}
          icon={ShieldCheck}
        />
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-2 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('RECONCILIATIONS')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'RECONCILIATIONS'
                ? 'bg-[#1E3A5F] text-white'
                : 'text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]'
            }`}
          >
            Reconciliation Runs ({reconciliations.length})
          </button>
          <button
            onClick={() => setActiveTab('CUSTOMS_LEDGER')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'CUSTOMS_LEDGER'
                ? 'bg-[#1E3A5F] text-white'
                : 'text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]'
            }`}
          >
            Customs Official Ledger ({customsStock.length})
          </button>
          <button
            onClick={() => setActiveTab('WAREHOUSE_STOCK')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'WAREHOUSE_STOCK'
                ? 'bg-[#1E3A5F] text-white'
                : 'text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]'
            }`}
          >
            Warehouse Physical Count ({warehouseStock.length})
          </button>
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute inset-y-0 start-2.5 my-auto text-[#9CA3AF]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items, HS codes..."
            className="w-full h-8 ps-8 pe-3 bg-[#F9FAFB] text-xs rounded-md border border-[#E5E7EB] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#1E3A5F]"
          />
        </div>
      </div>

      {/* TAB 1: RECONCILIATION RUNS */}
      {activeTab === 'RECONCILIATIONS' && (
        <div className="space-y-4">
          {selectedRun && (
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E7EB] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold font-mono text-[#111827]">
                      {selectedRun.reconciliationNo}
                    </h3>
                    <StatusBadge status={selectedRun.status} />
                  </div>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    Period: {selectedRun.periodMonth} • Run Date: {selectedRun.runDate} • Executed by: {selectedRun.performedBy}
                  </p>
                </div>

                {selectedRun.status === 'PENDING_APPROVAL' && canApprove && (
                  <button
                    onClick={() => handleApproveReconciliation(selectedRun.id)}
                    className="h-8 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium transition-colors inline-flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Reconciliation & Post Adjustments</span>
                  </button>
                )}
              </div>

              {/* Line Items Table */}
              <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
                <table className="w-full text-xs text-start border-collapse">
                  <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#4B5563] font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3.5 text-start">Item & Description</th>
                      <th className="py-2.5 px-3.5 text-start">HS Code</th>
                      <th className="py-2.5 px-3.5 text-end">Customs Balance</th>
                      <th className="py-2.5 px-3.5 text-end">Physical Count</th>
                      <th className="py-2.5 px-3.5 text-end">Variance</th>
                      <th className="py-2.5 px-3.5 text-start">Variance Justification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {selectedRun.lines.map((line, idx) => (
                      <tr key={idx} className="hover:bg-[#F9FAFB] transition-colors">
                        <td className="py-3 px-3.5">
                          <div className="font-medium text-[#111827]">{line.descriptionEn}</div>
                          <div className="text-[11px] font-mono text-[#6B7280]">{line.itemCode}</div>
                        </td>
                        <td className="py-3 px-3.5 font-mono text-[#1E3A5F]">{line.hsCode}</td>
                        <td className="py-3 px-3.5 text-end font-mono tabular-nums text-[#111827]">
                          {line.customsQty.toLocaleString()} {line.uom}
                        </td>
                        <td className="py-3 px-3.5 text-end font-mono tabular-nums text-[#111827]">
                          {line.warehouseQty.toLocaleString()} {line.uom}
                        </td>
                        <td className="py-3 px-3.5 text-end font-mono font-semibold tabular-nums">
                          {line.varianceQty === 0 ? (
                            <span className="text-emerald-700">0</span>
                          ) : (
                            <span className="text-amber-700">
                              {line.varianceQty > 0 ? `+${line.varianceQty}` : line.varianceQty} {line.uom}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3.5">
                          {line.varianceReason ? (
                            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-medium">
                              {line.varianceReason.replace(/_/g, ' ')}
                            </span>
                          ) : (
                            <span className="text-[#6B7280]">Exact Match</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CUSTOMS OFFICIAL LEDGER */}
      {activeTab === 'CUSTOMS_LEDGER' && (
        <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start border-collapse">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#4B5563] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3.5 text-start">Item Code</th>
                  <th className="py-2.5 px-3.5 text-start">Description</th>
                  <th className="py-2.5 px-3.5 text-start">HS Code</th>
                  <th className="py-2.5 px-3.5 text-end">Opening</th>
                  <th className="py-2.5 px-3.5 text-end">Inward (Imports)</th>
                  <th className="py-2.5 px-3.5 text-end">Outward (Exports)</th>
                  <th className="py-2.5 px-3.5 text-end">Closing Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filteredCustomsStock.map((cs) => (
                  <tr key={cs.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="py-3 px-3.5 font-mono font-semibold text-[#111827]">{cs.itemCode}</td>
                    <td className="py-3 px-3.5 font-medium text-[#374151]">{cs.descriptionEn}</td>
                    <td className="py-3 px-3.5 font-mono text-[#1E3A5F]">{cs.hsCode}</td>
                    <td className="py-3 px-3.5 text-end font-mono text-[#6B7280]">{cs.openingCustomsBalance.toLocaleString()}</td>
                    <td className="py-3 px-3.5 text-end font-mono text-emerald-700">+{cs.inwardCustomsQty.toLocaleString()}</td>
                    <td className="py-3 px-3.5 text-end font-mono text-blue-700">-{cs.outwardCustomsQty.toLocaleString()}</td>
                    <td className="py-3 px-3.5 text-end font-mono font-semibold text-[#111827]">
                      {cs.closingCustomsBalance.toLocaleString()} {cs.uom}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: WAREHOUSE PHYSICAL COUNT */}
      {activeTab === 'WAREHOUSE_STOCK' && (
        <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start border-collapse">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#4B5563] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3.5 text-start">Item Code</th>
                  <th className="py-2.5 px-3.5 text-start">Description</th>
                  <th className="py-2.5 px-3.5 text-start">Location</th>
                  <th className="py-2.5 px-3.5 text-end">ERP System Qty</th>
                  <th className="py-2.5 px-3.5 text-end">Physical Count</th>
                  <th className="py-2.5 px-3.5 text-start">Last Counted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filteredWarehouseStock.map((ws) => (
                  <tr key={ws.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="py-3 px-3.5 font-mono font-semibold text-[#111827]">{ws.itemCode}</td>
                    <td className="py-3 px-3.5 font-medium text-[#374151]">{ws.descriptionEn}</td>
                    <td className="py-3 px-3.5 text-[#6B7280]">{ws.warehouseLocation}</td>
                    <td className="py-3 px-3.5 text-end font-mono text-[#6B7280]">{ws.erpSystemQty.toLocaleString()}</td>
                    <td className="py-3 px-3.5 text-end font-mono font-semibold text-[#111827]">
                      {ws.physicalCountQty.toLocaleString()} {ws.uom}
                    </td>
                    <td className="py-3 px-3.5 font-mono text-[#6B7280]">{ws.lastCountDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Start New Run */}
      <Modal
        isOpen={isCreatingRun}
        onClose={() => setIsCreatingRun(false)}
        title="Execute Stock Reconciliation Run"
        subtitle="Comparing SAIF Zone Customs Balance vs Warehouse Physical Stock"
        footer={
          <>
            <button
              onClick={() => setIsCreatingRun(false)}
              className="h-9 px-3.5 rounded-lg border border-[#E5E7EB] bg-white text-xs font-medium text-[#374151]"
            >
              Cancel
            </button>
            <button
              onClick={handleStartNewReconciliation}
              className="h-9 px-4 rounded-lg bg-[#1E3A5F] hover:bg-[#152B47] text-white text-xs font-medium"
            >
              Execute Run
            </button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-medium text-[#374151] mb-1">Reconciliation Period *</label>
            <input
              type="month"
              value={periodMonth}
              onChange={(e) => setPeriodMonth(e.target.value)}
              className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#E5E7EB]"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-[#374151] mb-1">Audit Notes / Scope</label>
            <textarea
              rows={3}
              value={runRemarks}
              onChange={(e) => setRunRemarks(e.target.value)}
              className="w-full p-2 bg-white text-xs rounded-md border border-[#E5E7EB]"
            />
          </div>
        </div>
      </Modal>

    </div>
  );
};
