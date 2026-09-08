'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Upload,
  X,
  Building2,
  MapPin,
  FileText,
  DollarSign,
  Image as ImageIcon,
  AlertCircle,
} from 'lucide-react';
import CustomSelect from '@/components/opportunities/CustomSelect';
import { KERALA_14_DISTRICTS } from '@/lib/server/residential';

const PROPERTY_TYPES = [
  { value: 'Apartment', label: 'Apartment' },
  { value: 'Flat', label: 'Flat' },
  { value: 'Villa', label: 'Villa' },
  { value: 'House', label: 'Independent House' },
  { value: 'Penthouse', label: 'Penthouse' },
];

const LISTING_PURPOSES = [
  { value: 'Sale', label: 'For Sale' },
  { value: 'Rent', label: 'For Rent' },
];

const FURNISHED_STATUSES = [
  { value: 'Unfurnished', label: 'Unfurnished' },
  { value: 'Semi-Furnished', label: 'Semi-Furnished' },
  { value: 'Fully Furnished', label: 'Fully Furnished' },
];

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const listingId = params?.id as string;

  const [loadingListing, setLoadingListing] = useState(true);

  // Form Fields State
  const [title, setTitle] = useState('');
  const [propertyType, setPropertyType] = useState('Apartment');
  const [listingPurpose, setListingPurpose] = useState('Sale');
  const [description, setDescription] = useState('');

  const [district, setDistrict] = useState('Ernakulam');
  const [locality, setLocality] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');

  const [area, setArea] = useState('');
  const [areaUnit, setAreaUnit] = useState('sq ft');
  const [bedrooms, setBedrooms] = useState('2');
  const [bathrooms, setBathrooms] = useState('2');
  const [floor, setFloor] = useState('');
  const [totalFloors, setTotalFloors] = useState('');
  const [furnishedStatus, setFurnishedStatus] = useState('Semi-Furnished');
  const [parking, setParking] = useState('1 Covered');
  const [balcony, setBalcony] = useState('1');
  const [propertyAge, setPropertyAge] = useState('Ready to Move');
  const [facing, setFacing] = useState('East');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const [price, setPrice] = useState('');
  const [priceType, setPriceType] = useState('Total');
  const [negotiable, setNegotiable] = useState(true);

  // Uploaded images state
  const [images, setImages] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadListing = useCallback(async () => {
    if (!listingId) return;
    setLoadingListing(true);
    try {
      const res = await fetch(`/api/seller/listings/${listingId}`);
      if (!res.ok) throw new Error('Failed to load listing');
      const data = await res.json();
      const l = data.listing;

      setTitle(l.title || '');
      setPropertyType(l.propertyType || 'Apartment');
      setListingPurpose(l.listingPurpose || 'Sale');
      setDescription(l.description || '');
      setDistrict(l.district || 'Ernakulam');
      setLocality(l.locality || '');
      setAddress(l.address || '');
      setPincode(l.pincode || '');
      setArea(String(l.area || ''));
      setAreaUnit(l.areaUnit || 'sq ft');
      setBedrooms(String(l.bedrooms || '2'));
      setBathrooms(String(l.bathrooms || '2'));
      setFloor(l.floor !== null ? String(l.floor) : '');
      setTotalFloors(l.totalFloors !== null ? String(l.totalFloors) : '');
      setFurnishedStatus(l.furnishedStatus || 'Semi-Furnished');
      setParking(l.parking || '1 Covered');
      setBalcony(l.balcony !== null ? String(l.balcony) : '1');
      setPropertyAge(l.propertyAge || 'Ready to Move');
      setFacing(l.facing || 'East');
      setSelectedAmenities(Array.isArray(l.amenities) ? l.amenities : []);
      setPrice(String(l.price || ''));
      setPriceType(l.priceType || 'Total');
      setNegotiable(Boolean(l.negotiable));
      setImages(Array.isArray(l.images) ? l.images : []);
    } catch (err: any) {
      setFormError(err.message || 'Failed to load listing data');
    } finally {
      setLoadingListing(false);
    }
  }, [listingId]);

  useEffect(() => {
    loadListing();
  }, [loadListing]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/seller/upload-image', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || `Failed to upload ${file.name}`);
        }

        setImages((prev) => [
          ...prev,
          {
            ...data.image,
            isCover: prev.length === 0,
          },
        ]);
      }
    } catch (err: any) {
      setUploadError(err.message || 'Error uploading images');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, idx) => idx !== index);
      if (updated.length > 0 && !updated.some((img) => img.isCover)) {
        updated[0].isCover = true;
      }
      return updated;
    });
  };

  const setCoverImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, idx) => ({
        ...img,
        isCover: idx === index,
      }))
    );
  };

  const handleSave = async (submitForReview: boolean) => {
    setFormError(null);

    if (!title.trim()) {
      setFormError('Title is required.');
      return;
    }
    if (!locality.trim()) {
      setFormError('Locality is required.');
      return;
    }
    if (!price || Number(price) <= 0) {
      setFormError('Valid price is required.');
      return;
    }
    if (!area || Number(area) <= 0) {
      setFormError('Valid area is required.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        propertyType,
        listingPurpose,
        description: description.trim(),
        district,
        locality: locality.trim(),
        address: address.trim() || null,
        pincode: pincode.trim() || null,
        area: Number(area),
        areaUnit,
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        floor: floor ? Number(floor) : null,
        totalFloors: totalFloors ? Number(totalFloors) : null,
        furnishedStatus,
        parking,
        balcony: balcony ? Number(balcony) : null,
        propertyAge,
        facing,
        amenities: selectedAmenities,
        price: Number(price),
        priceType: listingPurpose === 'Rent' ? 'Per Month' : priceType,
        negotiable,
        images,
        submitForReview,
      };

      const res = await fetch(`/api/seller/listings/${listingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update listing');
      }

      router.push('/seller');
      router.refresh();
    } catch (err: any) {
      setFormError(err.message || 'Failed to update listing');
    } finally {
      setSubmitting(false);
    }
  };

  const districtOptions = KERALA_14_DISTRICTS.map((d) => ({
    value: d,
    label: d,
  }));

  if (loadingListing) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center pt-20">
        <div className="text-xs text-gray-500 font-semibold animate-pulse">Loading listing details...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] text-gray-900 pb-20 pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/seller"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft size={14} />
          <span>Back to Seller Dashboard</span>
        </Link>

        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
          <div className="mb-6 pb-6 border-b border-gray-100">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Edit Residential Listing
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Update property specifications, photos, and price. Submitting changes sends this listing for admin review.
            </p>
          </div>

          {formError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <div className="space-y-8">
            {/* 1. Basic Info */}
            <section className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                <Building2 size={16} className="text-primary" />
                <span>1. Basic Property Information</span>
              </h2>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Property Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Property Type
                  </label>
                  <CustomSelect
                    value={propertyType}
                    onChange={setPropertyType}
                    options={PROPERTY_TYPES}
                    aria-label="Property Type"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Listing Purpose
                  </label>
                  <CustomSelect
                    value={listingPurpose}
                    onChange={setListingPurpose}
                    options={LISTING_PURPOSES}
                    aria-label="Listing Purpose"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>
            </section>

            {/* 2. Location */}
            <section className="space-y-4 pt-6 border-t border-gray-100">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                <MapPin size={16} className="text-primary" />
                <span>2. Location & District</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Kerala District *
                  </label>
                  <CustomSelect
                    value={district}
                    onChange={setDistrict}
                    options={districtOptions}
                    aria-label="Select Kerala District"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Locality / Neighborhood *
                  </label>
                  <input
                    type="text"
                    required
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Street Address (Optional)
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    PIN Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            </section>

            {/* 3. Specs */}
            <section className="space-y-4 pt-6 border-t border-gray-100">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                <FileText size={16} className="text-primary" />
                <span>3. Specifications</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Area (sq ft) *</label>
                  <input
                    type="number"
                    required
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Bedrooms *</label>
                  <input
                    type="number"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Bathrooms *</label>
                  <input
                    type="number"
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Furnishing</label>
                  <CustomSelect
                    value={furnishedStatus}
                    onChange={setFurnishedStatus}
                    options={FURNISHED_STATUSES}
                    size="sm"
                  />
                </div>
              </div>
            </section>

            {/* 4. Pricing */}
            <section className="space-y-4 pt-6 border-t border-gray-100">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                <DollarSign size={16} className="text-primary" />
                <span>4. Pricing</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={negotiable}
                      onChange={(e) => setNegotiable(e.target.checked)}
                      className="rounded text-primary focus:ring-primary"
                    />
                    <span className="text-xs font-semibold text-gray-700">Price is Negotiable</span>
                  </label>
                </div>
              </div>
            </section>

            {/* 5. Photos */}
            <section className="space-y-4 pt-6 border-t border-gray-100">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                <ImageIcon size={16} className="text-primary" />
                <span>5. Property Photos</span>
              </h2>

              {uploadError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                  {uploadError}
                </div>
              )}

              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-primary/50 transition-colors bg-gray-50/50">
                <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                <label className="cursor-pointer">
                  <span className="px-4 py-2 text-xs font-semibold text-white bg-primary rounded-xl hover:bg-primary/90 transition-all inline-block shadow-xs">
                    {uploading ? 'Uploading...' : 'Add More Photos'}
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    disabled={uploading}
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-xs"
                    >
                      <img src={img.url} alt="Uploaded" className="w-full h-full object-cover" />
                      {img.isCover && (
                        <div className="absolute top-1.5 left-1.5 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                          Cover
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {!img.isCover && (
                          <button
                            type="button"
                            onClick={() => setCoverImage(idx)}
                            className="text-[10px] font-bold px-2 py-1 rounded bg-white text-gray-800"
                          >
                            Set Cover
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="p-1.5 rounded-full bg-red-600 text-white"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Actions */}
            <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSave(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs sm:text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Save Changes
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSave(true)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary text-white text-xs sm:text-sm font-semibold hover:bg-primary/90 shadow-sm transition-all"
              >
                {submitting ? 'Saving...' : 'Save & Submit for Review'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
