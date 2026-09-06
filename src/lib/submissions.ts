// Trinfra Landowner Registration — Data Service
// Clean abstraction over localStorage. Swap this file for a real API client later.

export interface DocumentMeta {
  name: string;
  size: number;
  type: string;
  dataUri: string; // base64 data URI — private, never publicly exposed
}

export interface RegistrationData {
  referenceNumber: string;
  landownerType: 'individual' | 'family' | 'group' | '';
  fullName: string;
  phone: string;
  email: string;
  communicationPreference: 'phone' | 'whatsapp' | 'email' | '';
  district: string;
  localBody: string;
  locality: string;
  mapLocation: { lat: number; lng: number } | null;
  approximateArea: string; // stored as string for input flexibility, validated as number
  areaUnit: 'acres' | 'cents' | 'hectares';
  ownershipStatus: 'sole' | 'joint' | 'family' | 'community' | 'other' | '';
  documents: DocumentMeta[];
  poolingInterest: 'join' | 'create' | 'unsure' | '';
  submissionDate: string; // ISO string
  verificationStatus: 'new' | 'under_review' | 'verified' | 'rejected';
  notes: string;
}

export type RegistrationDraft = Omit<RegistrationData, 'referenceNumber' | 'submissionDate' | 'verificationStatus' | 'notes'>;

const SUBMISSIONS_KEY = 'trinfra_submissions';
const DRAFT_KEY = 'trinfra_registration_draft';

/**
 * Generate a unique reference number: TRN-XXXXXX
 */
export function generateReferenceNumber(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Add timestamp component for uniqueness
  const ts = Date.now().toString(36).slice(-3).toUpperCase();
  return `TRN-${ts}${code.slice(0, 3)}`;
}

/**
 * Submit a completed enquiry. Returns the reference number.
 */
export function submitEnquiry(draft: RegistrationDraft): string {
  const referenceNumber = generateReferenceNumber();

  const submission: RegistrationData = {
    ...draft,
    referenceNumber,
    submissionDate: new Date().toISOString(),
    verificationStatus: 'new',
    notes: '',
  };

  const existing = getSubmissions();
  existing.push(submission);

  try {
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(existing));
  } catch {
    // localStorage full — remove document data URIs and retry
    const lightweight = existing.map(s => ({
      ...s,
      documents: s.documents.map(d => ({ ...d, dataUri: '[stored]' })),
    }));
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(lightweight));
  }

  // Clear draft after successful submission
  clearDraft();

  return referenceNumber;
}

/**
 * Retrieve all submissions (for future admin dashboard).
 */
export function getSubmissions(): RegistrationData[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(SUBMISSIONS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as RegistrationData[];
  } catch {
    return [];
  }
}

/**
 * Retrieve a single submission by reference number.
 */
export function getSubmissionByRef(ref: string): RegistrationData | null {
  return getSubmissions().find(s => s.referenceNumber === ref) || null;
}

/**
 * Save in-progress form data as a draft (session persistence).
 */
export function saveDraft(data: Partial<RegistrationDraft>): void {
  if (typeof window === 'undefined') return;
  try {
    // Don't save document dataUris in draft to avoid localStorage limits
    const safeDraft = {
      ...data,
      documents: (data.documents || []).map(d => ({
        name: d.name,
        size: d.size,
        type: d.type,
        dataUri: '', // don't persist file data in draft
      })),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(safeDraft));
  } catch {
    // Silently fail — draft is a convenience, not critical
  }
}

/**
 * Load a saved draft.
 */
export function loadDraft(): Partial<RegistrationDraft> | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(DRAFT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Partial<RegistrationDraft>;
  } catch {
    return null;
  }
}

/**
 * Clear the saved draft.
 */
export function clearDraft(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(DRAFT_KEY);
}
