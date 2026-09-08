'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bed, Bath, Maximize2, MapPin, ArrowRight } from 'lucide-react';
import type { PublicListingItem } from '@/lib/server/residential';

export function formatPrice(amount: number, priceType = 'Total', purpose = 'Sale'): string {
  if (purpose === 'Rent' || priceType.toLowerCase().includes('month')) {
    return `₹${amount.toLocaleString('en-IN')}/mo`;
  }
  if (amount >= 10000000) {
    const cr = (amount / 10000000).toFixed(2).replace(/\.00$/, '');
    return `₹${cr} Cr`;
  }
  if (amount >= 100000) {
    const lk = (amount / 100000).toFixed(2).replace(/\.00$/, '');
    return `₹${lk} Lakh`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

interface ResidentialCardProps {
  listing: PublicListingItem;
  priority?: boolean;
}

export default function ResidentialCard({ listing, priority = false }: ResidentialCardProps) {
  const [imgSrc, setImgSrc] = useState(listing.coverImage || '/images/houses_tropical.jpeg');

  const formattedPrice = formatPrice(listing.price, listing.priceType, listing.listingPurpose);

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_30px_-6px_rgba(0,0,0,0.12)] transition-all duration-300 flex flex-col hover:-translate-y-1">
      {/* Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
        <Image
          src={imgSrc}
          alt={listing.title}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImgSrc('/images/houses_tropical.jpeg')}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
          <span className="px-2.5 py-1 text-xs font-semibold tracking-wide uppercase rounded-full bg-white/95 text-gray-800 shadow-sm backdrop-blur-md">
            {listing.propertyType}
          </span>
          <span
            className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm text-white ${
              listing.listingPurpose === 'Rent'
                ? 'bg-amber-600'
                : 'bg-emerald-600'
            }`}
          >
            For {listing.listingPurpose}
          </span>
        </div>

        {/* Bottom Price on Image */}
        <div className="absolute bottom-3 left-3.5 right-3.5 flex items-baseline justify-between text-white">
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-bold tracking-tight drop-shadow-md">
              {formattedPrice}
            </span>
            {listing.negotiable && (
              <span className="text-[11px] text-emerald-300 font-medium drop-shadow">Negotiable</span>
            )}
          </div>
          {listing.area > 0 && (
            <span className="text-xs text-white/90 font-medium drop-shadow bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded">
              {listing.area.toLocaleString()} {listing.areaUnit}
            </span>
          )}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Locality & District */}
          <div className="flex items-center text-xs text-gray-500 font-medium mb-1.5 line-clamp-1">
            <MapPin size={13} className="text-primary mr-1 shrink-0" />
            <span>
              {listing.locality}, <span className="font-semibold text-gray-700">{listing.district}</span>
            </span>
          </div>

          {/* Title */}
          <h3 className="text-base sm:text-lg font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {listing.title}
          </h3>

          {/* Key Specs Pills */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-100 text-gray-600 text-xs">
            <div className="flex items-center gap-1.5">
              <Bed size={15} className="text-gray-400" />
              <span className="font-semibold">{listing.bedrooms}</span>
              <span className="text-gray-400">BHK</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bath size={15} className="text-gray-400" />
              <span className="font-semibold">{listing.bathrooms}</span>
              <span className="text-gray-400">Baths</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Maximize2 size={15} className="text-gray-400" />
              <span className="font-semibold">{listing.area}</span>
              <span className="text-gray-400 truncate">{listing.areaUnit}</span>
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="mt-5 pt-3.5 border-t border-gray-100 flex items-center justify-between">
          <div className="text-xs text-gray-400 line-clamp-1">
            By <span className="font-medium text-gray-600">{listing.seller.companyName || listing.seller.fullName}</span>
          </div>
          <Link
            href={`/residential/${listing.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-all"
          >
            <span>View Details</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
