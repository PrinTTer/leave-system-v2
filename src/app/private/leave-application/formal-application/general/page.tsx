import React, { useState } from "react"
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
} from "antd"
import type { CheckboxProps } from "antd"
import { Dayjs } from "dayjs"

type CheckboxValueType = string | number | CheckboxProps["checked"]
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

const FormalApplicationForm: React.FC = () => {
  // จำนวนวันลา (mock สมมติ)
  const totalBusinessLeave = 10
  const totalPersonalLeave = 5
  const totalVacationLeave = 5

  // state
  const [leaveDays, setLeaveDays] = useState<LeaveDay[]>([])
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null)
  const [selectedType, setSelectedType] = useState<LeaveDay["type"] | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [assistants, setAssistants] = useState<string[]>([])

  const [selectedExpenses, setSelectedExpenses] = useState<CheckboxValueType[]>(
    []
  )

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

  // render ใน cell ของปฏิทิน
  const dateCellRender = (date: Dayjs) => {
    const leave = leaveDays.find((d) => d.date === date.format("YYYY-MM-DD"))
    if (leave) {
      const { label, color } = leaveTypes[leave.type]
      return <Tag color={color}>{label}</Tag>
    }
    return null
  }

  const handleExpensesChange = (checkedValues: CheckboxValueType[]) => {
    setSelectedExpenses(checkedValues)
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

  const isOverLimit = summaryData.some((item) => item.remaining < 0)

  return (
    <div>
      <Form
        layout="vertical"
        className="max-w-3xl p-6 border rounded-lg bg-white shadow-sm"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="มีความประสงค์จะเดินทางไปจังหวัด"
              name="province"
            >
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

         {/* เหตุผลการลา */}
          <Form.Item
            label="เนื่องจาก"
            name="reason"
            rules={[{ required: true, message: "กรุณากรอกเหตุผลการลา" }]}
          >
            <Input.TextArea rows={3} placeholder="..." />
          </Form.Item>

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
  )
}

export default FormalApplicationForm
