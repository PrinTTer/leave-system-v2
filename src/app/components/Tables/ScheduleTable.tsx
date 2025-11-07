"use client";

import React, { useMemo } from "react";
import { Card, Table, Typography, Empty, Space, Divider } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/th";
import isBetween from "dayjs/plugin/isBetween";
import type { CalendarSchedule } from "@/types/calendar";

dayjs.locale("th");
dayjs.extend(isBetween);

export type ScheduleViewMode = "month" | "quarter";

export interface ScheduleTableProps {
  /** All schedules (e.g. holidays, academic/fiscal items) */
  schedules: CalendarSchedule[];
  /** Base month to render from. Default: today */
  baseDate?: Dayjs;
  /** 1 เดือน หรือ 4 เดือน */
  viewMode?: ScheduleViewMode;
  /** Optional title override (otherwise auto: "เดือน <name> พ.ศ.<year>") */
  headerTitleRenderer?: (monthDate: Dayjs) => React.ReactNode;
}

const CAL_TYPE_TH: Record<string, string> = {
  standard: "ปฏิทินวันหยุดราชการ",
  academic: "ปฏิทินการศึกษา",
  fiscal: "ปฏิทินปีงบประมาณ",
  leave: "ปฏิทินการลา",
};

/** เพิ่มปี พ.ศ. (คริสต์ศักราช + 543) */
const beYear = (d: Dayjs) => d.year() + 543;

/**
 * แปลงช่วงวันที่สำหรับแสดงผลในตาราง ตามโจทย์:
 * - วันเดียว: 6 เมษายน 2568
 * - หลายวันในเดือนเดียวกัน: 13–15 เมษายน
 * - ข้ามเดือน: 28 เม.ย. – 2 พ.ค. 2568 (ใส่ปีไทยท้ายช่วงเพื่อความชัด)
 */
function formatThaiDateRange(start: Dayjs, end: Dayjs): string {
  const sameDay = start.isSame(end, "day");
  const sameMonth = start.isSame(end, "month") && start.isSame(end, "year");
  if (sameDay) {
    return `${start.date()} ${start.format("MMMM")} ${beYear(start)}`;
  }
  if (sameMonth) {
    return `${start.date()}–${end.date()} ${start.format("MMMM")}`;
  }
  const left = `${start.date()} ${start.format("MMM.")}`;
  const right = `${end.date()} ${end.format("MMM.")} ${beYear(end)}`;
  return `${left} – ${right}`;
}

/**
 * คืนข้อมูลเฉพาะรายการที่ "ทับซ้อน" กับเดือนที่กำหนด
 */
function filterSchedulesForMonth(
  schedules: CalendarSchedule[],
  monthDate: Dayjs
) {
  const startOfMonth = monthDate.startOf("month");
  const endOfMonth = monthDate.endOf("month");
  return schedules
    .filter((s) => {
      const sStart = dayjs(s.startDate);
      const sEnd = dayjs(s.endDate || s.startDate);
      return (
        sStart.isBefore(endOfMonth.add(1, "day"), "day") &&
        sEnd.isAfter(startOfMonth.subtract(1, "day"), "day")
      );
    })
    .sort((a, b) => dayjs(a.startDate).diff(dayjs(b.startDate)));
}

/** คำนวณจำนวนวัน (inclusive) หากไม่มี dayCount ใน mock */
function computeDayCount(s: CalendarSchedule) {
  if (typeof s.dayCount === "number") return s.dayCount;
  const a = dayjs(s.startDate);
  const b = dayjs(s.endDate || s.startDate);
  return b.endOf("day").diff(a.startOf("day"), "day") + 1;
}

/** สร้างคอลัมน์ของ antd Table */
function createColumns(): ColumnsType<any> {
  return [
    {
      title: "ชนิดปฏิทิน",
      dataIndex: "calendarType",
      key: "calendarType",
      width: 180,
      render: (val: string) => CAL_TYPE_TH[val] || val,
    },
    {
      title: "วันที่ / ช่วงวันที่",
      dataIndex: "dateRange",
      key: "dateRange",
      width: 260,
    },
    {
      title: "กำหนดการ",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "จำนวนวัน",
      dataIndex: "dayCount",
      key: "dayCount",
      align: "center" as const,
      width: 120,
      render: (n: number) => `${n} วัน`,
    },
  ];
}

function MonthBlock({
  monthDate,
  schedules,
  headerTitleRenderer,
}: {
  monthDate: Dayjs;
  schedules: CalendarSchedule[];
  headerTitleRenderer?: (monthDate: Dayjs) => React.ReactNode;
}) {
  const data = useMemo(() => {
    const list = filterSchedulesForMonth(schedules, monthDate);
    return list.map((s) => {
      const start = dayjs(s.startDate);
      const end = dayjs(s.endDate || s.startDate);
      return {
        key: s.id,
        calendarType: s.calendarType,
        dateRange: formatThaiDateRange(start, end),
        title: s.title,
        dayCount: computeDayCount(s),
      };
    });
  }, [schedules, monthDate]);

  const columns = useMemo(() => createColumns(), []);
  const headerTitle =
    headerTitleRenderer?.(monthDate) ?? (
      <Space size={8}>
        <Typography.Text strong>เดือน</Typography.Text>
        <Typography.Title level={5} style={{ margin: 0 }}>
          {monthDate.format("MMMM")} {beYear(monthDate)}
        </Typography.Title>
      </Space>
    );

  return (
    <Card variant="outlined" style={{ marginBottom: 16 }} title={headerTitle}>

      {data.length === 0 ? (
        <Empty description="ไม่มีกำหนดการในเดือนนี้" />
      ) : (
        <Table
          rowKey="key"
          columns={columns}
          dataSource={data}
          pagination={false}
          size="middle"
        />
      )}
    </Card>
  );
}

export default function ScheduleTable({
  schedules,
  baseDate,
  viewMode = "month",
  headerTitleRenderer,
}: ScheduleTableProps) {
  const start = (baseDate ?? dayjs()).startOf("month");

  if (viewMode === "month") {
    return (
      <MonthBlock
        monthDate={start}
        schedules={schedules}
        headerTitleRenderer={headerTitleRenderer}
      />
    );
  }
  const months: Dayjs[] = [0, 1, 2, 3].map((i) => start.add(i, "month"));

  return (
    <div>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        ตารางกำหนดการ (4 เดือน)
      </Typography.Title>
      <Divider style={{ marginTop: 8 }} />
      {months.map((m) => (
        <MonthBlock
          key={m.format("YYYY-MM")}
          monthDate={m}
          schedules={schedules}
          headerTitleRenderer={headerTitleRenderer}
        />
      ))}
    </div>
  );
}
