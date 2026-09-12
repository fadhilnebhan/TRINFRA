'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Search,
  CheckCircle2,
  Clock,
  HelpCircle,
  XCircle,
  FileText,
  MapPin,
  Calendar,
  ArrowRight,
  Copy,
  Check,
  RefreshCw,
  Phone,
  Mail,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';

interface RegistrationStatusData {
  referenceNumber: string;
  fullName: string;
  district: string;
  localBody: string;
  locality: string;
  approximateArea: number;
  areaUnit: string;
  ownershipStatus: string;
  poolingInterest: string;
  preferredCommunication: string;
  verificationStatus: 'NEW' | 'VERIFICATION_PENDING' | 'NEEDS_CLARIFICATION' | 'VERIFIED' | 'REJECTED';
  clarificationMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

function StatusTrackerContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get('ref') || '';

  const [refInput, setRefInput] = useState(initialRef);
  const [phoneInput, setPhoneInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [data, setData] = useState<RegistrationStatusData | null>(null);
  const [showClarificationDialog, setShowClarificationDialog] = useState(false);

  const fetchStatus = useCallback(async (reference: string, phoneVal?: string, isBackground = false) => {
    if (!reference.trim()) return;

    if (isBackground) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
      setError(null);
    }

    try {
      const queryParams = new URLSearchParams({ ref: reference.trim() });
      if (phoneVal?.trim()) {
        queryParams.append('phone', phoneVal.trim());
      }

      const res = await fetch(`/api/register/status?${queryParams.toString()}`);
      const resData = await res.json();

      if (!res.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to find registration with this reference number.');
      }

      setData(resData.registration);
    } catch (err: any) {
      if (!isBackground) {
        setError(err.message || 'An error occurred while checking status.');
        setData(null);
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Auto-fetch if ref is provided in query params
  useEffect(() => {
    if (initialRef) {
      setRefInput(initialRef);
      fetchStatus(initialRef);
    }
  }, [initialRef, fetchStatus]);

  // Live Sync: Background refresh every 15 seconds if data is currently shown
  useEffect(() => {
    if (!data?.referenceNumber) return;

    const interval = setInterval(() => {
      fetchStatus(data.referenceNumber, phoneInput, true);
    }, 15000);

    const handleFocus = () => {
      fetchStatus(data.referenceNumber, phoneInput, true);
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [data?.referenceNumber, phoneInput, fetchStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refInput.trim()) return;
    fetchStatus(refInput, phoneInput);
  };

  const handleCopyRef = () => {
    if (data?.referenceNumber) {
      navigator.clipboard.writeText(data.referenceNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };


  return (
    <div className="max-w-[920px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Page Title */}
      <div className="text-center max-w-xl mx-auto mb-10">
        <p className="text-[11px] font-bold tracking-[0.25em] uppercase text-accent mb-2.5">
          TRINFRA Land Registry
        </p>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-extrabold text-gray-900 tracking-tight leading-tight mb-3">
          Track Land Registration
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
          Check live verification status, review requests from the TRINFRA committee, and track your land-pooling journey.
        </p>
      </div>

      {/* Lookup Form */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/90 shadow-panel mb-8">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="sm:col-span-2">
              <label htmlFor="refInput" className="block text-xs font-semibold text-gray-700 mb-1.5">
                Reference Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FileText size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="refInput"
                  type="text"
                  required
                  placeholder="e.g. TRI-2026-00001"
                  value={refInput}
                  onChange={(e) => setRefInput(e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-2.5 min-h-[44px] text-xs sm:text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary uppercase tracking-wider font-mono"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phoneInput" className="block text-xs font-semibold text-gray-700 mb-1.5">
                Registered Phone <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="phoneInput"
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 min-h-[44px] text-xs sm:text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <p className="text-[11px] text-gray-400">
              Reference number was provided upon submission (format: TRI-YYYY-XXXXX)
            </p>
            <button
              type="submit"
              disabled={loading || !refInput.trim()}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 min-h-[44px] rounded-xl bg-primary hover:bg-primary-btn text-white text-xs sm:text-sm font-bold shadow-xs transition-all disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <Search size={14} />
                  <span>Check Status</span>
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <XCircle size={15} className="shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Result Display */}
      {data && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Status Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/90 shadow-panel">
            {/* Header: Reference Badge & Live Indicator */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-semibold text-gray-500">Reference:</span>
                <span className="font-mono text-sm sm:text-base font-extrabold text-gray-900 tracking-wider">
                  {data.referenceNumber}
                </span>
                <button
                  onClick={handleCopyRef}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  title="Copy reference number"
                  aria-label="Copy reference number"
                >
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                </button>
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-400">
                {isRefreshing && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-primary font-medium">
                    <RefreshCw size={11} className="animate-spin" />
                    Updating...
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar size={13} />
                  Submitted:{' '}
                  {new Date(data.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* STATUS HERO BANNER */}
            <div className="py-6">
              {data.verificationStatus === 'VERIFICATION_PENDING' && (
                <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-900 space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <Clock size={18} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                        Current Status
                      </span>
                      <h2 className="text-base sm:text-lg font-bold text-amber-950">
                        Verification Pending
                      </h2>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-amber-800 leading-relaxed pt-1">
                    &ldquo;Your land registration is currently under verification by the TRINFRA team.&rdquo;
                  </p>
                  <p className="text-xs text-amber-700/90 leading-relaxed">
                    Our lead coordinator is reviewing your property records, local body jurisdiction, and survey details. We will reach out via your preferred method ({data.preferredCommunication}) once initial verification completes.
                  </p>
                </div>
              )}

              {data.verificationStatus === 'NEEDS_CLARIFICATION' && (
                <div className="p-5 sm:p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                      <HelpCircle size={18} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">
                        Action Required
                      </span>
                      <h2 className="text-base sm:text-lg font-bold text-rose-950">
                        Clarification Required
                      </h2>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-rose-900 font-medium leading-relaxed">
                    &ldquo;TRINFRA needs additional information before we can complete verification of your land registration.&rdquo;
                  </p>

                  {/* Clarification Message from Admin */}
                  {data.clarificationMessage ? (
                    <div className="bg-white/90 p-4 rounded-xl border border-rose-200 text-xs sm:text-sm text-gray-800 space-y-1">
                      <span className="font-bold text-rose-800 block text-xs uppercase tracking-wide">
                        Details Requested by Verification Committee:
                      </span>
                      <p className="leading-relaxed whitespace-pre-wrap">{data.clarificationMessage}</p>
                    </div>
                  ) : (
                    <div className="bg-white/90 p-4 rounded-xl border border-rose-200 text-xs sm:text-sm text-gray-800">
                      <p className="leading-relaxed">
                        TRINFRA has requested additional clarification regarding your registration documents or survey boundaries.
                      </p>
                    </div>
                  )}

                  {/* Clarification Next Steps Action */}
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setShowClarificationDialog(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
                    >
                      <MessageCircle size={15} />
                      <span>Provide Clarification Now</span>
                    </button>
                    <a
                      href="mailto:support@trinfra.com?subject=Clarification%20Response%20for%20Reference%20"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50/50 text-rose-800 text-xs font-semibold transition-colors"
                    >
                      <Mail size={14} />
                      <span>Email Verification Team</span>
                    </a>
                  </div>
                </div>
              )}

              {data.verificationStatus === 'NEW' && (
                <div className="p-5 sm:p-6 rounded-2xl bg-blue-50/80 border border-blue-200/90 text-blue-900 space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <FileText size={18} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                        Submission Received
                      </span>
                      <h2 className="text-base sm:text-lg font-bold text-blue-950">
                        Registration Under Initial Intake
                      </h2>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-blue-800 leading-relaxed">
                    Your land registration has been securely recorded. Our aggregation team will assign it for verification shortly.
                  </p>
                </div>
              )}

              {data.verificationStatus === 'VERIFIED' && (
                <div className="p-5 sm:p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                        Status Confirmed
                      </span>
                      <h2 className="text-base sm:text-lg font-bold text-emerald-950">
                        Land Parcel Verified
                      </h2>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">
                    Congratulations! Your land registration has completed TRINFRA verification and has been added to our aggregated land pool opportunities.
                  </p>
                </div>
              )}

              {data.verificationStatus === 'REJECTED' && (
                <div className="p-5 sm:p-6 rounded-2xl bg-gray-100 border border-gray-300 text-gray-800 space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gray-200 text-gray-700 flex items-center justify-center shrink-0">
                      <XCircle size={18} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                        Review Completed
                      </span>
                      <h2 className="text-base sm:text-lg font-bold text-gray-900">
                        Not Proceeding
                      </h2>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    This registration is not proceeding under the active land pooling schemes at this time.
                  </p>
                </div>
              )}
            </div>

            {/* PROGRESS TIMELINE */}
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
                Verification Journey
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Stage 1: Submitted */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/70 border border-gray-100">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 size={15} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">1. Registration Submitted</p>
                    <p className="text-[11px] text-gray-500">Details recorded in registry</p>
                  </div>
                </div>

                {/* Stage 2: Verification Pending */}
                <div
                  className={`flex items-start gap-3 p-3 rounded-xl border ${
                    data.verificationStatus === 'VERIFICATION_PENDING'
                      ? 'bg-amber-50 border-amber-200'
                      : data.verificationStatus === 'VERIFIED'
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : data.verificationStatus === 'NEEDS_CLARIFICATION'
                      ? 'bg-rose-50/50 border-rose-200'
                      : 'bg-gray-50/70 border-gray-100'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      data.verificationStatus === 'VERIFICATION_PENDING'
                        ? 'bg-amber-200 text-amber-800 animate-pulse'
                        : data.verificationStatus === 'VERIFIED'
                        ? 'bg-emerald-100 text-emerald-700'
                        : data.verificationStatus === 'NEEDS_CLARIFICATION'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {data.verificationStatus === 'NEEDS_CLARIFICATION' ? (
                      <HelpCircle size={15} />
                    ) : (
                      <Clock size={15} />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">
                      2. {data.verificationStatus === 'NEEDS_CLARIFICATION' ? 'Clarification Required' : 'Verification Review'}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {data.verificationStatus === 'NEEDS_CLARIFICATION'
                        ? 'Additional info requested'
                        : data.verificationStatus === 'VERIFICATION_PENDING'
                        ? 'In active verification'
                        : 'Review stage'}
                    </p>
                  </div>
                </div>

                {/* Stage 3: Verification Outcome */}
                <div
                  className={`flex items-start gap-3 p-3 rounded-xl border ${
                    data.verificationStatus === 'VERIFIED'
                      ? 'bg-emerald-50 border-emerald-200'
                      : data.verificationStatus === 'REJECTED'
                      ? 'bg-gray-100 border-gray-300'
                      : 'bg-gray-50/70 border-gray-100'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      data.verificationStatus === 'VERIFIED'
                        ? 'bg-emerald-600 text-white'
                        : data.verificationStatus === 'REJECTED'
                        ? 'bg-gray-400 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {data.verificationStatus === 'REJECTED' ? (
                      <XCircle size={15} />
                    ) : (
                      <ShieldCheck size={15} />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">3. Verified & Aggregated</p>
                    <p className="text-[11px] text-gray-500">
                      {data.verificationStatus === 'VERIFIED' ? 'Approved into pool' : 'Final verification stage'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Registered Parcel Summary Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-200/90 shadow-panel">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin size={16} className="text-primary" />
              <span>Registered Land Details</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="bg-gray-50 p-3 rounded-xl">
                <span className="text-gray-400 block mb-0.5 font-medium">District</span>
                <span className="font-bold text-gray-800">{data.district}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl">
                <span className="text-gray-400 block mb-0.5 font-medium">Local Body</span>
                <span className="font-bold text-gray-800">{data.localBody}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl">
                <span className="text-gray-400 block mb-0.5 font-medium">Locality</span>
                <span className="font-bold text-gray-800">{data.locality || 'Not specified'}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl">
                <span className="text-gray-400 block mb-0.5 font-medium">Approx. Area</span>
                <span className="font-bold text-primary">
                  {data.approximateArea} {data.areaUnit}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clarification Response Modal */}
      {showClarificationDialog && data && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  <HelpCircle size={18} />
                </div>
                <h4 className="font-bold text-gray-900 text-base">Provide Clarification</h4>
              </div>
              <button
                onClick={() => setShowClarificationDialog(false)}
                className="text-gray-400 hover:text-gray-700 p-1"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              To respond to the verification team regarding reference{' '}
              <strong className="font-mono text-gray-900">{data.referenceNumber}</strong>, choose your preferred communication channel:
            </p>

            <div className="space-y-2.5 pt-1">
              <a
                href={`https://wa.me/919447000000?text=${encodeURIComponent(
                  `Hi TRINFRA verification team, I am providing clarification for my land registration (Ref: ${data.referenceNumber}, ${data.fullName}).\n\nClarification details:`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100/80 transition-colors text-xs font-semibold text-emerald-900"
              >
                <div className="flex items-center gap-2.5">
                  <MessageCircle size={18} className="text-emerald-700" />
                  <span>Send via WhatsApp (+91 9447 000000)</span>
                </div>
                <ArrowRight size={14} />
              </a>

              <a
                href={`mailto:support@trinfra.com?subject=${encodeURIComponent(
                  `Clarification Response: Land Registration ${data.referenceNumber}`
                )}&body=${encodeURIComponent(
                  `Dear TRINFRA Verification Team,\n\nReference Number: ${data.referenceNumber}\nLandowner Name: ${data.fullName}\n\nHere is the clarification requested:\n\n[Please provide details here]\n`
                )}`}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100/80 transition-colors text-xs font-semibold text-blue-900"
              >
                <div className="flex items-center gap-2.5">
                  <Mail size={18} className="text-blue-700" />
                  <span>Send Email to support@trinfra.com</span>
                </div>
                <ArrowRight size={14} />
              </a>
            </div>

            <div className="pt-3 border-t border-gray-100 text-right">
              <button
                onClick={() => setShowClarificationDialog(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LandownerStatusPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-grow pt-[72px]">
        <Suspense fallback={<div className="p-12 text-center text-xs text-gray-400">Loading tracker...</div>}>
          <StatusTrackerContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
