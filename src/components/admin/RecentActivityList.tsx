'use client';

import Link from 'next/link';
import {
  FileText,
  Building2,
  ShieldCheck,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { ActivityItem } from '@/lib/adminData';

interface RecentActivityListProps {
  activities: ActivityItem[];
}

export default function RecentActivityList({ activities }: RecentActivityListProps) {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'registration_received':
        return {
          icon: FileText,
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        };
      case 'enquiry_received':
        return {
          icon: Building2,
          bg: 'bg-amber-50 text-amber-700 border-amber-100',
        };
      case 'verification_updated':
      case 'status_changed':
        return {
          icon: ShieldCheck,
          bg: 'bg-[#0E2115]/10 text-primary border-[#0E2115]/20',
        };
      default:
        return {
          icon: Activity,
          bg: 'bg-gray-100 text-gray-700 border-gray-200',
        };
    }
  };

  return (
    <div className="bg-white rounded-[16px] p-5 border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-2">
        <h3 className="text-[16px] font-bold text-foreground">
          Recent Activity
        </h3>
        <Link
          href="/admin/activity"
          className="text-[12px] font-semibold text-accent hover:text-accent-hover flex items-center gap-1 transition-colors"
        >
          View All <ArrowRight size={13} />
        </Link>
      </div>

      {/* Activity Items */}
      <div className="divide-y divide-gray-50 flex-1">
        {activities.slice(0, 5).map((act) => {
          const { icon: Icon, bg } = getActivityIcon(act.type);

          return (
            <div
              key={act.id}
              className="py-3 flex items-start justify-between gap-3 group hover:bg-gray-50/50 px-2 rounded-lg transition-colors"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 mt-0.5 ${bg}`}
                >
                  <Icon size={15} />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                    {act.title}
                  </p>
                  <p className="text-[11px] font-mono text-gray-400 mt-0.5">
                    {act.reference}
                  </p>
                </div>
              </div>

              <span className="text-[11px] text-gray-400 shrink-0 mt-0.5">
                {act.relativeTime}
              </span>
            </div>
          );
        })}

        {activities.length === 0 && (
          <div className="py-8 text-center text-gray-400 text-[13px]">
            No recent activity recorded.
          </div>
        )}
      </div>
    </div>
  );
}
