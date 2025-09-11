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
} from "antd";
import { useRouter } from "next/navigation";
import { validateEmailInput } from "@/app/utils";

export default function NewRolePage() {
  const { Title } = Typography;
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [api, contextHolder] = notification.useNotification();

  const fetchNewRole = async () => {
    try {
    } catch (error) {
      console.log("error: ", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNewRole();
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
                {"สิทธิ์ใหม่สำหรับเข้าถึงระบบนี้"}
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
                  {
                    title: (
                      <a
                        onClick={() => {
                          setLoading(true);
                          router.push(`/private/setting/role`);
                        }}>
                        สิทธิ์เข้าถึงระบบนี้
                      </a>
                    ),
                  },
                  { title: "เพิ่ม" },
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
                    name="sequence"
                    label="ลำดับ"
                    style={{ width: "90%" }}
                    rules={[
                      {
                        required: true,
                        message: "กรุณาใส่ข้อมูล ลำดับ!",
                      },
                    ]}>
                    <InputNumber
                      min={1}
                      placeholder="ลำดับ"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  <Form.Item
                    layout="vertical"
                    name="thaiName"
                    label="ชื่อภาษาไทย"
                    style={{ width: "90%" }}
                    rules={[
                      {
                        required: true,
                        message: "กรุณาใส่ข้อมูล ชื่อภาษาไทย!",
                      },
                    ]}>
                    <Input
                      placeholder="ชื่อภาษาไทย"
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
                    name="englishName"
                    label="ชื่อภาษาอังกฤษ"
                    style={{ width: "90%" }}
                    rules={[
                      {
                        required: true,
                        message: "กรุณาใส่ข้อมูล ชื่อภาษาอังกฤษ!",
                      },
                    ]}>
                    <Input
                      placeholder="ชื่อภาษาอังกฤษ"
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
              <Row style={{ textAlign: "right" }}>
                <Col span={24}>
                  <Button
                    className="chemds-button"
                    type="primary"
                    htmlType="submit">
                    เพิ่ม
                  </Button>
                </Col>
              </Row>
            </Form>
          </div>
        </Space>
      </div>
    </>
  );
}
