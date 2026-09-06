'use client';

import { StepProps } from './types';
import { Phone, MessageCircle, Mail } from 'lucide-react';

const COMM_OPTIONS = [
  { value: 'phone' as const, label: 'Phone', icon: Phone },
  { value: 'whatsapp' as const, label: 'WhatsApp', icon: MessageCircle },
  { value: 'email' as const, label: 'Email', icon: Mail },
];

export default function StepContact({ data, updateField, errors }: StepProps) {
  return (
    <div>
      <h3 className="text-[22px] md:text-[24px] font-heading font-bold text-foreground mb-2">
        How can we reach you?
      </h3>
      <p className="text-[14px] text-gray-500 mb-8">
        We&apos;ll use these details to keep you updated on your submission.
      </p>

      <div className="space-y-6 max-w-[600px]">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-[13px] font-semibold text-foreground mb-2">
            Full Name <span className="text-red-400">*</span>
          </label>
          <input
            id="fullName"
            type="text"
            value={data.fullName}
            onChange={(e) => updateField('fullName', e.target.value)}
            placeholder="Enter your full name"
            className={`w-full px-4 py-3 rounded-lg border bg-white text-[15px] text-foreground placeholder:text-gray-400 outline-none transition-colors ${
              errors.fullName ? 'border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-100' : 'border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent/20'
            }`}
          />
          {errors.fullName && <p className="text-red-500 text-[12px] mt-1.5">{errors.fullName}</p>}
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="phone" className="block text-[13px] font-semibold text-foreground mb-2">
            Phone Number <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] text-gray-400 font-medium">+91</span>
            <input
              id="phone"
              type="tel"
              value={data.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="Enter your phone number"
              className={`w-full pl-12 pr-4 py-3 rounded-lg border bg-white text-[15px] text-foreground placeholder:text-gray-400 outline-none transition-colors ${
                errors.phone ? 'border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-100' : 'border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent/20'
              }`}
            />
          </div>
          {errors.phone && <p className="text-red-500 text-[12px] mt-1.5">{errors.phone}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-[13px] font-semibold text-foreground mb-2">
            Email Address <span className="text-red-400">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="Enter your email address"
            className={`w-full px-4 py-3 rounded-lg border bg-white text-[15px] text-foreground placeholder:text-gray-400 outline-none transition-colors ${
              errors.email ? 'border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-100' : 'border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent/20'
            }`}
          />
          {errors.email && <p className="text-red-500 text-[12px] mt-1.5">{errors.email}</p>}
        </div>

        {/* Preferred Communication */}
        <div>
          <label className="block text-[13px] font-semibold text-foreground mb-3">
            Preferred Communication Method <span className="text-red-400">*</span>
          </label>
          <div className="flex flex-wrap gap-3">
            {COMM_OPTIONS.map((opt) => {
              const isSelected = data.communicationPreference === opt.value;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  type="button"
                  id={`comm-${opt.value}`}
                  onClick={() => updateField('communicationPreference', opt.value)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-semibold transition-all ${
                    isSelected
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={16} strokeWidth={2} />
                  {opt.label}
                </button>
              );
            })}
          </div>
          {errors.communicationPreference && <p className="text-red-500 text-[12px] mt-1.5">{errors.communicationPreference}</p>}
        </div>
      </div>
    </div>
  );
}
