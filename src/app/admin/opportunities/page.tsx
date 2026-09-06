'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { OPPORTUNITIES } from '@/lib/opportunitiesData';

export default function AdminOpportunitiesPage() {
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
            Opportunities Management
          </h1>
          <p className="text-[14px] text-gray-500 mt-0.5">
            Manage land-pooling opportunities and institutional development clusters.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[16px] border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-[15px] text-foreground">
            Current Opportunities ({OPPORTUNITIES.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-4">Opportunity</th>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Consolidated Area</th>
                <th className="py-3 px-4">Landowners</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[13px]">
              {OPPORTUNITIES.map((opp) => (
                <tr key={opp.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-foreground">
                    {opp.title}
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">
                    {opp.district}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-foreground">
                    {opp.area} {opp.areaUnit}
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">
                    {opp.landowners} Landowners
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-medium">
                      {opp.status}
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
