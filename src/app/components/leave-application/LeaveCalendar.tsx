import { useState } from "react";
import {
  Calendar,
  Modal,
  Tag,
  Form,
  Select,
  Button,
  Col,
  Row,
  DatePicker,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import { CloseOutlined } from "@ant-design/icons";
import { LeaveType } from "@/types/leaveType";
import { calculateLeaveDays } from "@/app/utils/calculate";

/* ==========================
   TYPES (ของเดิม)
========================== */
export type LeaveDay = {
  date: string;
  leave_type_id: number;
};

export interface LeaveTypeLabel extends LeaveType {
  label: string;
  color: string;
  leave_type?: LeaveType;
  left_leave?: number;
}

/* ==========================
   SUMMARY TYPES (เพิ่ม)
========================== */
export type LeaveSummaryItem = {
  leave_type_id: number;
  category?: string;
  total_days: number;
  days: string[];
  start_date: string;
  end_date: string;
};

export type LeaveSummaryResult = {
  summary: LeaveSummaryItem[];
};

/* ==========================
   SUMMARY BUILDER (เพิ่ม)
========================== */

const isCountVacation = (leaveType?: LeaveTypeLabel): boolean => {
  if (!leaveType) return false;

  return (
    leaveType.is_count_vacation ??
    leaveType.leave_type?.is_count_vacation ??
    false
  );
};

export const buildLeaveSummary = async (
  leaveDays: LeaveDay[],
  leaveTypes: LeaveTypeLabel[]
): Promise<LeaveSummaryResult> => {
  const map = new Map<number, string[]>();

  // รวมวันลาตาม leave_type_id
  for (const d of leaveDays) {
    const list = map.get(d.leave_type_id) ?? [];
    list.push(d.date);
    map.set(d.leave_type_id, list);
  }

  const summary: LeaveSummaryItem[] = [];

  for (const [leave_type_id, dates] of map.entries()) {
    const sortedDays = [...dates].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

    const leaveType = leaveTypes.find(
      (lt) => lt.leave_type_id === leave_type_id
    );

    console.log(leaveType);

    let total_days = 0;
    if (isCountVacation(leaveType)) {
      total_days = sortedDays.length;
    } else {
      for (const d of sortedDays) {
        const day = dayjs(d);

        const days = await calculateLeaveDays(day, day, "full", "full", []);

        total_days += days;
      }
    }

    summary.push({
      leave_type_id,
      category: leaveType?.category,
      total_days,
      days: sortedDays,
      start_date: sortedDays[0],
      end_date: sortedDays[sortedDays.length - 1],
    });
  }

  summary.sort((a, b) => a.leave_type_id - b.leave_type_id);

  return { summary };
};

/* ==========================
   PROPS (เพิ่ม onSummaryChange)
========================== */
interface LeaveCalendarProps {
  leaveTypes: LeaveTypeLabel[];
  onChange?: (days: LeaveDay[]) => void;
  onSummaryChange?: (summary: LeaveSummaryResult) => void;
}

/* ==========================
   COMPONENT
========================== */
const LeaveCalendar = ({ leaveTypes, onSummaryChange }: LeaveCalendarProps) => {
  const [leaveDays, setLeaveDays] = useState<LeaveDay[]>([]);

  const [range, setRange] = useState<{
    start: Dayjs | null;
    end: Dayjs | null;
  }>({ start: null, end: null });

  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelect = (date: Dayjs) => {
    setRange({ start: date, end: date });
    setIsModalOpen(true);
  };

  /* ==========================
     ADD / UPDATE LEAVE
  ========================== */
  const handleOk = async () => {
    if (!range.start || !range.end || !selectedType) return;

    const newDays: LeaveDay[] = [];
    let current = range.start;

    while (current.isSameOrBefore(range.end, "day")) {
      newDays.push({
        date: current.format("YYYY-MM-DD"),
        leave_type_id: selectedType,
      });
      current = current.add(1, "day");
    }

    const filtered = leaveDays.filter(
      (d) =>
        !dayjs(d.date).isSameOrAfter(range.start!, "day") ||
        !dayjs(d.date).isSameOrBefore(range.end!, "day")
    );

    const result = [...filtered, ...newDays];

    setLeaveDays(result);
    onSummaryChange?.(await buildLeaveSummary(result, leaveTypes));

    setSelectedType(null);
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  /* ==========================
     REMOVE SINGLE DAY
  ========================== */
  const handleRemoveLeave = async (date: string) => {
    const newList = leaveDays.filter((d) => d.date !== date);
    setLeaveDays(newList);
    onSummaryChange?.(await buildLeaveSummary(newList, leaveTypes));
  };

  /* ==========================
     CALENDAR CELL RENDER
  ========================== */
  const dateCellRender = (date: Dayjs) => {
    const leave = leaveDays.find((d) => d.date === date.format("YYYY-MM-DD"));
    if (!leave) return null;

    const leaveType = leaveTypes.find(
      (lt) => lt.leave_type_id === leave.leave_type_id
    );

    if (!leaveType) return null;

    return (
      <div style={{ position: "relative", display: "inline-block" }}>
        <Tag color={leaveType.color} style={{ paddingRight: 20 }}>
          {leaveType.label}
        </Tag>

        <CloseOutlined
          onClick={(e) => {
            e.stopPropagation();
            handleRemoveLeave(date.format("YYYY-MM-DD"));
          }}
          style={{
            position: "absolute",
            top: -6,
            right: -6,
            fontSize: 12,
            color: "#fff",
            cursor: "pointer",
            background: "#aaa",
            borderRadius: "50%",
            padding: 2,
          }}
        />
      </div>
    );
  };

  return (
    <div>
      {/* ==========================
          FORM
      ========================== */}
      <Row gutter={24}>
        <Col span={6}>
          <Form.Item label="เลือกประเภทการลา">
            <Select
              placeholder="เลือกประเภทการลา"
              value={selectedType ?? undefined}
              onChange={(val) => setSelectedType(Number(val))}
            >
              {leaveTypes.map((lt) => (
                <Select.Option key={lt.leave_type_id} value={lt.leave_type_id}>
                  {lt.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label="มีกำหนดตั้งแต่วันที่ ถึง วันที่">
            <DatePicker.RangePicker
              onChange={(dates) =>
                setRange({
                  start: dates?.[0] || null,
                  end: dates?.[1] || null,
                })
              }
            />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Button type="primary" onClick={handleOk} style={{ marginTop: 30 }}>
            เพิ่มการลา
          </Button>
        </Col>

        <Col span={6} style={{ textAlign: "right" }}>
          <Button
            style={{ marginTop: 30 }}
            onClick={() => {
              setLeaveDays([]);
              onSummaryChange?.({ summary: [] });
            }}
          >
            ยกเลิกทั้งหมด
          </Button>
        </Col>
      </Row>

      {/* ==========================
          CALENDAR
      ========================== */}
      <Calendar
        fullscreen={false}
        onSelect={handleSelect}
        cellRender={dateCellRender}
      />

      {/* ==========================
          MODAL
      ========================== */}
      <Modal
        title="เพิ่มการลา"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="บันทึก"
        cancelText="ยกเลิก"
      >
        <Form.Item label="ประเภทการลา">
          <Select
            placeholder="เลือกประเภท"
            value={selectedType ?? undefined}
            onChange={(val) => setSelectedType(Number(val))}
          >
            {leaveTypes.map((lt) => (
              <Select.Option key={lt.leave_type_id} value={lt.leave_type_id}>
                {lt.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Modal>
    </div>
  );
};

export default LeaveCalendar;
