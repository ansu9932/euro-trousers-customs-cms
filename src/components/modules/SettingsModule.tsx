import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Building2,
  ShieldCheck,
  Coins,
  Users,
  CheckCircle2,
  Save,
  Lock,
  Globe,
  Sliders,
} from 'lucide-react';
import { CompanySettings, UserRole } from '../../types';

export const SettingsModule: React.FC = () => {
  const {
    companySettings,
    setCompanySettings,
    allUsers,
    currentUser,
    addAuditLog,
    showToast,
    t,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'COMPANY' | 'CUSTOMS_RULES' | 'RBAC_MATRIX' | 'EXCHANGE_RATES'>('COMPANY');
  const [formData, setFormData] = useState<CompanySettings>({ ...companySettings });

  const isEditable = currentUser.role === 'ADMIN';

  const handleSaveSettings = () => {
    if (!isEditable) return;
    setCompanySettings(formData);
    addAuditLog(
      'UPDATE_SETTINGS',
      'settings',
      'CompanySettings',
      formData.id,
      formData.companyNameEn,
      'Updated company profile, GM approval threshold and customs configuration.'
    );
    showToast('Company settings & customs thresholds updated successfully!');
  };

  const rbacMatrix: { role: UserRole; title: string; perms: string[] }[] = [
    { role: 'ADMIN', title: 'System Administrator', perms: ['Full System Access', 'Role Assignment', 'System Config', 'Audit Trail Export'] },
    { role: 'CUSTOMS_MGR', title: 'Customs Manager', perms: ['L2 Review & Approval', 'Bayan Ref Recording', 'Hold Resolution', 'Stock Reconcile Sign-off'] },
    { role: 'DOC_OFFICER', title: 'Documentation Officer', perms: ['L1 Preparation', 'Document Vault Upload', 'Gate Pass Issuance', 'Bayan Printing'] },
    { role: 'DATA_ENTRY', title: 'Data Entry Clerk', perms: ['Create Draft Declarations', 'Item & Invoice Entry', 'Partner Entry'] },
    { role: 'WAREHOUSE', title: 'Warehouse Officer', perms: ['Physical Count Entry', 'Container Receiving/Unloading', 'Gate Clearance'] },
    { role: 'FINANCE', title: 'Finance Officer', perms: ['L3 Duty/VAT Approval', 'Bank Guarantee Management', 'Duty Refunds', 'Tally XML Export'] },
    { role: 'LOGISTICS', title: 'Logistics Officer', perms: ['Container Tracking', 'Demurrage Monitoring', 'Transporter Gate Pass'] },
    { role: 'GM', title: 'General Manager', perms: ['L4 Final Approval (>= AED 100k)', 'Strategic Audit Dashboard', 'Executive Clearance'] },
    { role: 'VIEWER', title: 'Viewer (Read-Only)', perms: ['Read-only Reports', 'Shipment Status Tracking'] },
    { role: 'AUDITOR', title: 'Statutory Auditor', perms: ['Read-only Everything', 'Full Audit Trail', '5-Year Statutory Archive'] },
  ];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t.settings}</h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              System Configuration
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Company credentials, SAIF Zone licenses, 4-tier approval limits, and 10-role RBAC security matrix
          </p>
        </div>

        {isEditable && (
          <button
            onClick={handleSaveSettings}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-md shadow-sm inline-flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 pt-3 gap-6 text-xs font-semibold rounded-t-xl">
        <button
          onClick={() => setActiveTab('COMPANY')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'COMPANY'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Company Profile & SAIF Zone Licenses</span>
        </button>

        <button
          onClick={() => setActiveTab('CUSTOMS_RULES')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'CUSTOMS_RULES'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Customs & Approval Thresholds</span>
        </button>

        <button
          onClick={() => setActiveTab('RBAC_MATRIX')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'RBAC_MATRIX'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>10-Role RBAC Permissions Matrix</span>
        </button>
      </div>

      {/* 1. Company Profile */}
      {activeTab === 'COMPANY' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Company Legal Name (English)
              </label>
              <input
                type="text"
                disabled={!isEditable}
                value={formData.companyNameEn}
                onChange={(e) => setFormData({ ...formData, companyNameEn: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Company Legal Name (Arabic)
              </label>
              <input
                type="text"
                dir="rtl"
                disabled={!isEditable}
                value={formData.companyNameAr}
                onChange={(e) => setFormData({ ...formData, companyNameAr: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-arabic"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tax Registration Number (TRN)
              </label>
              <input
                type="text"
                disabled={!isEditable}
                value={formData.trn}
                onChange={(e) => setFormData({ ...formData, trn: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono font-bold text-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                SAIF Zone Operating Licence No
              </label>
              <input
                type="text"
                disabled={!isEditable}
                value={formData.saifZoneLicenceNo}
                onChange={(e) => setFormData({ ...formData, saifZoneLicenceNo: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Plot & Warehouse Number
              </label>
              <input
                type="text"
                disabled={!isEditable}
                value={formData.plotNo}
                onChange={(e) => setFormData({ ...formData, plotNo: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Free Zone Location / Emirate
              </label>
              <input
                type="text"
                disabled={!isEditable}
                value={`${formData.city}, ${formData.country}`}
                readOnly
                className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Official Address (English)
              </label>
              <input
                type="text"
                disabled={!isEditable}
                value={formData.addressEn}
                onChange={(e) => setFormData({ ...formData, addressEn: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Official Address (Arabic)
              </label>
              <input
                type="text"
                dir="rtl"
                disabled={!isEditable}
                value={formData.addressAr}
                onChange={(e) => setFormData({ ...formData, addressAr: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-arabic"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. Customs & Approval Thresholds */}
      {activeTab === 'CUSTOMS_RULES' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Workflows, Limits & Gateway Modes
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg space-y-2">
              <label className="block font-bold text-slate-800 dark:text-slate-200">
                General Manager (L4) Approval Threshold (AED)
              </label>
              <input
                type="number"
                disabled={!isEditable}
                value={formData.gmApprovalThresholdAED}
                onChange={(e) => setFormData({ ...formData, gmApprovalThresholdAED: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono font-bold text-sm"
              />
              <p className="text-[11px] text-slate-500">
                Declarations with total value equal to or above AED {(formData.gmApprovalThresholdAED ?? 100000).toLocaleString()} strictly require GM sign-off.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg space-y-2">
              <label className="block font-bold text-slate-800 dark:text-slate-200">
                Statutory Records Retention (Years)
              </label>
              <input
                type="number"
                disabled={!isEditable}
                value={formData.retentionYears}
                onChange={(e) => setFormData({ ...formData, retentionYears: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono font-bold text-sm"
              />
              <p className="text-[11px] text-slate-500">
                Mandatory UAE FTA VAT & SAIF Zone Customs electronic record archive period.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg space-y-2">
              <label className="block font-bold text-slate-800 dark:text-slate-200">
                Sharjah Customs ePortal Mode
              </label>
              <select
                disabled={!isEditable}
                value={formData.sharjahCustomsEPortalMode}
                onChange={(e) => setFormData({ ...formData, sharjahCustomsEPortalMode: e.target.value as any })}
                className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
              >
                <option value="manual">Manual Entry & Formatted Manifest Export</option>
                <option value="api_mock">Automated API Gateway (Sandbox Active)</option>
                <option value="live">Sharjah Direct Customs Clearing API (Live)</option>
              </select>
              <p className="text-[11px] text-slate-500">
                Controls whether Bayans are exported for staff copy-paste or transmitted via webhooks.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg space-y-2">
              <label className="block font-bold text-slate-800 dark:text-slate-200">
                Tally ERP XML Auto-Export
              </label>
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="tallyToggle"
                  disabled={!isEditable}
                  checked={formData.tallyExportEnabled}
                  onChange={(e) => setFormData({ ...formData, tallyExportEnabled: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="tallyToggle" className="font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                  Enable one-click Tally Prime XML accounting voucher export
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. 10-Role RBAC Permissions Matrix */}
      {activeTab === 'RBAC_MATRIX' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                10-Role RBAC Scoping & Security Matrix
              </h3>
              <p className="text-xs text-slate-500">
                Strict separation of duties between data entry, documentation, customs approval, finance, and warehouse
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rbacMatrix.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-slate-100">{item.title}</span>
                  <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                    {item.role}
                  </span>
                </div>

                <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                  {item.perms.map((p, pIdx) => (
                    <li key={pIdx} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
