"use client";

import React, { useEffect, useState } from "react";
import type { TableProps } from "antd";
import {
  Table,
  Button,
  Tooltip,
  Select,
  Input,
  Form,
  Col,
  TableColumnsType,
  Tag,
  Space,
  Row,
  Card,
  Breadcrumb,
  Typography,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import Link from "next/link";
import { XCircle, FileText, SquarePen } from "lucide-react";
import router from "next/router";
import { LeaveHistoryInfo, SearchFactformDto, Status } from "@/types/factForm";
import { cancelLeaveForm, searchLeaveHistory } from "@/services/factFormApi";
import { useUser } from "@/app/contexts/userContext";
import { getAllLeaveByUser } from "@/services/factCreditLeaveApi";
import Swal from "sweetalert2";
import { LeaveType } from "@/types/leaveType";

const { Search } = Input;

type ColumnTypes = Exclude<TableProps<LeaveHistoryInfo>["columns"], undefined>;

const LeaveHistoryPage: React.FC = () => {
  const { user } = useUser();

  const [searchParams, setSearchParams] = useState<SearchFactformDto>(
    {} as SearchFactformDto,
  );
  const [leaveHistory, setLeaveHistory] = useState<LeaveHistoryInfo[]>([]);
  const [leaveType, setLeaveType] = useState<LeaveType[]>([]);

  useEffect(() => {
    if (!user?.nontri_account) return;

    const fetchLeaveHistory = async () => {
      const response = await searchLeaveHistory(
        user.nontri_account,
        searchParams,
      );

      setLeaveHistory(response);
    };
    fetchLeaveHistory();
  }, [user?.nontri_account, searchParams]);

  useEffect(() => {
    if (!user?.nontri_account) return;

    const fetchLeaveHistory = async () => {
      const response = await getAllLeaveByUser(user.nontri_account);

      setLeaveType(response);
    };
    fetchLeaveHistory();
  }, [user?.nontri_account]);

  const handleCancelLeave = async (fact_form_id: number) => {
    Swal.fire({
      title: "ยืนยันการยกเลิกใบลา?  ",
      text: "คุณต้องการยกเลิกใบลานี้ใช่หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "red",
      confirmButtonText: "ใช่, ยกเลิก",
      cancelButtonText: "ไม่, ย้อนกลับ",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await cancelLeaveForm(fact_form_id);
        } catch (error) {
          console.error("ไม่สามารถยกเลิกใบลาได้", error);
        } finally {
          Swal.fire("ยกเลิกใบลาสำเร็จ!");
          if (!user?.nontri_account) return;
          const response = await getAllLeaveByUser(user.nontri_account);
          setLeaveType(response);
        }
      }
    });
  };

  const defaultColumns: TableColumnsType<LeaveHistoryInfo> = [
    {
      title: "ประเภทการลา",
      dataIndex: ["leave_type", "name"],
      render: (_, record) =>
        `${record.leave_type?.name} ${record.leave_aboard === "ต่างประเทศ" ? "(ต่างประเทศ)" : ""}`,
    },
    {
      title: "วันเริ่มลา",
      dataIndex: "start_date",
      align: "center",
      render: (date) => new Date(date).toLocaleDateString("th-TH"),
    },
    {
      title: "วันสิ้นสุดการลา",
      dataIndex: "end_date",
      align: "center",
      render: (date) => new Date(date).toLocaleDateString("th-TH"),
    },
    {
      title: "จำนวนวันลา",
      dataIndex: "total_day",
      align: "center",
    },
    {
      title: <span className="text-dark dark:text-white">สถานะ</span>,
      dataIndex: "status",
      align: "center",
      onFilter: (value, record) => record.status.includes(value as string),
      render: (status) => {
        let label = "";
        let color:
          | "success"
          | "processing"
          | "error"
          | "warning"
          | "orange"
          | "red"
          | "default" = "default";

        switch (status) {
          case Status.Approve:
            label = "อนุมัติ";
            color = "success";
            break;

          case Status.Pending:
            label = "รอดำเนินการ";
            color = "processing";
            break;

          case Status.Reject:
            label = "ไม่อนุมัติ";
            color = "error";
            break;

          case Status.Cancel:
            label = "ยกเลิก";
            color = "red";
            break;

          case Status.Draft:
            label = "ฉบับร่าง";
            color = "warning";
            break;

          default:
            label = status;
            color = "default";
        }

        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: "ผู้อนุมัติลำดับที่ 1",
      dataIndex: "approver1",
      align: "center",
      render: (approver1) =>
        approver1?.[0]?.fullname
          ? `${approver1?.[0]?.other_prefix ?? ""} ${
              approver1?.[0]?.fullname?.split(" ")?.[0] ?? ""
            }`
          : "-",
    },
    {
      title: "ผู้อนุมัติลำดับที่ 2",
      dataIndex: "approver2",
      align: "center",
      render: (approver2) =>
        approver2?.[0]
          ? `${approver2?.[0]?.other_prefix} ${approver2?.[0]?.fullname.split(" ")[0]}`
          : "-",
    },
    {
      title: "ผู้อนุมัติลำดับที่ 3",
      dataIndex: "approver3",
      align: "center",
      render: (approver3) =>
        approver3?.[0]
          ? `${approver3?.[0]?.other_prefix} ${approver3?.[0]?.fullname.split(" ")[0]}`
          : "-",
    },
    {
      title: "ผู้อนุมัติลำดับที่ 4",
      dataIndex: "approver4",
      align: "center",
      render: (approver4) =>
        approver4?.[0]
          ? `${approver4?.[0]?.other_prefix} ${approver4?.[0]?.fullname.split(" ")[0]}`
          : "-",
    },
    {
      title: <span className="text-dark dark: text-white">หมายเหตุ</span>,
      dataIndex: "remark",
      align: "center",
      render: (text) => (
        <span className="text-dark dark:text-white">{text}</span>
      ),
    },
    {
      title: <span className="text-dark dark:text-white">จัดการ</span>,
      key: "actions",
      align: "center",
      render: (_, record) => {
        const { status } = record;
        return (
          <Space>
            {status === Status.Draft && (
              <>
                <Tooltip title="แก้ไข">
                  <Link
                    href={`/private/leave-and-history/history? fact_form_id=${record.fact_form_id}&edit=true`}
                  >
                    <SquarePen
                      style={{ cursor: "pointer", color: "orange" }}
                      size={18}
                    />
                  </Link>
                </Tooltip>
              </>
            )}
            {status !== Status.Draft && (
              <Tooltip title="ดูรายละเอียดลา">
                <Link
                  href={`/private/leave-and-history/history?fact_form_id=${record.fact_form_id}&edit=false`}
                >
                  <FileText
                    style={{ cursor: "pointer", color: "blue" }}
                    size={18}
                  />
                </Link>
              </Tooltip>
            )}
            <Tooltip title="ยกเลิก">
              <XCircle
                style={{ cursor: "pointer", color: "red" }}
                size={18}
                onClick={() => handleCancelLeave(record.fact_form_id)}
              />
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" style={{ width: "100%" }} size={10}>
        <Row>
          <Col span={24}>
            <Typography.Title
              level={4}
              style={{ marginTop: 0, marginBottom: 0, fontSize: 18 }}
            >
              ประวัติการลา
            </Typography.Title>
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            <Breadcrumb
              items={[
                {
                  title: (
                    <a
                      onClick={() => {
                        router.push(`/private/leave-and-history/leave-history`);
                      }}
                    >
                      ประวัติการลา
                    </a>
                  ),
                },
              ]}
            />
          </Col>
        </Row>

        <Card>
          {/* ✅ Filter Row */}
          <Form layout="vertical" style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]} align="bottom">
              <Col xs={24} sm={24} md={5}>
                <Form.Item label="ปีงบประมาณ" style={{ marginBottom: 0 }}>
                  <Select
                    defaultValue=""
                    style={{ width: "100%" }}
                    value={searchParams.fiscal_year}
                    options={[
                      { value: "", label: "ทั้งหมด" },
                      { value: "2569", label: "2569" },
                      { value: "2568", label: "2568" },
                      { value: "2567", label: "2567" },
                    ]}
                    onChange={(value) =>
                      setSearchParams({
                        ...searchParams,
                        fiscal_year: value,
                      })
                    }
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={24} md={5}>
                <Form.Item label="ประเภทการลา" style={{ marginBottom: 0 }}>
                  <Select
                    style={{ width: "100%" }}
                    value={searchParams.leave_type_id || ""}
                    options={[
                      { value: "", label: "ทั้งหมด" },
                      ...leaveType?.map((l) => ({
                        value: l.leave_type_id,
                        label: l.name,
                      })),
                    ]}
                    onChange={(value) =>
                      setSearchParams({
                        ...searchParams,
                        leave_type_id: value,
                      })
                    }
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={24} md={6}>
                <Form.Item label="ค้นหา" style={{ marginBottom: 0 }}>
                  <Search
                    placeholder="ค้นหา"
                    allowClear
                    style={{ width: "100%" }}
                    value={searchParams.search}
                    onChange={(e) =>
                      setSearchParams({
                        ...searchParams,
                        search: e.target.value,
                      })
                    }
                  />
                </Form.Item>
              </Col>

              {/* ✅ Button - ซ่อนบน mobile/tablet, แสดงบน desktop ชิดขวา */}
              <Col xs={0} sm={0} md={8} style={{ textAlign: "right" }}>
                <Link href="/private/leave-application">
                  <Button type="primary" icon={<PlusOutlined />}>
                    เพิ่มใบลา
                  </Button>
                </Link>
              </Col>

              {/* ✅ Button - แสดงเต็มความกว้างบน mobile/tablet */}
              <Col xs={24} sm={24} md={0}>
                <Link
                  href="/private/leave-application"
                  style={{ width: "100%" }}
                >
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    style={{ width: "100%" }}
                  >
                    เพิ่มใบลา
                  </Button>
                </Link>
              </Col>
            </Row>
          </Form>

          {/* ✅ Table with responsive scroll */}
          <div style={{ overflowX: "auto", width: "100%" }}>
            <Table<LeaveHistoryInfo>
              bordered
              dataSource={leaveHistory}
              columns={defaultColumns as ColumnTypes}
              pagination={{ pageSize: 5, responsive: true }}
              rowKey={(record) => record.fact_form_id}
              scroll={{ x: 1200 }}
              size="middle"
            />
          </div>
        </Card>
      </Space>
    </div>
  );
};

export default LeaveHistoryPage;
