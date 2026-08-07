import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  SystemModule,
  Declaration,
  CompanySettings,
  HsCode,
  ItemMaster,
  BusinessPartner,
  BankGuarantee,
  DutyRefund,
  ContainerRecord,
  InspectionRecord,
  HoldRecord,
  GatePassRecord,
  CustomsStockItem,
  WarehouseStockItem,
  StockReconciliationRun,
  CustomsDocument,
  AuditLogEntry,
  NotificationLog,
  TallyExportLog,
  OutboxMessage,
  UserSession,
  ReportSnapshot,
  DataMigrationJob,
} from '../types';
import { translations, Language } from '../i18n/translations';
import {
  initialUsers,
  initialCompanySettings,
  initialHsCodes,
  initialPartners,
  initialItemMaster,
  initialDeclarations,
  initialBankGuarantees,
  initialDutyRefunds,
  initialContainers,
  initialInspections,
  initialHolds,
  initialGatePasses,
  initialCustomsStock,
  initialWarehouseStock,
  initialReconciliations,
  initialCustomsDocuments,
  initialAuditLogs,
  initialNotifications,
  initialTallyExports,
} from '../data/initialData';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
  isAuthenticated: boolean;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  allUsers: User[];
  setAllUsers: React.Dispatch<React.SetStateAction<User[]>>;
  activeModule: SystemModule;
  setActiveModule: (mod: SystemModule) => void;
  companySettings: CompanySettings;
  setCompanySettings: (settings: CompanySettings) => void;
  declarations: Declaration[];
  setDeclarations: React.Dispatch<React.SetStateAction<Declaration[]>>;
  hsCodes: HsCode[];
  setHsCodes: React.Dispatch<React.SetStateAction<HsCode[]>>;
  items: ItemMaster[];
  setItems: React.Dispatch<React.SetStateAction<ItemMaster[]>>;
  partners: BusinessPartner[];
  setPartners: React.Dispatch<React.SetStateAction<BusinessPartner[]>>;
  bankGuarantees: BankGuarantee[];
  setBankGuarantees: React.Dispatch<React.SetStateAction<BankGuarantee[]>>;
  dutyRefunds: DutyRefund[];
  setDutyRefunds: React.Dispatch<React.SetStateAction<DutyRefund[]>>;
  containers: ContainerRecord[];
  setContainers: React.Dispatch<React.SetStateAction<ContainerRecord[]>>;
  inspections: InspectionRecord[];
  setInspections: React.Dispatch<React.SetStateAction<InspectionRecord[]>>;
  holds: HoldRecord[];
  setHolds: React.Dispatch<React.SetStateAction<HoldRecord[]>>;
  gatePasses: GatePassRecord[];
  setGatePasses: React.Dispatch<React.SetStateAction<GatePassRecord[]>>;
  customsStock: CustomsStockItem[];
  setCustomsStock: React.Dispatch<React.SetStateAction<CustomsStockItem[]>>;
  warehouseStock: WarehouseStockItem[];
  setWarehouseStock: React.Dispatch<React.SetStateAction<WarehouseStockItem[]>>;
  reconciliations: StockReconciliationRun[];
  setReconciliations: React.Dispatch<React.SetStateAction<StockReconciliationRun[]>>;
  documents: CustomsDocument[];
  setDocuments: React.Dispatch<React.SetStateAction<CustomsDocument[]>>;
  auditLogs: AuditLogEntry[];
  addAuditLog: (action: string, module: SystemModule, entityType: string, entityId: string, entityRef: string, details: string) => void;
  notifications: NotificationLog[];
  outboxMessages: OutboxMessage[];
  setOutboxMessages: React.Dispatch<React.SetStateAction<OutboxMessage[]>>;
  userSessions: UserSession[];
  setUserSessions: React.Dispatch<React.SetStateAction<UserSession[]>>;
  reportSnapshots: ReportSnapshot[];
  setReportSnapshots: React.Dispatch<React.SetStateAction<ReportSnapshot[]>>;
  migrationJobs: DataMigrationJob[];
  setMigrationJobs: React.Dispatch<React.SetStateAction<DataMigrationJob[]>>;
  tallyExports: TallyExportLog[];
  setTallyExports: React.Dispatch<React.SetStateAction<TallyExportLog[]>>;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
  isAiModalOpen: boolean;
  setIsAiModalOpen: (open: boolean) => void;
  isQrScannerOpen: boolean;
  setIsQrScannerOpen: (open: boolean) => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  printDocData: any | null;
  setPrintDocData: (data: any | null) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  hasPermission: (module: SystemModule, action: 'view' | 'create' | 'edit' | 'approve' | 'delete') => boolean;
  loginUser: (user: User) => void;
  logoutUser: () => void;
  isRtl: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function getStoredUser(): User {
  try {
    const storedUser = localStorage.getItem('euro_trousers_current_user');
    return storedUser ? JSON.parse(storedUser) as User : initialUsers[0];
  } catch {
    return initialUsers[0];
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [currentUser, setCurrentUser] = useState<User>(getStoredUser);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => Boolean(
    localStorage.getItem('euro_trousers_jwt_token') && localStorage.getItem('euro_trousers_current_user')
  ));
  const [allUsers, setAllUsers] = useState<User[]>(initialUsers);
  const [activeModule, setActiveModule] = useState<SystemModule>('dashboard');
  const [companySettings, setCompanySettings] = useState<CompanySettings>(initialCompanySettings);

  // Core Data Collections
  const [declarations, setDeclarations] = useState<Declaration[]>(initialDeclarations);
  const [hsCodes, setHsCodes] = useState<HsCode[]>(initialHsCodes);
  const [items, setItems] = useState<ItemMaster[]>(initialItemMaster);
  const [partners, setPartners] = useState<BusinessPartner[]>(initialPartners);
  const [bankGuarantees, setBankGuarantees] = useState<BankGuarantee[]>(initialBankGuarantees);
  const [dutyRefunds, setDutyRefunds] = useState<DutyRefund[]>(initialDutyRefunds);
  const [containers, setContainers] = useState<ContainerRecord[]>(initialContainers);
  const [inspections, setInspections] = useState<InspectionRecord[]>(initialInspections);
  const [holds, setHolds] = useState<HoldRecord[]>(initialHolds);
  const [gatePasses, setGatePasses] = useState<GatePassRecord[]>(initialGatePasses);
  const [customsStock, setCustomsStock] = useState<CustomsStockItem[]>(initialCustomsStock);
  const [warehouseStock, setWarehouseStock] = useState<WarehouseStockItem[]>(initialWarehouseStock);
  const [reconciliations, setReconciliations] = useState<StockReconciliationRun[]>(initialReconciliations);
  const [documents, setDocuments] = useState<CustomsDocument[]>(initialCustomsDocuments);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(initialAuditLogs);
  const [notifications, setNotifications] = useState<NotificationLog[]>(initialNotifications);
  const [tallyExports, setTallyExports] = useState<TallyExportLog[]>(initialTallyExports);

  // New Production Engine Collections
  const [outboxMessages, setOutboxMessages] = useState<OutboxMessage[]>([
    {
      id: 'outbox-1',
      event: 'DECLARATION_CLEARED',
      channel: 'EMAIL',
      recipient: 'customs.mgr@eurotrousers.ae',
      recipientName: 'Rashid Kamal',
      subject: 'SAIF Zone Declaration IMP-2026-0001 CLEARED',
      content: 'Declaration IMP-2026-0001 has been officially cleared by Sharjah Customs. Stock automatically posted.',
      status: 'SENT',
      attempts: 1,
      maxAttempts: 3,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      sentAt: new Date(Date.now() - 3550000).toISOString(),
    },
    {
      id: 'outbox-2',
      event: 'HOLD_ESCALATION_ALERT',
      channel: 'WHATSAPP',
      recipient: '+971501234567',
      recipientName: 'Hassan Darwish (Logistics)',
      subject: 'HOLD ESCALATION: IMP-2026-0003 Active > 3 Days',
      content: 'URGENT: Declaration IMP-2026-0003 is held at SAIF Zone gate for >3 days. Customs officer review required.',
      status: 'QUEUED',
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date().toISOString(),
    },
  ]);

  const [userSessions, setUserSessions] = useState<UserSession[]>([
    {
      id: 'sess-active-1',
      userId: 'usr-1',
      userName: 'Tariq Al-Mansoor',
      userRole: 'ADMIN',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      isCurrent: true,
    },
  ]);

  const [reportSnapshots, setReportSnapshots] = useState<ReportSnapshot[]>([]);
  const [migrationJobs, setMigrationJobs] = useState<DataMigrationJob[]>([]);

  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(true);
  const [printDocData, setPrintDocData] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isRtl = language === 'ar';

  const loginUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('euro_trousers_current_user', JSON.stringify(user));
    setIsAuthenticated(true);
    showToast(`Authenticated as ${user.name} (${user.role})`);
    addAuditLog(
      'USER_LOGIN',
      'settings',
      'User',
      user.id,
      user.email,
      `Switched session active user to ${user.name} (${user.role})`
    );
  };

  const logoutUser = () => {
    localStorage.removeItem('euro_trousers_jwt_token');
    localStorage.removeItem('euro_trousers_current_user');
    setIsAuthenticated(false);
    setIsLoginModalOpen(true);
    showToast('Logged out of active session.');
  };

  // Sync RTL / LTR document direction with language
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const addAuditLog = (
    action: string,
    module: SystemModule,
    entityType: string,
    entityId: string,
    entityRef: string,
    details: string
  ) => {
    const entry: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      module,
      action,
      entityType,
      entityId,
      entityRef,
      timestamp: new Date().toISOString(),
      ipAddress: '192.168.1.100',
      details,
    };
    setAuditLogs((prev) => [entry, ...prev]);
  };

  // Role Based Access Control Matrix
  const hasPermission = (module: SystemModule, action: 'view' | 'create' | 'edit' | 'approve' | 'delete'): boolean => {
    const role = currentUser.role;
    if (role === 'ADMIN') return true;
    if (role === 'AUDITOR' || role === 'VIEWER') return action === 'view';

    switch (module) {
      case 'dashboard':
        return true;
      case 'masters':
        if (['CUSTOMS_MGR', 'DOC_OFFICER'].includes(role)) return true;
        return action === 'view';
      case 'import_declarations':
      case 'export_declarations':
      case 'transfer_declarations':
        if (action === 'view') return true;
        if (action === 'create' || action === 'edit') return ['DATA_ENTRY', 'DOC_OFFICER', 'CUSTOMS_MGR'].includes(role);
        if (action === 'approve') return ['CUSTOMS_MGR', 'FINANCE', 'GM'].includes(role);
        return false;
      case 'duty_finance':
        if (['FINANCE', 'CUSTOMS_MGR', 'GM'].includes(role)) return true;
        return action === 'view';
      case 'documents':
        if (['DOC_OFFICER', 'CUSTOMS_MGR', 'DATA_ENTRY'].includes(role)) return true;
        return action === 'view';
      case 'containers':
        if (['LOGISTICS', 'WAREHOUSE', 'CUSTOMS_MGR'].includes(role)) return true;
        return action === 'view';
      case 'inspections':
        if (['CUSTOMS_MGR', 'LOGISTICS', 'WAREHOUSE', 'GM'].includes(role)) return true;
        return action === 'view';
      case 'clearance':
        if (['DOC_OFFICER', 'LOGISTICS', 'WAREHOUSE', 'CUSTOMS_MGR'].includes(role)) return true;
        return action === 'view';
      case 'stock_reconciliation':
        if (action === 'approve') return ['CUSTOMS_MGR', 'GM'].includes(role);
        if (['WAREHOUSE', 'CUSTOMS_MGR', 'FINANCE'].includes(role)) return true;
        return action === 'view';
      case 'reports':
        return true;
      case 'integrations':
        return ['FINANCE', 'CUSTOMS_MGR'].includes(role);
      case 'audit_trail':
        return ['ADMIN', 'AUDITOR', 'CUSTOMS_MGR', 'GM'].includes(role);
      case 'settings':
        return role === 'ADMIN';
      default:
        return true;
    }
  };

  const t = translations[language];

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isAuthenticated,
        currentUser,
        setCurrentUser,
        allUsers,
        setAllUsers,
        activeModule,
        setActiveModule,
        companySettings,
        setCompanySettings,
        declarations,
        setDeclarations,
        hsCodes,
        setHsCodes,
        items,
        setItems,
        partners,
        setPartners,
        bankGuarantees,
        setBankGuarantees,
        dutyRefunds,
        setDutyRefunds,
        containers,
        setContainers,
        inspections,
        setInspections,
        holds,
        setHolds,
        gatePasses,
        setGatePasses,
        customsStock,
        setCustomsStock,
        warehouseStock,
        setWarehouseStock,
        reconciliations,
        setReconciliations,
        documents,
        setDocuments,
        auditLogs,
        addAuditLog,
        notifications,
        outboxMessages,
        setOutboxMessages,
        userSessions,
        setUserSessions,
        reportSnapshots,
        setReportSnapshots,
        migrationJobs,
        setMigrationJobs,
        tallyExports,
        setTallyExports,
        globalSearch,
        setGlobalSearch,
        isAiModalOpen,
        setIsAiModalOpen,
        isQrScannerOpen,
        setIsQrScannerOpen,
        isLoginModalOpen,
        setIsLoginModalOpen,
        printDocData,
        setPrintDocData,
        toastMessage,
        showToast,
        hasPermission,
        loginUser,
        logoutUser,
        isRtl,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
