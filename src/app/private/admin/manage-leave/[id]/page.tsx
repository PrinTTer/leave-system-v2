"use client";
import { useEffect, useState } from "react";
import {
    Button,
    Col,
    Form,
    Row,
    Space,
    Typography,
    Skeleton,
    Select,
    Flex,
    Card,
    Input,
} from "antd";
import { useRouter, useParams } from "next/navigation";
import * as Icons from "lucide-react";

type Approver = {
    id: number;
    pronuon: string;
    thaiName: string;
    englishName: string;
    department: string;
    position: string;
    updatedAt: string;
    createdAt: string;
};


export default function ManageApproverPage() {
    const { Title } = Typography;
    const [form] = Form.useForm();
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<any[]>([]);

    // mock approvers (จาก LeaveTypePage)
    const mockUsers = [
        {
                id: 3,
        pronuon: "นางสาว",
        thaiName: "บัวบาน ศรีสุข",
        englishName: "Buaban Srisuk",
        department: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
        position: "หัวหน้าภาควิชา",
        updatedAt: "2025-07-03T10:18:12Z",
        createdAt: "2025-07-03T10:15:23Z",
            },
            {
                id: 4,
        pronuon: "นางสาว",
        thaiName: "กนกพร ปราบนที",
        englishName: "Kanokporn Prabnatee",
        department: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
        position: "หัวหน้าภาควิชา",
        updatedAt: "2025-07-03T10:20:08Z",
        createdAt: "2025-07-03T10:15:23Z",
            },
            {
                id: 5,
        pronuon: "นาย",
        thaiName: "สมชาย ใจดี",
        englishName: "Somchai Jaidee",
        department: "ภาควิชาวิศวกรรมไฟฟ้า",
        position: "คณบดี",
        updatedAt: "2025-07-05T10:20:08Z",
        createdAt: "2025-07-05T10:15:23Z",
            }
        ]

    const mockApprovers2: Approver[] = [
    {
        id: 3,
        pronuon: "นางสาว",
        thaiName: "บัวบาน ศรีสุข",
        englishName: "Buaban Srisuk",
        department: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
        position: "อาจารย์",
        updatedAt: "2025-07-03T10:18:12Z",
        createdAt: "2025-07-03T10:15:23Z",
    },
    {
        id: 4,
        pronuon: "นางสาว",
        thaiName: "กนกพร ปราบนที",
        englishName: "Kanokporn Prabnatee",
        department: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
        position: "อาจารย์",
        updatedAt: "2025-07-03T10:20:08Z",
        createdAt: "2025-07-03T10:15:23Z",
    },
];

const mockApprovers3: Approver[] = [
    ...mockApprovers2,
    {
        id: 5,
        pronuon: "นาย",
        thaiName: "สมชาย ใจดี",
        englishName: "Somchai Jaidee",
        department: "ภาควิชาวิศวกรรมไฟฟ้า",
        position: "หัวหน้าภาควิชา",
        updatedAt: "2025-07-05T10:20:08Z",
        createdAt: "2025-07-05T10:15:23Z",
    },
];

    // mock leaveTypes
    const mockLeaveTypes = [
        {
                id: 1,
                leaveType: "ลาราชการ",
                approvers: mockApprovers2,
                rights: { lessOrEqual10: "-", moreThan10: "-" },
                createdAt: "2025-09-01",
                updatedAt: "2025-09-10",
            },
            {
                id: 2,
                leaveType: "ลาพักผ่อนประจำปี",
                approvers: mockApprovers2,
                rights: { lessOrEqual10: 10, moreThan10: 20 },
                createdAt: "2025-08-15",
                updatedAt: "2025-08-20",
            },
            {
                id: 3,
                leaveType: "ลาไปช่วยเหลือภริยาที่คลอดบุตร",
                approvers: mockApprovers2,
                rights: { lessOrEqual10: 15, moreThan10: 15 },
                createdAt: "2025-07-01",
                updatedAt: "2025-07-10",
            },
            {
                id: 4,
                leaveType: "ลากิจส่วนตัว",
                approvers: mockApprovers2,
                rights: { lessOrEqual10: 45, moreThan10: 45 },
                createdAt: "2025-06-01",
                updatedAt: "2025-06-05",
            },
            {
                id: 5,
                leaveType: "ลาป่วย",
                approvers: mockApprovers2,
                rights: { lessOrEqual10: 90, moreThan10: 90 },
                createdAt: "2025-05-01",
                updatedAt: "2025-05-03",
            },
            {
                id: 6,
                leaveType: "ลาบวช/อุปสมบท",
                approvers: mockApprovers3,
                rights: { lessOrEqual10: 120, moreThan10: 120 },
                createdAt: "2025-05-05",
                updatedAt: "2025-05-06",
            },
            {
                id: 7,
                leaveType: "ลาไปพิธีฮัจน์",
                approvers: mockApprovers2,
                rights: { lessOrEqual10: 120, moreThan10: 120 },
                createdAt: "2025-05-07",
                updatedAt: "2025-05-08",
            },
    ];

    const fetchLeaveType = async () => {
        const found = mockLeaveTypes.find((l) => l.id === Number(params.id));
        setUsers(mockUsers);

        if (found) {
            form.setFieldsValue({
                leaveType: found.leaveType,
                rights: found.rights,
                approvers: found.approvers.length
                    ? found.approvers.map((a) => ({
                        position: a.position,
                        userId: a.id,
                    }))
                    : [{}], // ถ้าไม่มีเลย บังคับใส่ object เปล่าๆ
            });

        }
        setLoading(false);
    };

    useEffect(() => {
        fetchLeaveType();
    }, []);

    if (loading) {
        return <Skeleton active />;
    }

    return (
        <div style={{ padding: 10 }}>
            <Space direction="vertical" style={{ width: "100%" }} size={10}>
                <Row>
                    <Col span={24}>
                        <Title style={{ marginTop: 0, marginBottom: 0, fontSize: 18 }}>
                            {"แก้ไขข้อมูลประเภทลา"}
                        </Title>
                    </Col>
                </Row>

                <Card>
                    <Form
                        layout="vertical"
                        form={form}
                        onFinish={(values) => console.log("submit:", values)}
                    >
                        {/* ประเภทการลา */}
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="leaveType"
                                    label="ประเภทการลา"
                                    rules={[{ required: true }]}
                                >
                                    <Input placeholder="ระบุชื่อประเภทการลา" />
                                </Form.Item>
                            </Col>
                        </Row>

                        {/* สิทธิ์ลา */}
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name={["rights", "lessOrEqual10"]}
                                    label="สิทธิ์ (≤ 10 ปี)"
                                >
                                    <Input type="number" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name={["rights", "moreThan10"]}
                                    label="สิทธิ์ (> 10 ปี)"
                                >
                                    <Input type="number" />
                                </Form.Item>
                            </Col>
                        </Row>

                        {/* ผู้อนุมัติ */}
                        <Form.List name="approvers">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }, index) => (
                                        <Card
                                            key={key}
                                            size="small"
                                            title={`ผู้อนุมัติ อันดับ ${index + 1}`}
                                            extra={
                                                <Button danger type="text" onClick={() => remove(name)}>
                                                    ลบ
                                                </Button>
                                            }
                                            style={{ marginBottom: 10 }}
                                        >
                                            <Row gutter={16}>
                                                <Col span={12}>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, "position"]}
                                                        label="ตำแหน่ง"
                                                    >
                                                        <Select
                                                            options={[
                                                                { value: "อาจารย์", label: "อาจารย์" },
                                                                {
                                                                    value: "หัวหน้าภาควิชา",
                                                                    label: "หัวหน้าภาควิชา",
                                                                },
                                                            ]}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={12}>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, "userId"]}
                                                        label="ชื่อผู้อนุมัติ"
                                                    >
                                                        <Select
                                                            options={users.map((u) => ({
                                                                value: u.id,
                                                                label: u.thaiName,
                                                            }))}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        </Card>
                                    ))}

                                    <Button
                                        type="dashed"
                                        onClick={() => add()}
                                        block
                                        icon={<Icons.Plus size={16} />}
                                    >
                                        เพิ่มผู้อนุมัติ
                                    </Button>
                                </>
                            )}
                        </Form.List>

                        {/* ปุ่ม */}
                        <Row style={{ justifyContent: "space-between", marginTop: 15 }}>
                            <Col>
                                <Form.Item>
                                    <Flex justify="space-between" gap="small">
                                        <Button
                                            onClick={() => router.push("/private/admin/manage-leave")}
                                        >
                                            ยกเลิก
                                        </Button>
                                        
                                    </Flex>
                                </Form.Item>
                            </Col>
                            <Col>
                                <Form.Item>
                                    <Flex justify="space-between" gap="small">
                                        
                                        <Button type="primary" htmlType="submit">
                                            บันทึก
                                        </Button>
                                    </Flex>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Card>
            </Space>
        </div>
    );
}
