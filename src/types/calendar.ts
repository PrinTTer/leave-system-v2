// src/types/calendar.ts

// import เฉพาะเป็น type (ไม่มี runtime code)
import type { Dayjs } from 'dayjs';

/**
 * ประเภทของปฏิทินในระบบ
 * - holiday  : ปฏิทินวันหยุดราชการ/ปกติ
 * - academic  : ปฏิทินปีการศึกษา
 * - fiscal    : ปฏิทินปีงบประมาณ
 */
export type CalendarType = 'holiday' | 'academic' | 'fiscal';

/**
 * หมวดหมู่ของวันหยุดนักขัตฤกษ์ (ใช้เฉพาะ calendarType = 'holiday' และ isHoliday = true)
 * - public_contiguous      : วันหยุดนักขัตที่ต่อเนื่องกับเสาร์-อาทิตย์
 * - public_non_contiguous  : วันหยุดนักขัตที่ไม่ต่อเนื่องกับเสาร์-อาทิตย์
 */
export type HolidayCategory = 'public_contiguous' | 'public_non_contiguous';

/**
 * โครงสร้างข้อมูล “กำหนดการบนปฏิทิน”
 * ใช้ร่วมกันระหว่าง:
 *  - backend `/calendar` (response ที่ map เป็น camelCase)
 *  - frontend service (calendarApi.ts)
 *  - หน้า manage calendar (page.tsx)
 */
export interface CalendarSchedule {
  /** รหัสกำหนดการ (มาจาก calendar_id ใน DB แปลงเป็น string) */
  id: string;

  /** ประเภทปฏิทิน */
  calendarType: CalendarType;

  /** ชื่อกิจกรรม / กำหนดการ */
  title: string;

  /** รายละเอียดเพิ่มเติมของกิจกรรม (optional) */
  description?: string;

  /** วันที่เริ่ม (รูปแบบ ISO: YYYY-MM-DD) */
  startDate: string;

  /** วันที่สิ้นสุด (รูปแบบ ISO: YYYY-MM-DD) */
  endDate: string;

  /** จำนวนวันทั้งหมด (รวมเสาร์-อาทิตย์) — คำนวณจาก startDate/endDate */
  dayCount: number;

  /**
   * เฉพาะปฏิทินวันหยุดราชการ:
   *   - true  : เป็นวันหยุดนักขัตฤกษ์
   *   - false : ไม่ใช่วันหยุดนักขัต
   *   - undefined : ไม่ได้ระบุ
   */
  isHoliday?: boolean;

  /** หมวดหมู่วันหยุด (ต่อเนื่อง / ไม่ต่อเนื่องกับเสาร์-อาทิตย์) */
  holidayCategory?: HolidayCategory;
}

/**
 * ข้อมูล event ที่ใช้บนปฏิทิน (เช่น แสดงสี/สถานะบน calendar view)
 */
export interface EventData {
  /** ระดับสถานะ เช่น success / warning / error (ไว้กำหนดสีหรือ style) */
  type: 'success' | 'warning' | 'error';

  /** ข้อความสั้น ๆ ที่จะแสดงบน event */
  content: string;

  /** ประเภทปฏิทินที่ event นี้อยู่ */
  calendarType: CalendarType;

  /** วันเริ่มต้นของ event (ใช้เป็น Dayjs เพื่อคำนวณ / แสดงบน calendar component) */
  startDate: Dayjs;

  /** วันสิ้นสุดของ event */
  endDate: Dayjs;
}

/** โหมดการแสดงผลของกล่องปฏิทิน (เช่น แสดง 1 เดือน หรือ 4 เดือน) */
export type ViewMode = 'month' | 'quarter';

/** props สำหรับคอมโพเนนต์กล่องปฏิทิน (ถ้ามี) */
export interface CalendarBoxProps {
  viewMode: ViewMode;
}

/**
 * โครงสร้างข้อมูลใบลา (ใช้ในระบบลางาน)
 * แยกออกจาก CalendarSchedule แต่สามารถเอามา map เป็น EventData/CalendarSchedule เพื่อแสดงบนปฏิทินได้
 */
export interface LeaveItem {
  id: string;
  userId: string;
  type: string;
  status: 'approved' | 'pending' | 'rejected';
  startDate: string; // ISO date
  endDate: string;   // ISO date
}

/** อ้างอิงผู้ใช้ (ใช้ใน dropdown / reference ในหน้าต่าง ๆ) */
export interface UserRef {
  id: string;
  name: string;
}
