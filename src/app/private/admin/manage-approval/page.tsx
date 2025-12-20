"use client";
import { useEffect, useState } from "react";
import { Space, Table, Typography, Tooltip, Tag, Breadcrumb,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import * as Icons from "lucide-react";
import { getRequester } from "@/services/requesterApi";


// ปรับ Interface ให้ตรงกับ API จริง
interface Approver {
    nontri_account: string;
    other_prefix: string;
    fullname: string;
}

interface RequesterData {
    nontri_account: string;
    user: {
        nontri_account: string;
        other_prefix: string;
        fullname: string;
        position: string;
        department: string;
    };
    approver_order1: Approver[];
    approver_order2: Approver[];
    approver_order3: Approver[];
    approver_order4: Approver[];
}

export default function UserIndexPage() {
    const { Title } = Typography;
    const router = useRouter();
    const [tableLoading, setTableLoading] = useState<boolean>(true);
    const [dataSource, setDataSource] = useState<RequesterData[]>([]);

    // ฟังก์ชัน Render Tag สำหรับผู้อนุมัติแต่ละลำดับ
    const renderApproverTags = (approvers: Approver[]) => {
        if (!approvers || approvers.length === 0) return "-";
        return (
            <Space size={[0, 4]} wrap>
                {approvers.map((a) => (
                    <Tag color="blue" key={a.nontri_account}>
                        {`${a.other_prefix}${a.fullname}`}
                    </Tag>
                ))}
            </Space>
        );
    };

    const columns: ColumnsType<RequesterData> = [
        {
            title: "ชื่อผู้ขออนุมัติ",
            key: "fullname",
            fixed: "left",
            render: (_, record) => `${record.user.other_prefix}${record.user.fullname}`,
        },
        {
            title: "ตำแหน่ง",
            key: "position",
            render: (_, record) => record.user.position,
        },
        {
            title: "ผู้อนุมัติ 1",
            key: "order1",
            render: (_, record) => renderApproverTags(record.approver_order1),
        },
        {
            title: "ผู้อนุมัติ 2",
            key: "order2",
            render: (_, record) => renderApproverTags(record.approver_order2),
        },
        {
            title: "ผู้อนุมัติ 3",
            key: "order3",
            render: (_, record) => renderApproverTags(record.approver_order3),
        },
        {
            title: "ผู้อนุมัติ 4",
            key: "order4",
            render: (_, record) => renderApproverTags(record.approver_order4),
        },
        {
            title: "การจัดการ",
            key: "actions",
            align: "center",
            render: (_, record) => (
                <Tooltip title="แก้ไขผู้อนุมัติ">
                    <Icons.UserPen
                        size={18}
                        style={{ cursor: "pointer" }}
                        onClick={() => router.push(`/private/admin/manage-approval/${record.nontri_account}`)}
                    />
                </Tooltip>
            ),
        },
    ];

    const fetchUsers = async () => {
        setTableLoading(true);
        try {
            const data = await getRequester();
            setDataSource(data);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setTableLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div style={{ padding: 24 }}>
            <Space direction="vertical" style={{ width: "100%" }} size={10}>
                <Title style={{ margin: 0, fontSize: 18 }}>รายชื่อผู้ขออนุมัติ</Title>
                <Breadcrumb items={[{ title: "ผู้ขออนุมัติ" }]} />
                
                <div className="chemds-container" style={{ marginTop: 20 }}>
                    <Table<RequesterData>
                        columns={columns}
                        dataSource={dataSource}
                        rowKey="nontri_account"
                        loading={tableLoading}
                        bordered
                        scroll={{ x: "max-content" }}
                        pagination={{ pageSize: 10 }}
                    />
                </div>
            </Space>
        </div>
    );
}