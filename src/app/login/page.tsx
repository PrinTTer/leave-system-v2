"use client";
import {
  Button,
  Card,
  Col,
  Form,
  Image,
  Input,
  Row,
  Typography,
  message,
} from "antd";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import * as dataprovider from "@/dataprovider";
import { getSession, setSession } from "../../session";
import { Role } from "../utils/constants";
import { LoadingLoginPage } from "../components/Loading-login";

//import * as API from "@/api";
//import { setSession } from "../../../session";
//import { useUser } from "../../contexts/userContext";

type FieldType = {
  username?: string;
  password?: string;
};

type LoginType = {
  username: string;
  password: string;
};

export default function UserLoginPage() {
  const { Title } = Typography;
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  //const { setUserDetails } = useUser();

  const handleLogin = async (values: LoginType) => {
    setLoading(true);
    const { username, password } = values;
    try {
      const resLoginTokenData = await dataprovider.getLoginToken({
        username: username,
        password: password,
      });

      if (resLoginTokenData.status !== "success") {
        throw resLoginTokenData.errorMsg;
      }

      await setSession({
        token: resLoginTokenData.data.accessToken,
        user: "",
      });

      const resProfileData = await dataprovider.getProfile();

      if (resProfileData.status !== "success") {
        throw resProfileData.errorMsg;
      }

      await setSession({
        token: resLoginTokenData.data.accessToken,
        user: resProfileData.data,
      });

      if (resProfileData.data.role === Role.Admin) {
        messageApi.open({
          type: "success",
          content: "เข้าสู่ระบบสำเร็จ",
        });
        router.push("/admin/organism");
      } else if (resProfileData.data.role === Role.User) {
        messageApi.open({
          type: "success",
          content: "เข้าสู่ระบบสำเร็จ",
        });
        router.push("/user/data");
      } else {
        throw "No permission to login!";
      }
    } catch (e) {
      console.log(e);
      messageApi.open({
        type: "error",
        content: "เข้าสู่ระบบไม่สำเร็จ โปรดลองอีกครั้ง",
      });
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        {contextHolder}
        <LoadingLoginPage height={500} width={500} />
      </>
    );
  }

  return (
    <>
      {contextHolder}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}>
        <Col
          span={24}
          style={{
            display: "flex",
            justifyContent: "center",
            alignContent: "center",
          }}>
          <div className="chemds-container-login">
            <Row>
              <Col span={12}>
                <div style={styles.coverPhoto}></div>
              </Col>
              <Col span={12}>
                <Form
                  name="login"
                  style={{ width: "100%", paddingLeft: 50, paddingRight: 50 }}
                  autoComplete="off"
                  layout="vertical"
                  onFinish={handleLogin}>
                  <Title style={{ marginBottom: 0 }} level={3}>
                    {"Plant Germplasm CMS"}
                  </Title>
                  <Form.Item<FieldType>
                    label="Username"
                    name="username"
                    rules={[{ required: true, message: "โปรดระบุ Username!" }]}>
                    <Input />
                  </Form.Item>

                  <Form.Item<FieldType>
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: "โปรดระบุ Password!" }]}>
                    <Input.Password />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="default"
                      htmlType="submit"
                      style={{
                        width: "100%",
                        backgroundColor: "black",
                        color: "white",
                      }}>
                      {"Login"}
                    </Button>
                  </Form.Item>
                </Form>
              </Col>
            </Row>
          </div>
        </Col>
      </div>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  coverPhoto: {
    height: "100%",
    width: "100%",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundImage: `url(/pgsm-cms/images/bg1.jpg)`,
    backgroundPosition: "center",
  },
};
