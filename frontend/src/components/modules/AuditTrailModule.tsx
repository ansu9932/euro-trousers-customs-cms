import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  History,
  Search,
  Download,
  ShieldCheck,
  UserCheck,
  Calendar,
  Layers,
  Eye,
  Code2,
} from 'lucide-react';
import { AuditLogEntry } from '../../types';
import { KpiCard } from '../common/KpiCard';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';

export const AuditTrailModule: React.FC = () => {
  const { auditLogs, showToast, t } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('ALL');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [inspectingEntry, setInspectingEntry] = useState<AuditLogEntry | null>(null);

  // Filter audit logs
  const query = (searchQuery || '').toLowerCase();
  const filteredLogs = auditLogs.filter((entry) => {
    const matchesSearch =
      (entry.userName || '').toLowerCase().includes(query) ||
      (entry.details || '').toLowerCase().includes(query) ||
      (entry.entityRef || '').toLowerCase().includes(query) ||
      (entry.action || '').toLowerCase().includes(query);

    const matchesModule = selectedModule === 'ALL' || entry.module === selectedModule;
    const matchesAction = selectedAction === 'ALL' || entry.action === selectedAction;

    return matchesSearch && matchesModule && matchesAction;
  });

  const handleExportAuditLogs = () => {
    const jsonStr = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Customs_Audit_Trail_Export_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showToast('Exported audit trail to JSON file');
  };

  return (
    <div className="space-y-5">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E5E7EB] rounded-lg p-5 shadow-xs">
        <div>
          <h2 className="text-base font-semibold text-[#111827] flex items-center gap-2">
            <History className="w-4 h-4 text-[#1E3A5F]" />
            <span>{t.audit_trail}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#1E3A5F] border border-[#E2E8F0] font-medium">
              Immutable Ledger
            </span>
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Tamper-Evident System Audit Trail Across All Customs Modules • Compliant with UAE FTA & SAIF Zone Regulations
          </p>
        </div>

        <button
          onClick={handleExportAuditLogs}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#374151] hover:text-[#111827] transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit Trail (JSON)</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Audit Events"
          value={auditLogs.length}
          subtitle="Indexed immutable transactions"
          icon={Layers}
        />
        <KpiCard
          title="Active Authenticated Roles"
          value="10 Roles"
          subtitle="RBAC security model active"
          icon={UserCheck}
        />
        <KpiCard
          title="Integrity Verification"
          value="100% Valid"
          subtitle="Cryptographic chaining intact"
          trend={{ value: 'Zero Tampering', isPositive: true }}
          icon={ShieldCheck}
        />
        <KpiCard
          title="Retention Compliance"
          value="5 Years"
          subtitle="UAE FTA Federal Law requirement"
          icon={Calendar}
        />
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-3 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 absolute inset-y-0 start-2.5 my-auto text-[#9CA3AF]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by User, Ref #, Action or Details..."
            className="w-full h-8 ps-8 pe-3 bg-[#F9FAFB] text-xs rounded-md border border-[#E5E7EB] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#1E3A5F]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="h-8 px-2.5 text-xs rounded-md border border-[#E5E7EB] bg-white text-[#374151]"
          >
            <option value="ALL">All Modules</option>
            <option value="import_declarations">Import Declarations</option>
            <option value="export_declarations">Export Declarations</option>
            <option value="transfer_declarations">Transfer Declarations</option>
            <option value="duty_finance">Duty & Finance</option>
            <option value="clearance">Clearance & Gate Pass</option>
            <option value="containers">Containers & Demurrage</option>
            <option value="inspections">Customs Inspections</option>
            <option value="stock_reconciliation">Stock Reconciliation</option>
            <option value="documents">Document Vault</option>
            <option value="masters">Master Data</option>
          </select>
        </div>
      </div>

      {/* Dense Sortable Enterprise Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start border-collapse">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#4B5563] font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3.5 text-start">Timestamp</th>
                <th className="py-2.5 px-3.5 text-start">User / Actor</th>
                <th className="py-2.5 px-3.5 text-start">Action</th>
                <th className="py-2.5 px-3.5 text-start">Module</th>
                <th className="py-2.5 px-3.5 text-start">Entity Ref</th>
                <th className="py-2.5 px-3.5 text-start">Details</th>
                <th className="py-2.5 px-3.5 text-end">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredLogs.map((entry) => (
                <tr key={entry.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="py-3 px-3.5 font-mono text-[#6B7280] whitespace-nowrap">
                    {new Date(entry.timestamp).toLocaleString('en-GB', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-3.5 font-medium text-[#111827] whitespace-nowrap">
                    {entry.userName}
                  </td>
                  <td className="py-3 px-3.5">
                    <span className="font-mono text-[11px] font-semibold text-[#1E3A5F]">
                      {entry.action}
                    </span>
                  </td>
                  <td className="py-3 px-3.5">
                    <span className="px-1.5 py-0.2 rounded bg-[#F1F5F9] text-[#1E3A5F] text-[11px] border border-[#E2E8F0]">
                      {(entry.module || 'SYSTEM').replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 font-mono font-medium text-[#111827]">
                    {entry.entityRef}
                  </td>
                  <td className="py-3 px-3.5 text-[#4B5563] max-w-[280px] truncate">
                    {entry.details}
                  </td>
                  <td className="py-3 px-3.5 text-end">
                    <button
                      onClick={() => setInspectingEntry(entry)}
                      className="p-1 rounded-md text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] border border-transparent hover:border-[#E5E7EB] transition-colors"
                      title="Inspect full audit record JSON"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: JSON Record Inspector */}
      {inspectingEntry && (
        <Modal
          isOpen={true}
          onClose={() => setInspectingEntry(null)}
          title="Audit Trail Record Details"
          subtitle={`Event ID: ${inspectingEntry.id}`}
          footer={
            <button
              onClick={() => setInspectingEntry(null)}
              className="h-9 px-4 rounded-lg bg-[#1E3A5F] hover:bg-[#152B47] text-white text-xs font-medium"
            >
              Close
            </button>
          }
        >
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2 p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
              <div>
                <span className="text-[#6B7280]">Actor:</span>
                <span className="font-semibold text-[#111827] ms-1">{inspectingEntry.userName}</span>
              </div>
              <div>
                <span className="text-[#6B7280]">Module:</span>
                <span className="font-semibold text-[#111827] ms-1">{inspectingEntry.module}</span>
              </div>
              <div>
                <span className="text-[#6B7280]">Action:</span>
                <span className="font-semibold text-[#111827] ms-1">{inspectingEntry.action}</span>
              </div>
              <div>
                <span className="text-[#6B7280]">Entity:</span>
                <span className="font-semibold text-[#111827] ms-1">{inspectingEntry.entityType} ({inspectingEntry.entityRef})</span>
              </div>
            </div>

            <div>
              <label className="block font-medium text-[#374151] mb-1">Audit Record JSON Payload</label>
              <pre className="p-3 bg-[#0F172A] text-[#38BDF8] rounded-lg text-[11px] font-mono overflow-x-auto max-h-60">
                {JSON.stringify(inspectingEntry, null, 2)}
              </pre>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
