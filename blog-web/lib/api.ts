// 公开 API（无需认证）
import { API_BASE, apiFetch } from './apiClient';

export interface Article {
  id: number;
  title: string;
  slug: string;
  summary: string;
  tags: string;
  created_at: string;
}

export interface ArticleDetail extends Article {
  content: string;
  html: string;
}

export interface Comment {
  id: number;
  article_id: number;
  nickname: string;
  content: string;
  created_at: string;
}

// 获取文章列表
export async function getArticles(): Promise<Article[]> {
  return apiFetch(`${API_BASE}/api/articles`, { next: { revalidate: 3600 } });
}

// 获取文章详情
export async function getArticleBySlug(slug: string): Promise<ArticleDetail> {
  return apiFetch(`${API_BASE}/api/articles/${slug}`, { next: { revalidate: 3600 } });
}

// 获取评论列表（通过 slug）
export async function getComments(slug: string): Promise<Comment[]> {
  return apiFetch(`${API_BASE}/api/articles/${slug}/comments`);
}

// 提交评论（通过 slug）
export async function postComment(slug: string, data: { nickname: string; email: string; content: string }): Promise<Comment> {
  return apiFetch(`${API_BASE}/api/articles/${slug}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}
