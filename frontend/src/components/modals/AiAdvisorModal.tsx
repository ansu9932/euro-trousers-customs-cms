import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, CheckCircle2, AlertTriangle, X, Search, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { apiFetch } from '../../lib/api';

export const AiAdvisorModal: React.FC = () => {
  const { isAiModalOpen, setIsAiModalOpen, declarations, t } = useApp();
  const [activeTab, setActiveTab] = useState<'CLASSIFY' | 'PRECHECK'>('CLASSIFY');

  // Classification State
  const [itemDescription, setItemDescription] = useState('Indigo blue heavy twill denim fabric for men jeans 12oz');
  const [material, setMaterial] = useState('100% Cotton');
  const [garmentType, setGarmentType] = useState('Fabric for Trousers');
  const [gender, setGender] = useState('Men / Boys');
  const [isClassifying, setIsClassifying] = useState(false);
  const [classifyResult, setClassifyResult] = useState<any | null>(null);

  // Pre-Audit State
  const [selectedDeclId, setSelectedDeclId] = useState(declarations[0]?.id || '');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<any | null>(null);

  if (!isAiModalOpen) return null;

  const handleClassify = async () => {
    setIsClassifying(true);
    setClassifyResult(null);
    try {
      const res = await apiFetch('/api/ai/classify-hs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: itemDescription,
          material,
          garmentType,
          gender,
        }),
      });
      const data = await res.json();
      setClassifyResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsClassifying(false);
    }
  };

  const handleAuditPreCheck = async () => {
    setIsAuditing(true);
    setAuditResult(null);
    const decl = declarations.find((d) => d.id === selectedDeclId);
    try {
      const res = await apiFetch('/api/ai/audit-precheck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ declaration: decl }),
      });
      const data = await res.json();
      setAuditResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>AI Customs & HS Tariff Advisor</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded border border-indigo-200 dark:border-indigo-800">
                  Gemini 3.6 Flash
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Specialized in SAIF Zone Sharjah, GCC Unified Tariff & Garment Manufacturing Rules
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAiModalOpen(false)}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/60 px-6 pt-2 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('CLASSIFY')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'CLASSIFY'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>HS Code Auto-Classifier</span>
          </button>
          <button
            onClick={() => setActiveTab('PRECHECK')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'PRECHECK'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Declaration Compliance Pre-Audit</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'CLASSIFY' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Commercial Item / Raw Material Description
                  </label>
                  <input
                    type="text"
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 100% Cotton Indigo Blue Denim Fabric 12oz"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Fabric / Material Composition
                  </label>
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                    placeholder="e.g. 98% Cotton 2% Spandex"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Garment Category / Use
                  </label>
                  <input
                    type="text"
                    value={garmentType}
                    onChange={(e) => setGarmentType(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                    placeholder="e.g. Men's Casual Chino Trousers"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleClassify}
                  disabled={isClassifying || !itemDescription.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-semibold inline-flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isClassifying ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Classifying with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Classify HS Tariff Code</span>
                    </>
                  )}
                </button>
              </div>

              {classifyResult && (
                <div className="p-4 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-300 tracking-wider">
                        Recommended GCC HS Code
                      </span>
                      <h3 className="text-xl font-mono font-bold text-blue-900 dark:text-blue-100">
                        {classifyResult.recommendedHsCode}
                      </h3>
                    </div>
                    <div className="text-end">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        Confidence: {classifyResult.confidence || 'High'}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs space-y-1.5 border-t border-blue-200/60 dark:border-blue-800/40 pt-2 text-slate-700 dark:text-slate-300">
                    <p>
                      <strong>Heading Description:</strong> {classifyResult.descriptionEn}
                    </p>
                    {classifyResult.descriptionAr && (
                      <p dir="rtl" className="text-slate-600 dark:text-slate-400">
                        <strong>الوصف بالعربية:</strong> {classifyResult.descriptionAr}
                      </p>
                    )}
                    <p>
                      <strong>Classification Rationale:</strong> {classifyResult.justification}
                    </p>
                    <div className="flex gap-4 pt-1 text-[11px] font-semibold text-blue-800 dark:text-blue-300">
                      <span>Standard Duty: {classifyResult.dutyRatePercent}%</span>
                      <span>VAT: {classifyResult.vatRatePercent}%</span>
                      <span>Free Zone Exemption: {classifyResult.freeZoneExemptionEligible ? 'Eligible' : 'No'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Select Declaration to Pre-Audit
                </label>
                <select
                  value={selectedDeclId}
                  onChange={(e) => setSelectedDeclId(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                >
                  {declarations.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.declarationNo} — {d.partnerName} ({d.declarationType} / AED {(d.totalValueAED ?? 0).toLocaleString()}) — Status: {d.status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleAuditPreCheck}
                  disabled={isAuditing}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-semibold inline-flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isAuditing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Auditing Compliance...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Run Compliance Pre-Check</span>
                    </>
                  )}
                </button>
              </div>

              {auditResult && (
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                    <div>
                      <span className="text-xs text-slate-500">Compliance Audit Verdict</span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{auditResult.verdict}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold">Score:</span>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        {auditResult.complianceScore} / 100
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <h5 className="font-semibold text-slate-800 dark:text-slate-200">Pre-Submission Checkpoints:</h5>
                    <div className="space-y-1.5">
                      {auditResult.checklist?.map((chk: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-2 bg-white dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800">
                          {chk.passed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <span className="font-medium text-slate-900 dark:text-slate-100">{chk.check}</span>
                            <p className="text-[11px] text-slate-500">{chk.notes}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {auditResult.recommendations?.length > 0 && (
                    <div className="text-xs bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 p-3 rounded-md text-amber-900 dark:text-amber-200">
                      <p className="font-semibold mb-1">Auditor Recommendations:</p>
                      <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                        {auditResult.recommendations.map((rec: string, i: number) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex justify-end">
          <button
            onClick={() => setIsAiModalOpen(false)}
            className="px-4 py-1.5 rounded-md text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700"
          >
            {t.close}
          </button>
        </div>

      </div>
    </div>
  );
};
