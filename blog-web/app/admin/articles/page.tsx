// 文章管理页面：列表、新建/编辑（Markdown 编辑器）、删除、分类标签管理
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { getArticles } from '@/lib/api';
import { createArticle, updateArticle, deleteArticle, getAdminTags } from '@/lib/adminApi';
import type { Article, ArticleDetail } from '@/lib/api';

type ArticleForm = { title: string; slug: string; content: string; summary: string; tags: string };

const emptyForm: ArticleForm = { title: '', slug: '', content: '', summary: '', tags: '' };

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ArticleForm>(emptyForm);
  const [editSlug, setEditSlug] = useState<string | null>(null); // null=新建
  const [showEditor, setShowEditor] = useState(false);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const searchParams = useSearchParams();

  const loadData = useCallback(() => {
    setLoading(true);
    Promise.all([getArticles(), getAdminTags()])
      .then(([a, t]) => { setArticles(a); setTags(t); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadData();
    // URL 参数 ?action=new 触发新建
    if (searchParams.get('action') === 'new') {
      setEditing(emptyForm);
      setEditSlug(null);
      setShowEditor(true);
    }
  }, [loadData, searchParams]);

  // 标题自动生成 slug
  const handleTitleChange = (title: string) => {
    const slug = title
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fff]+/g, '-')
      .replace(/^-|-$/g, '');
    setEditing((prev) => ({ ...prev, title, slug }));
  };

  const handleEdit = async (slug: string) => {
    try {
      const { getArticleBySlug } = await import('@/lib/api');
      const article = await getArticleBySlug(slug);
      setEditing({ title: article.title, slug: article.slug, content: article.content, summary: article.summary || '', tags: article.tags || '' });
      setEditSlug(slug);
      setShowEditor(true);
    } catch {
      setMessage('加载文章失败');
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('确定删除这篇文章？相关评论也会被删除。')) return;
    try {
      await deleteArticle(slug);
      setMessage('删除成功');
      loadData();
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      if (editSlug) {
        await updateArticle(editSlug, editing);
        setMessage('更新成功');
      } else {
        await createArticle(editing);
        setMessage('创建成功');
      }
      setShowEditor(false);
      loadData();
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">文章管理</h2>
        <button
          onClick={() => { setEditing(emptyForm); setEditSlug(null); setShowEditor(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
        >
          + 新建文章
        </button>
      </div>

      {message && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${message.includes('成功') ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {message}
        </div>
      )}

      {/* 标签列表 */}
      {tags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-500">标签：</span>
          {tags.map((tag) => (
            <span key={tag} className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Markdown 编辑器 */}
      {showEditor && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">{editSlug ? '编辑文章' : '新建文章'}（Markdown）</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">标题 *</label>
                <input
                  type="text"
                  value={editing.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="文章标题"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                <input
                  type="text"
                  value={editing.slug}
                  onChange={(e) => setEditing((p) => ({ ...p, slug: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="url-friendly-slug"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">摘要</label>
                <input
                  type="text"
                  value={editing.summary}
                  onChange={(e) => setEditing((p) => ({ ...p, summary: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="简短描述"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">标签（逗号分隔）</label>
                <input
                  type="text"
                  value={editing.tags}
                  onChange={(e) => setEditing((p) => ({ ...p, tags: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="技术, 生活, React"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Markdown 内容 *</label>
              <textarea
                value={editing.content}
                onChange={(e) => setEditing((p) => ({ ...p, content: e.target.value }))}
                rows={18}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="# 标题&#10;&#10;正文内容..."
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? '保存中...' : (editSlug ? '更新文章' : '发布文章')}
              </button>
              <button
                type="button"
                onClick={() => setShowEditor(false)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 文章列表 */}
      {loading ? (
        <p className="text-gray-400">加载中...</p>
      ) : articles.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400">
          还没有文章，点击上方按钮创建第一篇。
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">标题</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">标签</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">日期</th>
                <th className="px-4 py-3 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {articles.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="text-gray-800 font-medium">{a.title}</span>
                    <span className="text-gray-400 text-xs ml-2">/{a.slug}</span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="flex gap-1 flex-wrap">
                      {a.tags && a.tags.split(',').map((t) => (
                        <span key={t} className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs">
                          {t.trim()}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 hidden md:table-cell">
                    {new Date(a.created_at).toLocaleDateString('zh-CN')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleEdit(a.slug)}
                      className="text-blue-600 hover:text-blue-800 mr-3 text-sm"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(a.slug)}
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
