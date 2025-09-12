'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, Segmented } from 'antd';
import dynamic from 'next/dynamic';
import dayjs from 'dayjs';
import ScheduleTable from '@/app/components/Tables/ScheduleTable';
import { calendarSchedulesMock } from '@/mock/calendarSchedules';
import { leavesMock } from '@/mock/leaves';
import { usersMock } from '@/mock/users';
import LeaveScheduleTable from '@/app/components/Tables/LeaveScheduleTable';

const CalendarBox = dynamic(() => import('@/app/components/calendar/CalendarBox'), { ssr: false });

type ViewMode = 'month' | 'quarter';

const VISIBILITY_KEY = 'leave-visibility-selectedUsers'; // ตั้งให้ตรงกับที่หน้า Leave Visibility เซฟไว้

export default function CalendarPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(VISIBILITY_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setSelectedUserIds(parsed.map(String));
      }
    } catch { /* ignore */ }
  }, []);

  // ถ้าต้องการจำกัดเฉพาะ “เดือนนี้” สำหรับตารางลา (ในขณะที่ ScheduleTable แสดงตาม viewMode)
  const monthBase = useMemo(() => dayjs().startOf('month'), []);

  return (
    <div style={{ padding: 16 }}>
      <Card
        title="Leave & Academic/Fiscal Calendars"
        variant="borderless"
        style={{ maxWidth: 1400, margin: '0 auto' }}
        extra={
          <Segmented
            value={viewMode}
            onChange={(v) => setViewMode(v as ViewMode)}
            options={[
              { label: '1 เดือน', value: 'month' },
              { label: '4 เดือน', value: 'quarter' },
            ]}
          />
        }
      >
        <CalendarBox viewMode={viewMode} />
      </Card>

      <Card
        title="ตารางกำหนดการ (Academic / Fiscal / Public)"
        variant="borderless"
        style={{ maxWidth: 1400, margin: '16px auto 0' }}
      >
        <ScheduleTable schedules={calendarSchedulesMock} viewMode={viewMode} />
      </Card>

      <Card
        title="การลาของเดือนนี้ (ทุกสถานะ)"
        variant="borderless"
        style={{ maxWidth: 1400, margin: '16px auto' }}
      >
        <LeaveScheduleTable
          leaves={leavesMock}
          users={usersMock}
          selectedUserIds={selectedUserIds}
          monthDate={monthBase}
        />
      </Card>
    </div>
  );
}
