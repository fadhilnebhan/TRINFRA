'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { RecentEnquiryPreview } from '@/lib/adminData';

interface RecentEnquiriesTableProps {
  enquiries: RecentEnquiryPreview[];
}

export default function RecentEnquiriesTable({
  enquiries,
}: RecentEnquiriesTableProps) {
  return (
    <div className="bg-white rounded-[16px] p-5 border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-2">
        <div>
          <h3 className="text-[16px] font-bold text-foreground">
            Recent Developer Enquiries
          </h3>
          <p className="text-[12px] text-gray-400">
            Institutional interest from developers & investors
          </p>
        </div>
        <Link
          href="/admin/enquiries"
          className="text-[12px] font-semibold text-accent hover:text-accent-hover flex items-center gap-1 transition-colors"
        >
          View All <ArrowRight size={13} />
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              <th className="py-2.5 px-3">Reference</th>
              <th className="py-2.5 px-3">Company</th>
              <th className="py-2.5 px-3">Opportunity</th>
              <th className="py-2.5 px-3">Role</th>
              <th className="py-2.5 px-3 text-right">Submitted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-[13px]">
            {enquiries.map((enq) => (
              <tr
                key={enq.reference}
                className="hover:bg-gray-50/70 transition-colors"
              >
                <td className="py-3 px-3 font-mono font-semibold text-foreground text-[12px]">
                  {enq.reference}
                </td>
                <td className="py-3 px-3 font-medium text-foreground">
                  {enq.company}
                </td>
                <td className="py-3 px-3 text-gray-600">
                  {enq.opportunity}
                </td>
                <td className="py-3 px-3">
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
                <td className="py-3 px-3 text-right text-gray-400 text-[12px]">
                  {enq.submitted}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
