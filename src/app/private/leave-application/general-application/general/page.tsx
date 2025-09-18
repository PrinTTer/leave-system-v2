"use client";

import React, { useState, useMemo } from "react";
import {
  Form,
  DatePicker,
  Input,
  Button,
  Upload,
  Radio,
  Table,
  Typography,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import { UploadOutlined } from "@ant-design/icons";
import { Dayjs } from "dayjs";
import Link from "next/link";

const { RangePicker } = DatePicker;
const { Text } = Typography;

const GeneralLeaveForm: React.FC = () => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [leaveType, setLeaveType] = useState<string>("");
  const [halfDay, setHalfDay] = useState<boolean>(false);
  const [dates, setDates] = useState<[Dayjs, Dayjs] | null>(null);

  // mock: จำนวนวันลาทั้งหมดที่มีสิทธิ์
  const totalLeaveDays = 10;

  const handleChange = (info: { fileList: UploadFile[] }) => {
    setFileList(info.fileList);
  };

  const calculateLeaveDays = (): number => {
    if (!dates) return 0;

    let [start, end] = dates;
    let days = 0;
    let current = start.startOf("day");

    while (current.isBefore(end.endOf("day")) || current.isSame(end, "day")) {
      const day = current.day();
      // ข้ามเสาร์ (6) อาทิตย์ (0)
      if (day !== 0 && day !== 6) {
        days += 1;
      }
      current = current.add(1, "day");
    }

    // ถ้าเลือกครึ่งวันให้หักออกครึ่ง
    if (halfDay) {
      days -= 0.5;
    }

    return days;
  };

  const leaveDays = useMemo(() => calculateLeaveDays(), [dates, halfDay]);
  const remainingLeaveDays = totalLeaveDays - leaveDays;

  const summaryData = [
    {
      key: "1",
      leaveType:
        leaveType === "sick"
          ? "ลาป่วย"
          : leaveType === "business"
          ? "ลากิจ"
          : leaveType === "4"
          ? "ลาคลอดบุตร"
          : "ลาพักร้อน",
      countries: "ต่างประเทศ",
      // leaveMode: halfDay ? "ครึ่งวัน" : "เต็มวัน",
      leaveDays: leaveDays,
      remaining: remainingLeaveDays,
    },
  ];

  const columns = [
    { title: "ประเภทการลา", dataIndex: "leaveType" },
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
        className="max-w-lg p-6 border rounded-lg bg-white shadow-sm"
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
            <Radio value="4">ลาคลอดบุตร</Radio>
          </Radio.Group>
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

        {/* ครึ่งวัน */}
        <Form.Item label="ลาเต็มวัน/ครึ่งวัน" name="halfDay">
          <Radio.Group
            value={halfDay}
            onChange={(e) => setHalfDay(e.target.value)}
          >
            <Radio value={false}>เต็มวัน</Radio>
            <Radio value={true}>ครึ่งวัน</Radio>
          </Radio.Group>
          {halfDay && (
             <Radio.Group
              value='halfDayTime'
            >
              <Radio value={false}>ครึ่งเช้า</Radio>
              <Radio value={true}>ครึ่งบ่าย</Radio>
            </Radio.Group>
          )}
        </Form.Item>

        {/* แนบเอกสาร - แสดงเฉพาะลาป่วย */}
        {leaveType === "sick" && (
          <Form.Item label="แนบเอกสารเพิ่มเติม" name="attachments">
            <Upload fileList={fileList} onChange={handleChange}>
              <Button icon={<UploadOutlined />}>เลือกไฟล์</Button>
            </Upload>
          </Form.Item>
        )}

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

export default GeneralLeaveForm;
