"use client";
import { useEffect, useState } from "react";
import {
  Col,
  Row,
  Space,
  Table,
  TableProps,
  Typography,
  Tooltip,
  Form,
  Input,
  Button,
} from "antd";
import { useRouter } from "next/navigation";
import * as Icons from "lucide-react";

export default function SettingIndexPage() {
  const { Title } = Typography;
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(true);
  const [settingList, setSettingList] = useState<SettingList[]>([]);
  const [settingSearchList, setSettingSearchList] = useState<SettingList[]>([]);
  const [currentSearch, setcurrentSearch] = useState({
    thaiName: "",
    englishName: "",
  });

  const columns: TableProps["columns"] = [
    {
      title: "ลำดับ",
      dataIndex: "order",
      key: "order",
      align: "center",
      sorter: (a, b) => a.order - b.order,
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
      title: "รายละเอียด",
      onHeaderCell: () => {
        return { style: { textAlign: "center" } }; // Center-align the header
      },
      align: "left",
      dataIndex: "description",
      key: "description",
      sorter: (a, b) => a.description.length - b.description.length,
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
              <Tooltip title="จัดการ">
                <Icons.TableOfContents
                  onClick={() => {
                    setLoading(true);
                    router.push(`/private/setting/${record.direct}`);
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

  const fetchSetting = async () => {
    try {
      const data: SettingList[] = [
        {
          id: 1,
          order: 1,
          thaiName: "สิทธิ์เข้าถึงระบบ",
          englishName: "System access role",
          description: "สำหรับจัดการสิทธ์การเข้าถึงระบบนี้",
          direct: "role",
        },
        {
          id: 2,
          order: 2,
          thaiName: "ภาพไอคอนเข้าถึงระบบ",
          englishName: "System access icon image",
          description: "ภาพไอคอนสิทธ์การเข้าถึงระบบอื่นๆ",
          direct: "accessRoleImage",
        },
      ];

      setSettingList(data);
      setSettingSearchList(data);
      setLoading(false);
      setTableLoading(false);
    } catch (error) {
      console.log("error: ", error);
      setLoading(false);
      setTableLoading(false);
    }
  };

  const onSearch = () => {
    setcurrentSearch({
      thaiName: form.getFieldValue("thaiName"),
      englishName: form.getFieldValue("englishName"),
    });
  };

  useEffect(() => {
    setTableLoading(true);
    fetchSetting();
  }, []);

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
                {"การตั้งค่า"}
              </Title>
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
            </Row>
            <Row style={{ marginBottom: "1%" }}>
              <Col span={24}>
                <Table
                  columns={columns}
                  rowKey={(record) => record.id}
                  dataSource={settingSearchList}
                  style={{ width: "100%" }}
                  bordered
                  loading={tableLoading}
                />
              </Col>
            </Row>
          </div>
        </Space>
      </div>
    </>
  );
}
