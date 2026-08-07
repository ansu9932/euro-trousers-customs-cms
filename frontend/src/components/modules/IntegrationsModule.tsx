import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Network,
  Download,
  Copy,
  Check,
  FileCode2,
  Send,
  Bell,
  RefreshCw,
  FileText,
  ShieldCheck,
  Layers,
  Database,
  ExternalLink,
  FileSpreadsheet,
} from 'lucide-react';
import { BulkDataUploadPanel } from './BulkDataUploadPanel';

export const IntegrationsModule: React.FC = () => {
  const {
    declarations,
    companySettings,
    tallyExports,
    setTallyExports,
    notifications,
    currentUser,
    addAuditLog,
    showToast,
    t,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'TALLY_ERP' | 'SHARJAH_CUSTOMS' | 'BULK_UPLOAD' | 'NOTIFICATIONS'>('TALLY_ERP');
  const [selectedDeclId, setSelectedDeclId] = useState(declarations[0]?.id || '');
  const [exportType, setExportType] = useState<'PURCHASE_VOUCHER' | 'SALES_VOUCHER' | 'STOCK_JOURNAL'>('PURCHASE_VOUCHER');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedXmlPreview, setGeneratedXmlPreview] = useState<string>('');

  // Selected Declaration for Tally
  const selectedDecl = declarations.find((d) => d.id === selectedDeclId) || declarations[0];

  const handleGenerateTallyXml = () => {
    if (!selectedDecl) return;
    setIsGenerating(true);

    const voucherType =
      exportType === 'PURCHASE_VOUCHER'
        ? 'Purchase'
        : exportType === 'SALES_VOUCHER'
        ? 'Sales'
        : 'Journal';

    const cleanDate = (selectedDecl.declarationDate || '2026-08-01').replace(/-/g, '');

    const xml = `<?xml version="1.0" encoding="utf-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>${companySettings.companyNameEn}</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="${voucherType}" ACTION="Create" OBJVIEW="Accounting Voucher View">
            <DATE>${cleanDate}</DATE>
            <VOUCHERTYPENAME>Customs ${selectedDecl.declarationType} Voucher</VOUCHERTYPENAME>
            <REFERENCE>${selectedDecl.declarationNo} / Bayan ${selectedDecl.saifZoneCustomsRefNo || 'PENDING'}</REFERENCE>
            <PARTYLEDGERNAME>${selectedDecl.partnerName}</PARTYLEDGERNAME>
            <NARRATION>SAIF Zone Customs Declaration ${selectedDecl.declarationNo} - Invoice ${selectedDecl.invoiceNo} (${selectedDecl.currency} ${(selectedDecl.totalValueOriginalCurrency ?? 0).toLocaleString()} @ ${selectedDecl.exchangeRateToAED})</NARRATION>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${selectedDecl.declarationType === 'IMPORT' ? 'Raw Materials Purchase (Free Zone)' : 'Export Sales (Finished Trousers)'}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>${selectedDecl.declarationType === 'IMPORT' ? 'Yes' : 'No'}</ISDEEMEDPOSITIVE>
              <AMOUNT>${selectedDecl.declarationType === 'IMPORT' ? `-${(selectedDecl.totalValueAED ?? 0).toFixed(2)}` : `${(selectedDecl.totalValueAED ?? 0).toFixed(2)}`}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${selectedDecl.partnerName}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>${selectedDecl.declarationType === 'IMPORT' ? 'No' : 'Yes'}</ISDEEMEDPOSITIVE>
              <AMOUNT>${selectedDecl.declarationType === 'IMPORT' ? `${(selectedDecl.totalValueAED ?? 0).toFixed(2)}` : `-${(selectedDecl.totalValueAED ?? 0).toFixed(2)}`}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
          </VOUCHER>
        </TALLYMESSAGE>
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;

    setGeneratedXmlPreview(xml);

    const newLog = {
      id: `tally-${Date.now()}`,
      exportNo: `TALLY-EXP-2026-${String(tallyExports.length + 1).padStart(3, '0')}`,
      exportType,
      recordCount: 1,
      generatedXmlString: xml,
      exportedBy: currentUser.name,
      exportedAt: new Date().toISOString(),
    };

    setTallyExports([newLog, ...tallyExports]);
    setIsGenerating(false);

    addAuditLog(
      'TALLY_EXPORT',
      'integrations',
      'TallyExportLog',
      newLog.id,
      newLog.exportNo,
      `Generated Tally-compliant XML voucher for ${selectedDecl.declarationNo}`
    );

    showToast(`Generated Tally XML export for ${selectedDecl.declarationNo}!`);
  };

  const handleCopyXml = (text: string, index?: number) => {
    navigator.clipboard.writeText(text);
    if (index !== undefined) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
    showToast('Copied XML to clipboard!');
  };

  const handleDownloadXml = (xmlContent: string, fileName: string) => {
    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    showToast(`Downloaded ${fileName}`);
  };

  // Sharjah Customs Bayan Batch JSON Payload Generator
  const generateSharjahCustomsBatchPayload = () => {
    return JSON.stringify(
      {
        header: {
          clientNameEn: companySettings.companyNameEn,
          clientNameAr: companySettings.companyNameAr,
          trn: companySettings.trn,
          saifZoneLicenseNo: companySettings.saifZoneLicenceNo,
          plotNo: companySettings.plotNo,
          batchGeneratedAt: new Date().toISOString(),
          ePortalMode: companySettings.sharjahCustomsEPortalMode,
        },
        declarations: declarations.map((d) => ({
          declarationNo: d.declarationNo,
          bayanRef: d.saifZoneCustomsRefNo || null,
          declarationType: d.declarationType,
          transferType: d.transferType || null,
          invoiceNo: d.invoiceNo,
          partner: d.partnerName,
          cifValueAED: d.totalValueAED,
          dutyRatePercent: d.totalDutyAED > 0 ? 5 : 0,
          customsStatus: d.status,
          itemsCount: d.items.length,
          items: d.items.map((it) => ({
            hsCode: it.hsCode,
            description: it.descriptionEn,
            qty: it.quantity,
            uom: it.uom,
            amountAED: it.totalAmountAED,
          })),
        })),
      },
      null,
      2
    );
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t.integrations}</h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Tally ERP & Sharjah Customs Gateway
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Accounting ledger bridge, official Sharjah Customs ePortal batch formatters, and automated alert dispatchers
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 pt-3 gap-6 text-xs font-semibold rounded-t-xl">
        <button
          onClick={() => setActiveTab('TALLY_ERP')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'TALLY_ERP'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Tally ERP Integration (XML Vouchers)</span>
        </button>

        <button
          onClick={() => setActiveTab('BULK_UPLOAD')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'BULK_UPLOAD'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Bulk Data Upload</span>
        </button>

        <button
          onClick={() => setActiveTab('SHARJAH_CUSTOMS')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'SHARJAH_CUSTOMS'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Sharjah Customs ePortal Batch Manifest</span>
        </button>

        <button
          onClick={() => setActiveTab('NOTIFICATIONS')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'NOTIFICATIONS'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notification & Alert Dispatcher</span>
        </button>
      </div>

      {activeTab === 'BULK_UPLOAD' && <BulkDataUploadPanel />}

      {/* 1. Tally ERP Integration */}
      {activeTab === 'TALLY_ERP' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Generator Controls */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Generate Tally XML Voucher
            </h3>
            <p className="text-xs text-slate-500">
              Select declaration to produce native Tally Prime / ERP 9 importable XML accounting ledger entries.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Customs Declaration
                </label>
                <select
                  value={selectedDeclId}
                  onChange={(e) => setSelectedDeclId(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                >
                  {declarations.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.declarationNo} — {d.partnerName} (AED {(d.totalValueAED ?? 0).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Voucher Type in Tally
                </label>
                <select
                  value={exportType}
                  onChange={(e) => setExportType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                >
                  <option value="PURCHASE_VOUCHER">Purchase Voucher (Raw Material Fabric/Accessories)</option>
                  <option value="SALES_VOUCHER">Sales Voucher (Finished Goods Trousers Export)</option>
                  <option value="STOCK_JOURNAL">Stock Journal (Transfer / Adjustment)</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Company:</span>
                  <span className="font-semibold">{companySettings.companyNameEn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Party Ledger:</span>
                  <span className="font-semibold">{selectedDecl?.partnerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Voucher Amount:</span>
                  <span className="font-bold text-blue-600">AED {(selectedDecl?.totalValueAED ?? 0).toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleGenerateTallyXml}
                disabled={isGenerating}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-semibold inline-flex items-center justify-center gap-2 shadow"
              >
                <FileCode2 className="w-4 h-4" />
                <span>Generate XML Voucher</span>
              </button>
            </div>
          </div>

          {/* XML Live Preview & Recent Exports */}
          <div className="lg:col-span-2 space-y-6">
            {generatedXmlPreview ? (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                    Generated Tally XML Output
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyXml(generatedXmlPreview)}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded text-xs font-semibold inline-flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                    <button
                      onClick={() =>
                        handleDownloadXml(
                          generatedXmlPreview,
                          `Tally_Voucher_${selectedDecl?.declarationNo || 'DECL'}.xml`
                        )
                      }
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold inline-flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download XML</span>
                    </button>
                  </div>
                </div>

                <pre className="p-4 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded-lg overflow-x-auto max-h-72 border border-slate-800 leading-relaxed">
                  {generatedXmlPreview}
                </pre>
              </div>
            ) : null}

            {/* Exports History Log */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Tally Export Batch History
              </h4>

              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
                <table className="w-full text-xs text-start divide-y divide-slate-200 dark:divide-slate-800">
                  <thead className="bg-slate-50 dark:bg-slate-950/60 font-semibold text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="p-2.5">Export Batch #</th>
                      <th className="p-2.5">Voucher Type</th>
                      <th className="p-2.5">Exported By</th>
                      <th className="p-2.5">Timestamp</th>
                      <th className="p-2.5 text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {tallyExports.map((exp, idx) => (
                      <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-2.5 font-mono font-bold text-slate-900 dark:text-slate-100">
                          {exp.exportNo}
                        </td>
                        <td className="p-2.5">{exp.exportType}</td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-400">{exp.exportedBy}</td>
                        <td className="p-2.5 text-slate-500 font-mono text-[11px]">
                          {(exp.exportedAt || '').replace('T', ' ').substring(0, 16)}
                        </td>
                        <td className="p-2.5 text-end">
                          <button
                            onClick={() => handleDownloadXml(exp.generatedXmlString, `${exp.exportNo}.xml`)}
                            className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 font-medium text-[11px] inline-flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            <span>XML</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Sharjah Customs ePortal Batch Manifest */}
      {activeTab === 'SHARJAH_CUSTOMS' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Sharjah Customs ePortal Electronic Bayan Gateway
              </h3>
              <p className="text-xs text-slate-500">
                Formatted batch JSON payload for SAIF Zone Customs electronic clearances
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyXml(generateSharjahCustomsBatchPayload())}
                className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Payload</span>
              </button>

              <button
                onClick={() =>
                  handleDownloadXml(
                    generateSharjahCustomsBatchPayload(),
                    `Sharjah_Customs_Bayan_Batch_${new Date().toISOString().split('T')[0]}.json`
                  )
                }
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-semibold inline-flex items-center gap-1.5 shadow"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Batch JSON</span>
              </button>
            </div>
          </div>

          <pre className="p-4 bg-slate-950 text-sky-400 font-mono text-[11px] rounded-lg overflow-x-auto max-h-96 border border-slate-800 leading-relaxed">
            {generateSharjahCustomsBatchPayload()}
          </pre>
        </div>
      )}

      {/* 3. Notifications & Dispatcher Log */}
      {activeTab === 'NOTIFICATIONS' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Customs Dispatcher & Automated Alert Log
              </h3>
              <p className="text-xs text-slate-500">
                WhatsApp, SMS & Email alerts dispatched for gate passes, approvals, and demurrage warnings
              </p>
            </div>

            <button
              onClick={() => showToast('Dispatched test WhatsApp & Email alert to Customs Manager!')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-md shadow inline-flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Test Compliance Alert</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
            <table className="w-full text-xs text-start divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-950/60 font-semibold text-slate-700 dark:text-slate-300">
                <tr>
                  <th className="p-3">Channel</th>
                  <th className="p-3">Recipient</th>
                  <th className="p-3">Subject / Trigger</th>
                  <th className="p-3">Message Body</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.map((n) => (
                  <tr key={n.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          n.channel === 'WHATSAPP'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                        }`}
                      >
                        {n.channel}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">{n.recipient}</td>
                    <td className="p-3 font-medium text-blue-600">{n.subject}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">{n.body}</td>
                    <td className="p-3 text-slate-500 font-mono text-[11px]">
                      {(n.sentAt || '').replace('T', ' ').substring(0, 16)}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        {n.status}
                      </span>
                    </td>
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
