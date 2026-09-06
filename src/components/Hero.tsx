'use client';

import { ShieldCheck, CheckCircle2, TrendingUp, Handshake, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative w-full min-h-[85vh] lg:min-h-[750px] flex flex-col pt-28 pb-12 sm:pt-32 sm:pb-16 lg:pt-36 lg:pb-20 overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url("/images/hero_landscape.jpeg")',
        }}
      />
      {/* Green/Dark Gradient Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#0E2115]/95 via-[#0E2115]/85 to-transparent" />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#0E2115] via-transparent to-black/40" />

      {/* Parcel Highlights */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-full z-0 opacity-80 pointer-events-none hidden lg:flex items-center justify-center translate-x-12">
        <svg viewBox="0 0 800 600" className="w-full max-w-[800px] drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          {/* Parcel 1 */}
          <path d="M150,250 L350,200 L450,280 L280,380 Z" fill="rgba(255, 255, 255, 0.05)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
          <circle cx="300" cy="270" r="5" fill="#fff" />
          <circle cx="300" cy="270" r="14" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
          <path d="M300,270 L300,285" stroke="#fff" strokeWidth="1.5" />
          
          {/* Parcel 2 */}
          <path d="M380,180 L550,150 L680,240 L500,300 Z" fill="rgba(255, 255, 255, 0.05)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
          <circle cx="510" cy="220" r="5" fill="#fff" />
          <circle cx="510" cy="220" r="14" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
          <path d="M510,220 L510,235" stroke="#fff" strokeWidth="1.5" />

          {/* Parcel 3 */}
          <path d="M510,320 L660,260 L780,350 L620,440 Z" fill="rgba(255, 255, 255, 0.05)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
          <circle cx="630" cy="340" r="5" fill="#fff" />
          <circle cx="630" cy="340" r="14" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
          <path d="M630,340 L630,355" stroke="#fff" strokeWidth="1.5" />
          
          {/* Parcel 4 */}
          <path d="M250,400 L450,330 L580,460 L380,530 Z" fill="rgba(255, 255, 255, 0.05)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
          <circle cx="430" cy="420" r="5" fill="#fff" />
          <circle cx="430" cy="420" r="14" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
          <path d="M430,420 L430,435" stroke="#fff" strokeWidth="1.5" />
        </svg>
      </div>

      <div className="relative z-10 max-w-[1360px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16 w-full flex-grow flex flex-col justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-[950px]"
        >
          <div className="inline-flex items-center px-3 py-1.5 rounded-[4px] border border-[#4ADE80]/30 bg-black/40 mb-4 sm:mb-6">
            <span className="text-[#4ADE80] text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase">Land Together. Build Tomorrow.</span>
          </div>
          
          <h1 className="text-[32px] sm:text-[44px] md:text-[54px] lg:text-[64px] font-heading font-bold leading-[1.1] sm:leading-[1.05] tracking-tight mb-4 sm:mb-6">
            <span className="text-white block">Bringing Land Together.</span>
            <span className="text-accent block mt-1">Building Bigger Opportunities.</span>
          </h1>
          
          <p className="text-[15px] sm:text-[17px] md:text-[18px] text-white/90 max-w-[600px] leading-relaxed mb-8 sm:mb-10 font-normal">
            Trinfra facilitates land pooling opportunities by connecting landowners, developers and experts to create impactful development for the future.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-10 sm:mb-14">
            <Link href="/register" className="w-full sm:w-auto bg-primary-btn border border-white/10 text-white px-7 sm:px-8 py-3.5 rounded-md text-[15px] font-semibold hover:bg-[#07190e] transition-colors flex items-center justify-center gap-2 group shadow-lg">
              Register Your Land
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/opportunities" className="w-full sm:w-auto bg-transparent border border-white/30 text-white px-7 sm:px-8 py-3.5 rounded-md text-[15px] font-semibold hover:bg-white/5 transition-colors shadow-sm text-center justify-center">
              Explore Opportunities
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Trust Strip */}
      <div className="relative z-10 max-w-[1360px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16 w-full mt-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-4 border-t border-white/10 lg:border-t-0">
          <div className="grid grid-cols-2 md:flex md:flex-nowrap items-start md:items-center gap-x-4 gap-y-3.5 sm:gap-x-8">
            {[
              { icon: <CheckCircle2 size={18} className="text-accent shrink-0" strokeWidth={2} />, text: "Trusted & Transparent" },
              { icon: <ShieldCheck size={18} className="text-accent shrink-0" strokeWidth={2} />, text: "Verified Process" },
              { icon: <TrendingUp size={18} className="text-accent shrink-0" strokeWidth={2} />, text: "Stronger Development Potential" },
              { icon: <Handshake size={18} className="text-accent shrink-0" strokeWidth={2} />, text: "Professional Ecosystem" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 sm:gap-2.5">
                {item.icon}
                <span className="text-white text-[11px] sm:text-[12px] font-medium leading-tight max-w-[140px]">{item.text}</span>
              </div>
            ))}
          </div>
          
          <div className="hidden lg:block text-right">
            <p className="text-white text-[12px] leading-relaxed max-w-[180px] ml-auto opacity-80 font-medium">
              Turning fragmented land into future-ready opportunities.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
