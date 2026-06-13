// 后端管理 API（需要 JWT Token）
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };
}

// 登录
export async function adminLogin(username: string, password: string) {
  const res = await fetch(`${API_BASE}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const body = await res.json();
  if (body.code !== 0) throw new Error(body.msg);
  return body.data.token as string;
}

// 创建文章（导入 Markdown）
export async function createArticle(data: {
  title: string; slug: string; content: string; summary: string; tags: string;
}) {
  const res = await fetch(`${API_BASE}/api/admin/articles`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (body.code !== 0) throw new Error(body.msg);
  return body.data;
}

// 更新文章
export async function updateArticle(slug: string, data: {
  title: string; slug: string; content: string; summary: string; tags: string;
}) {
  const res = await fetch(`${API_BASE}/api/admin/articles/${slug}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (body.code !== 0) throw new Error(body.msg);
  return body.data;
}

// 删除文章
export async function deleteArticle(slug: string) {
  const res = await fetch(`${API_BASE}/api/admin/articles/${slug}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const body = await res.json();
  if (body.code !== 0) throw new Error(body.msg);
}

// 评论列表
export async function getAdminComments() {
  const res = await fetch(`${API_BASE}/api/admin/comments`, {
    headers: authHeaders(),
  });
  const body = await res.json();
  if (body.code !== 0) throw new Error(body.msg);
  return body.data;
}

// 删除评论
export async function deleteComment(id: number) {
  const res = await fetch(`${API_BASE}/api/admin/comments/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const body = await res.json();
  if (body.code !== 0) throw new Error(body.msg);
}

// 标签列表
export async function getAdminTags() {
  const res = await fetch(`${API_BASE}/api/admin/tags`, {
    headers: authHeaders(),
  });
  const body = await res.json();
  if (body.code !== 0) throw new Error(body.msg);
  return body.data as string[];
}
