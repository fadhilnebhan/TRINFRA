'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Upload,
  X,
  Check,
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

const PARKING_OPTIONS = [
  { value: 'None', label: 'No Parking' },
  { value: '1 Covered', label: '1 Covered Parking' },
  { value: '2 Covered', label: '2 Covered Parking' },
  { value: 'Open', label: 'Open Parking' },
];

const PROPERTY_AGE_OPTIONS = [
  { value: 'Ready to Move', label: 'Ready to Move' },
  { value: 'Under Construction', label: 'Under Construction' },
  { value: '0-1 years', label: '0 to 1 Year Old' },
  { value: '1-5 years', label: '1 to 5 Years Old' },
  { value: '5+ years', label: '5+ Years Old' },
];

const FACING_OPTIONS = [
  { value: 'East', label: 'East Facing' },
  { value: 'West', label: 'West Facing' },
  { value: 'North', label: 'North Facing' },
  { value: 'South', label: 'South Facing' },
  { value: 'North-East', label: 'North-East Facing' },
  { value: 'North-West', label: 'North-West Facing' },
  { value: 'South-East', label: 'South-East Facing' },
  { value: 'South-West', label: 'South-West Facing' },
];

const COMMON_AMENITIES = [
  'Swimming Pool',
  'Gymnasium',
  '24/7 Security & CCTV',
  'Power Backup',
  'Lift Access',
  'Clubhouse',
  'Children Play Area',
  'Covered Parking',
  'EV Charging Station',
  'Intercom Facility',
  'Waste Treatment Plant',
  'Solar Water Heater',
  'Private Balcony',
  'Sea / River View',
];

export default function NewListingPage() {
  const router = useRouter();

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
  const areaUnit = 'sq ft';
  const [bedrooms, setBedrooms] = useState('2');
  const [bathrooms, setBathrooms] = useState('2');
  const [floor, setFloor] = useState('');
  const [totalFloors, setTotalFloors] = useState('');
  const [furnishedStatus, setFurnishedStatus] = useState('Semi-Furnished');
  const [parking, setParking] = useState('1 Covered');
  const [balcony, setBalcony] = useState('1');
  const [propertyAge, setPropertyAge] = useState('Ready to Move');
  const [facing, setFacing] = useState('East');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    '24/7 Security & CCTV',
    'Power Backup',
    'Lift Access',
  ]);

  const [price, setPrice] = useState('');
  const priceType = 'Total';
  const [negotiable, setNegotiable] = useState(true);

  // Uploaded images state
  const [images, setImages] = useState<
    Array<{ storageKey: string; url: string; filename: string; mimeType: string; size: number; isCover?: boolean }>
  >([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

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
            isCover: prev.length === 0, // first uploaded image is cover by default
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

  const handleSubmit = async (submitForReview: boolean) => {
    setFormError(null);

    // Validation
    if (!title.trim() || title.trim().length < 3) {
      setFormError('Please provide a property title (at least 3 characters).');
      return;
    }
    if (!locality.trim()) {
      setFormError('Please provide a locality or neighborhood.');
      return;
    }
    if (!price || Number(price) <= 0) {
      setFormError('Please provide a valid property price.');
      return;
    }
    if (!area || Number(area) <= 0) {
      setFormError('Please enter a valid area.');
      return;
    }
    if (submitForReview && images.length === 0) {
      setFormError('Please upload at least one property photo before submitting for review.');
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

      const res = await fetch('/api/seller/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save listing');
      }

      router.push('/seller');
      router.refresh();
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit listing');
    } finally {
      setSubmitting(false);
    }
  };

  const districtOptions = KERALA_14_DISTRICTS.map((d) => ({
    value: d,
    label: d,
  }));

  return (
    <div className="min-h-screen bg-[#fafaf9] text-gray-900 pb-20 pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Breadcrumb */}
        <Link
          href="/seller"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft size={14} />
          <span>Back to Seller Dashboard</span>
        </Link>

        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
          <div className="mb-6 pb-6 border-b border-gray-100">
            <h1 className="text-xl sm:text-2xl font-heading font-bold text-gray-900 tracking-tight">
              Create Residential Listing
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Add a verified flat, apartment, or residential home to the TRINFRA marketplace.
            </p>
          </div>

          {/* Visual Step Indicator */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-8 pb-6 border-b border-gray-100 text-center">
            {[
              { num: '1', title: 'Basic Info' },
              { num: '2', title: 'Location' },
              { num: '3', title: 'Specs' },
              { num: '4', title: 'Amenities' },
              { num: '5', title: 'Pricing' },
              { num: '6', title: 'Photos' },
            ].map((s) => (
              <div key={s.num} className="p-2 rounded-xl bg-gray-50/80 border border-gray-100">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold inline-flex items-center justify-center mb-0.5">
                  {s.num}
                </span>
                <span className="block text-[11px] font-medium text-gray-700 truncate">{s.title}</span>
              </div>
            ))}
          </div>

          {formError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <div className="space-y-8">
            {/* 1. Basic Information */}
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
                  placeholder="e.g. Modern 3 BHK Luxury Apartment overlooking Marine Drive"
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
                  placeholder="Describe your flat or apartment, special features, ventilation, nearby landmarks, and amenities..."
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
                    placeholder="e.g. Marine Drive, Kakkanad, Kowdiar"
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
                    placeholder="e.g. Skyline Avenue, Road 4"
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
                    placeholder="e.g. 682031"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            </section>

            {/* 3. Property Details & Specs */}
            <section className="space-y-4 pt-6 border-t border-gray-100">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                <FileText size={16} className="text-primary" />
                <span>3. Property Details & Specifications</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Built-up Area *
                  </label>
                  <div className="flex">
                    <input
                      type="number"
                      required
                      min={50}
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="1850"
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-l-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-200 rounded-r-xl text-xs text-gray-500 font-medium">
                      sq ft
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Bedrooms *</label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Bathrooms *</label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Balconies</label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={balcony}
                    onChange={(e) => setBalcony(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Floor Level</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="e.g. 8"
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Total Floors</label>
                  <input
                    type="number"
                    min={1}
                    placeholder="e.g. 18"
                    value={totalFloors}
                    onChange={(e) => setTotalFloors(e.target.value)}
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

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Parking</label>
                  <CustomSelect
                    value={parking}
                    onChange={setParking}
                    options={PARKING_OPTIONS}
                    size="sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Property Age</label>
                  <CustomSelect
                    value={propertyAge}
                    onChange={setPropertyAge}
                    options={PROPERTY_AGE_OPTIONS}
                    size="sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Facing</label>
                  <CustomSelect
                    value={facing}
                    onChange={setFacing}
                    options={FACING_OPTIONS}
                    size="sm"
                  />
                </div>
              </div>

              {/* Amenities Checkboxes */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Amenities</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {COMMON_AMENITIES.map((amenity) => {
                    const isChecked = selectedAmenities.includes(amenity);
                    return (
                      <button
                        type="button"
                        key={amenity}
                        onClick={() => toggleAmenity(amenity)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl text-xs text-left border transition-all ${
                          isChecked
                            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-800 font-semibold'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                            isChecked
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check size={11} />}
                        </div>
                        <span className="truncate">{amenity}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* 4. Pricing */}
            <section className="space-y-4 pt-6 border-t border-gray-100">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                <DollarSign size={16} className="text-primary" />
                <span>4. Pricing & Financials</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {listingPurpose === 'Rent' ? 'Monthly Rent (₹) *' : 'Total Price (₹) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder={listingPurpose === 'Rent' ? '45000' : '9500000'}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    {price && Number(price) > 0 ? `Entered: ₹${Number(price).toLocaleString('en-IN')}` : ''}
                  </span>
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

            {/* 5. Photos / Media */}
            <section className="space-y-4 pt-6 border-t border-gray-100">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                <ImageIcon size={16} className="text-primary" />
                <span>5. Property Photos (Persistent Storage)</span>
              </h2>

              {uploadError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                  {uploadError}
                </div>
              )}

              {/* Upload Drop Zone */}
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-primary/50 transition-colors bg-gray-50/50">
                <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                <label className="cursor-pointer">
                  <span className="px-4 py-2 text-xs font-semibold text-white bg-primary rounded-xl hover:bg-primary/90 transition-all inline-block shadow-xs">
                    {uploading ? 'Uploading...' : 'Choose Photos to Upload'}
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
                <p className="text-[11px] text-gray-400 mt-2">
                  JPG, PNG, or WebP up to 5 MB each. Files are stored persistently.
                </p>
              </div>

              {/* Uploaded Images Grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-xs"
                    >
                      <img src={img.url} alt="Uploaded" className="w-full h-full object-cover" />

                      {/* Cover Badge */}
                      {img.isCover && (
                        <div className="absolute top-1.5 left-1.5 z-10 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                          Cover Photo
                        </div>
                      )}

                      {/* Remove Button (Directly clickable on touch/mobile) */}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1.5 right-1.5 z-10 w-6 h-6 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-xs"
                        title="Remove image"
                        aria-label="Remove image"
                      >
                        <X size={12} />
                      </button>

                      {/* Set as Cover Button */}
                      {!img.isCover && (
                        <button
                          type="button"
                          onClick={() => setCoverImage(idx)}
                          className="absolute bottom-1.5 left-1.5 z-10 text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/95 text-gray-800 shadow-xs hover:bg-white"
                        >
                          Set Cover
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Form Action Buttons */}
            <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmit(false)}
                className="w-full sm:w-auto px-5 py-2.5 min-h-[42px] rounded-xl border border-gray-200 text-gray-700 text-xs sm:text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Save as Draft
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmit(true)}
                className="w-full sm:w-auto px-6 py-2.5 min-h-[42px] rounded-xl bg-primary text-white text-xs sm:text-sm font-semibold hover:bg-primary-btn shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{submitting ? 'Submitting...' : 'Submit for Admin Review'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
