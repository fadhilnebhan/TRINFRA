import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#050B07] pt-16 md:pt-20 pb-10">
      <div className="max-w-[1360px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 lg:gap-12 mb-12 sm:mb-16">
          
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 20H22L12 2Z" fill="url(#paint0_linear_footer)"/>
                <defs>
                  <linearGradient id="paint0_linear_footer" x1="2" y1="20" x2="22" y2="2" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#BD9655" />
                    <stop offset="0.5" stopColor="#0E2115" />
                    <stop offset="1" stopColor="#34D399" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="font-heading font-bold text-2xl text-white tracking-widest uppercase">TRINFRA</span>
            </Link>
            <p className="text-[14px] text-white/50 leading-relaxed mb-8 pr-4">
              Trinfra is a land aggregation and development-facilitation platform that brings landowners, developers and experts together to build better communities.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:text-white transition-colors">
                <span className="text-[12px] font-bold">in</span>
              </a>
              <a href="#" className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:text-white transition-colors">
                <span className="text-[12px] font-bold">X</span>
              </a>
              <a href="#" className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:text-white transition-colors">
                <span className="text-[12px] font-bold">f</span>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-white mb-6 text-[15px] tracking-wider">Quick Links</h4>
            <ul className="space-y-4">
              <li><Link href="/how-it-works" className="text-[14px] text-white/60 hover:text-white transition-colors">How Land Pooling Works</Link></li>
              <li><Link href="/#landowners" className="text-[14px] text-white/60 hover:text-white transition-colors">Landowners</Link></li>
              <li><Link href="/opportunities" className="text-[14px] text-white/60 hover:text-white transition-colors">Opportunities</Link></li>
              <li><Link href="/projects" className="text-[14px] text-white/60 hover:text-white transition-colors">Projects</Link></li>
              <li><Link href="/register/status" className="text-[14px] text-white/60 hover:text-white transition-colors">Track Registration</Link></li>
              <li><Link href="/#developers" className="text-[14px] text-white/60 hover:text-white transition-colors">Developers & Investors</Link></li>
              <li><Link href="/knowledge-centre/what-is-land-pooling" className="text-[14px] text-white/60 hover:text-white transition-colors">Knowledge Centre</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-white mb-6 text-[15px] tracking-wider">Company</h4>
            <ul className="space-y-4">
              <li><Link href="/about" className="text-[14px] text-white/60 hover:text-white transition-colors">About Trinfra</Link></li>
              <li><Link href="#" className="text-[14px] text-white/60 hover:text-white transition-colors">Partners</Link></li>
              <li><Link href="#" className="text-[14px] text-white/60 hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="#" className="text-[14px] text-white/60 hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-white mb-6 text-[15px] tracking-wider">Legal</h4>
            <ul className="space-y-4">
              <li><Link href="/privacy" className="text-[14px] text-white/60 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-[14px] text-white/60 hover:text-white transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/disclaimer" className="text-[14px] text-white/60 hover:text-white transition-colors">Disclaimer</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h4 className="font-bold text-white mb-6 text-[15px] tracking-wider">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-[14px] text-white/60">+91 4236 587 890</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[14px] text-white/60">info@trinfra.com</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[14px] text-white/60 leading-relaxed">1st Floor, Trinfra House,<br/>Kozhikode, Kerala, India - 673001</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 mt-12 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-white/40">
            &copy; {new Date().getFullYear()} Trinfra. Designed for impact.
          </p>
        </div>
      </div>
    </footer>
  );
}
