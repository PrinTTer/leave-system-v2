"use client";
import React, { useEffect, useState, useMemo } from "react";
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
import LeaveCalendar, {
  LeaveTypeLabel,
  LeaveDay,
} from "@/app/components/leave-application/LeaveCalendar";
import { provinces } from "@/mock/provinces";
import {
  OfficialdutyFactformInfo,
  OfficialdutyFactFormInput,
  OtherExpenses,
  Status,
} from "@/types/factForm";
import { User } from "@/types/user";
import { getPersonalAndVacationLeave } from "@/services/factCreditLeaveApi";
import { LeaveCategory } from "@/types/leaveType";
import { FactCreditLeaveInfo } from "@/types/factCreditLeave";
import { updateFactForm } from "@/services/factFormApi";
import Link from "next/link";
import Swal from "sweetalert2";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

type CheckboxValueType = string | number | CheckboxProps["checked"];
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

const FormalApplicationFormEdit: React.FC<FormProps> = ({
  user,
  data,
  is_edit,
}) => {
  const [form] = Form.useForm();

  const [selectedExpenses, setSelectedExpenses] = useState<CheckboxValueType[]>(
    [],
  );

  const [otherExpenses, setOtherExpenses] = useState<OtherExpenses[]>([]);

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
      provinces: data.provinces,
      reason: data.reason,
      assistants: data.assistants?.map((a) => a.nontri_account),
      travel_details: data.travel_details,
      expenses: data.expenses,
    });
  }, [data, form]);

  useEffect(() => {
    if (!data?.expenses) return;

    const checked: string[] = [];

    if (data.expenses.rs_allowance) checked.push("rs");
    if (data.expenses.asst_allowance) checked.push("asst");
    if (data.expenses.driver) checked.push("driver");
    if (data.expenses.accommodation) checked.push("accommodation");
    if (data.expenses.vehicle) checked.push("vehicle");
    if (data.expenses.other?.length) checked.push("other");

    setSelectedExpenses(checked);
    setOtherExpenses(data.expenses.other || []);
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

  console.log("leaveSummary", leaveSummary);

  const handleSubmit = async (status: Status) => {
    const officialDuty = leaveSummary.summary.find(
      (s) => s.category === LeaveCategory.OFFICIALDUTY,
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

    const expenseLeaves = leaveSummary.summary.filter(
      (s) => s.category !== LeaveCategory.OFFICIALDUTY,
    );

    const values = await form.validateFields();

    const payload: OfficialdutyFactFormInput = {
      nontri_account: user.nontri_account,
      total_day: officialDuty.total_days,
      reason: values.reason,
      status,
      fiscal_year: data.fiscal_year,
      leave_aboard: "ในประเทศ",
      start_date: new Date(officialDuty.start_date),
      end_date: new Date(officialDuty.end_date),
      start_type: "full",
      end_type: "full",
      provinces: values.provinces,
      assistants: values.assistants?.map((id: string) => ({
        nontri_account: id,
      })),
      travel_details: values.travel_details,
      expenses: {
        ...values.expenses,
        other: otherExpenses,
      },
      extend_leaves: expenseLeaves.map((l) => ({
        leave_type_id: l.leave_type_id,
        leave_dates: l.days.map((d) => new Date(d)),
        total_days: l.total_days,
      })),
    };

    console.log("payload", payload);
    await updateFactForm(user.nontri_account, data.fact_form_id, payload);
  };

  return (
    <div>
      <Form
        form={form}
        layout="vertical"
        className="max-w-3xl p-6 border rounded-lg bg-white shadow-sm"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="มีความประสงค์จะเดินทางไปจังหวัด" name="provinces">
              <Select
                showSearch
                placeholder="-- กรุณาระบุจังหวัด --"
                optionFilterProp="label"
                mode="multiple"
                options={provinces.map((province) => ({
                  value: province.name_th,
                  label: province.name_th,
                }))}
                disabled={!is_edit}
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
          <Input.TextArea rows={3} placeholder="..." disabled={!is_edit} />
        </Form.Item>

        <LeaveCalendar
          leaveTypes={leaveTypes}
          onSummaryChange={setLeaveSummary}
          initialLeaveDays={initialLeaveDays}
        />

        <Form.Item label="ผู้ติดตาม" name="assistants">
          <Select
            mode="multiple"
            showSearch
            placeholder="-- ผู้ติดตาม --"
            optionFilterProp="label"
            options={assistantList.map((a) => ({
              value: a.nontri_account,
              label: a.name,
            }))}
            disabled={!is_edit}
          />
        </Form.Item>
        <Form.Item label="รายละเอียดการเดินทาง">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="ยี่ห้อรถ"
                name={["travel_details", "car_brand"]}
              >
                <Input placeholder="เช่น TOYOTA" disabled={!is_edit} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="ป้ายทะเบียน"
                name={["travel_details", "license"]}
              >
                <Input placeholder="เช่น กข 1234" disabled={!is_edit} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="พนักงานขับรถ" name={["travel_details", "driver"]}>
            <Input placeholder="ชื่อพนักงาน (ถ้ามี)" disabled={!is_edit} />
          </Form.Item>
        </Form.Item>

        {/* ค่าใช้จ่าย */}
        <Form.Item label="ขอเบิกค่าใช้จ่าย">
          <Checkbox.Group
            style={{ display: "flex", flexDirection: "column", gap: 8 }}
            value={selectedExpenses}
            onChange={setSelectedExpenses}
            disabled={!is_edit}
          >
            <Checkbox value="rs">ค่าเบี้ยเลี้ยงเดินทาง (รศ)</Checkbox>

            {selectedExpenses.includes("rs") && (
              <div className="ml-6 mt-1 flex gap-2">
                <Form.Item
                  name={["expenses", "rs_allowance", "amount_per_person"]}
                  noStyle
                >
                  <InputNumber
                    min={0}
                    placeholder="จำนวนเงินต่อคน"
                    disabled={!is_edit}
                  />
                </Form.Item>

                <Form.Item
                  name={["expenses", "rs_allowance", "total_person"]}
                  noStyle
                >
                  <InputNumber
                    min={1}
                    placeholder="จำนวนคน"
                    disabled={!is_edit}
                  />
                </Form.Item>
              </div>
            )}

            <Checkbox value="asst">ค่าเบี้ยเลี้ยงเดินทาง (ผศ ลงมา)</Checkbox>

            {selectedExpenses.includes("asst") && (
              <div className="ml-6 mt-1 flex gap-2">
                <Form.Item
                  name={["expenses", "asst_allowance", "amount_per_person"]}
                  noStyle
                >
                  <InputNumber
                    min={0}
                    placeholder="จำนวนเงินต่อคน"
                    disabled={!is_edit}
                  />
                </Form.Item>

                <Form.Item
                  name={["expenses", "asst_allowance", "total_person"]}
                  noStyle
                >
                  <InputNumber
                    min={1}
                    placeholder="จำนวนคน"
                    disabled={!is_edit}
                  />
                </Form.Item>
              </div>
            )}

            <Checkbox value="driver">ค่าตอบแทนพนักงานขับรถ</Checkbox>

            {selectedExpenses.includes("driver") && (
              <Form.Item name={["expenses", "driver"]} className="ml-6 mt-1">
                <InputNumber
                  min={0}
                  placeholder="จำนวนเงิน"
                  disabled={!is_edit}
                />
              </Form.Item>
            )}

            <Checkbox value="accommodation">ค่าเช่าที่พัก</Checkbox>

            {selectedExpenses.includes("accommodation") && (
              <Form.Item
                name={["expenses", "accommodation"]}
                className="ml-6 mt-1"
              >
                <InputNumber
                  min={0}
                  placeholder="จำนวนเงิน"
                  disabled={!is_edit}
                />
              </Form.Item>
            )}

            <Checkbox value="vehicle">ค่ายานพาหนะ</Checkbox>

            {selectedExpenses.includes("vehicle") && (
              <div className="ml-6 mt-1 flex gap-2">
                <Form.Item name={["expenses", "vehicle", "reason"]} noStyle>
                  <Input
                    placeholder="เช่น เหมารถตู้ 1 คัน"
                    style={{ width: "50%" }}
                    disabled={!is_edit}
                  />
                </Form.Item>

                <Form.Item name={["expenses", "vehicle", "expense"]} noStyle>
                  <InputNumber
                    min={0}
                    placeholder="จำนวนเงิน"
                    disabled={!is_edit}
                  />
                </Form.Item>
              </div>
            )}

            <Checkbox value="other">ค่าใช้จ่ายอื่นๆ</Checkbox>
          </Checkbox.Group>
        </Form.Item>

        {selectedExpenses.includes("other") && (
          <div className="ml-6 mt-2 flex flex-col gap-3">
            {otherExpenses.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="ระบุรายละเอียด"
                  value={item.reason}
                  onChange={(e) =>
                    setOtherExpenses((prev) => {
                      const copy = [...prev];
                      copy[index].reason = e.target.value;
                      return copy;
                    })
                  }
                  disabled={!is_edit}
                />

                <InputNumber
                  min={0}
                  placeholder="จำนวนเงิน"
                  value={item.expense}
                  onChange={(value) =>
                    setOtherExpenses((prev) => {
                      const copy = [...prev];
                      copy[index].expense = value ?? 0;
                      return copy;
                    })
                  }
                  disabled={!is_edit}
                />

                {is_edit && (
                  <Button
                    danger
                    onClick={() =>
                      setOtherExpenses((prev) =>
                        prev.filter((_, i) => i !== index),
                      )
                    }
                  >
                    ลบ
                  </Button>
                )}
              </div>
            ))}

            {is_edit && (
              <Button
                type="dashed"
                onClick={() =>
                  setOtherExpenses((prev) => [
                    ...prev,
                    { reason: "", expense: 0 },
                  ])
                }
              >
                + เพิ่มค่าใช้จ่ายอื่นๆ
              </Button>
            )}
          </div>
        )}

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
            </>
          )}
        </div>
      </Form>
    </div>
  );
};

export default FormalApplicationFormEdit;
