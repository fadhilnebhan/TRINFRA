'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  Clock,
  Check,
  ArrowRight,
  ShieldCheck,
  Users,
  Compass,
  Handshake,
  TrendingUp,
  Sprout,
  Building2,
  FileCheck,
  CheckCircle2,
  Link2,
  UserPlus,
  Sparkles,
} from 'lucide-react';
import type { Article } from '@/lib/articlesData';
import { getRelatedArticles } from '@/lib/articlesData';

interface ArticleDetailViewProps {
  article: Article;
}

const TOC_SECTIONS = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'what-is-land-pooling', label: 'What is Land Pooling?' },
  { id: 'how-land-pooling-works', label: 'How Land Pooling Works' },
  { id: 'why-landowners-consider-it', label: 'Why Landowners Consider It' },
  { id: 'benefits-of-land-pooling', label: 'Benefits of Land Pooling' },
  { id: 'land-pooling-vs-traditional-development', label: 'Land Pooling vs Traditional Development' },
  { id: 'things-to-consider', label: 'Things to Consider' },
  { id: 'conclusion', label: 'Conclusion' },
];

export default function ArticleDetailView({ article }: ArticleDetailViewProps) {
  const [activeSection, setActiveSection] = useState('introduction');
  const [copied, setCopied] = useState(false);
  const relatedArticles = getRelatedArticles(article.slug, 3);

  // ScrollSpy for TOC active state
  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0,
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    TOC_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [article.slug]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStepIcon = (iconName: string) => {
    switch (iconName) {
      case 'register':
        return <UserPlus size={18} className="text-[#BD9655]" />;
      case 'verify':
        return <ShieldCheck size={18} className="text-[#BD9655]" />;
      case 'cluster':
        return <Users size={18} className="text-[#BD9655]" />;
      case 'plan':
        return <Compass size={18} className="text-[#BD9655]" />;
      case 'facilitate':
        return <Handshake size={18} className="text-[#BD9655]" />;
      default:
        return <Sparkles size={18} className="text-[#BD9655]" />;
    }
  };

  const getBenefitIcon = (iconName: string) => {
    switch (iconName) {
      case 'growth':
        return <Building2 size={16} className="text-[#0E2115]" />;
      case 'value':
        return <TrendingUp size={16} className="text-[#0E2115]" />;
      case 'community':
        return <Users size={16} className="text-[#0E2115]" />;
      case 'support':
        return <Handshake size={16} className="text-[#0E2115]" />;
      case 'trust':
        return <FileCheck size={16} className="text-[#0E2115]" />;
      default:
        return <CheckCircle2 size={16} className="text-[#0E2115]" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6]/80 pb-20">
      {/* ================= BREADCRUMB & HERO ================= */}
      <section className="pt-8 pb-6 max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[12px] text-gray-500 mb-6 font-medium">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span>&gt;</span>
          <Link href="/#knowledge" className="hover:text-primary transition-colors">
            Knowledge Centre
          </Link>
          <span>&gt;</span>
          <span className="text-foreground font-semibold">{article.category}</span>
        </nav>

        {/* Category Eyebrow */}
        <p className="text-[12px] md:text-[13px] font-bold text-[#BD9655] tracking-[0.18em] uppercase mb-2">
          {article.category}
        </p>

        {/* Headline */}
        <h1 className="text-[34px] sm:text-[44px] md:text-[50px] font-heading font-extrabold text-foreground tracking-tight leading-[1.12]">
          {article.title}{' '}
          {article.titleAccent && (
            <span className="text-[#BD9655]">{article.titleAccent}</span>
          )}
        </h1>

        {/* Subtitle */}
        <p className="text-[17px] md:text-[20px] text-gray-600 font-normal mt-2 leading-relaxed max-w-3xl">
          {article.subtitle}
        </p>

        {/* Metadata */}
        <div className="flex items-center gap-5 text-[13px] text-gray-500 mt-4">
          <div className="flex items-center gap-1.5">
            <Calendar size={14} className="text-gray-400" />
            <span>{article.date}</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-gray-400" />
            <span>{article.readTime}</span>
          </div>
        </div>

        {/* Featured Hero Image */}
        <div className="relative rounded-[24px] overflow-hidden aspect-[16/7] md:aspect-[21/8] mt-8 shadow-sm border border-gray-100 group bg-gray-100">
          <Image
            src={article.image}
            alt={article.title}
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
            quality={80}
            className="object-cover group-hover:scale-102 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

          {/* Script Text Overlay (Bottom Left) matching mockup */}
          <div className="absolute bottom-6 left-7 text-left pointer-events-none select-none">
            <p className="font-serif italic text-white/95 text-[16px] md:text-[18px] drop-shadow-md tracking-wide">
              {article.imageScriptTop || 'Stronger Lands'}
            </p>
            <p className="font-serif italic text-white/95 text-[15px] md:text-[17px] drop-shadow-md tracking-wide -mt-0.5">
              {article.imageScriptBottom || 'Brighter Tomorrows.'}
            </p>
          </div>
        </div>
      </section>

      {/* ================= 2-COLUMN MAIN CONTENT & SIDEBAR ================= */}
      <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* ================= LEFT / MAIN ARTICLE (~70%) ================= */}
          <article className="lg:col-span-8 space-y-10">
            {/* 1. Introduction */}
            <section id="introduction" className="space-y-4 scroll-mt-28">
              <h2 className="text-[24px] md:text-[28px] font-heading font-extrabold text-foreground tracking-tight">
                Introduction
              </h2>
              {article.introParagraphs.map((para, i) => (
                <p key={i} className="text-[15px] md:text-[16px] text-gray-700 leading-relaxed font-normal">
                  {para}
                </p>
              ))}

              {/* Inline Highlight Card */}
              <div className="bg-[#FAF7F2] border border-[#BD9655]/30 rounded-2xl p-5 md:p-6 flex items-start gap-4 my-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <div className="w-10 h-10 rounded-full bg-[#BD9655]/15 text-[#8A6A32] flex items-center justify-center shrink-0 mt-0.5">
                  <Users size={20} className="text-[#8A6A32]" />
                </div>
                <p className="text-[14px] md:text-[15px] text-gray-800 leading-relaxed font-medium">
                  {article.highlightCardText}
                </p>
              </div>
            </section>

            {/* 2. What is Land Pooling? */}
            <section id="what-is-land-pooling" className="space-y-4 scroll-mt-28 pt-2">
              <h2 className="text-[24px] md:text-[28px] font-heading font-extrabold text-foreground tracking-tight">
                {article.whatIsTitle}
              </h2>
              {article.whatIsParagraphs.map((para, i) => (
                <p key={i} className="text-[15px] md:text-[16px] text-gray-700 leading-relaxed font-normal">
                  {para}
                </p>
              ))}
            </section>

            {/* 3. How Land Pooling Works */}
            <section id="how-land-pooling-works" className="space-y-6 scroll-mt-28 pt-2">
              <h2 className="text-[24px] md:text-[28px] font-heading font-extrabold text-foreground tracking-tight">
                How Land Pooling Works
              </h2>

              <div className="relative pt-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-2 relative">
                  {article.steps.map((s, idx) => (
                    <div
                      key={s.step}
                      className="bg-white rounded-xl p-4 border border-gray-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col items-center text-center relative group hover:border-[#0E2115]/30 transition-all"
                    >
                      {/* Step Number Badge */}
                      <span className="w-7 h-7 rounded-full bg-[#0E2115] text-white text-[11px] font-bold flex items-center justify-center mb-2.5 shadow-sm">
                        {s.step}
                      </span>

                      {/* Icon */}
                      <div className="w-9 h-9 rounded-full bg-[#FAF7F2] border border-gray-100 flex items-center justify-center mb-2">
                        {getStepIcon(s.icon)}
                      </div>

                      {/* Title */}
                      <h3 className="font-heading font-bold text-[13px] text-foreground leading-snug">
                        {s.title}
                      </h3>

                      {/* Description */}
                      <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed">
                        {s.desc}
                      </p>

                      {/* Connector Arrow on desktop */}
                      {idx < article.steps.length - 1 && (
                        <div className="hidden md:block absolute -right-2.5 top-7 z-10 text-gray-300">
                          <ArrowRight size={14} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 4. Why Landowners Consider Land Pooling */}
            <section id="why-landowners-consider-it" className="space-y-4 scroll-mt-28 pt-2">
              <h2 className="text-[24px] md:text-[28px] font-heading font-extrabold text-foreground tracking-tight">
                Why Landowners Consider Land Pooling
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {article.whyConsiderPoints.map((pt, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#BD9655] text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={12} className="stroke-[3]" />
                    </div>
                    <span className="text-[14px] text-gray-700 font-medium leading-snug">
                      {pt}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* 5. Benefits of Land Pooling */}
            <section id="benefits-of-land-pooling" className="space-y-4 scroll-mt-28 pt-2">
              <h2 className="text-[24px] md:text-[28px] font-heading font-extrabold text-foreground tracking-tight">
                Benefits of Land Pooling
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
                {article.benefits.map((b, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl p-4 border border-gray-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-[#0E2115]/30 transition-all"
                  >
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-[#0E2115]/[0.06] flex items-center justify-center mb-3">
                        {getBenefitIcon(b.icon)}
                      </div>
                      <h3 className="font-heading font-bold text-[13px] text-foreground leading-snug">
                        {b.title}
                      </h3>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">
                      {b.desc}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* 6. Land Pooling vs Traditional Development */}
            <section id="land-pooling-vs-traditional-development" className="space-y-4 scroll-mt-28 pt-2">
              <h2 className="text-[24px] md:text-[28px] font-heading font-extrabold text-foreground tracking-tight">
                Land Pooling vs Traditional Development
              </h2>

              <div className="bg-white rounded-2xl border border-gray-200/90 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 bg-[#FAF9F6] text-[13px] font-bold text-foreground">
                        <th className="py-3.5 px-5 w-1/4">Aspect</th>
                        <th className="py-3.5 px-5 w-3/8 text-[#0E2115]">Land Pooling</th>
                        <th className="py-3.5 px-5 w-3/8 text-gray-600">Traditional Development</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-[13px]">
                      {article.comparisonRows.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-3.5 px-5 font-semibold text-gray-700">
                            {row.aspect}
                          </td>
                          <td className="py-3.5 px-5 font-medium text-foreground bg-[#0E2115]/[0.02]">
                            {row.landPooling}
                          </td>
                          <td className="py-3.5 px-5 text-gray-500">
                            {row.traditional}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* 7. Things Landowners Should Consider */}
            <section id="things-to-consider" className="space-y-4 scroll-mt-28 pt-2">
              <h2 className="text-[24px] md:text-[28px] font-heading font-extrabold text-foreground tracking-tight">
                Things Landowners Should Consider
              </h2>

              <div className="space-y-3 pt-1">
                {article.thingsToConsider.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#BD9655] text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={12} className="stroke-[3]" />
                    </div>
                    <span className="text-[14px] text-gray-700 font-medium leading-snug">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* 8. Conclusion */}
            <section id="conclusion" className="space-y-4 scroll-mt-28 pt-2 border-t border-gray-200/80">
              <h2 className="text-[24px] md:text-[28px] font-heading font-extrabold text-foreground tracking-tight">
                Conclusion
              </h2>
              {article.conclusionParagraphs.map((para, i) => (
                <p key={i} className="text-[15px] md:text-[16px] text-gray-700 leading-relaxed font-normal">
                  {para}
                </p>
              ))}
            </section>
          </article>

          {/* ================= RIGHT / STICKY SIDEBAR (~30%) ================= */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-[90px]">
            {/* Card 1: On this page (TOC) */}
            <div className="bg-white rounded-[20px] p-6 border border-gray-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
              <h3 className="font-heading font-extrabold text-[16px] text-foreground pb-2 border-b border-gray-100">
                On this page
              </h3>

              <nav className="space-y-2 text-[13px]">
                {TOC_SECTIONS.map((sec) => {
                  const isActive = activeSection === sec.id;
                  return (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        const target = document.getElementById(sec.id);
                        if (target) {
                          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          setActiveSection(sec.id);
                        }
                      }}
                      className={`flex items-center gap-2.5 py-1 transition-colors ${
                        isActive
                          ? 'font-bold text-[#0E2115]'
                          : 'text-gray-500 hover:text-foreground font-normal'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          isActive
                            ? 'bg-[#BD9655] ring-2 ring-[#BD9655]/20 scale-125'
                            : 'bg-transparent'
                        }`}
                      />
                      <span className="truncate">{sec.label}</span>
                    </a>
                  );
                })}
              </nav>
            </div>

            {/* Card 2: Interested in Land Pooling? */}
            <div className="bg-[#FAF7F2] rounded-[20px] p-6 border border-[#BD9655]/30 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3.5">
              <div className="w-9 h-9 rounded-full bg-[#0E2115] text-[#BD9655] flex items-center justify-center shadow-sm">
                <Sprout size={18} className="text-[#BD9655]" />
              </div>

              <h3 className="font-heading font-extrabold text-[17px] text-foreground leading-snug">
                Interested in Land Pooling?
              </h3>

              <p className="text-[13px] text-gray-600 leading-relaxed">
                Explore how TRINFRA can help bring landowners, developers and experts together.
              </p>

              <div className="pt-1">
                <Link
                  href="/register"
                  className="w-full bg-[#0E2115] hover:bg-[#132c1c] text-white py-3 px-4 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 shadow-sm transition-all group"
                >
                  <span>Register Your Land</span>
                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              </div>
            </div>

            {/* Card 3: Share this article */}
            <div className="bg-white rounded-[20px] p-5 border border-gray-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
              <h4 className="font-bold text-[13px] text-foreground mb-3">
                Share this article
              </h4>

              <div className="flex items-center gap-2.5">
                {/* LinkedIn */}
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                    typeof window !== 'undefined' ? window.location.href : ''
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-gray-200 hover:border-gray-400 hover:bg-gray-50 flex items-center justify-center text-gray-700 hover:text-foreground transition-colors text-[13px] font-bold select-none"
                  aria-label="Share on LinkedIn"
                >
                  in
                </a>

                {/* X / Twitter */}
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    article.title
                  )}&url=${encodeURIComponent(
                    typeof window !== 'undefined' ? window.location.href : ''
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-gray-200 hover:border-gray-400 hover:bg-gray-50 flex items-center justify-center text-gray-700 hover:text-foreground transition-colors text-[13px] font-bold select-none"
                  aria-label="Share on X"
                >
                  X
                </a>

                {/* Facebook */}
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    typeof window !== 'undefined' ? window.location.href : ''
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-gray-200 hover:border-gray-400 hover:bg-gray-50 flex items-center justify-center text-gray-700 hover:text-foreground transition-colors text-[13px] font-bold select-none"
                  aria-label="Share on Facebook"
                >
                  f
                </a>

                {/* Copy link */}
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-9 h-9 rounded-full border border-gray-200 hover:border-gray-400 hover:bg-gray-50 flex items-center justify-center text-gray-600 hover:text-foreground transition-colors cursor-pointer relative"
                  aria-label="Copy article link"
                >
                  {copied ? (
                    <Check size={14} className="text-emerald-600" />
                  ) : (
                    <Link2 size={14} />
                  )}
                  {copied && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-0.5 rounded shadow whitespace-nowrap">
                      Copied!
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Card 4: Related Articles Mini Sidebar */}
            <div className="bg-white rounded-[20px] p-5 border border-gray-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-3.5">
              <h4 className="font-bold text-[13px] text-foreground pb-2 border-b border-gray-100">
                Related Articles
              </h4>

              <div className="space-y-3">
                {relatedArticles.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/knowledge-centre/${rel.slug}`}
                    className="flex items-center gap-3 group"
                  >
                    <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-gray-100 border border-gray-100 relative">
                      <Image
                        src={rel.image}
                        alt={rel.title}
                        fill
                        sizes="56px"
                        quality={70}
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="min-w-0 flex-grow">
                      <span className="text-[10px] font-bold text-[#BD9655] uppercase tracking-wider block truncate">
                        {rel.category}
                      </span>
                      <h5 className="font-heading font-bold text-[13px] text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        {rel.title} {rel.titleAccent}
                      </h5>
                      <span className="text-[11px] text-gray-400 block mt-0.5">
                        {rel.date}
                      </span>
                    </div>
                    <ArrowRight
                      size={13}
                      className="text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0"
                    />
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ================= RELATED ARTICLES BOTTOM GRID ================= */}
      <section className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16 mt-20 pt-10 border-t border-gray-200/70">
        <div className="mb-6">
          <h2 className="text-[26px] md:text-[30px] font-heading font-extrabold text-foreground tracking-tight">
            Related Articles
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {relatedArticles.map((rel) => (
            <Link
              key={rel.slug}
              href={`/knowledge-centre/${rel.slug}`}
              className="bg-white rounded-[20px] overflow-hidden border border-gray-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md transition-all group flex flex-col h-full"
            >
              {/* Thumbnail */}
              <div className="aspect-[16/9] w-full overflow-hidden bg-gray-100 relative">
                <Image
                  src={rel.image}
                  alt={rel.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  quality={75}
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Body */}
              <div className="p-6 flex flex-col flex-grow justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-bold text-[#BD9655] uppercase tracking-wider">
                      {rel.category}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-[17px] text-foreground leading-snug group-hover:text-primary transition-colors">
                    {rel.title} {rel.titleAccent}
                  </h3>
                  <p className="text-[13px] text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                    {rel.excerpt}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-5 mt-4 border-t border-gray-100 text-[12px]">
                  <span className="text-gray-400">{rel.date}</span>
                  <span className="font-bold text-foreground group-hover:text-primary flex items-center gap-1">
                    <span>Read More</span>
                    <ArrowRight
                      size={13}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ================= PRE-FOOTER CTA SECTION ================= */}
      <section className="mt-20 border-t border-gray-200/80 bg-primary-dark text-white py-14 relative overflow-hidden">
        <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div>
            <p className="text-[11px] font-bold text-accent uppercase tracking-widest mb-1.5">
              LAND TOGETHER. BUILD TOMORROW.
            </p>
            <h2 className="text-[26px] md:text-[32px] font-heading font-extrabold tracking-tight">
              Ready to explore land opportunities?
            </h2>
            <p className="text-white/70 text-[14px] mt-1">
              Discover structured land-pooling opportunities and build stronger possibilities together.
            </p>
          </div>

          <Link
            href="/opportunities"
            className="w-full sm:w-auto shrink-0 bg-accent hover:bg-accent-light text-primary-dark font-bold text-[14px] px-7 py-3.5 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 group text-center"
          >
            <span>View Opportunities</span>
            <ArrowRight
              size={15}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>
      </section>
    </div>
  );
}
