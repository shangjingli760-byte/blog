// 文章详情页
import type { Metadata } from 'next';
import { getArticleBySlug, getArticles } from '@/lib/api';
import CommentSection from '@/components/CommentSection';
import Header from '@/components/Header';
import { PixelCanvas } from '@/components/effects/PixelCanvas';
import ArticleLike from '@/components/blog/ArticleLike';
import { BlurFade } from '@/components/ui/blur-fade';
import { BorderBeam } from '@/components/ui/border-beam';

const pixelColors = [
  'rgba(168, 85, 247, 0.3)',
  'rgba(99, 102, 241, 0.3)',
  'rgba(6, 182, 212, 0.2)',
];

interface Props { params: { slug: string } }

export async function generateStaticParams() {
  try {
    const articles = await getArticles();
    return articles.map(a => ({ slug: a.slug }));
  } catch { return []; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const a = await getArticleBySlug(params.slug);
    return { title: a.title, description: a.summary };
  } catch { return { title: '文章未找到' }; }
}

export default async function ArticlePage({ params }: Props) {
  let article;
  let error: string | null = null;
  try {
    article = await getArticleBySlug(params.slug);
  } catch (err: any) { error = err.message; }

  if (error || !article) {
    return (
      <div className="relative min-h-screen bg-[#050508]">
        <PixelCanvas colors={pixelColors} gap={6} speed={18} opacity={0.7} />
        <Header />
        <div className="relative z-10 flex items-center justify-center min-h-[60vh]">
          <p className="text-white/30 text-lg">{error || '文章未找到'}</p>
        </div>
      </div>
    );
  }

  const tagArray = article.tags ? article.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
  const dateStr = new Date(article.created_at).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="relative min-h-screen bg-[#050508]">
      {/* 背景 */}
      <PixelCanvas colors={pixelColors} gap={6} speed={18} opacity={0.7} />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 20%, transparent 0%, rgba(5,5,8,0.9) 100%)' }}
      />

      <Header />

      {/* 主体：最大宽度居中 */}
      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-24">

        {/* ===== 文章头部 ===== */}
        <BlurFade delay={0.1}>
          <header className="mb-10">
            {/* 返回 */}
            <a
              href="/articles"
              className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.2em] uppercase text-white/25 hover:text-white/50 transition-colors mb-8 group"
            >
              <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              所有文章
            </a>

            {/* 标签 */}
            {tagArray.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {tagArray.map(tag => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-purple-500/30 bg-purple-500/10 text-purple-300/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* 标题 */}
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6"
              style={{
                background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {article.title}
            </h1>

            {/* 摘要 */}
            {article.summary && (
              <p className="text-base text-white/40 leading-relaxed mb-6 border-l-2 border-purple-500/40 pl-4">
                {article.summary}
              </p>
            )}

            {/* 元信息行 */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4 text-sm text-white/30">
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <time>{dateStr}</time>
                </div>
              </div>
            </div>

            {/* 分割线 */}
            <div className="mt-6 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
          </header>
        </BlurFade>

        {/* ===== 文章正文 ===== */}
        <style>{`
          .article-content { color: rgba(255,255,255,0.75); line-height: 1.9; }
          .article-content h1, .article-content h2, .article-content h3, .article-content h4 { color: #fff; font-weight: 700; }
          .article-content h1 { font-size: 1.875rem; }
          .article-content h2 { font-size: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem; margin-top: 2rem; margin-bottom: 1rem; }
          .article-content h3 { font-size: 1.25rem; margin-top: 1.5rem; margin-bottom: 0.75rem; }
          .article-content h4 { font-size: 1.1rem; margin-top: 1.25rem; margin-bottom: 0.5rem; }
          .article-content p { color: rgba(255,255,255,0.75); margin-bottom: 1.25rem; line-height: 1.9; }
          .article-content a { color: #c4b5fd; text-decoration: none; }
          .article-content a:hover { color: #ddd6fe; }
          .article-content strong { color: #fff; font-weight: 600; }
          .article-content em { color: rgba(255,255,255,0.7); }
          .article-content ul, .article-content ol { color: rgba(255,255,255,0.75); padding-left: 1.5rem; margin-bottom: 1.25rem; }
          .article-content li { color: rgba(255,255,255,0.75); margin-bottom: 0.5rem; }
          .article-content li::marker { color: rgba(168,85,247,0.6); }
          .article-content blockquote { border-left: 3px solid rgba(168,85,247,0.5); padding-left: 1rem; color: rgba(255,255,255,0.6); margin: 1.5rem 0; font-style: normal; }
          .article-content code { color: #67e8f9; background: rgba(255,255,255,0.08); padding: 0.15rem 0.4rem; border-radius: 0.25rem; font-size: 0.85em; font-family: monospace; }
          .article-content pre { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 0.75rem; padding: 1rem; overflow-x: auto; margin: 1.5rem 0; }
          .article-content pre code { background: none; padding: 0; color: rgba(255,255,255,0.8); }
          .article-content hr { border-color: rgba(255,255,255,0.07); margin: 2rem 0; }
          .article-content table { color: rgba(255,255,255,0.75); width: 100%; margin: 1.5rem 0; }
          .article-content th { color: #fff; border-bottom: 1px solid rgba(255,255,255,0.1); padding: 0.5rem; text-align: left; }
          .article-content td { border-bottom: 1px solid rgba(255,255,255,0.07); padding: 0.5rem; }
          .article-content img { border-radius: 0.75rem; max-width: 100%; }
        `}</style>
        <article
          className="article-content max-w-none"
          dangerouslySetInnerHTML={{ __html: article.html }}
        />

        {/* 底部分割线 */}
        <div className="mt-14 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

        {/* 底部点赞区 */}
        <div className="my-8 flex justify-center">
          <ArticleLike slug={params.slug} size="lg" />
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent mb-2" />

        {/* ===== 评论区 ===== */}
        <CommentSection slug={params.slug} />
      </main>
    </div>
  );
}
