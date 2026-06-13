// 评论数据获取与提交 Hook
import { useState, useEffect, useCallback } from 'react';
import type { Comment } from '@/lib/api';
import { getComments, postComment } from '@/lib/api';

export function useComments(slug: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(() => {
    setLoading(true);
    getComments(slug)
      .then(setComments)
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const submitComment = useCallback(
    async (data: { nickname: string; email: string; content: string }) => {
      const newComment = await postComment(slug, data);
      setComments((prev) => [newComment, ...prev]);
      return newComment;
    },
    [slug]
  );

  return { comments, loading, submitComment };
}
