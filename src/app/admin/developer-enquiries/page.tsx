'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { SEED_DEVELOPER_ENQUIRIES, RecentEnquiryPreview } from '@/lib/adminData';
import { getEnquiries } from '@/lib/enquirySubmissions';
import { getOpportunityById } from '@/lib/opportunitiesData';

export default function DeveloperEnquiriesPage() {
  const [allEnquiries, setAllEnquiries] = useState<RecentEnquiryPreview[]>(SEED_DEVELOPER_ENQUIRIES);

  useEffect(() => {
    const live = getEnquiries();
    if (live && live.length > 0) {
      const formatted: RecentEnquiryPreview[] = live.map((e) => {
        const opp = getOpportunityById(e.opportunityId);
        const oppTitle = e.opportunityTitle || opp?.title || e.opportunityId;
        const subDate = new Date(e.submittedAt);
        const dateStr = !isNaN(subDate.getTime())
          ? subDate.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : 'Just now';

        return {
          reference: e.referenceNumber,
          company: e.company || e.name,
          opportunity: oppTitle,
          role: e.role === 'investor' ? 'Investor' : 'Developer',
          submitted: dateStr,
        };
      });

      // Avoid duplicate references if already in list
      const combined = [
        ...formatted,
        ...SEED_DEVELOPER_ENQUIRIES.filter(
          (s) => !formatted.some((f) => f.reference === s.reference)
        ),
      ];
      setAllEnquiries(combined);
    }
  }, []);
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
            Developer & Investor Enquiries
          </h1>
          <p className="text-[14px] text-gray-500 mt-0.5">
            Manage institutional expressions of interest from developers and investors.
          </p>
        </div>

        <span className="inline-flex items-center px-3 py-1 rounded-full bg-accent/10 text-accent font-semibold text-[12px] self-start sm:self-auto">
          Phase 2 Operational Module
        </span>
      </div>

      <div className="bg-white rounded-[16px] border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-[15px] text-foreground">
            All Received Enquiries ({allEnquiries.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Opportunity</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Submitted</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[13px]">
              {allEnquiries.map((enq) => (
                <tr key={enq.reference} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-semibold text-foreground text-[12px]">
                    {enq.reference}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-foreground">
                    {enq.company}
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">
                    {enq.opportunity}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        enq.role === 'Developer'
                          ? 'bg-[#0E2115]/10 text-primary'
                          : 'bg-accent/10 text-[#8A6A32]'
                      }`}
                    >
                      {enq.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-500 text-[12px]">
                    {enq.submitted}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-medium">
                      Under Review
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
