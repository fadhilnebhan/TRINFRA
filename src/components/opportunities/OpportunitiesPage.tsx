'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Search,
  X,
  ArrowRight,
  ArrowLeft,
  Map as MapIcon,
  SlidersHorizontal,
} from 'lucide-react';
import {
  OPPORTUNITIES,
  filterOpportunities,
  getOpportunityDistricts,
  getOpportunityLocalities,
} from '@/lib/opportunitiesData';
import OpportunityCard from './OpportunityCard';
import CustomSelect from './CustomSelect';

const AREA_RANGES = [
  { label: 'Any Area', value: '' },
  { label: 'Under 50 Acres', value: 'under-50' },
  { label: '50 – 100 Acres', value: '50-100' },
  { label: '100 – 200 Acres', value: '100-200' },
  { label: 'Above 200 Acres', value: 'above-200' },
];

const STATUS_OPTIONS = [
  { label: 'All Status', value: '' },
  { label: 'Emerging', value: 'Emerging' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'New Opportunity', value: 'New Opportunity' },
];

const SORT_OPTIONS = [
  { label: 'Latest First', value: 'latest' },
  { label: 'Largest Area', value: 'area' },
];

const ITEMS_PER_PAGE = 6;

export default function OpportunitiesPage() {
  const [district, setDistrict] = useState('');
  const [locality, setLocality] = useState('');
  const [areaRange, setAreaRange] = useState('');
  const [status, setStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<{
    district: string;
    locality: string;
    areaRange: string;
    status: string;
    search: string;
  }>({ district: '', locality: '', areaRange: '', status: '', search: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'latest' | 'area'>('latest');

  const districts = getOpportunityDistricts();

  const availableLocalities = useMemo(() => {
    if (district) {
      return Array.from(
        new Set(
          OPPORTUNITIES.filter((o) => o.district === district).map(
            (o) => o.locality
          )
        )
      ).sort();
    }
    return getOpportunityLocalities();
  }, [district]);

  const districtOptions = useMemo(
    () => [
      { label: 'All Districts', value: '' },
      ...districts.map((d) => ({ label: d, value: d })),
    ],
    [districts]
  );

  const localityOptions = useMemo(
    () => [
      { label: 'All Localities', value: '' },
      ...availableLocalities.map((l) => ({ label: l, value: l })),
    ],
    [availableLocalities]
  );

  const handleDistrictChange = (newDistrict: string) => {
    setDistrict(newDistrict);
    if (newDistrict) {
      const validLocalities = OPPORTUNITIES.filter(
        (o) => o.district === newDistrict
      ).map((o) => o.locality);
      if (locality && !validLocalities.includes(locality)) {
        setLocality('');
      }
    }
  };

  const filteredOpportunities = useMemo(() => {
    let results = filterOpportunities({
      district: appliedFilters.district,
      locality: appliedFilters.locality,
      areaRange: appliedFilters.areaRange,
      status: appliedFilters.status,
      search: appliedFilters.search,
    });

    if (sortOrder === 'area') {
      results = [...results].sort((a, b) => b.area - a.area);
    }

    return results;
  }, [appliedFilters, sortOrder]);

  const totalPages = Math.ceil(filteredOpportunities.length / ITEMS_PER_PAGE);
  const paginatedOpportunities = filteredOpportunities.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearch = () => {
    setAppliedFilters({
      district,
      locality,
      areaRange,
      status,
      search: searchQuery,
    });
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setDistrict('');
    setLocality('');
    setAreaRange('');
    setStatus('');
    setSearchQuery('');
    setAppliedFilters({
      district: '',
      locality: '',
      areaRange: '',
      status: '',
      search: '',
    });
    setCurrentPage(1);
  };

  const hasActiveFilters =
    appliedFilters.district ||
    appliedFilters.locality ||
    appliedFilters.areaRange ||
    appliedFilters.status ||
    appliedFilters.search;

  return (
    <div>
      {/* ====== HERO HEADER ====== */}
      <section className="relative w-full min-h-[420px] lg:min-h-[480px] flex flex-col justify-end overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("/images/hero_landscape.jpeg")' }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#0E2115]/95 via-[#0E2115]/85 to-[#0E2115]/60" />
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#0E2115] via-transparent to-black/20" />

        <div className="relative z-10 max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16 w-full pb-16 pt-36">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[11px] font-bold tracking-[0.25em] uppercase text-accent/90 mb-4">
              Opportunities
            </p>
            <h1 className="text-[40px] md:text-[52px] lg:text-[60px] font-heading font-bold leading-[1.05] tracking-tight mb-6">
              <span className="text-white block">Discover Land,</span>
              <span className="text-accent block mt-1">
                Build Possibilities.
              </span>
            </h1>
            <p className="text-[17px] text-white/80 max-w-[560px] leading-relaxed">
              Explore credible land-pooling opportunities with structured
              information. Partner with Trinfra to create sustainable and
              high-impact developments.
            </p>

            {/* Floating badge */}
            <div className="hidden lg:inline-flex items-center px-4 py-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 mt-8 gap-3">
              <span className="text-white/60 text-[13px]">Stronger</span>
              <span className="w-1 h-1 rounded-full bg-accent" />
              <span className="text-white/60 text-[13px]">Greater Value</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ====== FILTER BAR ====== */}
      <section className="bg-background border-b border-gray-200 sticky top-[72px] z-30">
        <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16 py-5">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-end gap-4">
            {/* Filters */}
            <div className="flex-grow grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* District */}
              <div>
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
                  District
                </label>
                <CustomSelect
                  id="filter-district"
                  value={district}
                  onChange={handleDistrictChange}
                  options={districtOptions}
                  placeholder="All Districts"
                  aria-label="District"
                />
              </div>

              {/* Locality */}
              <div>
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
                  Locality
                </label>
                <CustomSelect
                  id="filter-locality"
                  value={locality}
                  onChange={setLocality}
                  options={localityOptions}
                  placeholder="All Localities"
                  aria-label="Locality"
                />
              </div>

              {/* Area */}
              <div>
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
                  Approximate Area
                </label>
                <CustomSelect
                  id="filter-area"
                  value={areaRange}
                  onChange={setAreaRange}
                  options={AREA_RANGES}
                  placeholder="Any Area"
                  aria-label="Approximate Area"
                />
              </div>

              {/* Status */}
              <div>
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
                  Opportunity Status
                </label>
                <CustomSelect
                  id="filter-status"
                  value={status}
                  onChange={setStatus}
                  options={STATUS_OPTIONS}
                  placeholder="All Status"
                  aria-label="Opportunity Status"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-stretch sm:items-end gap-2 shrink-0 w-full sm:w-auto">
              <button
                id="search-btn"
                onClick={handleSearch}
                className="flex-1 sm:flex-none bg-primary text-white px-6 py-2.5 rounded-lg text-[14px] font-bold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Search size={16} />
                Search
              </button>
              {hasActiveFilters && (
                <button
                  id="clear-filters-btn"
                  onClick={handleClearFilters}
                  className="flex-1 sm:flex-none bg-white text-gray-600 px-4 py-2.5 rounded-lg text-[14px] font-medium border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <X size={14} />
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ====== RESULTS ====== */}
      <section className="py-12 bg-background">
        <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16">
          {/* Results Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div className="flex items-center gap-3">
              <SlidersHorizontal size={18} className="text-gray-400" />
              <p className="text-[15px] text-foreground">
                <span className="font-bold">{filteredOpportunities.length}</span>{' '}
                <span className="text-gray-500">
                  Opportunit{filteredOpportunities.length === 1 ? 'y' : 'ies'}{' '}
                  Found
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2 text-[13px] text-gray-500">
              <span className="shrink-0 font-medium">Sort by</span>
              <div className="w-[145px]">
                <CustomSelect
                  id="sort-select"
                  size="sm"
                  align="right"
                  value={sortOrder}
                  onChange={(val) => setSortOrder(val as 'latest' | 'area')}
                  options={SORT_OPTIONS}
                  placeholder="Latest First"
                  aria-label="Sort opportunities"
                />
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
            {paginatedOpportunities.map((opportunity, i) => (
              <motion.div
                key={opportunity.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <OpportunityCard opportunity={opportunity} />
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredOpportunities.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-gray-400" />
              </div>
              <h3 className="text-[20px] font-bold text-foreground mb-2">
                No opportunities found
              </h3>
              <p className="text-[14px] text-gray-500 mb-6">
                Try adjusting your filters or search terms.
              </p>
              <button
                onClick={handleClearFilters}
                className="text-accent font-semibold text-[14px] hover:text-accent-hover transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg text-[14px] font-semibold transition-colors ${
                      page === currentPage
                        ? 'bg-primary text-white shadow-sm'
                        : 'border border-gray-200 text-foreground hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ====== MAP CTA SECTION ====== */}
      <section id="map" className="py-16 bg-background">
        <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16">
          <div className="bg-[#0A1810] rounded-[24px] overflow-hidden relative flex flex-col lg:flex-row items-center border border-[#163321] min-h-[400px]">
            {/* Map Visualization */}
            <div className="lg:w-3/5 relative h-[300px] lg:h-[450px] w-full">
              {/* Background */}
              <div className="absolute inset-0 opacity-20 bg-[url('/images/farm_grid.jpeg')] bg-cover bg-center mix-blend-luminosity" />

              {/* SVG Map with opportunity markers */}
              <svg
                viewBox="0 0 600 450"
                className="absolute inset-0 w-full h-full"
                preserveAspectRatio="xMidYMid meet"
              >
                {/* Grid lines */}
                {[100, 200, 300, 400, 500].map((x) => (
                  <line
                    key={`v-${x}`}
                    x1={x}
                    y1="0"
                    x2={x}
                    y2="450"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="0.5"
                  />
                ))}
                {[75, 150, 225, 300, 375].map((y) => (
                  <line
                    key={`h-${y}`}
                    x1="0"
                    y1={y}
                    x2="600"
                    y2={y}
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="0.5"
                  />
                ))}

                {/* Approximate area polygons */}
                <path
                  d="M120,120 L200,100 L240,160 L180,200 Z"
                  fill="rgba(255,255,255,0.04)"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="1"
                />
                <path
                  d="M280,150 L380,120 L420,200 L340,240 Z"
                  fill="rgba(255,255,255,0.04)"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="1"
                />
                <path
                  d="M150,260 L250,230 L300,310 L220,350 Z"
                  fill="rgba(255,255,255,0.04)"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="1"
                />
                <path
                  d="M380,270 L470,240 L510,320 L440,360 Z"
                  fill="rgba(255,255,255,0.04)"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="1"
                />

                {/* Opportunity cluster markers */}
                {[
                  { cx: 180, cy: 150, label: 'North' },
                  { cx: 350, cy: 170, label: 'Central' },
                  { cx: 220, cy: 290, label: 'South' },
                  { cx: 440, cy: 300, label: 'East' },
                ].map((marker, i) => (
                  <g key={i}>
                    <circle
                      cx={marker.cx}
                      cy={marker.cy}
                      r="20"
                      fill="none"
                      stroke="rgba(189,150,85,0.3)"
                      strokeWidth="1"
                    />
                    <circle
                      cx={marker.cx}
                      cy={marker.cy}
                      r="10"
                      fill="none"
                      stroke="rgba(189,150,85,0.5)"
                      strokeWidth="1"
                    />
                    <circle
                      cx={marker.cx}
                      cy={marker.cy}
                      r="4"
                      fill="#BD9655"
                    />
                    <text
                      x={marker.cx}
                      y={marker.cy + 32}
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.5)"
                      fontSize="10"
                      fontWeight="600"
                    >
                      {marker.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            {/* CTA Content */}
            <div className="lg:w-2/5 p-10 lg:p-14 text-center lg:text-left relative z-10">
              <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm border border-white/20 mx-auto lg:mx-0">
                <MapIcon size={26} className="text-white" strokeWidth={1.5} />
              </div>
              <h3 className="text-white text-[26px] lg:text-[30px] font-heading font-bold mb-4 leading-tight">
                View Opportunities on Map
              </h3>
              <p className="text-white/60 text-[15px] max-w-[320px] mb-8 leading-relaxed mx-auto lg:mx-0">
                Explore the approximate areas and key locations for active
                land-pooling opportunities across Kerala.
              </p>
              <p className="text-white/40 text-[11px] mb-6 max-w-[320px] mx-auto lg:mx-0">
                Map shows generalized opportunity areas only. Private landowner
                information is not displayed.
              </p>
              <Link
                href="/opportunities#map"
                className="inline-flex items-center bg-transparent border border-white/30 text-white px-8 py-3 rounded-md text-[15px] font-semibold hover:bg-white hover:text-[#0A1810] transition-colors gap-2 group"
              >
                Explore Map
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ====== DEVELOPER CTA ====== */}
      <section className="py-20 bg-[#0A1C12]">
        <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16 flex flex-col md:flex-row items-center justify-between gap-10">
          <div>
            <h2 className="text-[32px] md:text-[38px] text-white font-heading font-bold mb-4 tracking-tight">
              Are you a Developer or Investor?
            </h2>
            <p className="text-white/70 text-[16px] max-w-[480px] leading-relaxed">
              Discover structured land-pooling opportunities and connect with
              Trinfra for credible, transparent development partnerships.
            </p>
          </div>
          <Link
            href={
              filteredOpportunities.length > 0
                ? `/opportunities/${filteredOpportunities[0].id}`
                : `/opportunities/${OPPORTUNITIES[0].id}`
            }
            className="w-full sm:w-auto bg-accent text-white px-8 sm:px-10 py-4 rounded-md font-bold hover:bg-accent-hover transition-colors flex items-center justify-center gap-2 shrink-0 group text-[15px] shadow-lg text-center"
          >
            View Top Opportunity
            <ArrowRight
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>
      </section>
    </div>
  );
}
