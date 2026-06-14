'use client';

import { useState, useEffect } from 'react';
import { recordVisitor, getTombVisitors } from '@/lib/tombApi';
import type { TombVisitor } from '@/lib/tombApi';

export default function VisitorTracker({ tombId, initialVisitors }: { tombId: number; initialVisitors: TombVisitor[] }) {
  const [visitorName, setVisitorName] = useState('');
  const [visitors, setVisitors] = useState<TombVisitor[]>(initialVisitors);
  const [recorded, setRecorded] = useState(false);

  // 页面加载时自动记录来访（如果 localStorage 中没记录过）
  useEffect(() => {
    const key = `visited_tomb_${tombId}`;
    if (!localStorage.getItem(key)) {
      const name = prompt('你路过了这座墓碑，留下你的名字吧：');
      if (name && name.trim()) {
        recordVisitor(tombId, name.trim())
          .then(() => {
            localStorage.setItem(key, '1');
            setRecorded(true);
            // 刷新来访者列表
            getTombVisitors(tombId).then(setVisitors);
          })
          .catch(() => {});
      }
    }
  }, [tombId]);

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        👣 来访者记录 ({visitors.length})
      </h3>
      {visitors.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center text-gray-400">
          还没有来访记录。
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {visitors.slice(0, 20).map((v) => (
              <div key={v.id} className="px-4 py-3 flex items-center justify-between">
                <span className="text-gray-700 text-sm">{v.visitor}</span>
                <span className="text-xs text-gray-400">
                  {new Date(v.created_at).toLocaleDateString('zh-CN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
