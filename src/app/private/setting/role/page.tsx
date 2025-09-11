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
  Table,
  TableProps,
  Typography,
  Tooltip,
  Space,
  Breadcrumb,
} from "antd";
import { useRouter } from "next/navigation";
import * as Icons from "lucide-react";
import { convertDateTimeFormate, convertDateTimeToNumber } from "@/app/utils";

export default function SystemAccessRoleIndexPage() {
  const { Title } = Typography;
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [roles, setRoles] = useState<RoleList>({
    data: [],
    page: 0,
    totalPage: 1,
    limit: 0,
    totalCount: 0,
  });
  const [currentSearch, setcurrentSearch] = useState({
    thaiName: "",
    englishName: "",
  });

  const columns: TableProps["columns"] = [
    {
      title: "ลำดับ",
      dataIndex: "sequence",
      key: "sequence",
      align: "center",
      sorter: (a, b) => a.sequence - b.sequence,
    },
    {
      title: "ชื่อภาษาไทย",
      onHeaderCell: () => {
        return { style: { textAlign: "center" } }; // Center-align the header
      },
      align: "left",
      dataIndex: "thaiName",
      key: "thaiName",
      sorter: (a, b) => a.thaiName.length - b.thaiName.length,
    },
    {
      title: "ชื่อภาษาอังกฤษ",
      onHeaderCell: () => {
        return { style: { textAlign: "center" } }; // Center-align the header
      },
      align: "left",
      dataIndex: "englishName",
      key: "englishName",
      sorter: (a, b) => a.englishName.length - b.englishName.length,
    },
    {
      title: "ชื่อย่อภาษาไทย",
      onHeaderCell: () => {
        return { style: { textAlign: "center" } }; // Center-align the header
      },
      align: "left",
      dataIndex: "thaiShortName",
      key: "thaiShortName",
      sorter: (a, b) => a.thaiShortName.length - b.thaiShortName.length,
    },
    {
      title: "รายละเอียด",
      onHeaderCell: () => {
        return { style: { textAlign: "center" } }; // Center-align the header
      },
      align: "left",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "แก้ไขล่าสุด",
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
              <Tooltip title="รายละเอียด">
                <Icons.BookOpenText
                  onClick={() => {
                    setLoading(true);
                    router.push(`/private/setting/role/${record.id}`);
                  }}
                  size={16}
                />
              </Tooltip>
            </Col>
            <Col span={8}>
              <Tooltip title="ลบ">
                <Icons.Trash
                  onClick={() => {
                    setLoading(true);
                    router.push(`/private/setting/role/${record.id}`);
                  }}
                  size={16}
                />
              </Tooltip>
            </Col>
          </Row>
        );
      },
    },
  ];

  const fetchRole = async () => {
    try {
      const data = {
        data: [
          {
            id: 1,
            sequence: 1,
            thaiName: "ผู้ดูแลระบบ",
            englishName: "Admin",
            description: "เป็นผู้ดูแลระบบนี้",
            createdAt: "",
            updatedAt: "",
          },
          {
            id: 2,
            sequence: 2,
            thaiName: "ผู้ใช้งานในระบบ",
            englishName: "User",
            description: "เป็นผู้ใช้งานในระบบนี้",
            createdAt: "",
            updatedAt: "",
          },
          {
            id: 3,
            sequence: 3,
            thaiName: "นิสิตในระบบ",
            englishName: "Student",
            description: "เป็นนิสิตในระบบนี้",
            createdAt: "",
            updatedAt: "",
          },
        ],
        page: 1,
        totalPage: 1,
        limit: 10,
        totalCount: 10,
      };
      setRoles(data);
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
      thaiName: form.getFieldValue("thaiName"),
      englishName: form.getFieldValue("englishName"),
    });
    setCurrentPage(1);
  };

  useEffect(() => {
    setTableLoading(true);
    fetchRole();
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
                {"สิทธิ์เข้าถึงระบบนี้"}
              </Title>
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
                          setLoading(true);
                          router.push(`/private/setting`);
                        }}>
                        การตั้งค่า
                      </a>
                    ),
                  },
                  { title: "รายการ" },
                ]}
              />
            </Col>
          </Row>
          <div className="chemds-container">
            <Row style={{ marginBottom: "1%" }}>
              <Col span={16}>
                <Form layout="inline" form={form}>
                  <Col>
                    <Form.Item name="thaiName">
                      <Input placeholder="ชื่อภาษาไทย" allowClear />
                    </Form.Item>
                  </Col>
                  <Col>
                    <Form.Item name="englishName">
                      <Input placeholder="ชื่อภาษาอังกฤษ" allowClear />
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
              <Col
                span={8}
                style={{ display: "flex", justifyContent: "right" }}>
                <Button
                  className="chemds-button"
                  type="primary"
                  onClick={() => {
                    setLoading(true);
                    router.push(`/private/setting/role/new`);
                  }}>
                  เพิ่ม
                </Button>
              </Col>
            </Row>
            <Row style={{ marginBottom: "1%" }}>
              <Col span={24}>
                <Table
                  columns={columns}
                  rowKey={(record) => record.id}
                  dataSource={roles.data}
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
                  total={roles.totalCount}
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
