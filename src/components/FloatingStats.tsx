'use client';

import { useEffect, useRef, useState } from 'react';
import { Users, Map as MapIcon, Layers, Handshake } from 'lucide-react';
import { motion, useInView, animate } from 'framer-motion';

function CountUpItem({ to, suffix = "", duration = 1.5 }: { to: number, suffix?: string, duration?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [value, setValue] = useState("0" + suffix);

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
    }
  }, [isInView, to, duration, suffix]);

  return <span ref={ref}>{value}</span>;
}

export default function FloatingStats() {
  const stats = [
    { icon: <Users size={48} className="text-accent" strokeWidth={1.5} />, value: 500, label: "Landowners Onboarded" },
    { icon: <MapIcon size={48} className="text-accent" strokeWidth={1.5} />, value: 12, label: "Emerging Opportunities" },
    { icon: <Layers size={48} className="text-accent" strokeWidth={1.5} />, value: 2500, label: "Acres Under Facilitation" },
    { icon: <Handshake size={48} className="text-accent" strokeWidth={1.5} />, value: 25, label: "Professional Partners" },
  ];

  return (
    <section className="relative z-30 max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16 -mt-16 mb-20">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-[24px] border border-gray-100 shadow-2xl shadow-black/5 py-12 px-10"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 divide-x-0 md:divide-x divide-gray-100">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center justify-center gap-6 px-4">
              <div className="shrink-0 text-accent">
                {stat.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-[44px] font-heading font-bold text-foreground leading-tight tracking-tight">
                  <CountUpItem to={stat.value} suffix="+" />
                </span>
                <span className="text-[15px] text-gray-500 font-medium">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
