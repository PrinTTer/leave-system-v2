"use client";

import { useState, useEffect } from "react";
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
import { FactFormInput, LeaveTimeType, Status } from "@/types/factForm";
import { User } from "@/types/user";
import { getAllFactLeaveCreditLeftByUser } from "@/services/factCreditLeaveApi";
import { FactCreditLeaveInfo } from "@/types/factCreditLeave";
import { Attachment } from "@/types/common";
import { convertFileToBase64 } from "@/app/utils/file";
import { createFactform } from "@/services/factFormApi";
import { calculateLeaveDays } from "@/app/utils/calculate";
import { CalendarSchedule } from "@/types/calendar";
import { fetchHolidaysByYear } from "@/services/calendarApi";

const { Text } = Typography;

interface GeneralLeaveFormProps {
  user: User;
}

const GeneralLeaveForm: React.FC<GeneralLeaveFormProps> = ({ user }) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [attachment, setAttachment] = useState<Attachment>({} as Attachment);

  const [selectedleaveType, setSelectedLeaveType] = useState<number>();
  const [reason, setReason] = useState<string>("");

  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);

  const [startType, setStartType] = useState<LeaveTimeType>("full");
  const [endType, setEndType] = useState<LeaveTimeType>("full");
  const [leaveDays, setLeaveDays] = useState<number>(0);
  const [holiday, setHoliday] = useState<CalendarSchedule[]>([]);

  const [factCreditLeave, setFactCreditLeave] = useState<FactCreditLeaveInfo[]>(
    []
  );

  useEffect(() => {
    const fetchHolidays = async () => {
      const holiday = await fetchHolidaysByYear(
        startDate ? startDate.year() : new Date().getFullYear()
      );
      setHoliday(holiday);
    };
    fetchHolidays();
  }, [startDate]);

  useEffect(() => {
    if (!user.nontri_account) return;

    const fetchFactCreditLeave = async () => {
      const data = await getAllFactLeaveCreditLeftByUser(user.nontri_account);
      setFactCreditLeave(data);
    };
    fetchFactCreditLeave();
  }, [user.nontri_account]);

  const selectedleaveTypeObj = factCreditLeave.find(
    (leave) => leave.leave_type_id === selectedleaveType
  );

  console.log(selectedleaveType, selectedleaveTypeObj);

  const handleChange = async (info: { fileList: UploadFile[] }) => {
    setFileList(info.fileList);

    if (info.fileList.length > 0) {
      const file = info.fileList[0].originFileObj as File;
      const base64 = await convertFileToBase64(file);
      setAttachment({
        fileName: file.name,
        fileType: file.type,
        data: base64,
      });
    } else {
      setAttachment({} as Attachment);
    }
  };

  const totalLeaveDays = selectedleaveTypeObj?.left_leave || 0;

  useEffect(() => {
    const calc = async () => {
      if (!startDate || !endDate) {
        setLeaveDays(0);
        return;
      }

      const days = await calculateLeaveDays(
        startDate,
        endDate,
        startType,
        endType,
        holiday
      );
      setLeaveDays(days);
    };

    calc();
  }, [startDate, endDate, startType, endType]);

  const remainingLeaveDays = totalLeaveDays - leaveDays;

  const summaryData = [
    {
      key: "1",
      leaveType: selectedleaveTypeObj?.leave_type?.name || "",

      countries: "ในประเทศ",
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

  const handleSubmit = async (status: string) => {
    const payload: FactFormInput = {
      nontri_account: user.nontri_account,
      leave_type_id: selectedleaveTypeObj?.leave_type_id || 1,
      start_date: startDate ? startDate.toDate() : new Date(),
      start_type: startType,
      end_date: endDate ? endDate.toDate() : new Date(),
      end_type: endType,
      total_day: leaveDays,
      reason: reason,
      status: status as Status,
      fiscal_year: new Date().getFullYear() + 543,
      attachment: attachment,
      leave_aboard: "ในประเทศ",
    };
    console.log("payload", payload);

    await createFactform(payload);
  };

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
            value={selectedleaveType}
            onChange={(e) => setSelectedLeaveType(e.target.value)}
          >
            {factCreditLeave.map((leave) => (
              <Radio key={leave.leave_type_id} value={leave.leave_type_id}>
                {leave.leave_type.name}
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>

        {/* เหตุผลการลา */}
        <Form.Item
          label="เหตุผลการลา"
          name="reason"
          rules={[{ required: true, message: "กรุณากรอกเหตุผลการลา" }]}
        >
          <Input.TextArea
            rows={3}
            placeholder="กรอกเหตุผลการลา..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
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
        {selectedleaveTypeObj?.leave_type?.name === "ลาป่วย" && (
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
                onClick={() => {
                  handleSubmit(Status.Draft);
                }}
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
                onClick={() => {
                  handleSubmit(Status.Pending);
                }}
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
