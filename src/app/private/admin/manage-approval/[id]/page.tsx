"use client";
import { useEffect, useState, useCallback } from "react";
import {
  Table, Button, Select, Space, Tooltip, Input, Row, Col,
  Typography, Form, Breadcrumb, message, Spin
} from "antd";
import { useRouter, useParams } from "next/navigation";
import type { ColumnsType } from "antd/es/table";
import * as Icons from "lucide-react";

// นำเข้า API Services และ Types
import { getRequesterByUser } from "@/services/requesterApi";
import { getApproverList } from "@/services/approverApi";
import { Approver, RequesterDetail, ApproversRaw } from "@/types/approve";

const { Title } = Typography;

export default function ManageApproverPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [levels, setLevels] = useState<Record<number, Approver[]>>({
    1: [], 2: [], 3: [], 4: [],
  });
  const [allPotentialApprovers, setAllPotentialApprovers] = useState<Approver[]>([]);
  const [form] = Form.useForm();
  const router = useRouter();
  const params = useParams();

  const fetchData = useCallback(async () => {
    const account = params?.id as string;
    if (!account) return;

    setLoading(true);
    try {
      // 1. ดึงข้อมูลรายละเอียดของผู้ขอ (API คืนค่าเป็น Array)
      const response = await getRequesterByUser(account);
      
      // *** แก้ไขจุดสำคัญ: ตรวจสอบข้อมูลและเข้าถึง index ที่ 0 ***
      if (!response || response.length === 0) {
          throw new Error("ไม่พบข้อมูลผู้ใช้");
      }
      const data: RequesterDetail = response[0];

      // 2. ดึงรายชื่อผู้อนุมัติทั้งหมดและ Map ข้อมูล
      const fullRawList: ApproversRaw[] = await getApproverList();
      const mappedList: Approver[] = fullRawList.map((item) => ({
        nontri_account: item.nontri_account,
        other_prefix: item.academic_position || "",
        fullname: item.thai_name,
        position: item.position || "",
        approve_position: item.position_approver || "",
        department: item.department || "",
      }));
      setAllPotentialApprovers(mappedList);

      // Map ข้อมูลผู้ขอลง Form (ตรวจสอบว่ามี data.user ก่อนเข้าถึง)
      if (data.user) {
        form.setFieldsValue({
          fullName: `${data.user.other_prefix || ""}${data.user.fullname || ""}`,
          position: data.user.position,
          department: data.user.department,
        });
      }

      // จัดกลุ่มผู้อนุมัติที่มีอยู่เดิมลำดับ 1-4
      setLevels({
        1: data.approver_order1 || [],
        2: data.approver_order2 || [],
        3: data.approver_order3 || [],
        4: data.approver_order4 || [],
      });

    } catch (error) {
      console.error("Fetch Error:", error);
      // แนะนำให้ใช้ notification หรือ App component สำหรับ UI message
      message.error("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  }, [params?.id, form]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // handleAdd และ handleDelete คงเดิมตามที่คุณส่งมา
  const handleAdd = (level: number, account: string | null) => {
    if (!account) return;
    const approver = allPotentialApprovers.find((a) => a.nontri_account === account);
    if (!approver) return;
    if (levels[level].some((a) => a.nontri_account === account)) {
      message.warning("รายชื่อนี้มีอยู่ในลำดับนี้แล้ว");
      return;
    }
    setLevels((prev) => ({
      ...prev,
      [level]: [...prev[level], approver],
    }));
  };

  const handleDelete = (level: number, account: string) => {
    setLevels((prev) => ({
      ...prev,
      [level]: prev[level].filter((item) => item.nontri_account !== account),
    }));
  };

  const columns = (level: number): ColumnsType<Approver> => [
    {
      title: "ตำแหน่งอนุมัติ",
      dataIndex: "approve_position",
      key: "approve_position",
      render: (text, record) => text || record.position,
    },
    {
      title: "ชื่อ-นามสกุล",
      key: "fullname",
      render: (_, record) => `${record.other_prefix}${record.fullname}`,
    },
    {
      title: "การจัดการ",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Tooltip title="ลบ">
          <Icons.Trash2
            size={18}
            style={{ cursor: "pointer", color: "red" }}
            onClick={() => handleDelete(level, record.nontri_account)}
          />
        </Tooltip>
      ),
    },
  ];

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" style={{ width: "100%" }} size={10}>
        <Title style={{ margin: 0, fontSize: 18 }}>แก้ไขผู้อนุมัติ</Title>
        <Breadcrumb items={[
          { title: <a onClick={() => router.push(`/private/admin/manage-approval`)}>ผู้ขออนุมัติ</a> },
          { title: "แก้ไข" },
        ]} />

        <div className="chemds-container">
          <h3 style={{ marginBottom: 20 }}>ข้อมูลผู้ขออนุมัติ</h3>
          <Form form={form} layout="vertical">
            <Form.Item label="ชื่อ-นามสกุล:" name="fullName">
              <Input disabled />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="สังกัด" name="department">
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="ตำแหน่ง" name="position">
                  <Input disabled />
                </Form.Item>
              </Col>
            </Row>
          </Form>

          <hr style={{ margin: '24px 0', border: '0.5px solid #eee' }} />

          {[1, 2, 3, 4].map((level) => (
            <div key={level} style={{ marginBottom: 32 }}>
              <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
                <Col><h4>ผู้อนุมัติลำดับที่ {level}</h4></Col>
                <Col>
                  <Select
                    showSearch
                    style={{ width: 350 }}
                    placeholder="ค้นหาและเพิ่มผู้อนุมัติ"
                    optionFilterProp="children"
                    onSelect={(val: string | null) => handleAdd(level, val)}
                    value={null}
                    filterOption={(input, option) =>
                      String(option?.children || "").toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {allPotentialApprovers.map((a) => (
                      <Select.Option key={a.nontri_account} value={a.nontri_account}>
                        {`${a.other_prefix}${a.fullname} (${a.position})`}
                      </Select.Option>
                    ))}
                  </Select>
                </Col>
              </Row>

              <Table
                columns={columns(level)}
                dataSource={levels[level]}
                rowKey="nontri_account"
                pagination={false}
                size="small"
                bordered
              />
            </div>
          ))}

          <Row gutter={16} justify="end" style={{ marginTop: 24 }}>
            <Col><Button onClick={() => router.push(`/private/admin/manage-approval`)}>ยกเลิก</Button></Col>
            <Col><Button type="primary" onClick={() => message.success("ข้อมูลพร้อมบันทึก")}>บันทึกการแก้ไข</Button></Col>
          </Row>
        </div>
      </Space>
    </div>
  );
}