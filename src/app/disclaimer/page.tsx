import { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AlertTriangle, ArrowLeft, ShieldAlert, CheckCircle2, HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Disclaimer | TRINFRA Land Aggregation & Facilitation',
  description:
    'Official platform disclaimer regarding land aggregation feasibility, project timelines, residential listings, and third-party development outcomes.',
};

export default function DisclaimerPage() {
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
            <ShieldAlert size={14} /> Platform Notices
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-white tracking-tight mb-4">
            Disclaimer
          </h1>
          <p className="text-sm md:text-base text-white/70 max-w-2xl mx-auto leading-relaxed">
            Important notices regarding the scope, informational nature, and limitations of land facilitation services offered by TRINFRA.
          </p>
          <p className="text-xs text-accent/80 font-mono mt-4">
            Last Updated: August 2026 &bull; TRINFRA Facilitation Architecture
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
                Informational Purposes Only
              </h2>
            </div>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              All information presented on this website (<span className="text-primary font-medium">trinfra.vercel.app</span>), including project master outlines, opportunity acreages, GIS boundary illustrations, and residential property descriptions, is published in good faith for informational and aggregation-facilitation purposes only.
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
                No Guarantee of Development Outcomes or Returns
              </h2>
            </div>
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-sm leading-relaxed space-y-2">
              <p className="font-semibold flex items-center gap-2 text-amber-950">
                <AlertTriangle size={16} className="text-amber-700" /> Submission &amp; Feasibility Notice
              </p>
              <p className="text-xs text-amber-800 leading-relaxed">
                A land registration submission does not constitute a formal commitment, promise of financial returns, guarantee of approval, or assurance that a land pooling project will proceed to execution. Feasibility depends on contiguity, title clarity, zoning regulations, and mutual consensus among participating landowners and development partners.
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
                Statutory Approvals &amp; Government Clearances
              </h2>
            </div>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              Any reference to proposed road corridors, industrial zones, township master plans, or infrastructure links (such as the Trivandrum Outer Ring Road or coastal logistics zones) are subject to official government notifications, statutory town planning schemes, Kerala Panchayati Raj / Municipality regulations, and environmental impact assessments. TRINFRA does not represent or act on behalf of any government ministry or statutory authority.
            </p>
          </div>

          <hr className="border-gray-100" />

          {/* Section 4 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                04
              </span>
              <h2 className="text-xl md:text-2xl font-heading font-bold text-primary">
                Independent Due Diligence
              </h2>
            </div>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              Landowners, developers, and residential property buyers are strongly encouraged to carry out independent title scrutiny, encumbrance verifications, physical site inspections, and financial advisory reviews with certified advocates and chartered accountants before executing formal legal contracts.
            </p>
          </div>

          <hr className="border-gray-100" />

          {/* Section 5 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                05
              </span>
              <h2 className="text-xl md:text-2xl font-heading font-bold text-primary">
                Residential Marketplace Listings
              </h2>
            </div>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              Residential listings published on TRINFRA are submitted directly by registered property owners and verified under our desk protocol. While TRINFRA takes reasonable measures to ensure accuracy, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, or suitability of the property features or prices listed by third-party sellers.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
