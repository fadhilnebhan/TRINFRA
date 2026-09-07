'use client';

export const dynamic = 'force-dynamic';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuickFill = () => {
    setEmail('admin@trinfra.demo');
    setPassword('TRINFRA-DEMO-2026');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      // Successful login
      router.push(redirectPath);
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E2115] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden text-white font-sans selection:bg-accent selection:text-white">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#34D399]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Link href="/" className="flex items-center gap-2">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 20H22L12 2Z" fill="url(#paint0_linear_login)" />
              <defs>
                <linearGradient id="paint0_linear_login" x1="2" y1="20" x2="22" y2="2" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#BD9655" />
                  <stop offset="0.5" stopColor="#0E2115" />
                  <stop offset="1" stopColor="#34D399" />
                </linearGradient>
              </defs>
            </svg>
            <span className="font-heading font-bold text-2xl text-white tracking-widest uppercase">TRINFRA</span>
          </Link>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-heading font-bold text-white tracking-tight">
            Admin Portal
          </h2>
          <p className="text-xs text-white/60 mt-1">
            Sign in to manage land pooling operations, landowners, and enquiries.
          </p>
        </div>

        {/* Demo environment badge */}
        <div className="mb-6 p-3.5 rounded-xl bg-accent/15 border border-accent/30 text-xs text-accent-light flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-accent shrink-0" />
            <span className="font-medium text-white/90">Zero-Budget Demo Environment</span>
          </div>
          <button
            type="button"
            onClick={handleQuickFill}
            className="text-[11px] font-bold text-accent hover:text-white underline cursor-pointer"
          >
            Auto-Fill Credentials
          </button>
        </div>

        {/* Login Form Card */}
        <div className="bg-[#142C1D] py-8 px-6 shadow-2xl rounded-2xl border border-white/10 sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@trinfra.demo"
                  className="w-full h-11 pl-10 pr-4 rounded-lg bg-black/30 border border-white/15 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full h-11 pl-10 pr-4 rounded-lg bg-black/30 border border-white/15 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-accent hover:bg-[#a88243] text-[#0E2115] hover:text-white rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
                {!loading && <ArrowRight size={16} />}
              </button>
            </div>
          </form>

          {/* Seed credentials notice */}
          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <p className="text-[11px] text-white/40 leading-relaxed font-mono">
              Demo Login: admin@trinfra.demo
              <br />
              Demo Password: TRINFRA-DEMO-2026
            </p>
          </div>
        </div>

        {/* Back to public site */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs text-white/60 hover:text-accent transition-colors inline-flex items-center gap-1.5"
          >
            ← Return to TRINFRA Public Platform
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0E2115] flex items-center justify-center text-white/70">Loading portal...</div>}>
      <AdminLoginForm />
    </Suspense>
  );
}
