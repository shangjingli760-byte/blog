'use client';

import { useEffect, useState } from 'react';
import { getArticles } from '@/lib/api';
import type { Article } from '@/lib/api';
import Header from '@/components/Header';
import ArticleCard from '@/components/ArticleCard';
import { PixelCanvas } from '@/components/effects/PixelCanvas';
import { FlipNumber } from '@/components/ui/flip-digit';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { Meteors } from '@/components/ui/meteors';
import { BlurFade } from '@/components/ui/blur-fade';

// ── 模块级常量 ──────────────────────────────────────────────────────
const SITE_BIRTH = new Date('2024-01-01T00:00:00Z');

const PIXEL_COLORS = [
  'rgba(168, 85, 247, 0.55)',
  'rgba(99, 102, 241, 0.55)',
  'rgba(6, 182, 212, 0.45)',
];
// ─────────────────────────────────────────────────────────────────────

function useSiteAge() {
  const [elapsed, setElapsed] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const calc = () => {
      const diff = Date.now() - SITE_BIRTH.getTime();
      setElapsed({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, []);
  return elapsed;
}

function UptimeUnit({ value, label, minDigits = 2 }: { value: number; label: string; minDigits?: number }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative flex items-center justify-center rounded-2xl px-3 py-3 sm:px-4 sm:py-4"
        style={{
          background: 'linear-gradient(135deg, rgba(168,85,247,0.08) 0%, rgba(99,102,241,0.05) 100%)',
          border: '1px solid rgba(168,85,247,0.18)',
          boxShadow: '0 0 24px rgba(168,85,247,0.1), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {/* corner dots */}
        <span className="absolute top-2 left-2 w-1 h-1 rounded-full bg-purple-500/40" />
        <span className="absolute top-2 right-2 w-1 h-1 rounded-full bg-purple-500/40" />
        <span className="absolute bottom-2 left-2 w-1 h-1 rounded-full bg-purple-500/40" />
        <span className="absolute bottom-2 right-2 w-1 h-1 rounded-full bg-purple-500/40" />
        <FlipNumber value={value} minDigits={minDigits} />
      </div>
      <span className="text-[11px] tracking-[0.25em] uppercase text-white/30 font-medium">{label}</span>
    </div>
  );
}

function UptimeDisplay({ age, mounted }: { age: ReturnType<typeof useSiteAge>; mounted: boolean }) {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* 顶部标签 */}
      <div className="flex items-center gap-2">
        <span className="w-4 h-px bg-purple-500/40" />
        <span className="text-[11px] tracking-[0.3em] uppercase text-white/25 font-mono">UPTIME</span>
        <span className="w-4 h-px bg-purple-500/40" />
      </div>

      {/* 四格计时器 */}
      {mounted && (
        <div className="flex items-end gap-3 sm:gap-4">
          <UptimeUnit value={age.days} label="天" />
          <Separator />
          <UptimeUnit value={age.hours} label="时" />
          <Separator />
          <UptimeUnit value={age.minutes} label="分" />
          <Separator />
          <UptimeUnit value={age.seconds} label="秒" />
        </div>
      )}

      {/* 底部装饰线 */}
      <div className="flex items-center gap-3 opacity-30">
        <span className="w-12 h-px bg-gradient-to-r from-transparent to-purple-500" />
        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
        <span className="w-12 h-px bg-gradient-to-l from-transparent to-purple-500" />
      </div>

      {/* 建站日期 */}
      <p className="text-[11px] font-mono text-white/20 tracking-widest">
        SINCE {SITE_BIRTH.getFullYear()}.{String(SITE_BIRTH.getMonth() + 1).padStart(2, '0')}.{String(SITE_BIRTH.getDate()).padStart(2, '0')}
      </p>
    </div>
  );
}

function Separator() {
  return (
    <div className="flex flex-col items-center gap-2 pb-8">
      <span className="w-1 h-1 rounded-full bg-purple-500/50" />
      <span className="w-1 h-1 rounded-full bg-purple-500/25" />
    </div>
  );
}

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const age = useSiteAge();

  useEffect(() => {
    setMounted(true);
    getArticles()
      .then(setArticles)
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="relative min-h-screen bg-[#050508] overflow-x-hidden">
      {/* 背景层 */}
      <PixelCanvas colors={PIXEL_COLORS} gap={5} speed={25} opacity={1} />
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 40%, transparent 0%, rgba(5,5,8,0.75) 100%)' }} />

      {/* 流星 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[1]">
        <Meteors number={14} minDuration={6} maxDuration={16} angle={215}
          className="bg-purple-300 shadow-[0_0_0_1px_rgba(168,85,247,0.3)]" />
      </div>

      <Header />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative z-10 min-h-[92vh] px-4 flex flex-col items-center justify-center py-20 lg:py-0">
        <div className="max-w-7xl mx-auto w-full flex flex-col items-center gap-12 lg:gap-16">

          {/* 上：文字 */}
          <div className="flex flex-col items-center text-center">

            {/* 徽章 */}
            <BlurFade delay={0.1} inView>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.04] px-4 py-1 mb-6">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                <AnimatedGradientText colorFrom="#a855f7" colorTo="#6366f1" speed={1.5}
                  className="text-xs font-medium tracking-widest uppercase">
                  技术 · 分享 · 探索
                </AnimatedGradientText>
              </div>
            </BlurFade>

            {/* 主标题 */}
            <BlurFade delay={0.2} inView>
              <h1
                className="text-[clamp(3rem,10vw,7rem)] font-black leading-[1.1] tracking-tighter mb-12 select-none"
                style={{
                  background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.45) 30%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.85) 65%, rgba(255,255,255,0.2) 80%, #fff 100%)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text', backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  WebkitTextStroke: '1px rgba(255,255,255,0.15)',
                  filter: 'drop-shadow(0 0 40px rgba(168,85,247,0.35))',
                  animation: 'shimmer 8s linear infinite',
                }}
              >
                lizq的小站
              </h1>
            </BlurFade>

            {/* CTA */}
            <BlurFade delay={0.5} inView>
              <ShimmerButton
                shimmerColor="rgba(168,85,247,0.8)"
                shimmerDuration="2.5s"
                background="linear-gradient(135deg, rgba(88,28,135,0.9), rgba(67,56,202,0.9))"
                borderRadius="9999px"
                className="text-sm font-semibold px-8 py-3.5 gap-3"
                onClick={() => document.getElementById('articles')?.scrollIntoView({ behavior: 'smooth' })}
              >
                浏览文章
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </ShimmerButton>
            </BlurFade>
          </div>

          {/* 下：运行时长 */}
          <BlurFade delay={0.3} inView>
            <UptimeDisplay age={age} mounted={mounted} />
          </BlurFade>
        </div>

        {/* 滚动箭头 */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-40"
          style={{ animation: 'float 2.5s ease-in-out infinite' }}>
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── 文章列表 ─────────────────────────────────────────────── */}
      <section id="articles" className="relative z-10 pb-24 px-4 sm:px-6 lg:px-8 pt-16">
        <div className="max-w-7xl mx-auto">
          <BlurFade delay={0.1} inView>
            <div className="mb-10 md:mb-14">
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-block w-8 h-px bg-purple-500" />
                <AnimatedGradientText colorFrom="#a855f7" colorTo="#6366f1" speed={1.2}
                  className="text-xs tracking-[0.25em] uppercase font-medium">
                  Articles
                </AnimatedGradientText>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white/90">最新文章</h2>
            </div>
          </BlurFade>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-52 rounded-2xl bg-white/[0.03] border border-white/[0.06] animate-pulse" />
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-20 text-white/30">暂无文章</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article, i) => (
                <BlurFade key={article.id} delay={i * 0.08} inView>
                  <ArticleCard article={article} />
                </BlurFade>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/[0.05] py-8 text-center">
        <p className="text-xs text-white/20 tracking-widest">
          © {new Date().getFullYear()} lizq的小站 · Powered by Next.js + Go
        </p>
      </footer>
    </div>
  );
}
