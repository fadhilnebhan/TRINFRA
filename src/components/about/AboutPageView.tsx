'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView, animate } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Scale,
  Users,
  Building2,
  Layers,
  Map as MapIcon,
  Handshake,
  Compass,
  FileCheck,
  Lock,
  HeartHandshake,
  Globe,
  Trees,
  Maximize2,
  LineChart,
} from 'lucide-react';

function CountUpItem({ to, suffix = '', duration = 1.5 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [value, setValue] = useState('0' + suffix);

  useEffect(() => {
    if (isInView) {
      const controls = animate(0, to, {
        duration: duration,
        ease: 'easeOut',
        onUpdate(v) {
          setValue(Math.round(v).toLocaleString() + suffix);
        },
      });
      return controls.stop;
    }
  }, [isInView, to, duration, suffix]);

  return <span ref={ref}>{value}</span>;
}

export default function AboutPageView() {
  const problemCards = [
    {
      num: '01',
      title: 'Fragmented Land',
      desc: 'Valuable land is often divided across multiple ownerships, restricting scale and standalone utility.',
      icon: <Layers className="text-accent" size={26} strokeWidth={1.75} />,
    },
    {
      num: '02',
      title: 'Unstructured Opportunities',
      desc: 'Developers struggle to discover credible large-scale opportunities with clear documentation.',
      icon: <Compass className="text-accent" size={26} strokeWidth={1.75} />,
    },
    {
      num: '03',
      title: 'Complex Coordination',
      desc: 'Bringing multiple stakeholders together requires time, mediation, and cross-disciplinary expertise.',
      icon: <Users className="text-accent" size={26} strokeWidth={1.75} />,
    },
    {
      num: '04',
      title: 'Limited Development Potential',
      desc: 'Individual parcels may not achieve their highest possible value without coordinated planning.',
      icon: <Maximize2 className="text-accent" size={26} strokeWidth={1.75} />,
    },
  ];

  const valueStakeholders = [
    {
      role: 'LANDOWNERS',
      icon: <Users size={24} className="text-accent" />,
      benefits: [
        'Better development potential',
        'Higher value realization',
        'Transparent process',
        'Professional support',
      ],
    },
    {
      role: 'DEVELOPERS & INVESTORS',
      icon: <Building2 size={24} className="text-accent" />,
      benefits: [
        'Curated opportunities',
        'Structured project information',
        'Verified land information',
        'Direct connection with landowners',
      ],
    },
    {
      role: 'PROFESSIONAL PARTNERS',
      icon: <Handshake size={24} className="text-accent" />,
      benefits: [
        'Meaningful project opportunities',
        'Structured collaboration',
        'Access to development ecosystems',
        'Professional network',
      ],
    },
    {
      role: 'COMMUNITIES',
      icon: <Trees size={24} className="text-accent" />,
      benefits: [
        'Planned development',
        'Better infrastructure',
        'Sustainable growth',
        'Long-term community value',
      ],
    },
  ];

  const ecosystemDomains = [
    {
      name: 'Legal',
      desc: 'Title verification, boundary due diligence, and transparent ownership structuring.',
      icon: <Scale size={24} className="text-accent" />,
    },
    {
      name: 'Planning',
      desc: 'Master layout feasibility, zoning compliance, and infrastructure integration.',
      icon: <Compass size={24} className="text-accent" />,
    },
    {
      name: 'GIS',
      desc: 'High-resolution satellite mapping, terrain modeling, and geospatial intelligence.',
      icon: <Globe size={24} className="text-accent" />,
    },
    {
      name: 'Finance',
      desc: 'Independent valuation benchmarks, feasibility models, and capital structuring.',
      icon: <LineChart size={24} className="text-accent" />,
    },
    {
      name: 'Technical Experts',
      desc: 'Soil stability, environmental impact surveys, and civil access engineering.',
      icon: <FileCheck size={24} className="text-accent" />,
    },
    {
      name: 'Development',
      desc: 'Reputable tier-1 developers, sustainable builders, and execution partners.',
      icon: <Building2 size={24} className="text-accent" />,
    },
  ];

  const trustPillars = [
    {
      title: 'Verified Process',
      desc: 'Every landowner and opportunity is verified before inclusion on the platform.',
      icon: <ShieldCheck size={28} className="text-accent" strokeWidth={1.5} />,
    },
    {
      title: 'Professional Ecosystem',
      desc: 'We work with legal, planning, GIS, finance and technical experts at every stage.',
      icon: <Handshake size={28} className="text-accent" strokeWidth={1.5} />,
    },
    {
      title: 'Data Security',
      desc: 'Your information is handled securely, responsibly, and with absolute confidentiality.',
      icon: <Lock size={28} className="text-accent" strokeWidth={1.5} />,
    },
    {
      title: 'Neutral & Transparent',
      desc: 'We remain neutral and focus on creating balanced value for all stakeholders.',
      icon: <HeartHandshake size={28} className="text-accent" strokeWidth={1.5} />,
    },
  ];

  const whyBenefits = [
    { title: 'Verified Opportunities', desc: 'Pre-screened title clarity and documentation.' },
    { title: 'Structured Information', desc: 'Transparent boundary maps, zoning, and project dossiers.' },
    { title: 'Transparent Process', desc: 'Clear terms, fair stakeholder representation, and zero hidden friction.' },
    { title: 'Professional Ecosystem', desc: 'Independent legal, GIS, and planning experts backing every step.' },
    { title: 'Long-Term Value', desc: 'Sustainable master planning that uplifts communities and yields higher returns.' },
  ];

  return (
    <div className="min-h-screen bg-white text-foreground overflow-x-hidden selection:bg-accent selection:text-white">
      {/* ==================================================
          1. ABOUT HERO
          ================================================== */}
      <section className="relative min-h-[580px] md:min-h-[640px] flex items-center justify-center pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        {/* Background Image with Dark Forest Green Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero_landscape.jpeg"
            alt="TRINFRA Land Pooling Kerala Landscape"
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
            ABOUT TRINFRA
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-[36px] sm:text-[46px] md:text-[58px] lg:text-[64px] font-heading font-bold text-white leading-[1.12] tracking-tight max-w-4xl mx-auto mb-6"
          >
            Building Better Communities{' '}
            <span className="text-accent font-extrabold">Through Land.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed mb-10 font-normal"
          >
            Trinfra brings landowners, developers and professional experts together to transform
            fragmented land into structured, sustainable development opportunities.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto"
          >
            <Link
              href="/register"
              className="w-full sm:w-auto bg-accent text-[#0E2115] hover:bg-[#a88243] hover:text-white px-8 py-3.5 rounded font-bold transition-all inline-flex items-center justify-center gap-2 group shadow-xl"
            >
              Register Your Land
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/opportunities"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/25 px-8 py-3.5 rounded font-bold transition-all inline-flex items-center justify-center gap-2 group backdrop-blur-sm"
            >
              Explore Opportunities
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform text-accent" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ==================================================
          2. INTRODUCTION / OUR STORY
          ================================================== */}
      <section className="py-20 md:py-32 bg-white relative">
        <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left: Landscape Image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6"
            >
              <div className="relative rounded-[24px] overflow-hidden border border-gray-100 shadow-xl aspect-[4/3] group">
                <Image
                  src="/images/houses_tropical.jpeg"
                  alt="Kerala Land Pooling and Planned Development"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-primary-dark/90 backdrop-blur-md border border-white/10 text-white flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-accent font-bold">Bridging Opportunity</p>
                    <p className="text-sm font-semibold text-white">Aggregating fragmented land across Kerala</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                    <Trees size={20} />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Company Story */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6 flex flex-col justify-center"
            >
              <span className="text-xs font-bold text-accent tracking-widest uppercase mb-3 block">
                OUR STORY
              </span>
              <h2 className="text-[30px] sm:text-[38px] md:text-[44px] font-heading font-bold text-foreground leading-[1.2] tracking-tight mb-6">
                Bringing Land Together.{' '}
                <span className="text-primary-dark">Building Bigger Opportunities.</span>
              </h2>

              <div className="space-y-4 text-gray-600 leading-relaxed text-[15px] sm:text-[16px]">
                <p>
                  Land is often fragmented across multiple owners. In rapidly growing corridors across
                  Kerala and beyond, valuable parcels remain constrained because individual holdings lack
                  the critical mass, road frontage, or zoning alignment needed for transformative development.
                </p>
                <p>
                  At the same time, credible developers face immense difficulty discovering contiguous,
                  clean-titled acreage. Coordinating dozens of individual landowners independently is complex,
                  time-consuming, and fraught with uncertainty.
                </p>
                <p>
                  <strong className="text-primary-dark font-semibold">TRINFRA was created as a bridge</strong>{' '}
                  between landowners, institutional developers, and leading domain experts. By introducing
                  structured land pooling, legal diligence, GIS boundary validation, and transparent stakeholder
                  governance, we turn disjointed parcels into unified, high-potential projects.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100 flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center text-accent">
                    <CheckCircle2 size={18} />
                  </div>
                  <span className="text-sm font-semibold text-foreground">Verified Clusters</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center text-accent">
                    <CheckCircle2 size={18} />
                  </div>
                  <span className="text-sm font-semibold text-foreground">Transparent Agreements</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==================================================
          3. THE PROBLEM WE SOLVE
          ================================================== */}
      <section className="py-20 md:py-28 bg-[#F7F8F7] border-y border-gray-100 relative">
        <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-accent tracking-widest uppercase mb-3 block">
              THE STRUCTURAL CHALLENGE
            </span>
            <h2 className="text-[30px] sm:text-[38px] md:text-[44px] font-heading font-bold text-foreground leading-[1.2] tracking-tight mb-4">
              Turning Fragmented Land Into Future-Ready Opportunities.
            </h2>
            <p className="text-gray-500 text-base sm:text-lg">
              Conventional land transactions are hindered by structural friction. We address the root
              inefficiencies that hold valuable land back.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {problemCards.map((card, idx) => (
              <motion.div
                key={card.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white rounded-[20px] p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-mono font-bold text-accent tracking-widest bg-accent/10 px-2.5 py-1 rounded">
                      {card.num}
                    </span>
                    <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
                      {card.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-heading font-bold text-foreground mb-3 leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
                <div className="pt-6 mt-6 border-t border-gray-50 flex items-center text-xs font-semibold text-accent">
                  Structural Inefficiency
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================
          4. OUR SOLUTION
          ================================================== */}
      <section className="py-24 md:py-32 bg-primary-dark text-white relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#34D399]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
            <span className="text-xs font-bold text-accent tracking-widest uppercase mb-3 block">
              THE SOLUTION
            </span>
            <h2 className="text-[32px] sm:text-[40px] md:text-[48px] font-heading font-bold text-white leading-[1.2] tracking-tight mb-5">
              One Platform. Multiple Stakeholders.{' '}
              <span className="text-accent">Shared Value.</span>
            </h2>
            <p className="text-white/70 text-base sm:text-lg leading-relaxed">
              TRINFRA serves as the trusted facilitator and digital infrastructure connecting landowners,
              institutional builders, and multidisciplinary specialists into a harmonious ecosystem.
            </p>
          </div>

          {/* Connected Ecosystem Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Step 1: Landowners */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white/5 border border-white/10 rounded-[20px] p-6 text-center backdrop-blur-sm relative hover:border-accent/40 transition-colors"
            >
              <div className="w-14 h-14 rounded-2xl bg-accent/15 border border-accent/30 mx-auto flex items-center justify-center text-accent mb-4">
                <Users size={28} />
              </div>
              <h3 className="text-lg font-heading font-bold text-white mb-2">LANDOWNERS</h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Pool individual parcels into high-value unified clusters, retaining upside and peace of mind.
              </p>
              <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 text-accent">
                →
              </div>
            </motion.div>

            {/* Step 2: TRINFRA (Central Hub) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-gradient-to-b from-[#183623] to-[#0E2115] border-2 border-accent/60 rounded-[20px] p-6 text-center relative shadow-xl shadow-black/20"
            >
              <div className="inline-block bg-accent text-[#0E2115] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">
                Unified Engine
              </div>
              <div className="w-14 h-14 rounded-2xl bg-accent text-[#0E2115] mx-auto flex items-center justify-center mb-3 shadow-md">
                <Layers size={28} />
              </div>
              <h3 className="text-xl font-heading font-bold text-accent mb-2">TRINFRA</h3>
              <p className="text-xs text-white/80 leading-relaxed">
                Verification, GIS clustering, legal due diligence, valuation structuring, and neutral facilitation.
              </p>
              <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 text-accent">
                →
              </div>
            </motion.div>

            {/* Step 3: Developers & Investors */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white/5 border border-white/10 rounded-[20px] p-6 text-center backdrop-blur-sm relative hover:border-accent/40 transition-colors"
            >
              <div className="w-14 h-14 rounded-2xl bg-accent/15 border border-accent/30 mx-auto flex items-center justify-center text-accent mb-4">
                <Building2 size={28} />
              </div>
              <h3 className="text-lg font-heading font-bold text-white mb-2">DEVELOPERS & INVESTORS</h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Access verified, de-risked, large-scale opportunities primed for immediate master planning.
              </p>
              <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 text-accent">
                →
              </div>
            </motion.div>

            {/* Step 4: Professional Experts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white/5 border border-white/10 rounded-[20px] p-6 text-center backdrop-blur-sm relative hover:border-accent/40 transition-colors"
            >
              <div className="w-14 h-14 rounded-2xl bg-accent/15 border border-accent/30 mx-auto flex items-center justify-center text-accent mb-4">
                <Handshake size={28} />
              </div>
              <h3 className="text-lg font-heading font-bold text-white mb-2">PROFESSIONAL EXPERTS</h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Provide legal, town planning, engineering, GIS, and financial clarity across every transaction.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==================================================
          5. MISSION & VISION
          ================================================== */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Card 1: Our Mission */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative rounded-[24px] overflow-hidden p-8 sm:p-12 bg-gradient-to-br from-[#0E2115] to-[#163020] text-white border border-accent/20 shadow-xl flex flex-col justify-between"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent mb-6">
                  <Compass size={24} />
                </div>
                <span className="text-xs font-bold text-accent tracking-widest uppercase mb-3 block">
                  PURPOSE & DIRECTION
                </span>
                <h3 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-4">
                  OUR MISSION
                </h3>
                <p className="text-lg sm:text-xl text-white/90 leading-relaxed font-normal">
                  “To make land pooling more structured, transparent and accessible by connecting the right
                  people, information and expertise.”
                </p>
              </div>
              <div className="relative z-10 pt-8 mt-8 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
                <span>Structured Facilitation</span>
                <span className="text-accent font-semibold">Integrity First</span>
              </div>
            </motion.div>

            {/* Card 2: Our Vision */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative rounded-[24px] overflow-hidden p-8 sm:p-12 bg-[#F7F8F7] text-foreground border border-gray-200 shadow-xl flex flex-col justify-between"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-primary-dark/10 border border-primary-dark/20 flex items-center justify-center text-primary-dark mb-6">
                  <Trees size={24} />
                </div>
                <span className="text-xs font-bold text-accent tracking-widest uppercase mb-3 block">
                  LONG-TERM IMPACT
                </span>
                <h3 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-4">
                  OUR VISION
                </h3>
                <p className="text-lg sm:text-xl text-gray-700 leading-relaxed font-normal">
                  “To enable stronger communities through better planned land development.”
                </p>
              </div>
              <div className="relative z-10 pt-8 mt-8 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                <span>Sustainable Urban Growth</span>
                <span className="text-primary-dark font-semibold">Future Ready</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==================================================
          6. HOW WE CREATE VALUE
          ================================================== */}
      <section className="py-20 md:py-28 bg-[#FBFBFA] border-y border-gray-100">
        <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-accent tracking-widest uppercase mb-3 block">
              VALUE CREATION
            </span>
            <h2 className="text-[30px] sm:text-[38px] md:text-[44px] font-heading font-bold text-foreground leading-[1.2] tracking-tight mb-4">
              Creating Value for Every Stakeholder.
            </h2>
            <p className="text-gray-500 text-base sm:text-lg">
              Equitable incentives ensure alignment across the board, transforming fragmented property into
              thriving developmental assets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {valueStakeholders.map((item, idx) => (
              <motion.div
                key={item.role}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white rounded-[20px] p-7 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-5">
                  {item.icon}
                </div>
                <h3 className="text-base font-heading font-bold text-foreground mb-6 tracking-wide">
                  {item.role}
                </h3>
                <ul className="space-y-3.5 mt-auto">
                  {item.benefits.map((benefit, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-3 text-sm text-gray-600">
                      <CheckCircle2 size={16} className="text-accent shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================
          7. OUR ECOSYSTEM
          ================================================== */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-accent tracking-widest uppercase mb-3 block">
              PROFESSIONAL BENCHMARK
            </span>
            <h2 className="text-[30px] sm:text-[38px] md:text-[44px] font-heading font-bold text-foreground leading-[1.2] tracking-tight mb-4">
              Built on a Strong Professional Ecosystem.
            </h2>
            <p className="text-gray-500 text-base sm:text-lg">
              We collaborate with accredited domain specialists across the entire lifecycle to guarantee
              regulatory, technical, and commercial integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5">
            {ecosystemDomains.map((domain, idx) => (
              <motion.div
                key={domain.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="bg-[#FBFBFA] rounded-[18px] p-6 border border-gray-100 hover:border-accent/40 hover:bg-white transition-all shadow-sm flex flex-col items-start"
              >
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  {domain.icon}
                </div>
                <h4 className="text-base font-heading font-bold text-foreground mb-2">
                  {domain.name}
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {domain.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================
          8. TRUST & TRANSPARENCY
          ================================================== */}
      <section className="py-20 md:py-28 bg-[#F7F8F7] border-y border-gray-100">
        <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-accent tracking-widest uppercase mb-3 block">
              OUR FOUNDATION
            </span>
            <h2 className="text-[30px] sm:text-[38px] md:text-[44px] font-heading font-bold text-foreground leading-[1.2] tracking-tight mb-4">
              Built on Trust & Transparency.
            </h2>
            <p className="text-gray-500 text-base sm:text-lg">
              Rigorous standards and ethical neutrality guide every opportunity facilitated through our platform.
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
          9. IMPACT NUMBERS
          ================================================== */}
      <section className="py-20 md:py-28 bg-white relative">
        <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-[24px] border border-gray-100 shadow-2xl shadow-black/5 py-8 sm:py-12 px-4 sm:px-8 md:px-10"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-y-10 divide-x-0 lg:divide-x divide-gray-100">
              {/* Stat 1 */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start lg:items-center justify-center text-center sm:text-left gap-2 sm:gap-4 lg:gap-5 px-2 sm:px-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 shrink-0 text-accent flex items-center justify-center">
                  <Users className="w-full h-full" strokeWidth={1.5} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[26px] sm:text-[34px] md:text-[42px] font-heading font-bold text-foreground leading-none tracking-tight">
                    <CountUpItem to={500} suffix="+" />
                  </span>
                  <span className="text-[11px] sm:text-[13px] md:text-[14px] text-gray-500 font-medium leading-snug mt-1">
                    Landowners Onboarded
                  </span>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start lg:items-center justify-center text-center sm:text-left gap-2 sm:gap-4 lg:gap-5 px-2 sm:px-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 shrink-0 text-accent flex items-center justify-center">
                  <MapIcon className="w-full h-full" strokeWidth={1.5} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[26px] sm:text-[34px] md:text-[42px] font-heading font-bold text-foreground leading-none tracking-tight">
                    <CountUpItem to={12} suffix="+" />
                  </span>
                  <span className="text-[11px] sm:text-[13px] md:text-[14px] text-gray-500 font-medium leading-snug mt-1">
                    Emerging Opportunities
                  </span>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start lg:items-center justify-center text-center sm:text-left gap-2 sm:gap-4 lg:gap-5 px-2 sm:px-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 shrink-0 text-accent flex items-center justify-center">
                  <Layers className="w-full h-full" strokeWidth={1.5} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[26px] sm:text-[34px] md:text-[42px] font-heading font-bold text-foreground leading-none tracking-tight">
                    <CountUpItem to={2500} suffix="+" />
                  </span>
                  <span className="text-[11px] sm:text-[13px] md:text-[14px] text-gray-500 font-medium leading-snug mt-1">
                    Acres Under Facilitation
                  </span>
                </div>
              </div>

              {/* Stat 4 */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start lg:items-center justify-center text-center sm:text-left gap-2 sm:gap-4 lg:gap-5 px-2 sm:px-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 shrink-0 text-accent flex items-center justify-center">
                  <Handshake className="w-full h-full" strokeWidth={1.5} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[26px] sm:text-[34px] md:text-[42px] font-heading font-bold text-foreground leading-none tracking-tight">
                    <CountUpItem to={25} suffix="+" />
                  </span>
                  <span className="text-[11px] sm:text-[13px] md:text-[14px] text-gray-500 font-medium leading-snug mt-1">
                    Professional Partners
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==================================================
          10. WHY TRINFRA
          ================================================== */}
      <section className="py-20 md:py-28 bg-[#FBFBFA] border-t border-gray-100">
        <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left: Landscape Image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6"
            >
              <div className="relative rounded-[24px] overflow-hidden border border-gray-100 shadow-xl aspect-[4/3] group">
                <Image
                  src="/images/farm_grid.jpeg"
                  alt="Planned Agricultural and Real Estate Infrastructure"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                <div className="absolute top-6 left-6 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-primary-dark font-bold text-xs uppercase tracking-wider shadow-sm">
                  Strategic Aggregation
                </div>
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <p className="text-xs font-mono text-accent uppercase tracking-widest">Quality Assurance</p>
                  <p className="text-base font-semibold">Structured for immediate development velocity</p>
                </div>
              </div>
            </motion.div>

            {/* Right: Benefits */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6 flex flex-col justify-center"
            >
              <span className="text-xs font-bold text-accent tracking-widest uppercase mb-3 block">
                THE TRINFRA ADVANTAGE
              </span>
              <h2 className="text-[30px] sm:text-[38px] md:text-[44px] font-heading font-bold text-foreground leading-[1.2] tracking-tight mb-6">
                Why Trinfra?
              </h2>
              <p className="text-gray-600 text-base sm:text-lg mb-8 leading-relaxed">
                We replace traditional speculation with structured transparency. By combining technical
                diligence with collaborative stakeholder alignment, Trinfra unlocks the full socioeconomic
                promise of land.
              </p>

              <div className="space-y-4 mb-10">
                {whyBenefits.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-3 rounded-xl hover:bg-white transition-colors">
                    <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center text-accent shrink-0 mt-0.5">
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{item.title}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <Link
                  href="/opportunities"
                  className="inline-flex items-center gap-2 bg-primary-dark text-white hover:bg-primary-btn px-8 py-3.5 rounded font-bold transition-all shadow-md group"
                >
                  Explore Opportunities
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform text-accent" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==================================================
          11. FINAL CTA
          ================================================== */}
      <section className="relative py-24 md:py-32 bg-[#0A1C12] overflow-hidden text-center">
        {/* Background texture & image overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero_landscape.jpeg"
            alt="TRINFRA Land Pooling"
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
            Let&apos;s Build Stronger Communities Together.
          </h2>

          <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed mb-10">
            Connect land, expertise and opportunity to create meaningful development for the future.
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
