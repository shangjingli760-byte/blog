// 管理端首页：概览面板，显示文章数、评论数
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getArticles } from '@/lib/api';
import { getAdminComments } from '@/lib/adminApi';

export default function AdminDashboard() {
  const router = useRouter();
  const [articleCount, setArticleCount] = useState<number | null>(null);
  const [commentCount, setCommentCount] = useState<number | null>(null);

  useEffect(() => {
    getArticles()
      .then((a) => setArticleCount(a.length))
      .catch(() => setArticleCount(0));
    getAdminComments()
      .then((c) => setCommentCount(c.length))
      .catch(() => setCommentCount(0));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">概览</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => router.push('/admin/articles')}
        >
          <div className="text-3xl mb-2">📝</div>
          <div className="text-3xl font-bold text-blue-600">{articleCount ?? '-'}</div>
          <div className="text-gray-500 text-sm mt-1">文章总数</div>
        </div>
        <div
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => router.push('/admin/comments')}
        >
          <div className="text-3xl mb-2">💬</div>
          <div className="text-3xl font-bold text-green-600">{commentCount ?? '-'}</div>
          <div className="text-gray-500 text-sm mt-1">评论总数</div>
        </div>
        <div
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => router.push('/admin/articles?action=new')}
        >
          <div className="text-3xl mb-2">➕</div>
          <div className="text-lg font-bold text-gray-700">新建文章</div>
          <div className="text-gray-500 text-sm mt-1">导入 Markdown 文档</div>
        </div>
      </div>
    </div>
  );
}
