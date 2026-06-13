// 评论管理页面：列表查看与删除
'use client';

import { useEffect, useState, useCallback } from 'react';
import { getAdminComments, deleteComment } from '@/lib/adminApi';

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
      loadComments();
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">评论管理</h2>

      {message && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${message.includes('成功') ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {message}
        </div>
      )}

      {loading ? (
        <p className="text-gray-400">加载中...</p>
      ) : comments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400">
          暂无评论
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">昵称</th>
                <th className="px-4 py-3 font-medium">邮箱</th>
                <th className="px-4 py-3 font-medium">内容</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">时间</th>
                <th className="px-4 py-3 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {comments.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{c.nickname}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{c.email}</td>
                  <td className="px-4 py-3">
                    <p className="text-gray-600 max-w-xs truncate">{c.content}</p>
                    <span className="text-xs text-gray-400">文章 #{c.article_id}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 hidden md:table-cell">
                    {new Date(c.created_at).toLocaleDateString('zh-CN')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
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
