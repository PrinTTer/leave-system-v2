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
import { searchLeaveHistory } from "@/services/factFormApi";
import { useUser } from "@/app/contexts/userContext";
import { FactCreditLeaveInfo } from "@/types/factCreditLeave";
import { getAllFactLeaveCreditByUser } from "@/services/factCreditLeaveApi";

const { Search } = Input;

type ColumnTypes = Exclude<TableProps<LeaveHistoryInfo>["columns"], undefined>;

const LeaveHistoryPage: React.FC = () => {
  const { user } = useUser();

  const [searchParams, setSearchParams] = useState<SearchFactformDto>(
    {} as SearchFactformDto
  );
  const [leaveHistory, setLeaveHistory] = useState<LeaveHistoryInfo[]>([]);
  const [leaveType, setLeaveType] = useState<FactCreditLeaveInfo[]>([]);

  useEffect(() => {
    if (!user?.nontri_account) return;

    const fetchLeaveHistory = async () => {
      const response = await searchLeaveHistory(
        user.nontri_account,
        searchParams
      );

      setLeaveHistory(response);
    };
    fetchLeaveHistory();
  }, [user?.nontri_account, searchParams]);

  useEffect(() => {
    if (!user?.nontri_account) return;

    const fetchLeaveHistory = async () => {
      const response = await getAllFactLeaveCreditByUser(user.nontri_account);

      setLeaveType(response);
    };
    fetchLeaveHistory();
  }, [user?.nontri_account]);

  const defaultColumns: TableColumnsType<LeaveHistoryInfo> = [
    {
      title: "ประเภทการลา",
      dataIndex: ["leave_type", "name"],
      render: (name) => name,
    },
    {
      title: "วันที่",
      dataIndex: "start_date",
      align: "center",
      render: (date) => new Date(date).toLocaleDateString("th-TH"),
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
        let color: "success" | "processing" | "error" | "warning" | "default" =
          "default";

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
        approver1?.[0]
          ? `${approver1?.[0]?.other_prefix} ${approver1?.[0]?.fullname.split(" ")[0]}`
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
      title: <span className="text-dark dark:text-white">หมายเหตุ</span>,
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
            {status === Status.Pending && (
              <>
                <Tooltip title="ยกเลิก">
                  <XCircle
                    style={{ cursor: "pointer", color: "red" }}
                    size={18}
                  />
                </Tooltip>
                <Tooltip title="ดูรายละเอียดลา">
                  <FileText
                    style={{ cursor: "pointer", color: "blue" }}
                    size={18}
                  />
                </Tooltip>
              </>
            )}

            {status === Status.Draft && (
              <>
                <Tooltip title="แก้ไข">
                  <SquarePen
                    style={{ cursor: "pointer", color: "yellow" }}
                    size={18}
                  />
                </Tooltip>
                <Tooltip title="ยกเลิก">
                  <XCircle
                    style={{ cursor: "pointer", color: "red" }}
                    size={18}
                  />
                </Tooltip>
                <Tooltip title="ดูรายละเอียดลา">
                  <FileText
                    style={{ cursor: "pointer", color: "blue" }}
                    size={18}
                  />
                </Tooltip>
              </>
            )}
            {(status === Status.Reject ||
              status === Status.Cancel ||
              status === Status.Approve) && (
              <Tooltip title="ดูรายละเอียดลา">
                <FileText
                  style={{ cursor: "pointer", color: "blue" }}
                  size={18}
                />
              </Tooltip>
            )}
          </Space>
        );
      },
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
              ประวัติการลา
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
          <div
            style={{
              padding: "24px 0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div className="flex justify-content-end gap-4">
              <Form
                layout="vertical"
                className="flex gap-4"
                style={{ marginBottom: 10 }}
              >
                <Row
                  align="middle"
                  className="text-sm font-medium"
                  style={{ gap: 10 }}
                >
                  <Col>
                    <Form.Item label="ปีงบประมาณ" style={{ marginBottom: 0 }}>
                      <Select
                        defaultValue=""
                        style={{ width: 120 }}
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

                  <Col>
                    <Form.Item label="ประเภทการลา" style={{ marginBottom: 0 }}>
                      <Select
                        style={{ width: 150 }}
                        value={searchParams.leave_type_id || ""}
                        options={[
                          { value: "", label: "ทั้งหมด" },
                          ...leaveType.map((l) => ({
                            value: l.leave_type.leave_type_id,
                            label: l.leave_type.name,
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

                  <Col>
                    <Form.Item label="ค้นหา" style={{ marginBottom: 0 }}>
                      <Search
                        placeholder="ค้นหา"
                        allowClear
                        style={{ width: 200 }}
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
                </Row>
              </Form>
            </div>

            <div className="flex justify-content-start mt-5">
              <Link href="/private/leave-application">
                <Button type="primary" icon={<PlusOutlined />}>
                  เพิ่มใบลา
                </Button>
              </Link>
            </div>
          </div>

          {/* ตาราง */}
          <Table<LeaveHistoryInfo>
            bordered
            dataSource={leaveHistory}
            columns={defaultColumns as ColumnTypes}
            pagination={{ pageSize: 5 }}
          />
        </Card>
      </Space>
    </div>
  );
};

export default LeaveHistoryPage;
