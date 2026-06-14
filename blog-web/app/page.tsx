// 文章列表首页（SSG 构建时获取数据）
import { getArticles } from '@/lib/api';
import type { Article } from '@/lib/api';
import ArticleCard from '@/components/ArticleCard';
import { WovenLightHero } from '@/components/ui/woven-light-hero';
import { Gallery4 } from '@/components/ui/gallery4';
import type { Gallery4Item } from '@/components/ui/gallery4';

// Unsplash 图片池，用于博客卡片封面
const blogCovers = [
  "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80",
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80",
  "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&q=80",
  "https://images.unsplash.com/photo-1515879218367-8466d910aef7?w=800&q=80",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80",
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
];

function articlesToGalleryItems(articles: Article[]): Gallery4Item[] {
  return articles.map((article, index) => ({
    id: String(article.id),
    title: article.title,
    description: article.summary || article.tags || '',
    href: `/articles/${article.slug}`,
    image: blogCovers[index % blogCovers.length],
  }));
}

export default async function HomePage() {
  let articles: Article[] = [];
  let error: string | null = null;

  try {
    articles = await getArticles();
  } catch (err: any) {
    error = err.message;
  }

  const galleryItems = articlesToGalleryItems(articles);

  return (
    <>
      <WovenLightHero />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">文章列表</h1>
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700 mb-4">
            无法加载文章：{error}
          </div>
        )}
        {articles.length === 0 && !error && (
          <p className="text-gray-500 text-center py-12">还没有文章，敬请期待。</p>
        )}
        <div className="grid gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>

      {galleryItems.length > 0 && (
        <Gallery4
          title="精选文章"
          description="浏览最新发布的技术文章与思考，涵盖前端开发、后端架构、AI 探索等领域。"
          items={galleryItems}
        />
      )}
    </>
  );
}
