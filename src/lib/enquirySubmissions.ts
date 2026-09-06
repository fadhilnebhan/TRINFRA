// Trinfra — Developer/Investor Enquiry Service
// Clean abstraction over localStorage. Swap this file for a real API client later.

export type EnquiryRole = 'developer' | 'investor' | 'other';
export type EnquiryInterest =
  | 'request_info'
  | 'explore_partnership'
  | 'schedule_discussion'
  | 'not_sure';
export type EnquiryStatus = 'New' | 'Contacted' | 'Qualified' | 'Closed';

export interface EnquiryData {
  referenceNumber: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  role: EnquiryRole;
  interest: EnquiryInterest;
  opportunityId: string;
  opportunityTitle?: string;
  investmentRange?: string;
  preferredContactMethod?: string;
  preferredLocation?: string;
  interestType?: string;
  message: string;
  submittedAt: string; // ISO string
  status: EnquiryStatus;
  internalNotes: string;
}

export type EnquiryDraft = Omit<
  EnquiryData,
  'referenceNumber' | 'submittedAt' | 'status' | 'internalNotes'
>;

const ENQUIRIES_KEY = 'trinfra_enquiries';
const ENQUIRY_DRAFT_KEY = 'trinfra_enquiry_draft';

/**
 * Generate a unique reference number: TRN-ENQ-XXXXXXXX
 * Format: TRN-ENQ-YYYYMMDD-XXXX
 */
export function generateEnquiryRef(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TRN-ENQ-${y}${m}${d}-${code}`;
}

/**
 * Submit a developer/investor enquiry. Returns the reference number.
 */
export function submitInvestorEnquiry(draft: EnquiryDraft): string {
  const referenceNumber = generateEnquiryRef();

  const enquiry: EnquiryData = {
    ...draft,
    referenceNumber,
    submittedAt: new Date().toISOString(),
    status: 'New',
    internalNotes: '',
  };

  const existing = getEnquiries();
  existing.push(enquiry);

  try {
    localStorage.setItem(ENQUIRIES_KEY, JSON.stringify(existing));
  } catch {
    // localStorage full — store without message body
    const lightweight = existing.map((e) => ({ ...e, message: '[stored]' }));
    localStorage.setItem(ENQUIRIES_KEY, JSON.stringify(lightweight));
  }

  // Clear draft after successful submission
  clearEnquiryDraft();

  return referenceNumber;
}

/**
 * Retrieve all enquiries (for future admin dashboard).
 */
export function getEnquiries(): EnquiryData[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(ENQUIRIES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as EnquiryData[];
  } catch {
    return [];
  }
}

/**
 * Retrieve a single enquiry by reference number.
 */
export function getEnquiryByRef(ref: string): EnquiryData | null {
  return getEnquiries().find((e) => e.referenceNumber === ref) || null;
}

/**
 * Retrieve enquiries for a specific opportunity.
 */
export function getEnquiriesByOpportunity(opportunityId: string): EnquiryData[] {
  return getEnquiries().filter((e) => e.opportunityId === opportunityId);
}

/**
 * Save in-progress enquiry form data as a draft.
 */
export function saveEnquiryDraft(data: Partial<EnquiryDraft>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ENQUIRY_DRAFT_KEY, JSON.stringify(data));
  } catch {
    // Silently fail
  }
}

/**
 * Load a saved enquiry draft.
 */
export function loadEnquiryDraft(): Partial<EnquiryDraft> | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(ENQUIRY_DRAFT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Partial<EnquiryDraft>;
  } catch {
    return null;
  }
}

/**
 * Clear the saved enquiry draft.
 */
export function clearEnquiryDraft(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ENQUIRY_DRAFT_KEY);
}

/**
 * Human-readable labels for roles and interests.
 */
export const ROLE_LABELS: Record<EnquiryRole, string> = {
  developer: 'Developer',
  investor: 'Investor',
  other: 'Other',
};

export const INTEREST_LABELS: Record<EnquiryInterest, string> = {
  request_info: 'Request Project Information',
  explore_partnership: 'Explore Partnership',
  schedule_discussion: 'Schedule a Discussion',
  not_sure: 'Not Sure Yet',
};
