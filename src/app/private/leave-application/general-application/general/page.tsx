/* eslint-disable @typescript-eslint/no-explicit-any */
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
  message,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import { UploadOutlined } from "@ant-design/icons";
import { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { createLeaveSnapshot } from "@/app/lib/leaveApi";

const { Text } = Typography;

// ---- helper
const mapToValue = (val: string): number => {
  if (val === "full") return 1;
  if (val === "am" || val === "pm") return 0.5;
  return 0;
};

// คืน array ของวันที่แบบ YYYY-MM-DD รวมปลายทาง
const datesBetween = (start: Dayjs, end: Dayjs) => {
  const out: string[] = [];
  let cur = start.startOf("day");
  const last = end.startOf("day");
  while (cur.isSame(last, "day") || cur.isBefore(last, "day")) {
    out.push(cur.format("YYYY-MM-DD"));
    cur = cur.add(1, "day");
  }
  return out;
};

// map ประเภท UI -> ชนิดที่ API รองรับ
// (ชั่วคราว: sick/maternity(4) map เป็น "personal")
const normalizeLeaveType = (
  t: string
): "business" | "personal" | "vacation" => {
  if (t === "business") return "business";
  if (t === "vacation") return "vacation";
  return "personal";
};

const GeneralLeaveForm: React.FC = () => {
  const [form] = Form.useForm();

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [leaveType, setLeaveType] = useState<string>("");

  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);

  const [startType, setStartType] = useState<string>("full");
  const [endType, setEndType] = useState<string>("full");

  const [savingDraft, setSavingDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

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

  // ===== ส่งไป createLeaveSnapshot =====
  const buildPayload = (status: "DRAFT" | "PENDING") => {
    if (!leaveType) {
      message.error("กรุณาเลือกประเภทการลา");
      return null;
    }
    if (!startDate || !endDate) {
      message.error("กรุณาเลือกวันที่เริ่มและสิ้นสุด");
      return null;
    }
    if (endDate.isBefore(startDate, "day")) {
      message.error("วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่ม");
      return null;
    }

    // แปลงช่วงวันที่เป็น array YYYY-MM-DD (ชั่วคราวยังไม่แยกครึ่งวัน)
    const dates = datesBetween(startDate, endDate);

    const reason = (form.getFieldValue("reason") as string) || "";
    const halfNote = `[ช่วงเวลา: เริ่ม=${startType}, สิ้นสุด=${endType}]`;

    // mock requester; ภายหลังดึงจาก Auth จริง
    const requester = { userId: 42, name: "สมชาย ใจดี", department: "วิศวกรรม" };

    return {
      requester,
      leaveType: normalizeLeaveType(leaveType),
      dates,
      reason: `${reason} ${halfNote}`.trim(),
      assistants: [],
      expenses: [],
      status,
    } as const;
  };

  const onSaveDraft = async () => {
    const payload = buildPayload("DRAFT");
    if (!payload) return;
    try {
      setSavingDraft(true);
      const hide = message.loading("กำลังบันทึกฉบับร่าง...", 0);
      const res = await createLeaveSnapshot(payload as any);
      setLastResult(res);
      hide();
      message.success(`บันทึกฉบับร่างแล้ว: ${res.requestId}`);
      // console.debug("[Draft saved]", res);
    } catch (e: any) {
      message.error(`บันทึกล้มเหลว: ${e.message}`);
    } finally {
      setSavingDraft(false);
    }
  };

  const onSubmit = async () => {
    const payload = buildPayload("PENDING");
    if (!payload) return;
    try {
      setSubmitting(true);
      const hide = message.loading("กำลังส่งใบลา...", 0);
      const res = await createLeaveSnapshot(payload as any);
      setLastResult(res);
      hide();
      message.success(`ส่งใบลาเรียบร้อย: ${res.requestId}`);
      // console.debug("[Submit success]", res);
    } catch (e: any) {
      message.error(`ส่งลาล้มเหลว: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // ปุ่มทดสอบยิง API ตรง ๆ
  const testFire = async () => {
    try {
      const res = await createLeaveSnapshot({
        requester: { userId: 42, name: "สมชาย ใจดี", department: "วิศวกรรม" },
        leaveType: "business",
        dates: [dayjs().format("YYYY-MM-DD")],
        reason: "test",
        assistants: [],
        expenses: [],
        status: "DRAFT",
      } as any);
      setLastResult(res);
      message.success("ทดสอบยิง API สำเร็จ");
    } catch (e: any) {
      message.error(`ทดสอบล้มเหลว: ${e.message}`);
    }
  };

  return (
    <div>
      <Form
        layout="vertical"
        form={form}
        className="max-w-lg p-6 border rounded-lg bg-white shadow-sm"
        onSubmitCapture={(e) => e.preventDefault()}
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

        {/* วันที่เริ่มและสิ้นสุด */}
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

        {/* แนบเอกสาร - เฉพาะลาป่วย (ยังไม่อัปโหลดจริง แค่เก็บไฟล์ใน state) */}
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

        {/* ปุ่ม */}
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
              htmlType="button"
              style={{
                backgroundColor: "#8c8c8c",
                color: "#fff",
                border: "none",
              }}
            >
              ย้อนกลับ
            </Button>

            <Button
              htmlType="button"
              style={{
                backgroundColor: "#52c41a",
                color: "#fff",
                border: "none",
              }}
              onClick={onSaveDraft}
              disabled={remainingLeaveDays < 0 || savingDraft || submitting}
            >
              {savingDraft ? "กำลังบันทึก..." : "บันทึกฉบับร่าง"}
            </Button>

            <Button
              htmlType="button"
              type="primary"
              style={{ border: "none" }}
              onClick={onSubmit}
              disabled={remainingLeaveDays < 0 || savingDraft || submitting}
            >
              {submitting ? "กำลังส่ง..." : "ส่งใบลา"}
            </Button>

            <Button htmlType="button" onClick={testFire}>
              ทดสอบยิง API ตรงๆ
            </Button>
          </div>

          {remainingLeaveDays < 0 && (
            <div style={{ width: "100%", textAlign: "center", marginTop: 8 }}>
              <Text type="danger" style={{ fontWeight: 500 }}>
                ระยะเวลาการลาเกินกว่าที่กำหนด
              </Text>
            </div>
          )}

          {lastResult && (
            <div style={{ width: "100%", marginTop: 16 }}>
              <Text strong>ผลลัพธ์ล่าสุด:</Text>
              <pre
                style={{
                  marginTop: 8,
                  maxHeight: 260,
                  overflow: "auto",
                  background: "#f6f6f6",
                  padding: 12,
                  borderRadius: 8,
                }}
              >
{JSON.stringify(lastResult, null, 2)}
              </pre>
            </div>
          )}
        </Form.Item>
      </Form>
    </div>
  );
};

export default GeneralLeaveForm;
