'use client';

import Link from 'next/link';
import { FileEdit, ShieldCheck, Users, Building2, ArrowRight } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    { 
      num: "01", 
      color: "text-[#0E2115]", 
      bg: "bg-[#0E2115]", 
      icon: <FileEdit className="text-white w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" strokeWidth={1.5} />, 
      title: "Register", 
      desc: "Landowners register their land details and express interest." 
    },
    { 
      num: "02", 
      color: "text-[#2E7D32]", 
      bg: "bg-[#2E7D32]", 
      icon: <ShieldCheck className="text-white w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" strokeWidth={1.5} />, 
      title: "Verify", 
      desc: "We verify ownership, location and land information." 
    },
    { 
      num: "03", 
      color: "text-accent", 
      bg: "bg-accent", 
      icon: <Users className="text-white w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" strokeWidth={1.5} />, 
      title: "Cluster", 
      desc: "We identify adjacent parcels and form viable development clusters." 
    },
    { 
      num: "04", 
      color: "text-[#061A10]", 
      bg: "bg-[#061A10]", 
      icon: <Building2 className="text-white w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" strokeWidth={1.5} />, 
      title: "Facilitate", 
      desc: "We facilitate planning, approvals and connect with developers." 
    }
  ];

  return (
    <section id="how-it-works" className="pt-4 pb-14 sm:pb-16 lg:pb-20 bg-background">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-12 lg:mb-16 gap-4 sm:gap-6">
          <div>
            <div className="inline-block bg-gray-100 text-gray-500 px-3 py-1.5 rounded-[4px] text-[11px] font-bold tracking-[0.1em] uppercase mb-3 sm:mb-4">
              Simple. Structured. Transparent.
            </div>
            <h2 className="text-[28px] sm:text-[36px] md:text-[46px] font-heading font-bold text-foreground leading-tight">
              How Trinfra Works
            </h2>
          </div>
          <Link 
            href="/how-it-works" 
            className="text-foreground font-semibold hover:text-accent transition-colors flex items-center gap-2 group text-[14px] sm:text-[15px] tracking-wide mb-1 sm:mb-2"
          >
            See the Process
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Process Steps */}
        <div className="relative">
          {/* Horizontal Dotted Line - Desktop Only */}
          <div className="hidden lg:block absolute top-[44px] left-[10%] w-[80%] h-[1px] border-t-[2px] border-dotted border-gray-300 z-0"></div>
          
          {/* 2x2 Grid on Mobile & Tablet, 4 columns on Desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8 relative z-10">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="bg-white rounded-[18px] sm:rounded-[20px] p-3.5 sm:p-5 md:p-6 border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col items-center text-center lg:bg-transparent lg:border-0 lg:shadow-none lg:p-0 transition-all"
              >
                {/* Icon Circle */}
                <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-[88px] lg:h-[88px] rounded-full ${step.bg} flex items-center justify-center mb-2.5 sm:mb-4 lg:mb-8 border-[3px] sm:border-4 lg:border-[6px] border-background shrink-0 shadow-xs lg:shadow-sm`}>
                  {step.icon}
                </div>
                
                {/* Step Number */}
                <div className={`font-heading text-[12px] sm:text-[14px] lg:text-[18px] font-extrabold mb-1 lg:mb-2 ${step.color}`}>
                  {step.num}
                </div>

                {/* Step Title */}
                <h3 className="text-[15px] sm:text-[18px] lg:text-[22px] font-bold text-foreground mb-1.5 sm:mb-2 lg:mb-3 leading-snug">
                  {step.title}
                </h3>

                {/* Step Description */}
                <p className="text-gray-500 text-[11px] sm:text-[13px] lg:text-[15px] leading-relaxed max-w-[260px]">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
