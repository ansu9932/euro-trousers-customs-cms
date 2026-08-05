import React from 'react';
import { DeclarationStatus } from '../../types';

interface StatusBadgeProps {
  status?: string | null;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', size = 'sm' }) => {
  const getBadgeStyle = (st?: string | null) => {
    if (!st) return 'bg-gray-50 text-gray-700 border-gray-200';
    switch (st) {
      // Approved / Cleared / Passed / Normal (Green #16A34A)
      case 'APPROVED':
      case 'CLEARED':
      case 'PASSED':
      case 'ACTIVE':
      case 'RELEASED':
      case 'REFUNDED':
      case 'ADJUSTED':
      case 'RESOLVED_RELEASED':
      case 'L4_GM_APPROVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';

      // Pending / In Review / Scheduled / Warning (Amber #D97706)
      case 'L1_PREPARED':
      case 'L2_REVIEWED':
      case 'L3_FINANCE_APPROVED':
      case 'PENDING_APPROVAL':
      case 'UNDER_REVIEW':
      case 'SCHEDULED':
      case 'REQUESTED':
      case 'UNDER_INSPECTION':
      case 'AT_WAREHOUSE':
        return 'bg-amber-50 text-amber-700 border-amber-200';

      // On Hold / Rejected / Overdue / Failed (Red #DC2626)
      case 'ON_HOLD':
      case 'ACTIVE_HOLD':
      case 'REJECTED':
      case 'FAILED':
      case 'OVERDUE':
      case 'FORFEITED':
      case 'EXPIRED':
        return 'bg-rose-50 text-rose-700 border-rose-200';

      // In Progress / Submitted / Gate Pass Issued (Blue #2563EB)
      case 'SUBMITTED':
      case 'IN_PROGRESS':
      case 'IN_TRANSIT':
      case 'GATE_PASS_ISSUED':
      case 'ISSUED':
      case 'VEHICLE_ARRIVED':
      case 'LOADED_UNLOADED':
        return 'bg-blue-50 text-blue-700 border-blue-200';

      // Draft / Cancelled / Closed / Returned (Grey #6B7280)
      case 'DRAFT':
      case 'CANCELLED':
      case 'CLOSED':
      case 'USED_EXITED':
      case 'RETURNED_EMPTY':
      case 'UNLOADED':
      case 'ARRIVED':
      case 'AMENDED':
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatStatusText = (st?: string | null) => {
    if (!st) return 'N/A';
    return String(st)
      .replace(/_/g, ' ')
      .replace(/L1 /g, 'L1: ')
      .replace(/L2 /g, 'L2: ')
      .replace(/L3 /g, 'L3: ')
      .replace(/L4 /g, 'L4: ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border whitespace-nowrap leading-none ${sizeClasses} ${getBadgeStyle(
        status
      )} ${className}`}
    >
      {formatStatusText(status)}
    </span>
  );
};
