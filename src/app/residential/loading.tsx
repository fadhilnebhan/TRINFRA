import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ResidentialLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf9] font-sans text-foreground">
      <Navbar />
      <main className="flex-grow pt-[72px]">
        {/* Hero Header Skeleton */}
        <section className="bg-primary-dark text-white py-14 px-6 md:px-12 border-b border-primary-light/20">
          <div className="max-w-[1360px] mx-auto">
            <div className="h-4 w-40 bg-white/20 rounded mb-3 animate-pulse" />
            <div className="h-10 w-96 max-w-full bg-white/20 rounded mb-4 animate-pulse" />
            <div className="h-5 w-80 max-w-full bg-white/10 rounded mb-6 animate-pulse" />
            {/* Search Input Skeleton */}
            <div className="h-12 w-full max-w-xl bg-white/15 rounded-lg animate-pulse" />
          </div>
        </section>

        {/* District Pills Bar Skeleton */}
        <section className="bg-white border-b border-gray-200 py-3 px-6 md:px-12">
          <div className="max-w-[1360px] mx-auto flex gap-2 overflow-hidden">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-8 w-24 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
            ))}
          </div>
        </section>

        {/* Listings Grid Skeleton */}
        <section className="max-w-[1360px] mx-auto px-6 md:px-12 py-10 w-full">
          <div className="flex justify-between items-center mb-6">
            <div className="h-5 w-44 bg-gray-200 rounded animate-pulse" />
            <div className="h-9 w-32 bg-gray-200 rounded animate-pulse" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col"
              >
                <div className="h-52 bg-gray-200 animate-pulse w-full" />
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="h-5 w-3/4 bg-gray-200 rounded mb-2 animate-pulse" />
                    <div className="h-4 w-1/2 bg-gray-100 rounded mb-4 animate-pulse" />
                    <div className="flex gap-4 mb-4">
                      <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
                      <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
                      <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                    <div className="h-6 w-28 bg-gray-200 rounded animate-pulse" />
                    <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
