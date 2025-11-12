import dayjs, { Dayjs } from "dayjs";
import { RuleObject } from "antd/es/form";

export function convertDateTimeToNumber(dateStr: string) {
  return new Date(dateStr).getTime();
}

export function convertDateTimeFormate(dateTime: string) {
  return dayjs(dateTime).add(7, "hour").format("DD/MM/YYYY");
}

export function validateEmailInput(rule: RuleObject, value: string): Promise<void> {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!value || emailRegex.test(value)) {
    return Promise.resolve();
  }

  return Promise.reject(new Error("โปรดระบุอีเมลที่ถูกต้อง"));
}

export const formatThaiDate = (date: Dayjs | string | null): string => {
  if (!date) return "";

  // ถ้าเป็น Dayjs
  if (dayjs.isDayjs(date)) {
    return date.locale("th").format("D MMMM BBBB"); // BBBB = พ.ศ.
  }

  // ถ้าเป็น string
  const jsDate = new Date(date);
  return jsDate.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
