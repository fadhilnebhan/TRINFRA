'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  X,
  Eye,
  ArrowLeft,
  Mail,
  Phone,
  Send,
  MessageSquare,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Trash2,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import CustomSelect, { SelectOption } from '@/components/opportunities/CustomSelect';

interface AdminNote {
  id: string;
  authorName: string;
  authorRole: string;
  content: string;
  createdAt: string;
}

interface EnquiryRecord {
  id: string;
  referenceNumber: string;
  fullName: string;
  company: string;
  email: string;
  phone: string;
  preferredContactMethod?: string;
  role: string;
  interestType?: string;
  investmentRange?: string;
  preferredLocation?: string;
  message: string;
  opportunityId?: string;
  opportunity?: {
    id: string;
    title: string;
    location: string;
  } | null;
  projectId?: string;
  project?: {
    id: string;
    title: string;
    district: string;
  } | null;
  status: string; // NEW | CONTACTED | QUALIFIED | FOLLOW_UP | CLOSED | REJECTED
  priority: string; // LOW | NORMAL | HIGH
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
  adminNotes?: AdminNote[];
}

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'ALL', label: 'All Status' },
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'QUALIFIED', label: 'Qualified' },
  { value: 'FOLLOW_UP', label: 'Follow-up' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'REJECTED', label: 'Rejected' },
];

const PRIORITY_OPTIONS: SelectOption[] = [
  { value: 'ALL', label: 'All Priorities' },
  { value: 'LOW', label: 'Low Priority' },
  { value: 'NORMAL', label: 'Normal Priority' },
  { value: 'HIGH', label: 'High Priority' },
];

const INTEREST_OPTIONS: SelectOption[] = [
  { value: 'ALL', label: 'All Interests' },
  { value: 'Development Opportunity', label: 'Development Opportunity' },
  { value: 'Investment Opportunity', label: 'Investment Opportunity' },
  { value: 'Joint Development', label: 'Joint Development' },
  { value: 'Land Pooling Partnership', label: 'Land Pooling Partnership' },
  { value: 'Other', label: 'Other' },
];

function formatStatus(status: string) {
  switch (status?.toUpperCase()) {
    case 'NEW':
      return { label: 'New', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
    case 'CONTACTED':
      return { label: 'Contacted', color: 'bg-blue-50 text-blue-800 border-blue-200' };
    case 'QUALIFIED':
      return { label: 'Qualified', color: 'bg-purple-50 text-purple-800 border-purple-200' };
    case 'FOLLOW_UP':
      return { label: 'Follow-up', color: 'bg-amber-50 text-amber-800 border-amber-200' };
    case 'CLOSED':
      return { label: 'Closed', color: 'bg-gray-100 text-gray-700 border-gray-300' };
    case 'REJECTED':
      return { label: 'Rejected', color: 'bg-rose-50 text-rose-800 border-rose-200' };
    default:
      return { label: status || 'Unknown', color: 'bg-gray-50 text-gray-700 border-gray-200' };
  }
}

function formatPriority(priority: string) {
  switch (priority?.toUpperCase()) {
    case 'HIGH':
      return { label: 'High', color: 'bg-rose-50 text-rose-700 border-rose-200' };
    case 'NORMAL':
      return { label: 'Normal', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'LOW':
      return { label: 'Low', color: 'bg-gray-100 text-gray-600 border-gray-200' };
    default:
      return { label: priority || 'Normal', color: 'bg-gray-100 text-gray-600 border-gray-200' };
  }
}

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [interestFilter, setInterestFilter] = useState('ALL');

  // Selected enquiry for detail drawer
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryRecord | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [deletingEnquiry, setDeletingEnquiry] = useState<EnquiryRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch enquiries
  const loadEnquiries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/enquiries');
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to fetch enquiries`);
      }
      const data = await res.json();
      setEnquiries(data.enquiries || []);
      // If an enquiry is selected, sync it
      if (selectedEnquiry) {
        const found = (data.enquiries || []).find((e: EnquiryRecord) => e.id === selectedEnquiry.id);
        if (found) setSelectedEnquiry(found);
      }
    } catch (err: unknown) {
      console.error('Error fetching enquiries:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to enquiries API');
    } finally {
      setLoading(false);
    }
  }, [selectedEnquiry]);

  useEffect(() => {
    loadEnquiries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async () => {
    if (!deletingEnquiry) return;
    setIsDeleting(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/enquiries/${deletingEnquiry.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete enquiry');

      setFeedback({
        type: 'success',
        message: `Enquiry ${deletingEnquiry.referenceNumber} (${deletingEnquiry.fullName}) was deleted successfully from PostgreSQL.`,
      });
      if (selectedEnquiry?.id === deletingEnquiry.id) {
        setSelectedEnquiry(null);
      }
      setDeletingEnquiry(null);
      await loadEnquiries();
    } catch (err: unknown) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Failed to delete enquiry' });
    } finally {
      setIsDeleting(false);
    }
  };

  // Summary counts
  const summaryCounts = useMemo(() => {
    return {
      total: enquiries.length,
      new: enquiries.filter((e) => e.status === 'NEW').length,
      contacted: enquiries.filter((e) => e.status === 'CONTACTED').length,
      qualified: enquiries.filter((e) => e.status === 'QUALIFIED').length,
      followUp: enquiries.filter((e) => e.status === 'FOLLOW_UP').length,
      closed: enquiries.filter((e) => e.status === 'CLOSED').length,
    };
  }, [enquiries]);

  // Filtered list
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((enq) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          enq.fullName?.toLowerCase().includes(q) ||
          enq.company?.toLowerCase().includes(q) ||
          enq.email?.toLowerCase().includes(q) ||
          enq.phone?.toLowerCase().includes(q) ||
          enq.referenceNumber?.toLowerCase().includes(q) ||
          enq.opportunity?.title?.toLowerCase().includes(q) ||
          enq.project?.title?.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Status
      if (statusFilter !== 'ALL' && enq.status !== statusFilter) {
        return false;
      }

      // Priority
      if (priorityFilter !== 'ALL' && enq.priority !== priorityFilter) {
        return false;
      }

      // Interest
      if (interestFilter !== 'ALL') {
        const interest = enq.interestType || '';
        if (interestFilter === 'Other') {
          if (interest.toLowerCase().includes('development') || interest.toLowerCase().includes('investment')) {
            return false;
          }
        } else if (!interest.toLowerCase().includes(interestFilter.toLowerCase().replace(' opportunity', ''))) {
          return false;
        }
      }

      return true;
    });
  }, [enquiries, searchQuery, statusFilter, priorityFilter, interestFilter]);

  // Handle status update
  const handleStatusChange = async (enquiryId: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/enquiries/${enquiryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        setEnquiries((prev) =>
          prev.map((e) => (e.id === enquiryId ? { ...e, ...data.enquiry } : e))
        );
        if (selectedEnquiry?.id === enquiryId) {
          setSelectedEnquiry((prev) => (prev ? { ...prev, ...data.enquiry } : null));
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle priority update
  const handlePriorityChange = async (enquiryId: string, newPriority: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/enquiries/${enquiryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: newPriority }),
      });
      if (res.ok) {
        const data = await res.json();
        setEnquiries((prev) =>
          prev.map((e) => (e.id === enquiryId ? { ...e, ...data.enquiry } : e))
        );
        if (selectedEnquiry?.id === enquiryId) {
          setSelectedEnquiry((prev) => (prev ? { ...prev, ...data.enquiry } : null));
        }
      }
    } catch (err) {
      console.error('Failed to update priority:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Add internal note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiry || !newNoteContent.trim()) return;

    setIsAddingNote(true);
    try {
      const res = await fetch(`/api/admin/enquiries/${selectedEnquiry.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newNoteContent.trim(),
          authorRole: 'Institutional Relations',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const updatedNotes = [data.note, ...(selectedEnquiry.adminNotes || [])];
        const updatedEnquiry = { ...selectedEnquiry, adminNotes: updatedNotes };
        setSelectedEnquiry(updatedEnquiry);
        setEnquiries((prev) =>
          prev.map((item) => (item.id === selectedEnquiry.id ? updatedEnquiry : item))
        );
        setNewNoteContent('');
      }
    } catch (err) {
      console.error('Failed to add note:', err);
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setInterestFilter('ALL');
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    statusFilter !== 'ALL' ||
    priorityFilter !== 'ALL' ||
    interestFilter !== 'ALL';

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

      {/* Page Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] md:text-[30px] font-heading font-extrabold text-foreground tracking-tight">
            Developer & Investor Enquiries
          </h1>
          <p className="text-[14px] text-gray-500 mt-0.5">
            Institutional lead pipeline, expression of interest matching, and status management.
          </p>
        </div>

        <button
          type="button"
          onClick={loadEnquiries}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:text-foreground hover:border-gray-300 text-[13px] font-semibold shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-[14px] font-medium border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={18} className="text-red-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Total Enquiries
          </p>
          <p className="text-[24px] font-extrabold text-foreground mt-1">
            {summaryCounts.total}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-100/80 shadow-xs">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">
            New
          </p>
          <p className="text-[24px] font-extrabold text-emerald-800 mt-1">
            {summaryCounts.new}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-blue-100/80 shadow-xs">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-600">
            Contacted
          </p>
          <p className="text-[24px] font-extrabold text-blue-800 mt-1">
            {summaryCounts.contacted}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-purple-100/80 shadow-xs">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-purple-600">
            Qualified
          </p>
          <p className="text-[24px] font-extrabold text-purple-800 mt-1">
            {summaryCounts.qualified}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-100/80 shadow-xs">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-600">
            Follow-up
          </p>
          <p className="text-[24px] font-extrabold text-amber-800 mt-1">
            {summaryCounts.followUp}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Closed
          </p>
          <p className="text-[24px] font-extrabold text-gray-700 mt-1">
            {summaryCounts.closed}
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
            placeholder="Search by name, company, email, phone, reference, opportunity or project..."
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          {/* Status Filter */}
          <div>
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">
              Status Filter
            </label>
            <CustomSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={STATUS_OPTIONS}
              placeholder="All Status"
            />
          </div>

          {/* Priority Filter */}
          <div>
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">
              Priority Filter
            </label>
            <CustomSelect
              value={priorityFilter}
              onChange={setPriorityFilter}
              options={PRIORITY_OPTIONS}
              placeholder="All Priorities"
            />
          </div>

          {/* Interest Filter */}
          <div>
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">
              Interest Type
            </label>
            <CustomSelect
              value={interestFilter}
              onChange={setInterestFilter}
              options={INTEREST_OPTIONS}
              placeholder="All Interests"
            />
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[12px]">
            <span className="text-gray-500">
              Showing <strong>{filteredEnquiries.length}</strong> matching enquiries
            </span>
            <button
              type="button"
              onClick={handleResetFilters}
              className="font-semibold text-accent hover:underline flex items-center gap-1"
            >
              <X size={13} /> Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area: Enquiries Table / Mobile List */}
      <div className="bg-white rounded-[16px] border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-gray-400 text-[14px]">
            <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-primary" />
            Loading enquiries from database...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600 bg-rose-50/50">
            <AlertCircle size={24} className="mx-auto mb-2 text-rose-500" />
            <p className="font-semibold">{error}</p>
            <button
              onClick={loadEnquiries}
              className="mt-3 text-[12px] font-bold text-primary underline"
            >
              Retry Connection
            </button>
          </div>
        ) : filteredEnquiries.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-[14px]">
            <MessageSquare size={32} className="mx-auto mb-2 text-gray-300" />
            <p className="font-semibold text-foreground">No enquiries found</p>
            <p className="text-[13px] text-gray-500 mt-1">
              {hasActiveFilters
                ? 'Try broadening your search or clearing active filters.'
                : 'No institutional developer or investor enquiries have been received yet.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Reference</th>
                    <th className="py-3.5 px-4">Name</th>
                    <th className="py-3.5 px-4">Company</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Interest / Target</th>
                    <th className="py-3.5 px-4">Priority</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Submitted</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-[13px]">
                  {filteredEnquiries.map((enq) => {
                    const statusBadge = formatStatus(enq.status);
                    const priorityBadge = formatPriority(enq.priority);
                    const target = enq.opportunity?.title || enq.project?.title || 'General Enquiry';

                    return (
                      <tr
                        key={enq.id}
                        className="hover:bg-gray-50/70 transition-colors cursor-pointer"
                        onClick={() => setSelectedEnquiry(enq)}
                      >
                        <td className="py-3.5 px-4 font-mono font-semibold text-foreground text-[12px]">
                          {enq.referenceNumber}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-foreground">
                          {enq.fullName}
                        </td>
                        <td className="py-3.5 px-4 text-gray-600 font-medium">
                          {enq.company || '—'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              enq.role?.toLowerCase() === 'investor'
                                ? 'bg-accent/15 text-[#8A6A32]'
                                : 'bg-[#0E2115]/10 text-primary'
                            }`}
                          >
                            {enq.role === 'investor' ? 'Investor' : 'Developer'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-gray-600 max-w-[200px] truncate" title={target}>
                          {target}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${priorityBadge.color}`}
                          >
                            {priorityBadge.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusBadge.color}`}
                          >
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-gray-500 text-[12px]">
                          {enq.createdAt ? new Date(enq.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent'}
                        </td>
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedEnquiry(enq)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-primary hover:text-white text-gray-700 text-[12px] font-semibold transition-colors cursor-pointer"
                            >
                              <Eye size={13} />
                              <span>View</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingEnquiry(enq)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete Enquiry"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Presentation */}
            <div className="block md:hidden divide-y divide-gray-100">
              {filteredEnquiries.map((enq) => {
                const statusBadge = formatStatus(enq.status);
                const priorityBadge = formatPriority(enq.priority);
                const target = enq.opportunity?.title || enq.project?.title || 'General Enquiry';

                return (
                  <div
                    key={enq.id}
                    onClick={() => setSelectedEnquiry(enq)}
                    className="p-4 space-y-2 hover:bg-gray-50/80 active:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[12px] font-semibold text-foreground">
                        {enq.referenceNumber}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadge.color}`}
                      >
                        {statusBadge.label}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-[15px] text-foreground">
                        {enq.fullName}
                      </h4>
                      {enq.company && (
                        <p className="text-[12px] text-gray-500">{enq.company}</p>
                      )}
                    </div>

                    <div className="text-[12px] text-gray-600">
                      <span className="text-gray-400">Target: </span>
                      <span className="font-medium">{target}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-gray-400">
                      <span>
                        {enq.createdAt ? new Date(enq.createdAt).toLocaleDateString('en-GB') : 'Recent'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold border ${priorityBadge.color}`}
                        >
                          {priorityBadge.label} Priority
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingEnquiry(enq);
                          }}
                          className="p-1 rounded-md text-red-600 hover:bg-red-50 border border-red-200"
                          title="Delete Enquiry"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Enquiry Detail Drawer / Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div
            className="w-full max-w-[560px] bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-250"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-[#FBFBFA]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-foreground text-[14px]">
                    {selectedEnquiry.referenceNumber}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                      formatStatus(selectedEnquiry.status).color
                    }`}
                  >
                    {formatStatus(selectedEnquiry.status).label}
                  </span>
                </div>
                <p className="text-[12px] text-gray-500 mt-0.5">
                  Submitted on {selectedEnquiry.createdAt ? new Date(selectedEnquiry.createdAt).toLocaleString('en-GB') : 'Recently'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                className="p-2 text-gray-400 hover:text-foreground rounded-lg hover:bg-gray-200/60 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 text-[13px]">
              {/* Quick Actions (Status & Priority changers) */}
              <div className="bg-[#F8F9FA] p-4 rounded-xl border border-gray-200/80 space-y-3">
                <h4 className="font-bold text-[12px] uppercase tracking-wider text-gray-500">
                  Manage Status & Priority
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 block mb-1">
                      Update Status
                    </label>
                    <CustomSelect
                      size="sm"
                      value={selectedEnquiry.status}
                      onChange={(val) => handleStatusChange(selectedEnquiry.id, val)}
                      options={STATUS_OPTIONS.filter((o) => o.value !== 'ALL')}
                      disabled={isUpdating}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 block mb-1">
                      Set Priority
                    </label>
                    <CustomSelect
                      size="sm"
                      value={selectedEnquiry.priority}
                      onChange={(val) => handlePriorityChange(selectedEnquiry.id, val)}
                      options={PRIORITY_OPTIONS.filter((o) => o.value !== 'ALL')}
                      disabled={isUpdating}
                    />
                  </div>
                </div>
              </div>

              {/* Lead Information */}
              <div className="space-y-3">
                <h4 className="font-bold text-[12px] uppercase tracking-wider text-gray-500">
                  Contact Information
                </h4>
                <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-gray-100">
                  <div>
                    <span className="text-[11px] text-gray-400 block">Full Name</span>
                    <span className="font-bold text-foreground text-[14px]">
                      {selectedEnquiry.fullName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-400 block">Company / Entity</span>
                    <span className="font-medium text-foreground">
                      {selectedEnquiry.company || 'Not Specified'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-400 block">Email Address</span>
                    <a
                      href={`mailto:${selectedEnquiry.email}`}
                      className="font-medium text-primary hover:underline flex items-center gap-1"
                    >
                      <Mail size={12} /> {selectedEnquiry.email}
                    </a>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-400 block">Phone Number</span>
                    <a
                      href={`tel:${selectedEnquiry.phone}`}
                      className="font-medium text-primary hover:underline flex items-center gap-1"
                    >
                      <Phone size={12} /> {selectedEnquiry.phone}
                    </a>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-400 block">Preferred Contact</span>
                    <span className="text-gray-700">
                      {selectedEnquiry.preferredContactMethod || 'Phone / WhatsApp'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-400 block">Institutional Role</span>
                    <span className="font-semibold text-foreground capitalize">
                      {selectedEnquiry.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Requirement & Opportunity Match */}
              <div className="space-y-3">
                <h4 className="font-bold text-[12px] uppercase tracking-wider text-gray-500">
                  Target Opportunity / Requirement
                </h4>

                <div className="bg-white p-3 rounded-xl border border-gray-100 space-y-2.5">
                  {selectedEnquiry.opportunity ? (
                    <div>
                      <span className="text-[11px] text-gray-400 block">Associated Opportunity</span>
                      <Link
                        href={`/opportunities/${selectedEnquiry.opportunity.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 font-bold text-primary hover:underline mt-0.5"
                      >
                        <span>{selectedEnquiry.opportunity.title}</span>
                        <ExternalLink size={13} />
                      </Link>
                      <p className="text-[11px] text-gray-500">
                        {selectedEnquiry.opportunity.location}
                      </p>
                    </div>
                  ) : selectedEnquiry.project ? (
                    <div>
                      <span className="text-[11px] text-gray-400 block">Associated Project</span>
                      <Link
                        href={`/projects`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 font-bold text-primary hover:underline mt-0.5"
                      >
                        <span>{selectedEnquiry.project.title}</span>
                        <ExternalLink size={13} />
                      </Link>
                      <p className="text-[11px] text-gray-500">
                        {selectedEnquiry.project.district}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <span className="text-[11px] text-gray-400 block">Scope</span>
                      <span className="font-semibold text-gray-700">
                        General Institutional Expression of Interest
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                    <div>
                      <span className="text-[11px] text-gray-400 block">Investment Range</span>
                      <span className="font-medium text-foreground">
                        {selectedEnquiry.investmentRange || 'Open / Discussion'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-gray-400 block">Preferred Location</span>
                      <span className="font-medium text-foreground">
                        {selectedEnquiry.preferredLocation || 'Kerala General'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submitted Message */}
              <div className="space-y-2">
                <h4 className="font-bold text-[12px] uppercase tracking-wider text-gray-500">
                  Message / Submission Note
                </h4>
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-700 whitespace-pre-wrap leading-relaxed text-[13px]">
                  {selectedEnquiry.message || 'No additional message provided.'}
                </div>
              </div>

              {/* Internal Notes Timeline */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[12px] uppercase tracking-wider text-gray-500">
                    Internal Admin Notes
                  </h4>
                  <span className="text-[11px] text-gray-400">
                    {(selectedEnquiry.adminNotes || []).length} logged
                  </span>
                </div>

                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="space-y-2">
                  <textarea
                    rows={2}
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="Log discussion notes, next steps or meeting outcomes..."
                    className="w-full bg-[#F8F9FA] focus:bg-white border border-gray-200 focus:border-primary/40 focus:ring-2 focus:ring-primary/10 rounded-xl p-3 text-[13px] text-foreground placeholder:text-gray-400 outline-none transition-all resize-none"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isAddingNote || !newNoteContent.trim()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-[12px] font-semibold transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <Send size={12} />
                      <span>{isAddingNote ? 'Saving...' : 'Add Note'}</span>
                    </button>
                  </div>
                </form>

                {/* Notes List */}
                <div className="space-y-2.5 mt-3">
                  {(selectedEnquiry.adminNotes || []).length === 0 ? (
                    <p className="text-[12px] text-gray-400 italic">
                      No internal notes recorded yet.
                    </p>
                  ) : (
                    (selectedEnquiry.adminNotes || []).map((note) => (
                      <div
                        key={note.id}
                        className="p-3 rounded-xl bg-[#FBFBFA] border border-gray-100 text-[12px] space-y-1"
                      >
                        <div className="flex items-center justify-between text-gray-500">
                          <span className="font-bold text-foreground">
                            {note.authorName} ({note.authorRole})
                          </span>
                          <span className="text-[10px]">
                            {new Date(note.createdAt).toLocaleString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-gray-200 bg-[#FBFBFA] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setDeletingEnquiry(selectedEnquiry)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-[12px] font-semibold transition-colors cursor-pointer"
              >
                <Trash2 size={14} />
                <span>Delete Enquiry</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-[13px] font-semibold transition-colors cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="font-heading font-bold text-[17px] text-foreground">
                  Confirm Enquiry Deletion
                </h3>
                <span className="text-xs text-red-600 font-semibold">PostgreSQL Server Mutation</span>
              </div>
            </div>

            <p className="text-[13px] text-gray-600 mb-2 leading-relaxed">
              Are you sure you want to permanently delete enquiry{' '}
              <strong className="text-foreground font-semibold">
                &quot;{deletingEnquiry.referenceNumber}&quot;
              </strong>{' '}
              submitted by{' '}
              <strong className="text-foreground font-semibold">
                {deletingEnquiry.fullName}
              </strong>
              {deletingEnquiry.company ? ` (${deletingEnquiry.company})` : ''}?
            </p>
            <p className="text-[12px] text-gray-500 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200">
              This will remove the enquiry and all its logged internal notes permanently from the database.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingEnquiry(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-[13px] font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[13px] font-semibold transition-colors disabled:opacity-50 cursor-pointer"
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
