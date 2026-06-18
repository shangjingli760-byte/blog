// 管理端首页：概览面板，显示文章数、评论数
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getArticles } from '@/lib/api';
import { getAdminComments } from '@/lib/adminApi';
import { Gallery4 } from '@/components/ui/gallery4';
import type { Gallery4Item } from '@/components/ui/gallery4';
import { Card } from '@/components/ui/card';
import { GlassContainer } from '@/components/effects/GlassContainer';

export default function AdminDashboard() {
  const router = useRouter();
  const [articleCount, setArticleCount] = useState<number | null>(null);
  const [commentCount, setCommentCount] = useState<number | null>(null);
  const [featuredArticles, setFeaturedArticles] = useState<Gallery4Item[]>([]);

  useEffect(() => {
    getArticles()
      .then((articles) => {
        setArticleCount(articles.length);
        // 转换文章数据为 Gallery4Item 格式
        const unsplashImages = [
          'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&h=600&fit=crop',
        ];
        const featured = articles.slice(0, 6).map((article: any, index: number) => ({
          id: article.slug,
          title: article.title,
          description: article.summary || '暂无摘要',
          href: `/admin/articles`,
          image: unsplashImages[index] || unsplashImages[0],
        }));
        setFeaturedArticles(featured);
      })
      .catch(() => setArticleCount(0));

    getAdminComments()
      .then((c) => setCommentCount(c.length))
      .catch(() => setCommentCount(0));
  }, []);

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">概览</h2>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Card
          variant="glass"
          glow="subtle"
          className="p-6 cursor-pointer transition-all hover:scale-[1.02]"
          onClick={() => router.push('/admin/articles')}
        >
          <div className="text-sm font-medium text-muted-foreground mb-2">文章总数</div>
          <div className="text-3xl md:text-4xl font-bold text-foreground">
            {articleCount ?? '-'}
          </div>
        </Card>

        <Card
          variant="glass"
          glow="subtle"
          className="p-6 cursor-pointer transition-all hover:scale-[1.02]"
          onClick={() => router.push('/admin/comments')}
        >
          <div className="text-sm font-medium text-muted-foreground mb-2">评论总数</div>
          <div className="text-3xl md:text-4xl font-bold text-foreground">
            {commentCount ?? '-'}
          </div>
        </Card>

        <Card
          variant="glass"
          glow="subtle"
          className="p-6 cursor-pointer transition-all hover:scale-[1.02]"
          onClick={() => router.push('/admin/articles?action=new')}
        >
          <div className="text-sm font-medium text-muted-foreground mb-2">快速操作</div>
          <div className="text-lg md:text-xl font-medium text-primary">+ 新建文章</div>
        </Card>
      </div>

      {/* 精选文章轮播 */}
      {featuredArticles.length > 0 && (
        <div className="mt-8">
          <Gallery4
            title="最新文章"
            description="快速浏览和管理最近发布的文章"
            items={featuredArticles}
          />
        </div>
      )}
    </div>
  );
}
