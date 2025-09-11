"use client";

import React, { useState } from "react";
import { Button, Card, Col, Row, Select } from "antd";
import GeneralLeaveForm from "./general-application/page";
import FormalApplicationForm from "./formal-application/page";
import Link from "next/link";

interface User {
  pronoun: string;        // คำนำหน้า เช่น Mr./Ms.
  firstName: string;      // ชื่อ
  lastName: string;       // นามสกุล
  position: string;       // ตำแหน่งงาน
  department: string;     // แผนก/ฝ่าย
  dateOfBirth: string;    
  employmentDate: string; 
  level: string;          
}

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

const LeaveSelectionPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>("");

  return (
    <div style={{ padding: 24 }}>
      <h2 className="text-xl font-bold mb-4">เลือกประเภทการลา</h2>
      {/* Dropdown เลือกประเภทการลา */}
      <Select
        style={{ width: 300, marginBottom: 24 }}
        placeholder="-- กรุณาเลือกประเภทการลา --"
        onChange={(value) => setSelectedType(value)}
        options={[
          { value: "ลากิจ", label: "ลากิจ" },
          { value: "ลาป่วย", label: "ลาป่วย" },
          { value: "ลาไปราชการ", label: "ลาไปราชการ" },
        ]}
      />

      {selectedType !== "" ? (
        <>
        <p className="text-xl font-bold text-black mb-4">
            ใบ{selectedType}
        </p>
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

            {selectedType === "ลาไปราชการ" ? (
                <FormalApplicationForm />
            ) : (
                <GeneralLeaveForm/>
            )}

            <Link href="/private" className="flex justify-end">
              <Button type="primary">
                ส่งใบลา
              </Button>
            </Link>
        </>
      ) : null}

         

    </div>
  );
};

export default LeaveSelectionPage;
