import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Code2,
  Copy,
  Check,
  Send,
  Database,
  ShieldCheck,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const ApiDocsModule: React.FC = () => {
  const { companySettings, showToast } = useApp();
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('GET_DECLARATIONS');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const endpoints = [
    {
      id: 'GET_DECLARATIONS',
      method: 'GET',
      path: '/api/declarations',
      title: 'List All Customs Declarations',
      desc: 'Retrieve paginated or filtered list of Import, Export, and Transfer declarations with Bayan numbers and approval states.',
      params: '?type=IMPORT&status=CLEARED',
      sampleResponse: {
        total: 15,
        declarations: [
          {
            declarationNo: 'IMP-2026-0001',
            type: 'IMPORT',
            status: 'CLEARED',
            partnerName: 'Guangzhou Denim Mill Co.',
            totalValueAED: 185000,
            saifZoneCustomsRefNo: 'SZ-2026-IMP-9941',
            clearanceDate: '2026-08-01',
          },
        ],
      },
    },
    {
      id: 'TRANSITION_WORKFLOW',
      method: 'POST',
      path: '/api/declarations/:id/transition',
      title: 'Execute 4-Tier Workflow Transition',
      desc: 'Move declaration through L1 Preparation -> L2 Review -> L3 Finance -> L4 GM Approval -> Bayan Clearance.',
      sampleBody: {
        targetStatus: 'L2_REVIEWED',
        actionName: 'Manager Compliance Verified',
        userId: 'usr-2',
        userName: 'Rashid Kamal',
        userRole: 'CUSTOMS_MGR',
        remarks: 'All invoice items match commercial fabric packing list.',
      },
      sampleResponse: {
        success: true,
        status: 'L2_REVIEWED',
        updatedAt: '2026-08-05T12:00:00Z',
      },
    },
    {
      id: 'STOCK_RECONCILE',
      method: 'POST',
      path: '/api/stock/reconciliations',
      title: 'Execute Dual-Ledger Stock Reconciliation',
      desc: 'Calculates physical count vs SAIF Zone customs ledger variances and logs cutting scrap/waste adjustments.',
      sampleBody: {
        periodMonth: '2026-08',
        performedBy: 'Warehouse Officer',
        lines: [
          {
            itemCode: 'FAB-COT-001',
            customsQty: 42000,
            warehouseQty: 41850,
            varianceQty: -150,
            varianceReason: 'CUTTING_WASTE',
          },
        ],
      },
      sampleResponse: {
        reconciliationNo: 'REC-2026-08-1',
        status: 'PENDING_APPROVAL',
        itemsWithVariance: 1,
      },
    },
    {
      id: 'TALLY_EXPORT',
      method: 'POST',
      path: '/api/integrations/tally/export',
      title: 'Export Tally XML Voucher',
      desc: 'Generates native Tally-compliant XML voucher string for accounting import.',
      sampleBody: {
        declarationId: 'decl-1',
        exportType: 'PURCHASE_VOUCHER',
      },
      sampleResponse: {
        exportNo: 'TALLY-EXP-2026-001',
        recordCount: 1,
        generatedXmlString: '<?xml version="1.0" encoding="utf-8"?><ENVELOPE>...</ENVELOPE>',
      },
    },
    {
      id: 'AI_CLASSIFY',
      method: 'POST',
      path: '/api/ai/classify-hs',
      title: 'Gemini AI HS Tariff Classifier',
      desc: 'Classifies garment fabrics, accessories, and finished trousers into official 8-digit GCC HS Tariff Codes with legal justifications.',
      sampleBody: {
        description: 'Heavy twill indigo denim cotton fabric 12oz',
        material: '100% Cotton',
        garmentType: 'Men Trousers',
      },
      sampleResponse: {
        recommendedHsCode: '5209.4200',
        descriptionEn: 'Woven fabrics of cotton, containing 85% or more by weight of cotton, denim',
        dutyRatePercent: 5,
        confidence: 'High',
        freeZoneExemptionEligible: true,
      },
    },
  ];

  const currentEndpoint = endpoints.find((e) => e.id === selectedEndpoint) || endpoints[0];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    showToast('Copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">API & Integration Reference</h2>
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            REST / OpenAPI 3.0
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Internal REST API endpoints for Sharjah Customs ePortal automation, Tally Prime accounting sync, and Gemini AI classification
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Endpoints Sidebar */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-2">
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2">
            Available Endpoints
          </h3>

          <div className="space-y-1">
            {endpoints.map((ep) => (
              <button
                key={ep.id}
                onClick={() => setSelectedEndpoint(ep.id)}
                className={`w-full text-start p-2.5 rounded-lg text-xs transition-all flex items-center justify-between ${
                  selectedEndpoint === ep.id
                    ? 'bg-blue-50 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-800 font-semibold text-blue-900 dark:text-blue-200 shadow-xs'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        ep.method === 'GET'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono text-[11px] truncate max-w-[170px]">{ep.path}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 truncate">{ep.title}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Endpoint Inspector */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold ${
                    currentEndpoint.method === 'GET'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}
                >
                  {currentEndpoint.method}
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {currentEndpoint.path}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
                {currentEndpoint.title}
              </h3>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400">{currentEndpoint.desc}</p>

          {/* Request Payload / Params */}
          {currentEndpoint.sampleBody && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Request Body (JSON)
                </h4>
                <button
                  onClick={() => handleCopy(JSON.stringify(currentEndpoint.sampleBody, null, 2), 'body')}
                  className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-950 text-amber-400 font-mono text-[11px] rounded-lg overflow-x-auto border border-slate-800">
                {JSON.stringify(currentEndpoint.sampleBody, null, 2)}
              </pre>
            </div>
          )}

          {/* Response Payload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Response Output (200 OK)
              </h4>
              <button
                onClick={() => handleCopy(JSON.stringify(currentEndpoint.sampleResponse, null, 2), 'response')}
                className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded-lg overflow-x-auto border border-slate-800">
              {JSON.stringify(currentEndpoint.sampleResponse, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
