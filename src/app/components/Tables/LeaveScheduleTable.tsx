'use client';

import React, { useMemo, useState } from 'react';
import { Table, Tag, Typography, Segmented } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { LeaveItem, UserRef } from '@/types/calendar';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/th';

dayjs.locale('th');

interface Props {
  /** รายการลาทั้งหมด (ทุกคน ทุกสถานะ) */
  leaves: LeaveItem[];
  /** รายชื่อผู้ใช้ทั้งหมด (ไว้ map id -> name) */
  users: UserRef[];
  /** user ที่เลือกให้มองเห็น จากหน้า Leave Visibility (ว่าง = แสดงทุกคน) */
  selectedUserIds?: string[];
  /** เดือนฐานที่ต้องการแสดง (default: วันนี้) — ยังใช้เป็น base date เมื่อเลือก "เดือนนี้" */
  monthDate?: Dayjs;
}

const LEAVE_TYPE_TH: Record<string, string> = {
  sick: 'ลาป่วย',
  personal: 'ลากิจ',
  vacation: 'ลาพักร้อน',
  maternity: 'ลาคลอด',
  ordination: 'ลาบวช',
  other: 'ลาอื่น ๆ',
};

const STATUS_COLOR: Record<string, string> = {
  approved: 'green',
  pending: 'gold',
  rejected: 'red',
};

const beYear = (d: Dayjs) => d.year() + 543;

function formatThaiDateRange(start: Dayjs, end: Dayjs): string {
  const sameDay = start.isSame(end, 'day');
  const sameMonth = start.isSame(end, 'month') && start.isSame(end, 'year');
  if (sameDay) return `${start.date()} ${start.format('MMMM')} ${beYear(start)}`;
  if (sameMonth) return `${start.date()}–${end.date()} ${start.format('MMMM')}`;
  const left = `${start.date()} ${start.format('MMM.')}`;
  const right = `${end.date()} ${end.format('MMM.')} ${beYear(end)}`;
  return `${left} – ${right}`;
}

function overlapsRange(item: LeaveItem, rangeStart: Dayjs, rangeEnd: Dayjs) {
  const s = dayjs(item.startDate).startOf('day');
  const e = dayjs(item.endDate || item.startDate).endOf('day');
  return s.isBefore(rangeEnd.add(1, 'day'), 'day') && e.isAfter(rangeStart.subtract(1, 'day'), 'day');
}

function dayCount(item: LeaveItem) {
  const s = dayjs(item.startDate).startOf('day');
  const e = dayjs(item.endDate || item.startDate).endOf('day');
  return e.diff(s, 'day') + 1;
}

type RangeFilter = 'week' | 'month';

export default function LeaveScheduleTable({
  leaves,
  users,
  selectedUserIds = [],
  monthDate,
}: Props) {
  const userMap = useMemo(() => new Map(users.map((u) => [String(u.id), u.name])), [users]);
  const [rangeFilter, setRangeFilter] = useState<RangeFilter>('week');
  const baseDate = monthDate ?? dayjs();
  const { rangeStart, rangeEnd, rangeTitle } = useMemo(() => {
    if (rangeFilter === 'week') {
      const start = baseDate.startOf('day').subtract(baseDate.day(), 'day');
      const end = start.add(6, 'day').endOf('day');
      return {
        rangeStart: start,
        rangeEnd: end,
        rangeTitle: `การลาประจำสัปดาห์ ${formatThaiDateRange(start, end)} ${beYear(start)}`,
      };
    }
    const start = baseDate.startOf('month');
    const end = baseDate.endOf('month');
    return {
      rangeStart: start,
      rangeEnd: end,
      rangeTitle: `การลาประจำเดือน ${baseDate.format('MMMM')} ${beYear(baseDate)}`,
    };
  }, [baseDate, rangeFilter]);

  const filtered = useMemo(() => {
    const byUser = selectedUserIds.length
      ? leaves.filter((l) => selectedUserIds.includes(String(l.userId)))
      : leaves;
    const byRange = byUser.filter((l) => overlapsRange(l, rangeStart, rangeEnd));
    return byRange.sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [leaves, selectedUserIds, rangeStart, rangeEnd]);

  const columns: ColumnsType<LeaveItem & { _dateRange: string; _days: number }> = [
    {
      title: 'ผู้ใช้',
      dataIndex: 'userId',
      key: 'user',
      width: 180,
      render: (v) => userMap.get(String(v)) ?? v,
      sorter: (a, b) =>
        (userMap.get(String(a.userId)) ?? '').localeCompare(userMap.get(String(b.userId)) ?? ''),
    },
    {
      title: 'ประเภท',
      dataIndex: 'type',
      key: 'type',
      width: 140,
      render: (v: string) => <Tag>{LEAVE_TYPE_TH[v] ?? v}</Tag>,
      filters: Object.entries(LEAVE_TYPE_TH).map(([value, text]) => ({ text, value })),
      onFilter: (val, rec) => rec.type === val,
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (s: string) => <Tag color={STATUS_COLOR[s] ?? 'default'}>{s}</Tag>,
      filters: [
        { text: 'Approved', value: 'approved' },
        { text: 'Pending', value: 'pending' },
        { text: 'Rejected', value: 'rejected' },
      ],
      onFilter: (val, rec) => rec.status === val,
    },
    {
      title: 'วันที่ / ช่วงวันที่',
      dataIndex: '_dateRange',
      key: 'dateRange',
      width: 240,
      sorter: (a, b) => a.startDate.localeCompare(b.startDate),
    },
    {
      title: 'จำนวนวัน',
      dataIndex: '_days',
      key: 'days',
      width: 120,
      align: 'center' as const,
      render: (n: number) => `${n} วัน`,
      sorter: (a, b) => dayCount(a) - dayCount(b),
    },
    {
      title: 'หมายเหตุ',
      dataIndex: 'note',
      key: 'note',
      ellipsis: true,
    },
  ];

  const dataSource = useMemo(
    () =>
      filtered.map((l) => ({
        ...l,
        _dateRange: formatThaiDateRange(dayjs(l.startDate), dayjs(l.endDate || l.startDate)),
        _days: dayCount(l),
      })),
    [filtered]
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
        <Typography.Title level={5} style={{ margin: 0 }}>
          {rangeTitle}
        </Typography.Title>
        <Segmented
          options={[
            { label: 'สัปดาห์นี้', value: 'week' },
            { label: 'เดือนนี้', value: 'month' },
          ]}
          value={rangeFilter}
          onChange={(v) => setRangeFilter(v as RangeFilter)}
        />
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={dataSource}
        pagination={{ pageSize: 10 }}
        size="middle"
      />
    </div>
  );
}
