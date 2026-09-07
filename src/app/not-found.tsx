import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground">
      <Navbar />
      <main className="flex-grow pt-[120px] pb-24 flex items-center justify-center">
        <div className="max-w-[560px] mx-auto px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto mb-6">
            <Compass size={32} strokeWidth={1.75} />
          </div>
          <span className="text-[13px] font-bold text-accent tracking-wider uppercase mb-2 block">
            404 — Page Not Found
          </span>
          <h1 className="text-[32px] sm:text-[40px] font-heading font-bold text-foreground mb-4 leading-tight">
            Record or Resource Unavailable
          </h1>
          <p className="text-gray-500 text-[15px] sm:text-[16px] mb-8 leading-relaxed">
            The requested land opportunity, project, or page does not exist or has been removed from the platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/opportunities"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-primary text-white font-bold text-[14px] hover:bg-primary-dark transition-colors inline-flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} />
              Browse Opportunities
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-white border border-gray-200 text-foreground font-semibold text-[14px] hover:bg-gray-50 transition-colors inline-flex items-center justify-center"
            >
              Return Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
