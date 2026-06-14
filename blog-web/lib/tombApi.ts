// 赛博墓碑 API 封装
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface Tomb {
  id: number;
  name: string;
  reason: string;
  epitaph: string;
  builder_name: string;
  created_at: string;
}

export interface TombVisit {
  id: number;
  tomb_id: number;
  visitor: string;
  message: string;
  created_at: string;
}

export interface TombVisitor {
  id: number;
  tomb_id: number;
  visitor: string;
  created_at: string;
}

export interface TombStats {
  visitor_count: number;
  sweep_count: number;
  not_sweep_count: number;
}

// 获取墓碑列表
export async function getTombs(): Promise<Tomb[]> {
  const res = await fetch(`${API_BASE}/api/tombs`);
  const body = await res.json();
  if (body.code !== 0) throw new Error(body.msg);
  return body.data;
}

// 获取墓碑详情（含统计）
export async function getTombDetail(id: number): Promise<{ tomb: Tomb; stats: TombStats }> {
  const res = await fetch(`${API_BASE}/api/tombs/${id}`);
  const body = await res.json();
  if (body.code !== 0) throw new Error(body.msg);
  return body.data;
}

// 创建墓碑
export async function createTomb(data: { name: string; reason: string; epitaph: string; builder_name: string }): Promise<Tomb> {
  const res = await fetch(`${API_BASE}/api/tombs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (body.code !== 0) throw new Error(body.msg);
  return body.data;
}

// 删除墓碑
export async function deleteTomb(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/tombs/${id}`, { method: 'DELETE' });
  const body = await res.json();
  if (body.code !== 0) throw new Error(body.msg);
}

// 获取扫墓记录
export async function getTombVisits(id: number): Promise<TombVisit[]> {
  const res = await fetch(`${API_BASE}/api/tombs/${id}/visits`);
  const body = await res.json();
  if (body.code !== 0) throw new Error(body.msg);
  return body.data;
}

// 扫墓
export async function sweepTomb(id: number, data: { visitor: string; message: string }): Promise<TombVisit> {
  const res = await fetch(`${API_BASE}/api/tombs/${id}/visits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (body.code !== 0) throw new Error(body.msg);
  return body.data;
}

// 记录来访者
export async function recordVisitor(id: number, visitor: string): Promise<TombVisitor> {
  const res = await fetch(`${API_BASE}/api/tombs/${id}/visitors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ visitor }),
  });
  const body = await res.json();
  if (body.code !== 0) throw new Error(body.msg);
  return body.data;
}

// 获取来访者列表
export async function getTombVisitors(id: number): Promise<TombVisitor[]> {
  const res = await fetch(`${API_BASE}/api/tombs/${id}/visitors`);
  const body = await res.json();
  if (body.code !== 0) throw new Error(body.msg);
  return body.data;
}

// 获取墓碑统计
export async function getTombStats(id: number): Promise<TombStats> {
  const res = await fetch(`${API_BASE}/api/tombs/${id}/stats`);
  const body = await res.json();
  if (body.code !== 0) throw new Error(body.msg);
  return body.data;
}
