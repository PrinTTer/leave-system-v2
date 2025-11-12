"use client";
import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Select,
  Space,
  Tooltip,
  Input,
  Row,
  Col,
  Typography,
  Form,
  Breadcrumb,
} from "antd";
import { useRouter, useParams } from "next/navigation";
import type { ColumnsType } from "antd/es/table";
import * as Icons from "lucide-react";

const { Title } = Typography;

/** === Types === */
interface Approver {
  id: number;
  academicPosition?: string | null;
  pronuon?: string | null;
  thaiName: string;
  englishName?: string;
  department?: string;
  position?: string;
  positionApprover?: string;
  updatedAt?: string;
  createdAt?: string;
  level: number[]; // levels this approver belongs to
}

interface User {
  id: number;
  academicPosition?: string | null;
  pronuon?: string | null;
  thaiName: string;
  englishName?: string;
  department?: string;
  position?: string;
  approver: Approver[];
  updatedAt?: string;
  createdAt?: string;
}

/** === Mock data (kept same shape, but typed) === */
const allApprovers: Approver[] = [
  {
    id: 1,
    academicPosition: "ผศ.ดร.",
    pronuon: "นางสาว",
    thaiName: "วรัญญา ศรีสุข",
    englishName: "Waranya Srisuk",
    department: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
    position: "หัวหน้าภาควิชา",
    positionApprover: "หัวหน้าภาควิชาคอมพิวเตอร์",
    updatedAt: "2025-07-03T10:15:23Z",
    createdAt: "2025-07-03T10:15:23Z",
    level: [1],
  },
  // ... (เหลืออันเดิมทั้งหมด — เก็บไว้ตามเดิม)
  {
    id: 2,
    academicPosition: "อ.ร้อยตรี",
    pronuon: "นาย",
    thaiName: "อนุมัติ กลางเมือง",
    englishName: "Anumat Klangmuang",
    department: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
    position: "รองหัวหน้าภาควิชา",
    positionApprover: "รักษาการแทนหัวหน้าภาควิชาวิศวกรรมคอมพิวเตอร์",
    updatedAt: "2025-07-03T10:17:45Z",
    createdAt: "2025-07-03T10:15:23Z",
    level: [1],
  },
  {
    id: 3,
    academicPosition: null,
    pronuon: "นางสาว",
    thaiName: "บัวบาน ศรีสุข",
    englishName: "buaban Srisuk",
    department: "คณะวิศวกรรมศาสตร์",
    position: "เลขานุการ",
    positionApprover: "รักษาการแทนคณบดี",
    updatedAt: "2025-07-03T10:18:12Z",
    createdAt: "2025-07-03T10:15:23Z",
    level: [1],
  },
  {
    id: 4,
    academicPosition: "ดร.",
    pronuon: "นางสาว",
    thaiName: "กนกพร ปราบนที",
    englishName: "Kanokporn Prabnatee",
    department: "คณะวิศวกรรมศาสตร์",
    position: "อธิการบดี",
    positionApprover: "อธิการบดี",
    updatedAt: "2025-07-03T10:20:08Z",
    createdAt: "2025-07-03T10:15:23Z",
    level: [1, 2],
  },
  {
    id: 5,
    academicPosition: "ศ.ดร.",
    pronuon: "นาย",
    thaiName: "สมชาย ดอนเมือง",
    englishName: "Somchai Donmuang",
    department: "คณะวิศวกรรมศาสตร์",
    position: "คณบดี",
    positionApprover: "คณบดี",
    updatedAt: "2025-07-03T10:20:08Z",
    createdAt: "2025-07-03T10:15:23Z",
    level: [1, 2],
  },
  {
    id: 6,
    academicPosition: "ผศ.ดร.",
    pronuon: "นาย",
    thaiName: "กันตพงษ์ กลางเมือง",
    englishName: "Kanthapong Klangmuang",
    department: "ภาควิชาวิศวกรรมเครื่องกล",
    position: "หัวหน้าภาควิชา",
    positionApprover: "หัวหน้าภาควิชาวิศวกรรมเครื่องกล",
    updatedAt: "2025-07-03T10:17:45Z",
    createdAt: "2025-07-03T10:15:23Z",
    level: [1],
  },
  {
    id: 7,
    academicPosition: "อ.ร้อยตรี",
    pronuon: "นาย",
    thaiName: "อนุมัติ กลางเมือง",
    englishName: "Anumat Klangmuang",
    department: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
    position: "รองหัวหน้าภาควิชา",
    positionApprover: "รองหัวหน้าภาควิชาวิศวกรรมคอมพิวเตอร์",
    updatedAt: "2025-07-03T10:17:45Z",
    createdAt: "2025-07-03T10:15:23Z",
    level: [1],
  },
];

const mockUserData: { data: User[]; page: number; totalPage: number; limit: number; totalCount: number } = {
  data: [
    {
      id: 1,
      academicPosition: "ผศ.ดร.",
      pronuon: "นางสาว",
      thaiName: "วรัญญา ศรีสุข",
      englishName: "Waranya Srisuk",
      department: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
      position: "หัวหน้าภาควิชา",
      approver: [
        {
          id: 5,
          academicPosition: "ศ.ดร.",
          pronuon: "นาย",
          thaiName: "สมชาย ดอนเมือง",
          englishName: "Somchai Donmuang",
          department: "คณะวิศวกรรมศาสตร์",
          position: "คณบดี",
          positionApprover: "คณบดี",
          updatedAt: "2025-07-03T10:20:08Z",
          createdAt: "2025-07-03T10:15:23Z",
          level: [1, 2],
        },
        {
          id: 4,
          academicPosition: "ดร.",
          pronuon: "นางสาว",
          thaiName: "กนกพร ปราบนที",
          englishName: "Kanokporn Prabnatee",
          department: "คณะวิศวกรรมศาสตร์",
          position: "อธิการบดี",
          positionApprover: "อธิการบดี",
          updatedAt: "2025-07-03T10:20:08Z",
          createdAt: "2025-07-03T10:15:23Z",
          level: [1, 2],
        },
        {
          id: 3,
          academicPosition: null,
          pronuon: "นางสาว",
          thaiName: "บัวบาน ศรีสุข",
          englishName: "buaban Srisuk",
          department: "คณะวิศวกรรมศาสตร์",
          position: "เลขานุการ",
          positionApprover: "รักษาการแทนคณบดี",
          updatedAt: "2025-07-03T10:18:12Z",
          createdAt: "2025-07-03T10:15:23Z",
          level: [1],
        },
      ],
      updatedAt: "2025-07-03T10:15:23Z",
      createdAt: "2025-07-03T10:15:23Z",
    },
    // ... (ไฟล์ยังคง mock entries อื่น ๆ ตามเดิม)
  ],
  page: 1,
  totalPage: 1,
  limit: 10,
  totalCount: 10,
};

/** === Component === */
export default function ManageApproverPage() {
  const [userData, setUserData] = useState<User | null>(null);
  const [levels, setLevels] = useState<Record<number, Approver[]>>({
    1: [],
    2: [],
    3: [],
    4: [],
  });
  const [form] = Form.useForm();
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    // params.id มาจาก URL — ถ้าไม่มี คืนค่าเป็น undefined
    const userId = Number(params?.id);
    if (Number.isNaN(userId)) return;

    const user = mockUserData.data.find((u) => u.id === userId);
    if (!user) return;

    setUserData(user);
    form.setFieldsValue({
      fullName: `${user.academicPosition ? user.academicPosition + " " : ""}${user.thaiName}`,
      position: user.position,
      department: user.department,
    });

    const grouped: Record<number, Approver[]> = { 1: [], 2: [], 3: [], 4: [] };
    user.approver.forEach((a) => {
      a.level.forEach((lv) => {
        if (!grouped[lv]) grouped[lv] = [];
        grouped[lv].push(a);
      });
    });
    setLevels(grouped);
    // เพิ่ม dependencies form และ params.id ตามคำเตือนของ ESLint
  }, [form, params?.id]);

  const handleDelete = (level: number, id: number) => {
    setLevels((prev) => ({
      ...prev,
      [level]: prev[level].filter((item) => item.id !== id),
    }));
  };

  const handleAdd = (level: number, approverId: number) => {
    const approver = allApprovers.find((a) => a.id === approverId);
    if (!approver) return;

    if (levels[level].some((a) => a.id === approver.id)) return;

    setLevels((prev) => ({
      ...prev,
      [level]: [...prev[level], { ...approver, level: [level] }],
    }));
  };

  const columns = (level: number): ColumnsType<Approver> => [
    {
      title: "ตำแหน่งอนุมัติ",
      dataIndex: "positionApprover",
      key: "positionApprover",
    },
    {
      title: "ชื่อ",
      key: "thaiName",
      render: (_: unknown, record: Approver) =>
        `${record.academicPosition ? record.academicPosition + " " : ""}${record.thaiName}`,
    },
    {
      title: "การจัดการ",
      key: "actions",
      align: "center" as const,
      render: (_: unknown, record: Approver) => (
        <Tooltip title="ลบ">
          <Icons.Trash2
            size={18}
            style={{ cursor: "pointer", color: "red" }}
            onClick={() => handleDelete(level, record.id)}
          />
        </Tooltip>
      ),
    },
  ];

  if (!userData) return <div>Loading...</div>;

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" style={{ width: "100%" }} size={10}>
        <Row>
          <Col span={12}>
            <Title style={{ marginTop: 0, marginBottom: 0, fontSize: 18 }}>
              {"แก้ไขผู้อนุมัติ"}
            </Title>
          </Col>
        </Row>

        <Breadcrumb
          items={[
            {
              title: (
                <a
                  onClick={() => {
                    router.push(`/private/admin/manage-approval`);
                  }}
                >
                  ผู้ขออนุมัติ
                </a>
              ),
            },
            { title: "แก้ไข" },
          ]}
        />

        <div className="chemds-container">
          <h3>ผู้ขออนุมัติ</h3>

          <Form form={form} layout="vertical">

            <Form.Item label="ชื่อ:" name="fullName">
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

          {[1, 2, 3, 4].map((level) => (
            <div key={level} style={{ marginBottom: 32 }}>
              <Space style={{ marginBottom: 8 }}>
                <h4>ผู้อนุมัติ {level}</h4>
                <Select
                  style={{ width: 250 }}
                  placeholder="เลือกผู้อนุมัติ"
                  onSelect={(val: string | number) => handleAdd(level, Number(val))}
                >
                  {allApprovers.map((a) => (
                    <Select.Option key={a.id} value={a.id}>
                      {a.positionApprover} - {a.academicPosition ? a.academicPosition + " " : ""}
                      {a.thaiName}
                    </Select.Option>
                  ))}
                </Select>
              </Space>

              <Table
                columns={columns(level)}
                dataSource={levels[level]}
                rowKey="id"
                pagination={false}
                size="small"
                bordered
              />
            </div>
          ))}

          <Row style={{ justifyContent: "space-between", marginTop: 15 }}>
            <Col>
              <Button
                className="chemds-button"
                type="default"
                onClick={() => router.push(`/private/admin/manage-approval`)}
              >
                ยกเลิก
              </Button>
            </Col>
            <Col>
              <Button className="chemds-button" type="primary">
                บันทึก
              </Button>
            </Col>
          </Row>
        </div>
      </Space>
    </div>
  );
}
