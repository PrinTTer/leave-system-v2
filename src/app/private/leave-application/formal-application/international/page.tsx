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
import { formatThaiDate } from "@/app/utils/utils";
import { CloseOutlined } from "@ant-design/icons";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { RangePicker } = DatePicker;
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
    setRange({ start: date, end: date });
    setIsModalOpen(true);
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

  // ลบวันลาออกจาก state
  const handleRemoveLeave = (date: string) => {
    setLeaveDays((prev) => prev.filter((d) => d.date !== date));

    // ถ้าวันที่ลบตรงกับ range ปัจจุบัน ให้รีเซ็ต
    if (
      range.start?.format("YYYY-MM-DD") === date ||
      range.end?.format("YYYY-MM-DD") === date
    ) {
      setRange({ start: null, end: null });
    }
  };

  // render ป้าย Tag + กากบาท
  const dateCellRender = (date: Dayjs) => {
    const leave = leaveDays.find((d) => d.date === date.format("YYYY-MM-DD"));
    if (leave) {
      const { label, color } = leaveTypes[leave.type];
      return (
        <div style={{ position: "relative", display: "inline-block" }}>
          <Tag color={color} style={{ margin: 0, paddingRight: 20 }}>
            {label}
          </Tag>
          <CloseOutlined
            onClick={(e) => {
              e.stopPropagation(); // กันไม่ให้ trigger onSelect
              handleRemoveLeave(date.format("YYYY-MM-DD"));
            }}
            style={{
              position: "absolute",
              top: -6,
              right: -6,
              fontSize: 12,
              color: "#fff",
              cursor: "pointer",
              background: "#aaa7a7ff",
              borderRadius: "50%",
              padding: 2,
            }}
          />
        </div>
      );
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
            <Form.Item
              label="มีกำหนดตั้งแต่วันที่ ถึง วันที่"
              name="leaveRange"
            >
              <RangePicker
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
              <Button
                type="primary"
                onClick={handleOk}
                style={{ width: "30%", marginTop: 30 }}
              >
                เพิ่มการลา
              </Button>
            </Form.Item>
          </Col>
        </Row>

        {/* ปฏิทินเลือกวันลา */}
        <div>
          <Calendar
            fullscreen={false}
            onSelect={handleSelect}
            cellRender={dateCellRender}
          />

          <Modal
            title={`เพิ่มการลา วันที่ ${formatThaiDate(range.start)}`}
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
            {/* 
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
                   </Form.Item> */}
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
          style={{
            marginTop: 24,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", gap: "12px" }}>
            <Button
              style={{
                backgroundColor: "#8c8c8c",
                color: "#fff",
                border: "none",
              }}
              disabled={isOverLimit}
            >
              ย้อนกลับ
            </Button>

            <Button
              style={{
                backgroundColor: "#52c41a",
                color: "#fff",
                border: "none",
              }}
              disabled={isOverLimit}
            >
              บันทึกฉบับร่าง
            </Button>

            <Button
              type="primary"
              style={{ border: "none" }}
              disabled={isOverLimit}
            >
              ส่งใบลา
            </Button>
          </div>

          {isOverLimit && (
            <div style={{ width: "100%", textAlign: "center", marginTop: 8 }}>
              <Text type="danger" style={{ fontWeight: 500 }}>
                ระยะเวลาการลาเกินกว่าที่กำหนด
              </Text>
            </div>
          )}
        </Form.Item>
      </Form>
    </div>
  );
};

export default InternationalFormalLeaveForm;
