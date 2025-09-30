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
  Col,
  Row,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import { UploadOutlined } from "@ant-design/icons";
import { Dayjs } from "dayjs";
import Link from "next/link";

const { Text } = Typography;

// helper แปลงค่า
const mapToValue = (val: string): number => {
  if (val === "full") return 1;
  if (val === "am" || val === "pm") return 0.5;
  return 0;
};

const GeneralLeaveForm: React.FC = () => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [leaveType, setLeaveType] = useState<string>("");

  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);

  const [startType, setStartType] = useState<string>("full");
  const [endType, setEndType] = useState<string>("full");

  const totalLeaveDays = 10;

  const handleChange = (info: { fileList: UploadFile[] }) => {
    setFileList(info.fileList);
  };

  const calculateLeaveDays = (): number => {
    if (!startDate || !endDate) return 0;
    const diff = endDate.diff(startDate, "day");
    if (diff < 0) return 0;

    if (diff === 0) {
      return mapToValue(startType);
    }

    const days = diff - 1;
    return days + mapToValue(startType) + mapToValue(endType);
  };

  const leaveDays = useMemo(
    () => calculateLeaveDays(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [startDate, endDate, startType, endType]
  );

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
          rules={[{ required: true, message: "กรุณากรอกเหตุผลการลา" }]}
        >
          <Input.TextArea rows={3} placeholder="กรอกเหตุผลการลา..." />
        </Form.Item>

        {/* วันที่เริ่มและสิ้นสุดให้อยู่แถวเดียวกัน */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="มีกำหนดตั้งแต่วันที่"
              name="startDate"
              rules={[{ required: true, message: "กรุณาเลือกวันที่เริ่ม" }]}
            >
              <DatePicker
                value={startDate}
                onChange={(d) => setStartDate(d)}
                style={{ width: "100%" }}
              />
            </Form.Item>
            {startDate && (
              <Form.Item
                name="startType"
                rules={[{ required: true, message: "กรุณาเลือกช่วงเวลา" }]}
              >
                <Radio.Group
                  value={startType}
                  onChange={(e) => setStartType(e.target.value)}
                >
                  <Radio value="full">เต็มวัน</Radio>
                  <Radio value="am">ครึ่งเช้า</Radio>
                  <Radio value="pm">ครึ่งบ่าย</Radio>
                </Radio.Group>
              </Form.Item>
            )}
          </Col>

          <Col span={12}>
            <Form.Item
              label="ถึงวันที่"
              name="endDate"
              rules={[{ required: true, message: "กรุณาเลือกวันที่สิ้นสุด" }]}
            >
              <DatePicker
                value={endDate}
                onChange={(d) => setEndDate(d)}
                style={{ width: "100%" }}
              />
            </Form.Item>
            {endDate && startDate && !startDate.isSame(endDate, "day") && (
              <Form.Item
                name="endType"
                rules={[{ required: true, message: "กรุณาเลือกช่วงเวลา" }]}
              >
                <Radio.Group
                  value={endType}
                  onChange={(e) => setEndType(e.target.value)}
                >
                  <Radio value="full">เต็มวัน</Radio>
                  <Radio value="am">ครึ่งเช้า</Radio>
                  <Radio value="pm">ครึ่งบ่าย</Radio>
                </Radio.Group>
              </Form.Item>
            )}
          </Col>
        </Row>

        {/* แนบเอกสาร - เฉพาะลาป่วย */}
        {leaveType === "sick" && (
          <Form.Item
            label="แนบเอกสารเพิ่มเติม"
            name="attachments"
            rules={[{ required: true, message: "กรุณาแนบไฟล์เอกสาร" }]}
          >
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
            <Link href="/private">
              <Button
                style={{
                  backgroundColor: "#8c8c8c",
                  color: "#fff",
                  border: "none",
                }}
              >
                ย้อนกลับ
              </Button>
            </Link>

            <Link href="/private">
              <Button
                style={{
                  backgroundColor: "#52c41a",
                  color: "#fff",
                  border: "none",
                }}
                disabled={remainingLeaveDays < 0}
              >
                บันทึกฉบับร่าง
              </Button>
            </Link>

            <Link href="/private">
              {" "}
              <Button
                type="primary"
                style={{ border: "none" }}
                disabled={remainingLeaveDays < 0}
              >
                ส่งใบลา
              </Button>
            </Link>
          </div>

          {remainingLeaveDays < 0 && (
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

export default GeneralLeaveForm;
