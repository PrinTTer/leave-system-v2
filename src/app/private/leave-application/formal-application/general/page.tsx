import React, { useState } from "react";
import {
  Form,
  Select,
  Calendar,
  Modal,
  Table,
  Button,
  Checkbox,
  Input,
  InputNumber,
  Typography,
  Row,
  Col,
  Tag,
  DatePicker,
} from "antd";
import type { CheckboxProps } from "antd";
import dayjs, { Dayjs } from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

type CheckboxValueType = string | number | CheckboxProps["checked"];
const { Text } = Typography;

const leaveTypes: Record<string, { label: string; color: string }> = {
  personal: { label: "ลากิจ", color: "orange" },
  vacation: { label: "ลาพักร้อน", color: "red" },
  business: { label: "ไปราชการ", color: "blue" },
};

interface LeaveDay {
  date: string;
  type: string;
}

const FormalApplicationForm: React.FC = () => {
  // จำนวนวันลา (mock สมมติ)
  const totalBusinessLeave = 10;
  const totalPersonalLeave = 5;
  const totalVacationLeave = 5;

  // state
  const [leaveDays, setLeaveDays] = useState<LeaveDay[]>([]);
  const [range, setRange] = useState<{
    start: Dayjs | null;
    end: Dayjs | null;
  }>({
    start: null,
    end: null,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const [assistants, setAssistants] = useState<string[]>([]);

  const [selectedExpenses, setSelectedExpenses] = useState<CheckboxValueType[]>(
    []
  );

  const [businessDays, setBusinessDays] = useState<number>();
  const [vacationDays, setVacationDays] = useState<number>();
  const [personalDays, setPersonalDays] = useState<number>();

  // เมื่อคลิกวันใน Calendar
  const handleSelect = (date: Dayjs) => {
    setRange({ start: date, end: date }); // default end = start
    setIsModalOpen(true); // เปิด modal ทันที
  };

  // บันทึกประเภทการลา
  const handleOk = () => {
    if (range.start && range.end && selectedType) {
      const allDays: LeaveDay[] = [];
      let current = range.start;
      while (current.isSameOrBefore(range.end, "day")) {
        allDays.push({
          date: current.format("YYYY-MM-DD"),
          type: selectedType,
        });
        current = current.add(1, "day");
      }

      setLeaveDays((prev) => {
        const filtered = prev.filter(
          (d) =>
            !dayjs(d.date).isSameOrAfter(range.start, "day") ||
            !dayjs(d.date).isSameOrBefore(range.end, "day")
        );
        return [...filtered, ...allDays];
      });

      // คำนวณจำนวนวันลาเฉพาะวันจันทร์–ศุกร์
      const weekdaysCount = allDays.filter((d) => {
        const day = dayjs(d.date).day(); // 0 = อาทิตย์, 6 = เสาร์
        return day >= 1 && day <= 5;
      }).length;

      // อัปเดตจำนวนวันลาแยกประเภท
      switch (selectedType) {
        case "business":
          setBusinessDays((prev) => (prev || 0) + weekdaysCount);
          break;
        case "personal":
          setPersonalDays((prev) => (prev || 0) + weekdaysCount);
          break;
        case "vacation":
          setVacationDays((prev) => (prev || 0) + weekdaysCount);
          break;
      }
    }
    setIsModalOpen(false);
    setSelectedType(null);
  };

  const handleCancel = () => {
    setRange({ start: null, end: null });
    setIsModalOpen(false);
  };

  // render ป้าย Tag บนปฏิทิน
  const dateCellRender = (date: Dayjs) => {
    const leave = leaveDays.find((d) => d.date === date.format("YYYY-MM-DD"));
    if (leave) {
      const { label, color } = leaveTypes[leave.type];
      return <Tag color={color}>{label}</Tag>;
    }
    return null;
  };

  const handleExpensesChange = (checkedValues: CheckboxValueType[]) => {
    setSelectedExpenses(checkedValues);
  };

  const summaryData = [
    {
      key: "1",
      type: "ลาราชการ",
      dates: leaveDays.filter((d) => d.type === "business").map((d) => d.date), // ต้องเป็น array
      days: businessDays || 0,
      remaining: totalBusinessLeave - (businessDays || 0),
    },
    {
      key: "2",
      type: "ลากิจ",
      dates: leaveDays.filter((d) => d.type === "personal").map((d) => d.date),
      days: personalDays || 0,
      remaining: totalPersonalLeave - (personalDays || 0),
    },
    {
      key: "3",
      type: "ลาพักร้อน",
      dates: leaveDays.filter((d) => d.type === "vacation").map((d) => d.date),
      days: vacationDays || 0,
      remaining: totalVacationLeave - (vacationDays || 0),
    },
  ];

  const summaryColumns = [
    { title: "ประเภทการลา", dataIndex: "type", key: "type" },
    {
      title: "วันที่ลา",
      dataIndex: "dates",
      key: "dates",
      render: (dates: string[]) => (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {dates.map((date) => (
            <Tag key={date} color="blue" style={{ marginBottom: 4 }}>
              {date}
            </Tag>
          ))}
        </div>
      ),
    },
    { title: "จำนวนวันลา", dataIndex: "days", key: "days" },
    {
      title: "วันคงเหลือ",
      dataIndex: "remaining",
      key: "remaining",
      render: (val: number) => (
        <Text type={val < 0 ? "danger" : undefined}>{val}</Text>
      ),
    },
  ];

  const isOverLimit = summaryData.some((item) => item.remaining < 0);

  return (
    <div>
      <Form
        layout="vertical"
        className="max-w-3xl p-6 border rounded-lg bg-white shadow-sm"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="มีความประสงค์จะเดินทางไปจังหวัด" name="province">
              <Select
                showSearch
                placeholder="-- กรุณาระบุจังหวัด --"
                optionFilterProp="label"
                mode="multiple"
                options={[
                  { value: "bkk", label: "กรุงเทพมหานคร" },
                  { value: "chiangmai", label: "เชียงใหม่" },
                  { value: "phuket", label: "ภูเก็ต" },
                  { value: "chonburi", label: "ชลบุรี" },
                  { value: "khonkaen", label: "ขอนแก่น" },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* เหตุผลการลา */}
        <Form.Item
          label="เนื่องจาก"
          name="reason"
          rules={[{ required: true, message: "กรุณากรอกเหตุผลการลา" }]}
        >
          <Input.TextArea rows={3} placeholder="..." />
        </Form.Item>

        {/* ปฏิทินเลือกวันลา */}
        <div>
          <Calendar
            fullscreen={false}
            onSelect={handleSelect}
            cellRender={dateCellRender}
          />

          <Modal
            title={`เพิ่มการลา`}
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            okText="บันทึก"
            cancelText="ยกเลิก"
          >
            <Form.Item label="ประเภทการลา">
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

            <Form.Item label="ตั้งแต่วันที่">
              <DatePicker
                style={{ width: "100%", marginBottom: 12 }}
                value={range.start}
                onChange={(date) => date && setRange({ ...range, start: date })}
              />
            </Form.Item>
            <Form.Item label="ลาถึงวันที่">
              <DatePicker
                style={{ width: "100%", marginBottom: 12 }}
                value={range.end}
                onChange={(date) => date && setRange({ ...range, end: date })}
              />
            </Form.Item>
          </Modal>
        </div>

        <Form.Item label="ผู้ติดตาม" name="assistants">
          <Select
            mode="multiple"
            showSearch
            placeholder="-- ผู้ติดตาม --"
            optionFilterProp="label"
            value={assistants}
            onChange={(value) => setAssistants(value)}
            options={[
              { value: "1", label: "สมชาย ใจดี" },
              { value: "2", label: "วรัญญา ประวันโน" },
              { value: "3", label: "กิตติพงษ์ รัตนชัย" },
              { value: "4", label: "สุภาพร ศรีสุข" },
              { value: "5", label: "ณัฐพล อินทร์ทอง" },
            ]}
          />
        </Form.Item>

        <Form.Item label="รายละเอียดการเดินทาง">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="ยี่ห้อรถ">
                <Input placeholder="เช่น TOYOTA" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="ป้ายทะเบียน">
                <Input placeholder="เช่น กข 1234" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="พนักงานขับรถ">
            <Input placeholder="ชื่อพนักงาน (ถ้ามี)" />
          </Form.Item>
        </Form.Item>

        {/* ค่าใช้จ่าย */}
        <Form.Item label="ขอเบิกค่าใช้จ่าย">
          <Checkbox.Group
            style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            onChange={handleExpensesChange}
          >
            <Checkbox value="rs">ค่าเบี้ยเลี้ยงเดินทาง (รศ)</Checkbox>
            {selectedExpenses.includes("rs") && (
              <div className="ml-6 mt-1 flex gap-2">
                <InputNumber min={0} placeholder="จำนวนเงินต่อคน" />
                <InputNumber min={1} placeholder="จำนวนคน" />
              </div>
            )}
            <Checkbox value="asst">ค่าเบี้ยเลี้ยงเดินทาง (ผศ ลงมา)</Checkbox>
            {selectedExpenses.includes("asst") && (
              <div className="ml-6 mt-1 flex gap-2">
                <InputNumber min={0} placeholder="จำนวนเงินต่อคน" />
                <InputNumber min={1} placeholder="จำนวนคน" />
              </div>
            )}
            <Checkbox value="driver">ค่าตอบแทนพนักงานขับรถ</Checkbox>
            {selectedExpenses.includes("driver") && (
              <InputNumber
                min={0}
                placeholder="จำนวนเงิน"
                className="ml-6 mt-1"
              />
            )}
            <Checkbox value="accommodation">ค่าเช่าที่พัก</Checkbox>
            {selectedExpenses.includes("accommodation") && (
              <InputNumber
                min={0}
                placeholder="จำนวนเงิน"
                className="ml-6 mt-1"
              />
            )}
            <Checkbox value="vehicle">ค่ายานพาหนะ</Checkbox>
            {selectedExpenses.includes("vehicle") && (
              <div className="ml-6 mt-1 flex gap-2">
                <Input
                  placeholder="เช่น เหมารถตู้ 1 คัน"
                  style={{ width: "50%" }}
                />
                <InputNumber min={0} placeholder="จำนวนเงิน" />
              </div>
            )}
            <Checkbox value="other">ค่าใช้จ่ายอื่นๆ</Checkbox>
            {selectedExpenses.includes("other") && (
              <div className="ml-6 mt-1 flex gap-2">
                <Input placeholder="ระบุรายละเอียด" style={{ width: "50%" }} />
                <InputNumber min={0} placeholder="จำนวนเงิน" />
              </div>
            )}
          </Checkbox.Group>
        </Form.Item>

        {/* ตารางสรุป */}
        <div className="mt-6 mb-4">
          <Table
            dataSource={summaryData}
            pagination={false}
            bordered
            columns={summaryColumns}
          />
        </div>

        {/* ปุ่มส่ง */}
        <Form.Item
          style={{ marginTop: 16, display: "flex", justifyContent: "end" }}
        >
          <Button type="primary" disabled={isOverLimit}>
            ส่งใบลา
          </Button>
          {isOverLimit && (
            <Text type="danger" className="ml-3">
              ระยะเวลาการลาเกินกว่าที่กำหนด
            </Text>
          )}
        </Form.Item>
      </Form>
    </div>
  );
};

export default FormalApplicationForm;
