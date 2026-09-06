'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminMobileNav from '@/components/admin/AdminMobileNav';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-foreground font-sans flex flex-col">
      {/* Admin Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Wrapper shifted on desktop */}
      <div className="lg:pl-[260px] flex flex-col flex-1 min-h-screen transition-all duration-300">
        <AdminHeader onMenuToggle={() => setSidebarOpen((prev) => !prev)} />

        <main className="flex-1 p-4 md:p-8 pb-24 lg:pb-12 max-w-[1600px] w-full mx-auto">
          {children}
        </main>

        <AdminMobileNav onMoreClick={() => setSidebarOpen(true)} />
      </div>
    </div>
  );
}
