'use client';

import React, { useState, useEffect } from 'react';
import CustomSelect from '@/components/opportunities/CustomSelect';
import { SlidersHorizontal, RotateCcw, X, Check } from 'lucide-react';

export interface FilterState {
  propertyType: string;
  listingPurpose: string;
  bedrooms: string;
  sortBy: string;
}

interface ResidentialFiltersProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

const PROPERTY_TYPE_OPTIONS = [
  { value: 'All', label: 'All Property Types' },
  { value: 'Apartment', label: 'Apartment' },
  { value: 'Flat', label: 'Flat' },
  { value: 'Villa', label: 'Villa' },
  { value: 'House', label: 'Independent House' },
  { value: 'Penthouse', label: 'Penthouse' },
];

const PURPOSE_OPTIONS = [
  { value: 'All', label: 'All (Buy & Rent)' },
  { value: 'Sale', label: 'For Sale' },
  { value: 'Rent', label: 'For Rent' },
];

const BEDROOM_OPTIONS = [
  { value: 'All', label: 'Any Bedrooms' },
  { value: '1', label: '1 BHK' },
  { value: '2', label: '2 BHK' },
  { value: '3', label: '3 BHK' },
  { value: '4+', label: '4+ BHK' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest Listed' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'area_asc', label: 'Area: Small to Large' },
  { value: 'area_desc', label: 'Area: Large to Small' },
];

export default function ResidentialFilters({
  filters,
  onFilterChange,
  onReset,
  hasActiveFilters,
}: ResidentialFiltersProps) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Count active non-default filters
  const activeFilterCount = [
    filters.propertyType !== 'All',
    filters.listingPurpose !== 'All',
    filters.bedrooms !== 'All',
    filters.sortBy !== 'newest',
  ].filter(Boolean).length;

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileDrawerOpen]);

  return (
    <div>
      {/* ================= DESKTOP FILTER BAR (>= md) ================= */}
      <div className="hidden md:flex flex-wrap items-center gap-2.5">
        {/* Property Type Custom Dropdown */}
        <div className="w-44 lg:w-48">
          <CustomSelect
            value={filters.propertyType}
            onChange={(val) => onFilterChange('propertyType', val)}
            options={PROPERTY_TYPE_OPTIONS}
            size="sm"
            aria-label="Filter by Property Type"
          />
        </div>

        {/* Purpose Custom Dropdown */}
        <div className="w-36 lg:w-40">
          <CustomSelect
            value={filters.listingPurpose}
            onChange={(val) => onFilterChange('listingPurpose', val)}
            options={PURPOSE_OPTIONS}
            size="sm"
            aria-label="Filter by Purpose"
          />
        </div>

        {/* Bedrooms Custom Dropdown */}
        <div className="w-32 lg:w-36">
          <CustomSelect
            value={filters.bedrooms}
            onChange={(val) => onFilterChange('bedrooms', val)}
            options={BEDROOM_OPTIONS}
            size="sm"
            aria-label="Filter by Bedrooms"
          />
        </div>

        {/* Sort By Custom Dropdown */}
        <div className="w-44 lg:w-48">
          <CustomSelect
            value={filters.sortBy}
            onChange={(val) => onFilterChange('sortBy', val)}
            options={SORT_OPTIONS}
            size="sm"
            aria-label="Sort Properties"
          />
        </div>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-500 hover:text-primary hover:bg-gray-100 rounded-xl transition-colors shrink-0"
            title="Reset active filters"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* ================= MOBILE FILTER TRIGGER (< md) ================= */}
      <div className="flex md:hidden items-center gap-2">
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 min-h-[42px] rounded-xl text-xs font-semibold border transition-all ${
            hasActiveFilters
              ? 'bg-primary text-white border-primary shadow-xs'
              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
          }`}
          aria-expanded={mobileDrawerOpen}
          aria-label="Open filter options"
        >
          <SlidersHorizontal size={14} />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="p-2.5 min-h-[42px] min-w-[42px] rounded-xl border border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-gray-50 flex items-center justify-center transition-colors"
            title="Reset filters"
            aria-label="Reset all filters"
          >
            <RotateCcw size={14} />
          </button>
        )}
      </div>

      {/* ================= MOBILE FILTER BOTTOM SHEET / DRAWER ================= */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Bottom Sheet Modal */}
          <div
            className="relative bg-white rounded-t-3xl shadow-2xl p-5 max-h-[85vh] flex flex-col z-10 animate-in slide-in-from-bottom duration-300 border-t border-gray-200/80"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-filters-title"
          >
            {/* Grab handle */}
            <div className="w-12 h-1.5 rounded-full bg-gray-300 mx-auto mb-4" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-primary" />
                <h3 id="mobile-filters-title" className="text-base font-heading font-bold text-gray-900">
                  Filter Properties
                </h3>
                {activeFilterCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-accent text-white text-[10px] font-bold">
                    {activeFilterCount} active
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <button
                    onClick={() => {
                      onReset();
                    }}
                    className="text-xs font-semibold text-gray-500 hover:text-primary transition-colors px-2 py-1"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
                  aria-label="Close filters"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Filter Controls List */}
            <div className="py-4 space-y-4 overflow-y-auto flex-1">
              {/* Property Type */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                  Property Type
                </label>
                <CustomSelect
                  value={filters.propertyType}
                  onChange={(val) => onFilterChange('propertyType', val)}
                  options={PROPERTY_TYPE_OPTIONS}
                  aria-label="Filter by Property Type"
                />
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                  Listing Purpose
                </label>
                <CustomSelect
                  value={filters.listingPurpose}
                  onChange={(val) => onFilterChange('listingPurpose', val)}
                  options={PURPOSE_OPTIONS}
                  aria-label="Filter by Purpose"
                />
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                  Bedrooms
                </label>
                <CustomSelect
                  value={filters.bedrooms}
                  onChange={(val) => onFilterChange('bedrooms', val)}
                  options={BEDROOM_OPTIONS}
                  aria-label="Filter by Bedrooms"
                />
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                  Sort Properties By
                </label>
                <CustomSelect
                  value={filters.sortBy}
                  onChange={(val) => onFilterChange('sortBy', val)}
                  options={SORT_OPTIONS}
                  aria-label="Sort Properties"
                />
              </div>
            </div>

            {/* Action Footer */}
            <div className="pt-3 border-t border-gray-100">
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/95 shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <Check size={16} />
                <span>Show Results</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
