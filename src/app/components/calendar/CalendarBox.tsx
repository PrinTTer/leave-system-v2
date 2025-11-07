'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Calendar, Button, Avatar, Tooltip, Flex, Modal, Tag, Divider } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

import CalendarMultiSelect from '../FormElements/CalendarMultiSelect';
import { leavesMock } from '@/mock/leaves';
import { calendarSchedulesMock } from '@/mock/calendarSchedules';
import type { CalendarBoxProps, LeaveItem, UserRef, CalendarSchedule, CalendarType } from '@/types/calendar';

dayjs.extend(isBetween);

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
  { id: '10', name: 'Axl Rose' },
  { id: '11', name: 'Jack King' },
  { id: '12', name: 'Kathy Lee' },
  { id: '13', name: 'Larry Moore' },
  { id: '14', name: 'Mona Nelson' },
  { id: '15', name: 'Nina Owens' },
  { id: '16', name: 'Oscar Perez' },
  { id: '17', name: 'Paula Quinn' },
  { id: '18', name: 'Quincy Roberts' },
  { id: '19', name: 'Rachel Scott' },
  { id: '20', name: 'Steve Turner' },
  { id: '21', name: 'Tina Underwood' },
  { id: '22', name: 'Uma Vargas' },
  { id: '23', name: 'Victor White' },
  { id: '24', name: 'Wendy Xu' },
  { id: '25', name: 'Xander Young' },
  { id: '26', name: 'Yara Zimmerman' },
  { id: '27', name: 'Zack Allen' },
  { id: '28', name: 'Amy Baker' },
  { id: '29', name: 'Brian Carter' },
  { id: '30', name: 'Cathy Diaz' },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const monthsShort = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const CAL_TYPE_LABEL: Record<CalendarType, string> = {
  standard: 'ปฏิทินวันหยุดราชการ',
  academic: 'ปฏิทินการศึกษา',
  fiscal:   'ปฏิทินปีงบประมาณ',
};

// สีพื้นหลัง/กรอบ/ตัวอักษร แยกตามชนิดปฏิทิน
const CALENDAR_TYPE_STYLES: Record<
  CalendarType,
  { bg: string; border: string; text: string }
> = {
  standard: { bg: '#E6F7FF', border: '#91D5FF', text: '#003A8C' },
  academic: { bg: '#F9F0FF', border: '#D3ADF7', text: '#391085' },
  fiscal:   { bg: '#F6FFED', border: '#B7EB8F', text: '#135200' },
};

// ----------------- Helpers -----------------
type BarPosition = 'single' | 'start' | 'middle' | 'end';

const shortLabel = (title: string) => {
  const clean = title.replace(/\s+/g, ' ').trim();
  if (clean.length <= 12) return clean;
  const firstToken = clean.split(' ')[0] || clean;
  const base = firstToken.length > 7 ? firstToken.slice(0, 7) : firstToken;
  return `${base}…`;
};

const BRIDGE_PX = 8;
const startOfWeek = (d: Dayjs) => d.startOf('week'); // อาทิตย์-เสาร์
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

const getBarPosition = (value: Dayjs, s: CalendarSchedule): BarPosition => {
  const sStart = dayjs(s.startDate);
  const sEnd = dayjs(s.endDate);
  if (sStart.isSame(sEnd, 'day')) return 'single';
  if (value.isSame(sStart, 'day')) return 'start';
  if (value.isSame(sEnd, 'day')) return 'end';
  return 'middle';
};
// -------------------------------------------


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
    const month = date.month();
    const fiscalYearStartMonth = 8;
    const fiscalYear = month >= fiscalYearStartMonth ? year + 1 : year;
    const fiscalMonth = month >= fiscalYearStartMonth ? month - fiscalYearStartMonth + 1 : month + 4;
    return `ปีงบประมาณที่ ${fiscalYear + 543} เดือนที่ ${fiscalMonth}`;
  };

  // การตั้งค่าการมองเห็นผู้ใช้
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

  // กำหนดการ/วันหยุดของวัน
  const getSchedulesForDay = (value: Dayjs): CalendarSchedule[] => {
    const orderType: Record<CalendarType, number> = { academic: 0, standard: 1, fiscal: 2 };
    return calendarSchedulesMock
      .filter((s) => selectedCalendars.includes(s.calendarType))
      .filter((s) =>
        value.isBetween(dayjs(s.startDate), dayjs(s.endDate), null, '[]')
      )
      .sort((a, b) => {
        const lenA = dayjs(a.endDate).diff(dayjs(a.startDate), 'day');
        const lenB = dayjs(b.endDate).diff(dayjs(b.startDate), 'day');
        if (lenA !== lenB) return lenB - lenA;                             // ช่วงยาวมาก่อน
        if (orderType[a.calendarType] !== orderType[b.calendarType]) {
          return orderType[a.calendarType] - orderType[b.calendarType];    // academic → standard → fiscal
        }
        return a.id.localeCompare(b.id);
      });
  };

  // ลาที่อนุมัติของวัน
  const getLeavesForDay = (value: Dayjs): LeaveItem[] => {
    return leavesMock.filter((l) =>
      value.isBetween(dayjs(l.startDate), dayjs(l.endDate), null, '[]') &&
      l.status === 'approved' &&
      (visibleUserIds.length ? visibleUserIds.includes(l.userId) : true),
    );
  };

  const openDetail = useCallback((date: Dayjs) => {
  setDetailDate(date.startOf('day'));
  setDetailOpen(true);
}, []);

  // ===== แถวกลาง: โปรไฟล์ลา (จำกัด 1 + bubble จำนวนที่เหลือ) =====
  const renderLeaveRow = useCallback((value: Dayjs) => {
    if (!showApprovedLeaves) return <div className="tt-leave-row" />;
    const leaves = getLeavesForDay(value);
    if (!leaves.length) return <div className="tt-leave-row" />;

    const first = leaves[0];
    const others = leaves.length - 1;
    const getInitials = (name: string) => name.split(' ').map((n) => n[0]).join('').toUpperCase();

    return (
      <div className="tt-leave-row">
        <Tooltip title={`${userMap.get(first.userId) ?? 'User'} (${first.type})`}>
          <Avatar size={20}>{getInitials(userMap.get(first.userId) ?? 'U')}</Avatar>
        </Tooltip>
        {others > 0 && (
          <div
            title={`+${others} more`}
            style={{
              width: 20, height: 20, borderRadius: '50%',
              background: '#f0f0f0', color: '#595959',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 600,
            }}
          >
            +{others}
          </div>
        )}
      </div>
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showApprovedLeaves, visibleUserIds]);

  // ===== แถวล่าง: แถบกำหนดการ =====
  const renderScheduleBars = useCallback((value: Dayjs) => {
    const schedules = getSchedulesForDay(value);
    const maxBars = 3;
    const overflowCount = Math.max(0, schedules.length - maxBars);

    return (
      <ul className="tt-sched-list">
        {schedules.slice(0, maxBars).map((s, idx, arr) => {
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

          const bridgeStyle: React.CSSProperties = { width: '100%', height: '100%' };
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

          const isLastRow = idx === arr.length - 1;

          return (
            <li
              key={`${s.id}-${value.format('YYYYMMDD')}`}
              className="tt-sched-item"              // << เพิ่ม
            >
              <div
                className="tt-bar"                   // << เพิ่ม
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
                {pos === 'single' ? shortLabel(s.title) : (showLabel ? shortLabel(s.title) : '\u00A0')}
                {isLastRow && overflowCount > 0 && <span className="tt-more">+{overflowCount}</span>}
              </div>
            </li>
          );
        })}
      </ul>
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCalendars]);



  /** มุมมอง 4 เดือน */
/** มุมมอง 4 เดือน (current + next 3) และล็อก 3 กล่องหลัง */
const renderQuarterView = () => {
  const base = selectedDate.startOf('month');
  const months = Array.from({ length: 4 }, (_, i) => base.add(i, 'month'));

  // header แบบอ่านอย่างเดียว (ไม่มีปุ่ม/ตัวเลือกเดือนปี)
  const ReadonlyHeader = ({ label }: { label: string }) => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '6px 8px', fontWeight: 600
    }}>
      {label}
    </div>
  );

  return (
    <div className="ttleave-cal" style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
      {months.map((m, idx) => (
        <div key={m.format('YYYY-MM')} style={{ border: '1px solid #eee', borderRadius: 8, background: '#fff' }}>
          <Calendar
            value={m}
            fullscreen={false}
            headerRender={idx === 0
              ? undefined
              : () => <ReadonlyHeader label={m.format('MMMM YYYY')} />
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

  // ===== Data ใน Modal =====
  const detailSchedules = useMemo(() => {
    if (!detailDate) return [];
    return getSchedulesForDay(detailDate);
  }, [detailDate, selectedCalendars]);

  const detailLeaves = useMemo(() => {
    if (!detailDate) return [];
    return getLeavesForDay(detailDate!);
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

      {/* Calendar */}
     {viewMode === 'month' ? (
        <div className="ttleave-cal">
          <Calendar
            key={`month-${selectedCalendars.sort().join('|')}-${showApprovedLeaves ? '1' : '0'}`}
            value={selectedDate}
            onChange={(d) => setSelectedDate(d)}
            onSelect={(d) => openDetail(d)}
            fullscreen={false}
            fullCellRender={(current, info) => {
              if (info.type !== 'date') return info.originNode;
              return (
                <div className="tt-cell" onDoubleClick={() => openDetail(current)}>
                  <div className="tt-day">{current.date()}</div>
                  {/* แถวโปรไฟล์ลา (1 โปรไฟล์ + bubble +n) */}
                  {renderLeaveRow(current)}
                  {/* แถบกำหนดการ สูงสุด 3 แถวย่อย + ต่อเนื่องข้ามวัน */}
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
      

      {/* ---- Global styles เฉพาะในกล่องนี้ เพื่อ “ตรึงความสูงเซลล์ + layout 2 แถว” ---- */}
      <style jsx global>{`
      .ttleave-cal {
        --cell-pad-y: 8px;
        --daynum-h: 22px;       /* แถว 1: เลขวัน */
        --leave-row-h: 26px;    /* แถว 2: โปรไฟล์ลา */
        --sched-row-h: 24px;    /* ความสูง 1 แถวย่อยของกำหนดการ */
        --row-gap: 4px;
        --sched-rows: 3;        /* แถวย่อยของกำหนดการสูงสุด = 3 */

        /* รวมเป็น 5 แถว (1 + 1 + 3) */
        --sched-rows-h: calc(var(--sched-rows) * var(--sched-row-h)
                        + (var(--sched-rows) - 1) * var(--row-gap));
        --cell-h: calc(var(--cell-pad-y)*2 + var(--daynum-h) + var(--leave-row-h) + var(--sched-rows-h));
      }

      /* โครงร่าง 3 แถวยักษ์: วัน / ลา / ลิสต์กำหนดการ */
      .ttleave-cal .tt-cell {
        height: var(--cell-h);
        padding: var(--cell-pad-y) 0;   /* เอา padding X ออก เพื่อให้แถบชนขอบซ้าย-ขวา */
        display: grid;
        grid-template-rows: var(--daynum-h) var(--leave-row-h) var(--sched-rows-h);
        box-sizing: border-box;
        position: relative;             /* ให้ .tt-more อ้างอิงตำแหน่งในกล่องนี้ */
        overflow-y: hidden;             /* ไม่ให้ดันลงสัปดาห์ถัดไป */
        overflow-x: visible;            /* ให้แถบคาบข้ามวันได้ */
      }

      /* แถวเลขวัน: จัดให้เรียงแนวเดียวกันทุกเซลล์ */
      .ttleave-cal .tt-day {
        height: var(--daynum-h);
        line-height: var(--daynum-h);
        font-weight: 600;
        text-align: left;
        padding: 0 8px;                 /* padding กลับเฉพาะบรรทัดนี้ */
      }

      /* แถวโปรไฟล์ลา */
      .ttleave-cal .tt-leave-row {
        height: var(--leave-row-h);
        display: flex;
        align-items: center;
        gap: 6px;
        overflow: hidden;
        padding: 0 8px;                 /* padding กลับเฉพาะบรรทัดนี้ */
      }

      /* รายการแถบกำหนดการ (สูงเท่าพื้นที่ 3 แถวย่อยพอดี) */
      .ttleave-cal .tt-sched-list {
        height: var(--sched-rows-h);
        display: flex;
        flex-direction: column;
        gap: var(--row-gap);
        margin: 0;
        padding: 0;
        list-style: none;
        overflow: hidden;               /* ถ้าเกิน 3 แถบจะถูกซ่อน */
      }

      /* 1 รายการ = 1 แถวย่อย สูงตายตัว */
      .ttleave-cal .tt-sched-item {
        height: var(--sched-row-h);
        display: block;
      }

      /* ตัวแถบเองกินเต็มแถว */
      .ttleave-cal .tt-bar {
        height: 100%;
        display: block;
      }

      /* ป้าย +more โชว์บนแถบสุดท้ายถ้า overflow */
      .ttleave-cal .tt-more {
        position: absolute;
        right: 4px;
        top: 2px;
        font-size: 11px;
        color: #8c8c8c;
        pointer-events: none;
      }

      /* เอา padding โครงสร้างภายใน AntD ออก ไม่งั้นแถบจะไม่ชนขอบ */
      .ttleave-cal .ant-picker-cell-inner { padding: 0 !important; }
    `}</style>

    </div>
  );
}
