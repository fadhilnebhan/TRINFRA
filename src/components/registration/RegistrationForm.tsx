'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ShieldCheck, CheckCircle2, Lock, XCircle, Sparkles } from 'lucide-react';
import { FormData, StepProps, initialFormData, STEPS, STEP_HEADERS } from './types';
import { saveDraft, loadDraft, submitEnquiry, RegistrationDraft } from '@/lib/submissions';
import { validatePhone, validateEmail, validateLandArea, validateRequired, validateSelection } from '@/lib/validators';
import StepIndicator from './StepIndicator';
import StepYou from './StepYou';
import StepContact from './StepContact';
import StepLocation from './StepLocation';
import StepLand from './StepLand';
import StepInterest from './StepInterest';
import StepReview from './StepReview';
import SuccessScreen from './SuccessScreen';

export default function RegistrationForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [submitted, setSubmitted] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setFormData((prev) => ({ ...prev, ...draft }));
    }
  }, []);

  // Save draft on form data or step change
  useEffect(() => {
    if (!submitted) {
      saveDraft(formData as unknown as Partial<RegistrationDraft>);
    }
  }, [formData, currentStep, submitted]);

  const updateField = useCallback(<K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field as string];
      return next;
    });
  }, []);

  // Validation per step
  const validateStep = (step: number): Record<string, string> => {
    const errs: Record<string, string> = {};

    switch (step) {
      case 0: { // You
        const r = validateSelection(formData.landownerType, 'a landowner type');
        if (!r.valid) errs.landownerType = r.message;
        break;
      }
      case 1: { // Contact
        const nameR = validateRequired(formData.fullName, 'Full name');
        if (!nameR.valid) errs.fullName = nameR.message;
        const phoneR = validatePhone(formData.phone);
        if (!phoneR.valid) errs.phone = phoneR.message;
        const emailR = validateEmail(formData.email);
        if (!emailR.valid) errs.email = emailR.message;
        const commR = validateSelection(formData.communicationPreference, 'a communication method');
        if (!commR.valid) errs.communicationPreference = commR.message;
        break;
      }
      case 2: { // Location
        const distR = validateSelection(formData.district, 'a district');
        if (!distR.valid) errs.district = distR.message;
        const lbR = validateSelection(formData.localBody, 'a local body');
        if (!lbR.valid) errs.localBody = lbR.message;
        break;
      }
      case 3: { // Land
        const areaR = validateLandArea(formData.approximateArea);
        if (!areaR.valid) errs.approximateArea = areaR.message;
        const ownR = validateSelection(formData.ownershipStatus, 'an ownership status');
        if (!ownR.valid) errs.ownershipStatus = ownR.message;
        break;
      }
      case 4: { // Interest
        const poolR = validateSelection(formData.poolingInterest, 'a pooling interest');
        if (!poolR.valid) errs.poolingInterest = poolR.message;
        break;
      }
      case 5: { // Review
        if (!formData.consentGiven) errs.consentGiven = 'Please provide your consent to proceed.';
        break;
      }
    }

    return errs;
  };

  const handleNext = () => {
    const errs = validateStep(currentStep);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});

    if (currentStep === 5) {
      // Submit
      handleSubmit();
      return;
    }

    setCompletedSteps((prev) => prev.includes(currentStep) ? prev : [...prev, currentStep]);
    setDirection(1);
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setErrors({});
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleGoToStep = (step: number) => {
    if (step < currentStep || completedSteps.includes(step)) {
      setDirection(step > currentStep ? 1 : -1);
      setErrors({});
      setCurrentStep(step);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Small delay for perceived quality
      await new Promise((resolve) => setTimeout(resolve, 800));

      const draft: RegistrationDraft = {
        landownerType: formData.landownerType as 'individual' | 'family' | 'group',
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        communicationPreference: formData.communicationPreference as 'phone' | 'whatsapp' | 'email',
        district: formData.district,
        localBody: formData.localBody,
        locality: formData.locality,
        mapLocation: formData.mapLocation,
        approximateArea: formData.approximateArea,
        areaUnit: formData.areaUnit,
        ownershipStatus: formData.ownershipStatus as 'sole' | 'joint' | 'family' | 'community' | 'other',
        documents: formData.documents,
        poolingInterest: formData.poolingInterest as 'join' | 'create' | 'unsure',
      };

      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to submit registration');
      }

      const ref = result.referenceNumber;
      try {
        submitEnquiry(draft);
      } catch {
        // optional local storage cache
      }

      setReferenceNumber(ref);
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setErrors({ submit: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepProps: StepProps = {
    data: formData,
    updateField,
    errors,
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <StepYou {...stepProps} />;
      case 1: return <StepContact {...stepProps} />;
      case 2: return <StepLocation {...stepProps} />;
      case 3: return <StepLand {...stepProps} />;
      case 4: return <StepInterest {...stepProps} />;
      case 5: return <StepReview {...stepProps} onGoToStep={handleGoToStep} />;
      default: return null;
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex flex-col">
        <div className="flex-grow flex">
          {/* Sidebar — Success */}
          <aside className="hidden lg:flex lg:w-[340px] xl:w-[380px] shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("/images/rolling_hills.jpeg")' }} />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0E2115]/95 via-[#0E2115]/90 to-[#0E2115]/80" />
            <div className="relative z-10 flex flex-col justify-center p-10 xl:p-12 text-white">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-6">
                <ShieldCheck size={24} className="text-accent" />
              </div>
              <h2 className="text-[28px] font-heading font-bold leading-tight mb-4">
                Submitted <br />
                <span className="text-accent">Successfully.</span>
              </h2>
              <p className="text-white/70 text-[14px] leading-relaxed">
                Your enquiry is now in our system. We&apos;ll review your details and reach out to you soon.
              </p>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-grow bg-background">
            <SuccessScreen
              referenceNumber={referenceNumber}
              communicationPreference={formData.communicationPreference}
              fullName={formData.fullName}
            />
          </div>
        </div>

        {/* Footer */}
        {renderFooter()}
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] flex flex-col">
      <div className="flex-grow flex">
        {/* ========== LEFT SIDEBAR ========== */}
        <aside className="hidden lg:flex lg:w-[340px] xl:w-[380px] shrink-0 relative overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("/images/rolling_hills.jpeg")' }} />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0E2115]/95 via-[#0E2115]/90 to-[#0E2115]/80" />

          {/* Sidebar Content */}
          <div className="relative z-10 flex flex-col justify-between p-10 xl:p-12 h-full">
            <div>
              {/* Tagline */}
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-accent/80 mb-6">
                Land Together. Build Tomorrow.
              </p>

              {/* Heading */}
              <h2 className="text-[36px] xl:text-[40px] font-heading font-bold leading-[1.1] mb-6">
                <span className="text-white block">Your Land.</span>
                <span className="text-accent block">A Brighter Tomorrow.</span>
              </h2>

              {/* Description */}
              <p className="text-white/70 text-[14px] leading-relaxed mb-12 max-w-[280px]">
                Register your land with Trinfra and be part of a transparent, collaborative process that unlocks greater value for your land and your community.
              </p>

              {/* Trust Indicators */}
              <div className="space-y-5">
                {[
                  { icon: <CheckCircle2 size={18} strokeWidth={2} />, text: 'Simple & Secure Registration' },
                  { icon: <Lock size={18} strokeWidth={2} />, text: 'Your Information Stays Private' },
                  { icon: <XCircle size={18} strokeWidth={2} />, text: 'No Obligation to Proceed' },
                  { icon: <Sparkles size={18} strokeWidth={2} />, text: 'Be Part of a Better Tomorrow' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/60 shrink-0">
                      {item.icon}
                    </div>
                    <span className="text-white/80 text-[13px] font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quote */}
            <div className="mt-12">
              <p className="text-white/60 text-[14px] italic leading-relaxed mb-2">
                &ldquo;Stronger communities begin with empowered landowners.&rdquo;
              </p>
              <p className="text-white/40 text-[11px] font-bold tracking-widest uppercase">
                Trinfra
              </p>
            </div>
          </div>
        </aside>

        {/* ========== RIGHT CONTENT ========== */}
        <div className="flex-grow bg-background overflow-y-auto">
          <div className="max-w-[820px] mx-auto px-5 sm:px-8 md:px-12 py-8 md:py-10">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-primary mb-3">
                  Register Your Land
                </p>
                <h1 className="text-[30px] md:text-[36px] font-heading font-bold text-foreground leading-tight">
                  {STEP_HEADERS[currentStep].title}
                </h1>
              </div>
              {/* Security Badge */}
              <div className="hidden sm:flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-lg px-3 py-2 shrink-0 ml-4">
                <ShieldCheck size={18} className="text-primary/60" />
                <div>
                  <p className="text-[11px] font-semibold text-foreground/70 leading-tight">Your information is secure</p>
                  <p className="text-[10px] text-gray-400 leading-tight">and kept private.</p>
                </div>
              </div>
            </div>
            <p className="text-[15px] text-gray-500 mb-6">
              {STEP_HEADERS[currentStep].subtitle}
            </p>

            {/* Step Indicator */}
            <StepIndicator currentStep={currentStep} completedSteps={completedSteps} />

            {/* Step Content */}
            <div className="min-h-[400px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: direction > 0 ? 24 : -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction > 0 ? -24 : 24 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  {renderStep()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-[13px] text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
              {currentStep > 0 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-200 text-[14px] font-semibold text-foreground hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
              ) : (
                <Link
                  href="/"
                  className="flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-200 text-[14px] font-semibold text-foreground hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Back
                </Link>
              )}

              <button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                id="registration-next-btn"
                className={`flex items-center gap-2 px-8 py-3 rounded-lg text-[14px] font-bold transition-all group ${
                  currentStep === 5
                    ? 'bg-accent text-white hover:bg-accent-hover shadow-md shadow-accent/20 disabled:opacity-70'
                    : 'bg-primary text-white hover:bg-primary-dark shadow-md shadow-primary/20 disabled:opacity-70'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Submitting...
                  </>
                ) : currentStep === 5 ? (
                  <>
                    Submit Enquiry
                    <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      {renderFooter()}
    </div>
  );
}

function renderFooter() {
  return (
    <footer className="bg-[#050B07] py-5">
      <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 20H22L12 2Z" fill="url(#paint0_linear_reg_footer)"/>
              <defs>
                <linearGradient id="paint0_linear_reg_footer" x1="2" y1="20" x2="22" y2="2" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#BD9655" />
                  <stop offset="0.5" stopColor="#0E2115" />
                  <stop offset="1" stopColor="#34D399" />
                </linearGradient>
              </defs>
            </svg>
            <span className="font-heading font-bold text-[14px] text-white tracking-widest uppercase">Trinfra</span>
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-6 gap-y-1 text-[12px] text-white/50 text-center">
          <span>People</span>
          <span className="text-white/20">|</span>
          <span>Land</span>
          <span className="text-white/20">|</span>
          <span>Opportunities</span>
          <span className="text-white/20">|</span>
          <span>Stronger Communities</span>
        </div>

        <p className="text-[11px] text-white/40">
          &copy; {new Date().getFullYear()} Trinfra. Designed for impact.
        </p>
      </div>
    </footer>
  );
}
