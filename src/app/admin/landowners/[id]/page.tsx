'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Phone,
  Mail,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Download,
  Trash2,
  Send,
  ShieldCheck,
  CheckSquare,
  Square,
  Upload,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';
import { LandownerStatus } from '@/lib/adminData';
import CustomSelect from '@/components/opportunities/CustomSelect';

interface DocumentItem {
  id: string;
  fileName: string;
  documentType: string;
  fileSize: number;
  mimeType: string;
  verificationStatus: string;
  uploadedAt: string;
}

interface AdminNoteItem {
  id: string;
  authorName: string;
  authorRole: string;
  content: string;
  createdAt: string;
}

interface LandownerData {
  id: string;
  referenceNumber: string;
  fullName: string;
  phone: string;
  email: string;
  ownerType: string;
  preferredCommunication: string;
  district: string;
  localBody: string;
  locality: string;
  approximateArea: number;
  areaUnit: string;
  ownershipStatus: string;
  poolingInterest: string;
  verificationStatus: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  documents: DocumentItem[];
  adminNotes: AdminNoteItem[];
}

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  checked: boolean;
}

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  {
    id: 'identity',
    label: 'Identity Information',
    description: 'Aadhaar / Voter ID / Passport cross-checked against registration name',
    checked: false,
  },
  {
    id: 'ownership',
    label: 'Ownership & Title Deed',
    description: 'Title deed, patta, or tax receipt verified for lawful ownership',
    checked: false,
  },
  {
    id: 'land_details',
    label: 'Land Area & Extent',
    description: 'Acreage, local body classification, and survey demarcation confirmed',
    checked: false,
  },
  {
    id: 'location',
    label: 'Location & Road Access',
    description: 'Locality and road access suitability confirmed for pooling feasibility',
    checked: false,
  },
  {
    id: 'documents',
    label: 'Documents Authentication',
    description: 'Uploaded deeds inspected for clarity, stamp validity, and completeness',
    checked: false,
  },
];

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function LandownerDetailPage() {
  const params = useParams();
  const leadId = params?.id as string;

  const [lead, setLead] = useState<LandownerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'verification' | 'documents' | 'notes'>('overview');

  // Checklist state (persisted to localStorage)
  const [checklist, setChecklist] = useState<ChecklistItem[]>(DEFAULT_CHECKLIST);

  // Modals for confirmation
  const [confirmStatus, setConfirmStatus] = useState<string | null>(null);
  const [clarificationModal, setClarificationModal] = useState(false);
  const [clarificationReason, setClarificationReason] = useState('');
  const [rejectionModal, setRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteLead = async () => {
    if (!lead) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/landowners/${lead.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete landowner record');

      window.location.href = '/admin/landowners';
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete landowner record');
      setIsDeleting(false);
    }
  };

  // Note addition
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  // Document upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDocType, setUploadDocType] = useState('OWNERSHIP');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Fetch landowner from live database
  const fetchLead = useCallback(async () => {
    if (!leadId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/landowners/${leadId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.landowner) {
          setLead(data.landowner);

          // Restore saved checklist from localStorage
          const savedChecklist = localStorage.getItem(`trinfra_checklist_${data.landowner.id}`);
          if (savedChecklist) {
            try {
              setChecklist(JSON.parse(savedChecklist));
            } catch (e) {
              console.warn('Checklist parse error', e);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error fetching landowner:', err);
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    fetchLead();
  }, [fetchLead]);

  // Toggle checklist item
  const toggleChecklist = (id: string) => {
    if (!lead) return;
    const updated = checklist.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setChecklist(updated);
    localStorage.setItem(`trinfra_checklist_${lead.id}`, JSON.stringify(updated));
  };

  // Status Change API persistence
  const updateStatus = async (newStatus: string, reasonNote?: string) => {
    if (!lead) return;

    try {
      const clarReason =
        newStatus === 'NEEDS_CLARIFICATION' && reasonNote
          ? reasonNote.replace(/^Clarification Required:\s*/i, '').trim()
          : undefined;

      const res = await fetch(`/api/admin/landowners/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationStatus: newStatus,
          clarificationReason: clarReason,
        }),
      });

      if (res.ok) {
        setLead((prev) => (prev ? { ...prev, verificationStatus: newStatus } : null));

        // If a reason note was provided (e.g. clarification or rejection), persist as an AdminNote
        if (reasonNote?.trim()) {
          const noteRes = await fetch(`/api/admin/landowners/${lead.id}/notes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: reasonNote.trim(),
              authorRole: 'Verification Committee',
            }),
          });
          if (noteRes.ok) {
            const noteData = await noteRes.json();
            setLead((prev) =>
              prev ? { ...prev, adminNotes: [noteData.note, ...(prev.adminNotes || [])] } : null
            );
          }
        }

        let feedbackText = `Verification status updated to ${newStatus}`;
        if (newStatus === 'VERIFICATION_PENDING') {
          feedbackText = 'Verification status updated to Verification Pending.';
        } else if (newStatus === 'NEEDS_CLARIFICATION') {
          feedbackText = 'Clarification request sent to landowner.';
        } else if (newStatus === 'VERIFIED') {
          feedbackText = 'Landowner successfully verified.';
        } else if (newStatus === 'REJECTED') {
          feedbackText = 'Landowner registration marked as Rejected.';
        }

        setStatusFeedback(feedbackText);
        setTimeout(() => setStatusFeedback(null), 4000);
      } else {
        const errData = await res.json().catch(() => ({}));
        setStatusError(errData.error || 'Failed to update verification status.');
        setTimeout(() => setStatusError(null), 4000);
      }
    } catch (err: any) {
      console.error('Error updating status:', err);
      setStatusError(err.message || 'Failed to update status.');
      setTimeout(() => setStatusError(null), 4000);
    } finally {
      setConfirmStatus(null);
      setClarificationModal(false);
      setRejectionModal(false);
      setClarificationReason('');
      setRejectionReason('');
    }
  };

  // Add internal note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || !newNoteContent.trim() || isAddingNote) return;

    setIsAddingNote(true);
    try {
      const res = await fetch(`/api/admin/landowners/${lead.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNoteContent.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setLead((prev) =>
          prev ? { ...prev, adminNotes: [data.note, ...(prev.adminNotes || [])] } : null
        );
        setNewNoteContent('');
      }
    } catch (err) {
      console.error('Error saving note:', err);
    } finally {
      setIsAddingNote(false);
    }
  };

  // Handle direct file upload
  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || !uploadFile) return;

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('landownerId', lead.id);
    formData.append('documentType', uploadDocType);

    try {
      const res = await fetch('/api/admin/documents', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to upload document');
      }

      const data = await res.json();
      setLead((prev) =>
        prev
          ? {
              ...prev,
              documents: [data.document, ...(prev.documents || [])],
            }
          : null
      );
      setUploadFile(null);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle document deletion
  const handleDeleteDoc = async (docId: string, docName: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${docName}"?`)) return;

    try {
      const res = await fetch(`/api/admin/documents/${docId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setLead((prev) =>
          prev
            ? {
                ...prev,
                documents: prev.documents.filter((d) => d.id !== docId),
              }
            : null
        );
      }
    } catch (err) {
      console.error('Error deleting document:', err);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <RefreshCw size={24} className="animate-spin mx-auto text-primary" />
        <p className="text-gray-500">Loading landowner record from database...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-gray-500">Landowner record not found.</p>
        <Link
          href="/admin/landowners"
          className="inline-flex items-center gap-1.5 text-accent font-semibold text-[14px]"
        >
          <ArrowLeft size={16} /> Back to Landowner Leads
        </Link>
      </div>
    );
  }

  // Calculate completed checklist items
  const checkedCount = checklist.filter((i) => i.checked).length;
  const isAllChecked = checkedCount === checklist.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Back Button Link */}
      <div>
        <Link
          href="/admin/landowners"
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-gray-500 hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} /> Back to Landowner Leads
        </Link>
      </div>

      {/* Header Card with Prominent Status Indicator */}
      <div className="bg-white rounded-[16px] p-5 md:p-6 border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#0E2115]/10 text-primary flex items-center justify-center font-mono font-bold text-[15px] border border-[#0E2115]/15 shrink-0">
            <FileText size={22} />
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-[20px] md:text-[24px] font-heading font-extrabold text-foreground tracking-tight">
                {lead.fullName}
              </h1>
              <span className="font-mono text-[13px] text-gray-400">
                ({lead.referenceNumber})
              </span>
              <StatusBadge status={lead.verificationStatus as LandownerStatus} />
            </div>

            <p className="text-[12px] text-gray-400 mt-1 flex items-center gap-1.5">
              <Calendar size={13} />
              <span>
                Registered on{' '}
                {lead.createdAt
                  ? new Date(lead.createdAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Recently'}
              </span>
              <span className="mx-1">•</span>
              <span>
                {lead.approximateArea} {lead.areaUnit} in {lead.locality}, {lead.district}
              </span>
            </p>
          </div>
        </div>

        {/* Status Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {statusFeedback && (
            <span className="text-[12px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 animate-in fade-in">
              {statusFeedback}
            </span>
          )}
          {statusError && (
            <span className="text-[12px] font-semibold text-red-700 bg-red-50 px-2.5 py-1 rounded-md border border-red-200 animate-in fade-in">
              {statusError}
            </span>
          )}

          {lead.verificationStatus !== 'VERIFIED' && (
            <button
              type="button"
              onClick={() => setConfirmStatus('VERIFIED')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-bold shadow-xs transition-all cursor-pointer"
            >
              <CheckCircle2 size={15} />
              <span>Verify Landowner</span>
            </button>
          )}

          {lead.verificationStatus !== 'VERIFICATION_PENDING' && (
            <button
              type="button"
              onClick={() => updateStatus('VERIFICATION_PENDING')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[12px] font-semibold transition-all cursor-pointer"
            >
              <Clock size={14} />
              <span>Set Verification Pending</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setClarificationModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-[12px] font-semibold transition-all cursor-pointer"
          >
            <HelpCircle size={14} />
            <span>Request Clarification</span>
          </button>

          {lead.verificationStatus !== 'REJECTED' && (
            <button
              type="button"
              onClick={() => setRejectionModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-[12px] font-semibold transition-all cursor-pointer"
            >
              <XCircle size={14} />
              <span>Reject</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setDeleteModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[12px] font-semibold transition-all cursor-pointer"
          >
            <Trash2 size={14} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 text-[13px] font-semibold">
        {(['overview', 'verification', 'documents', 'notes'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-3 transition-colors capitalize relative ${
              activeTab === tab
                ? 'text-primary font-bold'
                : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            {tab === 'verification'
              ? `Verification Checklist (${checkedCount}/${checklist.length})`
              : tab === 'documents'
              ? `Documents (${lead.documents.length})`
              : tab === 'notes'
              ? `Admin Notes (${lead.adminNotes.length})`
              : 'Overview'}

            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Landowner Information */}
              <div className="bg-white rounded-[16px] p-5 border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-4">
                <h3 className="text-[14px] font-bold text-foreground border-b border-gray-100 pb-2.5">
                  Landowner Information
                </h3>
                <div>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-0.5">
                    Full Name
                  </span>
                  <p className="text-[14px] font-bold text-foreground">{lead.fullName}</p>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-0.5">
                    Phone Number
                  </span>
                  <a
                    href={`tel:${lead.phone}`}
                    className="text-[13px] font-medium text-foreground hover:text-primary flex items-center gap-1.5"
                  >
                    <Phone size={13} className="text-gray-400" />
                    {lead.phone}
                  </a>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-0.5">
                    Email Address
                  </span>
                  <a
                    href={`mailto:${lead.email}`}
                    className="text-[13px] font-medium text-foreground hover:text-primary flex items-center gap-1.5 truncate"
                  >
                    <Mail size={13} className="text-gray-400 shrink-0" />
                    <span className="truncate">{lead.email}</span>
                  </a>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-0.5">
                      Landowner Type
                    </span>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[12px] font-medium">
                      {lead.ownerType}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-0.5">
                      Preferred Comm.
                    </span>
                    <p className="text-[13px] font-medium text-foreground">
                      {lead.preferredCommunication}
                    </p>
                  </div>
                </div>
              </div>

              {/* Land Details */}
              <div className="bg-white rounded-[16px] p-5 border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-4">
                <h3 className="text-[14px] font-bold text-foreground border-b border-gray-100 pb-2.5">
                  Land Parcel Demarcation
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-0.5">
                      District
                    </span>
                    <p className="text-[14px] font-bold text-foreground">{lead.district}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-0.5">
                      Local Body
                    </span>
                    <p className="text-[13px] font-medium text-foreground">{lead.localBody}</p>
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-0.5">
                    Locality
                  </span>
                  <p className="text-[13px] font-medium text-foreground">{lead.locality}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-0.5">
                      Approximate Area
                    </span>
                    <p className="text-[14px] font-bold text-primary">
                      {lead.approximateArea} {lead.areaUnit}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-0.5">
                      Ownership Title
                    </span>
                    <p className="text-[13px] font-medium text-foreground">
                      {lead.ownershipStatus}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stated Interest & Quick Checklist Status Card */}
            <div className="bg-white rounded-[16px] p-5 border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-3">
              <h3 className="text-[14px] font-bold text-foreground border-b border-gray-100 pb-2.5">
                Stated Pooling Interest & Submission Details
              </h3>
              <p className="text-[13px] font-medium text-foreground bg-gray-50 p-3 rounded-lg border border-gray-200/60">
                {lead.poolingInterest || 'Open to Joint Land Pooling'}
              </p>
              {lead.notes && (
                <div>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                    Submitted Landowner Notes
                  </span>
                  <p className="text-[12px] text-gray-600 bg-[#FBFBFA] p-3 rounded-lg border border-gray-100 italic">
                    &ldquo;{lead.notes}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Verification Progress Widget */}
          <div className="space-y-6">
            <div className="bg-white rounded-[16px] p-5 border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                <h3 className="text-[14px] font-bold text-foreground">
                  Verification Progress
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {checkedCount} of {checklist.length} Completed
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${(checkedCount / checklist.length) * 100}%` }}
                />
              </div>

              <div className="space-y-2">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklist(item.id)}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer text-[12px] transition-colors"
                  >
                    <span
                      className={
                        item.checked
                          ? 'line-through text-gray-400'
                          : 'font-medium text-foreground'
                      }
                    >
                      {item.label}
                    </span>
                    {item.checked ? (
                      <CheckSquare size={16} className="text-emerald-600 shrink-0" />
                    ) : (
                      <Square size={16} className="text-gray-300 shrink-0" />
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('verification')}
                className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-[12px] font-semibold rounded-xl border border-gray-200 transition-colors"
              >
                Open Full Verification Checklist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VERIFICATION CHECKLIST */}
      {activeTab === 'verification' && (
        <div className="bg-white rounded-[16px] p-6 border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-[18px] font-bold text-foreground">
                Internal Verification Checklist
              </h3>
              <p className="text-[13px] text-gray-500 mt-0.5">
                Complete all due-diligence criteria before upgrading landowner to VERIFIED institutional grade.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[13px] font-bold text-foreground">
                Score: {checkedCount} / {checklist.length}
              </span>
              <button
                type="button"
                onClick={() => {
                  const allTrue = checklist.map((i) => ({ ...i, checked: true }));
                  setChecklist(allTrue);
                  localStorage.setItem(
                    `trinfra_checklist_${lead.id}`,
                    JSON.stringify(allTrue)
                  );
                }}
                className="text-[12px] font-semibold text-accent hover:underline cursor-pointer"
              >
                Check All
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {checklist.map((item, index) => (
              <div
                key={item.id}
                onClick={() => toggleChecklist(item.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                  item.checked
                    ? 'bg-emerald-50/40 border-emerald-200/80'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-mono">
                      STEP {index + 1}
                    </span>
                    <h4
                      className={`text-[14px] font-bold ${
                        item.checked ? 'text-emerald-950' : 'text-foreground'
                      }`}
                    >
                      {item.label}
                    </h4>
                  </div>
                  <p className="text-[13px] text-gray-500">{item.description}</p>
                </div>

                <div className="shrink-0 mt-1">
                  {item.checked ? (
                    <span className="inline-flex items-center gap-1 text-[12px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                      <CheckCircle2 size={14} /> Reviewed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                      <Clock size={13} /> Pending Review
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Callout */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[13px] text-gray-600">
              <ShieldCheck size={18} className="text-primary shrink-0" />
              <span>
                {isAllChecked
                  ? 'All 5 checklist requirements satisfied. Safe to finalize Verification.'
                  : `Please inspect the remaining ${checklist.length - checkedCount} criteria before approving.`}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setConfirmStatus('VERIFIED')}
              className={`px-4 py-2 rounded-xl text-[13px] font-bold shadow-xs transition-all cursor-pointer ${
                isAllChecked
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              Verify Landowner
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-[16px] p-6 border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-[18px] font-bold text-foreground">
                Document Repository
              </h3>
              <p className="text-[13px] text-gray-500 mt-0.5">
                Authenticated title deeds, patta, tax receipts, and survey sketches for {lead.fullName}.
              </p>
            </div>

            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1 self-start sm:self-auto">
              <ShieldCheck size={13} /> Private Local Storage
            </span>
          </div>

          {/* Upload Form Box */}
          <form
            onSubmit={handleUploadDoc}
            className="p-4 bg-gray-50 rounded-xl border border-gray-200/80 space-y-3"
          >
            <h4 className="font-bold text-[13px] text-foreground flex items-center gap-2">
              <Upload size={15} className="text-primary" />
              <span>Upload Landowner Document</span>
            </h4>

            {uploadError && (
              <p className="text-[12px] text-rose-600 font-medium">{uploadError}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  Document Type
                </label>
                <CustomSelect
                  value={uploadDocType}
                  onChange={(val) => setUploadDocType(val)}
                  options={[
                    { value: 'OWNERSHIP', label: 'Title Deed / Patta' },
                    { value: 'IDENTITY', label: 'Identity Proof' },
                    { value: 'LAND_RECORD', label: 'Land Tax Receipt / EC' },
                    { value: 'SURVEY', label: 'Survey Map / Sketch' },
                    { value: 'OTHER', label: 'Other Record' },
                  ]}
                  placeholder="Document Type"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  Select File (PDF, PNG, JPG)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="landownerDocInput"
                    className="w-full text-[12px] text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[12px] file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark cursor-pointer"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setUploadFile(e.target.files[0]);
                      }
                    }}
                    accept=".pdf,.png,.jpg,.jpeg,.webp"
                  />
                  <button
                    type="submit"
                    disabled={isUploading || !uploadFile}
                    className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-[12px] font-bold rounded-lg shadow-xs transition-all disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    {isUploading ? 'Uploading...' : 'Save File'}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Document List */}
          <div className="divide-y divide-gray-100">
            {lead.documents.length === 0 ? (
              <p className="text-[13px] text-gray-400 py-8 text-center">
                No documents uploaded for this landowner yet.
              </p>
            ) : (
              lead.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="py-3.5 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-foreground">
                        {doc.fileName}
                      </p>
                      <p className="text-[12px] text-gray-400">
                        {formatBytes(doc.fileSize)} • Type: {doc.documentType}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`/api/admin/documents/${doc.id}`}
                      download={doc.fileName}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-[12px] font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1 transition-colors"
                    >
                      <Download size={13} /> Download
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDeleteDoc(doc.id, doc.fileName)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: ADMIN NOTES */}
      {activeTab === 'notes' && (
        <div className="bg-white rounded-[16px] p-6 border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-[16px] font-bold text-foreground">
                Verification & Inspection History
              </h3>
              <p className="text-[12px] text-gray-400">
                Logged notes, clarifications, and verification audits for {lead.referenceNumber}
              </p>
            </div>
          </div>

          {/* Add Note Form */}
          <form onSubmit={handleAddNote} className="space-y-2 p-3 bg-gray-50 rounded-xl border border-gray-200/60">
            <textarea
              rows={2}
              required
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Log verification inspection note, revenue cross-check or landowner discussion..."
              className="w-full p-2.5 bg-white rounded-lg border border-gray-200 text-[13px] text-foreground outline-none focus:border-primary resize-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isAddingNote || !newNoteContent.trim()}
                className="px-3.5 py-1.5 bg-primary text-white text-[12px] font-bold rounded-lg flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <Send size={12} />
                <span>{isAddingNote ? 'Saving...' : 'Post Admin Note'}</span>
              </button>
            </div>
          </form>

          {/* Notes List */}
          <div className="space-y-3">
            {lead.adminNotes.length === 0 ? (
              <p className="text-[13px] text-gray-400 py-6 text-center">
                No internal notes recorded yet.
              </p>
            ) : (
              lead.adminNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-3.5 rounded-xl bg-gray-50/80 border border-gray-100 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-bold text-foreground">
                      {note.authorName} ({note.authorRole})
                    </span>
                    <span className="text-gray-400 text-[11px]">
                      {new Date(note.createdAt).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-[13px] text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {note.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* CONFIRM VERIFICATION MODAL */}
      {confirmStatus === 'VERIFIED' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <ShieldCheck size={26} />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-bold text-[18px] text-foreground">
                Confirm Landowner Verification
              </h3>
              <p className="text-[13px] text-gray-500">
                Are you sure you want to mark{' '}
                <strong className="text-foreground">{lead.fullName}</strong> as{' '}
                <strong className="text-emerald-700">VERIFIED</strong>?
              </p>
              <p className="text-[12px] text-gray-400">
                Current Checklist status: {checkedCount} of {checklist.length} items reviewed.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmStatus(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-[13px] font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => updateStatus('VERIFIED', 'Verification approved by Admin coordinator.')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-bold shadow-xs transition-all cursor-pointer"
              >
                <CheckCircle2 size={14} />
                <span>Confirm Verification</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REQUEST CLARIFICATION MODAL */}
      {clarificationModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <HelpCircle size={18} />
              </div>
              <h3 className="font-bold text-[17px] text-foreground">
                Clarification Required
              </h3>
            </div>

            <p className="text-[13px] text-gray-500">
              Specify what clarification is needed from the landowner (e.g., missing survey sketch, title discrepancy, or boundary confirmation). This will be logged in the admin history.
            </p>

            <textarea
              rows={3}
              value={clarificationReason}
              onChange={(e) => setClarificationReason(e.target.value)}
              placeholder="E.g. Resubmission of Encumbrance Certificate required due to illegible scan..."
              className="w-full bg-[#F8F9FA] focus:bg-white border border-gray-200 focus:border-primary/40 focus:ring-2 focus:ring-primary/10 rounded-xl p-3 text-[13px] text-foreground outline-none transition-all resize-none"
            />

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setClarificationModal(false)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-[13px] font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!clarificationReason.trim()}
                onClick={() =>
                  updateStatus(
                    'NEEDS_CLARIFICATION',
                    `Clarification Required: ${clarificationReason.trim()}`
                  )
                }
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-bold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                Set Needs Clarification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectionModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <XCircle size={18} />
              </div>
              <h3 className="font-bold text-[17px] text-foreground">
                Reject Landowner Registration
              </h3>
            </div>

            <p className="text-[13px] text-gray-500">
              Please enter an internal reason for rejection (e.g. active litigation, land parcel does not qualify for pooling scheme). The record will be kept in admin history.
            </p>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="E.g. Ineligible due to environmental zoning restrictions..."
              className="w-full bg-[#F8F9FA] focus:bg-white border border-gray-200 focus:border-primary/40 focus:ring-2 focus:ring-primary/10 rounded-xl p-3 text-[13px] text-foreground outline-none transition-all resize-none"
            />

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setRejectionModal(false)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-[13px] font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!rejectionReason.trim()}
                onClick={() =>
                  updateStatus('REJECTED', `Rejection Reason: ${rejectionReason.trim()}`)
                }
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[13px] font-bold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="font-heading font-bold text-[17px] text-foreground">
                  Confirm Landowner Deletion
                </h3>
                <span className="text-xs text-red-600 font-semibold">PostgreSQL Server Mutation</span>
              </div>
            </div>

            <p className="text-[13px] text-gray-600 leading-relaxed">
              Are you sure you want to permanently delete registration{' '}
              <strong className="text-foreground font-semibold">
                &quot;{lead.referenceNumber}&quot;
              </strong>{' '}
              ({lead.fullName})?
            </p>
            <p className="text-[12px] text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200">
              This will permanently remove the landowner, parcels, uploaded documents, and internal audit notes from Supabase PostgreSQL.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setDeleteModal(false)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-[13px] font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteLead}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[13px] font-bold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {isDeleting && <Loader2 size={15} className="animate-spin" />}
                Yes, Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
