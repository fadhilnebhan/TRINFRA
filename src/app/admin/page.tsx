'use client';

import { useState, useEffect } from 'react';
import { Users, FileText, Clock, Building2 } from 'lucide-react';
import {
  getAllLandowners,
  getAdminDashboardStats,
  getActivities,
  SEED_DEVELOPER_ENQUIRIES,
  LandownerLead,
  ActivityItem,
  RecentEnquiryPreview,
} from '@/lib/adminData';
import { ApiLandowner, ApiActivity } from '@/types/backend';
import KpiCard from '@/components/admin/KpiCard';
import RegistrationsChart from '@/components/admin/RegistrationsChart';
import RecentActivityList from '@/components/admin/RecentActivityList';
import RecentRegistrationsTable from '@/components/admin/RecentRegistrationsTable';
import RecentEnquiriesTable from '@/components/admin/RecentEnquiriesTable';

export default function AdminOverviewPage() {
  const [leads, setLeads] = useState<LandownerLead[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [stats, setStats] = useState<{
    totalLandowners?: number;
    totalLandownersDisplay: string;
    newRegistrations: number;
    verificationPending: number;
    developerEnquiries: number;
  }>({
    totalLandowners: 5,
    totalLandownersDisplay: '5',
    newRegistrations: 1,
    verificationPending: 1,
    developerEnquiries: 3,
  });

  const [enquiries, setEnquiries] = useState<RecentEnquiryPreview[]>(SEED_DEVELOPER_ENQUIRIES);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/api/admin/dashboard');
        if (res.ok) {
          const data = await res.json();
          if (data.stats) {
            setStats(data.stats);
          }
          if (data.recentRegistrations && data.recentRegistrations.length > 0) {
            const mappedLeads: LandownerLead[] = data.recentRegistrations.map((lo: ApiLandowner) => ({
              id: lo.id,
              referenceNumber: lo.referenceNumber,
              fullName: lo.fullName,
              phone: lo.phone,
              email: lo.email,
              landownerType: lo.ownerType || 'Individual',
              preferredCommunication: lo.preferredCommunication || 'WhatsApp',
              district: lo.district,
              localBody: lo.localBody,
              locality: lo.locality,
              location: `${lo.locality}, ${lo.district}`,
              approximateArea: Number(lo.approximateArea) || 0,
              areaDisplay: `${lo.approximateArea || 0} ${lo.areaUnit || 'Acres'}`,
              ownershipStatus: lo.ownershipStatus || 'Self Owned',
              poolingInterest: lo.poolingInterest || 'Joint Development',
              status:
                lo.verificationStatus === 'VERIFIED'
                  ? 'Verified'
                  : lo.verificationStatus === 'VERIFICATION_PENDING'
                  ? 'Verification Pending'
                  : lo.verificationStatus === 'NEEDS_CLARIFICATION'
                  ? 'Needs Clarification'
                  : lo.verificationStatus === 'REJECTED'
                  ? 'Rejected'
                  : 'New',
              submittedAt: lo.createdAt ? lo.createdAt.split('T')[0] : '2026-08-01',
              submittedDate: lo.createdAt ? lo.createdAt.split('T')[0] : '2026-08-01',
              submittedTimestamp: lo.createdAt ? new Date(lo.createdAt).getTime() : Date.now(),
              updatedAt: lo.updatedAt ? lo.updatedAt.split('T')[0] : '2026-08-01',
              documents: [],
              notes: [],
              timeline: [],
            }));
            setLeads(mappedLeads);
          }
          if (data.recentEnquiries && data.recentEnquiries.length > 0) {
            setEnquiries(data.recentEnquiries);
          }
          if (data.activities && data.activities.length > 0) {
            const mappedActs: ActivityItem[] = data.activities.map((a: ApiActivity) => ({
              id: a.id,
              type: a.type || 'registration_received',
              title: a.title,
              reference: a.reference || '',
              timestamp: a.createdAt,
              relativeTime: 'Recent',
              details: a.message,
            }));
            setActivities(mappedActs);
          }
          return;
        }
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
      }

      // Fallback
      setLeads(getAllLandowners());
      setActivities(getActivities());
      const loadedStats = getAdminDashboardStats();
      setStats({
        totalLandownersDisplay: loadedStats.totalLandownersDisplay,
        newRegistrations: loadedStats.newRegistrations,
        verificationPending: loadedStats.verificationPending,
        developerEnquiries: loadedStats.developerEnquiries,
      });
    }

    loadData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Title & Slogan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-[26px] md:text-[30px] font-heading font-extrabold text-foreground tracking-tight">
            Overview
          </h1>
          <p className="text-[14px] text-gray-500 mt-0.5">
            Monitor land registrations, enquiries and verification activity.
          </p>
        </div>

        <div className="hidden sm:block text-right">
          <p className="text-[12px] font-semibold text-accent tracking-wide uppercase">
            Building stronger
          </p>
          <p className="text-[12px] text-gray-500 font-medium">
            communities together.
          </p>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <KpiCard
          label="Total Landowners"
          value={stats.totalLandowners !== undefined ? stats.totalLandowners : stats.totalLandownersDisplay}
          subtext="Live registered count"
          trend="up"
          icon={Users}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-700"
        />

        <KpiCard
          label="New Registrations"
          value={stats.newRegistrations}
          subtext="+4 this week"
          trend="up"
          icon={FileText}
          iconBgColor="bg-amber-50"
          iconColor="text-amber-700"
        />

        <KpiCard
          label="Verification Pending"
          value={stats.verificationPending}
          subtext="-2 from last week"
          trend="down"
          icon={Clock}
          iconBgColor="bg-orange-50"
          iconColor="text-orange-700"
        />

        <KpiCard
          label="Developer Enquiries"
          value={stats.developerEnquiries}
          subtext="+6 this month"
          trend="up"
          icon={Building2}
          iconBgColor="bg-teal-50"
          iconColor="text-teal-700"
        />
      </div>

      {/* Middle Row: Chart (2 cols) & Activity Feed (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RegistrationsChart />
        </div>
        <div className="lg:col-span-1">
          <RecentActivityList activities={activities} />
        </div>
      </div>

      {/* Bottom Row: Recent Landowners & Recent Enquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentRegistrationsTable leads={leads} />
        <RecentEnquiriesTable enquiries={enquiries} />
      </div>
    </div>
  );
}
