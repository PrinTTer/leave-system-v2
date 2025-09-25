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
    Select,
    Tag,
} from "antd";
import { useRouter } from "next/navigation";
import * as Icons from "lucide-react";

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
    const [currentSearch, setCurrentSearch] = useState({
        name: "",
        department: "",
    });

const renderApproversByLevel = (record: any, level: number) => {
    const approvers = record.approver?.filter((a: any) => a.level?.includes(level)) || [];
    if (approvers.length === 0) return "-";

    return (
        <Space size={[0, 4]} wrap>
            {approvers.map((a: any) => (
                <Tag color="blue" key={a.id}>
                    {(a.academicPosition ? a.academicPosition + " " : "") + a.thaiName}
                </Tag>
            ))}
        </Space>
    );
};

const columns: TableProps["columns"] = [
    {
        title: "ชื่อ",
        key: "thaiName",
        align: "left",
        fixed: "left",
        sorter: (a, b) =>
            (a.thaiName || "").localeCompare(b.thaiName || ""),
        render: (_, record) =>
            `${record.academicPosition ? record.academicPosition + " " : ""}${record.thaiName}`,
    },
    {
        title: "ตำแหน่ง",
        dataIndex: "position",
        key: "position",
        align: "left",
        sorter: (a, b) =>
        (a.position || "").localeCompare(b.position || ""),
    },
    {
        title: "ผู้อนุมัติ 1",
        key: "approver1",
        align: "left",
        render: (_, record) => renderApproversByLevel(record, 1),
    },
    {
        title: "ผู้อนุมัติ 2",
        key: "approver2",
        align: "left",
        render: (_, record) => renderApproversByLevel(record, 2),
    },
    {
        title: "ผู้อนุมัติ 3",
        key: "approver3",
        align: "left",
        render: (_, record) => renderApproversByLevel(record, 3),
    },
    {
        title: "ผู้อนุมัติ 4",
        key: "approver4",
        align: "left",
        render: (_, record) => renderApproversByLevel(record, 4),
    },
    {
        title: "การจัดการ",
        key: "actions",
        align: "center",
        width: "20%",
        render: (_, record) => (
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
            const data = {
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
                            }
                        ],
                        updatedAt: "2025-07-03T10:15:23Z",
                        createdAt: "2025-07-03T10:15:23Z",
                    },
                    {
                        id: 2,
                        academicPosition: "อ.ร้อยตรี",
                        pronuon: "นาย",
                        thaiName: "อนุมัติ กลางเมือง",
                        englishName: "Anumat Klangmuang",
                        department: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
                        position: "รองหัวหน้าภาควิชา",
                        approver: [
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
                        ],
                        updatedAt: "2025-07-03T10:17:45Z",
                        createdAt: "2025-07-03T10:15:23Z",
                    },
                    {
                        id: 3,
                        academicPosition: "ผศ.ดร.",
                        pronuon: "นางสาว",
                        thaiName: "บุญรัตน์ เผดิมสุข",
                        englishName: "Boonyarat Phaedimsuk",
                        department: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
                        position: "ประธานหลักสูตร ป.ตรี",
                        approver: [
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
                        ],
                        updatedAt: "2025-07-03T10:18:12Z",
                        createdAt: "2025-07-03T10:15:23Z",
                    },
                    {
                        id: 4,
                        academicPosition: "รศ.ดร.",
                        pronuon: "นาย",
                        thaiName: "อมรฤทธิ์ พุทธิปราบนที",
                        englishName: "Amornrit Phutthiprapanee",
                        department: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
                        position: "ประธานหลักสูตร ป.โท",
                        approver: [
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
                        ],
                        updatedAt: "2025-07-03T10:20:08Z",
                        createdAt: "2025-07-03T10:15:23Z",
                    },
                    {
                        id: 5,
                        academicPosition: "ผศ.ดร.",
                        pronuon: "นาย",
                        thaiName: "เสกสรรค์ มธุดอนเมือง",
                        englishName: "Seksan Mathudonmuang",
                        department: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
                        position: "ประธานโครงการหลักสูตร ป.ตรี",
                        approver: [
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
                        ],
                        updatedAt: "2025-07-03T10:20:08Z",
                        createdAt: "2025-07-03T10:15:23Z",
                    },
                    {
                        id: 6,
                        academicPosition: "รศ.ดร.",
                        pronuon: "นาย",
                        thaiName: "ฐิติพงษ์ สถิรเมธสุข",
                        englishName: "Thitipong Sathirametthasuk",
                        department: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
                        position: "อาจารย์",
                        approver: [
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
                        ],
                        updatedAt: "2025-07-03T10:15:23Z",
                        createdAt: "2025-07-03T10:15:23Z",
                    },
                    {
                        id: 7,
                        academicPosition: "ผศ.ดร.",
                        pronuon: "นางสาว",
                        thaiName: "ดวงเพ็ญ พิพัฒสุข",
                        englishName: "Duangpen Pipatsuk",
                        department: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
                        position: "อาจารย์",
                        approver: [
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
                        ],
                        updatedAt: "2025-07-03T10:15:23Z",
                        createdAt: "2025-07-03T10:15:23Z",
                    },
                    {
                        id: 8,
                        academicPosition: "ผศ.ดร.",
                        pronuon: "นาย",
                        thaiName: "ศิวดล เสถียรสุข",
                        englishName: "Siwadol Srisuk",
                        department: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
                        position: "อาจารย์",
                        approver: [
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
                        ],
                        updatedAt: "2025-07-03T10:15:23Z",
                        createdAt: "2025-07-03T10:15:23Z",
                    }
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
        <div style={{ padding: 10 }}>
            <Space direction="vertical" style={{ width: "100%" }} size={10}>
                <Row>
                    <Col span={12}>
                        <Title style={{ margin: 0, fontSize: 18 }}>
                            ผู้ขออนุมัติ
                        </Title>
                    </Col>
                </Row>
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
                                                ...new Map(
                                                    users.data.map((u) => [
                                                        u.department,
                                                        {
                                                            value: u.department,
                                                            label: u.department,
                                                        },
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
                            <Table
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
    );
}