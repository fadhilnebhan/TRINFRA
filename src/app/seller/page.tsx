'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  PlusCircle,
  Clock,
  CheckCircle,
  XCircle,
  FileEdit,
  MessageSquare,
  LogOut,
  Trash2,
  Edit,
  Send,
  Eye,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
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
      setStatusMessage({ type: 'success', text: 'Listing submitted for admin review!' });
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
    <div className="min-h-screen bg-[#fafaf9] text-gray-900 pb-20 pt-24">
      {/* Top Seller Bar */}
      <div className="bg-white border-b border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shadow-xs">
                <Building2 size={24} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                  Seller Dashboard
                </h1>
                <p className="text-xs text-gray-500">
                  Welcome back, <span className="font-semibold text-gray-800">{seller?.fullName || 'Seller'}</span>
                  {seller?.companyName ? ` (${seller.companyName})` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/seller/enquiries"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <MessageSquare size={14} />
                <span>Enquiries ({stats.totalEnquiries})</span>
              </Link>
              <Link
                href="/seller/listings/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 shadow-sm transition-all"
              >
                <PlusCircle size={14} />
                <span>Create New Listing</span>
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Sign out"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Status Notification */}
        {statusMessage && (
          <div
            className={`mb-6 p-4 rounded-xl text-xs font-medium border flex items-center justify-between ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            <span>{statusMessage.text}</span>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-xs opacity-60 hover:opacity-100 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
              Total
            </span>
            <span className="text-2xl font-black text-gray-900">{stats.total}</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-emerald-100/60 shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 block mb-1 flex items-center gap-1">
              <CheckCircle size={12} /> Published
            </span>
            <span className="text-2xl font-black text-emerald-700">{stats.published}</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-amber-100/60 shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-600 block mb-1 flex items-center gap-1">
              <Clock size={12} /> Under Review
            </span>
            <span className="text-2xl font-black text-amber-700">{stats.pending}</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 block mb-1 flex items-center gap-1">
              <FileEdit size={12} /> Drafts
            </span>
            <span className="text-2xl font-black text-gray-700">{stats.draft}</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-red-100/60 shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-red-600 block mb-1 flex items-center gap-1">
              <XCircle size={12} /> Rejected
            </span>
            <span className="text-2xl font-black text-red-700">{stats.rejected}</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-primary/20 shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-primary block mb-1 flex items-center gap-1">
              <MessageSquare size={12} /> Enquiries
            </span>
            <span className="text-2xl font-black text-primary">{stats.totalEnquiries}</span>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-gray-100">
          {[
            { key: 'ALL', label: `All (${stats.total})` },
            { key: 'PUBLISHED', label: `Published (${stats.published})` },
            { key: 'PENDING_REVIEW', label: `Pending Review (${stats.pending})` },
            { key: 'DRAFT', label: `Drafts (${stats.draft})` },
            { key: 'REJECTED', label: `Rejected (${stats.rejected})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Listings List */}
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-32 bg-white rounded-2xl border border-gray-100" />
            ))}
          </div>
        ) : filteredListings.length > 0 ? (
          <div className="space-y-4">
            {filteredListings.map((listing) => {
              const coverImg = listing.images?.[0]?.url || '/images/houses_tropical.jpeg';
              const priceText = formatPrice(listing.price, listing.priceType, listing.listingPurpose);

              let statusBadge = (
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                  {listing.status}
                </span>
              );

              if (listing.status === 'PUBLISHED') {
                statusBadge = (
                  <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Live / Published
                  </span>
                );
              } else if (listing.status === 'PENDING_REVIEW') {
                statusBadge = (
                  <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    Pending Review
                  </span>
                );
              } else if (listing.status === 'REJECTED') {
                statusBadge = (
                  <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-red-50 text-red-700 border border-red-200">
                    Rejected
                  </span>
                );
              } else if (listing.status === 'DRAFT') {
                statusBadge = (
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                    Draft
                  </span>
                );
              }

              return (
                <div
                  key={listing.id}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs hover:shadow transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Thumbnail and info */}
                    <div className="flex items-start sm:items-center gap-4">
                      <div className="relative w-24 h-20 sm:w-28 sm:h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        <img src={coverImg} alt={listing.title} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          {statusBadge}
                          <span className="text-xs font-semibold text-gray-500 uppercase">
                            {listing.propertyType} • For {listing.listingPurpose}
                          </span>
                          <span className="text-xs font-medium text-gray-400">
                            in {listing.locality}, {listing.district}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-gray-900 leading-snug">
                          {listing.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                          <span className="font-bold text-gray-800">{priceText}</span>
                          <span>•</span>
                          <span>{listing.bedrooms} BHK</span>
                          <span>•</span>
                          <span>{listing.area} {listing.areaUnit}</span>
                          <span>•</span>
                          <span>{listing._count?.enquiries || 0} enquiries</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-center">
                      {listing.status === 'PUBLISHED' && (
                        <Link
                          href={`/residential/${listing.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-primary bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
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
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-xs transition-all disabled:opacity-50"
                        >
                          <Send size={12} />
                          <span>Submit for Review</span>
                        </button>
                      )}

                      <Link
                        href={`/seller/listings/${listing.id}/edit`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <Edit size={12} />
                        <span>Edit</span>
                      </Link>

                      <button
                        onClick={() => handleDeleteListing(listing.id, listing.title)}
                        disabled={actionLoading === listing.id}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete listing"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Rejection Feedback Banner */}
                  {listing.status === 'REJECTED' && listing.rejectionReason && (
                    <div className="mt-3.5 p-3 rounded-xl bg-red-50/80 border border-red-200 text-xs text-red-800 flex items-start gap-2">
                      <AlertTriangle size={15} className="shrink-0 mt-0.5 text-red-600" />
                      <div>
                        <span className="font-bold">Moderator Feedback: </span>
                        <span>{listing.rejectionReason}</span>
                        <p className="mt-1 text-[11px] text-red-600">
                          Please edit your listing to resolve this feedback and click &ldquo;Submit for Review&rdquo; again.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 max-w-md mx-auto">
            <Building2 size={36} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-base font-bold text-gray-900 mb-1">No listings found</h3>
            <p className="text-xs text-gray-500 mb-4">
              {activeTab === 'ALL'
                ? "You haven't listed any residential properties yet."
                : `No properties found under "${activeTab}".`}
            </p>
            <Link
              href="/seller/listings/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-primary text-white rounded-xl hover:bg-primary/90 shadow-xs transition-all"
            >
              <PlusCircle size={14} />
              <span>Create Your First Listing</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
