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
    Select,
    Tag,
    Breadcrumb,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import * as Icons from "lucide-react";

/** Local types (ตั้งชื่อเฉพาะไฟล์นี้ เพื่อไม่ชนกับ global types ในโปรเจค) */
interface LocalApprover {
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

interface LocalUser {
    id: number;
    academicPosition?: string | null;
    pronuon?: string;
    thaiName: string;
    englishName?: string;
    department?: string;
    position?: string;
    approver?: LocalApprover[];
    updatedAt?: string;
    createdAt?: string;
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
    // เอา loading ที่ไม่ได้ใช้ออก (ใช้ tableLoading แทน)
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
        name: "",
        department: "",
    });

    const renderApproversByLevel = (record: LocalUser, level: number) => {
        const approvers = record.approver?.filter((a) => a.level?.includes(level)) || [];
        if (approvers.length === 0) return "-";

        return (
            <Space size={[0, 4]} wrap>
                {approvers.map((a) => (
                    <Tag color="blue" key={a.id}>
                        {(a.academicPosition ? a.academicPosition + " " : "") + a.thaiName}
                    </Tag>
                ))}
            </Space>
        );
    };

    const columns: ColumnsType<LocalUser> = [
        {
            title: "ชื่อ",
            key: "thaiName",
            align: "left",
            fixed: "left",
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
            title: "ผู้อนุมัติ 1",
            key: "approver1",
            align: "left",
            render: (_text: unknown, record: LocalUser) => renderApproversByLevel(record, 1),
        },
        {
            title: "ผู้อนุมัติ 2",
            key: "approver2",
            align: "left",
            render: (_text: unknown, record: LocalUser) => renderApproversByLevel(record, 2),
        },
        {
            title: "ผู้อนุมัติ 3",
            key: "approver3",
            align: "left",
            render: (_text: unknown, record: LocalUser) => renderApproversByLevel(record, 3),
        },
        {
            title: "ผู้อนุมัติ 4",
            key: "approver4",
            align: "left",
            render: (_text: unknown, record: LocalUser) => renderApproversByLevel(record, 4),
        },
        {
            title: "การจัดการ",
            key: "actions",
            align: "center",
            width: "20%",
            render: (_text: unknown, record: LocalUser) => (
                <Space size="middle">
                    <Tooltip title="แก้ไขผู้อนุมัติ">
                        <Icons.UserPen
                            size={18}
                            style={{ cursor: "pointer" }}
                            onClick={() => router.push(`/private/admin/manage-approval/${record.id}`)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const fetchUsers = async () => {
        try {
            // กำหนดให้ data เป็น LocalUserList ชัดเจน
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
                    // ... (เติมข้อมูลตัวอย่างอื่นตามต้องการ)
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
            name: form.getFieldValue("name") || "",
            department: form.getFieldValue("department") || "",
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
                        <Title style={{ margin: 0, fontSize: 18 }}>
                            ผู้ขออนุมัติ
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
                                    ผู้ขออนุมัติ
                                </a>
                            ),
                        },
                    ]}
                />
                <div className="chemds-container">
                    {/* filter */}
                    <Row style={{ marginBottom: "1%" }}>
                        <Col span={16}>
                            <Form layout="inline" form={form}>
                                <Col>
                                    <Form.Item name="department">
                                        <Select
                                            placeholder="เลือกสังกัด"
                                            style={{ minWidth: 250 }}
                                            allowClear
                                            options={[
                                                // กรอง undefined/null ก่อนสร้าง options
                                                ...new Map(
                                                    users.data
                                                        .map((u) => u.department)
                                                        .filter((d): d is string => !!d)
                                                        .map((d) => [
                                                            d,
                                                            { value: d, label: d },
                                                        ])
                                                ).values(),
                                            ]}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col>
                                    <Form.Item name="name">
                                        <Input
                                            placeholder="ชื่อ-นามสกุล"
                                            allowClear
                                        />
                                    </Form.Item>
                                </Col>
                                <Col>
                                    <Button
                                        className="chemds-button"
                                        type="primary"
                                        onClick={onSearch}
                                    >
                                        ค้นหา
                                    </Button>
                                </Col>
                            </Form>
                        </Col>
                    </Row>

                    {/* table */}
                    <Row style={{ marginBottom: "1%" }}>
                        <Col span={24}>
                            <Table<LocalUser>
                                columns={columns}
                                rowKey={(record) => record.id}
                                dataSource={users.data}
                                style={{ width: "100%" }}
                                pagination={false}
                                bordered
                                loading={tableLoading}
                                scroll={{ x: "max-content" }}
                            />
                        </Col>
                    </Row>

                    {/* pagination */}
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