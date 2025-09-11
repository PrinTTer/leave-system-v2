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
  Image,
  Upload,
  message,
} from "antd";
import { useRouter } from "next/navigation";
import { PlusOutlined } from "@ant-design/icons";
import { validateEmailInput } from "@/app/utils";
import type { GetProp, UploadFile, UploadProps } from "antd";
type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];
import * as Icons from "lucide-react";

export default function NewAccessRoleImagePage() {
  const { Title } = Typography;
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [api, contextHolder] = notification.useNotification();

  const fetchNewAccessRoleImage = async () => {
    try {
    } catch (error) {
      console.log("error: ", error);
    }
    setLoading(false);
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const beforeUpload = (file: FileType) => {
    const isLt2M = file.size / 1024 / 1024 < 10;
    if (!isLt2M) {
      message.error("Image must smaller than 10MB!");
    }
    return isLt2M;
  };

  useEffect(() => {
    fetchNewAccessRoleImage();
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
                {"ภาพไอคอนใหม่สำหรับเข้าถึงระบบ"}
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
                          router.push(`/private/setting/accessRoleImage`);
                        }}>
                        ภาพไอคอนเข้าถึงระบบ
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
                    label="ภาพไอคอนเข้าถึงระบบ"
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                    style={{ width: "90%" }}>
                    <Upload
                      beforeUpload={beforeUpload}
                      listType="picture"
                      multiple={false}
                      maxCount={1}
                      accept="image/png, image/jpeg">
                      <Button icon={<Icons.Upload size={16} />}>Upload</Button>
                    </Upload>
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
