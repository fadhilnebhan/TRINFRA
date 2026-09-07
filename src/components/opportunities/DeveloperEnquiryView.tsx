'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  TrendingUp,
  User,
  Phone,
  Mail,
  ShieldCheck,
  FileText,
  Eye,
  Users,
  Lock,
  ArrowRight,
  CheckCircle2,
  X,
  MapPin,
  BookOpen,
  MessageCircle,
  Loader2,
  Check,
} from 'lucide-react';
import {
  type Opportunity,
} from '@/lib/opportunitiesData';
import {
  submitInvestorEnquiry,
  type EnquiryDraft,
  type EnquiryRole,
  type EnquiryInterest,
} from '@/lib/enquirySubmissions';
import CustomSelect, { SelectOption } from './CustomSelect';
import { validatePhone, validateEmail, validateRequired } from '@/lib/validators';

interface DeveloperEnquiryViewProps {
  initialOpportunityId?: string;
  initialOpportunity?: Opportunity | null;
  opportunitiesList?: Opportunity[];
}

const INTEREST_OPTIONS: SelectOption[] = [
  { value: 'development_opportunity', label: 'Development Opportunity' },
  { value: 'investment_opportunity', label: 'Investment Opportunity' },
  { value: 'joint_development', label: 'Joint Development' },
  { value: 'land_pooling_partnership', label: 'Land Pooling Partnership' },
  { value: 'other', label: 'Other' },
];

const INVESTMENT_RANGE_OPTIONS: SelectOption[] = [
  { value: 'under_1cr', label: 'Under ₹1 Crore' },
  { value: '1_5cr', label: '₹1–5 Crore' },
  { value: '5_10cr', label: '₹5–10 Crore' },
  { value: '10_25cr', label: '₹10–25 Crore' },
  { value: 'above_25cr', label: '₹25 Crore+' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const LOCATION_OPTIONS: SelectOption[] = [
  { value: 'all_kerala', label: 'All Kerala' },
  { value: 'kozhikode', label: 'Kozhikode' },
  { value: 'malappuram', label: 'Malappuram' },
  { value: 'palakkad', label: 'Palakkad' },
  { value: 'thrissur', label: 'Thrissur' },
  { value: 'ernakulam', label: 'Ernakulam / Kochi' },
  { value: 'wayanad', label: 'Wayanad' },
  { value: 'kannur', label: 'Kannur' },
  { value: 'kasaragod', label: 'Kasaragod' },
  { value: 'other', label: 'Other' },
];

const DEFAULT_OPPORTUNITY: Opportunity = {
  id: 'OPP-1',
  title: 'Kozhikode North',
  location: 'Kozhikode, Kerala',
  district: 'Kozhikode',
  locality: 'Vadakara',
  area: 125,
  areaUnit: 'Acres',
  landowners: 18,
  status: 'In Progress',
  image: '/images/houses_tropical.jpeg',
  shortDescription: 'Strategic location with strong development potential.',
  overview: '',
  highlights: [],
  developmentPotential: '',
  currentStatusDetail: '',
  coordinates: { lat: 11.35, lng: 75.78 },
};

export default function DeveloperEnquiryView({
  initialOpportunityId = 'OPP-1',
  initialOpportunity = null,
  opportunitiesList = [],
}: DeveloperEnquiryViewProps) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(opportunitiesList);

  useEffect(() => {
    if (opportunitiesList && opportunitiesList.length > 0) {
      setOpportunities(opportunitiesList);
      return;
    }
    fetch('/api/opportunities')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.opportunities)) {
          setOpportunities(data.opportunities);
        }
      })
      .catch(() => {});
  }, [opportunitiesList]);

  // Resolve initial opportunity
  const initialOpp = useMemo(() => {
    if (initialOpportunity) return initialOpportunity;
    return (
      opportunities.find((o) => o.id === initialOpportunityId) ||
      opportunities[0] ||
      DEFAULT_OPPORTUNITY
    );
  }, [initialOpportunity, initialOpportunityId, opportunities]);

  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity>(initialOpp);

  useEffect(() => {
    if (initialOpp) {
      setSelectedOpportunity((prev) => (prev.id === DEFAULT_OPPORTUNITY.id ? initialOpp : prev));
    }
  }, [initialOpp]);

  const [isModalOpen, setIsModalOpen] = useState(false);


  // Form states
  const [userType, setUserType] = useState<'Developer' | 'Investor'>('Developer');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [contactMethod, setContactMethod] = useState<'Phone' | 'WhatsApp' | 'Email'>('Phone');

  const [interestType, setInterestType] = useState('');
  const [investmentRange, setInvestmentRange] = useState('');
  const [preferredLocation, setPreferredLocation] = useState('');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(true);

  // Validation & status
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [referenceCode, setReferenceCode] = useState('');

  const validate = () => {
    const errs: Record<string, string> = {};

    const nameVal = validateRequired(fullName, 'Full name');
    if (!nameVal.valid) errs.fullName = nameVal.message;

    const companyVal = validateRequired(companyName, 'Company name');
    if (!companyVal.valid) errs.companyName = companyVal.message;

    const emailVal = validateEmail(email);
    if (!emailVal.valid) errs.email = emailVal.message;

    const phoneVal = validatePhone(phone);
    if (!phoneVal.valid) errs.phone = phoneVal.message;

    if (!interestType) {
      errs.interestType = 'Please select what type of interest you have.';
    }

    if (!consent) {
      errs.consent = 'Please agree to be contacted by TRINFRA regarding this enquiry.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const interestLabel =
      INTEREST_OPTIONS.find((o) => o.value === interestType)?.label || interestType;
    const rangeLabel =
      INVESTMENT_RANGE_OPTIONS.find((o) => o.value === investmentRange)?.label || '';
    const locLabel =
      LOCATION_OPTIONS.find((o) => o.value === preferredLocation)?.label || '';

    // Map to EnquiryDraft
    const role: EnquiryRole = userType.toLowerCase() as EnquiryRole;
    let interestKey: EnquiryInterest = 'request_info';
    if (interestType.includes('development') || interestType.includes('joint')) {
      interestKey = 'explore_partnership';
    } else if (interestType.includes('schedule')) {
      interestKey = 'schedule_discussion';
    }

    const draft: EnquiryDraft = {
      name: fullName.trim(),
      company: companyName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role,
      interest: interestKey,
      opportunityId: selectedOpportunity.id,
      opportunityTitle: selectedOpportunity.title,
      investmentRange: rangeLabel,
      preferredContactMethod: contactMethod,
      preferredLocation: locLabel,
      interestType: interestLabel,
      message: message.trim() || `Interest expressed in ${selectedOpportunity.title} as ${userType}.`,
    };

    const sendEnquiry = async () => {
      try {
        const res = await fetch('/api/enquiries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(draft),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.referenceNumber) {
            setReferenceCode(data.referenceNumber);
            try {
              submitInvestorEnquiry(draft);
            } catch {
              // optional cache
            }
            setIsSuccess(true);
            return;
          }
        }
        throw new Error('API submission fallback');
      } catch (err) {
        console.error('Submission error, fallback to local:', err);
        try {
          const ref = submitInvestorEnquiry(draft);
          setReferenceCode(ref);
        } catch {
          const fallbackRef = `TRN-ENQ-${Date.now().toString().slice(-6)}`;
          setReferenceCode(fallbackRef);
        }
        setIsSuccess(true);
      } finally {
        setIsSubmitting(false);
      }
    };

    sendEnquiry();
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6]/80 pb-20">
      {/* ================= HERO HEADER ================= */}
      <section className="relative overflow-hidden pt-8 pb-10 border-b border-gray-200/60 bg-white">
        {/* Subtle Right Landscape Image Overlay */}
        <div className="absolute right-0 top-0 bottom-0 w-full md:w-1/2 pointer-events-none opacity-40 select-none overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/houses_tropical.jpeg"
            alt="Kerala Landscape"
            className="w-full h-full object-cover object-right"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white" />

          {/* Script Text Overlay matching mockup */}
          <div className="hidden lg:block absolute top-8 right-12 text-right">
            <p className="font-serif italic text-foreground/75 text-[17px] tracking-wide">
              Land today.
            </p>
            <p className="font-serif italic text-foreground/75 text-[16px] tracking-wide -mt-0.5">
              Greater communities tomorrow.
            </p>
          </div>
        </div>

        <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16 relative z-10">
          <div className="max-w-2xl">
            {/* Eyebrow */}
            <p className="text-[12px] md:text-[13px] font-bold text-[#BD9655] tracking-[0.18em] uppercase mb-2.5">
              DEVELOPER / INVESTOR ENQUIRY
            </p>

            {/* Main Heading */}
            <h1 className="text-[34px] sm:text-[42px] md:text-[46px] font-heading font-extrabold text-foreground tracking-tight leading-[1.12]">
              Let&apos;s Build the Right Opportunity{' '}
              <span className="text-[#BD9655]">Together.</span>
            </h1>

            {/* Supporting Text */}
            <p className="mt-3.5 text-[15px] sm:text-[16px] text-gray-600 leading-relaxed max-w-xl">
              Tell us what you&apos;re looking for and our team will connect you with relevant
              land-pooling opportunities.
            </p>
          </div>
        </div>
      </section>

      {/* ================= MAIN 2-COLUMN LAYOUT ================= */}
      <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16 mt-8 md:mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* ================= LEFT COLUMN: OPPORTUNITY + TRUST (~38%) ================= */}
          <div className="lg:col-span-5 space-y-6">
            {/* Card 1: Selected Opportunity */}
            <div className="bg-white rounded-[20px] p-6 border border-gray-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                <h2 className="font-heading font-extrabold text-[17px] text-foreground">
                  Selected Opportunity
                </h2>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#BD9655] hover:text-[#9c7a3f] transition-colors cursor-pointer"
                >
                  <span>Change Opportunity</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              {/* Opportunity Preview Image */}
              <div className="relative rounded-[14px] overflow-hidden aspect-[16/9] mb-4 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedOpportunity.image}
                  alt={selectedOpportunity.title}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#0E2115]/90 text-white backdrop-blur-sm shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#BD9655]" />
                    {selectedOpportunity.status}
                  </span>
                </div>
              </div>

              {/* Opportunity Info */}
              <div>
                <h3 className="text-[20px] font-heading font-extrabold text-foreground">
                  {selectedOpportunity.title}
                </h3>
                <div className="flex items-center gap-1 text-[13px] text-gray-500 mt-1">
                  <MapPin size={14} className="text-[#BD9655] shrink-0" />
                  <span>{selectedOpportunity.location}</span>
                </div>

                {/* 3 Metrics Row */}
                <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-gray-100 text-center">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1 text-gray-400 mb-1">
                      <BookOpen size={15} className="text-[#BD9655]" />
                    </div>
                    <span className="font-heading font-extrabold text-[16px] text-foreground">
                      {selectedOpportunity.area}
                    </span>
                    <span className="text-[11px] text-gray-500 font-medium">Acres</span>
                  </div>

                  <div className="flex flex-col items-center border-x border-gray-100">
                    <div className="flex items-center gap-1 text-gray-400 mb-1">
                      <Users size={15} className="text-[#BD9655]" />
                    </div>
                    <span className="font-heading font-extrabold text-[16px] text-foreground">
                      {selectedOpportunity.landowners}
                    </span>
                    <span className="text-[11px] text-gray-500 font-medium">Landowners</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1 text-gray-400 mb-1">
                      <TrendingUp size={15} className="text-[#BD9655]" />
                    </div>
                    <span className="font-heading font-extrabold text-[14px] text-foreground truncate max-w-full">
                      {selectedOpportunity.status}
                    </span>
                    <span className="text-[11px] text-gray-500 font-medium">Status</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Why connect with TRINFRA? */}
            <div className="bg-white rounded-[20px] p-6 border border-gray-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-4">
              <h2 className="font-heading font-extrabold text-[17px] text-foreground pb-2 border-b border-gray-100">
                Why connect with TRINFRA?
              </h2>

              <div className="space-y-3.5 pt-1">
                {/* 1 */}
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-[#0E2115]/[0.06] text-[#0E2115] flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck size={16} className="text-[#0E2115]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[13px] text-foreground">
                      Verified Opportunities
                    </h3>
                    <p className="text-[12px] text-gray-500 leading-relaxed mt-0.5">
                      Access well-researched and verified land opportunities.
                    </p>
                  </div>
                </div>

                {/* 2 */}
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-[#0E2115]/[0.06] text-[#0E2115] flex items-center justify-center shrink-0 mt-0.5">
                    <FileText size={15} className="text-[#0E2115]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[13px] text-foreground">
                      Structured Information
                    </h3>
                    <p className="text-[12px] text-gray-500 leading-relaxed mt-0.5">
                      Clear and reliable project details.
                    </p>
                  </div>
                </div>

                {/* 3 */}
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-[#0E2115]/[0.06] text-[#0E2115] flex items-center justify-center shrink-0 mt-0.5">
                    <Eye size={15} className="text-[#0E2115]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[13px] text-foreground">
                      Transparent Process
                    </h3>
                    <p className="text-[12px] text-gray-500 leading-relaxed mt-0.5">
                      A neutral platform for all stakeholders.
                    </p>
                  </div>
                </div>

                {/* 4 */}
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-[#0E2115]/[0.06] text-[#0E2115] flex items-center justify-center shrink-0 mt-0.5">
                    <Users size={15} className="text-[#0E2115]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[13px] text-foreground">
                      Professional Ecosystem
                    </h3>
                    <p className="text-[12px] text-gray-500 leading-relaxed mt-0.5">
                      Work with a trusted network of experts.
                    </p>
                  </div>
                </div>

                {/* 5 */}
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-[#0E2115]/[0.06] text-[#0E2115] flex items-center justify-center shrink-0 mt-0.5">
                    <Lock size={14} className="text-[#0E2115]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[13px] text-foreground">
                      Confidential Enquiries
                    </h3>
                    <p className="text-[12px] text-gray-500 leading-relaxed mt-0.5">
                      Your information is kept private and secure.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Tagline */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-[1px] bg-[#BD9655]" />
                  <span className="font-medium">People · Land · Opportunities</span>
                </div>
                <span className="italic font-serif text-gray-500">A Stronger Tomorrow.</span>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: MAIN FORM (~62%) ================= */}
          <div className="lg:col-span-7">
            {isSuccess ? (
              /* Success Confirmation Card */
              <div className="bg-white rounded-[20px] p-8 md:p-12 border border-gray-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.04)] text-center animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={36} />
                </div>

                <h2 className="text-[26px] md:text-[30px] font-heading font-extrabold text-foreground tracking-tight">
                  Enquiry Received
                </h2>

                <p className="mt-3 text-[15px] text-gray-600 max-w-md mx-auto leading-relaxed">
                  Thank you for your interest in{' '}
                  <span className="font-semibold text-foreground">
                    {selectedOpportunity.title}
                  </span>
                  . Our team will review your enquiry and contact you shortly.
                </p>

                {/* Reference Code Box */}
                <div className="bg-gray-50/80 border border-gray-200/90 rounded-xl p-4 max-w-sm mx-auto mt-6">
                  <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                    Enquiry Reference
                  </p>
                  <p className="font-mono font-bold text-[18px] text-foreground tracking-wide">
                    {referenceCode}
                  </p>
                </div>

                {/* Summary Details */}
                <div className="mt-6 pt-6 border-t border-gray-100 max-w-md mx-auto text-left text-[13px] space-y-2 text-gray-600">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Opportunity:</span>
                    <span className="font-semibold text-foreground">{selectedOpportunity.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Role:</span>
                    <span className="font-semibold text-foreground">{userType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Company:</span>
                    <span className="font-semibold text-foreground">{companyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Contact Method:</span>
                    <span className="font-semibold text-foreground">{contactMethod}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mt-8">
                  <Link
                    href="/opportunities"
                    className="w-full sm:w-auto bg-[#0E2115] hover:bg-[#132c1c] text-white px-7 py-3 rounded-lg font-bold text-[14px] transition-colors"
                  >
                    View Opportunities
                  </Link>
                  <Link
                    href="/"
                    className="w-full sm:w-auto bg-white hover:bg-gray-50 border border-gray-300 text-foreground px-7 py-3 rounded-lg font-semibold text-[14px] transition-colors"
                  >
                    Back to Home
                  </Link>
                </div>
              </div>
            ) : (
              /* Main Enquiry Form Card */
              <div className="bg-white rounded-[20px] p-6 sm:p-8 md:p-10 border border-gray-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                <h2 className="text-[22px] md:text-[24px] font-heading font-extrabold text-foreground pb-4 border-b border-gray-100">
                  Your Enquiry Details
                </h2>

                <form onSubmit={handleSubmit} className="mt-6 space-y-8">
                  {/* ================= 1. I AM A ================= */}
                  <div className="space-y-3">
                    <label className="block text-[14px] font-bold text-foreground">
                      1. I am a
                    </label>

                    <div className="grid grid-cols-2 gap-3 max-w-md">
                      <button
                        type="button"
                        onClick={() => setUserType('Developer')}
                        className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border text-[14px] font-bold transition-all duration-200 cursor-pointer ${
                          userType === 'Developer'
                            ? 'bg-[#0E2115] border-[#0E2115] text-white shadow-sm'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Building2
                          size={16}
                          className={
                            userType === 'Developer' ? 'text-[#BD9655]' : 'text-gray-400'
                          }
                        />
                        <span>Developer</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setUserType('Investor')}
                        className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border text-[14px] font-bold transition-all duration-200 cursor-pointer ${
                          userType === 'Investor'
                            ? 'bg-[#0E2115] border-[#0E2115] text-white shadow-sm'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <TrendingUp
                          size={16}
                          className={
                            userType === 'Investor' ? 'text-[#BD9655]' : 'text-gray-400'
                          }
                        />
                        <span>Investor</span>
                      </button>
                    </div>
                  </div>

                  {/* ================= 2. YOUR DETAILS ================= */}
                  <div className="space-y-5 pt-2">
                    <label className="block text-[14px] font-bold text-foreground border-b border-gray-100 pb-2">
                      2. Your Details
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div>
                        <label
                          htmlFor="enquiry-full-name"
                          className="block text-[13px] font-semibold text-gray-700 mb-1.5"
                        >
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User
                            size={16}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                          />
                          <input
                            id="enquiry-full-name"
                            type="text"
                            value={fullName}
                            onChange={(e) => {
                              setFullName(e.target.value);
                              if (errors.fullName) {
                                setErrors((prev) => {
                                  const n = { ...prev };
                                  delete n.fullName;
                                  return n;
                                });
                              }
                            }}
                            placeholder="Enter your full name"
                            className={`w-full bg-white border rounded-xl pl-10 pr-4 py-2.5 text-[14px] text-foreground placeholder:text-gray-400 focus:outline-none transition-all ${
                              errors.fullName
                                ? 'border-red-500 ring-2 ring-red-100'
                                : 'border-gray-200 focus:border-[#0E2115]/50 focus:ring-2 focus:ring-[#0E2115]/10'
                            }`}
                          />
                        </div>
                        {errors.fullName && (
                          <p className="text-[12px] text-red-500 mt-1 font-medium">
                            {errors.fullName}
                          </p>
                        )}
                      </div>

                      {/* Company Name */}
                      <div>
                        <label
                          htmlFor="enquiry-company-name"
                          className="block text-[13px] font-semibold text-gray-700 mb-1.5"
                        >
                          Company Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Building2
                            size={16}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                          />
                          <input
                            id="enquiry-company-name"
                            type="text"
                            value={companyName}
                            onChange={(e) => {
                              setCompanyName(e.target.value);
                              if (errors.companyName) {
                                setErrors((prev) => {
                                  const n = { ...prev };
                                  delete n.companyName;
                                  return n;
                                });
                              }
                            }}
                            placeholder="Enter company name"
                            className={`w-full bg-white border rounded-xl pl-10 pr-4 py-2.5 text-[14px] text-foreground placeholder:text-gray-400 focus:outline-none transition-all ${
                              errors.companyName
                                ? 'border-red-500 ring-2 ring-red-100'
                                : 'border-gray-200 focus:border-[#0E2115]/50 focus:ring-2 focus:ring-[#0E2115]/10'
                            }`}
                          />
                        </div>
                        {errors.companyName && (
                          <p className="text-[12px] text-red-500 mt-1 font-medium">
                            {errors.companyName}
                          </p>
                        )}
                      </div>

                      {/* Email Address */}
                      <div>
                        <label
                          htmlFor="enquiry-email-address"
                          className="block text-[13px] font-semibold text-gray-700 mb-1.5"
                        >
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail
                            size={16}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                          />
                          <input
                            id="enquiry-email-address"
                            type="email"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (errors.email) {
                                setErrors((prev) => {
                                  const n = { ...prev };
                                  delete n.email;
                                  return n;
                                });
                              }
                            }}
                            placeholder="you@company.com"
                            className={`w-full bg-white border rounded-xl pl-10 pr-4 py-2.5 text-[14px] text-foreground placeholder:text-gray-400 focus:outline-none transition-all ${
                              errors.email
                                ? 'border-red-500 ring-2 ring-red-100'
                                : 'border-gray-200 focus:border-[#0E2115]/50 focus:ring-2 focus:ring-[#0E2115]/10'
                            }`}
                          />
                        </div>
                        {errors.email && (
                          <p className="text-[12px] text-red-500 mt-1 font-medium">
                            {errors.email}
                          </p>
                        )}
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label
                          htmlFor="enquiry-phone-number"
                          className="block text-[13px] font-semibold text-gray-700 mb-1.5"
                        >
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Phone
                            size={16}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                          />
                          <input
                            id="enquiry-phone-number"
                            type="tel"
                            value={phone}
                            onChange={(e) => {
                              setPhone(e.target.value);
                              if (errors.phone) {
                                setErrors((prev) => {
                                  const n = { ...prev };
                                  delete n.phone;
                                  return n;
                                });
                              }
                            }}
                            placeholder="+91 98765 43210"
                            className={`w-full bg-white border rounded-xl pl-10 pr-4 py-2.5 text-[14px] text-foreground placeholder:text-gray-400 focus:outline-none transition-all ${
                              errors.phone
                                ? 'border-red-500 ring-2 ring-red-100'
                                : 'border-gray-200 focus:border-[#0E2115]/50 focus:ring-2 focus:ring-[#0E2115]/10'
                            }`}
                          />
                        </div>
                        {errors.phone && (
                          <p className="text-[12px] text-red-500 mt-1 font-medium">
                            {errors.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Preferred Contact Method */}
                    <div className="pt-2">
                      <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                        Preferred Contact Method <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          type="button"
                          onClick={() => setContactMethod('Phone')}
                          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-[13px] font-bold transition-all duration-200 cursor-pointer ${
                            contactMethod === 'Phone'
                              ? 'bg-[#0E2115] border-[#0E2115] text-white shadow-sm'
                              : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <Phone size={14} />
                          <span>Phone</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setContactMethod('WhatsApp')}
                          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-[13px] font-bold transition-all duration-200 cursor-pointer ${
                            contactMethod === 'WhatsApp'
                              ? 'bg-[#0E2115] border-[#0E2115] text-white shadow-sm'
                              : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <MessageCircle size={15} />
                          <span>WhatsApp</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setContactMethod('Email')}
                          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-[13px] font-bold transition-all duration-200 cursor-pointer ${
                            contactMethod === 'Email'
                              ? 'bg-[#0E2115] border-[#0E2115] text-white shadow-sm'
                              : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <Mail size={14} />
                          <span>Email</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ================= 3. TELL US WHAT YOU'RE LOOKING FOR ================= */}
                  <div className="space-y-5 pt-2">
                    <label className="block text-[14px] font-bold text-foreground border-b border-gray-100 pb-2">
                      3. Tell Us What You&apos;re Looking For
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Interest Type */}
                      <div>
                        <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                          Interest Type <span className="text-red-500">*</span>
                        </label>
                        <CustomSelect
                          id="select-interest-type"
                          value={interestType}
                          onChange={(val) => {
                            setInterestType(val);
                            if (errors.interestType) {
                              setErrors((prev) => {
                                const n = { ...prev };
                                delete n.interestType;
                                return n;
                              });
                            }
                          }}
                          options={INTEREST_OPTIONS}
                          placeholder="Select interest type"
                          className={errors.interestType ? 'border-red-500' : ''}
                        />
                        {errors.interestType && (
                          <p className="text-[12px] text-red-500 mt-1 font-medium">
                            {errors.interestType}
                          </p>
                        )}
                      </div>

                      {/* Estimated Investment Range */}
                      <div>
                        <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                          Estimated Investment / Development Range
                        </label>
                        <CustomSelect
                          id="select-investment-range"
                          value={investmentRange}
                          onChange={setInvestmentRange}
                          options={INVESTMENT_RANGE_OPTIONS}
                          placeholder="Select range"
                        />
                      </div>
                    </div>

                    {/* Preferred Location */}
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                        Preferred Location
                      </label>
                      <CustomSelect
                        id="select-preferred-location"
                        value={preferredLocation}
                        onChange={setPreferredLocation}
                        options={LOCATION_OPTIONS}
                        placeholder="Select district or locality (optional)"
                      />
                    </div>

                    {/* Additional Message Textarea */}
                    <div>
                      <label
                        htmlFor="enquiry-additional-message"
                        className="block text-[13px] font-semibold text-gray-700 mb-1.5"
                      >
                        Additional Message
                      </label>
                      <textarea
                        id="enquiry-additional-message"
                        rows={3}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tell us a little about your requirements..."
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-foreground placeholder:text-gray-400 focus:outline-none focus:border-[#0E2115]/50 focus:ring-2 focus:ring-[#0E2115]/10 transition-all resize-y"
                      />
                    </div>
                  </div>

                  {/* ================= CONSENT CHECKBOX ================= */}
                  <div className="pt-1">
                    <label
                      htmlFor="enquiry-consent"
                      className="flex items-start gap-3 cursor-pointer select-none"
                    >
                      <div className="relative flex items-center pt-0.5">
                        <input
                          id="enquiry-consent"
                          type="checkbox"
                          checked={consent}
                          onChange={(e) => {
                            setConsent(e.target.checked);
                            if (e.target.checked && errors.consent) {
                              setErrors((prev) => {
                                const n = { ...prev };
                                delete n.consent;
                                return n;
                              });
                            }
                          }}
                          className="sr-only"
                        />
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            consent
                              ? 'bg-[#0E2115] border-[#0E2115]'
                              : 'bg-white border-gray-300'
                          }`}
                        >
                          {consent && <Check size={12} className="text-white stroke-[3]" />}
                        </div>
                      </div>
                      <span className="text-[13px] text-gray-600 leading-snug">
                        I agree to be contacted by TRINFRA regarding this enquiry.{' '}
                        <span className="text-red-500">*</span>
                      </span>
                    </label>
                    {errors.consent && (
                      <p className="text-[12px] text-red-500 mt-1 font-medium ml-7">
                        {errors.consent}
                      </p>
                    )}
                  </div>

                  {/* ================= SUBMIT CTA ================= */}
                  <div className="space-y-4 pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#0E2115] hover:bg-[#132c1c] text-white py-3.5 px-6 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 shadow-sm transition-all duration-200 disabled:opacity-75 disabled:cursor-not-allowed group cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={18} className="animate-spin text-[#BD9655]" />
                          <span>Submitting Enquiry...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Enquiry</span>
                          <ArrowRight
                            size={16}
                            className="group-hover:translate-x-1 transition-transform"
                          />
                        </>
                      )}
                    </button>

                    {/* Security Note */}
                    <div className="flex items-center justify-center gap-2 text-[12px] text-gray-500">
                      <Lock size={13} className="text-[#BD9655]" />
                      <span>
                        Your information is kept confidential and will only be used to respond to your enquiry.
                      </span>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= BOTTOM CTA BANNER ================= */}
      <section className="mt-20 border-t border-gray-200/80 bg-primary-dark text-white py-14 relative overflow-hidden">
        <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div>
            <p className="text-[11px] font-bold text-accent uppercase tracking-widest mb-1.5">
              LAND TOGETHER. BUILD TOMORROW.
            </p>
            <h2 className="text-[26px] md:text-[32px] font-heading font-extrabold tracking-tight">
              Ready to create lasting impact?
            </h2>
            <p className="text-white/70 text-[14px] mt-1">
              Partner with TRINFRA and be part of a more sustainable future.
            </p>
          </div>

          <Link
            href="/opportunities"
            className="shrink-0 bg-accent hover:bg-accent-light text-primary-dark font-bold text-[14px] px-7 py-3.5 rounded-lg shadow-sm transition-colors flex items-center gap-2 group"
          >
            <span>View Opportunities</span>
            <ArrowRight
              size={15}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>
      </section>

      {/* ================= CHANGE OPPORTUNITY MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white rounded-[24px] max-w-2xl w-full p-6 shadow-2xl border border-gray-100 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-[19px] font-heading font-extrabold text-foreground">
                  Select Land Opportunity
                </h3>
                <p className="text-[13px] text-gray-500 mt-0.5">
                  Choose which opportunity you would like to express interest in.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-foreground transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Opportunity List */}
            <div className="overflow-y-auto py-3 space-y-2.5 flex-grow pr-1">
              {opportunities.map((opp) => {
                const isSelected = selectedOpportunity ? opp.id === selectedOpportunity.id : false;
                return (
                  <div
                    key={opp.id}
                    onClick={() => {
                      setSelectedOpportunity(opp);
                      setIsModalOpen(false);
                    }}
                    className={`flex items-center gap-4 p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#0E2115] bg-[#0E2115]/[0.03] ring-1 ring-[#0E2115]'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/70'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={opp.image}
                        alt={opp.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-[14px] text-foreground truncate">
                          {opp.title}
                        </h4>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 shrink-0">
                          {opp.status}
                        </span>
                      </div>
                      <p className="text-[12px] text-gray-500 mt-0.5 truncate">
                        {opp.location}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-1">
                        <span>{opp.area} Acres</span>
                        <span>•</span>
                        <span>{opp.landowners} Landowners</span>
                      </div>
                    </div>

                    {/* Checkmark indicator */}
                    <div className="shrink-0 pr-2">
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'border-[#0E2115] bg-[#0E2115] text-white'
                            : 'border-gray-300'
                        }`}
                      >
                        {isSelected && <Check size={12} className="stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
