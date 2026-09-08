import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

const articles = [
  {
    slug: 'what-is-land-pooling',
    date: '20 Aug 2026',
    title: 'What is Land Pooling?',
    desc: 'A simple guide for landowners.',
    image: '/images/agri_fields.jpeg',
  },
  {
    slug: 'benefits-of-land-pooling',
    date: '15 Aug 2026',
    title: 'Benefits of Land Pooling',
    desc: 'Why landowners benefit together.',
    image: '/images/farm_grid.jpeg',
  },
  {
    slug: 'land-pooling-vs-traditional-development',
    date: '10 Aug 2026',
    title: 'Land Pooling vs Traditional Development',
    desc: 'Understanding the difference.',
    image: '/images/houses_valley.jpeg',
  },
  {
    slug: 'how-to-register-your-land',
    date: '5 Aug 2026',
    title: 'How Trinfra Facilitates Opportunities',
    desc: 'Our end-to-end process.',
    image: '/images/agri_land.jpeg',
  },
];

export default function KnowledgeCentre() {
  return (
    <section id="knowledge" className="py-16 md:py-24 bg-background">
      <div className="max-w-[1360px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8">
          <div className="flex flex-col justify-center sm:col-span-2 lg:col-span-1 pr-4 mb-4 lg:mb-0">
            <h2 className="text-[28px] sm:text-[36px] md:text-[42px] font-heading font-bold text-foreground mb-3 sm:mb-4 leading-tight">
              Knowledge Centre
            </h2>
            <p className="text-[14px] sm:text-[16px] text-gray-600 mb-6 sm:mb-8 max-w-[280px] leading-relaxed">
              Insights, guides and updates on land pooling and development.
            </p>
            <Link
              href="/knowledge-centre/what-is-land-pooling"
              className="bg-white border border-gray-200 text-foreground px-6 py-3 rounded-md text-[14px] font-bold hover:border-gray-300 transition-colors flex items-center gap-2 group w-fit shadow-sm"
            >
              <span>Explore Articles</span>
              <ArrowRight
                size={16}
                className="text-accent group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>

          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/knowledge-centre/${article.slug}`}
              className="flex flex-col h-full bg-white rounded-[20px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="h-44 w-full overflow-hidden relative bg-gray-100">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                  quality={75}
                  loading="lazy"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <span className="text-[11px] font-semibold text-gray-400 mb-3 tracking-wide uppercase">
                  {article.date}
                </span>
                <h3 className="text-[18px] font-bold text-foreground mb-3 leading-snug group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <p className="text-[14px] text-gray-500 mb-6 flex-grow leading-relaxed">
                  {article.desc}
                </p>
                <div className="flex items-center text-[13px] font-bold text-foreground group-hover:text-primary">
                  <span>Read More</span>
                  <ArrowRight
                    size={14}
                    className="ml-1.5 text-[#4ADE80] group-hover:translate-x-1 transition-transform"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
