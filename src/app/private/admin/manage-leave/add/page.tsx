"use client";
import { useEffect, useState } from "react";
import {
    Button,
    Col,
    Form,
    Row,
    Space,
    Typography,
    Select,
    Card,
    Input,
    Flex,
} from "antd";
import { useRouter } from "next/navigation";
import * as Icons from "lucide-react";

export default function AddLeaveTypePage() {
    const { Title } = Typography;
    const [form] = Form.useForm();
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);

    // mock approvers (ใช้จาก LeaveTypePage)
    const mockUsers = [
        { id: 3, pronoun: "นางสาว", thaiName: "บัวบาน ศรีสุข", position: "อาจารย์" },
        { id: 4, pronoun: "นางสาว", thaiName: "กนกพร ปราบนที", position: "อาจารย์" },
        { id: 5, pronoun: "นาย", thaiName: "สมชาย ใจดี", position: "หัวหน้าภาควิชา" },
    ];

    useEffect(() => {
        setUsers(mockUsers);
    }, []);

    const onFinish = (values: any) => {
        console.log("เพิ่มข้อมูลประเภทลา:", values);
        // TODO: ส่งข้อมูลไป API
        router.push("/private/admin/manage-leave");
    };

    return (
        <div style={{ padding: 10 }}>
            <Space direction="vertical" style={{ width: "100%" }} size={10}>
                <Row>
                    <Col span={24}>
                        <Title style={{ marginTop: 0, marginBottom: 0, fontSize: 18 }}>
                            {"เพิ่มประเภทลา"}
                        </Title>
                    </Col>
                </Row>

                <Card>
                    <Form
                        layout="vertical"
                        form={form}
                        onFinish={onFinish}
                    >
                        {/* ประเภทการลา */}
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="leaveType"
                                    label="ประเภทการลา"
                                    rules={[
                                        { required: true, message: "กรุณาระบุประเภทการลา" },
                                        { min: 2, message: "ต้องมีอย่างน้อย 2 ตัวอักษร" },
                                    ]}
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
                                    rules={[
                                        { required: true, message: "กรุณาระบุจำนวนวัน" },
                                        { type: "number", min: 0, message: "ต้องกรอกตัวเลข ≥ 0" },
                                    ]}
                                >
                                    <Input type="number" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name={["rights", "moreThan10"]}
                                    label="สิทธิ์ (> 10 ปี)"
                                    rules={[
                                        { required: true, message: "กรุณาระบุจำนวนวัน" },
                                        { type: "number", min: 0, message: "ต้องกรอกตัวเลข ≥ 0" },
                                    ]}
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
                                                        rules={[{ required: true, message: "กรุณาเลือกตำแหน่ง" }]}
                                                    >
                                                        <Select
                                                            options={[
                                                                { value: "อาจารย์", label: "อาจารย์" },
                                                                { value: "หัวหน้าภาควิชา", label: "หัวหน้าภาควิชา" },
                                                            ]}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={12}>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, "userId"]}
                                                        label="ชื่อผู้อนุมัติ"
                                                        rules={[{ required: true, message: "กรุณาเลือกผู้อนุมัติ" }]}
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

                                    <Button type="dashed" onClick={() => add()} block icon={<Icons.Plus size={16} />}>
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
