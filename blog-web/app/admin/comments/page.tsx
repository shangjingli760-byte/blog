// 评论管理页面：列表查看与删除
'use client';

import { useEffect, useState, useCallback } from 'react';
import { getAdminComments, deleteComment, type AdminComment } from '@/lib/adminApi';

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadComments = useCallback(() => {
    setLoading(true);
    getAdminComments()
      .then((res) => setComments(res.list))
      .catch((err) => setMessage(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadComments(); }, [loadComments]);

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除这条评论？')) return;
    try {
      await deleteComment(id);
      setMessage('删除成功');
      setTimeout(() => setMessage(''), 3000);
      loadComments();
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">评论管理</h2>

      {message && (
        <div className={`mb-6 px-4 py-3 rounded-xl text-sm border ${message.includes('成功') ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
          {message}
        </div>
      )}

      {loading ? (
        <p className="text-white/40">加载中...</p>
      ) : comments.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
          <p className="text-white/30">暂无评论</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.04] text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-white/60">昵称</th>
                <th className="px-4 py-3 font-medium text-white/60">邮箱</th>
                <th className="px-4 py-3 font-medium text-white/60">内容</th>
                <th className="px-4 py-3 font-medium text-white/60 hidden md:table-cell">时间</th>
                <th className="px-4 py-3 font-medium text-white/60 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {comments.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="px-4 py-3 font-medium text-white/80">{c.nickname}</td>
                  <td className="px-4 py-3 text-white/40 text-xs">{c.email}</td>
                  <td className="px-4 py-3">
                    <p className="text-white/70 max-w-xs truncate">{c.content}</p>
                    <span className="text-xs text-white/25">文章 #{c.article_id}</span>
                  </td>
                  <td className="px-4 py-3 text-white/35 hidden md:table-cell">
                    {new Date(c.created_at).toLocaleDateString('zh-CN')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-red-400/70 hover:text-red-400 text-sm transition-colors"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
