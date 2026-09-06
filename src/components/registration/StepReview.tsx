'use client';

import { StepProps } from './types';
import { Edit3, User, Phone, MapPin, LandPlot, Target, FileText, Check } from 'lucide-react';
import Link from 'next/link';

interface StepReviewProps extends StepProps {
  onGoToStep: (step: number) => void;
}

const LANDOWNER_LABELS: Record<string, string> = {
  individual: 'Individual Landowner',
  family: 'Family',
  group: 'Existing Landowner Group',
};

const OWNERSHIP_LABELS: Record<string, string> = {
  sole: 'Sole Owner',
  joint: 'Joint Ownership',
  family: 'Family Owned / Inherited',
  community: 'Community Owned',
  other: 'Other',
};

const POOLING_LABELS: Record<string, string> = {
  join: 'Join an Existing Opportunity',
  create: 'Create a New Opportunity',
  unsure: 'Not Sure Yet',
};

const COMM_LABELS: Record<string, string> = {
  phone: 'Phone',
  whatsapp: 'WhatsApp',
  email: 'Email',
};

export default function StepReview({ data, updateField, errors, onGoToStep }: StepReviewProps) {
  const sections = [
    {
      title: 'Landowner',
      icon: User,
      step: 0,
      fields: [
        { label: 'Type', value: LANDOWNER_LABELS[data.landownerType] || '—' },
      ],
    },
    {
      title: 'Contact',
      icon: Phone,
      step: 1,
      fields: [
        { label: 'Full Name', value: data.fullName || '—' },
        { label: 'Phone', value: data.phone || '—' },
        { label: 'Email', value: data.email || '—' },
        { label: 'Preferred Contact', value: COMM_LABELS[data.communicationPreference] || '—' },
      ],
    },
    {
      title: 'Location',
      icon: MapPin,
      step: 2,
      fields: [
        { label: 'District', value: data.district || '—' },
        { label: 'Local Body', value: data.localBody || '—' },
        { label: 'Locality', value: data.locality || '—' },
      ],
    },
    {
      title: 'Land Details',
      icon: LandPlot,
      step: 3,
      fields: [
        { label: 'Approximate Area', value: data.approximateArea ? `${data.approximateArea} ${data.areaUnit}` : '—' },
        { label: 'Ownership Status', value: OWNERSHIP_LABELS[data.ownershipStatus] || '—' },
      ],
    },
    {
      title: 'Pooling Interest',
      icon: Target,
      step: 4,
      fields: [
        { label: 'Interest', value: POOLING_LABELS[data.poolingInterest] || '—' },
      ],
    },
    {
      title: 'Documents',
      icon: FileText,
      step: 4,
      fields: data.documents.length > 0
        ? data.documents.map((d, i) => ({ label: `File ${i + 1}`, value: d.name }))
        : [{ label: 'Documents', value: 'No documents uploaded' }],
    },
  ];

  return (
    <div>
      <h3 className="text-[22px] md:text-[24px] font-heading font-bold text-foreground mb-2">
        Review your details
      </h3>
      <p className="text-[14px] text-gray-500 mb-8">
        Please verify everything is correct before submitting your enquiry.
      </p>

      {/* Summary Sections */}
      <div className="space-y-4 mb-8">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.title} className="border border-gray-200 rounded-xl bg-white overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 bg-surface-alt border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <Icon size={16} className="text-accent" />
                  <h4 className="text-[14px] font-bold text-foreground">{section.title}</h4>
                </div>
                <button
                  type="button"
                  onClick={() => onGoToStep(section.step)}
                  className="flex items-center gap-1.5 text-[12px] font-semibold text-primary hover:text-accent transition-colors"
                >
                  <Edit3 size={12} />
                  Edit
                </button>
              </div>
              <div className="px-5 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {section.fields.map((field, i) => (
                    <div key={i}>
                      <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">{field.label}</p>
                      <p className="text-[14px] text-foreground font-medium mt-0.5">{field.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Consent */}
      <div className="border border-gray-200 rounded-xl bg-white p-5">
        <label className="flex items-start gap-3 cursor-pointer group" htmlFor="consent-checkbox">
          <div className="mt-0.5 shrink-0">
            <input
              id="consent-checkbox"
              type="checkbox"
              checked={data.consentGiven}
              onChange={(e) => updateField('consentGiven', e.target.checked)}
              className="sr-only"
            />
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
              data.consentGiven ? 'bg-primary border-primary' : 'border-gray-300 group-hover:border-gray-400'
            }`}>
              {data.consentGiven && <Check size={13} className="text-white" strokeWidth={3} />}
            </div>
          </div>
          <div>
            <p className="text-[13px] text-foreground leading-relaxed">
              I confirm that the information provided is accurate to the best of my knowledge. I consent to Trinfra processing this data in accordance with the{' '}
              <Link href="#" className="text-accent underline hover:text-accent-hover">Privacy Policy</Link>.
            </p>
          </div>
        </label>
        {errors.consentGiven && <p className="text-red-500 text-[12px] mt-2 ml-8">{errors.consentGiven}</p>}
      </div>
    </div>
  );
}
