'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  FileText,
  Upload,
  Search,
  X,
  Eye,
  Download,
  Trash2,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import CustomSelect, { SelectOption } from '@/components/opportunities/CustomSelect';

interface DocumentRecord {
  id: string;
  landownerId?: string | null;
  landowner?: {
    id: string;
    referenceNumber: string;
    fullName: string;
    phone: string;
    district: string;
  } | null;
  documentType: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  verificationStatus: string; // PENDING_REVIEW | REVIEWED | VERIFIED | REJECTED | FLAGGED
  uploadedAt: string;
}

interface LandownerOption {
  id: string;
  referenceNumber: string;
  fullName: string;
}

const STATUS_FILTER_OPTIONS: SelectOption[] = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'PENDING_REVIEW', label: 'Pending Review' },
  { value: 'REVIEWED', label: 'Reviewed' },
  { value: 'VERIFIED', label: 'Verified' },
  { value: 'REJECTED', label: 'Rejected' },
];

const TYPE_FILTER_OPTIONS: SelectOption[] = [
  { value: 'ALL', label: 'All Document Types' },
  { value: 'IDENTITY', label: 'Identity Proof' },
  { value: 'OWNERSHIP', label: 'Title Deed / Ownership' },
  { value: 'LAND_RECORD', label: 'Tax / Land Record' },
  { value: 'SURVEY', label: 'Survey Sketch / Map' },
  { value: 'OTHER', label: 'Other Support Record' },
];

const UPLOAD_TYPE_OPTIONS: SelectOption[] = [
  { value: 'IDENTITY', label: 'Identity Proof (Aadhaar / Voter / Passport)' },
  { value: 'OWNERSHIP', label: 'Ownership / Title Deed (Aadhaar / Patta / Deed)' },
  { value: 'LAND_RECORD', label: 'Land Record (Tax Receipt / EC)' },
  { value: 'SURVEY', label: 'Survey Sketch / Field Measurement Map' },
  { value: 'OTHER', label: 'Other Supporting Document' },
];

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'PENDING_REVIEW', label: 'Pending Review' },
  { value: 'REVIEWED', label: 'Reviewed' },
  { value: 'VERIFIED', label: 'Verified' },
  { value: 'REJECTED', label: 'Rejected' },
];

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getStatusBadge(status: string) {
  switch (status?.toUpperCase()) {
    case 'VERIFIED':
      return { label: 'Verified', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
    case 'REVIEWED':
      return { label: 'Reviewed', color: 'bg-blue-50 text-blue-800 border-blue-200' };
    case 'REJECTED':
    case 'FLAGGED':
      return { label: 'Rejected', color: 'bg-rose-50 text-rose-800 border-rose-200' };
    case 'PENDING_REVIEW':
    default:
      return { label: 'Pending Review', color: 'bg-amber-50 text-amber-800 border-amber-200' };
  }
}

function formatDocType(type: string) {
  switch (type?.toUpperCase()) {
    case 'IDENTITY':
      return 'Identity';
    case 'OWNERSHIP':
      return 'Ownership';
    case 'LAND_RECORD':
      return 'Land Record';
    case 'SURVEY':
      return 'Survey Sketch';
    default:
      return type || 'Other';
  }
}

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [landowners, setLandowners] = useState<LandownerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentRecord | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<DocumentRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Upload form state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLandownerId, setUploadLandownerId] = useState('');
  const [uploadDocType, setUploadDocType] = useState('OWNERSHIP');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Load documents
  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/documents');
      if (!res.ok) throw new Error('Failed to fetch documents from database');
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Database connection error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load landowners list for upload dropdown
  useEffect(() => {
    const fetchLandowners = async () => {
      try {
        const res = await fetch('/api/admin/landowners');
        if (res.ok) {
          const data = await res.json();
          if (data.landowners) {
            setLandowners(
              data.landowners.map((lo: { id: string; referenceNumber: string; fullName: string }) => ({
                id: lo.id,
                referenceNumber: lo.referenceNumber,
                fullName: lo.fullName,
              }))
            );
          }
        }
      } catch (e) {
        console.warn('Could not fetch landowners for upload select', e);
      }
    };

    fetchLandowners();
    loadDocuments();
  }, [loadDocuments]);

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          doc.fileName.toLowerCase().includes(q) ||
          doc.landowner?.fullName?.toLowerCase().includes(q) ||
          doc.landowner?.referenceNumber?.toLowerCase().includes(q) ||
          doc.documentType.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (statusFilter !== 'ALL' && doc.verificationStatus !== statusFilter) {
        return false;
      }

      if (typeFilter !== 'ALL' && doc.documentType !== typeFilter) {
        return false;
      }

      return true;
    });
  }, [documents, searchQuery, statusFilter, typeFilter]);

  // Overview Counts
  const counts = useMemo(() => {
    return {
      total: documents.length,
      pending: documents.filter((d) => d.verificationStatus === 'PENDING_REVIEW').length,
      verified: documents.filter((d) => d.verificationStatus === 'VERIFIED').length,
      rejected: documents.filter(
        (d) => d.verificationStatus === 'REJECTED' || d.verificationStatus === 'FLAGGED'
      ).length,
    };
  }, [documents]);

  // Handle status update
  const handleUpdateStatus = async (docId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/documents/${docId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationStatus: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        const updatedDoc = data.document;
        setDocuments((prev) =>
          prev.map((d) => (d.id === docId ? (updatedDoc || { ...d, verificationStatus: newStatus }) : d))
        );
        if (previewDoc?.id === docId) {
          setPreviewDoc((prev) => (prev ? (updatedDoc || { ...prev, verificationStatus: newStatus }) : null));
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Handle document upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('Please select a file to upload');
      return;
    }

    if (uploadFile.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds 10MB limit');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('documentType', uploadDocType);
    if (uploadLandownerId) {
      formData.append('landownerId', uploadLandownerId);
    }

    try {
      const res = await fetch('/api/admin/documents', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Upload failed');
      }

      const data = await res.json();
      setDocuments((prev) => [data.document, ...prev]);
      setIsUploadOpen(false);
      setUploadFile(null);
      setUploadLandownerId('');
      setUploadDocType('OWNERSHIP');
    } catch (err: unknown) {
      console.error('Upload error:', err);
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle delete document
  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/documents/${deleteCandidate.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== deleteCandidate.id));
        if (previewDoc?.id === deleteCandidate.id) setPreviewDoc(null);
        setDeleteCandidate(null);
      }
    } catch (err) {
      console.error('Failed to delete document:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-gray-500 hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] md:text-[30px] font-heading font-extrabold text-foreground tracking-tight">
            Document Repository
          </h1>
          <p className="text-[14px] text-gray-500 mt-0.5">
            Encrypted private local storage for title deeds, revenue sketches, and registration records.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={loadDocuments}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:text-foreground hover:border-gray-300 text-[13px] font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-[13px] font-bold shadow-sm transition-all cursor-pointer"
          >
            <Upload size={16} />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Total Documents
          </p>
          <p className="text-[24px] font-extrabold text-foreground mt-1">
            {counts.total}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-100/80 shadow-xs">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-600">
            Pending Review
          </p>
          <p className="text-[24px] font-extrabold text-amber-800 mt-1">
            {counts.pending}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-100/80 shadow-xs">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">
            Verified Records
          </p>
          <p className="text-[24px] font-extrabold text-emerald-800 mt-1">
            {counts.verified}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-rose-100/80 shadow-xs">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-600">
            Rejected / Flagged
          </p>
          <p className="text-[24px] font-extrabold text-rose-800 mt-1">
            {counts.rejected}
          </p>
        </div>
      </div>

      {/* Search & Custom Filter Bar */}
      <div className="bg-white rounded-[16px] p-4 md:p-5 border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by file name, landowner name, reference or document type..."
            className="w-full bg-[#F8F9FA] focus:bg-white border border-gray-200 focus:border-primary/40 focus:ring-2 focus:ring-primary/10 rounded-xl pl-10 pr-4 py-2.5 text-[14px] text-foreground placeholder:text-gray-400 outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
          {/* Status Filter */}
          <div>
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">
              Verification Status
            </label>
            <CustomSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={STATUS_FILTER_OPTIONS}
              placeholder="All Statuses"
            />
          </div>

          {/* Type Filter */}
          <div>
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">
              Document Type
            </label>
            <CustomSelect
              value={typeFilter}
              onChange={setTypeFilter}
              options={TYPE_FILTER_OPTIONS}
              placeholder="All Document Types"
            />
          </div>
        </div>

        {(searchQuery || statusFilter !== 'ALL' || typeFilter !== 'ALL') && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[12px]">
            <span className="text-gray-500">
              Showing <strong>{filteredDocuments.length}</strong> matching files
            </span>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setTypeFilter('ALL');
              }}
              className="font-semibold text-accent hover:underline flex items-center gap-1 cursor-pointer"
            >
              <X size={13} /> Reset filters
            </button>
          </div>
        )}
      </div>

      {/* Documents Table / Grid */}
      <div className="bg-white rounded-[16px] border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-gray-400 text-[14px]">
            <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-primary" />
            Loading documents from database...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600 bg-rose-50/50">
            <p className="font-semibold">{error}</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-[14px]">
            <FileText size={32} className="mx-auto mb-2 text-gray-300" />
            <p className="font-semibold text-foreground">No documents found</p>
            <p className="text-[13px] text-gray-500 mt-1">
              Upload a document or change your search criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">File Name</th>
                  <th className="py-3.5 px-4">Document Type</th>
                  <th className="py-3.5 px-4">Associated Landowner</th>
                  <th className="py-3.5 px-4">Size</th>
                  <th className="py-3.5 px-4">Upload Date</th>
                  <th className="py-3.5 px-4">Verification Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[13px]">
                {filteredDocuments.map((doc) => {
                  const badge = getStatusBadge(doc.verificationStatus);
                  return (
                    <tr key={doc.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-foreground">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                            <FileText size={16} />
                          </div>
                          <span className="truncate max-w-xs">{doc.fileName}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700">
                          {formatDocType(doc.documentType)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {doc.landowner ? (
                          <div>
                            <p className="font-bold text-foreground">
                              {doc.landowner.fullName}
                            </p>
                            <Link
                              href={`/admin/landowners/${doc.landowner.id}`}
                              className="font-mono text-[11px] text-accent hover:underline block"
                            >
                              {doc.landowner.referenceNumber}
                            </Link>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Unassigned</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-gray-500 font-mono text-[12px]">
                        {formatBytes(doc.fileSize)}
                      </td>

                      <td className="py-3.5 px-4 text-gray-500 text-[12px]">
                        {doc.uploadedAt
                          ? new Date(doc.uploadedAt).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'Recently'}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View in modal */}
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(doc)}
                            title="View / Inspect"
                            className="p-1.5 rounded-lg text-gray-500 hover:text-foreground hover:bg-gray-100 transition-colors cursor-pointer"
                          >
                            <Eye size={15} />
                          </button>

                          {/* Authenticated Download */}
                          <a
                            href={`/api/admin/documents/${doc.id}`}
                            download={doc.fileName}
                            title="Download Document"
                            className="p-1.5 rounded-lg text-gray-500 hover:text-primary hover:bg-gray-100 transition-colors cursor-pointer"
                          >
                            <Download size={15} />
                          </a>

                          {/* Delete with confirmation */}
                          <button
                            type="button"
                            onClick={() => setDeleteCandidate(doc)}
                            title="Delete Document"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* UPLOAD MODAL */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-[#FBFBFA]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Upload size={16} />
                </div>
                <h3 className="font-bold text-[16px] text-foreground">
                  Upload Private Document
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadOpen(false)}
                className="p-1.5 text-gray-400 hover:text-foreground rounded-lg hover:bg-gray-200/60"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-5 space-y-4 text-[13px]">
              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[12px] flex items-center gap-2">
                  <AlertTriangle size={15} className="shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Landowner Select */}
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  Assign to Landowner (Optional)
                </label>
                <CustomSelect
                  value={uploadLandownerId}
                  onChange={setUploadLandownerId}
                  options={[
                    { value: '', label: 'None / General Archive' },
                    ...landowners.map((lo) => ({
                      value: lo.id,
                      label: `${lo.fullName} (${lo.referenceNumber})`,
                    })),
                  ]}
                  placeholder="Select Landowner..."
                />
              </div>

              {/* Document Type */}
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  Document Classification
                </label>
                <CustomSelect
                  value={uploadDocType}
                  onChange={setUploadDocType}
                  options={UPLOAD_TYPE_OPTIONS}
                />
              </div>

              {/* File Input */}
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  Document File (PDF, JPG, PNG — Max 10MB)
                </label>
                <div className="mt-1 border-2 border-dashed border-gray-200 hover:border-primary/50 rounded-xl p-5 text-center transition-colors">
                  <input
                    type="file"
                    id="docFileInput"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setUploadFile(e.target.files[0]);
                      }
                    }}
                    accept=".pdf,.png,.jpg,.jpeg,.webp"
                  />
                  <label
                    htmlFor="docFileInput"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <FileText size={28} className="text-gray-400" />
                    <span className="text-[13px] font-semibold text-primary">
                      {uploadFile ? uploadFile.name : 'Click to browse file'}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {uploadFile ? `${formatBytes(uploadFile.size)} selected` : 'Stored securely in private local disk'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-[13px] font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !uploadFile}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-[13px] font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={14} />
                      <span>Upload to Storage</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW / INSPECT MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-[#FBFBFA]">
              <div>
                <h3 className="font-bold text-[16px] text-foreground flex items-center gap-2">
                  <FileText size={18} className="text-red-500" />
                  <span>{previewDoc.fileName}</span>
                </h3>
                <p className="text-[12px] text-gray-400 mt-0.5">
                  Private Document ID: {previewDoc.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 text-gray-400 hover:text-foreground rounded-lg hover:bg-gray-200/60"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5 text-[13px]">
              {/* Document details grid */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div>
                  <span className="text-[11px] text-gray-400 block uppercase font-semibold">Document Type</span>
                  <span className="font-bold text-foreground text-[14px]">
                    {formatDocType(previewDoc.documentType)}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-gray-400 block uppercase font-semibold">File Size</span>
                  <span className="font-bold text-foreground text-[14px]">
                    {formatBytes(previewDoc.fileSize)}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-gray-400 block uppercase font-semibold">Landowner</span>
                  {previewDoc.landowner ? (
                    <span className="font-semibold text-primary">
                      {previewDoc.landowner.fullName} ({previewDoc.landowner.referenceNumber})
                    </span>
                  ) : (
                    <span className="text-gray-500">Unassigned / General</span>
                  )}
                </div>

                <div>
                  <span className="text-[11px] text-gray-400 block uppercase font-semibold">Uploaded</span>
                  <span className="text-gray-700">
                    {previewDoc.uploadedAt ? new Date(previewDoc.uploadedAt).toLocaleString('en-GB') : 'Recently'}
                  </span>
                </div>
              </div>

              {/* Status Updater */}
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                  Update Verification Status
                </label>
                <CustomSelect
                  value={previewDoc.verificationStatus}
                  onChange={(val) => handleUpdateStatus(previewDoc.id, val)}
                  options={STATUS_OPTIONS}
                />
              </div>

              {/* Security Banner */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-[12px] flex items-center gap-2">
                <ShieldCheck size={16} className="shrink-0 text-emerald-600" />
                <span>
                  Protected file. Accessible solely through authenticated administrator session token.
                </span>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-[#FBFBFA] flex items-center justify-between">
              <a
                href={`/api/admin/documents/${previewDoc.id}`}
                download={previewDoc.fileName}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-[13px] font-bold shadow-xs transition-all"
              >
                <Download size={14} />
                <span>Download File</span>
              </a>

              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-[13px] font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden p-6 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-[17px] text-foreground">
                Delete Document?
              </h3>
              <p className="text-[13px] text-gray-500">
                Are you sure you want to permanently delete{' '}
                <strong className="text-foreground">{deleteCandidate.fileName}</strong>?
                This removes the physical file from local storage and unlinks it from the database.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-[13px] font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-bold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
