'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  AlertTriangle,
  ExternalLink,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  Layers,
  Sparkles,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldCheck,
  Check,
  MessageSquare,
  DollarSign,
  Info,
} from 'lucide-react';
import { formatPrice } from '@/components/residential/ResidentialCard';

interface ResidentialImage {
  id: string;
  storageKey: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  sortOrder: number;
  isCover: boolean;
  createdAt: string;
}

interface ResidentialEnquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: string;
  createdAt: string;
}

interface SellerInfo {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  companyName?: string | null;
  createdAt?: string;
  _count?: {
    listings: number;
  };
}

interface ResidentialListingDetail {
  id: string;
  sellerId: string;
  seller: SellerInfo;
  title: string;
  slug: string;
  propertyType: string;
  listingPurpose: string;
  description: string;
  district: string;
  locality: string;
  address?: string | null;
  pincode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  area: number;
  areaUnit: string;
  bedrooms: number;
  bathrooms: number;
  floor?: number | null;
  totalFloors?: number | null;
  furnishedStatus?: string | null;
  parking?: string | null;
  balcony?: number | null;
  propertyAge?: string | null;
  facing?: string | null;
  price: number;
  priceType: string;
  negotiable: boolean;
  amenities: string[];
  status: string;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
  images: ResidentialImage[];
  enquiries: ResidentialEnquiry[];
}

export default function AdminResidentialDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params?.id as string;

  const [listing, setListing] = useState<ResidentialListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Moderation state
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Gallery & Lightbox
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Rejection modal
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchListing = useCallback(async (showLoading = true) => {
    if (!listingId) return;
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/residential/listings/${listingId}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch listing details');
      }
      setListing(data.listing);
      // Set active image to cover image if exists
      const coverIdx = data.listing.images?.findIndex((img: ResidentialImage) => img.isCover);
      if (coverIdx && coverIdx > 0) {
        setActiveImageIndex(coverIdx);
      } else {
        setActiveImageIndex(0);
      }
    } catch (err: any) {
      console.error('Error loading residential detail:', err);
      setError(err.message || 'Listing not found');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    fetchListing(true);
  }, [fetchListing]);

  // Handle keyboard navigation for lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowRight' && listing?.images && listing.images.length > 0) {
        setActiveImageIndex((prev) => (prev + 1) % listing.images.length);
      }
      if (e.key === 'ArrowLeft' && listing?.images && listing.images.length > 0) {
        setActiveImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, listing?.images]);

  // Moderation Handlers
  const handleApprove = async () => {
    if (!listing) return;
    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/admin/residential/listings/${listing.id}/approve`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to approve listing');

      setListing((prev) => (prev ? { ...prev, status: 'PUBLISHED', publishedAt: new Date().toISOString(), rejectionReason: null } : null));
      setActionMessage({ type: 'success', text: 'Listing approved and published publicly!' });
      fetchListing(false);
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Error approving listing' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!listing) return;
    if (!rejectionReason.trim() || rejectionReason.trim().length < 5) {
      alert('Please provide a specific rejection feedback message of at least 5 characters.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/residential/listings/${listing.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectionReason: rejectionReason.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to reject listing');

      setListing((prev) => (prev ? { ...prev, status: 'REJECTED', rejectionReason: rejectionReason.trim() } : null));
      setIsRejectModalOpen(false);
      setActionMessage({ type: 'success', text: 'Listing rejected and feedback notified to seller.' });
      fetchListing(false);
    } catch (err: any) {
      alert(err.message || 'Error rejecting listing');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnpublish = async () => {
    if (!listing) return;
    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/admin/residential/listings/${listing.id}/unpublish`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to unpublish listing');

      setListing((prev) => (prev ? { ...prev, status: 'UNPUBLISHED' } : null));
      setActionMessage({ type: 'success', text: 'Listing unpublished and hidden from public marketplace.' });
      fetchListing(false);
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Error unpublishing listing' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!listing) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/residential/listings/${listing.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to delete listing');

      router.push('/admin/residential');
    } catch (err: any) {
      alert(err.message || 'Error deleting listing');
      setActionLoading(false);
    }
  };

  // Helper formatting
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse pb-16">
        <div className="h-6 bg-gray-200 rounded w-48" />
        <div className="h-10 bg-gray-200 rounded w-3/4" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="h-96 bg-gray-200 rounded-2xl" />
            <div className="h-48 bg-gray-200 rounded-2xl" />
          </div>
          <div className="lg:col-span-4 space-y-6">
            <div className="h-64 bg-gray-200 rounded-2xl" />
            <div className="h-48 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="py-16 text-center space-y-4 max-w-lg mx-auto">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <AlertTriangle size={28} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Listing Not Found</h2>
        <p className="text-sm text-gray-600">
          The requested residential property does not exist, has been deleted, or you do not have permission to view it.
        </p>
        <div className="pt-2">
          <Link
            href="/admin/residential"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-btn transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Return to Residential Flats</span>
          </Link>
        </div>
      </div>
    );
  }

  const images = listing.images && listing.images.length > 0 ? listing.images : [];
  const currentImage = images[activeImageIndex] || null;
  const priceDisplay = formatPrice(listing.price, listing.priceType, listing.listingPurpose);
  const pricePerSqFt = listing.area > 0 ? Math.round(listing.price / listing.area) : 0;

  return (
    <div className="space-y-8 pb-20">
      {/* ================= BREADCRUMB & HEADER ================= */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Link
            href="/admin/residential"
            className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
          >
            <ArrowLeft size={13} />
            <span>Back to Residential Flats</span>
          </Link>
          <span>/</span>
          <span className="text-gray-400 font-mono text-[11px] truncate max-w-[200px]">{listing.id}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                {listing.title}
              </h1>
              {listing.status === 'PUBLISHED' && (
                <span className="px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-emerald-100 text-emerald-800 border border-emerald-200">
                  PUBLISHED
                </span>
              )}
              {listing.status === 'PENDING_REVIEW' && (
                <span className="px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-amber-100 text-amber-800 border border-amber-200">
                  PENDING REVIEW
                </span>
              )}
              {listing.status === 'REJECTED' && (
                <span className="px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-red-100 text-red-800 border border-red-200">
                  REJECTED
                </span>
              )}
              {listing.status === 'UNPUBLISHED' && (
                <span className="px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-gray-200 text-gray-700">
                  UNPUBLISHED
                </span>
              )}
              {listing.status === 'DRAFT' && (
                <span className="px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-blue-50 text-blue-700 border border-blue-200">
                  DRAFT
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1">
                <MapPin size={13} className="text-gray-400" />
                <span>{listing.locality}, {listing.district}, Kerala</span>
              </span>
              <span>•</span>
              <span>{listing.propertyType}</span>
              <span>•</span>
              <span>For {listing.listingPurpose}</span>
              <span>•</span>
              <span className="font-mono text-[11px] text-gray-400">ID: {listing.id}</span>
            </div>
          </div>

          {/* Quick External Link if Published */}
          {listing.status === 'PUBLISHED' && (
            <div className="shrink-0">
              <Link
                href={`/residential/${listing.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:text-primary transition-colors shadow-2xs"
              >
                <ExternalLink size={14} />
                <span>View Public Page</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Action Message Alert */}
      {actionMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between gap-2 ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <span>{actionMessage.text}</span>
          <button
            onClick={() => setActionMessage(null)}
            className="p-1 hover:opacity-70"
            aria-label="Dismiss message"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ================= MAIN 2-COLUMN GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ================= LEFT COLUMN: PROPERTY DETAILS (8 COLS) ================= */}
        <div className="lg:col-span-8 space-y-6">
          {/* ====== 1. PHOTO GALLERY & INSPECTION ====== */}
          <section className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building size={16} className="text-primary" />
                <h3 className="font-bold text-sm text-gray-900">
                  Photo Gallery ({images.length} photo{images.length === 1 ? '' : 's'})
                </h3>
              </div>
              {images.length > 0 && (
                <button
                  onClick={() => setIsLightboxOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-btn transition-colors px-2.5 py-1 rounded-lg hover:bg-primary/5"
                >
                  <Maximize2 size={13} />
                  <span>Inspect Fullscreen</span>
                </button>
              )}
            </div>

            {images.length > 0 ? (
              <div className="p-4 space-y-4">
                {/* Main Preview */}
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-gray-900 group">
                  <img
                    src={currentImage?.url || '/images/houses_tropical.jpeg'}
                    alt={listing.title}
                    className="w-full h-full object-contain cursor-pointer"
                    onClick={() => setIsLightboxOpen(true)}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/houses_tropical.jpeg';
                    }}
                  />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    {currentImage?.isCover && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-primary text-white shadow-md flex items-center gap-1">
                        <Sparkles size={11} />
                        <span>Cover Photo</span>
                      </span>
                    )}
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs">
                      {activeImageIndex + 1} of {images.length}
                    </span>
                  </div>

                  {/* Navigation Arrows */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length)
                        }
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white hover:bg-black/75 flex items-center justify-center transition-opacity opacity-80 group-hover:opacity-100"
                        aria-label="Previous photo"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={() => setActiveImageIndex((prev) => (prev + 1) % images.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white hover:bg-black/75 flex items-center justify-center transition-opacity opacity-80 group-hover:opacity-100"
                        aria-label="Next photo"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnails strip */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
                  {images.map((img, idx) => (
                    <button
                      key={img.id || idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                        activeImageIndex === idx
                          ? 'border-primary ring-2 ring-primary/20 scale-95'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/houses_tropical.jpeg';
                        }}
                      />
                      {img.isCover && (
                        <span className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full bg-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400 text-xs space-y-2">
                <Building size={28} className="mx-auto text-gray-300" />
                <p>No photos uploaded for this property listing.</p>
              </div>
            )}
          </section>

          {/* ====== 2. PROPERTY SPECIFICATIONS (Strictly in sq ft) ====== */}
          <section className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                <Layers size={16} className="text-primary" />
                <span>Property Specifications</span>
              </h3>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Area Unit: {listing.areaUnit || 'sq ft'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Property Area - STRICTLY SQ FT */}
              <div className="bg-[#FAFBF9] p-3.5 rounded-xl border border-gray-100">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                  Property Area
                </span>
                <span className="text-base font-extrabold text-gray-900" id="admin-detail-property-area">
                  {listing.area ? listing.area.toLocaleString('en-IN') : '—'} {listing.areaUnit || 'sq ft'}
                </span>
              </div>

              {/* Bedrooms */}
              <div className="bg-[#FAFBF9] p-3.5 rounded-xl border border-gray-100">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                  Bedrooms
                </span>
                <span className="text-base font-extrabold text-gray-900">
                  {listing.bedrooms ? `${listing.bedrooms} BHK` : '—'}
                </span>
              </div>

              {/* Bathrooms */}
              <div className="bg-[#FAFBF9] p-3.5 rounded-xl border border-gray-100">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                  Bathrooms
                </span>
                <span className="text-base font-extrabold text-gray-900">
                  {listing.bathrooms ?? '—'}
                </span>
              </div>

              {/* Furnishing */}
              <div className="bg-[#FAFBF9] p-3.5 rounded-xl border border-gray-100">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                  Furnishing
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {listing.furnishedStatus || 'Unspecified'}
                </span>
              </div>

              {/* Parking */}
              <div className="bg-[#FAFBF9] p-3.5 rounded-xl border border-gray-100">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                  Parking
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {listing.parking || 'Unspecified'}
                </span>
              </div>

              {/* Floor & Total */}
              <div className="bg-[#FAFBF9] p-3.5 rounded-xl border border-gray-100">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                  Floor Level
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {listing.floor !== null && listing.floor !== undefined
                    ? `Floor ${listing.floor} ${listing.totalFloors ? `of ${listing.totalFloors}` : ''}`
                    : listing.totalFloors
                    ? `${listing.totalFloors} Total Floors`
                    : 'Not specified'}
                </span>
              </div>

              {/* Balconies */}
              <div className="bg-[#FAFBF9] p-3.5 rounded-xl border border-gray-100">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                  Balconies
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {listing.balcony ?? 'None'}
                </span>
              </div>

              {/* Property Age */}
              <div className="bg-[#FAFBF9] p-3.5 rounded-xl border border-gray-100">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                  Property Age
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {listing.propertyAge || 'Not specified'}
                </span>
              </div>

              {/* Facing Direction */}
              <div className="bg-[#FAFBF9] p-3.5 rounded-xl border border-gray-100">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                  Facing
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {listing.facing || 'Not specified'}
                </span>
              </div>
            </div>
          </section>

          {/* ====== 3. LOCATION INFORMATION ====== */}
          <section className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <MapPin size={16} className="text-primary" />
              <span>Property Location</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
                  Kerala District
                </span>
                <div className="font-bold text-gray-900 text-sm">{listing.district}</div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
                  City / Town / Locality
                </span>
                <div className="font-bold text-gray-900 text-sm">{listing.locality}</div>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
                  Street / Address
                </span>
                <div className="font-medium text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  {listing.address || 'No specific street address provided by seller.'}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
                  Pincode
                </span>
                <div className="font-mono font-bold text-gray-900">{listing.pincode || '—'}</div>
              </div>

              {listing.latitude && listing.longitude && (
                <div className="space-y-1">
                  <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
                    GPS Coordinates
                  </span>
                  <div className="font-mono text-gray-700 flex items-center gap-2">
                    <span>{listing.latitude.toFixed(5)}, {listing.longitude.toFixed(5)}</span>
                    <a
                      href={`https://www.google.com/maps?q=${listing.latitude},${listing.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-sans font-bold flex items-center gap-0.5"
                    >
                      <span>Open Map</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ====== 4. PRICING & LEGAL DETAILS ====== */}
          <section className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <DollarSign size={16} className="text-primary" />
              <span>Pricing & Commercial Terms</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/15">
                <span className="text-[11px] text-primary font-bold uppercase tracking-wider block mb-1">
                  Listed Price
                </span>
                <div className="text-xl font-black text-gray-900">
                  {priceDisplay}
                </div>
                <div className="text-[11px] text-gray-500 mt-1">
                  Raw: ₹{listing.price.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider block mb-1">
                  Rate Per Sq Ft
                </span>
                <div className="text-lg font-extrabold text-gray-900">
                  {pricePerSqFt > 0 ? `₹${pricePerSqFt.toLocaleString('en-IN')} / sq ft` : '—'}
                </div>
                <div className="text-[11px] text-gray-500 mt-1">Calculated built-up rate</div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider block mb-1">
                  Price Flexibility
                </span>
                <div className="text-sm font-bold text-gray-900 mt-0.5">
                  {listing.negotiable ? (
                    <span className="text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full text-xs font-bold">
                      Negotiable
                    </span>
                  ) : (
                    <span className="text-gray-700 bg-gray-200/60 px-2 py-0.5 rounded-full text-xs font-bold">
                      Fixed Price
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-gray-500 mt-1.5">Price type: {listing.priceType}</div>
              </div>
            </div>
          </section>

          {/* ====== 5. AMENITIES ====== */}
          <section className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-gray-900 border-b border-gray-100 pb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles size={16} className="text-primary" />
                <span>Amenities & Features</span>
              </span>
              <span className="text-xs font-bold text-gray-400">
                {listing.amenities?.length || 0} selected
              </span>
            </h3>

            {listing.amenities && listing.amenities.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {listing.amenities.map((amenity, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50/80 text-emerald-900 border border-emerald-200/70"
                  >
                    <Check size={13} className="text-emerald-600" />
                    <span>{amenity}</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No specific amenities selected for this listing.</p>
            )}
          </section>

          {/* ====== 6. PROPERTY DESCRIPTION ====== */}
          <section className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-2xs space-y-3">
            <h3 className="font-bold text-sm text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Info size={16} className="text-primary" />
              <span>Seller Description & Notes</span>
            </h3>
            <div className="text-xs leading-relaxed text-gray-700 whitespace-pre-line bg-[#FAFBF9] p-4 rounded-xl border border-gray-100">
              {listing.description || 'No additional narrative description provided.'}
            </div>
          </section>

          {/* ====== 7. ENQUIRIES RECEIVED ====== */}
          <section className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-gray-900 border-b border-gray-100 pb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MessageSquare size={16} className="text-primary" />
                <span>Buyer Enquiries Received</span>
              </span>
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                {listing.enquiries?.length || 0} total
              </span>
            </h3>

            {listing.enquiries && listing.enquiries.length > 0 ? (
              <div className="divide-y divide-gray-100 text-xs">
                {listing.enquiries.map((enq) => (
                  <div key={enq.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">{enq.name}</span>
                      <span className="text-[10px] text-gray-400">{formatDate(enq.createdAt)}</span>
                    </div>
                    <div className="text-gray-500 flex items-center gap-3">
                      <span>{enq.email}</span>
                      <span>•</span>
                      <span>{enq.phone}</span>
                      <span className="ml-auto font-bold text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                        {enq.status}
                      </span>
                    </div>
                    {enq.message && (
                      <p className="text-gray-700 bg-gray-50 p-2 rounded-lg mt-1 italic">
                        &ldquo;{enq.message}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No buyer enquiries recorded for this listing yet.</p>
            )}
          </section>
        </div>

        {/* ================= RIGHT COLUMN: MODERATION & SELLER (4 COLS) ================= */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          {/* ====== 1. MODERATION ACTION CENTER ====== */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                <ShieldCheck size={16} className="text-primary" />
                <span>Moderation Review</span>
              </h3>
              <span className="text-[11px] font-mono text-gray-400">Status</span>
            </div>

            {/* Status Announcement Banner */}
            {listing.status === 'PENDING_REVIEW' && (
              <div className="bg-amber-50 border border-amber-200/90 rounded-xl p-3.5 space-y-1.5 text-xs text-amber-900">
                <div className="font-extrabold flex items-center gap-1.5">
                  <Clock size={14} className="text-amber-600 shrink-0" />
                  <span>Awaiting Admin Moderation</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-800">
                  Inspect submitted images, property specifications, and seller credentials before deciding to approve or reject.
                </p>
              </div>
            )}

            {listing.status === 'PUBLISHED' && (
              <div className="bg-emerald-50 border border-emerald-200/90 rounded-xl p-3.5 space-y-1 text-xs text-emerald-900">
                <div className="font-extrabold flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-emerald-600 shrink-0" />
                  <span>Live on Marketplace</span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  Published on {formatDate(listing.publishedAt)}. Visible to all public buyers.
                </p>
              </div>
            )}

            {listing.status === 'REJECTED' && (
              <div className="bg-red-50 border border-red-200/90 rounded-xl p-3.5 space-y-1.5 text-xs text-red-900">
                <div className="font-extrabold flex items-center gap-1.5">
                  <XCircle size={14} className="text-red-600 shrink-0" />
                  <span>Listing Rejected</span>
                </div>
                {listing.rejectionReason && (
                  <div className="text-[11px] bg-white/70 p-2 rounded-lg border border-red-200 text-red-800">
                    <span className="font-bold">Feedback Sent: </span>
                    {listing.rejectionReason}
                  </div>
                )}
              </div>
            )}

            {listing.status === 'UNPUBLISHED' && (
              <div className="bg-gray-100 border border-gray-200 rounded-xl p-3.5 text-xs text-gray-800 space-y-1">
                <div className="font-extrabold">Unpublished</div>
                <p className="text-[11px] text-gray-600">
                  This listing is currently hidden from the public marketplace.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              {listing.status !== 'PUBLISHED' && (
                <button
                  id="admin-detail-approve-btn"
                  disabled={actionLoading}
                  onClick={handleApprove}
                  className="w-full py-2.5 px-4 min-h-[44px] rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle size={15} />
                  <span>{actionLoading ? 'Processing...' : 'Approve & Publish Listing'}</span>
                </button>
              )}

              {listing.status === 'PENDING_REVIEW' && (
                <button
                  id="admin-detail-reject-btn"
                  disabled={actionLoading}
                  onClick={() => {
                    setRejectionReason('');
                    setIsRejectModalOpen(true);
                  }}
                  className="w-full py-2.5 px-4 min-h-[44px] rounded-xl text-xs font-extrabold bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <XCircle size={15} />
                  <span>Reject with Feedback</span>
                </button>
              )}

              {listing.status === 'PUBLISHED' && (
                <>
                  <Link
                    href={`/residential/${listing.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 min-h-[44px] rounded-xl text-xs font-extrabold bg-primary hover:bg-primary-btn text-white transition-colors flex items-center justify-center gap-2 shadow-2xs"
                  >
                    <ExternalLink size={15} />
                    <span>View Public Listing</span>
                  </Link>

                  <button
                    id="admin-detail-unpublish-btn"
                    disabled={actionLoading}
                    onClick={handleUnpublish}
                    className="w-full py-2.5 px-4 min-h-[44px] rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>Unpublish from Marketplace</span>
                  </button>
                </>
              )}

              {/* Rejection / Draft re-moderation options */}
              {listing.status === 'REJECTED' && (
                <button
                  disabled={actionLoading}
                  onClick={() => {
                    setRejectionReason('');
                    setIsRejectModalOpen(true);
                  }}
                  className="w-full py-2 px-3 text-xs font-semibold text-gray-600 hover:text-gray-900 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Update Rejection Reason
                </button>
              )}

              {/* Danger Zone: Delete Listing */}
              <div className="pt-3 border-t border-gray-100">
                <button
                  id="admin-detail-delete-btn"
                  disabled={actionLoading}
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="w-full py-2 px-3 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={13} />
                  <span>Delete Listing Permanently</span>
                </button>
              </div>
            </div>
          </div>

          {/* ====== 2. VERIFIED SELLER IDENTITY ====== */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <User size={16} className="text-primary" />
              <span>Seller Information</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider block mb-0.5">
                  Full Name
                </span>
                <div className="font-bold text-gray-900 text-sm">{listing.seller?.fullName || '—'}</div>
              </div>

              <div>
                <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider block mb-0.5">
                  Email Address
                </span>
                <a
                  href={`mailto:${listing.seller?.email}`}
                  className="text-primary font-semibold hover:underline flex items-center gap-1"
                >
                  <Mail size={12} />
                  <span>{listing.seller?.email || '—'}</span>
                </a>
              </div>

              <div>
                <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider block mb-0.5">
                  Phone Number
                </span>
                {listing.seller?.phone ? (
                  <a
                    href={`tel:${listing.seller.phone}`}
                    className="text-primary font-semibold hover:underline flex items-center gap-1"
                  >
                    <Phone size={12} />
                    <span>{listing.seller.phone}</span>
                  </a>
                ) : (
                  <span className="text-gray-400">Not provided</span>
                )}
              </div>

              {listing.seller?.companyName && (
                <div>
                  <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider block mb-0.5">
                    Company / Organization
                  </span>
                  <div className="font-bold text-gray-800">{listing.seller.companyName}</div>
                </div>
              )}

              <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-gray-400 block">Total Listings:</span>
                  <span className="font-bold text-gray-800">
                    {listing.seller?._count?.listings ?? 1} propert{listing.seller?._count?.listings === 1 ? 'y' : 'ies'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">Member Since:</span>
                  <span className="font-bold text-gray-800">
                    {formatDate(listing.seller?.createdAt).split(',')[0]}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ====== 3. LIFECYCLE & AUDIT TIMELINE ====== */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-sm space-y-3 text-xs">
            <h3 className="font-bold text-sm text-gray-900 border-b border-gray-100 pb-2.5 flex items-center gap-2">
              <Calendar size={15} className="text-primary" />
              <span>Listing Timeline</span>
            </h3>

            <div className="space-y-2.5 text-gray-600">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Submitted:</span>
                <span className="font-semibold text-gray-900">{formatDate(listing.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Last Modified:</span>
                <span className="font-semibold text-gray-900">{formatDate(listing.updatedAt)}</span>
              </div>
              {listing.publishedAt && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Published:</span>
                  <span className="font-semibold text-emerald-700">{formatDate(listing.publishedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= FULLSCREEN LIGHTBOX MODAL ================= */}
      {isLightboxOpen && images.length > 0 && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex flex-col justify-between p-4 sm:p-6 backdrop-blur-md"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Top Bar */}
          <div
            className="flex items-center justify-between text-white pb-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-xs sm:text-sm font-semibold text-white/80">
              {listing.title} • {activeImageIndex + 1} of {images.length}
            </div>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close Lightbox"
            >
              <X size={20} />
            </button>
          </div>

          {/* Central Image View */}
          <div
            className="relative flex-1 flex items-center justify-center overflow-hidden my-2"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentImage?.url || '/images/houses_tropical.jpeg'}
              alt=""
              className="max-h-full max-w-full object-contain rounded-lg shadow-2xl select-none"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/houses_tropical.jpeg';
              }}
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length)
                  }
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 text-white hover:bg-black/90 flex items-center justify-center transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev + 1) % images.length)}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 text-white hover:bg-black/90 flex items-center justify-center transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          <div
            className="flex items-center justify-center gap-2 overflow-x-auto py-2"
            onClick={(e) => e.stopPropagation()}
            style={{ scrollbarWidth: 'thin' }}
          >
            {images.map((img, idx) => (
              <button
                key={img.id || idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                  activeImageIndex === idx
                    ? 'border-primary ring-2 ring-primary/40 scale-105'
                    : 'border-transparent opacity-50 hover:opacity-100'
                }`}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ================= REJECTION REASON MODAL ================= */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <XCircle size={18} className="text-red-600" />
                <span>Reject Listing with Feedback</span>
              </h3>
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Provide clear feedback to the seller explaining why this property cannot be approved at this time. The seller will be notified and can make corrections.
            </p>

            <textarea
              id="admin-detail-reject-reason-input"
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Please provide clearer photos of the building exterior, verify RERA number, or adjust the built-up area specification..."
              className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                id="admin-detail-confirm-reject-btn"
                disabled={actionLoading || rejectionReason.trim().length < 5}
                onClick={handleConfirmReject}
                className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-900">Delete Property Listing?</h3>
                <p className="text-xs text-gray-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 bg-red-50 p-3 rounded-xl border border-red-100">
              Permanently delete <span className="font-bold text-gray-900">&ldquo;{listing.title}&rdquo;</span> ({listing.id}) from PostgreSQL and remove its public record.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                id="admin-detail-confirm-delete-btn"
                disabled={actionLoading}
                onClick={handleDelete}
                className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
