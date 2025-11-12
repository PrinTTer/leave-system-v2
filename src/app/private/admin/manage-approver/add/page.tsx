"use client";
import { useEffect, useState } from "react";
import {
  Button,
  Col,
  Row,
  Space,
  Typography,
  Select,
  Table,
  Tooltip,
  Input,
  Checkbox,
  Breadcrumb,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import * as Icons from "lucide-react";

const { Title } = Typography;

interface User {
  id: number;
  academicPosition?: string | null;
  pronuon?: string;
  thaiName: string;
  englishName?: string;
  department?: string;
  position?: string;
}

interface SelectedUser extends User {
  positionApprover: string;
  level: number[];
}

export default function NewUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);
  const [selectedNameId, setSelectedNameId] = useState<number | null>(null);

  const fetchNewUser = async () => {
    const mockData: User[] = [
      {
        id: 1,
        academicPosition: "รศ.ดร.",
        pronuon: "นางสาว",
        thaiName: "วรัญญา ศรีสุข",
        englishName: "Waranya Srisuk",
        department: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
        position: "หัวหน้าภาค",
      },
      {
        id: 2,
        academicPosition: "ร้อยตรี",
        pronuon: "นาย",
        thaiName: "กันตพงษ์ กลางเมือง",
        englishName: "Kanthapong Klangmuang",
        department: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
        position: "รองหัวหน้าภาค",
      },
      {
        id: 3,
        academicPosition: null,
        pronuon: "นางสาว",
        thaiName: "บัวบาน ศรีสุข",
        englishName: "Buaban Srisuk",
        department: "คณะวิศวกรรมคอมพิวเตอร์",
        position: "เลขานุการคณะ",
      },
      {
        id: 4,
        academicPosition: "ดร.",
        pronuon: "นางสาว",
        thaiName: "กนกพร ปราบนที",
        englishName: "Kanokporn Prabnatee",
        department: "คณะวิศวกรรมคอมพิวเตอร์",
        position: "อธิการบดี",
      },
    ];

    setAllUsers(mockData);
    if (mockData.length > 0) {
      setSelectedDept(mockData[0].department ?? "");
      setFilteredUsers(mockData.filter((u) => u.department === mockData[0].department));
    } else {
      setSelectedDept("");
      setFilteredUsers([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNewUser();
  }, []);

  useEffect(() => {
    // update filtered users when allUsers or selectedDept changes
    setFilteredUsers(allUsers.filter((u) => u.department === selectedDept));
    // reset selected name when dept changes
    setSelectedNameId(null);
  }, [allUsers, selectedDept]);

  const departments = Array.from(new Set(allUsers.map((u) => u.department).filter(Boolean))) as string[];

  const addUser = (userId: number | null) => {
    if (userId == null) return;
    const user = allUsers.find((u) => u.id === userId);
    if (!user) return;

    // avoid duplicate by id
    if (selectedUsers.some((s) => s.id === user.id)) return;

    const newSelected: SelectedUser = {
      ...user,
      positionApprover: user.position ?? "",
      level: [],
    };
    setSelectedUsers((prev) => [...prev, newSelected]);
    // clear selection after add
    setSelectedNameId(null);
  };

  const columns: ColumnsType<SelectedUser> = [
    {
      title: "ชื่อ",
      key: "thaiName",
      render: (_text: unknown, record: SelectedUser) =>
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
      render: (_text: unknown, record: SelectedUser, index: number) => (
        <Input
          value={record.positionApprover}
          onChange={(e) => {
            const value = e.target.value;
            setSelectedUsers((prev) => {
              const copy = prev.map((p) => ({ ...p }));
              copy[index].positionApprover = value;
              return copy;
            });
          }}
        />
      ),
    },
    {
      title: "ลำดับ",
      dataIndex: "level",
      key: "level",
      render: (_text: unknown, record: SelectedUser, index: number) => (
        <Checkbox.Group
          options={[1, 2, 3, 4, 5].map((n) => ({ label: String(n), value: n }))}
          value={record.level}
          onChange={(checkedValues: (string | number)[]) => {
            // convert to number[] (we know values are numbers)
            const nums = (checkedValues as number[]).map((v) => Number(v));
            setSelectedUsers((prev) => {
              const copy = prev.map((p) => ({ ...p }));
              copy[index].level = nums;
              return copy;
            });
          }}
        />
      ),
    },
    {
      title: "การจัดการ",
      key: "actions",
      align: "center",
      render: (_text: unknown, _record: SelectedUser, index: number) => (
        <Tooltip title="ลบ">
          <Icons.Trash2
            size={18}
            style={{ cursor: "pointer", color: "red" }}
            onClick={() => setSelectedUsers((prev) => prev.filter((_, i) => i !== index))}
          />
        </Tooltip>
      ),
    },
  ];

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" style={{ width: "100%" }} size={10}>
        <Row>
          <Col span={24}>
            <Title style={{ marginTop: 0, marginBottom: 0, fontSize: 18 }}>{"เพิ่มผู้อนุมัติ"}</Title>
          </Col>
        </Row>

        <Breadcrumb
          items={[
            {
              title: (
                <a
                  onClick={() => {
                    router.push(`/private/admin/manage-approver`);
                  }}>
                  ผู้อนุมัติ
                </a>
              ),
            },
            { title: "เพิ่ม" },
          ]}
        />

        <div className="chemds-container">
          {/* Select controls */}
          <Row gutter={16} style={{ marginBottom: 16 }} align="middle">
            <Col span={8}>
              <b>สังกัด: </b>
              <Select
                style={{ width: "100%" }}
                value={selectedDept}
                options={departments.map((d) => ({ value: d, label: d }))}
                onChange={(value) => {
                  setSelectedDept(value);
                }}
              />
            </Col>

            <Col span={10}>
              <b>ชื่อ: </b>
              <Select
                style={{ width: "100%" }}
                placeholder="เลือกชื่อ"
                value={selectedNameId ?? undefined}
                options={filteredUsers.map((u) => ({
                  value: u.id,
                  label: `${u.academicPosition ? u.academicPosition + " " : ""}${u.thaiName}`,
                }))}
                onChange={(value) => setSelectedNameId(Number(value))}
              />
            </Col>

            <Col span={6}>
              <Space>
                <Button
                  type="primary"
                  onClick={() => addUser(selectedNameId)}
                  disabled={selectedNameId == null}
                >
                  เพิ่มผู้อนุมัติ
                </Button>
                <Button
                  type="default"
                  onClick={() => {
                    // add all filtered users (avoid duplicates)
                    filteredUsers.forEach((u) => {
                      if (!selectedUsers.some((s) => s.id === u.id)) {
                        addUser(u.id);
                      }
                    });
                  }}
                >
                  เพิ่มทั้งหมด
                </Button>
              </Space>
            </Col>
          </Row>

          {/* Table of selected users */}
          <Table rowKey="id" columns={columns} dataSource={selectedUsers} pagination={false} bordered />

          <Row style={{ justifyContent: "space-between", marginTop: 15 }}>
            <Col>
              <Button className="chemds-button" type="default" onClick={() => router.push(`/private/admin/manage-approver`)}>
                ยกเลิก
              </Button>
            </Col>
            <Col>
              <Button
                className="chemds-button"
                type="primary"
                onClick={() => {
                  // submit selectedUsers to API (placeholder)
                  console.log("submit:", selectedUsers);
                  // navigate back after add
                  router.push(`/private/admin/manage-approver`);
                }}
                disabled={selectedUsers.length === 0}
              >
                เพิ่ม
              </Button>
            </Col>
          </Row>
        </div>
      </Space>
    </div>
  );
}