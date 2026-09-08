'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Home, Building2, Sparkles, ChevronRight, Compass } from 'lucide-react';
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

  // Fetch on parameter change
  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Live synchronization: silently checks for newly published or unpublished listings
  useLiveDataSync({
    fetcher: async () => {
      const res = await fetch('/api/residential/districts');
      if (!res.ok) return null;
      return res.json();
    },
    onData: (data: any) => {
      if (data?.success && Array.isArray(data.districts)) {
        setDistricts(data.districts);
        // Re-fetch current listing view silently
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
    <div className="min-h-screen bg-[#fafaf9] text-gray-900 pb-20">
      {/* Top Breadcrumb & Hero Banner */}
      <section className="relative pt-28 pb-12 bg-white border-b border-gray-100 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-3 font-medium">
            <span className="hover:text-gray-600 transition-colors">Home</span>
            <ChevronRight size={12} />
            <span className="text-primary font-semibold">Residential Marketplace</span>
            {selectedDistrict !== 'ALL' && (
              <>
                <ChevronRight size={12} />
                <span className="text-gray-700 font-semibold">{selectedDistrict}</span>
              </>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 mb-3">
                <Sparkles size={13} />
                <span>Verified Kerala Residential Marketplace</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                {selectedDistrict !== 'ALL'
                  ? `Residential Properties in ${selectedDistrict}`
                  : 'Find Your Next Home in Kerala'}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-500 max-w-2xl">
                Browse verified flats, apartments, and luxury homes directly from verified property owners and developers across all 14 Kerala districts.
              </p>
            </div>

            {/* Seller CTA button */}
            <div className="shrink-0">
              <button
                onClick={() => router.push('/seller')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs sm:text-sm font-semibold hover:bg-primary/90 shadow-sm hover:shadow transition-all"
              >
                <Building2 size={16} />
                <span>Seller Portal / List Property</span>
              </button>
            </div>
          </div>

          {/* 14 Districts Selector */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <ResidentialDistrictSelector
              districts={districts}
              selectedDistrict={selectedDistrict}
              onSelectDistrict={handleSelectDistrict}
              totalAllCount={totalAllCount}
            />
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* CRITICAL BEHAVIOR:
            1. If selected district has ZERO listings:
               DO NOT show search bar, filters, or property grid.
               SHOW clean empty state with action to browse other districts.
            2. If selected district has PUBLISHED listings:
               SHOW search bar, filters, property count, cards, and sorting.
        */}
        {isSelectedDistrictEmpty ? (
          /* Clean District Empty State */
          <div className="my-12 py-16 px-6 text-center bg-white rounded-2xl border border-gray-100 shadow-xs max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-100">
              <Compass size={32} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              No residential properties are currently available in {selectedDistrict}.
            </h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
              Our verified listings in {selectedDistrict} are being onboarded. You can check active homes in other Kerala districts or list your own property here.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => handleSelectDistrict('ALL')}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs sm:text-sm font-semibold hover:bg-primary/90 transition-all shadow-xs"
              >
                Browse other districts
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
          /* Active District Discovery View */
          <div>
            {/* Search & Custom Filter Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs mb-8">
              <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title, locality, or keyword..."
                    className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-400"
                    aria-label="Search residential properties"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Filters */}
                <div className="flex-shrink-0">
                  <ResidentialFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onReset={handleResetFilters}
                    hasActiveFilters={hasActiveFilters}
                  />
                </div>
              </div>
            </div>

            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-xs sm:text-sm text-gray-500 font-medium">
                Showing <span className="font-bold text-gray-900">{totalCount}</span> verified{' '}
                {totalCount === 1 ? 'property' : 'properties'}
                {selectedDistrict !== 'ALL' && (
                  <span>
                    {' '}
                    in <span className="font-semibold text-primary">{selectedDistrict}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Loading / Results Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="bg-white rounded-2xl h-80 border border-gray-100" />
                ))}
              </div>
            ) : listings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing, idx) => (
                  <ResidentialCard key={listing.id} listing={listing} priority={idx < 3} />
                ))}
              </div>
            ) : (
              /* No search results matching filter query */
              <div className="my-12 py-12 px-4 text-center bg-white rounded-2xl border border-gray-100 max-w-md mx-auto">
                <Home size={36} className="mx-auto text-gray-300 mb-3" />
                <h3 className="text-base font-bold text-gray-800 mb-1">No matching properties found</h3>
                <p className="text-xs text-gray-500 mb-4">
                  Try adjusting your search criteria or resetting filters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12 pt-6 border-t border-gray-100">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-gray-200 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                <span className="text-xs text-gray-500 px-3">
                  Page <span className="font-semibold text-gray-900">{page}</span> of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-gray-200 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
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
