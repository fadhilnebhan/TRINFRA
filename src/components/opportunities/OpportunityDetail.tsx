'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Phone,
  Ruler,
  Users,
  TrendingUp,
  Sprout,
  ShieldCheck,
  Lock,
  Handshake,
  Compass,
  Check,
  Layers,
  FileCheck,
  Headphones,
} from 'lucide-react';
import {
  Opportunity,
} from '@/lib/opportunitiesData';
import { useLiveDataSync } from '@/hooks/useLiveDataSync';
import OpportunityCard from './OpportunityCard';
import InterestModal from './InterestModal';

interface OpportunityDetailProps {
  opportunityId: string;
  initialOpportunity?: Opportunity | null;
  relatedOpportunities?: Opportunity[];
  projectId?: string;
}

export default function OpportunityDetail({
  opportunityId,
  initialOpportunity = null,
  relatedOpportunities = [],
  projectId,
}: OpportunityDetailProps) {
  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);
  const [opportunity, setOpportunity] = useState<Opportunity | null>(initialOpportunity);
  const [similarOpportunities, setSimilarOpportunities] = useState<Opportunity[]>(relatedOpportunities);
  const [loading, setLoading] = useState(!initialOpportunity);

  // Live synchronization for main opportunity & project validity
  useLiveDataSync<Opportunity | null>({
    initialData: initialOpportunity,
    fetcher: async (signal) => {
      // If accessed via a project page, verify the project still exists in DB
      if (projectId) {
        const projRes = await fetch(`/api/projects/${encodeURIComponent(projectId)}`, {
          cache: 'no-store',
          signal,
        });
        if (projRes.status === 404) {
          return null;
        }
      }

      const res = await fetch(`/api/opportunities/${encodeURIComponent(opportunityId)}`, {
        cache: 'no-store',
        signal,
      });
      if (res.status === 404) {
        return null;
      }
      if (res.ok) {
        const data = await res.json();
        return data.opportunity ?? null;
      }
      return null;
    },
    onData: (freshOpp) => {
      if (freshOpp === null) {
        setOpportunity(null);
      } else {
        setOpportunity(freshOpp);
      }
      setLoading(false);
    },
    onNotFound: () => {
      setOpportunity(null);
      setLoading(false);
    },
    intervalMs: 10000,
  });

  // Live synchronization for similar opportunities recommendations
  useLiveDataSync<Opportunity[]>({
    initialData: relatedOpportunities.length > 0 ? relatedOpportunities : null,
    fetcher: async (signal) => {
      const res = await fetch('/api/opportunities', {
        cache: 'no-store',
        signal,
      });
      if (res.ok) {
        const d = await res.json();
        if (Array.isArray(d.opportunities)) {
          return d.opportunities
            .filter((o: Opportunity) => o.id !== opportunityId)
            .slice(0, 3);
        }
      }
      return null;
    },
    onData: (freshSimilar) => {
      setSimilarOpportunities(freshSimilar);
    },
    intervalMs: 12000,
  });

  if (loading) {
    return (
      <div className="py-28 text-center max-w-[1360px] mx-auto px-6">
        <div className="w-10 h-10 border-3 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-[15px] font-medium">Loading opportunity details...</p>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="py-24 text-center max-w-[1360px] mx-auto px-6">
        <h2 className="text-[28px] font-heading font-bold text-foreground mb-4">
          {projectId ? 'Project Not Found' : 'Opportunity Not Found'}
        </h2>
        <p className="text-gray-500 mb-6">
          {projectId
            ? 'The requested project could not be located or has been removed.'
            : 'The requested land-pooling opportunity could not be located or has been removed.'}
        </p>
        <Link
          href={projectId ? '/projects' : '/opportunities'}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-bold text-[14px]"
        >
          <ArrowLeft size={16} /> Back to {projectId ? 'Projects' : 'Opportunities'}
        </Link>
      </div>
    );
  }


  return (
    <div className="bg-background text-foreground font-sans">
      {/* ====== 1. TOP BACK LINK ====== */}
      <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16 pt-8 pb-4">
        <Link
          href="/opportunities"
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-gray-500 hover:text-primary transition-colors group"
        >
          <ArrowLeft
            size={15}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span>Back to Opportunities</span>
        </Link>
      </div>

      {/* ====== 2. PAGE HERO / PROJECT HEADER ====== */}
      <section className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Hero Column */}
          <div className="lg:col-span-6 space-y-5">
            {/* Status Badge */}
            <div className="inline-block">
              <span className="bg-[#0E2115] text-accent font-bold text-[11px] uppercase tracking-wider px-3.5 py-1.5 rounded-md inline-flex items-center gap-1.5 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                {opportunity.status}
              </span>
            </div>

            {/* Title & Location */}
            <div>
              <h1 className="text-[36px] sm:text-[44px] md:text-[50px] font-heading font-extrabold text-foreground leading-[1.08] tracking-tight mb-2">
                {opportunity.title}
              </h1>
              <p className="text-[15px] font-medium text-gray-500 flex items-center gap-1.5">
                <MapPin size={16} className="text-accent shrink-0" />
                <span>{opportunity.location}</span>
              </p>
            </div>

            {/* Description */}
            <p className="text-[15px] text-gray-600 leading-relaxed max-w-xl">
              A structured land-pooling opportunity bringing landowners,
              developers and professional partners together for coordinated,
              sustainable and high-impact development in the {opportunity.title}{' '}
              region.
            </p>

            {/* Primary CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsInterestModalOpen(true)}
                className="bg-primary hover:bg-primary-dark text-white px-7 py-3.5 rounded-lg font-bold text-[14px] flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer group"
              >
                <span>Express Interest</span>
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>

              <Link
                href={`/opportunities/${opportunity.id}/enquiry`}
                className="bg-white hover:bg-gray-50 border border-gray-300 text-foreground px-6 py-3.5 rounded-lg font-semibold text-[14px] flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Phone size={15} className="text-gray-400" />
                <span>Enquire About Opportunity</span>
              </Link>
            </div>
          </div>

          {/* Right Hero Image Card */}
          <div className="lg:col-span-6">
            <div className="relative rounded-[24px] overflow-hidden shadow-sm border border-gray-100 h-[300px] sm:h-[360px] md:h-[400px] w-full group">
              {/* Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={opportunity.image}
                alt={opportunity.title}
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
              />

              {/* Gradient Scrim for subtle script overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30 pointer-events-none" />

              {/* Top Right Script Text Overlay matching mockup */}
              <div className="absolute top-4 right-5 text-right pointer-events-none select-none">
                <p className="font-serif italic text-white/95 text-[15px] md:text-[17px] drop-shadow-md tracking-wide">
                  Land today.
                </p>
                <p className="font-serif italic text-white/95 text-[14px] md:text-[16px] drop-shadow-md tracking-wide -mt-0.5">
                  Greater communities tomorrow.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== 3. FLOATING PROJECT SUMMARY BAR ====== */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16 my-6 sm:my-8">
        <div className="bg-white rounded-[18px] border border-gray-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-4 sm:p-5 md:p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6 md:gap-4 md:divide-x md:divide-gray-100">
            {/* Metric 1: Approx Area */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 md:px-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <Ruler size={17} className="text-accent" />
              </div>
              <div>
                <div className="text-[18px] sm:text-[22px] font-heading font-extrabold text-foreground leading-none">
                  {opportunity.area}
                </div>
                <div className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider mt-1 leading-tight">
                  Approx. Area
                  <span className="block font-normal text-gray-500 capitalize">
                    Acres
                  </span>
                </div>
              </div>
            </div>

            {/* Metric 2: Participating Landowners */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 md:px-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <Users size={17} className="text-accent" />
              </div>
              <div>
                <div className="text-[18px] sm:text-[22px] font-heading font-extrabold text-foreground leading-none">
                  {opportunity.landowners}
                </div>
                <div className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider mt-1 leading-tight">
                  Participating
                  <span className="block font-normal text-gray-500 capitalize">
                    Landowners
                  </span>
                </div>
              </div>
            </div>

            {/* Metric 3: Location */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 md:px-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <MapPin size={17} className="text-accent" />
              </div>
              <div className="min-w-0">
                <div className="text-[13px] sm:text-[15px] font-heading font-extrabold text-foreground leading-snug truncate max-w-[120px] sm:max-w-[140px]">
                  {opportunity.location}
                </div>
                <div className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">
                  Location
                </div>
              </div>
            </div>

            {/* Metric 4: Opportunity Status */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 md:px-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <TrendingUp size={17} className="text-accent" />
              </div>
              <div>
                <div className="text-[13px] sm:text-[15px] font-heading font-extrabold text-foreground leading-snug">
                  {opportunity.status}
                </div>
                <div className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">
                  Status
                </div>
              </div>
            </div>

            {/* Metric 5: Development Potential */}
            <div className="col-span-2 md:col-span-1 flex items-center gap-2.5 sm:gap-3.5 md:px-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <Sprout size={17} className="text-accent" />
              </div>
              <div>
                <div className="text-[13px] sm:text-[15px] font-heading font-extrabold text-foreground leading-snug">
                  High
                </div>
                <div className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">
                  Development Potential
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== 4. MAIN CONTENT AREA (2-COLUMN LAYOUT) ====== */}
      <section className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* ================= LEFT MAIN CONTENT (~68%) ================= */}
          <div className="lg:col-span-8 space-y-12">
            {/* Section 1: About This Opportunity */}
            <div>
              <h2 className="text-[22px] md:text-[24px] font-heading font-extrabold text-foreground mb-4 tracking-tight">
                About This Opportunity
              </h2>
              <div className="space-y-4 text-[15px] text-gray-600 leading-relaxed">
                <p>
                  {opportunity.overview ||
                    `${opportunity.title} presents a significant opportunity for planned, sustainable development through a collaborative land-pooling model. The area benefits from strategic connectivity, proximity to key infrastructure, and strong growth potential for residential, commercial, and mixed-use developments.`}
                </p>
                <p>
                  Through Trinfra’s transparent and structured process, landowners,
                  developers and investors can work together to unlock greater value
                  for the land and the community.
                </p>
              </div>
            </div>

            <hr className="border-gray-200/80" />

            {/* Section 2: Opportunity Highlights */}
            <div>
              <h2 className="text-[22px] md:text-[24px] font-heading font-extrabold text-foreground mb-5 tracking-tight">
                Opportunity Highlights
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* Highlight 1 */}
                <div className="bg-white rounded-[16px] p-4.5 border border-gray-200/80 shadow-2xs hover:border-gray-300 transition-all flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#0E2115]/5 text-accent flex items-center justify-center shrink-0">
                    <Compass size={18} />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-foreground">
                      Strategic Location
                    </h3>
                    <p className="text-[12px] text-gray-500 leading-normal mt-0.5">
                      Well connected to key infrastructure and urban hubs.
                    </p>
                  </div>
                </div>

                {/* Highlight 2 */}
                <div className="bg-white rounded-[16px] p-4.5 border border-gray-200/80 shadow-2xs hover:border-gray-300 transition-all flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#0E2115]/5 text-accent flex items-center justify-center shrink-0">
                    <TrendingUp size={18} />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-foreground">
                      Large Development Potential
                    </h3>
                    <p className="text-[12px] text-gray-500 leading-normal mt-0.5">
                      Suitable for residential, commercial and mixed-use development.
                    </p>
                  </div>
                </div>

                {/* Highlight 3 */}
                <div className="bg-white rounded-[16px] p-4.5 border border-gray-200/80 shadow-2xs hover:border-gray-300 transition-all flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#0E2115]/5 text-accent flex items-center justify-center shrink-0">
                    <Layers size={18} />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-foreground">
                      Structured Land Pooling
                    </h3>
                    <p className="text-[12px] text-gray-500 leading-normal mt-0.5">
                      Bring landowners together for greater value.
                    </p>
                  </div>
                </div>

                {/* Highlight 4 */}
                <div className="bg-white rounded-[16px] p-4.5 border border-gray-200/80 shadow-2xs hover:border-gray-300 transition-all flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#0E2115]/5 text-accent flex items-center justify-center shrink-0">
                    <FileCheck size={18} />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-foreground">
                      Verified Land Information
                    </h3>
                    <p className="text-[12px] text-gray-500 leading-normal mt-0.5">
                      Transparent and reliable information.
                    </p>
                  </div>
                </div>

                {/* Highlight 5 */}
                <div className="bg-white rounded-[16px] p-4.5 border border-gray-200/80 shadow-2xs hover:border-gray-300 transition-all flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#0E2115]/5 text-accent flex items-center justify-center shrink-0">
                    <Users size={18} />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-foreground">
                      Professional Support
                    </h3>
                    <p className="text-[12px] text-gray-500 leading-normal mt-0.5">
                      Guidance from a trusted ecosystem of experts.
                    </p>
                  </div>
                </div>

                {/* Highlight 6 */}
                <div className="bg-white rounded-[16px] p-4.5 border border-gray-200/80 shadow-2xs hover:border-gray-300 transition-all flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#0E2115]/5 text-accent flex items-center justify-center shrink-0">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-foreground">
                      Transparent Process
                    </h3>
                    <p className="text-[12px] text-gray-500 leading-normal mt-0.5">
                      Clear communication at every step.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-gray-200/80" />

            {/* Section 3: Project Details Specification Table */}
            <div>
              <h2 className="text-[22px] md:text-[24px] font-heading font-extrabold text-foreground mb-5 tracking-tight">
                Project Details
              </h2>

              <div className="bg-white rounded-[18px] border border-gray-200/80 shadow-2xs p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12 text-[14px]">
                  {/* Left Specs */}
                  <div className="space-y-4 divide-y divide-gray-100">
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-gray-500 font-medium">District</span>
                      <span className="font-bold text-foreground">
                        {opportunity.district}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-3">
                      <span className="text-gray-500 font-medium">Locality</span>
                      <span className="font-bold text-foreground">
                        {opportunity.locality || `${opportunity.title}`}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-3">
                      <span className="text-gray-500 font-medium">
                        Approximate Area
                      </span>
                      <span className="font-bold text-primary">
                        {opportunity.area} Acres
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-3">
                      <span className="text-gray-500 font-medium">
                        Participating Landowners
                      </span>
                      <span className="font-bold text-foreground">
                        {opportunity.landowners}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-3">
                      <span className="text-gray-500 font-medium">
                        Opportunity Status
                      </span>
                      <span className="font-bold text-foreground">
                        {opportunity.status}
                      </span>
                    </div>
                  </div>

                  {/* Right Specs */}
                  <div className="space-y-4 divide-y divide-gray-100">
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-gray-500 font-medium">
                        Development Stage
                      </span>
                      <span className="font-bold text-foreground">
                        Emerging Opportunity
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-3">
                      <span className="text-gray-500 font-medium">Land Type</span>
                      <span className="font-bold text-foreground">
                        Mixed / Agricultural Land
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-3">
                      <span className="text-gray-500 font-medium">
                        Information Status
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <Check size={12} className="stroke-[3]" /> Verified
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-3">
                      <span className="text-gray-500 font-medium">Potential Use</span>
                      <span className="font-bold text-foreground text-right">
                        Residential, Commercial, Mixed-use
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-3">
                      <span className="text-gray-500 font-medium">Last Updated</span>
                      <span className="font-medium text-gray-600">
                        15 Aug 2025
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-gray-200/80" />

            {/* Section 4: How This Opportunity Progresses */}
            <div>
              <h2 className="text-[22px] md:text-[24px] font-heading font-extrabold text-foreground mb-6 tracking-tight">
                How This Opportunity Progresses
              </h2>

              <div className="bg-white rounded-[18px] border border-gray-200/80 shadow-2xs p-6 md:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 relative">
                  {/* Step 1: Register (Completed) */}
                  <div className="flex flex-col items-center text-center space-y-2 relative">
                    <div className="w-11 h-11 rounded-full bg-[#0E2115] text-accent font-bold text-[14px] flex items-center justify-center shadow-xs">
                      01
                    </div>
                    <h3 className="font-bold text-[14px] text-foreground">
                      Register
                    </h3>
                    <p className="text-[12px] text-gray-500 leading-relaxed">
                      Landowners register their land.
                    </p>
                  </div>

                  {/* Step 2: Verify (In Progress) */}
                  <div className="flex flex-col items-center text-center space-y-2 relative">
                    <div className="w-11 h-11 rounded-full bg-accent text-[#0E2115] font-bold text-[14px] flex items-center justify-center shadow-xs ring-4 ring-accent/15">
                      02
                    </div>
                    <h3 className="font-bold text-[14px] text-foreground">
                      Verify
                    </h3>
                    <p className="text-[12px] text-gray-500 leading-relaxed">
                      Information is verified by TRINFRA.
                    </p>
                  </div>

                  {/* Step 3: Cluster (Upcoming) */}
                  <div className="flex flex-col items-center text-center space-y-2 relative">
                    <div className="w-11 h-11 rounded-full border-2 border-gray-200 text-gray-400 font-bold text-[14px] flex items-center justify-center">
                      03
                    </div>
                    <h3 className="font-bold text-[14px] text-gray-500">
                      Cluster
                    </h3>
                    <p className="text-[12px] text-gray-400 leading-relaxed">
                      Land is clustered with nearby parcels.
                    </p>
                  </div>

                  {/* Step 4: Facilitate (Upcoming) */}
                  <div className="flex flex-col items-center text-center space-y-2 relative">
                    <div className="w-11 h-11 rounded-full border-2 border-gray-200 text-gray-400 font-bold text-[14px] flex items-center justify-center">
                      04
                    </div>
                    <h3 className="font-bold text-[14px] text-gray-500">
                      Facilitate
                    </h3>
                    <p className="text-[12px] text-gray-400 leading-relaxed">
                      TRINFRA works with partners to enable development.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT STICKY SIDEBAR (~32%) ================= */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-[90px]">
            {/* 1. Primary Enquiry Card */}
            <div className="bg-white rounded-[20px] p-6 md:p-7 border border-gray-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.05)] space-y-5">
              <div>
                <h3 className="text-[20px] font-heading font-extrabold text-foreground leading-tight">
                  Interested in this Opportunity?
                </h3>
                <p className="text-[13px] text-gray-500 mt-2 leading-relaxed">
                  Connect with the TRINFRA team to learn more about this
                  opportunity and discuss the next steps.
                </p>
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => setIsInterestModalOpen(true)}
                  className="w-full bg-primary hover:bg-primary-dark text-white px-5 py-3 rounded-lg font-bold text-[14px] flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer group"
                >
                  <span>Express Interest</span>
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>

                <Link
                  href={`/opportunities/${opportunity.id}/enquiry`}
                  className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-foreground px-5 py-3 rounded-lg font-semibold text-[13px] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Phone size={14} className="text-gray-400" />
                  <span>Enquire About Opportunity</span>
                </Link>
              </div>

              {/* Trust assurances bullet points */}
              <div className="pt-4 border-t border-gray-100 space-y-3 text-[12px]">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck size={14} />
                  </div>
                  <div>
                    <span className="font-bold text-foreground block">
                      No Obligation
                    </span>
                    <span className="text-gray-400 leading-tight block">
                      Express your interest without any commitment.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0 mt-0.5">
                    <Lock size={13} />
                  </div>
                  <div>
                    <span className="font-bold text-foreground block">
                      Confidential
                    </span>
                    <span className="text-gray-400 leading-tight block">
                      Your information is kept private and secure.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0 mt-0.5">
                    <Headphones size={13} />
                  </div>
                  <div>
                    <span className="font-bold text-foreground block">
                      Direct Support
                    </span>
                    <span className="text-gray-400 leading-tight block">
                      Get guidance from the TRINFRA team.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Location Map Section Card matching mockup */}
            <div className="bg-white rounded-[20px] p-6 border border-gray-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.05)] space-y-4">
              <h3 className="text-[17px] font-heading font-extrabold text-foreground">
                Location
              </h3>

              {/* Styled Satellite Map Visual with Green Polygon */}
              <div className="relative rounded-[16px] overflow-hidden h-[180px] bg-[#0A1810] border border-[#163321] group">
                {/* Background terrain texture */}
                <div
                  className="absolute inset-0 opacity-25 bg-cover bg-center mix-blend-luminosity"
                  style={{ backgroundImage: 'url("/images/farm_grid.jpeg")' }}
                />

                {/* SVG Map Lines and Green Polygon Cluster */}
                <svg
                  viewBox="0 0 320 180"
                  className="absolute inset-0 w-full h-full"
                  preserveAspectRatio="xMidYMid slice"
                >
                  {/* Grid Lines */}
                  <line
                    x1="0"
                    y1="60"
                    x2="320"
                    y2="60"
                    stroke="#163321"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <line
                    x1="0"
                    y1="120"
                    x2="320"
                    y2="120"
                    stroke="#163321"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <line
                    x1="100"
                    y1="0"
                    x2="100"
                    y2="180"
                    stroke="#163321"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <line
                    x1="220"
                    y1="0"
                    x2="220"
                    y2="180"
                    stroke="#163321"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />

                  {/* Road Network */}
                  <path
                    d="M 20,180 Q 90,110 180,90 T 320,50"
                    stroke="#334B3B"
                    strokeWidth="2.5"
                    fill="none"
                  />
                  <path
                    d="M 120,0 Q 150,80 180,90 T 260,180"
                    stroke="#334B3B"
                    strokeWidth="1.5"
                    fill="none"
                  />

                  {/* Green Pooled Land Cluster Polygon */}
                  <polygon
                    points="160,55 230,65 240,115 190,135 150,110"
                    fill="#15803D"
                    fillOpacity="0.45"
                    stroke="#22C55E"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />

                  {/* Gold Location Pin */}
                  <circle cx="195" cy="88" r="7" fill="#BD9655" />
                  <circle
                    cx="195"
                    cy="88"
                    r="14"
                    fill="#BD9655"
                    fillOpacity="0.25"
                    className="animate-ping"
                  />
                  <circle cx="195" cy="88" r="3" fill="#0E2115" />
                </svg>

                {/* Floating Map Label Card */}
                <div className="absolute bottom-3 left-3 right-3 bg-[#0E2115]/90 backdrop-blur-xs border border-white/10 p-2.5 rounded-xl flex items-center justify-between text-[11px]">
                  <div>
                    <span className="font-bold text-white block">
                      {opportunity.title}
                    </span>
                    <span className="text-white/60 text-[10px]">
                      {opportunity.location}
                    </span>
                  </div>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${opportunity.title}, ${opportunity.location}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:text-accent-hover font-semibold flex items-center gap-1 bg-white/10 px-2 py-1 rounded"
                  >
                    <span>View on Map</span>
                    <ArrowRight size={11} />
                  </a>
                </div>
              </div>

              <p className="text-[12px] text-gray-500 leading-relaxed">
                Strategically located with excellent connectivity to{' '}
                {opportunity.district} city, major transport routes and upcoming
                infrastructure.
              </p>
            </div>

            {/* 3. Verified & Transparent Card */}
            <div className="bg-white rounded-[20px] p-6 border border-gray-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.05)] space-y-4">
              <h3 className="text-[17px] font-heading font-extrabold text-foreground">
                Verified & Transparent
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-gray-50/80 border border-gray-100 flex flex-col items-center text-center space-y-1">
                  <ShieldCheck size={18} className="text-accent" />
                  <span className="text-[11px] font-bold text-foreground">
                    Verified Process
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-gray-50/80 border border-gray-100 flex flex-col items-center text-center space-y-1">
                  <Users size={18} className="text-accent" />
                  <span className="text-[11px] font-bold text-foreground">
                    Professional Ecosystem
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-gray-50/80 border border-gray-100 flex flex-col items-center text-center space-y-1">
                  <Lock size={18} className="text-accent" />
                  <span className="text-[11px] font-bold text-foreground">
                    Data Security
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-gray-50/80 border border-gray-100 flex flex-col items-center text-center space-y-1">
                  <Handshake size={18} className="text-accent" />
                  <span className="text-[11px] font-bold text-foreground">
                    Neutral & Transparent
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== 5. EXPLORE SIMILAR OPPORTUNITIES ====== */}
      {similarOpportunities.length > 0 && (
        <section className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16 pt-12 pb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-[24px] md:text-[28px] font-heading font-extrabold text-foreground tracking-tight">
                Explore Similar Opportunities
              </h2>
              <p className="text-[14px] text-gray-500 mt-0.5">
                Discover other structured land-pooling clusters in Kerala.
              </p>
            </div>

            <Link
              href="/opportunities"
              className="text-[13px] font-bold text-accent hover:text-accent-hover flex items-center gap-1 transition-colors"
            >
              <span>View All Opportunities</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {similarOpportunities.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))}
          </div>
        </section>
      )}

      {/* ====== 6. FINAL CTA SECTION ====== */}
      <section className="relative py-20 md:py-24 bg-[#0A1810] overflow-hidden">
        {/* Background Image Texture */}
        <div
          className="absolute inset-0 opacity-25 bg-cover bg-center mix-blend-luminosity"
          style={{ backgroundImage: 'url("/images/rolling_hills.jpeg")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A1810]/95 via-[#0A1810]/85 to-[#0A1810]/70" />

        <div className="relative z-10 max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <span className="text-[11px] font-bold text-accent tracking-[0.25em] uppercase block mb-2">
              Land Together. Build Tomorrow.
            </span>
            <h2 className="text-[32px] md:text-[42px] font-heading font-extrabold text-white tracking-tight leading-tight">
              Ready to explore this opportunity?
            </h2>
            <p className="text-white/70 text-[15px] max-w-xl mt-2 leading-relaxed">
              Connect with TRINFRA and take the next step towards a brighter tomorrow.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsInterestModalOpen(true)}
            className="bg-accent hover:bg-accent-hover text-primary font-extrabold px-8 py-4 rounded-xl text-[14px] shadow-lg flex items-center justify-center gap-2 shrink-0 transition-all cursor-pointer group"
          >
            <span>Enquire Now</span>
            <ArrowRight
              size={17}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </div>
      </section>

      {/* ====== 7. EXPRESS INTEREST MODAL ====== */}
      <InterestModal
        isOpen={isInterestModalOpen}
        onClose={() => setIsInterestModalOpen(false)}
        opportunity={opportunity}
      />
    </div>
  );
}
