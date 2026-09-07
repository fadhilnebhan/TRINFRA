'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Activity, FileText, Building2, ShieldCheck } from 'lucide-react';
import { ActivityItem } from '@/lib/adminData';

interface ApiNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  reference?: string;
  read: boolean;
  createdAt: string;
}

export default function AdminActivityPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActivities() {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/notifications');
        if (res.ok) {
          const data = await res.json();
          if (data.notifications && data.notifications.length > 0) {
            const mapped: ActivityItem[] = data.notifications.map((n: ApiNotification) => {
              const dt = new Date(n.createdAt);
              const relativeTime = !isNaN(dt.getTime())
                ? dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                : 'Recent';

              return {
                id: n.id,
                type: (n.type as ActivityItem['type']) || 'registration_received',
                title: n.title,
                reference: n.reference || '',
                timestamp: n.createdAt,
                relativeTime,
                details: n.message,
              };
            });
            setActivities(mapped);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to load notifications from database:', err);
      } finally {
        setLoading(false);
      }
    }

    loadActivities();
  }, []);

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
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-gray-500 hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} /> Back to Overview
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] md:text-[30px] font-heading font-extrabold text-foreground tracking-tight">
            Activity Log
          </h1>
          <p className="text-[14px] text-gray-500 mt-0.5">
            Audit trail of system events, registrations, and staff actions.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[16px] p-6 border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-4">
        <h3 className="font-bold text-[15px] text-foreground border-b border-gray-100 pb-3">
          Chronological Event Stream {activities.length > 0 && `(${activities.length})`}
        </h3>

        {loading ? (
          <div className="py-8 text-center text-sm text-gray-400">Loading activity stream...</div>
        ) : activities.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400">No events recorded in database yet.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {activities.map((act) => {
              const { icon: Icon, bg } = getActivityIcon(act.type);

              return (
                <div
                  key={act.id}
                  className="py-3.5 flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 mt-0.5 ${bg}`}
                    >
                      <Icon size={16} />
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-foreground">
                        {act.title}
                      </p>
                      <p className="text-[12px] font-mono text-gray-400 mt-0.5">
                        {act.reference} {act.details && `• ${act.details}`}
                      </p>
                    </div>
                  </div>

                  <span className="text-[12px] text-gray-400 shrink-0">
                    {act.relativeTime}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
