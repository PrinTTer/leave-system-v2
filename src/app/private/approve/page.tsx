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
  TableProps,
  Typography,
  Tooltip,
} from "antd";
import { useRouter } from "next/navigation";
import * as Icons from "lucide-react";

export default function SystemIndexPage() {
  const { Title } = Typography;
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [systems, setSystems] = useState<SystemList>({
    data: [],
    page: 0,
    totalPage: 1,
    limit: 0,
    totalCount: 0,
  });
  const [currentSearch, setcurrentSearch] = useState({
    thaiName: "",
    englishName: "",
  });

const columns: TableProps["columns"] = [
  {
    title: "ชื่อผู้ขออนุมัติลา ภาษาไทย",
    dataIndex: "user",
    key: "thaiName",
    align: "center",
    sorter: (a, b) => a.user.thaiName.localeCompare(b.user.thaiName), // เรียงตามชื่อภาษาไทย
    sortDirections: ["ascend", "descend"],
    render: (user) => user.thaiName,
  },
  {
    title: "ประเภทการลา",
    dataIndex: "leaveCategory",
    key: "leaveCategory",
    align: "center",
    sorter: (a, b) => a.leaveCategory.localeCompare(b.leaveCategory), // เรียงตามประเภทการลา
    sortDirections: ["ascend", "descend"],
    render: (_, record) => {
      if (record.leaveCategory === "ลาทั่วไป" && record.leaveGeneral?.length) {
        return record.leaveGeneral[0].leaveType; // แสดง leaveType เช่น ลาคลอดบุตร
      }
      if (record.leaveCategory === "ลาราชการต่างประเทศ" && record.leaveGeneral?.length) {
        return record.leaveCategory; // แถวแรกแสดง ลาราชการต่างประเทศ
      }
      return record.leaveCategory;
    },
  },
  {
    title: "วันที่เริ่มขอลา",
    dataIndex: "startDate",
    key: "startDate",
    align: "center",
    sorter: (a, b) => {
      const aStart = a.leaveGeneral?.[0]?.startDate || a.leaveOfficial?.[0]?.startDate || a.leaveOverseas?.[0]?.startDate || "";
      const bStart = b.leaveGeneral?.[0]?.startDate || b.leaveOfficial?.[0]?.startDate || b.leaveOverseas?.[0]?.startDate || "";
      return new Date(aStart).getTime() - new Date(bStart).getTime();
    }, // เรียงตามวันที่เริ่มลาจากข้อมูล
    sortDirections: ["ascend", "descend"],
    render: (_, record) => {
      if (record.leaveGeneral?.length) return record.leaveGeneral[0].startDate || "-";
      if (record.leaveOfficial?.length) return record.leaveOfficial[0].startDate || "-";
      if (record.leaveOverseas?.length) return record.leaveOverseas[0].startDate || "-";
      return "-";
    },
  },
  {
    title: "วันที่สิ้นสุดการลา",
    dataIndex: "endDate",
    key: "endDate",
    align: "center",
    sorter: (a, b) => {
      const aEnd = a.leaveGeneral?.[a.leaveGeneral.length - 1]?.endDate || a.leaveOfficial?.[0]?.endDate || a.leaveOverseas?.[0]?.endDate || "";
      const bEnd = b.leaveGeneral?.[b.leaveGeneral.length - 1]?.endDate || b.leaveOfficial?.[0]?.endDate || b.leaveOverseas?.[0]?.endDate || "";
      return new Date(aEnd).getTime() - new Date(bEnd).getTime();
    }, // เรียงตามวันที่สิ้นสุดจากข้อมูล
    sortDirections: ["ascend", "descend"],
    render: (_, record) => {
      if (record.leaveGeneral?.length) return record.leaveGeneral[record.leaveGeneral.length - 1].endDate || "-";
      if (record.leaveOfficial?.length) return record.leaveOfficial[0].endDate || "-";
      if (record.leaveOverseas?.length) return record.leaveOverseas[0].endDate || "-";
      return "-";
    },
  },
  {
    title: "ลา (วัน)",
    dataIndex: "days",
    key: "days",
    align: "center",
    sorter: (a, b) => {
      const aStart = a.leaveGeneral?.[0]?.startDate || a.leaveOfficial?.[0]?.startDate || a.leaveOverseas?.[0]?.startDate || "";
      const aEnd = a.leaveGeneral?.[a.leaveGeneral.length - 1]?.endDate || a.leaveOfficial?.[0]?.endDate || a.leaveOverseas?.[0]?.endDate || "";
      const bStart = b.leaveGeneral?.[0]?.startDate || b.leaveOfficial?.[0]?.startDate || b.leaveOverseas?.[0]?.startDate || "";
      const bEnd = b.leaveGeneral?.[b.leaveGeneral.length - 1]?.endDate || b.leaveOfficial?.[0]?.endDate || b.leaveOverseas?.[0]?.endDate || "";
      const aDays = (!aStart || !aEnd) ? 0 : Math.ceil(Math.abs(new Date(aEnd).getTime() - new Date(aStart).getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const bDays = (!bStart || !bEnd) ? 0 : Math.ceil(Math.abs(new Date(bEnd).getTime() - new Date(bStart).getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return aDays - bDays;
    }, // เรียงตามจำนวนวันจากข้อมูล
    sortDirections: ["ascend", "descend"],
    render: (_, record) => {
      const start = record.leaveGeneral?.[0]?.startDate || record.leaveOfficial?.[0]?.startDate || record.leaveOverseas?.[0]?.startDate;
      const end = record.leaveGeneral?.[record.leaveGeneral.length - 1]?.endDate || record.leaveOfficial?.[0]?.endDate || record.leaveOverseas?.[0]?.endDate;
      if (!start || !end) return 0;
      const startDate = new Date(start);
      const endDate = new Date(end);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    },
  },
  {
    title: "การจัดการ",
    key: "actions",
    align: "center",
    render: (_, record) => (
      <Space>
        <Tooltip title="อนุมัติ">
          <Icons.CheckCircle
            onClick={() => console.log("Approved", record.id)}
            style={{ cursor: "pointer", color: "green" }}
          />
        </Tooltip>
        <Tooltip title="ไม่อนุมัติ">
          <Icons.XCircle
            onClick={() => console.log("Rejected", record.id)}
            style={{ cursor: "pointer", color: "red" }}
          />
        </Tooltip>
        <Tooltip title="ดูข้อมูลการขอลา">
          <Icons.FileText
            onClick={() => console.log("View Details", record.id)}
            style={{ cursor: "pointer", color: "blue" }}
          />
        </Tooltip>
      </Space>
    ),
  },
];

  const fetchSystem = async () => {
    try {
      const data: SystemList = {
        data: [
          {
            id: 1,
            user: {
              id: 1,
              pronuon: "นางสาว",
              thaiName: "วรัญญา ศรีสุข",
              englishName: "Waranya Srisuk",
              department: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
              position: "อาจารย์ภาควิชาวิศวกรรมคอมพิวเตอร์",
            },
            leaveCategory: "ลาทั่วไป",
            leaveGeneral: [
              {
                id: 1,
                leaveType: "ลาคลอดบุตร",
                des: "xxxx",
                file: null,
                startDate: "2025-09-29",
                endDate: "2026-03-30",
              },
            ],
            leaveOfficial: null,
            leaveOverseas: null,
            status: "รออนุมัติ",
            updatedAt: 1757570222,
            createdAt: 1757570223,
          },
          {
            id: 2,
            user: {
              id: 2,
              pronuon: "นาย",
              thaiName: "กันตพงษ์ กลางเมือง",
              englishName: "Kanthapong Klangmuang",
              department: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
              position: "อาจารย์ภาควิชาวิศวกรรมคอมพิวเตอร์",
            },
            leaveCategory: "ลาราชการ",
            leaveGeneral: null,
            leaveOfficial: [
              {
                id: 1,
                des: "xxxx",
                file: null,
                followers: [
                  {
                    id: 1,
                    pronuon: "นางสาว",
                    thaiName: "วรัญญา ศรีสุข",
                    englishName: "Waranya Srisuk",
                    department: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
                    position: "อาจารย์ภาควิชาวิศวกรรมคอมพิวเตอร์",
                  },
                  {
                    id: 2,
                    pronuon: "นาย",
                    thaiName: "กันตพงษ์ กลางเมือง",
                    englishName: "Kanthapong Klangmuang",
                    department: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
                    position: "อาจารย์ภาควิชาวิศวกรรมคอมพิวเตอร์",
                  },
                  {
                    id: 3,
                    pronuon: "นางสาว",
                    thaiName: "กนกพร ปราบนที",
                    englishName: "Kanokporn Prabnatee",
                    department: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
                    position: "อาจารย์ภาควิชาวิศวกรรมคอมพิวเตอร์",
                  },
                ],
                startDate: "2025-10-03",
                endDate: "2025-10-05",
              },
            ],
            leaveOverseas: null,
            status: "รออนุมัติ",
            updatedAt: 1757570222,
            createdAt: 1757570223,
          },
          {
            id: 3,
            user: {
              id: 3,
              pronuon: "นางสาว",
              thaiName: "กนกพร ปราบนที",
              englishName: "Kanokporn Prabnatee",
              department: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
              position: "อาจารย์ภาควิชาวิศวกรรมคอมพิวเตอร์",
            },
            leaveCategory: "ลาราชการต่างประเทศ",
            leaveGeneral: [
              {
                id: 1,
                leaveType: "ลากิจส่วนตัว",
                des: "xxxx",
                file: null,
                startDate: "2025-10-23",
                endDate: "2025-10-24",
              },
              {
                id: 2,
                leaveType: "ลาพักผ่อน",
                des: "xxxx",
                file: null,
                startDate: "2025-10-25",
                endDate: "2025-10-26",
              },
            ],
            leaveOfficial: null,
            leaveOverseas: [
              {
                id: 1,
                country: "France",
                des: "xxxx",
                file: null,
                follower: [
                  {
                    id: 4,
                    pronuon: "นาย",
                    thaiName: "ธีรธรณ์ กลางเมือง",
                    englishName: "Teerathorn Klangmuang",
                    department: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
                    position: "อาจารย์ภาควิชาวิศวกรรมคอมพิวเตอร์",
                  },
                ],
                startDate: "2025-10-20",
                endDate: "2025-10-22",
              },
            ],
            status: "รออนุมัติ",
            updatedAt: 1757570222,
            createdAt: 1757570223,
          },
        ],
        page: 1,
        totalPage: 1,
        limit: 10,
        totalCount: 4, // ปรับ totalCount เป็น 4 เพราะจะมีแถวเพิ่ม
      };

      // แปลงข้อมูลให้รวมแถว "ลาราชการต่างประเทศ" และแยกประเภทย่อย
      const transformedData = data.data.flatMap(item => {
        if (item.leaveCategory === "ลาราชการต่างประเทศ" && item.leaveOverseas?.length && item.leaveGeneral?.length) {
          // แถวแรกสำหรับ "ลาราชการต่างประเทศ" ใช้ข้อมูลจาก leaveOverseas
          const baseRow = {
            ...item,
            id: `${item.id}-0`,
            leaveCategory: item.leaveCategory,
            startDate: item.leaveOverseas[0].startDate,
            endDate: item.leaveOverseas[0].endDate,
            leaveGeneral: [],
          };
          // แถวสำหรับประเภทย่อยจาก leaveGeneral
          const generalRows = item.leaveGeneral.map((leave, index) => ({
            ...item,
            id: `${item.id}-${index + 1}`,
            leaveCategory: `${leave.leaveType}(ต่อลาราชการต่างประเทศ)`,
            startDate: leave.startDate,
            endDate: leave.endDate,
            leaveGeneral: [leave],
            leaveOverseas: [],
          }));
          return [baseRow, ...generalRows];
        }
        return [item];
      });

      setSystems({ ...data, data: transformedData });
      setLoading(false);
      setTableLoading(false);
    } catch (error) {
      console.log("error: ", error);
      setLoading(false);
      setTableLoading(false);
    }
  };

  const onPageChange: PaginationProps["onChange"] = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const onSearch = () => {
    setcurrentSearch({
      thaiName: form.getFieldValue("thaiName"),
      englishName: form.getFieldValue("englishName"),
    });
    setCurrentPage(1);
  };

  const onChange: TableProps["onChange"] = (pagination, filters, sorter, extra) => {
    console.log("params", pagination, filters, sorter, extra);
  };

  useEffect(() => {
    setTableLoading(true);
    fetchSystem();
  }, [currentPage, currentSearch]);

  return (
    <>
      <div style={{ padding: 10 }}>
        <Space direction="vertical" style={{ width: "100%" }} size={10}>
          <Row>
            <Col span={12}>
              <Title
                style={{
                  marginTop: 0,
                  marginBottom: 0,
                  fontSize: 18,
                }}>
                {"อนุมัติการลา"}
              </Title>
            </Col>
          </Row>
          <div className="chemds-container">
            <Row style={{ marginBottom: "1%" }}>
              <Col span={16}>
                <Form layout="inline" form={form}>
                  <Col>
                    <Form.Item name="thaiName">
                      <Input placeholder="ชื่อภาษาไทย" allowClear />
                    </Form.Item>
                  </Col>
                  <Col>
                    <Form.Item name="shortName">
                      <Input placeholder="ชื่อย่อ" allowClear />
                    </Form.Item>
                  </Col>
                  <Col>
                    <Button
                      className="chemds-button"
                      type="primary"
                      onClick={() => {
                        onSearch();
                      }}>
                      ค้นหา
                    </Button>
                  </Col>
                </Form>
              </Col>
              {/* <Col
                span={8}
                style={{ display: "flex", justifyContent: "right" }}>
                <Button
                  className="chemds-button"
                  type="primary"
                  onClick={() => {
                    setLoading(true);
                    router.push(`/private/system/new`);
                  }}>
                  เพิ่ม
                </Button>
              </Col> */}
            </Row>
            <Row style={{ marginBottom: "1%" }}>
              <Col span={24}>
                <Table
                  columns={columns}
                  rowKey={(record) => record.id}
                  dataSource={systems.data}
                  onChange={onChange}
                  style={{ width: "100%" }}
                  pagination={false}
                  bordered
                  loading={tableLoading}
                  showSorterTooltip={{ target: "sorter-icon" }}
                />
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Pagination
                  defaultCurrent={1}
                  total={systems.totalCount}
                  showSizeChanger={false}
                  pageSize={10}
                  onChange={onPageChange}
                  align="end"
                />
              </Col>
            </Row>
          </div>
        </Space>
      </div>
    </>
  );
}