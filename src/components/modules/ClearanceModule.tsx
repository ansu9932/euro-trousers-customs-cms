import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Search,
  Plus,
  Printer,
  QrCode,
  Truck,
  CheckCircle2,
  Calendar,
  Clock,
  UserCheck,
} from 'lucide-react';
import { GatePass } from '../../types';
import { KpiCard } from '../common/KpiCard';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';

export const ClearanceModule: React.FC = () => {
  const {
    t,
    gatePasses,
    setGatePasses,
    declarations,
    setPrintDocData,
    hasPermission,
    showToast,
    addAuditLog,
    currentUser,
    globalSearch,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // New Gate Pass State
  const [newPass, setNewPass] = useState({
    declarationNo: declarations[0]?.declarationNo || 'IMP-2026-0001',
    driverName: 'Mohammed Rashid Al-Mansoor',
    driverMobile: '+971 50 889 1234',
    vehiclePlateNo: 'Sharjah 48912 / Commercial',
    destination: 'EURO TROUSERS Warehouse #Q4-081, SAIF Zone',
    validUntil: new Date(Date.now() + 24 * 3600000).toISOString().replace('T', ' ').substring(0, 16),
  });

  const query = (searchTerm || globalSearch).toLowerCase();

  const filteredPasses = gatePasses.filter(
    (gp) =>
      (gp.passNo || '').toLowerCase().includes(query) ||
      (gp.declarationNo || '').toLowerCase().includes(query) ||
      (gp.driverName || '').toLowerCase().includes(query) ||
      (gp.vehiclePlateNo || '').toLowerCase().includes(query)
  );

  const handleCreateGatePass = (e: React.FormEvent) => {
    e.preventDefault();
    const count = gatePasses.length + 1;
    const created: GatePass = {
      id: `gp-${Date.now()}`,
      passNo: `GP-2026-${String(count).padStart(4, '0')}`,
      declarationNo: newPass.declarationNo,
      issuedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      validUntil: newPass.validUntil,
      driverName: newPass.driverName,
      driverMobile: newPass.driverMobile,
      vehiclePlateNo: newPass.vehiclePlateNo,
      destination: newPass.destination,
      status: 'ISSUED',
      qrVerificationCode: `SZ-GP-${Date.now()}`,
    };

    setGatePasses((prev) => [created, ...prev]);
    addAuditLog(
      'ISSUE_GATE_PASS',
      'clearance',
      'GatePass',
      created.id,
      created.passNo,
      `Issued Gate Pass ${created.passNo} to driver ${created.driverName} (Vehicle: ${created.vehiclePlateNo})`
    );
    showToast(`Gate Pass ${created.passNo} issued`);
    setIsNewModalOpen(false);
  };

  const handlePrintPass = (gp: GatePass) => {
    setPrintDocData({
      titleEn: 'OFFICIAL SAIF ZONE SECURITY GATE PASS & VEHICLE CLEARANCE',
      titleAr: 'تصريح خروج ودخول البوابات الأمنية الرسمي - المنطقة الحرة لمطار الشارقة الدولي',
      docNumber: gp.passNo,
      declarationNo: gp.declarationNo,
      bayanRef: 'SZ-BAYAN-GP-2026',
      issueDate: gp.issuedAt,
      preparedBy: currentUser.name,
      sections: [
        {
          title: 'Gate Pass Vehicle & Driver Credentials',
          fields: [
            { label: 'Gate Pass #', value: gp.passNo },
            { label: 'Linked Customs Declaration', value: gp.declarationNo },
            { label: 'Authorized Driver Name', value: gp.driverName },
            { label: 'Driver Contact Mobile', value: gp.driverMobile },
            { label: 'Truck Plate Number', value: gp.vehiclePlateNo },
            { label: 'Assigned Destination', value: gp.destination },
            { label: 'Issue Timestamp', value: gp.issuedAt },
            { label: 'Pass Validity Expiration', value: gp.validUntil },
          ],
        },
      ],
    });
  };

  return (
    <div className="space-y-5">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E5E7EB] rounded-lg p-5 shadow-xs">
        <div>
          <h2 className="text-base font-semibold text-[#111827] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#1E3A5F]" />
            <span>{t.nav_clearance}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#1E3A5F] border border-[#E2E8F0] font-medium">
              {gatePasses.length} Passes Issued
            </span>
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Sharjah Free Zone Gate Security Clearance • QR Digital Verification & Truck Escort Release
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasPermission('clearance', 'create') && (
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium bg-[#1E3A5F] hover:bg-[#152B47] text-white shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Issue Security Gate Pass</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Active Gate Passes"
          value={gatePasses.filter((p) => p.status === 'ISSUED').length}
          subtitle="Valid for entry/exit gates"
          icon={ShieldCheck}
        />
        <KpiCard
          title="Trucks Cleared Today"
          value="6 Vehicles"
          subtitle="Plot Q4-081 Loading Bay"
          icon={Truck}
        />
        <KpiCard
          title="QR Verification Status"
          value="100% Valid"
          subtitle="SAIF Security Checkpoint"
          trend={{ value: 'Real-time sync', isPositive: true }}
          icon={QrCode}
        />
        <KpiCard
          title="Gate Security Dispatches"
          value="14 Passes"
          subtitle="Zero unauthorized exits"
          trend={{ value: 'Full audit match', isPositive: true }}
          icon={UserCheck}
        />
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-3 shadow-xs flex justify-end">
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute inset-y-0 start-2.5 my-auto text-[#9CA3AF]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Gate Pass #, truck plate, driver..."
            className="w-full h-8 ps-8 pe-3 bg-[#F9FAFB] text-xs rounded-lg border border-[#E5E7EB] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#1E3A5F]"
          />
        </div>
      </div>

      {/* Dense Sortable Enterprise Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start border-collapse">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#4B5563] font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3.5 text-start">Pass #</th>
                <th className="py-2.5 px-3.5 text-start">Declaration Ref</th>
                <th className="py-2.5 px-3.5 text-start">Vehicle Plate</th>
                <th className="py-2.5 px-3.5 text-start">Driver Name & Contact</th>
                <th className="py-2.5 px-3.5 text-start">Destination</th>
                <th className="py-2.5 px-3.5 text-start">Issued / Valid Until</th>
                <th className="py-2.5 px-3.5 text-center">Status</th>
                <th className="py-2.5 px-3.5 text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredPasses.map((gp) => (
                <tr key={gp.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="py-3 px-3.5 font-semibold font-mono text-[#111827]">
                    {gp.passNo}
                  </td>
                  <td className="py-3 px-3.5 font-mono text-[#1E3A5F]">{gp.declarationNo}</td>
                  <td className="py-3 px-3.5 font-mono font-medium text-[#111827]">
                    {gp.vehiclePlateNo}
                  </td>
                  <td className="py-3 px-3.5">
                    <div className="font-medium text-[#111827]">{gp.driverName}</div>
                    <div className="text-[11px] text-[#6B7280]">{gp.driverMobile}</div>
                  </td>
                  <td className="py-3 px-3.5 text-[#374151]">{gp.destination}</td>
                  <td className="py-3 px-3.5">
                    <div className="font-mono text-[#111827]">{gp.issuedAt}</div>
                    <div className="text-[11px] text-[#6B7280]">Expires: {gp.validUntil}</div>
                  </td>
                  <td className="py-3 px-3.5 text-center">
                    <StatusBadge status={gp.status} />
                  </td>
                  <td className="py-3 px-3.5 text-end">
                    <button
                      onClick={() => handlePrintPass(gp)}
                      className="p-1 rounded-md text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] border border-transparent hover:border-[#E5E7EB] transition-colors inline-flex items-center gap-1 text-[11px]"
                      title="Print Gate Pass with QR Code"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Print Pass</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Issue Gate Pass */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Issue Security Gate Pass"
        subtitle="SAIF Zone Security Checkpoint Truck Clearance"
        footer={
          <>
            <button
              onClick={() => setIsNewModalOpen(false)}
              className="h-9 px-3.5 rounded-lg border border-[#E5E7EB] bg-white text-xs font-medium text-[#374151]"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateGatePass}
              className="h-9 px-4 rounded-lg bg-[#1E3A5F] hover:bg-[#152B47] text-white text-xs font-medium"
            >
              Issue Gate Pass
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateGatePass} className="space-y-3 text-xs">
          <div>
            <label className="block font-medium text-[#374151] mb-1">Declaration Reference *</label>
            <select
              value={newPass.declarationNo}
              onChange={(e) => setNewPass({ ...newPass, declarationNo: e.target.value })}
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
              <label className="block font-medium text-[#374151] mb-1">Driver Full Name *</label>
              <input
                type="text"
                value={newPass.driverName}
                onChange={(e) => setNewPass({ ...newPass, driverName: e.target.value })}
                className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#E5E7EB]"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-[#374151] mb-1">Driver Mobile *</label>
              <input
                type="text"
                value={newPass.driverMobile}
                onChange={(e) => setNewPass({ ...newPass, driverMobile: e.target.value })}
                className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#E5E7EB]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#374151] mb-1">Truck Plate Number *</label>
              <input
                type="text"
                value={newPass.vehiclePlateNo}
                onChange={(e) => setNewPass({ ...newPass, vehiclePlateNo: e.target.value })}
                className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#E5E7EB]"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-[#374151] mb-1">Destination / Gate</label>
              <input
                type="text"
                value={newPass.destination}
                onChange={(e) => setNewPass({ ...newPass, destination: e.target.value })}
                className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#E5E7EB]"
              />
            </div>
          </div>
        </form>
      </Modal>

    </div>
  );
};
