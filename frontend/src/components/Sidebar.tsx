import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SystemModule } from '../types';
import {
  LayoutDashboard,
  Database,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  Coins,
  FileCheck2,
  Container,
  ScanEye,
  ShieldCheck,
  Scale,
  FileSpreadsheet,
  Network,
  History,
  Settings,
  Code2,
  Lock,
  ChevronLeft,
  ChevronRight,
  Building2,
} from 'lucide-react';

interface NavItem {
  id: SystemModule;
  labelKey: keyof typeof import('../i18n/translations').translations.en;
  icon: React.ElementType;
  badge?: number | string;
  badgeType?: 'blue' | 'emerald' | 'amber' | 'rose' | 'gray';
  group: 'CORE' | 'DECLARATIONS' | 'OPERATIONS' | 'COMPLIANCE_SETUP';
}

export const Sidebar: React.FC = () => {
  const {
    activeModule,
    setActiveModule,
    t,
    hasPermission,
    declarations,
    holds,
    containers,
    reconciliations,
  } = useApp();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const pendingImports = declarations.filter(
    (d) => d.declarationType === 'IMPORT' && !['CLOSED', 'CANCELLED', 'REJECTED'].includes(d.status)
  ).length;

  const pendingExports = declarations.filter(
    (d) => d.declarationType === 'EXPORT' && !['CLOSED', 'CANCELLED', 'REJECTED'].includes(d.status)
  ).length;

  const activeHoldsCount = holds.filter((h) => h.status === 'ACTIVE_HOLD').length;
  const activeContainersCount = containers.filter((c) => c.status !== 'RETURNED_EMPTY').length;
  const pendingReconciliations = reconciliations.filter((r) => r.status === 'PENDING_APPROVAL').length;

  const navItems: NavItem[] = [
    // Group: Core
    { id: 'dashboard', labelKey: 'nav_dashboard', icon: LayoutDashboard, group: 'CORE' },
    { id: 'masters', labelKey: 'nav_masters', icon: Database, group: 'CORE' },

    // Group: Declarations
    {
      id: 'import_declarations',
      labelKey: 'nav_import',
      icon: ArrowDownToLine,
      badge: pendingImports > 0 ? pendingImports : undefined,
      badgeType: 'blue',
      group: 'DECLARATIONS',
    },
    {
      id: 'export_declarations',
      labelKey: 'nav_export',
      icon: ArrowUpFromLine,
      badge: pendingExports > 0 ? pendingExports : undefined,
      badgeType: 'emerald',
      group: 'DECLARATIONS',
    },
    {
      id: 'transfer_declarations',
      labelKey: 'nav_transfer',
      icon: ArrowLeftRight,
      group: 'DECLARATIONS',
    },

    // Group: Operations & Logistics
    { id: 'duty_finance', labelKey: 'nav_duty_finance', icon: Coins, group: 'OPERATIONS' },
    { id: 'documents', labelKey: 'nav_documents', icon: FileCheck2, group: 'OPERATIONS' },
    {
      id: 'containers',
      labelKey: 'nav_containers',
      icon: Container,
      badge: activeContainersCount > 0 ? activeContainersCount : undefined,
      badgeType: 'amber',
      group: 'OPERATIONS',
    },
    {
      id: 'inspections',
      labelKey: 'nav_inspections',
      icon: ScanEye,
      badge: activeHoldsCount > 0 ? `${activeHoldsCount}` : undefined,
      badgeType: 'rose',
      group: 'OPERATIONS',
    },
    { id: 'clearance', labelKey: 'nav_clearance', icon: ShieldCheck, group: 'OPERATIONS' },
    {
      id: 'stock_reconciliation',
      labelKey: 'nav_stock_reconciliation',
      icon: Scale,
      badge: pendingReconciliations > 0 ? 'Pending' : undefined,
      badgeType: 'blue',
      group: 'OPERATIONS',
    },

    // Group: Compliance & Setup
    { id: 'reports', labelKey: 'nav_reports', icon: FileSpreadsheet, group: 'COMPLIANCE_SETUP' },
    { id: 'integrations', labelKey: 'nav_integrations', icon: Network, group: 'COMPLIANCE_SETUP' },
    { id: 'audit_trail', labelKey: 'nav_audit', icon: History, group: 'COMPLIANCE_SETUP' },
    { id: 'settings', labelKey: 'nav_settings', icon: Settings, group: 'COMPLIANCE_SETUP' },
    { id: 'api_docs' as any, labelKey: 'nav_api_docs', icon: Code2, group: 'COMPLIANCE_SETUP' },
  ];

  const groupLabels: Record<string, string> = {
    CORE: 'Overview & Masters',
    DECLARATIONS: 'Customs Declarations',
    OPERATIONS: 'Logistics & Ledgers',
    COMPLIANCE_SETUP: 'Audit & Configuration',
  };

  const groups = ['CORE', 'DECLARATIONS', 'OPERATIONS', 'COMPLIANCE_SETUP'];

  const getBadgeClass = (type?: string) => {
    switch (type) {
      case 'emerald':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'amber':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'rose':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'blue':
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <aside
      className={`${
        isCollapsed ? 'w-16' : 'w-64'
      } bg-white text-[#374151] border-e border-[#E5E7EB] flex flex-col shrink-0 min-h-[calc(100vh-3.5rem)] transition-all duration-200 ease-in-out select-none shadow-2xs`}
    >
      {/* Navigation Groups List */}
      <div className="flex-1 py-3 px-2 space-y-5 overflow-y-auto">
        {groups.map((grp) => {
          const itemsInGroup = navItems.filter((item) => item.group === grp);
          return (
            <div key={grp} className="space-y-0.5">
              {!isCollapsed && (
                <h4 className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                  {groupLabels[grp]}
                </h4>
              )}
              <div className="space-y-0.5">
                {itemsInGroup.map((item) => {
                  const allowed = hasPermission(item.id, 'view');
                  const isActive = activeModule === item.id;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      id={`nav-item-${item.id}`}
                      onClick={() => allowed && setActiveModule(item.id)}
                      disabled={!allowed}
                      title={isCollapsed ? t[item.labelKey] : undefined}
                      className={`w-full flex items-center ${
                        isCollapsed ? 'justify-center px-2 py-2' : 'justify-between px-2.5 py-1.5'
                      } rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-[#F1F5F9] text-[#1E3A5F] font-semibold border-s-2 border-[#1E3A5F] rtl:border-s-0 rtl:border-e-2'
                          : allowed
                          ? 'text-[#4B5563] hover:bg-[#F9FAFB] hover:text-[#111827]'
                          : 'text-[#9CA3AF] cursor-not-allowed opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 stroke-[1.75] ${
                            isActive ? 'text-[#1E3A5F]' : 'text-[#6B7280]'
                          }`}
                        />
                        {!isCollapsed && <span className="truncate">{t[item.labelKey]}</span>}
                      </div>

                      {!isCollapsed && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          {!allowed && <Lock className="w-3 h-3 text-[#9CA3AF]" />}
                          {item.badge && (
                            <span
                              className={`px-1.5 py-0.2 rounded-full text-[10px] font-medium border ${getBadgeClass(
                                item.badgeType
                              )}`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Free Zone Status Indicator & Collapse Toggle */}
      <div className="p-3 border-t border-[#E5E7EB] bg-[#FDFDFE] text-xs">
        {!isCollapsed ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="font-semibold text-xs text-[#111827]">SAIF Zone Gateway</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.2 bg-[#F1F5F9] text-[#1E3A5F] rounded border border-[#E2E8F0] font-medium">
                Active
              </span>
            </div>
            <p className="text-[11px] text-[#6B7280] leading-tight">
              Sharjah Customs Direct Link • Plot Q4-081
            </p>
            <button
              onClick={() => setIsCollapsed(true)}
              className="w-full flex items-center justify-center gap-1.5 py-1 text-[11px] font-medium text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-md transition-colors border border-transparent hover:border-[#E5E7EB]"
            >
              <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-180" />
              <span>Collapse Sidebar</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" title="SAIF Zone Online"></span>
            <button
              onClick={() => setIsCollapsed(false)}
              className="p-1 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-md transition-colors"
              title="Expand Sidebar"
            >
              <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
