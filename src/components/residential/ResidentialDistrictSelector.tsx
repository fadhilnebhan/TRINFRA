'use client';

import React from 'react';
import type { DistrictSummary } from '@/lib/server/residential';

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
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3.5">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">
            Kerala Districts
          </h2>
          <p className="text-xs text-gray-400">
            Select a district to explore available verified residential homes
          </p>
        </div>
        <button
          onClick={() => onSelectDistrict('ALL')}
          className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
            selectedDistrict === 'ALL'
              ? 'bg-primary text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All Kerala ({totalAllCount})
        </button>
      </div>

      {/* 14 Districts Horizontal Scrolling Grid */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200">
        {districts.map((item) => {
          const isSelected = selectedDistrict.toLowerCase() === item.district.toLowerCase();
          const hasListings = item.count > 0;

          return (
            <button
              key={item.district}
              onClick={() => onSelectDistrict(item.district)}
              className={`flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all duration-200 ${
                isSelected
                  ? 'bg-primary text-white border-primary shadow-sm ring-2 ring-primary/20'
                  : hasListings
                  ? 'bg-white text-gray-800 border-gray-200 hover:border-primary/50 hover:bg-gray-50/80 shadow-xs'
                  : 'bg-gray-50/70 text-gray-400 border-gray-100 hover:border-gray-200'
              }`}
            >
              <span>{item.district}</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : hasListings
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
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
  );
}
