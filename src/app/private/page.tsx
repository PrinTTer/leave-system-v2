"use client";
import { useEffect, useState } from "react";
import {
  Button,
  Col,
  Form,
  Input,
  Image,
  PaginationProps,
  Row,
  Space,
  Table,
  TableProps,
  Typography,
  Tooltip,
  InputNumber,
  Divider,
  Card,
  Flex,
} from "antd";
import { useRouter } from "next/navigation";
import * as Icons from "lucide-react";
import { convertDateTimeFormate, convertDateTimeToNumber } from "@/app/utils";

export default function HomePage() {
  const { Title } = Typography;
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(true);
  const [systemAccessList, setSystemAccessList] = useState<SystemAccessList>({
    data: [],
    page: 0,
    totalPage: 1,
    limit: 0,
    totalCount: 0,
  });
  const [currentSearch, setcurrentSearch] = useState({
    thaiName: "",
  });

  const fetchSystemAccess = async () => {
    try {
      const data = {
        data: [
          {
            id: 1,
            thaiName: "ระบบบุคลากร",
            shortName: "PN",
            description: "xxxx",
            roleSystemAccessList: [
              {
                id: 1,
                name: "ผู้ใช้งานระบบ",
                iconName: "xxx",
                link: "xxxx",
                badgeNumber: 0,
              },
              {
                id: 2,
                name: "ผู้ดูแลระบบ",
                iconName: "xxx",
                link: "xxxx",
                badgeNumber: 2,
              },
            ],
          },
          {
            id: 2,
            thaiName: "ระบบลา",
            shortName: "L",
            description: "xxxx",
            roleSystemAccessList: [
              {
                id: 1,
                name: "ผู้ใช้งานระบบ",
                iconName: "xxx",
                link: "xxxx",
                badgeNumber: 0,
              },
              {
                id: 2,
                name: "ผู้ดูแลระบบ",
                iconName: "xxx",
                link: "xxxx",
                badgeNumber: 2,
              },
              {
                id: 3,
                name: "ผู้อนุมัติอันดับที่ 1",
                iconName: "xxx",
                link: "xxxx",
                badgeNumber: 17,
              },
              {
                id: 4,
                name: "ผู้อนุมัติอันดับที่ 2",
                iconName: "xxx",
                link: "xxxx",
                badgeNumber: 17,
              },
            ],
          },
          {
            id: 3,
            thaiName: "ระบบใช้รถ",
            shortName: "V",
            description: "xxxx",
            roleSystemAccessList: [
              {
                id: 1,
                name: "ผู้ใช้งานระบบ",
                iconName: "xxx",
                link: "xxxx",
                badgeNumber: 0,
              },
              {
                id: 2,
                name: "ผู้ดูแลระบบ",
                iconName: "xxx",
                link: "xxxx",
                badgeNumber: 2,
              },
              {
                id: 3,
                name: "ผู้อนุมัติอันดับที่ 1",
                iconName: "xxx",
                link: "xxxx",
                badgeNumber: 17,
              },
              {
                id: 4,
                name: "ผู้อนุมัติอันดับที่ 2",
                iconName: "xxx",
                link: "xxxx",
                badgeNumber: 17,
              },
            ],
          },
        ],
        page: 1,
        totalPage: 1,
        limit: 10,
        totalCount: 3,
      };
      setSystemAccessList(data);
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
    });
  };

  useEffect(() => {
    setTableLoading(true);
    fetchSystemAccess();
  }, [currentSearch]);

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
                {"ระบบที่สามารถเข้าถึงได้"}
              </Title>
            </Col>
          </Row>
          <Row style={{ marginBottom: "1%" }}>
            <Col span={16}>
              <Form layout="inline" form={form}>
                <Col>
                  <Form.Item name="thaiName">
                    <Input placeholder="ชื่อระบบ" allowClear />
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
          {systemAccessList.data.map((item, key) => (
            <>
              <Divider key={"D-" + key} orientation="left">
                {item.thaiName}
              </Divider>
              <Row gutter={16} key={"R-" + key}>
                {item.roleSystemAccessList.map((subItem, subKey) => (
                  <Col
                    span={4}
                    key={"C-" + key + "-" + subKey}
                    style={{ padding: 5 }}>
                    <Card
                      cover={
                        <div className="image-container">
                          <img
                            alt={"I-" + key + "-" + subKey}
                            src={"/images/role/employee.png"}
                            draggable={false}
                          />
                        </div>
                      }
                      hoverable={true}>
                      <Card.Meta
                        title={subItem.name}
                        description={
                          <Flex
                            gap="small"
                            wrap
                            align="center"
                            justify="center">
                            <Button
                              type="primary"
                              shape="round"
                              icon={<Icons.ExternalLink />}
                              size={"small"}>
                              เข้าสู้ระบบ
                            </Button>
                          </Flex>
                        }
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            </>
          ))}
        </Space>
      </div>
    </>
  );
}
