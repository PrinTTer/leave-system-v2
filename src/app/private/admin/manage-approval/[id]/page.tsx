"use client";
import { useEffect, useState } from "react";
import { Table, Button, Select, Space, Tooltip, Input, Row, Col, Typography, Form } from "antd";
import { useRouter, useParams } from "next/navigation";
import * as Icons from "lucide-react";
const { Title } = Typography;
// สมมติข้อมูลผู้อนุมัติทั้งหมด (mock)
const allApprovers = [
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
];

// mock ข้อมูลผู้ใช้
const mockUserData = {
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

export default function ManageApproverPage() {
    // สมมติเลือก user คนแรก
    const [userData, setUserData] = useState<any>(null);
    const [levels, setLevels] = useState<{ [key: number]: any[] }>({
        1: [],
        2: [],
        3: [],
        4: [],
    });
    const [form] = Form.useForm();
    const router = useRouter();
    const params = useParams();

    useEffect(() => {
        // โหลด user จาก data ตาม id ที่ต้องการ
        const userId = Number(params.id); // <-- เปลี่ยนเป็น id ที่ต้องการ
        const user = mockUserData.data.find((u: any) => u.id === userId);
        if (!user) return;

        setUserData(user);
        form.setFieldsValue({
                fullName: `${user.academicPosition ? user.academicPosition + " " : ""}${user.thaiName}`,
                position: user.position,
                department: user.department,
            });

        // จัดกลุ่มผู้อนุมัติตาม level
        const grouped: { [key: number]: any[] } = { 1: [], 2: [], 3: [], 4: [] };
        user.approver.forEach((a) => {
            a.level.forEach((lv: number) => {
                grouped[lv].push(a);
            });
        });
        setLevels(grouped);
    }, []);

    const handleDelete = (level: number, id: number) => {
        setLevels((prev) => ({
            ...prev,
            [level]: prev[level].filter((item) => item.id !== id),
        }));
    };

    const handleAdd = (level: number, approverId: number) => {
        const approver = allApprovers.find((a) => a.id === approverId);
        if (!approver) return;

        // ตรวจว่ามีอยู่แล้วหรือยัง
        if (levels[level].some((a) => a.id === approver.id)) return;

        setLevels((prev) => ({
            ...prev,
            [level]: [...prev[level], { ...approver, level: [level] }],
        }));
    };

    const columns = (level: number) => [
        {
            title: "ตำแหน่งอนุมัติ",
            dataIndex: "positionApprover",
            key: "positionApprover",
        },
        {
            title: "ชื่อ",
            key: "thaiName",
            render: (_: any, record: any) =>
                `${record.academicPosition ? record.academicPosition + " " : ""}${record.thaiName}`,
        },
        {
            title: "การจัดการ",
            key: "actions",
            align: "center" as const,
            render: (_: any, record: any) => (
                <Tooltip title="ลบ">
                    <Icons.Trash2
                        size={18}
                        style={{ cursor: "pointer", color: "red" }}
                        onClick={() => handleDelete(level, record.id)}
                    />
                </Tooltip>
            ),
        },
    ];

    if (!userData) return <div>Loading...</div>;

    return (
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
                            {"แก้ไขผู้อนุมัติ"}
                        </Title>
                    </Col>
                </Row>
                <div className="chemds-container">
                    <h3>ผู้ขออนุมัติ</h3>
                        <Form form={form} layout="vertical">
                        
                            <Form.Item label="ชื่อ:" name="fullName">
                                <Input disabled />
                            </Form.Item>
                        
                        <Row  gutter={16}>
                            <Col span={12}>
                                <Form.Item label="สังกัด" name="department">
                                    <Input disabled />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="ตำแหน่ง" name="position">
                                    <Input disabled />
                                </Form.Item>
                            </Col>
                        </Row>
                        </Form>
                    

                    {[1, 2, 3, 4].map((level) => (
                        <div key={level} style={{ marginBottom: 32 }}>
                            <Space style={{ marginBottom: 8 }}>
                                <h4>ผู้อนุมัติ {level}</h4>
                                <Select
                                    style={{ width: 250 }}
                                    placeholder="เลือกผู้อนุมัติ"
                                    onSelect={(id) => handleAdd(level, Number(id))}
                                >
                                    {allApprovers.map((a) => (
                                        <Select.Option key={a.id} value={a.id}>
                                            {a.positionApprover} - {a.academicPosition ? a.academicPosition + " " : ""}
                                            {a.thaiName}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Space>

                            <Table
                                columns={columns(level)}
                                dataSource={levels[level]}
                                rowKey="id"
                                pagination={false}
                                size="small"
                                bordered
                            />
                        </div>
                    ))}

                    <Row style={{ justifyContent: "space-between", marginTop: 15 }}>
                        <Col>
                            <Button
                                className="chemds-button"
                                type="default"
                                onClick={() => router.push(`/private/admin/manage-approval`)}
                            >
                                ยกเลิก
                            </Button>
                        </Col>
                        <Col>
                            <Button className="chemds-button" type="primary">
                                บันทึก
                            </Button>
                        </Col>
                    </Row>
                </div>

            </Space>
        </div>
    );
}
