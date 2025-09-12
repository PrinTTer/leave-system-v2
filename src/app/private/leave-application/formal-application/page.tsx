"use client";

import React, { useState } from "react";
import { Form, Select, DatePicker, Radio, Row, Col, Table, Button,  } from "antd";
import { Dayjs } from "dayjs";
import GeneralLeaveForm from "../general-application/page";
import Input from "antd/es/input/Input";

const { RangePicker } = DatePicker;

interface LeaveSummary {
  key: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
}

const FormalApplicationForm: React.FC = () => {
  const [leaveType, setLeaveType] = useState<string>("1");
  const [personalLeave, setPersonalLeave] = useState<string>("2");
  const [leaveRange, setLeaveRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [totalWeekdays, setTotalWeekdays] = useState<number>(0);
  const [summaryData, setSummaryData] = useState<LeaveSummary[]>([]);

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
      setTotalWeekdays(count);

      // อัปเดตสรุปวันลาราชการ
      setSummaryData((prev) => [
        ...prev.filter(item => item.type !== "ลาราชการ"),
        {
          key: "1",
          type: "ลาราชการ",
          startDate: start.format("YYYY-MM-DD"),
          endDate: end.format("YYYY-MM-DD"),
          days: count,
        },
      ]);
    } else {
      setTotalWeekdays(0);
      setSummaryData((prev) => prev.filter(item => item.type !== "ลาราชการ"));
    }
  };

  const handlePersonalLeaveChange = (value: string) => {
    setPersonalLeave(value);

    if (value === "1" && leaveRange) {
      // สมมติลากิจ 1 วันต่อการลา
      setSummaryData((prev) => [
        ...prev.filter(item => item.type !== "ลากิจ"),
        {
          key: "2",
          type: "ลากิจ",
          startDate: leaveRange[0].format("YYYY-MM-DD"),
          endDate: leaveRange[1].format("YYYY-MM-DD"),
          days: totalWeekdays,
        },
      ]);
    } else {
      setSummaryData((prev) => prev.filter(item => item.type !== "ลากิจ"));
    }
  };

  const columns = [
    { title: "ประเภทการลา", dataIndex: "type", key: "type" },
    { title: "เริ่มวันที่", dataIndex: "startDate", key: "startDate" },
    { title: "สิ้นสุดวันที่", dataIndex: "endDate", key: "endDate" },
    { title: "จำนวนวันลา", dataIndex: "days", key: "days" },
  ];

  return (
    <div>
      <Form layout="vertical" className="max-w-2xl p-6 border rounded-lg bg-white shadow-sm">
        <Form.Item
          label="ไปราชการ"
          name="leaveType"
          rules={[{ required: true, message: "กรุณาเลือกประเภทการไปราชการ" }]}
        >
          <Radio.Group value={leaveType} onChange={e => setLeaveType(e.target.value)} defaultValue="1">
            <Radio value="1">ในประเทศ</Radio>
            <Radio value="2">ต่างประเทศ</Radio>
          </Radio.Group>
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            {leaveType === "1" ? (
              <Form.Item
                label="มีความประสงค์จะเดินทางไปจังหวัด"
                name="province"
                rules={[{ required: true, message: "กรุณาเลือกจังหวัด" }]}
              >
                <Select
                  showSearch
                  placeholder="-- กรุณาระบุจังหวัด --"
                  optionFilterProp="label"
                  options={[
                    { value: "bkk", label: "กรุงเทพมหานคร" },
                    { value: "chiangmai", label: "เชียงใหม่" },
                    { value: "phuket", label: "ภูเก็ต" },
                    { value: "chonburi", label: "ชลบุรี" },
                    { value: "khonkaen", label: "ขอนแก่น" },
                  ]}
                />
              </Form.Item>
            ) : (
              <Form.Item
                label="มีความประสงค์จะเดินทางไปประเทศ"
                name="country"
                rules={[{ required: true, message: "กรุณาเลือกประเทศ" }]}
              >
                <Select
                  showSearch
                  placeholder="-- กรุณาระบุประเทศ --"
                  optionFilterProp="label"
                  options={[
                    { value: "us", label: "สหรัฐอเมริกา" },
                    { value: "uk", label: "สหราชอาณาจักร" },
                    { value: "jp", label: "ญี่ปุ่น" },
                    { value: "kr", label: "เกาหลีใต้" },
                    { value: "cn", label: "จีน" },
                    { value: "fr", label: "ฝรั่งเศส" },
                    { value: "de", label: "เยอรมนี" },
                    { value: "au", label: "ออสเตรเลีย" },
                    { value: "sg", label: "สิงคโปร์" },
                  ]}
                />
              </Form.Item>
            )}
          </Col>
          <Col span={12}>
            <Form.Item
              label="มีกำหนดตั้งแต่วันที่ - ถึงวันที่"
              name="duration"
              rules={[{ required: true, message: "กรุณาเลือกช่วงเวลา" }]}
            >
              <RangePicker style={{ width: "100%" }} onChange={handleRangeChange} />
            </Form.Item>
          </Col>
        </Row>

        <Form.List name="followers" >
          {(fields, { add, remove }) => (
            <div className="mb-4" style={{ marginBottom: 16 }}>
              <Row align="middle" className="mb-2">
                <Col>
                  <label className="font-semibold">ผู้ติดตาม</label>
                </Col>
                <Col>
                  <Button type="link" onClick={() => add()} size="small">
                    + เพิ่มผู้ติดตาม
                  </Button>
                </Col>
              </Row>

              {fields.map(field => (
                <Row gutter={8} key={field.key} align="middle" className="mb-1">
                  <Col flex="auto">
                    <Form.Item
                      {...field}
                      rules={[{ required: false, message: "กรุณากรอกชื่อผู้ติดตาม" }]}
                      style={{ marginBottom: 0 }}
                    >
                      <Input size="small" placeholder="ชื่อผู้ติดตาม" />
                    </Form.Item>
                  </Col>
                  <Col>
                    <Button type="link" danger size="small" onClick={() => remove(field.name)}>
                      ลบ
                    </Button>
                  </Col>
                </Row>
              ))}
            </div>
          )}
        </Form.List>


        <Form.Item label="มีลากิจร่วมด้วยหรือไม่">
          <Radio.Group defaultValue="2" onChange={e => handlePersonalLeaveChange(e.target.value)}>
            <Radio value="1">มีลากิจ</Radio>
            <Radio value="2">ไม่มีลากิจ</Radio>
          </Radio.Group>
        </Form.Item>

        {personalLeave === "1" && <GeneralLeaveForm />}
      </Form>
    </div>
  );
};

export default FormalApplicationForm;
