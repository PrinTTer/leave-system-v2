"use client";

import React, { useState } from "react";
import {
  Form,
  Select,
  Calendar,
  Modal,
  Table,
  Button,
  Input,
  Typography,
  Row,
  Col,
  Tag,
  UploadFile,
  DatePicker,
  Radio,
  Upload,
} from "antd";

import { UploadOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

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

const InternationalFormalLeaveForm: React.FC = () => {
  const totalBusinessLeave = 10; // วันลากิจ/ราชการรวมสูงสุดสมมติ
  const totalPersonalLeave = 5; // วันลากิจสูงสุดสมมติ
  const totalVacationLeave = 5;

  const [assistants, setAssistants] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [paid, setPaid] = useState<string>("1");
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaveDays, setLeaveDays] = useState<LeaveDay[]>([]);
  const [range, setRange] = useState<{
    start: Dayjs | null;
    end: Dayjs | null;
  }>({
    start: null,
    end: null,
  });
  const [selectedType, setSelectedType] = useState<LeaveDay["type"] | null>(
    null
  );

  const handleChange = (info: { fileList: UploadFile[] }) => {
    setFileList(info.fileList);
  };

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
        className="max-w-2xl p-6 border rounded-lg bg-white shadow-sm"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="มีความประสงค์จะเดินทางไปประเทศ" name="country">
              <Select
                mode="multiple"
                showSearch
                placeholder="-- กรุณาระบุประเทศ --"
                optionFilterProp="label"
                value={countries}
                onChange={(vals) => setCountries(vals)}
                options={[
                  { value: "us", label: "สหรัฐอเมริกา" },
                  { value: "uk", label: "สหราชอาณาจักร" },
                  { value: "jp", label: "ญี่ปุ่น" },
                  { value: "kr", label: "เกาหลีใต้" },
                  { value: "cn", label: "จีน" },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="เดินทางไปวันที่" name="departure">
              <DatePicker
                style={{ width: "100%" }}
                showTime
                format="YYYY-MM-DD HH:mm"
                placeholder="เลือกวันที่และเวลา"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="เดินทางกลับวันที่" name="return">
              <DatePicker
                style={{ width: "100%" }}
                showTime
                format="YYYY-MM-DD HH:mm"
                placeholder="เลือกวันที่และเวลา"
              />
            </Form.Item>
          </Col>
        </Row>

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

        {/* ส่วนขอเบิกค่าใช้จ่าย */}
        <Form.Item label="ค่าใช้จ่าย">
          <Radio.Group value={paid} onChange={(e) => setPaid(e.target.value)}>
            <Radio value="1">ทุนส่วนตัว</Radio>
            <Radio value="2">ทุนภาควิชา</Radio>
            <Radio value="3">ทุนคณะ</Radio>
          </Radio.Group>
          {(paid === "2" || paid === "3") && (
            <div style={{ marginTop: "10px" }}>
              <Form.Item label="แนบเอกสารเพิ่มเติม" name="attachments">
                <Upload fileList={fileList} onChange={handleChange}>
                  <Button icon={<UploadOutlined />}>เลือกไฟล์</Button>
                </Upload>
              </Form.Item>
            </div>
          )}
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

export default InternationalFormalLeaveForm;
