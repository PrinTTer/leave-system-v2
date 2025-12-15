"use client";

import React, { useEffect, useState } from "react";
import {
  Form,
  Select,
  Table,
  Button,
  Input,
  Typography,
  Row,
  Col,
  Tag,
  UploadFile,
  Radio,
  Upload,
} from "antd";

import { UploadOutlined } from "@ant-design/icons";
import {
  ExpensesType,
  OfficialdutyFactFormInput,
  Status,
} from "@/types/factForm";
import LeaveCalendar, {
  LeaveTypeLabel,
} from "@/app/components/leave-application/LeaveCalendar";
import { countries } from "@/mock/countries";
import { getPersonalAndVacationLeave } from "@/services/factCreditLeaveApi";
import { FactCreditLeaveInfo } from "@/types/factCreditLeave";
import { LeaveCategory } from "@/types/leaveType";
import { User } from "@/types/user";
import { convertFileToBase64 } from "@/app/utils/file";
import { Attachment } from "@/types/common";
import { createOfficialdutyFactform } from "@/services/factFormApi";
import Link from "next/link";
import Swal from "sweetalert2";

const { Text } = Typography;

interface FormProps {
  user: User;
}

const assistantList = [
  { nontri_account: "1", name: "สมชาย ใจดี" },
  { nontri_account: "2", name: "วรัญญา ประวันโน" },
  { nontri_account: "3", name: "กิตติพงษ์ รัตนชัย" },
  { nontri_account: "4", name: "สุภาพร ศรีสุข" },
  { nontri_account: "5", name: "ณัฐพล อินทร์ทอง" },
];

const InternationalFormalLeaveForm: React.FC<FormProps> = ({ user }) => {
  const [paid, setPaid] = useState<string>(ExpensesType.PERSONAL_FUND);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [attachment, setAttachment] = useState<Attachment>({} as Attachment);

  const [inputs, setInputs] = useState<OfficialdutyFactFormInput>(
    {} as OfficialdutyFactFormInput
  );

  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeLabel[]>([]);

  const [leaveSummary, setLeaveSummary] = useState<{
    summary: {
      leave_type_id: number;
      category?: string;
      total_days: number;
      days: string[];
      start_date: string;
      end_date: string;
    }[];
  }>({ summary: [] });

  useEffect(() => {
    if (!user || !user.nontri_account) return;

    const fetchLeaveType = async () => {
      const data = await getPersonalAndVacationLeave(user.nontri_account);

      const mapped = data.fact_credit.map((leave: FactCreditLeaveInfo) => ({
        ...leave,
        label: leave.leave_type.name,
        color:
          leave.leave_type.category === LeaveCategory.VACATION
            ? "green"
            : "yellow",
      }));

      setLeaveTypes([
        ...mapped,
        {
          ...data.officialduty,
          label: data.officialduty.name,
          color: "blue",
        },
      ]);
    };

    fetchLeaveType();
  }, [user]);

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

  const summaryData = leaveTypes.map((lt) => {
    const found = leaveSummary.summary.find(
      (s) => s.leave_type_id === lt.leave_type_id
    );

    return {
      key: lt.leave_type_id,
      type: lt.label,
      dates: found?.days ?? [],
      days: found?.total_days ?? 0,
      remaining:
        lt.left_leave !== undefined
          ? lt.left_leave - (found?.total_days ?? 0)
          : "-",
    };
  });

  const summaryColumns = [
    { title: "ประเภทการลา", dataIndex: "type" },
    {
      title: "วันที่ลา",
      dataIndex: "dates",
      render: (dates: string[]) => (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {dates.map((date) => (
            <Tag key={date} color="blue">
              {date}
            </Tag>
          ))}
        </div>
      ),
    },
    { title: "จำนวนวันลา", dataIndex: "days" },
    {
      title: "วันคงเหลือ",
      dataIndex: "remaining",
      render: (val: number) => (
        <Text type={val < 0 ? "danger" : undefined}>{val}</Text>
      ),
    },
  ];

  const isOverLimit = summaryData.some(
    (item) => typeof item.remaining === "number" && item.remaining < 0
  );

  const handleSubmit = async (status: Status) => {
    const officialDuty = leaveSummary.summary.find(
      (s) => s.category === LeaveCategory.OFFICIALDUTY
    );

    if (!officialDuty) {
      await Swal.fire({
        icon: "warning",
        title: "ไม่ใช่การขออนุมัติเดินทางไปราชการ",
        text: "กรุณาเลือกปรระเภทการลาอีกครั้ว",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    const expense_leaves = leaveSummary.summary.filter(
      (s) => s.category !== LeaveCategory.OFFICIALDUTY
    );

    const expense_leaves_payload = expense_leaves.map((leave) => ({
      leave_type_id: leave.leave_type_id,
      leave_dates: leave.days.map((date) => new Date(date)),
      total_days: leave.total_days,
    }));

    const payload: OfficialdutyFactFormInput = {
      nontri_account: user.nontri_account,
      total_day: officialDuty?.total_days ?? 0,
      reason: inputs.reason ?? "",
      status,
      fiscal_year: new Date().getFullYear() + 543,
      leave_aboard: "ต่างประเทศ",
      start_date: new Date(officialDuty?.start_date || ""),
      start_type: "full",
      end_type: "full",
      end_date: new Date(officialDuty?.end_date || ""),
      extend_leaves: expense_leaves_payload,
      provinces: inputs.provinces || [],
      assistants: inputs.assistants || [],
      travel_details: inputs.travel_details,
      expenses: inputs.expenses,
      attachment: attachment,
      expenses_type: paid as ExpensesType,
    };

    console.log("payload", payload);
    await createOfficialdutyFactform(payload);
  };

  return (
    <div>
      <Form
        layout="vertical"
        className="max-w-2xl p-6 border rounded-lg bg-white shadow-sm"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="มีความประสงค์จะเดินทางไปประเทศ" name="country">
              <Select
                showSearch
                placeholder="-- กรุณาระบุประเทศ --"
                optionFilterProp="label"
                mode="multiple"
                options={countries.map((c) => ({
                  value: c.name,
                  label: c.name,
                }))}
                value={inputs.provinces}
                onChange={(value) =>
                  setInputs((prev) => ({
                    ...prev,
                    provinces: value,
                  }))
                }
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
          <Input.TextArea
            rows={3}
            placeholder="..."
            value={inputs.reason || "-"}
            onChange={(e) =>
              setInputs({
                ...inputs,
                reason: e.target.value,
              })
            }
          />
        </Form.Item>

        <LeaveCalendar
          leaveTypes={leaveTypes}
          onSummaryChange={setLeaveSummary}
        />

        <Form.Item label="ผู้ติดตาม" name="assistants">
          <Select
            mode="multiple"
            showSearch
            placeholder="-- ผู้ติดตาม --"
            optionFilterProp="label"
            value={inputs.assistants?.map((a) => a.nontri_account) || []}
            onChange={(value) =>
              setInputs((prev) => ({
                ...prev,
                assistants: value.map((nontri_account) => ({
                  nontri_account,
                })),
              }))
            }
            options={assistantList.map((a) => ({
              value: a.nontri_account,
              label: a.name,
            }))}
          />
        </Form.Item>
        <Form.Item label="รายละเอียดการเดินทาง">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="ยี่ห้อรถ">
                <Input
                  placeholder="เช่น TOYOTA"
                  value={inputs.travel_details?.car_brand || ""}
                  onChange={(e) =>
                    setInputs({
                      ...inputs,
                      travel_details: {
                        ...inputs.travel_details,
                        car_brand: e.target.value,
                      },
                    })
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="ป้ายทะเบียน">
                <Input
                  placeholder="เช่น กข 1234"
                  value={inputs.travel_details?.license || ""}
                  onChange={(e) =>
                    setInputs({
                      ...inputs,
                      travel_details: {
                        ...inputs.travel_details,
                        license: e.target.value,
                      },
                    })
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="พนักงานขับรถ">
            <Input
              placeholder="ชื่อพนักงาน (ถ้ามี)"
              value={inputs.travel_details?.driver || ""}
              onChange={(e) =>
                setInputs({
                  ...inputs,
                  travel_details: {
                    ...inputs.travel_details,
                    driver: e.target.value,
                  },
                })
              }
            />
          </Form.Item>
        </Form.Item>

        {/* ส่วนขอเบิกค่าใช้จ่าย */}
        <Form.Item label="ค่าใช้จ่าย">
          <Radio.Group value={paid} onChange={(e) => setPaid(e.target.value)}>
            <Radio value={ExpensesType.PERSONAL_FUND}>
              {ExpensesType.PERSONAL_FUND}
            </Radio>
            <Radio value={ExpensesType.DEPARTMENT_FUND}>
              {ExpensesType.DEPARTMENT_FUND}
            </Radio>
            <Radio value={ExpensesType.FACULTY_FUND}>
              {ExpensesType.FACULTY_FUND}
            </Radio>
          </Radio.Group>
          {paid !== ExpensesType.PERSONAL_FUND && (
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
              disabled={isOverLimit}
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
              disabled={isOverLimit}
              onClick={() => {
                handleSubmit(Status.Pending);
              }}
            >
              ส่งใบลา
            </Button>
          </Link>
        </div>
      </Form>
    </div>
  );
};

export default InternationalFormalLeaveForm;
