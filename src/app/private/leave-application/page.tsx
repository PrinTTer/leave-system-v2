"use client";

import React, { useState } from "react";
import { Card, Col, Row, Select } from "antd";
import GeneralLeaveForm from "./general-application/general/page";
import FormalApplicationForm from "./formal-application/general/page";
import InternationalLeaveForm from "./general-application/international/page";
import InternationalFormalLeaveForm from "./formal-application/international/page";
// import Link from "next/link";

interface User {
  pronoun: string; // คำนำหน้า เช่น Mr./Ms.
  firstName: string; // ชื่อ
  lastName: string; // นามสกุล
  position: string; // ตำแหน่งงาน
  department: string; // แผนก/ฝ่าย
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
          { value: "1", label: "ลาทั่วไป" },
          { value: "2", label: "ลาไปต่างประเทศ" },
          { value: "3", label: "ขออนุมัติเดินทางไปราชการ (ในประเทศ)" },
          { value: "4", label: "ขออนุมัติเดินทางไปราชการ (ต่างประเทศ)" },
        ]}
      />

      {selectedType !== "" ? (
        <>
          <Card title="ข้อมูลส่วนบุคคล" style={{ marginBottom: 24 }}>
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <b>คำนำหน้า:</b> {user.pronoun}
              </Col>
              <Col span={8}>
                <b>ชื่อ:</b> {user.firstName}
              </Col>
              <Col span={8}>
                <b>นามสกุล:</b> {user.lastName}
              </Col>

              <Col span={8}>
                <b>ตำแหน่ง:</b> {user.position}
              </Col>
              <Col span={8}>
                <b>หน่วยงาน:</b> {user.department}
              </Col>
              <Col span={8}>
                <b>วันเกิด:</b> {user.dateOfBirth}
              </Col>

              <Col span={8}>
                <b>วันที่บรรจุ:</b> {user.employmentDate}
              </Col>
              <Col span={8}>
                <b>ระดับ:</b> {user.level}
              </Col>
            </Row>
          </Card>

          {selectedType === "3" ? (
            <FormalApplicationForm />
          ) : selectedType == "1" ? (
            <GeneralLeaveForm />
          ) : selectedType == "2" ? (
            <InternationalLeaveForm />
          ) : selectedType == "4" ? (
            <InternationalFormalLeaveForm />
          ) : null}
        </>
      ) : null}
    </div>
  );
};

export default LeaveSelectionPage;
