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
    <article className="group bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Image Container with Consistent Aspect Ratio */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
          <Image
            src={imgSrc}
            alt={listing.title}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-104"
            onError={() => setImgSrc('/images/houses_tropical.jpeg')}
          />

          {/* Subtle gradient vignette for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <span className="px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase rounded-full bg-white/95 text-primary shadow-xs backdrop-blur-md">
              {listing.propertyType}
            </span>
            <span
              className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full shadow-xs text-white ${
                listing.listingPurpose === 'Rent'
                  ? 'bg-accent/95'
                  : 'bg-primary/95'
              }`}
            >
              For {listing.listingPurpose}
            </span>
          </div>

          {/* Bottom Area Pill on Image */}
          {listing.area > 0 && (
            <div className="absolute bottom-2.5 right-3 pointer-events-none">
              <span className="text-[11px] text-white font-medium bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-md">
                {listing.area.toLocaleString()} {listing.areaUnit}
              </span>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-5">
          {/* Locality & District */}
          <div className="flex items-center text-xs text-gray-500 font-medium mb-1.5 line-clamp-1">
            <MapPin size={13} className="text-accent mr-1 shrink-0" />
            <span>
              {listing.locality}, <span className="font-semibold text-gray-800">{listing.district}</span>
            </span>
          </div>

          {/* Property Title */}
          <h3 className="text-base sm:text-lg font-heading font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-primary transition-colors min-h-[2.5rem]">
            {listing.title}
          </h3>

          {/* Price Strip */}
          <div className="mt-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-heading font-bold text-primary tracking-tight">
                {formattedPrice}
              </span>
              {listing.negotiable && (
                <span className="text-[11px] font-semibold text-accent uppercase tracking-wide">
                  Negotiable
                </span>
              )}
            </div>
          </div>

          {/* Key Specifications Grid */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-100 text-gray-600 text-xs">
            <div className="flex items-center gap-1.5" title={`${listing.bedrooms} Bedrooms`}>
              <Bed size={14} className="text-gray-400 shrink-0" />
              <span className="font-semibold text-gray-800">{listing.bedrooms}</span>
              <span className="text-gray-400 text-[11px]">BHK</span>
            </div>
            <div className="flex items-center gap-1.5" title={`${listing.bathrooms} Bathrooms`}>
              <Bath size={14} className="text-gray-400 shrink-0" />
              <span className="font-semibold text-gray-800">{listing.bathrooms}</span>
              <span className="text-gray-400 text-[11px]">Baths</span>
            </div>
            <div className="flex items-center gap-1.5" title={`${listing.area} ${listing.areaUnit}`}>
              <Maximize2 size={14} className="text-gray-400 shrink-0" />
              <span className="font-semibold text-gray-800 truncate">{listing.area}</span>
              <span className="text-gray-400 text-[11px] truncate">{listing.areaUnit}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer CTA */}
      <div className="px-4 sm:px-5 pb-4 pt-2 border-t border-gray-100/80 flex items-center justify-between">
        <div className="text-[11px] text-gray-400 truncate max-w-[55%]">
          By <span className="font-medium text-gray-600">{listing.seller.companyName || listing.seller.fullName}</span>
        </div>
        <Link
          href={`/residential/${listing.slug}`}
          className="inline-flex items-center gap-1 px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-semibold text-primary hover:text-white bg-gray-100 hover:bg-primary transition-all duration-200 group-hover:bg-primary group-hover:text-white shrink-0"
          aria-label={`View details for ${listing.title}`}
        >
          <span>View Property</span>
          <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}
