'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Bed,
  Bath,
  Maximize2,
  MapPin,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Send,
  Sparkles,
  Layers,
  Compass,
  Car,
  Home,
  Check,
  Phone,
  Mail,
  User,
} from 'lucide-react';
import { formatPrice } from './ResidentialCard';
import type { PublicListingItem } from '@/lib/server/residential';

interface ResidentialDetailProps {
  listing: PublicListingItem;
}

export default function ResidentialDetail({ listing }: ResidentialDetailProps) {
  const [activeImage, setActiveImage] = useState(
    listing.images.find((i) => i.isCover)?.url || listing.coverImage || '/images/houses_tropical.jpeg'
  );

  // Enquiry form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formMessage, setFormMessage] = useState(
    `Hello, I am interested in "${listing.title}" listed for ${formatPrice(
      listing.price,
      listing.priceType,
      listing.listingPurpose
    )}. Please share further details.`
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [enquiryError, setEnquiryError] = useState<string | null>(null);

  const handleSendEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnquiryError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/residential/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: listing.id,
          name: formName,
          email: formEmail,
          phone: formPhone,
          message: formMessage,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit enquiry');
      }

      setSubmitted(true);
    } catch (err: any) {
      setEnquiryError(err.message || 'An error occurred while sending your enquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  const formattedPrice = formatPrice(listing.price, listing.priceType, listing.listingPurpose);

  const scrollToEnquiry = () => {
    const el = document.getElementById('enquiry-form-card');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 sm:pb-20">
      {/* ================= TOP BREADCRUMB HEADER ================= */}
      <header className="pt-24 pb-4 bg-white border-b border-gray-200/80">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
          <Link
            href={`/residential?district=${encodeURIComponent(listing.district)}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-primary transition-colors py-1"
          >
            <ArrowLeft size={14} />
            <span>Back to {listing.district} Properties</span>
          </Link>
        </div>
      </header>

      {/* ================= MAIN CONTENT LAYOUT ================= */}
      <main className="max-w-[1360px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16 pt-6 sm:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* ================= LEFT 2 COLUMNS (GALLERY & DETAILS) ================= */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Gallery Card */}
            <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-200/80 shadow-2xs overflow-hidden">
              {/* Main Image */}
              <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-gray-100 mb-3">
                <Image
                  src={activeImage}
                  alt={listing.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover transition-all duration-300"
                  onError={() => setActiveImage('/images/houses_tropical.jpeg')}
                />
              </div>

              {/* Thumbnails Row */}
              {listing.images.length > 1 && (
                <div
                  className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar"
                  style={{ WebkitOverflowScrolling: 'touch' }}
                >
                  {listing.images.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImage(img.url)}
                      className={`relative w-20 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                        activeImage === img.url
                          ? 'border-accent ring-2 ring-accent/30 scale-102'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                      aria-label="View photo thumbnail"
                    >
                      <Image src={img.url} alt="Thumbnail" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Property Title & Price Card */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-2xs">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-2.5 py-1 text-xs font-semibold tracking-wide uppercase rounded-full bg-gray-100 text-gray-800">
                  {listing.propertyType}
                </span>
                <span
                  className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full text-white ${
                    listing.listingPurpose === 'Rent' ? 'bg-accent' : 'bg-primary'
                  }`}
                >
                  For {listing.listingPurpose}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-primary font-medium bg-primary/10 px-2.5 py-1 rounded-full">
                  <ShieldCheck size={13} className="text-primary" />
                  <span>TRINFRA Verified</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900 tracking-tight leading-snug">
                {listing.title}
              </h1>

              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 mt-2">
                <MapPin size={15} className="text-accent shrink-0" />
                <span>
                  {listing.locality}, <span className="font-semibold text-gray-800">{listing.district}</span>
                  {listing.pincode ? ` — ${listing.pincode}` : ''}
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-0.5">
                    {listing.listingPurpose === 'Rent' ? 'Monthly Rent' : 'Offer Price'}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-heading font-bold text-primary tracking-tight">
                      {formattedPrice}
                    </span>
                    {listing.negotiable && (
                      <span className="text-xs text-accent font-semibold uppercase tracking-wide">
                        Negotiable
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  <span className="font-semibold text-gray-800">{listing.bedrooms} BHK</span> •{' '}
                  <span className="font-semibold text-gray-800">{listing.area} {listing.areaUnit}</span>
                </div>
              </div>
            </div>

            {/* Specifications Matrix Card */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-2xs">
              <h2 className="text-sm sm:text-base font-heading font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles size={16} className="text-accent" />
                <span>Property Specifications</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 bg-gray-50/90 rounded-xl border border-gray-100">
                  <span className="text-gray-400 block mb-1 flex items-center gap-1.5">
                    <Bed size={13} className="text-accent" /> Bedrooms
                  </span>
                  <span className="text-sm font-bold text-gray-800">{listing.bedrooms} BHK</span>
                </div>

                <div className="p-3.5 bg-gray-50/90 rounded-xl border border-gray-100">
                  <span className="text-gray-400 block mb-1 flex items-center gap-1.5">
                    <Bath size={13} className="text-accent" /> Bathrooms
                  </span>
                  <span className="text-sm font-bold text-gray-800">{listing.bathrooms} Baths</span>
                </div>

                <div className="p-3.5 bg-gray-50/90 rounded-xl border border-gray-100">
                  <span className="text-gray-400 block mb-1 flex items-center gap-1.5">
                    <Maximize2 size={13} className="text-accent" /> Built-up Area
                  </span>
                  <span className="text-sm font-bold text-gray-800">
                    {listing.area} {listing.areaUnit}
                  </span>
                </div>

                <div className="p-3.5 bg-gray-50/90 rounded-xl border border-gray-100">
                  <span className="text-gray-400 block mb-1 flex items-center gap-1.5">
                    <Home size={13} className="text-accent" /> Furnishing
                  </span>
                  <span className="text-sm font-bold text-gray-800">
                    {listing.furnishedStatus || 'Unspecified'}
                  </span>
                </div>

                {listing.floor !== null && (
                  <div className="p-3.5 bg-gray-50/90 rounded-xl border border-gray-100">
                    <span className="text-gray-400 block mb-1 flex items-center gap-1.5">
                      <Layers size={13} className="text-accent" /> Floor Level
                    </span>
                    <span className="text-sm font-bold text-gray-800">
                      {listing.floor} {listing.totalFloors ? `of ${listing.totalFloors}` : ''}
                    </span>
                  </div>
                )}

                {listing.parking && (
                  <div className="p-3.5 bg-gray-50/90 rounded-xl border border-gray-100">
                    <span className="text-gray-400 block mb-1 flex items-center gap-1.5">
                      <Car size={13} className="text-accent" /> Parking
                    </span>
                    <span className="text-sm font-bold text-gray-800">{listing.parking}</span>
                  </div>
                )}

                {listing.facing && (
                  <div className="p-3.5 bg-gray-50/90 rounded-xl border border-gray-100">
                    <span className="text-gray-400 block mb-1 flex items-center gap-1.5">
                      <Compass size={13} className="text-accent" /> Facing
                    </span>
                    <span className="text-sm font-bold text-gray-800">{listing.facing}</span>
                  </div>
                )}

                {listing.propertyAge && (
                  <div className="p-3.5 bg-gray-50/90 rounded-xl border border-gray-100">
                    <span className="text-gray-400 block mb-1 flex items-center gap-1.5">
                      <Calendar size={13} className="text-accent" /> Age of Property
                    </span>
                    <span className="text-sm font-bold text-gray-800">{listing.propertyAge}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-2xs">
              <h2 className="text-sm sm:text-base font-heading font-bold text-gray-900 mb-3">
                About this Property
              </h2>
              <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-line text-xs sm:text-sm">
                {listing.description || 'No detailed description provided.'}
              </div>
            </div>

            {/* Amenities Grid Card */}
            {listing.amenities && listing.amenities.length > 0 && (
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-2xs">
                <h2 className="text-sm sm:text-base font-heading font-bold text-gray-900 mb-4">
                  Features & Amenities
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {listing.amenities.map((amenity, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2.5 bg-gray-50/90 rounded-xl text-xs font-medium text-gray-700 border border-gray-100"
                    >
                      <CheckCircle2 size={14} className="text-primary shrink-0" />
                      <span className="truncate">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ================= RIGHT COLUMN (SELLER INFO & ENQUIRY) ================= */}
          <div className="space-y-6">
            {/* Seller Profile Summary Card */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs">
              <div className="flex items-center gap-3 mb-3.5">
                <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg shadow-xs">
                  {listing.seller.fullName.charAt(0)}
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block">
                    Listed By
                  </span>
                  <h3 className="text-sm font-bold text-gray-900">{listing.seller.fullName}</h3>
                  {listing.seller.companyName && (
                    <p className="text-xs text-gray-500">{listing.seller.companyName}</p>
                  )}
                </div>
              </div>
              <div className="text-[11px] text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100 leading-relaxed">
                Direct communication with verified property owner or authorized representative. Verified by TRINFRA compliance team.
              </div>
            </div>

            {/* Direct Enquiry Form Card */}
            <div
              id="enquiry-form-card"
              className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-sm sticky top-24"
            >
              <h3 className="text-base sm:text-lg font-heading font-bold text-gray-900 mb-1">
                Contact Property Owner
              </h3>
              <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                Submit an enquiry directly to the property representative.
              </p>

              {submitted ? (
                <div className="p-5 bg-primary/5 border border-primary/20 rounded-xl text-center">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-2.5">
                    <Check size={20} />
                  </div>
                  <h4 className="text-sm font-bold text-primary mb-1">Enquiry Submitted!</h4>
                  <p className="text-xs text-gray-600">
                    The owner will review your message and contact you directly via phone or email.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendEnquiry} className="space-y-3.5">
                  {enquiryError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                      {enquiryError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Your Full Name *</label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number *</label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        required
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Message</label>
                    <textarea
                      rows={3}
                      value={formMessage}
                      onChange={(e) => setFormMessage(e.target.value)}
                      className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-btn text-white font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <Send size={13} />
                    <span>{submitting ? 'Submitting Enquiry...' : 'Send Direct Enquiry'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ================= STICKY MOBILE ACTION BAR (< lg) ================= */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/80 px-4 py-3 flex items-center justify-between lg:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
        <div>
          <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
            {listing.listingPurpose === 'Rent' ? 'Monthly Rent' : 'Price'}
          </span>
          <span className="text-lg font-heading font-bold text-primary tracking-tight">
            {formattedPrice}
          </span>
        </div>

        <button
          onClick={scrollToEnquiry}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold shadow-xs transition-all active:scale-98"
        >
          <Send size={13} />
          <span>Contact Owner</span>
        </button>
      </div>
    </div>
  );
}
