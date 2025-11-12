'use client';

import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Typography,
  message,
  Skeleton,
  Table,
  Tooltip,
  Tag,
  Breadcrumb,
  Popconfirm
} from 'antd';
import { useRouter, useParams } from 'next/navigation';
import {
  UpOutlined,
  DownOutlined,
  DeleteOutlined,
  PlusOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import {
  deleteLeaveType,
  fetchLeaveTypeById,
  updateLeaveType
} from '@/services/leaveTypeApi';
import { LeaveApprovalRule, LeaveTypeApiItem, LeaveTypeDocument, VacationPerYear } from '@/types/leave';

const genderOptions = [
  { label: 'ชาย', value: 'male' },
  { label: 'หญิง', value: 'female' }
];

const fileTypeOptions = [
  { label: 'pdf', value: 'pdf' },
  { label: 'png', value: 'png' },
  { label: 'jpg', value: 'jpg' },
  { label: 'doc', value: 'doc' }
];

interface VacationRecord {
  key: string | number;
  nameIndex: number;
  field: { name: number };
}

interface columnRow {
  key: string | number;
}

export default function EditVacationLeavePage() {
  const { Title } = Typography;
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);

  /** จำนวนลำดับผู้อนุมัติ */
  const maxApproverCount: number = Form.useWatch('number_approver', form) ?? 0;
  const approverOrders = Array.from({ length: maxApproverCount }, (_, i) => i + 1);

  useEffect(() => {
    const load = async () => {
      try {
        const id = Array.isArray(params.id) ? params.id[0] : params.id;
        const data = await fetchLeaveTypeById(id);
        // console.log("data", data);

        const allowedGenders =
          data.gender === 'all'
            ? ['male', 'female']
            : [data.gender];

        const documents = (data.leave_type_document ?? []).map((d) => ({
          name: d.name,
          file_type: d.file_type,
          is_required: d.is_required,
        }));

        const approval_rules = (data.leave_approval_rule ?? []).map((r) => ({
          leave_less_than: r.leave_less_than,
          approval_level: r.approval_level,
        }));

        const vacation_per_year = (data.vacation_rule ?? []).map((r) => ({
          service_year: r.service_year,
          annual_leave: r.annual_leave,
        }));

        const carry_over = (data.vacation_rule ?? []).map((r) => ({
          service_year: r.service_year,
          max_leave: r.max_leave ?? 0,
        }));

        form.setFieldsValue({
          name: data.name,
          max_leave: data.max_leave,
          gender: allowedGenders,
          service_year: data.service_year,
          is_count_vacation: data.is_count_vacation,
          number_approver: data.number_approver,
          leave_type_document: documents,
          leave_approval_rule: approval_rules,

          vacation_per_year: vacation_per_year,
          carry_over: carry_over,
        });

        setLoading(false);
      } catch {
        message.error('โหลดข้อมูลผิดพลาด');
        router.push('/private/admin/manage-leave');
      }
    };

    load();
  }, [form, params.id, router]);

  const onFinish = async (values: LeaveTypeApiItem) => {
    try {
      const id = Array.isArray(params.id) ? params.id[0] : params.id;

      let gender = 'all';
      if (values.gender?.length === 1) {
        gender = values.gender[0];
      }

      const vacation_per_year = values.vacation_per_year ?? [];
      const carry_over = values.carry_over ?? [];

      const vacation_rule = vacation_per_year.map((r: VacationPerYear, i: number) => ({
      service_year: r.service_year,
      annual_leave: r.annual_leave,
      max_leave: carry_over[i]?.max_leave,
    }));

    const max_annual = vacation_per_year.length > 0
      ? Math.max(...vacation_per_year.map((r: VacationPerYear) => Number(r.annual_leave ?? 0)))
      : (values.max_leave ?? 0);

      const payload: LeaveTypeApiItem = {
        name: values.name,
        max_leave: max_annual,
        gender,
        service_year: values.service_year,
        is_count_vacation: values.is_count_vacation,
        number_approver: values.number_approver,
        category: "vacation",

        leave_type_document: values.leave_type_document?.map((d: LeaveTypeDocument) => ({
          name: d.name,
          file_type: d.file_type,
          is_required: d.is_required,
        })),

        leave_approval_rule: values.leave_approval_rule?.map((r:LeaveApprovalRule) => ({
          leave_less_than: r.leave_less_than,
          approval_level: r.approval_level,
        })),

        vacation_rule: vacation_rule
      };
// console.log("payload update", payload);
      await updateLeaveType(id, payload);
      
      message.success('บันทึกสำเร็จ');
      router.push('/private/admin/manage-leave');
    } catch (e) {
      console.error(e);
      message.error('อัปเดตไม่สำเร็จ');
    }
  };

  const onDelete = async () => {
    try {
      const id = Array.isArray(params.id) ? params.id[0] : params.id;
      await deleteLeaveType(id);
      message.success('ลบสำเร็จ');
      router.push('/private/admin/manage-leave');
    } catch {
      message.error('ลบไม่สำเร็จ');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" style={{ width: '100%' }} size={10}>
        <Title level={4} style={{ margin: 0 }}>
          แก้ไขประเภทลา (ลาพักผ่อน)
        </Title>
        <Breadcrumb
          items={[
            {
              title: (
                <a onClick={() => router.push(`/private/admin/manage-leave`)}>
                  ตั้งค่าประเภทการลา
                </a>
              ),
            },
            { title: "แก้ไข" },
          ]}
        />

        <Card>
          {loading ? (
            <Skeleton active />
          ) : (
            <Form form={form} layout="vertical" onFinish={onFinish}>
              {/* -------- แถว 1: ชื่อ + อายุราชการขั้นต่ำ -------- */}
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="name"
                    label="ชื่อประเภทการลา"
                    rules={[{ required: true, message: 'กรุณาระบุชื่อประเภทการลา' }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="service_year" label="อายุราชการขั้นต่ำในการมีสิทธิ์ (ปี)">
                    <InputNumber min={0} style={{ width: '100%' }} placeholder="เช่น 0 หรือ 1" />
                  </Form.Item>
                </Col>
              </Row>

              {/* -------- แถว 2: เพศ + นับเฉพาะวันทำการ -------- */}
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item label="เพศที่สามารถลาในประเภทนี้ได้">
                    <div>
                      <Form.Item
                        name="gender"
                        noStyle
                        rules={[{ required: true, message: 'กรุณาเลือกเพศ' }]}
                      >
                        <Checkbox.Group options={genderOptions} />
                      </Form.Item>
                    </div>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="is_count_vacation" valuePropName="checked" label=" ">
                    <Checkbox>นับวันลาเฉพาะวันทำการ</Checkbox>
                  </Form.Item>
                </Col>
              </Row>

              {/* ========== ผู้อนุมัติ ========== */}
              <Divider orientation="left">ผู้อนุมัติ (กำหนดเพียงจำนวนสูงสุด)</Divider>
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="number_approver"
                    label="จำนวนผู้อนุมัติสูงสุด"
                    rules={[{ required: true, message: 'กรุณาระบุจำนวนผู้อนุมัติ' }]}
                  >
                    <InputNumber min={1} max={10} style={{ width: '100%' }} placeholder="เช่น 4" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={16}>
                  <Form.Item label="ลำดับผู้อนุมัติที่จะเกิดขึ้น">
                    <div>
                      <Space wrap>
                        {approverOrders.length === 0 ? (
                          <Tag>ยังไม่กำหนด</Tag>
                        ) : (
                          approverOrders.map((n) => (
                            <Tag key={n} color="blue">
                              ลำดับที่ {n}
                            </Tag>
                          ))
                        )}
                      </Space>
                    </div>
                  </Form.Item>
                </Col>
              </Row>

              {/* -------- เอกสารแนบ -------- */}
              <Divider orientation="left">เอกสารแนบที่ต้องส่ง</Divider>
              <Form.List name="leave_type_document">
                {(fields, { add, remove, move }) => {
                  const columns = [
                    {
                      title: 'ชื่อเอกสาร',
                      render: (_value: unknown, _record: columnRow, idx: number) => (
                        <Form.Item
                          name={[fields[idx].name, 'name']}
                          style={{ marginBottom: 0 }}
                          rules={[{ required: true, message: 'ระบุชื่อเอกสาร' }]}
                        >
                          <Input placeholder="เช่น ใบรับรองแพทย์" />
                        </Form.Item>
                      ),
                    },
                    {
                      title: 'ชนิดไฟล์',
                      width: 220,
                      render: (_value: unknown, _record: columnRow, idx: number) => (
                        <Form.Item
                          name={[fields[idx].name, 'file_type']}
                          style={{ marginBottom: 0 }}
                          rules={[{ required: true, message: 'เลือกชนิดไฟล์' }]}
                        >
                          <Select options={fileTypeOptions} placeholder="เลือกชนิดไฟล์" />
                        </Form.Item>
                      ),
                    },
                    {
                      title: 'จำเป็น',
                      width: 120,
                      render: (_value: unknown, _record: columnRow, idx: number) => (
                        <Form.Item
                          name={[fields[idx].name, 'is_required']}
                          valuePropName="checked"
                          style={{ marginBottom: 0 }}
                        >
                          <Checkbox />
                        </Form.Item>
                      ),
                    },
                    {
                      title: 'จัดการ',
                      width: 180,
                      render: (_value: unknown, _record: columnRow, idx: number) => (
                        <Space>
                          <Button
                            size="small"
                            onClick={() => move(fields[idx].name, Math.max(0, fields[idx].name - 1))}
                            disabled={idx === 0}
                          >
                            <ArrowUpOutlined />
                          </Button>
                          <Button
                            size="small"
                            onClick={() =>
                              move(fields[idx].name, Math.min(fields.length - 1, fields[idx].name + 1))
                            }
                            disabled={idx === fields.length - 1}
                          >
                            <ArrowDownOutlined />
                          </Button>
                          <Button size="small" danger onClick={() => remove(fields[idx].name)}>
                            <DeleteOutlined />
                          </Button>
                        </Space>
                      ),
                    },
                  ];
                  const data: columnRow[] = fields.map((f, i) => ({ key: i }));

                  return (
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Table
                        size="small"
                        pagination={false}
                        columns={columns}
                        dataSource={data}
                      />
                      <Button type="dashed" block onClick={() => add({ is_required: false })}>
                        เพิ่มเอกสาร
                      </Button>
                    </Space>
                  );
                }}
              </Form.List>

              {/* ---------------- เงื่อนไขอนุมัติ ---------------- */}
              <Divider orientation="left">เงื่อนไขผู้อนุมัติ</Divider>

              <Form.List name="leave_approval_rule">
                {(fields, { add, remove, move }) => {
                  const columns = [
                    {
                      title: 'ลาน้อยกว่า (วัน)',
                      render: (_value: unknown, _record: columnRow, idx: number) => (
                        <Form.Item
                          name={[fields[idx].name, 'leave_less_than']}
                          style={{ marginBottom: 0 }}
                          rules={[{ required: true, message: 'ระบุจำนวนวัน' }]}
                        >
                          <InputNumber min={1} style={{ width: '100%' }} />
                        </Form.Item>
                      ),
                    },
                    {
                      title: 'ลำดับที่ต้องอนุมัติ',
                      render: (_value: unknown, _record: columnRow, idx: number) => (
                        <Form.Item
                          name={[fields[idx].name, 'approval_level']}
                          style={{ marginBottom: 0 }}
                          rules={[{ required: true, message: 'เลือกอย่างน้อย 1 ค่า' }]}
                        >
                          <Select
                            placeholder="เลือก"
                            options={approverOrders.map((n) => ({ label: `ลำดับที่ ${n}`, value: n }))}
                          />
                        </Form.Item>
                      ),
                    },
                    {
                      title: 'จัดการ',
                      render: (_value: unknown, _record: columnRow, idx: number) => (
                        <Space>
                          <Button size="small" onClick={() => move(idx, idx - 1)} disabled={idx === 0}>
                            <ArrowUpOutlined />
                          </Button>
                          <Button size="small" onClick={() => move(idx, idx + 1)} disabled={idx === fields.length - 1}>
                            <ArrowDownOutlined />
                          </Button>
                          <Button size="small" danger onClick={() => remove(idx)}>
                            <DeleteOutlined />
                          </Button>
                        </Space>
                      ),
                    },
                  ];

                  const data = fields.map((f, i) => ({ key: f.key ?? i }));

                  return (
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Table
                        size="small"
                        pagination={false}
                        columns={columns}
                        dataSource={data}
                      />
                      <Button type="dashed" block onClick={() => add()}>
                        เพิ่มเงื่อนไข
                      </Button>
                    </Space>
                  );
                }}
              </Form.List>

              {/* =================== เงื่อนไขวันลาต่อปี =================== */}
              <Divider orientation="left">เงื่อนไขวันลาพักผ่อนต่อปี</Divider>
              <Form.List name="vacation_per_year">
                {(fields, { add, remove, move }) => {
                  const dataSource = fields.map((f) => ({ key: f.key, nameIndex: f.name, field: f }));
                  const columns = [
                    {
                      title: 'อายุราชการมากกว่า (ปี)',
                      key: 'service_year',
                      render: (_value: unknown, record: VacationRecord) => (
                        <Form.Item
                          name={[record.nameIndex, 'service_year']}
                          rules={[{ required: true, message: 'กรุณาระบุอายุราชการ' }]}
                          style={{ margin: 0 }}
                        >
                          <InputNumber min={0} style={{ width: '100%' }} placeholder="เช่น 1, 10" />
                        </Form.Item>
                      ),
                      width: 240,
                    },
                    {
                      title: 'ได้รับวันลา (วัน/ปี)',
                      key: 'annual_leave',
                      render: (_value: unknown, record: VacationRecord) => (
                        <Form.Item
                          name={[record.nameIndex, 'annual_leave']}
                          rules={[{ required: true, message: 'กรุณาระบุจำนวนวันลา/ปี' }]}
                          style={{ margin: 0 }}
                        >
                          <InputNumber min={0} style={{ width: '100%' }} placeholder="เช่น 10, 20" />
                        </Form.Item>
                      ),
                      width: 220,
                    },
                    {
                      title: 'จัดการ',
                      key: 'actions',
                      align: 'right' as const,
                      render: (_value: unknown, record: VacationRecord) => (
                        <Space>
                          <Tooltip title="ย้ายขึ้น">
                            <Button
                              icon={<UpOutlined />}
                              onClick={() => move(record.field.name, Math.max(0, record.field.name - 1))}
                              disabled={record.field.name === 0}
                            />
                          </Tooltip>
                          <Tooltip title="ย้ายลง">
                            <Button
                              icon={<DownOutlined />}
                              onClick={() =>
                                move(
                                  record.field.name,
                                  Math.min(fields.length - 1, record.field.name + 1),
                                )
                              }
                              disabled={record.field.name === fields.length - 1}
                            />
                          </Tooltip>
                          <Tooltip title="ลบกฎ">
                            <Button danger icon={<DeleteOutlined />} onClick={() => remove(record.field.name)} />
                          </Tooltip>
                        </Space>
                      ),
                      width: 180,
                    },
                  ];

                  return (
                    <>
                      <Table
                        size="small"
                        pagination={false}
                        rowKey="key"
                        dataSource={dataSource}
                        columns={columns}
                      />
                      <Button
                        type="dashed"
                        block
                        icon={<PlusOutlined />}
                        style={{ marginTop: 8 }}
                        onClick={() => add()}
                      >
                        เพิ่มกฎวันลาต่อปี
                      </Button>
                    </>
                  );
                }}
              </Form.List>

              {/* =================== เงื่อนไขการสะสม =================== */}
              <Divider orientation="left">เงื่อนไขการสะสมวันลาพักผ่อน</Divider>
              <Form.List name="carry_over">
                {(fields, { add, remove, move }) => {
                  const dataSource = fields.map((f) => ({ key: f.key, nameIndex: f.name, field: f }));
                  const columns = [
                    {
                      title: 'อายุราชการมากกว่า (ปี)',
                      key: 'service_year',
                      render: (_value: unknown, record: VacationRecord) => (
                        <Form.Item
                          name={[record.nameIndex, 'service_year']}
                          rules={[{ required: true, message: 'กรุณาระบุอายุราชการ' }]}
                          style={{ margin: 0 }}
                        >
                          <InputNumber min={0} style={{ width: '100%' }} placeholder="เช่น 1, 10" />
                        </Form.Item>
                      ),
                      width: 240,
                    },
                    {
                      title: 'สะสมวันลาได้สูงสุด (วัน)',
                      key: 'max_leave',
                      render: (_value: unknown, record: VacationRecord) => (
                        <Form.Item
                          name={[record.nameIndex, 'max_leave']}
                          rules={[{ required: true, message: 'กรุณาระบุจำนวนวันสะสม' }]}
                          style={{ margin: 0 }}
                        >
                          <InputNumber min={0} style={{ width: '100%' }} placeholder="เช่น 20" />
                        </Form.Item>
                      ),
                      width: 260,
                    },
                    {
                      title: 'จัดการ',
                      key: 'actions',
                      align: 'right' as const,
                      render: (_value: unknown, record: VacationRecord) => (
                        <Space>
                          <Tooltip title="ย้ายขึ้น">
                            <Button
                              icon={<UpOutlined />}
                              onClick={() => move(record.field.name, Math.max(0, record.field.name - 1))}
                              disabled={record.field.name === 0}
                            />
                          </Tooltip>
                          <Tooltip title="ย้ายลง">
                            <Button
                              icon={<DownOutlined />}
                              onClick={() =>
                                move(
                                  record.field.name,
                                  Math.min(fields.length - 1, record.field.name + 1),
                                )
                              }
                              disabled={record.field.name === fields.length - 1}
                            />
                          </Tooltip>
                          <Tooltip title="ลบกฎ">
                            <Button danger icon={<DeleteOutlined />} onClick={() => remove(record.field.name)} />
                          </Tooltip>
                        </Space>
                      ),
                      width: 180,
                    },
                  ];

                  return (
                    <>
                      <Table
                        size="small"
                        pagination={false}
                        rowKey="key"
                        dataSource={dataSource}
                        columns={columns}
                      />
                      <Button
                        type="dashed"
                        block
                        icon={<PlusOutlined />}
                        style={{ marginTop: 8 }}
                        onClick={() => add()}
                      >
                        เพิ่มกฎการสะสม
                      </Button>
                    </>
                  );
                }}
              </Form.List>

              <Divider />

              <Row justify="space-between" style={{ marginTop: 12 }}>
                <Col>
                  <Popconfirm title="ยืนยันการลบ?" onConfirm={onDelete} okText="ลบ" cancelText="ยกเลิก">
                    <Button danger>ลบประเภทนี้</Button>
                  </Popconfirm>
                </Col>
                <Col>
                  <Space>
                    <Button onClick={() => history.back()}>ยกเลิก</Button>
                    <Button type="primary" htmlType="submit">
                      บันทึก
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Form>
          )}
        </Card>
      </Space>
    </div>
  );
}
