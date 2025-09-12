'use client';

import { Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { LeaveItem, UserRef } from '@/types/calendar';

interface Props {
  leaves: LeaveItem[];
  users: UserRef[];
  selectedUserIds: string[];
}

export default function LeaveTable({ leaves, users, selectedUserIds }: Props) {
  const userMap = new Map(users.map((u) => [u.id, u.name]));
  const filtered = selectedUserIds.length
    ? leaves.filter((l) => selectedUserIds.includes(l.userId))
    : leaves;

  const columns: ColumnsType<LeaveItem> = [
    {
      title: 'ผู้ใช้',
      dataIndex: 'userId',
      key: 'user',
      render: (v) => userMap.get(String(v)) ?? v,
    },
    {
      title: 'ประเภท',
      dataIndex: 'type',
      key: 'type',
      render: (v) => <Tag>{String(v)}</Tag>,
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      render: (s) => {
        const color = s === 'approved' ? 'green' : s === 'pending' ? 'gold' : 'red';
        return <Tag color={color}>{s}</Tag>;
      },
      filters: [
        { text: 'Approved', value: 'approved' },
        { text: 'Pending', value: 'pending' },
        { text: 'Rejected', value: 'rejected' },
      ],
      onFilter: (val, rec) => rec.status === val,
    },
    {
      title: 'เริ่ม',
      dataIndex: 'startDate',
      key: 'startDate',
      sorter: (a, b) => a.startDate.localeCompare(b.startDate),
    },
    {
      title: 'สิ้นสุด',
      dataIndex: 'endDate',
      key: 'endDate',
      sorter: (a, b) => a.endDate.localeCompare(b.endDate),
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={filtered}
      pagination={{ pageSize: 8 }}
    />
  );
}
