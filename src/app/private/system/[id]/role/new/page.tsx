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
  Select,
} from "antd";
import { useRouter, useParams } from "next/navigation";
import { validateEmailInput } from "@/app/utils";

export default function NewSystemPage() {
  const { Title } = Typography;
  const [form] = Form.useForm();
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [api, contextHolder] = notification.useNotification();

  const fetchNewSystem = async () => {
    try {
    } catch (error) {
      console.log("error: ", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNewSystem();
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
                {"สิทธิ์ใหม่ของระบบ xxx"}
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
                  {
                    title: (
                      <a
                        onClick={() => {
                          setLoading(true);
                          router.push(`/private/system/${params.id}/role`);
                        }}>
                        ระบบ xxx
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
                    name="link"
                    label="ลิ้งค์"
                    style={{ width: "90%" }}
                    rules={[
                      {
                        required: true,
                        message: "กรุณาใส่ข้อมูล ลิ้งค์!",
                      },
                    ]}>
                    <Input
                      placeholder="ลิ้งค์"
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
                    name="iconName"
                    label="ภาพไอคอนสิทธิ์"
                    style={{ width: "90%" }}
                    rules={[
                      {
                        required: true,
                        message: "กรุณาเลือกข้อมูล ภาพไอคอนสิทธิ์!",
                      },
                    ]}>
                    <Select
                      showSearch
                      placeholder="ภาพไอคอนสิทธิ์"
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      options={[
                        { value: 1, label: "ไอคอนที่ 1" },
                        { value: 2, label: "ไอคอนที่ 2" },
                        { value: 3, label: "ไอคอนที่ 3" },
                      ]}
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
