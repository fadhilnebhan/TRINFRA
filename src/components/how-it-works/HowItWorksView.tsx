'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Users,
  Building2,
  Handshake,
  Compass,
  Lock,
  HeartHandshake,
  Trees,
  ChevronDown,
  FileText,
  Sparkles,
  Grid,
} from 'lucide-react';

export default function HowItWorksView() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  const processSteps = [
    {
      step: '01',
      title: 'REGISTER',
      desc: 'Landowners share basic property information and express development interest.',
      icon: <FileText size={24} className="text-accent" />,
    },
    {
      step: '02',
      title: 'VERIFY',
      desc: 'Legal due diligence, spatial GIS mapping, and document authenticity reviews.',
      icon: <ShieldCheck size={24} className="text-accent" />,
    },
    {
      step: '03',
      title: 'CLUSTER',
      desc: 'Contiguous parcels are grouped into viable, cohesive development clusters.',
      icon: <Grid size={24} className="text-accent" />,
    },
    {
      step: '04',
      title: 'FACILITATE',
      desc: 'Connect verified land clusters with credible developers, investors, and experts.',
      icon: <Building2 size={24} className="text-accent" />,
    },
  ];

  const stakeholders = [
    {
      role: 'LANDOWNERS',
      desc: 'Bring land together and unlock greater development potential.',
      icon: <Users size={26} className="text-accent" />,
      tag: 'Collective Upside',
    },
    {
      role: 'DEVELOPERS & INVESTORS',
      desc: 'Discover credible, structured land opportunities ready for execution.',
      icon: <Building2 size={26} className="text-accent" />,
      tag: 'De-risked Scale',
    },
    {
      role: 'PROFESSIONAL EXPERTS',
      desc: 'Support planning, legal, GIS, finance and technical requirements.',
      icon: <Handshake size={26} className="text-accent" />,
      tag: 'Domain Rigor',
    },
    {
      role: 'COMMUNITIES',
      desc: 'Benefit from better planned and more sustainable development.',
      icon: <Trees size={26} className="text-accent" />,
      tag: 'Lasting Value',
    },
  ];

  const trustPillars = [
    {
      title: 'Verified Process',
      desc: 'Every landowner and opportunity is reviewed before inclusion.',
      icon: <ShieldCheck size={28} className="text-accent" strokeWidth={1.5} />,
    },
    {
      title: 'Professional Ecosystem',
      desc: 'We work with legal, planning, GIS, finance and technical experts.',
      icon: <Handshake size={28} className="text-accent" strokeWidth={1.5} />,
    },
    {
      title: 'Data Security',
      desc: 'Your information is handled securely and responsibly.',
      icon: <Lock size={28} className="text-accent" strokeWidth={1.5} />,
    },
    {
      title: 'Neutral & Transparent',
      desc: 'We focus on creating value for all stakeholders.',
      icon: <HeartHandshake size={28} className="text-accent" strokeWidth={1.5} />,
    },
  ];

  const whyMatters = [
    {
      title: 'CLARITY',
      subtitle: 'Structured Transparency',
      desc: 'Everyone understands what happens at each stage. Clear milestones, transparent guidelines, and structured communication eliminate ambiguity.',
      icon: <Compass size={28} className="text-accent" />,
    },
    {
      title: 'CONFIDENCE',
      subtitle: 'Rigorous Verification',
      desc: 'Verified information creates stronger trust between stakeholders. Comprehensive title checks and geospatial mapping provide institutional certainty.',
      icon: <ShieldCheck size={28} className="text-accent" />,
    },
    {
      title: 'OPPORTUNITY',
      subtitle: 'Unlocking True Potential',
      desc: 'Better coordination can unlock larger and more meaningful development possibilities that fragmented, standalone parcels could never achieve.',
      icon: <Sparkles size={28} className="text-accent" />,
    },
  ];

  const faqs = [
    {
      q: 'What is land pooling?',
      a: 'Land pooling is a cooperative mechanism where multiple neighboring landowners consolidate their adjacent, fragmented parcels into a single contiguous block. This aggregated land parcel is then planned, verified, and developed cohesively with modern infrastructure, unlocking significantly higher economic value and developmental potential than small individual holdings could ever achieve alone.',
    },
    {
      q: 'Who can register land with TRINFRA?',
      a: 'Any individual, family, institution, or joint owner holding land in Kerala or designated development corridors can register. Whether you own agricultural acreage, residential plots, or commercial land with clear intent to explore development opportunities or aggregation with neighbors, TRINFRA welcomes your registration.',
    },
    {
      q: 'How is land information verified?',
      a: 'TRINFRA applies a rigorous multi-stage verification framework. Our panel of legal counsel scrutinizes ownership titles, encumbrance certificates (EC), and revenue records. Concurrently, our GIS team uses satellite remote sensing and spatial GIS to confirm exact physical coordinates, survey numbers, access roads, and topography.',
    },
    {
      q: 'What happens after registration?',
      a: 'Once you submit your initial details, our onboarding team reviews the submission and contacts you to confirm specifics. Your parcel is mapped into our geospatial system to identify potential clustering opportunities with neighboring land. You receive regular updates as interest from adjoining owners or institutional developers develops.',
    },
    {
      q: 'How are land clusters identified?',
      a: 'Using specialized GIS boundary algorithms and local zoning overlays, TRINFRA analyzes parcel proximity, road connectivity, topography, and master plan alignments. When adjacent landowners express interest, the platform identifies optimal cluster boundaries that meet institutional development criteria.',
    },
    {
      q: 'How does TRINFRA connect developers and landowners?',
      a: 'TRINFRA prepares standardized, de-risked Project Dossiers for verified clusters. These structured opportunities are presented to vetted institutional developers and investors through our Opportunities portal. TRINFRA facilitates bilateral discussions, transparent terms, and neutral mediation throughout the engagement.',
    },
    {
      q: 'Do I have to sell my land to participate?',
      a: 'No. Land pooling allows for flexible participation structures depending on the project model. In many joint development agreements (JDA), landowners retain underlying ownership rights or receive developed plots, commercial shares, or revenue-sharing proportions rather than making an outright distress sale.',
    },
    {
      q: 'How can developers discover opportunities?',
      a: 'Developers and investors can browse curated, active opportunities directly on the TRINFRA Opportunities portal. They can review district filters, parcel sizes, development types (residential, logistics, tourism, commercial), and submit formal Expressions of Interest (EOI) to receive detailed technical and financial dossiers.',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-foreground overflow-x-hidden selection:bg-accent selection:text-white">
      {/* ==================================================
          1. HERO SECTION
          ================================================== */}
      <section className="relative min-h-[580px] md:min-h-[640px] flex items-center justify-center pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        {/* Background Image with Dark Forest Green Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero_landscape.jpeg"
            alt="TRINFRA Land Pooling Process Kerala"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0E2115]/92 via-[#0E2115]/85 to-[#0E2115]" />
          <div className="absolute inset-0 bg-[radial-gradient(#BD9655_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
        </div>

        <div className="relative z-10 max-w-[1360px] w-full mx-auto px-6 md:px-12 lg:px-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/15 border border-accent/30 text-accent font-semibold text-xs tracking-widest uppercase mb-6"
          >
            SIMPLE. STRUCTURED. TRANSPARENT.
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-[36px] sm:text-[48px] md:text-[60px] lg:text-[66px] font-heading font-bold text-white leading-[1.12] tracking-tight max-w-4xl mx-auto mb-4"
          >
            How Trinfra Works
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-xl sm:text-2xl md:text-3xl text-accent font-heading font-medium mb-6"
          >
            From Land to Opportunity.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed mb-10 font-normal"
          >
            Trinfra brings landowners, developers and professional experts together through a structured process
            designed to transform fragmented land into meaningful development opportunities.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto w-full"
          >
            <Link
              href="/register"
              className="w-full sm:w-auto bg-accent text-[#0E2115] hover:bg-[#a88243] hover:text-white px-8 py-3.5 rounded font-bold transition-all inline-flex items-center justify-center gap-2 group shadow-xl text-center"
            >
              Register Your Land
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/opportunities"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/25 px-8 py-3.5 rounded font-bold transition-all inline-flex items-center justify-center gap-2 group backdrop-blur-sm text-center"
            >
              Explore Opportunities
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform text-accent" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ==================================================
          2. PROCESS OVERVIEW (4-STEP FLOW)
          ================================================== */}
      <section className="py-20 md:py-28 bg-[#F7F8F7] border-b border-gray-100 relative">
        <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-accent tracking-widest uppercase mb-3 block">
              THE WORKFLOW
            </span>
            <h2 className="text-[30px] sm:text-[38px] md:text-[44px] font-heading font-bold text-foreground leading-[1.2] tracking-tight mb-4">
              A Clear Process. A Stronger Opportunity.
            </h2>
            <p className="text-gray-500 text-base sm:text-lg">
              Every opportunity moves through a structured process designed to create clarity, trust and
              better outcomes for everyone involved.
            </p>
          </div>

          {/* Desktop: Horizontal Timeline / Mobile: Vertical */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {processSteps.map((step, idx) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.12 }}
                className="bg-white rounded-[22px] p-7 border border-gray-100 shadow-sm hover:shadow-md transition-all relative flex flex-col justify-between group hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors">
                      {step.icon}
                    </div>
                    <span className="text-xs font-mono font-bold text-accent tracking-widest bg-accent/10 px-2.5 py-1 rounded">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-heading font-bold text-foreground mb-2.5">
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-4">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-[11px] font-semibold text-accent">
                  <span>Stage {step.step}</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================
          3. STEP 01 — REGISTER
          ================================================== */}
      <section className="py-20 md:py-28 bg-white border-b border-gray-100">
        <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left: Large Landowner Image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6"
            >
              <div className="relative rounded-[24px] overflow-hidden border border-gray-100 shadow-xl aspect-[4/3] group">
                <Image
                  src="/images/landowner.jpeg"
                  alt="Landowner Registering with TRINFRA"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-primary-dark/90 backdrop-blur-md border border-white/10 text-white flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-accent font-bold">Stage 01</p>
                    <p className="text-sm font-semibold text-white">Empowering Landowners Across Kerala</p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                    <FileText size={18} />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6 flex flex-col justify-center"
            >
              <span className="text-xs font-bold text-accent tracking-widest uppercase mb-3 block">
                01 — REGISTER
              </span>
              <h2 className="text-[30px] sm:text-[38px] md:text-[44px] font-heading font-bold text-foreground leading-[1.2] tracking-tight mb-5">
                Start With Your Land.
              </h2>
              <p className="text-gray-600 text-base leading-relaxed mb-6">
                Landowners share basic information about their land and express their interest in exploring
                development opportunities. There is zero upfront commitment or cost to explore your parcel&apos;s potential.
              </p>

              {/* Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-8">
                {['Land details', 'Location information', 'Ownership information', 'Development interest'].map((item) => (
                  <div key={item} className="flex items-center gap-3 bg-[#FBFBFA] p-3 rounded-xl border border-gray-100">
                    <div className="w-6 h-6 rounded-full bg-accent/15 flex items-center justify-center text-accent shrink-0">
                      <CheckCircle2 size={15} />
                    </div>
                    <span className="text-sm font-semibold text-foreground">{item}</span>
                  </div>
                ))}
              </div>

              {/* Supporting Card */}
              <div className="p-5 rounded-2xl bg-accent/10 border border-accent/20 mb-8">
                <h4 className="text-sm font-heading font-bold text-primary-dark mb-1">Simple to start</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Share your land details and let the TRINFRA team guide you through the next steps with dedicated support.
                </p>
              </div>

              <div>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 bg-primary-dark text-white hover:bg-primary-btn px-8 py-3.5 rounded font-bold transition-all shadow-md group text-sm"
                >
                  Register Your Land
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform text-accent" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==================================================
          4. STEP 02 — VERIFY
          ================================================== */}
      <section className="py-20 md:py-28 bg-[#FBFBFA] border-b border-gray-100">
        <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6 flex flex-col justify-center order-2 lg:order-1"
            >
              <span className="text-xs font-bold text-accent tracking-widest uppercase mb-3 block">
                02 — VERIFY
              </span>
              <h2 className="text-[30px] sm:text-[38px] md:text-[44px] font-heading font-bold text-foreground leading-[1.2] tracking-tight mb-5">
                Build Confidence Through Verification.
              </h2>
              <p className="text-gray-600 text-base leading-relaxed mb-6">
                Before an opportunity is included, relevant land ownership, location and property information
                is reviewed and verified. This multi-layered scrutiny protects landowners and provides developers
                with institutional certainty.
              </p>

              {/* Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-8">
                {['Ownership verification', 'Location verification', 'Land information review', 'Opportunity assessment'].map((item) => (
                  <div key={item} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <div className="w-6 h-6 rounded-full bg-accent/15 flex items-center justify-center text-accent shrink-0">
                      <CheckCircle2 size={15} />
                    </div>
                    <span className="text-sm font-semibold text-foreground">{item}</span>
                  </div>
                ))}
              </div>

              {/* Trust Card */}
              <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm mb-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-dark/10 flex items-center justify-center text-primary-dark shrink-0">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h4 className="text-sm font-heading font-bold text-foreground mb-1">Verified Information</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Every opportunity is reviewed before being presented to developers and investors, eliminating disputes and title defects.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right: Verification Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6 order-1 lg:order-2"
            >
              <div className="relative rounded-[24px] overflow-hidden border border-gray-100 shadow-xl aspect-[4/3] group">
                <Image
                  src="/images/digital_map.jpeg"
                  alt="Land Information Verification and GIS Mapping"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                <div className="absolute top-6 left-6 px-3.5 py-1.5 rounded-full bg-primary-dark/90 backdrop-blur-md text-accent font-bold text-xs uppercase tracking-wider">
                  Spatial Scrutiny
                </div>
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <p className="text-xs font-mono text-accent uppercase tracking-widest">GIS + Legal Integrity</p>
                  <p className="text-sm font-semibold">Boundary precision, encumbrance checks, and title clarity</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==================================================
          5. STEP 03 — CLUSTER
          ================================================== */}
      <section className="py-20 md:py-28 bg-white border-b border-gray-100">
        <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left: Aerial Land Image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6"
            >
              <div className="relative rounded-[24px] overflow-hidden border border-gray-100 shadow-xl aspect-[4/3] group">
                <Image
                  src="/images/agri_land.jpeg"
                  alt="Clustering Adjacent Land Parcels"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-primary-dark/90 backdrop-blur-md border border-white/10 text-white flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-accent font-bold">Stage 03</p>
                    <p className="text-sm font-semibold text-white">Aggregating Adjoining Holdings</p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                    <Grid size={18} />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Content & Visual Diagram */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6 flex flex-col justify-center"
            >
              <span className="text-xs font-bold text-accent tracking-widest uppercase mb-3 block">
                03 — CLUSTER
              </span>
              <h2 className="text-[30px] sm:text-[38px] md:text-[44px] font-heading font-bold text-foreground leading-[1.2] tracking-tight mb-5">
                Bring Adjacent Land Together.
              </h2>
              <p className="text-gray-600 text-base leading-relaxed mb-6">
                Nearby parcels can be identified and grouped into viable development clusters, creating larger
                and more meaningful opportunities that accommodate integrated roads, utilities, and master plans.
              </p>

              {/* Visual Diagram */}
              <div className="bg-[#F7F8F7] p-5 rounded-2xl border border-gray-200 mb-6">
                <span className="text-[11px] font-mono text-accent uppercase font-bold tracking-widest block mb-3">
                  Aggregation Pipeline
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <p className="font-bold text-foreground">Individual Parcels</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Isolated plots</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm relative">
                    <p className="font-bold text-accent">Identify Adjacent</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">GIS proximity</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <p className="font-bold text-primary-dark">Create Cluster</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Unified boundary</p>
                  </div>
                  <div className="bg-accent text-[#0E2115] p-3 rounded-xl font-bold shadow-sm">
                    <p>Development Opportunity</p>
                    <p className="text-[10px] text-[#0E2115]/80 mt-0.5">Ready for execution</p>
                  </div>
                </div>
              </div>

              {/* Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {['Identify adjacent parcels', 'Assess cluster potential', 'Coordinate landowners', 'Create structured opportunity'].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-accent/15 flex items-center justify-center text-accent shrink-0">
                      <CheckCircle2 size={13} />
                    </div>
                    <span className="text-xs font-semibold text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==================================================
          6. STEP 04 — FACILITATE
          ================================================== */}
      <section className="py-20 md:py-28 bg-[#FBFBFA] border-b border-gray-100">
        <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6 flex flex-col justify-center order-2 lg:order-1"
            >
              <span className="text-xs font-bold text-accent tracking-widest uppercase mb-3 block">
                04 — FACILITATE
              </span>
              <h2 className="text-[30px] sm:text-[38px] md:text-[44px] font-heading font-bold text-foreground leading-[1.2] tracking-tight mb-5">
                Move From Land to Development.
              </h2>
              <p className="text-gray-600 text-base leading-relaxed mb-6">
                TRINFRA facilitates the next stage by helping connect landowners with developers, investors
                and professional experts. We structure transparent agreements and support the project journey from concept to fruition.
              </p>

              {/* Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-8">
                {['Development planning', 'Professional coordination', 'Developer connections', 'Project facilitation'].map((item) => (
                  <div key={item} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <div className="w-6 h-6 rounded-full bg-accent/15 flex items-center justify-center text-accent shrink-0">
                      <CheckCircle2 size={15} />
                    </div>
                    <span className="text-sm font-semibold text-foreground">{item}</span>
                  </div>
                ))}
              </div>

              {/* Supporting Card */}
              <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm mb-8">
                <h4 className="text-sm font-heading font-bold text-primary-dark mb-1">Professional Ecosystem</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Legal, planning, GIS, finance and technical expertise can support the development journey at every milestone.
                </p>
              </div>

              <div>
                <Link
                  href="/opportunities"
                  className="inline-flex items-center gap-2 bg-primary-dark text-white hover:bg-primary-btn px-8 py-3.5 rounded font-bold transition-all shadow-md group text-sm"
                >
                  Explore Opportunities
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform text-accent" />
                </Link>
              </div>
            </motion.div>

            {/* Right: Architecture / Development Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6 order-1 lg:order-2"
            >
              <div className="relative rounded-[24px] overflow-hidden border border-gray-100 shadow-xl aspect-[4/3] group">
                <Image
                  src="/images/developer.jpeg"
                  alt="Planned Land Development and Professional Execution"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                <div className="absolute top-6 left-6 px-3.5 py-1.5 rounded-full bg-accent text-[#0E2115] font-bold text-xs uppercase tracking-wider">
                  Development Realization
                </div>
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <p className="text-xs font-mono text-accent uppercase tracking-widest">Stage 04 Execution</p>
                  <p className="text-sm font-semibold">Institutional developers and master-planned execution</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==================================================
          7. COMPLETE PROCESS VISUAL
          ================================================== */}
      <section className="py-24 md:py-32 bg-primary-dark text-white relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-[#34D399]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16 text-center">
          <span className="text-xs font-bold text-accent tracking-widest uppercase mb-3 block">
            THE UNIFIED ROADMAP
          </span>
          <h2 className="text-[32px] sm:text-[40px] md:text-[48px] font-heading font-bold text-white leading-[1.2] tracking-tight mb-5">
            One Structured Journey.
          </h2>
          <p className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto mb-16 leading-relaxed">
            Every stage is designed to create greater clarity, better coordination and stronger opportunities.
          </p>

          {/* Unified Flowchart Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            <div className="bg-white/5 border border-white/10 rounded-[20px] p-6 text-center backdrop-blur-sm relative">
              <div className="w-14 h-14 rounded-2xl bg-accent/15 border border-accent/30 mx-auto flex items-center justify-center text-accent mb-4">
                <FileText size={26} />
              </div>
              <span className="text-xs font-mono text-accent uppercase tracking-widest block mb-1">01</span>
              <h3 className="text-lg font-heading font-bold text-white mb-2">REGISTER</h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Landowner records details and initiates exploratory review.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[20px] p-6 text-center backdrop-blur-sm relative">
              <div className="w-14 h-14 rounded-2xl bg-accent/15 border border-accent/30 mx-auto flex items-center justify-center text-accent mb-4">
                <ShieldCheck size={26} />
              </div>
              <span className="text-xs font-mono text-accent uppercase tracking-widest block mb-1">02</span>
              <h3 className="text-lg font-heading font-bold text-white mb-2">VERIFY</h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Title scrutiny, spatial boundaries, and zoning assessment.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[20px] p-6 text-center backdrop-blur-sm relative">
              <div className="w-14 h-14 rounded-2xl bg-accent/15 border border-accent/30 mx-auto flex items-center justify-center text-accent mb-4">
                <Grid size={26} />
              </div>
              <span className="text-xs font-mono text-accent uppercase tracking-widest block mb-1">03</span>
              <h3 className="text-lg font-heading font-bold text-white mb-2">CLUSTER</h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Adjacent holdings mapped into high-potential master acreage.
              </p>
            </div>

            <div className="bg-gradient-to-b from-[#183623] to-[#0E2115] border-2 border-accent/60 rounded-[20px] p-6 text-center relative shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-accent text-[#0E2115] mx-auto flex items-center justify-center mb-4 shadow-md">
                <Building2 size={26} />
              </div>
              <span className="text-xs font-mono text-accent uppercase tracking-widest block mb-1">04</span>
              <h3 className="text-lg font-heading font-bold text-accent mb-2">FACILITATE</h3>
              <p className="text-xs text-white/80 leading-relaxed">
                Institutional partnerships, transparent agreements, and project kickoff.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          8. WHO IS INVOLVED
          ================================================== */}
      <section className="py-20 md:py-28 bg-white border-b border-gray-100">
        <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-accent tracking-widest uppercase mb-3 block">
              COLLABORATIVE ECOSYSTEM
            </span>
            <h2 className="text-[30px] sm:text-[38px] md:text-[44px] font-heading font-bold text-foreground leading-[1.2] tracking-tight mb-4">
              Built Around the Right People.
            </h2>
            <p className="text-gray-500 text-base sm:text-lg">
              Meaningful development requires coordinated alignment among key participants across every step.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stakeholders.map((item, idx) => (
              <motion.div
                key={item.role}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-[#FBFBFA] rounded-[22px] p-7 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-white border border-gray-200/80 flex items-center justify-center mb-5 shadow-xs">
                    {item.icon}
                  </div>
                  <span className="text-[11px] font-bold text-accent uppercase tracking-wider block mb-1">
                    {item.tag}
                  </span>
                  <h3 className="text-base font-heading font-bold text-foreground mb-3">
                    {item.role}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="pt-5 mt-5 border-t border-gray-200/60 flex items-center text-xs font-semibold text-primary-dark">
                  Aligned Stakeholder
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================
          9. TRUST & TRANSPARENCY
          ================================================== */}
      <section className="py-20 md:py-28 bg-[#F7F8F7] border-b border-gray-100">
        <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-accent tracking-widest uppercase mb-3 block">
              OUR FOUNDATION
            </span>
            <h2 className="text-[30px] sm:text-[38px] md:text-[44px] font-heading font-bold text-foreground leading-[1.2] tracking-tight mb-4">
              Built on Trust & Transparency.
            </h2>
            <p className="text-gray-500 text-base sm:text-lg">
              Integrity, strict procedural neutrality, and accredited professional oversight anchor our methodology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustPillars.map((pillar, idx) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white rounded-[20px] p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5">
                  {pillar.icon}
                </div>
                <h3 className="text-lg font-heading font-bold text-foreground mb-2">
                  {pillar.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {pillar.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================
          10. WHY THIS PROCESS MATTERS
          ================================================== */}
      <section className="py-20 md:py-28 bg-white border-b border-gray-100">
        <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-accent tracking-widest uppercase mb-3 block">
              THE STRATEGIC ADVANTAGE
            </span>
            <h2 className="text-[30px] sm:text-[38px] md:text-[44px] font-heading font-bold text-foreground leading-[1.2] tracking-tight mb-4">
              Why a Structured Process Matters.
            </h2>
            <p className="text-gray-500 text-base sm:text-lg">
              Land pooling involves multiple landowners, developmental considerations, and technical coordination.
              A defined framework ensures everyone advances with full confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whyMatters.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-[#FBFBFA] rounded-[24px] p-8 sm:p-10 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200/80 flex items-center justify-center mb-6 shadow-xs group-hover:border-accent/40 transition-colors">
                    {item.icon}
                  </div>
                  <span className="text-xs font-mono font-bold text-accent uppercase tracking-widest block mb-2">
                    {item.subtitle}
                  </span>
                  <h3 className="text-2xl font-heading font-bold text-foreground mb-4">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="pt-6 mt-8 border-t border-gray-200/60 flex items-center text-xs font-semibold text-primary-dark">
                  Core Advantage
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================
          11. FAQ SECTION (SINGLE ITEM ACCORDION)
          ================================================== */}
      <section className="py-20 md:py-28 bg-[#FBFBFA] border-b border-gray-100">
        <div className="max-w-[1000px] mx-auto px-6 md:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-accent tracking-widest uppercase mb-3 block">
              CLARITY & ANSWERS
            </span>
            <h2 className="text-[30px] sm:text-[38px] md:text-[44px] font-heading font-bold text-foreground leading-[1.2] tracking-tight mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-500 text-base">
              Clear answers to common questions about land pooling, verification, clustering, and platform participation.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="bg-white rounded-[18px] border border-gray-100 overflow-hidden shadow-xs hover:border-gray-200 transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="text-base font-heading font-bold text-foreground">
                      {faq.q}
                    </span>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                        isOpen ? 'bg-accent text-white rotate-180' : 'bg-gray-50 text-gray-500'
                      }`}
                    >
                      <ChevronDown size={16} />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                      >
                        <div className="px-6 pb-6 pt-1 text-sm text-gray-600 leading-relaxed border-t border-gray-50">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================================================
          12. FINAL CTA
          ================================================== */}
      <section className="relative py-24 md:py-32 bg-[#0A1C12] overflow-hidden text-center">
        {/* Background texture & image overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero_landscape.jpeg"
            alt="TRINFRA Land Pooling Opportunities"
            fill
            className="object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1C12] via-[#0A1C12]/90 to-[#0A1C12]" />
        </div>

        <div className="relative z-10 max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16">
          <span className="text-xs font-bold text-accent tracking-widest uppercase mb-4 block">
            LAND TOGETHER. BUILD TOMORROW.
          </span>

          <h2 className="text-[34px] sm:text-[44px] md:text-[52px] font-heading font-bold text-white leading-[1.18] tracking-tight max-w-3xl mx-auto mb-6">
            Ready to Start Your Journey?
          </h2>

          <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed mb-10">
            Whether you&apos;re a landowner, developer or investor, TRINFRA helps connect the right people and opportunities.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto w-full">
            <Link
              href="/register"
              className="w-full sm:w-auto bg-accent text-[#0E2115] hover:bg-[#a88243] hover:text-white px-8 py-4 rounded font-bold transition-all inline-flex items-center justify-center gap-2 group shadow-xl text-sm text-center"
            >
              Register Your Land
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/opportunities"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/25 px-8 py-4 rounded font-bold transition-all inline-flex items-center justify-center gap-2 group backdrop-blur-sm text-sm text-center"
            >
              Explore Opportunities
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform text-accent" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
