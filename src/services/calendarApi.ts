import type {
  CalendarSchedule,
  CalendarType,
  HolidayCategory,
} from "@/types/calendar";
import axios from "axios";

// ให้เรียกผ่าน Next.js proxy: /api/*
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface CalendarDto {
  calendarType: CalendarType;
  title: string;
  description?: string;
  startDate: string; // 'YYYY-MM-DD'
  endDate: string; // 'YYYY-MM-DD'
  isHoliday?: boolean;
}

/**
 * รูปแบบข้อมูลที่ backend ส่งมา (รองรับทั้ง snake_case และ camelCase)
 */
type CalendarApiItem = {
  id?: string | number;
  calendar_id?: string | number;

  calendarType?: CalendarType;
  calendar_type?: CalendarType;

  title: string;
  description?: string | null;

  startDate?: string;
  endDate?: string;
  start_date?: string;
  end_date?: string;

  dayCount?: number;
  day_count?: number;

  isHoliday?: boolean | null;
  is_holiday?: boolean | null;

  holidayCategory?: HolidayCategory | null;
  holiday_category?: HolidayCategory | null;
};

function mapCalendarItem(raw: CalendarApiItem): CalendarSchedule {
  const rawCalendarType = (raw.calendarType ??
    raw.calendar_type ??
    "holiday") as string;
  const calendarType = rawCalendarType.toLowerCase() as CalendarType;

  return {
    id: String(raw.id ?? raw.calendar_id ?? ""),
    calendarType,
    title: raw.title,
    description: raw.description ?? undefined,
    startDate: raw.startDate ?? raw.start_date ?? "",
    endDate: raw.endDate ?? raw.end_date ?? "",
    dayCount: raw.dayCount ?? raw.day_count ?? 0,
    isHoliday: raw.isHoliday ?? raw.is_holiday ?? undefined,
    holidayCategory: raw.holidayCategory ?? raw.holiday_category ?? undefined,
  };
}

export async function fetchCalendarList(): Promise<CalendarSchedule[]> {
  const res = await fetch(`${API_BASE}/calendar`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`โหลดปฏิทินไม่สำเร็จ: ${res.status}`);
  }

  const json = (await res.json()) as unknown;

  if (!Array.isArray(json)) {
    return [];
  }

  return json.map((item) => mapCalendarItem(item as CalendarApiItem));
}

export async function createCalendar(
  dto: CalendarDto
): Promise<CalendarSchedule> {
  const res = await fetch(`${API_BASE}/calendar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });

  if (!res.ok) {
    throw new Error(`สร้างกำหนดการไม่สำเร็จ: ${res.status}`);
  }

  const json = (await res.json()) as unknown;
  return mapCalendarItem(json as CalendarApiItem);
}

export async function updateCalendar(
  id: string,
  dto: CalendarDto
): Promise<CalendarSchedule> {
  const res = await fetch(`${API_BASE}/calendar/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });

  if (!res.ok) {
    throw new Error(`แก้ไขกำหนดการไม่สำเร็จ: ${res.status}`);
  }

  const json = (await res.json()) as unknown;
  return mapCalendarItem(json as CalendarApiItem);
}

export async function deleteCalendar(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/calendar/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(`ลบกำหนดการไม่สำเร็จ: ${res.status}`);
  }
}

export async function fetchHolidaysByYear(year: number) {
  try {
    const response = await axios.get(`${API_BASE}/calendar/${year}/holidays`);
    return response.data;
  } catch (error) {
    throw new Error(`โหลดวันหยุดไม่สำเร็จ: ${error}`);
  }
}
