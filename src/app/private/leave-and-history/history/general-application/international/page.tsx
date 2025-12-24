"use client";

import { useEffect, useState } from "react";
import {
  Form,
  DatePicker,
  Input,
  Button,
  Select,
  Radio,
  Table,
  Typography,
  Col,
  Row,
  Upload,
  Space,
} from "antd";
import dayjs from "dayjs";
import Link from "next/link";
import type { UploadFile } from "antd/es/upload/interface";
import { UploadOutlined } from "@ant-design/icons";
import { User } from "@/types/user";
import { calculateLeaveDays } from "@/app/utils/calculate";
import { FactFormInfo, FactFormInput, Status } from "@/types/factForm";
import { Attachment } from "@/types/common";
import { getAllFactLeaveCreditLeftByUser } from "@/services/factCreditLeaveApi";
import { FactCreditLeaveInfo } from "@/types/factCreditLeave";
import { convertFileToBase64 } from "@/app/utils/file";
import { countries } from "@/mock/countries";
import { CalendarSchedule } from "@/types/calendar";
import { fetchHolidaysByYear } from "@/services/calendarApi";
import { updateFactForm } from "@/services/factFormApi";

const { Text } = Typography;

interface GeneralLeaveFormProps {
  user: User;
  data: FactFormInfo;
  is_edit?: boolean;
}
const InternationalLeaveFormEdit: React.FC<GeneralLeaveFormProps> = ({
  user,
  data,
  is_edit,
}) => {
  const [form] = Form.useForm();

  const [leaveDays, setLeaveDays] = useState<number>(data.total_day || 0);

  const [factCreditLeave, setFactCreditLeave] = useState<FactCreditLeaveInfo[]>(
    [],
  );
  const [holiday, setHoliday] = useState<CalendarSchedule[]>([]);

  const startDate = Form.useWatch("startDate", form);
  const endDate = Form.useWatch("endDate", form);
  const startType = Form.useWatch("startType", form);
  const endType = Form.useWatch("endType", form);
  const selectedCountries = Form.useWatch("countries", form);

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [attachment, setAttachment] = useState<Attachment | undefined>(
    undefined,
  );

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
    const fetchHolidays = async () => {
      const holiday = await fetchHolidaysByYear(
        startDate ? startDate.year() : new Date().getFullYear(),
      );
      setHoliday(holiday);
    };
    fetchHolidays();
  }, [startDate]);

  useEffect(() => {
    if (!user.nontri_account) return;

    const fetchFactCreditLeave = async () => {
      const data = await getAllFactLeaveCreditLeftByUser(user.nontri_account);
      setFactCreditLeave(data);
    };
    fetchFactCreditLeave();
  }, [user.nontri_account]);

  const selectedleaveTypeObj = factCreditLeave.find(
    (leave) => leave.leave_type_id === data.leave_type_id,
  );

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
  }, [data]);

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

  const totalLeaveDays = selectedleaveTypeObj?.left_leave || 0;

  useEffect(() => {
    const calc = async () => {
      if (!startDate || !endDate) {
        setLeaveDays(0);
        return;
      }

      const days = await calculateLeaveDays(
        startDate,
        endDate,
        startType,
        endType,
        holiday,
      );
      setLeaveDays(days);
    };

    calc();
  }, [startDate, endDate, startType, endType, holiday]);

  const remainingLeaveDays = totalLeaveDays - leaveDays;

  const summaryData = [
    {
      key: "1",
      leaveType: selectedleaveTypeObj?.leave_type?.name || "",
      countries: selectedCountries,
      leaveDays: leaveDays,
      remaining: remainingLeaveDays,
    },
  ];

  const columns = [
    { title: "ประเภทการลา", dataIndex: "leaveType" },
    { title: "ประเทศที่เดินทาง", dataIndex: "countries" },
    { title: "จำนวนวันที่ลา", dataIndex: "leaveDays" },
    {
      title: "จำนวนวันลาคงเหลือ",
      dataIndex: "remaining",
      render: (value: number) => (
        <Text type={value < 0 ? "danger" : undefined}>{value}</Text>
      ),
    },
  ];

  const handleSubmit = async (status: string) => {
    const values = await form.validateFields();

    const payload: FactFormInput = {
      nontri_account: user.nontri_account,
      leave_type_id: selectedleaveTypeObj?.leave_type_id || 1,
      start_date: startDate ? startDate.toDate() : new Date(),
      start_type: startType,
      end_date: endDate ? endDate.toDate() : new Date(),
      end_type: values.endType,
      total_day: leaveDays,
      reason: values.reason,
      status: status as Status,
      fiscal_year: new Date().getFullYear() + 543,
      attachment: attachment,
      leave_aboard: "ต่างประเทศ",
      countries: values.countries,
    };

    await updateFactForm(user?.nontri_account, data.fact_form_id, payload);
  };

  return (
    <div>
      <Space direction="vertical" style={{ width: "100%" }} size={10}>
        <Form
          form={form}
          layout="vertical"
          className="max-w-2xl p-6 border rounded-lg bg-white shadow-sm"
        >
          {/* เลือกประเทศ */}
          <Form.Item
            label="ประเทศที่ต้องการเดินทาง"
            name="countries"
            rules={[{ required: true, message: "กรุณาเลือกประเทศ" }]}
          >
            <Select
              mode="multiple"
              allowClear
              style={{ width: "100%" }}
              placeholder="ค้นหาและเลือกประเทศ"
              options={countries.map((c) => ({
                value: c.name,
                label: c.name,
              }))}
              disabled={!is_edit}
            />
          </Form.Item>

          {/* เหตุผลการลา */}
          <Form.Item
            label="เหตุผลการลา"
            name="reason"
            rules={[{ required: true, message: "กรุณาระบุเหตุผลการลา" }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="กรอกเหตุผลการลา..."
              disabled={!is_edit}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="มีกำหนดตั้งแต่วันที่"
                name="startDate"
                rules={[{ required: true, message: "กรุณาเลือกวันที่เริ่ม" }]}
              >
                <DatePicker style={{ width: "100%" }} disabled={!is_edit} />
              </Form.Item>
              {startDate && (
                <Form.Item
                  name="startType"
                  rules={[{ required: true, message: "กรุณาเลือกช่วงเวลา" }]}
                >
                  <Radio.Group disabled={!is_edit}>
                    <Radio value="full">เต็มวัน</Radio>
                    <Radio value="am">ครึ่งเช้า</Radio>
                    <Radio value="pm">ครึ่งบ่าย</Radio>
                  </Radio.Group>
                </Form.Item>
              )}
            </Col>

            <Col span={12}>
              <Form.Item
                label="ถึงวันที่"
                name="endDate"
                rules={[{ required: true, message: "กรุณาเลือกวันที่สิ้นสุด" }]}
              >
                <DatePicker style={{ width: "100%" }} disabled={!is_edit} />
              </Form.Item>
              {endDate && startDate && !startDate.isSame(endDate, "day") && (
                <Form.Item
                  name="endType"
                  rules={[{ required: true, message: "กรุณาเลือกช่วงเวลา" }]}
                >
                  <Radio.Group disabled={!is_edit}>
                    <Radio value="full">เต็มวัน</Radio>
                    <Radio value="am">ครึ่งเช้า</Radio>
                    <Radio value="pm">ครึ่งบ่าย</Radio>
                  </Radio.Group>
                </Form.Item>
              )}
            </Col>
          </Row>

          {/* แนบเอกสาร - เฉพาะลาป่วย */}
          {selectedleaveTypeObj?.leave_type?.name === "ลาป่วย" && (
            <Form.Item
              label="แนบเอกสารเพิ่มเติม"
              name="attachments"
              rules={[{ required: true, message: "กรุณาแนบไฟล์เอกสาร" }]}
            >
              <Upload
                fileList={fileList}
                onChange={handleChange}
                disabled={!is_edit}
              >
                <Button icon={<UploadOutlined />} disabled={!is_edit}>
                  เลือกไฟล์
                </Button>
              </Upload>
            </Form.Item>
          )}

          {/* ตารางสรุปการลา */}
          <div className="mt-6 mb-4">
            <Table
              dataSource={summaryData}
              pagination={false}
              bordered
              columns={columns}
            />
          </div>

          {/* ปุ่มส่งใบลา */}
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
                      disabled={remainingLeaveDays < 0}
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
                      disabled={remainingLeaveDays < 0}
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

            {remainingLeaveDays < 0 && (
              <div style={{ width: "100%", textAlign: "center", marginTop: 8 }}>
                <Text type="danger" style={{ fontWeight: 500 }}>
                  ระยะเวลาการลาเกินกว่าที่กำหนด
                </Text>
              </div>
            )}
          </Form.Item>
        </Form>
      </Space>
    </div>
  );
};

export default InternationalLeaveFormEdit;
