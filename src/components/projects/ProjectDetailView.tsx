'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Users,
  Layers,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  TrendingUp,
  Tag,
  Building,
  Calendar,
  Share2,
  Check,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useLiveDataSync } from '@/hooks/useLiveDataSync';
import type { Project } from '@/lib/projectsData';

interface ProjectDetailViewProps {
  initialProject: Project;
  projectId: string;
}

const STAGES: Array<{ name: string; label: string }> = [
  { name: 'Land Aggregation', label: 'Aggregation' },
  { name: 'Planning', label: 'Planning' },
  { name: 'Approvals', label: 'Approvals' },
  { name: 'Development', label: 'Development' },
  { name: 'Completed', label: 'Completed' },
];

export default function ProjectDetailView({
  initialProject,
  projectId,
}: ProjectDetailViewProps) {
  const [project, setProject] = useState<Project | null>(initialProject);
  const [copied, setCopied] = useState(false);

  // Live synchronization for project validity and real-time updates
  useLiveDataSync<Project | null>({
    initialData: initialProject,
    fetcher: async (signal) => {
      const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}`, {
        cache: 'no-store',
        signal,
      });
      if (res.status === 404) {
        return null;
      }
      if (res.ok) {
        const data = await res.json();
        return data.project ?? null;
      }
      return null;
    },
    onData: (freshProj) => {
      setProject(freshProj);
    },
    onNotFound: () => {
      setProject(null);
    },
    intervalMs: 25000,
  });

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (!project) {
    return (
      <div className="py-32 text-center max-w-[1360px] mx-auto px-6">
        <h2 className="text-[28px] font-heading font-bold text-foreground mb-4">
          Project Not Found
        </h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          The requested project could not be located or may have been removed.
        </p>
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-bold text-[14px] hover:bg-primary-btn transition-colors"
        >
          <ArrowLeft size={16} /> Back to Projects
        </Link>
      </div>
    );
  }

  const stageIndex = STAGES.findIndex(
    (s) => s.name.toLowerCase() === (project.developmentStage || '').toLowerCase()
  );
  const currentStageIndex = stageIndex >= 0 ? stageIndex : 1;

  return (
    <div className="bg-[#FAFBF9] min-h-screen text-foreground font-sans pb-24">
      {/* ====== 1. TOP BREADCRUMB & BACK LINK ====== */}
      <div className="max-w-[1360px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-xs sm:text-[13px] font-semibold text-gray-500 hover:text-primary transition-colors group"
          >
            <ArrowLeft
              size={15}
              className="group-hover:-translate-x-1 transition-transform text-accent"
            />
            <span>Back to All Projects</span>
          </Link>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-lg shadow-2xs hover:bg-gray-50 transition-all cursor-pointer"
            aria-label="Share project"
          >
            {copied ? (
              <>
                <Check size={13} className="text-emerald-600" />
                <span className="text-emerald-700">Link Copied</span>
              </>
            ) : (
              <>
                <Share2 size={13} className="text-gray-500" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ====== 2. HERO / HEADER SECTION ====== */}
      <section className="max-w-[1360px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16 mb-10">
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-panel overflow-hidden">
          <div className="relative h-72 sm:h-96 md:h-[420px] w-full">
            <Image
              src={project.image || '/images/hero_landscape.jpeg'}
              alt={project.projectName}
              fill
              priority
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0E2115]/95 via-[#0E2115]/60 to-transparent" />

            {/* Floating Badges */}
            <div className="absolute top-5 left-5 sm:top-7 sm:left-7 flex flex-wrap items-center gap-2 z-10">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#BD9655] text-white shadow-sm uppercase tracking-wider">
                {project.status || 'In Progress'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/90 text-[#0E2115] backdrop-blur-md border border-white/40 shadow-sm">
                Stage: {project.developmentStage || 'Planning'}
              </span>
              {project.featured && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary text-white shadow-sm">
                  ★ Featured Project
                </span>
              )}
            </div>

            {/* Hero Text */}
            <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 sm:right-10 text-white z-10">
              <div className="flex items-center gap-2 text-accent text-xs sm:text-sm font-semibold mb-2">
                <MapPin size={16} />
                <span>{project.location}</span>
                <span className="text-white/40">•</span>
                <span>District: {project.district}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-heading font-extrabold tracking-tight leading-tight mb-3">
                {project.projectName}
              </h1>
              <p className="text-white/80 text-sm sm:text-base max-w-3xl line-clamp-2 sm:line-clamp-none font-normal leading-relaxed">
                {project.description}
              </p>
            </div>
          </div>

          {/* Key Metrics Ribbon */}
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100 bg-white border-t border-gray-100">
            <div className="p-5 sm:p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#0E2115]/6 text-[#0E2115] flex items-center justify-center shrink-0">
                <Layers size={22} className="text-accent" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider font-bold text-gray-400">Total Area</p>
                <p className="text-lg sm:text-xl font-heading font-bold text-gray-900">
                  {project.approximateArea || `${project.areaNum} Acres`}
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#0E2115]/6 text-[#0E2115] flex items-center justify-center shrink-0">
                <Users size={22} className="text-accent" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider font-bold text-gray-400">Landowners Pooled</p>
                <p className="text-lg sm:text-xl font-heading font-bold text-gray-900">
                  {project.participatingLandowners} Landowners
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#0E2115]/6 text-[#0E2115] flex items-center justify-center shrink-0">
                <TrendingUp size={22} className="text-accent" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider font-bold text-gray-400">Milestone Progress</p>
                <p className="text-lg sm:text-xl font-heading font-bold text-gray-900">
                  {project.progressPercentage}%
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#0E2115]/6 text-[#0E2115] flex items-center justify-center shrink-0">
                <Clock size={22} className="text-accent" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider font-bold text-gray-400">Current Phase</p>
                <p className="text-lg sm:text-xl font-heading font-bold text-gray-900 truncate">
                  {project.developmentStage}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== 3. MAIN CONTENT: 2-COLUMN LAYOUT ====== */}
      <section className="max-w-[1360px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left / Main Column */}
          <div className="lg:col-span-8 space-y-8">
            {/* Project Timeline & Development Stage Pipeline */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/80 shadow-panel">
              <h2 className="text-lg font-heading font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp size={20} className="text-accent" />
                <span>Development Lifecycle</span>
              </h2>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center text-xs font-semibold text-gray-600 mb-2">
                  <span>Overall Project Progress</span>
                  <span className="font-bold text-primary">{project.progressPercentage}%</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-200/60">
                  <div
                    className="h-full bg-gradient-to-r from-accent to-[#0E2115] rounded-full transition-all duration-700"
                    style={{ width: `${project.progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Stage Stepper */}
              <div className="grid grid-cols-5 gap-1 pt-2">
                {STAGES.map((stg, idx) => {
                  const isCompleted = idx < currentStageIndex;
                  const isCurrent = idx === currentStageIndex;

                  return (
                    <div key={stg.name} className="flex flex-col items-center text-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 transition-colors ${
                          isCompleted
                            ? 'bg-emerald-600 text-white'
                            : isCurrent
                            ? 'bg-primary text-white ring-4 ring-primary/20'
                            : 'bg-gray-100 text-gray-400 border border-gray-200'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 size={16} /> : idx + 1}
                      </div>
                      <span
                        className={`text-[10px] sm:text-[11px] font-semibold leading-tight ${
                          isCurrent
                            ? 'text-primary font-bold'
                            : isCompleted
                            ? 'text-gray-700'
                            : 'text-gray-400'
                        }`}
                      >
                        {stg.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Project Overview */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/80 shadow-panel">
              <h2 className="text-lg font-heading font-bold text-gray-900 mb-4">
                Project Overview
              </h2>
              <div className="prose prose-sm sm:prose text-gray-600 leading-relaxed max-w-none space-y-4">
                <p className="text-sm sm:text-base leading-relaxed">
                  {project.overview || project.description}
                </p>
              </div>

              {/* Tags */}
              {project.tags && project.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Tag size={13} className="text-accent" />
                    <span>Project Classifications &amp; Sector Tags</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-3 py-1 rounded-xl text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200/80"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Connected Land Opportunity (if present) */}
            {project.opportunity && (
              <div className="bg-gradient-to-br from-white to-[#FAFBF9] rounded-2xl p-6 sm:p-8 border border-gray-200/80 shadow-panel">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
                    Source Land Opportunity
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-accent/15 text-accent">
                    {project.opportunity.status}
                  </span>
                </div>
                <h4 className="text-lg font-heading font-bold text-gray-900 mb-2">
                  {project.opportunity.title}
                </h4>
                <p className="text-xs sm:text-sm text-gray-500 mb-4">
                  This project originated from structured land aggregation within the {project.opportunity.title} opportunity cluster.
                </p>
                <Link
                  href={`/opportunities/${project.opportunity.slug || project.opportunity.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-accent transition-colors"
                >
                  <span>View Original Opportunity Dossier</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            )}
          </div>

          {/* Right / Sidebar Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* Developer & Partner Engagement CTA Card */}
            <div className="bg-[#0E2115] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/15 rounded-full blur-2xl pointer-events-none" />

              <span className="text-[11px] font-bold text-accent tracking-widest uppercase mb-2 block">
                PARTNER WITH TRINFRA
              </span>
              <h3 className="text-xl sm:text-2xl font-heading font-bold mb-3 leading-tight">
                Developer &amp; Investor Participation
              </h3>
              <p className="text-white/70 text-xs sm:text-sm leading-relaxed mb-6">
                Institutional developers and accredited investors can access detailed master plan drawings, feasibility assessments, and joint development frameworks for {project.projectName}.
              </p>

              <Link
                href={`/enquiry?project=${encodeURIComponent(project.slug || project.id)}`}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-accent hover:bg-accent-hover text-[#0E2115] font-bold text-sm shadow-md transition-all group"
              >
                <span>Submit Developer Enquiry</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <div className="mt-6 pt-5 border-t border-white/10 text-[11px] text-white/50 space-y-1.5">
                <p>✓ Direct facilitation through TRINFRA Committee</p>
                <p>✓ Complete clear-title land pooling verification</p>
                <p>✓ Transparent regulatory liaison in Kerala</p>
              </div>
            </div>

            {/* Quick Summary Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-panel space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Key Parameters
              </h4>
              <div className="divide-y divide-gray-100 text-xs">
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-500">District:</span>
                  <span className="font-semibold text-gray-900">{project.district}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-500">Location:</span>
                  <span className="font-semibold text-gray-900">{project.location}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-500">Development Type:</span>
                  <span className="font-semibold text-gray-900">Land Pooling</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-500">Last Updated:</span>
                  <span className="font-semibold text-gray-900">{project.updatedAt || 'Recent'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
