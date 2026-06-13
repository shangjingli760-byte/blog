// 顶部导航栏组件
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
          My Blog
        </Link>
        <nav className="flex gap-6">
          <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors">
            文章
          </Link>
          <a href="/rss.xml" className="text-gray-600 hover:text-blue-600 transition-colors">
            RSS
          </a>
        </nav>
      </div>
    </header>
  );
}
