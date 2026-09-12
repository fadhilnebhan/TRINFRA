'use client';

import dynamic from 'next/dynamic';
import { StepProps } from './types';
import { Loader2 } from 'lucide-react';
import { getDistrictNames, getLocalBodies } from '@/lib/locationData';
import CustomSelect from '@/components/opportunities/CustomSelect';

const LandLocationPicker = dynamic(
  () => import('@/components/maps/LandLocationPicker'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[300px] sm:h-[320px] rounded-xl border border-gray-200 bg-surface-alt flex flex-col items-center justify-center">
        <Loader2 size={24} className="text-primary/60 animate-spin mb-2" />
        <span className="text-xs text-gray-500 font-medium tracking-wide">
          Loading interactive map…
        </span>
      </div>
    ),
  }
);

export default function StepLocation({ data, updateField, errors }: StepProps) {
  const districts = getDistrictNames();
  const localBodies = data.district ? getLocalBodies(data.district) : [];

  const handleDistrictChange = (value: string) => {
    updateField('district', value);
    updateField('localBody', ''); // Reset local body when district changes
  };

  return (
    <div>
      <h3 className="text-[22px] md:text-[24px] font-heading font-bold text-foreground mb-2">
        Where is your land located?
      </h3>
      <p className="text-[14px] text-gray-500 mb-8">
        This information helps us connect you with relevant opportunities in your area.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left — Form Fields */}
        <div className="space-y-6">
          {/* District */}
          <div>
            <label htmlFor="district" className="block text-[13px] font-semibold text-foreground mb-2">
              District <span className="text-red-400">*</span>
            </label>
            <CustomSelect
              id="district"
              value={data.district}
              onChange={(val) => handleDistrictChange(val)}
              options={districts.map((d) => ({ value: d, label: d }))}
              searchable
              placeholder="Select your district"
            />
            {errors.district && <p className="text-red-500 text-[12px] mt-1.5">{errors.district}</p>}
          </div>

          {/* Local Body */}
          <div>
            <label htmlFor="localBody" className="block text-[13px] font-semibold text-foreground mb-2">
              Local Body <span className="text-red-400">*</span>
            </label>
            <CustomSelect
              id="localBody"
              value={data.localBody}
              onChange={(val) => updateField('localBody', val)}
              options={localBodies.map((lb) => ({ value: lb.name, label: lb.name }))}
              disabled={!data.district}
              searchable
              placeholder={data.district ? 'Select local body' : 'Select a district first'}
            />
            {errors.localBody && <p className="text-red-500 text-[12px] mt-1.5">{errors.localBody}</p>}
          </div>

          {/* Locality */}
          <div>
            <label htmlFor="locality" className="block text-[13px] font-semibold text-foreground mb-2">
              Locality / Area Name
            </label>
            <input
              id="locality"
              type="text"
              value={data.locality}
              onChange={(e) => updateField('locality', e.target.value)}
              placeholder="e.g., Kunnamangalam, Near NH Bypass"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-[15px] text-foreground placeholder:text-gray-400 outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent/20"
            />
          </div>
        </div>

        {/* Right — Interactive Land Location Picker */}
        <div>
          <label className="block text-[13px] font-semibold text-foreground mb-2">
            Pin Location <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <LandLocationPicker
            value={data.mapLocation}
            district={data.district}
            onChange={(loc) => updateField('mapLocation', loc)}
          />
          <p className="text-[11px] text-gray-400 mt-2">
            Your exact location will not be shared publicly. It helps us identify nearby opportunities.
          </p>
        </div>
      </div>
    </div>
  );
}
