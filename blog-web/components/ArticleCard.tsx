'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import type { Article } from '@/lib/api';
import { BorderBeam } from '@/components/ui/border-beam';

export default function ArticleCard({ article }: { article: Article }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('opacity-100', 'translate-y-0'); ob.disconnect(); } },
      { threshold: 0.08 }
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, []);

  const tagArray = article.tags ? article.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

  return (
    <article
      ref={ref}
      className="opacity-0 translate-y-4 transition-all duration-500 h-full"
    >
      <Link href={`/articles/${article.slug}`} className="block group h-full">
        <div className="relative h-full flex flex-col p-5 md:p-6 rounded-2xl border border-white/[0.12] hover:border-purple-500/50 transition-all duration-300 overflow-hidden bg-[#0d0d18]">

          {/* BorderBeam — 悬停时才显示 */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <BorderBeam
              size={120}
              duration={4}
              colorFrom="#a855f7"
              colorTo="#6366f1"
              borderWidth={1}
            />
          </div>

          {/* 悬停左上角辉光 */}
          <div className="absolute top-0 left-0 w-24 h-24 rounded-full bg-purple-600/0 group-hover:bg-purple-600/8 transition-all duration-500 blur-2xl -translate-x-4 -translate-y-4 pointer-events-none" />

          {/* 标签 */}
          {tagArray.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {tagArray.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.05] border border-white/[0.07] text-white/55 group-hover:border-purple-500/40 group-hover:text-purple-300/80 transition-all duration-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* 标题 */}
          <h2 className="text-base md:text-lg font-semibold text-white/85 group-hover:text-white/100 transition-colors leading-snug mb-2 flex-1 line-clamp-3">
            {article.title}
          </h2>

          {/* 摘要 */}
          {article.summary && (
            <p className="text-xs md:text-sm text-white/50 group-hover:text-white/65 transition-colors line-clamp-2 leading-relaxed mb-4">
              {article.summary}
            </p>
          )}

          {/* 底部：日期 + 箭头 */}
          <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
            <time className="text-[11px] text-white/40 group-hover:text-white/55 transition-colors">
              {new Date(article.created_at).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })}
            </time>
            <svg
              className="w-4 h-4 text-white/35 group-hover:text-purple-400 group-hover:translate-x-1 transition-all duration-300"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </Link>
    </article>
  );
}
