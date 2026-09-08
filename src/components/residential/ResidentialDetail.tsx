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

  return (
    <div className="min-h-screen bg-[#fafaf9] text-gray-900 pb-20">
      {/* Top Header & Navigation */}
      <div className="pt-28 pb-6 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={`/residential?district=${encodeURIComponent(listing.district)}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft size={14} />
            <span>Back to {listing.district} Properties</span>
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 text-xs font-semibold uppercase rounded-full bg-gray-100 text-gray-700">
                  {listing.propertyType}
                </span>
                <span
                  className={`px-2.5 py-0.5 text-xs font-bold uppercase rounded-full text-white ${
                    listing.listingPurpose === 'Rent' ? 'bg-amber-600' : 'bg-emerald-600'
                  }`}
                >
                  For {listing.listingPurpose}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
                  <ShieldCheck size={13} />
                  <span>Verified Listing</span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {listing.title}
              </h1>
              <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 mt-1">
                <MapPin size={15} className="text-primary" />
                <span>
                  {listing.locality}, <span className="font-semibold text-gray-700">{listing.district}</span>
                  {listing.pincode ? ` — ${listing.pincode}` : ''}
                </span>
              </div>
            </div>

            {/* Price badge */}
            <div className="flex flex-col lg:items-end">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                {listing.listingPurpose === 'Rent' ? 'Rent per month' : 'Offer Price'}
              </span>
              <span className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                {formattedPrice}
              </span>
              {listing.negotiable && (
                <span className="text-xs text-emerald-600 font-semibold mt-0.5">Price Negotiable</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Columns: Gallery & Specification Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs overflow-hidden">
              <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-gray-100 mb-3">
                <Image
                  src={activeImage}
                  alt={listing.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover"
                />
              </div>

              {/* Thumbnails */}
              {listing.images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {listing.images.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImage(img.url)}
                      className={`relative w-20 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                        activeImage === img.url
                          ? 'border-primary ring-2 ring-primary/20 scale-105'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Image src={img.url} alt="Thumbnail" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Key Specs Matrix */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles size={16} className="text-primary" />
                <span>Property Specifications</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-xs">
                <div className="p-3.5 bg-gray-50 rounded-xl">
                  <span className="text-gray-400 block mb-1 flex items-center gap-1">
                    <Bed size={13} /> Bedrooms
                  </span>
                  <span className="text-sm font-bold text-gray-800">{listing.bedrooms} BHK</span>
                </div>

                <div className="p-3.5 bg-gray-50 rounded-xl">
                  <span className="text-gray-400 block mb-1 flex items-center gap-1">
                    <Bath size={13} /> Bathrooms
                  </span>
                  <span className="text-sm font-bold text-gray-800">{listing.bathrooms} Baths</span>
                </div>

                <div className="p-3.5 bg-gray-50 rounded-xl">
                  <span className="text-gray-400 block mb-1 flex items-center gap-1">
                    <Maximize2 size={13} /> Built-up Area
                  </span>
                  <span className="text-sm font-bold text-gray-800">
                    {listing.area} {listing.areaUnit}
                  </span>
                </div>

                <div className="p-3.5 bg-gray-50 rounded-xl">
                  <span className="text-gray-400 block mb-1 flex items-center gap-1">
                    <Home size={13} /> Furnishing
                  </span>
                  <span className="text-sm font-bold text-gray-800">
                    {listing.furnishedStatus || 'Unspecified'}
                  </span>
                </div>

                {listing.floor !== null && (
                  <div className="p-3.5 bg-gray-50 rounded-xl">
                    <span className="text-gray-400 block mb-1 flex items-center gap-1">
                      <Layers size={13} /> Floor Level
                    </span>
                    <span className="text-sm font-bold text-gray-800">
                      {listing.floor} {listing.totalFloors ? `of ${listing.totalFloors}` : ''}
                    </span>
                  </div>
                )}

                {listing.parking && (
                  <div className="p-3.5 bg-gray-50 rounded-xl">
                    <span className="text-gray-400 block mb-1 flex items-center gap-1">
                      <Car size={13} /> Parking
                    </span>
                    <span className="text-sm font-bold text-gray-800">{listing.parking}</span>
                  </div>
                )}

                {listing.facing && (
                  <div className="p-3.5 bg-gray-50 rounded-xl">
                    <span className="text-gray-400 block mb-1 flex items-center gap-1">
                      <Compass size={13} /> Facing
                    </span>
                    <span className="text-sm font-bold text-gray-800">{listing.facing}</span>
                  </div>
                )}

                {listing.propertyAge && (
                  <div className="p-3.5 bg-gray-50 rounded-xl">
                    <span className="text-gray-400 block mb-1 flex items-center gap-1">
                      <Calendar size={13} /> Age of Property
                    </span>
                    <span className="text-sm font-bold text-gray-800">{listing.propertyAge}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
              <h2 className="text-base font-bold text-gray-900 mb-3">About this Property</h2>
              <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                {listing.description || 'No detailed description provided.'}
              </div>
            </div>

            {/* Amenities Grid */}
            {listing.amenities && listing.amenities.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
                <h2 className="text-base font-bold text-gray-900 mb-4">Features & Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {listing.amenities.map((amenity, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl text-xs font-medium text-gray-700"
                    >
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Contact / Enquiry Sidebar */}
          <div className="space-y-6">
            {/* Seller Profile Summary Card */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                  {listing.seller.fullName.charAt(0)}
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Listed By
                  </span>
                  <h3 className="text-sm font-bold text-gray-900">{listing.seller.fullName}</h3>
                  {listing.seller.companyName && (
                    <p className="text-xs text-gray-500">{listing.seller.companyName}</p>
                  )}
                </div>
              </div>
              <div className="text-[11px] text-gray-400 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                Direct enquiry to verified property representative. Identity verified by TRINFRA compliance team.
              </div>
            </div>

            {/* Enquiry Form Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Contact Property Owner</h2>
              <p className="text-xs text-gray-500 mb-5">
                Send an enquiry directly to the owner/representative.
              </p>

              {submitted ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-2">
                    <Check size={20} />
                  </div>
                  <h3 className="text-sm font-bold text-emerald-800">Enquiry Sent!</h3>
                  <p className="text-xs text-emerald-700 mt-1">
                    Your enquiry has been received. The property owner will contact you shortly via phone or email.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 text-xs font-semibold text-emerald-800 underline hover:no-underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendEnquiry} className="space-y-3.5">
                  {enquiryError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                      {enquiryError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Rahul Varma"
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="e.g. rahul@example.com"
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="e.g. +91 98470 12345"
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Message</label>
                    <textarea
                      rows={3}
                      value={formMessage}
                      onChange={(e) => setFormMessage(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 rounded-xl bg-primary text-white text-xs sm:text-sm font-semibold hover:bg-primary/90 shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Send size={14} />
                    <span>{submitting ? 'Sending...' : 'Send Enquiry'}</span>
                  </button>

                  <p className="text-[10px] text-gray-400 text-center">
                    By submitting, you agree to TRINFRA’s Terms of Service and Privacy Policy.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
