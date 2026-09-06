'use client';

import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string | number;
  subtext: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
}

export default function KpiCard({
  label,
  value,
  subtext,
  trend = 'up',
  icon: Icon,
  iconBgColor = 'bg-emerald-50',
  iconColor = 'text-emerald-700',
}: KpiCardProps) {
  const isUp = trend === 'up';
  const isDown = trend === 'down';

  return (
    <div className="bg-white rounded-[16px] p-5 border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:border-gray-300 transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBgColor} ${iconColor}`}
        >
          <Icon size={20} />
        </div>
      </div>

      <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
        {label}
      </p>

      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-[32px] font-heading font-extrabold text-foreground tracking-tight leading-none">
          {value}
        </h3>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-[12px]">
        {isUp && (
          <span className="inline-flex items-center font-semibold text-emerald-700">
            <ArrowUpRight size={14} className="mr-0.5" />
            {subtext}
          </span>
        )}
        {isDown && (
          <span className="inline-flex items-center font-semibold text-amber-700">
            <ArrowDownRight size={14} className="mr-0.5" />
            {subtext}
          </span>
        )}
        {!isUp && !isDown && (
          <span className="text-gray-500 font-medium">{subtext}</span>
        )}
      </div>
    </div>
  );
}
