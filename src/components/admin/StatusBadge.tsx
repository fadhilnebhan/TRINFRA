'use client';

import { LandownerStatus } from '@/lib/adminData';

interface StatusBadgeProps {
  status: LandownerStatus | string;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  let badgeStyle = 'bg-gray-100 text-gray-700 border-gray-200';
  let dotStyle = 'bg-gray-400';

  switch (status) {
    case 'New':
      badgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200/80';
      dotStyle = 'bg-emerald-500';
      break;
    case 'Verification Pending':
      badgeStyle = 'bg-amber-50 text-amber-800 border-amber-200/80';
      dotStyle = 'bg-amber-500';
      break;
    case 'Verified':
      badgeStyle = 'bg-[#0E2115]/10 text-primary border-[#0E2115]/20 font-semibold';
      dotStyle = 'bg-primary';
      break;
    case 'Needs Clarification':
      badgeStyle = 'bg-rose-50 text-rose-700 border-rose-200/80';
      dotStyle = 'bg-rose-500';
      break;
    case 'Rejected':
      badgeStyle = 'bg-red-50 text-red-700 border-red-200/80';
      dotStyle = 'bg-red-500';
      break;
  }

  const isSmall = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium select-none tracking-tight whitespace-nowrap ${badgeStyle} ${
        isSmall ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-[12px]'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotStyle}`} />
      <span>{status}</span>
    </span>
  );
}
