'use client';

export const dynamic = 'force-dynamic';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Calendar,
} from 'lucide-react';
import {
  LandownerLead,
  LandownerStatus,
  LandownerType,
} from '@/lib/adminData';
import { ApiLandowner } from '@/types/backend';
import StatusBadge from '@/components/admin/StatusBadge';
import ManualEntryModal from '@/components/admin/ManualEntryModal';

const DISTRICTS = [
  'All Districts',
  'Alappuzha',
  'Ernakulam',
  'Idukki',
  'Kannur',
  'Kollam',
  'Kottayam',
  'Kozhikode',
  'Malappuram',
  'Palakkad',
  'Thiruvananthapuram',
  'Thrissur',
  'Wayanad',
];

const STATUSES: (LandownerStatus | 'All Status')[] = [
  'All Status',
  'New',
  'Verification Pending',
  'Verified',
  'Needs Clarification',
  'Rejected',
];

const TYPES: (LandownerType | 'All Types')[] = [
  'All Types',
  'Individual',
  'Family',
  'Group',
];

export default function LandownerLeadsPage() {
  const [leads, setLeads] = useState<LandownerLead[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All Status');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All Districts');
  const [selectedType, setSelectedType] = useState<string>('All Types');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Load leads on mount from database API with fallback
  useEffect(() => {
    const fetchLandowners = async () => {
      try {
        const res = await fetch('/api/admin/landowners');
        if (res.ok) {
          const data = await res.json();
          if (data.landowners) {
            const mapped: LandownerLead[] = data.landowners.map((lo: ApiLandowner) => ({
              id: lo.id,
              referenceNumber: lo.referenceNumber,
              fullName: lo.fullName,
              phone: lo.phone,
              email: lo.email,
              landownerType: lo.ownerType || 'Individual',
              preferredCommunication: lo.preferredCommunication || 'WhatsApp',
              district: lo.district,
              localBody: lo.localBody,
              locality: lo.locality,
              location: `${lo.locality}, ${lo.district}`,
              approximateArea: Number(lo.approximateArea) || 0,
              areaDisplay: `${lo.approximateArea || 0} ${lo.areaUnit || 'Acres'}`,
              ownershipStatus: lo.ownershipStatus || 'Self Owned',
              poolingInterest: lo.poolingInterest || 'Joint Development',
              status:
                lo.verificationStatus === 'VERIFIED'
                  ? 'Verified'
                  : lo.verificationStatus === 'VERIFICATION_PENDING'
                  ? 'Verification Pending'
                  : lo.verificationStatus === 'NEEDS_CLARIFICATION'
                  ? 'Needs Clarification'
                  : lo.verificationStatus === 'REJECTED'
                  ? 'Rejected'
                  : 'New',
              submittedAt: lo.createdAt ? lo.createdAt.split('T')[0] : '2026-08-01',
              submittedDate: lo.createdAt ? lo.createdAt.split('T')[0] : '2026-08-01',
              submittedTimestamp: lo.createdAt ? new Date(lo.createdAt).getTime() : Date.now(),
              updatedAt: lo.updatedAt ? lo.updatedAt.split('T')[0] : '2026-08-01',
              documents: [],
              notes: [],
              timeline: [],
            }));
            setLeads(mapped);
            return;
          }
        }
      } catch (err) {
        console.error('Error fetching landowners from database:', err);
      }
    };

    fetchLandowners();
  }, []);

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Search query across name, reference, phone, email, location
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchSearch =
          lead.fullName.toLowerCase().includes(q) ||
          lead.referenceNumber.toLowerCase().includes(q) ||
          lead.phone.toLowerCase().includes(q) ||
          lead.email.toLowerCase().includes(q) ||
          lead.district.toLowerCase().includes(q) ||
          lead.locality.toLowerCase().includes(q);
        if (!matchSearch) return false;
      }

      // Status filter
      if (selectedStatus !== 'All Status' && lead.status !== selectedStatus) {
        return false;
      }

      // District filter
      if (
        selectedDistrict !== 'All Districts' &&
        lead.district !== selectedDistrict
      ) {
        return false;
      }

      // Landowner Type filter
      if (selectedType !== 'All Types' && lead.landownerType !== selectedType) {
        return false;
      }

      // Submitted Date filter
      if (selectedDate && !lead.submittedDate.includes(selectedDate)) {
        return false;
      }

      return true;
    });
  }, [
    leads,
    searchQuery,
    selectedStatus,
    selectedDistrict,
    selectedType,
    selectedDate,
  ]);

  // Pagination calculation
  const totalItems = filteredLeads.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedLeads = filteredLeads.slice(startIndex, endIndex);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('All Status');
    setSelectedDistrict('All Districts');
    setSelectedType('All Types');
    setSelectedDate('');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedStatus !== 'All Status' ||
    selectedDistrict !== 'All Districts' ||
    selectedType !== 'All Types' ||
    selectedDate !== '';

  const handleLeadCreated = (newLead: LandownerLead) => {
    setLeads((prev) => [newLead, ...prev]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] md:text-[30px] font-heading font-extrabold text-foreground tracking-tight">
            Landowner Leads
          </h1>
          <p className="text-[14px] text-gray-500 mt-0.5">
            Review and manage landowner registrations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsManualModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-[13px] font-bold shadow-sm transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus size={16} />
          <span>Add Manual Entry</span>
        </button>
      </div>

      {/* Search & Filters Container */}
      <div className="bg-white rounded-[16px] p-4 md:p-5 border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-4">
        {/* Search row */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by name, reference, phone or location..."
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

        {/* Filter controls row */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 items-end">
          {/* Status Filter */}
          <div>
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-gray-200 hover:border-gray-300 rounded-lg px-3 py-2 text-[13px] text-foreground outline-none cursor-pointer"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* District Filter */}
          <div>
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">
              District
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-gray-200 hover:border-gray-300 rounded-lg px-3 py-2 text-[13px] text-foreground outline-none cursor-pointer"
            >
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Landowner Type */}
          <div>
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">
              Landowner Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-gray-200 hover:border-gray-300 rounded-lg px-3 py-2 text-[13px] text-foreground outline-none cursor-pointer"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Submitted Date */}
          <div>
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">
              Submitted Date
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Aug 2025"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white border border-gray-200 hover:border-gray-300 rounded-lg pl-3 pr-8 py-2 text-[13px] text-foreground placeholder:text-gray-400 outline-none"
              />
              <Calendar
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>

          {/* Buttons: Clear Filters & Search */}
          <div className="col-span-2 sm:col-span-2 md:col-span-4 lg:col-span-1 flex items-center gap-2">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="w-full px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg text-[13px] font-medium transition-colors"
              >
                Clear Filters
              </button>
            )}
            <button
              type="button"
              className="w-full px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-[13px] font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Search size={14} /> Search
            </button>
          </div>
        </div>
      </div>

      {/* Landowner Leads Table (Desktop) */}
      <div className="hidden md:block bg-white rounded-[16px] border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Landowner</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Area</th>
                <th className="py-3 px-4">Submitted</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[13px]">
              {paginatedLeads.map((lead) => (
                <tr
                  key={lead.id}
                  className="hover:bg-gray-50/70 transition-colors group"
                >
                  <td className="py-3.5 px-4 font-mono font-semibold text-foreground text-[12px]">
                    <Link
                      href={`/admin/landowners/${lead.id}`}
                      className="hover:text-primary transition-colors"
                    >
                      {lead.referenceNumber}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-foreground">
                    <Link
                      href={`/admin/landowners/${lead.id}`}
                      className="hover:text-primary hover:underline"
                    >
                      {lead.fullName}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">
                    {lead.landownerType}
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">
                    <div>{lead.district}</div>
                    {lead.locality && (
                      <div className="text-[11px] text-gray-400">
                        {lead.locality}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-foreground">
                    {lead.areaDisplay}
                  </td>
                  <td className="py-3.5 px-4 text-gray-500 text-[12px]">
                    {lead.submittedDate}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={lead.status} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/landowners/${lead.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-white border border-gray-200 text-gray-700 text-[12px] font-semibold hover:bg-gray-50 hover:text-primary transition-colors shadow-2xs"
                      >
                        <Eye size={13} />
                        View
                      </Link>
                      <button
                        type="button"
                        aria-label="More actions"
                        className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        <MoreVertical size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-400">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">
                      <Search size={20} />
                    </div>
                    <p className="font-semibold text-foreground text-[15px]">
                      No landowner registrations found
                    </p>
                    <p className="text-[13px] text-gray-500 mt-1 max-w-sm mx-auto">
                      Try adjusting your search terms or clearing active filters.
                    </p>
                    {hasActiveFilters && (
                      <button
                        onClick={handleClearFilters}
                        className="mt-3 text-accent font-semibold text-[13px] hover:underline"
                      >
                        Clear all filters
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List View (Mobile screen) */}
      <div className="md:hidden space-y-3">
        {paginatedLeads.map((lead) => (
          <Link
            key={lead.id}
            href={`/admin/landowners/${lead.id}`}
            className="block bg-white rounded-[14px] p-4 border border-gray-200/80 shadow-[0_2px_6px_rgba(0,0,0,0.03)] hover:border-gray-300 transition-all active:bg-gray-50"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono font-bold text-[13px] text-foreground">
                {lead.referenceNumber}
              </span>
              <StatusBadge status={lead.status} size="sm" />
            </div>

            <h3 className="text-[15px] font-bold text-foreground">
              {lead.fullName}
            </h3>

            <p className="text-[12px] text-gray-500 mt-0.5">
              {lead.district} • {lead.areaDisplay}
            </p>

            <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
              <span>{lead.landownerType}</span>
              <span>{lead.submittedDate}</span>
            </div>
          </Link>
        ))}

        {filteredLeads.length === 0 && (
          <div className="bg-white rounded-xl p-8 text-center text-gray-400 border border-gray-200">
            <p className="font-semibold text-foreground">No leads found</p>
            <p className="text-[12px] text-gray-500 mt-1">
              Try adjusting your search or filters.
            </p>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      <div className="bg-white rounded-[14px] p-4 border border-gray-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-gray-500">
        <div>
          Showing{' '}
          <span className="font-semibold text-foreground">
            {totalItems === 0 ? 0 : startIndex + 1}
          </span>
          -
          <span className="font-semibold text-foreground">{endIndex}</span> of{' '}
          <span className="font-semibold text-foreground">{totalItems}</span>{' '}
          results
        </div>

        <div className="flex items-center gap-3">
          {/* Items per page */}
          <div className="flex items-center gap-1.5 text-[12px]">
            <span>Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-gray-50 border border-gray-200 rounded-md px-2 py-1 outline-none text-foreground cursor-pointer font-medium"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>

          {/* Page numbers */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Previous Page"
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - currentPage) <= 1
                )
                .map((page, idx, arr) => {
                  const prev = arr[idx - 1];
                  const showEllipsis = prev && page - prev > 1;

                  return (
                    <span key={page} className="flex items-center">
                      {showEllipsis && (
                        <span className="px-1 text-gray-400">...</span>
                      )}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg text-[13px] font-semibold transition-colors ${
                          page === currentPage
                            ? 'bg-primary text-white shadow-xs'
                            : 'border border-gray-200 text-foreground hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    </span>
                  );
                })}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="Next Page"
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Manual Entry Modal */}
      <ManualEntryModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSuccess={handleLeadCreated}
      />
    </div>
  );
}
