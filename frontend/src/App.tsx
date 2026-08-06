import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';

// Modals
import { AiAdvisorModal } from './components/modals/AiAdvisorModal';
import { OfficialDocumentPrintModal } from './components/modals/OfficialDocumentPrintModal';
import { QrScannerModal } from './components/modals/QrScannerModal';
import { LoginModal } from './components/modals/LoginModal';

// Modules
import { DashboardModule } from './components/modules/DashboardModule';
import { CustomsMasterModule } from './components/modules/CustomsMasterModule';
import { ImportDeclarationsModule } from './components/modules/ImportDeclarationsModule';
import { ExportDeclarationsModule } from './components/modules/ExportDeclarationsModule';
import { TransferDeclarationsModule } from './components/modules/TransferDeclarationsModule';
import { DutyFinanceModule } from './components/modules/DutyFinanceModule';
import { DocumentsModule } from './components/modules/DocumentsModule';
import { ContainerModule } from './components/modules/ContainerModule';
import { InspectionModule } from './components/modules/InspectionModule';
import { ClearanceModule } from './components/modules/ClearanceModule';
import { StockReconciliationModule } from './components/modules/StockReconciliationModule';
import { ReportsModule } from './components/modules/ReportsModule';
import { IntegrationsModule } from './components/modules/IntegrationsModule';
import { AuditTrailModule } from './components/modules/AuditTrailModule';
import { SettingsModule } from './components/modules/SettingsModule';
import { ApiDocsModule } from './components/modules/ApiDocsModule';

const AppContent: React.FC = () => {
  const { activeModule, toastMessage, isRtl } = useApp();

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardModule />;
      case 'masters':
        return <CustomsMasterModule />;
      case 'import_declarations':
        return <ImportDeclarationsModule />;
      case 'export_declarations':
        return <ExportDeclarationsModule />;
      case 'transfer_declarations':
        return <TransferDeclarationsModule />;
      case 'duty_finance':
        return <DutyFinanceModule />;
      case 'documents':
        return <DocumentsModule />;
      case 'containers':
        return <ContainerModule />;
      case 'inspections':
        return <InspectionModule />;
      case 'clearance':
        return <ClearanceModule />;
      case 'stock_reconciliation':
        return <StockReconciliationModule />;
      case 'reports':
        return <ReportsModule />;
      case 'integrations':
        return <IntegrationsModule />;
      case 'audit_trail':
        return <AuditTrailModule />;
      case 'settings':
        return <SettingsModule />;
      case 'api_docs':
        return <ApiDocsModule />;
      default:
        return <DashboardModule />;
    }
  };

  return (
    <div
      className={`min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans ${
        isRtl ? 'rtl' : 'ltr'
      }`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* Dynamic Module Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {renderActiveModule()}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <AiAdvisorModal />
      <OfficialDocumentPrintModal />
      <QrScannerModal />
      <LoginModal />

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 end-5 z-50 animate-bounce duration-300">
          <div className="px-4 py-3 rounded-lg shadow-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold flex items-center gap-2 border border-slate-700 dark:border-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
