// 留言区域组件，展示评论列表并提供提交表单（邮箱必填）
'use client';

import { useState } from 'react';
import { useComments } from '@/hooks/useComments';

export default function CommentSection({ slug }: { slug: string }) {
  const { comments, loading, submitComment } = useComments(slug);
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname || !email || !content) {
      setMessage('请填写所有字段');
      return;
    }
    setSubmitting(true);
    try {
      await submitComment({ nickname, email, content });
      setNickname('');
      setEmail('');
      setContent('');
      setMessage('留言成功！');
    } catch (err: any) {
      setMessage(err.message || '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-12 border-t border-gray-200 pt-8">
      <h3 className="text-xl font-semibold mb-6">留言 ({comments.length})</h3>

      {/* 评论列表 */}
      {loading ? (
        <p className="text-gray-400">加载中...</p>
      ) : comments.length === 0 ? (
        <p className="text-gray-400 mb-6">暂无留言，来说两句吧。</p>
      ) : (
        <div className="space-y-4 mb-8">
          {comments.map((c) => (
            <div key={c.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-800">{c.nickname}</span>
                <time className="text-xs text-gray-400">
                  {new Date(c.created_at).toLocaleDateString('zh-CN')}
                </time>
              </div>
              <p className="text-gray-600 text-sm whitespace-pre-wrap">{c.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* 留言表单 */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">昵称 *</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="你的昵称"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">邮箱 *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">内容 *</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="想说点什么..."
          />
        </div>
        {message && (
          <p className={`text-sm ${message.includes('成功') ? 'text-green-600' : 'text-red-500'}`}>
            {message}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {submitting ? '提交中...' : '发布留言'}
        </button>
      </form>
    </section>
  );
}
