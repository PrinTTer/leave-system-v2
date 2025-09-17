"use client";

import React, { useState, useMemo } from "react";
import {
  Form,
  DatePicker,
  Input,
  Button,
  Select,
  Radio,
  Table,
  Typography,
  TimePicker,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import Link from "next/link";

const { RangePicker } = DatePicker;
const { Text } = Typography;

const countries = [
  { label: "ญี่ปุ่น", value: "Japan" },
  { label: "เกาหลีใต้", value: "South Korea" },
  { label: "สหรัฐอเมริกา", value: "USA" },
  { label: "อังกฤษ", value: "UK" },
  { label: "ฝรั่งเศส", value: "France" },
  { label: "สิงคโปร์", value: "Singapore" },
];

const InternationalLeaveForm: React.FC = () => {
  const [leaveType, setLeaveType] = useState<string>("");
  const [dates, setDates] = useState<[Dayjs, Dayjs] | null>(null);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [halfDay, setHalfDay] = useState<boolean>(false);
  const [halfDayTime, setHalfDayTime] = useState<Dayjs | null>(null);

  // mock: จำนวนวันลาทั้งหมดที่มีสิทธิ์
  const totalLeaveDays = 10;

  // คำนวณจำนวนวันลา
  const leaveDays = useMemo(() => {
    if (!dates) return 0;
    const [start, end] = dates;
    let days = 0;
    let current = start.startOf("day");

    while (current.isBefore(end.endOf("day")) || current.isSame(end, "day")) {
      const day = current.day();
      // ข้ามวันเสาร์-อาทิตย์
      if (day !== 0 && day !== 6) {
        days += 1;
      }
      current = current.add(1, "day");
    }

    // ถ้าเลือกครึ่งวัน หักออกครึ่ง
    if (halfDay) {
      days -= 0.5;
    }

    return days;
  }, [dates, halfDay]);

  const remainingLeaveDays = totalLeaveDays - leaveDays;

  const summaryData = [
    {
      key: "1",
      leaveType:
        leaveType === "sick"
          ? "ลาป่วย"
          : leaveType === "business"
          ? "ลากิจ"
          : leaveType === "vacation"
          ? "ลาพักร้อน"
          : "-",
      countries: selectedCountries.join(", ") || "-",
      leaveMode: halfDay ? "ครึ่งวัน" : "เต็มวัน",
      leaveDays,
      remaining: remainingLeaveDays,
    },
  ];

  const columns = [
    { title: "ประเภทการลา", dataIndex: "leaveType" },
    { title: "ประเทศที่เดินทาง", dataIndex: "countries" },
    { title: "ลาครึ่งวัน/เต็มวัน", dataIndex: "leaveMode" },
    { title: "จำนวนวันที่ลา", dataIndex: "leaveDays" },
    {
      title: "จำนวนวันลาคงเหลือ",
      dataIndex: "remaining",
      render: (value: number) => (
        <Text type={value < 0 ? "danger" : undefined}>{value}</Text>
      ),
    },
  ];

  return (
    <div>
      <Form
        layout="vertical"
        className="max-w-2xl p-6 border rounded-lg bg-white shadow-sm"
      >
        {/* ประเภทการลา */}
        <Form.Item
          label="ประเภทการลา"
          name="leaveType"
          rules={[{ required: true, message: "กรุณาเลือกประเภทการลา" }]}
        >
          <Radio.Group
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
          >
            <Radio value="sick">ลาป่วย</Radio>
            <Radio value="business">ลากิจ</Radio>
            <Radio value="vacation">ลาพักร้อน</Radio>
          </Radio.Group>
        </Form.Item>

        {/* เลือกประเทศ */}
        <Form.Item
          label="ประเทศที่ต้องการเดินทาง"
          name="countries"
          rules={[{ required: true, message: "กรุณาเลือกประเทศ" }]}
        >
          <Select
            mode="multiple"
            allowClear
            style={{ width: "100%" }}
            placeholder="ค้นหาและเลือกประเทศ"
            options={countries}
            value={selectedCountries}
            onChange={setSelectedCountries}
          />
        </Form.Item>

        {/* เหตุผลการลา */}
        <Form.Item
          label="เหตุผลการลา"
          name="reason"
          rules={[{ required: true, message: "กรุณาระบุเหตุผลการลา" }]}
        >
          <Input.TextArea rows={3} placeholder="กรอกเหตุผลการลา..." />
        </Form.Item>

        {/* ช่วงเวลาที่ลา */}
        <Form.Item
          label="มีกำหนดตั้งแต่วันที่ - ถึงวันที่"
          name="duration"
          rules={[{ required: true, message: "กรุณาเลือกช่วงเวลา" }]}
        >
          <RangePicker
            style={{ width: "100%" }}
            onChange={(values) => setDates(values as [Dayjs, Dayjs])}
          />
        </Form.Item>

        {/* ลาครึ่งวัน/เต็มวัน */}
        <Form.Item label="ลาครึ่งวัน" name="halfDay">
          <Radio.Group
            value={halfDay}
            onChange={(e) => setHalfDay(e.target.value)}
          >
            <Radio value={false}>เต็มวัน</Radio>
            <Radio value={true}>ครึ่งวัน</Radio>
          </Radio.Group>
          {/* {halfDay && (
            <TimePicker
              className="mt-2"
              format="HH:mm"
              value={halfDayTime}
              onChange={setHalfDayTime}
            />
          )} */}
        </Form.Item>

        {/* ตารางสรุปการลา */}
        <div className="mt-6 mb-4">
          <Table
            dataSource={summaryData}
            pagination={false}
            bordered
            columns={columns}
          />
        </div>

        {/* ปุ่มส่งใบลา */}
        <div className="flex justify-end mt-4" style={{ marginTop: 16 }}>
          <Form.Item>
            <Link href="/private">
              <Button
                type="primary"
                htmlType="submit"
                disabled={remainingLeaveDays < 0}
              >
                ส่งใบลา
              </Button>
            </Link>

            {remainingLeaveDays < 0 && (
              <Text type="danger" className="ml-3">
                ระยะเวลาการลาเกินกว่าที่กำหนด
              </Text>
            )}
          </Form.Item>
        </div>
      </Form>
    </div>
  );
};

export default InternationalLeaveForm;
