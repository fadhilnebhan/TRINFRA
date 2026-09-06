// Trinfra Admin — Data Architecture & Repository Service
// Connects to localStorage for landowner registrations & developer enquiries.
// Easily interchangeable with a REST/GraphQL API or PostgreSQL/Prisma client.

import { RegistrationData, getSubmissions } from './submissions';
import { getEnquiries } from './enquirySubmissions';

export type LandownerType = 'Individual' | 'Family' | 'Group';

export type LandownerStatus =
  | 'New'
  | 'Verification Pending'
  | 'Verified'
  | 'Needs Clarification'
  | 'Rejected';

export interface AdminDocument {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
  status: 'Verified' | 'Pending Review' | 'Flagged';
}

export interface AdminNote {
  id: string;
  author: string;
  role: string;
  content: string;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  type:
    | 'registration_received'
    | 'verification_updated'
    | 'enquiry_received'
    | 'status_changed'
    | 'note_added';
  title: string;
  reference: string;
  timestamp: string; // ISO string
  relativeTime: string;
  details?: string;
}

export interface LandownerLead {
  id: string; // Unique ID or Reference Number (e.g., "TRN-LR-0017")
  referenceNumber: string;
  fullName: string;
  phone: string;
  email: string;
  landownerType: LandownerType;
  preferredCommunication: 'WhatsApp' | 'Phone Call' | 'Email';
  district: string;
  localBody: string;
  locality: string;
  location: string;
  approximateArea: number; // in Acres
  areaDisplay: string;
  ownershipStatus: 'Self Owned' | 'Family Inherited' | 'Joint Ownership' | 'Other';
  poolingInterest: string;
  status: LandownerStatus;
  submittedAt: string; // Display formatted
  submittedDate: string; // e.g. "16 Aug 2025"
  submittedTimestamp: number; // for sorting
  updatedAt: string;
  documents: AdminDocument[];
  notes: AdminNote[];
  timeline: {
    action: string;
    timestamp: string;
    user?: string;
  }[];
}

// Storage Keys
const ADMIN_LANDOWNERS_KEY = 'trinfra_admin_landowners';
const ADMIN_ACTIVITY_KEY = 'trinfra_admin_activities';

// Default Seed Landowners (matching the exact mockup data)
export const SEED_LANDOWNERS: LandownerLead[] = [
  {
    id: 'TRN-LR-0017',
    referenceNumber: 'TRN-LR-0017',
    fullName: 'Abdul Rahman',
    phone: '+91 98765 43210',
    email: 'abdulrahman@gmail.com',
    landownerType: 'Individual',
    preferredCommunication: 'WhatsApp',
    district: 'Kozhikode',
    localBody: 'Kozhikode Corporation',
    locality: 'Puthiyara',
    location: '11.2588° N, 75.7804° E',
    approximateArea: 2.5,
    areaDisplay: '2.5 Acres',
    ownershipStatus: 'Self Owned',
    poolingInterest: 'Join an existing opportunity',
    status: 'New',
    submittedAt: '16 Aug 2025, 10:24 AM',
    submittedDate: '16 Aug 2025',
    submittedTimestamp: new Date('2025-08-16T10:24:00').getTime(),
    updatedAt: '16 Aug 2025, 10:24 AM',
    documents: [
      {
        id: 'doc-1',
        name: 'Title Deed.pdf',
        size: '2.4 MB',
        type: 'PDF Document',
        uploadedAt: '16 Aug 2025',
        status: 'Pending Review',
      },
      {
        id: 'doc-2',
        name: 'Survey Sketch.pdf',
        size: '1.8 MB',
        type: 'PDF Document',
        uploadedAt: '16 Aug 2025',
        status: 'Pending Review',
      },
    ],
    notes: [
      {
        id: 'note-1',
        author: 'Admin',
        role: 'Operations',
        content: 'Need to verify ownership document before scheduling verification session.',
        createdAt: '16 Aug 2025, 11:30 AM',
      },
      {
        id: 'note-2',
        author: 'Admin',
        role: 'Operations',
        content: 'Location looks valid. In proximity to Calicut North expansion corridor.',
        createdAt: '16 Aug 2025, 12:05 PM',
      },
    ],
    timeline: [
      {
        action: 'Land registration submitted via public portal',
        timestamp: '16 Aug 2025, 10:24 AM',
      },
      {
        action: 'Internal review initiated',
        timestamp: '16 Aug 2025, 11:30 AM',
        user: 'Admin Operations',
      },
    ],
  },
  {
    id: 'TRN-LR-0016',
    referenceNumber: 'TRN-LR-0016',
    fullName: 'Fathima Beevi',
    phone: '+91 97451 22890',
    email: 'fathima.beevi@outlook.com',
    landownerType: 'Family',
    preferredCommunication: 'Phone Call',
    district: 'Malappuram',
    localBody: 'Manjeri Municipality',
    locality: 'Kavanoor',
    location: '11.1197° N, 76.1214° E',
    approximateArea: 4.0,
    areaDisplay: '4.0 Acres',
    ownershipStatus: 'Family Inherited',
    poolingInterest: 'Explore land-pooling partnership',
    status: 'Verification Pending',
    submittedAt: '16 Aug 2025, 08:45 AM',
    submittedDate: '16 Aug 2025',
    submittedTimestamp: new Date('2025-08-16T08:45:00').getTime(),
    updatedAt: '16 Aug 2025, 09:15 AM',
    documents: [
      {
        id: 'doc-16-1',
        name: 'Land Tax Receipt.pdf',
        size: '1.2 MB',
        type: 'PDF Document',
        uploadedAt: '16 Aug 2025',
        status: 'Pending Review',
      },
      {
        id: 'doc-16-2',
        name: 'Possession Certificate.pdf',
        size: '2.1 MB',
        type: 'PDF Document',
        uploadedAt: '16 Aug 2025',
        status: 'Pending Review',
      },
    ],
    notes: [
      {
        id: 'note-16-1',
        author: 'Admin',
        role: 'Operations',
        content: 'Family consensus document requested from co-heirs.',
        createdAt: '16 Aug 2025, 09:30 AM',
      },
    ],
    timeline: [
      {
        action: 'Registration submitted',
        timestamp: '16 Aug 2025, 08:45 AM',
      },
      {
        action: 'Status changed to Verification Pending',
        timestamp: '16 Aug 2025, 09:15 AM',
        user: 'Admin Operations',
      },
    ],
  },
  {
    id: 'TRN-LR-0015',
    referenceNumber: 'TRN-LR-0015',
    fullName: 'Shibu Kumar',
    phone: '+91 94471 90211',
    email: 'shibu.kumar@yahoo.com',
    landownerType: 'Individual',
    preferredCommunication: 'WhatsApp',
    district: 'Palakkad',
    localBody: 'Ottapalam Municipality',
    locality: 'Varode',
    location: '10.7712° N, 76.3811° E',
    approximateArea: 1.8,
    areaDisplay: '1.8 Acres',
    ownershipStatus: 'Self Owned',
    poolingInterest: 'Join an existing opportunity',
    status: 'Verified',
    submittedAt: '15 Aug 2025, 04:10 PM',
    submittedDate: '15 Aug 2025',
    submittedTimestamp: new Date('2025-08-15T16:10:00').getTime(),
    updatedAt: '15 Aug 2025, 06:00 PM',
    documents: [
      {
        id: 'doc-15-1',
        name: 'Sale Deed 2018.pdf',
        size: '3.1 MB',
        type: 'PDF Document',
        uploadedAt: '15 Aug 2025',
        status: 'Verified',
      },
    ],
    notes: [
      {
        id: 'note-15-1',
        author: 'Admin',
        role: 'Operations',
        content: 'Revenue records cross-checked. Boundary verified with survey department records.',
        createdAt: '15 Aug 2025, 05:45 PM',
      },
    ],
    timeline: [
      {
        action: 'Registration submitted',
        timestamp: '15 Aug 2025, 04:10 PM',
      },
      {
        action: 'Documents verified by legal associate',
        timestamp: '15 Aug 2025, 06:00 PM',
        user: 'Admin Operations',
      },
    ],
  },
  {
    id: 'TRN-LR-0014',
    referenceNumber: 'TRN-LR-0014',
    fullName: 'Naseer P',
    phone: '+91 98462 77109',
    email: 'naseer.p@gmail.com',
    landownerType: 'Group',
    preferredCommunication: 'WhatsApp',
    district: 'Thrissur',
    localBody: 'Chalakudy Municipality',
    locality: 'Potore',
    location: '10.3012° N, 76.3318° E',
    approximateArea: 3.2,
    areaDisplay: '3.2 Acres',
    ownershipStatus: 'Joint Ownership',
    poolingInterest: 'Create new aggregation cluster',
    status: 'Needs Clarification',
    submittedAt: '15 Aug 2025, 02:18 PM',
    submittedDate: '15 Aug 2025',
    submittedTimestamp: new Date('2025-08-15T14:18:00').getTime(),
    updatedAt: '15 Aug 2025, 03:30 PM',
    documents: [
      {
        id: 'doc-14-1',
        name: 'Group Power of Attorney.pdf',
        size: '4.5 MB',
        type: 'PDF Document',
        uploadedAt: '15 Aug 2025',
        status: 'Flagged',
      },
    ],
    notes: [
      {
        id: 'note-14-1',
        author: 'Admin',
        role: 'Operations',
        content: 'Missing sign-off from 2 members of the 5-owner syndicate.',
        createdAt: '15 Aug 2025, 03:30 PM',
      },
    ],
    timeline: [
      {
        action: 'Registration submitted',
        timestamp: '15 Aug 2025, 02:18 PM',
      },
      {
        action: 'Status changed to Needs Clarification',
        timestamp: '15 Aug 2025, 03:30 PM',
        user: 'Admin Operations',
      },
    ],
  },
  {
    id: 'TRN-LR-0013',
    referenceNumber: 'TRN-LR-0013',
    fullName: 'Ameer Ali',
    phone: '+91 94950 11200',
    email: 'ameer.ali@gmail.com',
    landownerType: 'Individual',
    preferredCommunication: 'Email',
    district: 'Kannur',
    localBody: 'Thalassery Municipality',
    locality: 'Eranholi',
    location: '11.7511° N, 75.4982° E',
    approximateArea: 1.5,
    areaDisplay: '1.5 Acres',
    ownershipStatus: 'Self Owned',
    poolingInterest: 'Join an existing opportunity',
    status: 'New',
    submittedAt: '14 Aug 2025, 05:22 PM',
    submittedDate: '14 Aug 2025',
    submittedTimestamp: new Date('2025-08-14T17:22:00').getTime(),
    updatedAt: '14 Aug 2025, 05:22 PM',
    documents: [],
    notes: [],
    timeline: [
      {
        action: 'Registration submitted via public portal',
        timestamp: '14 Aug 2025, 05:22 PM',
      },
    ],
  },
  {
    id: 'TRN-LR-0012',
    referenceNumber: 'TRN-LR-0012',
    fullName: 'Rajesh K',
    phone: '+91 98470 66321',
    email: 'rajesh.k@gmail.com',
    landownerType: 'Family',
    preferredCommunication: 'Phone Call',
    district: 'Ernakulam',
    localBody: 'Thrippunithura Municipality',
    locality: 'Petta',
    location: '9.9512° N, 76.3491° E',
    approximateArea: 5.0,
    areaDisplay: '5.0 Acres',
    ownershipStatus: 'Family Inherited',
    poolingInterest: 'Join an existing opportunity',
    status: 'Verified',
    submittedAt: '14 Aug 2025, 11:15 AM',
    submittedDate: '14 Aug 2025',
    submittedTimestamp: new Date('2025-08-14T11:15:00').getTime(),
    updatedAt: '14 Aug 2025, 02:40 PM',
    documents: [
      {
        id: 'doc-12-1',
        name: 'Encumbrance Certificate.pdf',
        size: '1.6 MB',
        type: 'PDF Document',
        uploadedAt: '14 Aug 2025',
        status: 'Verified',
      },
    ],
    notes: [
      {
        id: 'note-12-1',
        author: 'Admin',
        role: 'Operations',
        content: 'Prime parcel adjacent to upcoming transit zone. Passed initial legal due diligence.',
        createdAt: '14 Aug 2025, 02:40 PM',
      },
    ],
    timeline: [
      {
        action: 'Registration submitted',
        timestamp: '14 Aug 2025, 11:15 AM',
      },
      {
        action: 'Marked as Verified',
        timestamp: '14 Aug 2025, 02:40 PM',
        user: 'Admin Operations',
      },
    ],
  },
  {
    id: 'TRN-LR-0011',
    referenceNumber: 'TRN-LR-0011',
    fullName: 'Salma K',
    phone: '+91 97442 88319',
    email: 'salma.k@gmail.com',
    landownerType: 'Individual',
    preferredCommunication: 'WhatsApp',
    district: 'Kozhikode',
    localBody: 'Vadakara Municipality',
    locality: 'Nut Street',
    location: '11.6021° N, 75.5891° E',
    approximateArea: 2.0,
    areaDisplay: '2.0 Acres',
    ownershipStatus: 'Self Owned',
    poolingInterest: 'Join an existing opportunity',
    status: 'Verification Pending',
    submittedAt: '13 Aug 2025, 04:30 PM',
    submittedDate: '13 Aug 2025',
    submittedTimestamp: new Date('2025-08-13T16:30:00').getTime(),
    updatedAt: '13 Aug 2025, 04:30 PM',
    documents: [],
    notes: [],
    timeline: [
      {
        action: 'Registration submitted',
        timestamp: '13 Aug 2025, 04:30 PM',
      },
    ],
  },
  {
    id: 'TRN-LR-0010',
    referenceNumber: 'TRN-LR-0010',
    fullName: 'Jameela',
    phone: '+91 96051 44109',
    email: 'jameela.m@gmail.com',
    landownerType: 'Group',
    preferredCommunication: 'WhatsApp',
    district: 'Malappuram',
    localBody: 'Tirur Municipality',
    locality: 'Tanur Road',
    location: '10.9122° N, 75.9231° E',
    approximateArea: 3.5,
    areaDisplay: '3.5 Acres',
    ownershipStatus: 'Joint Ownership',
    poolingInterest: 'Create new aggregation cluster',
    status: 'New',
    submittedAt: '13 Aug 2025, 01:20 PM',
    submittedDate: '13 Aug 2025',
    submittedTimestamp: new Date('2025-08-13T13:20:00').getTime(),
    updatedAt: '13 Aug 2025, 01:20 PM',
    documents: [],
    notes: [],
    timeline: [
      {
        action: 'Registration submitted',
        timestamp: '13 Aug 2025, 01:20 PM',
      },
    ],
  },
  {
    id: 'TRN-LR-0009',
    referenceNumber: 'TRN-LR-0009',
    fullName: 'Pradeep M',
    phone: '+91 94460 77182',
    email: 'pradeep.m@gmail.com',
    landownerType: 'Individual',
    preferredCommunication: 'Phone Call',
    district: 'Thrissur',
    localBody: 'Thrissur Corporation',
    locality: 'Ollur',
    location: '10.4812° N, 76.2418° E',
    approximateArea: 1.2,
    areaDisplay: '1.2 Acres',
    ownershipStatus: 'Self Owned',
    poolingInterest: 'Join an existing opportunity',
    status: 'Verified',
    submittedAt: '12 Aug 2025, 03:45 PM',
    submittedDate: '12 Aug 2025',
    submittedTimestamp: new Date('2025-08-12T15:45:00').getTime(),
    updatedAt: '13 Aug 2025, 10:00 AM',
    documents: [
      {
        id: 'doc-9-1',
        name: 'Land Register Copy.pdf',
        size: '1.9 MB',
        type: 'PDF Document',
        uploadedAt: '12 Aug 2025',
        status: 'Verified',
      },
    ],
    notes: [],
    timeline: [
      {
        action: 'Registration submitted',
        timestamp: '12 Aug 2025, 03:45 PM',
      },
      {
        action: 'Verified by Trinfra Ground Team',
        timestamp: '13 Aug 2025, 10:00 AM',
        user: 'Admin Operations',
      },
    ],
  },
  {
    id: 'TRN-LR-0008',
    referenceNumber: 'TRN-LR-0008',
    fullName: 'Rafiq T',
    phone: '+91 98471 33209',
    email: 'rafiq.t@gmail.com',
    landownerType: 'Family',
    preferredCommunication: 'WhatsApp',
    district: 'Palakkad',
    localBody: 'Palakkad Municipality',
    locality: 'Pirayiri',
    location: '10.7819° N, 76.6512° E',
    approximateArea: 4.8,
    areaDisplay: '4.8 Acres',
    ownershipStatus: 'Family Inherited',
    poolingInterest: 'Explore options with partners',
    status: 'Needs Clarification',
    submittedAt: '12 Aug 2025, 10:05 AM',
    submittedDate: '12 Aug 2025',
    submittedTimestamp: new Date('2025-08-12T10:05:00').getTime(),
    updatedAt: '12 Aug 2025, 11:30 AM',
    documents: [],
    notes: [
      {
        id: 'note-8-1',
        author: 'Admin',
        role: 'Operations',
        content: 'Agricultural reclassification certificate required for non-crop zone segment.',
        createdAt: '12 Aug 2025, 11:30 AM',
      },
    ],
    timeline: [
      {
        action: 'Registration submitted',
        timestamp: '12 Aug 2025, 10:05 AM',
      },
    ],
  },
  {
    id: 'TRN-LR-0007',
    referenceNumber: 'TRN-LR-0007',
    fullName: 'George Varghese',
    phone: '+91 94473 11899',
    email: 'george.v@gmail.com',
    landownerType: 'Individual',
    preferredCommunication: 'Email',
    district: 'Kottayam',
    localBody: 'Ettumanoor Municipality',
    locality: 'Athirampuzha',
    location: '9.6512° N, 76.5312° E',
    approximateArea: 3.0,
    areaDisplay: '3.0 Acres',
    ownershipStatus: 'Self Owned',
    poolingInterest: 'Join an existing opportunity',
    status: 'Verified',
    submittedAt: '11 Aug 2025, 02:15 PM',
    submittedDate: '11 Aug 2025',
    submittedTimestamp: new Date('2025-08-11T14:15:00').getTime(),
    updatedAt: '11 Aug 2025, 04:00 PM',
    documents: [],
    notes: [],
    timeline: [
      { action: 'Registration submitted', timestamp: '11 Aug 2025, 02:15 PM' },
    ],
  },
  {
    id: 'TRN-LR-0006',
    referenceNumber: 'TRN-LR-0006',
    fullName: 'Mohandas K',
    phone: '+91 98460 22719',
    email: 'mohandas.k@gmail.com',
    landownerType: 'Family',
    preferredCommunication: 'WhatsApp',
    district: 'Alappuzha',
    localBody: 'Cherthala Municipality',
    locality: 'Arthunkal',
    location: '9.6811° N, 76.3218° E',
    approximateArea: 2.2,
    areaDisplay: '2.2 Acres',
    ownershipStatus: 'Family Inherited',
    poolingInterest: 'Explore land-pooling partnership',
    status: 'Verification Pending',
    submittedAt: '11 Aug 2025, 09:30 AM',
    submittedDate: '11 Aug 2025',
    submittedTimestamp: new Date('2025-08-11T09:30:00').getTime(),
    updatedAt: '11 Aug 2025, 09:30 AM',
    documents: [],
    notes: [],
    timeline: [
      { action: 'Registration submitted', timestamp: '11 Aug 2025, 09:30 AM' },
    ],
  },
];

// Seed Developer Enquiries Preview (matching mockup)
export interface RecentEnquiryPreview {
  reference: string;
  company: string;
  opportunity: string;
  role: 'Developer' | 'Investor';
  submitted: string;
}

export const SEED_DEVELOPER_ENQUIRIES: RecentEnquiryPreview[] = [
  {
    reference: 'TRN-ENQ-0042',
    company: 'Greenbuild',
    opportunity: 'Kozhikode North',
    role: 'Developer',
    submitted: '16 Aug 2025',
  },
  {
    reference: 'TRN-ENQ-0041',
    company: 'Skyline Infra',
    opportunity: 'Malappuram Growth',
    role: 'Investor',
    submitted: '15 Aug 2025',
  },
  {
    reference: 'TRN-ENQ-0040',
    company: 'Horizon Group',
    opportunity: 'Palakkad West',
    role: 'Developer',
    submitted: '15 Aug 2025',
  },
  {
    reference: 'TRN-ENQ-0039',
    company: 'BuildNext',
    opportunity: 'Thrissur East',
    role: 'Investor',
    submitted: '14 Aug 2025',
  },
];

// Seed Activity items (matching mockup)
export const SEED_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    type: 'registration_received',
    title: 'New land registration received',
    reference: 'TRN-LR-20250816-0017',
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    relativeTime: '12 minutes ago',
  },
  {
    id: 'act-2',
    type: 'enquiry_received',
    title: 'Developer enquiry received',
    reference: 'TRN-ENQ-20250816-0042',
    timestamp: new Date(Date.now() - 48 * 60 * 1000).toISOString(),
    relativeTime: '48 minutes ago',
  },
  {
    id: 'act-3',
    type: 'verification_updated',
    title: 'Landowner verification updated',
    reference: 'TRN-LR-20250815-0031',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    relativeTime: '2 hours ago',
  },
  {
    id: 'act-4',
    type: 'registration_received',
    title: 'New land registration received',
    reference: 'TRN-LR-20250815-0030',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    relativeTime: '4 hours ago',
  },
  {
    id: 'act-5',
    type: 'enquiry_received',
    title: 'Developer enquiry received',
    reference: 'TRN-ENQ-20250816-0041',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    relativeTime: '6 hours ago',
  },
];

// Seed 7-day registration trend (Aug 10 to Aug 16)
export const REGISTRATION_CHART_DATA = [
  { date: 'Aug 10', count: 14, label: 'Sunday' },
  { date: 'Aug 11', count: 19, label: 'Monday' },
  { date: 'Aug 12', count: 22, label: 'Tuesday' },
  { date: 'Aug 13', count: 25, label: 'Wednesday' },
  { date: 'Aug 14', count: 21, label: 'Thursday' },
  { date: 'Aug 15', count: 24, label: 'Friday' },
  { date: 'Aug 16', count: 31, label: 'Saturday' },
];

/**
 * Converts a public submission (from /register) into an Admin Landowner Lead.
 */
function convertPublicSubmission(s: RegistrationData): LandownerLead {
  const typeMap: Record<string, LandownerType> = {
    individual: 'Individual',
    family: 'Family',
    group: 'Group',
  };

  const statusMap: Record<string, LandownerStatus> = {
    new: 'New',
    under_review: 'Verification Pending',
    verified: 'Verified',
    rejected: 'Rejected',
  };

  const subDate = new Date(s.submissionDate || Date.now());
  const formattedDate = subDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const formattedDateTime = `${formattedDate}, ${subDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })}`;

  return {
    id: s.referenceNumber,
    referenceNumber: s.referenceNumber,
    fullName: s.fullName || 'Landowner',
    phone: s.phone || 'N/A',
    email: s.email || 'N/A',
    landownerType: typeMap[s.landownerType] || 'Individual',
    preferredCommunication:
      s.communicationPreference === 'whatsapp'
        ? 'WhatsApp'
        : s.communicationPreference === 'phone'
        ? 'Phone Call'
        : 'Email',
    district: s.district || 'Kerala',
    localBody: s.localBody || 'Local Body',
    locality: s.locality || 'Locality',
    location: s.mapLocation
      ? `${s.mapLocation.lat.toFixed(4)}° N, ${s.mapLocation.lng.toFixed(4)}° E`
      : `${s.district}, Kerala`,
    approximateArea: parseFloat(s.approximateArea) || 1,
    areaDisplay: `${s.approximateArea || '1'} ${s.areaUnit ? s.areaUnit.charAt(0).toUpperCase() + s.areaUnit.slice(1) : 'Acres'}`,
    ownershipStatus: 'Self Owned',
    poolingInterest:
      s.poolingInterest === 'join'
        ? 'Join an existing opportunity'
        : s.poolingInterest === 'create'
        ? 'Create new aggregation cluster'
        : 'Explore land-pooling partnership',
    status: statusMap[s.verificationStatus] || 'New',
    submittedAt: formattedDateTime,
    submittedDate: formattedDate,
    submittedTimestamp: subDate.getTime(),
    updatedAt: formattedDateTime,
    documents: (s.documents || []).map((d, i) => ({
      id: `doc-pub-${i}`,
      name: d.name,
      size: `${(d.size / (1024 * 1024)).toFixed(1)} MB`,
      type: d.type || 'Document',
      uploadedAt: formattedDate,
      status: 'Pending Review',
    })),
    notes: s.notes
      ? [
          {
            id: 'note-pub',
            author: 'Landowner Note',
            role: 'Public Submission',
            content: s.notes,
            createdAt: formattedDateTime,
          },
        ]
      : [],
    timeline: [
      {
        action: 'Land registration submitted via public portal',
        timestamp: formattedDateTime,
      },
    ],
  };
}

/**
 * Returns all landowner leads, combining seed data and real user submissions from /register.
 */
export function getAllLandowners(): LandownerLead[] {
  if (typeof window === 'undefined') return SEED_LANDOWNERS;

  try {
    let customLeads: LandownerLead[] = [];
    const stored = localStorage.getItem(ADMIN_LANDOWNERS_KEY);
    if (stored) {
      customLeads = JSON.parse(stored);
    } else {
      // First time initialization: write seed data to storage
      customLeads = [...SEED_LANDOWNERS];
      localStorage.setItem(ADMIN_LANDOWNERS_KEY, JSON.stringify(customLeads));
    }

    // Pull any public submissions from /register that aren't already included
    const publicSubs = getSubmissions();
    const existingRefs = new Set(customLeads.map((l) => l.referenceNumber));

    let hasNewPublic = false;
    for (const sub of publicSubs) {
      if (!existingRefs.has(sub.referenceNumber)) {
        customLeads.unshift(convertPublicSubmission(sub));
        hasNewPublic = true;
      }
    }

    if (hasNewPublic) {
      localStorage.setItem(ADMIN_LANDOWNERS_KEY, JSON.stringify(customLeads));
    }

    return customLeads;
  } catch {
    return SEED_LANDOWNERS;
  }
}

/**
 * Retrieve single landowner lead by ID or Reference Number.
 */
export function getLandownerById(id: string): LandownerLead | null {
  const all = getAllLandowners();
  const normalizedId = decodeURIComponent(id).trim().toLowerCase();
  return (
    all.find(
      (l) =>
        l.id.toLowerCase() === normalizedId ||
        l.referenceNumber.toLowerCase() === normalizedId
    ) || null
  );
}

/**
 * Update the status of a landowner record.
 * Logs an activity event and updates record timeline.
 */
export function updateLandownerStatus(
  id: string,
  newStatus: LandownerStatus,
  noteText?: string
): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const all = getAllLandowners();
    const leadIndex = all.findIndex(
      (l) => l.id === id || l.referenceNumber === id
    );

    if (leadIndex === -1) return false;

    const lead = all[leadIndex];
    const prevStatus = lead.status;
    const now = new Date();
    const formattedNow = `${now.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })}, ${now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })}`;

    lead.status = newStatus;
    lead.updatedAt = formattedNow;

    // Timeline event
    lead.timeline.unshift({
      action: `Status changed from ${prevStatus} to ${newStatus}`,
      timestamp: formattedNow,
      user: 'Admin Operations',
    });

    // Optional accompanying note
    if (noteText && noteText.trim()) {
      lead.notes.unshift({
        id: `note-${Date.now()}`,
        author: 'Admin',
        role: 'Operations',
        content: noteText.trim(),
        createdAt: formattedNow,
      });
    }

    // Save updated list
    all[leadIndex] = lead;
    localStorage.setItem(ADMIN_LANDOWNERS_KEY, JSON.stringify(all));

    // Record system-wide activity
    recordActivity({
      type: 'status_changed',
      title: `Landowner verification updated to ${newStatus}`,
      reference: lead.referenceNumber,
      details: `Changed from ${prevStatus} to ${newStatus}`,
    });

    return true;
  } catch {
    return false;
  }
}

/**
 * Add an internal admin note to a landowner record.
 */
export function addLandownerNote(id: string, content: string): boolean {
  if (typeof window === 'undefined' || !content.trim()) return false;

  try {
    const all = getAllLandowners();
    const leadIndex = all.findIndex(
      (l) => l.id === id || l.referenceNumber === id
    );

    if (leadIndex === -1) return false;

    const lead = all[leadIndex];
    const now = new Date();
    const formattedNow = `${now.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })}, ${now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })}`;

    const newNote: AdminNote = {
      id: `note-${Date.now()}`,
      author: 'Admin',
      role: 'Operations',
      content: content.trim(),
      createdAt: formattedNow,
    };

    lead.notes.unshift(newNote);
    lead.updatedAt = formattedNow;

    lead.timeline.unshift({
      action: `Internal note added`,
      timestamp: formattedNow,
      user: 'Admin Operations',
    });

    all[leadIndex] = lead;
    localStorage.setItem(ADMIN_LANDOWNERS_KEY, JSON.stringify(all));

    recordActivity({
      type: 'note_added',
      title: 'Internal note added to landowner record',
      reference: lead.referenceNumber,
    });

    return true;
  } catch {
    return false;
  }
}

/**
 * Add a new manual landowner entry.
 */
export function addManualLandowner(leadData: Partial<LandownerLead>): LandownerLead {
  const all = getAllLandowners();
  const nextNum = String(all.length + 1).padStart(4, '0');
  const ref = `TRN-LR-${nextNum}`;

  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const formattedDateTime = `${formattedDate}, ${now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })}`;

  const newLead: LandownerLead = {
    id: ref,
    referenceNumber: ref,
    fullName: leadData.fullName || 'Landowner Name',
    phone: leadData.phone || '+91 90000 00000',
    email: leadData.email || 'lead@example.com',
    landownerType: leadData.landownerType || 'Individual',
    preferredCommunication: leadData.preferredCommunication || 'WhatsApp',
    district: leadData.district || 'Kozhikode',
    localBody: leadData.localBody || 'Corporation',
    locality: leadData.locality || 'Locality',
    location: leadData.location || `${leadData.district || 'Kerala'}, Kerala`,
    approximateArea: leadData.approximateArea || 1.0,
    areaDisplay: `${leadData.approximateArea || 1.0} Acres`,
    ownershipStatus: leadData.ownershipStatus || 'Self Owned',
    poolingInterest: leadData.poolingInterest || 'Join an existing opportunity',
    status: leadData.status || 'New',
    submittedAt: formattedDateTime,
    submittedDate: formattedDate,
    submittedTimestamp: now.getTime(),
    updatedAt: formattedDateTime,
    documents: leadData.documents || [],
    notes: leadData.notes || [],
    timeline: [
      {
        action: 'Manual lead entry created by Admin Operations',
        timestamp: formattedDateTime,
        user: 'Admin Operations',
      },
    ],
  };

  all.unshift(newLead);
  if (typeof window !== 'undefined') {
    localStorage.setItem(ADMIN_LANDOWNERS_KEY, JSON.stringify(all));
  }

  recordActivity({
    type: 'registration_received',
    title: 'Manual landowner lead created',
    reference: ref,
  });

  return newLead;
}

/**
 * Record a system-wide activity event.
 */
export function recordActivity(item: {
  type: ActivityItem['type'];
  title: string;
  reference: string;
  details?: string;
}): void {
  if (typeof window === 'undefined') return;

  try {
    const activities = getActivities();
    const newAct: ActivityItem = {
      id: `act-${Date.now()}`,
      type: item.type,
      title: item.title,
      reference: item.reference,
      timestamp: new Date().toISOString(),
      relativeTime: 'Just now',
      details: item.details,
    };

    activities.unshift(newAct);
    localStorage.setItem(
      ADMIN_ACTIVITY_KEY,
      JSON.stringify(activities.slice(0, 30))
    );
  } catch {
    // ignore
  }
}

/**
 * Retrieve system-wide activities.
 */
export function getActivities(): ActivityItem[] {
  if (typeof window === 'undefined') return SEED_ACTIVITIES;

  try {
    const stored = localStorage.getItem(ADMIN_ACTIVITY_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    localStorage.setItem(ADMIN_ACTIVITY_KEY, JSON.stringify(SEED_ACTIVITIES));
    return SEED_ACTIVITIES;
  } catch {
    return SEED_ACTIVITIES;
  }
}

/**
 * Compute real-time dashboard KPIs based on actual stored records.
 */
export function getAdminDashboardStats() {
  const landowners = getAllLandowners();
  const realEnquiries = typeof window !== 'undefined' ? getEnquiries() : [];

  const newCount = landowners.filter((l) => l.status === 'New').length;
  const pendingCount = landowners.filter(
    (l) => l.status === 'Verification Pending'
  ).length;
  const verifiedCount = landowners.filter(
    (l) => l.status === 'Verified'
  ).length;

  const totalEnquiries =
    realEnquiries.length > 0
      ? realEnquiries.length + SEED_DEVELOPER_ENQUIRIES.length
      : 25;

  return {
    totalLandownersDisplay: '500+',
    totalLandownersActual: 500 + landowners.length,
    newRegistrations: newCount,
    verificationPending: pendingCount,
    verifiedCount,
    developerEnquiries: totalEnquiries,
  };
}
