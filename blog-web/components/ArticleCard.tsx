// 文章卡片组件，用于列表页展示文章摘要
import Link from 'next/link';
import type { Article } from '@/lib/api';

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <Link href={`/articles/${article.slug}`}>
        <h2 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors mb-2">
          {article.title}
        </h2>
      </Link>
      {article.summary && (
        <p className="text-gray-600 mb-3 line-clamp-3">{article.summary}</p>
      )}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <div className="flex gap-2">
          {article.tags && article.tags.split(',').map((tag) => (
            <span key={tag} className="bg-gray-100 px-2 py-0.5 rounded text-xs">
              {tag.trim()}
            </span>
          ))}
        </div>
        <time>{new Date(article.created_at).toLocaleDateString('zh-CN')}</time>
      </div>
    </article>
  );
}
