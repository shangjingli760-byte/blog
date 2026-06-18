'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getArticles } from '@/lib/api';
import type { Article } from '@/lib/api';
import Header from '@/components/Header';
import { PixelCanvas } from '@/components/effects/PixelCanvas';
import { Badge } from '@/components/ui/badge';
import { BlurFade } from '@/components/ui/blur-fade';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { BorderBeam } from '@/components/ui/border-beam';

const pixelColors = [
  'rgba(168, 85, 247, 0.35)',
  'rgba(99, 102, 241, 0.35)',
  'rgba(6, 182, 212, 0.25)',
];

/* ---------- 左侧面板 ---------- */
function Sidebar({
  open, onClose, query, setQuery, allTags, selectedTags, toggleTag,
}: {
  open: boolean;
  onClose: () => void;
  query: string;
  setQuery: (v: string) => void;
  allTags: string[];
  selectedTags: string[];
  toggleTag: (t: string) => void;
}) {
  return (
    <>
      {/* 遮罩 */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* 侧边栏主体 */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full w-72 flex flex-col
          bg-[#0a0a10] border-r border-white/[0.06]
          transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:h-auto lg:w-64 lg:shrink-0
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/[0.06] lg:hidden">
          <span className="text-sm font-semibold text-white/70 tracking-widest uppercase">筛选</span>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-8 overflow-y-auto">
          {/* 搜索 */}
          <div>
            <label className="block text-[10px] tracking-[0.25em] uppercase text-white/30 mb-3">搜索文章</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="标题 / 内容…"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.06] transition-all"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
          </div>

          {/* 标签筛选 */}
          {allTags.length > 0 && (
            <div>
              <label className="block text-[10px] tracking-[0.25em] uppercase text-white/30 mb-3">标签筛选</label>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${
                        active
                          ? 'bg-purple-600/30 border-purple-500/60 text-purple-300'
                          : 'bg-white/[0.04] border-white/[0.08] text-white/40 hover:border-white/20 hover:text-white/60'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
              {selectedTags.length > 0 && (
                <button
                  onClick={() => selectedTags.forEach(t => toggleTag(t))}
                  className="mt-3 text-[11px] text-white/30 hover:text-white/50 transition-colors underline"
                >
                  清除所有筛选
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

/* ---------- 文章行 ---------- */
function ArticleRow({ article, index }: { article: Article; index: number }) {
  const tagArray = article.tags ? article.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

  return (
    <BlurFade delay={index * 0.06} inView>
      <Link
        href={`/articles/${article.slug}`}
        className="relative group flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 p-5 sm:p-6 rounded-2xl border border-white/[0.06] bg-white/[0.025] hover:bg-white/[0.05] hover:border-purple-500/20 transition-all duration-300 overflow-hidden"
      >
        {/* BorderBeam on hover */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <BorderBeam size={100} duration={5} colorFrom="#a855f7" colorTo="#6366f1" borderWidth={1} />
        </div>

        {/* 左：日期纵列 */}
        <div className="shrink-0 flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0 sm:w-20 text-right">
          <time className="text-2xl sm:text-3xl font-black text-white/10 group-hover:text-white/20 transition-colors leading-none">
            {new Date(article.created_at).getDate().toString().padStart(2, '0')}
          </time>
          <div className="text-[11px] text-white/25 sm:leading-tight">
            <span className="block">{new Date(article.created_at).getFullYear()}</span>
            <span className="block">{new Date(article.created_at).toLocaleDateString('zh-CN', { month: 'short' })}</span>
          </div>
        </div>

        {/* 分割线 */}
        <div className="hidden sm:block w-px self-stretch bg-white/[0.06] group-hover:bg-purple-500/30 transition-colors" />

        {/* 右：内容 */}
        <div className="flex-1 min-w-0">
          <h2 className="text-base sm:text-lg font-semibold text-white/80 group-hover:text-white transition-colors mb-2 line-clamp-2 leading-snug">
            {article.title}
          </h2>
          {article.summary && (
            <p className="text-sm text-white/35 group-hover:text-white/45 transition-colors line-clamp-2 leading-relaxed mb-3">
              {article.summary}
            </p>
          )}
          <div className="flex flex-wrap gap-1.5">
            {tagArray.map(tag => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.05] border border-white/[0.08] text-white/35 group-hover:border-purple-500/30 group-hover:text-purple-300/60 transition-all"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* 箭头 */}
        <div className="shrink-0 self-center text-white/15 group-hover:text-purple-400 group-hover:translate-x-1 transition-all duration-300">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </Link>
    </BlurFade>
  );
}

/* ============================================================
   文章列表页
   ============================================================ */
export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    getArticles().then(setArticles).catch(() => []).finally(() => setLoading(false));
  }, []);

  const allTags = Array.from(
    new Set(articles.flatMap(a => a.tags ? a.tags.split(',').map(t => t.trim()).filter(Boolean) : []))
  );

  const filtered = articles.filter(a => {
    const q = query.toLowerCase();
    const matchQuery = !q || a.title.toLowerCase().includes(q) || (a.summary || '').toLowerCase().includes(q);
    const matchTags = selectedTags.length === 0 || selectedTags.every(t => a.tags?.includes(t));
    return matchQuery && matchTags;
  });

  const toggleTag = (t: string) =>
    setSelectedTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  return (
    <div className="relative min-h-screen bg-[#050508]">
      <PixelCanvas colors={pixelColors} gap={6} speed={20} opacity={0.8} />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 30%, transparent 0%, rgba(5,5,8,0.85) 100%)' }}
      />

      <Header />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        {/* 顶部栏 */}
        <BlurFade delay={0.1} inView>
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-block w-6 h-px bg-purple-500" />
                <AnimatedGradientText colorFrom="#a855f7" colorTo="#6366f1" speed={1.2}
                  className="text-[10px] tracking-[0.3em] uppercase font-medium">
                  Articles
                </AnimatedGradientText>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white/90">所有文章</h1>
              {!loading && (
                <p className="text-sm text-white/25 mt-1">共 {filtered.length} 篇{query || selectedTags.length > 0 ? ' · 已筛选' : ''}</p>
              )}
            </div>

            {/* 移动端筛选按钮 */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] text-sm text-white/50 hover:text-white/70 hover:border-white/15 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
              筛选
              {selectedTags.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-purple-600 text-[10px] flex items-center justify-center text-white font-bold">
                  {selectedTags.length}
                </span>
              )}
            </button>
          </div>
        </BlurFade>

        <div className="flex gap-8">
          {/* 侧边栏 */}
          <Sidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            query={query}
            setQuery={setQuery}
            allTags={allTags}
            selectedTags={selectedTags}
            toggleTag={toggleTag}
          />

          {/* 文章列表 */}
          <main className="flex-1 min-w-0">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-28 rounded-2xl bg-white/[0.025] border border-white/[0.05] animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-24 text-white/25">
                <p className="text-4xl mb-4">∅</p>
                <p className="text-sm">没有找到匹配的文章</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((a, i) => (
                  <ArticleRow key={a.id} article={a} index={i} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <footer className="relative z-10 border-t border-white/[0.05] py-6 text-center mt-10">
        <p className="text-xs text-white/15 tracking-widest">© {new Date().getFullYear()} lizq的小站</p>
      </footer>
    </div>
  );
}
