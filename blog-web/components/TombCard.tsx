// 墓碑卡片组件
import Link from 'next/link';
import type { Tomb } from '@/lib/tombApi';

export default function TombCard({ tomb }: { tomb: Tomb }) {
  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <Link href={`/tombs/${tomb.id}`}>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">🪦</span>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 hover:text-gray-600 transition-colors">
              {tomb.name} 之墓
            </h2>
            <p className="text-sm text-gray-400">立碑人：{tomb.builder_name}</p>
          </div>
        </div>
      </Link>
      <div className="bg-gray-50 rounded-lg p-3 mb-3">
        <p className="text-sm text-gray-500">
          <span className="font-medium text-gray-700">放鸽子原因：</span>
          {tomb.reason}
        </p>
      </div>
      {tomb.epitaph && (
        <p className="text-gray-500 text-sm italic border-l-2 border-gray-300 pl-3 mb-3">
          "{tomb.epitaph}"
        </p>
      )}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>🕊️ {new Date(tomb.created_at).toLocaleDateString('zh-CN')} 立碑</span>
        <Link href={`/tombs/${tomb.id}`} className="text-blue-500 hover:text-blue-700">
          前去扫墓 →
        </Link>
      </div>
    </article>
  );
}
