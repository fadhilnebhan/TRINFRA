'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Building,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Trash2,
  AlertTriangle,
  ExternalLink,
  X,
  RotateCcw,
} from 'lucide-react';
import CustomSelect from '@/components/opportunities/CustomSelect';
import { formatPrice } from '@/components/residential/ResidentialCard';
import { KERALA_14_DISTRICTS } from '@/lib/server/residential';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'PENDING_REVIEW', label: 'Pending Review' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'UNPUBLISHED', label: 'Unpublished' },
  { value: 'DRAFT', label: 'Draft' },
];

const DISTRICT_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All 14 Districts' },
  ...KERALA_14_DISTRICTS.map((d) => ({ value: d, label: d })),
];

export default function AdminResidentialPage() {
  const [activeView, setActiveView] = useState<'listings' | 'enquiries'>('listings');

  // Listings State
  const [listings, setListings] = useState<any[]>([]);
  const [counts, setCounts] = useState({
    total: 0,
    pending: 0,
    published: 0,
    rejected: 0,
    draft: 0,
    unpublished: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters State
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Action State
  const [rejectModalListing, setRejectModalListing] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Enquiries State
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState(false);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (districtFilter !== 'ALL') params.set('district', districtFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/admin/residential/listings?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch admin listings');
      const data = await res.json();
      if (data.success) {
        setListings(data.listings || []);
        if (data.counts) setCounts(data.counts);
      }
    } catch (err: any) {
      console.error('Error fetching admin listings:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, districtFilter, searchQuery]);

  const fetchEnquiries = useCallback(async () => {
    setLoadingEnquiries(true);
    try {
      const res = await fetch('/api/admin/residential/enquiries');
      if (res.ok) {
        const data = await res.json();
        if (data.success) setEnquiries(data.enquiries || []);
      }
    } catch (err) {
      console.error('Error fetching admin enquiries:', err);
    } finally {
      setLoadingEnquiries(false);
    }
  }, []);

  useEffect(() => {
    if (activeView === 'listings') {
      fetchListings();
    } else {
      fetchEnquiries();
    }
  }, [activeView, fetchListings, fetchEnquiries]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/admin/residential/listings/${id}/approve`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to approve listing');
      setActionMessage({ type: 'success', text: 'Listing approved and published publicly!' });
      await fetchListings();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenRejectModal = (listing: any) => {
    setRejectModalListing(listing);
    setRejectionReason('');
  };

  const handleConfirmReject = async () => {
    if (!rejectModalListing) return;
    if (!rejectionReason.trim() || rejectionReason.trim().length < 5) {
      alert('Please provide a specific rejection reason of at least 5 characters.');
      return;
    }

    const id = rejectModalListing.id;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/residential/listings/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectionReason: rejectionReason.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to reject listing');
      setRejectModalListing(null);
      setActionMessage({ type: 'success', text: 'Listing rejected and seller notified with reason.' });
      await fetchListings();
    } catch (err: any) {
      alert(err.message || 'Error rejecting listing');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnpublish = async (id: string) => {
    setActionLoading(id);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/admin/residential/listings/${id}/unpublish`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to unpublish listing');
      setActionMessage({ type: 'success', text: 'Listing unpublished and removed from public view.' });
      await fetchListings();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${title}"? This cannot be undone.`)) {
      return;
    }

    setActionLoading(id);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/admin/residential/listings/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to delete listing');
      setActionMessage({ type: 'success', text: 'Listing deleted permanently from database.' });
      await fetchListings();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  const handleEnquiryStatusChange = async (id: string, status: string) => {
    try {
      await fetch(`/api/admin/residential/enquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      await fetchEnquiries();
    } catch (err) {
      console.error('Error changing enquiry status:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Building className="text-primary" size={26} />
            <span>Residential Property Marketplace CMS</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Review seller-submitted listings, moderate published flats and apartments, and track buyer enquiries.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2 bg-gray-200/70 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setActiveView('listings')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeView === 'listings'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Listings Moderation ({counts.total})
          </button>
          <button
            onClick={() => setActiveView('enquiries')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeView === 'enquiries'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Buyer Enquiries ({enquiries.length})
          </button>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium border flex items-center justify-between ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="opacity-60 hover:opacity-100 font-bold">
            ✕
          </button>
        </div>
      )}

      {activeView === 'listings' ? (
        <>
          {/* Metrics Overview Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                Total Listings
              </span>
              <span className="text-2xl font-black text-gray-900">{counts.total}</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs bg-amber-50/20">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block mb-1 flex items-center gap-1">
                <Clock size={12} /> Pending Review
              </span>
              <span className="text-2xl font-black text-amber-700">{counts.pending}</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs bg-emerald-50/20">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block mb-1 flex items-center gap-1">
                <CheckCircle size={12} /> Published
              </span>
              <span className="text-2xl font-black text-emerald-700">{counts.published}</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-red-200 shadow-xs bg-red-50/20">
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 block mb-1 flex items-center gap-1">
                <XCircle size={12} /> Rejected
              </span>
              <span className="text-2xl font-black text-red-700">{counts.rejected}</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                Unpublished / Draft
              </span>
              <span className="text-2xl font-black text-gray-700">
                {counts.unpublished + counts.draft}
              </span>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title, locality, seller..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="w-44">
                <CustomSelect
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={STATUS_OPTIONS}
                  size="sm"
                  aria-label="Filter by Status"
                />
              </div>

              <div className="w-48">
                <CustomSelect
                  value={districtFilter}
                  onChange={setDistrictFilter}
                  options={DISTRICT_FILTER_OPTIONS}
                  size="sm"
                  aria-label="Filter by District"
                />
              </div>

              {(statusFilter !== 'ALL' || districtFilter !== 'ALL' || searchQuery) && (
                <button
                  onClick={() => {
                    setStatusFilter('ALL');
                    setDistrictFilter('ALL');
                    setSearchQuery('');
                  }}
                  className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                  title="Reset filters"
                >
                  <RotateCcw size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Listings Table */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-xs text-gray-500 font-medium animate-pulse">
                Loading residential listings...
              </div>
            ) : listings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/80 border-b border-gray-200/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Property</th>
                      <th className="py-3.5 px-4">District / Locality</th>
                      <th className="py-3.5 px-4">Type & Purpose</th>
                      <th className="py-3.5 px-4">Price</th>
                      <th className="py-3.5 px-4">Seller Details</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {listings.map((item) => {
                      const coverImg = item.images?.[0]?.url || '/images/houses_tropical.jpeg';
                      const priceStr = formatPrice(item.price, item.priceType, item.listingPurpose);

                      let badge = (
                        <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-gray-100 text-gray-700">
                          {item.status}
                        </span>
                      );

                      if (item.status === 'PUBLISHED') {
                        badge = (
                          <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200">
                            PUBLISHED
                          </span>
                        );
                      } else if (item.status === 'PENDING_REVIEW') {
                        badge = (
                          <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-amber-100 text-amber-800 border border-amber-200">
                            PENDING REVIEW
                          </span>
                        );
                      } else if (item.status === 'REJECTED') {
                        badge = (
                          <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-red-100 text-red-800 border border-red-200">
                            REJECTED
                          </span>
                        );
                      } else if (item.status === 'UNPUBLISHED') {
                        badge = (
                          <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-gray-200 text-gray-700">
                            UNPUBLISHED
                          </span>
                        );
                      }

                      return (
                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                          {/* Property info */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="relative w-12 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                <img src={coverImg} alt="" className="w-full h-full object-cover" />
                              </div>
                              <div className="max-w-xs">
                                <span className="font-bold text-gray-900 line-clamp-1">{item.title}</span>
                                <span className="text-[11px] text-gray-400">
                                  {item.bedrooms} BHK • {item.area} {item.areaUnit}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* District / Locality */}
                          <td className="py-3.5 px-4 font-medium text-gray-700">
                            <div>{item.district}</div>
                            <div className="text-[11px] text-gray-400">{item.locality}</div>
                          </td>

                          {/* Type */}
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-gray-800">{item.propertyType}</span>
                            <span className="block text-[11px] text-gray-400">For {item.listingPurpose}</span>
                          </td>

                          {/* Price */}
                          <td className="py-3.5 px-4 font-bold text-gray-900">{priceStr}</td>

                          {/* Seller */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-gray-800">{item.seller?.fullName}</div>
                            <div className="text-[11px] text-gray-400">{item.seller?.email}</div>
                            {item.seller?.phone && (
                              <div className="text-[11px] text-primary">{item.seller.phone}</div>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            {badge}
                            {item.status === 'REJECTED' && item.rejectionReason && (
                              <span
                                className="block text-[10px] text-red-600 mt-1 line-clamp-1"
                                title={item.rejectionReason}
                              >
                                {item.rejectionReason}
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {/* Approve Button */}
                              {item.status !== 'PUBLISHED' && (
                                <button
                                  disabled={actionLoading === item.id}
                                  onClick={() => handleApprove(item.id)}
                                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                                  title="Approve and publish listing"
                                >
                                  Approve
                                </button>
                              )}

                              {/* Reject Button (if pending or published) */}
                              {item.status === 'PENDING_REVIEW' && (
                                <button
                                  disabled={actionLoading === item.id}
                                  onClick={() => handleOpenRejectModal(item)}
                                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors"
                                  title="Reject listing with feedback"
                                >
                                  Reject
                                </button>
                              )}

                              {/* Unpublish Button */}
                              {item.status === 'PUBLISHED' && (
                                <>
                                  <Link
                                    href={`/residential/${item.slug}`}
                                    target="_blank"
                                    className="p-1.5 text-gray-500 hover:text-primary rounded-lg hover:bg-gray-100"
                                    title="View public page"
                                  >
                                    <ExternalLink size={14} />
                                  </Link>
                                  <button
                                    disabled={actionLoading === item.id}
                                    onClick={() => handleUnpublish(item.id)}
                                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                                    title="Unpublish listing"
                                  >
                                    Unpublish
                                  </button>
                                </>
                              )}

                              {/* Delete */}
                              <button
                                disabled={actionLoading === item.id}
                                onClick={() => handleDelete(item.id, item.title)}
                                className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                title="Delete listing"
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
            ) : (
              <div className="p-12 text-center text-xs text-gray-500">
                No residential listings match the current filters.
              </div>
            )}
          </div>
        </>
      ) : (
        /* Buyer Enquiries View */
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
          {loadingEnquiries ? (
            <div className="p-8 text-center text-xs text-gray-500 font-medium animate-pulse">
              Loading buyer enquiries...
            </div>
          ) : enquiries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/80 border-b border-gray-200/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Buyer Name & Contacts</th>
                    <th className="py-3.5 px-4">Property Reference</th>
                    <th className="py-3.5 px-4">Seller</th>
                    <th className="py-3.5 px-4">Message</th>
                    <th className="py-3.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {enquiries.map((enq) => {
                    const dateStr = new Date(enq.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    });

                    return (
                      <tr key={enq.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">{dateStr}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-gray-900">{enq.name}</div>
                          <div className="text-[11px] text-gray-400">{enq.email}</div>
                          <div className="text-[11px] text-primary">{enq.phone}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <Link
                            href={`/residential/${enq.listing.slug}`}
                            target="_blank"
                            className="font-semibold text-gray-800 hover:text-primary transition-colors flex items-center gap-1"
                          >
                            <span>{enq.listing.title}</span>
                            <ExternalLink size={11} />
                          </Link>
                          <span className="text-[11px] text-gray-400">
                            {enq.listing.district} • {formatPrice(enq.listing.price, enq.listing.priceType)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-gray-700">
                          {enq.listing.seller?.fullName || 'Seller'}
                        </td>
                        <td className="py-3.5 px-4 max-w-xs text-gray-600 line-clamp-2">
                          {enq.message}
                        </td>
                        <td className="py-3.5 px-4">
                          <select
                            value={enq.status}
                            onChange={(e) => handleEnquiryStatusChange(enq.id, e.target.value)}
                            className="text-xs font-semibold px-2 py-1 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white"
                          >
                            <option value="NEW">NEW</option>
                            <option value="CONTACTED">CONTACTED</option>
                            <option value="IN_PROGRESS">IN_PROGRESS</option>
                            <option value="CLOSED">CLOSED</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-gray-500">
              No residential buyer enquiries received yet.
            </div>
          )}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalListing && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-600" />
                <span>Reject Listing</span>
              </h3>
              <button
                onClick={() => setRejectModalListing(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-3">
              Rejecting &ldquo;{rejectModalListing.title}&rdquo;. Please provide clear feedback so the seller knows what corrections are required before resubmitting.
            </p>

            <textarea
              rows={4}
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Please upload clear photos of the interior and verify the exact carpet area..."
              className="w-full p-3 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400/20 focus:border-red-400 resize-none mb-4"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectModalListing(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-red-600 text-white hover:bg-red-700 shadow-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
