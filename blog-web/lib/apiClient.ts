// API 客户端公共逻辑封装
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

/**
 * 通用 fetch 封装，处理统一的错误格式
 */
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const body: ApiResponse<T> = await res.json();
  if (body.code !== 0) {
    throw new Error(body.msg);
  }
  return body.data;
}

/**
 * 获取认证请求头（从 localStorage 读取 token）
 */
function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };
}

export { API_BASE, apiFetch, authHeaders };
