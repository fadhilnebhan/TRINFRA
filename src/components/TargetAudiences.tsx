'use client';

import { ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';

export default function TargetAudiences() {
  return (
    <section id="landowners" className="py-16 md:py-20 bg-background">
      <div className="max-w-[1360px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* For Landowners */}
          <div className="relative overflow-hidden rounded-[20px] sm:rounded-[24px] bg-[#F3F4F6] border border-gray-200 flex flex-col md:flex-row h-full min-h-[420px] md:min-h-[480px]">
            <div className="p-6 sm:p-10 md:p-14 md:w-3/5 flex flex-col z-10">
              <h2 className="text-[26px] sm:text-[34px] md:text-[40px] font-heading font-bold text-foreground mb-3 sm:mb-4 leading-tight">For Landowners</h2>
              <p className="text-gray-600 text-[14px] sm:text-[16px] leading-relaxed mb-6 sm:mb-10 max-w-[320px]">
                Unlock the true potential of your land by coming together.
              </p>
              
              <ul className="space-y-3 sm:space-y-4 mb-8 sm:mb-12 flex-grow">
                {['Better development potential', 'Higher value realization', 'Planned & transparent process', 'Professional support at every step'].map((item, i) => (
                  <li key={i} className="flex items-center text-[13px] sm:text-[15px] font-medium text-foreground">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2.5 sm:mr-3 shrink-0" strokeWidth={2} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              
              <Link href="/register" className="bg-primary-btn text-white px-6 sm:px-7 py-3 sm:py-3.5 rounded-md text-[14px] sm:text-[15px] font-bold hover:bg-[#07190e] transition-colors flex items-center w-fit group shadow-md">
                Register Your Land
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform ml-2" />
              </Link>
            </div>
            
            <div className="absolute right-0 bottom-0 h-full w-[60%] z-0 pointer-events-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/images/landowner.jpeg" 
                alt="Landowner" 
                className="w-full h-full object-cover object-center [mask-image:linear-gradient(to_right,transparent_0%,black_35%)] opacity-30 md:opacity-100"
              />
            </div>
          </div>

          {/* For Developers */}
          <div id="developers" className="relative overflow-hidden rounded-[20px] sm:rounded-[24px] bg-[#F3F4F6] border border-gray-200 flex flex-col md:flex-row h-full min-h-[420px] md:min-h-[480px]">
            <div className="p-6 sm:p-10 md:p-14 md:w-3/5 flex flex-col z-10">
              <h2 className="text-[26px] sm:text-[34px] md:text-[40px] font-heading font-bold text-foreground mb-3 sm:mb-4 leading-tight">For Developers &<br/>Investors</h2>
              <p className="text-gray-600 text-[14px] sm:text-[16px] leading-relaxed mb-6 sm:mb-10 max-w-[320px]">
                Discover credible, large-scale land opportunities with verified information.
              </p>
              
              <ul className="space-y-3 sm:space-y-4 mb-8 sm:mb-12 flex-grow">
                {['Curated opportunities', 'Structured project information', 'Transparent process', 'Connect with landowners'].map((item, i) => (
                  <li key={i} className="flex items-center text-[13px] sm:text-[15px] font-medium text-foreground">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2.5 sm:mr-3 shrink-0" strokeWidth={2} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              
              <Link href="/opportunities" className="bg-primary-btn text-white px-6 sm:px-7 py-3 sm:py-3.5 rounded-md text-[14px] sm:text-[15px] font-bold hover:bg-[#07190e] transition-colors flex items-center w-fit group shadow-md">
                Explore Opportunities
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform ml-2" />
              </Link>
            </div>
            
            <div className="absolute right-0 bottom-0 h-full w-[60%] z-0 pointer-events-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/images/developer.jpeg" 
                alt="Developer" 
                className="w-full h-full object-cover object-[80%_center] [mask-image:linear-gradient(to_right,transparent_0%,black_35%)] opacity-30 md:opacity-100"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
