'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  RotateCcw,
  MapPin,
  Layers,
  Building2,
  Trees,
  Users,
  ArrowRight,
  Sparkles,
  FileCheck,
} from 'lucide-react';
import CustomSelect from '@/components/opportunities/CustomSelect';
import {
  Project,
  ProjectStatus,
} from '@/lib/projectsData';

interface ProjectsPageViewProps {
  initialProjects?: Project[];
}

export default function ProjectsPageView({ initialProjects }: ProjectsPageViewProps) {
  const [projectsList, setProjectsList] = useState<Project[]>(initialProjects || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [activeMapDistrict, setActiveMapDistrict] = useState<string | null>(null);

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch('/api/projects');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.projects)) {
            setProjectsList(data.projects);
          }
        }
      } catch (err) {
        console.warn('Could not load projects from database API:', err);
      }
    }
    loadProjects();
  }, []);

  const gridSectionRef = useRef<HTMLDivElement>(null);
  const featured = useMemo(() => {
    return projectsList.find((p) => p.featured) || projectsList[0] || null;
  }, [projectsList]);


  const scrollToGrid = () => {
    gridSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'Planning', label: 'Planning' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Development', label: 'Development' },
    { value: 'Completed', label: 'Completed' },
  ];

  const districtOptions = [
    { value: 'all', label: 'All Districts' },
    { value: 'Kottayam', label: 'Kottayam' },
    { value: 'Thrissur', label: 'Thrissur' },
    { value: 'Alappuzha', label: 'Alappuzha' },
    { value: 'Ernakulam', label: 'Ernakulam' },
    { value: 'Kozhikode', label: 'Kozhikode' },
    { value: 'Thiruvananthapuram', label: 'Thiruvananthapuram' },
    { value: 'Wayanad', label: 'Wayanad' },
  ];

  const stageOptions = [
    { value: 'all', label: 'All Stages' },
    { value: 'Land Aggregation', label: 'Land Aggregation' },
    { value: 'Planning', label: 'Planning' },
    { value: 'Approvals', label: 'Approvals' },
    { value: 'Development', label: 'Development' },
    { value: 'Completed', label: 'Completed' },
  ];

  const filteredProjects = useMemo(() => {
    return projectsList.filter((project) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = project.projectName.toLowerCase().includes(q);
        const matchesLoc = project.location.toLowerCase().includes(q);
        const matchesDesc = project.description.toLowerCase().includes(q);
        const matchesTags = project.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesLoc && !matchesDesc && !matchesTags) {
          return false;
        }
      }

      // Status
      if (selectedStatus !== 'all' && project.status !== selectedStatus) {
        return false;
      }

      // District
      if (selectedDistrict !== 'all' && project.district !== selectedDistrict) {
        return false;
      }

      // Stage
      if (selectedStage !== 'all' && project.developmentStage !== selectedStage) {
        return false;
      }

      return true;
    });
  }, [projectsList, searchQuery, selectedStatus, selectedDistrict, selectedStage]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedStatus !== 'all' ||
    selectedDistrict !== 'all' ||
    selectedStage !== 'all';

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedStatus('all');
    setSelectedDistrict('all');
    setSelectedStage('all');
  };

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'Planning':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FBF3D5] text-[#8C6D1F] border border-[#E9DBA4] shadow-xs">
            Planning
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF3E2] text-[#B25E09] border border-[#F6D29D] shadow-xs">
            In Progress
          </span>
        );
      case 'Development':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EBF5FB] text-[#1B6CA8] border border-[#BDE0F7] shadow-xs">
            Development
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E8F8F0] text-[#0E8A57] border border-[#B2E6CE] shadow-xs">
            Completed
          </span>
        );
      default:
        return null;
    }
  };

  // Kerala map interactive markers
  const mapLocations = [
    { name: 'Kozhikode', x: 26, y: 22 },
    { name: 'Thrissur', x: 40, y: 44 },
    { name: 'Ernakulam', x: 48, y: 55 },
    { name: 'Kottayam', x: 57, y: 68 },
    { name: 'Alappuzha', x: 52, y: 76 },
    { name: 'Thiruvananthapuram', x: 74, y: 92 },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-foreground overflow-x-hidden selection:bg-accent selection:text-white">
      {/* ==================================================
          1. HERO SECTION
          ================================================== */}
      <section className="relative min-h-[520px] md:min-h-[580px] flex items-center justify-center pt-32 pb-20 md:pt-38 md:pb-24 overflow-hidden">
        {/* Background Image with Dark Forest Green Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero_landscape.jpeg"
            alt="TRINFRA Land Pooling Projects"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0E2115]/92 via-[#0E2115]/82 to-[#0E2115]" />
          <div className="absolute inset-0 bg-[radial-gradient(#BD9655_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
        </div>

        <div className="relative z-10 max-w-[1360px] w-full mx-auto px-6 md:px-12 lg:px-16">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-xs font-bold text-accent tracking-widest uppercase mb-3"
              >
                TRINFRA PROJECTS
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-[40px] sm:text-[52px] md:text-[64px] font-heading font-bold text-white leading-[1.1] tracking-tight mb-4"
              >
                Projects
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-base sm:text-lg md:text-xl text-white/80 leading-relaxed font-normal mb-8"
              >
                Explore land opportunities that have progressed through the TRINFRA process — from
                structured planning to development.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap items-center gap-4"
              >
                <button
                  onClick={scrollToGrid}
                  className="bg-accent text-[#0E2115] hover:bg-[#a88243] hover:text-white px-7 py-3 rounded font-bold transition-all inline-flex items-center gap-2 group shadow-xl text-sm cursor-pointer"
                >
                  Explore Projects
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <Link
                  href="/how-it-works"
                  className="bg-black/30 hover:bg-white/10 text-white border border-white/20 px-7 py-3 rounded font-bold transition-all text-sm backdrop-blur-sm inline-flex items-center gap-2"
                >
                  Learn More
                </Link>
              </motion.div>
            </div>

            {/* Subtle right-side script accent matching mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="hidden lg:block text-right pr-4 pb-2"
            >
              <div className="font-serif italic text-xl md:text-2xl text-accent/90 tracking-wide font-medium">
                From Land
                <br />
                To A Better Tomorrow.
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==================================================
          2. INTRO / PROJECT CONTEXT
          ================================================== */}
      <section className="py-16 md:py-24 bg-white border-b border-gray-100">
        <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left: Heading & Narrative */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6"
            >
              <span className="text-xs font-bold text-accent tracking-widest uppercase mb-3 block">
                FROM OPPORTUNITY TO REAL PROGRESS
              </span>
              <h2 className="text-[28px] sm:text-[36px] md:text-[42px] font-heading font-bold text-foreground leading-[1.2] tracking-tight mb-5">
                From Land Opportunity to{' '}
                <span className="text-accent font-extrabold">Real Progress.</span>
              </h2>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                TRINFRA projects represent land opportunities that have moved beyond initial aggregation
                and are now progressing through planning, facilitation, development or completion — creating
                lasting value for landowners, communities and the wider region.
              </p>
            </motion.div>

            {/* Right: Landscape Visual with Floating Badge */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6"
            >
              <div className="relative rounded-[22px] overflow-hidden border border-gray-100 shadow-md aspect-[16/9] group">
                <Image
                  src="/images/houses_tropical.jpeg"
                  alt="Planned Township in Kerala"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />

                {/* Floating pill badge matching mockup */}
                <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-xl border border-gray-100 shadow-lg flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center text-accent shrink-0">
                    <Trees size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground leading-tight">Better Planning</p>
                    <p className="text-[11px] text-gray-500">Stronger Communities</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==================================================
          3. FEATURED PROJECT
          ================================================== */}
      {featured && (
        <section className="py-16 md:py-20 bg-[#FBFBFA]">
          <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16">
            <div className="mb-4">
              <span className="text-xs font-bold text-accent tracking-widest uppercase">
                FEATURED PROJECT
              </span>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-[24px] border border-gray-100 shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Left Image (55%) */}
                <div className="lg:col-span-7 relative min-h-[280px] sm:min-h-[340px] lg:min-h-[400px]">
                  <Image
                    src={featured.image}
                    alt={featured.projectName}
                    fill
                    priority
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Status Badge top-left */}
                  <div className="absolute top-5 left-5">
                    <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold bg-[#0E2115]/85 text-accent border border-accent/40 backdrop-blur-md shadow-md">
                      {featured.status}
                    </span>
                  </div>

                  {/* Script text bottom-left matching mockup */}
                  <div className="absolute bottom-5 left-5 right-5">
                    <span className="font-serif italic text-white/95 text-base sm:text-lg drop-shadow-md">
                      Shaping a Brighter Tomorrow in Kerala
                    </span>
                  </div>
                </div>

                {/* Right Content (45%) */}
                <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-3 leading-snug">
                      {featured.projectName}
                    </h3>

                    {/* Meta location & area */}
                    <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100">
                      <span className="flex items-center gap-1.5 font-medium text-foreground">
                        <MapPin size={15} className="text-accent shrink-0" />
                        {featured.location}
                      </span>
                      <span className="flex items-center gap-1.5 font-medium text-foreground">
                        <Layers size={15} className="text-accent shrink-0" />
                        {featured.approximateArea}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">
                      {featured.description}
                    </p>

                    {/* Tag pills matching mockup */}
                    <div className="flex flex-wrap gap-2 mb-8">
                      <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                        In Progress
                      </span>
                      <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-gray-50 text-gray-600 border border-gray-200">
                        Mixed Use
                      </span>
                      <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                        Sustainable
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/projects/${featured.id}`}
                    className="inline-flex items-center gap-2 text-sm font-bold text-foreground hover:text-accent transition-colors group cursor-pointer"
                  >
                    View Project
                    <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform text-accent" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ==================================================
          4. EXPLORE PROJECTS & FILTERS
          ================================================== */}
      <section ref={gridSectionRef} className="py-12 md:py-16 bg-white border-t border-gray-100">
        <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-1">
                Explore Projects
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Search and filter through TRINFRA projects across Kerala.
              </p>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-[#916e33] transition-colors cursor-pointer self-start sm:self-auto"
              >
                <RotateCcw size={13} />
                Clear Filters
              </button>
            )}
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {/* Search Input */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="w-full h-[46px] pl-10 pr-4 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm text-foreground placeholder:text-gray-400 focus:outline-none focus:border-accent transition-colors shadow-2xs"
              />
            </div>

            {/* Status CustomSelect */}
            <div>
              <CustomSelect
                value={selectedStatus}
                onChange={setSelectedStatus}
                options={statusOptions}
                placeholder="Status"
                className="h-[46px] rounded-xl text-xs sm:text-sm"
              />
            </div>

            {/* District CustomSelect */}
            <div>
              <CustomSelect
                value={selectedDistrict}
                onChange={setSelectedDistrict}
                options={districtOptions}
                placeholder="District"
                className="h-[46px] rounded-xl text-xs sm:text-sm"
              />
            </div>

            {/* Development Stage CustomSelect */}
            <div>
              <CustomSelect
                value={selectedStage}
                onChange={setSelectedStage}
                options={stageOptions}
                placeholder="Development Stage"
                className="h-[46px] rounded-xl text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* ==================================================
              5. PROJECT GRID
              ================================================== */}
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <AnimatePresence>
                {filteredProjects.map((project, idx) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    className="bg-white rounded-[20px] border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between group hover:-translate-y-1"
                  >
                    <div>
                      {/* Image container */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                        <Image
                          src={project.image}
                          alt={project.projectName}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Status Badge in top-left */}
                        <div className="absolute top-3 left-3">
                          {getStatusBadge(project.status)}
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-5">
                        <h3 className="text-lg font-heading font-bold text-foreground mb-2 leading-snug group-hover:text-accent transition-colors">
                          {project.projectName}
                        </h3>

                        <div className="space-y-1.5 text-xs text-gray-500 mb-3">
                          <div className="flex items-center gap-1.5">
                            <MapPin size={13} className="text-accent shrink-0" />
                            <span>{project.location}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Layers size={13} className="text-accent shrink-0" />
                            <span>{project.approximateArea}</span>
                          </div>
                        </div>

                        <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">
                          {project.description}
                        </p>

                        {/* Feature tags */}
                        <div className="flex flex-wrap gap-1.5">
                          {project.tags.slice(0, 2).map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-50 text-gray-500 border border-gray-100"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Link */}
                    <div className="px-5 pb-5 pt-2">
                      <Link
                        href={`/projects/${project.slug}`}
                        className="text-xs font-bold text-accent hover:text-[#916e33] inline-flex items-center gap-1.5 transition-colors group/link"
                      >
                        View Project
                        <ArrowRight size={13} className="group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            /* ==================================================
                EMPTY STATE
                ================================================== */
            <div className="bg-[#FBFBFA] rounded-[22px] border border-gray-200/80 p-12 text-center max-w-lg mx-auto my-6">
              <div className="w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center text-accent mx-auto mb-4">
                <Search size={22} />
              </div>
              <h3 className="text-lg font-heading font-bold text-foreground mb-2">
                No projects match your current filters.
              </h3>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                Try refining your keyword query or reset your status, district, or development-stage filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="bg-primary-dark hover:bg-primary-btn text-white px-6 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ==================================================
          6. PROJECTS ACROSS KERALA (MAP & STATS)
          ================================================== */}
      <section className="py-16 md:py-24 bg-[#F7F8F7] border-y border-gray-100">
        <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left: Heading, Description & Stats */}
            <div className="lg:col-span-5">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-foreground mb-3 leading-tight">
                Projects Across Kerala
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-8">
                TRINFRA works with land clusters and development opportunities across key locations in Kerala.
              </p>

              {/* 4 Stat Boxes matching mockup */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs flex flex-col items-center text-center">
                  <div className="text-accent mb-1.5">
                    <MapPin size={18} />
                  </div>
                  <span className="text-base font-heading font-bold text-foreground">6</span>
                  <span className="text-[10px] text-gray-500 font-medium">Districts</span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs flex flex-col items-center text-center">
                  <div className="text-accent mb-1.5">
                    <FileCheck size={18} />
                  </div>
                  <span className="text-base font-heading font-bold text-foreground">12+</span>
                  <span className="text-[10px] text-gray-500 font-medium">Projects</span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs flex flex-col items-center text-center">
                  <div className="text-accent mb-1.5">
                    <Trees size={18} />
                  </div>
                  <span className="text-base font-heading font-bold text-foreground">2,500+</span>
                  <span className="text-[10px] text-gray-500 font-medium">Acres</span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs flex flex-col items-center text-center">
                  <div className="text-accent mb-1.5">
                    <Users size={18} />
                  </div>
                  <span className="text-base font-heading font-bold text-foreground">1,200+</span>
                  <span className="text-[10px] text-gray-500 font-medium">Families</span>
                </div>
              </div>
            </div>

            {/* Center: Stylized Kerala Map with Interactive Pins */}
            <div className="lg:col-span-4 flex justify-center items-center py-4">
              <div className="relative w-full max-w-[280px] h-[340px] flex items-center justify-center">
                {/* SVG Silhouette representation of Kerala outline */}
                <svg
                  viewBox="0 0 240 380"
                  className="w-full h-full drop-shadow-sm"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M60 15 C85 25, 110 50, 115 80 C120 110, 135 140, 140 170 C145 200, 160 230, 165 260 C170 290, 185 320, 195 355 C190 365, 175 370, 165 355 C150 330, 135 290, 125 250 C115 210, 100 170, 85 130 C70 90, 50 50, 60 15 Z"
                    fill="#E2EBE5"
                    stroke="#CADCD0"
                    strokeWidth="2"
                  />
                </svg>

                {/* Markers on the map */}
                {mapLocations.map((loc) => {
                  const isHovered = activeMapDistrict === loc.name;
                  return (
                    <div
                      key={loc.name}
                      onMouseEnter={() => setActiveMapDistrict(loc.name)}
                      onMouseLeave={() => setActiveMapDistrict(null)}
                      style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                    >
                      <div className="relative flex items-center justify-center">
                        <span className="absolute w-6 h-6 rounded-full bg-accent/20 animate-ping" />
                        <span className="relative w-3.5 h-3.5 rounded-full bg-primary-dark border-2 border-accent shadow-sm" />
                      </div>
                      <span
                        className={`absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold whitespace-nowrap px-1.5 py-0.5 rounded transition-colors ${
                          isHovered
                            ? 'bg-primary-dark text-white shadow-xs'
                            : 'text-foreground bg-white/80'
                        }`}
                      >
                        {loc.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Growing Opportunities Card */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-left">
                <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center text-accent mb-4">
                  <Building2 size={20} />
                </div>
                <h4 className="text-base font-heading font-bold text-foreground mb-2">
                  Growing Opportunities Across the State
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed mb-6">
                  From urban centres to emerging growth corridors, TRINFRA is facilitating structured
                  development opportunities across Kerala.
                </p>
                <button
                  onClick={scrollToGrid}
                  className="w-full bg-primary-dark hover:bg-primary-btn text-white py-2.5 px-4 rounded-lg text-xs font-bold transition-colors inline-flex items-center justify-center gap-2 group cursor-pointer shadow-xs"
                >
                  Explore Projects
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-accent" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          7. WHY PROJECTS MATTER
          ================================================== */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-xs font-bold text-accent tracking-widest uppercase mb-3 block">
                DEVELOPMENT VELOCITY
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
                Structured Land. Real Progress.
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                A project represents an advanced milestone of the TRINFRA journey, where land, title
                scrutiny, stakeholders, and technical planning are synthesized into de-risked institutional
                readiness.
              </p>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                By coordinating adjacent parcels under unified covenants, TRINFRA projects provide
                developers with immediate scale while protecting landowners through transparent stakeholder
                governance.
              </p>
            </div>

            <div className="bg-[#FBFBFA] rounded-2xl border border-gray-100 p-6 sm:p-8 flex flex-col justify-center">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center text-accent shrink-0 mt-1">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Advanced Milestone Certainty</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Physical access, zoning clearances, and boundary alignments verified before execution.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center text-accent shrink-0 mt-1">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Equitable Stakeholder Upside</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Landowners retain upside through joint development structures rather than distress selling.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          8. DEVELOPER / INVESTOR CTA
          ================================================== */}
      <section className="relative py-14 md:py-18 bg-[#0E2115] text-white overflow-hidden">
        {/* Background photo texture */}
        <div className="absolute inset-0 z-0 opacity-15">
          <Image
            src="/images/hero_landscape.jpeg"
            alt="Development Opportunities"
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0E2115] via-[#0E2115]/90 to-[#0E2115] z-0" />

        <div className="relative z-10 max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold text-accent tracking-widest uppercase mb-2 block">
                FOR DEVELOPERS & INVESTORS
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-white mb-2">
                Looking for Your Next Development Opportunity?
              </h2>
              <p className="text-xs sm:text-sm text-white/70 max-w-2xl leading-relaxed">
                Explore projects and connect with TRINFRA to understand where your development or investment
                interests may fit.
              </p>
            </div>

            <div className="w-full sm:w-auto shrink-0">
              <Link
                href="/enquiry"
                className="w-full sm:w-auto bg-accent text-[#0E2115] hover:bg-[#a88243] hover:text-white px-7 py-3.5 rounded-lg font-bold transition-all inline-flex items-center justify-center gap-2 group shadow-xl text-xs sm:text-sm text-center"
              >
                Enquire as a Developer / Investor
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          9. LANDOWNER CTA
          ================================================== */}
      <section className="py-10 md:py-14 bg-white border-t border-gray-100">
        <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16">
          <div className="bg-[#FBFBFA] rounded-2xl border border-gray-200/80 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent shrink-0">
                <FileCheck size={24} />
              </div>
              <div>
                <span className="text-[11px] font-bold text-accent uppercase tracking-wider block mb-1">
                  FOR LANDOWNERS
                </span>
                <h3 className="text-lg sm:text-xl font-heading font-bold text-foreground">
                  Have Land That Could Become Part of Something Bigger?
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Register your land with TRINFRA and explore the potential for structured development.
                </p>
              </div>
            </div>

            <div className="shrink-0 w-full sm:w-auto">
              <Link
                href="/register"
                className="w-full sm:w-auto bg-primary-dark hover:bg-primary-btn text-white px-7 py-3 rounded-lg font-bold transition-all inline-flex items-center justify-center gap-2 group text-xs sm:text-sm shadow-sm"
              >
                Register Your Land
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform text-accent" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
