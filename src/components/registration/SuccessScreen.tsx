'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Home } from 'lucide-react';
import Link from 'next/link';

interface SuccessScreenProps {
  referenceNumber?: string;
  communicationPreference?: string;
  fullName?: string;
}

export default function SuccessScreen({ communicationPreference, fullName }: SuccessScreenProps) {
  const shouldReduceMotion = useReducedMotion();

  const commMethodLabel =
    communicationPreference === 'whatsapp'
      ? 'WhatsApp'
      : communicationPreference === 'phone'
      ? 'phone'
      : 'email';

  return (
    <div className="flex items-center justify-center min-h-[560px] py-10 sm:py-14">
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="text-center max-w-[500px] w-full mx-auto px-5 sm:px-6"
      >
        {/* Animated Success Badge */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 flex items-center justify-center">
          {/* Subtle Ambient Glow */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0.3 } : { scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.15, opacity: 0.35 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.8, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full bg-primary/20 blur-lg pointer-events-none"
          />

          {/* Outer Ripple Ring */}
          <motion.div
            initial={shouldReduceMotion ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.4, delay: 0.1, ease: 'easeOut' }}
            className="absolute inset-1 rounded-full bg-primary/10 border border-primary/20"
          />

          {/* Inner Solid Brand Badge */}
          <motion.div
            initial={shouldReduceMotion ? { scale: 1 } : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { type: 'spring', stiffness: 240, damping: 18, delay: 0.15 }
            }
            className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary text-white shadow-[0_4px_16px_rgba(14,33,21,0.25)] flex items-center justify-center"
          >
            <svg
              className="w-7 h-7 sm:w-8 sm:h-8 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <motion.path
                d="M5 13l4 4L19 7"
                initial={shouldReduceMotion ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { duration: 0.45, delay: 0.3, ease: 'easeOut' }
                }
              />
            </svg>
          </motion.div>
        </div>

        {/* Title */}
        <motion.h2
          initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.4, delay: 0.35 }}
          className="text-[26px] sm:text-[30px] md:text-[32px] font-heading font-bold text-foreground tracking-tight mb-2"
        >
          Registration Successful
        </motion.h2>

        {/* Confirmation Message */}
        <motion.p
          initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.4, delay: 0.42 }}
          className="text-[15px] sm:text-[16px] text-gray-700 font-medium mb-1.5 leading-relaxed"
        >
          Your land registration has been submitted successfully.
        </motion.p>

        <motion.p
          initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.4, delay: 0.48 }}
          className="text-[13px] sm:text-[14px] text-gray-500 mb-7 leading-relaxed"
        >
          {fullName ? `Thank you, ${fullName.split(' ')[0]}. ` : 'Thank you. '}
          Our team will review your details and get back to you.
        </motion.p>

        {/* What Happens Next Card */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.4, delay: 0.54 }}
          className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 mb-7 text-left shadow-2xs"
        >
          <h4 className="text-[14px] sm:text-[15px] font-bold text-foreground mb-3.5">
            What happens next?
          </h4>
          <div className="space-y-3.5">
            {[
              { step: '1', text: 'Trinfra will review your land details and verify the submission.' },
              { step: '2', text: `We’ll contact you via ${commMethodLabel} to discuss the next steps.` },
              { step: '3', text: 'If applicable, we’ll connect your parcel with relevant development opportunities.' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] sm:text-[11px] font-bold text-primary">{item.step}</span>
                </div>
                <p className="text-[12px] sm:text-[13px] text-gray-600 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Best-effort Disclaimer */}
        <p className="text-[11px] text-gray-400 mb-7 leading-relaxed">
          This submission does not constitute a commitment, guarantee of approval, or promise of specific returns or development outcomes. Trinfra facilitates connections and processes on a best-effort basis.
        </p>

        {/* Actions */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.4, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            href="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-white text-[14px] font-semibold hover:bg-primary-dark shadow-[0_4px_14px_rgba(14,33,21,0.18)] transition-all group"
          >
            <Home size={16} />
            Return Home
          </Link>
          <Link
            href="/#opportunities"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-gray-200 text-[14px] font-semibold text-foreground hover:bg-gray-50 transition-colors"
          >
            Explore Opportunities
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
