/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

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
  message,
} from "antd";
import type { CheckboxProps } from "antd";
import dayjs, { Dayjs } from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { formatThaiDate } from "@/app/utils";
import { CloseOutlined } from "@ant-design/icons";
import { createLeaveSnapshot, listLeaves } from "@/app/lib/leaveApi";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { RangePicker } = DatePicker;
const { Text } = Typography;

type CheckboxValueType = string | number | CheckboxProps["checked"];

const leaveTypes: Record<string, { label: string; color: string }> = {
  personal: { label: "ลากิจ", color: "orange" },
  vacation: { label: "ลาพักร้อน", color: "red" },
  business: { label: "ไปราชการ", color: "blue" },
};

interface LeaveDay {
  date: string;
  type: "business" | "personal" | "vacation";
}

const FormalApplicationForm: React.FC = () => {
  const [form] = Form.useForm();

  const totalBusinessLeave = 10;
  const totalPersonalLeave = 5;
  const totalVacationLeave = 5;

  const [leaveDays, setLeaveDays] = useState<LeaveDay[]>([]);
  const [range, setRange] = useState<{ start: Dayjs | null; end: Dayjs | null }>(
    { start: null, end: null }
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<"business" | "personal" | "vacation" | null>(null);

  const [assistants] = useState<string[]>([]);
  const [selectedExpenses, setSelectedExpenses] = useState<CheckboxValueType[]>([]);

  const [businessDays, setBusinessDays] = useState<number>();
  const [vacationDays, setVacationDays] = useState<number>();
  const [personalDays, setPersonalDays] = useState<number>();

  const [savingDraft, setSavingDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [listed, setListed] = useState<any>(null);

  // ==== Calendar handlers
  const handleSelect = (date: Dayjs) => {
    setRange({ start: date, end: date });
    setIsModalOpen(true);
  };

  const addRangeToDays = (s: Dayjs, e: Dayjs, type: "business" | "personal" | "vacation") => {
    const allDays: LeaveDay[] = [];
    let current = s;
    while (current.isSameOrBefore(e, "day")) {
      allDays.push({ date: current.format("YYYY-MM-DD"), type });
      current = current.add(1, "day");
    }
    setLeaveDays((prev) => {
      const filtered = prev.filter(
        (d) => !(dayjs(d.date).isSameOrAfter(s, "day") && dayjs(d.date).isSameOrBefore(e, "day"))
      );
      return [...filtered, ...allDays];
    });

    const weekdays = allDays.filter((d) => {
      const day = dayjs(d.date).day();
      return day >= 1 && day <= 5;
    }).length;

    switch (type) {
      case "business": setBusinessDays((p) => (p || 0) + weekdays); break;
      case "personal": setPersonalDays((p) => (p || 0) + weekdays); break;
      case "vacation": setVacationDays((p) => (p || 0) + weekdays); break;
    }
  };

  const handleOk = () => {
    if (range.start && range.end && selectedType) {
      addRangeToDays(range.start, range.end, selectedType);
    }
    setIsModalOpen(false);
    setSelectedType(null);
  };

  const handleCancel = () => {
    setRange({ start: null, end: null });
    setIsModalOpen(false);
  };

  const handleRemoveLeave = (date: string) => {
    setLeaveDays((prev) => prev.filter((d) => d.date !== date));
    if (range.start?.format("YYYY-MM-DD") === date || range.end?.format("YYYY-MM-DD") === date) {
      setRange({ start: null, end: null });
    }
  };

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

  // ==== Summary + expenses
  const handleExpensesChange = (checkedValues: CheckboxValueType[]) => {
    setSelectedExpenses(checkedValues);
  };

  const summaryData = [
    {
      key: "1",
      type: "ลาราชการ",
      dates: leaveDays.filter((d) => d.type === "business").map((d) => d.date),
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

  // ==== Build payload + API calls
  const gatherDatesAndType = () => {
    const types = new Set(leaveDays.map((d) => d.type));
    return {
      uniqueTypes: types,
      dates: leaveDays.map((d) => d.date),
      oneType: types.size === 1 ? (Array.from(types)[0] as "business" | "personal" | "vacation") : null,
    };
  };

  // auto เติมช่วงที่เลือกถ้ายังไม่ได้กด "เพิ่มการลา"
  const ensureCurrentRangeAppended = () => {
    if (!leaveDays.length && range.start && range.end && selectedType) {
      addRangeToDays(range.start, range.end, selectedType);
      message.info("เพิ่มช่วงวันที่ที่เลือกเข้าใบลาให้อัตโนมัติแล้ว");
    }
  };

  const buildPayload = (status: "DRAFT" | "PENDING") => {
    ensureCurrentRangeAppended();
    const { uniqueTypes, dates, oneType } = gatherDatesAndType();
    if (!dates.length) {
      message.error("กรุณาเลือกวันที่ลาอย่างน้อย 1 วัน");
      return null;
    }
    if (uniqueTypes.size !== 1) {
      message.error("ใบลาหนึ่งอนุญาตเฉพาะ 1 ประเภทการลา");
      return null;
    }

    const requester = { userId: 42, name: "สมชาย ใจดี", department: "วิศวกรรม" };
    const expenses: any[] = (selectedExpenses as string[]).map((t) => ({ type: t }));

    return {
      requester,
      leaveType: oneType!,
      dates,
      reason: (form.getFieldValue("reason") as string) || "",
      assistants,
      expenses,
      status,
    } as const;
  };

  const refreshList = async () => {
    try {
      const data = await listLeaves();
      setListed(data);
    } catch {
      /* ignore */
    }
  };

  const onSaveDraft = async () => {
    console.log("[UI] click save draft");
    const payload = buildPayload("DRAFT");
    if (!payload) return;
    try {
      setSavingDraft(true);
      const hide = message.loading("กำลังบันทึกฉบับร่าง...", 0);
      const res = await createLeaveSnapshot(payload as any);
      setLastResult(res);
      hide();
      message.success(`บันทึกฉบับร่างแล้ว: ${res.requestId}`);
      console.debug("[Draft saved]", res);
      await refreshList();
    } catch (e: any) {
      message.error(`บันทึกล้มเหลว: ${e.message}`);
      console.debug("[Draft error]", e);
    } finally {
      setSavingDraft(false);
    }
  };

  const onSubmit = async () => {
    console.log("[UI] click submit");
    const payload = buildPayload("PENDING");
    if (!payload) return;
    try {
      setSubmitting(true);
      const hide = message.loading("กำลังส่งใบลา...", 0);
      const res = await createLeaveSnapshot(payload as any);
      setLastResult(res);
      hide();
      message.success(`ส่งใบลาเรียบร้อย: ${res.requestId}`);
      console.debug("[Submit success]", res);
      await refreshList();
    } catch (e: any) {
      message.error(`ส่งลาล้มเหลว: ${e.message}`);
      console.debug("[Submit error]", e);
    } finally {
      setSubmitting(false);
    }
  };

  // ==== FORCE TEST BUTTON: ยิง API ตรงๆ ไม่พึ่ง form
  const testFire = async () => {
    console.log("[UI] testFire");
    try {
      const res = await createLeaveSnapshot({
        requester: { userId: 42, name: "สมชาย ใจดี", department: "วิศวกรรม" },
        leaveType: "business",
        dates: ["2025-11-10", "2025-11-11"],
        reason: "test",
        assistants: [],
        expenses: [],
        status: "DRAFT",
      } as any);
      setLastResult(res);
      message.success("ทดสอบยิง API สำเร็จ");
      await refreshList();
    } catch (e: any) {
      message.error(`ทดสอบล้มเหลว: ${e.message}`);
    }
  };

  // ==== UI
  return (
    <div>
      <Form
        form={form}
        layout="vertical"
        onSubmitCapture={(e) => e.preventDefault()}
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

        <Form.Item
          label="เนื่องจาก"
          name="reason"
          rules={[{ required: true, message: "กรุณากรอกเหตุผลการลา" }]}
        >
          <Input.TextArea rows={3} placeholder="..." />
        </Form.Item>

        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="เลือกประเภทการลา" name="leavetype">
              <Select
                style={{ width: "100%" }}
                placeholder="เลือกประเภทการลา"
                value={selectedType || undefined}
                onChange={(val) => setSelectedType(val as any)}
                options={[
                  { value: "business", label: leaveTypes.business.label },
                  { value: "personal", label: leaveTypes.personal.label },
                  { value: "vacation", label: leaveTypes.vacation.label },
                ]}
              />
            </Form.Item>
          </Col>

          <Col span={10}>
            <Form.Item label="มีกำหนดตั้งแต่วันที่ ถึง วันที่" name="leaveRange">
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

          <Col span={8}>
            <Form.Item /* ไม่มี label เพื่อไม่ให้ antd ใส่ <label htmlFor> โดยไม่มี input จริง */>
              <Button
                htmlType="button"
                type="primary"
                onClick={handleOk}
                style={{ width: "40%", marginTop: 30 }}
              >
                เพิ่มการลา
              </Button>
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
            title={`เพิ่มการลา วันที่ ${formatThaiDate(range.start)}`}
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            okText="บันทึก"
            cancelText="ยกเลิก"
          >
            <Form.Item label="ประเภทการลา" name="modalLeaveType">
              <Select
                style={{ width: "100%" }}
                placeholder="เลือกประเภทการลา"
                value={selectedType || undefined}
                onChange={(val) => setSelectedType(val as any)}
                options={[
                  { value: "business", label: "ไปราชการ" },
                  { value: "personal", label: "ลากิจ" },
                  { value: "vacation", label: "ลาพักร้อน" },
                ]}
              />
            </Form.Item>
          </Modal>
        </div>

        {/* --- แทนที่จะใช้ Form.Item label="รายละเอียดการเดินทาง" --- */}
        <Typography.Text strong>รายละเอียดการเดินทาง</Typography.Text>
        <Row gutter={16} style={{ marginTop: 8 }}>
          <Col span={12}>
            <Form.Item label="ยี่ห้อรถ" name="vehicleBrand">
              <Input placeholder="เช่น TOYOTA" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="ป้ายทะเบียน" name="vehiclePlate">
              <Input placeholder="เช่น กข 1234" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label="พนักงานขับรถ" name="driverName">
          <Input placeholder="ชื่อพนักงาน (ถ้ามี)" />
        </Form.Item>

        <Form.Item label="ขอเบิกค่าใช้จ่าย" name="expenseFlags">
          <Checkbox.Group
            style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            onChange={handleExpensesChange}
          >
            <Checkbox value="rs">ค่าเบี้ยเลี้ยงเดินทาง (รศ)</Checkbox>
            {(selectedExpenses as string[]).includes("rs") && (
              <div className="ml-6 mt-1 flex gap-2">
                <InputNumber min={0} placeholder="จำนวนเงินต่อคน" />
                <InputNumber min={1} placeholder="จำนวนคน" />
              </div>
            )}

            <Checkbox value="asst">ค่าเบี้ยเลี้ยงเดินทาง (ผศ ลงมา)</Checkbox>
            {(selectedExpenses as string[]).includes("asst") && (
              <div className="ml-6 mt-1 flex gap-2">
                <InputNumber min={0} placeholder="จำนวนเงินต่อคน" />
                <InputNumber min={1} placeholder="จำนวนคน" />
              </div>
            )}

            <Checkbox value="driver">ค่าตอบแทนพนักงานขับรถ</Checkbox>
            {(selectedExpenses as string[]).includes("driver") && (
              <InputNumber min={0} placeholder="จำนวนเงิน" className="ml-6 mt-1" />
            )}

            <Checkbox value="accommodation">ค่าเช่าที่พัก</Checkbox>
            {(selectedExpenses as string[]).includes("accommodation") && (
              <InputNumber min={0} placeholder="จำนวนเงิน" className="ml-6 mt-1" />
            )}

            <Checkbox value="vehicle">ค่ายานพาหนะ</Checkbox>
            {(selectedExpenses as string[]).includes("vehicle") && (
              <div className="ml-6 mt-1 flex gap-2">
                <Input placeholder="เช่น เหมารถตู้ 1 คัน" style={{ width: "50%" }} />
                <InputNumber min={0} placeholder="จำนวนเงิน" />
              </div>
            )}

            <Checkbox value="other">ค่าใช้จ่ายอื่นๆ</Checkbox>
            {(selectedExpenses as string[]).includes("other") && (
              <div className="ml-6 mt-1 flex gap-2">
                <Input placeholder="ระบุรายละเอียด" style={{ width: "50%" }} />
                <InputNumber min={0} placeholder="จำนวนเงิน" />
              </div>
            )}
          </Checkbox.Group>
        </Form.Item>

        <div className="mt-6 mb-4">
          <Table dataSource={summaryData} pagination={false} bordered columns={summaryColumns} />
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
            <Button htmlType="button" style={{ backgroundColor: "#8c8c8c", color: "#fff", border: "none" }}>
              ย้อนกลับ
            </Button>

            <Button
              htmlType="button"
              style={{ backgroundColor: "#52c41a", color: "#fff", border: "none" }}
              onClick={onSaveDraft}
              disabled={isOverLimit || savingDraft || submitting}
            >
              {savingDraft ? "กำลังบันทึก..." : "บันทึกฉบับร่าง"}
            </Button>

            <Button
              htmlType="button"
              type="primary"
              style={{ border: "none" }}
              onClick={onSubmit}
              disabled={isOverLimit || savingDraft || submitting}
            >
              {submitting ? "กำลังส่ง..." : "ส่งใบลา"}
            </Button>

            {/* ปุ่มทดสอบยิง API ตรงๆ */}
            <Button htmlType="button" onClick={testFire}>
              ทดสอบยิง API ตรงๆ
            </Button>
          </div>

          {isOverLimit && (
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
              <Button onClick={refreshList} style={{ marginTop: 8 }}>รีเฟรชรายการไฟล์ใน STORAGE_ROOT</Button>
              {listed && (
                <pre
                  style={{
                    marginTop: 8,
                    maxHeight: 260,
                    overflow: "auto",
                    background: "#f0f0f0",
                    padding: 12,
                    borderRadius: 8,
                  }}
                >
{JSON.stringify(listed, null, 2)}
                </pre>
              )}
            </div>
          )}
        </Form.Item>
      </Form>
    </div>
  );
};

export default FormalApplicationForm;
