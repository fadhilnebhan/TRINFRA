'use client';

import { useState } from 'react';
import { X, UserPlus, Check } from 'lucide-react';
import {
  LandownerType,
  LandownerStatus,
  addManualLandowner,
  LandownerLead,
} from '@/lib/adminData';

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newLead: LandownerLead) => void;
}

const DISTRICTS = [
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

export default function ManualEntryModal({
  isOpen,
  onClose,
  onSuccess,
}: ManualEntryModalProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [landownerType, setLandownerType] = useState<LandownerType>('Individual');
  const [district, setDistrict] = useState('Kozhikode');
  const [locality, setLocality] = useState('');
  const [area, setArea] = useState('2.5');
  const [status, setStatus] = useState<LandownerStatus>('New');
  const [ownershipStatus, setOwnershipStatus] = useState<
    'Self Owned' | 'Family Inherited' | 'Joint Ownership' | 'Other'
  >('Self Owned');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      setError('Please provide at least a full name and contact phone number.');
      return;
    }

    const created = addManualLandowner({
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || `${fullName.toLowerCase().replace(/\s+/g, '')}@example.com`,
      landownerType,
      district,
      locality: locality.trim() || 'Central',
      location: `${district}, Kerala`,
      approximateArea: parseFloat(area) || 1.0,
      status,
      ownershipStatus,
      notes: note.trim()
        ? [
            {
              id: `note-${Date.now()}`,
              author: 'Admin',
              role: 'Operations',
              content: note.trim(),
              createdAt: 'Just now',
            },
          ]
        : [],
    });

    onSuccess(created);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-[20px] max-w-lg w-full p-6 border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.15)] relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0E2115]/10 text-primary flex items-center justify-center">
              <UserPlus size={18} />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-foreground">
                Add Manual Entry
              </h2>
              <p className="text-[12px] text-gray-500">
                Create a landowner record directly in the system
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-[12px] text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-[13px]">
          <div>
            <label className="block text-[11px] font-semibold uppercase text-gray-500 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Suresh Varma"
              className="w-full px-3.5 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase text-gray-500 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 00000"
                className="w-full px-3.5 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase text-gray-500 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="suresh@gmail.com"
                className="w-full px-3.5 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase text-gray-500 mb-1">
                Landowner Type
              </label>
              <select
                value={landownerType}
                onChange={(e) => setLandownerType(e.target.value as LandownerType)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white outline-none"
              >
                <option value="Individual">Individual</option>
                <option value="Family">Family</option>
                <option value="Group">Group</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase text-gray-500 mb-1">
                Ownership
              </label>
              <select
                value={ownershipStatus}
                onChange={(e) =>
                  setOwnershipStatus(
                    e.target.value as
                      | 'Self Owned'
                      | 'Family Inherited'
                      | 'Joint Ownership'
                      | 'Other'
                  )
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white outline-none"
              >
                <option value="Self Owned">Self Owned</option>
                <option value="Family Inherited">Family Inherited</option>
                <option value="Joint Ownership">Joint Ownership</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase text-gray-500 mb-1">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LandownerStatus)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white outline-none"
              >
                <option value="New">New</option>
                <option value="Verification Pending">Verification Pending</option>
                <option value="Verified">Verified</option>
                <option value="Needs Clarification">Needs Clarification</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase text-gray-500 mb-1">
                District
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white outline-none"
              >
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase text-gray-500 mb-1">
                Locality
              </label>
              <input
                type="text"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="Locality / Village"
                className="w-full px-3.5 py-2 rounded-lg border border-gray-200 focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase text-gray-500 mb-1">
                Area (Acres)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-gray-200 focus:border-primary outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase text-gray-500 mb-1">
              Internal Initial Note (Optional)
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Received over phone enquiry, awaiting survey sketch."
              className="w-full px-3.5 py-2 rounded-lg border border-gray-200 focus:border-primary outline-none resize-none text-[12px]"
            />
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Check size={16} /> Save Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
