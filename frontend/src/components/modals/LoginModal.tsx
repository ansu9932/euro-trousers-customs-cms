import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import { apiFetch } from '../../lib/api';
import { Lock, LogIn, Shield, UserCheck, X, KeyRound, AlertCircle, Key, CheckCircle2 } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, setIsLoginModalOpen, allUsers, loginUser, currentUser, showToast } = useApp();

  const [selectedUserId, setSelectedUserId] = useState<string>(currentUser.id);
  const [password, setPassword] = useState<string>('Demo2026!');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forced password change state
  const [mustChangePassword, setMustChangePassword] = useState<boolean>(false);
  const [authenticatedUserToken, setAuthenticatedUserToken] = useState<string | null>(null);
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  if (!isLoginModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const targetUser = allUsers.find((u) => u.id === selectedUserId);
    const emailToUse = targetUser ? targetUser.email : 'admin@eurotrousers.ae';
    const pwdToUse = targetUser && targetUser.role === 'ADMIN' && password === 'Demo2026!' ? 'Admin2026!' : password;

    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToUse, password: pwdToUse }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Authentication failed');
        setIsSubmitting(false);
        return;
      }

      // Store auth token in localStorage
      localStorage.setItem('euro_trousers_jwt_token', data.token);

      if (data.mustChangePassword) {
        setMustChangePassword(true);
        setAuthenticatedUserToken(data.token);
        setPendingUser(data.user);
        setCurrentPassword(pwdToUse);
        setIsSubmitting(false);
        return;
      }

      loginUser(data.user);
      showToast(`Welcome back, ${data.user.name} (${data.user.role})!`);
      setIsLoginModalOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Server connection error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await apiFetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authenticatedUserToken}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to update password');
        setIsSubmitting(false);
        return;
      }

      if (pendingUser) {
        loginUser({ ...pendingUser, mustChangePassword: false });
        showToast('Password updated successfully! Logged in.');
      }
      setIsLoginModalOpen(false);
      setMustChangePassword(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Server error while updating password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleDescriptions: Record<UserRole, string> = {
    ADMIN: 'Full system administration, settings, security & user management',
    CUSTOMS_MGR: 'L2 Reviewer, customs compliance, holds release & reconciliation approval',
    DOC_OFFICER: 'L1 Approver, commercial invoice, B/L, gate pass generation',
    DATA_ENTRY: 'Draft creation, line-item data input & invoice entry',
    WAREHOUSE: 'Physical receiving, stock balance updates & stock counting',
    FINANCE: 'L3 Duty/VAT approval, bank guarantee utilization & refund claims',
    LOGISTICS: 'Container tracking, demurrage management & transporter gate pass',
    GM: 'L4 High-value shipment (≥AED 100k) final approval & executive reporting',
    VIEWER: 'Read-only access to declarations and shipment status',
    AUDITOR: 'Complete read-only audit log inspection & compliance reporting',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base">
                {mustChangePassword ? 'Mandatory Password Reset' : 'RBAC Role & User Authentication'}
              </h3>
              <p className="text-xs text-slate-400">EURO TROUSERS Security Access Control</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsLoginModalOpen(false);
              setMustChangePassword(false);
            }}
            className="text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Mandatory Password Change Form */}
        {mustChangePassword ? (
          <form onSubmit={handleChangePasswordSubmit} className="p-6 space-y-5">
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
              <Key className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Password Reset Required</p>
                <p className="mt-0.5 text-[11px] text-amber-800 dark:text-amber-300">
                  Your account requires a password change before continuing. Please set a new secure password.
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Current Password:
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                New Password:
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Confirm New Password:
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-hidden"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-2 shadow-md transition disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Updating...' : 'Set New Password & Continue'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* Standard Login Form */
          <form onSubmit={handleLoginSubmit} className="p-6 space-y-5">
            {errorMessage && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Select Operating User & Role:
              </label>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {allUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUserId(user.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      selectedUserId === user.id
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-slate-900 dark:text-white shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          selectedUserId === user.id
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {user.role.substring(0, 2)}
                      </div>
                      <div>
                        <div className="text-xs font-semibold flex items-center gap-2">
                          <span>{user.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono">
                            {user.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {roleDescriptions[user.role as UserRole] || user.department}
                        </p>
                      </div>
                    </div>
                    {selectedUserId === user.id && <UserCheck className="w-4 h-4 text-amber-600 shrink-0" />}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password Security Credential:
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-hidden"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Default password for ADMIN: <code className="text-amber-600 dark:text-amber-400 font-mono">Admin2026!</code> | Other roles: <code className="text-amber-600 dark:text-amber-400 font-mono">Demo2026!</code>
              </p>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-2 shadow-md transition disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In as Selected User'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

