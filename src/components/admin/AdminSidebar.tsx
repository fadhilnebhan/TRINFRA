'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Building2,
  Compass,
  ShieldCheck,
  FileText,
  Activity,
  Settings,
  X,
  ExternalLink,
  LogOut,
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const NAV_ITEMS = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Landowner Leads', href: '/admin/landowners', icon: Users },
  { label: 'Developer Enquiries', href: '/admin/enquiries', icon: Building2 },
  { label: 'Opportunities', href: '/admin/opportunities', icon: Compass },
  { label: 'Verification', href: '/admin/verification', icon: ShieldCheck },
  { label: 'Documents', href: '/admin/documents', icon: FileText },
  { label: 'Activity', href: '/admin/activity', icon: Activity },
];

export default function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const isCurrentActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-[260px] bg-[#0A1810] border-r border-[#152E1D] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Branding Section */}
        <div>
          <div className="h-[72px] px-6 flex items-center justify-between border-b border-[#163321]/60">
            <Link
              href="/admin"
              className="flex items-center gap-2.5 group"
              onClick={onClose}
            >
              {/* Geometric Trinfra Logo */}
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-[#8A6A32] flex items-center justify-center shadow-md">
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 text-[#0A1810]"
                  fill="currentColor"
                >
                  <polygon points="12,2 22,20 2,20" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-extrabold text-[17px] tracking-wider text-white">
                  TRINFRA
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-accent/90 -mt-1 font-semibold">
                  Operations
                </span>
              </div>
            </Link>

            {/* Mobile close button */}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close Sidebar"
                className="lg:hidden p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5" aria-label="Admin Navigation">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = isCurrentActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-200 select-none ${
                    isActive
                      ? 'bg-[#153421] text-white shadow-sm font-semibold border-l-3 border-accent pl-3'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon
                    size={18}
                    className={`shrink-0 ${
                      isActive ? 'text-accent' : 'text-white/60'
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="p-4 space-y-3">
          {/* Brand Slogan Card */}
          <div className="relative rounded-xl overflow-hidden p-4 border border-[#1B3E27] bg-[#0E2115]/80 shadow-inner group">
            <div
              className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-luminosity"
              style={{ backgroundImage: 'url("/images/rolling_hills.jpeg")' }}
            />
            <div className="relative z-10">
              <p className="text-[12px] font-semibold text-white/90 leading-tight">
                Land Together,
              </p>
              <p className="text-[12px] font-semibold text-accent leading-tight mt-0.5">
                Build a Better Tomorrow.
              </p>
              <p className="text-[10px] text-white/50 mt-1">
                Internal Operations Portal
              </p>
            </div>
          </div>

          {/* Settings & External Link */}
          <div className="pt-2 border-t border-[#163321]/60 space-y-1">
            <Link
              href="/admin/settings"
              onClick={onClose}
              className={`flex items-center gap-3 px-3.5 py-2 rounded-lg text-[13px] transition-colors ${
                pathname === '/admin/settings'
                  ? 'bg-[#153421] text-white font-medium'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Settings size={16} />
              <span>Settings</span>
            </Link>

            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between px-3.5 py-2 rounded-lg text-[13px] text-white/50 hover:text-accent hover:bg-white/5 transition-colors"
            >
              <span className="flex items-center gap-3">
                <ExternalLink size={16} />
                <span>Public Site</span>
              </span>
              <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/60">
                Live
              </span>
            </Link>

            <button
              onClick={async () => {
                try {
                  await fetch('/api/auth/logout', { method: 'POST' });
                } catch {}
                window.location.href = '/admin/login';
              }}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-[13px] text-red-300 hover:text-red-200 hover:bg-red-500/10 transition-colors cursor-pointer text-left"
            >
              <span className="flex items-center gap-3">
                <LogOut size={16} />
                <span>Sign Out</span>
              </span>
              <span className="text-[10px] bg-accent/20 text-accent px-1.5 py-0.5 rounded font-bold">
                Demo
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
