import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe2,
  LockKeyhole,
  LogIn,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
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
  const { isLoginModalOpen, setIsLoginModalOpen, loginUser, showToast, language, setLanguage, companySettings } = useApp();
  const [step, setStep] = useState<LoginStep>('IDENTIFY');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [identifiedUser, setIdentifiedUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
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
      setIsLoginModalOpen(false);
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
      setIsLoginModalOpen(false);
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

  const isPasswordStep = step === 'PASSWORD' || step === 'RESET';
  const initials = identifiedUser?.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase() || 'ET';

  return (
    <div className="fixed inset-0 z-[100] grid min-h-screen bg-[#f7f8fa] lg:grid-cols-2" role="dialog" aria-modal="true" aria-label="Sign in">
      <section className="relative flex min-h-screen items-center justify-center px-5 py-8 sm:px-8 lg:px-16">
        <button
          type="button"
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          className="absolute end-6 top-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-600 transition-colors hover:text-[#1e3a5f]"
        >
          <Globe2 className="h-4 w-4" />
          {language === 'en' ? 'العربية' : 'English'}
        </button>

        <div className="w-full max-w-[440px] rounded-lg border border-slate-200 bg-white p-6 shadow-[0_4px_18px_rgba(30,58,95,0.10)] sm:p-8">
          <div className="mb-8 grid grid-cols-2 gap-3 text-xs font-semibold">
            <div className={`border-b-2 pb-2 ${!isPasswordStep ? 'border-[#1e3a5f] text-[#1e3a5f]' : 'border-slate-200 text-slate-500'}`}>1. Identify</div>
            <div className={`border-b-2 pb-2 ${isPasswordStep ? 'border-[#1e3a5f] text-[#1e3a5f]' : 'border-slate-200 text-slate-500'}`}>2. Password</div>
          </div>

          {errorMessage && (
            <div className="mb-5 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700" role="alert">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {step === 'IDENTIFY' && (
            <form onSubmit={identifyUser} className="space-y-6">
              <div>
                <div className="mb-5 grid h-11 w-11 place-items-center rounded-lg bg-[#1e3a5f] text-white lg:hidden"><ShieldCheck className="h-6 w-6" /></div>
                <h1 className="text-2xl font-bold text-slate-900">Sign in to your account</h1>
                <p className="mt-2 text-sm text-slate-500">Enter your assigned user ID to access the customs and warehouse system.</p>
              </div>
              <div>
                <label htmlFor="login-id" className="mb-2 block text-xs font-semibold text-slate-600">User ID</label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input id="login-id" autoFocus autoComplete="username" required minLength={3} maxLength={40} pattern="[A-Za-z0-9._-]+" value={loginId} onChange={(event) => setLoginId(event.target.value.toLowerCase())} placeholder="e.g. tariq.admin" className="h-12 w-full rounded-lg border border-slate-300 bg-white py-3 ps-10 pe-3 text-sm text-slate-900 outline-none transition-shadow placeholder:text-slate-400 focus:border-[#1e3a5f] focus:ring-4 focus:ring-[#1e3a5f]/15" />
                </div>
              </div>
              <button type="submit" disabled={isSubmitting} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#1e3a5f] px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#152b47] focus:outline-none focus:ring-4 focus:ring-[#1e3a5f]/20 disabled:cursor-not-allowed disabled:opacity-70">
                {isSubmitting ? 'Checking user ID...' : 'Continue'}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </button>
            </form>
          )}

          {step === 'PASSWORD' && identifiedUser && (
            <form onSubmit={signIn} className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-[#1e3a5f] text-sm font-bold text-white">{initials}</div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{identifiedUser.name}</p>
                    <p className="mt-1 inline-block rounded-full bg-[#1e3a5f] px-2 py-0.5 text-[10px] font-bold text-white">{roleDescriptions[identifiedUser.role]}</p>
                  </div>
                </div>
                <button type="button" onClick={returnToUserId} className="text-xs font-semibold text-[#1e3a5f] hover:underline">Not you?</button>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Enter password</h1>
                <p className="mt-1 text-sm text-slate-500">Your role has been verified. Enter your password to continue.</p>
              </div>
              <div>
                <label htmlFor="password" className="mb-2 block text-xs font-semibold text-slate-600">Password</label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input id="password" autoFocus autoComplete="current-password" type={isPasswordVisible ? 'text' : 'password'} required value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 w-full rounded-lg border border-slate-300 bg-white py-3 ps-10 pe-11 text-sm text-slate-900 outline-none transition-shadow focus:border-[#1e3a5f] focus:ring-4 focus:ring-[#1e3a5f]/15" />
                  <button type="button" onClick={() => setIsPasswordVisible((visible) => !visible)} className="absolute end-0 top-0 grid h-12 w-11 place-items-center text-slate-500 hover:text-slate-900" aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}>{isPasswordVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
                </div>
              </div>
              <button type="submit" disabled={isSubmitting} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#1e3a5f] px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#152b47] focus:outline-none focus:ring-4 focus:ring-[#1e3a5f]/20 disabled:cursor-not-allowed disabled:opacity-70"><LogIn className="h-4 w-4" />{isSubmitting ? 'Signing in securely...' : 'Sign in securely'}</button>
              <button type="button" onClick={returnToUserId} className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-[#1e3a5f]"><ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />Use another user ID</button>
            </form>
          )}

          {step === 'RESET' && (
            <form onSubmit={changePassword} className="space-y-5">
              <div><h1 className="text-xl font-bold text-slate-900">Set a new password</h1><p className="mt-2 text-sm text-slate-500">Your administrator requires a password update before access is granted.</p></div>
              <input autoFocus autoComplete="new-password" type="password" required minLength={10} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="New password (10+ characters)" className="h-12 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#1e3a5f] focus:ring-4 focus:ring-[#1e3a5f]/15" />
              <input autoComplete="new-password" type="password" required minLength={10} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirm new password" className="h-12 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#1e3a5f] focus:ring-4 focus:ring-[#1e3a5f]/15" />
              <button type="submit" disabled={isSubmitting} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#1e3a5f] px-4 text-sm font-bold text-white hover:bg-[#152b47] disabled:opacity-70"><CheckCircle2 className="h-4 w-4" />{isSubmitting ? 'Updating...' : 'Update password and continue'}</button>
            </form>
          )}

          <div className="mt-8 border-t border-slate-200 pt-5 text-center text-xs text-slate-500"><span className="inline-flex items-center gap-1.5"><LockKeyhole className="h-3.5 w-3.5" />Secure connection</span></div>
        </div>
      </section>

      <aside className="relative hidden overflow-hidden bg-[#10233e] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.18)_1px,transparent_1px)] [background-size:40px_40px]" />
        <div className="relative flex items-center gap-3"><div className="grid h-14 w-14 place-items-center rounded-lg bg-white text-[#1e3a5f] shadow-lg"><ShieldCheck className="h-8 w-8" /></div><div><p className="text-lg font-bold">EURO TROUSERS</p><p className="text-xs text-slate-300">MFG. CO. (FZC)</p></div></div>
        <div className="relative max-w-md"><p className="text-3xl font-bold">Euro Trousers</p><p dir="rtl" className="mt-2 text-xl text-sky-200">يورو تراوزرز</p><div className="mt-7 border-s-2 border-teal-300 ps-4 text-lg leading-relaxed text-slate-200">Customs &amp; Warehouse Management System<span className="mt-2 block text-sm text-slate-300">SAIF Zone, Sharjah</span></div></div>
        <div className="relative flex items-end justify-between border-t border-white/20 pt-6 text-xs text-slate-300"><div><p>{companySettings.companyNameEn}</p><p className="mt-1 text-slate-400">SAIF Zone Free Zone Operations</p></div><p>TRN: {companySettings.trn}</p></div>
      </aside>
    </div>
  );
};
