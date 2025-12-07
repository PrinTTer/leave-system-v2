"use client";

import React, { useEffect, useState } from "react";
import type { TableProps } from "antd";
import {
  Table,
  Row,
  Col,
  Card,
  Button,
  Breadcrumb,
  Typography,
  Space,
} from "antd";
import PlusOutlined from "@ant-design/icons/lib/icons/PlusOutlined";
import Link from "next/link";
import { formatThaiDate } from "../utils/utils";
import router from "next/router";
import { User } from "@/types/user";
import { calculateServiceYear } from "../utils/calculate";
import { FactCreditLeaveInfo } from "@/types/factCreditLeave";
import { getAllFactLeaveCreditByUser } from "@/services/factCreditLeaveApi";

type ColumnTypes = Exclude<
  TableProps<FactCreditLeaveInfo>["columns"],
  undefined
>;

const users: User = {
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

const HomePage: React.FC = () => {
  const [user, setUser] = useState<User>({} as User);
  const [factCreditLeave, setFactCreditLeave] = useState<FactCreditLeaveInfo[]>(
    []
  );

  useEffect(() => {
    const [firstName, lastName] = users.fullname.split(" ");

    setUser({
      ...users,
      firstName,
      lastName,
    });
  }, []);

  useEffect(() => {
    if (!user.nontri_account) return;

    const fetchFactCreditLeave = async () => {
      const data = await getAllFactLeaveCreditByUser(user.nontri_account);
      setFactCreditLeave(data);
    };
    fetchFactCreditLeave();
  }, [user.nontri_account]);

  console.log(factCreditLeave);

  const defaultColumns: (ColumnTypes[number] & {
    editable?: boolean;
    dataIndex: string;
  })[] = [
    {
      title: "ประเภทการลา",
      dataIndex: "name",
      width: "30%",
      render: (_, record) => record.leave_type?.name || "",
    },
    {
      title: "สิทธิ์ทั้งหมด  (วัน)",
      dataIndex: "max_leave",
      render: (_, record) => record.leave_type?.max_leave ?? 0,
      sorter: (a, b) =>
        (a.leave_type?.max_leave ?? 0) - (b.leave_type?.max_leave ?? 0),
    },

    {
      title: "ใช้ไปแล้ว (วัน)",
      dataIndex: "used_leave",
      sorter: (a, b) => a.used_leave - b.used_leave,
    },
    {
      title: "คงเหลือ (วัน)",
      dataIndex: "left_leave",
      sorter: (a, b) => (a.left_leave ?? 0) - (b.left_leave ?? 0),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" style={{ width: "100%" }} size={10}>
        <Row>
          <Col span={12}>
            <Typography.Title
              level={4}
              style={{ marginTop: 0, marginBottom: 0, fontSize: 18 }}
            >
              ข้อมูลการลา
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
              ]}
            />
          </Col>
        </Row>
        {/* ✅ ส่วนข้อมูลผู้ใช้ */}
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
              <b>วันที่บรรจุ:</b> {formatThaiDate(user.employment_start_date)} (
              {calculateServiceYear(user.employment_start_date)}
              ปี)
            </Col>
            <Col span={8}>
              <b>ระดับ:</b> {user.other_prefix}
            </Col>
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
          <Table<FactCreditLeaveInfo>
            bordered
            dataSource={factCreditLeave}
            columns={defaultColumns as ColumnTypes}
            pagination={false}
            rowKey="leave_type_id"
          />
        </Card>
      </Space>
    </div>
  );
};

export default HomePage;
