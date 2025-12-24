import { CalendarSchedule } from "@/types/calendar";
import { LeaveTimeType } from "@/types/factForm";
import dayjs, { Dayjs } from "dayjs";

export function calculateServiceYear(startDateStr: string): number {
  const startDate = new Date(startDateStr);
  const today = new Date();

  let years = today.getFullYear() - startDate.getFullYear();

  const hasBirthdayPassed =
    today.getMonth() > startDate.getMonth() ||
    (today.getMonth() === startDate.getMonth() &&
      today.getDate() >= startDate.getDate());

  if (!hasBirthdayPassed) {
    years -= 1;
  }

  return Math.max(0, years);
}

export const mapToValue = (val: LeaveTimeType): number => {
  if (val === "full") return 1;
  if (val === "am" || val === "pm") return 0.5;
  return 0;
};

export const calculateLeaveDays = async (
  startDate: Dayjs | null,
  endDate: Dayjs | null,
  startType: LeaveTimeType,
  endType: LeaveTimeType,
  holiday: CalendarSchedule[],
): Promise<number> => {
  const holidaySet = buildHolidaySet(holiday);

  if (!startDate || !endDate) return 0;

  const isWeekend = (d: Dayjs): boolean => {
    const day = d.day();
    return day === 0 || day === 6;
  };

  const isHoliday = (d: Dayjs): boolean => {
    return holidaySet.has(d.format("YYYY-MM-DD"));
  };

  // วันเดียวกัน
  if (startDate.isSame(endDate, "day")) {
    if (isWeekend(startDate) || isHoliday(startDate)) return 0;
    return mapToValue(startType);
  }

  let count = 0;
  let current = startDate.startOf("day");

  // นับวันระหว่าง start → end
  while (current.isBefore(endDate, "day")) {
    if (!isWeekend(current) && !isHoliday(current)) {
      count += 1;
    }
    current = current.add(1, "day");
  }

  // วันสุดท้าย
  if (!isWeekend(endDate) && !isHoliday(endDate)) {
    count += 1;
  }

  // --- ปรับด้วย am/pm/full ---
  // วันแรก
  if (!isWeekend(startDate) && !isHoliday(startDate)) {
    count -= 1;
    count += mapToValue(startType);
  }

  // วันสุดท้าย
  if (!isWeekend(endDate) && !isHoliday(endDate)) {
    count -= 1;
    count += mapToValue(endType);
  }

  return count;
};

export const buildHolidaySet = (holidays: CalendarSchedule[]) => {
  const set = new Set<string>();

  holidays.forEach((h) => {
    let d = dayjs(h.startDate);
    const end = dayjs(h.endDate);

    while (d.isSameOrBefore(end, "day")) {
      set.add(d.format("YYYY-MM-DD"));
      d = d.add(1, "day");
    }
  });

  return set;
};

export const buildDaysBetween = (
  startDate: string,
  endDate: string,
): string[] => {
  const days: string[] = [];

  let current = dayjs(startDate);
  const end = dayjs(endDate);

  // วนจนถึงวันสุดท้าย (รวมวันสุดท้ายด้วย)
  while (current.isSameOrBefore(end, "day")) {
    days.push(current.format("YYYY-MM-DD"));
    current = current.add(1, "day");
  }

  return days;
};
