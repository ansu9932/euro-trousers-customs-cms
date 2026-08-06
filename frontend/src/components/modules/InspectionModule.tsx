import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  Search,
  Plus,
  Printer,
  CheckCircle2,
  AlertTriangle,
  FileSearch,
  Scan,
  UserCheck,
  Clock,
  FileText,
} from 'lucide-react';
import { CustomsInspection } from '../../types';
import { KpiCard } from '../common/KpiCard';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';

export const InspectionModule: React.FC = () => {
  const {
    language,
    t,
    inspections,
    setInspections,
    holds,
    declarations,
    setPrintDocData,
    hasPermission,
    showToast,
    addAuditLog,
    currentUser,
    globalSearch,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // New Inspection State
  const [newInsp, setNewInsp] = useState({
    declarationNo: declarations[0]?.declarationNo || 'IMP-2026-0001',
    scheduledDate: new Date().toISOString().split('T')[0],
    inspectionType: 'PHYSICAL_CARGO_EXAMINATION',
    location: 'SAIF Zone Customs Examination Bay #4',
    inspectorName: 'Officer Tariq Al-Nuaimi (Badge #SZ-409)',
    notes: 'Random customs physical cargo verification of raw fabric rolls.',
  });

  const query = (searchTerm || globalSearch).toLowerCase();

  const filteredInspections = inspections
    .filter((i) => (statusFilter === 'ALL' ? true : i.status === statusFilter))
    .filter(
      (i) =>
        (i.inspectionNo || '').toLowerCase().includes(query) ||
        (i.declarationNo || '').toLowerCase().includes(query) ||
        (i.inspectorName || '').toLowerCase().includes(query)
    );

  const handleCreateInspection = (e: React.FormEvent) => {
    e.preventDefault();
    const count = inspections.length + 1;
    const created: CustomsInspection = {
      id: `insp-${Date.now()}`,
      inspectionNo: `INSP-2026-${String(count).padStart(4, '0')}`,
      declarationNo: newInsp.declarationNo,
      scheduledDate: newInsp.scheduledDate,
      inspectionType: newInsp.inspectionType as any,
      location: newInsp.location,
      inspectorName: newInsp.inspectorName,
      status: 'SCHEDULED',
      findings: newInsp.notes,
    };

    setInspections((prev) => [created, ...prev]);
    addAuditLog(
      'SCHEDULE_INSPECTION',
      'inspections',
      'CustomsInspection',
      created.id,
      created.inspectionNo,
      `Scheduled inspection ${created.inspectionNo} for declaration ${created.declarationNo}`
    );
    showToast(`Inspection ${created.inspectionNo} scheduled`);
    setIsNewModalOpen(false);
  };

  const handleUpdateStatus = (id: string, newStatus: any, findings?: string) => {
    setInspections((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              status: newStatus,
              completionDate: newStatus === 'PASSED' ? new Date().toISOString().split('T')[0] : i.completionDate,
              findings: findings || i.findings,
            }
          : i
      )
    );
    showToast(`Inspection status updated to ${newStatus}`);
  };

  const handlePrintInspectionReport = (insp: CustomsInspection) => {
    setPrintDocData({
      docType: 'CUSTOMS_INSPECTION_REPORT',
      inspection: insp,
      docNumber: insp.inspectionNo,
      titleEn: 'SAIF ZONE CUSTOMS INSPECTION & CLEARANCE REPORT',
      titleAr: 'تقرير التفتيش والمعاينة الجمركية - هيئة جمارك الشارقة',
      declarationNo: insp.declarationNo,
      issueDate: insp.scheduledDate,
      sections: [
        {
          title: 'Examination Details',
          fields: [
            { label: 'Inspection Type', value: insp.inspectionType },
            { label: 'Inspection Location', value: insp.location },
            { label: 'Inspector Name', value: insp.inspectorName },
            { label: 'Result Status', value: insp.status },
          ],
        },
        {
          title: 'Customs Officer Findings',
          fields: [
            { label: 'Physical Examination Summary', value: insp.findings || 'All packages intact with original factory seals.' },
          ],
        },
      ],
    });
  };

  const activeHolds = holds.filter((h) => h.status === 'ACTIVE_HOLD');

  return (
    <div className="space-y-5">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E5E7EB] rounded-lg p-5 shadow-xs">
        <div>
          <h2 className="text-base font-semibold text-[#111827] flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#1E3A5F]" />
            <span>{t.nav_inspections}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#1E3A5F] border border-[#E2E8F0] font-medium">
              {inspections.length} Inspections Logged
            </span>
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            SAIF Zone Customs Physical Examinations, X-Ray Scans, Hold Escalations & Release Clearance
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasPermission('inspections', 'create') && (
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium bg-[#1E3A5F] hover:bg-[#152B47] text-white shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Schedule Inspection</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Active Customs Holds"
          value={activeHolds.length}
          subtitle="Inspection follow-up active"
          trend={{ value: activeHolds.length > 0 ? 'Under review' : 'Clean', isPositive: activeHolds.length === 0 }}
          icon={AlertTriangle}
        />
        <KpiCard
          title="Inspections Completed"
          value={inspections.filter((i) => i.status === 'PASSED').length}
          subtitle="Cleared without violation"
          icon={CheckCircle2}
        />
        <KpiCard
          title="Average Release Time"
          value="2.4 Hours"
          subtitle="From dock arrival to pass"
          trend={{ value: 'Within SLA', isPositive: true }}
          icon={Clock}
        />
        <KpiCard
          title="Inspection Pass Rate"
          value="100%"
          subtitle="Zero contraband or misdeclarations"
          trend={{ value: 'Optimal', isPositive: true }}
          icon={FileSearch}
        />
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-3 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {['ALL', 'SCHEDULED', 'IN_PROGRESS', 'PASSED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors border text-xs ${
                  statusFilter === st
                    ? 'bg-[#1E3A5F] text-white border-[#1E3A5F] font-medium'
                    : 'bg-[#F9FAFB] text-[#4B5563] border-[#E5E7EB] hover:bg-[#F3F4F6] hover:text-[#111827]'
                }`}
              >
                {st === 'ALL'
                  ? (language === 'ar' ? 'جميع الفحوصات' : 'All Inspections')
                  : ((st || '').replace(/_/g, ' '))}
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 absolute inset-y-0 start-2.5 my-auto text-[#9CA3AF]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search inspection #, inspector..."
              className="w-full h-8 ps-8 pe-3 bg-[#F9FAFB] text-xs rounded-lg border border-[#E5E7EB] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#1E3A5F]"
            />
          </div>

        </div>
      </div>

      {/* Dense Sortable Enterprise Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start border-collapse">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#4B5563] font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3.5 text-start">Inspection #</th>
                <th className="py-2.5 px-3.5 text-start">Declaration #</th>
                <th className="py-2.5 px-3.5 text-start">Type & Location</th>
                <th className="py-2.5 px-3.5 text-start">Assigned Inspector</th>
                <th className="py-2.5 px-3.5 text-start">Scheduled Date</th>
                <th className="py-2.5 px-3.5 text-start">Findings Summary</th>
                <th className="py-2.5 px-3.5 text-center">Status</th>
                <th className="py-2.5 px-3.5 text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredInspections.map((insp) => (
                <tr key={insp.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="py-3 px-3.5 font-semibold font-mono text-[#111827]">
                    {insp.inspectionNo}
                  </td>
                  <td className="py-3 px-3.5 font-mono text-[#1E3A5F]">{insp.declarationNo}</td>
                  <td className="py-3 px-3.5">
                    <div className="font-medium text-[#111827]">{(insp.inspectionType || 'INSPECTION').replace(/_/g, ' ')}</div>
                    <div className="text-[11px] text-[#6B7280]">{insp.location}</div>
                  </td>
                  <td className="py-3 px-3.5 text-[#374151]">{insp.inspectorName}</td>
                  <td className="py-3 px-3.5 font-mono text-[#4B5563]">{insp.scheduledDate}</td>
                  <td className="py-3 px-3.5 text-[#6B7280] max-w-[200px] truncate">
                    {insp.findings || 'Pending physical examination'}
                  </td>
                  <td className="py-3 px-3.5 text-center">
                    <StatusBadge status={insp.status} />
                  </td>
                  <td className="py-3 px-3.5 text-end">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handlePrintInspectionReport(insp)}
                        className="p-1 rounded-md text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] border border-transparent hover:border-[#E5E7EB] transition-colors"
                        title="Print Official Inspection Report"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>

                      {insp.status === 'SCHEDULED' && hasPermission('inspections', 'edit') && (
                        <button
                          onClick={() => handleUpdateStatus(insp.id, 'PASSED', 'Physical count and HS fabric composition verified. Released.')}
                          className="h-7 px-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-medium"
                        >
                          Pass & Release
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Schedule Inspection */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Schedule Customs Physical Inspection"
        subtitle="SAIF Zone Customs Cargo Examination Center"
        footer={
          <>
            <button
              onClick={() => setIsNewModalOpen(false)}
              className="h-9 px-3.5 rounded-lg border border-[#E5E7EB] bg-white text-xs font-medium text-[#374151]"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateInspection}
              className="h-9 px-4 rounded-lg bg-[#1E3A5F] hover:bg-[#152B47] text-white text-xs font-medium"
            >
              Book Examination
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateInspection} className="space-y-3 text-xs">
          <div>
            <label className="block font-medium text-[#374151] mb-1">Declaration Reference *</label>
            <select
              value={newInsp.declarationNo}
              onChange={(e) => setNewInsp({ ...newInsp, declarationNo: e.target.value })}
              className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#E5E7EB]"
            >
              {declarations.map((d) => (
                <option key={d.id} value={d.declarationNo}>
                  {d.declarationNo} ({d.partnerName})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#374151] mb-1">Inspection Type *</label>
              <select
                value={newInsp.inspectionType}
                onChange={(e) => setNewInsp({ ...newInsp, inspectionType: e.target.value })}
                className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#E5E7EB]"
              >
                <option value="PHYSICAL_CARGO_EXAMINATION">Physical Cargo Examination</option>
                <option value="X_RAY_SCAN">X-Ray Non-Intrusive Scan</option>
                <option value="DOCUMENT_VERIFICATION">Customs Document Verification</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-[#374151] mb-1">Scheduled Date *</label>
              <input
                type="date"
                value={newInsp.scheduledDate}
                onChange={(e) => setNewInsp({ ...newInsp, scheduledDate: e.target.value })}
                className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#E5E7EB]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-[#374151] mb-1">Examination Location *</label>
            <input
              type="text"
              value={newInsp.location}
              onChange={(e) => setNewInsp({ ...newInsp, location: e.target.value })}
              className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#E5E7EB]"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-[#374151] mb-1">Inspector Name / Badge</label>
            <input
              type="text"
              value={newInsp.inspectorName}
              onChange={(e) => setNewInsp({ ...newInsp, inspectorName: e.target.value })}
              className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#E5E7EB]"
            />
          </div>
        </form>
      </Modal>

    </div>
  );
};
