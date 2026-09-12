import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ProjectsLoading() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <Navbar />
      <div className="flex-grow pt-[72px]">
        {/* Header Hero Skeleton */}
        <section className="bg-primary-dark text-white py-16 px-6 md:px-12 border-b border-primary-light/20">
          <div className="max-w-[1360px] mx-auto text-center md:text-left">
            <div className="h-4 w-40 bg-white/20 rounded mb-4 animate-pulse" />
            <div className="h-10 w-96 max-w-full bg-white/20 rounded mb-4 animate-pulse" />
            <div className="h-5 w-80 max-w-full bg-white/10 rounded animate-pulse" />
          </div>
        </section>

        {/* Filter Bar Skeleton */}
        <div className="max-w-[1360px] mx-auto px-6 md:px-12 py-8">
          <div className="flex flex-wrap gap-4 items-center justify-between pb-6 border-b border-gray-200">
            <div className="flex flex-wrap gap-3">
              <div className="h-10 w-36 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 w-36 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 w-36 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-10 w-44 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Projects Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-8">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-gray-200/80 overflow-hidden shadow-sm flex flex-col"
              >
                <div className="h-52 bg-gray-200 animate-pulse w-full" />
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="h-6 w-3/4 bg-gray-200 rounded mb-3 animate-pulse" />
                    <div className="h-4 w-full bg-gray-100 rounded mb-2 animate-pulse" />
                    <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
                  </div>
                  <div className="pt-6 border-t border-gray-100 mt-6 flex justify-between items-center">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
