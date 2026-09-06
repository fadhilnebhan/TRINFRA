'use client';

import Link from 'next/link';
import { ArrowRight, Eye } from 'lucide-react';
import { LandownerLead } from '@/lib/adminData';
import StatusBadge from './StatusBadge';

interface RecentRegistrationsTableProps {
  leads: LandownerLead[];
}

export default function RecentRegistrationsTable({
  leads,
}: RecentRegistrationsTableProps) {
  return (
    <div className="bg-white rounded-[16px] p-5 border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-2">
        <div>
          <h3 className="text-[16px] font-bold text-foreground">
            Recent Landowner Registrations
          </h3>
          <p className="text-[12px] text-gray-400">
            Latest submissions requiring operational review
          </p>
        </div>
        <Link
          href="/admin/landowners"
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
              <th className="py-2.5 px-3">Name</th>
              <th className="py-2.5 px-3">Location</th>
              <th className="py-2.5 px-3">Area</th>
              <th className="py-2.5 px-3">Submitted</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-[13px]">
            {leads.slice(0, 5).map((lead) => (
              <tr
                key={lead.id}
                className="hover:bg-gray-50/70 transition-colors group"
              >
                <td className="py-3 px-3 font-mono font-semibold text-foreground text-[12px]">
                  <Link
                    href={`/admin/landowners/${lead.id}`}
                    className="hover:text-primary transition-colors"
                  >
                    {lead.referenceNumber}
                  </Link>
                </td>
                <td className="py-3 px-3 font-medium text-foreground">
                  <Link
                    href={`/admin/landowners/${lead.id}`}
                    className="hover:underline"
                  >
                    {lead.fullName}
                  </Link>
                </td>
                <td className="py-3 px-3 text-gray-600">{lead.district}</td>
                <td className="py-3 px-3 font-medium text-foreground">
                  {lead.areaDisplay}
                </td>
                <td className="py-3 px-3 text-gray-400 text-[12px]">
                  {lead.submittedDate}
                </td>
                <td className="py-3 px-3">
                  <StatusBadge status={lead.status} size="sm" />
                </td>
                <td className="py-3 px-3 text-right">
                  <Link
                    href={`/admin/landowners/${lead.id}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-gray-200 text-gray-700 text-[11px] font-semibold hover:bg-gray-50 hover:text-primary transition-colors shadow-2xs"
                  >
                    <Eye size={12} />
                    View
                  </Link>
                </td>
              </tr>
            ))}

            {leads.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-400">
                  No registrations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
