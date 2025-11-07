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
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DownOutlined } from "@ant-design/icons";
import "@ant-design/v5-patch-for-react-19";

import * as Icons from "lucide-react";
import { ThemWebColor } from "@/app/utils/constants";
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import { useUser } from "@/app/contexts/userContext";
dayjs.locale('th');

export default function PersonnelApproverLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { Title } = Typography;
    const router = useRouter();
    const { setUserRole } = useUser();

    const items: MenuProps["items"] = [
        {
            key: "1",
            label: "อาจารย์/บุคลากร",
            disabled: true,
        },
        {
            type: "divider",
        },
        {
            key: "2",
            label: "บัญชีของฉัน",
            icon: <Icons.UserRound />,
        },

        {
            key: "4",
            label: "บทบาท",
            disabled: true,
        },
        {
            type: "divider",
        },
        {
            key: "5",
            label: "ผู้ดูแลระบบ",
            icon: <Icons.UserCog2 />,
            onClick: () => setUserRole("admin"),
        },
        {
            key: "6",
            label: "อาจารย์/บุคลากร",
            icon: <Icons.UsersRound />,
            onClick: () => setUserRole("approver"),
        },
        {
            type: "divider",
        },
        {
            key: "3",
            label: "ออกจากระบบ",
            icon: <Icons.LogOut />,
        },
    ];

    useEffect(() => { }, []);

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Layout>
                <Sider
                    width="300px"
                    style={{
                        padding: "10px",
                        overflow: "auto",
                        height: "100vh",
                        position: "sticky",
                        insetInlineStart: 0,
                        top: 0,
                        bottom: 0,
                        scrollbarWidth: "thin",
                        scrollbarGutter: "stable",
                        backgroundColor: ThemWebColor.Background,
                    }}>
                    <div style={{ marginBottom: "10px", marginTop: 10 }}>
                        <Row>
                            <Col
                                span={7}
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}>
                                <Icons.MonitorCog width={60} height={60} color="#ffffff" />
                            </Col>
                            <Col span={17}>
                                <Title
                                    style={{ marginBottom: 0, marginTop: 0, color: "#FDFEFE" }}
                                    level={3}>
                                    {"ระบบลา"}
                                </Title>
                                <Title style={{ marginTop: 0, color: "#FDFEFE" }} level={5}>
                                    {"ภายในองค์กร"}
                                </Title>
                            </Col>
                        </Row>
                    </div>
                    <Menu
                        theme="dark"
                        defaultSelectedKeys={["home"]}
                        mode="inline"
                        items={[
                            {
                                key: "home",
                                icon: <Icons.House />,
                                style: { fontSize: 16, color: "#FDFEFE" },
                                label: "ข้อมูลการลา",
                                onClick: () => {
                                    router.push(`/private`);
                                },
                            },
                            {
                                key: "calendar",
                                icon: <Icons.Calendar />,
                                style: { fontSize: 16, color: "#FDFEFE" },
                                label: "ปฏิทิน",
                                children: [
                                    {
                                        key: "viewCalendar",
                                        icon: <Icons.CalendarCheck />,
                                        style: { fontSize: 16, color: "#FDFEFE" },
                                        label: "ดูปฏิทิน",
                                        onClick: () => {
                                            router.push(`/private/calendar`);
                                        },
                                    },
                                ],
                            },
                            {
                                key: "leaveManagement",
                                icon: <Icons.Settings />,
                                style: { fontSize: 16, color: "#FDFEFE" },
                                label: "การลาของบุคคลใต้บังคับบัญชา",
                                children: [
                                    {
                                        key: "genaral",
                                        icon: <Icons.UserSearch />,
                                        style: { fontSize: 16, color: "#FDFEFE" },
                                        label: "คำขออนุมัติลา",
                                        onClick: () => {
                                            router.push(`/private/approver/approve-history`);
                                        },
                                    },
                                    {
                                        key: "officer",
                                        icon: <Icons.UserSearch />,
                                        style: { fontSize: 16, color: "#FDFEFE" },
                                        label: "ลาราชการ",
                                        onClick: () => {
                                            router.push(`/private/approver/approve-history/overseas`);
                                        },
                                    },
                                ],

                            },
                            {
                                key: "history",
                                icon: <Icons.Users />,
                                style: { fontSize: 16, color: "#FDFEFE" },
                                label: "การลาและประวัติการลา",
                                children: [
                                    {
                                        key: "approvalHistory",
                                        icon: <Icons.UserRoundCog />,
                                        style: { fontSize: 16, color: "#FDFEFE" },
                                        label: "ประวัติการอนุมัติ",
                                        onClick: () => {
                                            router.push(`/private/leave-and-history/approval-history`);
                                        },
                                    },
                                    {
                                        key: "leaveHistory",
                                        icon: <Icons.UserCog />,
                                        style: { fontSize: 16, color: "#FDFEFE" },
                                        label: "ประวัติการลา",
                                        onClick: () => {
                                            router.push(`/private/leave-and-history/leave-history`);
                                        },
                                    },
                                    {
                                        key: "leaveStatisticsMember",
                                        icon: <Icons.UserCog />,
                                        style: { fontSize: 16, color: "#FDFEFE" },
                                        label: "สถิติการลาบุคคลใต้บังคับบัญชา",
                                        onClick: () => {
                                            router.push(`/private/leave-and-history`);
                                        },
                                    },
                                    {
                                        key: "leaveStatistics",
                                        icon: <Icons.UserCog />,
                                        style: { fontSize: 16, color: "#FDFEFE" },
                                        label: "สถิติการลา",
                                        onClick: () => {
                                            router.push(`/private/leave-and-history`);
                                        },
                                    },
                                ],
                            },
                        ]}
                    />
                </Sider>
                <Layout>
                    <Header
                        style={{
                            textAlign: "right",
                            color: "#fff",
                            height: 70,
                            paddingInline: 48,
                            lineHeight: "64px",
                            backgroundColor: ThemWebColor.Selete,
                        }}>
                        <div
                            style={{
                                padding: "5px",
                            }}>
                            <Flex
                                style={{ marginBottom: "10px" }}
                                justify={"flex-end"}
                                align={"center"}>
                                <Avatar size={40} icon={<Icons.UserRound />} />
                                <div style={{ marginLeft: "10px" }}>
                                    <Dropdown menu={{ items }}>
                                        <a onClick={(e) => e.preventDefault()}>
                                            <Space>
                                                <div
                                                    style={{
                                                        color: "white",
                                                    }}>{`userName`}</div>
                                                <DownOutlined
                                                    style={{
                                                        color: "white",
                                                    }}
                                                />
                                            </Space>
                                        </a>
                                    </Dropdown>
                                </div>
                            </Flex>
                        </div>
                    </Header>
                    <Content
                        style={{
                            paddingTop: 20,
                            paddingRight: 25,
                            paddingLeft: 20,
                            marginBottom: 100,
                        }}>
                        {children}
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
}
