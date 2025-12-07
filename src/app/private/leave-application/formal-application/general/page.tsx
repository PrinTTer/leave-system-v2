"use client";
import React, { useState } from "react";
import {
  Form,
  Select,
  Table,
  Button,
  Checkbox,
  Input,
  InputNumber,
  Typography,
  Row,
  Col,
  Tag,
} from "antd";
import type { CheckboxProps } from "antd";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import LeaveCalendar from "@/app/components/leave-application/LeaveCalendar";
import { provinces } from "@/mock/provinces";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

type CheckboxValueType = string | number | CheckboxProps["checked"];
const { Text } = Typography;

const leaveTypes: Record<string, { label: string; color: string }> = {
  personal: { label: "ลากิจส่วนตัว", color: "orange" },
  vacation: { label: "ลาพักผ่อน", color: "green" },
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

  const [assistants, setAssistants] = useState<string[]>([]);

  const [selectedExpenses, setSelectedExpenses] = useState<CheckboxValueType[]>(
    []
  );

  const handleExpensesChange = (checkedValues: CheckboxValueType[]) => {
    setSelectedExpenses(checkedValues);
  };

  const summaryData = [
    {
      key: "1",
      type: "ลาราชการ",
      dates: leaveDays.filter((d) => d.type === "business").map((d) => d.date),
      days: leaveDays.filter((d) => d.type === "business").length,
      remaining:
        totalBusinessLeave -
        leaveDays.filter((d) => d.type === "business").length,
    },
    {
      key: "2",
      type: "ลากิจ",
      dates: leaveDays.filter((d) => d.type === "personal").map((d) => d.date),
      days: leaveDays.filter((d) => d.type === "personal").length,
      remaining:
        totalPersonalLeave -
        leaveDays.filter((d) => d.type === "personal").length,
    },
    {
      key: "3",
      type: "ลาพักร้อน",
      dates: leaveDays.filter((d) => d.type === "vacation").map((d) => d.date),
      days: leaveDays.filter((d) => d.type === "vacation").length,
      remaining:
        totalVacationLeave -
        leaveDays.filter((d) => d.type === "vacation").length,
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
                options={provinces.map((province) => ({
                  value: province.name_th,
                  label: province.name_th,
                }))}
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

        <LeaveCalendar
          leaveTypes={leaveTypes}
          onChange={(days) => {
            setLeaveDays(days);
          }}
        />

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

export default FormalApplicationForm;
