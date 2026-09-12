'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  PlusCircle,
  MessageSquare,
  LogOut,
  Trash2,
  Edit,
  Send,
  Eye,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import SellerNavbar from '@/components/seller/SellerNavbar';
import { formatPrice } from '@/components/residential/ResidentialCard';

export default function SellerDashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [seller, setSeller] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    pending: 0,
    draft: 0,
    rejected: 0,
    totalEnquiries: 0,
  });

  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchSellerData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch current user
      const userRes = await fetch('/api/seller/auth/me');
      if (!userRes.ok) {
        router.push('/seller/login');
        return;
      }
      const userData = await userRes.json();
      setSeller(userData.user);

      // 2. Fetch seller listings
      const listingsRes = await fetch('/api/seller/listings');
      if (listingsRes.ok) {
        const data = await listingsRes.json();
        setListings(data.listings || []);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error('Error fetching seller dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchSellerData();
  }, [fetchSellerData]);

  const handleLogout = async () => {
    try {
      await fetch('/api/seller/auth/logout', { method: 'POST' });
      router.push('/seller/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleSubmitForReview = async (id: string) => {
    setActionLoading(id);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/seller/listings/${id}/submit`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit listing');
      }
      setStatusMessage({ type: 'success', text: 'Listing submitted for admin verification!' });
      await fetchSellerData();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateAvailability = async (id: string, newStatus: string) => {
    setActionLoading(id);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/seller/listings/${id}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update property availability');
      }
      setStatusMessage({
        type: 'success',
        text: `Property availability updated to ${newStatus === 'PUBLISHED' ? 'Still Available (Live)' : newStatus}`,
      });
      await fetchSellerData();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteListing = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }

    setActionLoading(id);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/seller/listings/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete listing');
      }
      setStatusMessage({ type: 'success', text: 'Listing deleted successfully' });
      await fetchSellerData();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  const filteredListings = listings.filter((listing) => {
    if (activeTab === 'ALL') return true;
    return listing.status === activeTab;
  });

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* ================= REUSABLE SELLER NAVBAR ================= */}
      <SellerNavbar sellerName={seller?.fullName} companyName={seller?.companyName} />

      {/* ================= TOP SELLER BAR ================= */}
      <div className="bg-white border-b border-gray-200/80 py-5 sm:py-6">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8 lg:px-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
                <Building2 size={22} />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-heading font-bold text-gray-900 tracking-tight truncate">
                  Seller Dashboard
                </h1>
                <p className="text-xs text-gray-500 truncate">
                  Welcome, <span className="font-semibold text-gray-800">{seller?.fullName || 'Seller'}</span>
                  {seller?.companyName ? ` • ${seller.companyName}` : ''}
                </p>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/seller/enquiries"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[38px] text-xs font-semibold rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <MessageSquare size={14} />
                <span>Enquiries ({stats.totalEnquiries})</span>
              </Link>
              <Link
                href="/seller/listings/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[38px] text-xs font-semibold rounded-xl bg-primary hover:bg-primary-btn text-white shadow-xs transition-all"
              >
                <PlusCircle size={14} />
                <span>New Listing</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 min-h-[38px] min-w-[38px] text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center justify-center cursor-pointer"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16 pt-6 sm:pt-8">
        {/* Status Alert Notification */}
        {statusMessage && (
          <div
            className={`mb-6 p-3.5 sm:p-4 rounded-xl text-xs font-medium border flex items-center justify-between ${
              statusMessage.type === 'success'
                ? 'bg-primary/5 text-primary border-primary/20'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            <span>{statusMessage.text}</span>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-xs opacity-60 hover:opacity-100 font-bold ml-2 cursor-pointer"
              aria-label="Dismiss message"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tab Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-gray-200/80 no-scrollbar">
          {[
            { key: 'ALL', label: `All (${stats.total})` },
            { key: 'PUBLISHED', label: `Live / Available (${stats.published})` },
            { key: 'PENDING_REVIEW', label: `Pending Review (${stats.pending})` },
            { key: 'DRAFT', label: `Drafts (${stats.draft})` },
            { key: 'REJECTED', label: `Rejected (${stats.rejected})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Listings Collection */}
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-36 bg-white rounded-2xl border border-gray-200/80" />
            ))}
          </div>
        ) : filteredListings.length > 0 ? (
          <div className="space-y-4">
            {filteredListings.map((listing) => {
              const coverImg = listing.images?.[0]?.url || '/images/houses_tropical.jpeg';
              const priceText = formatPrice(listing.price, listing.priceType, listing.listingPurpose);

              let statusBadge = (
                <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-gray-100 text-gray-700">
                  {listing.status}
                </span>
              );

              if (listing.status === 'PUBLISHED') {
                statusBadge = (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Still Available
                  </span>
                );
              } else if (listing.status === 'SOLD') {
                statusBadge = (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    Sold
                  </span>
                );
              } else if (listing.status === 'RENTED') {
                statusBadge = (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    Rented
                  </span>
                );
              } else if (listing.status === 'UNPUBLISHED' || listing.status === 'ARCHIVED') {
                statusBadge = (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                    Unavailable
                  </span>
                );
              } else if (listing.status === 'PENDING_REVIEW') {
                statusBadge = (
                  <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-accent/15 text-accent border border-accent/30">
                    Pending Review
                  </span>
                );
              } else if (listing.status === 'REJECTED') {
                statusBadge = (
                  <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-red-50 text-red-700 border border-red-200">
                    Needs Changes
                  </span>
                );
              } else if (listing.status === 'DRAFT') {
                statusBadge = (
                  <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                    Draft
                  </span>
                );
              }

              const isAvailabilityControllable = ['PUBLISHED', 'SOLD', 'RENTED', 'UNPUBLISHED'].includes(
                listing.status
              );

              return (
                <div
                  key={listing.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-2xs hover:shadow-sm transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Thumbnail & Property Details */}
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="relative w-22 h-20 sm:w-28 sm:h-22 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        <img src={coverImg} alt={listing.title} className="w-full h-full object-cover" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                          {statusBadge}
                          <span className="text-xs font-semibold text-gray-500 uppercase">
                            {listing.propertyType} • {listing.listingPurpose}
                          </span>
                          <span className="text-xs font-medium text-gray-400 truncate">
                            • {listing.locality}, {listing.district}
                          </span>
                        </div>

                        <h3 className="text-sm sm:text-base font-heading font-bold text-gray-900 leading-snug line-clamp-1">
                          {listing.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-1">
                          <span className="font-bold text-primary">{priceText}</span>
                          <span>•</span>
                          <span>{listing.bedrooms} BHK</span>
                          <span>•</span>
                          <span>
                            {listing.area} {listing.areaUnit}
                          </span>
                          <span>•</span>
                          <span className="font-medium text-gray-600">
                            {listing._count?.enquiries || 0} enquiries
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons & Seller Availability Control */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 justify-end">
                      {/* Seller Availability Selector for Approved Listings */}
                      {isAvailabilityControllable && (
                        <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200/90 rounded-xl px-2.5 py-1.5">
                          <span className="text-[11px] font-semibold text-gray-500 whitespace-nowrap">
                            Availability:
                          </span>
                          <select
                            value={listing.status}
                            disabled={actionLoading === listing.id}
                            onChange={(e) => handleUpdateAvailability(listing.id, e.target.value)}
                            className="bg-transparent text-xs font-bold text-gray-800 outline-none cursor-pointer py-0.5"
                            aria-label="Change listing availability"
                          >
                            <option value="PUBLISHED">Still Available</option>
                            <option value="SOLD">Mark as Sold</option>
                            <option value="RENTED">Mark as Rented</option>
                            <option value="UNPUBLISHED">Unavailable</option>
                          </select>
                        </div>
                      )}

                      {listing.status === 'PUBLISHED' && (
                        <Link
                          href={`/residential/${listing.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 px-3 py-1.5 min-h-[34px] text-xs font-semibold text-gray-700 hover:text-primary bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200/60"
                        >
                          <Eye size={13} />
                          <span>View Public</span>
                          <ExternalLink size={11} />
                        </Link>
                      )}

                      {(listing.status === 'DRAFT' || listing.status === 'REJECTED') && (
                        <button
                          onClick={() => handleSubmitForReview(listing.id)}
                          disabled={actionLoading === listing.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[34px] text-xs font-semibold text-white bg-primary hover:bg-primary-btn rounded-lg shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
                        >
                          <Send size={12} />
                          <span>Submit for Review</span>
                        </button>
                      )}

                      <Link
                        href={`/seller/listings/${listing.id}/edit`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 min-h-[34px] text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <Edit size={12} />
                        <span>Edit</span>
                      </Link>

                      <button
                        onClick={() => handleDeleteListing(listing.id, listing.title)}
                        disabled={actionLoading === listing.id}
                        className="p-2 min-h-[34px] min-w-[34px] text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                        title="Delete listing"
                        aria-label="Delete listing"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Moderator Rejection Feedback Banner */}
                  {listing.status === 'REJECTED' && listing.rejectionReason && (
                    <div className="mt-3.5 p-3 rounded-xl bg-red-50/90 border border-red-200 text-xs text-red-800 flex items-start gap-2">
                      <AlertTriangle size={15} className="shrink-0 mt-0.5 text-red-600" />
                      <div>
                        <span className="font-bold">Moderator Feedback: </span>
                        <span>{listing.rejectionReason}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty Listings State */
          <div className="my-10 py-12 px-4 text-center bg-white rounded-2xl border border-gray-200/80 shadow-2xs max-w-md mx-auto">
            <Building2 size={36} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-base font-bold text-gray-800 mb-1">No listings in this category</h3>
            <p className="text-xs text-gray-500 mb-4">
              Get started by creating your first residential property listing.
            </p>
            <Link
              href="/seller/listings/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-primary text-white rounded-xl hover:bg-primary-btn transition-colors"
            >
              <PlusCircle size={14} />
              <span>Create Listing</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
