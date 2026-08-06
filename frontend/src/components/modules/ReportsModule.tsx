import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Layers,
  Coins,
  TrendingUp,
  Clock,
  ShieldCheck,
  Search,
  Printer,
  Archive,
  Scissors,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { KpiCard } from '../common/KpiCard';
import { StatusBadge } from '../common/StatusBadge';

export const ReportsModule: React.FC = () => {
  const {
    declarations,
    dutyRefunds,
    bankGuarantees,
    containers,
    customsStock,
    documents,
    setPrintDocData,
    showToast,
    t,
  } = useApp();

  const [activeReportType, setActiveReportType] = useState<
    'MONTHLY_CUSTOMS_RETURN' | 'DUTY_EXEMPTION_SAVINGS' | 'BOM_YIELD_AUDIT' | 'CONTAINER_DEMURRAGE' | 'ARCHIVE_SEARCH'
  >('MONTHLY_CUSTOMS_RETURN');

  const [selectedYear, setSelectedYear] = useState('2026');
  const [archiveSearchQuery, setArchiveSearchQuery] = useState('');

  // Calculations for Monthly Declarations Volume
  const monthlyData = [
    { month: 'Jan', imports: 7, exports: 4, transfers: 2, totalDutySavedAED: 48000 },
    { month: 'Feb', imports: 6, exports: 5, transfers: 1, totalDutySavedAED: 41000 },
    { month: 'Mar', imports: 8, exports: 6, transfers: 3, totalDutySavedAED: 54000 },
    { month: 'Apr', imports: 5, exports: 4, transfers: 2, totalDutySavedAED: 36000 },
    { month: 'May', imports: 9, exports: 6, transfers: 4, totalDutySavedAED: 62000 },
    { month: 'Jun', imports: 7, exports: 5, transfers: 2, totalDutySavedAED: 49000 },
    { month: 'Jul', imports: 8, exports: 5, transfers: 3, totalDutySavedAED: 56000 },
    { month: 'Aug', imports: declarations.filter((d) => d.declarationType === 'IMPORT').length, exports: declarations.filter((d) => d.declarationType === 'EXPORT').length, transfers: declarations.filter((d) => d.declarationType === 'TRANSFER').length, totalDutySavedAED: 52000 },
  ];

  // Pie Chart Data: Declarations by Type
  const pieData = [
    { name: 'Import Raw Materials', value: declarations.filter((d) => d.declarationType === 'IMPORT').length, color: '#1E3A5F' },
    { name: 'Export Finished Trousers', value: declarations.filter((d) => d.declarationType === 'EXPORT').length, color: '#16A34A' },
    { name: 'Free Zone Transfers', value: declarations.filter((d) => d.declarationType === 'TRANSFER').length, color: '#D97706' },
  ];

  // Garment BOM Consumption Standard Yield Table
  const bomYieldData = [
    {
      garmentModel: 'Men Denim Chino Trouser (Art #ET-2026-CHINO)',
      standardOutputUnits: 1000,
      materials: [
        { item: 'Cotton Twill Fabric (12oz)', stdPerUnit: '1.35 MTR', totalRequired: '1,350 MTR', cuttingScrapTolerance: '3.5%', actualScrap: '2.8%', complianceStatus: 'PASSED' },
        { item: 'Metal Zipper Fastener 7"', stdPerUnit: '1 PCS', totalRequired: '1,000 PCS', cuttingScrapTolerance: '1.0%', actualScrap: '0.4%', complianceStatus: 'PASSED' },
        { item: 'Metal Rivet & Shank Button', stdPerUnit: '1 SET', totalRequired: '1,000 SETS', cuttingScrapTolerance: '1.0%', actualScrap: '0.2%', complianceStatus: 'PASSED' },
        { item: 'Polyester Pocketing Fabric', stdPerUnit: '0.25 MTR', totalRequired: '250 MTR', cuttingScrapTolerance: '4.0%', actualScrap: '3.1%', complianceStatus: 'PASSED' },
      ],
    },
    {
      garmentModel: 'Formal Cotton Stretch Trousers (Art #ET-2026-FORMAL)',
      standardOutputUnits: 500,
      materials: [
        { item: 'Cotton Stretch Gabardine', stdPerUnit: '1.40 MTR', totalRequired: '700 MTR', cuttingScrapTolerance: '3.0%', actualScrap: '2.4%', complianceStatus: 'PASSED' },
        { item: 'Plastic Button 24L', stdPerUnit: '4 PCS', totalRequired: '2,000 PCS', cuttingScrapTolerance: '1.5%', actualScrap: '0.5%', complianceStatus: 'PASSED' },
        { item: 'Nylon Coil Zipper', stdPerUnit: '1 PCS', totalRequired: '500 PCS', cuttingScrapTolerance: '1.0%', actualScrap: '0.0%', complianceStatus: 'PASSED' },
      ],
    },
  ];

  // 5-Year Archive Documents Filtered
  const archiveQuery = (archiveSearchQuery || '').toLowerCase();
  const filteredArchive = documents.filter(
    (doc) =>
      (doc.documentNo || '').toLowerCase().includes(archiveQuery) ||
      (doc.title || '').toLowerCase().includes(archiveQuery) ||
      (doc.linkedEntityRef ? doc.linkedEntityRef.toLowerCase().includes(archiveQuery) : false) ||
      (doc.documentType || '').toLowerCase().includes(archiveQuery)
  );

  const handleExportCSV = (filename: string) => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (activeReportType === 'MONTHLY_CUSTOMS_RETURN') {
      csvContent += 'Month,Import Declarations,Export Declarations,Transfer Declarations,Duty Exemption (AED)\n';
      monthlyData.forEach((row) => {
        csvContent += `${row.month},${row.imports},${row.exports},${row.transfers},${row.totalDutySavedAED}\n`;
      });
    } else {
      csvContent += 'Document No,Document Title,Category,Linked Declaration,Uploaded Date\n';
      filteredArchive.forEach((row) => {
        csvContent += `${row.documentNo},${row.title},${row.documentType},${row.linkedEntityRef},${row.uploadedAt}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported report to CSV');
  };

  return (
    <div className="space-y-5">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E5E7EB] rounded-lg p-5 shadow-xs">
        <div>
          <h2 className="text-base font-semibold text-[#111827] flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-[#1E3A5F]" />
            <span>{t.nav_reports}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#1E3A5F] border border-[#E2E8F0] font-medium">
              Statutory Analytics & 5-Yr Archive
            </span>
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            SAIF Zone Customs Reconciliation Returns, BOM Yield Waste Audit & Historical Document Search
          </p>
        </div>

        <button
          onClick={() => handleExportCSV(`Customs_Report_${activeReportType}`)}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#374151] hover:text-[#111827] transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Dataset (CSV)</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="YTD Total Customs Exemptions"
          value="AED 398,000"
          subtitle="Duty & VAT suspended under FZ"
          icon={Coins}
        />
        <KpiCard
          title="YTD Processed Declarations"
          value="74 Bayans"
          subtitle="Imports, Exports & Transfers"
          icon={Layers}
        />
        <KpiCard
          title="Average Scrap Rate"
          value="2.6%"
          subtitle="Allowed tolerance: 3.5%"
          trend={{ value: 'Full Compliance', isPositive: true }}
          icon={Scissors}
        />
        <KpiCard
          title="5-Year Archive Retention"
          value="100% Intact"
          subtitle="Indexed electronic vault files"
          icon={Archive}
        />
      </div>

      {/* Report Selector Tabs */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-2 shadow-xs flex items-center gap-2 overflow-x-auto">
        {[
          { id: 'MONTHLY_CUSTOMS_RETURN', label: 'Monthly Customs Activity Return' },
          { id: 'DUTY_EXEMPTION_SAVINGS', label: 'Duty Exemption & Cash Flow' },
          { id: 'BOM_YIELD_AUDIT', label: 'Garment BOM Yield & Scrap Audit' },
          { id: 'ARCHIVE_SEARCH', label: '5-Year Statutory Archive Search' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveReportType(tab.id as any)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
              activeReportType === tab.id
                ? 'bg-[#1E3A5F] text-white'
                : 'text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* REPORT 1: MONTHLY CUSTOMS RETURN */}
      {activeReportType === 'MONTHLY_CUSTOMS_RETURN' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Bar Chart */}
            <div className="lg:col-span-2 bg-white border border-[#E5E7EB] rounded-lg p-5 shadow-xs">
              <h3 className="text-xs font-semibold text-[#111827] uppercase tracking-wider mb-4">
                Monthly Declaration Volume (2026)
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                    <XAxis dataKey="month" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                    <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        borderColor: '#374151',
                        borderRadius: '6px',
                        color: '#FFFFFF',
                        fontSize: '11px',
                      }}
                    />
                    <Bar dataKey="imports" name="Imports" fill="#1E3A5F" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="exports" name="Exports" fill="#16A34A" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="transfers" name="Transfers" fill="#D97706" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 shadow-xs">
              <h3 className="text-xs font-semibold text-[#111827] uppercase tracking-wider mb-4">
                Declaration Distribution
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        borderColor: '#374151',
                        borderRadius: '6px',
                        color: '#FFFFFF',
                        fontSize: '11px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 pt-2 border-t border-[#E5E7EB] text-xs">
                {pieData.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: p.color }} />
                      <span className="text-[#4B5563] truncate max-w-[150px]">{p.name}</span>
                    </div>
                    <span className="font-semibold font-mono text-[#111827]">{p.value}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* REPORT 2: DUTY EXEMPTIONS */}
      {activeReportType === 'DUTY_EXEMPTION_SAVINGS' && (
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-semibold text-[#111827] uppercase tracking-wider">
            Free Zone Duty & VAT Exemption Ledger (2026)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start border-collapse">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#4B5563] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3.5 text-start">Month</th>
                  <th className="py-2.5 px-3.5 text-end">Import CIF Value (AED)</th>
                  <th className="py-2.5 px-3.5 text-end">Suspended Duty (5%)</th>
                  <th className="py-2.5 px-3.5 text-end">Suspended VAT (5%)</th>
                  <th className="py-2.5 px-3.5 text-end">Total Cash Flow Benefit</th>
                  <th className="py-2.5 px-3.5 text-center">Compliance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {monthlyData.map((row, idx) => {
                  const cif = row.totalDutySavedAED * 20;
                  const duty = row.totalDutySavedAED;
                  const vat = (cif + duty) * 0.05;
                  const total = duty + vat;

                  return (
                    <tr key={idx} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="py-3 px-3.5 font-semibold text-[#111827]">{row.month} 2026</td>
                      <td className="py-3 px-3.5 text-end font-mono text-[#4B5563] tabular-nums">
                        AED {cif.toLocaleString()}
                      </td>
                      <td className="py-3 px-3.5 text-end font-mono text-emerald-700 tabular-nums">
                        AED {duty.toLocaleString()}
                      </td>
                      <td className="py-3 px-3.5 text-end font-mono text-emerald-700 tabular-nums">
                        AED {vat.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
                      <td className="py-3 px-3.5 text-end font-semibold font-mono text-[#111827] tabular-nums">
                        AED {total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Verified
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 3: BOM YIELD AUDIT */}
      {activeReportType === 'BOM_YIELD_AUDIT' && (
        <div className="space-y-4">
          {bomYieldData.map((model, idx) => (
            <div key={idx} className="bg-white border border-[#E5E7EB] rounded-lg p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                <div>
                  <h4 className="font-semibold text-xs text-[#111827]">{model.garmentModel}</h4>
                  <p className="text-[11px] text-[#6B7280]">
                    Standard Production Batch: {model.standardOutputUnits} Pairs of Finished Trousers
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
                  SAIF Approved Formula
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-start border-collapse">
                  <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#4B5563] font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-2 px-3 text-start">Raw Material Component</th>
                      <th className="py-2 px-3 text-start">Standard Consumption / Unit</th>
                      <th className="py-2 px-3 text-end">Total Required</th>
                      <th className="py-2 px-3 text-end">Scrap Allowance</th>
                      <th className="py-2 px-3 text-end">Actual Scrap Logged</th>
                      <th className="py-2 px-3 text-center">Compliance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {model.materials.map((mat, mIdx) => (
                      <tr key={mIdx} className="hover:bg-[#F9FAFB]">
                        <td className="py-2.5 px-3 font-medium text-[#111827]">{mat.item}</td>
                        <td className="py-2.5 px-3 font-mono text-[#4B5563]">{mat.stdPerUnit}</td>
                        <td className="py-2.5 px-3 text-end font-mono text-[#111827]">{mat.totalRequired}</td>
                        <td className="py-2.5 px-3 text-end font-mono text-[#6B7280]">{mat.cuttingScrapTolerance}</td>
                        <td className="py-2.5 px-3 text-end font-mono font-semibold text-emerald-700">{mat.actualScrap}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {mat.complianceStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* REPORT 4: 5-YEAR ARCHIVE */}
      {activeReportType === 'ARCHIVE_SEARCH' && (
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-semibold text-[#111827] uppercase tracking-wider">
                5-Year Statutory Customs Archive Repository
              </h3>
              <p className="text-xs text-[#6B7280]">
                All declarations, certificates of origin and gate passes indexed for official FTA audits
              </p>
            </div>

            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 absolute inset-y-0 start-2.5 my-auto text-[#9CA3AF]" />
              <input
                type="text"
                value={archiveSearchQuery}
                onChange={(e) => setArchiveSearchQuery(e.target.value)}
                placeholder="Search archive ref, title, doc #..."
                className="w-full h-8 ps-8 pe-3 bg-[#F9FAFB] text-xs rounded-md border border-[#E5E7EB] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#1E3A5F]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start border-collapse">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#4B5563] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3.5 text-start">Archive Doc #</th>
                  <th className="py-2.5 px-3.5 text-start">Document Title</th>
                  <th className="py-2.5 px-3.5 text-start">Category</th>
                  <th className="py-2.5 px-3.5 text-start">Declaration Link</th>
                  <th className="py-2.5 px-3.5 text-start">Date</th>
                  <th className="py-2.5 px-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filteredArchive.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="py-3 px-3.5 font-semibold font-mono text-[#111827]">{doc.documentNo}</td>
                    <td className="py-3 px-3.5 font-medium text-[#111827]">{doc.title}</td>
                    <td className="py-3 px-3.5">
                      <span className="px-1.5 py-0.2 rounded bg-[#F1F5F9] text-[#1E3A5F] text-[11px] border border-[#E2E8F0]">
                        {(doc.documentType || 'DOCUMENT').replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 font-mono text-[#1E3A5F]">{doc.linkedEntityRef || '—'}</td>
                    <td className="py-3 px-3.5 font-mono text-[#6B7280]">{doc.issueDate}</td>
                    <td className="py-3 px-3.5 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Archived (5 Yrs)
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
