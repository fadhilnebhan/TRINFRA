'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Briefcase,
  Handshake,
  Sparkles,
  Check,
  User,
  Building2,
  Phone,
  Mail,
  MessageSquare,
  FileText,
  Calendar,
  HelpCircle,
} from 'lucide-react';
import { getOpportunityById } from '@/lib/opportunitiesData';
import {
  submitInvestorEnquiry,
  ROLE_LABELS,
  INTEREST_LABELS,
  type EnquiryDraft,
  type EnquiryRole,
  type EnquiryInterest,
} from '@/lib/enquirySubmissions';
import { validatePhone, validateEmail, validateRequired } from '@/lib/validators';
import EnquirySuccess from './EnquirySuccess';

const STEPS = [
  { number: 1, label: 'Your Details' },
  { number: 2, label: 'Your Interest' },
  { number: 3, label: 'Review' },
];

interface EnquiryFormProps {
  opportunityId: string;
}

interface FormState {
  name: string;
  company: string;
  phone: string;
  email: string;
  role: EnquiryRole | '';
  interest: EnquiryInterest | '';
  message: string;
}

const initialForm: FormState = {
  name: '',
  company: '',
  phone: '',
  email: '',
  role: '',
  interest: '',
  message: '',
};

export default function EnquiryForm({ opportunityId }: EnquiryFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [formData, setFormData] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [direction, setDirection] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const opportunity = getOpportunityById(opportunityId);

  const updateField = useCallback(
    <K extends keyof FormState>(field: K, value: FormState[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field as string];
        return next;
      });
    },
    []
  );

  const validateStep = (step: number): Record<string, string> => {
    const errs: Record<string, string> = {};

    if (step === 0) {
      const nameR = validateRequired(formData.name, 'Full name');
      if (!nameR.valid) errs.name = nameR.message;
      const phoneR = validatePhone(formData.phone);
      if (!phoneR.valid) errs.phone = phoneR.message;
      const emailR = validateEmail(formData.email);
      if (!emailR.valid) errs.email = emailR.message;
      if (!formData.role) errs.role = 'Please select your role.';
    }

    if (step === 1) {
      if (!formData.interest) errs.interest = 'Please select your interest.';
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

    if (currentStep === 2) {
      handleSubmit();
      return;
    }

    setCompletedSteps((prev) =>
      prev.includes(currentStep) ? prev : [...prev, currentStep]
    );
    setDirection(1);
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setErrors({});
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const draft: EnquiryDraft = {
        name: formData.name,
        company: formData.company,
        phone: formData.phone,
        email: formData.email,
        role: formData.role as EnquiryRole,
        interest: formData.interest as EnquiryInterest,
        opportunityId,
        message: formData.message,
      };

      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to submit enquiry');
      }

      const ref = result.referenceNumber;
      try {
        submitInvestorEnquiry(draft);
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

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex flex-col">
        <div className="flex-grow flex">
          {/* Sidebar — Success */}
          <aside className="hidden lg:flex lg:w-[340px] xl:w-[380px] shrink-0 relative overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: 'url("/images/houses_tropical.jpeg")',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0E2115]/95 via-[#0E2115]/90 to-[#0E2115]/80" />
            <div className="relative z-10 flex flex-col justify-center p-10 xl:p-12 text-white">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-6">
                <ShieldCheck size={24} className="text-accent" />
              </div>
              <h2 className="text-[28px] font-heading font-bold leading-tight mb-4">
                Enquiry <br />
                <span className="text-accent">Submitted.</span>
              </h2>
              <p className="text-white/70 text-[14px] leading-relaxed">
                Your enquiry has been recorded. Our team will review your
                details and reach out shortly.
              </p>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-grow bg-background">
            <EnquirySuccess
              referenceNumber={referenceNumber}
              opportunityTitle={opportunity?.title || ''}
              opportunityId={opportunityId}
            />
          </div>
        </div>
        {renderFooter()}
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] flex flex-col">
      <div className="flex-grow flex">
        {/* ========== LEFT SIDEBAR ========== */}
        <aside className="hidden lg:flex lg:w-[340px] xl:w-[380px] shrink-0 relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url("/images/houses_tropical.jpeg")',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0E2115]/95 via-[#0E2115]/90 to-[#0E2115]/80" />

          <div className="relative z-10 flex flex-col justify-between p-10 xl:p-12 h-full">
            <div>
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-accent/80 mb-6">
                Partner with Trinfra
              </p>

              <h2 className="text-[36px] xl:text-[40px] font-heading font-bold leading-[1.1] mb-6">
                <span className="text-white block">Let&apos;s Build</span>
                <span className="text-accent block">Better Together.</span>
              </h2>

              <p className="text-white/70 text-[14px] leading-relaxed mb-12 max-w-[280px]">
                Share your interest in this opportunity and our team will get in
                touch with you shortly.
              </p>

              <div className="space-y-5">
                {[
                  {
                    icon: <Briefcase size={18} strokeWidth={2} />,
                    text: 'Credible Opportunities',
                  },
                  {
                    icon: <CheckCircle2 size={18} strokeWidth={2} />,
                    text: 'Verified Information',
                  },
                  {
                    icon: <Handshake size={18} strokeWidth={2} />,
                    text: 'Transparent Process',
                  },
                  {
                    icon: <Sparkles size={18} strokeWidth={2} />,
                    text: 'Professional Support',
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/60 shrink-0">
                      {item.icon}
                    </div>
                    <span className="text-white/80 text-[13px] font-medium">
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12">
              <p className="text-white/60 text-[14px] italic leading-relaxed mb-2">
                &ldquo;Collaborative development creates stronger
                communities.&rdquo;
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
                  Developer / Investor Enquiry
                </p>
                <h1 className="text-[28px] md:text-[34px] font-heading font-bold text-foreground leading-tight">
                  {currentStep === 0
                    ? 'Your Details'
                    : currentStep === 1
                      ? 'Your Interest'
                      : 'Review Your Enquiry'}
                </h1>
              </div>
              {opportunity && (
                <div className="hidden sm:flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-lg px-3 py-2 shrink-0 ml-4">
                  <Building2 size={16} className="text-primary/60" />
                  <div>
                    <p className="text-[11px] font-semibold text-foreground/70 leading-tight">
                      {opportunity.title}
                    </p>
                    <p className="text-[10px] text-gray-400 leading-tight">
                      {opportunity.location}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <p className="text-[15px] text-gray-500 mb-6">
              {currentStep === 0
                ? 'Tell us about yourself and your organization.'
                : currentStep === 1
                  ? 'What are you interested in?'
                  : 'Please review your information before submitting.'}
            </p>

            {/* ====== STEP INDICATOR ====== */}
            <div className="w-full py-6">
              {/* Desktop */}
              <div className="hidden md:flex items-start justify-between relative">
                {STEPS.map((step, index) => {
                  const isCompleted = completedSteps.includes(index);
                  const isActive = index === currentStep;

                  return (
                    <div
                      key={step.number}
                      className="flex flex-col items-center relative z-10 flex-1"
                    >
                      <div className="flex items-center w-full justify-center">
                        {index > 0 && (
                          <div
                            className={`h-[2px] flex-1 ${
                              completedSteps.includes(index - 1)
                                ? 'bg-primary'
                                : 'bg-gray-200'
                            }`}
                          />
                        )}
                        <div
                          className={`w-[38px] h-[38px] rounded-full flex items-center justify-center text-[14px] font-bold shrink-0 transition-all duration-300 ${
                            isCompleted
                              ? 'bg-primary text-white'
                              : isActive
                                ? 'bg-primary text-white shadow-md shadow-primary/20'
                                : 'bg-white border-2 border-gray-200 text-gray-400'
                          }`}
                        >
                          {isCompleted ? (
                            <Check size={16} strokeWidth={3} />
                          ) : (
                            step.number
                          )}
                        </div>
                        {index < STEPS.length - 1 && (
                          <div
                            className={`h-[2px] flex-1 ${
                              isCompleted ? 'bg-primary' : 'bg-gray-200'
                            }`}
                          />
                        )}
                      </div>
                      <div className="mt-3 text-center">
                        <p
                          className={`text-[13px] font-semibold leading-tight ${
                            isActive
                              ? 'text-foreground'
                              : isCompleted
                                ? 'text-primary'
                                : 'text-gray-400'
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mobile */}
              <div className="md:hidden flex items-center justify-center gap-2">
                {STEPS.map((step, index) => {
                  const isCompleted = completedSteps.includes(index);
                  const isActive = index === currentStep;
                  return (
                    <div key={step.number} className="flex items-center gap-2">
                      <div
                        className={`w-[30px] h-[30px] rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 ${
                          isCompleted
                            ? 'bg-primary text-white'
                            : isActive
                              ? 'bg-primary text-white'
                              : 'bg-white border-2 border-gray-200 text-gray-400'
                        }`}
                      >
                        {isCompleted ? (
                          <Check size={13} strokeWidth={3} />
                        ) : (
                          step.number
                        )}
                      </div>
                      {isActive && (
                        <span className="text-[12px] font-semibold text-foreground">
                          {step.label}
                        </span>
                      )}
                      {index < STEPS.length - 1 && (
                        <div
                          className={`w-4 h-[2px] ${
                            isCompleted ? 'bg-primary' : 'bg-gray-200'
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ====== STEP CONTENT ====== */}
            <div className="min-h-[400px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: direction > 0 ? 24 : -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction > 0 ? -24 : 24 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  {currentStep === 0 && (
                    <StepDetails
                      data={formData}
                      errors={errors}
                      updateField={updateField}
                    />
                  )}
                  {currentStep === 1 && (
                    <StepInterest
                      data={formData}
                      errors={errors}
                      updateField={updateField}
                      opportunityTitle={opportunity?.title || ''}
                    />
                  )}
                  {currentStep === 2 && (
                    <StepReview
                      data={formData}
                      opportunityTitle={opportunity?.title || ''}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-[13px] text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* ====== NAVIGATION BUTTONS ====== */}
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
                  href={`/opportunities/${opportunityId}`}
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
                id="enquiry-next-btn"
                className={`flex items-center gap-2 px-8 py-3 rounded-lg text-[14px] font-bold transition-all group ${
                  currentStep === 2
                    ? 'bg-accent text-white hover:bg-accent-hover shadow-md shadow-accent/20 disabled:opacity-70'
                    : 'bg-primary text-white hover:bg-primary-dark shadow-md shadow-primary/20 disabled:opacity-70'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Submitting...
                  </>
                ) : currentStep === 2 ? (
                  <>
                    Submit Enquiry
                    <ArrowRight
                      size={16}
                      className="group-hover:translate-x-0.5 transition-transform"
                    />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight
                      size={16}
                      className="group-hover:translate-x-0.5 transition-transform"
                    />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {renderFooter()}
    </div>
  );
}

/* ====== STEP 1: YOUR DETAILS ====== */
function StepDetails({
  data,
  errors,
  updateField,
}: {
  data: FormState;
  errors: Record<string, string>;
  updateField: <K extends keyof FormState>(field: K, value: FormState[K]) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Full Name */}
        <div>
          <label className="text-[13px] font-semibold text-foreground mb-1.5 block">
            Full Name <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <User
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              id="enquiry-name"
              type="text"
              value={data.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Enter your full name"
              className={`w-full pl-10 pr-4 py-3 rounded-lg border text-[14px] focus:outline-none focus:ring-1 transition-colors ${
                errors.name
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                  : 'border-gray-200 focus:border-primary/30 focus:ring-primary/10'
              }`}
            />
          </div>
          {errors.name && (
            <p className="text-[12px] text-red-500 mt-1">{errors.name}</p>
          )}
        </div>

        {/* Company */}
        <div>
          <label className="text-[13px] font-semibold text-foreground mb-1.5 block">
            Company / Organization
          </label>
          <div className="relative">
            <Building2
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              id="enquiry-company"
              type="text"
              value={data.company}
              onChange={(e) => updateField('company', e.target.value)}
              placeholder="Enter company name"
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 text-[14px] focus:outline-none focus:border-primary/30 focus:ring-1 focus:ring-primary/10 transition-colors"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="text-[13px] font-semibold text-foreground mb-1.5 block">
            Phone Number <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[13px] font-medium">
              +91
            </span>
            <input
              id="enquiry-phone"
              type="tel"
              value={data.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="Enter phone number"
              className={`w-full pl-12 pr-4 py-3 rounded-lg border text-[14px] focus:outline-none focus:ring-1 transition-colors ${
                errors.phone
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                  : 'border-gray-200 focus:border-primary/30 focus:ring-primary/10'
              }`}
            />
          </div>
          {errors.phone && (
            <p className="text-[12px] text-red-500 mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="text-[13px] font-semibold text-foreground mb-1.5 block">
            Email Address <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <Mail
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              id="enquiry-email"
              type="email"
              value={data.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="Enter email address"
              className={`w-full pl-10 pr-4 py-3 rounded-lg border text-[14px] focus:outline-none focus:ring-1 transition-colors ${
                errors.email
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                  : 'border-gray-200 focus:border-primary/30 focus:ring-primary/10'
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-[12px] text-red-500 mt-1">{errors.email}</p>
          )}
        </div>
      </div>

      {/* Role */}
      <div>
        <label className="text-[13px] font-semibold text-foreground mb-3 block">
          Your Role <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(
            [
              {
                value: 'developer',
                label: 'Developer',
                icon: Building2,
                desc: 'Real estate development',
              },
              {
                value: 'investor',
                label: 'Investor',
                icon: Briefcase,
                desc: 'Investment & funding',
              },
              {
                value: 'other',
                label: 'Other',
                icon: User,
                desc: 'Other interest',
              },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateField('role', opt.value)}
              className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all text-center ${
                data.role === opt.value
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <opt.icon
                size={22}
                className={
                  data.role === opt.value ? 'text-primary mb-2' : 'text-gray-400 mb-2'
                }
              />
              <span
                className={`text-[14px] font-semibold ${
                  data.role === opt.value ? 'text-foreground' : 'text-gray-600'
                }`}
              >
                {opt.label}
              </span>
              <span className="text-[11px] text-gray-400 mt-0.5">
                {opt.desc}
              </span>
            </button>
          ))}
        </div>
        {errors.role && (
          <p className="text-[12px] text-red-500 mt-1.5">{errors.role}</p>
        )}
      </div>
    </div>
  );
}

/* ====== STEP 2: YOUR INTEREST ====== */
function StepInterest({
  data,
  errors,
  updateField,
  opportunityTitle,
}: {
  data: FormState;
  errors: Record<string, string>;
  updateField: <K extends keyof FormState>(field: K, value: FormState[K]) => void;
  opportunityTitle: string;
}) {
  const interestOptions: {
    value: EnquiryInterest;
    label: string;
    icon: typeof FileText;
    desc: string;
  }[] = [
    {
      value: 'request_info',
      label: 'Request Project Information',
      icon: FileText,
      desc: 'Detailed project docs and data',
    },
    {
      value: 'explore_partnership',
      label: 'Explore Partnership',
      icon: Handshake,
      desc: 'Development collaboration',
    },
    {
      value: 'schedule_discussion',
      label: 'Schedule a Discussion',
      icon: Calendar,
      desc: 'Talk with the Trinfra team',
    },
    {
      value: 'not_sure',
      label: 'Not Sure Yet',
      icon: HelpCircle,
      desc: 'Just exploring options',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Selected Opportunity (auto-filled) */}
      <div className="bg-primary/5 rounded-xl p-4 border border-primary/10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Building2 size={18} className="text-primary" />
        </div>
        <div>
          <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
            Selected Opportunity
          </p>
          <p className="text-[15px] font-bold text-foreground">
            {opportunityTitle}
          </p>
        </div>
      </div>

      {/* Interest */}
      <div>
        <label className="text-[13px] font-semibold text-foreground mb-3 block">
          What are you interested in? <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {interestOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateField('interest', opt.value)}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                data.interest === opt.value
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  data.interest === opt.value
                    ? 'bg-primary/10'
                    : 'bg-gray-100'
                }`}
              >
                <opt.icon
                  size={20}
                  className={
                    data.interest === opt.value
                      ? 'text-primary'
                      : 'text-gray-400'
                  }
                />
              </div>
              <div>
                <p
                  className={`text-[14px] font-semibold ${
                    data.interest === opt.value
                      ? 'text-foreground'
                      : 'text-gray-600'
                  }`}
                >
                  {opt.label}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>
        {errors.interest && (
          <p className="text-[12px] text-red-500 mt-1.5">{errors.interest}</p>
        )}
      </div>

      {/* Message */}
      <div>
        <label className="text-[13px] font-semibold text-foreground mb-1.5 block">
          Message{' '}
          <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <div className="relative">
          <MessageSquare
            size={16}
            className="absolute left-3.5 top-3.5 text-gray-400"
          />
          <textarea
            id="enquiry-message"
            value={data.message}
            onChange={(e) => updateField('message', e.target.value)}
            placeholder="Share any specific questions or requirements..."
            rows={4}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 text-[14px] focus:outline-none focus:border-primary/30 focus:ring-1 focus:ring-primary/10 transition-colors resize-none"
          />
        </div>
      </div>
    </div>
  );
}

/* ====== STEP 3: REVIEW ====== */
function StepReview({
  data,
  opportunityTitle,
}: {
  data: FormState;
  opportunityTitle: string;
}) {
  const reviewItems = [
    {
      icon: Building2,
      label: 'Opportunity',
      value: opportunityTitle,
    },
    { icon: User, label: 'Name', value: data.name },
    {
      icon: Building2,
      label: 'Company',
      value: data.company || '—',
    },
    {
      icon: Phone,
      label: 'Phone',
      value: data.phone ? `+91 ${data.phone}` : '—',
    },
    { icon: Mail, label: 'Email', value: data.email },
    {
      icon: Briefcase,
      label: 'Role',
      value: data.role ? ROLE_LABELS[data.role as EnquiryRole] : '—',
    },
    {
      icon: FileText,
      label: 'Interest',
      value: data.interest
        ? INTEREST_LABELS[data.interest as EnquiryInterest]
        : '—',
    },
    {
      icon: MessageSquare,
      label: 'Message',
      value: data.message || '—',
    },
  ];

  return (
    <div>
      <p className="text-[14px] text-gray-500 mb-6">
        Please review your information before submitting.
      </p>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {reviewItems.map((item, i) => (
          <div key={i} className="flex items-start gap-4 p-4">
            <div className="w-8 h-8 rounded-lg bg-surface-alt flex items-center justify-center shrink-0 mt-0.5">
              <item.icon size={15} className="text-gray-400" />
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">
                {item.label}
              </p>
              <p className="text-[14px] text-foreground font-medium break-words">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-gray-400 mt-6 leading-relaxed">
        By submitting this enquiry, you agree to allow Trinfra to contact you
        regarding this opportunity. This submission does not constitute a
        commitment, guarantee of returns, or promise of project allocation.
      </p>
    </div>
  );
}

/* ====== FOOTER ====== */
function renderFooter() {
  return (
    <footer className="bg-[#050B07] py-5">
      <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L2 20H22L12 2Z"
                fill="url(#paint0_linear_enq_footer)"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_enq_footer"
                  x1="2"
                  y1="20"
                  x2="22"
                  y2="2"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#BD9655" />
                  <stop offset="0.5" stopColor="#0E2115" />
                  <stop offset="1" stopColor="#34D399" />
                </linearGradient>
              </defs>
            </svg>
            <span className="font-heading font-bold text-[14px] text-white tracking-widest uppercase">
              Trinfra
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-6 text-[12px] text-white/50">
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
