// src/utils/scheduleStorage.ts
import dayjs from 'dayjs';
import type { CalendarSchedule } from '@/types/calendar';

type DiffStore = {
  items: CalendarSchedule[]; // สิ่งที่ผู้ใช้ "เพิ่มใหม่" หรือ "แก้ไข" (override ตาม id)
  hiddenIds: string[];       // สิ่งที่ผู้ใช้ "ซ่อน/ลบ" จาก baseline mock
};

const STORAGE_KEY = 'calendarSchedulesDiff';

const toMap = (arr: CalendarSchedule[]) => {
  const m = new Map<string, CalendarSchedule>();
  arr.forEach(i => m.set(i.id, i));
  return m;
};

export const loadDiff = (): DiffStore => {
  if (typeof window === 'undefined') return { items: [], hiddenIds: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: [], hiddenIds: [] };
    const parsed = JSON.parse(raw);
    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      hiddenIds: Array.isArray(parsed.hiddenIds) ? parsed.hiddenIds : [],
    };
  } catch {
    return { items: [], hiddenIds: [] };
  }
};

export const saveDiff = (diff: DiffStore) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(diff));
};

/** รวม mock + diff (items/hidden) -> ชุดที่แสดงผลจริง */
export const mergeMockWithDiff = (
  mockList: CalendarSchedule[],
  diff: DiffStore
): CalendarSchedule[] => {
  const mockMap = toMap(mockList);
  const hidden = new Set(diff.hiddenIds || []);
  const resultMap = new Map<string, CalendarSchedule>();

  // 1) ใส่ mock ก่อน (ถ้าไม่ถูกซ่อน)
  mockList.forEach(i => {
    if (!hidden.has(i.id)) resultMap.set(i.id, i);
  });

  // 2) ทับด้วยของผู้ใช้ที่เพิ่ม/แก้ (ถ้าไม่ถูกซ่อน)
  (diff.items || []).forEach(i => {
    if (!hidden.has(i.id)) resultMap.set(i.id, i);
  });

  // 3) เรียงตามวันที่ (ล่าสุดอยู่บน หรือแล้วแต่ชอบ)
  return Array.from(resultMap.values()).sort(
    (a, b) => dayjs(b.startDate).valueOf() - dayjs(a.startDate).valueOf()
  );
};

/** สร้าง diff ใหม่จาก current data โดยเทียบกับ mock */
export const buildDiffFromData = (
  current: CalendarSchedule[],
  mockList: CalendarSchedule[]
): DiffStore => {
  const mockMap = toMap(mockList);
  const currentMap = toMap(current);

  const hiddenIds: string[] = [];
  const items: CalendarSchedule[] = [];

  // mock ที่ “หายไป” จาก current = ถูกซ่อน
  mockList.forEach(m => {
    if (!currentMap.has(m.id)) hiddenIds.push(m.id);
  });

  // current ที่ “ไม่มีใน mock” = ผู้ใช้เพิ่มใหม่
  current.forEach(c => {
    const m = mockMap.get(c.id);
    if (!m) {
      items.push(c); // add ใหม่
    } else {
      // ถ้า id อยู่ใน mock แต่ค่าต่างจาก mock = ผู้ใช้แก้ไข -> เก็บเป็น override
      const changed =
        c.title !== m.title ||
        c.description !== (m.description || '') ||
        c.startDate !== m.startDate ||
        c.endDate !== m.endDate ||
        c.dayCount !== m.dayCount ||
        c.calendarType !== m.calendarType ||
        (!!c.isHoliday) !== (!!m.isHoliday) ||
        (c.holidayCategory || '') !== (m.holidayCategory || '');

      if (changed) items.push(c);
    }
  });

  return { items, hiddenIds };
};
