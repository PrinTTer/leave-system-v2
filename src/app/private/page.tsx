"use client";

import React, { useState } from "react";
import type { TableProps } from "antd";
import { Table, Row, Col, Card, Button } from "antd";
import PlusOutlined from "@ant-design/icons/lib/icons/PlusOutlined";
import Link from "next/link";

interface User {
  pronoun: string;
  firstName: string;
  lastName: string;
  position: string;
  department: string;
  dateOfBirth: string;
  employmentDate: string; // วันที่บรรจุ
  level: string; // ระดับ
}

interface LeaveStatistics {
  key: React.Key;
  type: string;
  totalLeave: number;
  usedLeave: number;
  leftLeave?: number;
}

type ColumnTypes = Exclude<TableProps<LeaveStatistics>["columns"], undefined>;

const HomePage: React.FC = () => {
  // ✅ mock data ข้อมูลส่วนบุคคล
  const user: User = {
    pronoun: "นางสาว",
    firstName: "วรัญญา",
    lastName: "ประวันโน",
    position: "เจ้าหน้าที่ธุรการ",
    department: "ฝ่ายบุคคล",
    dateOfBirth: "2003-03-15",
    employmentDate: "2024-01-01",
    level: "",
  };

  const [dataSource] = useState<LeaveStatistics[]>([
    { key: "0", type: "ลาป่วย", totalLeave: 90, usedLeave: 0, leftLeave: 90 },
    { key: "1", type: "ลากิจส่วนตัว", totalLeave: 45, usedLeave: 0, leftLeave: 45 },
    { key: "2", type: "ลาไปช่วยเหลือภริยาที่คลอดบุตร", totalLeave: 15, usedLeave: 0, leftLeave: 15 },
    { key: "3", type: "ลาพักผ่อนประจำปี", totalLeave: 10, usedLeave: 0, leftLeave: 10 },
    { key: "4", type: "ลาอุปสมบท", totalLeave: 120, usedLeave: 0, leftLeave: 120 },
    { key: "5", type: "ลาไปพิธีฮัจย์", totalLeave: 120, usedLeave: 0, leftLeave: 120 },
    { key: "6", type: "ลาเข้ารับการเตรียมพล", totalLeave: 0, usedLeave: 0, leftLeave: 0 },
    { key: "7", type: "รวมทั้งหมด", totalLeave: 400, usedLeave: 0, leftLeave: 400 },
  ]);

  // ✅ columns ของตารางลา
  const defaultColumns: (ColumnTypes[number] & { editable?: boolean; dataIndex: string })[] = [
    { title: "ประเภทการลา", dataIndex: "type", width: "30%" },
    { title: "สิทธิ์ทั้งหมด (วัน)", dataIndex: "totalLeave", sorter: (a, b) => a.totalLeave - b.totalLeave },
    { title: "ใช้ไปแล้ว (วัน)", dataIndex: "usedLeave", sorter: (a, b) => a.usedLeave - b.usedLeave },
    { title: "คงเหลือ (วัน)", dataIndex: "leftLeave", sorter: (a, b) => (a.leftLeave ?? 0) - (b.leftLeave ?? 0) },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* ✅ ส่วนข้อมูลผู้ใช้ */}
      <Card title="ข้อมูลส่วนบุคคล" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col span={8}><b>คำนำหน้า:</b> {user.pronoun}</Col>
          <Col span={8}><b>ชื่อ:</b> {user.firstName}</Col>
          <Col span={8}><b>นามสกุล:</b> {user.lastName}</Col>

          <Col span={8}><b>ตำแหน่ง:</b> {user.position}</Col>
          <Col span={8}><b>หน่วยงาน:</b> {user.department}</Col>
          <Col span={8}><b>วันเกิด:</b> {user.dateOfBirth}</Col>

          <Col span={8}><b>วันที่บรรจุ:</b> {user.employmentDate}</Col>
          <Col span={8}><b>ระดับ:</b> {user.level}</Col>
        </Row>
      </Card>

      <Card
        title="สถิติการลา"
        extra={
          <Link href="/private/leave-application">
            <Button type="primary" icon={<PlusOutlined />}>
              เพิ่มใบลา
            </Button>
          </Link>
        }
        variant="outlined"
      >
        <Table<LeaveStatistics>
          bordered
          dataSource={dataSource}
          columns={defaultColumns as ColumnTypes}
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default HomePage;
