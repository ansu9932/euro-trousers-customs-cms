import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Coins,
  ShieldCheck,
  AlertTriangle,
  Plus,
  ArrowDownToLine,
  TrendingUp,
  Landmark,
  FileCheck2,
  Calendar,
  CheckCircle2,
  Percent,
} from 'lucide-react';
import { BankGuarantee, DutyRefund } from '../../types';
import { KpiCard } from '../common/KpiCard';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';

export const DutyFinanceModule: React.FC = () => {
  const {
    t,
    bankGuarantees,
    setBankGuarantees,
    dutyRefunds,
    setDutyRefunds,
    declarations,
    hasPermission,
    showToast,
    addAuditLog,
    currentUser,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'BG' | 'REFUNDS' | 'RATES'>('BG');
  const [isNewBgModalOpen, setIsNewBgModalOpen] = useState(false);
  const [isNewRefundModalOpen, setIsNewRefundModalOpen] = useState(false);

  // New BG State
  const [newBg, setNewBg] = useState({
    guaranteeNo: 'BG/2026/SIB/08819',
    bankName: 'Sharjah Islamic Bank (SAIF Zone Branch)',
    amountAED: 200000,
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
    purpose: 'SAIF Zone Customs Duty Suspension Standing Guarantee',
  });

  // New Refund State
  const [newRefund, setNewRefund] = useState({
    declarationNo: declarations[0]?.declarationNo || 'IMP-2026-0001',
    claimedAmountAED: 5200,
    claimReason: 'Duty paid on raw denim subsequently exported as finished trousers (Duty Drawback).',
  });

  const totalBgAmount = bankGuarantees.reduce((acc, b) => acc + b.amountAED, 0);
  const totalBgUtilized = bankGuarantees.reduce((acc, b) => acc + b.utilizedAmountAED, 0);
  const totalBgAvailable = totalBgAmount - totalBgUtilized;

  const handleCreateBg = (e: React.FormEvent) => {
    e.preventDefault();
    const created: BankGuarantee = {
      id: `bg-${Date.now()}`,
      ...newBg,
      utilizedAmountAED: 0,
      availableAmountAED: newBg.amountAED,
      status: 'ACTIVE',
    };
    setBankGuarantees((prev) => [created, ...prev]);
    addAuditLog(
      'CREATE_BANK_GUARANTEE',
      'duty_finance',
      'BankGuarantee',
      created.id,
      created.guaranteeNo,
      `Issued Bank Guarantee ${created.guaranteeNo} with ${created.bankName} for AED ${created.amountAED.toLocaleString()}`
    );
    showToast(`Bank Guarantee ${created.guaranteeNo} recorded`);
    setIsNewBgModalOpen(false);
  };

  const handleCreateRefund = (e: React.FormEvent) => {
    e.preventDefault();
    const count = dutyRefunds.length + 1;
    const created: DutyRefund = {
      id: `ref-${Date.now()}`,
      refundNo: `REF-2026-${String(count).padStart(4, '0')}`,
      declarationId: 'decl-1',
      declarationNo: newRefund.declarationNo,
      submissionDate: new Date().toISOString().split('T')[0],
      claimedAmountAED: newRefund.claimedAmountAED,
      approvedAmountAED: 0,
      status: 'SUBMITTED',
      reason: 'RE_EXPORT',
      attachedDocIds: [],
    };
    setDutyRefunds((prev) => [created, ...prev]);
    addAuditLog(
      'CREATE_DUTY_REFUND',
      'duty_finance',
      'DutyRefund',
      created.id,
      created.refundNo,
      `Filed Duty Refund ${created.refundNo} for AED ${created.claimedAmountAED.toLocaleString()}`
    );
    showToast(`Duty Refund claim ${created.refundNo} submitted to Sharjah Customs`);
    setIsNewRefundModalOpen(false);
  };

  return (
    <div className="space-y-5">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E5E7EB] rounded-lg p-5 shadow-xs">
        <div>
          <h2 className="text-base font-semibold text-[#111827] flex items-center gap-2">
            <Coins className="w-4 h-4 text-[#1E3A5F]" />
            <span>{t.nav_duty_finance}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#1E3A5F] border border-[#E2E8F0] font-medium">
              AED {(totalBgAmount / 1000).toFixed(0)}k Total BG
            </span>
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Standing Bank Guarantees (ADCB / Emirates NBD), Duty Deposit Balances & Sharjah Customs Drawback
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasPermission('duty_finance', 'create') && (
            <>
              <button
                onClick={() => setIsNewBgModalOpen(true)}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium bg-[#1E3A5F] hover:bg-[#152B47] text-white shadow-2xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Bank Guarantee</span>
              </button>
              <button
                onClick={() => setIsNewRefundModalOpen(true)}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#374151] hover:text-[#111827] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Claim Duty Refund</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Bank Guarantee Facility"
          value={`AED ${totalBgAmount.toLocaleString()}`}
          subtitle="ADCB & Emirates NBD Active"
          icon={Landmark}
        />
        <KpiCard
          title="Utilized Standing Duty"
          value={`AED ${totalBgUtilized.toLocaleString()}`}
          subtitle={`${((totalBgUtilized / totalBgAmount) * 100).toFixed(1)}% Facility Utilization`}
          icon={TrendingUp}
        />
        <KpiCard
          title="Available Unencumbered BG"
          value={`AED ${totalBgAvailable.toLocaleString()}`}
          subtitle="Ready for incoming consignments"
          trend={{ value: 'Ample headroom', isPositive: true }}
          icon={ShieldCheck}
        />
        <KpiCard
          title="Pending Duty Refunds"
          value={`AED ${dutyRefunds.reduce((a, r) => a + r.claimedAmountAED, 0).toLocaleString()}`}
          subtitle={`${dutyRefunds.length} Active claims with Customs`}
          icon={Coins}
        />
      </div>

      {/* Subtabs Selector */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-2 shadow-xs flex items-center gap-2">
        <button
          onClick={() => setActiveSubTab('BG')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            activeSubTab === 'BG'
              ? 'bg-[#1E3A5F] text-white'
              : 'text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]'
          }`}
        >
          Bank Guarantees Ledger ({bankGuarantees.length})
        </button>
        <button
          onClick={() => setActiveSubTab('REFUNDS')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            activeSubTab === 'REFUNDS'
              ? 'bg-[#1E3A5F] text-white'
              : 'text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]'
          }`}
        >
          Duty Refund Claims ({dutyRefunds.length})
        </button>
        <button
          onClick={() => setActiveSubTab('RATES')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            activeSubTab === 'RATES'
              ? 'bg-[#1E3A5F] text-white'
              : 'text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]'
          }`}
        >
          UAE Customs Tariff & Exemption Rules
        </button>
      </div>

      {/* TAB 1: BANK GUARANTEES */}
      {activeSubTab === 'BG' && (
        <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start border-collapse">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#4B5563] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3.5 text-start">Guarantee #</th>
                  <th className="py-2.5 px-3.5 text-start">Issuing Bank</th>
                  <th className="py-2.5 px-3.5 text-end">Total Facility (AED)</th>
                  <th className="py-2.5 px-3.5 text-end">Utilized (AED)</th>
                  <th className="py-2.5 px-3.5 text-end">Available (AED)</th>
                  <th className="py-2.5 px-3.5 text-start">Utilization Meter</th>
                  <th className="py-2.5 px-3.5 text-start">Expiry Date</th>
                  <th className="py-2.5 px-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {bankGuarantees.map((bg) => {
                  const pct = Math.round((bg.utilizedAmountAED / bg.amountAED) * 100);
                  const isExpiringSoon = bg.guaranteeNo.includes('ADCB');

                  return (
                    <tr key={bg.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="py-3 px-3.5 font-semibold font-mono text-[#111827]">
                        {bg.guaranteeNo}
                      </td>
                      <td className="py-3 px-3.5 text-[#374151] font-medium">{bg.bankName}</td>
                      <td className="py-3 px-3.5 text-end font-semibold font-mono text-[#111827] tabular-nums">
                        {bg.amountAED.toLocaleString()}
                      </td>
                      <td className="py-3 px-3.5 text-end font-mono text-[#4B5563] tabular-nums">
                        {bg.utilizedAmountAED.toLocaleString()}
                      </td>
                      <td className="py-3 px-3.5 text-end font-mono font-semibold text-emerald-700 tabular-nums">
                        {(bg.amountAED - bg.utilizedAmountAED).toLocaleString()}
                      </td>
                      <td className="py-3 px-3.5 min-w-[130px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-[#E5E7EB] rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                pct > 80 ? 'bg-[#DC2626]' : pct > 50 ? 'bg-[#D97706]' : 'bg-[#1E3A5F]'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-mono text-[#6B7280]">{pct}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="font-mono text-[#111827]">{bg.expiryDate}</div>
                        {isExpiringSoon && (
                          <span className="text-[10px] text-[#D97706] font-medium block">
                            26 Days Left
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        <StatusBadge status={bg.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DUTY REFUND CLAIMS */}
      {activeSubTab === 'REFUNDS' && (
        <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start border-collapse">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#4B5563] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3.5 text-start">Claim #</th>
                  <th className="py-2.5 px-3.5 text-start">Declaration #</th>
                  <th className="py-2.5 px-3.5 text-start">Reason</th>
                  <th className="py-2.5 px-3.5 text-end">Claimed (AED)</th>
                  <th className="py-2.5 px-3.5 text-end">Approved (AED)</th>
                  <th className="py-2.5 px-3.5 text-start">Submission Date</th>
                  <th className="py-2.5 px-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {dutyRefunds.map((ref) => (
                  <tr key={ref.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="py-3 px-3.5 font-semibold font-mono text-[#111827]">
                      {ref.refundNo}
                    </td>
                    <td className="py-3 px-3.5 font-mono text-[#1E3A5F]">{ref.declarationNo}</td>
                    <td className="py-3 px-3.5 text-[#374151]">
                      {ref.reason === 'RE_EXPORT' ? 'Duty Drawback on Re-Export' : 'Overpayment Correction'}
                    </td>
                    <td className="py-3 px-3.5 text-end font-semibold font-mono text-[#111827] tabular-nums">
                      AED {ref.claimedAmountAED.toLocaleString()}
                    </td>
                    <td className="py-3 px-3.5 text-end font-mono text-emerald-700 tabular-nums">
                      {ref.approvedAmountAED ? `AED ${ref.approvedAmountAED.toLocaleString()}` : 'Under Review'}
                    </td>
                    <td className="py-3 px-3.5 text-[#6B7280] font-mono">{ref.submissionDate}</td>
                    <td className="py-3 px-3.5 text-center">
                      <StatusBadge status={ref.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: TARIFF & EXEMPTION RULES */}
      {activeSubTab === 'RATES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 shadow-xs space-y-3">
            <h4 className="font-semibold text-xs text-[#111827] uppercase tracking-wider flex items-center gap-2">
              <Percent className="w-4 h-4 text-[#1E3A5F]" />
              <span>SAIF Zone Free Zone Exemption Framework</span>
            </h4>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Under UAE Federal Decree-Law and Sharjah Customs Authority regulations, goods imported into the Sharjah Airport International Free Zone (SAIF Zone) for manufacturing or export are granted:
            </p>
            <ul className="text-xs space-y-2 text-[#374151]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>0% Customs Duty</strong> on raw materials, fabrics, and production accessories.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>0% VAT</strong> on imports consigned to designated Free Zone bonded warehouses.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>100% Export Exemption</strong> when finished trousers are shipped to international buyers.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 shadow-xs space-y-3">
            <h4 className="font-semibold text-xs text-[#111827] uppercase tracking-wider">
              UAE Mainland Domestic Clearance (Standard Tariff)
            </h4>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              In the event finished trousers or scrap raw materials are cleared into the UAE local mainland market:
            </p>
            <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Standard GCC Common Tariff:</span>
                <span className="font-semibold font-mono text-[#0F172A]">5.0% CIF Value</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">UAE Value Added Tax (VAT):</span>
                <span className="font-semibold font-mono text-[#0F172A]">5.0% on (CIF + Duty)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Sharjah Bayan Processing Fee:</span>
                <span className="font-semibold font-mono text-[#0F172A]">AED 150 per Declaration</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Bank Guarantee */}
      <Modal
        isOpen={isNewBgModalOpen}
        onClose={() => setIsNewBgModalOpen(false)}
        title="Record New Standing Bank Guarantee"
        subtitle="SAIF Zone Customs Duty Suspension Facility"
        footer={
          <>
            <button
              onClick={() => setIsNewBgModalOpen(false)}
              className="h-9 px-3.5 rounded-lg border border-[#E5E7EB] bg-white text-xs font-medium text-[#374151]"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateBg}
              className="h-9 px-4 rounded-lg bg-[#1E3A5F] hover:bg-[#152B47] text-white text-xs font-medium"
            >
              Record Guarantee
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateBg} className="space-y-3 text-xs">
          <div>
            <label className="block font-medium text-[#374151] mb-1">Guarantee Number *</label>
            <input
              type="text"
              value={newBg.guaranteeNo}
              onChange={(e) => setNewBg({ ...newBg, guaranteeNo: e.target.value })}
              className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#E5E7EB]"
              required
            />
          </div>
          <div>
            <label className="block font-medium text-[#374151] mb-1">Issuing Bank *</label>
            <input
              type="text"
              value={newBg.bankName}
              onChange={(e) => setNewBg({ ...newBg, bankName: e.target.value })}
              className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#E5E7EB]"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#374151] mb-1">Facility Amount (AED) *</label>
              <input
                type="number"
                value={newBg.amountAED}
                onChange={(e) => setNewBg({ ...newBg, amountAED: parseFloat(e.target.value) || 0 })}
                className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#E5E7EB] font-mono"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-[#374151] mb-1">Expiry Date *</label>
              <input
                type="date"
                value={newBg.expiryDate}
                onChange={(e) => setNewBg({ ...newBg, expiryDate: e.target.value })}
                className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#E5E7EB]"
                required
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal: Claim Duty Refund */}
      <Modal
        isOpen={isNewRefundModalOpen}
        onClose={() => setIsNewRefundModalOpen(false)}
        title="File Duty Refund Claim (Drawback)"
        subtitle="Sharjah Customs Authority Re-Export Refund Request"
        footer={
          <>
            <button
              onClick={() => setIsNewRefundModalOpen(false)}
              className="h-9 px-3.5 rounded-lg border border-[#E5E7EB] bg-white text-xs font-medium text-[#374151]"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateRefund}
              className="h-9 px-4 rounded-lg bg-[#1E3A5F] hover:bg-[#152B47] text-white text-xs font-medium"
            >
              Submit Refund Claim
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateRefund} className="space-y-3 text-xs">
          <div>
            <label className="block font-medium text-[#374151] mb-1">Import Declaration # *</label>
            <select
              value={newRefund.declarationNo}
              onChange={(e) => setNewRefund({ ...newRefund, declarationNo: e.target.value })}
              className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#E5E7EB]"
            >
              {declarations.map((d) => (
                <option key={d.id} value={d.declarationNo}>
                  {d.declarationNo} ({d.partnerName})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium text-[#374151] mb-1">Claim Amount (AED) *</label>
            <input
              type="number"
              value={newRefund.claimedAmountAED}
              onChange={(e) => setNewRefund({ ...newRefund, claimedAmountAED: parseFloat(e.target.value) || 0 })}
              className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#E5E7EB] font-mono"
              required
            />
          </div>
          <div>
            <label className="block font-medium text-[#374151] mb-1">Justification / Reason *</label>
            <textarea
              rows={3}
              value={newRefund.claimReason}
              onChange={(e) => setNewRefund({ ...newRefund, claimReason: e.target.value })}
              className="w-full p-2 bg-white text-xs rounded-md border border-[#E5E7EB]"
            />
          </div>
        </form>
      </Modal>

    </div>
  );
};
