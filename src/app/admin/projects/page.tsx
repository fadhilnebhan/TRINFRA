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
  FolderKanban,
} from 'lucide-react';
import { PROJECTS } from '@/lib/projectsData';
import CustomSelect from '@/components/opportunities/CustomSelect';
import CustomMultiSelect from '@/components/ui/CustomMultiSelect';
import ImageUploadField from '@/components/admin/ImageUploadField';

interface AdminProject {
  id: string;
  title: string;
  projectName?: string;
  slug: string;
  location: string;
  district: string;
  approximateArea: string;
  areaNum?: number;
  participatingLandowners: number;
  status: string;
  rawStatus?: string;
  developmentStage: string;
  rawStage?: string;
  progressPercentage?: number;
  progress?: number;
  image?: string;
  description: string;
  overview: string;
  tags?: string[] | string;
  featured?: boolean;
  opportunityId?: string | null;
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
  'Alappuzha',
  'Wayanad',
  'Idukki',
  'Kollam',
  'Kasaragod',
  'Pathanamthitta',
];

const STATUS_OPTIONS = [
  { value: 'PLANNING', label: 'Planning' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DEVELOPMENT', label: 'Development' },
  { value: 'COMPLETED', label: 'Completed' },
];

const STAGE_OPTIONS = [
  { value: 'LAND_AGGREGATION', label: 'Land Aggregation' },
  { value: 'PLANNING', label: 'Planning' },
  { value: 'APPROVALS', label: 'Approvals' },
  { value: 'DEVELOPMENT', label: 'Development' },
  { value: 'COMPLETED', label: 'Completed' },
];

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<AdminProject[]>(PROJECTS as unknown as AdminProject[]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<AdminProject | null>(null);
  const [deletingProject, setDeletingProject] = useState<AdminProject | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    district: 'Kozhikode',
    location: '',
    approximateArea: '45 Acres',
    areaNum: '45',
    participatingLandowners: '18',
    status: 'PLANNING',
    developmentStage: 'PLANNING',
    progressPercentage: '20',
    description: '',
    overview: '',
    tags: 'Land Pooling, Master Planned, Institutional',
    image: '/images/projects/kozhikode-hub.jpg',
    featured: false,
    opportunityId: '',
  });

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.projects)) {
          setProjects(data.projects);
        }
      }
    } catch (err) {
      console.error('Failed to load projects from database:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openCreateModal = () => {
    setEditingProject(null);
    setSelectedImageFile(null);
    setFormData({
      title: '',
      district: 'Kozhikode',
      location: '',
      approximateArea: '45 Acres',
      areaNum: '45',
      participatingLandowners: '18',
      status: 'PLANNING',
      developmentStage: 'PLANNING',
      progressPercentage: '20',
      description: '',
      overview: '',
      tags: 'Land Pooling, Master Planned, Institutional',
      image: '/images/projects/kozhikode-hub.jpg',
      featured: false,
      opportunityId: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (proj: AdminProject) => {
    setEditingProject(proj);
    setSelectedImageFile(null);
    let tagsText = '';
    if (Array.isArray(proj.tags)) {
      tagsText = proj.tags.join(', ');
    } else if (typeof proj.tags === 'string') {
      try {
        const parsed = JSON.parse(proj.tags);
        tagsText = Array.isArray(parsed) ? parsed.join(', ') : proj.tags;
      } catch {
        tagsText = proj.tags;
      }
    }

    setFormData({
      title: proj.title || proj.projectName || '',
      district: proj.district || 'Kozhikode',
      location: proj.location || '',
      approximateArea: proj.approximateArea || '45 Acres',
      areaNum: String(proj.areaNum || parseFloat(proj.approximateArea) || 0),
      participatingLandowners: String(proj.participatingLandowners || 1),
      status: proj.rawStatus || (proj.status === 'In Progress' ? 'IN_PROGRESS' : proj.status.toUpperCase()),
      developmentStage: proj.rawStage || (proj.developmentStage === 'Land Aggregation' ? 'LAND_AGGREGATION' : proj.developmentStage.toUpperCase()),
      progressPercentage: String(proj.progressPercentage ?? proj.progress ?? 0),
      description: proj.description || '',
      overview: proj.overview || '',
      tags: tagsText,
      image: proj.image || '/images/projects/kozhikode-hub.jpg',
      featured: Boolean(proj.featured),
      opportunityId: proj.opportunityId || '',
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

    const tagsArray = formData.tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      title: formData.title,
      district: formData.district,
      location: formData.location || `${formData.district}, Kerala`,
      approximateArea: formData.approximateArea.includes(' ') ? formData.approximateArea : `${formData.approximateArea} Acres`,
      areaNum: parseFloat(formData.areaNum) || parseFloat(formData.approximateArea) || 0,
      participatingLandowners: parseInt(formData.participatingLandowners, 10) || 1,
      status: formData.status,
      developmentStage: formData.developmentStage,
      progressPercentage: parseInt(formData.progressPercentage, 10) || 0,
      description: formData.description,
      overview: formData.overview,
      tags: tagsArray,
      image: finalImageUrl,
      featured: formData.featured,
      opportunityId: formData.opportunityId || null,
    };

    try {
      if (editingProject) {
        // PATCH
        const res = await fetch(`/api/projects/${editingProject.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to update project');

        setFeedback({ type: 'success', message: `Project "${formData.title}" updated successfully.` });
      } else {
        // POST
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to create project');

        setFeedback({ type: 'success', message: `New project "${formData.title}" created successfully.` });
      }

      setIsModalOpen(false);
      await fetchProjects();
    } catch (err: unknown) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Operation failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProject) return;
    setActionLoading(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/projects/${deletingProject.id}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to delete project');

      setFeedback({
        type: 'success',
        message: `Project "${deletingProject.title || deletingProject.projectName}" (${deletingProject.id}) was permanently deleted.`,
      });
      setDeletingProject(null);
      await fetchProjects();
    } catch (err: unknown) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Delete operation failed' });
    } finally {
      setActionLoading(false);
    }
  };

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
            <FolderKanban className="text-accent w-7 h-7" />
            Projects CMS
          </h1>
          <p className="text-[14px] text-gray-500 mt-0.5">
            Create, edit, manage, or delete structured land-pooling and infrastructure development projects.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-[14px] font-semibold shadow-sm hover:bg-primary-light transition-colors cursor-pointer shrink-0"
        >
          <Plus size={18} />
          Create Project
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

      {/* Projects List Card */}
      <div className="bg-white rounded-[16px] border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-[16px] text-foreground">
              All Active Projects ({projects.length})
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Synced with Supabase PostgreSQL. Updates reflect immediately on the public /projects directory.
            </p>
          </div>
          {loading && (
            <span className="inline-flex items-center gap-1.5 text-xs text-primary font-medium">
              <Loader2 size={14} className="animate-spin" /> Syncing...
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4">District / Location</th>
                <th className="py-3 px-4">Area</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Progress</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[13px]">
              {projects.map((proj) => (
                <tr key={proj.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-foreground">
                    <div className="flex flex-col">
                      <span className="font-semibold text-[14px] text-foreground">
                        {proj.title || proj.projectName}
                      </span>
                      <span className="text-[11px] text-gray-400 font-mono">
                        {proj.id} • {proj.slug}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-gray-400 shrink-0" />
                      <span>{proj.location || proj.district}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-foreground">
                    {proj.approximateArea}
                  </td>
                  <td className="py-3.5 px-4 text-gray-600 text-[12px]">
                    {proj.developmentStage}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-primary h-1.5 rounded-full"
                          style={{ width: `${proj.progressPercentage ?? proj.progress ?? 0}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-700">
                        {proj.progressPercentage ?? proj.progress ?? 0}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                        proj.status === 'Completed' || proj.status === 'COMPLETED'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : proj.status === 'In Progress' || proj.status === 'IN_PROGRESS' || proj.status === 'Development'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {proj.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/projects/${proj.slug || proj.id}`}
                        target="_blank"
                        className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Public Page"
                      >
                        <ExternalLink size={15} />
                      </Link>

                      <button
                        type="button"
                        onClick={() => openEditModal(proj)}
                        className="p-1.5 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Project"
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingProject(proj)}
                        className="p-1.5 text-gray-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Project"
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
                  {editingProject ? `Edit Project (${editingProject.id})` : 'Create New Project'}
                </h3>
                <p className="text-xs text-gray-500">
                  {editingProject ? 'Update project details in PostgreSQL' : 'Add a new project listing to TRINFRA'}
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
                  Project Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Kozhikode Logistics & Warehousing Hub"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:outline-hidden focus:border-primary text-[14px]"
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
                    Location Description <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Ramanattukara Bypass Corridor"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:outline-hidden focus:border-primary text-[14px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Approximate Area <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.approximateArea}
                    onChange={(e) => setFormData({ ...formData, approximateArea: e.target.value })}
                    placeholder="e.g. 45 Acres"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-[14px]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Area Number (Numeric)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.areaNum}
                    onChange={(e) => setFormData({ ...formData, areaNum: e.target.value })}
                    placeholder="45"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-[14px]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Landowners Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.participatingLandowners}
                    onChange={(e) => setFormData({ ...formData, participatingLandowners: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-[14px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    Development Stage
                  </label>
                  <CustomSelect
                    value={formData.developmentStage}
                    onChange={(val) => setFormData({ ...formData, developmentStage: val })}
                    options={STAGE_OPTIONS}
                    placeholder="Select stage"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Progress Percentage (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progressPercentage}
                    onChange={(e) => setFormData({ ...formData, progressPercentage: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-[14px]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Short Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summary for cards and directory previews..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:outline-hidden focus:border-primary text-[13px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Detailed Project Overview <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.overview}
                  onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                  placeholder="Comprehensive project scope, development concept, and infrastructure integration..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:outline-hidden focus:border-primary text-[13px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Tags / Categories
                </label>
                <CustomMultiSelect
                  values={formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : []}
                  onChange={(vals) => setFormData({ ...formData, tags: vals.join(', ') })}
                  options={[
                    { value: 'Land Pooling', label: 'Land Pooling' },
                    { value: 'Master Planned', label: 'Master Planned' },
                    { value: 'Institutional', label: 'Institutional' },
                    { value: 'Industrial', label: 'Industrial' },
                    { value: 'Logistics', label: 'Logistics' },
                    { value: 'Commercial', label: 'Commercial' },
                    { value: 'Mixed-Use', label: 'Mixed-Use' },
                    { value: 'Infrastructure', label: 'Infrastructure' },
                    { value: 'Residential', label: 'Residential' },
                  ]}
                  placeholder="Select tags or type custom..."
                />
              </div>

              <div>
                <ImageUploadField
                  label="Project Image"
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
                  {editingProject ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingProject && (
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
              Are you sure you want to permanently delete project{' '}
              <strong className="text-foreground font-semibold">
                &quot;{deletingProject.title || deletingProject.projectName}&quot;
              </strong>{' '}
              ({deletingProject.id})?
            </p>
            <p className="text-[12px] text-gray-500 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200">
              This record will be permanently deleted from Supabase PostgreSQL and will disappear immediately from the public <code className="text-primary font-mono font-semibold">/projects</code> page.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingProject(null)}
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
