import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  Globe,
  UserCheck,
  Search,
  Bell,
  Sparkles,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  ChevronDown,
  Building2,
  Lock,
} from 'lucide-react';
import { Breadcrumb } from './common/Breadcrumb';

export const Header: React.FC = () => {
  const {
    language,
    setLanguage,
    t,
    currentUser,
    setCurrentUser,
    allUsers,
    companySettings,
    globalSearch,
    setGlobalSearch,
    setIsAiModalOpen,
    setIsQrScannerOpen,
    setIsLoginModalOpen,
    notifications,
    bankGuarantees,
    containers,
    holds,
    declarations,
    activeModule,
    setActiveModule,
  } = useApp();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);

  // Critical Alerts Count
  const expiringBgs = bankGuarantees.filter((b) => b.guaranteeNo.includes('ADCB')); // 26 days left
  const urgentContainers = containers.filter((c) => c.status === 'AT_WAREHOUSE'); // 2 free days left
  const activeHolds = holds.filter((h) => h.status === 'ACTIVE_HOLD');
  const pendingApprovals = declarations.filter((d) =>
    ['L1_PREPARED', 'L2_REVIEWED', 'L3_FINANCE_APPROVED', 'L4_GM_APPROVED'].includes(d.status)
  );
  const totalAlertCount =
    expiringBgs.length + urgentContainers.length + activeHolds.length + pendingApprovals.length;

  const roleBadgeStyles: Record<UserRole, string> = {
    ADMIN: 'bg-rose-50 text-rose-700 border-rose-200',
    CUSTOMS_MGR: 'bg-amber-50 text-amber-700 border-amber-200',
    DOC_OFFICER: 'bg-blue-50 text-blue-700 border-blue-200',
    DATA_ENTRY: 'bg-sky-50 text-sky-700 border-sky-200',
    WAREHOUSE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    FINANCE: 'bg-violet-50 text-violet-700 border-violet-200',
    LOGISTICS: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    GM: 'bg-purple-50 text-purple-700 border-purple-200',
    VIEWER: 'bg-gray-50 text-gray-700 border-gray-200',
    AUDITOR: 'bg-teal-50 text-teal-700 border-teal-200',
  };

  const getModuleTitle = () => {
    switch (activeModule) {
      case 'dashboard':
        return t.nav_dashboard;
      case 'masters':
        return t.nav_masters;
      case 'import_declarations':
        return t.nav_import;
      case 'export_declarations':
        return t.nav_export;
      case 'transfer_declarations':
        return t.nav_transfer;
      case 'duty_finance':
        return t.nav_duty_finance;
      case 'documents':
        return t.nav_documents;
      case 'containers':
        return t.nav_containers;
      case 'inspections':
        return t.nav_inspections;
      case 'clearance':
        return t.nav_clearance;
      case 'stock_reconciliation':
        return t.nav_stock_reconciliation;
      case 'reports':
        return t.nav_reports;
      case 'integrations':
        return t.nav_integrations;
      case 'audit_trail':
        return t.nav_audit;
      case 'settings':
        return t.nav_settings;
      case 'api_docs':
        return t.nav_api_docs;
      default:
        return t.nav_dashboard;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white text-[#111827] border-b border-[#E5E7EB] shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-4">
          
          {/* Left: Breadcrumbs & Organization Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#1E3A5F] text-white flex items-center justify-center font-bold text-xs shrink-0 tracking-wider shadow-xs">
                ET
              </div>
              <div className="hidden sm:block min-w-0">
                <Breadcrumb
                  items={[
                    {
                      label: language === 'ar' ? companySettings.companyNameAr : companySettings.companyNameEn,
                      onClick: () => setActiveModule('dashboard'),
                    },
                    {
                      label: getModuleTitle(),
                    },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Center: Global Search with shortcut badge */}
          <div className="hidden md:flex flex-1 max-w-xs lg:max-w-md relative">
            <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-[#9CA3AF]">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="global-search-input"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full ps-9 pe-8 py-1.5 bg-[#F9FAFB] hover:bg-[#F3F4F6] text-sm text-[#111827] rounded-lg border border-[#E5E7EB] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] placeholder-[#9CA3AF] transition-colors"
            />
            <div className="absolute inset-y-0 end-0 pe-2.5 flex items-center pointer-events-none">
              <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-[#6B7280] bg-white border border-[#E5E7EB] rounded shadow-2xs">
                /
              </kbd>
            </div>
          </div>

          {/* Right: Actions, Notifications, Language, and RBAC Persona Switcher */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* AI Customs Advisor Tool */}
            <button
              id="btn-ai-advisor-header"
              onClick={() => setIsAiModalOpen(true)}
              className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-medium border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#374151] hover:text-[#111827] transition-colors"
              title="AI Customs Tariff & HS Code Advisor"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#1E3A5F]" />
              <span className="hidden lg:inline">{t.ai_assistant}</span>
            </button>

            {/* QR Code Pass Scanner */}
            <button
              id="btn-qr-scanner-header"
              onClick={() => setIsQrScannerOpen(true)}
              className="p-1.5 h-8 w-8 flex items-center justify-center rounded-lg text-[#374151] hover:text-[#111827] hover:bg-[#F9FAFB] border border-[#E5E7EB] transition-colors"
              title="Verify Gate Pass or Document QR Code"
            >
              <QrCode className="w-4 h-4" />
            </button>

            {/* Notifications Alert Bell */}
            <div className="relative">
              <button
                id="btn-notifications-header"
                onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
                className="relative p-1.5 h-8 w-8 flex items-center justify-center rounded-lg text-[#374151] hover:text-[#111827] hover:bg-[#F9FAFB] border border-[#E5E7EB] transition-colors"
                title={t.notifications}
              >
                <Bell className="w-4 h-4" />
                {totalAlertCount > 0 && (
                  <span className="absolute -top-1 -end-1 min-w-[16px] h-4 px-1 bg-[#DC2626] text-white text-[10px] font-semibold rounded-full flex items-center justify-center leading-none">
                    {totalAlertCount}
                  </span>
                )}
              </button>

              {isNotifDropdownOpen && (
                <div
                  className="absolute end-0 mt-1.5 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-[#E5E7EB] py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setIsNotifDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-[#E5E7EB] flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-[#111827] uppercase tracking-wider">
                        {t.alerts}
                      </h4>
                      <p className="text-[11px] text-[#6B7280]">Operational deadline alerts</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full font-medium">
                      {totalAlertCount} Active
                    </span>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-[#E5E7EB] text-xs">
                    {pendingApprovals.length > 0 && (
                      <div
                        onClick={() => setActiveModule('import_declarations')}
                        className="p-3 hover:bg-[#F9FAFB] cursor-pointer flex gap-2.5 items-start transition-colors"
                      >
                        <Clock className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-[#111827]">
                            {pendingApprovals.length} Declarations Pending Approval
                          </p>
                          <p className="text-[#6B7280] mt-0.5">
                            Level 1–4 workflow approvals required before customs submission.
                          </p>
                        </div>
                      </div>
                    )}

                    {urgentContainers.length > 0 && (
                      <div
                        onClick={() => setActiveModule('containers')}
                        className="p-3 hover:bg-[#F9FAFB] cursor-pointer flex gap-2.5 items-start transition-colors"
                      >
                        <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-[#111827]">
                            Container TGHU9918231 (COSCO) Free Days Alert
                          </p>
                          <p className="text-[#6B7280] mt-0.5">
                            2 days remaining to return empty container before AED 200/day demurrage.
                          </p>
                        </div>
                      </div>
                    )}

                    {expiringBgs.length > 0 && (
                      <div
                        onClick={() => setActiveModule('duty_finance')}
                        className="p-3 hover:bg-[#F9FAFB] cursor-pointer flex gap-2.5 items-start transition-colors"
                      >
                        <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-[#111827]">
                            Bank Guarantee ADCB Expiring Soon
                          </p>
                          <p className="text-[#6B7280] mt-0.5">
                            BG/2025/ADCB/04118 (AED 250,000) expires 2026-08-31. Initiate renewal.
                          </p>
                        </div>
                      </div>
                    )}

                    {activeHolds.length > 0 && (
                      <div
                        onClick={() => setActiveModule('inspections')}
                        className="p-3 hover:bg-[#F9FAFB] cursor-pointer flex gap-2.5 items-start transition-colors"
                      >
                        <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-[#111827]">
                            {activeHolds.length} Shipment Under Customs Hold
                          </p>
                          <p className="text-[#6B7280] mt-0.5">
                            SAIF Zone Physical Inspection requested for raw denim lot.
                          </p>
                        </div>
                      </div>
                    )}

                    {notifications.slice(0, 2).map((n) => (
                      <div key={n.id} className="p-3 hover:bg-[#F9FAFB] flex gap-2.5 items-start transition-colors">
                        <FileText className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-[#111827]">{n.subject}</p>
                          <p className="text-[#6B7280] mt-0.5 line-clamp-2">{n.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Language Switcher */}
            <button
              id="btn-language-switcher"
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-medium border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#374151] hover:text-[#111827] transition-colors"
              title="Toggle English / Arabic (RTL)"
            >
              <Globe className="w-3.5 h-3.5 text-[#6B7280]" />
              <span className="font-medium">{language === 'en' ? 'العربية' : 'English'}</span>
            </button>

            {/* Persona / RBAC Role Selector Dropdown */}
            <div className="relative">
              <button
                id="btn-role-switcher-header"
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center gap-2 h-8 px-2 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#111827] transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden xl:block text-start leading-tight">
                  <div className="font-semibold text-xs truncate max-w-[110px]">
                    {language === 'ar' && currentUser.nameAr ? currentUser.nameAr : currentUser.name}
                  </div>
                </div>
                <span className={`hidden sm:inline-block px-1.5 py-0.2 rounded text-[10px] font-medium border ${roleBadgeStyles[currentUser.role]}`}>
                  {currentUser.role}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#6B7280]" />
              </button>

              {isRoleDropdownOpen && (
                <div
                  className="absolute end-0 mt-1.5 w-72 bg-white rounded-lg shadow-lg border border-[#E5E7EB] py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setIsRoleDropdownOpen(false)}
                >
                  <div className="px-3.5 py-2 border-b border-[#E5E7EB]">
                    <p className="text-xs font-semibold text-[#111827]">{t.switchRole}</p>
                    <p className="text-[11px] text-[#6B7280]">Select from 10 enterprise RBAC personas</p>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-[#E5E7EB] text-xs">
                    {allUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => setCurrentUser(u)}
                        className={`w-full px-3.5 py-2.5 text-start flex items-center justify-between hover:bg-[#F9FAFB] transition-colors ${
                          currentUser.id === u.id ? 'bg-[#F1F5F9] font-medium' : ''
                        }`}
                      >
                        <div className="min-w-0 pe-2">
                          <p className="font-medium text-[#111827] truncate">
                            {language === 'ar' && u.nameAr ? u.nameAr : u.name}
                          </p>
                          <p className="text-[11px] text-[#6B7280] truncate">{u.department}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium border shrink-0 ${roleBadgeStyles[u.role]}`}>
                          {u.role}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="p-2 border-t border-[#E5E7EB] bg-slate-50">
                    <button
                      onClick={() => setIsLoginModalOpen(true)}
                      className="w-full py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-2 transition"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Security Login & Password Auth</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
