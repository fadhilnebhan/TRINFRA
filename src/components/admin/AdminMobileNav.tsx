'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Building2, MoreHorizontal } from 'lucide-react';

interface AdminMobileNavProps {
  onMoreClick: () => void;
}

export default function AdminMobileNav({ onMoreClick }: AdminMobileNavProps) {
  const pathname = usePathname();

  const isOverview = pathname === '/admin';
  const isLeads = pathname.startsWith('/admin/landowners');
  const isEnquiries = pathname.startsWith('/admin/enquiries');

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-3 py-2 flex items-center justify-around shadow-[0_-4px_12px_rgba(0,0,0,0.05)]"
      aria-label="Mobile Admin Navigation"
    >
      <Link
        href="/admin"
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors ${
          isOverview ? 'text-primary font-bold' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        <LayoutDashboard size={20} className={isOverview ? 'text-primary' : 'text-gray-400'} />
        <span className="text-[10px] tracking-tight">Overview</span>
      </Link>

      <Link
        href="/admin/landowners"
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors ${
          isLeads ? 'text-primary font-bold' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        <Users size={20} className={isLeads ? 'text-primary' : 'text-gray-400'} />
        <span className="text-[10px] tracking-tight">Leads</span>
      </Link>

      <Link
        href="/admin/enquiries"
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors ${
          isEnquiries ? 'text-primary font-bold' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        <Building2 size={20} className={isEnquiries ? 'text-primary' : 'text-gray-400'} />
        <span className="text-[10px] tracking-tight">Enquiries</span>
      </Link>

      <button
        type="button"
        onClick={onMoreClick}
        className="flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
      >
        <MoreHorizontal size={20} />
        <span className="text-[10px] tracking-tight">More</span>
      </button>
    </nav>
  );
}
