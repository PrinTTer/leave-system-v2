"use client";

import React, { useState } from "react";
import { Form, Select, DatePicker, Radio, Row, Col, Table, Button, Checkbox, Input, InputNumber, Typography } from "antd";
import { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface LeaveSummary {
  key: string;
  type: string;
  startDate?: string;
  endDate?: string;
  days: number;
  remaining: number;
}

const InternationalFormalLeaveForm: React.FC = () => {
  const totalBusinessLeave = 10; // วันลากิจ/ราชการรวมสูงสุดสมมติ
  const totalPersonalLeave = 5; // วันลากิจสูงสุดสมมติ

  const [leaveRange, setLeaveRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [totalBusinessDays, setTotalBusinessDays] = useState<number>(0);
  const [hasPersonalLeave, setHasPersonalLeave] = useState<string>("2"); // 1=มี, 2=ไม่มี
  const [personalLeaveDays, setPersonalLeaveDays] = useState<number>(0);
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);

  const handleRangeChange = (dates: [Dayjs, Dayjs] | null) => {
    setLeaveRange(dates);

    if (dates) {
      const [start, end] = dates;
      let count = 0;
      let current = start.startOf("day");

      while (current.isBefore(end) || current.isSame(end, "day")) {
        const day = current.day();
        if (day !== 0 && day !== 6) count++; // จันทร์-ศุกร์
        current = current.add(1, "day");
      }
      setTotalBusinessDays(count);
    } else {
      setTotalBusinessDays(0);
    }
  };

  const handleExpensesChange = (checkedValues: Checkbox.Value[]) => {
    setSelectedExpenses(checkedValues as string[]);
  };

  const summaryData: LeaveSummary[] = [
    {
      key: "1",
      type: "ไปราชการต่างประเทศ",
      startDate: leaveRange?.[0].format("YYYY-MM-DD"),
      endDate: leaveRange?.[1].format("YYYY-MM-DD"),
      days: totalBusinessDays,
      remaining: totalBusinessLeave - totalBusinessDays,
    },
    {
      key: "2",
      type: "ลากิจ",
      days: personalLeaveDays,
      remaining: totalPersonalLeave - personalLeaveDays,
    },
  ];

  const columns = [
    { title: "ประเภทการลา", dataIndex: "type", key: "type" },
    { title: "เริ่มวันที่", dataIndex: "startDate", key: "startDate" },
    { title: "สิ้นสุดวันที่", dataIndex: "endDate", key: "endDate" },
    { title: "จำนวนวันลา", dataIndex: "days", key: "days" },
    {
      title: "วันคงเหลือ",
      dataIndex: "remaining",
      key: "remaining",
      render: (val: number) => <Text type={val < 0 ? "danger" : undefined}>{val}</Text>,
    },
  ];

  const isOverLimit = summaryData.some(item => item.remaining < 0);

  return (
    <div>
      <Form layout="vertical" className="max-w-2xl p-6 border rounded-lg bg-white shadow-sm">
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
          <Col span={12}>
            <Form.Item label="มีกำหนดตั้งแต่วันที่ - ถึงวันที่" name="duration">
              <RangePicker style={{ width: "100%" }} onChange={handleRangeChange} />
            </Form.Item>
          </Col>
        </Row>

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
            {selectedExpenses.includes("driver") && <InputNumber min={0} placeholder="จำนวนเงิน" className="ml-6 mt-1" />}

            <Checkbox value="accommodation">ค่าเช่าที่พัก</Checkbox>
            {selectedExpenses.includes("accommodation") && <InputNumber min={0} placeholder="จำนวนเงิน" className="ml-6 mt-1" />}

            <Checkbox value="vehicle">ค่ายานพาหนะ</Checkbox>
            {selectedExpenses.includes("vehicle") && (
              <div className="ml-6 mt-1 flex gap-2">
                <Input placeholder="เช่น เหมารถตู้ 1 คัน" style={{ width: "50%" }} />
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

        {/* Radio ลากิจ */}
        <Form.Item label="มีลากิจ">
          <Radio.Group
            value={hasPersonalLeave}
            onChange={(e) => setHasPersonalLeave(e.target.value)}
          >
            <Radio value="1">มี</Radio>
            <Radio value="2">ไม่มี</Radio>
          </Radio.Group>
          {hasPersonalLeave === "1" && (
            <div className="mt-2">
              <InputNumber
                min={0}
                value={personalLeaveDays}
                onChange={(val) => setPersonalLeaveDays(val || 0)}
                placeholder="จำนวนวันลากิจ/พักร้อน"
              />
            </div>
          )}
        </Form.Item>

        {/* ตารางสรุป */}
        <div className="mt-6 mb-4">
          <Table dataSource={summaryData} pagination={false} bordered columns={columns} />
        </div>

        <Form.Item style={{marginTop: 10}}>
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
