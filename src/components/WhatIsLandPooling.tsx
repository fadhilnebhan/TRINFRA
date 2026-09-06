'use client';

import { ArrowRight, Grid, Maximize } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WhatIsLandPooling() {
  return (
    <section className="py-16 bg-surface border-y border-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block bg-surface-alt border border-gray-200 px-3 py-1 rounded-sm text-[10px] font-bold tracking-widest text-primary mb-6 uppercase">
              The Concept
            </div>
            <h2 className="text-4xl font-heading font-bold text-primary mb-6">What is Land Pooling?</h2>
            <p className="text-foreground/70 text-lg leading-relaxed mb-8">
              Land pooling is a collaborative development model where adjacent property owners combine their smaller parcels into a single, unified development site. Instead of selling individually at lower valuations, landowners partner with a verified developer.
            </p>
            <button className="text-primary font-bold hover:text-accent transition-colors flex items-center gap-2 group text-sm uppercase tracking-wide">
              Learn How It Works
              <ArrowRight size={16} className="text-accent group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative h-80 bg-surface-alt rounded-sm border border-gray-200 flex items-center justify-center p-8"
          >
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#061A10 1px, transparent 1px), linear-gradient(90deg, #061A10 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            
            <div className="flex items-center justify-center gap-4 md:gap-8 w-full z-10">
              {/* Fragmented */}
              <div className="flex flex-col gap-2">
                <div className="w-16 h-16 bg-white border-2 border-dashed border-gray-300 rounded-sm flex items-center justify-center shadow-sm">
                  <Grid className="text-gray-400" />
                </div>
                <div className="w-16 h-16 bg-white border-2 border-dashed border-gray-300 rounded-sm flex items-center justify-center shadow-sm">
                  <Grid className="text-gray-400" />
                </div>
              </div>
              
              {/* Arrow */}
              <div className="flex flex-col items-center">
                <ArrowRight className="text-accent mb-2" size={32} />
                <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest">Pool</span>
              </div>

              {/* Combined */}
              <div className="w-40 h-40 bg-primary border-4 border-accent/20 rounded-sm flex flex-col items-center justify-center shadow-float relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-light to-primary"></div>
                <Maximize className="text-accent mb-2 z-10 w-10 h-10 group-hover:scale-110 transition-transform" />
                <span className="text-white font-bold tracking-wider z-10 text-sm">UNIFIED SITE</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
