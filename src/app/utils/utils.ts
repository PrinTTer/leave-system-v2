import dayjs from "dayjs";

export function convertDateTimeToNumber(dateStr: string) {
  return new Date(dateStr).getTime();
}

export function convertDateTimeFormate(dateTime: string) {
  return dayjs(dateTime).add(7, "hour").format("DD/MM/YYYY");
}

export function validateEmailInput(rule: any, value: any) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]$/;

  if (!value || emailRegex.test(value)) {
    return Promise.resolve();
  }

  return Promise.reject("โปรดระบุอีเมลที่ถูกต้อง");
}
