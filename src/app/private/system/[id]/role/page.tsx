"use client";
import { useEffect, useState } from "react";
import {
  Button,
  Col,
  Form,
  Input,
  Row,
  Space,
  Typography,
  Skeleton,
  Breadcrumb,
  notification,
  InputNumber,
  Flex,
  Descriptions,
  TableProps,
  Popconfirm,
  Switch,
  Tooltip,
  PaginationProps,
  Table,
  Pagination,
} from "antd";
import { useRouter, useParams } from "next/navigation";
import { validateEmailInput } from "@/app/utils";
import { ThemButtonColor } from "@/app/utils/constants";
import * as Icons from "lucide-react";
import { convertDateTimeFormate, convertDateTimeToNumber } from "@/app/utils";

export default function RoleDetailPage() {
  const { Title, Paragraph } = Typography;
  const [form] = Form.useForm();
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [api, contextHolder] = notification.useNotification();
  const [tableLoading, setTableLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [roleSystemAccess, setRoleSystemAccess] =
    useState<RoleSystemAccessList>({
      data: [],
      page: 0,
      totalPage: 1,
      limit: 0,
      totalCount: 0,
    });
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [currentSearch, setcurrentSearch] = useState({
    thaiName: "",
    englishName: "",
  });

  const columns: TableProps["columns"] = [
    {
      title: "Id",
      dataIndex: "id",
      key: "id",
      align: "center",
      sorter: (a, b) => a.id - b.id,
      hidden: true,
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
      title: "ลิ้งค์",
      onHeaderCell: () => {
        return { style: { textAlign: "center" } }; // Center-align the header
      },
      align: "left",
      dataIndex: "link",
      key: "link",
    },
    {
      title: "การมองเห็น",
      dataIndex: "visibility",
      key: "visibility",
      align: "center",
      render: (_, record) => {
        return (
          <Space
            size="middle"
            style={{
              textAlign: "center",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}>
            <Row gutter={[16, 16]}>
              {record.visibility === "show" && (
                <Col span={8}>
                  <Popconfirm
                    okText="ใช่"
                    cancelText="ไม่"
                    title="ซ่อน"
                    description="คุณต้องการซ่อนลิ้งค์?"
                    okButtonProps={{ loading: confirmLoading }}>
                    <Switch
                      checkedChildren="แสดง"
                      unCheckedChildren="ซ่อน"
                      checked={record.visibility === "show"}
                    />
                  </Popconfirm>
                </Col>
              )}
              {record.visibility !== "show" && (
                <Col span={8}>
                  <Popconfirm
                    okText="ใช่"
                    cancelText="ไม่"
                    title="แสดง"
                    description="คุณต้องการแสดงลิ้งค์?"
                    okButtonProps={{ loading: confirmLoading }}>
                    <Switch
                      checkedChildren="แสดง"
                      unCheckedChildren="ซ่อน"
                      checked={record.visibility === "show"}
                    />
                  </Popconfirm>
                </Col>
              )}
            </Row>
          </Space>
        );
      },
      filters: [
        {
          text: "แสดง",
          value: "show",
        },
        {
          text: "ซ่อน",
          value: "hide",
        },
      ],
      onFilter: (value, record) =>
        record.visibility.startsWith(value as string),
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
                    router.push(
                      `/private/system/${params.id}/role/${record.id}/detail`
                    );
                  }}
                  size={16}
                />
              </Tooltip>
            </Col>
            <Col span={8}>
              <Tooltip title="จัดการสิทธิ์ผู้ใช้งาน">
                <Icons.ShieldUser
                  onClick={() => {
                    setLoading(true);
                    router.push(
                      `/private/system/${params.id}/role/${record.id}/permission`
                    );
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

  const fetchRoleDetail = async () => {
    try {
      const data = {
        data: [
          {
            id: 1,
            thaiName: "ผูใช้งานระบบ",
            englishName: "User",
            iconName: "xxxx",
            link: "http://localhost:3000/private/user",
            visibility: "show",
            updatedAt: "2025-07-03T10:15:23Z",
            createdAt: "2025-07-03T10:15:23Z",
          },
          {
            id: 2,
            thaiName: "ผูดูแลระบบ",
            englishName: "Admin",
            iconName: "xxx",
            link: "http://localhost:3000/private/admin",
            visibility: "hide",
            updatedAt: "2025-07-03T10:17:45Z",
            createdAt: "2025-07-03T10:15:23Z",
          },
        ],
        page: 1,
        totalPage: 1,
        limit: 10,
        totalCount: 3,
      };
      setRoleSystemAccess(data);
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
    fetchRoleDetail();
  }, [currentPage, currentSearch]);

  if (loading) {
    return (
      <>
        {contextHolder}
        <Skeleton active />
      </>
    );
  }

  return (
    <>
      <div style={{ padding: 10 }}>
        <Space direction="vertical" style={{ width: "100%" }} size={10}>
          <Row>
            <Col span={24}>
              <Title style={{ marginTop: 0, marginBottom: 0, fontSize: 18 }}>
                {"การจัดการสิทธิ์ของระบบ"}
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
                          router.push(`/private/system`);
                        }}>
                        ระบบที่เปิดใช้งาน
                      </a>
                    ),
                  },
                  { title: "ระบบ xxx" },
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
                    router.push(`/private/system/${params.id}/role/new`);
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
                  dataSource={roleSystemAccess.data}
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
                  total={roleSystemAccess.totalCount}
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
