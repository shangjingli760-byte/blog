'use client';

import { useState } from 'react';
import { useComments } from '@/hooks/useComments';

/* ---- 单条评论 ---- */
function CommentCard({ c }: { c: { id: number; nickname: string; content: string; created_at: string } }) {
  return (
    <div className="group relative flex gap-4 py-5 border-b border-white/[0.05] last:border-0">
      <div
        className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white/70"
        style={{ background: `linear-gradient(135deg, hsl(${(c.nickname.charCodeAt(0) * 37) % 360},60%,35%), hsl(${(c.nickname.charCodeAt(0) * 37 + 120) % 360},60%,25%))` }}
      >
        {c.nickname.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-3 mb-1.5">
          <span className="text-sm font-semibold text-white/80">{c.nickname}</span>
          <time className="text-[11px] text-white/25">
            {new Date(c.created_at).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })}
          </time>
        </div>
        <p className="text-sm text-white/55 leading-relaxed whitespace-pre-wrap">{c.content}</p>
      </div>
    </div>
  );
}

/* ---- 输入框 ---- */
function CommentField({
  id, label, type = 'text', value, onChange, rows, focused, onFocus, onBlur,
}: {
  id: string; label: string; type?: string; value: string;
  onChange: (v: string) => void; rows?: number;
  focused: string | null; onFocus: (id: string) => void; onBlur: () => void;
}) {
  const isFocused = focused === id;
  const isActive = isFocused || value.length > 0;
  const base =
    'w-full bg-white/[0.03] border rounded-xl px-4 text-sm text-white/80 placeholder-transparent focus:outline-none transition-all duration-200';
  const borderClass = isFocused
    ? 'border-purple-500/50 shadow-[0_0_0_3px_rgba(168,85,247,0.12)]'
    : 'border-white/[0.07] hover:border-white/[0.12]';

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className={`absolute left-4 pointer-events-none transition-all duration-200 ${
          isActive
            ? '-top-2 text-[10px] tracking-widest uppercase text-purple-400/70 bg-[#0d0d14] px-1'
            : 'top-1/2 -translate-y-1/2 text-sm text-white/25'
        } ${rows ? 'top-3.5 translate-y-0' : ''}`}
        style={isActive && rows ? { top: '-0.5rem', transform: 'none' } : undefined}
      >
        {label}
      </label>
      {rows ? (
        <textarea
          id={id}
          rows={rows}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => onFocus(id)}
          onBlur={onBlur}
          placeholder={label}
          className={`${base} ${borderClass} pt-4 pb-3 resize-none`}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => onFocus(id)}
          onBlur={onBlur}
          placeholder={label}
          className={`${base} ${borderClass} py-3`}
        />
      )}
    </div>
  );
}

export default function CommentSection({ slug }: { slug: string }) {
  const { comments, loading, submitComment } = useComments(slug);
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [flash, setFlash] = useState<{ ok: boolean; msg: string } | null>(null);
  const [focused, setFocused] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !email.trim() || !content.trim()) {
      setFlash({ ok: false, msg: '请填写所有必填项' });
      return;
    }
    setSubmitting(true);
    setFlash(null);
    try {
      await submitComment({ nickname, email, content });
      setNickname(''); setEmail(''); setContent('');
      setFlash({ ok: true, msg: '评论已发布 ✦' });
    } catch (err: any) {
      setFlash({ ok: false, msg: err.message || '提交失败，请重试' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setFlash(null), 4000);
    }
  };

  return (
    <section className="mt-12">
      <div className="flex items-center gap-3 mb-8">
        <span className="inline-block w-5 h-px bg-purple-500" />
        <h2 className="text-lg font-semibold text-white/70 tracking-wide">
          评论
          <span className="ml-2 text-sm text-white/25 font-normal">({comments.length})</span>
        </h2>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden mb-8">
        {loading ? (
          <div className="p-8 space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-9 h-9 rounded-full bg-white/[0.05] animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 rounded bg-white/[0.05] animate-pulse" />
                  <div className="h-3 w-full rounded bg-white/[0.04] animate-pulse" />
                  <div className="h-3 w-3/4 rounded bg-white/[0.04] animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="py-14 text-center">
            <p className="text-3xl mb-3 opacity-20">💬</p>
            <p className="text-sm text-white/25">还没有评论，来说两句吧</p>
          </div>
        ) : (
          <div className="px-6 divide-y divide-white/[0.04]">
            {comments.map(c => <CommentCard key={c.id} c={c} />)}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6 md:p-8">
        <p className="text-xs tracking-[0.25em] uppercase text-white/25 mb-6">发表评论</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CommentField id="nickname" label="昵称 *" value={nickname} onChange={setNickname} focused={focused} onFocus={setFocused} onBlur={() => setFocused(null)} />
            <CommentField id="email" label="邮箱 *" type="email" value={email} onChange={setEmail} focused={focused} onFocus={setFocused} onBlur={() => setFocused(null)} />
          </div>
          <CommentField id="content" label="写下你的想法…" value={content} onChange={setContent} rows={4} focused={focused} onFocus={setFocused} onBlur={() => setFocused(null)} />

          {flash && (
            <div className={`px-4 py-2.5 rounded-xl text-sm ${flash.ok ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              {flash.msg}
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <p className="text-[11px] text-white/20">邮箱仅用于身份识别，不会公开</p>
            <button
              type="submit"
              disabled={submitting}
              className="relative group inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-white overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              style={{
                background: 'linear-gradient(135deg, rgba(168,85,247,0.75), rgba(99,102,241,0.75))',
                boxShadow: '0 0 20px rgba(168,85,247,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
              }}
            >
              <span className="relative z-10">{submitting ? '发布中…' : '发布评论'}</span>
              {!submitting && (
                <svg className="w-3.5 h-3.5 relative z-10 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              )}
              <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300 rounded-full" />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
