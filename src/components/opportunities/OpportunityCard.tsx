'use client';

import Link from 'next/link';
import { MapPin, ArrowRight, Ruler, Users } from 'lucide-react';
import type { Opportunity } from '@/lib/opportunitiesData';

interface OpportunityCardProps {
  opportunity: Opportunity;
}

const statusColors: Record<string, string> = {
  'Emerging': 'bg-amber-600/80',
  'In Progress': 'bg-emerald-700/80',
  'New Opportunity': 'bg-primary/80',
};

export default function OpportunityCard({ opportunity }: OpportunityCardProps) {
  return (
    <div className="flex flex-col bg-white rounded-[20px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-shadow group">
      {/* Image Area */}
      <div className="h-56 overflow-hidden relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={opportunity.image}
          alt={opportunity.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div
          className={`absolute top-4 left-4 ${statusColors[opportunity.status] || 'bg-black/60'} backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1.5 rounded uppercase tracking-wider`}
        >
          {opportunity.status}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-[22px] font-bold text-foreground mb-1 leading-tight">
          {opportunity.title}
        </h3>
        <div className="flex items-center text-gray-500 text-[14px] mb-4">
          <MapPin size={14} className="mr-1.5 shrink-0" />
          {opportunity.location}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-[11px] text-gray-400 mb-1 uppercase tracking-wider font-semibold flex items-center gap-1">
              <Ruler size={11} />
              Approx. Area
            </div>
            <div className="font-bold text-foreground text-[16px]">
              {opportunity.area} {opportunity.areaUnit}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-gray-400 mb-1 uppercase tracking-wider font-semibold flex items-center gap-1">
              <Users size={11} />
              Participation
            </div>
            <div className="font-bold text-foreground text-[16px]">
              {opportunity.landowners}{' '}
              <span className="text-[12px] font-normal text-gray-500">
                Landowners
              </span>
            </div>
          </div>
        </div>

        <p className="text-[13px] text-gray-500 leading-relaxed mb-4 line-clamp-2">
          {opportunity.shortDescription}
        </p>

        <Link
          href={`/opportunities/${opportunity.id}`}
          className="mt-auto pt-4 border-t border-gray-100 flex items-center text-[14px] font-bold text-accent group/link cursor-pointer hover:text-accent-hover transition-colors"
        >
          View Details
          <ArrowRight
            size={16}
            className="ml-2 group-hover/link:translate-x-1 transition-transform"
          />
        </Link>
      </div>
    </div>
  );
}
