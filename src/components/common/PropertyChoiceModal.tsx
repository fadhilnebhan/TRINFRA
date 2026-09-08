'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { X, ArrowRight, Trees, Home, ShieldCheck } from 'lucide-react';

interface PropertyChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PropertyChoiceModal({ isOpen, onClose }: PropertyChoiceModalProps) {
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSelectLand = () => {
    onClose();
    router.push('/register');
  };

  const handleSelectListProperty = () => {
    onClose();
    router.push('/seller/listings/new');
  };

  const content = (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="property-choice-title"
          aria-describedby="property-choice-desc"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-[#FAFAF8] rounded-2xl border border-stone-200/90 shadow-2xl z-10 my-auto flex flex-col"
          >
            {/* Header / Brand Strip */}
            <div className="bg-[#0E2115] text-white px-5 py-5 sm:px-8 sm:py-7 relative border-b border-white/10 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 sm:top-5 sm:right-5 text-white/60 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#BD9655]/50 cursor-pointer"
                aria-label="Close dialog"
                id="close-choice-modal-btn"
              >
                <X size={20} />
              </button>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/10 border border-white/15 text-[10px] sm:text-[11px] font-bold tracking-[0.2em] text-[#BD9655] uppercase mb-2">
                <ShieldCheck size={13} className="text-[#BD9655]" />
                <span>TRINFRA Registration</span>
              </div>

              <h2
                id="property-choice-title"
                className="text-xl sm:text-2xl md:text-[28px] font-heading font-bold text-white tracking-tight leading-tight pr-8"
              >
                What would you like to register?
              </h2>

              <p
                id="property-choice-desc"
                className="text-white/75 text-xs sm:text-sm mt-1 sm:mt-1.5 max-w-lg leading-relaxed"
              >
                Select your property category to continue with the appropriate registration process.
              </p>
            </div>

            {/* Two Options Grid */}
            <div className="p-4 sm:p-7 flex-grow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-5">
                {/* OPTION 1: 🌿 Register Your Land */}
                <button
                  type="button"
                  id="choice-register-land-btn"
                  onClick={handleSelectLand}
                  className="group flex flex-col justify-between text-left p-4 sm:p-6 rounded-xl bg-white border border-stone-200 hover:border-[#0E2115] hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0E2115]/40 active:scale-[0.985] min-h-[160px] sm:min-h-[190px] cursor-pointer"
                >
                  <div>
                    {/* Visual Icon Badge */}
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#0E2115]/5 border border-[#0E2115]/10 flex items-center justify-center text-[#0E2115] mb-3 sm:mb-4 group-hover:bg-[#0E2115] group-hover:text-[#BD9655] transition-colors duration-200">
                      <Trees size={22} strokeWidth={2.2} />
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-emerald-800 mb-0.5">
                      <span>Land Pooling</span>
                    </div>

                    <h3 className="text-base sm:text-xl font-heading font-bold text-[#1F2937] group-hover:text-[#0E2115] transition-colors">
                      Register Your Land
                    </h3>

                    <p className="text-xs sm:text-[13px] text-stone-600 mt-1 leading-relaxed">
                      Submit your land to TRINFRA. Unlock higher developmental potential through planned, collective land pooling.
                    </p>
                  </div>

                  <div className="mt-4 sm:mt-5 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-[#0E2115]">
                    <span className="group-hover:text-[#BD9655] transition-colors">Continue with Land</span>
                    <span className="w-7 h-7 rounded-full bg-stone-100 group-hover:bg-[#0E2115] group-hover:text-white flex items-center justify-center transition-all duration-200">
                      <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </button>

                {/* OPTION 2: 🏠 List Your Property */}
                <button
                  type="button"
                  id="choice-list-property-btn"
                  onClick={handleSelectListProperty}
                  className="group flex flex-col justify-between text-left p-4 sm:p-6 rounded-xl bg-white border border-stone-200 hover:border-[#BD9655] hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#BD9655]/50 active:scale-[0.985] min-h-[160px] sm:min-h-[190px] cursor-pointer"
                >
                  <div>
                    {/* Visual Icon Badge */}
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#BD9655]/10 border border-[#BD9655]/20 flex items-center justify-center text-[#BD9655] mb-3 sm:mb-4 group-hover:bg-[#BD9655] group-hover:text-white transition-colors duration-200">
                      <Home size={22} strokeWidth={2.2} />
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-amber-800 mb-0.5">
                      <span>Residential Marketplace</span>
                    </div>

                    <h3 className="text-base sm:text-xl font-heading font-bold text-[#1F2937] group-hover:text-[#0E2115] transition-colors">
                      List Your Property
                    </h3>

                    <p className="text-xs sm:text-[13px] text-stone-600 mt-1 leading-relaxed">
                      List your flat, apartment, or villa. Connect directly with verified buyers across Kerala with high-res photos.
                    </p>
                  </div>

                  <div className="mt-4 sm:mt-5 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-[#BD9655]">
                    <span className="group-hover:text-[#0E2115] transition-colors">Continue with Residential</span>
                    <span className="w-7 h-7 rounded-full bg-stone-100 group-hover:bg-[#BD9655] group-hover:text-white flex items-center justify-center transition-all duration-200">
                      <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Micro Trust Strip */}
            <div className="bg-stone-100/80 px-4 sm:px-6 py-2.5 sm:py-3 border-t border-stone-200/80 text-[11px] text-stone-500 flex items-center justify-between shrink-0">
              <span>TRINFRA Secure Registration</span>
              <span className="text-stone-400">Land: Acres | Residential: sq ft</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (!mounted || typeof document === 'undefined') {
    return null;
  }

  return createPortal(content, document.body);
}
