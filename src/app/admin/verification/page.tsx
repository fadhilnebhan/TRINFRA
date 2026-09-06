'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Clock, ShieldAlert } from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';

interface VerificationLead {
  id: string;
  referenceNumber: string;
  fullName: string;
  district: string;
  approximateArea: number;
  areaUnit?: string;
  verificationStatus: string;
  createdAt: string;
  documents?: unknown[];
}

export default function AdminVerificationPage() {
  const [leads, setLeads] = useState<VerificationLead[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPendingLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/landowners');
      if (res.ok) {
        const data = await res.json();
        const allLandowners: VerificationLead[] = data.landowners || [];
        const pending = allLandowners.filter(
          (l) =>
            l.verificationStatus === 'VERIFICATION_PENDING' ||
            l.verificationStatus === 'NEEDS_CLARIFICATION' ||
            l.verificationStatus === 'NEW'
        );
        setLeads(pending);
      }
    } catch (err) {
      console.error('Error fetching verification queue:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPendingLeads();
  }, [loadPendingLeads]);

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
            Verification Queue
          </h1>
          <p className="text-[14px] text-gray-500 mt-0.5">
            Legal, title deed, and revenue due diligence verification pipeline.
          </p>
        </div>

        <button
          type="button"
          onClick={loadPendingLeads}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:text-foreground hover:border-gray-300 text-[13px] font-semibold shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Queue</span>
        </button>
      </div>

      <div className="bg-white rounded-[16px] border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-[15px] text-foreground flex items-center gap-2">
            <Clock size={16} className="text-amber-600" />
            <span>Awaiting Verification Review ({leads.length})</span>
          </h3>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-400 text-[13px]">
            <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-primary" />
            Loading verification queue...
          </div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <ShieldAlert size={28} className="mx-auto mb-2 text-gray-300" />
            <p className="font-semibold text-foreground">No items in verification queue</p>
            <p className="text-[12px] text-gray-400 mt-0.5">
              All registered landowners have been verified or addressed.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/60 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-[13px] text-foreground">
                      {lead.referenceNumber}
                    </span>
                    <StatusBadge
                      status={
                        lead.verificationStatus === 'VERIFIED'
                          ? 'Verified'
                          : lead.verificationStatus === 'VERIFICATION_PENDING'
                          ? 'Verification Pending'
                          : lead.verificationStatus === 'NEEDS_CLARIFICATION'
                          ? 'Needs Clarification'
                          : lead.verificationStatus === 'REJECTED'
                          ? 'Rejected'
                          : 'New'
                      }
                      size="sm"
                    />
                  </div>
                  <p className="font-semibold text-foreground text-[14px]">
                    {lead.fullName} • {lead.district} ({lead.approximateArea} {lead.areaUnit || 'Acres'})
                  </p>
                  <p className="text-[12px] text-gray-400 mt-0.5">
                    Submitted on{' '}
                    {lead.createdAt
                      ? new Date(lead.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Recently'}
                    {' '}• {(lead.documents || []).length} documents attached
                  </p>
                </div>

                <Link
                  href={`/admin/landowners/${lead.id}`}
                  className="px-3.5 py-1.5 bg-primary text-white font-bold text-[12px] rounded-lg hover:bg-primary-dark transition-colors self-start sm:self-center cursor-pointer"
                >
                  Review Verification
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
