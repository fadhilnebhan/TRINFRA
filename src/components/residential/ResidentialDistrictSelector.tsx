'use client';

import React from 'react';
import type { DistrictSummary } from '@/lib/server/residential';
import { MapPin } from 'lucide-react';

interface ResidentialDistrictSelectorProps {
  districts: DistrictSummary[];
  selectedDistrict: string;
  onSelectDistrict: (district: string) => void;
  totalAllCount: number;
}

export default function ResidentialDistrictSelector({
  districts,
  selectedDistrict,
  onSelectDistrict,
  totalAllCount,
}: ResidentialDistrictSelectorProps) {
  const isAllSelected = selectedDistrict === 'ALL';

  return (
    <div className="w-full">
      {/* Header bar with title and quick 'All' switcher */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <MapPin size={13} />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-heading font-bold text-gray-900 tracking-tight">
              Kerala Districts
            </h3>
          </div>
        </div>

        {/* All Kerala Quick Badge */}
        <button
          onClick={() => onSelectDistrict('ALL')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 shrink-0 ${
            isAllSelected
              ? 'bg-primary text-white shadow-xs ring-2 ring-accent/40'
              : 'bg-gray-100/90 text-gray-600 hover:bg-gray-200/80 hover:text-gray-900'
          }`}
          aria-pressed={isAllSelected}
        >
          <span>All Kerala</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              isAllSelected ? 'bg-accent text-white' : 'bg-white text-gray-500 shadow-2xs'
            }`}
          >
            {totalAllCount}
          </span>
        </button>
      </div>

      {/* Touch-optimized horizontal scrolling pill strip */}
      <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
        <div
          className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          role="tablist"
          aria-label="Filter properties by Kerala district"
        >
          {districts.map((item) => {
            const isSelected = selectedDistrict.toLowerCase() === item.district.toLowerCase();
            const hasListings = item.count > 0;

            return (
              <button
                key={item.district}
                onClick={() => onSelectDistrict(item.district)}
                role="tab"
                aria-selected={isSelected}
                className={`flex-shrink-0 flex items-center gap-2 px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-medium border transition-all duration-200 select-none ${
                  isSelected
                    ? 'bg-primary text-white border-primary shadow-sm ring-2 ring-accent/50 scale-[1.02]'
                    : hasListings
                    ? 'bg-white text-gray-800 border-gray-200/90 hover:border-primary/40 hover:bg-gray-50/90 shadow-2xs'
                    : 'bg-gray-50/60 text-gray-400 border-gray-100 hover:border-gray-200 hover:text-gray-600'
                }`}
              >
                <span className="font-semibold">{item.district}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold transition-colors ${
                    isSelected
                      ? 'bg-accent text-white'
                      : hasListings
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
