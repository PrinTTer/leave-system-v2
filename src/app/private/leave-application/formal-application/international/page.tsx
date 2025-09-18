"use client";

import React, { useEffect, useState } from "react";
import { Form, Select, DatePicker, Radio, Row, Col, Table, Button, Input, Typography, UploadFile, Upload } from "antd";
import { Dayjs } from "dayjs";
import { UploadOutlined } from "@ant-design/icons";

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
  const totalVacationLeave = 5

  const [leaveRange, setLeaveRange] = useState<[Dayjs | null, Dayjs | null] | null>(null)
  const [totalBusinessDays, setTotalBusinessDays] = useState<number>(0)

  const [hasPersonalLeave, setHasPersonalLeave] = useState<string>("2")
  const [personalLeaveRange, setPersonalLeaveRange] = useState<[Dayjs | null, Dayjs | null] | null>(null)
  const [personalLeaveDays, setPersonalLeaveDays] = useState<number>(0)

  const [hasVacationLeave, setHasVacationLeave] = useState<string>("2")
  const [vacationLeaveRange, setVacationLeaveRange] = useState<[Dayjs | null, Dayjs | null] | null>(null)
  const [vacationLeaveDays, setVacationLeaveDays] = useState<number>(0)

  const [assistants, setAssistants] = useState<string[]>([])
  const [countries, setCountries] = useState<string[]>([]);
  const [paid, setPaid] = useState<string>("1"); 
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleChange = (info: { fileList: UploadFile[] }) => {
    setFileList(info.fileList);
  }

  // รีเซ็ตลากิจเมื่อเลือก "ไม่มี"
useEffect(() => {
  if (hasPersonalLeave === "2") {
    setPersonalLeaveRange(null)
    setPersonalLeaveDays(0)
  }
}, [hasPersonalLeave])

// รีเซ็ตลาพักร้อนเมื่อเลือก "ไม่มี"
useEffect(() => {
  if (hasVacationLeave === "2") {
    setVacationLeaveRange(null)
    setVacationLeaveDays(0)
  }
}, [hasVacationLeave])

  // ฟังก์ชันนับวันทำงาน
  const countBusinessDays = (start: Dayjs, end: Dayjs): number => {
    let count = 0
    let current = start.startOf("day")
    while (current.isBefore(end) || current.isSame(end, "day")) {
      const day = current.day()
      if (day !== 0 && day !== 6) count++
      current = current.add(1, "day")
    }
    return count
  }

 // เปลี่ยนช่วงวันที่ลาราชการ
const handleBusinessRangeChange = (
  dates: [Dayjs | null, Dayjs | null] | null
) => {
  if (dates && dates[0] && dates[1]) {
    setLeaveRange(dates)
    setTotalBusinessDays(countBusinessDays(dates[0], dates[1]))
  } else {
    setLeaveRange(null)
    setTotalBusinessDays(0)
  }
}

  // เปลี่ยนช่วงวันที่ลากิจ
  const handlePersonalRangeChange = ( dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      setPersonalLeaveRange(dates)
      setPersonalLeaveDays(countBusinessDays(dates[0], dates[1]))
    } else {
      setLeaveRange(null)
      setPersonalLeaveDays(0)
    }
  }

  // เปลี่ยนช่วงวันที่ลาพักร้อน
  const handleVacationRangeChange = ( dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      setVacationLeaveRange(dates)
      setVacationLeaveDays(countBusinessDays(dates[0], dates[1]))
    } else {
      setVacationLeaveRange(null)
      setVacationLeaveDays(0)
    }
  }


const summaryData: LeaveSummary[] = [
    {
      key: "1",
      type: "ลาราชการ",
      startDate: leaveRange?.[0]?.format("YYYY-MM-DD"),
      endDate: leaveRange?.[1]?.format("YYYY-MM-DD"),
      days: totalBusinessDays,
      remaining: totalBusinessLeave - totalBusinessDays,
    },
    {
      key: "2",
      type: "ลากิจ",
      startDate: personalLeaveRange?.[0]?.format("YYYY-MM-DD"),
      endDate: personalLeaveRange?.[1]?.format("YYYY-MM-DD"),
      days: personalLeaveDays,
      remaining: totalPersonalLeave - personalLeaveDays,
    },
    {
      key: "3",
      type: "ลาพักร้อน",
      startDate: vacationLeaveRange?.[0]?.format("YYYY-MM-DD"),
      endDate: vacationLeaveRange?.[1]?.format("YYYY-MM-DD"),
      days: vacationLeaveDays,
      remaining: totalVacationLeave - vacationLeaveDays,
    },
  ]

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
            <Form.Item label="มีกำหนดตั้งแต่วันที่ - ถึงวันที่" name="businessDuration">
              <RangePicker style={{ width: "100%" }} onChange={handleBusinessRangeChange} />
            </Form.Item>
          </Col>
        </Row>

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
          <Radio.Group
            value={paid}
            onChange={(e) => setPaid(e.target.value)}
          >
            <Radio value="1">ทุนส่วนตัว</Radio>
            <Radio value="2">ค่าใช้จ่ายจากหน่วยงาาน</Radio>
          </Radio.Group>
          {paid === "2" && (
            <div style={{ marginTop: "10px" }}>
              <Form.Item label="แนบเอกสารเพิ่มเติม" name="attachments">
                <Upload fileList={fileList} onChange={handleChange}>
                  <Button icon={<UploadOutlined />}>เลือกไฟล์</Button>
                </Upload>
              </Form.Item>
            </div>
          )}
        </Form.Item>

        {/* ลากิจ */}
                <Form.Item label="มีลากิจ">
                  <Radio.Group value={hasPersonalLeave} onChange={(e) => setHasPersonalLeave(e.target.value)}>
                    <Radio value="1">มี</Radio>
                    <Radio value="2">ไม่มี</Radio>
                  </Radio.Group>
                  {hasPersonalLeave === "1" && (
                    <div style={{ marginTop: "10px" }}>
                      <Form.Item label="มีกำหนดตั้งแต่วันที่ - ถึงวันที่" name="personalLeaveDuration">
                        <RangePicker style={{ width: "50%" }} onChange={handlePersonalRangeChange} />
                      </Form.Item>
                    </div>
                  )}
                </Form.Item>
        
                {/* ลาพักร้อน */}
                <Form.Item label="มีลาพักร้อน">
                  <Radio.Group value={hasVacationLeave} onChange={(e) => setHasVacationLeave(e.target.value)}>
                    <Radio value="1">มี</Radio>
                    <Radio value="2">ไม่มี</Radio>
                  </Radio.Group>
                  {hasVacationLeave === "1" && (
                    <div style={{ marginTop: "10px" }}>
                      <Form.Item label="มีกำหนดตั้งแต่วันที่ - ถึงวันที่" name="vacationLeaveDuration">
                        <RangePicker style={{ width: "50%" }} onChange={handleVacationRangeChange} />
                      </Form.Item>
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
