'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  Building,
  ExternalLink,
} from 'lucide-react';
import { formatPrice } from '@/components/residential/ResidentialCard';

export default function SellerEnquiriesPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/seller/enquiries');
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/seller/login');
          return;
        }
        throw new Error('Failed to fetch enquiries');
      }
      const data = await res.json();
      setEnquiries(data.enquiries || []);
    } catch (err) {
      console.error('Error fetching enquiries:', err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/seller/enquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await fetchEnquiries();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredEnquiries = enquiries.filter((e) => {
    if (filterStatus === 'ALL') return true;
    return e.status === filterStatus;
  });

  return (
    <div className="min-h-screen bg-[#fafaf9] text-gray-900 pb-20 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/seller"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft size={14} />
          <span>Back to Seller Dashboard</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Buyer Enquiries
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Direct enquiries received from verified prospective buyers across your listings.
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['ALL', 'NEW', 'CONTACTED', 'IN_PROGRESS', 'CLOSED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                  filterStatus === status
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-28 bg-white rounded-2xl border border-gray-100" />
            ))}
          </div>
        ) : filteredEnquiries.length > 0 ? (
          <div className="space-y-4">
            {filteredEnquiries.map((item) => {
              const formattedDate = new Date(item.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs hover:shadow transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Buyer & Property Information */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-gray-900">{item.name}</span>
                        <span
                          className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                            item.status === 'NEW'
                              ? 'bg-amber-100 text-amber-800'
                              : item.status === 'CONTACTED'
                              ? 'bg-blue-100 text-blue-800'
                              : item.status === 'IN_PROGRESS'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {item.status}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar size={12} /> {formattedDate}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                        <a
                          href={`tel:${item.phone}`}
                          className="flex items-center gap-1 font-semibold text-primary hover:underline"
                        >
                          <Phone size={13} />
                          <span>{item.phone}</span>
                        </a>
                        <a
                          href={`mailto:${item.email}`}
                          className="flex items-center gap-1 hover:text-gray-900"
                        >
                          <Mail size={13} />
                          <span>{item.email}</span>
                        </a>
                      </div>

                      <div className="text-xs text-gray-500 flex items-center gap-1.5 pt-1">
                        <Building size={13} className="text-gray-400 shrink-0" />
                        <span>Property: </span>
                        <Link
                          href={`/residential/${item.listing.slug}`}
                          target="_blank"
                          className="font-semibold text-gray-800 hover:text-primary transition-colors flex items-center gap-1"
                        >
                          <span>{item.listing.title}</span>
                          <ExternalLink size={11} />
                        </Link>
                        <span className="text-gray-400 font-medium">
                          ({formatPrice(item.listing.price, item.listing.priceType)})
                        </span>
                      </div>
                    </div>

                    {/* Status Changer Buttons */}
                    <div className="flex items-center gap-2 self-end lg:self-center">
                      <span className="text-xs text-gray-400 font-medium mr-1">Status:</span>
                      {['NEW', 'CONTACTED', 'IN_PROGRESS', 'CLOSED'].map((st) => (
                        <button
                          key={st}
                          disabled={updatingId === item.id}
                          onClick={() => handleUpdateStatus(item.id, st)}
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all ${
                            item.status === st
                              ? 'bg-gray-800 text-white border-gray-800'
                              : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message Body */}
                  <div className="mt-3.5 pt-3 border-t border-gray-100 text-xs text-gray-700 bg-gray-50/70 p-3 rounded-xl">
                    <span className="font-semibold text-gray-500 block mb-1">Buyer Message:</span>
                    <p className="leading-relaxed">&ldquo;{item.message}&rdquo;</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 max-w-md mx-auto">
            <MessageSquare size={36} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-base font-bold text-gray-900 mb-1">No enquiries found</h3>
            <p className="text-xs text-gray-500">
              When buyers view your published properties and send messages, they will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
