'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Breadcrumb,
  Card,
  Col,
  Row,
  Segmented,
  Space,
  Typography,
} from 'antd';
import dynamic from 'next/dynamic';
import dayjs from 'dayjs';
import ScheduleTable from '@/app/components/Tables/ScheduleTable';
import { leavesMock } from '@/mock/leaves';
import { usersMock } from '@/mock/users';
import LeaveScheduleTable from '@/app/components/Tables/LeaveScheduleTable';
import router from 'next/router';
import type { CalendarSchedule } from '@/types/calendar';
import { fetchCalendarList } from '@/services/calendarApi';

const CalendarBox = dynamic(
  () => import('@/app/components/calendar/CalendarBox'),
  { ssr: false },
);

type ViewMode = 'month' | 'quarter';

const VISIBILITY_KEY = 'leave-visibility-selectedUsers';

export default function CalendarPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // ✅ state สำหรับกำหนดการจาก backend
  const [schedules, setSchedules] = useState<CalendarSchedule[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);

  // โหลด user visibility จาก localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(VISIBILITY_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setSelectedUserIds(parsed.map(String));
      }
    } catch {
      /* ignore */
    }
  }, []);

  // ✅ โหลดกำหนดการจาก backend แทน calendarSchedulesMock
  useEffect(() => {
    const loadSchedules = async () => {
      try {
        setLoadingSchedules(true);
        const data = await fetchCalendarList();
        setSchedules(data);
      } catch (err) {
        console.error('โหลดกำหนดการปฏิทินไม่สำเร็จ', err);
      } finally {
        setLoadingSchedules(false);
      }
    };

    void loadSchedules();
  }, []);

  const monthBase = useMemo(() => dayjs().startOf('month'), []);

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" style={{ width: '100%' }} size={10}>
        <Row>
          <Col span={12}>
            <Typography.Title
              level={4}
              style={{ marginTop: 0, marginBottom: 0, fontSize: 18 }}
            >
              ปฏิทิน
            </Typography.Title>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Breadcrumb
              items={[
                {
                  title: (
                    <a
                      onClick={() => {
                        router.push(`/private/calendar`);
                      }}
                    >
                      ปฏิทิน
                    </a>
                  ),
                },
              ]}
            />
          </Col>
        </Row>
        <Card
          title="Leave & Academic/Fiscal Calendars"
          variant="borderless"
          style={{ margin: '0 auto' }}
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
          {/* ✅ ส่ง schedules จาก backend ให้ CalendarBox */}
          <CalendarBox viewMode={viewMode} schedules={schedules} />
        </Card>

        <Card
          title="ตารางกำหนดการ (Academic / Fiscal / Public)"
          variant="borderless"
          style={{ margin: '16px auto 0' }}
        >
          {/* ✅ ใช้ schedules จาก backend */}
          <ScheduleTable
            schedules={schedules}
            viewMode={viewMode}
            // ถ้า ScheduleTable รองรับ prop loading ก็ใส่ได้
            // loading={loadingSchedules}
          />
        </Card>

        <Card
          title="การลาของเดือนนี้ (ทุกสถานะ)"
          variant="borderless"
          style={{ margin: '16px auto' }}
        >
          <LeaveScheduleTable
            leaves={leavesMock}
            users={usersMock}
            selectedUserIds={selectedUserIds}
            monthDate={monthBase}
          />
        </Card>
      </Space>
    </div>
  );
}
