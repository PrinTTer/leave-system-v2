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
    Typography,
    Tooltip,
    Breadcrumb,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import * as Icons from "lucide-react";

/** Local types to avoid colliding with project-global types */
interface LocalUser {
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
    level?: number[];
}

interface LocalUserList {
    data: LocalUser[];
    page: number;
    totalPage: number;
    limit: number;
    totalCount: number;
}

export default function UserIndexPage() {
    const { Title } = Typography;
    const [form] = Form.useForm();
    const router = useRouter();

    // removed unused `loading` variable; keep only tableLoading which is used
    const [tableLoading, setTableLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [users, setUsers] = useState<LocalUserList>({
        data: [],
        page: 0,
        totalPage: 1,
        limit: 0,
        totalCount: 0,
    });

    const [currentSearch, setCurrentSearch] = useState({
        thaiName: "",
        department: "",
        position: "",
    });

    const columns: ColumnsType<LocalUser> = [
        {
            title: "ชื่อ",
            key: "thaiName",
            align: "left",
            sorter: (a: LocalUser, b: LocalUser) =>
                (a.thaiName || "").localeCompare(b.thaiName || ""),
            render: (_text: unknown, record: LocalUser) =>
                `${record.academicPosition ? record.academicPosition + " " : ""}${record.thaiName}`,
        },
        {
            title: "ตำแหน่ง",
            dataIndex: "position",
            key: "position",
            align: "left",
            sorter: (a: LocalUser, b: LocalUser) =>
                (a.position || "").localeCompare(b.position || ""),
        },
        {
            title: "ตำแหน่งอนุมัติ",
            dataIndex: "positionApprover",
            key: "positionApprover",
            align: "left",
            sorter: (a: LocalUser, b: LocalUser) =>
                (a.positionApprover || "").localeCompare(b.positionApprover || ""),
        },
        {
            title: "ลำดับ",
            key: "level",
            align: "center",
            sorter: (a: LocalUser, b: LocalUser) =>
                (a.level?.length || 0) - (b.level?.length || 0),
            render: (_text: unknown, record: LocalUser) => record.level?.join(", ") || "-",
        },
        {
            title: "การจัดการ",
            key: "actions",
            align: "center",
            width: "20%",
            render: (_text: unknown, record: LocalUser) => (
                <Space size="middle">
                    <Tooltip title="แก้ไข">
                        <Icons.Edit
                            size={18}
                            style={{ cursor: "pointer" }}
                            onClick={() => router.push(`/private/admin/manage-approver/${record.id}`)}
                        />
                    </Tooltip>
                    <Tooltip title="ลบ">
                        <Icons.Trash2
                            size={18}
                            style={{ cursor: "pointer", color: "red" }}
                            onClick={() => {
                                console.log("delete", record.id);
                            }}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const fetchUsers = async () => {
        try {
            // mock response typed as LocalUserList
            const data: LocalUserList = {
                data: [
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
                        department: "คณะวิศวกรรมคอมพิวเตอร์",
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
                ],
                page: 1,
                totalPage: 1,
                limit: 10,
                totalCount: 10,
            };

            setUsers(data);
            setTableLoading(false);
        } catch (error) {
            console.log("error: ", error);
            setTableLoading(false);
        }
    };

    const onPageChange: PaginationProps["onChange"] = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const onSearch = () => {
        setCurrentSearch({
            thaiName: form.getFieldValue("thaiName") || "",
            department: form.getFieldValue("department") || "",
            position: form.getFieldValue("position") || "",
        });
        setCurrentPage(1);
    };

    useEffect(() => {
        setTableLoading(true);
        fetchUsers();
    }, [currentPage, currentSearch]);

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
                            {"ผู้อนุมัติ"}
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
                                    }}>
                                    ผู้อนุมัติ
                                </a>
                            ),
                        },
                    ]}
                />
                <div className="chemds-container">
                    <Row style={{ marginBottom: "1%" }}>
                        <Col span={16}>
                            <Form layout="inline" form={form}>
                                <Col>
                                    <Form.Item name="thaiName">
                                        <Input placeholder="ชื่อ-นามสกุล" allowClear />
                                    </Form.Item>
                                </Col>
                                <Col>
                                    <Form.Item name="department">
                                        <Input placeholder="สังกัด" allowClear />
                                    </Form.Item>
                                </Col>
                                <Col>
                                    <Form.Item name="position">
                                        <Input placeholder="ตำแหน่ง" allowClear />
                                    </Form.Item>
                                </Col>
                                <Col>
                                    <Button
                                        className="chemds-button"
                                        type="primary"
                                        onClick={onSearch}>
                                        ค้นหา
                                    </Button>
                                </Col>
                            </Form>
                        </Col>
                        <Col
                            span={8}
                            style={{ display: "flex", justifyContent: "right" }}>
                            <Button
                                className="chemds-button"
                                type="primary"
                                onClick={() => {
                                    setTableLoading(true);
                                    router.push(`/private/admin/manage-approver/add`);
                                }}>
                                เพิ่ม
                            </Button>
                        </Col>
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
                                current={users.page || currentPage}
                                total={users.totalCount}
                                showSizeChanger={false}
                                pageSize={10}
                                onChange={onPageChange}
                            />
                        </Col>
                    </Row>
                </div>
            </Space>
        </div>
    );
}