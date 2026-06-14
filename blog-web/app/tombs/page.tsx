// 墓碑列表页（SSG）
import { getTombs } from '@/lib/tombApi';
import type { Tomb } from '@/lib/tombApi';
import TombCard from '@/components/TombCard';
import CreateTombForm from '@/components/CreateTombForm';

export default async function TombsPage() {
  let tombs: Tomb[] = [];
  let error: string | null = null;

  try {
    tombs = await getTombs();
  } catch (err: any) {
    error = err.message;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🪦 赛博坟墓</h1>
        <p className="text-gray-500">
          朋友放鸽子了？在这里为TA立一座赛博墓碑，让大家来扫墓。
        </p>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700 mb-4">
          无法加载墓碑：{error}
        </div>
      )}

      <CreateTombForm />

      {tombs.length === 0 && !error ? (
        <div className="text-center py-16">
          <p className="text-6xl mb-4">🕊️</p>
          <p className="text-gray-400 text-lg">还没有墓碑，成为第一个立碑人吧。</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {tombs.map((tomb) => (
            <TombCard key={tomb.id} tomb={tomb} />
          ))}
        </div>
      )}
    </div>
  );
}
