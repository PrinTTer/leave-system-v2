// src/services/leaveVisibilityApi.ts

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export type LeaveVisibilityConfigDto = {
  viewers: number[];
  targets: number[];
};

// --- เพิ่ม type สำหรับ row จาก /leave-visibility/viewer/:id ---
export type LeaveVisibilityRow = {
  leave_visibility_id: number;
  viewer_user_id: number;
  target_user_id: number;
  created_by_user_id: number | null;
  created_at: string;
};

// ดึง config ปัจจุบัน
export async function getLeaveVisibilityConfig(): Promise<LeaveVisibilityConfigDto> {
  const res = await fetch(`${API_BASE_URL}/leave-visibility/config`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch leave visibility config');
  }

  return (await res.json()) as LeaveVisibilityConfigDto;
}

// เซฟ config ใหม่
export async function saveLeaveVisibilityConfig(
  payload: LeaveVisibilityConfigDto,
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/leave-visibility/config`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Failed to save leave visibility config');
  }
}

// ✅ ใหม่: ดึงว่า viewer คนนี้เห็น target ไหนบ้าง -> return เป็น array ของ target_user_id
export async function getTargetsForViewer(
  viewerUserId: number,
): Promise<number[]> {
  const res = await fetch(
    `${API_BASE_URL}/leave-visibility/viewer/${viewerUserId}`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    },
  );

  if (!res.ok) {
    throw new Error('Failed to fetch viewer targets');
  }

  const rows = (await res.json()) as LeaveVisibilityRow[];

  // คืนแค่ list ของ target_user_id
  return rows.map((row) => row.target_user_id);
}
