"use client";

import React, { useState } from "react";
import type { TableProps } from "antd";
import { Table, Button, Tooltip, Select, Input, Form, Col, DatePicker, Row, Card } from "antd";
import {
  CloseOutlined,
  EditOutlined,
  PlusOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import Link from "next/link";

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
      status: "รอการอนุมัติ",
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

  const defaultColumns: (ColumnTypes[number] & {
    editable?: boolean;
    dataIndex?: string;
  })[] = [
    {
      title: "ประเภทการลา",
      dataIndex: "leaveType",
      width: "20%",
      sorter: (a, b) => a.leaveType.localeCompare(b.leaveType),
      onHeaderCell: () => ({ style: { textAlign: "center" } }),
      onFilter: (value, record) => record.leaveType === value,
    },
    {
      title: "วันที่ยื่นคำร้อง",
      dataIndex: "submittedDate",
      align: "center",
      sorter: (a, b) =>
        new Date(a.submittedDate).getTime() -
        new Date(b.submittedDate).getTime(),
      onHeaderCell: () => ({ style: { textAlign: "center" } }),
    },
    {
      title: "วันที่เริ่มลา",
      dataIndex: "startDate",
      align: "center",
      sorter: (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
      onHeaderCell: () => ({ style: { textAlign: "center" } }),
    },
    {
      title: "วันที่สิ้นสุดการลา",
      dataIndex: "endDate",
      align: "center",
      sorter: (a, b) =>
        new Date(a.endDate).getTime() - new Date(b.endDate).getTime(),
      onHeaderCell: () => ({ style: { textAlign: "center" } }),
    },
    {
      title: "จำนวนวันลา (วัน)",
      dataIndex: "totalDays",
      align: "right",
      sorter: (a, b) => a.totalDays - b.totalDays,
      onHeaderCell: () => ({ style: { textAlign: "center" } }),
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      align: "center",
      sorter: (a, b) => a.status.localeCompare(b.status),
      onHeaderCell: () => ({ style: { textAlign: "center" } }),
      onFilter: (value, record) => record.status === value,
      render: (text: string) => {
        let bg = "#fae9b0ff";
        let color = "#e79702ff";
        if (text === "อนุมัติ") {
          bg = "#e3ffc7ff";
          color = "#389e0d";
        } else if (text === "ไม่อนุมัติ") {
          bg = "#ffcac6ff";
          color = "#cf1322";
        }
        return (
          <span
            style={{
              display: "inline-block",
              padding: "2px 8px",
              fontSize: 12,
              borderRadius: 10,
              backgroundColor: bg,
              color: color,
            }}
          >
            {text}
          </span>
        );
      },
    },
    {
      title: "ผู้อนุมัติลำดับที่ 1",
      dataIndex: "approver1",
      sorter: (a, b) => a.approver1.localeCompare(b.approver1),
      onHeaderCell: () => ({ style: { textAlign: "center" } }),
    },
    {
      title: "ผู้อนุมัติลำดับที่ 2",
      dataIndex: "approver2",
      sorter: (a, b) => a.approver2?.localeCompare(b.approver2 || "-"),
      onHeaderCell: () => ({ style: { textAlign: "center" } }),
    },
    {
      title: "หมายเหตุ",
      dataIndex: "remark",
      align: "center",
      onHeaderCell: () => ({ style: { textAlign: "center" } }),
    },
    {
      title: "จัดการ",
      key: "management",
      align: "center",
      render: () => (
        <div className="flex justify-center gap-2">
          <Tooltip title="แก้ไข">
            <Button shape="circle" style={{ background: "#ffa940", color: "white" }}>
              <EditOutlined />
            </Button>
          </Tooltip>
          <Tooltip title="ยกเลิก">
            <Button shape="circle" style={{ background: "#ff4d4f", color: "white" }}>
              <CloseOutlined />
            </Button>
          </Tooltip>
          <Tooltip title="พิมพ์">
            <Button type="primary" shape="circle" icon={<PrinterOutlined />} />
          </Tooltip>
        </div>
      ),
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
