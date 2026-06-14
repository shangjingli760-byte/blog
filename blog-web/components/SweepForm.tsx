'use client';

import { useState } from 'react';
import { sweepTomb } from '@/lib/tombApi';

export default function SweepForm({ tombId }: { tombId: number }) {
  const [visitor, setVisitor] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setResult('');
    try {
      await sweepTomb(tombId, { visitor, message });
      setResult('扫墓成功！🕯️');
      setVisitor('');
      setMessage('');
      window.location.reload();
    } catch (err: any) {
      setResult(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <h3 className="text-lg font-semibold mb-4">🕯️ 扫墓</h3>
      {result && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${result.includes('成功') ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {result}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">你的名字 *</label>
          <input
            type="text"
            value={visitor}
            onChange={(e) => setVisitor(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
            placeholder="留下你的大名"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">扫墓留言</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
            placeholder="说点什么吧..."
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="bg-gray-800 text-white px-6 py-2 rounded-lg text-sm hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          {submitting ? '扫墓中...' : '🕯️ 扫墓'}
        </button>
      </form>
    </div>
  );
}
