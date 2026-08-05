import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { QrCode, CheckCircle2, AlertTriangle, X, ShieldCheck, Search } from 'lucide-react';

export const QrScannerModal: React.FC = () => {
  const { isQrScannerOpen, setIsQrScannerOpen, gatePasses, t } = useApp();
  const [inputCode, setInputCode] = useState('EURO-GP-2026-0001-VERIFIED-SZ');
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  if (!isQrScannerOpen) return null;

  const handleVerify = () => {
    setHasSearched(true);
    const cleaned = inputCode.trim();
    const match = gatePasses.find(
      (gp) => gp.qrVerificationCode === cleaned || gp.gatePassNo === cleaned
    );

    if (match) {
      setVerificationResult({
        valid: true,
        gatePass: match,
        authority: 'SAIF Zone Customs Security Gate Pass Verification System',
        timestamp: new Date().toISOString(),
      });
    } else {
      setVerificationResult({
        valid: false,
        message: 'No matching Gate Pass found for code: ' + cleaned,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-600/10 text-emerald-600 dark:text-emerald-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Gate Pass QR Verification Portal
              </h3>
              <p className="text-xs text-slate-500">
                Validate authenticity of SAIF Zone inward/outward gate passes
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsQrScannerOpen(false)}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Enter or Scan QR Verification String / Gate Pass #
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="e.g. EURO-GP-2026-0001-VERIFIED-SZ"
                className="flex-1 px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500 font-mono"
              />
              <button
                onClick={handleVerify}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-semibold inline-flex items-center gap-1.5 shadow-sm"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Verify</span>
              </button>
            </div>
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap gap-1.5 text-[11px]">
            <span className="text-slate-400 self-center">Sample Codes:</span>
            {gatePasses.slice(0, 3).map((gp) => (
              <button
                key={gp.id}
                onClick={() => {
                  setInputCode(gp.qrVerificationCode);
                  setHasSearched(false);
                }}
                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-mono"
              >
                {gp.gatePassNo}
              </button>
            ))}
          </div>

          {/* Result Card */}
          {hasSearched && verificationResult && (
            <div
              className={`p-4 rounded-lg border space-y-3 animate-fadeIn ${
                verificationResult.valid
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
                  : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-100'
              }`}
            >
              <div className="flex items-center gap-2">
                {verificationResult.valid ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-100">
                        OFFICIAL GATE PASS VERIFIED
                      </h4>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                        Authentic SAIF Zone security record
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    <div>
                      <h4 className="font-bold text-sm text-rose-900 dark:text-rose-100">
                        VERIFICATION FAILED
                      </h4>
                      <p className="text-[11px] text-rose-700 dark:text-rose-300">
                        {verificationResult.message}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {verificationResult.valid && (
                <div className="space-y-1.5 border-t border-emerald-200 dark:border-emerald-800/60 pt-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Gate Pass No:</span>
                      <span className="font-bold font-mono">{verificationResult.gatePass.gatePassNo}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Pass Type:</span>
                      <span className="font-semibold">{verificationResult.gatePass.passType}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Vehicle Plate:</span>
                      <span className="font-medium">{verificationResult.gatePass.vehiclePlateNo}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Driver Name:</span>
                      <span className="font-medium">{verificationResult.gatePass.driverName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Cargo Packages:</span>
                      <span className="font-medium">{verificationResult.gatePass.totalPackages} PKGS ({verificationResult.gatePass.grossWeightKg} KG)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Status:</span>
                      <span className="font-bold text-emerald-800 dark:text-emerald-300">{verificationResult.gatePass.status}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex justify-end">
          <button
            onClick={() => setIsQrScannerOpen(false)}
            className="px-4 py-1.5 rounded-md text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700"
          >
            {t.close}
          </button>
        </div>

      </div>
    </div>
  );
};
