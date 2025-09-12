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
    Breadcrumb,
    Select,
    Flex,
    Card,
    Input,
} from "antd";
import { useRouter, useParams } from "next/navigation";
import { ThemButtonColor } from "@/app/utils/constants";

export default function ManageApproverPage() {
    const { Title } = Typography;
    const [form] = Form.useForm();
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [userDetail, setUserDetail] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);

    // mock users data
    const mockUsers = [
        {
            id: 1,
            pronoun: "นางสาว",
            thaiName: "วรัญญา ศรีสุข",
            department: "วิศวกรรมคอมพิวเตอร์",
            position: "อาจารย์",
            approver1: 2,
            approver2: 3,
        },
        {
            id: 2,
            pronoun: "นาย",
            thaiName: "กันตพงษ์ กลางเมือง",
            department: "วิศวกรรมคอมพิวเตอร์",
            position: "อาจารย์",
        },
        {
            id: 3,
            pronoun: "นางสาว",
            thaiName: "บัวบาน ศรีสุข",
            department: "วิศวกรรมคอมพิวเตอร์",
            position: "อาจารย์",
        },
        {
            id: 4,
            pronoun: "นางสาว",
            thaiName: "กนกพร ปราบนที",
            department: "วิศวกรรมคอมพิวเตอร์",
            position: "อาจารย์",
        },
    ];

    const fetchUserDetail = async () => {
        try {
            const found = mockUsers.find((u) => u.id === Number(params.id));
            setUserDetail(found);
            setUsers(mockUsers);

            if (found) {
                // set ค่า default approver ถ้ามีอยู่แล้ว
                form.setFieldsValue({
                    approver1: found.approver1 || null,
                    approver2: found.approver2 || null,
                });
            }
        } catch (error) {
            console.log("error: ", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUserDetail();
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
                            {"จัดการผู้อนุมัติ"}
                        </Title>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <Breadcrumb
                            items={[
                                {
                                    title: (
                                        <a
                                            onClick={() => {
                                                setLoading(true);
                                                router.push(`/private/user`);
                                            }}
                                        >
                                            จัดการการอนุมัติ
                                        </a>
                                    ),
                                },
                                { title: "จัดการผู้อนุมัติ" },
                            ]}
                        />
                    </Col>
                </Row>
                <div >
                    <Card>
                        <Form layout="vertical" form={form}>
                            {/* คำนำหน้า + ชื่อ */}
                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item label="คำนำหน้า">
                                        <Input value={userDetail?.pronoun} disabled />
                                    </Form.Item>
                                </Col>
                                <Col span={16}>
                                    <Form.Item label="ชื่อ - สกุล">
                                        <Input value={userDetail?.thaiName} disabled />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item label="ตำแหน่ง">
                                        <Input value={userDetail?.position} disabled />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="แผนก">
                                        <Input value={userDetail?.department} disabled />
                                    </Form.Item>
                                </Col>
                            </Row>


                            {/* ผู้อนุมัติ */}
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="approver1"
                                        label="ผู้อนุมัติ 1"
                                        rules={[{ required: true, message: "กรุณาเลือกผู้อนุมัติ 1" }]}
                                    >
                                        <Select
                                            placeholder="เลือกผู้อนุมัติ 1"
                                            options={users.map((u) => ({
                                                label: `${u.pronoun} ${u.thaiName}`,
                                                value: u.id,
                                            }))}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="approver2"
                                        label="ผู้อนุมัติ 2"
                                        rules={[{ required: true, message: "กรุณาเลือกผู้อนุมัติ 2" }]}
                                    >
                                        <Select
                                            placeholder="เลือกผู้อนุมัติ 2"
                                            options={users.map((u) => ({
                                                label: `${u.pronoun} ${u.thaiName}`,
                                                value: u.id,
                                            }))}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            {/* ปุ่ม */}
                            <Row>
                                <Col span={24}>
                                    <Form.Item>
                                        <Flex justify="end" align="center" gap="small">
                                            <Button
                                                className="chemds-button"
                                                type="primary"
                                                htmlType="submit"
                                                style={{ backgroundColor: ThemButtonColor.Reject }}
                                            >
                                                บันทึก
                                            </Button>
                                            <Button
                                                className="chemds-button"
                                                onClick={() => router.push("/private/manage-approver")}
                                            >
                                                ยกเลิก
                                            </Button>
                                        </Flex>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </Card>
                </div>
            </Space>
        </div>
    );
}
