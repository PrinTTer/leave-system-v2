"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  Breadcrumb,
  Button,
  Col,
  Form,
  Input,
  Row,
  Space,
  Table,
  TableColumnsType,
  Tooltip,
  Typography,
} from "antd";
import { Tag } from "antd";
import * as Icons from "lucide-react";
import router from "next/router";

type ApproveReq = {
  reqId: number;
  user: {
    fName: string;
    lName: string;
  };
  leaveType: string;
  totalDate: number;
  startDate: string;
  endDate: string;
  status: string;
  country?: string | null;
  additionLeave?: {
    leaveType: string;
    startDate: string;
    endDate: string;
    totalDate: number;
    reason: string;
  }[];
};

interface DataType {
  key: string;
  name: string;
  leaveType: string;
  totalDate: number;
  startDate: string;
  endDate: string;
  status: string;
  isAbroad: boolean;
  country?: string | null;
  additionLeave?: ApproveReq["additionLeave"];
  raw: ApproveReq;
}

function getUniqueFilters(data: DataType[], key: keyof DataType) {
  const set = new Set<string>();
  data.forEach((item) => set.add(item[key] as string));
  return Array.from(set).map((v) => ({ text: v, value: v }));
}

const ApproveHistoryTable: React.FC<{ data: ApproveReq[] }> = ({ data }) => {
  const [currentSearch, setCurrentSearch] = useState({ name: "", leaveType: "" });
  const [currentPage, setCurrentPage] = useState(1);


  const transformedData = useMemo(() => {
    return data.flatMap((item) => {
      const baseItem = {
        key: String(item.reqId),
        name: `${item.user.fName} ${item.user.lName}`,
        leaveType: item.leaveType,
        totalDate: item.totalDate,
        startDate: item.startDate,
        endDate: item.endDate,
        status: item.status,
        isAbroad: item.leaveType.includes("ต่างประเทศ"),
        country: item.country,
        additionLeave: item.additionLeave,
        raw: item,
      };

      if (item.leaveType.includes("ต่างประเทศ") && item.additionLeave?.length) {
        const additionalRows = item.additionLeave.map((leave, index) => ({
          key: `${item.reqId}-${index + 1}`,
          name: `${item.user.fName} ${item.user.lName}`,
          leaveType: `${leave.leaveType}(ต่อลาราชการต่างประเทศ)`,
          totalDate: leave.totalDate,
          startDate: leave.startDate,
          endDate: leave.endDate,
          status: item.status,
          isAbroad: false,
          country: null,
          additionLeave: [],
          raw: item,
        }));
        return [baseItem, ...additionalRows];
      }

      return [baseItem];
    }).filter((item) =>
      item.name.toLowerCase().includes(currentSearch.name.toLowerCase()) &&
      item.leaveType.toLowerCase().includes(currentSearch.leaveType.toLowerCase())
    );
  }, [data, currentSearch]);

  const nameFilters = getUniqueFilters(transformedData, "name");
  const leaveTypeFilters = getUniqueFilters(transformedData, "leaveType");
  const statusFilters = getUniqueFilters(transformedData, "status");

  const columns: TableColumnsType<DataType> = [
    {
      title: <span className="text-dark dark:text-white">ชื่อ</span>,
      dataIndex: "name",
      filterSearch: true,
      filters: nameFilters,
      onFilter: (value, record) => record.name.includes(value as string),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: <span className="text-dark dark:text-white">ประเภทลา</span>,
      dataIndex: "leaveType",
      filterSearch: true,
      filters: leaveTypeFilters,
      onFilter: (value, record) => record.leaveType.includes(value as string),
      sorter: (a, b) => a.leaveType.localeCompare(b.leaveType),
      render: (text) => <span className="text-dark dark:text-white">{text}</span>,
    },
    {
      title: <span className="text-dark dark:text-white">จำนวนวันลา</span>,
      dataIndex: "totalDate",
      align: "center",
      sorter: (a, b) => a.totalDate - b.totalDate,
      render: (text) => <span className="text-dark dark:text-white">{text}</span>,
    },
    {
      title: <span className="text-dark dark:text-white">วันเริ่มการลา</span>,
      dataIndex: "startDate",
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
      sorter: (a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime(),
      render: (date) => (
        <span className="text-dark dark:text-white">
          {new Date(date).toLocaleDateString("th-TH")}
        </span>
      ),
    },
    {
      title: <span className="text-dark dark:text-white">สถานะ</span>,
      dataIndex: "status",
      align: "center",
      filters: statusFilters,
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
      title: <span className="text-dark dark:text-white">การจัดการ</span>,
      key: "actions",
      align: "center",
      render: (_, record) => {
        const { status } = record;
        return (
          <Space>
            {status === "รอดำเนินการ" && (
              <>
                <Tooltip title="อนุมัติ">
                  <Icons.CheckCircle
                    onClick={() => console.log("อนุมัติ", record.key)}
                    style={{ cursor: "pointer", color: "green" }}
                  />
                </Tooltip>
                <Tooltip title="ไม่อนุมัติ">
                  <Icons.XCircle
                    onClick={() => console.log("ไม่อนุมัติ", record.key)}
                    style={{ cursor: "pointer", color: "red" }}
                  />
                </Tooltip>
                <Tooltip title="ดูรายละเอียดลา">
                  <Icons.FileText
                    onClick={() => console.log("ดูรายละเอียดลา", record.key)}
                    style={{ cursor: "pointer", color: "blue" }}
                  />
                </Tooltip>
              </>
            )}
            {status === "อนุมัติ" && (
              <>
                <Tooltip title="ยกเลิกอนุมัติ">
                  <Icons.XCircle
                    onClick={() => console.log("ยกเลิกอนุมัติ", record.key)}
                    style={{ cursor: "pointer", color: "orange" }}
                  />
                </Tooltip>
                <Tooltip title="ดูรายละเอียดลา">
                  <Icons.FileText
                    onClick={() => console.log("ดูรายละเอียดลา", record.key)}
                    style={{ cursor: "pointer", color: "blue" }}
                  />
                </Tooltip>
              </>
            )}
            {(status === "ไม่อนุมัติ" || status === "ยกเลิกอนุมัติ") && (
              <Tooltip title="ดูรายละเอียดลา">
                <Icons.FileText
                  onClick={() => console.log("ดูรายละเอียดลา", record.key)}
                  style={{ cursor: "pointer", color: "blue" }}
                />
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  const [form] = Form.useForm();

  const onSearch = () => {
    const values = form.getFieldsValue();
    setCurrentSearch({
      name: values.name || "",
      leaveType: values.leaveType || "",
    });
    setCurrentPage(1);
  };

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" style={{ width: "100%" }} size={10}>
        <Row>
          <Col span={12}>
            <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 0, fontSize: 18 }}>
              การลาของผู้ใต้บังคับบัญชา
            </Typography.Title>
          </Col>
        </Row>
        <Breadcrumb
          items={[
            {
              title: (
                <a
                  onClick={() => {
                    router.push(`/private/approver/approve-history`);
                  }}>
                  คำขออนุมัติลา
                </a>
              ),
            },
          ]}
        />
        <div className="chemds-container">
          <Row style={{ marginBottom: "1%" }}>
            <Col span={16}>
              <Form form={form} layout="inline">
                <Col>
                  <Form.Item name="name">
                    <Input placeholder="ชื่อ" allowClear />
                  </Form.Item>
                </Col>
                <Col>
                  <Form.Item name="leaveType">
                    <Input placeholder="ประเภทลา" allowClear />
                  </Form.Item>
                </Col>
                <Col>
                  <Button className="chemds-button" type="primary" onClick={onSearch}>
                    ค้นหา
                  </Button>
                </Col>
              </Form>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Table<DataType>
                columns={columns}
                dataSource={transformedData}
                locale={{ emptyText: "ไม่มีรายการอนุมัติ" }}
                pagination={{
                  pageSize: 10,
                  current: currentPage,
                  onChange: (page) => setCurrentPage(page),
                }}
                bordered
                rowKey="key"
              />
            </Col>
          </Row>
        </div>
      </Space>
    </div>
  );
};

const ApproveHistoryPage = () => {
  const [data, setData] = useState<ApproveReq[]>([]);
  useEffect(() => {
    const mockData: ApproveReq[] = [
      {
        reqId: 1,
        user: { fName: "วรัญญา", lName: "ศรีสุข" },
        leaveType: "ลาคลอดบุตร",
        totalDate: 183,
        startDate: "2025-09-29",
        endDate: "2026-03-30",
        status: "อนุมัติ",
        country: null,
        additionLeave: [],
      },
      {
        reqId: 2,
        user: { fName: "กันตพงษ์", lName: "กลางเมือง" },
        leaveType: "ลาราชการ",
        totalDate: 3,
        startDate: "2025-10-03",
        endDate: "2025-10-05",
        status: "ไม่อนุมัติ",
        country: null,
        additionLeave: [],
      },
      {
        reqId: 3,
        user: { fName: "กนกพร", lName: "ปราบนที" },
        leaveType: "ลาราชการต่างประเทศ",
        totalDate: 3,
        startDate: "2025-10-20",
        endDate: "2025-10-22",
        status: "ยกเลิกอนุมัติ",
        country: "France",
        additionLeave: [
          {
            leaveType: "ลากิจส่วนตัว",
            startDate: "2025-10-23",
            endDate: "2025-10-24",
            totalDate: 2,
            reason: "xxxx",
          },
          {
            leaveType: "ลาพักผ่อน",
            startDate: "2025-10-25",
            endDate: "2025-10-26",
            totalDate: 2,
            reason: "xxxx",
          },
        ],
      },
      {
        reqId: 4,
        user: { fName: "สุภาวดี", lName: "ใจดี" },
        leaveType: "ลาพักผ่อน",
        totalDate: 5,
        startDate: "2025-11-01",
        endDate: "2025-11-05",
        status: "รอดำเนินการ",
        country: null,
        additionLeave: [],
      },
    ];
    setData(mockData);
  }, []);
  return <ApproveHistoryTable data={data} />;
};

export default ApproveHistoryPage;
