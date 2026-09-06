import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ArticleDetailView from '@/components/knowledge/ArticleDetailView';
import { getAllArticles, getArticleBySlug } from '@/lib/articlesData';

interface PageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const article = getArticleBySlug(params.slug);
  if (!article) {
    return {
      title: 'Article Not Found | Trinfra Knowledge Centre',
    };
  }

  return {
    title: `${article.title} ${article.titleAccent || ''} | Trinfra Knowledge Centre`,
    description: article.subtitle || article.excerpt,
    openGraph: {
      title: `${article.title} ${article.titleAccent || ''} | Trinfra Knowledge Centre`,
      description: article.subtitle || article.excerpt,
      images: [article.image],
    },
  };
}

export default function ArticlePage({ params }: PageProps) {
  const article = getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] font-sans text-foreground">
      <Navbar />
      <main className="flex-grow pt-[72px]">
        <ArticleDetailView article={article} />
      </main>
      <Footer />
    </div>
  );
}
