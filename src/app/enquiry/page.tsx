import { Suspense } from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EnquiryPageClient from './EnquiryPageClient';

export const metadata: Metadata = {
  title: 'Developer & Investor Enquiry | Trinfra',
  description:
    "Let's Build the Right Opportunity Together. Tell us what you're looking for and our team will connect you with relevant land-pooling opportunities in Kerala.",
};

export default function EnquiryPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] font-sans text-foreground">
      <Navbar />
      <main className="flex-grow pt-[72px]">
        <Suspense
          fallback={
            <div className="max-w-[1360px] mx-auto px-6 py-20 text-center text-gray-400">
              Loading enquiry form...
            </div>
          }
        >
          <EnquiryPageClient />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
