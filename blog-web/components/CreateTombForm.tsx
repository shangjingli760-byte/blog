'use client';

import { useState } from 'react';
import { createTomb } from '@/lib/tombApi';

export default function CreateTombForm() {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [reason, setReason] = useState('');
  const [epitaph, setEpitaph] = useState('');
  const [builderName, setBuilderName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      await createTomb({ name, reason, epitaph, builder_name: builderName });
      setMessage('墓碑已立！刷新页面查看。');
      setName('');
      setReason('');
      setEpitaph('');
      setBuilderName('');
      setShowForm(false);
      // 刷新页面
      window.location.reload();
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mb-8">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-gray-800 text-white py-4 rounded-xl text-lg font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
        >
          🪦 为放鸽子的朋友立碑
        </button>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">🪦 建立赛博墓碑</h3>
          {message && (
            <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${message.includes('成功') || message.includes('已立') ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
              {message}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">被纪念者名字 *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder="放你鸽子的那位"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">你的名字 *</label>
                <input
                  type="text"
                  value={builderName}
                  onChange={(e) => setBuilderName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder="立碑人"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">放鸽子原因 *</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                placeholder="比如：说好一起吃饭结果人没了"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">墓志铭</label>
              <textarea
                value={epitaph}
                onChange={(e) => setEpitaph(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                placeholder="写点什么纪念一下..."
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="bg-gray-800 text-white px-6 py-2 rounded-lg text-sm hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? '立碑中...' : '🪦 立碑'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
