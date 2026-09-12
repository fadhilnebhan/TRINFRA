'use client';

import React, { useState, useEffect, useCallback, useTransition, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Search, Home, Building2, ChevronRight, Compass, Sparkles } from 'lucide-react';
import ResidentialDistrictSelector from './ResidentialDistrictSelector';
import ResidentialFilters, { FilterState } from './ResidentialFilters';
import ResidentialCard from './ResidentialCard';
import { useLiveDataSync } from '@/hooks/useLiveDataSync';
import type { PublicListingItem, DistrictSummary } from '@/lib/server/residential';

interface ResidentialPageProps {
  initialDistricts: DistrictSummary[];
  initialListings: PublicListingItem[];
  initialTotal: number;
  initialDistrict: string;
}

export default function ResidentialPage({
  initialDistricts,
  initialListings,
  initialTotal,
  initialDistrict,
}: ResidentialPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [districts, setDistricts] = useState<DistrictSummary[]>(initialDistricts);
  const [selectedDistrict, setSelectedDistrict] = useState<string>(initialDistrict || 'ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [listings, setListings] = useState<PublicListingItem[]>(initialListings);
  const [totalCount, setTotalCount] = useState<number>(initialTotal);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(Math.ceil(initialTotal / 12) || 1);

  const [filters, setFilters] = useState<FilterState>({
    propertyType: 'All',
    listingPurpose: 'All',
    bedrooms: 'All',
    sortBy: 'newest',
  });

  // Sync selected district with URL query parameter
  useEffect(() => {
    const d = searchParams.get('district');
    if (d && d !== selectedDistrict) {
      setSelectedDistrict(d);
    } else if (!d && selectedDistrict !== 'ALL' && !initialDistrict) {
      setSelectedDistrict('ALL');
    }
  }, [searchParams, selectedDistrict, initialDistrict]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Determine if the selected district has published listings
  const currentDistrictSummary = districts.find(
    (d) => d.district.toLowerCase() === selectedDistrict.toLowerCase()
  );
  const selectedDistrictCount = currentDistrictSummary ? currentDistrictSummary.count : 0;
  const isSelectedDistrictEmpty = selectedDistrict !== 'ALL' && selectedDistrictCount === 0;

  // Calculate total properties across all 14 districts
  const totalAllCount = districts.reduce((acc, d) => acc + d.count, 0);

  // Fetch listings based on district, search, filters, and page
  const fetchListings = useCallback(async () => {
    if (isSelectedDistrictEmpty) {
      setListings([]);
      setTotalCount(0);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDistrict !== 'ALL') {
        params.set('district', selectedDistrict);
      }
      if (debouncedSearch.trim()) {
        params.set('search', debouncedSearch.trim());
      }
      if (filters.propertyType !== 'All') {
        params.set('propertyType', filters.propertyType);
      }
      if (filters.listingPurpose !== 'All') {
        params.set('listingPurpose', filters.listingPurpose);
      }
      if (filters.bedrooms !== 'All') {
        params.set('bedrooms', filters.bedrooms);
      }
      if (filters.sortBy) {
        params.set('sortBy', filters.sortBy);
      }
      params.set('page', String(page));
      params.set('limit', '12');

      const res = await fetch(`/api/residential/listings?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch listings');
      const data = await res.json();

      if (data.success) {
        setListings(data.listings);
        setTotalCount(data.total);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching residential listings:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDistrict, debouncedSearch, filters, page, isSelectedDistrictEmpty]);

  const isFirstMount = useRef(true);

  // Fetch on parameter change (skip on initial mount since SSR provides authoritative listings)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    fetchListings();
  }, [fetchListings]);

  // Live synchronization
  useLiveDataSync({
    fetcher: async () => {
      const res = await fetch('/api/residential/districts');
      if (!res.ok) return null;
      return res.json();
    },
    onData: (data: any) => {
      if (data?.success && Array.isArray(data.districts)) {
        setDistricts(data.districts);
        fetchListings();
      }
    },
    intervalMs: 25000,
    enabled: true,
  });

  const handleSelectDistrict = (districtName: string) => {
    setSelectedDistrict(districtName);
    setSearchQuery('');
    setPage(1);

    startTransition(() => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      if (districtName === 'ALL') {
        current.delete('district');
      } else {
        current.set('district', districtName);
      }
      const search = current.toString();
      const query = search ? `?${search}` : '';
      router.push(`/residential${query}`, { scroll: false });
    });
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      propertyType: 'All',
      listingPurpose: 'All',
      bedrooms: 'All',
      sortBy: 'newest',
    });
    setSearchQuery('');
    setPage(1);
  };

  const hasActiveFilters =
    filters.propertyType !== 'All' ||
    filters.listingPurpose !== 'All' ||
    filters.bedrooms !== 'All' ||
    filters.sortBy !== 'newest' ||
    Boolean(searchQuery.trim());

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* ================= HERO HEADER (TRINFRA SIGNATURE IDENTITY) ================= */}
      <section className="relative w-full min-h-[380px] sm:min-h-[420px] lg:min-h-[460px] flex flex-col justify-end overflow-hidden">
        {/* Architectural Photography Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero_landscape.jpeg"
            alt="TRINFRA Residential Properties"
            fill
            priority
            sizes="100vw"
            quality={75}
            className="object-cover object-center"
          />
        </div>

        {/* Deep Forest Green Gradient Overlays */}
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#0E2115]/95 via-[#0E2115]/85 to-[#0E2115]/65" />
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#0E2115] via-transparent to-black/25" />

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-[1360px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16 w-full pb-10 sm:pb-14 pt-28 sm:pt-36">
          {/* Breadcrumb Trail */}
          <nav className="flex items-center gap-2 text-xs text-white/60 mb-4 font-medium" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight size={12} className="text-white/40" />
            <span className="text-accent font-semibold">Residential Marketplace</span>
            {selectedDistrict !== 'ALL' && (
              <>
                <ChevronRight size={12} className="text-white/40" />
                <span className="text-white font-semibold">{selectedDistrict}</span>
              </>
            )}
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              {/* Category Kicker */}
              <p className="text-[11px] font-bold tracking-[0.25em] uppercase text-accent/90 mb-3 flex items-center gap-1.5">
                <Sparkles size={12} className="text-accent" />
                <span>Kerala Residential Marketplace</span>
              </p>

              {/* Two-tone Signature Heading */}
              <h1 className="text-[32px] sm:text-[44px] lg:text-[52px] font-heading font-bold leading-[1.08] tracking-tight mb-4 text-white">
                <span>Find a Home </span>
                <span className="text-accent block sm:inline">That Fits Your Needs.</span>
              </h1>

              {/* Editorial Description */}
              <p className="text-sm sm:text-base text-white/80 max-w-xl leading-relaxed">
                Browse verified flats, apartments, and residential homes directly from verified owners and developers across all 14 Kerala districts.
              </p>
            </div>

            {/* Contextual Residential Primary Action */}
            <div className="shrink-0">
              <button
                id="residential-list-property-cta"
                onClick={() => router.push('/seller/listings/new')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs sm:text-sm font-semibold shadow-panel transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Building2 size={16} />
                <span>List Your Property</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 14 DISTRICTS SELECTOR BAR ================= */}
      <section className="bg-white border-b border-gray-200/80">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16 py-3.5">
          <ResidentialDistrictSelector
            districts={districts}
            selectedDistrict={selectedDistrict}
            onSelectDistrict={handleSelectDistrict}
            totalAllCount={totalAllCount}
          />
        </div>
      </section>

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="max-w-[1360px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16 pt-8">
        {isSelectedDistrictEmpty ? (
          /* ================= EMPTY DISTRICT STATE ================= */
          <div className="my-10 py-16 px-6 text-center bg-white rounded-2xl border border-gray-200/80 shadow-panel max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mx-auto mb-5 border border-accent/20">
              <Compass size={32} />
            </div>
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-gray-900 mb-2">
              No residential properties are currently available in {selectedDistrict}.
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mb-6 leading-relaxed">
              Our verified listings in {selectedDistrict} are actively being vetted and onboarded. You can explore active homes in other Kerala districts or list your property today.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => handleSelectDistrict('ALL')}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs sm:text-sm font-semibold hover:bg-primary-btn transition-all shadow-xs"
              >
                Explore other districts
              </button>
              <button
                onClick={() => router.push('/seller/listings/new')}
                className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-xs sm:text-sm font-semibold hover:bg-gray-200 transition-all"
              >
                List a property in {selectedDistrict}
              </button>
            </div>
          </div>
        ) : (
          /* ================= ACTIVE DISCOVERY VIEW ================= */
          <div>
            {/* Search & Custom Filter Bar */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200/80 shadow-2xs mb-6">
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                {/* Search Bar */}
                <div className="relative flex-1 min-w-0">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by locality, title, or keywords..."
                    className="w-full pl-10 pr-12 py-2.5 text-xs sm:text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-400"
                    aria-label="Search residential properties"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-700 font-medium px-1.5 py-0.5"
                      aria-label="Clear search"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Filter Controls (Desktop Bar + Mobile Drawer) */}
                <div className="shrink-0">
                  <ResidentialFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onReset={handleResetFilters}
                    hasActiveFilters={hasActiveFilters}
                  />
                </div>
              </div>
            </div>

            {/* Results Count Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="text-xs sm:text-sm text-gray-500 font-medium">
                Showing <span className="font-bold text-gray-900">{totalCount}</span> verified{' '}
                {totalCount === 1 ? 'property' : 'properties'}
                {selectedDistrict !== 'ALL' && (
                  <span>
                    {' '}
                    in <span className="font-bold text-primary">{selectedDistrict}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Properties Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="bg-white rounded-2xl h-80 border border-gray-100" />
                ))}
              </div>
            ) : listings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {listings.map((listing, idx) => (
                  <ResidentialCard key={listing.id} listing={listing} priority={idx < 3} />
                ))}
              </div>
            ) : (
              /* No Search Results */
              <div className="my-10 py-12 px-4 text-center bg-white rounded-2xl border border-gray-200/80 max-w-md mx-auto">
                <Home size={36} className="mx-auto text-gray-300 mb-3" />
                <h3 className="text-base font-bold text-gray-800 mb-1">No matching properties found</h3>
                <p className="text-xs text-gray-500 mb-4">
                  Try adjusting your search criteria or resetting filters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 text-xs font-semibold bg-primary text-white rounded-xl hover:bg-primary-btn transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12 pt-6 border-t border-gray-200/80">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-4 py-2 min-h-[38px] text-xs font-semibold rounded-xl border border-gray-200 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                <span className="text-xs text-gray-500 px-3">
                  Page <span className="font-semibold text-gray-900">{page}</span> of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-4 py-2 min-h-[38px] text-xs font-semibold rounded-xl border border-gray-200 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
