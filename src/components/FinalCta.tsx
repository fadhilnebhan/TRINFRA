
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function FinalCta() {
  return (
    <section className="relative py-16 md:py-24 bg-[#0A1C12] overflow-hidden">
      <div className="relative z-10 max-w-[1360px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-10">
        <div>
          <h2 className="text-[26px] sm:text-[34px] md:text-[40px] text-white font-heading font-bold mb-3 sm:mb-4 tracking-tight">
            Ready to start a Land Pooling Opportunity?
          </h2>
          <p className="text-white/70 text-[14px] sm:text-[16px] max-w-[500px] leading-relaxed">
            Join hundreds of landowners and build bigger opportunities together.
          </p>
        </div>
        
        <Link href="/register" className="w-full sm:w-auto bg-accent text-white px-8 sm:px-10 py-3.5 sm:py-4 rounded-md font-bold hover:bg-accent-hover transition-colors flex items-center justify-center gap-2 shrink-0 group text-[15px] shadow-lg">
          Start Now
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
}
