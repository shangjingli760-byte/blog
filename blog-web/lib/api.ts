// 后端 API 地址，通过环境变量注入
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

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
  const res = await fetch(`${API_BASE}/api/articles`, { next: { revalidate: 3600 } });
  const body = await res.json();
  if (body.code !== 0) throw new Error(body.msg);
  return body.data;
}

// 获取文章详情
export async function getArticleBySlug(slug: string): Promise<ArticleDetail> {
  const res = await fetch(`${API_BASE}/api/articles/${slug}`, { next: { revalidate: 3600 } });
  const body = await res.json();
  if (body.code !== 0) throw new Error(body.msg);
  return body.data;
}

// 获取评论列表（通过 slug）
export async function getComments(slug: string): Promise<Comment[]> {
  const res = await fetch(`${API_BASE}/api/articles/${slug}/comments`);
  const body = await res.json();
  if (body.code !== 0) throw new Error(body.msg);
  return body.data;
}

// 提交评论（通过 slug）
export async function postComment(slug: string, data: { nickname: string; email: string; content: string }): Promise<Comment> {
  const res = await fetch(`${API_BASE}/api/articles/${slug}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (body.code !== 0) throw new Error(body.msg);
  return body.data;
}
