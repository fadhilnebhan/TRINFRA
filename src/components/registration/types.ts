import { DocumentMeta } from '@/lib/submissions';

export interface FormData {
  landownerType: 'individual' | 'family' | 'group' | '';
  fullName: string;
  phone: string;
  email: string;
  communicationPreference: 'phone' | 'whatsapp' | 'email' | '';
  district: string;
  localBody: string;
  locality: string;
  mapLocation: { lat: number; lng: number } | null;
  approximateArea: string;
  areaUnit: 'acres' | 'cents' | 'hectares';
  ownershipStatus: 'sole' | 'joint' | 'family' | 'community' | 'other' | '';
  documents: DocumentMeta[];
  poolingInterest: 'join' | 'create' | 'unsure' | '';
  consentGiven: boolean;
}

export interface StepProps {
  data: FormData;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  errors: Record<string, string>;
}

export const initialFormData: FormData = {
  landownerType: '',
  fullName: '',
  phone: '',
  email: '',
  communicationPreference: '',
  district: '',
  localBody: '',
  locality: '',
  mapLocation: null,
  approximateArea: '',
  areaUnit: 'acres',
  ownershipStatus: '',
  documents: [],
  poolingInterest: '',
  consentGiven: false,
};

export const STEPS = [
  { number: 1, label: 'You', sublabel: 'Landowner Type' },
  { number: 2, label: 'Contact', sublabel: 'Your Details' },
  { number: 3, label: 'Location', sublabel: 'Land Details' },
  { number: 4, label: 'Land', sublabel: 'Area & Ownership' },
  { number: 5, label: 'Interest', sublabel: 'Pooling Preference' },
  { number: 6, label: 'Review', sublabel: 'Confirm & Submit' },
];

export const STEP_HEADERS = [
  { title: "Let\u2019s get started", subtitle: 'Tell us a few details about you and your land. It only takes a few minutes.' },
  { title: 'Your Contact Details', subtitle: 'How can we reach you? We\u2019ll use this to keep you updated on your submission.' },
  { title: 'Land Location', subtitle: 'Help us understand where your land is located.' },
  { title: 'About Your Land', subtitle: 'Share some basic details about your land.' },
  { title: 'Your Interest', subtitle: 'What are you looking to achieve with land pooling?' },
  { title: 'Review & Submit', subtitle: 'Please review your details before submitting your enquiry.' },
];
