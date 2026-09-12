'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Building2,
  MessageSquare,
  PlusCircle,
  ExternalLink,
  LogOut,
  Menu,
  X,
  UserCheck,
} from 'lucide-react';

interface SellerNavbarProps {
  sellerName?: string;
  companyName?: string;
}

export default function SellerNavbar({ sellerName, companyName }: SellerNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ fullName?: string; companyName?: string } | null>(null);

  useEffect(() => {
    if (!sellerName) {
      fetch('/api/seller/auth/me')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.user) {
            setCurrentUser(data.user);
          }
        })
        .catch(() => {});
    }
  }, [sellerName]);

  // Close mobile menu on path change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/seller/auth/logout', { method: 'POST' });
      router.push('/seller/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const displayName = sellerName || currentUser?.fullName || 'Seller';
  const displayCompany = companyName || currentUser?.companyName;

  const navLinks = [
    {
      label: 'Dashboard',
      href: '/seller',
      icon: <Building2 size={15} />,
      active: pathname === '/seller',
    },
    {
      label: 'Buyer Enquiries',
      href: '/seller/enquiries',
      icon: <MessageSquare size={15} />,
      active: pathname?.startsWith('/seller/enquiries'),
    },
    {
      label: 'Public Marketplace',
      href: '/residential',
      icon: <ExternalLink size={14} />,
      active: false,
      external: true,
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-gray-200/90 shadow-2xs">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8 lg:px-16">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand & Logo */}
          <div className="flex items-center gap-3">
            <Link
              href="/seller"
              className="flex items-center gap-2.5 group transition-transform focus:outline-none"
              aria-label="TRINFRA Seller Portal"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 20H22L12 2Z" fill="url(#seller_nav_logo_gradient)" />
                <defs>
                  <linearGradient id="seller_nav_logo_gradient" x1="2" y1="20" x2="22" y2="2" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BD9655" />
                    <stop offset="0.5" stopColor="#0E2115" />
                    <stop offset="1" stopColor="#34D399" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="font-heading font-extrabold text-lg sm:text-xl text-[#0E2115] tracking-wider uppercase">
                TRINFRA
              </span>
            </Link>

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#0E2115]/8 text-[#0E2115] border border-[#0E2115]/15">
              <span className="w-1.5 h-1.5 rounded-full bg-[#BD9655]" />
              Seller Portal
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 lg:gap-2" aria-label="Seller Navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  link.active
                    ? 'bg-primary text-white shadow-2xs font-bold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}

            <Link
              href="/seller/listings/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 ml-1 text-xs font-semibold rounded-xl bg-accent hover:bg-accent-hover text-white shadow-2xs transition-all"
            >
              <PlusCircle size={14} />
              <span>New Listing</span>
            </Link>
          </nav>

          {/* Desktop User Info & Sign Out */}
          <div className="hidden lg:flex items-center gap-3 border-l border-gray-200/80 pl-4">
            <div className="text-right">
              <p className="text-xs font-bold text-gray-900 leading-tight truncate max-w-[160px]">
                {displayName}
              </p>
              {displayCompany && (
                <p className="text-[10px] text-gray-500 truncate max-w-[160px]">{displayCompany}</p>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center justify-center cursor-pointer"
              title="Sign out of Seller Portal"
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>

          {/* Mobile/Tablet Hamburger Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <Link
              href="/seller/listings/new"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold rounded-lg bg-accent text-white shadow-2xs"
            >
              <PlusCircle size={13} />
              <span>List</span>
            </Link>

            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none"
              aria-label={mobileMenuOpen ? 'Close seller menu' : 'Open seller menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200/90 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="px-2 py-2 bg-gray-50 rounded-xl flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-xs">
              <UserCheck size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-gray-900 truncate">{displayName}</p>
              <p className="text-[10px] text-gray-500 truncate">
                {displayCompany || 'Verified Seller'}
              </p>
            </div>
          </div>

          <nav className="space-y-1" aria-label="Mobile Seller Navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  link.active
                    ? 'bg-primary text-white font-bold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}

            <Link
              href="/seller/listings/new"
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-accent text-white hover:bg-accent-hover transition-all"
            >
              <PlusCircle size={15} />
              <span>+ Create New Listing</span>
            </Link>
          </nav>

          <div className="pt-2 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
