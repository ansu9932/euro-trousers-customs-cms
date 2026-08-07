import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, LoaderCircle, Upload } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiFetch } from '../../lib/api';
import { DataMigrationJob } from '../../types';

type ImportEntity = 'ItemMaster' | 'HsCode' | 'BusinessPartner';

const templates: Record<ImportEntity, Record<string, string | number>[]> = {
  ItemMaster: [{ itemCode: 'FAB-COT-001', descriptionEn: 'Cotton woven fabric', descriptionAr: '', hsCode: '5208.1100', uom: 'MTR', category: 'FABRIC', unitValueAED: 15, currency: 'AED', reorderLevel: 100 }],
  HsCode: [{ code: '5208.1100', descriptionEn: 'Woven cotton fabric', descriptionAr: '', dutyRatePercent: 5, vatRatePercent: 5, unitOfMeasure: 'MTR', category: 'FABRIC' }],
  BusinessPartner: [{ code: 'SUP-001', nameEn: 'Example Textile Supplier', nameAr: '', type: 'SUPPLIER', countryCode: 'CN', country: 'China', trn: '', customsCode: '', contactEmail: '', phone: '', currency: 'AED', address: '' }],
};

const labels: Record<ImportEntity, string> = {
  ItemMaster: 'Item Master',
  HsCode: 'HS Codes',
  BusinessPartner: 'Business Partners',
};

export const BulkDataUploadPanel: React.FC = () => {
  const { currentUser, setMigrationJobs, showToast } = useApp();
  const [entityName, setEntityName] = useState<ImportEntity>('ItemMaster');
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [job, setJob] = useState<DataMigrationJob | null>(null);
  const [isStaging, setIsStaging] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);

  const downloadTemplate = () => {
    const worksheet = XLSX.utils.json_to_sheet(templates[entityName]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, labels[entityName]);
    XLSX.writeFile(workbook, `EURO_TROUSERS_${entityName}_Template.xlsx`);
  };

  const selectFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const parsedRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });
      if (parsedRows.length === 0) throw new Error('The first worksheet does not contain data rows.');
      if (parsedRows.length > 1000) throw new Error('Upload a maximum of 1,000 rows per batch.');

      setFileName(file.name);
      setRows(parsedRows);
      setJob(null);
      showToast(`${parsedRows.length} rows read from ${file.name}`);
    } catch (error: any) {
      setRows([]);
      setFileName('');
      showToast(error.message || 'Unable to read this file.');
    }
  };

  const stageRows = async () => {
    const token = localStorage.getItem('euro_trousers_jwt_token');
    if (!token || rows.length === 0) return;
    setIsStaging(true);
    try {
      const response = await apiFetch('/api/migration/stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ entityName, fileName, rows }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to validate the upload.');
      setJob(data);
      setMigrationJobs((previous) => [data, ...previous]);
      showToast(data.errorRows ? 'Upload staged with validation errors.' : 'Upload validated and ready to import.');
    } catch (error: any) {
      showToast(error.message || 'Unable to validate the upload.');
    } finally {
      setIsStaging(false);
    }
  };

  const commitRows = async () => {
    const token = localStorage.getItem('euro_trousers_jwt_token');
    if (!token || !job || job.errorRows > 0) return;
    if (!window.confirm(`Import ${job.validRows} ${labels[entityName]} records? This action will add them to the system.`)) return;

    setIsCommitting(true);
    try {
      const response = await apiFetch(`/api/migration/commit/${job.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userName: currentUser.name, userId: currentUser.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to import this batch.');
      setJob(data);
      setMigrationJobs((previous) => previous.map((candidate) => candidate.id === data.id ? data : candidate));
      showToast(`${data.importedRows} records imported successfully.`);
    } catch (error: any) {
      showToast(error.message || 'Unable to import this batch.');
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <div className="space-y-6 bg-white p-6 dark:bg-slate-900">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100"><FileSpreadsheet className="h-4 w-4 text-emerald-600" />Bulk Historical Data Upload</h3>
          <p className="mt-1 text-xs text-slate-500">Upload old Excel or CSV records, validate the complete batch, then commit only clean data.</p>
        </div>
        <button onClick={downloadTemplate} className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><Download className="h-4 w-4" />Download template</button>
      </div>

      <div className="grid gap-4 md:grid-cols-[220px_1fr]">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Data type</label>
          <select value={entityName} onChange={(event) => { setEntityName(event.target.value as ImportEntity); setRows([]); setFileName(''); setJob(null); }} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950">
            {Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <label className="flex min-h-24 cursor-pointer items-center justify-center gap-3 rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 text-center text-xs text-slate-600 hover:border-emerald-500 hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-emerald-950/20">
          <Upload className="h-5 w-5 text-emerald-600" /><span><strong>{fileName || 'Select an Excel or CSV file'}</strong><br />First worksheet only, maximum 1,000 rows.</span>
          <input type="file" accept=".xlsx,.xls,.csv" onChange={selectFile} className="hidden" />
        </label>
      </div>

      {rows.length > 0 && <div className="rounded-md border border-slate-200 dark:border-slate-800"><div className="flex items-center justify-between bg-slate-50 px-4 py-3 text-xs dark:bg-slate-950"><span><strong>{rows.length}</strong> rows ready for validation</span><button onClick={stageRows} disabled={isStaging} className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-1.5 font-semibold text-white hover:bg-emerald-500 disabled:opacity-50">{isStaging ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}{isStaging ? 'Validating...' : 'Validate upload'}</button></div><div className="max-h-44 overflow-auto"><table className="w-full text-left text-[11px]"><thead className="sticky top-0 bg-white dark:bg-slate-900"><tr>{Object.keys(rows[0]).slice(0, 6).map((key) => <th key={key} className="border-b border-slate-200 px-3 py-2 font-semibold dark:border-slate-800">{key}</th>)}</tr></thead><tbody>{rows.slice(0, 5).map((row, index) => <tr key={index}>{Object.values(row).slice(0, 6).map((value, column) => <td key={column} className="border-b border-slate-100 px-3 py-2 dark:border-slate-800">{String(value)}</td>)}</tr>)}</tbody></table></div></div>}

      {job && <div className={`rounded-md border p-4 ${job.errorRows ? 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20' : 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/20'}`}><div className="flex flex-wrap items-center justify-between gap-3"><div className="text-xs"><strong>{job.status === 'COMMITTED' ? 'Import completed' : job.errorRows ? 'Validation needs attention' : 'Validation passed'}</strong><span className="ml-3 text-slate-600 dark:text-slate-300">{job.validRows} valid / {job.errorRows} errors / {job.totalRows} total</span></div>{job.status !== 'COMMITTED' && <button onClick={commitRows} disabled={job.errorRows > 0 || isCommitting} className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50">{isCommitting ? 'Importing...' : `Import ${job.validRows} records`}</button>}</div>{job.errors.length > 0 && <div className="mt-3 max-h-32 overflow-auto rounded border border-amber-200 bg-white p-2 text-[11px] dark:border-amber-900 dark:bg-slate-950">{job.errors.map((error, index) => <p key={index} className="flex gap-2 py-1 text-amber-800 dark:text-amber-200"><AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />Row {error.rowNumber}: {error.message} ({error.column})</p>)}</div>}</div>}
    </div>
  );
};
