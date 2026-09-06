'use client';

import { StepProps } from './types';
import { User, Users, UsersRound, CheckCircle2 } from 'lucide-react';

const LANDOWNER_OPTIONS = [
  {
    value: 'individual' as const,
    title: 'Individual Landowner',
    description: 'I own the land personally.',
    icon: User,
  },
  {
    value: 'family' as const,
    title: 'Family',
    description: 'Our family owns the land (heirs or family members).',
    icon: Users,
  },
  {
    value: 'group' as const,
    title: 'Existing Landowner Group',
    description: 'We are a group of landowners (registered or informal).',
    icon: UsersRound,
  },
];

export default function StepYou({ data, updateField, errors }: StepProps) {
  return (
    <div>
      {/* Section Title */}
      <h3 className="text-[22px] md:text-[24px] font-heading font-bold text-foreground mb-2">
        What best describes you?
      </h3>
      <p className="text-[14px] text-gray-500 mb-8">
        Please select the option that best fits your situation.
      </p>

      {/* Landowner Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mb-6">
        {LANDOWNER_OPTIONS.map((option) => {
          const isSelected = data.landownerType === option.value;
          const Icon = option.icon;

          return (
            <button
              key={option.value}
              type="button"
              id={`landowner-type-${option.value}`}
              onClick={() => updateField('landownerType', option.value)}
              className={`relative flex flex-col items-center text-center p-7 md:p-8 rounded-xl transition-all duration-200 cursor-pointer group ${
                isSelected
                  ? 'border-2 border-dashed border-primary bg-primary/[0.03] shadow-sm'
                  : 'border-2 border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              {/* Selection indicator */}
              <div className="absolute top-4 right-4">
                {isSelected ? (
                  <CheckCircle2 size={22} className="text-primary fill-primary stroke-white" />
                ) : (
                  <div className="w-[22px] h-[22px] rounded-full border-2 border-gray-300" />
                )}
              </div>

              {/* Icon */}
              <div className={`mb-4 transition-colors ${isSelected ? 'text-accent' : 'text-accent/60 group-hover:text-accent/80'}`}>
                <Icon size={44} strokeWidth={1.3} />
              </div>

              {/* Title */}
              <h4 className={`text-[15px] font-bold mb-1.5 ${isSelected ? 'text-foreground' : 'text-foreground/80'}`}>
                {option.title}
              </h4>

              {/* Description */}
              <p className="text-[13px] text-gray-500 leading-relaxed">
                {option.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Error */}
      {errors.landownerType && (
        <p className="text-red-500 text-[13px] mb-4">{errors.landownerType}</p>
      )}

      {/* Info Note */}
      <div className="flex items-start gap-3 bg-surface-alt border border-gray-100 rounded-lg px-5 py-4 mt-4">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-400 shrink-0 mt-0.5">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p className="text-[13px] text-gray-500 leading-relaxed">
          You can still register even if you&apos;re not sure. Our team will help you understand the next steps.
        </p>
      </div>
    </div>
  );
}
