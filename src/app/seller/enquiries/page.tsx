'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  Building,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
} from 'lucide-react';
import SellerNavbar from '@/components/seller/SellerNavbar';
import { formatPrice } from '@/components/residential/ResidentialCard';

export default function SellerEnquiriesPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [closingEnquiry, setClosingEnquiry] = useState<any | null>(null);
  const [statusFeedback, setStatusFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchEnquiries = useCallback(async (showSkeleton = true) => {
    if (showSkeleton) setLoading(true);
    try {
      const res = await fetch('/api/seller/enquiries');
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/seller/login');
          return;
        }
        throw new Error('Failed to fetch enquiries');
      }
      const data = await res.json();
      setEnquiries(data.enquiries || []);
    } catch (err) {
      console.error('Error fetching enquiries:', err);
    } finally {
      if (showSkeleton) setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  const handleUpdateStatus = async (id: string, newStatus: string, markPropertySold: boolean = false) => {
    setUpdatingId(id);
    setStatusFeedback(null);
    try {
      const res = await fetch(`/api/seller/enquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, markPropertySold }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update enquiry status');
      }

      // Optimistic/Live-sync update of local state
      setEnquiries((prev) =>
        prev.map((e) => {
          if (e.id === id) {
            return {
              ...e,
              status: newStatus,
              listing: {
                ...e.listing,
                status: markPropertySold ? 'SOLD' : e.listing?.status,
              },
            };
          }
          // If property was marked SOLD, reflect it on any other enquiries for the same listing
          if (markPropertySold && closingEnquiry && e.listing?.id === closingEnquiry.listing?.id) {
            return {
              ...e,
              listing: {
                ...e.listing,
                status: 'SOLD',
              },
            };
          }
          return e;
        })
      );

      setClosingEnquiry(null);
      setStatusFeedback({
        type: 'success',
        message: markPropertySold
          ? 'Enquiry closed and property marked as Sold.'
          : newStatus === 'IN_PROGRESS'
          ? 'Enquiry started and moved to In Progress.'
          : 'Enquiry closed. Property remains available.',
      });

      // Background re-fetch to ensure complete sync without flicker
      fetchEnquiries(false);
    } catch (err: any) {
      console.error('Error updating status:', err);
      setStatusFeedback({ type: 'error', message: err.message || 'Failed to update status' });
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredEnquiries = enquiries.filter((e) => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'IN_PROGRESS') {
      return e.status === 'IN_PROGRESS' || e.status === 'CONTACTED';
    }
    return e.status === filterStatus;
  });

  const renderAvailabilityBadge = (listingStatus?: string) => {
    switch (listingStatus) {
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Still Available
          </span>
        );
      case 'SOLD':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Sold
          </span>
        );
      case 'RENTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            Rented
          </span>
        );
      case 'UNPUBLISHED':
      case 'ARCHIVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            Unavailable
          </span>
        );
      case 'PENDING_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Pending Verification
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-500">
            {listingStatus || 'Draft'}
          </span>
        );
    }
  };

  const newCount = enquiries.filter((e) => e.status === 'NEW').length;
  const inProgressCount = enquiries.filter((e) => e.status === 'IN_PROGRESS' || e.status === 'CONTACTED').length;
  const closedCount = enquiries.filter((e) => e.status === 'CLOSED').length;

  return (
    <div className="min-h-screen bg-[#fafaf9] text-gray-900 flex flex-col">
      {/* Reusable TRINFRA Seller Header */}
      <SellerNavbar />

      <main className="flex-grow pb-20 pt-5 sm:pt-7">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
          {/* Breadcrumb / Back Link below Header */}
          <div className="mb-4">
            <Link
              href="/seller"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-primary transition-colors py-1 px-2 -ml-2 rounded-lg hover:bg-gray-100/60"
            >
              <ArrowLeft size={14} />
              <span>← Back to Seller Dashboard</span>
            </Link>
          </div>

          {/* Page Heading & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-gray-900 tracking-tight">
                Buyer Enquiries
              </h1>
              <p className="text-xs text-gray-500 mt-1 max-w-xl leading-relaxed">
                Direct enquiries received from verified prospective buyers. Manage each conversation independently from property availability.
              </p>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {[
                { id: 'ALL', label: 'All', count: enquiries.length },
                { id: 'NEW', label: 'New', count: newCount },
                { id: 'IN_PROGRESS', label: 'In Progress', count: inProgressCount },
                { id: 'CLOSED', label: 'Closed', count: closedCount },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterStatus(tab.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    filterStatus === tab.id
                      ? 'bg-primary text-white shadow-xs font-bold'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/90'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                      filterStatus === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Alert */}
          {statusFeedback && (
            <div
              className={`mb-5 p-3.5 rounded-xl border flex items-center justify-between text-xs animate-in fade-in duration-200 ${
                statusFeedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {statusFeedback.type === 'success' ? (
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle size={16} className="text-rose-600 shrink-0" />
                )}
                <span className="font-medium">{statusFeedback.message}</span>
              </div>
              <button
                onClick={() => setStatusFeedback(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
                aria-label="Dismiss feedback"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Content Area */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200/80 animate-pulse h-40" />
              ))}
            </div>
          ) : filteredEnquiries.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-200/80 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
                <MessageSquare size={22} />
              </div>
              <h3 className="text-base font-heading font-bold text-gray-800 mb-1">
                {filterStatus === 'ALL' ? 'No enquiries yet' : `No ${filterStatus.toLowerCase().replace('_', ' ')} enquiries`}
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                {filterStatus === 'ALL'
                  ? 'When interested buyers reach out about your properties, their messages and contact details will appear here.'
                  : `There are currently no enquiries with the status "${filterStatus.replace('_', ' ')}".`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEnquiries.map((item) => {
                const formattedDate = new Date(item.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                const isClosed = item.status === 'CLOSED';
                const isInProgress = item.status === 'IN_PROGRESS' || item.status === 'CONTACTED';
                const isNew = item.status === 'NEW';

                return (
                  <div
                    key={item.id}
                    data-testid={`enquiry-card-${item.id}`}
                    className={`bg-white rounded-2xl p-5 border transition-all shadow-2xs hover:shadow-xs ${
                      isClosed ? 'border-gray-200 bg-gray-50/40 opacity-95' : 'border-gray-200/90'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      {/* Left: Buyer and Property Details */}
                      <div className="min-w-0 flex-1 space-y-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-sm sm:text-base font-heading font-bold text-gray-900">
                            {item.name}
                          </h2>

                          {/* Enquiry Status Badge */}
                          <span
                            data-testid="enquiry-status-badge"
                            className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full border ${
                              isNew
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : isInProgress
                                ? 'bg-purple-50 text-purple-800 border-purple-200'
                                : 'bg-gray-100 text-gray-700 border-gray-200'
                            }`}
                          >
                            Enquiry: {isNew ? 'NEW' : isInProgress ? 'IN PROGRESS' : 'CLOSED'}
                          </span>

                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar size={12} /> {formattedDate}
                          </span>
                        </div>

                        {/* Buyer Contact Links */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                          <a
                            href={`tel:${item.phone}`}
                            className="flex items-center gap-1 font-semibold text-primary hover:underline"
                          >
                            <Phone size={13} />
                            <span>{item.phone}</span>
                          </a>
                          <a
                            href={`mailto:${item.email}`}
                            className="flex items-center gap-1 hover:text-gray-900"
                          >
                            <Mail size={13} />
                            <span>{item.email}</span>
                          </a>
                        </div>

                        {/* Associated Property and Separate Availability Badge */}
                        <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Building size={14} className="text-gray-400 shrink-0" />
                            <span className="text-gray-500 font-medium">Property:</span>
                            <Link
                              href={`/residential/${item.listing?.slug || ''}`}
                              target="_blank"
                              className="font-bold text-gray-900 hover:text-primary transition-colors flex items-center gap-1 truncate max-w-[280px] sm:max-w-md"
                            >
                              <span>{item.listing?.title || 'Residential Listing'}</span>
                              <ExternalLink size={11} className="shrink-0" />
                            </Link>
                            {item.listing?.price && (
                              <span className="text-primary font-bold ml-1 shrink-0">
                                ({formatPrice(item.listing.price, item.listing.priceType, item.listing.listingPurpose)})
                              </span>
                            )}
                          </div>

                          {/* Explicit Property Availability Separated from Enquiry Status */}
                          <div className="flex items-center gap-1.5 pl-0 sm:pl-2 border-l-0 sm:border-l sm:border-gray-200">
                            <span className="text-gray-400 text-[11px] font-medium">Availability:</span>
                            <span data-testid="property-availability-badge">
                              {renderAvailabilityBadge(item.listing?.status)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Seller Action Workflow Controls */}
                      <div className="flex flex-col items-start lg:items-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                          Enquiry Action:
                        </span>

                        <div className="flex items-center gap-2">
                          {isNew && (
                            <button
                              data-testid="start-enquiry-btn"
                              disabled={updatingId === item.id}
                              onClick={() => handleUpdateStatus(item.id, 'IN_PROGRESS')}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 min-h-[34px] text-xs font-bold rounded-xl text-white bg-[#0E2115] hover:bg-[#1b3b27] transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
                              aria-label="Start Enquiry"
                            >
                              <span>Start Enquiry</span>
                              <ArrowRight size={13} />
                            </button>
                          )}

                          {isInProgress && (
                            <button
                              data-testid="close-enquiry-btn"
                              disabled={updatingId === item.id}
                              onClick={() => setClosingEnquiry(item)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 min-h-[34px] text-xs font-bold rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
                              aria-label="Close Enquiry"
                            >
                              <CheckCircle2 size={13} />
                              <span>Close Enquiry</span>
                            </button>
                          )}

                          {isClosed && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 border border-gray-200 text-gray-600 text-xs font-semibold">
                              <CheckCircle2 size={13} className="text-gray-400" />
                              <span>Enquiry Closed</span>
                            </div>
                          )}
                        </div>

                        {isClosed && (
                          <p className="text-[10px] text-gray-400 mt-0.5 max-w-[220px] text-left lg:text-right leading-tight">
                            Note: Closing this enquiry does not affect property availability unless marked Sold.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Message Body */}
                    <div className="mt-3.5 pt-3 border-t border-gray-100 text-xs text-gray-700 bg-[#fafaf8] p-3.5 rounded-xl border border-gray-200/60">
                      <span className="font-bold text-gray-500 block mb-1">Buyer Message:</span>
                      <p className="leading-relaxed italic">&ldquo;{item.message}&rdquo;</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* ================= MODAL: CLOSE ENQUIRY CONFIRMATION ================= */}
      {closingEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertCircle size={20} />
              </div>
              <button
                onClick={() => setClosingEnquiry(null)}
                disabled={updatingId === closingEnquiry.id}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Cancel"
              >
                <X size={18} />
              </button>
            </div>

            <h3 className="text-lg font-heading font-bold text-gray-900 mb-1">
              Close this enquiry?
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              Enquiry from <span className="font-semibold text-gray-800">{closingEnquiry.name}</span> for{' '}
              <span className="font-semibold text-gray-800">{closingEnquiry.listing?.title}</span>.
              Please choose how you wish to conclude this enquiry:
            </p>

            <div className="space-y-3 mb-5">
              {/* Option 1: Close Enquiry Only */}
              <button
                type="button"
                data-testid="close-enquiry-only-btn"
                disabled={updatingId === closingEnquiry.id}
                onClick={() => handleUpdateStatus(closingEnquiry.id, 'CLOSED', false)}
                className="w-full text-left p-3.5 rounded-xl border border-gray-200 hover:border-gray-400 hover:bg-gray-50/80 transition-all flex flex-col gap-1 cursor-pointer group"
                aria-label="Close Enquiry Only"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900 group-hover:text-primary">
                    Close Enquiry Only
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Property Remains Available
                  </span>
                </div>
                <span className="text-[11px] text-gray-500 leading-normal">
                  Use this if the buyer stopped responding or decided not to proceed. The property stays live for other buyers.
                </span>
              </button>

              {/* Option 2: Close & Mark Property Sold */}
              <button
                type="button"
                data-testid="close-mark-sold-btn"
                disabled={updatingId === closingEnquiry.id}
                onClick={() => handleUpdateStatus(closingEnquiry.id, 'CLOSED', true)}
                className="w-full text-left p-3.5 rounded-xl border-2 border-emerald-600 bg-emerald-50/40 hover:bg-emerald-50 transition-all flex flex-col gap-1 cursor-pointer group shadow-xs"
                aria-label="Close & Mark Property Sold"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                    Close &amp; Mark Property Sold
                  </span>
                  <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    Mark as Sold
                  </span>
                </div>
                <span className="text-[11px] text-emerald-800/80 leading-normal">
                  Use this when the buyer purchased the property. The property will be marked as Sold and new buyer enquiries will be blocked.
                </span>
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                disabled={updatingId === closingEnquiry.id}
                onClick={() => setClosingEnquiry(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200/80 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
