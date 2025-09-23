"use client";

import React, { useState } from "react";
import {
  Form,
  Select,
  Calendar,
  Modal,
  Table,
  Button,
  Input,
  Typography,
  Row,
  Col,
  Tag,
  UploadFile,
  DatePicker,
  Radio,
  Upload,
} from "antd"

import { Dayjs } from "dayjs"
import { UploadOutlined } from "@ant-design/icons";

const { Text } = Typography

interface LeaveDay {
  date: string
  type: "business" | "personal" | "vacation"
}

const leaveTypes = {
  business: { label: "ลาราชการ", color: "blue" },
  personal: { label: "ลากิจ", color: "orange" },
  vacation: { label: "ลาพักร้อน", color: "green" },
}


const InternationalFormalLeaveForm: React.FC = () => {
  const totalBusinessLeave = 10; // วันลากิจ/ราชการรวมสูงสุดสมมติ
  const totalPersonalLeave = 5; // วันลากิจสูงสุดสมมติ
  const totalVacationLeave = 5

  const [assistants, setAssistants] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [paid, setPaid] = useState<string>("1"); 
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [leaveDays, setLeaveDays] = useState<LeaveDay[]>([])
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null)
  const [selectedType, setSelectedType] = useState<LeaveDay["type"] | null>(null)
  

  const handleChange = (info: { fileList: UploadFile[] }) => {
    setFileList(info.fileList);
  }

  // เปิด modal เมื่อกดวัน
    const handleSelect = (date: Dayjs) => {
      setSelectedDate(date)
      const exist = leaveDays.find((d) => d.date === date.format("YYYY-MM-DD"))
      setSelectedType(exist?.type || null)
      setIsModalOpen(true)
    }
  
    // กดบันทึก
    const handleOk = () => {
      if (selectedDate && selectedType) {
        const dateStr = selectedDate.format("YYYY-MM-DD")
        setLeaveDays((prev) => {
          const exist = prev.find((d) => d.date === dateStr)
          if (exist) {
            return prev.map((d) =>
              d.date === dateStr ? { ...d, type: selectedType } : d
            )
          } else {
            return [...prev, { date: dateStr, type: selectedType }]
          }
        })
      }
      setIsModalOpen(false)
    }
  
    const handleCancel = () => {
      setIsModalOpen(false)
    }

   const dateCellRender = (date: Dayjs) => {
    const leave = leaveDays.find((d) => d.date === date.format("YYYY-MM-DD"))
    if (leave) {
      const { label, color } = leaveTypes[leave.type]
      return <Tag color={color}>{label}</Tag>
    }
    return null
  }
// คำนวณสรุปจำนวนวันต่อประเภท
  const businessDays = leaveDays.filter((d) => d.type === "business").length
  const personalDays = leaveDays.filter((d) => d.type === "personal").length
  const vacationDays = leaveDays.filter((d) => d.type === "vacation").length

  const summaryData = [
    {
      key: "1",
      type: "ลาราชการ",
      days: businessDays,
      remaining: totalBusinessLeave - businessDays,
    },
    {
      key: "2",
      type: "ลากิจ",
      days: personalDays,
      remaining: totalPersonalLeave - personalDays,
    },
    {
      key: "3",
      type: "ลาพักร้อน",
      days: vacationDays,
      remaining: totalVacationLeave - vacationDays,
    },
  ]

  const summaryColumns = [
    { title: "ประเภทการลา", dataIndex: "type", key: "type" },
    { title: "จำนวนวันลา", dataIndex: "days", key: "days" },
    {
      title: "วันคงเหลือ",
      dataIndex: "remaining",
      key: "remaining",
      render: (val: number) => (
        <Text type={val < 0 ? "danger" : undefined}>{val}</Text>
      ),
    },
  ]
  
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
        </Row>

        <Row gutter={16}>
  <Col span={12}>
    <Form.Item label="เดินทางไปวันที่" name="departure">
      <DatePicker
        style={{ width: "100%" }}
        showTime
        format="YYYY-MM-DD HH:mm"
        placeholder="เลือกวันที่และเวลา"
      />
    </Form.Item>
  </Col>
  <Col span={12}>
    <Form.Item label="เดินทางกลับวันที่" name="return">
      <DatePicker
        style={{ width: "100%" }}
        showTime
        format="YYYY-MM-DD HH:mm"
        placeholder="เลือกวันที่และเวลา"
      />
    </Form.Item>
  </Col>
</Row>

  {/* ปฏิทินเลือกวันลา */}
       <Form.Item label="เลือกวันลา (คลิกวันที่ในปฏิทิน)">
        <Calendar
          fullscreen={false}
          cellRender={(date) => dateCellRender(date)} // เปลี่ยนจาก dateCellRender => cellRender
          onSelect={handleSelect}
        />
      </Form.Item>
              {/* Modal เลือกประเภทการลา */}
        <Modal
          title={
            selectedDate
              ? `เลือกประเภทการลา (${selectedDate.format("YYYY-MM-DD")})`
              : ""
          }
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          okText="บันทึก"
          cancelText="ยกเลิก"
        >
          <Select
            style={{ width: "100%" }}
            placeholder="-- เลือกประเภทการลา --"
            value={selectedType ?? undefined}
            onChange={(val) => setSelectedType(val as LeaveDay["type"])}
            options={[
              { value: "business", label: "ลาราชการ" },
              { value: "personal", label: "ลากิจ" },
              { value: "vacation", label: "ลาพักร้อน" },
            ]}
          />
        </Modal>

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
            <Radio value="2">ทุนภาควิชา</Radio>
            <Radio value="3">ทุนคณะ</Radio>
          </Radio.Group>
          {(paid === "2" || paid === '3')&& (
            <div style={{ marginTop: "10px" }}>
              <Form.Item label="แนบเอกสารเพิ่มเติม" name="attachments">
                <Upload fileList={fileList} onChange={handleChange}>
                  <Button icon={<UploadOutlined />}>เลือกไฟล์</Button>
                </Upload>
              </Form.Item>
            </div>
          )}
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

        <Form.Item style={{marginTop: 16, display: 'flex' ,justifyContent: 'end'}}>
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
