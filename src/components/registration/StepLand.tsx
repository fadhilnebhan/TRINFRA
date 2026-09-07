'use client';

import { StepProps } from './types';
import CustomSelect from '@/components/opportunities/CustomSelect';

const OWNERSHIP_OPTIONS = [
  { value: 'sole', label: 'Sole Owner' },
  { value: 'joint', label: 'Joint Ownership' },
  { value: 'family', label: 'Family Owned / Inherited' },
  { value: 'community', label: 'Community Owned' },
  { value: 'other', label: 'Other' },
];

const AREA_UNITS = [
  { value: 'acres', label: 'Acres' },
  { value: 'cents', label: 'Cents' },
  { value: 'hectares', label: 'Hectares' },
];

export default function StepLand({ data, updateField, errors }: StepProps) {
  return (
    <div>
      <h3 className="text-[22px] md:text-[24px] font-heading font-bold text-foreground mb-2">
        Tell us about your land
      </h3>
      <p className="text-[14px] text-gray-500 mb-8">
        Approximate details are fine — exact measurements can be confirmed later.
      </p>

      <div className="space-y-6 max-w-[600px]">
        {/* Approximate Land Area */}
        <div>
          <label htmlFor="approximateArea" className="block text-[13px] font-semibold text-foreground mb-2">
            Approximate Land Area <span className="text-red-400">*</span>
          </label>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                id="approximateArea"
                type="number"
                step="0.01"
                min="0"
                value={data.approximateArea}
                onChange={(e) => updateField('approximateArea', e.target.value)}
                placeholder="e.g., 2.5"
                className={`w-full px-4 py-3 rounded-lg border bg-white text-[15px] text-foreground placeholder:text-gray-400 outline-none transition-colors ${
                  errors.approximateArea ? 'border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-100' : 'border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent/20'
                }`}
              />
            </div>
            <div className="w-[140px] shrink-0">
              <CustomSelect
                id="areaUnit"
                value={data.areaUnit}
                onChange={(val) => updateField('areaUnit', val as 'acres' | 'cents' | 'hectares')}
                options={AREA_UNITS}
                placeholder="Unit"
              />
            </div>
          </div>
          {errors.approximateArea && <p className="text-red-500 text-[12px] mt-1.5">{errors.approximateArea}</p>}
          <p className="text-[11px] text-gray-400 mt-1.5">
            Don&apos;t worry if it&apos;s not exact — an approximation is fine at this stage.
          </p>
        </div>

        {/* Ownership Status */}
        <div>
          <label className="block text-[13px] font-semibold text-foreground mb-3">
            Ownership Status <span className="text-red-400">*</span>
          </label>
          <div className="space-y-2">
            {OWNERSHIP_OPTIONS.map((opt) => {
              const isSelected = data.ownershipStatus === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  id={`ownership-${opt.value}`}
                  onClick={() => updateField('ownershipStatus', opt.value as typeof data.ownershipStatus)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/[0.03] shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className={`w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    isSelected ? 'border-primary' : 'border-gray-300'
                  }`}>
                    {isSelected && <div className="w-[10px] h-[10px] rounded-full bg-primary" />}
                  </div>
                  <span className={`text-[14px] font-medium ${isSelected ? 'text-foreground' : 'text-gray-600'}`}>
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
          {errors.ownershipStatus && <p className="text-red-500 text-[12px] mt-1.5">{errors.ownershipStatus}</p>}
        </div>
      </div>
    </div>
  );
}
