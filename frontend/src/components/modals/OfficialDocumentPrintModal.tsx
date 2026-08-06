import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Printer, Download, X, CheckCircle2, ShieldCheck } from 'lucide-react';
import QRCode from 'qrcode';

export const OfficialDocumentPrintModal: React.FC = () => {
  const { language, printDocData, setPrintDocData, companySettings, t } = useApp();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (printDocData) {
      const qrText = printDocData.qrVerificationCode || `EURO-${printDocData.docNumber || 'DOC'}-SAIF-ZONE-VERIFIED`;
      QRCode.toDataURL(qrText, { width: 120, margin: 1 })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR generation error:', err));
    }
  }, [printDocData]);

  if (!printDocData) return null;

  const handlePrint = () => {
    window.print();
  };

  const isAr = language === 'ar';
  const docTitle = isAr
    ? (printDocData.titleAr || printDocData.titleEn || 'مستند تخليص جمركي رسمي')
    : (printDocData.titleEn || 'OFFICIAL CUSTOMS CLEARANCE DOCUMENT');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col my-8">
        
        {/* Action Header (Hidden during print) */}
        <div className="px-6 py-3 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-sm">
              {isAr ? 'معاينة وطباعة مستند هيئة المنطقة الحرة' : 'Official SAIF Zone Document Preview & Print'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-semibold inline-flex items-center gap-1.5 shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t.print}</span>
            </button>
            <button
              onClick={() => setPrintDocData(null)}
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Container */}
        <div className="p-8 sm:p-12 space-y-6 bg-white text-slate-900 print:p-0" id="official-print-document">
          
          {/* Company Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-start">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-950">
                {isAr ? (companySettings.companyNameAr || companySettings.companyNameEn) : companySettings.companyNameEn}
              </h1>
              <p className="text-xs text-slate-600 font-medium">
                {isAr ? companySettings.addressAr : companySettings.addressEn}
              </p>
              <p className="text-xs text-slate-600 font-mono">
                {isAr ? `الرقم الضريبي: ${companySettings.trn} | ترخيص المنطقة الحرة: #${companySettings.saifZoneLicenceNo}` : `TRN: ${companySettings.trn} | SAIF Zone Lic: #${companySettings.saifZoneLicenceNo}`}
              </p>
            </div>

            <div className="text-end">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {isAr ? 'الشارقة - المنطقة الحرة' : 'SAIF ZONE - SHARJAH'}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                UAE / دولة الإمارات العربية المتحدة
              </div>
            </div>
          </div>

          {/* Document Title Banner */}
          <div className="text-center py-2.5 bg-slate-100 border border-slate-300 rounded">
            <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-slate-900">
              {docTitle}
            </h2>
            <p className="text-xs font-mono font-bold text-blue-800 mt-0.5">
              {isAr ? 'رقم المستند' : 'Ref No'}: {printDocData.docNumber || 'DOC-2026-XXXX'}
            </p>
          </div>

          {/* Key Reference Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 border border-slate-200 rounded">
            <div>
              <span className="text-slate-500 block">{isAr ? 'تاريخ الإصدار' : 'Date of Issue'}:</span>
              <span className="font-semibold font-mono">{printDocData.issueDate || new Date().toISOString().split('T')[0]}</span>
            </div>
            <div>
              <span className="text-slate-500 block">{isAr ? 'رقم البيان الجمركي' : 'Declaration Ref'}:</span>
              <span className="font-semibold font-mono">{printDocData.declarationNo || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">{isAr ? 'رقم بيان الشارقة' : 'Sharjah Bayan #'}:</span>
              <span className="font-semibold font-mono">{printDocData.bayanRef || 'SZ-BAYAN-PENDING'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">{isAr ? 'السلطة الجمركية' : 'Customs Authority'}:</span>
              <span className="font-semibold">{isAr ? 'جمارك هيئة المنطقة الحرة لمطار الشارقة' : 'SAIF Zone Customs'}</span>
            </div>
          </div>

          {/* Specific Document Data Section */}
          {printDocData.sections && printDocData.sections.map((sec: any, idx: number) => (
            <div key={idx} className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
                {sec.title}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {sec.fields.map((f: any, fIdx: number) => (
                  <div key={fIdx}>
                    <span className="text-slate-500 block">{f.label}:</span>
                    <span className="font-medium text-slate-900">{f.value || '-'}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Line Items Table if available */}
          {printDocData.items && printDocData.items.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                {isAr ? 'بيان وتفاصيل بنود الشحنة والملابس' : 'Cargo / Garment Line Items Specification'}
              </h4>
              <table className="w-full text-xs border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 text-start">
                    <th className="p-2 border-e border-slate-300">#</th>
                    <th className="p-2 border-e border-slate-300">{isAr ? 'رمز HS' : 'HS Code'}</th>
                    <th className="p-2 border-e border-slate-300">{isAr ? 'الوصف' : 'Description'}</th>
                    <th className="p-2 border-e border-slate-300 text-end">{isAr ? 'الكمية' : 'Quantity'}</th>
                    <th className="p-2 border-e border-slate-300 text-end">{isAr ? 'سعر الوحدة' : 'Unit Price'}</th>
                    <th className="p-2 text-end">{isAr ? 'الإجمالي (درهم)' : 'Total (AED)'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {printDocData.items.map((item: any, i: number) => (
                    <tr key={i}>
                      <td className="p-2 border-e border-slate-200 text-slate-500">{i + 1}</td>
                      <td className="p-2 border-e border-slate-200 font-mono font-medium">{item.hsCode}</td>
                      <td className="p-2 border-e border-slate-200">
                        {isAr ? (item.descriptionAr || item.descriptionEn) : item.descriptionEn}
                      </td>
                      <td className="p-2 border-e border-slate-200 text-end font-medium">
                        {item.quantity?.toLocaleString()} {item.uom}
                      </td>
                      <td className="p-2 border-e border-slate-200 text-end">
                        {item.unitPrice?.toFixed(2)}
                      </td>
                      <td className="p-2 text-end font-bold">
                        {item.totalAmountAED ? item.totalAmountAED.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Official Stamp, QR Verification & Signatures */}
          <div className="pt-6 border-t-2 border-slate-800 grid grid-cols-3 gap-6 items-end">
            
            {/* QR Code Verification Block */}
            <div className="flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-300 rounded text-center">
              {qrDataUrl && (
                <img src={qrDataUrl} alt="Verification QR" className="w-20 h-20" />
              )}
              <span className="text-[9px] font-mono font-bold text-slate-700 mt-1">
                {isAr ? 'رمز تحقق معتمد - المنطقة الحرة' : 'SAIF ZONE QR VERIFIED'}
              </span>
              <span className="text-[8px] text-slate-500">
                {isAr ? 'امسح للتحقق من صحة المستند' : 'Scan to verify authenticity'}
              </span>
            </div>

            {/* Documentation Officer Signature */}
            <div className="text-center space-y-1">
              <div className="h-14 border-b border-dashed border-slate-400 flex items-end justify-center pb-1">
                <span className="font-serif italic text-sm text-blue-900 font-bold">
                  {printDocData.preparedBy || (isAr ? 'فاطمة الزعابي' : 'Fatima Al-Zaabi')}
                </span>
              </div>
              <p className="text-[11px] font-bold text-slate-800">{isAr ? 'مسؤول التوثيق الجمركي' : 'Documentation Officer'}</p>
              <p className="text-[9px] text-slate-500">{isAr ? 'إعداد ومراجعة' : 'Prepared & Verified'}</p>
            </div>

            {/* Customs Manager & Company Seal */}
            <div className="text-center space-y-1">
              <div className="h-14 border-b border-dashed border-slate-400 flex items-end justify-center pb-1">
                <div className="border-2 border-blue-900/40 rounded-full px-3 py-1 rotate-[-4deg] text-[10px] font-bold text-blue-900 uppercase">
                  {isAr ? 'معتمد جمركياً' : 'CUSTOMS APPROVED'}
                </div>
              </div>
              <p className="text-[11px] font-bold text-slate-800">{isAr ? 'مدير الجمارك والمنطقة الحرة' : 'Customs & Free Zone Manager'}</p>
              <p className="text-[9px] text-slate-500">{isAr ? 'المفوّض بالتوقيع والختم' : 'Authorized Signatory / Seal'}</p>
            </div>

          </div>

          {/* Footer Disclaimer */}
          <div className="text-[9px] text-slate-500 text-center border-t border-slate-200 pt-3">
            {isAr
              ? 'تم إصدار هذا المستند رسمياً من قِبل شركة يورو بنطلون مانيوفاكتشرينج (ش.م.ح) وفقاً للوائح هيئة المنطقة الحرة لمطار الشارقة الدولي والهيئة الاتحادية للضرائب بدولة الإمارات العربية المتحدة.'
              : 'This document is generated by EURO TROUSERS MFG. CO. (FZC) in accordance with the regulations of the Sharjah Airport International Free Zone Authority and the Federal Tax Authority (FTA) of the United Arab Emirates.'}
          </div>

        </div>

      </div>
    </div>
  );
};
