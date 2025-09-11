'use client';

import { useEffect, useMemo, useState } from 'react';
import { Calendar, Button, Select, Avatar, Tooltip, Flex } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

import CalendarMultiSelect from '../FormElements/CalendarMultiSelect';
import { leavesMock } from '@/mock/leaves';
import { calendarSchedulesMock } from '@/mock/calendarSchedules';
import type { CalendarBoxProps, LeaveItem, UserRef, CalendarSchedule } from '@/types/calendar';

dayjs.extend(isBetween);

// mock users (ต่อ API ภายหลัง)
const users: UserRef[] = [
  { id: '1', name: 'John Doe' },
  { id: '2', name: 'Jane Smith' },
  { id: '3', name: 'Alice Johnson' },
  { id: '4', name: 'Bob Brown' },
  { id: '5', name: 'Charlie Davis' },
  { id: '6', name: 'Diana Evans' },
  { id: '7', name: 'Frank Green' },
  { id: '8', name: 'Grace Harris' },
  { id: '9', name: 'Hank Irving' },
  { id: '10', name: 'Ivy Jackson' },
];

const monthsShort = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// สีพื้นหลัง/กรอบ/ตัวอักษร แยกตามชนิดปฏิทิน
const CALENDAR_TYPE_STYLES: Record<
  'standard' | 'academic' | 'fiscal',
  { bg: string; border: string; text: string }
> = {
  standard: { bg: '#E6F7FF', border: '#91D5FF', text: '#003A8C' }, // ฟ้า
  academic: { bg: '#F9F0FF', border: '#D3ADF7', text: '#391085' }, // ม่วง
  fiscal:   { bg: '#F6FFED', border: '#B7EB8F', text: '#135200' }, // เขียวอ่อน
};

/** Header เฉพาะช่องแรกในโหมด 4 เดือน */
function QuarterHeader({
  isMaster,
  baseDate,
  setBaseDate,
  displayDate,
}: {
  isMaster: boolean;
  baseDate: Dayjs;
  setBaseDate: (d: Dayjs) => void;
  displayDate: Dayjs;
}) {
  const center = baseDate.year();
  const years = Array.from({ length: 9 }, (_, i) => center - 4 + i);
  const onChangeYear = (y: number) => setBaseDate(baseDate.year(y));
  const onChangeMonth = (m: number) => setBaseDate(baseDate.month(m));

  return (
    <Flex gap={8} align="center" style={{ padding: '4px 8px' }}>
      {isMaster ? (
        <>
          <Select size="small" style={{ width: 90 }} value={baseDate.year()}
                  onChange={onChangeYear}
                  options={years.map((y) => ({ label: y, value: y }))} />
          <Select size="small" style={{ width: 90 }} value={baseDate.month()}
                  onChange={onChangeMonth}
                  options={monthsShort.map((m, idx) => ({ label: m, value: idx }))} />
          <Button size="small" onClick={() => setBaseDate(dayjs())}>Today</Button>
        </>
      ) : (
        <>
          <Select size="small" style={{ width: 90 }} value={displayDate.year()} disabled
                  options={[{ label: displayDate.year(), value: displayDate.year() }]} />
          <Select size="small" style={{ width: 90 }} value={displayDate.month()} disabled
                  options={[{ label: monthsShort[displayDate.month()], value: displayDate.month() }]} />
        </>
      )}
    </Flex>
  );
}

export default function CalendarBox({ viewMode }: CalendarBoxProps) {
  const [selectedCalendars, setSelectedCalendars] = useState<string[]>(['standard', 'academic', 'fiscal']);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [showApprovedLeaves, setShowApprovedLeaves] = useState(true);

  const userMap = useMemo(() => new Map(users.map((u) => [u.id, u.name])), []);

  const getFiscalYear = (date: Dayjs) => {
    const year = date.year();
    const month = date.month(); // 0-11 (กันยายน = 8)
    const fiscalYearStartMonth = 8;
    const fiscalYear = month >= fiscalYearStartMonth ? year + 1 : year;
    const fiscalMonth = month >= fiscalYearStartMonth ? month - fiscalYearStartMonth + 1 : month + 4;
    return `ปีงบประมาณที่ ${fiscalYear + 543} เดือนที่ ${fiscalMonth}`;
  };

  // ===== การตั้งค่าการมองเห็นผู้ใช้ (จากหน้า leave-visibility) =====
  const STORAGE_KEY = 'leaveVisibilitySelectedUserIds';
  const [visibleUserIds, setVisibleUserIds] = useState<string[]>([]);
  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setVisibleUserIds(parsed.map(String));
      } catch {}
    }
  }, []);

  // ===== ดึงรายการกำหนดการ/วันหยุดจาก calendarSchedulesMock ตามชนิดปฏิทิน =====
  const getSchedulesForDay = (value: Dayjs): CalendarSchedule[] => {
    return calendarSchedulesMock.filter((s) => {
      if (!selectedCalendars.includes(s.calendarType)) return false;
      const start = dayjs(s.startDate);
      const end = dayjs(s.endDate);
      return value.isBetween(start, end, null, '[]');
    });
  };

  // ===== เรนเดอร์ Avatar วันลา (approved) =====
  const renderApprovedLeaves = (value: Dayjs) => {
    if (!showApprovedLeaves) return null;

    const leaves = leavesMock.filter((l: LeaveItem) => {
      const inRange = value.isBetween(dayjs(l.startDate), dayjs(l.endDate), null, '[]');
      const isApproved = l.status === 'approved';
      const passVisibility = visibleUserIds.length ? visibleUserIds.includes(l.userId) : true;
      return inRange && isApproved && passVisibility;
    });
    if (!leaves.length) return null;

    const getInitials = (name: string) =>
      name.split(' ').map((n) => n[0]).join('').toUpperCase();

    return (
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
        {leaves.map((l) => (
          <Tooltip key={l.id} title={`${userMap.get(l.userId) ?? 'User'} (${l.type})`}>
            <Avatar size={20}>{getInitials(userMap.get(l.userId) ?? 'U')}</Avatar>
          </Tooltip>
        ))}
      </div>
    );
  };

  // ===== เรนเดอร์ cell รายวัน =====
  const dateCellRender = (value: Dayjs) => {
    const schedules = getSchedulesForDay(value);

    return (
      <div>
        {/* กำหนดการ/วันหยุดด้วยพื้นหลังตามชนิดปฏิทิน */}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {schedules.slice(0, 3).map((s) => {
            const style = CALENDAR_TYPE_STYLES[s.calendarType as 'standard'|'academic'|'fiscal'];
            return (
              <li key={`${s.id}-${value.format('YYYYMMDD')}`}>
                <div style={{
                  background: style.bg,
                  border: `1px solid ${style.border}`,
                  color: style.text,
                  borderRadius: 6,
                  padding: '2px 6px',
                  fontSize: 12,
                  lineHeight: 1.25,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {s.title}
                </div>
              </li>
            );
          })}
          {schedules.length > 3 && (
            <li style={{ fontSize: 12, color: '#8c8c8c' }}>+{schedules.length - 3} more</li>
          )}
        </ul>

        {/* Avatar วันลา (approved) ตามการตั้งค่าการมองเห็น */}
        {renderApprovedLeaves(value)}
      </div>
    );
  };

  /** มุมมอง 4 เดือน */
  const renderQuarterView = () => {
    const base = selectedDate.startOf('month');
    const months = Array.from({ length: 4 }, (_, i) => base.add(i, 'month'));
    return (
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
        {months.map((m, idx) => (
          <div key={m.format('YYYY-MM')} style={{ border: '1px solid #eee', borderRadius: 8, background: '#fff' }}>
            <Calendar
              value={m}
              fullscreen={false}
              headerRender={() => (
                <QuarterHeader
                  isMaster={idx === 0}
                  baseDate={selectedDate}
                  setBaseDate={setSelectedDate}
                  displayDate={m}
                />
              )}
              cellRender={dateCellRender}
            />
          </div>
        ))}
      </div>
    );
  };

  // ===== Legend สีของชนิดปฏิทิน (เล็ก ๆ) =====
  const Legend = () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      {(['standard','academic','fiscal'] as const).map((t) => {
        const st = CALENDAR_TYPE_STYLES[t];
        const label = t === 'standard' ? 'ธรรมดา' : t === 'academic' ? 'ปีการศึกษา' : 'ปีงบประมาณ';
        return (
          <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'inline-block', width: 12, height: 12, background: st.bg, border: `1px solid ${st.border}`, borderRadius: 3 }} />
            <span style={{ fontSize: 12 }}>{label}</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="w-full max-w-full rounded-[10px] bg-white shadow-1">
      {/* Header */}
      <Flex align="center" justify="space-between" style={{ marginBottom: 12, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ fontWeight: 700 }}>{getFiscalYear(selectedDate)}</div>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <CalendarMultiSelect value={selectedCalendars} onChange={setSelectedCalendars} />
        </div>

        <Flex gap={8}>
          <Button
            icon={showApprovedLeaves ? <EyeOutlined /> : <EyeInvisibleOutlined />}
            onClick={() => setShowApprovedLeaves((s) => !s)}
          />
        </Flex>
      </Flex>

      {/* Legend */}
      <div style={{ marginBottom: 8 }}>
        <Legend />
      </div>

      {/* Render calendar */}
      {viewMode === 'month' ? (
        <Calendar
          value={selectedDate}
          onChange={(d) => setSelectedDate(d)}
          fullscreen={false}
          cellRender={dateCellRender}
        />
      ) : (
        renderQuarterView()
      )}
    </div>
  );
}
