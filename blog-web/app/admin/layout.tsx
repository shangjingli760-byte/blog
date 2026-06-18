// 管理端共享布局：验证登录态 + 顶部导航
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { PixelCanvas } from '@/components/effects/PixelCanvas';
import { GlassContainer } from '@/components/effects/GlassContainer';
import { ShimmerText } from '@/components/effects/ShimmerText';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    // 登录页不需要检查
    if (pathname === '/admin/login') {
      setAuthed(true);
      return;
    }
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
    } else {
      setAuthed(true);
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  };

  // Subtle pixel colors for admin
  const pixelColors = [
    'rgba(162, 89, 255, 0.2)',
    'rgba(94, 129, 244, 0.2)',
  ];

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PixelCanvas colors={pixelColors} gap={8} speed={15} opacity={0.1} />
        <div className="relative z-10 text-muted-foreground">验证中...</div>
      </div>
    );
  }

  // 登录页不需要导航栏
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const navItems = [
    { href: '/admin', label: '概览' },
    { href: '/admin/articles', label: '文章管理' },
    { href: '/admin/comments', label: '评论管理' },
  ];

  return (
    <div className="min-h-screen relative">
      {/* Subtle Pixel Background */}
      <PixelCanvas colors={pixelColors} gap={8} speed={15} opacity={0.1} />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--background)_100%)] pointer-events-none opacity-90" />

      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 glass-navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo 和主导航 */}
            <div className="flex items-center gap-8">
              <Link
                href="/admin"
                className="text-xl font-bold transition-transform hover:scale-105 duration-200"
              >
                <ShimmerText>Blog 管理</ShimmerText>
              </Link>
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      pathname === item.href
                        ? 'bg-primary/20 text-primary shadow-[0_0_15px_rgba(162,89,255,0.3)]'
                        : 'text-foreground/70 hover:text-foreground hover:bg-white/5'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* 右侧操作 */}
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-sm text-foreground/70 hover:text-foreground transition-colors"
              >
                ← 返回博客
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-foreground/70 hover:text-destructive transition-colors"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* 页脚 */}
      <footer className="relative z-10 text-center py-8 text-sm text-muted-foreground border-t border-border/50 mt-12">
        Blog 管理系统 · Powered by Next.js + Go
      </footer>
    </div>
  );
}
