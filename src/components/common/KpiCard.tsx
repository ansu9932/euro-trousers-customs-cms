import React from 'react';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';

interface KpiCardProps {
  id?: string;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  icon?: LucideIcon;
  badge?: string;
  onClick?: () => void;
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  id,
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  badge,
  onClick,
  className = '',
}) => {
  return (
    <div
      id={id}
      onClick={onClick}
      className={`bg-white border border-[#E5E7EB] rounded-lg p-4 shadow-xs transition-all duration-150 ${
        onClick ? 'cursor-pointer hover:border-[#1E3A5F]/40 hover:shadow-sm' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-[#6B7280] truncate">{title}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          {badge && (
            <span className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-[#F1F5F9] text-[#1E3A5F] border border-[#E2E8F0]">
              {badge}
            </span>
          )}
          {Icon && (
            <div className="p-1.5 rounded-md bg-[#F7F8FA] text-[#1E3A5F] border border-[#E5E7EB]">
              <Icon className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
      </div>

      <div className="mt-2.5 flex items-baseline justify-between gap-2">
        <div className="text-2xl font-semibold text-[#111827] tracking-tight tabular-nums">
          {value}
        </div>
        {trend && (
          <div
            className={`flex items-center text-xs font-medium shrink-0 ${
              trend.isPositive !== false ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {trend.isPositive !== false ? (
              <TrendingUp className="w-3 h-3 me-0.5 shrink-0" />
            ) : (
              <TrendingDown className="w-3 h-3 me-0.5 shrink-0" />
            )}
            <span>{trend.value}</span>
          </div>
        )}
      </div>

      {subtitle && (
        <p className="text-xs text-[#6B7280] mt-1 truncate">{subtitle}</p>
      )}
    </div>
  );
};
