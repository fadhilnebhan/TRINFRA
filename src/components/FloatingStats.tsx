'use client';

import { useEffect, useRef, useState } from 'react';
import { Users, Map as MapIcon, Layers, Handshake } from 'lucide-react';
import { motion, useInView, animate } from 'framer-motion';
import { useLiveDataSync } from '@/hooks/useLiveDataSync';

function CountUpItem({ to, suffix = "", duration = 1.2 }: { to: number, suffix?: string, duration?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-50px" });
  const [value, setValue] = useState(to.toLocaleString() + suffix);

  useEffect(() => {
    if (isInView) {
      const controls = animate(0, to, {
        duration: duration,
        ease: "easeOut",
        onUpdate(v) {
          setValue(Math.round(v).toLocaleString() + suffix);
        }
      });
      return controls.stop;
    } else {
      setValue(to.toLocaleString() + suffix);
    }
  }, [isInView, to, duration, suffix]);

  return <span ref={ref}>{value}</span>;
}

interface FloatingStatsProps {
  liveOpportunitiesCount?: number;
}

export default function FloatingStats({ liveOpportunitiesCount }: FloatingStatsProps) {
  const [oppCount, setOppCount] = useState<number>(liveOpportunitiesCount ?? 0);

  useLiveDataSync<number>({
    initialData: liveOpportunitiesCount ?? null,
    fetcher: async (signal) => {
      const res = await fetch('/api/opportunities', {
        cache: 'no-store',
        signal,
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.count === 'number') {
          return data.count;
        }
        if (Array.isArray(data.opportunities)) {
          return data.opportunities.length;
        }
      }
      return null;
    },
    onData: (freshCount) => {
      setOppCount(freshCount);
    },
    intervalMs: 25000,
  });

  const stats = [
    { icon: <Users className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-accent" strokeWidth={1.5} />, value: 500, label: "Landowners Onboarded" },
    { icon: <MapIcon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-accent" strokeWidth={1.5} />, value: oppCount, label: "Emerging Opportunities" },
    { icon: <Layers className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-accent" strokeWidth={1.5} />, value: 2500, label: "Acres Under Facilitation" },
    { icon: <Handshake className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-accent" strokeWidth={1.5} />, value: 25, label: "Professional Partners" },
  ];


  return (
    <section className="relative z-30 max-w-[1360px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16 mt-6 sm:-mt-10 md:-mt-16 mb-16 md:mb-20">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-[20px] sm:rounded-[24px] border border-gray-100 shadow-xl shadow-black/5 py-8 px-5 sm:py-10 sm:px-8 md:py-12 md:px-10"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 divide-x-0 lg:divide-x divide-gray-100">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center justify-start sm:justify-center gap-3 sm:gap-4 md:gap-6 px-1 sm:px-2 md:px-4">
              <div className="shrink-0 text-accent">
                {stat.icon}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[24px] sm:text-[32px] md:text-[38px] lg:text-[44px] font-heading font-bold text-foreground leading-none tracking-tight">
                  <CountUpItem to={stat.value} suffix="+" />
                </span>
                <span className="text-[11px] sm:text-[13px] md:text-[15px] text-gray-500 font-medium leading-snug mt-1.5 break-words">
                  {stat.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
