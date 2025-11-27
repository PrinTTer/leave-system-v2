'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Breadcrumb,
  Card,
  Col,
  Row,
  Segmented,
  Space,
  Spin,
  Typography,
} from 'antd';
import dynamic from 'next/dynamic';
import dayjs from 'dayjs';
import router from 'next/router';

import ScheduleTable from '@/app/components/Tables/ScheduleTable';
// ไม่ใช้แล้ว
// import LeaveScheduleTable from '@/app/components/Tables/LeaveScheduleTable';

import type { CalendarSchedule, LeaveItem, UserRef } from '@/types/calendar';
import { fetchCalendarList } from '@/services/calendarApi';
import { getTargetsForViewer } from '@/services/leaveVisibilityApi';

const CalendarBox = dynamic(
  () => import('@/app/components/calendar/CalendarBox'),
  { ssr: false },
);

type ViewMode = 'month' | 'quarter';

// ใช้ user mock id = 1
const MOCK_VIEWER_ID = 1;

// ✅ ขยาย LeaveItem เฉพาะในไฟล์นี้ให้มี reason (optional)
type LeaveItemWithReason = LeaveItem & {
  reason?: string;
};

export default function CalendarPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  // user id ที่ viewer = 1 เห็นได้ (string[] จาก backend)
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const [schedules, setSchedules] = useState<CalendarSchedule[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);

  const [leaves, setLeaves] = useState<LeaveItemWithReason[]>([]);
  const [loadingLeaves, setLoadingLeaves] = useState(false);

  const [users, setUsers] = useState<UserRef[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const monthBase = useMemo(() => dayjs().startOf('month'), []);
  const monthStart = monthBase.format('YYYY-MM-DD');
  const monthEnd = monthBase.endOf('month').format('YYYY-MM-DD');

  const { Paragraph, Text } = Typography;

  // ✅ โหลด “สิทธิ์การมองเห็นการลา” จาก backend: /leave-visibility/viewer/1
  useEffect(() => {
    const loadVisibility = async () => {
      try {
        const targetIds = await getTargetsForViewer(MOCK_VIEWER_ID); // number[]
        setSelectedUserIds(targetIds.map(String)); // เก็บเป็น string[]
      } catch (err) {
        console.error('โหลดสิทธิ์การมองเห็นการลาไม่สำเร็จ', err);
      }
    };

    void loadVisibility();
  }, []);

  // ✅ โหลด schedules จาก backend
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

  // ✅ ใช้ mock getUserList (ไม่ import UserList เพราะเป็น global จาก user.d.ts)
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        const res: UserList = await getUserList({ page: 1, limit: 1000 });

        const mapped: UserRef[] = res.data.map(
          (u: UserList['data'][number]) => ({
            id: String(u.id),
            name: `${u.name} ${u.surname}`,
          }),
        );

        setUsers(mapped);
      } catch (err) {
        console.error('โหลดรายชื่อผู้ใช้ไม่สำเร็จ', err);
      } finally {
        setLoadingUsers(false);
      }
    };

    void loadUsers();
  }, []);

  // ✅ ใช้ mock getLeavesForCalendar (ด้านล่างไฟล์) โดย viewer = 1
  useEffect(() => {
    const loadLeaves = async () => {
      try {
        setLoadingLeaves(true);
        const data = await getLeavesForCalendar(
          MOCK_VIEWER_ID,
          monthStart,
          monthEnd,
        );
        setLeaves(data);
      } catch (err) {
        console.error('โหลดข้อมูลการลาไม่สำเร็จ', err);
      } finally {
        setLoadingLeaves(false);
      }
    };

    void loadLeaves();
  }, [monthStart, monthEnd]);

  // ✅ filter leaves ตาม user ที่ viewer มีสิทธิ์เห็น
  const visibleLeaves = useMemo<LeaveItemWithReason[]>(
    () =>
      selectedUserIds.length === 0
        ? leaves
        : leaves.filter((lv) =>
            selectedUserIds.includes(String(lv.userId)),
          ),
    [leaves, selectedUserIds],
  );

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

        {/* ปฏิทินหลัก */}
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
          {loadingSchedules ? (
            <div style={{ textAlign: 'center', padding: 24 }}>
              <Spin />
            </div>
          ) : (
            <CalendarBox viewMode={viewMode} schedules={schedules} />
          )}
        </Card>

        {/* ตารางกำหนดการ */}
        <Card
          title="ตารางกำหนดการ (Academic / Fiscal / Public)"
          variant="borderless"
          style={{ margin: '16px auto 0' }}
        >
          {loadingSchedules ? (
            <Spin />
          ) : (
            <ScheduleTable schedules={schedules} viewMode={viewMode} />
          )}
        </Card>

        <Card
          title="การลาของเดือนนี้ (ตามสิทธิ์ของ viewer = 1)"
          variant="borderless"
          style={{ margin: '16px auto' }}
        >
          {loadingLeaves || loadingUsers ? (
            <div style={{ textAlign: 'center', padding: 16 }}>
              <Spin />
            </div>
          ) : (
            <>
              <Paragraph type="secondary">
                viewer (userId = {MOCK_VIEWER_ID}) สามารถมองเห็นการลาของผู้ใช้:{' '}
                {selectedUserIds.length > 0
                  ? selectedUserIds.join(', ')
                  : 'ไม่มีข้อมูลสิทธิ์'}
              </Paragraph>

              {visibleLeaves.length === 0 ? (
                <Text>ยังไม่มีข้อมูลการลาในเดือนนี้</Text>
              ) : (
                <ul style={{ paddingLeft: 18, marginBottom: 0 }}>
                  {visibleLeaves.map((leave) => {
                    const userName =
                      users.find((u) => u.id === String(leave.userId))?.name ??
                      `User #${leave.userId}`;

                    return (
                      <li key={leave.id} style={{ marginBottom: 4 }}>
                        <Text strong>{userName}</Text>{' '}
                        <Text>
                          : {dayjs(leave.startDate).format('DD/MM/YYYY')} -{' '}
                          {dayjs(leave.endDate).format('DD/MM/YYYY')}{' '}
                          ({leave.type ?? 'ไม่ระบุประเภท'} /{' '}
                          {leave.status ?? 'ไม่ระบุสถานะ'})
                        </Text>
                        {leave.reason && (
                          <Text type="secondary"> – {leave.reason}</Text>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )}
        </Card>
      </Space>
    </div>
  );
}
/**
 * ✅ mock getUserList แบบง่าย ๆ ในไฟล์นี้ไปก่อน
 * ใช้ type UserList ที่ประกาศ global ใน src/types/user.d.ts
 * (ไม่ต้อง import UserList)
 */
async function getUserList(params: {
  page: number;
  limit: number;
}): Promise<UserList> {
  // mock ข้อมูลคร่าว ๆ พอให้ UI ใช้งานได้
  const mock: UserList = {
    data: [
      {
        id: 1,
        uid: 'mock-1',
        nontriAccount: 'mock.nontri1',
        name: 'วรัญญา',
        surname: 'อรรถเสนา',
        kuMail: 'mock1@ku.th',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      {
        id: 2,
        uid: 'mock-2',
        nontriAccount: 'mock.nontri2',
        name: 'สมชาย',
        surname: 'ใจดี',
        kuMail: 'mock2@ku.th',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      {
        id: 3,
        uid: 'mock-3',
        nontriAccount: 'mock.nontri3',
        name: 'สมหญิง',
        surname: 'แสนดี',
        kuMail: 'mock3@ku.th',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      {
        id: 4,
        uid: 'mock-4',
        nontriAccount: 'mock.nontri4',
        name: 'จิรภัทร',
        surname: 'วงศ์ทอง',
        kuMail: 'mock4@ku.th',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    ],
    page: 1,
    totalPage: 1,
    limit: params.limit,
    totalCount: 4,
  };

  return mock;
}


/**
 * ✅ mock รายการการลาแบบง่าย ๆ สำหรับ user 1–4
 * - id: string
 * - userId: string  👉 ให้ตรงกับ LeaveItem.userId ใน calendar.ts
 */
const leaveCalendarMock: LeaveItemWithReason[] = [
  {
    id: '1',
    userId: '1',
    startDate: '2025-11-03',
    endDate: '2025-11-05',
    type: 'vacation',
    status: 'approved',
    reason: 'ไปต่างจังหวัด',
  },
  {
    id: '2',
    userId: '2',
    startDate: '2025-11-07',
    endDate: '2025-11-07',
    type: 'sick',
    status: 'approved',
    reason: 'เป็นไข้',
  },
  {
    id: '3',
    userId: '3',
    startDate: '2025-11-10',
    endDate: '2025-11-12',
    type: 'personal',
    status: 'pending',
    reason: 'ธุระส่วนตัว',
  },
  {
    id: '4',
    userId: '4',
    startDate: '2025-11-15',
    endDate: '2025-11-16',
    type: 'training',
    status: 'approved',
    reason: 'อบรมพัฒนาบุคลากร',
  },
  {
    id: '5',
    userId: '1',
    startDate: '2025-11-20',
    endDate: '2025-11-20',
    type: 'sick',
    status: 'rejected',
    reason: 'ส่งเอกสารไม่ครบ',
  },
];

/**
 * ✅ mock ฟังก์ชัน getLeavesForCalendar แทน service จริง
 * - viewerUserId = 1 → เห็น userId: '1','2','3','4'
 * - filter เฉพาะช่วงวันที่ที่ overlap กับ monthStart / monthEnd
 */
async function getLeavesForCalendar(
  viewerUserId: number,
  startDate: string,
  endDate: string,
): Promise<LeaveItemWithReason[]> {
  // ใช้ string[] ให้ตรงกับ LeaveItem.userId (string)
  const visibleUserIds: string[] =
    viewerUserId === 1
      ? ['1', '2', '3', '4']
      : [String(viewerUserId)];

  const start = dayjs(startDate);
  const end = dayjs(endDate);

  return leaveCalendarMock.filter((leave) => {
    // 1) check สิทธิ์มองเห็น user
    if (!visibleUserIds.includes(leave.userId)) return false;

    // 2) check overlap วันที่
    const s = dayjs(leave.startDate);
    const e = dayjs(leave.endDate);

    return s.isBefore(end.add(1, 'day')) && e.isAfter(start.subtract(1, 'day'));
  });
}

