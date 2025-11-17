'use client';

import React, { useMemo } from 'react';
import { Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type {
  CalendarSchedule,
  CalendarType,
  HolidayCategory,
} from '@/types/calendar';

export type ScheduleViewMode = 'month' | 'quarter';

interface ScheduleTableProps {
  schedules: CalendarSchedule[];
  viewMode: ScheduleViewMode;
}

const CAL_TYPE_LABEL: Record<CalendarType, string> = {
  holiday: 'ปฏิทินวันหยุดราชการ',
  academic: 'ปฏิทินการศึกษา',
  fiscal: 'ปฏิทินปีงบประมาณ',
};

const CAL_TYPE_COLOR: Record<CalendarType, string> = {
  holiday: 'blue',
  academic: 'purple',
  fiscal: 'geekblue',
};

const HOLIDAY_CATEGORY_LABEL: Record<HolidayCategory, string> = {
  public_contiguous: 'นักขัตฤกษ์ (ต่อเนื่องกับ ส.-อา.)',
  public_non_contiguous: 'นักขัตฤกษ์ (ไม่ต่อเนื่อง)',
};

const HOLIDAY_CATEGORY_COLOR: Record<HolidayCategory, string> = {
  public_contiguous: 'green',
  public_non_contiguous: 'gold',
};

const ScheduleTable: React.FC<ScheduleTableProps> = ({
  schedules,
}) => {
  // ถ้าอยาก filter ตาม viewMode ค่อยมาเติม logic ภายหลังได้
  const dataSource = useMemo(() => {
    return schedules;
  }, [schedules]);
  // ❗ ตอนนี้เอา viewMode ออกจาก dependency เพราะยังไม่ได้ใช้จริง

  const columns: ColumnsType<CalendarSchedule> = useMemo(
    () => [
      {
        title: 'วันที่',
        dataIndex: 'startDate',
        key: 'dateRange',
        render: (_: unknown, rec: CalendarSchedule) => {
          const s = dayjs(rec.startDate).format('DD MMM YYYY');
          const e = dayjs(rec.endDate).format('DD MMM YYYY');
          return s === e ? s : `${s} - ${e}`;
        },
      },
      {
        title: 'จำนวนวัน',
        dataIndex: 'dayCount',
        key: 'dayCount',
        width: 100,
      },
      {
        title: 'ชนิดปฏิทิน',
        dataIndex: 'calendarType',
        key: 'calendarType',
        width: 160,
        render: (t: CalendarType) => (
          <Tag color={CAL_TYPE_COLOR[t]}>{CAL_TYPE_LABEL[t]}</Tag>
        ),
        filters: Object.entries(CAL_TYPE_LABEL).map(([value, label]) => ({
          text: label,
          value,
        })),
        onFilter: (val, rec) => rec.calendarType === val,
      },
      {
        title: 'ชื่อกิจกรรม',
        dataIndex: 'title',
        key: 'title',
        ellipsis: true,
      },
      {
        title: 'รายละเอียด',
        dataIndex: 'description',
        key: 'description',
        ellipsis: true,
      },
      {
        title: 'วันหยุดนักขัตฤกษ์',
        dataIndex: 'isHoliday',
        key: 'isHoliday',
        width: 140,
        render: (isHoliday?: boolean) =>
          isHoliday ? <Tag color="red">วันหยุด</Tag> : null,
        filters: [
          { text: 'เป็นวันหยุด', value: 'holiday' },
          { text: 'ไม่ใช่วันหยุด', value: 'normal' },
        ],
        onFilter: (val, rec) => {
          if (val === 'holiday') return !!rec.isHoliday;
          if (val === 'normal') return !rec.isHoliday;
          return true;
        },
      },
      {
        title: 'หมวดวันหยุด (เฉพาะวันหยุดราชการ)',
        dataIndex: 'holidayCategory',
        key: 'holidayCategory',
        width: 260,
        render: (hc?: HolidayCategory, rec?: CalendarSchedule) => {
          if (!(rec?.calendarType === 'holiday' && rec.isHoliday && hc)) {
            return null;
          }
          return (
            <Tag color={HOLIDAY_CATEGORY_COLOR[hc]}>
              {HOLIDAY_CATEGORY_LABEL[hc]}
            </Tag>
          );
        },
        filters: [
          {
            text: HOLIDAY_CATEGORY_LABEL.public_contiguous,
            value: 'public_contiguous',
          },
          {
            text: HOLIDAY_CATEGORY_LABEL.public_non_contiguous,
            value: 'public_non_contiguous',
          },
        ],
        onFilter: (val, rec) => rec.holidayCategory === val,
      },
    ],
    [],
  );

  return (
    <Table<CalendarSchedule>
      rowKey="id"
      columns={columns}
      dataSource={dataSource}
      pagination={{ pageSize: 20 }}
      scroll={{ x: 900 }}
    />
  );
};

export default ScheduleTable;
