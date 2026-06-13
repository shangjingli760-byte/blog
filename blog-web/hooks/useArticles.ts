// 文章使用自定义 Hook，封装文章列表数据获取逻辑
import { useState, useEffect } from 'react';
import type { Article } from '@/lib/api';
import { getArticles } from '@/lib/api';

export function useArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getArticles()
      .then(setArticles)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { articles, loading, error };
}
