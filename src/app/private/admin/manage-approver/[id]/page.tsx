"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Breadcrumb, Button, Checkbox, Col, Form, Input, Row, Space, Typography } from "antd";

const { Title } = Typography;

const mockData = [
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
    const [approver, setApprover] = useState<any>(null);

    useEffect(() => {
        const id = Number(params?.id);
        const data = mockData.find((item) => item.id === id);
        if (data) {
            setApprover(data);
            setCheckedLevels(data.level);
            form.setFieldsValue({
                fullName: `${data.academicPosition ? data.academicPosition + " " : ""}${data.thaiName}`,
                position: data.position,
                positionApprover: data.positionApprover,
            });
        }
    }, [params?.id]);

    const handleAddLevel = () => {
        const next = levels.length + 1;
        setLevels([...levels, next]);
    };

    const handleSave = (values: any) => {
        const updated = {
            ...approver,
            positionApprover: values.positionApprover,
            level: checkedLevels,
        };
        console.log("updated data:", updated);
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
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setCheckedLevels([...checkedLevels, lvl]);
                                            } else {
                                                setCheckedLevels(checkedLevels.filter((l) => l !== lvl));
                                            }
                                        }}
                                    >
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
                                    onClick={() => router.push(`/private/admin/manage-approver`)}
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
                    </Form>
                </div>
            </Space>
        </div>
    );
}
