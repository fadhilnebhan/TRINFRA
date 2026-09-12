import { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldCheck, Lock, Eye, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | TRINFRA Land Aggregation & Facilitation',
  description:
    'Read TRINFRA’s Privacy Policy to understand how we protect landowner data, property listings, and personal information across Kerala.',
};

export default function PrivacyPage() {
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
            <ShieldCheck size={14} /> Legal & Privacy
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-white tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-sm md:text-base text-white/70 max-w-2xl mx-auto leading-relaxed">
            TRINFRA is dedicated to preserving the absolute confidentiality and privacy of landowners,
            developers, sellers, and buyers across our platform.
          </p>
          <p className="text-xs text-accent/80 font-mono mt-4">
            Last Updated: August 2026 &bull; Effective for all users in Kerala, India
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
                Scope & Overview
              </h2>
            </div>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              This Privacy Policy explains how TRINFRA (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) collects, uses, protects, and handles personal and land-related information submitted through our website (<span className="text-primary font-medium">trinfra.vercel.app</span>) and related digital tools. By using TRINFRA, submitting a land registration, listing a residential property, or making an enquiry, you consent to the data practices described herein.
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
                Information We Collect
              </h2>
            </div>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              We collect information necessary to aggregate parcels, verify authenticity, and facilitate legitimate transactions:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm md:text-base text-gray-600">
              <li>
                <strong className="text-gray-900">Landowner Submissions:</strong> Full legal name, phone number, email address, postal address, Kerala district, taluk, village/local-body, survey numbers, approximate acreage, land classification, and ownership documents.
              </li>
              <li>
                <strong className="text-gray-900">Residential Seller Accounts:</strong> Name, contact email, phone number, account credentials, property specifications, geo-coordinates, and verified photographs.
              </li>
              <li>
                <strong className="text-gray-900">Buyer & Developer Enquiries:</strong> Inquirer name, company name (where applicable), contact details, financing intent, and specific message contents.
              </li>
              <li>
                <strong className="text-gray-900">Technical & Usage Metadata:</strong> IP address, device type, browser signatures, and anonymized access logs to prevent abuse and ensure platform security.
              </li>
            </ul>
          </div>

          <hr className="border-gray-100" />

          {/* Section 3 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                03
              </span>
              <h2 className="text-xl md:text-2xl font-heading font-bold text-primary">
                How We Use Your Information
              </h2>
            </div>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              Information collected is strictly utilized for authorized facilitation purposes:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <h3 className="font-semibold text-primary text-sm mb-1 flex items-center gap-2">
                  <Lock size={14} className="text-accent" /> Verification & Due Diligence
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Screening survey boundaries, verifying ownership documentation, and assessing development feasibility with qualified panel experts.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <h3 className="font-semibold text-primary text-sm mb-1 flex items-center gap-2">
                  <Eye size={14} className="text-accent" /> Status Tracking & Enquiries
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Allowing landowners to track verification status using unique references, and routing legitimate buyer enquiries directly to verified sellers.
                </p>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section 4 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                04
              </span>
              <h2 className="text-xl md:text-2xl font-heading font-bold text-primary">
                Privacy Masking & Confidentiality
              </h2>
            </div>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              We uphold rigorous privacy guardrails across public-facing interfaces:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm md:text-base text-gray-600">
              <li>
                <strong>Public Status Tracking:</strong> Public tracking lookups via reference numbers display only masked personal names (e.g. &ldquo;M*** S***&rdquo;) and general status milestones. Sensitive survey numbers, private mobile numbers, and uploaded deed files are strictly excluded from unauthenticated responses.
              </li>
              <li>
                <strong>Seller Isolation:</strong> Sellers can only access enquiries and listing data belonging directly to their own account.
              </li>
              <li>
                <strong>No Public Selling of Data:</strong> TRINFRA does not sell, rent, or trade private contact details to external marketing agencies or unsolicited lead brokers.
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
                Document & Storage Security
              </h2>
            </div>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              Property documentation and identification assets are stored securely using encrypted cloud infrastructure (Supabase Storage and PostgreSQL). Access to administrative review workflows is restricted to authenticated TRINFRA administrators with time-limited sessions.
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
                Your Rights & Inquiries
              </h2>
            </div>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              Under applicable Indian information technology statutes, you retain the right to review, update, or request the deletion of your registration or property listing records, provided they are not part of an executed, legally binding aggregation covenant.
            </p>
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/15 text-sm text-gray-700">
              <p className="font-semibold text-primary mb-1">TRINFRA Privacy Team</p>
              <p className="text-xs text-gray-600">Email: <a href="mailto:info@trinfra.com" className="text-accent hover:underline">info@trinfra.com</a></p>
              <p className="text-xs text-gray-600">Address: 1st Floor, Trinfra House, Kozhikode, Kerala, India - 673001</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
