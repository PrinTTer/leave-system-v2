"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Breadcrumb,
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  Row,
  Space,
  Typography,
} from "antd";
import type { CheckboxChangeEvent } from "antd/es/checkbox";

const { Title } = Typography;

/** types */
interface Approver {
  id: number;
  academicPosition?: string | null;
  pronuon?: string;
  thaiName: string;
  englishName?: string;
  department?: string;
  position?: string;
  positionApprover?: string;
  updatedAt?: string;
  createdAt?: string;
  level: number[];
}

/** mock data typed */
const mockData: Approver[] = [
  {
    id: 1,
    academicPosition: "รศ.ดร.",
    pronuon: "นางสาว",
    thaiName: "วรัญญา ศรีสุข",
    englishName: "Waranya Srisuk",
    department: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
    position: "อาจารย์ภาควิชาวิศวกรรมคอมพิวเตอร์",
    positionApprover: "หัวหน้าภาควิชาคอมพิวเตอร์",
    updatedAt: "2025-07-03T10:15:23Z",
    createdAt: "2025-07-03T10:15:23Z",
    level: [1],
  },
  {
    id: 2,
    academicPosition: "ร้อยตรี",
    pronuon: "นาย",
    thaiName: "กันตพงษ์ กลางเมือง",
    englishName: "Kanthapong Klangmuang",
    department: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
    position: "อาจารย์ภาควิชาวิศวกรรมคอมพิวเตอร์",
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
    department: "คณะวิศวกรรมคอมพิวเตอร์",
    position: "เลขานุการคณะ",
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
    department: "คณะวิศวกรรมคอมพิวเตอร์",
    position: "อธิการบอดี",
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
    department: "คณะวิศวกรรมคอมพิวเตอร์",
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
    thaiName: "อนุมัติ กลางเมือง",
    englishName: "Anumat Klangmuang",
    department: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
    position: "อาจารย์ภาควิชาวิศวกรรมคอมพิวเตอร์",
    positionApprover: "รองหัวหน้าภาควิชาวิศวกรรมคอมพิวเตอร์",
    updatedAt: "2025-07-03T10:17:45Z",
    createdAt: "2025-07-03T10:15:23Z",
    level: [1],
  },
  {
    id: 7,
    academicPosition: "ร้อยตรี",
    pronuon: "นาย",
    thaiName: "กันตพงษ์ กลางเมือง",
    englishName: "Kanthapong Klangmuang",
    department: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
    position: "อาจารย์ภาควิชาวิศวกรรมคอมพิวเตอร์",
    positionApprover: "รองหัวหน้าภาควิชาวิศวกรรมคอมพิวเตอร์",
    updatedAt: "2025-07-03T10:17:45Z",
    createdAt: "2025-07-03T10:15:23Z",
    level: [1],
  },
];

export default function EditApproverPage() {
  const router = useRouter();
  const params = useParams();
  const [form] = Form.useForm();
  const [levels, setLevels] = useState<number[]>([1, 2, 3, 4, 5]);
  const [checkedLevels, setCheckedLevels] = useState<number[]>([]);
  const [approver, setApprover] = useState<Approver | null>(null);

  useEffect(() => {
    // include `form` in deps to satisfy exhaustive-deps; form reference is stable but lint prefers explicit
    const id = Number(params?.id);
    if (Number.isNaN(id)) {
      setApprover(null);
      return;
    }
    const data = mockData.find((item) => item.id === id) ?? null;
    if (data) {
      setApprover(data);
      setCheckedLevels(Array.isArray(data.level) ? data.level : []);
      form.setFieldsValue({
        fullName: `${data.academicPosition ? data.academicPosition + " " : ""}${data.thaiName}`,
        position: data.position,
        positionApprover: data.positionApprover,
      });
    } else {
      setApprover(null);
    }
  }, [params?.id, form]);

  const handleAddLevel = () => {
    // pick next unused positive integer
    const max = levels.length > 0 ? Math.max(...levels) : 0;
    const next = max + 1;
    setLevels((prev) => [...prev, next]);
  };

  const handleSave = (values: { positionApprover?: string }) => {
    // typed update
    const updated: Approver = {
      ...(approver as Approver),
      positionApprover: values.positionApprover,
      level: checkedLevels,
    };
    console.log("updated data:", updated);
    // simulate redirect back
    router.push("/private/admin/manage-approver");
  };

  if (!approver) return <p>ไม่พบข้อมูล</p>;

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" style={{ width: "100%" }} size={10}>
        <Row>
          <Col span={12}>
            <Title
              style={{
                marginTop: 0,
                marginBottom: 0,
                fontSize: 18,
              }}>
              {"แก้ไขข้อมูลผู้อนุมัติ"}
            </Title>
          </Col>
        </Row>
        <Breadcrumb
          items={[
            {
              title: (
                <a
                  onClick={() => {
                    router.push(`/private/admin/manage-approver`);
                  }}>
                  ผู้อนุมัติ
                </a>
              ),
            },
            { title: "แก้ไข" },
          ]}
        />
        <div className="chemds-container">
          <Form form={form} layout="vertical" onFinish={handleSave}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="ชื่อ" name="fullName">
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="ตำแหน่ง" name="position">
                  <Input disabled />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="ตำแหน่งอนุมัติ" name="positionApprover">
              <Input placeholder="กรอกตำแหน่งอนุมัติ" />
            </Form.Item>

            <Form.Item label="ลำดับที่อนุมัติ">
              <Space direction="vertical">
                {levels.map((lvl) => (
                  <Checkbox
                    key={lvl}
                    checked={checkedLevels.includes(lvl)}
                    onChange={(e: CheckboxChangeEvent) => {
                      if (e.target.checked) {
                        setCheckedLevels((prev) => (prev.includes(lvl) ? prev : [...prev, lvl]));
                      } else {
                        setCheckedLevels((prev) => prev.filter((l) => l !== lvl));
                      }
                    }}>
                    ลำดับ {lvl}
                  </Checkbox>
                ))}
                <Button type="dashed" onClick={handleAddLevel}>
                  + เพิ่มลำดับ
                </Button>
              </Space>
            </Form.Item>
            <Row style={{ justifyContent: "space-between", marginTop: 15 }}>
              <Col>
                <Button
                  className="chemds-button"
                  type="default"
                  onClick={() => router.push(`/private/admin/manage-approver`)}>
                  ยกเลิก
                </Button>
              </Col>
              <Col>
                <Button className="chemds-button" type="primary" htmlType="submit">
                  บันทึก
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
      </Space>
    </div>
  );
}