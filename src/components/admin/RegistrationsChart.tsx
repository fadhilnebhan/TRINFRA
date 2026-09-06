'use client';

import { useState } from 'react';
import { REGISTRATION_CHART_DATA } from '@/lib/adminData';

export default function RegistrationsChart() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [timeframe, setTimeframe] = useState('7d');

  const maxVal = 35;

  return (
    <div className="bg-white rounded-[16px] p-5 border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] h-full flex flex-col justify-between">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-[16px] font-bold text-foreground">
            Land Registrations
          </h3>
          <p className="text-[12px] text-gray-400">Last 7 Days Activity</p>
        </div>

        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          aria-label="Chart timeframe"
          className="text-[12px] font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 outline-none cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>

      {/* Chart Area */}
      <div className="relative pt-6 pb-2">
        {/* Y Axis Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-gray-400 font-mono">
          <div className="border-b border-gray-100 pb-1 flex justify-between">
            <span>30</span>
          </div>
          <div className="border-b border-gray-100 pb-1 flex justify-between">
            <span>20</span>
          </div>
          <div className="border-b border-gray-100 pb-1 flex justify-between">
            <span>10</span>
          </div>
          <div className="border-b border-gray-200/60 pb-1 flex justify-between">
            <span>0</span>
          </div>
        </div>

        {/* Bars Container */}
        <div className="relative z-10 grid grid-cols-7 gap-3 sm:gap-6 h-[170px] items-end px-4">
          {REGISTRATION_CHART_DATA.map((item, index) => {
            const heightPct = Math.round((item.count / maxVal) * 100);
            const isHovered = hoveredIndex === index;

            return (
              <div
                key={item.date}
                className="flex flex-col items-center h-full justify-end group cursor-pointer relative"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute -top-10 bg-[#0E2115] text-white text-[11px] font-semibold px-2 py-1 rounded-md shadow-md pointer-events-none whitespace-nowrap z-20 animate-in fade-in zoom-in-95 duration-100">
                    {item.count} Registrations
                  </div>
                )}

                {/* Bar */}
                <div
                  className={`w-full max-w-[32px] rounded-t-lg transition-all duration-200 ${
                    isHovered
                      ? 'bg-accent shadow-sm'
                      : 'bg-[#0E2115] hover:bg-[#153421]'
                  }`}
                  style={{ height: `${heightPct}%` }}
                />

                {/* Date label */}
                <span
                  className={`text-[11px] mt-2 font-medium transition-colors ${
                    isHovered ? 'text-primary font-bold' : 'text-gray-400'
                  }`}
                >
                  {item.date}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
