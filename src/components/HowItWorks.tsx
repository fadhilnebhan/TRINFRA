'use client';

import { FileEdit, ShieldCheck, Users, Building2, ArrowRight } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    { 
      num: "01", 
      color: "text-[#0E2115]", 
      bg: "bg-[#0E2115]", 
      icon: <FileEdit className="text-white" size={24} strokeWidth={1.5} />, 
      title: "Register", 
      desc: "Landowners register their land details and express interest." 
    },
    { 
      num: "02", 
      color: "text-[#2E7D32]", 
      bg: "bg-[#2E7D32]", 
      icon: <ShieldCheck className="text-white" size={24} strokeWidth={1.5} />, 
      title: "Verify", 
      desc: "We verify ownership, location and land information." 
    },
    { 
      num: "03", 
      color: "text-accent", 
      bg: "bg-accent", 
      icon: <Users className="text-white" size={24} strokeWidth={1.5} />, 
      title: "Cluster", 
      desc: "We identify adjacent parcels and form viable development clusters." 
    },
    { 
      num: "04", 
      color: "text-[#061A10]", 
      bg: "bg-[#061A10]", 
      icon: <Building2 className="text-white" size={24} strokeWidth={1.5} />, 
      title: "Facilitate", 
      desc: "We facilitate planning, approvals and connect with developers." 
    }
  ];

  return (
    <section id="how-it-works" className="pt-4 pb-20 bg-background">
      <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div>
            <div className="inline-block bg-gray-100 text-gray-500 px-3 py-1.5 rounded-[4px] text-[11px] font-bold tracking-[0.1em] uppercase mb-4">
              Simple. Structured. Transparent.
            </div>
            <h2 className="text-[36px] md:text-[46px] font-heading font-bold text-foreground">How Trinfra Works</h2>
          </div>
          <button className="text-foreground font-semibold hover:text-accent transition-colors flex items-center gap-2 group text-[15px] tracking-wide mb-2">
            See the Process
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="relative">
          {/* Horizontal Dotted Line */}
          <div className="hidden lg:block absolute top-[44px] left-[10%] w-[80%] h-[1px] border-t-[2px] border-dotted border-gray-300 z-0"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-8 relative z-10">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center bg-background px-4">
                <div className={`w-[88px] h-[88px] rounded-full ${step.bg} flex items-center justify-center mb-8 border-[6px] border-background shrink-0 shadow-sm`}>
                  {step.icon}
                </div>
                
                <div className={`font-heading text-[18px] font-bold mb-2 ${step.color}`}>{step.num}</div>
                <h3 className="text-[22px] font-bold text-foreground mb-3">{step.title}</h3>
                <p className="text-gray-500 text-[15px] leading-relaxed max-w-[260px]">
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
