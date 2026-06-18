// 后端管理 API（需要 JWT Token）
import { API_BASE, apiFetch, authHeaders } from './apiClient';

// 登录
export async function adminLogin(username: string, password: string) {
  const data = await apiFetch<{ token: string }>(`${API_BASE}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return data.token;
}

// 创建文章（导入 Markdown）
export async function createArticle(data: {
  title: string; slug: string; content: string; summary: string; tags: string;
}) {
  return apiFetch(`${API_BASE}/api/admin/articles`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
}

// 更新文章
export async function updateArticle(slug: string, data: {
  title: string; slug: string; content: string; summary: string; tags: string;
}) {
  return apiFetch(`${API_BASE}/api/admin/articles/${slug}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
}

// 删除文章
export async function deleteArticle(slug: string) {
  return apiFetch(`${API_BASE}/api/admin/articles/${slug}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
}

interface AdminComment {
  id: number;
  article_id: number;
  nickname: string;
  email: string;
  content: string;
  created_at: string;
}

// 评论列表
export async function getAdminComments() {
  return apiFetch<AdminComment[]>(`${API_BASE}/api/admin/comments`, {
    headers: authHeaders(),
  });
}

// 删除评论
export async function deleteComment(id: number) {
  return apiFetch(`${API_BASE}/api/admin/comments/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
}

// 标签列表
export async function getAdminTags() {
  return apiFetch<string[]>(`${API_BASE}/api/admin/tags`, {
    headers: authHeaders(),
  });
}
