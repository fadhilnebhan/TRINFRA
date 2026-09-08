'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  MapPin,
  Compass,
} from 'lucide-react';
import CustomSelect from '@/components/opportunities/CustomSelect';
import ImageUploadField from '@/components/admin/ImageUploadField';

interface AdminOpportunity {
  id: string;
  title: string;
  slug?: string;
  location: string;
  district: string;
  locality: string;
  area: number;
  areaUnit: string;
  landownersCount?: number;
  landowners?: number;
  status: string;
  rawStatus?: string;
  image?: string;
  shortDescription: string;
  overview: string;
  highlights?: string[] | string;
  developmentPotential?: string;
  currentStatusDetail?: string;
  latitude?: number;
  longitude?: number;
  isPinned?: boolean;
  pinnedAt?: string | null;
}

const DISTRICT_OPTIONS = [
  'Kozhikode',
  'Ernakulam',
  'Thrissur',
  'Thiruvananthapuram',
  'Malappuram',
  'Palakkad',
  'Kannur',
  'Kottayam',
  'Kollam',
  'Alappuzha',
  'Idukki',
  'Kasaragod',
  'Pathanamthitta',
  'Wayanad',
];

const STATUS_OPTIONS = [
  { value: 'OPEN', label: 'New Opportunity (OPEN)' },
  { value: 'IN_PROGRESS', label: 'In Progress (IN_PROGRESS)' },
  { value: 'FORMING', label: 'Emerging (FORMING)' },
  { value: 'CLOSED', label: 'Closed (CLOSED)' },
];

export default function AdminOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<AdminOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [pinFilter, setPinFilter] = useState<'all' | 'pinned' | 'unpinned'>('all');
  const [pinningId, setPinningId] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOpp, setEditingOpp] = useState<AdminOpportunity | null>(null);
  const [deletingOpp, setDeletingOpp] = useState<AdminOpportunity | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    district: 'Kozhikode',
    locality: '',
    location: '',
    area: '50',
    areaUnit: 'Acres',
    landownersCount: '12',
    status: 'OPEN',
    shortDescription: '',
    overview: '',
    highlights: 'Clear title verification in progress\nDirect arterial road access\nInstitutional master plan zone',
    developmentPotential: '',
    image: '/images/opportunities/kozhikode.jpg',
  });

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/opportunities');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.opportunities)) {
          setOpportunities(data.opportunities);
        }
      }
    } catch (err) {
      console.error('Failed to load opportunities from database:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const openCreateModal = () => {
    setEditingOpp(null);
    setSelectedImageFile(null);
    setFormData({
      title: '',
      district: 'Kozhikode',
      locality: '',
      location: '',
      area: '50',
      areaUnit: 'Acres',
      landownersCount: '12',
      status: 'OPEN',
      shortDescription: '',
      overview: '',
      highlights: 'Clear title verification in progress\nDirect arterial road access\nInstitutional master plan zone',
      developmentPotential: '',
      image: '/images/opportunities/kozhikode.jpg',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (opp: AdminOpportunity) => {
    setEditingOpp(opp);
    setSelectedImageFile(null);
    let highlightsText = '';
    if (Array.isArray(opp.highlights)) {
      highlightsText = opp.highlights.join('\n');
    } else if (typeof opp.highlights === 'string') {
      try {
        const parsed = JSON.parse(opp.highlights);
        highlightsText = Array.isArray(parsed) ? parsed.join('\n') : opp.highlights;
      } catch {
        highlightsText = opp.highlights;
      }
    }

    setFormData({
      title: opp.title || '',
      district: opp.district || 'Kozhikode',
      locality: opp.locality || '',
      location: opp.location || '',
      area: String(opp.area || 0),
      areaUnit: opp.areaUnit || 'Acres',
      landownersCount: String(opp.landownersCount || opp.landowners || 1),
      status: opp.rawStatus || (opp.status === 'New Opportunity' ? 'OPEN' : opp.status === 'Emerging' ? 'FORMING' : 'IN_PROGRESS'),
      shortDescription: opp.shortDescription || '',
      overview: opp.overview || '',
      highlights: highlightsText,
      developmentPotential: opp.developmentPotential || '',
      image: opp.image || '/images/opportunities/kozhikode.jpg',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setFeedback(null);

    let finalImageUrl = formData.image;
    if (selectedImageFile) {
      try {
        const uploadForm = new FormData();
        uploadForm.append('file', selectedImageFile);
        const upRes = await fetch('/api/admin/upload-image', {
          method: 'POST',
          body: uploadForm,
        });
        const upJson = await upRes.json();
        if (!upRes.ok) throw new Error(upJson.error || 'Failed to upload image');
        finalImageUrl = upJson.url;
      } catch (uploadErr) {
        setActionLoading(false);
        setFeedback({
          type: 'error',
          message: uploadErr instanceof Error ? uploadErr.message : 'Image upload failed',
        });
        return;
      }
    }

    const highlightsArray = formData.highlights
      .split('\n')
      .map((h) => h.trim())
      .filter((h) => h.length > 0);

    const payload = {
      title: formData.title,
      district: formData.district,
      locality: formData.locality || formData.location,
      location: formData.location || `${formData.locality}, ${formData.district}`,
      area: parseFloat(formData.area) || 0,
      areaUnit: formData.areaUnit,
      landownersCount: parseInt(formData.landownersCount, 10) || 1,
      status: formData.status,
      shortDescription: formData.shortDescription,
      overview: formData.overview,
      highlights: highlightsArray,
      developmentPotential: formData.developmentPotential,
      image: finalImageUrl,
    };

    try {
      if (editingOpp) {
        // PATCH existing
        const res = await fetch(`/api/opportunities/${editingOpp.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to update opportunity');

        setFeedback({ type: 'success', message: `Opportunity "${formData.title}" updated successfully.` });
      } else {
        // POST new
        const res = await fetch('/api/opportunities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to create opportunity');

        setFeedback({ type: 'success', message: `New opportunity "${formData.title}" created successfully.` });
      }

      setIsModalOpen(false);
      await fetchOpportunities();
    } catch (err: unknown) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Operation failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingOpp) return;
    setActionLoading(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/opportunities/${deletingOpp.id}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to delete opportunity');

      setFeedback({
        type: 'success',
        message: `Opportunity "${deletingOpp.title}" (${deletingOpp.id}) was permanently deleted.`,
      });
      setDeletingOpp(null);
      await fetchOpportunities();
    } catch (err: unknown) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Delete operation failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleTogglePin = async (opp: AdminOpportunity) => {
    const nextPinned = !opp.isPinned;
    setPinningId(opp.id);
    setFeedback(null);

    // Optimistic UI update
    const previous = [...opportunities];
    setOpportunities((prev) =>
      prev.map((o) =>
        o.id === opp.id
          ? { ...o, isPinned: nextPinned, pinnedAt: nextPinned ? new Date().toISOString() : null }
          : o
      )
    );

    try {
      const res = await fetch(`/api/opportunities/${opp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: nextPinned }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update pin status');
      }

      setFeedback({
        type: 'success',
        message: nextPinned
          ? `Opportunity "${opp.title}" pinned to top.`
          : `Opportunity "${opp.title}" unpinned.`,
      });

      // Silently refresh list to sync exact database ordering
      const refreshRes = await fetch('/api/opportunities');
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        if (Array.isArray(refreshData.opportunities)) {
          setOpportunities(refreshData.opportunities);
        }
      }
    } catch (err: unknown) {
      // Revert optimistic update on failure
      setOpportunities(previous);
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Pin action failed',
      });
    } finally {
      setPinningId(null);
    }
  };

  const displayedOpportunities = opportunities.filter((opp) => {
    if (pinFilter === 'pinned') return Boolean(opp.isPinned);
    if (pinFilter === 'unpinned') return !opp.isPinned;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top back navigation */}
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-gray-500 hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} /> Back to Overview
        </Link>
      </div>

      {/* Header with Title and Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] md:text-[30px] font-heading font-extrabold text-foreground tracking-tight flex items-center gap-3">
            <Compass className="text-accent w-7 h-7" />
            Opportunities CMS
          </h1>
          <p className="text-[14px] text-gray-500 mt-0.5">
            Create, edit, manage, or delete land-pooling listings and consolidated parcels.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-[14px] font-semibold shadow-sm hover:bg-primary-light transition-colors cursor-pointer shrink-0"
        >
          <Plus size={18} />
          Create Opportunity
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

      {/* Opportunities List Card */}
      <div className="bg-white rounded-[16px] border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-[16px] text-foreground">
              All Platform Opportunities ({opportunities.length})
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Synced with Supabase PostgreSQL. Updates reflect instantly on public /opportunities.
            </p>
          </div>
          {loading && (
            <span className="inline-flex items-center gap-1.5 text-xs text-primary font-medium">
              <Loader2 size={14} className="animate-spin" /> Syncing...
            </span>
          )}
        </div>

        {/* Filter Tabs: All, Pinned, Unpinned */}
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/40 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setPinFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                pinFilter === 'all'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-200/60 bg-white border border-gray-200'
              }`}
            >
              All ({opportunities.length})
            </button>
            <button
              type="button"
              onClick={() => setPinFilter('pinned')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                pinFilter === 'pinned'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-200/60 bg-white border border-gray-200'
              }`}
            >
              📌 Pinned ({opportunities.filter((o) => o.isPinned).length})
            </button>
            <button
              type="button"
              onClick={() => setPinFilter('unpinned')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                pinFilter === 'unpinned'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-200/60 bg-white border border-gray-200'
              }`}
            >
              Unpinned ({opportunities.filter((o) => !o.isPinned).length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4">Opportunity</th>
                <th className="py-3 px-4">District / Locality</th>
                <th className="py-3 px-4">Area</th>
                <th className="py-3 px-4">Landowners</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[13px]">
              {displayedOpportunities.map((opp) => (
                <tr key={opp.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-foreground">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[14px] text-foreground">{opp.title}</span>
                        {opp.isPinned && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            📌 Pinned
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400 font-mono">{opp.id} • {opp.slug}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-gray-400 shrink-0" />
                      <span>{opp.locality ? `${opp.locality}, ${opp.district}` : opp.location || opp.district}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-foreground">
                    {opp.area} {opp.areaUnit || 'Acres'}
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">
                    {opp.landownersCount || opp.landowners || 1} Owners
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                        opp.status === 'New Opportunity' || opp.status === 'OPEN'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : opp.status === 'In Progress' || opp.status === 'IN_PROGRESS'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {opp.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Pin / Unpin Button */}
                      <button
                        type="button"
                        onClick={() => handleTogglePin(opp)}
                        disabled={pinningId === opp.id}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          opp.isPinned
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                            : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                        }`}
                        title={opp.isPinned ? 'Click to unpin from top' : 'Click to pin to top'}
                      >
                        {pinningId === opp.id ? (
                          <Loader2 size={13} className="animate-spin text-gray-600" />
                        ) : (
                          <span>📌</span>
                        )}
                        <span>{opp.isPinned ? 'Pinned' : 'Pin'}</span>
                      </button>

                      <Link
                        href={`/opportunities/${opp.slug || opp.id}`}
                        target="_blank"
                        className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Public Page"
                      >
                        <ExternalLink size={15} />
                      </Link>

                      <button
                        type="button"
                        onClick={() => openEditModal(opp)}
                        className="p-1.5 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Opportunity"
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingOpp(opp)}
                        className="p-1.5 text-gray-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Opportunity"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200 my-8">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-[18px] text-foreground">
                  {editingOpp ? `Edit Opportunity (${editingOpp.id})` : 'Create New Opportunity'}
                </h3>
                <p className="text-xs text-gray-500">
                  {editingOpp ? 'Update listing details in PostgreSQL' : 'Publish a new land-pooling opportunity'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSave} className="overflow-y-auto p-6 space-y-4 text-[13px]">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Opportunity Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Kozhikode North Land Consolidation Zone"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary text-[14px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    District <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    value={formData.district}
                    onChange={(val) => setFormData({ ...formData, district: val })}
                    options={DISTRICT_OPTIONS.map((d) => ({ value: d, label: d }))}
                    searchable
                    placeholder="Select district"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Locality / Town <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.locality}
                    onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                    placeholder="e.g. Koyilandy"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:outline-hidden focus:border-primary text-[14px]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Location / Address Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. NH 66 Growth Corridor, Koyilandy, Kozhikode"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:outline-hidden focus:border-primary text-[14px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Area Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:outline-hidden focus:border-primary text-[14px]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Area Unit
                  </label>
                  <CustomSelect
                    value={formData.areaUnit}
                    onChange={(val) => setFormData({ ...formData, areaUnit: val })}
                    options={[
                      { value: 'Acres', label: 'Acres' },
                      { value: 'Cents', label: 'Cents' },
                      { value: 'Hectares', label: 'Hectares' },
                    ]}
                    placeholder="Unit"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Landowners Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.landownersCount}
                    onChange={(e) => setFormData({ ...formData, landownersCount: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-[14px]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Status
                </label>
                <CustomSelect
                  value={formData.status}
                  onChange={(val) => setFormData({ ...formData, status: val })}
                  options={STATUS_OPTIONS}
                  placeholder="Select status"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Short Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Summary for cards and previews..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:outline-hidden focus:border-primary text-[13px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Detailed Overview <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.overview}
                  onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                  placeholder="Comprehensive description of the consolidated land parcel..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:outline-hidden focus:border-primary text-[13px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Highlights (One per line)
                </label>
                <textarea
                  rows={3}
                  value={formData.highlights}
                  onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                  placeholder="Direct 4-lane access&#10;Clear titles&#10;Zoned for mixed use"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-[13px] font-mono"
                />
              </div>

              <div>
                <ImageUploadField
                  label="Opportunity Image"
                  currentImageUrl={formData.image}
                  onFileSelect={(file) => {
                    setSelectedImageFile(file);
                  }}
                  onRemove={() => {
                    setSelectedImageFile(null);
                    setFormData({ ...formData, image: '' });
                  }}
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-[13px] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-white text-[13px] font-semibold hover:bg-primary-light transition-colors disabled:opacity-50"
                >
                  {actionLoading && <Loader2 size={15} className="animate-spin" />}
                  {editingOpp ? 'Save Changes' : 'Publish Opportunity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="font-heading font-bold text-[17px] text-foreground">
                  Confirm Deletion
                </h3>
                <span className="text-xs text-red-600 font-semibold">PostgreSQL Server Mutation</span>
              </div>
            </div>

            <p className="text-[13px] text-gray-600 mb-2 leading-relaxed">
              Are you sure you want to permanently delete opportunity{' '}
              <strong className="text-foreground font-semibold">&quot;{deletingOpp.title}&quot;</strong>{' '}
              ({deletingOpp.id})?
            </p>
            <p className="text-[12px] text-gray-500 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200">
              This record will be permanently deleted from Supabase PostgreSQL and will disappear immediately from the public <code className="text-primary font-mono font-semibold">/opportunities</code> page.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingOpp(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-[13px] font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[13px] font-semibold transition-colors disabled:opacity-50"
              >
                {actionLoading && <Loader2 size={15} className="animate-spin" />}
                Yes, Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
