"use client";

import React from "react";
import { Row, Col, Card, Space, Spin } from "antd";
import { useUser } from "@/app/contexts/userContext";
import { formatThaiDate } from "@/app/utils";
import { calculateServiceYear } from "@/app/utils/calculate";

const UserCard: React.FC = () => {
  const { user } = useUser();

  if (!user) return;
  <div style={{ textAlign: "center", padding: 16 }}>
    <Spin />
  </div>;

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" style={{ width: "100%" }} size={10}>
        <Card title="ข้อมูลส่วนบุคคล" style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <b>คำนำหน้า:</b> {user.prefix}
            </Col>
            <Col span={8}>
              <b>ชื่อ:</b> {user.thai_name}
            </Col>
            <Col span={8}>
              <b>นามสกุล:</b> {user.thai_surname}
            </Col>

            <Col span={8}>
              <b>ตำแหน่ง:</b> {user.position}
            </Col>
            <Col span={8}>
              <b>หน่วยงาน:</b> {user.department}
            </Col>
            <Col span={8}>
              <b>วันที่บรรจุ:</b> {formatThaiDate(user.employment_start_date)} (
              {calculateServiceYear(user.employment_start_date)} ปี)
            </Col>
            <Col span={8}>
              <b>ระดับ:</b> {user.other_prefix}
            </Col>
          </Row>
        </Card>
      </Space>
    </div>
  );
};

export default UserCard;
