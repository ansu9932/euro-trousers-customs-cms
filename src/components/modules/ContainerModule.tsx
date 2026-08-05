import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Container as ContainerIcon,
  Search,
  Plus,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Ship,
  Truck,
  DollarSign,
  Calendar,
  RotateCcw,
} from 'lucide-react';
import { ContainerRecord } from '../../types';
import { KpiCard } from '../common/KpiCard';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';

export const ContainerModule: React.FC = () => {
  const {
    language,
    t,
    containers,
    setContainers,
    hasPermission,
    showToast,
    addAuditLog,
    globalSearch,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // New Container Form State
  const [newContainer, setNewContainer] = useState({
    containerNo: 'MSCU8819234',
    isoType: '40HC',
    shippingLine: 'MSC Mediterranean Shipping Co.',
    blAwbNo: 'MSCU-SH-DXB-99812',
    vesselName: 'MSC ANNA / V.2608W',
    dischargeDate: new Date().toISOString().split('T')[0],
    freeDaysAllowed: 7,
    dailyDemurrageRateAED: 250,
  });

  const query = (searchTerm || globalSearch).toLowerCase();

  const filteredContainers = containers
    .filter((c) => (statusFilter === 'ALL' ? true : c.status === statusFilter))
    .filter(
      (c) =>
        (c.containerNo || '').toLowerCase().includes(query) ||
        (c.shippingLine || '').toLowerCase().includes(query) ||
        (c.blAwbNo || '').toLowerCase().includes(query)
    );

  const handleCreateContainer = (e: React.FormEvent) => {
    e.preventDefault();
    const discharge = new Date(newContainer.dischargeDate);
    const returnDue = new Date(discharge.getTime() + newContainer.freeDaysAllowed * 86400000)
      .toISOString()
      .split('T')[0];

    const created: ContainerRecord = {
      id: `cnt-${Date.now()}`,
      containerNo: newContainer.containerNo,
      isoType: newContainer.isoType,
      sealNo: 'SZ-SEAL-PENDING',
      shippingLine: newContainer.shippingLine,
      blAwbNo: newContainer.blAwbNo,
      vesselName: newContainer.vesselName,
      portOfDischarge: 'Sharjah Khalid Port',
      dischargeDate: newContainer.dischargeDate,
      freeDaysAllowed: newContainer.freeDaysAllowed,
      returnDueDate: returnDue,
      status: 'IN_TRANSIT',
      dailyDemurrageRateAED: newContainer.dailyDemurrageRateAED,
      accruedDemurrageAED: 0,
    };

    setContainers((prev) => [created, ...prev]);
    addAuditLog(
      'ADD_CONTAINER',
      'containers',
      'ContainerRecord',
      created.id,
      created.containerNo,
      `Registered container ${created.containerNo} (${created.shippingLine})`
    );
    showToast(`Container ${created.containerNo} registered`);
    setIsNewModalOpen(false);
  };

  const handleUpdateStatus = (id: string, newStatus: any) => {
    setContainers((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated = { ...c, status: newStatus };
          if (newStatus === 'RETURNED_EMPTY') {
            updated.emptyReturnDate = new Date().toISOString().split('T')[0];
          }
          return updated;
        }
        return c;
      })
    );
    showToast(`Container status updated to ${newStatus}`);
  };

  const activeContainers = containers.filter((c) => c.status !== 'RETURNED_EMPTY');
  const atWarehouse = containers.filter((c) => c.status === 'AT_WAREHOUSE');
  const urgentCount = containers.filter((c) => c.status === 'AT_WAREHOUSE').length; // 2 days left

  return (
    <div className="space-y-5">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E5E7EB] rounded-lg p-5 shadow-xs">
        <div>
          <h2 className="text-base font-semibold text-[#111827] flex items-center gap-2">
            <ContainerIcon className="w-4 h-4 text-[#1E3A5F]" />
            <span>{t.nav_containers}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#1E3A5F] border border-[#E2E8F0] font-medium">
              {activeContainers.length} Active Boxes
            </span>
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Shipping Line Free-Days Demurrage Clock (COSCO, Maersk, MSC) • Khalid Port Empty Returns
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasPermission('containers', 'create') && (
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium bg-[#1E3A5F] hover:bg-[#152B47] text-white shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Log Inward Container</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Active Sea Containers"
          value={activeContainers.length}
          subtitle="In Transit / At Warehouse"
          icon={ContainerIcon}
        />
        <KpiCard
          title="At Factory Unloading Dock"
          value={atWarehouse.length}
          subtitle="Warehouse Plot Q4-081"
          icon={Truck}
        />
        <KpiCard
          title="Demurrage Exposure Risk"
          value={urgentCount > 0 ? `${urgentCount} Urgent Box` : 'Zero Risk'}
          subtitle="2 Days remaining on COSCO box"
          trend={{ value: urgentCount > 0 ? 'Urgent Return' : 'Clean', isPositive: urgentCount === 0 }}
          icon={AlertTriangle}
        />
        <KpiCard
          title="Accrued Demurrage"
          value="AED 0.00"
          subtitle="100% On-time return rate"
          trend={{ value: 'Zero penalties', isPositive: true }}
          icon={DollarSign}
        />
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-3 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {['ALL', 'IN_TRANSIT', 'AT_WAREHOUSE', 'RETURNED_EMPTY'].map((st) => (
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
                  ? (language === 'ar' ? 'جميع الحاويات' : 'All Containers')
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
              placeholder="Search container #, carrier..."
              className="w-full h-8 ps-8 pe-3 bg-[#F9FAFB] text-xs rounded-lg border border-[#E5E7EB] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#1E3A5F]"
            />
          </div>

        </div>
      </div>

      {/* Dense Sortable Container Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start border-collapse">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#4B5563] font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3.5 text-start">Container #</th>
                <th className="py-2.5 px-3.5 text-start">Shipping Line</th>
                <th className="py-2.5 px-3.5 text-start">B/L & Vessel</th>
                <th className="py-2.5 px-3.5 text-start">Discharge Date</th>
                <th className="py-2.5 px-3.5 text-start">Free Days / Due Date</th>
                <th className="py-2.5 px-3.5 text-end">Rate / Day</th>
                <th className="py-2.5 px-3.5 text-center">Status</th>
                <th className="py-2.5 px-3.5 text-end">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredContainers.map((c) => {
                const isUrgent = c.status === 'AT_WAREHOUSE';

                return (
                  <tr key={c.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="py-3 px-3.5 font-semibold font-mono text-[#111827]">
                      <div className="flex items-center gap-1.5">
                        <span>{c.containerNo}</span>
                        <span className="px-1.5 py-0.2 rounded bg-[#F3F4F6] text-[#6B7280] text-[10px] border border-[#E5E7EB]">
                          {c.isoType}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3.5 font-medium text-[#374151]">{c.shippingLine}</td>
                    <td className="py-3 px-3.5">
                      <div className="font-mono text-[#111827]">{c.blAwbNo}</div>
                      <div className="text-[11px] text-[#6B7280]">{c.vesselName}</div>
                    </td>
                    <td className="py-3 px-3.5 font-mono text-[#4B5563]">{c.dischargeDate}</td>
                    <td className="py-3 px-3.5">
                      <div className="font-mono text-[#111827]">{c.returnDueDate}</div>
                      {isUrgent && (
                        <span className="text-[10px] font-semibold text-[#DC2626] block">
                          2 Free Days Left
                        </span>
                      )}
                      {c.status === 'RETURNED_EMPTY' && (
                        <span className="text-[10px] font-medium text-emerald-700 block">
                          Returned {c.emptyReturnDate}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-end font-mono text-[#4B5563]">
                      AED {c.dailyDemurrageRateAED}
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-3 px-3.5 text-end">
                      {c.status === 'AT_WAREHOUSE' && hasPermission('containers', 'edit') && (
                        <button
                          onClick={() => handleUpdateStatus(c.id, 'RETURNED_EMPTY')}
                          className="h-7 px-2 bg-[#1E3A5F] hover:bg-[#152B47] text-white rounded text-[11px] font-medium transition-colors"
                        >
                          Confirm Return
                        </button>
                      )}
                      {c.status === 'IN_TRANSIT' && hasPermission('containers', 'edit') && (
                        <button
                          onClick={() => handleUpdateStatus(c.id, 'AT_WAREHOUSE')}
                          className="h-7 px-2 border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#374151] rounded text-[11px] font-medium transition-colors"
                        >
                          Mark Arrived
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Container */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Log Inward Sea Container"
        subtitle="Tracking free-days deadline against Khalid Port discharge"
        footer={
          <>
            <button
              onClick={() => setIsNewModalOpen(false)}
              className="h-9 px-3.5 rounded-lg border border-[#E5E7EB] bg-white text-xs font-medium text-[#374151]"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateContainer}
              className="h-9 px-4 rounded-lg bg-[#1E3A5F] hover:bg-[#152B47] text-white text-xs font-medium"
            >
              Track Container
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateContainer} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#374151] mb-1">Container Number *</label>
              <input
                type="text"
                value={newContainer.containerNo}
                onChange={(e) => setNewContainer({ ...newContainer, containerNo: e.target.value })}
                className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#E5E7EB] font-mono"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-[#374151] mb-1">ISO Type</label>
              <select
                value={newContainer.isoType}
                onChange={(e) => setNewContainer({ ...newContainer, isoType: e.target.value })}
                className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#E5E7EB]"
              >
                <option value="40HC">40ft High Cube (40HC)</option>
                <option value="20GP">20ft Standard (20GP)</option>
                <option value="40GP">40ft Standard (40GP)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#374151] mb-1">Shipping Line *</label>
              <input
                type="text"
                value={newContainer.shippingLine}
                onChange={(e) => setNewContainer({ ...newContainer, shippingLine: e.target.value })}
                className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#E5E7EB]"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-[#374151] mb-1">B/L Number</label>
              <input
                type="text"
                value={newContainer.blAwbNo}
                onChange={(e) => setNewContainer({ ...newContainer, blAwbNo: e.target.value })}
                className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#E5E7EB] font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-[#374151] mb-1">Discharge Date</label>
              <input
                type="date"
                value={newContainer.dischargeDate}
                onChange={(e) => setNewContainer({ ...newContainer, dischargeDate: e.target.value })}
                className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#E5E7EB]"
              />
            </div>
            <div>
              <label className="block font-medium text-[#374151] mb-1">Free Days Allowed</label>
              <input
                type="number"
                value={newContainer.freeDaysAllowed}
                onChange={(e) => setNewContainer({ ...newContainer, freeDaysAllowed: parseInt(e.target.value) || 7 })}
                className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#E5E7EB] font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-[#374151] mb-1">Demurrage/Day (AED)</label>
              <input
                type="number"
                value={newContainer.dailyDemurrageRateAED}
                onChange={(e) => setNewContainer({ ...newContainer, dailyDemurrageRateAED: parseInt(e.target.value) || 200 })}
                className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#E5E7EB] font-mono"
              />
            </div>
          </div>
        </form>
      </Modal>

    </div>
  );
};
