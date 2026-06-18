// 文章管理页面：列表、新建/编辑（Markdown 编辑器）、删除、分类标签管理
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { getArticles } from '@/lib/api';
import { createArticle, updateArticle, deleteArticle, getAdminTags } from '@/lib/adminApi';
import type { Article, ArticleDetail } from '@/lib/api';
import { GlassContainer } from '@/components/effects/GlassContainer';
import { GradientButton } from '@/components/ui/gradient-button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RichEditor } from '@/components/admin/RichEditor';

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
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">文章管理</h2>
        <GradientButton
          onClick={() => { setEditing(emptyForm); setEditSlug(null); setShowEditor(true); }}
          size="sm"
        >
          + 新建文章
        </GradientButton>
      </div>

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

      {/* 标签列表 */}
      {tags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">标签：</span>
          {tags.map((tag) => (
            <Badge key={tag} variant="glass">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Markdown 编辑器 */}
      {showEditor && (
        <GlassContainer variant="card" className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">{editSlug ? '编辑文章' : '新建文章'}</h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">标题 *</label>
                <Input
                  type="text"
                  variant="glass"
                  value={editing.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="文章标题"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">Slug *</label>
                <Input
                  type="text"
                  variant="glass"
                  value={editing.slug}
                  onChange={(e) => setEditing((p) => ({ ...p, slug: e.target.value }))}
                  placeholder="url-friendly-slug"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">摘要</label>
                <Input
                  type="text"
                  variant="glass"
                  value={editing.summary}
                  onChange={(e) => setEditing((p) => ({ ...p, summary: e.target.value }))}
                  placeholder="简短描述"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">标签（逗号分隔）</label>
                <Input
                  type="text"
                  variant="glass"
                  value={editing.tags}
                  onChange={(e) => setEditing((p) => ({ ...p, tags: e.target.value }))}
                  placeholder="技术, 生活, React"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-2">正文内容 *</label>
              <RichEditor
                value={editing.content}
                onChange={(md) => setEditing((p) => ({ ...p, content: md }))}
                placeholder="# 标题&#10;&#10;开始写作…"
              />
            </div>
            <div className="flex gap-3">
              <GradientButton
                type="submit"
                disabled={submitting}
              >
                {submitting ? '保存中...' : (editSlug ? '更新文章' : '发布文章')}
              </GradientButton>
              <GlassContainer
                variant="strong"
                className="cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform"
                as="div"
              >
                <button
                  type="button"
                  onClick={() => setShowEditor(false)}
                  className="h-10 px-4 text-sm font-semibold text-foreground"
                >
                  取消
                </button>
              </GlassContainer>
            </div>
          </form>
        </GlassContainer>
      )}

      {/* 文章列表 */}
      {loading ? (
        <p className="text-muted-foreground">加载中...</p>
      ) : articles.length === 0 ? (
        <GlassContainer variant="card" className="p-12 text-center">
          <p className="text-muted-foreground">还没有文章，点击上方按钮创建第一篇。</p>
        </GlassContainer>
      ) : (
        <GlassContainer variant="card" className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-left text-foreground/80">
              <tr>
                <th className="px-4 py-3 font-medium">标题</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">标签</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">日期</th>
                <th className="px-4 py-3 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {articles.map((a) => (
                <tr key={a.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-foreground font-medium">{a.title}</span>
                    <span className="text-muted-foreground text-xs ml-2">/{a.slug}</span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="flex gap-1 flex-wrap">
                      {a.tags && a.tags.split(',').map((t) => (
                        <Badge key={t} variant="glass">
                          {t.trim()}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {new Date(a.created_at).toLocaleDateString('zh-CN')}
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <button
                      onClick={() => handleEdit(a.slug)}
                      className="text-foreground/70 hover:text-primary text-sm transition-colors"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(a.slug)}
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
