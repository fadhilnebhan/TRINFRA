'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-primary-dark/95 backdrop-blur-md py-4 shadow-lg' : 'bg-gradient-to-b from-black/60 to-transparent py-6'}`}>
      <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-16">
        <div className="flex justify-between items-center">
          
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 20H22L12 2Z" fill="url(#paint0_linear)"/>
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

          <div className="hidden xl:flex items-center">
            <Link href="/register" className="bg-primary-btn border border-white/10 text-white px-6 py-2.5 rounded text-[13px] font-bold hover:bg-primary-light transition-colors">
              Register Land
            </Link>
          </div>

          <div className="xl:hidden flex items-center">
            <button className="text-white hover:text-accent">
              <Menu size={28} />
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}
