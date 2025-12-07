"use client";

import React, { useEffect, useState } from "react";
import { Breadcrumb, Card, Col, Row, Select, Space, Typography } from "antd";
import GeneralLeaveForm from "./general-application/general/page";
import FormalApplicationForm from "./formal-application/general/page";
import InternationalLeaveForm from "./general-application/international/page";
import InternationalFormalLeaveForm from "./formal-application/international/page";
import { formatThaiDate } from "@/app/utils";
import router from "next/router";
import { User } from "@/types/user";
const users = {
  nontri_account: "fengptu",
  other_prefix: "ผศ.ดร.",
  prefix: "นางสาว",
  fullname: "วรัญญา อรรถเสนา",
  gender: "female",
  position: "",
  faculty: "วิศวกรรมศาสตร์",
  department: "วิศวกรรมคอมพิวเตอร์",
  employment_start_date: "2025-11-09",
};

const LeaveSelectionPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>("1");
  const [user, setUser] = useState<User>({} as User);

  useEffect(() => {
    const [firstName, lastName] = users.fullname.split(" ");

    setUser({
      ...users,
      firstName,
      lastName,
    });
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" style={{ width: "100%" }} size={10}>
        <Row>
          <Col span={12}>
            <Typography.Title
              level={4}
              style={{ marginTop: 0, marginBottom: 0, fontSize: 18 }}
            >
              เลือกประเภทการลา
            </Typography.Title>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Breadcrumb
              items={[
                {
                  title: (
                    <a
                      onClick={() => {
                        router.push(`/private`);
                      }}
                    >
                      ข้อมูลการลา
                    </a>
                  ),
                },
                { title: "เพิ่มการลา" },
              ]}
            />
          </Col>
        </Row>
        {/* Dropdown เลือกประเภทการลา */}
        <Select
          style={{ width: 300, marginBottom: 24 }}
          placeholder="-- กรุณาเลือกประเภทการลา --"
          value={selectedType}
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
                  <b>คำนำหน้า:</b> {user.prefix}
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
                  <b>วันที่บรรจุ:</b>{" "}
                  {formatThaiDate(user.employment_start_date)}(1 ปี)
                </Col>
                <Col span={8}>
                  <b>ระดับ:</b> {user.other_prefix}
                </Col>
              </Row>
            </Card>

            {selectedType === "3" ? (
              <FormalApplicationForm />
            ) : selectedType == "1" ? (
              <GeneralLeaveForm user={user} />
            ) : selectedType == "2" ? (
              <InternationalLeaveForm user={user} />
            ) : selectedType == "4" ? (
              <InternationalFormalLeaveForm />
            ) : null}
          </>
        ) : null}
      </Space>
    </div>
  );
};

export default LeaveSelectionPage;
