import type { LeaveTypeApiItem } from '@/types/leave';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchLeaveTypes(): Promise<LeaveTypeApiItem[]> {
  const res = await fetch(`${API_BASE}/leave-type`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`โหลดประเภทการลาไม่สำเร็จ: ${res.status}`);
  const json = (await res.json()) as LeaveTypeApiItem[];
  return json;
}

export async function createLeaveType(payload: Partial<LeaveTypeApiItem>): Promise<LeaveTypeApiItem> {
  const res = await fetch(`${API_BASE}/leave-type`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`สร้างประเภทการลาไม่สำเร็จ: ${res.status}`);
  return (await res.json()) as LeaveTypeApiItem;
}

export async function updateLeaveType(id: number | string, payload: Partial<LeaveTypeApiItem>): Promise<LeaveTypeApiItem> {
  const res = await fetch(`${API_BASE}/leave-type/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`อัปเดตประเภทการลาไม่สำเร็จ: ${res.status}`);
  return (await res.json()) as LeaveTypeApiItem;
}

export async function fetchLeaveTypeById(id: number | string): Promise<LeaveTypeApiItem> {
  const res = await fetch(`${API_BASE}/leave-type/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`โหลดประเภทการลาไม่สำเร็จ: ${res.status}`);
  return (await res.json()) as LeaveTypeApiItem;
}

export async function deleteLeaveType(id: number)  { 
  const res = await fetch(`${API_BASE}/leave-type/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`อัปเดตประเภทการลาไม่สำเร็จ: ${res.status}`);
  return (await res.json()) as LeaveTypeApiItem;
}