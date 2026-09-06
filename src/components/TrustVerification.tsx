'use client';

import { ShieldCheck, Users, Lock, Scale } from 'lucide-react';

export default function TrustVerification() {
  const principles = [
    {
      icon: <ShieldCheck className="w-12 h-12 text-gray-800" strokeWidth={1} />,
      title: "Verified Process",
      desc: "Every land and landowner is verified before inclusion."
    },
    {
      icon: <Users className="w-12 h-12 text-gray-800" strokeWidth={1} />,
      title: "Professional Ecosystem",
      desc: "We work with legal, planning, G.I.S, finance and technical experts."
    },
    {
      icon: <Lock className="w-12 h-12 text-gray-800" strokeWidth={1} />,
      title: "Data Security",
      desc: "Your information is safe and never shared."
    },
    {
      icon: <Scale className="w-12 h-12 text-gray-800" strokeWidth={1} />,
      title: "Neutral & Transparent",
      desc: "We remain neutral and focus on creating value for all stakeholders."
    }
  ];

  return (
    <section className="py-12 bg-background border-b border-gray-200">
      <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16">
        <div className="text-center mb-12">
          <h2 className="text-[36px] font-heading font-bold text-foreground inline-block relative">
            Built on Trust & a Strong Ecosystem
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-[4px] bg-accent"></div>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 pt-8">
          {principles.map((p, i) => (
            <div key={i} className="flex gap-5 items-start">
              <div className="shrink-0 mt-1">
                {p.icon}
              </div>
              <div className="flex flex-col">
                <h3 className="text-[18px] font-bold text-foreground mb-2 leading-tight">{p.title}</h3>
                <p className="text-[15px] text-gray-500 leading-relaxed pr-4">
                  {p.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
