import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { apiFetch } from '../../lib/api';
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
  UserPlus,
  UserCheck,
  UserX,
  RotateCcw,
  KeyRound,
  Trash2,
  Activity,
  AlertTriangle,
  RefreshCw,
  X,
  Check,
  ShieldAlert,
} from 'lucide-react';
import { CompanySettings, User, UserRole, UserSession } from '../../types';

export const SettingsModule: React.FC = () => {
  const {
    companySettings,
    setCompanySettings,
    allUsers,
    setAllUsers,
    currentUser,
    addAuditLog,
    showToast,
    t,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'COMPANY' | 'CUSTOMS_RULES' | 'USER_ADMIN' | 'SESSIONS' | 'RBAC_MATRIX'>('COMPANY');
  const [formData, setFormData] = useState<CompanySettings>({ ...companySettings });

  // User Administration State
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState<boolean>(false);
  const [newUserName, setNewUserName] = useState<string>('');
  const [newUserLoginId, setNewUserLoginId] = useState<string>('');
  const [newUserEmail, setNewUserEmail] = useState<string>('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('DATA_ENTRY');
  const [newUserDept, setNewUserDept] = useState<string>('Customs Operations');
  const [newUserPassword, setNewUserPassword] = useState<string>('');
  const [createdTempPassword, setCreatedTempPassword] = useState<string | null>(null);

  // Edit User State
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Active Sessions State
  const [activeSessions, setActiveSessions] = useState<UserSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState<boolean>(false);

  // Permissions Matrix Grid State
  const [matrixData, setMatrixData] = useState<Record<string, any>>({
    ADMIN: { all: true },
    CUSTOMS_MGR: {
      import_declarations: { view: true, create: true, edit: true, approve: true, delete: false },
      export_declarations: { view: true, create: true, edit: true, approve: true, delete: false },
      transfer_declarations: { view: true, create: true, edit: true, approve: true, delete: false },
      stock_reconciliation: { view: true, create: true, edit: true, approve: true, delete: false },
    },
    DOC_OFFICER: {
      import_declarations: { view: true, create: true, edit: true, approve: false, delete: false },
      documents: { view: true, create: true, edit: true, approve: true, delete: false },
    },
    FINANCE: {
      duty_finance: { view: true, create: true, edit: true, approve: true, delete: false },
      import_declarations: { view: true, create: false, edit: false, approve: true, delete: false },
    },
    GM: {
      import_declarations: { view: true, create: false, edit: false, approve: true, delete: false },
      duty_finance: { view: true, create: false, edit: false, approve: true, delete: false },
      reports: { view: true, create: true, edit: true, approve: true, delete: false },
    },
  });

  const isEditable = currentUser.role === 'ADMIN';

  useEffect(() => {
    if (activeTab === 'SESSIONS') {
      fetchSessions();
    } else if (activeTab === 'RBAC_MATRIX') {
      fetchMatrix();
    }
  }, [activeTab]);

  const fetchSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const token = localStorage.getItem('euro_trousers_jwt_token');
      if (!token) throw new Error('Sign in is required');
      const res = await apiFetch('/api/auth/sessions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setActiveSessions(data);
      }
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const fetchMatrix = async () => {
    try {
      const token = localStorage.getItem('euro_trousers_jwt_token');
      if (!token) throw new Error('Sign in is required');
      const res = await apiFetch('/api/admin/permissions-matrix', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMatrixData(data);
      }
    } catch (err) {
      console.error('Failed to fetch permissions matrix:', err);
    }
  };

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

  // User Admin Actions
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserLoginId || !newUserEmail) return;

    try {
      const token = localStorage.getItem('euro_trousers_jwt_token');
      if (!token) throw new Error('Sign in is required');
      const res = await apiFetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newUserName,
          loginId: newUserLoginId,
          email: newUserEmail,
          role: newUserRole,
          department: newUserDept,
          password: newUserPassword || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(`Error: ${data.error}`);
        return;
      }

      setAllUsers((prev) => [...prev, data]);
      setCreatedTempPassword(data.tempPassword || 'TempPassword2026!');
      showToast(`User ${data.name} created successfully! Password set.`);
    } catch (err: any) {
      showToast(`Failed to create user: ${err.message}`);
    }
  };

  const handleToggleUserActive = async (user: User) => {
    const updatedStatus = !user.isActive;
    try {
      const token = localStorage.getItem('euro_trousers_jwt_token');
      if (!token) throw new Error('Sign in is required');
      const res = await apiFetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: updatedStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        showToast(`Error: ${data.error}`);
        return;
      }

      setAllUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isActive: updatedStatus } : u))
      );
      showToast(
        `User ${user.name} has been ${updatedStatus ? 'reactivated' : 'deactivated (all active sessions revoked)'}.`
      );
    } catch (err: any) {
      showToast(`Action failed: ${err.message}`);
    }
  };

  const handleResetPassword = async (user: User) => {
    try {
      const token = localStorage.getItem('euro_trousers_jwt_token');
      if (!token) throw new Error('Sign in is required');
      const res = await apiFetch(`/api/users/${user.id}/reset-password`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(`Error: ${data.error}`);
        return;
      }

      setAllUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, mustChangePassword: true } : u))
      );
      alert(`Temporary password generated for ${user.name}:\n\n${data.tempPassword}\n\nThe user will be forced to change this on next login.`);
      showToast(`Password reset for ${user.name}. Temp password provided.`);
    } catch (err: any) {
      showToast(`Reset failed: ${err.message}`);
    }
  };

  const handleUnlockUser = async (user: User) => {
    try {
      const token = localStorage.getItem('euro_trousers_jwt_token');
      if (!token) throw new Error('Sign in is required');
      const res = await apiFetch(`/api/users/${user.id}/unlock`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(`Error: ${data.error}`);
        return;
      }

      setAllUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isLocked: false, failedAttempts: 0 } : u))
      );
      showToast(`Account unlocked for ${user.name}. Failed login attempts cleared.`);
    } catch (err: any) {
      showToast(`Unlock failed: ${err.message}`);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      const token = localStorage.getItem('euro_trousers_jwt_token');
      if (!token) throw new Error('Sign in is required');
      const res = await apiFetch(`/api/auth/sessions/${sessionId}/revoke`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setActiveSessions((prev) => prev.filter((s) => s.id !== sessionId));
        showToast('Active session revoked successfully!');
      }
    } catch (err: any) {
      showToast(`Revocation failed: ${err.message}`);
    }
  };

  const handleSaveMatrix = async () => {
    try {
      const token = localStorage.getItem('euro_trousers_jwt_token');
      if (!token) throw new Error('Sign in is required');
      const res = await apiFetch('/api/admin/permissions-matrix', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(matrixData),
      });

      if (res.ok) {
        showToast('10-Role RBAC Permissions Matrix saved & applied live to all user API requests!');
      } else {
        const data = await res.json();
        showToast(`Matrix save error: ${data.error}`);
      }
    } catch (err: any) {
      showToast(`Failed to save matrix: ${err.message}`);
    }
  };

  const togglePermission = (role: string, module: string, action: string) => {
    setMatrixData((prev) => {
      const roleObj = { ...(prev[role] || {}) };
      const modObj = { ...(roleObj[module] || {}) };
      modObj[action] = !modObj[action];
      roleObj[module] = modObj;
      return { ...prev, [role]: roleObj };
    });
  };

  const systemModules = [
    { code: 'import_declarations', label: 'Import Declarations' },
    { code: 'export_declarations', label: 'Export Declarations' },
    { code: 'transfer_declarations', label: 'Transfer & Bonded' },
    { code: 'clearance', label: 'Customs Clearance & Gate' },
    { code: 'containers', label: 'Containers & Demurrage' },
    { code: 'duty_finance', label: 'Duty, Guarantee & VAT' },
    { code: 'stock_reconciliation', label: 'Stock Reconciliation' },
    { code: 'masters', label: 'Master Data Setup' },
    { code: 'documents', label: 'Customs Document Vault' },
    { code: 'reports', label: 'Customs Reports & Snapshots' },
    { code: 'settings', label: 'System Administration' },
  ];

  const rolesList: { code: UserRole; label: string }[] = [
    { code: 'ADMIN', label: 'System Admin' },
    { code: 'CUSTOMS_MGR', label: 'Customs Mgr' },
    { code: 'DOC_OFFICER', label: 'Doc Officer' },
    { code: 'DATA_ENTRY', label: 'Data Entry' },
    { code: 'WAREHOUSE', label: 'Warehouse' },
    { code: 'FINANCE', label: 'Finance' },
    { code: 'LOGISTICS', label: 'Logistics' },
    { code: 'GM', label: 'General Mgr' },
    { code: 'VIEWER', label: 'Viewer' },
    { code: 'AUDITOR', label: 'Auditor' },
  ];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t.settings}</h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              System Configuration & Security Administration
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Company credentials, SAIF Zone licenses, 4-tier approval limits, user lifecycle & RBAC permissions matrix
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
      <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 pt-3 gap-6 text-xs font-semibold rounded-t-xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('COMPANY')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
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
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'CUSTOMS_RULES'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Customs & Approval Thresholds</span>
        </button>

        <button
          onClick={() => setActiveTab('USER_ADMIN')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'USER_ADMIN'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User & Role Administration</span>
        </button>

        <button
          onClick={() => setActiveTab('SESSIONS')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'SESSIONS'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Active User Sessions</span>
        </button>

        <button
          onClick={() => setActiveTab('RBAC_MATRIX')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'RBAC_MATRIX'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>RBAC Matrix Grid</span>
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

      {/* 3. USER & ROLE ADMINISTRATION */}
      {activeTab === 'USER_ADMIN' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                User Lifecycle & Role Assignment
              </h3>
              <p className="text-xs text-slate-500">
                Create staff accounts, deactivate access, trigger password resets, and unlock locked accounts.
              </p>
            </div>

            {isEditable && (
              <button
                onClick={() => setIsCreateUserModalOpen(true)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create New User</span>
              </button>
            )}
          </div>

          {/* User Table */}
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Staff Name</th>
                  <th className="p-3">User ID</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">System Role</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Account Status</th>
                  <th className="p-3">Security Lock</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {allUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-semibold">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold flex items-center justify-center text-[10px]">
                          {user.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div>{user.name}</div>
                          {user.nameAr && <div className="text-[10px] text-slate-400 font-arabic">{user.nameAr}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">{user.loginId || user.email.split('@')[0]}</td>
                    <td className="p-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">{user.email}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        {user.role}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{user.department}</td>
                    <td className="p-3">
                      {user.isActive !== false ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600 font-semibold">
                          <UserX className="w-3.5 h-3.5" />
                          <span>Deactivated</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {user.isLocked ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-bold">
                          <Lock className="w-3 h-3" />
                          <span>LOCKED ({user.failedAttempts} fails)</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Unlocked</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {isEditable && (
                        <div className="flex items-center justify-end gap-1.5">
                          {user.isLocked && (
                            <button
                              onClick={() => handleUnlockUser(user)}
                              title="Unlock Account"
                              className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 text-[10px] font-semibold rounded flex items-center gap-1"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Unlock</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleResetPassword(user)}
                            title="Reset Password"
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-semibold rounded flex items-center gap-1"
                          >
                            <KeyRound className="w-3 h-3" />
                            <span>Reset Pwd</span>
                          </button>

                          <button
                            onClick={() => handleToggleUserActive(user)}
                            title={user.isActive !== false ? 'Deactivate User' : 'Reactivate User'}
                            className={`px-2 py-1 text-[10px] font-semibold rounded flex items-center gap-1 ${
                              user.isActive !== false
                                ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {user.isActive !== false ? (
                              <>
                                <UserX className="w-3 h-3" />
                                <span>Deactivate</span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-3 h-3" />
                                <span>Reactivate</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Create User Modal */}
          {isCreateUserModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 space-y-4">
                <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-emerald-600" />
                    <span>Create New Staff Account</span>
                  </h3>
                  <button onClick={() => setIsCreateUserModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold mb-1">Full Name (English):</label>
                    <input
                      type="text"
                      required
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder="e.g. Salim Al-Nuaimi"
                      className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">User ID:</label>
                    <input
                      type="text"
                      required
                      minLength={3}
                      maxLength={40}
                      pattern="[a-z0-9._-]+"
                      value={newUserLoginId}
                      onChange={(e) => setNewUserLoginId(e.target.value.toLowerCase())}
                      placeholder="e.g. salim.customs"
                      className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">3-40 lowercase letters, numbers, dots, hyphens, or underscores.</p>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Official Email Address:</label>
                    <input
                      type="email"
                      required
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="salim@eurotrousers.ae"
                      className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Role Assignment:</label>
                      <select
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                        className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                      >
                        {rolesList.map((r) => (
                          <option key={r.code} value={r.code}>
                            {r.label} ({r.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Department:</label>
                      <input
                        type="text"
                        value={newUserDept}
                        onChange={(e) => setNewUserDept(e.target.value)}
                        className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Initial Password (Optional):</label>
                    <input
                      type="password"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      minLength={10}
                      placeholder="Leave blank to auto-generate a temporary password..."
                      className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      If supplied, use at least 10 characters with letters, numbers, and a symbol. Every new user must change it on first sign-in.
                    </p>
                  </div>

                  {createdTempPassword && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg">
                      <p className="font-bold text-[11px]">Account Created Successfully!</p>
                      <p className="text-[11px] mt-1 font-mono">
                        Temporary Password: <strong>{createdTempPassword}</strong>
                      </p>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsCreateUserModalOpen(false)}
                      className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                    >
                      Create Account
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. ACTIVE USER SESSIONS */}
      {activeTab === 'SESSIONS' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span>Active User Sessions & Token Security</span>
              </h3>
              <p className="text-xs text-slate-500">
                Live inspection of active authenticated sessions across all staff devices with one-click token revocation.
              </p>
            </div>

            <button
              onClick={fetchSessions}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSessions ? 'animate-spin' : ''}`} />
              <span>Refresh Sessions</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Session ID</th>
                  <th className="p-3">User & Role</th>
                  <th className="p-3">IP Address</th>
                  <th className="p-3">Client Agent</th>
                  <th className="p-3">Created At</th>
                  <th className="p-3 text-right">Revocation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {activeSessions.map((sess) => (
                  <tr key={sess.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-mono text-[11px] font-bold text-blue-600">{sess.id}</td>
                    <td className="p-3 font-semibold">
                      <div>{sess.userName}</div>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 font-mono text-slate-500">
                        {sess.userRole}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[11px]">{sess.ipAddress}</td>
                    <td className="p-3 text-[11px] text-slate-500 max-w-xs truncate">{sess.userAgent}</td>
                    <td className="p-3 text-[11px] text-slate-500">
                      {new Date(sess.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleRevokeSession(sess.id)}
                        className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 text-[10px] font-semibold rounded flex items-center gap-1 ml-auto"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Revoke Session</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. INTERACTIVE 10-ROLE RBAC PERMISSIONS MATRIX GRID */}
      {activeTab === 'RBAC_MATRIX' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>10-Role RBAC Permissions Matrix Grid</span>
              </h3>
              <p className="text-xs text-slate-500">
                Toggle exact module capabilities per role. Enforced strictly by server backend middleware on every API call.
              </p>
            </div>

            {isEditable && (
              <button
                onClick={handleSaveMatrix}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save Live Matrix</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-900 text-white font-semibold">
                <tr>
                  <th className="p-3 min-w-[180px]">System Module</th>
                  {rolesList.map((r) => (
                    <th key={r.code} className="p-3 text-center min-w-[100px] border-l border-slate-800">
                      <div>{r.label}</div>
                      <div className="text-[9px] font-mono font-normal text-amber-400">{r.code}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {systemModules.map((mod) => (
                  <tr key={mod.code} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-bold bg-slate-50/80 dark:bg-slate-800/60 border-r border-slate-200 dark:border-slate-800">
                      {mod.label}
                    </td>

                    {rolesList.map((r) => {
                      const rolePerms = matrixData[r.code] || {};
                      const isFullAdmin = r.code === 'ADMIN' || rolePerms.all === true;
                      const modPerms = rolePerms[mod.code] || {};

                      return (
                        <td key={r.code} className="p-2 text-center border-l border-slate-200 dark:border-slate-800 align-top">
                          {isFullAdmin ? (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[9px] rounded">
                              FULL ACCESS
                            </span>
                          ) : (
                            <div className="flex flex-col gap-1 text-[10px]">
                              {['view', 'create', 'edit', 'approve', 'delete'].map((act) => (
                                <label
                                  key={act}
                                  className="flex items-center justify-between gap-1 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 p-0.5 rounded"
                                >
                                  <span className="capitalize text-[9px] text-slate-500">{act}</span>
                                  <input
                                    type="checkbox"
                                    disabled={!isEditable}
                                    checked={!!modPerms[act]}
                                    onChange={() => togglePermission(r.code, mod.code, act)}
                                    className="w-3.5 h-3.5 text-blue-600 rounded"
                                  />
                                </label>
                              ))}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
