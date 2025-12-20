const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function getRequester() {
    // เพิ่ม cache: 'no-store' เพื่อให้ได้ข้อมูลล่าสุดจาก DB เสมอ (เหมาะกับระบบอนุมัติ)
    const res = await fetch(`${API_BASE}/requester`, { 
        method: 'GET',
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    if (!res.ok) {
        throw new Error(`โหลดผู้ขออนุมัติไม่สำเร็จ: ${res.status}`);
    }

    const json = await res.json();
    return json; // ข้อมูลที่ return จะเป็น Array ตามโครงสร้าง JSON ที่คุณให้มาตอนต้น
}
