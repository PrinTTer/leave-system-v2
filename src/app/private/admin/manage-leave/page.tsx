"use client";
import { useEffect, useState } from "react";
import {
    Button,
    Col,
    Row,
    Space,
    Table,
    TableColumnsType,
    Tooltip,
    Typography,
} from "antd";
import * as Icons from "lucide-react";
import { useRouter } from "next/navigation";

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

type LeaveTypeItem = {
    id: number;
    leaveType: string;
    approvers: Approver[];
    rights: {
        lessOrEqual10: number | string; // จำนวนวัน (หรือ "-" ถ้าไม่มี)
        moreThan10: number | string;
    };
    createdAt: string;
    updatedAt: string;
};

export default function LeaveTypePage() {
    const { Title } = Typography;
    const [data, setData] = useState<LeaveTypeItem[]>([]);
    const router = useRouter();

    // mock approver

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


    useEffect(() => {
        setData([
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
        ]);
    }, []);

    const columns: TableColumnsType<LeaveTypeItem> = [
        {
            title: "ประเภทการลา",
            dataIndex: "leaveType",
            key: "leaveType",
            sorter: (a, b) => a.leaveType.localeCompare(b.leaveType),
        },
        {
            title: "ผู้อนุมัติ (คน)",
            key: "approvers",
            align: "center",
            sorter: (a, b) => a.approvers.length - b.approvers.length,
            render: (_, record) => record.approvers.length,
        },
        {
            title: "สิทธิ์ทั้งหมด (วัน)",
            children: [
                {
                    title: "อายุงาน ≤ 10 ปี",
                    dataIndex: ["rights", "lessOrEqual10"],
                    key: "rights10",
                    align: "center",
                },
                {
                    title: "อายุงาน > 10 ปี",
                    dataIndex: ["rights", "moreThan10"],
                    key: "rightsMore10",
                    align: "center",
                },
            ],
        },
        {
            title: "การจัดการ",
            key: "actions",
            align: "center",
            render: (_, record) => (
                <Space>
                    <Tooltip title="แก้ไขข้อมูล">
                        <Icons.Edit
                            style={{ cursor: "pointer", color: "orange" }}
                            onClick={() => router.push(`/private/admin/manage-leave/${record.id}`)}
                        />
                    </Tooltip>
                    <Tooltip title="ลบ">
                        <Icons.Trash
                            style={{ cursor: "pointer", color: "red" }}
                            onClick={() => console.log("ลบ", record.id)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 10 }}>
            <Space direction="vertical" style={{ width: "100%" }} size={10}>
                <Row justify="space-between" align="middle">
                    <Col>
                        <Title level={4} style={{ margin: 0 }}>
                            ประเภทการลา
                        </Title>
                    </Col>
                </Row>

                <div className="chemds-container">
                    <Row style={{ marginBottom: "1%", textAlign: "right" }}>
                        <Col span={24}>
                            <Button
                                type="primary"
                                onClick={() => router.push(`/private/admin/manage-leave/add`)}
                            >
                                เพิ่มประเภทการลา
                            </Button>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <Table
                                columns={columns}
                                dataSource={data}
                                rowKey="id"
                                pagination={{ pageSize: 10 }}
                                bordered
                            />
                        </Col>
                    </Row>
                </div>
            </Space>
        </div>
    );
}
