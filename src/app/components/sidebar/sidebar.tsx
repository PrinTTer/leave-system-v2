"use client";
import {
    Avatar,
    Col,
    Flex,
    Layout,
    Menu,
    Row,
    Typography,
    Dropdown,
    Space,
} from "antd";
import type { MenuProps } from "antd";
import { Content, Header } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import { useRouter } from "next/navigation";
import { DownOutlined } from "@ant-design/icons";
import "@ant-design/v5-patch-for-react-19";

import * as Icons from "lucide-react";
import { ThemWebColor } from "@/app/utils/constants";
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import { useUser } from "@/app/contexts/userContext";
dayjs.locale('th');

// ... (การ import อื่นๆ เหมือนเดิม)

export default function UserLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { Title } = Typography;
    const router = useRouter();
    const { setAppRole, user, appRole, logout } = useUser(); // เพิ่ม appRole มาใช้เช็คสี

    // --- 1. จัดการเมนูใน Dropdown (มุมขวาบน) ---
    const dropdownItems: MenuProps["items"] = user 
    ? [
        { key: "user-info", label: user?.fullname || "ผู้ใช้งาน", disabled: true },
        { type: "divider" },
        { key: "profile", label: "บัญชีของฉัน", icon: <Icons.UserRound /> },
        { key: "role-header", label: "เปลี่ยนบทบาท", disabled: true },
        
        // บทบาท Admin
        ...(user?.role?.some(r => r.thai_name === 'ผู้ดูแลระบบ') ? [{
            key: "role-admin",
            label: <span style={{ color: appRole === "admin" ? "#52c41a" : "inherit" }}>ผู้ดูแลระบบ</span>,
            icon: <Icons.UserCog2 style={{ color: appRole === "admin" ? "#52c41a" : "inherit" }} />,
            onClick: () => { setAppRole("admin"); router.push("/private/calendar"); }
        }] : []),

        // บทบาท Approver
        ...(user?.role?.some(r => r.thai_name.startsWith('ผู้อนุมัติ')) ? [{
            key: "role-approver",
            label: <span style={{ color: appRole === "approver" ? "#52c41a" : "inherit" }}>อาจารย์/บุคลากร</span>,
            icon: <Icons.UsersRound style={{ color: appRole === "approver" ? "#52c41a" : "inherit" }} />,
            onClick: () => { setAppRole("approver"); router.push("/private"); }
        }] : []),

        // บทบาท User ปกติ (แสดงเมื่อไม่มีบทบาทพิเศษข้างบน)
        ...(!user?.role?.some(r => r.thai_name === 'ผู้ดูแลระบบ' || r.thai_name.startsWith('ผู้อนุมัติ')) ? [{
            key: "role-user",
            label: <span style={{ color: appRole === "user" ? "#52c41a" : "inherit" }}>อาจารย์/บุคลากร</span>,
            icon: <Icons.User style={{ color: appRole === "user" ? "#52c41a" : "inherit" }} />,
            onClick: () => { setAppRole("user"); router.push("/private"); }
        }] : []),
        
        { type: "divider" },
        { key: "logout", label: "ออกจากระบบ", icon: <Icons.LogOut />, onClick: logout },
    ] 
    : [
        { key: "login", label: "เข้าสู่ระบบ", icon: <Icons.LogIn />, onClick: () => router.push("/login") }
    ];

    // --- 2. จัดการเมนูใน Sidebar (แถบซ้ายมือ) ---
    const sidebarItems: MenuProps["items"] = user 
    ? [
        // เมนูสำหรับคนล็อกอินแล้ว (เหมือนเดิมที่คุณทำไว้)
        {
            key: "home",
            icon: <Icons.House />,
            style: { fontSize: 16, color: "#FDFEFE" },
            label: "ข้อมูลการลา",
            onClick: () => router.push(`/private`),
        },
        {
            key: "calendar",
            icon: <Icons.Calendar />,
            style: { fontSize: 16, color: "#FDFEFE" },
            label: "ปฏิทิน",
            onClick: () => router.push(`/private/calendar`),
        },
        {
            key: "history",
            icon: <Icons.Users />,
            style: { fontSize: 16, color: "#FDFEFE" },
            label: "การลาและประวัติการลา",
            children: [
                {
                    key: "leaveHistory",
                    icon: <Icons.UserCog />,
                    style: { fontSize: 16, color: "#FDFEFE" },
                    label: "ประวัติการลา",
                    onClick: () => router.push(`/private/leave-and-history/leave-history`),
                },
                {
                    key: "leaveStatistics",
                    icon: <Icons.UserCog />,
                    style: { fontSize: 16, color: "#FDFEFE" },
                    label: "สถิติการลา",
                    onClick: () => router.push(`/private/leave-and-history`),
                },
            ],
        },
    ]
    : [
        // --- เมนูสำหรับคนที่ไม่ได้เข้าสู่ระบบ ---
        {
            key: "viewCalendar",
            icon: <Icons.CalendarCheck />,
            style: { fontSize: 16, color: "#FDFEFE" },
            label: "ดูปฏิทิน",
            onClick: () => router.push(`/calendar`), // ปรับ path ตามหน้าปฏิทินส่วนกลางของคุณ
        },
    ];

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Layout>
                <Sider width="300px" style={{ /* style เดิม */ backgroundColor: ThemWebColor.Background }}>
                    {/* ส่วน Logo เดิม */}
                    <div style={{ marginBottom: "10px", marginTop: 10 }}>
                        <Row>
                            <Col span={7} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                <Icons.MonitorCog width={60} height={60} color="#ffffff" />
                            </Col>
                            <Col span={17}>
                                <Title style={{ marginBottom: 0, marginTop: 0, color: "#FDFEFE" }} level={3}>ระบบลา</Title>
                                <Title style={{ marginTop: 0, color: "#FDFEFE" }} level={5}>ภายในองค์กร</Title>
                            </Col>
                        </Row>
                    </div>

                    {/* ใช้ sidebarItems ที่เราแยก Logic ไว้ข้างบน */}
                    <Menu
                        theme="dark"
                        defaultSelectedKeys={["home"]}
                        mode="inline"
                        items={sidebarItems}
                    />
                </Sider>

                <Layout>
                    <Header style={{ /* style เดิม */ backgroundColor: ThemWebColor.Selete }}>
                        <Flex justify={"flex-end"} align={"center"}>
                            <Avatar size={40} icon={<Icons.UserRound />} />
                            <div style={{ marginLeft: "10px" }}>
                                {/* ใช้ dropdownItems ที่เราแยก Logic ไว้ข้างบน */}
                                <Dropdown menu={{ items: dropdownItems }}>
                                    <a onClick={(e) => e.preventDefault()}>
                                        <Space>
                                            <div style={{ color: "white" }}>
                                                {user ? user.fullname : "Guest"}
                                            </div>
                                            <DownOutlined style={{ color: "white" }} />
                                        </Space>
                                    </a>
                                </Dropdown>
                            </div>
                        </Flex>
                    </Header>
                    <Content style={{ paddingTop: 20, paddingRight: 25, paddingLeft: 20, marginBottom: 100 }}>
                        {children}
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
}
