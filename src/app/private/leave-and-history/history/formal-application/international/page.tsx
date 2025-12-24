"use client";

import React, { useEffect, useMemo, useState } from "react";
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
  OfficialdutyFactformInfo,
  OfficialdutyFactFormInput,
  Status,
} from "@/types/factForm";
import LeaveCalendar, {
  LeaveDay,
  LeaveTypeLabel,
} from "@/app/components/leave-application/LeaveCalendar";
import { countries } from "@/mock/countries";
import { getPersonalAndVacationLeave } from "@/services/factCreditLeaveApi";
import { FactCreditLeaveInfo } from "@/types/factCreditLeave";
import { LeaveCategory } from "@/types/leaveType";
import { User } from "@/types/user";
import { convertFileToBase64 } from "@/app/utils/file";
import { Attachment } from "@/types/common";
import { updateFactForm } from "@/services/factFormApi";
import Link from "next/link";
import Swal from "sweetalert2";
import dayjs from "dayjs";

const { Text } = Typography;

interface FormProps {
  user: User;
  data: OfficialdutyFactformInfo;
  is_edit?: boolean;
}

const assistantList = [
  { nontri_account: "1", name: "สมชาย ใจดี" },
  { nontri_account: "2", name: "วรัญญา ประวันโน" },
  { nontri_account: "3", name: "กิตติพงษ์ รัตนชัย" },
  { nontri_account: "4", name: "สุภาพร ศรีสุข" },
  { nontri_account: "5", name: "ณัฐพล อินทร์ทอง" },
];

const InternationalFormalLeaveFormEdit: React.FC<FormProps> = ({
  user,
  data,
  is_edit = false,
}) => {
  const [form] = Form.useForm();

  const [paid, setPaid] = useState<string>(ExpensesType.PERSONAL_FUND);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [attachment, setAttachment] = useState<Attachment | undefined>(
    undefined,
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

  const initialLeaveDays = useMemo<LeaveDay[]>(() => {
    if (!data) return [];

    const days: LeaveDay[] = [];

    // เพิ่มวันลาหลัก (official duty)
    if (data.start_date && data.end_date && data.leave_type_id) {
      const start = dayjs(data.start_date);
      const end = dayjs(data.end_date);
      let current = start;

      while (current.isSameOrBefore(end, "day")) {
        days.push({
          date: current.format("YYYY-MM-DD"),
          leave_type_id: data.leave_type_id,
        });
        current = current.add(1, "day");
      }
    }

    // ✅ เพิ่มวันลาเพิ่มเติม (extend_leaves)
    if (data.extend_leaves && Array.isArray(data.extend_leaves)) {
      for (const extend of data.extend_leaves) {
        if (extend.leave_dates && Array.isArray(extend.leave_dates)) {
          for (const dateStr of extend.leave_dates) {
            const date = dayjs(dateStr);
            days.push({
              date: date.format("YYYY-MM-DD"),
              leave_type_id: extend.leave_type_id,
            });
          }
        }
      }
    }

    return days;
  }, [data]);

  useEffect(() => {
    if (!data) return;

    form.setFieldsValue({
      fact_form_id: data.fact_form_id,
      countries: data.countries,
      reason: data.reason,
      startDate: data.start_date ? dayjs(data.start_date) : null,
      endDate: data.end_date ? dayjs(data.end_date) : null,
      startType: data.start_type,
      endType: data.end_type,
    });
  }, [data, form]);

  useEffect(() => {
    if (data?.attachment?.data) {
      setAttachment({
        fileName: data.attachment.fileName,
        fileType: data.attachment.fileType,
        data: data.attachment.data,
      });
      setFileList([
        {
          uid: "-1",
          name: data.attachment.fileName,
          status: "done",
          url: data.attachment.data,
        },
      ]);
    }

    if (data.expenses_type) {
      setPaid(data?.expenses_type);
    }
  }, [data]);

  useEffect(() => {
    if (!user || !user.nontri_account) return;

    const fetchLeaveType = async () => {
      const apiData = await getPersonalAndVacationLeave(user.nontri_account);

      const mapped = apiData.fact_credit.map((leave: FactCreditLeaveInfo) => ({
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
          ...apiData.officialduty,
          label: apiData.officialduty.name,
          color: "blue",
        },
      ]);
    };

    fetchLeaveType();
  }, [user]);

  const handleChange = async ({
    file,
    fileList,
  }: {
    file: UploadFile;
    fileList: UploadFile[];
  }) => {
    setFileList(fileList);

    if (file.status === "removed") {
      setAttachment(undefined);
      return;
    }

    if (fileList.length > 0) {
      const f = fileList[0].originFileObj as File;
      const base64 = await convertFileToBase64(f);
      setAttachment({
        fileName: f.name,
        fileType: f.type,
        data: base64,
      });
    }
  };

  const summaryData = leaveTypes.map((lt) => {
    const found = leaveSummary.summary.find(
      (s) => s.leave_type_id === lt.leave_type_id,
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
    (item) => typeof item.remaining === "number" && item.remaining < 0,
  );

  const handleSubmit = async (status: Status) => {
    const officialDuty = leaveSummary.summary.find(
      (s) => s.category === LeaveCategory.OFFICIALDUTY,
    );

    if (!officialDuty) {
      await Swal.fire({
        icon: "warning",
        title: "ไม่ใช่การขออนุมัติเดินทางไปราชการ",
        text: "กรุณาเลือกปรระเภทการลาอีกครั้ง",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    const expense_leaves = leaveSummary.summary.filter(
      (s) => s.category !== LeaveCategory.OFFICIALDUTY,
    );

    const expense_leaves_payload = expense_leaves.map((leave) => ({
      leave_type_id: leave.leave_type_id,
      leave_dates: leave.days.map((date) => new Date(date)),
      total_days: leave.total_days,
    }));

    const values = await form.validateFields();

    const payload: OfficialdutyFactFormInput = {
      nontri_account: user.nontri_account,
      total_day: officialDuty?.total_days ?? 0,
      reason: values.reason ?? "",
      status,
      fiscal_year: new Date().getFullYear() + 543,
      leave_aboard: "ต่างประเทศ",
      start_date: new Date(officialDuty?.start_date || ""),
      start_type: "full",
      end_type: "full",
      end_date: new Date(officialDuty?.end_date || ""),
      extend_leaves: expense_leaves_payload,
      provinces: values.provinces || [],
      assistants: values.assistants || [],
      travel_details: values.travel_details,
      expenses: values.expenses,
      attachment: attachment,
      expenses_type: paid as ExpensesType,
    };

    console.log("payload", payload);
    await updateFactForm(user.nontri_account, data.fact_form_id, payload);
  };

  return (
    <div>
      <Form
        form={form}
        layout="vertical"
        className="max-w-2xl p-6 border rounded-lg bg-white shadow-sm"
      >
        <Row gutter={16}>
          <Col span={12}>
            {/* ✅ เพิ่ม disabled */}
            <Form.Item label="มีความประสงค์จะเดินทางไปประเทศ" name="countries">
              <Select
                disabled={!is_edit}
                showSearch
                placeholder="-- กรุณาระบุประเทศ --"
                optionFilterProp="label"
                mode="multiple"
                options={countries.map((c) => ({
                  value: c.name,
                  label: c.name,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* เหตุผลการลา */}
        {/* ✅ เพิ่ม disabled */}
        <Form.Item
          label="เนื่องจาก"
          name="reason"
          rules={[{ required: true, message: "กรุณากรอกเหตุผลการลา" }]}
        >
          <Input.TextArea rows={3} placeholder="..." disabled={!is_edit} />
        </Form.Item>

        <LeaveCalendar
          leaveTypes={leaveTypes}
          onSummaryChange={setLeaveSummary}
          initialLeaveDays={initialLeaveDays}
          isEdit={is_edit}
        />

        {/* ✅ เพิ่ม disabled */}
        <Form.Item label="ผู้ติดตาม" name="assistants">
          <Select
            disabled={!is_edit}
            mode="multiple"
            showSearch
            placeholder="-- ผู้ติดตาม --"
            optionFilterProp="label"
            options={assistantList.map((a) => ({
              value: a.nontri_account,
              label: a.name,
            }))}
          />
        </Form.Item>

        {/* ✅ เพิ่ม disabled สำหรับ travel_details */}
        <Form.Item label="รายละเอียดการเดินทาง">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="ยี่ห้อรถ"
                name={["travel_details", "car_brand"]}
              >
                <Input disabled={!is_edit} placeholder="เช่น TOYOTA" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="ป้ายทะเบียน"
                name={["travel_details", "license"]}
              >
                <Input disabled={!is_edit} placeholder="เช่น กข 1234" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="พนักงานขับรถ" name={["travel_details", "driver"]}>
            <Input disabled={!is_edit} placeholder="ชื่อพนักงาน (ถ้ามี)" />
          </Form.Item>
        </Form.Item>

        {/* ส่วนขอเบิกค่าใช้จ่าย */}
        {/* ✅ เพิ่ม disabled */}
        <Form.Item label="ค่าใช้จ่าย">
          <Radio.Group
            disabled={!is_edit}
            value={paid}
            onChange={(e) => {
              if (is_edit) {
                setPaid(e.target.value);
              }
            }}
          >
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
                <Upload
                  disabled={!is_edit}
                  fileList={fileList}
                  onChange={handleChange}
                >
                  <Button icon={<UploadOutlined />} disabled={!is_edit}>
                    เลือกไฟล์
                  </Button>
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

        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            marginTop: 24,
          }}
        >
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

          {is_edit && (
            <>
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
            </>
          )}
        </div>
      </Form>
    </div>
  );
};

export default InternationalFormalLeaveFormEdit;
