const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function getRequester() {
    const res = await fetch(`${API_BASE}/requester`, { cache: 'no-store' })
    if (!res.ok) throw new Error(`โหลดผู้ขออนุมัติไม่สำเร็จ: ${res.status}`)
    const json = (await res.json());
  return json;
}
