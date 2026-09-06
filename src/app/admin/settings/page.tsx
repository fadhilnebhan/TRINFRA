'use client';

import Link from 'next/link';
import { ArrowLeft, Shield, User } from 'lucide-react';

export default function AdminSettingsPage() {
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

      <div>
        <h1 className="text-[26px] md:text-[30px] font-heading font-extrabold text-foreground tracking-tight">
          Admin Settings & Preferences
        </h1>
        <p className="text-[14px] text-gray-500 mt-0.5">
          Configure operations team access, notification routing, and workflow defaults.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-[16px] p-6 border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
            <div className="w-9 h-9 rounded-xl bg-[#0E2115]/10 text-primary flex items-center justify-center">
              <User size={18} />
            </div>
            <div>
              <h3 className="font-bold text-[15px] text-foreground">
                Staff Profile
              </h3>
              <p className="text-[12px] text-gray-400">Current session details</p>
            </div>
          </div>

          <div className="space-y-3 text-[13px]">
            <div>
              <span className="text-gray-400 text-[11px] font-semibold uppercase block">
                User Role
              </span>
              <p className="font-bold text-foreground">Operations Lead</p>
            </div>
            <div>
              <span className="text-gray-400 text-[11px] font-semibold uppercase block">
                Email
              </span>
              <p className="font-medium text-foreground">operations@trinfra.in</p>
            </div>
            <div>
              <span className="text-gray-400 text-[11px] font-semibold uppercase block">
                Access Level
              </span>
              <span className="inline-block mt-0.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[11px] font-semibold">
                Full Operational Access
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[16px] p-6 border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
            <div className="w-9 h-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
              <Shield size={18} />
            </div>
            <div>
              <h3 className="font-bold text-[15px] text-foreground">
                Security & Data Integrity
              </h3>
              <p className="text-[12px] text-gray-400">Internal authorization</p>
            </div>
          </div>

          <div className="space-y-2 text-[13px] text-gray-600">
            <p>
              • Landowner title documents and personal identification are private and protected.
            </p>
            <p>
              • Public API exposure is disabled.
            </p>
            <p>
              • Data is synchronized with real user registrations through the local service abstraction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
