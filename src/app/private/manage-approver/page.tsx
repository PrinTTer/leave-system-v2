"use client";
import { useEffect, useState } from "react";
import {
    Button,
    Col,
    Form,
    Input,
    Pagination,
    PaginationProps,
    Row,
    Space,
    Table,
    TableProps,
    Typography,
    Tooltip,
    InputNumber,
} from "antd";
import { useRouter } from "next/navigation";
import * as Icons from "lucide-react";
// import { convertDateTimeFormate, convertDateTimeToNumber } from "@/app/utils";

export default function UserIndexPage() {
    const { Title } = Typography;
    const [form] = Form.useForm();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [users, setUsers] = useState<UserList>({
        data: [],
        page: 0,
        totalPage: 1,
        limit: 0,
        totalCount: 0,
    });
    const [currentSearch, setcurrentSearch] = useState({
        nontriAccount: "",
        name: "",
        surname: "",
    });

    const columns: TableProps["columns"] = [
    {
        title: "ชื่อ",
        dataIndex: "thaiName",
        key: "thaiName",
        align: "left",
    },
    {
        title: "ตำแหน่ง",
        dataIndex: "position",
        key: "position",
        align: "left",
    },
    {
        title: "แผนก",
        dataIndex: "department",
        key: "department",
        align: "left",
    },
    {
        title: "ผู้อนุมัติ 1",
        key: "approver1",
        align: "left",
        render: (_, record) => record.approver?.[0]?.thaiName || "-",
    },
    {
        title: "ผู้อนุมัติ 2",
        key: "approver2",
        align: "left",
        render: (_, record) => record.approver?.[1]?.thaiName || "-",
    },
    {
        title: "การจัดการ",
        key: "actions",
        align: "center",
        width: "15%",
        render: (_, record) => (
        <Space size="middle">
            <Tooltip title="ผู้อนุมัติ">
            <Icons.UserPlus
                size={18}
                style={{ cursor: "pointer" }}
                onClick={() => router.push(`/private/manage-approver/${record.id}`)}
            />
            </Tooltip>
        </Space>
        ),
    },
];


    const fetchUsers = async () => {
        try {
            const data = {
                data: [
                    {
                        id: 1,
                        pronuon: "นางสาว",
                        thaiName: "วรัญญา ศรีสุข",
                        englishName: "Waranya Srisuk",
                        department: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
                        position: "อาจารย์ภาควิชาวิศวกรรมคอมพิวเตอร์",
                        approver: [
                            {
                                id: 3,
                                pronuon: "นางสาว",
                                thaiName: "บัวบาน ศรีสุข",
                                englishName: "buaban Srisuk",
                                department: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
                                position: "อาจารย์ภาควิชาวิศวกรรมคอมพิวเตอร์",
                            },
                            {
                                id: 4,
                                pronuon: "นางสาว",
                                thaiName: "กนกพร ปราบนที",
                                englishName: "Kanokporn Prabnatee",
                                department: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
                                position: "อาจารย์ภาควิชาวิศวกรรมคอมพิวเตอร์",
                            }
                        ],
                        updatedAt: "2025-07-03T10:15:23Z",
                        createdAt: "2025-07-03T10:15:23Z",
                    },
                    {
                        id: 2,
                        pronuon: "นาย",
                        thaiName: "กันตพงษ์ กลางเมือง",
                        englishName: "Kanthapong Klangmuang",
                        department: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
                        position: "อาจารย์ภาควิชาวิศวกรรมคอมพิวเตอร์",
                        updatedAt: "2025-07-03T10:17:45Z",
                        createdAt: "2025-07-03T10:15:23Z",
                    },
                    {
                        id: 3,
                        pronuon: "นางสาว",
                        thaiName: "บัวบาน ศรีสุข",
                        englishName: "buaban Srisuk",
                        department: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
                        position: "อาจารย์ภาควิชาวิศวกรรมคอมพิวเตอร์",
                        updatedAt: "2025-07-03T10:18:12Z",
                        createdAt: "2025-07-03T10:15:23Z",
                    },
                    {
                        id: 4,
                        pronuon: "นางสาว",
                        thaiName: "กนกพร ปราบนที",
                        englishName: "Kanokporn Prabnatee",
                        department: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
                        position: "อาจารย์ภาควิชาวิศวกรรมคอมพิวเตอร์",
                        updatedAt: "2025-07-03T10:20:08Z",
                        createdAt: "2025-07-03T10:15:23Z",
                    },
                ],
                page: 1,
                totalPage: 1,
                limit: 10,
                totalCount: 10,
            };
            setUsers(data);
            setLoading(false);
            setTableLoading(false);
        } catch (error) {
            console.log("error: ", error);
            setLoading(false);
            setTableLoading(false);
        }
    };

    const onPageChange: PaginationProps["onChange"] = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const onSearch = () => {
        setcurrentSearch({
            nontriAccount: form.getFieldValue("nontriAccount"),
            name: form.getFieldValue("name"),
            surname: form.getFieldValue("surname"),
        });
        setCurrentPage(1);
    };

    useEffect(() => {
        setTableLoading(true);
        fetchUsers();
    }, [currentPage, currentSearch]);

    return (
        <>
            <div style={{ padding: 10 }}>
                <Space direction="vertical" style={{ width: "100%" }} size={10}>
                    <Row>
                        <Col span={12}>
                            <Title
                                style={{
                                    marginTop: 0,
                                    marginBottom: 0,
                                    fontSize: 18,
                                }}>
                                {"ผู้ใช้งานระบบ"}
                            </Title>
                        </Col>
                    </Row>
                    <div className="chemds-container">
                        <Row style={{ marginBottom: "1%" }}>
                            <Col span={16}>
                                <Form layout="inline" form={form}>
                                    <Col>
                                        <Form.Item name="nontriAccount">
                                            <Input placeholder="บัญชีนนทรี" allowClear />
                                        </Form.Item>
                                    </Col>
                                    <Col>
                                        <Form.Item name="name">
                                            <Input placeholder="ชื่อ" allowClear />
                                        </Form.Item>
                                    </Col>
                                    <Col>
                                        <Form.Item name="surname">
                                            <Input placeholder="นามสกุล" allowClear />
                                        </Form.Item>
                                    </Col>
                                    <Col>
                                        <Button
                                            className="chemds-button"
                                            type="primary"
                                            onClick={() => {
                                                onSearch();
                                            }}>
                                            ค้นหา
                                        </Button>
                                    </Col>
                                </Form>
                            </Col>
                            {/* <Col
                                span={8}
                                style={{ display: "flex", justifyContent: "right" }}>
                                <Button
                                    className="chemds-button"
                                    type="primary"
                                    onClick={() => {
                                        setLoading(true);
                                        router.push(`/private/user/new`);
                                    }}>
                                    เพิ่ม
                                </Button>
                            </Col> */}
                        </Row>
                        <Row style={{ marginBottom: "1%" }}>
                            <Col span={24}>
                                <Table
                                    columns={columns}
                                    rowKey={(record) => record.id}
                                    dataSource={users.data}
                                    style={{ width: "100%" }}
                                    pagination={false}
                                    bordered
                                    loading={tableLoading}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <Pagination
                                    defaultCurrent={1}
                                    total={users.totalCount}
                                    showSizeChanger={false}
                                    pageSize={10}
                                    onChange={onPageChange}
                                    align="end"
                                />
                            </Col>
                        </Row>
                    </div>
                </Space>
            </div>
        </>
    );
}
