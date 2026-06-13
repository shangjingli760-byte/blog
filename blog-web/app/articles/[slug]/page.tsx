// 文章详情页，SSG 预渲染，展示 Markdown 渲染后的 HTML 内容
import type { Metadata } from 'next';
import { getArticleBySlug, getArticles } from '@/lib/api';
import CommentSection from '@/components/CommentSection';

interface Props {
  params: { slug: string };
}

// 构建时生成所有文章路径
export async function generateStaticParams() {
  try {
    const articles = await getArticles();
    return articles.map((a) => ({ slug: a.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const article = await getArticleBySlug(params.slug);
    return {
      title: article.title,
      description: article.summary,
    };
  } catch {
    return { title: '文章未找到' };
  }
}

export default async function ArticlePage({ params }: Props) {
  let article;
  let error: string | null = null;

  try {
    article = await getArticleBySlug(params.slug);
  } catch (err: any) {
    error = err.message;
  }

  if (error || !article) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-gray-500 mb-4">文章未找到</h1>
        <p className="text-gray-400">{error || '该文章可能已被删除。'}</p>
      </div>
    );
  }

  return (
    <article>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">{article.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <time>{new Date(article.created_at).toLocaleDateString('zh-CN')}</time>
          {article.tags && (
            <div className="flex gap-1">
              {article.tags.split(',').map((tag) => (
                <span key={tag} className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* 渲染 Markdown 转换后的 HTML，内容由后端在导入时转换 */}
      <div
        className="prose prose-gray max-w-none"
        dangerouslySetInnerHTML={{ __html: article.html }}
      />

      <CommentSection slug={params.slug} />
    </article>
  );
}
