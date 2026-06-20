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
          .article-content {
            --tw-prose-body: rgba(255,255,255,0.75);
            --tw-prose-headings: #fff;
            --tw-prose-lead: rgba(255,255,255,0.65);
            --tw-prose-links: #c4b5fd;
            --tw-prose-bold: #fff;
            --tw-prose-counters: rgba(255,255,255,0.5);
            --tw-prose-bullets: rgba(168,85,247,0.6);
            --tw-prose-hr: rgba(255,255,255,0.07);
            --tw-prose-quotes: rgba(255,255,255,0.6);
            --tw-prose-quote-borders: rgba(168,85,247,0.5);
            --tw-prose-captions: rgba(255,255,255,0.5);
            --tw-prose-code: #67e8f9;
            --tw-prose-pre-code: rgba(255,255,255,0.8);
            --tw-prose-pre-bg: rgba(255,255,255,0.04);
            --tw-prose-th-borders: rgba(255,255,255,0.1);
            --tw-prose-td-borders: rgba(255,255,255,0.07);
          }
          .article-content h1, .article-content h2, .article-content h3, .article-content h4 { color: #fff !important; }
        `}</style>
        <article
          className="
            prose article-content max-w-none
            prose-headings:font-bold prose-headings:tracking-tight
            prose-h1:text-3xl prose-h2:text-2xl prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-2
            prose-p:leading-[1.9]
            prose-a:no-underline hover:prose-a:text-purple-200
            prose-strong:font-semibold
            prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[0.85em] prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
            prose-pre:border prose-pre:border-white/[0.07] prose-pre:rounded-xl
            prose-blockquote:border-l-purple-500 prose-blockquote:not-italic
            prose-img:rounded-xl prose-img:shadow-[0_0_30px_rgba(0,0,0,0.5)]
          "
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
