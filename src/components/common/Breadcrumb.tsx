import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { SystemModule } from '../../types';

interface BreadcrumbProps {
  items: {
    label: string;
    onClick?: () => void;
  }[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  return (
    <nav className={`flex items-center text-xs text-[#6B7280] ${className}`} aria-label="Breadcrumb">
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="flex items-center gap-1 text-[#6B7280]">
          <Home className="w-3.5 h-3.5" />
          <span>SAIF Zone</span>
        </span>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={index}>
              <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0 rtl:rotate-180" />
              {item.onClick && !isLast ? (
                <button
                  onClick={item.onClick}
                  className="hover:text-[#111827] font-medium transition-colors hover:underline"
                >
                  {item.label}
                </button>
              ) : (
                <span className={`truncate ${isLast ? 'font-semibold text-[#111827]' : ''}`}>
                  {item.label}
                </span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
};
