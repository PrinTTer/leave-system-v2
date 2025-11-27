'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { Calendar, Button, Avatar, Tooltip, Flex, Modal, Tag, Divider } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

import CalendarMultiSelect from '../FormElements/CalendarMultiSelect';
import type { LeaveItem, CalendarSchedule, CalendarType } from '@/types/calendar';

dayjs.extend(isBetween);

type CalendarBoxProps = {
  viewMode: 'month' | 'quarter';
  schedules: CalendarSchedule[];
};

const CAL_TYPE_LABEL: Record<CalendarType, string> = {
  holiday: 'ปฏิทินวันหยุดราชการ',
  academic: 'ปฏิทินการศึกษา',
  fiscal: 'ปฏิทินปีงบประมาณ',
};

const CALENDAR_TYPE_STYLES: Record<
  CalendarType,
  { bg: string; border: string; text: string }
> = {
  holiday: { bg: '#E6F7FF', border: '#91D5FF', text: '#003A8C' },
  academic: { bg: '#F9F0FF', border: '#D3ADF7', text: '#391085' },
  fiscal: { bg: '#F6FFED', border: '#B7EB8F', text: '#135200' },
};

type BarPosition = 'single' | 'start' | 'middle' | 'end';

const shortLabel = (title: string) => {
  const clean = title.replace(/\s+/g, ' ').trim();
  if (clean.length <= 12) return clean;
  const firstToken = clean.split(' ')[0] || clean;
  const base = firstToken.length > 7 ? firstToken.slice(0, 7) : firstToken;
  return `${base}…`;
};

const BRIDGE_PX = 8;
const startOfWeek = (d: Dayjs) => d.startOf('week');
const endOfWeek = (d: Dayjs) => d.endOf('week');

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

const pickLabelWeekForSchedule = (s: CalendarSchedule) => {
  const sStart = dayjs(s.startDate).startOf('day');
  const sEnd = dayjs(s.endDate).startOf('day');
  let bestWeekStart: Dayjs | null = null;
  let bestLen = -1;
  for (
    let w = startOfWeek(sStart);
    !w.isAfter(endOfWeek(sEnd), 'day');
    w = w.add(1, 'week')
  ) {
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

const getBarPosition = (value: Dayjs, s: CalendarSchedule): BarPosition => {
  const day = value.startOf('day');
  const sStart = dayjs(s.startDate).startOf('day');
  const sEnd = dayjs(s.endDate).startOf('day');

  if (sStart.isSame(sEnd, 'day')) return 'single';
  if (day.isSame(sStart, 'day')) return 'start';
  if (day.isSame(sEnd, 'day')) return 'end';
  return 'middle';
};

// ---------- extra type & mocks ----------
type LeaveItemWithReason = LeaveItem & {
  reason?: string;
};

/**
 * ✅ mock getUserList แบบง่าย ๆ ในไฟล์นี้ไปก่อน
 * ใช้ type UserList ที่ประกาศ global ใน src/types/user.d.ts
 * (ไม่ต้อง import UserList)
 */
async function getUserList(params: {
  page: number;
  limit: number;
}): Promise<UserList> {
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
  const visibleUserIds: string[] =
    viewerUserId === 1 ? ['1', '2', '3', '4'] : [String(viewerUserId)];

  const start = dayjs(startDate);
  const end = dayjs(endDate);

  return leaveCalendarMock.filter((leave) => {
    if (!visibleUserIds.includes(leave.userId)) return false;

    const s = dayjs(leave.startDate);
    const e = dayjs(leave.endDate);

    return s.isBefore(end.add(1, 'day')) && e.isAfter(start.subtract(1, 'day'));
  });
}

// -------------------------------------------

export default function CalendarBox({ viewMode, schedules }: CalendarBoxProps) {
  const [selectedCalendars, setSelectedCalendars] = useState<string[]>([
    'holiday',
    'academic',
    'fiscal',
  ]);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [showApprovedLeaves, setShowApprovedLeaves] = useState(true);

  // modal รายละเอียดประจำวัน
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailDate, setDetailDate] = useState<Dayjs | null>(null);

  // map userId → ชื่อ (จาก mock getUserList)
  const [userMap, setUserMap] = useState<Map<string, string>>(
    () => new Map<string, string>(),
  );

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await getUserList({ page: 1, limit: 100 });
        const map = new Map<string, string>();
        res.data.forEach((u) => {
          map.set(String(u.id), `${u.name} ${u.surname}`);
        });
        setUserMap(map);
      } catch (e) {
        console.error('load users error', e);
      }
    };
    loadUsers();
  }, []);

  const getFiscalYear = (date: Dayjs) => {
    const year = date.year();
    const month = date.month();
    const fiscalYearStartMonth = 8;
    const fiscalYear = month >= fiscalYearStartMonth ? year + 1 : year;
    const fiscalMonth =
      month >= fiscalYearStartMonth ? month - fiscalYearStartMonth + 1 : month + 4;
    return `ปีงบประมาณที่ ${fiscalYear + 543} เดือนที่ ${fiscalMonth}`;
  };

  // state การลา ที่ดึงมาจาก getLeavesForCalendar
  const [leaves, setLeaves] = useState<LeaveItem[]>([]);
  const [, setLoadingLeaves] = useState(false); // ถ้าอยากใช้ spinner เพิ่มได้ภายหลัง

  useEffect(() => {
    // ตอนนี้ fix viewerUserId = 1 ไปก่อน (แทน usermock)
    const viewerUserId = 1;

    const loadLeaves = async () => {
      try {
        setLoadingLeaves(true);

        let rangeStart: Dayjs;
        let rangeEnd: Dayjs;

        if (viewMode === 'month') {
          rangeStart = selectedDate.startOf('month');
          rangeEnd = selectedDate.endOf('month');
        } else {
          const base = selectedDate.startOf('month');
          rangeStart = base;
          rangeEnd = base.add(3, 'month').endOf('month');
        }

        const data = await getLeavesForCalendar(
          viewerUserId,
          rangeStart.format('YYYY-MM-DD'),
          rangeEnd.format('YYYY-MM-DD'),
        );

        setLeaves(data as LeaveItem[]);
      } catch (e) {
        console.error('load leaves error', e);
      } finally {
        setLoadingLeaves(false);
      }
    };

    loadLeaves();
  }, [selectedDate, viewMode]);

  // ====== ดึง schedules สำหรับแต่ละวันจาก props.schedules ======
  const getSchedulesForDay = useCallback(
    (value: Dayjs): CalendarSchedule[] => {
      const orderType: Record<CalendarType, number> = {
        academic: 0,
        holiday: 1,
        fiscal: 2,
      };

      const day = value.startOf('day');

      return schedules
        .filter((s) => selectedCalendars.includes(s.calendarType))
        .filter((s) =>
          day.isBetween(
            dayjs(s.startDate).startOf('day'),
            dayjs(s.endDate).startOf('day'),
            'day',
            '[]',
          ),
        )
        .sort((a, b) => {
          const lenA = dayjs(a.endDate).diff(dayjs(a.startDate), 'day');
          const lenB = dayjs(b.endDate).diff(dayjs(b.startDate), 'day');
          if (lenA !== lenB) return lenB - lenA; // ช่วงยาวมาก่อน
          if (orderType[a.calendarType] !== orderType[b.calendarType]) {
            return orderType[a.calendarType] - orderType[b.calendarType];
          }
          return a.id.localeCompare(b.id);
        });
    },
    [schedules, selectedCalendars],
  );

  // ใช้ leaves จาก state ที่มาจาก getLeavesForCalendar
  const getLeavesForDay = useCallback(
    (value: Dayjs): LeaveItem[] =>
      leaves.filter(
        (l) =>
          value.isBetween(
            dayjs(l.startDate),
            dayjs(l.endDate),
            null,
            '[]',
          ) && l.status === 'approved',
      ),
    [leaves],
  );

  const openDetail = useCallback((date: Dayjs) => {
    setDetailDate(date.startOf('day'));
    setDetailOpen(true);
  }, []);

  // ===== แถวกลาง: โปรไฟล์ลา =====
  const renderLeaveRow = useCallback(
    (value: Dayjs) => {
      if (!showApprovedLeaves) return <div className="tt-leave-row" />;

      const leaves = getLeavesForDay(value);
      if (!leaves.length) return <div className="tt-leave-row" />;

      const first = leaves[0];
      const others = leaves.length - 1;
      const getInitials = (name: string) =>
        name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase();

      const name = userMap.get(first.userId) ?? `User ${first.userId}`;

      return (
        <div className="tt-leave-row">
          <Tooltip title={`${name} (${first.type})`}>
            <Avatar size={20}>{getInitials(name)}</Avatar>
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
    },
    [showApprovedLeaves, getLeavesForDay, userMap],
  );

  // ===== แถวล่าง: แถบกำหนดการ =====
  const renderScheduleBars = useCallback(
    (value: Dayjs) => {
      const schedulesForDay = getSchedulesForDay(value);
      const maxBars = 3;
      const overflowCount = Math.max(0, schedulesForDay.length - maxBars);

      return (
        <ul className="tt-sched-list">
          {schedulesForDay.slice(0, maxBars).map((s, idx, arr) => {
            const style = CALENDAR_TYPE_STYLES[s.calendarType];
            const pos = getBarPosition(value, s);
            const isLastRow = idx === arr.length - 1;

            const isSingleDay = dayjs(s.startDate).isSame(dayjs(s.endDate), 'day');

            if (isSingleDay) {
              return (
                <li
                  key={`${s.id}-${value.format('YYYYMMDD')}`}
                  className="tt-sched-item"
                >
                  <div
                    className="tt-bar"
                    title={s.title}
                    style={{
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
                      textAlign: 'center',
                      boxSizing: 'border-box',
                      height: '100%',
                    }}
                  >
                    {shortLabel(s.title)}
                    {isLastRow && overflowCount > 0 && (
                      <span className="tt-more">+{overflowCount}</span>
                    )}
                  </div>
                </li>
              );
            }

            const best = pickLabelWeekForSchedule(s);
            const showLabel =
              !!best &&
              startOfWeek(value).isSame(best.weekStart, 'day') &&
              value.isSame(best.labelDay, 'day');

            const radius: string | number =
              pos === 'single'
                ? 6
                : pos === 'start'
                ? '6px 0 0 6px'
                : pos === 'end'
                ? '0 6px 6px 0'
                : '0';

            const bridgeStyle: CSSProperties = {
              width: '100%',
              height: '100%',
            };
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
              <li
                key={`${s.id}-${value.format('YYYYMMDD')}`}
                className="tt-sched-item"
              >
                <div
                  className="tt-bar"
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
                    position: 'relative',
                    ...bridgeStyle,
                  }}
                >
                  {showLabel ? shortLabel(s.title) : '\u00A0'}
                  {isLastRow && overflowCount > 0 && (
                    <span className="tt-more">+{overflowCount}</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      );
    },
    [getSchedulesForDay],
  );

  /** มุมมอง 4 เดือน (current + next 3) */
  const renderQuarterView = () => {
    const base = selectedDate.startOf('month');
    const months = Array.from({ length: 4 }, (_, i) => base.add(i, 'month'));

    const ReadonlyHeader = ({ label }: { label: string }) => (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6px 8px',
          fontWeight: 600,
        }}
      >
        {label}
      </div>
    );

    return (
      <div
        className="ttleave-cal"
        style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}
      >
        {months.map((m, idx) => (
          <div
            key={m.format('YYYY-MM')}
            style={{
              border: '1px solid #eee',
              borderRadius: 8,
              background: '#fff',
            }}
          >
            <Calendar
              value={m}
              fullscreen={false}
              headerRender={
                idx === 0 ? undefined : () => (
                  <ReadonlyHeader label={m.format('MMMM YYYY')} />
                )
              }
              onPanelChange={(val) => {
                if (idx === 0) {
                  setSelectedDate(val.startOf('month'));
                }
              }}
              fullCellRender={(current, info) => {
                if (info.type !== 'date') return info.originNode;
                return (
                  <div className="tt-cell" onClick={() => openDetail(current)}>
                    <div className="tt-day">{current.date()}</div>
                    {renderLeaveRow(current)}
                    {renderScheduleBars(current)}
                  </div>
                );
              }}
              onSelect={(d) => openDetail(d)}
            />
          </div>
        ))}
      </div>
    );
  };

  // ===== Legend =====
  const Legend = () => (
    <div
      style={{
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      {(['holiday', 'academic', 'fiscal'] as const).map((t) => {
        const st = CALENDAR_TYPE_STYLES[t];
        const label = CAL_TYPE_LABEL[t];
        return (
          <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                display: 'inline-block',
                width: 12,
                height: 12,
                background: st.bg,
                border: `1px solid ${st.border}`,
                borderRadius: 3,
              }}
            />
            <span style={{ fontSize: 12 }}>{label}</span>
          </div>
        );
      })}
    </div>
  );

  const detailSchedules = useMemo(() => {
    if (!detailDate) return [];
    return getSchedulesForDay(detailDate);
  }, [detailDate, getSchedulesForDay]);

  const detailLeaves = useMemo(() => {
    if (!detailDate) return [];
    return getLeavesForDay(detailDate);
  }, [detailDate, getLeavesForDay]);

  return (
    <div className="w-full max-w-full rounded-[10px] bg-white shadow-1">
      {/* Header */}
      <Flex
        align="center"
        justify="space-between"
        style={{ marginBottom: 12, gap: 12, flexWrap: 'wrap' }}
      >
        <div style={{ fontWeight: 700 }}>{getFiscalYear(selectedDate)}</div>

        <div
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <CalendarMultiSelect
            value={selectedCalendars}
            onChange={setSelectedCalendars}
          />
        </div>

        <Flex gap={8}>
          <Button
            icon={
              showApprovedLeaves ? <EyeOutlined /> : <EyeInvisibleOutlined />
            }
            onClick={() => setShowApprovedLeaves((s) => !s)}
          />
        </Flex>
      </Flex>

      {/* Legend */}
      <div style={{ marginBottom: 8 }}>
        <Legend />
      </div>

      {/* Calendar */}
      {viewMode === 'month' ? (
        <div className="ttleave-cal">
          <Calendar
            key={`month-${selectedCalendars.sort().join('|')}-${
              showApprovedLeaves ? '1' : '0'
            }`}
            value={selectedDate}
            onChange={(d) => setSelectedDate(d)}
            onSelect={(d) => openDetail(d)}
            fullscreen={false}
            fullCellRender={(current, info) => {
              if (info.type !== 'date') return info.originNode;
              return (
                <div className="tt-cell" onDoubleClick={() => openDetail(current)}>
                  <div className="tt-day">{current.date()}</div>
                  {renderLeaveRow(current)}
                  {renderScheduleBars(current)}
                </div>
              );
            }}
          />
        </div>
      ) : (
        renderQuarterView()
      )}

      {/* Modal รายละเอียดของวัน */}
      <Modal
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        title={
          detailDate
            ? detailDate.format('dddd, DD MMM YYYY')
            : 'รายละเอียด'
        }
      >
        {/* กำหนดการ/วันหยุด */}
        <div style={{ marginBottom: 8, fontWeight: 600 }}>
          กำหนดการ/วันหยุด
        </div>
        {detailSchedules.length ? (
          <ul style={{ paddingLeft: 16, marginTop: 0 }}>
            {detailSchedules.map((s) => {
              const st = CALENDAR_TYPE_STYLES[s.calendarType];
              const range =
                s.startDate === s.endDate
                  ? dayjs(s.startDate).format('DD MMM YYYY')
                  : `${dayjs(s.startDate).format(
                      'DD MMM',
                    )} – ${dayjs(s.endDate).format('DD MMM YYYY')}`;
              return (
                <li key={s.id} style={{ marginBottom: 6 }}>
                  <Tag
                    style={{
                      background: st.bg,
                      borderColor: st.border,
                      color: st.text,
                    }}
                  >
                    {CAL_TYPE_LABEL[s.calendarType]}
                  </Tag>{' '}
                  <span style={{ fontWeight: 600 }}>{s.title}</span>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    {range}
                  </div>
                  {s.description ? (
                    <div style={{ fontSize: 12, color: '#666' }}>
                      {s.description}
                    </div>
                  ) : null}
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
            {detailLeaves.map((l) => {
              const name = userMap.get(l.userId) ?? `User ${l.userId}`;
              const initials = name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase();
              return (
                <li
                  key={l.id}
                  style={{
                    marginBottom: 6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Avatar size={24}>{initials}</Avatar>
                  <div>
                    {name}{' '}
                    <span style={{ color: '#999' }}>({l.type})</span>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div style={{ color: '#999' }}>ไม่มีคนลาในวันนี้</div>
        )}
      </Modal>

      {/* ---- Global styles ---- */}
      <style jsx global>{`
        .ttleave-cal {
          --cell-pad-y: 8px;
          --daynum-h: 22px;
          --leave-row-h: 26px;
          --sched-row-h: 24px;
          --row-gap: 4px;
          --sched-rows: 3;

          --sched-rows-h: calc(
            var(--sched-rows) * var(--sched-row-h) +
              (var(--sched-rows) - 1) * var(--row-gap)
          );
          --cell-h: calc(
            var(--cell-pad-y) * 2 + var(--daynum-h) + var(--leave-row-h) +
              var(--sched-rows-h)
          );
        }

        .ttleave-cal .tt-cell {
          height: var(--cell-h);
          padding: var(--cell-pad-y) 0;
          display: grid;
          grid-template-rows: var(--daynum-h) var(--leave-row-h)
            var(--sched-rows-h);
          box-sizing: border-box;
          position: relative;
          overflow-y: hidden;
          overflow-x: visible;
        }

        .ttleave-cal .tt-day {
          height: var(--daynum-h);
          line-height: var(--daynum-h);
          font-weight: 600;
          text-align: left;
          padding: 0 8px;
        }

        .ttleave-cal .tt-leave-row {
          height: var(--leave-row-h);
          display: flex;
          align-items: center;
          gap: 6px;
          overflow: hidden;
          padding: 0 8px;
        }

        .ttleave-cal .tt-sched-list {
          height: var(--sched-rows-h);
          display: flex;
          flex-direction: column;
          gap: var(--row-gap);
          margin: 0;
          padding: 0;
          list-style: none;
          overflow: hidden;
        }

        .ttleave-cal .tt-sched-item {
          height: var(--sched-row-h);
          display: block;
        }

        .ttleave-cal .tt-bar {
          height: 100%;
          display: block;
        }

        .ttleave-cal .tt-more {
          position: absolute;
          right: 4px;
          top: 2px;
          font-size: 11px;
          color: #8c8c8c;
          pointer-events: none;
        }

        .ttleave-cal .ant-picker-cell-inner {
          padding: 0 !important;
        }
      `}</style>
    </div>
  );
}
