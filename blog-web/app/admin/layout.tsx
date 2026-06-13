// 管理端共享布局：验证登录态 + 侧边栏导航
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

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

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        验证中...
      </div>
    );
  }

  // 登录页不需要侧边栏
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const navItems = [
    { href: '/admin', label: '概览', icon: '📊' },
    { href: '/admin/articles', label: '文章管理', icon: '📝' },
    { href: '/admin/comments', label: '评论管理', icon: '💬' },
  ];

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* 侧边栏 */}
      <aside className="w-56 bg-gray-900 text-white flex flex-col">
        <div className="px-5 py-6 border-b border-gray-700">
          <h1 className="text-lg font-bold">Blog 管理</h1>
          <p className="text-xs text-gray-400 mt-1">内容管理系统</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                pathname === item.href
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-gray-700">
          <Link href="/" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white px-3 py-2">
            ← 返回前台
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left text-sm text-gray-400 hover:text-red-400 px-3 py-2 mt-1 transition-colors"
          >
            退出登录
          </button>
        </div>
      </aside>

      {/* 主内容 */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
