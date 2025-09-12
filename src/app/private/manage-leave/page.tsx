"use client";
import { useEffect, useState } from "react";
import { Button, Col, Row, Space, Table, TableColumnsType, Tooltip, Typography, Tag } from "antd";
import * as Icons from "lucide-react";

type LeaveTypeItem = {
    id: number;
    leaveType: string;
    approvers: string[];
    createdAt: string;
    updatedAt: string;
};

export default function LeaveTypePage() {
    const { Title } = Typography;
    const [data, setData] = useState<LeaveTypeItem[]>([]);

    // mock data
    useEffect(() => {
        setData([
            { id: 1, leaveType: "ลาป่วย", approvers: ["สมชาย", "สมศรี"], createdAt: "2025-09-01", updatedAt: "2025-09-10" },
            { id: 2, leaveType: "ลากิจส่วนตัว", approvers: ["สมชาย"], createdAt: "2025-08-15", updatedAt: "2025-08-20" },
            { id: 3, leaveType: "ลาคลอด", approvers: ["สมศรี"], createdAt: "2025-07-01", updatedAt: "2025-07-10" },
            { id: 4, leaveType: "ลาราชการ", approvers: ["สมชาย", "สมศรี"], createdAt: "2025-06-01", updatedAt: "2025-06-05" },
            { id: 5, leaveType: "ลาพักผ่อน", approvers: [], createdAt: "2025-05-01", updatedAt: "2025-05-03" },
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
            title: "การจัดการ",
            key: "actions",
            align: "center",
            render: (_, record) => (
                <Space>
                    <Tooltip title="แก้ไขข้อมูล">
                        <Icons.Edit
                            style={{ cursor: "pointer", color: "orange" }}
                            onClick={() => console.log("แก้ไข", record.id)}
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
                    <Row style={{ marginBottom: "1%" }}>
                        <Col span={16}>
                        <Button type="primary" onClick={() => console.log("เพิ่มประเภทการลา")}>
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
