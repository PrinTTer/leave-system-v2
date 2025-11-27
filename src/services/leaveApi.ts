// src/services/leaveApi.ts
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

import type { LeaveItem } from '@/types/calendar'; // หรือ '@/types/leave' ถ้าคุณแยกไฟล์

// รูปแบบที่ backend /fact-form/calendar ส่งกลับมา (ตามที่เรา map ใน service)
type LeaveCalendarApiItem = {
  id: number;
  user_id: number;
  title: string;
  start: string; // ISO string
  end: string;   // ISO string
  status: 'draft' | 'pending' | 'approve' | 'reject' | 'cancel';
  leave_type_id: number;
  total_day: number;
};

function mapLeaveCalendarItem(raw: LeaveCalendarApiItem): LeaveItem {
  return {
    id: String(raw.id),
    userId: String(raw.user_id),
    type: raw.title, // ชื่อประเภทการลา
    status:
      raw.status === 'approve'
        ? 'approved'
        : raw.status === 'reject'
        ? 'rejected'
        : 'pending', // ที่เหลือถือเป็น pending
    startDate: raw.start.slice(0, 10), // keep แค่ YYYY-MM-DD
    endDate: raw.end.slice(0, 10),
  };
}

/**
 * ดึงใบลาสำหรับแสดงบน leave calendar
 * ใช้ viewerUserId + ช่วงวันที่ (YYYY-MM-DD)
 */
export async function getLeavesForCalendar(
  viewerUserId: number,
  start: string,
  end: string,
): Promise<LeaveItem[]> {
  const url = new URL(`${API_BASE_URL}/fact-form/calendar`);
  url.searchParams.set('viewerUserId', String(viewerUserId));
  url.searchParams.set('start', start);
  url.searchParams.set('end', end);

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch leaves for calendar');
  }

  const json = (await res.json()) as unknown;

  if (!Array.isArray(json)) {
    return [];
  }

  return json.map((item) => mapLeaveCalendarItem(item as LeaveCalendarApiItem));
}
