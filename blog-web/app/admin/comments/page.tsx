// 评论管理页面：列表查看与删除
'use client';

import { useEffect, useState, useCallback } from 'react';
import { getAdminComments, deleteComment } from '@/lib/adminApi';
import { GlassContainer } from '@/components/effects/GlassContainer';

interface AdminComment {
  id: number;
  article_id: number;
  nickname: string;
  email: string;
  content: string;
  created_at: string;
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadComments = useCallback(() => {
    setLoading(true);
    getAdminComments()
      .then(setComments)
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
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">评论管理</h2>

      {message && (
        <GlassContainer
          variant="strong"
          className={`mb-6 px-4 py-3 ${message.includes('成功') ? 'bg-green-500/10 border-green-500/20' : 'bg-destructive/10 border-destructive/20'}`}
        >
          <p className={`text-sm ${message.includes('成功') ? 'text-green-400' : 'text-destructive'}`}>
            {message}
          </p>
        </GlassContainer>
      )}

      {loading ? (
        <p className="text-muted-foreground">加载中...</p>
      ) : comments.length === 0 ? (
        <GlassContainer variant="card" className="p-12 text-center">
          <p className="text-muted-foreground">暂无评论</p>
        </GlassContainer>
      ) : (
        <GlassContainer variant="card" className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-left text-foreground/80">
              <tr>
                <th className="px-4 py-3 font-medium">昵称</th>
                <th className="px-4 py-3 font-medium">邮箱</th>
                <th className="px-4 py-3 font-medium">内容</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">时间</th>
                <th className="px-4 py-3 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {comments.map((c) => (
                <tr key={c.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{c.nickname}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{c.email}</td>
                  <td className="px-4 py-3">
                    <p className="text-foreground/90 max-w-xs truncate">{c.content}</p>
                    <span className="text-xs text-muted-foreground">文章 #{c.article_id}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {new Date(c.created_at).toLocaleDateString('zh-CN')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-destructive/70 hover:text-destructive text-sm transition-colors"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassContainer>
      )}
    </div>
  );
}
