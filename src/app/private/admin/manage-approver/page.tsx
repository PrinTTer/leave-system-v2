"use client";
import { useEffect, useState } from "react";
import {
  Button,
  Col,
  Form,
  Input,
  Pagination,
  PaginationProps,
  Row,
  Space,
  Table,
  Typography,
  Tooltip,
  Breadcrumb,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import * as Icons from "lucide-react";

import { getApproverList } from "@/services/approverApi";

const PAGE_SIZE = 10;
export default function UserIndexPage() {
  const { Title } = Typography;
  const [form] = Form.useForm();
  const router = useRouter();

  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [users, setUsers] = useState<ApproverList>({
    data: [],
    page: 1,
    totalPage: 1,
    limit: PAGE_SIZE,
    totalCount: 0,
  });

  const [currentSearch, setCurrentSearch] = useState({
    thaiName: "",
    department: "",
    position: "",
  });

  const columns: ColumnsType<Approver> = [
    {
      title: "ชื่อ",
      key: "thaiName",
      align: "left",
      sorter: (a: Approver, b: Approver) =>
        (a.thaiName || "").localeCompare(b.thaiName || ""),
      render: (_text: unknown, record: Approver) =>
        `${record.academicPosition ? record.academicPosition + " " : ""}${
          record.thaiName
        }`,
    },
    {
      title: "ตำแหน่ง",
      dataIndex: "position",
      key: "position",
      align: "left",
      sorter: (a: Approver, b: Approver) =>
        (a.position || "").localeCompare(b.position || ""),
    },
    {
      title: "ตำแหน่งอนุมัติ",
      dataIndex: "positionApprover",
      key: "positionApprover",
      align: "left",
      sorter: (a: Approver, b: Approver) =>
        (a.positionApprover || "").localeCompare(b.positionApprover || ""),
    },
    {
      title: "ลำดับ",
      key: "level",
      align: "center",
      sorter: (a: Approver, b: Approver) =>
        (a.level?.length || 0) - (b.level?.length || 0),
      render: (_text: unknown, record: Approver) =>
        record.level?.join(", ") || "-",
    },
    {
      title: "การจัดการ",
      key: "actions",
      align: "center",
      width: "20%",
      render: (_text: unknown, record: Approver) => (
        <Space size="middle">
          <Tooltip title="แก้ไข">
            <Icons.Edit
              size={18}
              style={{ cursor: "pointer" }}
              onClick={() =>
                router.push(`/private/admin/manage-approver/${record.id}`)
              }
            />
          </Tooltip>
          <Tooltip title="ลบ">
            <Icons.Trash2
              size={18}
              style={{ cursor: "pointer", color: "red" }}
              onClick={() => {
                console.log("delete", record.id);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // 🔁 ดึงจาก backend ผ่าน service
  const fetchUsers = async () => {
    setTableLoading(true);
    try {
      // ⬇️ list จาก backend (array ตรง ๆ)
      const list = await getApproverList(); // list: Approver[]

      // ✅ filter ฝั่ง client ตาม search
      const thaiNameSearch = currentSearch.thaiName.trim().toLowerCase();
      const deptSearch = currentSearch.department.trim().toLowerCase();
      const positionSearch = currentSearch.position.trim().toLowerCase();

      const filtered = list.filter((item) => {
        const matchThaiName = thaiNameSearch
          ? item.thaiName.toLowerCase().includes(thaiNameSearch)
          : true;

        const matchDept = deptSearch
          ? (item.department || "").toLowerCase().includes(deptSearch)
          : true;

        const matchPosition = positionSearch
          ? (item.position || "").toLowerCase().includes(positionSearch)
          : true;

        return matchThaiName && matchDept && matchPosition;
      });

      // 📄 คำนวณ pagination ฝั่ง client
      const totalCount = filtered.length;
      const totalPage = Math.ceil(totalCount / PAGE_SIZE) || 1;

      const safePage =
        currentPage > totalPage
          ? totalPage
          : currentPage < 1
          ? 1
          : currentPage;

      const startIndex = (safePage - 1) * PAGE_SIZE;
      const pageData = filtered.slice(startIndex, startIndex + PAGE_SIZE);

      const data: ApproverList = {
        data: pageData,
        page: safePage,
        totalPage,
        limit: PAGE_SIZE,
        totalCount,
      };

      setUsers(data);
    } catch (error) {
      console.error("fetchUsers error: ", error);
    } finally {
      setTableLoading(false);
    }
  };

  const onPageChange: PaginationProps["onChange"] = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const onSearch = () => {
    setCurrentSearch({
      thaiName: form.getFieldValue("thaiName") || "",
      department: form.getFieldValue("department") || "",
      position: form.getFieldValue("position") || "",
    });
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, currentSearch]);

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" style={{ width: "100%" }} size={10}>
        <Row>
          <Col span={12}>
            <Title
              style={{
                marginTop: 0,
                marginBottom: 0,
                fontSize: 18,
              }}
            >
              {"ผู้อนุมัติ"}
            </Title>
          </Col>
        </Row>
        <Breadcrumb
          items={[
            {
              title: (
                <a
                  onClick={() => {
                    router.push(`/private/admin/manage-approval`);
                  }}
                >
                  ผู้อนุมัติ
                </a>
              ),
            },
          ]}
        />
        <div className="chemds-container">
          <Row style={{ marginBottom: "1%" }}>
            <Col span={16}>
              <Form layout="inline" form={form}>
                <Col>
                  <Form.Item name="thaiName">
                    <Input placeholder="ชื่อ-นามสกุล" allowClear />
                  </Form.Item>
                </Col>
                <Col>
                  <Form.Item name="department">
                    <Input placeholder="สังกัด" allowClear />
                  </Form.Item>
                </Col>
                <Col>
                  <Form.Item name="position">
                    <Input placeholder="ตำแหน่ง" allowClear />
                  </Form.Item>
                </Col>
                <Col>
                  <Button
                    className="chemds-button"
                    type="primary"
                    onClick={onSearch}
                  >
                    ค้นหา
                  </Button>
                </Col>
              </Form>
            </Col>
            <Col
              span={8}
              style={{ display: "flex", justifyContent: "right" }}
            >
              <Button
                className="chemds-button"
                type="primary"
                onClick={() => {
                  setTableLoading(true);
                  router.push(`/private/admin/manage-approver/add`);
                }}
              >
                เพิ่ม
              </Button>
            </Col>
          </Row>
          <Row style={{ marginBottom: "1%" }}>
            <Col span={24}>
              <Table
                columns={columns}
                rowKey={(record) => record.id}
                dataSource={users.data}
                style={{ width: "100%" }}
                pagination={false}
                bordered
                loading={tableLoading}
              />
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Pagination
                current={users.page || currentPage}
                total={users.totalCount}
                showSizeChanger={false}
                pageSize={PAGE_SIZE}
                onChange={onPageChange}
              />
            </Col>
          </Row>
        </div>
      </Space>
    </div>
  );
}
