import { Dayjs } from 'dayjs';

export const countInclusiveDays = (start: Dayjs, end: Dayjs) =>
  end.startOf('day').diff(start.startOf('day'), 'day') + 1;

const isWeekend = (d: Dayjs) => {
  const w = d.day(); // 0=Sun, 6=Sat
  return w === 0 || w === 6;
};

const rangeIncludesWeekend = (start: Dayjs, end: Dayjs) => {
  for (let d = start.startOf('day'); d.isBefore(end) || d.isSame(end, 'day'); d = d.add(1, 'day')) {
    if (isWeekend(d)) return true;
  }
  return false;
};

/** ใช้เฉพาะกรณี "ปฏิทินวันหยุดราชการ" และผู้ใช้ติ๊ก "วันหยุดนักขัตฤกษ์" */
export const classifyPublicHoliday = (
  start: Dayjs,
  end: Dayjs
): 'public_contiguous' | 'public_non_contiguous' => {
  const touchesWeekend =
    rangeIncludesWeekend(start, end) ||
    isWeekend(start.subtract(1, 'day')) ||
    isWeekend(end.add(1, 'day'));
  return touchesWeekend ? 'public_contiguous' : 'public_non_contiguous';
};
