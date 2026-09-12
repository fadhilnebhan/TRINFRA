import { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FileText, CheckCircle2, AlertCircle, ArrowLeft, Scale } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms & Conditions | TRINFRA Land Aggregation & Facilitation',
  description:
    'Review the official Terms & Conditions governing use of the TRINFRA platform for landowners, developers, sellers, and buyers.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#FBFBF9] text-foreground flex flex-col justify-between selection:bg-accent selection:text-white">
      <Navbar />

      {/* Hero Header */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 bg-gradient-to-b from-[#0A160E] via-[#0E2115] to-[#142A1C] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#BD9655_1px,transparent_1px)] [background-size:28px_28px] opacity-10 pointer-events-none" />
        <div className="relative z-10 max-w-[1100px] mx-auto px-6 md:px-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/15 border border-accent/30 text-accent font-semibold text-xs tracking-widest uppercase mb-4 mx-auto">
            <Scale size={14} /> Platform Agreement
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-white tracking-tight mb-4">
            Terms & Conditions
          </h1>
          <p className="text-sm md:text-base text-white/70 max-w-2xl mx-auto leading-relaxed">
            Standard terms of engagement for landowners, developers, residential sellers, and registered buyers utilizing TRINFRA.
          </p>
          <p className="text-xs text-accent/80 font-mono mt-4">
            Last Updated: August 2026 &bull; Governing Jurisdiction: Kozhikode, Kerala, India
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 md:py-20 max-w-[960px] mx-auto px-6 md:px-10 w-full">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-8 md:p-12 space-y-10">
          {/* Section 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                01
              </span>
              <h2 className="text-xl md:text-2xl font-heading font-bold text-primary">
                Acceptance of Terms
              </h2>
            </div>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              By accessing, browsing, or submitting details through TRINFRA (<span className="text-primary font-medium">trinfra.vercel.app</span>), you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree to these terms, you must not use or access the services.
            </p>
          </div>

          <hr className="border-gray-100" />

          {/* Section 2 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                02
              </span>
              <h2 className="text-xl md:text-2xl font-heading font-bold text-primary">
                Platform Role & Nature of Facilitation
              </h2>
            </div>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              TRINFRA is an independent land aggregation, feasibility assessment, and development-facilitation technology platform.
            </p>
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-sm leading-relaxed space-y-2">
              <p className="font-semibold flex items-center gap-2 text-amber-950">
                <AlertCircle size={16} className="text-amber-700" /> Clarification of Platform Status
              </p>
              <p className="text-xs text-amber-800 leading-relaxed">
                TRINFRA does not operate as a licensed financial institution, escrow agent, or traditional real estate brokerage firm. TRINFRA aggregates disparate parcels, coordinates technical due diligence with certified independent experts (legal, GIS, town planning), and presents structured opportunities to reputable developers.
              </p>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section 3 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                03
              </span>
              <h2 className="text-xl md:text-2xl font-heading font-bold text-primary">
                Landowner Registration & Declarations
              </h2>
            </div>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              When submitting land details for registration:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm md:text-base text-gray-600">
              <li>
                You represent and warrant that you are the lawful owner, authorized co-owner, or legally designated power-of-attorney holder of the land submitted.
              </li>
              <li>
                You confirm that all survey numbers, extents, boundaries, and encumbrance disclosures are accurate to the best of your knowledge.
              </li>
              <li>
                Submitting a registration generates a tracking reference (<span className="font-mono text-primary text-xs">TRI-LAND-...</span>) and initiates initial desk verification. It does not bind you to sell or pool your land until formal mutual covenants are signed.
              </li>
            </ul>
          </div>

          <hr className="border-gray-100" />

          {/* Section 4 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                04
              </span>
              <h2 className="text-xl md:text-2xl font-heading font-bold text-primary">
                Residential Seller Marketplace Obligations
              </h2>
            </div>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              Sellers listing residential properties on TRINFRA agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm md:text-base text-gray-600">
              <li>
                Upload only authentic photos and accurate pricing, carpet area, and location specifications.
              </li>
              <li>
                Promptly update property availability (<span className="text-emerald-700 font-semibold text-xs">Available</span>, <span className="text-amber-700 font-semibold text-xs">Rented</span>, <span className="text-blue-700 font-semibold text-xs">Sold</span>, or <span className="text-red-700 font-semibold text-xs">Unavailable</span>) when property status changes.
              </li>
              <li>
                Refrain from submitting duplicate, synthetic, or deceptive listings. Listings found to be fraudulent or test entries will be immediately removed and the seller account suspended.
              </li>
            </ul>
          </div>

          <hr className="border-gray-100" />

          {/* Section 5 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                05
              </span>
              <h2 className="text-xl md:text-2xl font-heading font-bold text-primary">
                Buyer & Developer Enquiries
              </h2>
            </div>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              Users submitting buyer or institutional investor enquiries agree to provide genuine contact credentials. Unsolicited commercial advertising, automated scraping, or misuse of seller contact details is strictly prohibited.
            </p>
          </div>

          <hr className="border-gray-100" />

          {/* Section 6 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                06
              </span>
              <h2 className="text-xl md:text-2xl font-heading font-bold text-primary">
                Governing Law & Jurisdiction
              </h2>
            </div>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              These Terms and Conditions shall be governed by and construed in accordance with the laws of the Republic of India. Any disputes arising out of or in connection with the use of TRINFRA shall be subject to the exclusive jurisdiction of the competent courts in Kozhikode, Kerala.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
