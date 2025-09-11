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
  Select,
} from "antd";
import { useRouter } from "next/navigation";
import { validateEmailInput } from "@/app/utils";
import { ThemButtonColor } from "@/app/utils/constants";
import * as Icons from "lucide-react";

export default function UserDetailPage() {
  const { Title } = Typography;
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [api, contextHolder] = notification.useNotification();

  const fetchNewUser = async () => {
    try {
    } catch (error) {
      console.log("error: ", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNewUser();
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
                {"ผู้ใช้งานระบบ"}
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
                          router.push(`/private/user`);
                        }}>
                        ผู้ใช้งานระบบ
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
                    name="nontriAccount"
                    label="บัญชีนนทรี"
                    style={{ width: "90%" }}
                    rules={[
                      {
                        required: true,
                        message: "กรุณาใส่ข้อมูล บัญชีนนทรี!",
                      },
                    ]}>
                    <Input
                      placeholder="บัญชีนนทรี"
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
                    name="surname"
                    label="นามสกุล"
                    style={{ width: "90%" }}
                    rules={[
                      {
                        required: true,
                        message: "กรุณาใส่ข้อมูล นามสกุล!",
                      },
                    ]}>
                    <Input
                      placeholder="นามสกุล"
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
                    name="kuMail"
                    label="KU E-mail"
                    style={{ width: "90%" }}
                    rules={[
                      {
                        required: true,
                        message: "กรุณาใส่ข้อมูล KU E-mail!",
                      },
                      { validator: validateEmailInput },
                    ]}>
                    <Input
                      placeholder="KU E-mail"
                      allowClear
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item label="รายการระบบที่สามารถเข้าถึงได้">
                <Form.List name="systems">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }) => (
                        <Row key={key} gutter={[16, 16]}>
                          <Col span={5} key={key + "-" + 1}>
                            <Form.Item
                              {...restField}
                              label="ชื่อระบบ"
                              name={[name, "system"]}
                              rules={[
                                {
                                  required: true,
                                  message: "กรุณาเลือกข้อมูล ชื่อระบบ!",
                                },
                              ]}>
                              <Select
                                showSearch
                                placeholder="ชื่อระบบ"
                                filterOption={(input, option) =>
                                  (option?.label ?? "")
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                                }
                                options={[
                                  {
                                    value: 1,
                                    label: "ระบบ A",
                                  },
                                  { value: 2, label: "ระบบ B" },
                                ]}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={5} key={key + "-" + 2}>
                            <Form.Item
                              {...restField}
                              label="สิทธิ์เข้าถึง"
                              name={[name, "role"]}
                              rules={[
                                {
                                  required: true,
                                  message: "กรุณาเลือกข้อมูล สิทธิ์เข้าถึง!",
                                },
                              ]}>
                              <Select
                                showSearch
                                placeholder="สิทธิ์เข้าถึง"
                                filterOption={(input, option) =>
                                  (option?.label ?? "")
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                                }
                                options={[
                                  {
                                    value: 1,
                                    label: "ผู้ดูแลระบบ",
                                  },
                                  { value: 2, label: "ผู้ใช้ทั่วไป" },
                                ]}
                              />
                            </Form.Item>
                          </Col>
                          <Col
                            span={2}
                            key={key + "-" + 3}
                            style={{
                              display: "flex",
                              justifyContent: "flex-end",
                              alignItems: "center",
                            }}>
                            <Icons.CircleMinus onClick={() => remove(name)} />
                          </Col>
                        </Row>
                      ))}
                      <Row>
                        <Col span={12}>
                          <Form.Item>
                            <Button
                              style={{ width: "90%" }}
                              type="dashed"
                              onClick={() => add()}
                              block
                              icon={<Icons.CirclePlus />}>
                              เพิ่มเข้าถึงระบบ
                            </Button>
                          </Form.Item>
                        </Col>
                      </Row>
                    </>
                  )}
                </Form.List>
              </Form.Item>
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
