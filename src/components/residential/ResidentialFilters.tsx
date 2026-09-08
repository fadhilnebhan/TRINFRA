'use client';

import React from 'react';
import CustomSelect from '@/components/opportunities/CustomSelect';
import { RotateCcw } from 'lucide-react';

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
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Property Type Custom Dropdown */}
      <div className="w-full sm:w-48">
        <CustomSelect
          value={filters.propertyType}
          onChange={(val) => onFilterChange('propertyType', val)}
          options={PROPERTY_TYPE_OPTIONS}
          size="sm"
          aria-label="Filter by Property Type"
        />
      </div>

      {/* Purpose Custom Dropdown */}
      <div className="w-full sm:w-40">
        <CustomSelect
          value={filters.listingPurpose}
          onChange={(val) => onFilterChange('listingPurpose', val)}
          options={PURPOSE_OPTIONS}
          size="sm"
          aria-label="Filter by Purpose"
        />
      </div>

      {/* Bedrooms Custom Dropdown */}
      <div className="w-full sm:w-36">
        <CustomSelect
          value={filters.bedrooms}
          onChange={(val) => onFilterChange('bedrooms', val)}
          options={BEDROOM_OPTIONS}
          size="sm"
          aria-label="Filter by Bedrooms"
        />
      </div>

      {/* Sort By Custom Dropdown */}
      <div className="w-full sm:w-48">
        <CustomSelect
          value={filters.sortBy}
          onChange={(val) => onFilterChange('sortBy', val)}
          options={SORT_OPTIONS}
          size="sm"
          aria-label="Sort Properties"
        />
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-red-600 bg-gray-100 hover:bg-red-50 rounded-lg transition-colors ml-auto"
        >
          <RotateCcw size={12} />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
}
