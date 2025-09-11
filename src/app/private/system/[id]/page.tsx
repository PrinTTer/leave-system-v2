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
} from "antd";
import { useRouter } from "next/navigation";
import { validateEmailInput } from "@/app/utils";
import { ThemButtonColor } from "@/app/utils/constants";

export default function SystemDetailPage() {
  const { Title } = Typography;
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [api, contextHolder] = notification.useNotification();

  const fetchSystemDetail = async () => {
    try {
    } catch (error) {
      console.log("error: ", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSystemDetail();
  }, []);

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
                {"ระบบที่เปิดใช้งาน"}
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
                  { title: "รายละเอียด" },
                ]}
              />
            </Col>
          </Row>
          <div className="chemds-container">
            <Form layout="vertical" form={form} style={{ maxWidth: "none" }}>
              <Row>
                <Col span={12}>
                  <Form.Item
                    layout="vertical"
                    name="webKey"
                    label="คีย์ระบบ"
                    style={{ width: "90%" }}
                    rules={[
                      {
                        required: true,
                        message: "กรุณาใส่ข้อมูล คีย์ระบบ!",
                      },
                    ]}>
                    <Input
                      placeholder="คีย์ระบบ"
                      allowClear
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  <Form.Item
                    layout="vertical"
                    name="name"
                    label="ชื่อ"
                    style={{ width: "90%" }}
                    rules={[
                      {
                        required: true,
                        message: "กรุณาใส่ข้อมูล ชื่อ!",
                      },
                    ]}>
                    <Input
                      placeholder="ชื่อ"
                      allowClear
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  <Form.Item
                    layout="vertical"
                    name="description"
                    label="รายละเอียด"
                    style={{ width: "90%" }}>
                    <Input.TextArea
                      rows={4}
                      placeholder="รายละเอียด"
                      allowClear
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <Form.Item>
                    <Flex justify={"right"} align={"center"} gap="small">
                      <Button
                        className="chemds-button"
                        type="primary"
                        htmlType="submit"
                        style={{ backgroundColor: ThemButtonColor.Reject }}>
                        แก้ไข
                      </Button>
                      <Button
                        className="chemds-button"
                        type="primary"
                        style={{ backgroundColor: ThemButtonColor.Delete }}>
                        ลบ
                      </Button>
                    </Flex>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>
        </Space>
      </div>
    </>
  );
}
