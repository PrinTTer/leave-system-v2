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
} from "antd";
import * as Icons from "lucide-react";

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
  // เพิ่ม follower (ผู้ติดตาม)
  follower?: {
    fName: string;
    lName: string;
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
  // จำนวนผู้ติดตาม
  followerCount: number;
  follower?: ApproveReq["follower"];
}

const columns: TableColumnsType<DataType> = [
  {
    title: <span className="text-dark dark:text-white">ชื่อ</span>,
    dataIndex: "name",
    filterSearch: true,
    filters: [],
    onFilter: (value, record) => record.name.includes(value as string),
    sorter: (a, b) => a.name.localeCompare(b.name),
  },
  {
    title: <span className="text-dark dark:text-white">ประเภทลา</span>,
    dataIndex: "leaveType",
    filterSearch: true,
    filters: [],
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

  // ---- เพิ่มคอลัมน์ จำนวนผู้ติดตาม ----
  {
    title: <span className="text-dark dark:text-white">ผู้ติดตาม</span>,
    dataIndex: "followerCount",
    align: "center",
    sorter: (a, b) => a.followerCount - b.followerCount,
    render: (count: number, record: DataType) => (
      <span className="text-dark dark:text-white">
        {count}
      </span>
    ),
  },

  {
    title: <span className="text-dark dark:text-white">สถานะ</span>,
    dataIndex: "status",
    align: "center",
    render: (status) => (
      <span
        className={
          status === "อนุมัติ"
            ? "inline-block rounded-full bg-green-100 px-3 py-1 text-green-700 text-xs font-semibold dark:bg-green-900 dark:text-green-200"
            : status === "ไม่อนุมัติ"
            ? "inline-block rounded-full bg-red-100 px-3 py-1 text-red-700 text-xs font-semibold dark:bg-red-900 dark:text-red-200"
            : "inline-block rounded-full bg-yellow-100 px-3 py-1 text-yellow-700 text-xs font-semibold dark:bg-yellow-900 dark:text-yellow-200"
        }
      >
        {status}
      </span>
    ),
  },
  {
    title: <span className="text-dark dark:text-white">การจัดการ</span>,
    key: "actions",
    align: "center",
    render: (_, record) => (
      <Space>
        <Tooltip title="ดูรายละเอียดการลา">
          <Icons.Eye
            onClick={() => {
              // แทนที่จะ console.log คุณอาจเปิด modal หรือ route ไปหน้า detail ได้
              console.log("ดูรายละเอียดการลา:", record.raw);
            }}
            style={{ cursor: "pointer" }}
          />
        </Tooltip>

        <Tooltip title="ยกเลิกอนุมัติ">
          <Icons.XCircle
            onClick={() => console.log("Cancel Approved", record.key)}
            style={{ cursor: "pointer", color: "orange" }}
          />
        </Tooltip>
      </Space>
    ),
  },
];

function getUniqueFilters<T>(data: DataType[], key: keyof DataType) {
  const set = new Set<string>();
  data.forEach((item) => {
    const v = item[key];
    if (typeof v === "string") set.add(v);
  });
  return Array.from(set).map((v) => ({ text: v, value: v }));
}

const ApproveHistoryTable: React.FC<{ data: ApproveReq[] }> = ({ data }) => {
  const [currentSearch, setCurrentSearch] = useState({ name: "", leaveType: "" });

  const transformedData = useMemo(() => {
    return data
      .filter((item) => ["อนุมัติ", "ไม่อนุมัติ", "ยกเลิกอนุมัติ"].includes(item.status))
      .flatMap((item) => {
        const followerCount = item.follower?.length ?? 0;
        const baseItem: DataType = {
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
          followerCount,
          follower: item.follower,
        };

        // ถ้าเป็นต่างประเทศและมี additionLeave ให้แตก row เพิ่ม (เหมือนของเดิม)
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
            followerCount, // สืบทอดจำนวนผู้ติดตามมาจากรายการหลัก (ถ้ามี)
            follower: item.follower,
          })) as DataType[];
          return [baseItem, ...additionalRows];
        }

        // ปกติ return แถวเดียว
        return [baseItem];
      })
      .filter((item) =>
        item.name.toLowerCase().includes(currentSearch.name.toLowerCase()) &&
        item.leaveType.toLowerCase().includes(currentSearch.leaveType.toLowerCase())
      );
  }, [data, currentSearch]);

  const nameFilters = getUniqueFilters(transformedData, "name");
  const leaveTypeFilters = getUniqueFilters(transformedData, "leaveType");
  // update filters (mutate columns เพื่อให้ filter แสดง)
  columns[0].filters = nameFilters;
  columns[1].filters = leaveTypeFilters;

  const onSearch = () => {
    const formValues = form.getFieldsValue();
    setCurrentSearch({
      name: formValues.name || "",
      leaveType: formValues.leaveType || "",
    });
  };

  const [form] = Form.useForm();

  return (
    <div style={{ padding: 10 }}>
      <Space direction="vertical" style={{ width: "100%" }} size={10}>
        <Row>
          <Col span={12}>
            <Typography.Title
              level={4}
              style={{
                marginTop: 0,
                marginBottom: 0,
                fontSize: 18,
              }}
            >
              การลาของผู้ใต้บังคับบัญชา
            </Typography.Title>
          </Col>
        </Row>
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
                  <Button
                    className="chemds-button"
                    type="primary"
                    onClick={onSearch}
                  >
                    ค้นหา
                  </Button>
                </Col>
              </Form>
            </Col>
            <Col span={8} style={{ display: "flex", justifyContent: "flex-end" }}>
              {/* อาจเพิ่มปุ่มอื่นๆ ตามต้องการ เช่น ปุ่มรีเฟรช */}
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
        leaveType: "ลาราชการ",
        totalDate: 183,
        startDate: "2025-09-29",
        endDate: "2026-09-29",
        status: "อนุมัติ",
        country: null,
        // ตัวอย่าง follower (ผู้ติดตาม)
        follower: [
          { fName: "สมชาย", lName: "ใจดี" },
          { fName: "สมหมาย", lName: "สุขใจ" },
          { fName: "นภาพร", lName: "ผู้ติดตาม" },
        ],
      },
      {
        reqId: 2,
        user: { fName: "กันตพงษ์", lName: "กลางเมือง" },
        leaveType: "ลาราชการ", // ลาราชการในประเทศ — จะมีผู้ติดตามไปด้วย
        totalDate: 3,
        startDate: "2025-10-03",
        endDate: "2025-10-03",
        status: "ไม่อนุมัติ",
        country: null,
        follower: [
          { fName: "นภาพร", lName: "ผู้ติดตาม" },
        ],
      },
      {
        reqId: 3,
        user: { fName: "กนกพร", lName: "ปราบนที" },
        leaveType: "ลาราชการ",
        totalDate: 3,
        startDate: "2025-10-20",
        endDate: "2025-10-20",
        status: "ยกเลิกอนุมัติ",
        country: "null",
        // กรณีต่างประเทศ มี additionLeave (ตัวอย่าง)
        follower: [
            { fName: "สมชาย", lName: "ใจดี" },
          { fName: "สมหมาย", lName: "สุขใจ" },
          { fName: "นภาพร", lName: "ผู้ติดตาม" },
        ], // อาจไม่มี follower
      },
    ];
    setData(mockData);
  }, []);
  return <ApproveHistoryTable data={data} />;
};

export default ApproveHistoryPage;
