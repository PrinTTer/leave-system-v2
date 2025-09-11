import { Dayjs } from 'dayjs';
export type CalendarType = 'standard' | 'academic' | 'fiscal';
export type HolidayCategory = 'public_contiguous' | 'public_non_contiguous';

export interface CalendarSchedule {
  id: string;
  calendarType: CalendarType;
  title: string;
  description?: string;
  startDate: string; // ISO (YYYY-MM-DD)
  endDate: string;   // ISO (YYYY-MM-DD)
  dayCount: number;  // รวมวันเสาร์-อาทิตย์
  // เฉพาะปฏิทินธรรมดา ที่ติ๊ก "วันหยุดนักขัตฤกษ์"
  isHoliday?: boolean;
  holidayCategory?: HolidayCategory; // ต่อเนื่อง/ไม่ต่อเนื่องกับเสาร์-อาทิตย์
}

export interface EventData {
  type: 'success' | 'warning' | 'error';
  content: string;
  calendarType: 'standard' | 'academic' | 'fiscal';
  startDate: Dayjs;
  endDate: Dayjs;
}

export type ViewMode = 'month' | 'quarter';

export interface CalendarBoxProps {
  viewMode: ViewMode;
}

export interface LeaveItem {
  id: string;
  userId: string;
  type: string;
  status: 'approved' | 'pending' | 'rejected';
  startDate: string;
  endDate: string;
}

export interface UserRef {
  id: string;
  name: string;
}
