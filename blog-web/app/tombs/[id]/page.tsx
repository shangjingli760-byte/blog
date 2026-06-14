// 墓碑详情页（SSG）
import { getTombDetail, getTombVisits, getTombVisitors, getTombStats, getTombs } from '@/lib/tombApi';
import type { Tomb, TombVisit, TombVisitor, TombStats } from '@/lib/tombApi';
import SweepForm from '@/components/SweepForm';
import VisitorTracker from '@/components/VisitorTracker';

export async function generateStaticParams() {
  try {
    const tombs = await getTombs();
    return tombs.map((tomb) => ({ id: String(tomb.id) }));
  } catch {
    return [];
  }
}

export default async function TombDetailPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  let tomb: Tomb | null = null;
  let visits: TombVisit[] = [];
  let visitors: TombVisitor[] = [];
  let stats: TombStats | null = null;
  let error: string | null = null;

  try {
    const detail = await getTombDetail(id);
    tomb = detail.tomb;
    stats = detail.stats;
    visits = await getTombVisits(id);
    visitors = await getTombVisitors(id);
  } catch (err: any) {
    error = err.message;
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-6xl mb-4">💀</p>
        <p className="text-gray-400 text-lg">墓碑不存在或已被移除。</p>
        <p className="text-gray-500 text-sm mt-2">{error}</p>
      </div>
    );
  }

  if (!tomb || !stats) return null;

  return (
    <div>
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl shadow-lg p-8 mb-8 text-center text-white">
        <p className="text-5xl mb-4">🪦</p>
        <h1 className="text-3xl font-bold mb-2">R.I.P</h1>
        <h2 className="text-2xl font-semibold mb-4">{tomb.name}</h2>
        <div className="bg-white/10 rounded-lg p-4 mb-4 max-w-md mx-auto">
          <p className="text-gray-300 text-sm mb-2">
            <span className="text-gray-400">放鸽子原因：</span>{tomb.reason}
          </p>
          {tomb.epitaph && (
            <p className="text-gray-400 text-sm italic">"{tomb.epitaph}"</p>
          )}
        </div>
        <div className="text-gray-400 text-xs space-y-1">
          <p>立碑人：{tomb.builder_name}</p>
          <p>立碑时间：{new Date(tomb.created_at).toLocaleDateString('zh-CN')}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.visitor_count}</p>
          <p className="text-xs text-gray-500 mt-1">👀 来访人数</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.sweep_count}</p>
          <p className="text-xs text-gray-500 mt-1">🕯️ 扫墓人数</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-red-500">{stats.not_sweep_count}</p>
          <p className="text-xs text-gray-500 mt-1">😒 只看不扫</p>
        </div>
      </div>
      <SweepForm tombId={id} />
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          🕯️ 扫墓记录 ({visits.length})
        </h3>
        {visits.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center text-gray-400">
            还没有人来扫墓，成为第一个扫墓者吧。
          </div>
        ) : (
          <div className="space-y-3">
            {visits.map((v) => (
              <div key={v.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-800">{v.visitor}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(v.created_at).toLocaleDateString('zh-CN')}
                  </span>
                </div>
                {v.message && (
                  <p className="text-gray-600 text-sm">"{v.message}"</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <VisitorTracker tombId={id} initialVisitors={visitors} />
    </div>
  );
}