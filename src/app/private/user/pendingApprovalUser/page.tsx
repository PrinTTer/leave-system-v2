"use client";
import { useEffect, useState } from "react";
import {
  Button,
  Col,
  Form,
  Input,
  Pagination,
  PaginationProps,
  Row,
  Space,
  Table,
  TableProps,
  Typography,
  Tooltip,
  InputNumber,
} from "antd";
import { useRouter } from "next/navigation";
import * as Icons from "lucide-react";
import { convertDateTimeFormate, convertDateTimeToNumber } from "@/app/utils";

export default function pendingApprovalUserIndexPage() {
  const { Title } = Typography;
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [users, setUsers] = useState<UserList>({
    data: [],
    page: 0,
    totalPage: 1,
    limit: 0,
    totalCount: 0,
  });
  const [currentSearch, setcurrentSearch] = useState({
    nontriAccount: "",
    name: "",
    surname: "",
  });

  const columns: TableProps["columns"] = [
    {
      title: "ไอดี",
      dataIndex: "id",
      key: "id",
      align: "center",
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "บัญชีนนทรี",
      onHeaderCell: () => {
        return { style: { textAlign: "center" } }; // Center-align the header
      },
      align: "left",
      dataIndex: "nontriAccount",
      key: "nontriAccount",
      sorter: (a, b) => a.nontriAccount.length - b.nontriAccount.length,
    },
    {
      title: "ชื่อ",
      onHeaderCell: () => {
        return { style: { textAlign: "center" } }; // Center-align the header
      },
      align: "left",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.length - b.name.length,
    },
    {
      title: "นามสกุล",
      onHeaderCell: () => {
        return { style: { textAlign: "center" } }; // Center-align the header
      },
      align: "left",
      dataIndex: "surname",
      key: "surname",
      sorter: (a, b) => a.surname.length - b.surname.length,
    },
    {
      title: "ku mail",
      onHeaderCell: () => {
        return { style: { textAlign: "center" } }; // Center-align the header
      },
      align: "left",
      dataIndex: "kuMail",
      key: "kuMail",
      sorter: (a, b) => a.kuMail.length - b.kuMail.length,
    },
    {
      title: "ยื่นขอเมื่อ",
      align: "center",
      dataIndex: "updatedAt",
      key: "updatedAt",
      sorter: (a, b) =>
        convertDateTimeToNumber(a.updatedAt) -
        convertDateTimeToNumber(b.updatedAt),
      render: (_, record) => {
        return convertDateTimeFormate(record.updatedAt);
      },
    },
    {
      title: "",
      key: "id",
      dataIndex: "id",
      align: "center",
      width: "10%",
      render: (_, record) => {
        return (
          <Row
            gutter={[16, 16]}
            style={{
              textAlign: "center",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}>
            <Col span={8}>
              <Tooltip title="confirm">
                <Icons.Check size={16} />
              </Tooltip>
            </Col>
            <Col span={8}>
              <Tooltip title="reject">
                <Icons.X size={16} />
              </Tooltip>
            </Col>
          </Row>
        );
      },
    },
  ];

  const fetchpendingApprovalUsers = async () => {
    try {
      const data = {
        data: [
          {
            id: 1,
            uid: "xxx",
            nontriAccount: "nattapong01",
            name: "ณัฐพงศ์",
            surname: "ศรีสุข",
            kuMail: "nattapong01@example.com",
            updatedAt: "2025-07-03T10:15:23Z",
            createdAt: "2025-07-03T10:15:23Z",
          },
          {
            id: 2,
            uid: "xxx",
            nontriAccount: "arisa_kt",
            name: "อริสา",
            surname: "เกตุแก้ว",
            kuMail: "arisa.kt@example.com",
            updatedAt: "2025-07-03T10:17:45Z",
            createdAt: "2025-07-03T10:15:23Z",
          },
          {
            id: 3,
            uid: "xxx",
            nontriAccount: "beam_rk",
            name: "พีรภัทร",
            surname: "รักดี",
            kuMail: "beam.rk@example.com",
            updatedAt: "2025-07-03T10:18:12Z",
            createdAt: "2025-07-03T10:15:23Z",
          },
          {
            id: 4,
            uid: "xxx",
            nontriAccount: "fonny_89",
            name: "น้ำฝน",
            surname: "ธรรมรักษ์",
            kuMail: "fonny89@example.com",
            updatedAt: "2025-07-03T10:20:08Z",
            createdAt: "2025-07-03T10:15:23Z",
          },
          {
            id: 5,
            uid: "xxx",
            nontriAccount: "meechai_dev",
            name: "มีชัย",
            surname: "สารวัตร",
            kuMail: "meechai.dev@example.com",
            updatedAt: "2025-07-03T10:21:50Z",
            createdAt: "2025-07-03T10:15:23Z",
          },
          {
            id: 6,
            uid: "xxx",
            nontriAccount: "piyada_sky",
            name: "ปิยะดา",
            surname: "เมฆขลา",
            kuMail: "piyada.sky@example.com",
            updatedAt: "2025-07-03T10:22:33Z",
            createdAt: "2025-07-03T10:15:23Z",
          },
          {
            id: 7,
            uid: "xxx",
            nontriAccount: "tonkla_ch",
            name: "ต้นกล้า",
            surname: "ชัยวัฒน์",
            kuMail: "tonkla.ch@example.com",
            updatedAt: "2025-07-03T10:24:01Z",
            createdAt: "2025-07-03T10:15:23Z",
          },
          {
            id: 8,
            uid: "xxx",
            nontriAccount: "noon_lovely",
            name: "นุ่น",
            surname: "รัตนโกสินทร์",
            kuMail: "noon.lovely@example.com",
            updatedAt: "2025-07-03T10:25:14Z",
            createdAt: "2025-07-03T10:15:23Z",
          },
          {
            id: 9,
            uid: "xxx",
            nontriAccount: "krit_sr",
            name: "กฤต",
            surname: "ศิริเวช",
            kuMail: "krit.sr@example.com",
            updatedAt: "2025-07-03T10:27:09Z",
            createdAt: "2025-07-03T10:15:23Z",
          },
          {
            id: 10,
            uid: "xxx",
            nontriAccount: "junezaza",
            name: "จูน",
            surname: "อินทรโชติ",
            kuMail: "junezaza@example.com",
            updatedAt: "2025-07-03T10:28:56Z",
            createdAt: "2025-07-03T10:15:23Z",
          },
        ],
        page: 1,
        totalPage: 1,
        limit: 10,
        totalCount: 10,
      };
      setUsers(data);
      setLoading(false);
      setTableLoading(false);
    } catch (error) {
      console.log("error: ", error);
      setLoading(false);
      setTableLoading(false);
    }
  };

  const onPageChange: PaginationProps["onChange"] = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const onSearch = () => {
    setcurrentSearch({
      nontriAccount: form.getFieldValue("nontriAccount"),
      name: form.getFieldValue("name"),
      surname: form.getFieldValue("surname"),
    });
    setCurrentPage(1);
  };

  useEffect(() => {
    setTableLoading(true);
    fetchpendingApprovalUsers();
  }, [currentPage, currentSearch]);

  return (
    <>
      <div style={{ padding: 10 }}>
        <Space direction="vertical" style={{ width: "100%" }} size={10}>
          <Row>
            <Col span={12}>
              <Title
                style={{
                  marginTop: 0,
                  marginBottom: 0,
                  fontSize: 18,
                }}>
                {"ผู้ใช้งานรอพิจารณา"}
              </Title>
            </Col>
          </Row>
          <div className="chemds-container">
            <Row style={{ marginBottom: "1%" }}>
              <Col span={16}>
                <Form layout="inline" form={form}>
                  <Col>
                    <Form.Item name="nontriAccount">
                      <Input placeholder="บัญชีนนทรี" allowClear />
                    </Form.Item>
                  </Col>
                  <Col>
                    <Form.Item name="name">
                      <Input placeholder="ชื่อ" allowClear />
                    </Form.Item>
                  </Col>
                  <Col>
                    <Form.Item name="surname">
                      <Input placeholder="นามสกุล" allowClear />
                    </Form.Item>
                  </Col>
                  <Col>
                    <Button
                      className="chemds-button"
                      type="primary"
                      onClick={() => {
                        onSearch();
                      }}>
                      ค้นหา
                    </Button>
                  </Col>
                </Form>
              </Col>
            </Row>
            <Row style={{ marginBottom: "1%" }}>
              <Col span={24}>
                <Table
                  columns={columns}
                  rowKey={(record) => record.id}
                  dataSource={users.data}
                  style={{ width: "100%" }}
                  pagination={false}
                  bordered
                  loading={tableLoading}
                />
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Pagination
                  defaultCurrent={1}
                  total={users.totalCount}
                  showSizeChanger={false}
                  pageSize={10}
                  onChange={onPageChange}
                  align="end"
                />
              </Col>
            </Row>
          </div>
        </Space>
      </div>
    </>
  );
}
