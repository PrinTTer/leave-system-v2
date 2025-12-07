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

type LeaveDay = {
  date: string;
  type: string;
};

type LeaveTypes = Record<
  string,
  {
    label: string;
    color: string;
  }
>;

interface LeaveCalendarProps {
  leaveTypes: LeaveTypes;
  onChange?: (days: LeaveDay[]) => void;
}

const LeaveCalendar = ({ leaveTypes, onChange }: LeaveCalendarProps) => {
  const [leaveDays, setLeaveDays] = useState<LeaveDay[]>([]);

  const [range, setRange] = useState<{
    start: Dayjs | null;
    end: Dayjs | null;
  }>({ start: null, end: null });

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ==========================
  // เมื่อคลิกวันที่ในปฏิทิน
  // ==========================
  const handleSelect = (date: Dayjs) => {
    setRange({ start: date, end: date });
    setIsModalOpen(true);
  };

  // ==========================
  // ฟังก์ชันบันทึกการลา
  // ==========================
  const handleOk = () => {
    if (!range.start || !range.end || !selectedType) return;

    const newDays: LeaveDay[] = [];
    let current = range.start;

    while (current.isSameOrBefore(range.end, "day")) {
      newDays.push({
        date: current.format("YYYY-MM-DD"),
        type: selectedType,
      });
      current = current.add(1, "day");
    }

    setLeaveDays((prev) => {
      const filtered = prev.filter(
        (d) =>
          !dayjs(d.date).isSameOrAfter(range.start!, "day") ||
          !dayjs(d.date).isSameOrBefore(range.end!, "day")
      );

      const result = [...filtered, ...newDays];
      onChange?.(result);
      return result;
    });

    setSelectedType(null);
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // ==========================
  // ลบวันลา
  // ==========================
  const handleRemoveLeave = (date: string) => {
    const newList = leaveDays.filter((d) => d.date !== date);
    setLeaveDays(newList);
    onChange?.(newList);
  };

  // ==========================
  // Render Tags ในปฏิทิน
  // ==========================
  const dateCellRender = (date: Dayjs) => {
    const leave = leaveDays.find((d) => d.date === date.format("YYYY-MM-DD"));
    if (!leave) return null;

    const { label, color } = leaveTypes[leave.type];

    return (
      <div style={{ position: "relative", display: "inline-block" }}>
        <Tag color={color} style={{ paddingRight: 20 }}>
          {label}
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
          ฟอร์มด้านบน
      ========================== */}
      <Row gutter={24}>
        <Col span={6}>
          <Form.Item label="เลือกประเภทการลา" name="leavetype">
            <Select
              style={{ width: "100%" }}
              placeholder="เลือกประเภทการลา"
              value={selectedType || undefined}
              onChange={(val) => setSelectedType(val)}
            >
              {Object.entries(leaveTypes).map(([key, { label }]) => (
                <Select.Option key={key} value={key}>
                  {label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label="มีกำหนดตั้งแต่วันที่ ถึง วันที่" name="leaveRange">
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
          <Form.Item label={null}>
            <Button type="primary" onClick={handleOk} style={{ marginTop: 30 }}>
              เพิ่มการลา
            </Button>
          </Form.Item>
        </Col>

        <Col span={6} style={{ display: "flex", justifyContent: "flex-end" }}>
          <Form.Item label={null}>
            <Button
              type="default"
              onClick={() => {
                setLeaveDays([]);
                onChange?.([]);
              }}
              style={{ marginTop: 30 }}
            >
              ยกเลิกทั้งหมด
            </Button>
          </Form.Item>
        </Col>
      </Row>

      {/* ==========================
          ปฏิทิน
      ========================== */}
      <Calendar
        fullscreen={false}
        onSelect={handleSelect}
        cellRender={dateCellRender}
      />

      {/* ==========================
          Modal (เมื่อกดเลือกวันที่)
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
            style={{ width: "100%" }}
            placeholder="เลือกประเภท"
            value={selectedType || undefined}
            onChange={(v) => setSelectedType(v)}
          >
            {Object.entries(leaveTypes).map(([key, { label }]) => (
              <Select.Option key={key} value={key}>
                {label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Modal>
    </div>
  );
};

export default LeaveCalendar;
