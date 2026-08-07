import React, { useState } from 'react';
import { AlertCircle, ArrowLeft, CheckCircle2, KeyRound, Lock, LogIn, Shield, UserCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import { apiFetch } from '../../lib/api';

type LoginStep = 'IDENTIFY' | 'PASSWORD' | 'RESET';

const roleDescriptions: Record<UserRole, string> = {
  ADMIN: 'System Administrator',
  CUSTOMS_MGR: 'Customs Manager',
  DOC_OFFICER: 'Documentation Officer',
  DATA_ENTRY: 'Data Entry Officer',
  WAREHOUSE: 'Warehouse Officer',
  FINANCE: 'Finance Officer',
  LOGISTICS: 'Logistics Officer',
  GM: 'General Manager',
  VIEWER: 'Read-only User',
  AUDITOR: 'Compliance Auditor',
};

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, loginUser, showToast } = useApp();
  const [step, setStep] = useState<LoginStep>('IDENTIFY');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [identifiedUser, setIdentifiedUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isLoginModalOpen) return null;

  const identifyUser = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await apiFetch('/api/auth/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId: loginId.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to verify this user ID');

      setIdentifiedUser(data.user);
      setLoginId(data.user.loginId);
      setStep('PASSWORD');
    } catch (error: any) {
      setErrorMessage(error.message || 'Unable to verify this user ID');
    } finally {
      setIsSubmitting(false);
    }
  };

  const signIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to sign in');

      localStorage.setItem('euro_trousers_jwt_token', data.token);
      if (data.mustChangePassword) {
        setAuthToken(data.token);
        setIdentifiedUser(data.user);
        setStep('RESET');
        return;
      }

      loginUser(data.user);
      showToast(`Welcome back, ${data.user.name}`);
    } catch (error: any) {
      setErrorMessage(error.message || 'Unable to sign in');
    } finally {
      setIsSubmitting(false);
    }
  };

  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const response = await apiFetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ currentPassword: password, newPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to update password');

      if (identifiedUser) loginUser({ ...identifiedUser, mustChangePassword: false });
      showToast('Password updated. You are signed in.');
    } catch (error: any) {
      setErrorMessage(error.message || 'Unable to update password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const returnToUserId = () => {
    setStep('IDENTIFY');
    setPassword('');
    setErrorMessage(null);
    setIdentifiedUser(null);
  };

  return (
    <div className="fixed inset-0 z-[100] grid min-h-screen place-items-center bg-slate-950 px-4 py-8">
      <div className="w-full max-w-md overflow-hidden rounded-lg border border-slate-700 bg-white shadow-2xl dark:bg-slate-900">
        <div className="bg-slate-900 px-6 py-6 text-white">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-amber-400 text-slate-950"><Shield className="h-6 w-6" /></div>
            <div>
              <p className="text-base font-semibold">EURO TROUSERS</p>
              <p className="text-xs text-slate-400">Customs & Warehouse Management</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {errorMessage && (
            <div className="mb-5 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{errorMessage}
            </div>
          )}

          {step === 'IDENTIFY' && (
            <form onSubmit={identifyUser} className="space-y-5">
              <div><h1 className="text-lg font-semibold text-slate-900 dark:text-white">Sign in</h1><p className="mt-1 text-xs text-slate-500">Enter your assigned user ID to continue.</p></div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">User ID</label>
                <input autoFocus autoComplete="username" required minLength={3} maxLength={40} pattern="[A-Za-z0-9._-]+" value={loginId} onChange={(event) => setLoginId(event.target.value.toLowerCase())} placeholder="e.g. tariq.admin" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 font-mono text-sm text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
              </div>
              <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-md bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-50"><UserCheck className="h-4 w-4" />{isSubmitting ? 'Checking user ID...' : 'Continue'}</button>
            </form>
          )}

          {step === 'PASSWORD' && identifiedUser && (
            <form onSubmit={signIn} className="space-y-5">
              <button type="button" onClick={returnToUserId} className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white"><ArrowLeft className="h-3.5 w-3.5" />Change user ID</button>
              <div className="rounded-md border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30"><p className="text-xs text-slate-500 dark:text-slate-400">Signed in as</p><p className="mt-1 font-semibold text-slate-900 dark:text-white">{identifiedUser.name}</p><p className="mt-1 inline-block rounded bg-amber-200 px-2 py-0.5 font-mono text-[11px] font-bold text-amber-950">{roleDescriptions[identifiedUser.role]}</p></div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Password</label>
                <div className="relative"><Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input autoFocus autoComplete="current-password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-md border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></div>
              </div>
              <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-md bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-50"><LogIn className="h-4 w-4" />{isSubmitting ? 'Signing in...' : 'Sign in'}</button>
            </form>
          )}

          {step === 'RESET' && (
            <form onSubmit={changePassword} className="space-y-4">
              <div><h1 className="text-lg font-semibold text-slate-900 dark:text-white">Set a new password</h1><p className="mt-1 text-xs text-slate-500">Your administrator requires a password update before access is granted.</p></div>
              <input autoFocus autoComplete="new-password" type="password" required minLength={10} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="New password (10+ characters)" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
              <input autoComplete="new-password" type="password" required minLength={10} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirm new password" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
              <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-md bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-50"><CheckCircle2 className="h-4 w-4" />{isSubmitting ? 'Updating...' : 'Update password and continue'}</button>
            </form>
          )}
        </div>
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 text-center text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-950">Protected access. Repeated failed attempts lock an account automatically.</div>
      </div>
    </div>
  );
};
