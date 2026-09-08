'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  X,
  Check,
  Building2,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  Edit3,
} from 'lucide-react';
import CustomSelect from '@/components/opportunities/CustomSelect';
import { KERALA_14_DISTRICTS } from '@/lib/server/residential';

const PROPERTY_TYPES = [
  { value: 'Apartment', label: 'Apartment' },
  { value: 'Flat', label: 'Flat' },
  { value: 'Villa', label: 'Villa' },
  { value: 'House', label: 'Independent House' },
  { value: 'Penthouse', label: 'Penthouse' },
];

const LISTING_PURPOSES = [
  { value: 'Sale', label: 'For Sale' },
  { value: 'Rent', label: 'For Rent' },
];

const FURNISHED_STATUSES = [
  { value: 'Unfurnished', label: 'Unfurnished' },
  { value: 'Semi-Furnished', label: 'Semi-Furnished' },
  { value: 'Fully Furnished', label: 'Fully Furnished' },
];

const PARKING_OPTIONS = [
  { value: 'None', label: 'No Parking' },
  { value: '1 Covered', label: '1 Covered Parking' },
  { value: '2 Covered', label: '2 Covered Parking' },
  { value: 'Open', label: 'Open Parking' },
];

const PROPERTY_AGE_OPTIONS = [
  { value: 'Ready to Move', label: 'Ready to Move' },
  { value: 'Under Construction', label: 'Under Construction' },
  { value: '0-1 years', label: '0 to 1 Year Old' },
  { value: '1-5 years', label: '1 to 5 Years Old' },
  { value: '5+ years', label: '5+ Years Old' },
];

const FACING_OPTIONS = [
  { value: 'East', label: 'East Facing' },
  { value: 'West', label: 'West Facing' },
  { value: 'North', label: 'North Facing' },
  { value: 'South', label: 'South Facing' },
  { value: 'North-East', label: 'North-East Facing' },
  { value: 'North-West', label: 'North-West Facing' },
  { value: 'South-East', label: 'South-East Facing' },
  { value: 'South-West', label: 'South-West Facing' },
];

const COMMON_AMENITIES = [
  'Swimming Pool',
  'Gymnasium',
  '24/7 Security & CCTV',
  'Power Backup',
  'Lift Access',
  'Clubhouse',
  'Children Play Area',
  'Covered Parking',
  'EV Charging Station',
  'Intercom Facility',
  'Waste Treatment Plant',
  'Solar Water Heater',
  'Private Balcony',
  'Sea / River View',
];

const RESIDENTIAL_STEPS = [
  { number: 1, label: 'Property Type', sublabel: 'Type & Purpose' },
  { number: 2, label: 'Location', sublabel: 'District & Locality' },
  { number: 3, label: 'Specs', sublabel: 'Area (sq ft) & Details' },
  { number: 4, label: 'Pricing', sublabel: 'Price & Terms' },
  { number: 5, label: 'Photos', sublabel: 'Images & Amenities' },
  { number: 6, label: 'Review', sublabel: 'Verify & Submit' },
];

const STEP_HEADERS = [
  {
    title: 'Property Type & Overview',
    subtitle: 'Select the property category and provide an enticing title and description.',
  },
  {
    title: 'Property Location',
    subtitle: 'Specify the Kerala district and locality where the property is located.',
  },
  {
    title: 'Property Specifications',
    subtitle: 'Enter built-up property area in sq ft and configuration details.',
  },
  {
    title: 'Pricing & Availability',
    subtitle: 'Set your asking price and transaction terms for prospective buyers.',
  },
  {
    title: 'Photos & Amenities',
    subtitle: 'Upload high-resolution property photos and select available features.',
  },
  {
    title: 'Review & Submit Listing',
    subtitle: 'Review all entered specifications before submitting for administrative moderation.',
  },
];

export default function NewListingPage() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  // Multi-step State
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [direction, setDirection] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  // Form Fields State
  const [title, setTitle] = useState('');
  const [propertyType, setPropertyType] = useState('Apartment');
  const [listingPurpose, setListingPurpose] = useState('Sale');
  const [description, setDescription] = useState('');

  const [district, setDistrict] = useState('Ernakulam');
  const [locality, setLocality] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');

  // Property Area: STRICTLY sq ft
  const [area, setArea] = useState('');
  const areaUnit = 'sq ft';
  const [bedrooms, setBedrooms] = useState('2');
  const [bathrooms, setBathrooms] = useState('2');
  const [floor, setFloor] = useState('');
  const [totalFloors, setTotalFloors] = useState('');
  const [furnishedStatus, setFurnishedStatus] = useState('Semi-Furnished');
  const [parking, setParking] = useState('1 Covered');
  const [balcony, setBalcony] = useState('1');
  const [propertyAge, setPropertyAge] = useState('Ready to Move');
  const [facing, setFacing] = useState('East');

  const [price, setPrice] = useState('');
  const priceType = 'Total';
  const [negotiable, setNegotiable] = useState(true);

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    '24/7 Security & CCTV',
    'Power Backup',
    'Lift Access',
  ]);

  // Uploaded images state
  const [images, setImages] = useState<
    Array<{ storageKey: string; url: string; filename: string; mimeType: string; size: number; isCover?: boolean }>
  >([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/seller/upload-image', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || `Failed to upload ${file.name}`);
        }

        setImages((prev) => [
          ...prev,
          {
            ...data.image,
            isCover: prev.length === 0,
          },
        ]);
      }
    } catch (err: any) {
      setUploadError(err.message || 'Error uploading images');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, idx) => idx !== index);
      if (updated.length > 0 && !updated.some((img) => img.isCover)) {
        updated[0].isCover = true;
      }
      return updated;
    });
  };

  const setCoverImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, idx) => ({
        ...img,
        isCover: idx === index,
      }))
    );
  };

  // Step Validation
  const validateStep = (step: number): Record<string, string> => {
    const errs: Record<string, string> = {};

    switch (step) {
      case 0: // Property Type
        if (!title.trim() || title.trim().length < 3) {
          errs.title = 'Please provide a property headline title (at least 3 characters).';
        }
        if (!propertyType) {
          errs.propertyType = 'Please select a property category.';
        }
        break;
      case 1: // Location
        if (!district) {
          errs.district = 'Please select a Kerala district.';
        }
        if (!locality.trim() || locality.trim().length < 2) {
          errs.locality = 'Please enter a locality or neighborhood name.';
        }
        break;
      case 2: // Specs & Area
        if (!area || Number(area) <= 0) {
          errs.area = 'Please enter a valid built-up area in square feet (sq ft).';
        }
        if (Number(bedrooms) < 0) {
          errs.bedrooms = 'Bedrooms count cannot be negative.';
        }
        if (Number(bathrooms) < 0) {
          errs.bathrooms = 'Bathrooms count cannot be negative.';
        }
        break;
      case 3: // Pricing
        if (!price || Number(price) <= 0) {
          errs.price = 'Please enter a valid asking price.';
        }
        break;
      case 4: // Photos & Amenities
        if (images.length === 0) {
          errs.images = 'Please upload at least 1 property photograph.';
        }
        break;
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
    setCompletedSteps((prev) => (prev.includes(currentStep) ? prev : [...prev, currentStep]));
    setDirection(1);
    setCurrentStep((prev) => Math.min(prev + 1, RESIDENTIAL_STEPS.length - 1));
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

  const handleSubmit = async (submitForReview: boolean) => {
    setFormError(null);

    // Final checks
    if (!title.trim() || title.trim().length < 3) {
      setFormError('Property title is required.');
      return;
    }
    if (!locality.trim()) {
      setFormError('Locality is required.');
      return;
    }
    if (!area || Number(area) <= 0) {
      setFormError('Valid property area in sq ft is required.');
      return;
    }
    if (!price || Number(price) <= 0) {
      setFormError('Valid price is required.');
      return;
    }
    if (submitForReview && images.length === 0) {
      setFormError('Please upload at least one photo before submitting for review.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        propertyType,
        listingPurpose,
        description: description.trim(),
        district,
        locality: locality.trim(),
        address: address.trim() || null,
        pincode: pincode.trim() || null,
        area: Number(area),
        areaUnit, // strictly 'sq ft'
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        floor: floor ? Number(floor) : null,
        totalFloors: totalFloors ? Number(totalFloors) : null,
        furnishedStatus,
        parking,
        balcony: balcony ? Number(balcony) : null,
        propertyAge,
        facing,
        amenities: selectedAmenities,
        price: Number(price),
        priceType: listingPurpose === 'Rent' ? 'Per Month' : priceType,
        negotiable,
        images,
        submitForReview,
      };

      const res = await fetch('/api/seller/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit property listing');
      }

      setSubmitted(true);
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit listing. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const districtOptions = KERALA_14_DISTRICTS.map((d) => ({
    value: d,
    label: d,
  }));

  // SUCCESS SCREEN
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col justify-between pt-20">
        <div className="flex-grow flex items-center justify-center px-4 sm:px-6 py-12">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="text-center max-w-[540px] w-full mx-auto bg-white p-8 sm:p-12 rounded-2xl border border-stone-200/90 shadow-xl"
          >
            {/* Animated Checkmark Badge */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 flex items-center justify-center">
              {/* Subtle Ambient Glow */}
              <motion.div
                initial={shouldReduceMotion ? { opacity: 0.3 } : { scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.15, opacity: 0.35 }}
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.8, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full bg-emerald-500/20 blur-lg pointer-events-none"
              />

              {/* Outer Ripple Ring */}
              <motion.div
                initial={shouldReduceMotion ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.4, delay: 0.1, ease: 'easeOut' }}
                className="absolute inset-1 rounded-full bg-[#0E2115]/10 border border-[#0E2115]/20"
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
                className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#0E2115] text-white shadow-md flex items-center justify-center"
              >
                <svg
                  className="w-7 h-7 sm:w-8 sm:h-8 text-[#BD9655]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
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
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900 tracking-tight mb-3">
              Property Submitted Successfully
            </h2>

            {/* Confirmation Message */}
            <p className="text-sm sm:text-base text-gray-700 font-medium mb-2 leading-relaxed">
              Your property has been submitted for review.
            </p>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
              Our administrative team will review the details before publishing your listing on the TRINFRA residential marketplace.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => router.push('/seller')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0E2115] hover:bg-[#07190e] text-white text-xs sm:text-sm font-bold shadow-md transition-colors"
              >
                View Seller Dashboard
              </button>
              <button
                type="button"
                onClick={() => router.push('/residential')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 text-xs sm:text-sm font-semibold transition-colors"
              >
                Explore Residential Marketplace
              </button>
            </div>
          </motion.div>
        </div>

        {/* Mini Footer */}
        <footer className="bg-[#050B07] py-4 text-center text-xs text-white/50">
          TRINFRA Residential Marketplace &middot; Quality Moderation
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] flex flex-col pt-18 sm:pt-20">
      <div className="flex-grow flex">
        {/* ========== LEFT SIDEBAR (Desktop) ========== */}
        <aside className="hidden lg:flex lg:w-[340px] xl:w-[380px] shrink-0 relative overflow-hidden bg-[#0E2115]">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: 'url("/images/hero_landscape.jpeg")' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0E2115]/95 via-[#0E2115]/90 to-[#0E2115]/85" />

          <div className="relative z-10 flex flex-col justify-between p-10 xl:p-12 h-full text-white">
            <div>
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#BD9655] mb-6">
                Kerala Residential Marketplace
              </p>

              <h2 className="text-[34px] xl:text-[38px] font-heading font-bold leading-[1.1] mb-6">
                <span className="text-white block">List Your</span>
                <span className="text-[#BD9655] block">Property.</span>
              </h2>

              <p className="text-white/75 text-[13px] leading-relaxed mb-10 max-w-[280px]">
                Showcase your flat, apartment, or villa directly to verified Kerala buyers with high-resolution photos and transparent details.
              </p>

              <div className="space-y-4">
                {[
                  { icon: <CheckCircle2 size={17} className="text-[#BD9655]" strokeWidth={2} />, text: 'Direct Buyer Inquiries' },
                  { icon: <Lock size={17} className="text-[#BD9655]" strokeWidth={2} />, text: 'Private Seller Protection' },
                  { icon: <Sparkles size={17} className="text-[#BD9655]" strokeWidth={2} />, text: 'Persistent High-Res Photos' },
                  { icon: <ShieldCheck size={17} className="text-[#BD9655]" strokeWidth={2} />, text: 'Administrative Moderation' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border border-white/15 bg-white/5 flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <span className="text-white/85 text-[13px] font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-white/10">
              <p className="text-white/60 text-[13px] italic leading-relaxed mb-1">
                &ldquo;Connecting authentic homes with discerning buyers across Kerala.&rdquo;
              </p>
              <p className="text-[#BD9655] text-[11px] font-bold tracking-widest uppercase">
                TRINFRA Residential
              </p>
            </div>
          </div>
        </aside>

        {/* ========== RIGHT CONTENT ========== */}
        <div className="flex-grow bg-[#FAFAF8] overflow-y-auto">
          <div className="max-w-[820px] mx-auto px-4 sm:px-8 md:px-12 py-8 md:py-10">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#0E2115] mb-2 flex items-center gap-1.5">
                  <Building2 size={14} className="text-[#BD9655]" />
                  <span>List Your Property &middot; Step {currentStep + 1} of {RESIDENTIAL_STEPS.length}</span>
                </p>
                <h1 className="text-2xl sm:text-[32px] font-heading font-bold text-gray-900 leading-tight">
                  {STEP_HEADERS[currentStep].title}
                </h1>
              </div>

              {/* Security / Verification Badge */}
              <div className="hidden sm:flex items-center gap-2 bg-[#0E2115]/5 border border-[#0E2115]/10 rounded-xl px-3 py-2 shrink-0 ml-4">
                <ShieldCheck size={18} className="text-[#0E2115]" />
                <div>
                  <p className="text-[11px] font-bold text-gray-800 leading-tight">Verified Moderation</p>
                  <p className="text-[10px] text-gray-500 leading-tight">Admin reviewed before publish</p>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-500 mb-6">
              {STEP_HEADERS[currentStep].subtitle}
            </p>

            {/* STEPPER COMPONENT */}
            <div className="w-full py-4 mb-6">
              {/* Desktop Stepper */}
              <div className="hidden md:flex items-start justify-between relative">
                {RESIDENTIAL_STEPS.map((step, index) => {
                  const isCompleted = completedSteps.includes(index);
                  const isActive = index === currentStep;

                  return (
                    <button
                      type="button"
                      key={step.number}
                      onClick={() => handleGoToStep(index)}
                      className="flex flex-col items-center relative z-10 flex-1 text-center group cursor-pointer focus:outline-none"
                    >
                      <div className="flex items-center w-full justify-center">
                        {index > 0 && (
                          <div
                            className={`h-[2px] flex-1 ${
                              completedSteps.includes(index - 1) || (isActive && completedSteps.includes(index - 1))
                                ? 'bg-[#0E2115]'
                                : 'bg-gray-200'
                            }`}
                          />
                        )}

                        <div
                          className={`w-[36px] h-[36px] rounded-full flex items-center justify-center text-[13px] font-bold shrink-0 transition-all duration-200 ${
                            isCompleted
                              ? 'bg-[#0E2115] text-white'
                              : isActive
                              ? 'bg-[#BD9655] text-white shadow-md'
                              : 'bg-white border-2 border-gray-200 text-gray-400 group-hover:border-gray-300'
                          }`}
                        >
                          {isCompleted ? <Check size={16} strokeWidth={3} /> : step.number}
                        </div>

                        {index < RESIDENTIAL_STEPS.length - 1 && (
                          <div
                            className={`h-[2px] flex-1 ${
                              isCompleted ? 'bg-[#0E2115]' : 'bg-gray-200'
                            }`}
                          />
                        )}
                      </div>

                      <div className="mt-2.5">
                        <p
                          className={`text-[12px] font-bold leading-tight ${
                            isActive ? 'text-gray-900' : isCompleted ? 'text-[#0E2115]' : 'text-gray-400'
                          }`}
                        >
                          {step.label}
                        </p>
                        <p
                          className={`text-[10px] mt-0.5 leading-tight ${
                            isActive ? 'text-gray-600' : isCompleted ? 'text-gray-500' : 'text-gray-300'
                          }`}
                        >
                          {step.sublabel}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Mobile Stepper (Zero Overflow Progress Bar) */}
              <div className="md:hidden flex flex-col gap-2 px-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#BD9655] tracking-wider uppercase">
                    Step {currentStep + 1} of {RESIDENTIAL_STEPS.length}
                  </span>
                  <span className="text-xs font-bold text-gray-800">
                    {RESIDENTIAL_STEPS[currentStep].label}
                  </span>
                </div>
                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#0E2115] h-full transition-all duration-300 rounded-full"
                    style={{ width: `${((currentStep + 1) / RESIDENTIAL_STEPS.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Error Banner */}
            {formError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {/* STEP CONTENT WRAPPER */}
            <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-6 sm:p-8 min-h-[380px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: direction > 0 ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction > 0 ? -20 : 20 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                >
                  {/* STEP 1: PROPERTY TYPE */}
                  {currentStep === 0 && (
                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Property Headline Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={title}
                          onChange={(e) => {
                            setTitle(e.target.value);
                            setErrors((p) => ({ ...p, title: '' }));
                          }}
                          placeholder="e.g. Modern 3 BHK Luxury Apartment overlooking Marine Drive"
                          className="w-full px-3.5 py-2.5 min-h-[44px] text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E2115]/20 focus:border-[#0E2115]"
                        />
                        {errors.title && <p className="text-[11px] text-red-600 mt-1">{errors.title}</p>}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Property Category *
                          </label>
                          <CustomSelect
                            value={propertyType}
                            onChange={(val) => {
                              setPropertyType(val);
                              setErrors((p) => ({ ...p, propertyType: '' }));
                            }}
                            options={PROPERTY_TYPES}
                            aria-label="Property Type"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Listing Purpose *
                          </label>
                          <CustomSelect
                            value={listingPurpose}
                            onChange={setListingPurpose}
                            options={LISTING_PURPOSES}
                            aria-label="Listing Purpose"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Description (Optional)
                        </label>
                        <textarea
                          rows={4}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Describe key features, floor level, ventilation, proximity to schools or transit hubs..."
                          className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E2115]/20 focus:border-[#0E2115] resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 2: LOCATION */}
                  {currentStep === 1 && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Kerala District *
                          </label>
                          <CustomSelect
                            value={district}
                            onChange={(val) => {
                              setDistrict(val);
                              setErrors((p) => ({ ...p, district: '' }));
                            }}
                            options={districtOptions}
                            aria-label="Select Kerala District"
                          />
                          {errors.district && <p className="text-[11px] text-red-600 mt-1">{errors.district}</p>}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Locality / Neighborhood *
                          </label>
                          <input
                            type="text"
                            required
                            value={locality}
                            onChange={(e) => {
                              setLocality(e.target.value);
                              setErrors((p) => ({ ...p, locality: '' }));
                            }}
                            placeholder="e.g. Marine Drive, Kakkanad, Kowdiar"
                            className="w-full px-3.5 py-2.5 min-h-[44px] text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E2115]/20 focus:border-[#0E2115]"
                          />
                          {errors.locality && <p className="text-[11px] text-red-600 mt-1">{errors.locality}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Street Address (Optional)
                          </label>
                          <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="e.g. Skyline Avenue, Road 4"
                            className="w-full px-3.5 py-2.5 min-h-[44px] text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E2115]/20 focus:border-[#0E2115]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            PIN Code (Optional)
                          </label>
                          <input
                            type="text"
                            value={pincode}
                            onChange={(e) => setPincode(e.target.value)}
                            placeholder="e.g. 682031"
                            className="w-full px-3.5 py-2.5 min-h-[44px] text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E2115]/20 focus:border-[#0E2115]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: PROPERTY DETAILS & SPECS (CRITICAL: sq ft only) */}
                  {currentStep === 2 && (
                    <div className="space-y-5">
                      {/* Built-up Area: STRICTLY sq ft */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Property Area * (Built-up Area)
                        </label>
                        <div className="flex">
                          <input
                            type="number"
                            required
                            min={50}
                            id="residential-property-area-input"
                            value={area}
                            onChange={(e) => {
                              setArea(e.target.value);
                              setErrors((p) => ({ ...p, area: '' }));
                            }}
                            placeholder="e.g. 1850"
                            className="w-full px-3.5 py-2.5 min-h-[44px] text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-l-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E2115]/20 focus:border-[#0E2115]"
                          />
                          <span className="px-4 py-2.5 bg-stone-100 border border-l-0 border-gray-200 rounded-r-xl text-xs sm:text-sm text-gray-800 font-bold flex items-center shrink-0">
                            sq ft
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-1">
                          Measured in square feet (sq ft). For residential properties only.
                        </p>
                        {errors.area && <p className="text-[11px] text-red-600 mt-1">{errors.area}</p>}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Bedrooms *</label>
                          <input
                            type="number"
                            min={0}
                            max={20}
                            value={bedrooms}
                            onChange={(e) => setBedrooms(e.target.value)}
                            className="w-full px-3.5 py-2.5 min-h-[44px] text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E2115]/20 focus:border-[#0E2115]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Bathrooms *</label>
                          <input
                            type="number"
                            min={0}
                            max={20}
                            value={bathrooms}
                            onChange={(e) => setBathrooms(e.target.value)}
                            className="w-full px-3.5 py-2.5 min-h-[44px] text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E2115]/20 focus:border-[#0E2115]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Floor Level</label>
                          <input
                            type="number"
                            min={0}
                            placeholder="e.g. 5"
                            value={floor}
                            onChange={(e) => setFloor(e.target.value)}
                            className="w-full px-3.5 py-2.5 min-h-[44px] text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E2115]/20 focus:border-[#0E2115]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Total Floors</label>
                          <input
                            type="number"
                            min={1}
                            placeholder="e.g. 14"
                            value={totalFloors}
                            onChange={(e) => setTotalFloors(e.target.value)}
                            className="w-full px-3.5 py-2.5 min-h-[44px] text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E2115]/20 focus:border-[#0E2115]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Furnishing Status
                          </label>
                          <CustomSelect
                            value={furnishedStatus}
                            onChange={setFurnishedStatus}
                            options={FURNISHED_STATUSES}
                            aria-label="Furnishing Status"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Parking
                          </label>
                          <CustomSelect
                            value={parking}
                            onChange={setParking}
                            options={PARKING_OPTIONS}
                            aria-label="Parking"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Balconies
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={10}
                            value={balcony}
                            onChange={(e) => setBalcony(e.target.value)}
                            className="w-full px-3.5 py-2.5 min-h-[44px] text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E2115]/20 focus:border-[#0E2115]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Property Age
                          </label>
                          <CustomSelect
                            value={propertyAge}
                            onChange={setPropertyAge}
                            options={PROPERTY_AGE_OPTIONS}
                            aria-label="Property Age"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Facing
                          </label>
                          <CustomSelect
                            value={facing}
                            onChange={setFacing}
                            options={FACING_OPTIONS}
                            aria-label="Facing Direction"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: SALE / RENT + PRICE */}
                  {currentStep === 3 && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Asking Price (₹) *
                          </label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xs sm:text-sm">
                              ₹
                            </span>
                            <input
                              type="number"
                              required
                              min={1000}
                              value={price}
                              onChange={(e) => {
                                setPrice(e.target.value);
                                setErrors((p) => ({ ...p, price: '' }));
                              }}
                              placeholder={listingPurpose === 'Rent' ? '35000' : '8500000'}
                              className="w-full pl-8 pr-3.5 py-2.5 min-h-[44px] text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E2115]/20 focus:border-[#0E2115]"
                            />
                          </div>
                          {errors.price && <p className="text-[11px] text-red-600 mt-1">{errors.price}</p>}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Price Display Type
                          </label>
                          <div className="px-3.5 py-2.5 min-h-[44px] rounded-xl bg-gray-50 border border-gray-200 text-xs sm:text-sm text-gray-700 flex items-center font-medium">
                            {listingPurpose === 'Rent' ? 'Per Month (Rental)' : 'Total Property Price'}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                        <div>
                          <span className="block text-xs font-semibold text-gray-800">
                            Negotiable Pricing
                          </span>
                          <span className="text-[11px] text-gray-500">
                            Indicate whether you are open to reasonable offers from verified buyers.
                          </span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={negotiable}
                            onChange={(e) => setNegotiable(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0E2115]" />
                        </label>
                      </div>
                    </div>
                  )}

                  {/* STEP 5: PHOTOS + AMENITIES */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      {/* Photo Upload */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Property Photos * (Persistent Supabase Storage)
                        </label>

                        <div className="border-2 border-dashed border-gray-200 hover:border-[#0E2115]/50 rounded-2xl p-6 text-center transition-colors bg-gray-50/50">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            id="photo-upload-input"
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={uploading}
                          />
                          <label
                            htmlFor="photo-upload-input"
                            className="cursor-pointer flex flex-col items-center justify-center gap-2"
                          >
                            <div className="w-12 h-12 rounded-xl bg-[#0E2115]/5 text-[#0E2115] flex items-center justify-center">
                              {uploading ? (
                                <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                </svg>
                              ) : (
                                <Upload size={24} />
                              )}
                            </div>
                            <span className="text-xs sm:text-sm font-semibold text-gray-800">
                              {uploading ? 'Uploading photographs to Supabase...' : 'Click to upload property photos'}
                            </span>
                            <span className="text-[11px] text-gray-500">
                              PNG, JPG, or WEBP (Max 10MB per file)
                            </span>
                          </label>
                        </div>

                        {uploadError && (
                          <p className="text-[11px] text-red-600 mt-2 flex items-center gap-1">
                            <AlertCircle size={13} />
                            <span>{uploadError}</span>
                          </p>
                        )}
                        {errors.images && (
                          <p className="text-[11px] text-red-600 mt-2 flex items-center gap-1">
                            <AlertCircle size={13} />
                            <span>{errors.images}</span>
                          </p>
                        )}

                        {/* Image Previews */}
                        {images.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                            {images.map((img, idx) => (
                              <div
                                key={idx}
                                className="relative rounded-xl overflow-hidden border border-gray-200 aspect-[4/3] bg-gray-100 group"
                              >
                                <img
                                  src={img.url}
                                  alt={`Upload ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />

                                {img.isCover && (
                                  <span className="absolute top-2 left-2 bg-[#0E2115] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                                    Cover Photo
                                  </span>
                                )}

                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  {!img.isCover && (
                                    <button
                                      type="button"
                                      onClick={() => setCoverImage(idx)}
                                      className="px-2 py-1 bg-white text-gray-800 text-[10px] font-bold rounded shadow hover:bg-gray-100"
                                    >
                                      Set Cover
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => removeImage(idx)}
                                    className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 shadow"
                                    aria-label="Remove image"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Amenities Selection */}
                      <div className="pt-4 border-t border-gray-100">
                        <label className="block text-xs font-semibold text-gray-700 mb-2">
                          Available Amenities
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
                          {COMMON_AMENITIES.map((amenity) => {
                            const isSelected = selectedAmenities.includes(amenity);
                            return (
                              <button
                                type="button"
                                key={amenity}
                                onClick={() => toggleAmenity(amenity)}
                                className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs transition-colors cursor-pointer min-h-[44px] ${
                                  isSelected
                                    ? 'bg-[#0E2115]/5 border-[#0E2115] text-[#0E2115] font-semibold'
                                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                <span
                                  className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                                    isSelected ? 'bg-[#0E2115] text-white' : 'border border-gray-300'
                                  }`}
                                >
                                  {isSelected && <Check size={12} strokeWidth={3} />}
                                </span>
                                <span className="truncate">{amenity}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 6: REVIEW & SUBMIT */}
                  {currentStep === 5 && (
                    <div className="space-y-6">
                      <div className="rounded-xl bg-stone-50 border border-stone-200/80 p-5 space-y-4">
                        {/* Summary Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                          <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0E2115]">
                              {propertyType} &middot; {listingPurpose === 'Rent' ? 'For Rent' : 'For Sale'}
                            </span>
                            <h3 className="text-base sm:text-lg font-heading font-bold text-gray-900 mt-0.5">
                              {title || 'Untitled Property'}
                            </h3>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleGoToStep(0)}
                            className="text-xs text-[#BD9655] hover:text-[#0E2115] font-semibold flex items-center gap-1"
                          >
                            <Edit3 size={13} />
                            <span>Edit</span>
                          </button>
                        </div>

                        {/* Location Summary */}
                        <div className="flex items-start justify-between pb-3 border-b border-stone-200 text-xs">
                          <div>
                            <span className="font-semibold text-gray-500 block">Location:</span>
                            <span className="text-gray-800 font-medium">
                              {locality}, {district}
                              {pincode ? ` - ${pincode}` : ''}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleGoToStep(1)}
                            className="text-xs text-[#BD9655] hover:text-[#0E2115] font-semibold flex items-center gap-1"
                          >
                            <Edit3 size={13} />
                            <span>Edit</span>
                          </button>
                        </div>

                        {/* Specs Summary (Explicit sq ft) */}
                        <div className="flex items-start justify-between pb-3 border-b border-stone-200 text-xs">
                          <div>
                            <span className="font-semibold text-gray-500 block">Specifications:</span>
                            <span className="text-gray-800 font-medium">
                              <strong>{area} sq ft</strong> &middot; {bedrooms} BHK &middot; {bathrooms} Baths &middot; {furnishedStatus}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleGoToStep(2)}
                            className="text-xs text-[#BD9655] hover:text-[#0E2115] font-semibold flex items-center gap-1"
                          >
                            <Edit3 size={13} />
                            <span>Edit</span>
                          </button>
                        </div>

                        {/* Price Summary */}
                        <div className="flex items-start justify-between pb-3 border-b border-stone-200 text-xs">
                          <div>
                            <span className="font-semibold text-gray-500 block">Pricing:</span>
                            <span className="text-gray-900 font-bold text-sm text-[#0E2115]">
                              ₹ {Number(price || 0).toLocaleString('en-IN')} {listingPurpose === 'Rent' ? '/ month' : ''}
                            </span>
                            <span className="text-gray-500 ml-2">
                              ({negotiable ? 'Negotiable' : 'Fixed Price'})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleGoToStep(3)}
                            className="text-xs text-[#BD9655] hover:text-[#0E2115] font-semibold flex items-center gap-1"
                          >
                            <Edit3 size={13} />
                            <span>Edit</span>
                          </button>
                        </div>

                        {/* Photos & Amenities Summary */}
                        <div className="flex items-start justify-between text-xs">
                          <div>
                            <span className="font-semibold text-gray-500 block">Media & Amenities:</span>
                            <span className="text-gray-800 font-medium">
                              {images.length} photo(s) uploaded &middot; {selectedAmenities.length} amenities selected
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleGoToStep(4)}
                            className="text-xs text-[#BD9655] hover:text-[#0E2115] font-semibold flex items-center gap-1"
                          >
                            <Edit3 size={13} />
                            <span>Edit</span>
                          </button>
                        </div>
                      </div>

                      {/* Moderation Notice */}
                      <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900">
                        <p className="font-semibold mb-1">Administrative Moderation</p>
                        <p className="text-amber-800/90 leading-relaxed">
                          Submitting this listing will place it in <strong>PENDING_REVIEW</strong>. TRINFRA administrators verify all residential listings to guarantee authenticity before they appear in the public marketplace.
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Buttons Footer */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              {currentStep > 0 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
              ) : (
                <Link
                  href="/seller"
                  className="flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft size={16} />
                  <span>Seller Dashboard</span>
                </Link>
              )}

              {currentStep < RESIDENTIAL_STEPS.length - 1 ? (
                <button
                  type="button"
                  id="residential-next-btn"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2.5 sm:px-8 sm:py-3 rounded-xl bg-[#0E2115] hover:bg-[#07190e] text-white text-xs sm:text-sm font-bold shadow-md transition-all group cursor-pointer"
                >
                  <span>Next</span>
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleSubmit(false)}
                    className="hidden sm:inline-flex items-center gap-1.5 px-5 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs sm:text-sm font-semibold text-gray-700 transition-colors cursor-pointer disabled:opacity-60"
                  >
                    <span>Save Draft</span>
                  </button>

                  <button
                    type="button"
                    id="residential-submit-btn"
                    disabled={submitting}
                    onClick={() => handleSubmit(true)}
                    className="flex items-center gap-2 px-6 py-2.5 sm:px-8 sm:py-3 rounded-xl bg-[#0E2115] hover:bg-[#07190e] text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Property</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Standard Mini Footer */}
      <footer className="bg-[#050B07] py-5">
        <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-[14px] text-white tracking-widest uppercase">Trinfra</span>
          </div>
          <p className="text-[11px] text-white/40">
            &copy; {new Date().getFullYear()} Trinfra Residential Marketplace. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
