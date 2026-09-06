'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Handle escape key and body scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Auto-close on desktop viewport resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navLinks = [
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Landowners', href: '/#landowners' },
    { name: 'Opportunities', href: '/opportunities' },
    { name: 'Projects', href: '/projects' },
    { name: 'Developers & Investors', href: '/#developers' },
    { name: 'Knowledge Centre', href: '/knowledge-centre/what-is-land-pooling' },
    { name: 'About', href: '/about' },
  ];

  const mobileNavLinks = [
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Landowners', href: '/register-your-land' },
    { name: 'Opportunities', href: '/opportunities' },
    { name: 'Projects', href: '/projects' },
    { name: 'Developers & Investors', href: '/enquiry' },
    { name: 'Knowledge Centre', href: '/knowledge-centre' },
    { name: 'About', href: '/about' },
  ];

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled || isMobileMenuOpen
          ? 'bg-primary-dark/95 backdrop-blur-md py-4 shadow-lg'
          : 'bg-gradient-to-b from-black/60 to-transparent py-6'
      }`}
    >
      <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 20H22L12 2Z" fill="url(#paint0_linear)" />
                <defs>
                  <linearGradient id="paint0_linear" x1="2" y1="20" x2="22" y2="2" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BD9655" />
                    <stop offset="0.5" stopColor="#0E2115" />
                    <stop offset="1" stopColor="#34D399" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="font-heading font-bold text-xl text-white tracking-widest uppercase">TRINFRA</span>
            </Link>
          </div>

          {/* Desktop Navigation Links (unchanged) */}
          <div className="hidden xl:flex items-center space-x-7">
            {navLinks.map((link) => {
              const isActive =
                (link.name === 'Projects' && pathname?.startsWith('/projects')) ||
                (link.name === 'How It Works' && pathname === '/how-it-works') ||
                (link.name === 'About' && pathname === '/about') ||
                (link.name === 'Knowledge Centre' && pathname?.startsWith('/knowledge-centre')) ||
                (link.name === 'Opportunities' && pathname?.startsWith('/opportunities'));

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`transition-colors text-[13px] tracking-wide relative py-1 ${
                    isActive
                      ? 'text-accent font-bold after:content-[""] after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-[2px] after:bg-accent'
                      : 'text-white hover:text-accent font-medium'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Desktop Register Land CTA Button */}
          <div className="hidden xl:flex items-center">
            <Link
              href="/register"
              className="bg-primary-btn border border-white/10 text-white px-6 py-2.5 rounded text-[13px] font-bold hover:bg-primary-light transition-colors"
            >
              Register Land
            </Link>
          </div>

          {/* Mobile Hamburger / Close Button */}
          <div className="xl:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="text-white hover:text-accent p-2 -mr-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50"
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-nav-menu"
            >
              {isMobileMenuOpen ? (
                <X size={28} className="transition-transform duration-200" />
              ) : (
                <Menu size={28} className="transition-transform duration-200" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Menu */}
        <div
          id="mobile-nav-menu"
          className={`xl:hidden transition-all duration-300 ease-in-out overflow-hidden ${
            isMobileMenuOpen
              ? 'max-h-[500px] opacity-100 pt-5 pb-6 border-t border-white/10 mt-4'
              : 'max-h-0 opacity-0 py-0 pointer-events-none'
          }`}
        >
          <div className="flex flex-col space-y-1">
            {mobileNavLinks.map((link) => {
              const isActive =
                (link.name === 'Projects' && pathname?.startsWith('/projects')) ||
                (link.name === 'How It Works' && pathname === '/how-it-works') ||
                (link.name === 'About' && pathname === '/about') ||
                (link.name === 'Knowledge Centre' && pathname?.startsWith('/knowledge-centre')) ||
                (link.name === 'Opportunities' && pathname?.startsWith('/opportunities')) ||
                (link.name === 'Landowners' && (pathname === '/register' || pathname === '/register-your-land')) ||
                (link.name === 'Developers & Investors' && (pathname === '/enquiry' || pathname === '/developer-enquiry'));

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-[15px] py-2.5 px-3 rounded-md transition-all flex items-center justify-between ${
                    isActive
                      ? 'text-accent font-bold bg-white/5 border-l-2 border-accent'
                      : 'text-white/90 hover:text-white hover:bg-white/5 font-medium'
                  }`}
                >
                  <span>{link.name}</span>
                  <span className="text-white/20 text-xs font-mono">→</span>
                </Link>
              );
            })}

            <div className="pt-4 mt-2 border-t border-white/10">
              <Link
                href="/register-your-land"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-center bg-primary-btn border border-white/15 text-white px-6 py-3 rounded-md text-[14px] font-bold hover:bg-primary-light transition-all shadow-md active:scale-[0.99]"
              >
                Register Your Land
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Outside Click Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 top-0 bg-black/60 backdrop-blur-sm -z-10 xl:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </nav>
  );
}

