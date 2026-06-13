// 文章列表首页（SSG 构建时获取数据）
import { getArticles } from '@/lib/api';
import type { Article } from '@/lib/api';
import ArticleCard from '@/components/ArticleCard';

export default async function HomePage() {
  let articles: Article[] = [];
  let error: string | null = null;

  try {
    articles = await getArticles();
  } catch (err: any) {
    error = err.message;
  }

  return (
    <div>
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
  );
}
