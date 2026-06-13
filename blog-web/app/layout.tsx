import type { Metadata } from 'next';
import '@/app/globals.css';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'My Blog',
  description: '个人博客 - 记录技术与思考',
};

// 根布局组件
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="text-center py-8 text-sm text-gray-400 border-t border-gray-200">
          Powered by Next.js + Go + SQLite
        </footer>
      </body>
    </html>
  );
}
