'use client';

import { useEffect, useMemo, useState } from 'react';
import { Calendar, Button, Select, Avatar, Tooltip, Flex, Modal, Tag, Divider } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

import CalendarMultiSelect from '../FormElements/CalendarMultiSelect';
import { leavesMock } from '@/mock/leaves';
import { calendarSchedulesMock } from '@/mock/calendarSchedules';
import type { CalendarBoxProps, LeaveItem, UserRef, CalendarSchedule, CalendarType } from '@/types/calendar';

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

const CAL_TYPE_LABEL: Record<CalendarType, string> = {
  standard: 'ปฏิทินธรรมดา',
  academic: 'ปฏิทินปีการศึกษา',
  fiscal:   'ปฏิทินปีงบประมาณ',
};

// สีพื้นหลัง/กรอบ/ตัวอักษร แยกตามชนิดปฏิทิน
const CALENDAR_TYPE_STYLES: Record<
  CalendarType,
  { bg: string; border: string; text: string }
> = {
  standard: { bg: '#E6F7FF', border: '#91D5FF', text: '#003A8C' }, // ฟ้า
  academic: { bg: '#F9F0FF', border: '#D3ADF7', text: '#391085' }, // ม่วง
  fiscal:   { bg: '#F6FFED', border: '#B7EB8F', text: '#135200' }, // เขียว
};

// ----------------- Helpers -----------------
type BarPosition = 'single' | 'start' | 'middle' | 'end';

/** ย่อชื่อแบบไทยให้สั้น เช่น "วันเฉลิมพระชนมพรรษา …" -> "วันเฉลิม…" */
const shortLabel = (title: string) => {
  const clean = title.replace(/\s+/g, ' ').trim();
  if (clean.length <= 12) return clean;
  const firstToken = clean.split(' ')[0] || clean;
  const base = firstToken.length > 7 ? firstToken.slice(0, 7) : firstToken;
  return `${base}…`;
};

const BRIDGE_PX = 6; // ล้ำขอบซ้าย/ขวาเพื่อเชื่อมแท่งในสัปดาห์เดียวกัน
const startOfWeek = (d: Dayjs) => d.startOf('week'); // อาทิตย์-เสาร์
const endOfWeek = (d: Dayjs) => d.endOf('week');

/** intersect ช่วง s กับ week ของ date -> ได้ช่วงย่อยในสัปดาห์นั้น */
const weekSegmentOf = (date: Dayjs, s: CalendarSchedule) => {
  const wStart = startOfWeek(date);
  const wEnd = endOfWeek(date);
  const sStart = dayjs(s.startDate).startOf('day');
  const sEnd = dayjs(s.endDate).startOf('day');
  const segStart = sStart.isAfter(wStart) ? sStart : wStart;
  const segEnd = sEnd.isBefore(wEnd) ? sEnd : wEnd;
  const valid = !segEnd.isBefore(segStart, 'day');
  const len = valid ? segEnd.diff(segStart, 'day') + 1 : 0;
  return { valid, segStart, segEnd, len };
};

/** เลือก “สัปดาห์ที่มีพื้นที่มากที่สุด” ของ schedule สำหรับวาง label */
const pickLabelWeekForSchedule = (s: CalendarSchedule) => {
  const sStart = dayjs(s.startDate).startOf('day');
  const sEnd = dayjs(s.endDate).startOf('day');

  let bestWeekStart: Dayjs | null = null;
  let bestLen = -1;

  for (let w = startOfWeek(sStart); !w.isAfter(endOfWeek(sEnd), 'day'); w = w.add(1, 'week')) {
    const seg = weekSegmentOf(w, s);
    if (seg.valid && seg.len > bestLen) {
      bestLen = seg.len;
      bestWeekStart = w;
    }
  }

  if (bestWeekStart) {
    const { segStart, len } = weekSegmentOf(bestWeekStart, s);
    const midOffset = Math.floor((len - 1) / 2);
    const labelDay = segStart.add(midOffset, 'day');
    return { weekStart: bestWeekStart, labelDay };
  }
  return null;
};

/** หาตำแหน่งแถบของ s สำหรับวันที่ value */
const getBarPosition = (value: Dayjs, s: CalendarSchedule): BarPosition => {
  const sStart = dayjs(s.startDate);
  const sEnd = dayjs(s.endDate);
  if (sStart.isSame(sEnd, 'day')) return 'single';
  if (value.isSame(sStart, 'day')) return 'start';
  if (value.isSame(sEnd, 'day')) return 'end';
  return 'middle';
};
// -------------------------------------------

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

  // modal รายละเอียดประจำวัน
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailDate, setDetailDate] = useState<Dayjs | null>(null);

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

  // ===== ดึงรายการกำหนดการ/วันหยุดของวันนั้น =====
  const getSchedulesForDay = (value: Dayjs): CalendarSchedule[] => {
    return calendarSchedulesMock
      .filter((s) => selectedCalendars.includes(s.calendarType))
      .filter((s) => value.isBetween(dayjs(s.startDate), dayjs(s.endDate), null, '[]'))
      .sort((a, b) => a.id.localeCompare(b.id));
  };

  // ===== ดึงรายการลา (approved) ของวันนั้น (ตาม visibility) =====
  const getLeavesForDay = (value: Dayjs): LeaveItem[] => {
    return leavesMock.filter((l) =>
      value.isBetween(dayjs(l.startDate), dayjs(l.endDate), null, '[]') &&
      l.status === 'approved' &&
      (visibleUserIds.length ? visibleUserIds.includes(l.userId) : true),
    );
  };

  // ===== เปิด modal เมื่อคลิกวัน =====
  const openDetail = (date: Dayjs) => {
    setDetailDate(date.startOf('day'));
    setDetailOpen(true);
  };

  // ===== แถวกลาง: แสดงโปรไฟล์คนลา (จำกัด 1 + bubble นับยอดที่เหลือ) =====
  const renderLeaveRow = (value: Dayjs) => {
    if (!showApprovedLeaves) return null;
    const leaves = getLeavesForDay(value);
    if (!leaves.length) return null;

    const first = leaves[0];
    const others = leaves.length - 1;

    const getInitials = (name: string) =>
      name.split(' ').map((n) => n[0]).join('').toUpperCase();

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          height: 24,           // ความสูงคงที่เพื่อไม่ให้ชนกับกำหนดการ
          overflow: 'hidden',
        }}
      >
        <Tooltip title={`${userMap.get(first.userId) ?? 'User'} (${first.type})`}>
          <Avatar size={20}>{getInitials(userMap.get(first.userId) ?? 'U')}</Avatar>
        </Tooltip>

        {others > 0 && (
          <div
            title={`+${others} more`}
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: '#f0f0f0',
              color: '#595959',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            +{others}
          </div>
        )}
      </div>
    );
  };

  // ===== แถวล่าง: แถบกำหนดการ (ช่วงต่อเนื่อง + label กลางสัปดาห์ที่ยาวที่สุด) =====
  const renderScheduleBars = (value: Dayjs) => {
    const schedules = getSchedulesForDay(value);
    const maxBars = 3;

    return (
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        {schedules.slice(0, maxBars).map((s) => {
          const style = CALENDAR_TYPE_STYLES[s.calendarType];
          const pos = getBarPosition(value, s);

          const best = pickLabelWeekForSchedule(s);
          const showLabel =
            !!best &&
            startOfWeek(value).isSame(best.weekStart, 'day') &&
            value.isSame(best.labelDay, 'day');

          const radius: string | number =
            pos === 'single' ? 6 :
            pos === 'start'  ? '6px 0 0 6px' :
            pos === 'end'    ? '0 6px 6px 0' : '0';

          // เชื่อมแท่งด้วย negative margins
          const bridgeStyle: React.CSSProperties = { width: '100%' };
          if (pos === 'start') {
            bridgeStyle.marginRight = -BRIDGE_PX;
            bridgeStyle.width = `calc(100% + ${BRIDGE_PX}px)`;
          } else if (pos === 'middle') {
            bridgeStyle.marginLeft = -BRIDGE_PX;
            bridgeStyle.marginRight = -BRIDGE_PX;
            bridgeStyle.width = `calc(100% + ${BRIDGE_PX * 2}px)`;
          } else if (pos === 'end') {
            bridgeStyle.marginLeft = -BRIDGE_PX;
            bridgeStyle.width = `calc(100% + ${BRIDGE_PX}px)`;
          }

          return (
            <li key={`${s.id}-${value.format('YYYYMMDD')}`}>
              <div
                title={s.title}
                style={{
                  background: style.bg,
                  border: `1px solid ${style.border}`,
                  color: style.text,
                  borderRadius: radius,
                  padding: '2px 6px',
                  fontSize: 12,
                  lineHeight: 1.25,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  textAlign: showLabel ? 'center' : 'left',
                  boxSizing: 'border-box',
                  ...bridgeStyle,
                }}
              >
                {pos === 'single' ? shortLabel(s.title) : (showLabel ? shortLabel(s.title) : '\u00A0')}
              </div>
            </li>
          );
        })}
        {schedules.length > maxBars && (
          <li style={{ fontSize: 12, color: '#8c8c8c' }}>+{schedules.length - maxBars} more</li>
        )}
      </ul>
    );
  };

  // ===== เรนเดอร์ cell รายวัน: แถวกลาง (leave) + แถวล่าง (schedule) =====
  const dateCellRender = (value: Dayjs) => {
    return (
      <div onClick={() => openDetail(value)} style={{ cursor: 'pointer' }}>
        {/* แถวกลาง: โปรไฟล์คนลา (จำกัด 1 + bubble นับยอด) */}
        {renderLeaveRow(value)}

        {/* แถวล่าง: แถบกำหนดการ */}
        {renderScheduleBars(value)}
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
              onSelect={(d) => openDetail(d)}
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
        const label = CAL_TYPE_LABEL[t];
        return (
          <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'inline-block', width: 12, height: 12, background: st.bg, border: `1px solid ${st.border}`, borderRadius: 3 }} />
            <span style={{ fontSize: 12 }}>{label}</span>
          </div>
        );
      })}
    </div>
  );

  // ===== ข้อมูลใน Modal รายละเอียด =====
  const detailSchedules = useMemo(() => {
    if (!detailDate) return [];
    return getSchedulesForDay(detailDate);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailDate, selectedCalendars]);

  const detailLeaves = useMemo(() => {
    if (!detailDate) return [];
    return getLeavesForDay(detailDate!);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailDate, visibleUserIds]);

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
          onSelect={(d) => openDetail(d)}
          fullscreen={false}
          cellRender={dateCellRender}
        />
      ) : (
        renderQuarterView()
      )}

      {/* Modal รายละเอียดของวัน */}
      <Modal
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        title={detailDate ? detailDate.format('dddd, DD MMM YYYY') : 'รายละเอียด'}
      >
        {/* กำหนดการ/วันหยุด */}
        <div style={{ marginBottom: 8, fontWeight: 600 }}>กำหนดการ/วันหยุด</div>
        {detailSchedules.length ? (
          <ul style={{ paddingLeft: 16, marginTop: 0 }}>
            {detailSchedules.map((s) => {
              const st = CALENDAR_TYPE_STYLES[s.calendarType];
              const range =
                s.startDate === s.endDate
                  ? dayjs(s.startDate).format('DD MMM YYYY')
                  : `${dayjs(s.startDate).format('DD MMM')} – ${dayjs(s.endDate).format('DD MMM YYYY')}`;
              return (
                <li key={s.id} style={{ marginBottom: 6 }}>
                  <Tag style={{ background: st.bg, borderColor: st.border, color: st.text }}>
                    {CAL_TYPE_LABEL[s.calendarType]}
                  </Tag>{' '}
                  <span style={{ fontWeight: 600 }}>{s.title}</span>
                  <div style={{ fontSize: 12, color: '#666' }}>{range}</div>
                  {s.description ? <div style={{ fontSize: 12, color: '#666' }}>{s.description}</div> : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <div style={{ color: '#999' }}>ไม่มีรายการ</div>
        )}

        <Divider style={{ margin: '12px 0' }} />

        {/* วันลาที่อนุมัติ */}
        <div style={{ marginBottom: 8, fontWeight: 600 }}>
          วันลา (อนุมัติแล้ว): {detailLeaves.length} คน
        </div>
        {detailLeaves.length ? (
          <ul style={{ paddingLeft: 16, marginTop: 0 }}>
            {detailLeaves.map((l) => (
              <li key={l.id} style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar size={24}>
                  {(userMap.get(l.userId) ?? 'U').split(' ').map((n) => n[0]).join('').toUpperCase()}
                </Avatar>
                <div>
                  {userMap.get(l.userId) ?? l.userId} <span style={{ color: '#999' }}>({l.type})</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div style={{ color: '#999' }}>ไม่มีคนลาในวันนี้</div>
        )}
      </Modal>
    </div>
  );
}
