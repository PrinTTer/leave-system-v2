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
  notification,
  Card,
  Tag,
  Table,
} from "antd";
import { useRouter } from "next/navigation";

export default function NewUserPage() {
  const { Title } = Typography;
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [api, contextHolder] = notification.useNotification();

  // ✅ เก็บ mock data ใน state
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);

  const fetchNewUser = async () => {
    try {
      const mockData = [
        {
          id: 1,
          pronuon: "นางสาว",
          thaiName: "วรัญญา ศรีสุข",
          englishName: "Waranya Srisuk",
          department: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
          position: "อาจารย์ภาควิชาวิศวกรรมคอมพิวเตอร์",
          approver: [
            {
              id: 3,
              pronuon: "นางสาว",
              thaiName: "บัวบาน ศรีสุข",
              englishName: "buaban Srisuk",
              department: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
              position: "อาจารย์ภาควิศวกรรมคอมพิวเตอร์",
            },
            {
              id: 4,
              pronuon: "นางสาว",
              thaiName: "กนกพร ปราบนที",
              englishName: "Kanokporn Prabnatee",
              department: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
              position: "อาจารย์ภาควิศวกรรมคอมพิวเตอร์",
            },
          ],
          updatedAt: "2025-07-03T10:15:23Z",
          createdAt: "2025-07-03T10:15:23Z",
        },
        {
          id: 2,
          pronuon: "นาย",
          thaiName: "กันตพงษ์ กลางเมือง",
          englishName: "Kanthapong Klangmuang",
          department: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
          position: "อาจารย์ภาควิชาวิศวกรรมคอมพิวเตอร์",
          updatedAt: "2025-07-03T10:17:45Z",
          createdAt: "2025-07-03T10:15:23Z",
        },
        {
          id: 3,
          pronuon: "นางสาว",
          thaiName: "บัวบาน ศรีสุข",
          englishName: "buaban Srisuk",
          department: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
          position: "อาจารย์ภาควิศวกรรมคอมพิวเตอร์",
          updatedAt: "2025-07-03T10:18:12Z",
          createdAt: "2025-07-03T10:15:23Z",
        },
        {
          id: 4,
          pronuon: "นางสาว",
          thaiName: "กนกพร ปราบนที",
          englishName: "Kanokporn Prabnatee",
          department: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
          position: "อาจารย์ภาควิศวกรรมคอมพิวเตอร์",
          updatedAt: "2025-07-03T10:20:08Z",
          createdAt: "2025-07-03T10:15:23Z",
        },
      ];

      setUser(mockData[0]); // ✅ default user
      setAllUsers(mockData); // ✅ เก็บไว้ใน state
      setFilteredUsers(mockData); // ✅ ใช้ค่าเริ่มต้นเป็นทั้งหมด
    } catch (error) {
      console.log("error: ", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNewUser();
  }, []);

  if (loading || !user) {
    return (
      <>
        {contextHolder}
        <Skeleton active />
      </>
    );
  }

  return (
    <div style={{ padding: 10 }}>
      <Space direction="vertical" style={{ width: "100%" }} size={10}>
        <Row>
          <Col span={24}>
            <Title style={{ marginTop: 0, marginBottom: 0, fontSize: 18 }}>
              {"เพิ่มผู้ใต้บังคับบัญชา"}
            </Title>
          </Col>
        </Row>

        <Card title="ข้อมูลส่วนบุคคล" style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <b>คำนำหน้า:</b> {user.pronuon}
            </Col>
            <Col span={8}>
              <b>ชื่อ:</b> {user.thaiName}
            </Col>
            <Col span={8}>
              <b>นามสกุล:</b>{" "}
              {user.englishName?.split(" ").slice(1).join(" ")}
            </Col>
            <Col span={8}>
              <b>ตำแหน่ง:</b> {user.position}
            </Col>
            <Col span={8}>
              <b>หน่วยงาน:</b> {user.department}
            </Col>
            <Col span={8}>
              <b>วันเกิด:</b> -
            </Col>
            <Col span={8}>
              <b>วันที่บรรจุ:</b> -
            </Col>
            <Col span={8}>
              <b>ระดับ:</b> -
            </Col>
          </Row>
        </Card>

        <div className="chemds-container">
          <Form layout="vertical" form={form} style={{ maxWidth: "none" }}>
            <Row gutter={16}>
              {/* Col ซ้าย : ตารางผู้ใช้ */}
              <Col span={16}>
                <Input.Search
                  placeholder="ค้นหาชื่อ"
                  allowClear
                  onSearch={(value) => {
                    const filtered = allUsers.filter(
                      (u) =>
                        u.thaiName.includes(value) ||
                        u.englishName.includes(value)
                    );
                    setFilteredUsers(filtered);
                  }}
                  style={{ marginBottom: 12 }}
                />
                <Table
                  rowKey="id"
                  rowSelection={{
                    selectedRowKeys: selectedUsers.map((u) => u.id),
                    onChange: (selectedRowKeys, selectedRows) => {
                      setSelectedUsers(selectedRows);
                    },
                  }}
                  columns={[
                    { title: "ชื่อ", dataIndex: "thaiName" },
                    { title: "ตำแหน่ง", dataIndex: "position" },
                    { title: "สังกัด", dataIndex: "department" },
                  ]}
                  dataSource={filteredUsers}
                  pagination={false}
                  size="small"
                />
              </Col>

              {/* Col ขวา : รายชื่อที่เลือก */}
              <Col span={8}>
                <Card title="ผู้ที่เลือกแล้ว">
                  <Space wrap>
                    {selectedUsers.map((u) => (
                      <Tag
                        key={u.id}
                        closable
                        onClose={() => {
                          setSelectedUsers((prev) =>
                            prev.filter((p) => p.id !== u.id)
                          );
                        }}
                      >
                        {u.thaiName}
                      </Tag>
                    ))}
                  </Space>
                </Card>
              </Col>
            </Row>

            <Row style={{ justifyContent: "space-between", marginTop: 15 }}>
              <Col>
                <Button
                  className="chemds-button"
                  type="default"
                  onClick={() =>
                    router.push(`/private/admin/manage-approver`)
                  }
                >
                  ยกเลิก
                </Button>
              </Col>
              <Col>
                <Button
                  className="chemds-button"
                  type="primary"
                  htmlType="submit"
                >
                  เพิ่ม
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
      </Space>
    </div>
  );
}
