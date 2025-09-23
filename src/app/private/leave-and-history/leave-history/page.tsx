"use client";

import React, { useState } from "react";
import type { TableProps } from "antd";
import { Table, Button, Tooltip, Select, Input, Form, Col,TableColumnsType, Tag, Space, Row, Card } from "antd";
import {
  PlusOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { CheckCircle, XCircle, FileText, Printer } from "lucide-react";

interface LeaveHistory {
  key: React.Key;
  submittedDate: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: string;
  approver1: string;
  approver2?: string;
  remark?: string;
}

const { Search } = Input;

type ColumnTypes = Exclude<TableProps<LeaveHistory>["columns"], undefined>;

const LeaveHistoryPage: React.FC = () => {
  const [dataSource] = useState<LeaveHistory[]>([
    {
      key: "0",
      leaveType: "ลาป่วย",
      submittedDate: "2023-10-01",
      startDate: "2023-10-05",
      endDate: "2023-10-07",
      totalDays: 3,
      status: "รอดำเนินการ",
      approver1: "ผศ.ดร. วรัญญา",
      approver2: "ผศ.ดร. วรัญญา",
      remark: "-",
    },
    {
      key: "1",
      leaveType: "ลากิจ",
      submittedDate: "2024-02-15",
      startDate: "2024-02-20",
      endDate: "2024-02-21",
      totalDays: 2,
      status: "อนุมัติ",
      approver1: "ผศ.ดร. วรัญญา",
      approver2: "-",
      remark: "-",
    },
  ]);

  const [filters, setFilters] = useState({
    year: "",
    leaveType: "",
    search: "",
  });

  // กรองข้อมูลตามปี, ประเภทการลา, และค้นหา
  const filteredData = dataSource.filter((item) => {
    const matchYear =
      !filters.year ||
      new Date(item.submittedDate).getFullYear().toString() === filters.year;
    const matchLeaveType =
      !filters.leaveType || item.leaveType === filters.leaveType;
    const matchSearch =
      !filters.search ||
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(filters.search.toLowerCase())
      );

    return matchYear && matchLeaveType && matchSearch;
  });



const defaultColumns: TableColumnsType<LeaveHistory> = [
  {
    title: <span className="text-dark dark:text-white">ประเภทการลา</span>,
    dataIndex: "leaveType",
    filterSearch: true,
    sorter: (a, b) => a.leaveType.localeCompare(b.leaveType),
    render: (text) => <span className="text-dark dark:text-white">{text}</span>,
  },
  {
    title: <span className="text-dark dark:text-white">วันที่ยื่นคำร้อง</span>,
    dataIndex: "submittedDate",
    align: "center",
    sorter: (a, b) =>
      new Date(a.submittedDate).getTime() - new Date(b.submittedDate).getTime(),
    render: (date) => (
      <span className="text-dark dark:text-white">
        {new Date(date).toLocaleDateString("th-TH")}
      </span>
    ),
  },
  {
    title: <span className="text-dark dark:text-white">วันเริ่มลา</span>,
    dataIndex: "startDate",
    align: "center",
    sorter: (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    render: (date) => (
      <span className="text-dark dark:text-white">
        {new Date(date).toLocaleDateString("th-TH")}
      </span>
    ),
  },
  {
    title: <span className="text-dark dark:text-white">วันสิ้นสุดการลา</span>,
    dataIndex: "endDate",
    align: "center",
    sorter: (a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime(),
    render: (date) => (
      <span className="text-dark dark:text-white">
        {new Date(date).toLocaleDateString("th-TH")}
      </span>
    ),
  },
  {
    title: <span className="text-dark dark:text-white">จำนวนวันลา (วัน)</span>,
    dataIndex: "totalDays",
    align: "center",
    sorter: (a, b) => a.totalDays - b.totalDays,
    render: (text) => <span className="text-dark dark:text-white">{text}</span>,
  },
  {
    title: <span className="text-dark dark:text-white">สถานะ</span>,
    dataIndex: "status",
    align: "center",
    // filters: statusFilters, // กำหนด filter ของ status
    onFilter: (value, record) => record.status.includes(value as string),
    render: (status) => {
      let color: "success" | "processing" | "error" | "warning" | "default" = "default";
      switch (status) {
        case "อนุมัติ":
          color = "success";
          break;
        case "ไม่อนุมัติ":
          color = "error";
          break;
        case "ยกเลิกอนุมัติ":
          color = "warning";
          break;
        case "รอดำเนินการ":
          color = "processing";
          break;
        default:
          color = "default";
      }
      return <Tag color={color}>{status}</Tag>;
    },
  },
  {
    title: <span className="text-dark dark:text-white">ผู้อนุมัติลำดับที่ 1</span>,
    dataIndex: "approver1",
    align: "center",
    sorter: (a, b) => a.approver1.localeCompare(b.approver1),
    render: (text) => <span className="text-dark dark:text-white">{text}</span>,
  },
  {
    title: <span className="text-dark dark:text-white">ผู้อนุมัติลำดับที่ 2</span>,
    dataIndex: "approver2",
    align: "center",
    sorter: (a, b) => a.approver2?.localeCompare(b.approver2 || "-") || 0,
    render: (text) => <span className="text-dark dark:text-white">{text || "-"}</span>,
  },
  {
    title: <span className="text-dark dark:text-white">หมายเหตุ</span>,
    dataIndex: "remark",
    align: "center",
    render: (text) => <span className="text-dark dark:text-white">{text}</span>,
  },
  {
    title: <span className="text-dark dark:text-white">จัดการ</span>,
    key: "actions",
    align: "center",
    render: (_, record) => {
      const { status } = record;
      return (
        <Space>
          {status === "รอดำเนินการ" && (
            <>
              <Tooltip title="อนุมัติ">
                <CheckCircle
                  onClick={() => console.log("อนุมัติ", record.key)}
                  style={{ cursor: "pointer", color: "green" }}
                  size={18}
                />
              </Tooltip>
              <Tooltip title="ไม่อนุมัติ">
                <XCircle
                  onClick={() => console.log("ไม่อนุมัติ", record.key)}
                  style={{ cursor: "pointer", color: "red" }}
                  size={18}
                />
              </Tooltip>
              <Tooltip title="ดูรายละเอียดลา">
                <FileText
                  onClick={() => console.log("ดูรายละเอียดลา", record.key)}
                  style={{ cursor: "pointer", color: "blue" }}
                  size={18}
                />
              </Tooltip>
            </>
          )}
          {status === "อนุมัติ" && (
            <>
              <Tooltip title="ยกเลิกอนุมัติ">
                <XCircle
                  onClick={() => console.log("ยกเลิกอนุมัติ", record.key)}
                  style={{ cursor: "pointer", color: "orange" }}
                  size={18}
                />
              </Tooltip>
              <Tooltip title="ดูรายละเอียดลา">
                <FileText
                  onClick={() => console.log("ดูรายละเอียดลา", record.key)}
                  style={{ cursor: "pointer", color: "blue" }}
                  size={18}
                />
              </Tooltip>
              <Tooltip title="พิมพ์ใบลา">
                <Printer
                  onClick={() => console.log("พิมพ์ใบลา", record.key)}
                  style={{ cursor: "pointer", color: "blue" }}
                  size={18}
                />
              </Tooltip>
            </>
          )}
          {(status === "ไม่อนุมัติ" || status === "ยกเลิกอนุมัติ") && (
            <Tooltip title="ดูรายละเอียดลา">
              <FileText
                onClick={() => console.log("ดูรายละเอียดลา", record.key)}
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
    <div>
      <h2 className="text-xl font-bold mb-4">ประวัติการลา</h2>

      <Card>
        <div style={{ padding: "24px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="flex justify-content-end gap-4">
          <Form layout="vertical" className="flex gap-4" style={{ marginBottom: 10 }}>
            <Row align="middle" className="text-sm font-medium" style={{ gap: 10 }}>
              <Col>
                <Form.Item label="ปีงบประมาณ" style={{ marginBottom: 0 }}>
                <Select
                  defaultValue=""
                  style={{ width: 120 }}
                  options={[
                    { value: '', label: 'ทั้งหมด' },
                    { value: '2569', label: '2569' },
                    { value: '2568', label: '2568' },
                    { value: '2567', label: '2567' },
                  ]}
                />
              </Form.Item>
              </Col>

              <Col>
                <Form.Item label="ประเภทการลา" style={{ marginBottom: 0 }}>
                <Select
                  defaultValue=""
                  style={{ width: 150 }}
                  options={[
                    { value: '', label: 'ทั้งหมด' },
                    { value: 'ลาป่วย', label: 'ลาป่วย' },
                    { value: 'ลากิจ', label: 'ลากิจ' },
                  ]}
                />
              </Form.Item>
              </Col>

              <Col>
                  <Form.Item label="ค้นหา" style={{ marginBottom: 0 }}>
                    <Search placeholder="ค้นหา" allowClear style={{ width: 200 }} />
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
      <Table<LeaveHistory>
        bordered
        dataSource={filteredData}
        columns={defaultColumns as ColumnTypes}
        pagination={{ pageSize: 5 }}
      />
      </Card>
    </div>
  );
};

export default LeaveHistoryPage;
