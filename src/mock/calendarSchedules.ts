// src/mock/calendarSchedules.ts
import type { CalendarSchedule } from '@/types/calendar';

// ปฏิทินวันหยุดราชการ พ.ศ. 2568 (ค.ศ. 2025) — เฉพาะปฏิทินธรรมดา
// holidayCategory:
//   - 'public_contiguous'     = นักขัตฯ ที่ต่อเนื่อง/ชิดเสาร์อาทิตย์
//   - 'public_non_contiguous' = นักขัตฯ ที่ไม่ต่อเนื่อง/ไม่ชิดเสาร์อาทิตย์
export const calendarSchedulesMock: CalendarSchedule[] = [
  // มกราคม 2568
  {
    id: 'th-2568-0101',
    calendarType: 'standard',
    title: 'วันขึ้นปีใหม่',
    startDate: '2025-01-01',
    endDate: '2025-01-01',
    dayCount: 1,
    isHoliday: true,
    holidayCategory: 'public_non_contiguous', // พุธ ไม่ติดเสาร์-อาทิตย์
  },

  // กุมภาพันธ์ 2568
  {
    id: 'th-2568-0212',
    calendarType: 'standard',
    title: 'วันมาฆบูชา',
    startDate: '2025-02-12',
    endDate: '2025-02-12',
    dayCount: 1,
    isHoliday: true,
    holidayCategory: 'public_non_contiguous', // พุธ
  },

  // มีนาคม 2568 — ไม่มีวันหยุดราชการ

  // เมษายน 2568
  {
    id: 'th-2568-0406',
    calendarType: 'standard',
    title: 'วันจักรี',
    startDate: '2025-04-06', // อาทิตย์
    endDate: '2025-04-06',
    dayCount: 1,
    isHoliday: true,
    holidayCategory: 'public_contiguous', // ตรงวันอาทิตย์
  },
  {
    id: 'th-2568-0407',
    calendarType: 'standard',
    title: 'ชดเชยวันจักรี',
    startDate: '2025-04-07', // จันทร์
    endDate: '2025-04-07',
    dayCount: 1,
    isHoliday: true,
    holidayCategory: 'public_contiguous', // จันทร์ชิดอาทิตย์
  },
  {
    id: 'th-2568-0413-16',
    calendarType: 'standard',
    title: 'วันสงกรานต์ และชดเชย',
    description: '13–16 เม.ย. 2568',
    startDate: '2025-04-13', // อาทิตย์
    endDate: '2025-04-16',   // พุธ (ชดเชย)
    dayCount: 4,
    isHoliday: true,
    holidayCategory: 'public_contiguous', // มีอาทิตย์ในช่วง
  },

  // พฤษภาคม 2568
  {
    id: 'th-2568-0501',
    calendarType: 'standard',
    title: 'วันแรงงานแห่งชาติ',
    startDate: '2025-05-01', // พฤหัสฯ
    endDate: '2025-05-01',
    dayCount: 1,
    isHoliday: true,
    holidayCategory: 'public_non_contiguous',
  },
  {
    id: 'th-2568-0504',
    calendarType: 'standard',
    title: 'วันฉัตรมงคล',
    startDate: '2025-05-04', // อาทิตย์
    endDate: '2025-05-04',
    dayCount: 1,
    isHoliday: true,
    holidayCategory: 'public_contiguous',
  },
  {
    id: 'th-2568-0505',
    calendarType: 'standard',
    title: 'ชดเชยวันฉัตรมงคล',
    startDate: '2025-05-05', // จันทร์
    endDate: '2025-05-05',
    dayCount: 1,
    isHoliday: true,
    holidayCategory: 'public_contiguous',
  },
  {
    id: 'th-2568-0511',
    calendarType: 'standard',
    title: 'วันวิสาขบูชา',
    startDate: '2025-05-11', // อาทิตย์
    endDate: '2025-05-11',
    dayCount: 1,
    isHoliday: true,
    holidayCategory: 'public_contiguous',
  },
  {
    id: 'th-2568-0512',
    calendarType: 'standard',
    title: 'ชดเชยวันวิสาขบูชา',
    startDate: '2025-05-12', // จันทร์
    endDate: '2025-05-12',
    dayCount: 1,
    isHoliday: true,
    holidayCategory: 'public_contiguous',
  },

  // มิถุนายน 2568
  {
    id: 'th-2568-0602',
    calendarType: 'standard',
    title: 'วันหยุดพิเศษ',
    startDate: '2025-06-02', // จันทร์
    endDate: '2025-06-02',
    dayCount: 1,
    isHoliday: true,
    holidayCategory: 'public_contiguous',
  },
  {
    id: 'th-2568-0603',
    calendarType: 'standard',
    title: 'วันเฉลิมพระชนมพรรษา สมเด็จพระนางเจ้าสุทิดา',
    startDate: '2025-06-03', // อังคาร
    endDate: '2025-06-03',
    dayCount: 1,
    isHoliday: true,
    holidayCategory: 'public_non_contiguous',
  },

  // กรกฎาคม 2568
  {
    id: 'th-2568-0710',
    calendarType: 'standard',
    title: 'วันอาสาฬหบูชา',
    startDate: '2025-07-10', // พฤหัสฯ
    endDate: '2025-07-10',
    dayCount: 1,
    isHoliday: true,
    holidayCategory: 'public_non_contiguous',
  },
  {
    id: 'th-2568-0711',
    calendarType: 'standard',
    title: 'วันเข้าพรรษา',
    startDate: '2025-07-11', // ศุกร์
    endDate: '2025-07-11',
    dayCount: 1,
    isHoliday: true,
    holidayCategory: 'public_contiguous', // ศุกร์ชิดเสาร์
  },
  {
    id: 'th-2568-0728',
    calendarType: 'standard',
    title: 'วันเฉลิมพระชนมพรรษาพระบาทสมเด็จพระเจ้าอยู่หัว',
    startDate: '2025-07-28', // จันทร์
    endDate: '2025-07-28',
    dayCount: 1,
    isHoliday: true,
    holidayCategory: 'public_contiguous',
  },

  // สิงหาคม 2568
  {
    id: 'th-2568-0811',
    calendarType: 'standard',
    title: 'วันหยุดพิเศษ',
    startDate: '2025-08-11', // จันทร์
    endDate: '2025-08-11',
    dayCount: 1,
    isHoliday: true,
    holidayCategory: 'public_contiguous',
  },
  {
    id: 'th-2568-0812',
    calendarType: 'standard',
    title: 'วันเฉลิมพระชนมพรรษา สมเด็จพระนางเจ้าสิริกิติ์ฯ และวันแม่แห่งชาติ',
    startDate: '2025-08-12', // อังคาร
    endDate: '2025-08-12',
    dayCount: 1,
    isHoliday: true,
    holidayCategory: 'public_non_contiguous',
  },

  // กันยายน 2568 — ไม่มีวันหยุดราชการ

  // ตุลาคม 2568
  {
    id: 'th-2568-1013',
    calendarType: 'standard',
    title: 'วันคล้ายวันสวรรคต ร.9',
    startDate: '2025-10-13', // จันทร์
    endDate: '2025-10-13',
    dayCount: 1,
    isHoliday: true,
    holidayCategory: 'public_contiguous',
  },
  {
    id: 'th-2568-1023',
    calendarType: 'standard',
    title: 'วันปิยมหาราช',
    startDate: '2025-10-23', // พฤหัสฯ
    endDate: '2025-10-23',
    dayCount: 1,
    isHoliday: true,
    holidayCategory: 'public_non_contiguous',
  },

  // พฤศจิกายน 2568 — ไม่มีวันหยุดราชการ

  // ธันวาคม 2568
  {
    id: 'th-2568-1205',
    calendarType: 'standard',
    title: 'วันคล้ายวันพระบรมราชสมภพ ร.9 / วันชาติ / วันพ่อแห่งชาติ',
    startDate: '2025-12-05', // ศุกร์
    endDate: '2025-12-05',
    dayCount: 1,
    isHoliday: true,
    holidayCategory: 'public_contiguous', // ศุกร์ชิดเสาร์
  },
  {
    id: 'th-2568-1210',
    calendarType: 'standard',
    title: 'วันรัฐธรรมนูญ',
    startDate: '2025-12-10', // พุธ
    endDate: '2025-12-10',
    dayCount: 1,
    isHoliday: true,
    holidayCategory: 'public_non_contiguous',
  },
  {
    id: 'th-2568-1231',
    calendarType: 'standard',
    title: 'วันสิ้นปี',
    startDate: '2025-12-31', // พุธ
    endDate: '2025-12-31',
    dayCount: 1,
    isHoliday: true,
    holidayCategory: 'public_non_contiguous',
  },
];
