'use client';

export const dynamic = 'force-dynamic';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Building2, Lock, Mail, ArrowRight, AlertCircle, KeyRound } from 'lucide-react';

function SellerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/seller';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/seller/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid credentials');
      }

      router.push(redirectPath);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoSeller = () => {
    setEmail('seller@trinfra.demo');
    setPassword('TRINFRA-SELLER-2026');
  };

  return (
    <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-gray-200/80 shadow-panel">
      {/* Quick Demo Credentials Autofill Helper */}
      <div className="mb-5 p-3 rounded-xl bg-gray-50 border border-gray-200/80 text-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <KeyRound size={14} className="text-accent shrink-0" />
          <div className="truncate">
            <span className="font-semibold text-gray-800">Demo Seller: </span>
            <span className="text-gray-500 font-mono text-[11px]">seller@trinfra.demo</span>
          </div>
        </div>
        <button
          type="button"
          onClick={fillDemoSeller}
          className="text-xs font-semibold text-primary hover:text-primary-btn bg-white hover:bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-lg shrink-0 transition-colors"
        >
          Auto-fill
        </button>
      </div>

      {error && (
        <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
          <div className="relative">
            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seller@trinfra.demo"
              className="w-full pl-10 pr-3.5 py-2.5 min-h-[42px] text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-3.5 py-2.5 min-h-[42px] text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 min-h-[44px] rounded-xl bg-primary text-white text-xs sm:text-sm font-semibold hover:bg-primary-btn shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <span>{loading ? 'Signing in...' : 'Sign in to Seller Dashboard'}</span>
          <ArrowRight size={14} />
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-500">
          Don’t have a seller account yet?{' '}
          <Link
            href={redirectPath !== '/seller' ? `/seller/register?redirect=${encodeURIComponent(redirectPath)}` : '/seller/register'}
            className="font-semibold text-primary hover:underline"
          >
            Register as a Seller
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SellerLoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 pt-24">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center mx-auto mb-3.5 shadow-md">
          <Building2 size={24} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900 tracking-tight">
          Seller Portal
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
          Sign in to manage your flats, apartments, and residential properties
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Suspense fallback={<div className="p-8 text-center text-xs text-gray-400">Loading form...</div>}>
          <SellerLoginForm />
        </Suspense>
      </div>
    </div>
  );
}
