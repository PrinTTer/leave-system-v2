"use client";
import { useEffect, useState } from "react";
import {
  Button,
  Col,
  Form,
  Row,
  Space,
  Typography,
  Select,
  Table,
  Tooltip,
  Input,
  Checkbox,
} from "antd";
import { useRouter } from "next/navigation";
import * as Icons from "lucide-react";

export default function NewUserPage() {
  const { Title } = Typography;
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);

  const fetchNewUser = async () => {
    const mockData = [
      {
        id: 1,
        academicPosition: "รศ.ดร.",
        pronuon: "นางสาว",
        thaiName: "วรัญญา ศรีสุข",
        englishName: "Waranya Srisuk",
        department: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
        position: "อาจารย์ภาควิชาวิศวกรรมคอมพิวเตอร์",
      },
      {
        id: 2,
        academicPosition: "ร้อยตรี",
        pronuon: "นาย",
        thaiName: "กันตพงษ์ กลางเมือง",
        englishName: "Kanthapong Klangmuang",
        department: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
        position: "อาจารย์ภาควิชาวิศวกรรมคอมพิวเตอร์",
      },
      {
        id: 3,
        academicPosition: null,
        pronuon: "นางสาว",
        thaiName: "บัวบาน ศรีสุข",
        englishName: "Buaban Srisuk",
        department: "คณะวิศวกรรมศาสตร์",
        position: "เลขานุการคณะ",
      },
      {
        id: 4,
        academicPosition: "ดร.",
        pronuon: "นางสาว",
        thaiName: "กนกพร ปราบนที",
        englishName: "Kanokporn Prabnatee",
        department: "คณะวิศวกรรมศาสตร์",
        position: "อธิการบดี",
      },
    ];

    setAllUsers(mockData);
    // default เลือกสังกัดแรก
    setSelectedDept(mockData[0].department);
    setFilteredUsers(mockData.filter((u) => u.department === mockData[0].department));
    setLoading(false);
  };

  useEffect(() => {
    fetchNewUser();
  }, []);

  // ดึงชื่อ unique department
  const departments = Array.from(new Set(allUsers.map((u) => u.department)));

  // handle add user เข้า selectedUsers
  const addUser = (user: any) => {
    setSelectedUsers((prev) => [
      ...prev,
      {
        ...user,
        positionApprover: user.position, // default
        level: [], // ลำดับยังไม่เลือก
      },
    ]);
  };

  // table columns
  const columns = [
    {
      title: "ชื่อ",
      key: "thaiName",
      render: (_: any, record: any) =>
        `${record.academicPosition ? record.academicPosition + " " : ""}${record.thaiName}`,
    },
    {
      title: "ตำแหน่ง",
      dataIndex: "position",
      key: "position",
    },
    {
      title: "ตำแหน่งอนุมัติ",
      dataIndex: "positionApprover",
      key: "positionApprover",
      render: (_: any, record: any, index: number) => (
        <Input
          value={record.positionApprover}
          onChange={(e) => {
            const value = e.target.value;
            setSelectedUsers((prev) => {
              const updated = [...prev];
              updated[index].positionApprover = value;
              return updated;
            });
          }}
        />
      ),
    },
    {
      title: "ลำดับ",
      dataIndex: "level",
      key: "level",
      render: (_: any, record: any, index: number) => (
        <Checkbox.Group
          options={[1, 2, 3, 4, 5].map((n) => ({ label: n, value: n }))}
          value={record.level}
          onChange={(checkedValues) => {
            setSelectedUsers((prev) => {
              const updated = [...prev];
              updated[index].level = checkedValues;
              return updated;
            });
          }}
        />
      ),
    },
    {
      title: "การจัดการ",
      key: "actions",
      render: (_: any, record: any, index: number) => (
        <Tooltip title="ลบ">
          <Icons.Trash2
            size={18}
            style={{ cursor: "pointer", color: "red" }}
            onClick={() =>
              setSelectedUsers((prev) => prev.filter((_, i) => i !== index))
            }
          />
        </Tooltip>
      ),
    },
  ];

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: 10 }}>
      <Space direction="vertical" style={{ width: "100%" }} size={10}>
        <Row>
          <Col span={24}>
            <Title style={{ marginTop: 0, marginBottom: 0, fontSize: 18 }}>
              {"เพิ่มผู้อนุมัติ"}
            </Title>
          </Col>
        </Row>

        <div className="chemds-container">
          {/* Select controls */}
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <b>สังกัด: </b>
              <Select
                style={{ width: "100%" }}
                value={selectedDept}
                options={departments.map((d) => ({ value: d, label: d }))}
                onChange={(value) => {
                  setSelectedDept(value);
                  setFilteredUsers(allUsers.filter((u) => u.department === value));
                }}
              />
            </Col>
            <Col span={8}>
              <b>ชื่อ: </b>
              <Select
                style={{ width: "100%" }}
                placeholder="เลือกชื่อ"
                options={filteredUsers.map((u) => ({
                  value: u.id,
                  label: (
                    <Space>
                      {`${u.academicPosition ? u.academicPosition + " " : ""}${u.thaiName}`}
                      <Icons.PlusCircle
                        size={16}
                        style={{ cursor: "pointer", color: "green" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          addUser(u);
                        }}
                      />
                    </Space>
                  ),
                }))}
              />
            </Col>
          </Row>

          {/* Table of selected users */}
          <Table
            rowKey="id"
            columns={columns}
            dataSource={selectedUsers}
            pagination={false}
            bordered
          />

          <Row style={{ justifyContent: "space-between", marginTop: 15 }}>
            <Col>
              <Button
                className="chemds-button"
                type="default"
                onClick={() => router.push(`/private/admin/manage-approver`)}
              >
                ยกเลิก
              </Button>
            </Col>
            <Col>
              <Button className="chemds-button" type="primary">
                เพิ่ม
              </Button>
            </Col>
          </Row>
        </div>
      </Space>
    </div>
  );
}
