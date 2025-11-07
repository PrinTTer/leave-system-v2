"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
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
  Tag,
  Breadcrumb,
} from "antd";
import * as Icons from "lucide-react";
import router from "next/router";

type AdditionLeave = {
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDate: number;
  reason: string;
};

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
  country: string;
  additionLeave?: AdditionLeave[];
  followers?: { fName: string; lName: string }[];
};

interface DataType {
  key: string;
  name: string;
  mainLeave: number;
  vacationLeave: number;
  personalLeave: number;
  totalLeave: number;
  followers: number;
  status: string;
  raw: ApproveReq;
}

const ApproveHistoryTable: React.FC<{ data: ApproveReq[] }> = ({ data }) => {
  const [form] = Form.useForm();
  const [currentSearch, setCurrentSearch] = useState({ name: "" });

  const transformedData = useMemo(() => {
    return data
      .map((item) => {
        const vacation = item.additionLeave?.find((l) => l.leaveType === "ลาพักผ่อน");
        const personal = item.additionLeave?.find((l) => l.leaveType === "ลากิจส่วนตัว");

        return {
          key: String(item.reqId),
          name: `${item.user.fName} ${item.user.lName}`,
          mainLeave: item.totalDate,
          vacationLeave: vacation?.totalDate || 0,
          personalLeave: personal?.totalDate || 0,
          totalLeave:
            item.totalDate + (vacation?.totalDate || 0) + (personal?.totalDate || 0),
          followers: item.followers?.length || 0,
          status: item.status,
          raw: item,
        };
      })
      .filter((item) =>
        item.name.toLowerCase().includes(currentSearch.name.toLowerCase())
      );
  }, [data, currentSearch]);

  const onSearch = () => {
    const formValues = form.getFieldsValue();
    setCurrentSearch({
      name: formValues.name || "",
    });
  };

  const columns: TableColumnsType<DataType> = [
    {
      title: <span className="text-dark dark:text-white">ชื่อ</span>,
      dataIndex: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: <span className="text-dark dark:text-white">ลาราชการ (วัน)</span>,
      dataIndex: "mainLeave",
      align: "center",
      sorter: (a, b) => a.mainLeave - b.mainLeave,
    },
    {
      title: <span className="text-dark dark:text-white">ลาพักผ่อน (วัน)</span>,
      dataIndex: "vacationLeave",
      align: "center",
      sorter: (a, b) => a.vacationLeave - b.vacationLeave,
    },
    {
      title: <span className="text-dark dark:text-white">ลากิจส่วนตัว (วัน)</span>,
      dataIndex: "personalLeave",
      align: "center",
      sorter: (a, b) => a.personalLeave - b.personalLeave,
    },
    {
      title: <span className="text-dark dark:text-white">ลาทั้งหมด (วัน)</span>,
      dataIndex: "totalLeave",
      align: "center",
      sorter: (a, b) => a.totalLeave - b.totalLeave,
    },
    {
      title: <span className="text-dark dark:text-white">ผู้ติดตาม (คน)</span>,
      dataIndex: "followers",
      align: "center",
      sorter: (a, b) => a.followers - b.followers,
    },
    {
      title: <span className="text-dark dark:text-white">สถานะ</span>,
      dataIndex: "status",
      align: "center",
      render: (status) => {
        let color: string = "default";
        switch (status) {
          case "อนุมัติ":
            color = "green";
            break;
          case "ไม่อนุมัติ":
            color = "red";
            break;
          case "ยกเลิกอนุมัติ":
            color = "orange";
            break;
          case "รอดำเนินการ":
            color = "blue";
            break;
        }
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: <span className="text-dark dark:text-white">การจัดการ</span>,
      key: "actions",
      align: "center",
      render: (_, record) => {
        const status = record.status;
        return (
          <Space>
            {status === "รอดำเนินการ" && (
              <>
                <Tooltip title="อนุมัติ">
                  <Icons.CheckCircle
                    onClick={() => console.log("Approved", record.key)}
                    style={{ cursor: "pointer", color: "green" }}
                  />
                </Tooltip>
                <Tooltip title="ไม่อนุมัติ">
                  <Icons.XCircle
                    onClick={() => console.log("Rejected", record.key)}
                    style={{ cursor: "pointer", color: "red" }}
                  />
                </Tooltip>
                <Tooltip title="ดูรายละเอียดการลา">
                  <Icons.FileText
                    onClick={() => console.log("View Detail", record.raw)}
                    style={{ cursor: "pointer", color: "blue" }}
                  />
                </Tooltip>
              </>
            )}
            {status === "อนุมัติ" && (
              <>
                <Tooltip title="ยกเลิกอนุมัติ">
                  <Icons.XCircle
                    onClick={() => console.log("Cancel Approved", record.key)}
                    style={{ cursor: "pointer", color: "orange" }}
                  />
                </Tooltip>
                <Tooltip title="ดูรายละเอียดการลา">
                  <Icons.FileText
                    onClick={() => console.log("View Detail", record.raw)}
                    style={{ cursor: "pointer", color: "blue" }}
                  />
                </Tooltip>
              </>
            )}
            {(status === "ไม่อนุมัติ" || status === "ยกเลิกอนุมัติ") && (
              <Tooltip title="ดูรายละเอียดการลา">
                <Icons.FileText
                  onClick={() => console.log("View Detail", record.raw)}
                  style={{ cursor: "pointer", color: "blue" }}
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
            <Typography.Title level={4} style={{ margin: 0, fontSize: 18 }}>
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
                    router.push(`/private/approve-history/overseas`);
                  }}>
                  ลาราชการ
                </a>
              ),
            },
          ]}
        />
        <div className="chemds-container">
          <Row style={{ marginBottom: "1%" }}>
            <Col span={16}>
              <Form form={form} layout="inline" initialValues={{ name: "" }}>
                <Col>
                  <Form.Item name="name">
                    <Input placeholder="ชื่อ" allowClear defaultValue="" />
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
                pagination={{ pageSize: 10 }}
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
        leaveType: "ลาราชการต่างประเทศ",
        totalDate: 5,
        startDate: "2025-09-29",
        endDate: "2025-10-03",
        status: "อนุมัติ",
        country: "Japan",
        additionLeave: [
          {
            leaveType: "ลาพักผ่อน",
            startDate: "2025-10-04",
            endDate: "2025-10-05",
            totalDate: 2,
            reason: "พักผ่อนต่อ",
          },
        ],
        followers: [
          { fName: "สมชาย", lName: "ใจดี" },
          { fName: "สมปอง", lName: "แซ่ลิ้ม" },
        ],
      },
      {
        reqId: 2,
        user: { fName: "กันตพงษ์", lName: "กลางเมือง" },
        leaveType: "ลาราชการต่างประเทศ",
        totalDate: 3,
        startDate: "2025-10-10",
        endDate: "2025-10-12",
        status: "ไม่อนุมัติ",
        country: "France",
        followers: [],
      },
      {
        reqId: 3,
        user: { fName: "กนกพร", lName: "ปราบนที" },
        leaveType: "ลาราชการต่างประเทศ",
        totalDate: 4,
        startDate: "2025-11-01",
        endDate: "2025-11-04",
        status: "ยกเลิกอนุมัติ",
        country: "USA",
        additionLeave: [
          {
            leaveType: "ลากิจส่วนตัว",
            startDate: "2025-11-05",
            endDate: "2025-11-06",
            totalDate: 2,
            reason: "ธุระส่วนตัว",
          },
        ],
        followers: [{ fName: "วิชัย", lName: "ทองดี" }],
      },
      {
        reqId: 4,
        user: { fName: "ชลธิชา", lName: "มีสุข" },
        leaveType: "ลาราชการ",
        totalDate: 1,
        startDate: "2025-12-01",
        endDate: "2025-12-01",
        status: "รอดำเนินการ",
        country: "Thailand",
        followers: [{ fName: "พรชัย", lName: "รุ่งเรือง" }],
      },
    ];
    setData(mockData);
  }, []);
  return <ApproveHistoryTable data={data} />;
};

export default ApproveHistoryPage;
