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
  Card,
} from "antd";
import { useRouter } from "next/navigation";
import * as Icons from "lucide-react";
import { convertDateTimeFormate, convertDateTimeToNumber } from "@/app/utils";

export default function AccessRoleImageIndexPage() {
  const { Title, Text } = Typography;
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [iconImage, setIconImage] = useState<IconImageList>({
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

  const fetchRole = async () => {
    try {
      const data = {
        data: [
          {
            id: 1,
            sequence: 1,
            thaiName: "ผู้ดูแลระบบ",
            englishName: "Admin",
            pathName: "role/admin.png",
            createdAt: "",
            updatedAt: "",
          },
          {
            id: 2,
            sequence: 2,
            thaiName: "ผู้อนุมัติ",
            englishName: "Approver",
            pathName: "role/businessman.png",
            createdAt: "",
            updatedAt: "",
          },
          {
            id: 3,
            sequence: 3,
            thaiName: "ผู้ใช้งานในระบบ",
            englishName: "User",
            pathName: "role/employee.png",
            createdAt: "",
            updatedAt: "",
          },
        ],
        page: 1,
        totalPage: 1,
        limit: 10,
        totalCount: 10,
      };
      setIconImage(data);
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
                {"ภาพไอคอนเข้าถึงระบบ"}
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
            <Col span={8} style={{ display: "flex", justifyContent: "right" }}>
              <Button
                className="chemds-button"
                type="primary"
                onClick={() => {
                  setLoading(true);
                  router.push(`/private/setting/accessRoleImage/new`);
                }}>
                เพิ่ม
              </Button>
            </Col>
          </Row>
          <Row gutter={[16, 16]} style={{ marginBottom: "1%" }}>
            {iconImage.data.map((item, key) => (
              <Col key={key}>
                <Card
                  key={"card_" + key}
                  hoverable
                  style={{
                    fontWeight: 700,
                    backgroundColor: "white",
                    color: "black",
                  }}
                  cover={
                    <div className="image-container">
                      <img
                        alt={String(key)}
                        src={"/images/" + item.pathName}
                        draggable={false}
                      />
                    </div>
                  }>
                  <div
                    key={key}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: "white",
                      color: "black",
                    }}>
                    <Text
                      style={{
                        fontWeight: 700,
                        color: "black",
                        flexGrow: 1,
                      }}>
                      {item.thaiName}
                    </Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
          <Row>
            <Col span={24}>
              <Pagination
                defaultCurrent={1}
                total={iconImage.totalCount}
                showSizeChanger={false}
                pageSize={10}
                onChange={onPageChange}
                align="end"
              />
            </Col>
          </Row>
        </Space>
      </div>
    </>
  );
}
