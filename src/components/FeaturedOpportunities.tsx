'use client';

import Link from 'next/link';
import { MapPin, ArrowRight, Map as MapIcon, FolderSearch } from 'lucide-react';
import type { Opportunity } from '@/lib/opportunitiesData';

interface FeaturedOpportunitiesProps {
  opportunities?: Opportunity[];
}

export default function FeaturedOpportunities({
  opportunities = [],
}: FeaturedOpportunitiesProps) {
  return (
    <section id="opportunities" className="py-12 pb-20 md:pb-24 bg-background">
      <div className="max-w-[1360px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 sm:mb-12 gap-4 sm:gap-6">
          <div>
            <h2 className="text-[28px] sm:text-[36px] md:text-[46px] font-heading font-bold text-foreground mb-2 sm:mb-4">
              Featured Opportunities
            </h2>
          </div>
          <Link
            href="/opportunities"
            className="text-foreground font-semibold hover:text-accent transition-colors flex items-center gap-2 group text-[14px] sm:text-[15px] tracking-wide mb-2"
          >
            View all opportunities
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Cards Column */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {opportunities.length === 0 ? (
              <div className="col-span-full bg-white rounded-[20px] border border-gray-100 p-8 sm:p-12 text-center flex flex-col items-center justify-center min-h-[280px]">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
                  <FolderSearch size={24} />
                </div>
                <h3 className="text-[18px] font-bold text-foreground mb-2">No Active Featured Opportunities</h3>
                <p className="text-gray-500 text-[14px] max-w-[360px] mb-6">
                  Opportunities in this zone are currently under review or closed. Explore our complete directory or register your land pool interest.
                </p>
                <Link
                  href="/opportunities"
                  className="px-5 py-2.5 rounded-lg bg-primary text-white text-[13px] font-semibold hover:bg-primary-hover transition-colors"
                >
                  Browse Pipeline
                </Link>
              </div>
            ) : (
              opportunities.slice(0, 3).map((opportunity) => (
                <div
                  key={opportunity.id}
                  className="flex flex-col bg-white rounded-[20px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-shadow"
                >
                  {/* Image Area */}
                  <div className="h-56 overflow-hidden relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={opportunity.image || '/images/houses_tropical.jpeg'}
                      alt={opportunity.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1.5 rounded uppercase tracking-wider">
                      {opportunity.status}
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-[22px] font-bold text-foreground mb-1 leading-tight">
                      {opportunity.title}
                    </h3>
                    <div className="flex items-center text-gray-500 text-[14px] mb-6">
                      <MapPin size={14} className="mr-1.5" />
                      {opportunity.location}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <div className="text-[11px] text-gray-400 mb-1 uppercase tracking-wider font-semibold">
                          Approx. Area
                        </div>
                        <div className="font-bold text-foreground text-[16px]">
                          {opportunity.area} {opportunity.areaUnit || 'Acres'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-gray-400 mb-1 uppercase tracking-wider font-semibold">
                          Participation
                        </div>
                        <div className="font-bold text-foreground text-[16px]">
                          {opportunity.landowners}{' '}
                          <span className="text-[12px] font-normal text-gray-500">
                            Landowners
                          </span>
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/opportunities/${opportunity.id}`}
                      className="mt-auto pt-4 border-t border-gray-100 flex items-center text-[14px] font-bold text-accent group cursor-pointer hover:text-accent-hover transition-colors"
                    >
                      View Details
                      <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Map CTA Column */}
          <div className="lg:col-span-5 bg-[#0A1810] rounded-[20px] sm:rounded-[24px] overflow-hidden relative flex flex-col items-center justify-center p-6 sm:p-8 md:p-12 text-center border border-[#163321] group min-h-[350px] sm:min-h-[400px]">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-20 bg-[url('/images/farm_grid.jpeg')] bg-cover bg-center blend-overlay mix-blend-luminosity"></div>

            {/* SVG Overlays */}
            <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full opacity-60">
              <path
                d="M50,150 L150,100 L250,180 L180,280 Z"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="1"
              />
              <path
                d="M180,180 L280,130 L380,220 L300,320 Z"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="1"
              />
              <circle cx="150" cy="190" r="4" fill="#fff" />
              <circle cx="150" cy="190" r="10" fill="none" stroke="#fff" strokeWidth="1" />
              <circle cx="300" cy="240" r="4" fill="#fff" />
              <circle cx="300" cy="240" r="10" fill="none" stroke="#fff" strokeWidth="1" />
            </svg>

            <div className="relative z-10 flex flex-col items-center justify-center mt-8">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm border border-white/20">
                <MapIcon size={28} className="text-white" strokeWidth={1.5} />
              </div>
              <h3 className="text-white text-[28px] font-heading font-bold mb-4">
                Explore Opportunities on Map
              </h3>
              <p className="text-white/70 text-[16px] max-w-[280px] mb-8 leading-relaxed">
                View broad project areas and emerging development clusters.
              </p>
              <Link
                href="/opportunities#map"
                className="bg-transparent border border-white/30 text-white px-8 py-3 rounded-md text-[15px] font-semibold hover:bg-white hover:text-background transition-colors flex items-center gap-2 group/btn"
              >
                Open Map
                <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
