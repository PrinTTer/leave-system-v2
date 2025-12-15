"use client";
import React, { useEffect, useState } from "react";
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
} from "@/app/components/leave-application/LeaveCalendar";
import { provinces } from "@/mock/provinces";
import {
  OfficialdutyFactFormInput,
  OtherExpenses,
  Status,
} from "@/types/factForm";
import { User } from "@/types/user";
import { getPersonalAndVacationLeave } from "@/services/factCreditLeaveApi";
import { LeaveCategory } from "@/types/leaveType";
import { FactCreditLeaveInfo } from "@/types/factCreditLeave";
import { createOfficialdutyFactform } from "@/services/factFormApi";
import Link from "next/link";
import Swal from "sweetalert2";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

type CheckboxValueType = string | number | CheckboxProps["checked"];
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

const FormalApplicationForm: React.FC<FormProps> = ({ user }) => {
  const [inputs, setInputs] = useState<OfficialdutyFactFormInput>(
    {} as OfficialdutyFactFormInput
  );
  const [selectedExpenses, setSelectedExpenses] = useState<CheckboxValueType[]>(
    []
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

  const handleExpensesChange = (checkedValues: CheckboxValueType[]) => {
    setSelectedExpenses(checkedValues);
  };

  console.log("inputs", inputs);

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

  console.log("leaveSummary", leaveSummary);

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
      leave_aboard: "ในประเทศ",
      start_date: new Date(officialDuty?.start_date || ""),
      start_type: "full",
      end_type: "full",
      end_date: new Date(officialDuty?.end_date || ""),
      extend_leaves: expense_leaves_payload,
      provinces: inputs.provinces || [],
      assistants: inputs.assistants || [],
      travel_details: inputs.travel_details,
      expenses: inputs.expenses,
    };

    console.log("payload", payload);
    await createOfficialdutyFactform(payload);
  };

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
        {/* ค่าใช้จ่าย */}
        <Form.Item label="ขอเบิกค่าใช้จ่าย">
          <Checkbox.Group
            style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            onChange={handleExpensesChange}
          >
            <Checkbox value="rs">ค่าเบี้ยเลี้ยงเดินทาง (รศ)</Checkbox>
            {selectedExpenses.includes("rs") && (
              <div className="ml-6 mt-1 flex gap-2">
                <InputNumber
                  min={0}
                  placeholder="จำนวนเงินต่อคน"
                  value={inputs.expenses?.rs_allowance?.amount_per_person || 0}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      expenses: {
                        ...prev.expenses,
                        rs_allowance: {
                          amount_per_person: value ?? 0,
                          total_person:
                            prev.expenses?.rs_allowance?.total_person ?? 1,
                        },
                      },
                    }))
                  }
                />
                <InputNumber
                  min={1}
                  placeholder="จำนวนคน"
                  value={inputs.expenses?.rs_allowance?.total_person || 0}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      expenses: {
                        ...prev.expenses,
                        rs_allowance: {
                          amount_per_person:
                            prev.expenses?.rs_allowance?.amount_per_person ?? 0,
                          total_person: value ?? 1,
                        },
                      },
                    }))
                  }
                />
              </div>
            )}
            <Checkbox value="asst">ค่าเบี้ยเลี้ยงเดินทาง (ผศ ลงมา)</Checkbox>
            {selectedExpenses.includes("asst") && (
              <div className="ml-6 mt-1 flex gap-2">
                <InputNumber
                  min={0}
                  placeholder="จำนวนเงินต่อคน"
                  value={
                    inputs.expenses?.asst_allowance?.amount_per_person || 0
                  }
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      expenses: {
                        ...prev.expenses,
                        asst_allowance: {
                          amount_per_person: value ?? 0,
                          total_person:
                            prev.expenses?.asst_allowance?.total_person ?? 1,
                        },
                      },
                    }))
                  }
                />
                <InputNumber
                  min={1}
                  placeholder="จำนวนคน"
                  value={inputs.expenses?.asst_allowance?.total_person || 0}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      expenses: {
                        ...prev.expenses,
                        asst_allowance: {
                          amount_per_person:
                            prev.expenses?.asst_allowance?.amount_per_person ??
                            0,
                          total_person: value ?? 1,
                        },
                      },
                    }))
                  }
                />
              </div>
            )}
            <Checkbox value="driver">ค่าตอบแทนพนักงานขับรถ</Checkbox>
            {selectedExpenses.includes("driver") && (
              <InputNumber
                min={0}
                placeholder="จำนวนเงิน"
                className="ml-6 mt-1"
                value={inputs.expenses?.driver}
                onChange={(value) =>
                  setInputs((prev) => ({
                    ...prev,
                    expenses: {
                      ...prev.expenses,
                      driver: value ?? 0,
                    },
                  }))
                }
              />
            )}
            <Checkbox value="accommodation">ค่าเช่าที่พัก</Checkbox>
            {selectedExpenses.includes("accommodation") && (
              <InputNumber
                min={0}
                placeholder="จำนวนเงิน"
                className="ml-6 mt-1"
                value={inputs.expenses?.accommodation}
                onChange={(value) =>
                  setInputs((prev) => ({
                    ...prev,
                    expenses: {
                      ...prev.expenses,
                      accommodation: value ?? 0,
                    },
                  }))
                }
              />
            )}
            <Checkbox value="vehicle">ค่ายานพาหนะ</Checkbox>
            {selectedExpenses.includes("vehicle") && (
              <div className="ml-6 mt-1 flex gap-2">
                <Input
                  placeholder="เช่น เหมารถตู้ 1 คัน"
                  style={{ width: "50%" }}
                  value={inputs.expenses?.vehicle?.reason || ""}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      expenses: {
                        ...prev.expenses,
                        vehicle: {
                          expense: prev.expenses?.vehicle?.expense || 0,
                          reason: value.target.value,
                        },
                      },
                    }))
                  }
                />
                <InputNumber
                  min={0}
                  placeholder="จำนวนเงิน"
                  value={inputs.expenses?.vehicle?.expense || ""}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      expenses: {
                        ...prev.expenses,
                        vehicle: {
                          expense: Number(value) || 0,
                          reason: prev.expenses?.vehicle?.reason || "",
                        },
                      },
                    }))
                  }
                />
              </div>
            )}
            <Checkbox value="other">ค่าใช้จ่ายอื่นๆ</Checkbox>

            {selectedExpenses.includes("other") && (
              <div className="ml-6 mt-2 flex flex-col gap-3">
                {otherExpenses.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="ระบุรายละเอียด"
                      style={{ width: "50%" }}
                      value={item.reason}
                      onChange={(e) =>
                        setOtherExpenses((prev) => {
                          const copy = [...prev];
                          copy[index].reason = e.target.value;
                          return copy;
                        })
                      }
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
                    />

                    <Button
                      danger
                      onClick={() =>
                        setOtherExpenses((prev) =>
                          prev.filter((_, i) => i !== index)
                        )
                      }
                    >
                      ลบ
                    </Button>
                  </div>
                ))}

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

export default FormalApplicationForm;
