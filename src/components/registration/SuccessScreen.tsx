'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Copy, ArrowRight, Home } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface SuccessScreenProps {
  referenceNumber: string;
  communicationPreference: string;
  fullName: string;
}

export default function SuccessScreen({ referenceNumber, communicationPreference, fullName }: SuccessScreenProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(referenceNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const commMethodLabel = communicationPreference === 'whatsapp' ? 'WhatsApp' : communicationPreference === 'phone' ? 'phone' : 'email';

  return (
    <div className="flex items-center justify-center min-h-[600px] py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-[520px] mx-auto px-6"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className="mb-8"
        >
          <div className="relative w-24 h-24 mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="absolute inset-0 rounded-full bg-primary/5"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute inset-2 rounded-full bg-primary/10"
            />
            <div className="absolute inset-4 rounded-full bg-primary flex items-center justify-center">
              <motion.div
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                <CheckCircle2 size={32} className="text-white" strokeWidth={2.5} />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <h2 className="text-[28px] md:text-[32px] font-heading font-bold text-foreground mb-3">
          Your land enquiry has been submitted
        </h2>
        <p className="text-[15px] text-gray-500 mb-8 leading-relaxed">
          Thank you{fullName ? `, ${fullName.split(' ')[0]}` : ''}. We&apos;ve received your registration and our team will review your submission.
        </p>

        {/* Reference Number */}
        <div className="bg-surface-alt border border-gray-200 rounded-xl p-6 mb-8 inline-block mx-auto">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Reference Number</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-[24px] md:text-[28px] font-heading font-bold text-primary tracking-wider">
              {referenceNumber}
            </span>
            <button
              onClick={handleCopy}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors group"
              title="Copy reference number"
            >
              {copied ? (
                <CheckCircle2 size={18} className="text-primary" />
              ) : (
                <Copy size={18} className="text-gray-400 group-hover:text-foreground" />
              )}
            </button>
          </div>
          {copied && <p className="text-[11px] text-primary mt-1">Copied to clipboard!</p>}
        </div>

        {/* What Happens Next */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 text-left">
          <h4 className="text-[15px] font-bold text-foreground mb-4">What happens next?</h4>
          <div className="space-y-4">
            {[
              { step: '1', text: 'Trinfra will review your submission and verify the details.' },
              { step: '2', text: `We\u2019ll contact you via ${commMethodLabel} to discuss the next steps.` },
              { step: '3', text: 'If applicable, we\u2019ll connect you with relevant opportunities in your area.' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[11px] font-bold text-primary">{item.step}</span>
                </div>
                <p className="text-[13px] text-gray-600 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-[11px] text-gray-400 mb-8 leading-relaxed">
          This submission does not constitute a commitment, guarantee of approval, or promise of specific returns or development outcomes. Trinfra facilitates connections and processes on a best-effort basis.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-200 text-[14px] font-semibold text-foreground hover:bg-gray-50 transition-colors"
          >
            <Home size={16} />
            Return to Trinfra
          </Link>
          <Link
            href="/#opportunities"
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white text-[14px] font-semibold hover:bg-primary-dark transition-colors group"
          >
            Explore Opportunities
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
