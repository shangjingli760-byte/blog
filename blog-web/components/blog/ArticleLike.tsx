'use client';

import { useEffect, useState } from 'react';

interface Props {
  slug: string;
  size?: 'sm' | 'lg';
}

export default function ArticleLike({ slug, size = 'sm' }: Props) {
  const key = `like_${slug}`;
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [burst, setBurst] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(key);
    if (stored) {
      const { liked: l, count: c } = JSON.parse(stored);
      setLiked(l);
      setCount(c);
    }
  }, [key]);

  const toggle = () => {
    const next = !liked;
    const nextCount = next ? count + 1 : count - 1;
    setLiked(next);
    setCount(nextCount);
    localStorage.setItem(key, JSON.stringify({ liked: next, count: nextCount }));
    if (next) {
      setBurst(true);
      setTimeout(() => setBurst(false), 600);
    }
  };

  const isLg = size === 'lg';

  return (
    <button
      onClick={toggle}
      className={`relative group inline-flex items-center gap-2 rounded-full border transition-all duration-300 select-none ${
        isLg ? 'px-7 py-3 text-base' : 'px-4 py-2 text-sm'
      } ${
        liked
          ? 'border-rose-500/50 bg-rose-500/10 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.2)]'
          : 'border-white/[0.08] bg-white/[0.03] text-white/35 hover:border-white/20 hover:text-white/60'
      }`}
    >
      {/* 爆炸粒子 */}
      {burst && (
        <span className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <span
              key={i}
              className="absolute w-1 h-1 rounded-full bg-rose-400"
              style={{
                top: '50%', left: '50%',
                transform: `rotate(${i * 60}deg) translateY(-16px)`,
                animation: 'burst 0.5s ease-out forwards',
                opacity: 0,
              }}
            />
          ))}
        </span>
      )}

      {/* 心形图标 */}
      <svg
        className={`transition-transform duration-200 ${liked ? 'scale-110' : 'group-hover:scale-110'} ${isLg ? 'w-5 h-5' : 'w-4 h-4'}`}
        viewBox="0 0 24 24"
        fill={liked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={liked ? 0 : 1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>

      <span className="font-medium">{count}</span>
      {isLg && <span className="text-[0.8em] opacity-60">{liked ? '已点赞' : '点个赞'}</span>}

      <style>{`
        @keyframes burst {
          0%   { opacity: 1; transform: rotate(var(--r)) translateY(-8px) scale(1); }
          100% { opacity: 0; transform: rotate(var(--r)) translateY(-20px) scale(0.3); }
        }
      `}</style>
    </button>
  );
}
