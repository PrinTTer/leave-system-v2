/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
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
  Table,
  Tooltip,
  Tag,
  Breadcrumb,
} from 'antd';
import { useRouter } from 'next/navigation';
import {
  UpOutlined,
  DownOutlined,
  DeleteOutlined,
  PlusOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import { createLeaveType } from '@/services/leaveTypeApi';
import { LeaveTypeApiItem } from '@/types/leave';

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

export default function AddVacationLeavePage() {
  const { Title, Text } = Typography;
  const router = useRouter();
  const [form] = Form.useForm<Partial<LeaveTypeApiItem>>();

  // watch จำนวนผู้อนุมัติ เพื่อพรีวิวลำดับ 1..N (ชื่อเหมือนหน้าแก้ไข)
  const maxApproverCount = Form.useWatch('number_approver', form) ?? 0;
  const approverOrders = Array.from({ length: Math.max(0, Number(maxApproverCount || 0)) }, (_, i) => i + 1);

  const onFinish = async (values: Partial<LeaveTypeApiItem>) => {
    try {
      // map gender (array checkbox) => backend value 'all'|'male'|'female'
      let gender: string = 'all';
      if (Array.isArray(values.gender) && values.gender.length === 1) {
        gender = values.gender[0] as string;
      }

      // map documents
      const leave_type_document = (values.leave_type_document ?? []).map((d: any) => ({
        name: d.name ?? '',
        file_type: d.file_type ?? 'pdf',
        is_required: !!d.is_required,
      }));

      // map approval rules (leave_approval_rule expects approval_level:number)
      // We expect UI to provide approval_level already as number (like edit page)
      const leave_approval_rule = (values.leave_approval_rule ?? []).map((r: any) => ({
        leave_less_than: Number(r.leave_less_than ?? 0),
        approval_level: Number(r.approval_level ?? 0),
      })).filter((r: any) => r.leave_less_than > 0 && r.approval_level > 0);

      // vacation_per_year and carry_over come from arrays of objects
      const vacation_per_year = (values.vacation_per_year ?? []).map((r: any) => ({
        service_year: Number(r.service_year ?? 0),
        annual_leave: Number(r.annual_leave ?? 0),
      }));

      const carry_over = (values.carry_over ?? []).map((r: any) => ({
        service_year: Number(r.service_year ?? 0),
        max_leave: Number(r.max_leave ?? 0),
      }));

      // build vacation_rule combining per-year and carry_over by index (same as edit page)
      const vacation_rule = vacation_per_year.map((r: any, i: number) => ({
        service_year: r.service_year,
        annual_leave: r.annual_leave,
        max_leave: carry_over[i]?.max_leave ?? 0,
      }));

      // compute max_annual similarly to edit page: max annual_leave if provided, else use max_leave field
      const max_annual = vacation_per_year.length > 0
        ? Math.max(...vacation_per_year.map((r: any) => Number(r.annual_leave ?? 0)))
        : Number(values.max_leave ?? 0);

      const payload: LeaveTypeApiItem = {
        name: String(values.name ?? ''),
        max_leave: Number(max_annual ?? 0),
        gender: gender as any,
        service_year: Number(values.service_year ?? 0),
        is_count_vacation: !!values.is_count_vacation,
        number_approver: Number(values.number_approver ?? 0),
        category: 'vacation',
        leave_type_document,
        leave_approval_rule,
        vacation_rule,
      };

      // call API
      await createLeaveType(payload);

      message.success('เพิ่มประเภทการลาเรียบร้อยแล้ว');
      router.push('/private/admin/manage-leave');
    } catch (err: any) {
      console.error('createLeaveType error', err);
      const errMsg = err?.response?.data?.message ?? err?.message ?? 'เกิดข้อผิดพลาดในการเพิ่มประเภทการลา';
      message.error(errMsg);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" style={{ width: '100%' }} size={10}>
        <Title level={4} style={{ margin: 0 }}>
          เพิ่มประเภทลา (ลาพักผ่อน)
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
            { title: "เพิ่ม" },
          ]}
        />

        <Card>
          <Form form={form} layout="vertical" onFinish={onFinish}>
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

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="gender" label="เพศที่สามารถลาในประเภทนี้ได้">
                  <Checkbox.Group options={genderOptions} />
                </Form.Item>
                <Text type="secondary">ไม่เลือก/เลือกครบทุกเพศ = ทุกเพศ</Text>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="is_count_vacation" valuePropName="checked" label=" ">
                  <Checkbox>นับวันลาเฉพาะวันทำการ</Checkbox>
                </Form.Item>
              </Col>
            </Row>

            {/* ผู้อนุมัติ */}
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
                </Form.Item>
              </Col>
            </Row>

            {/* เอกสารแนบ */}
            <Divider orientation="left">เอกสารแนบที่ต้องส่ง</Divider>
            <Form.List name="leave_type_document">
              {(fields, { add, remove, move }) => {
                const columns = [
                  {
                    title: 'ชื่อเอกสาร',
                    render: (_: any, _rec: any, idx: number) => (
                      <Form.Item
                        name={[idx, 'name']}
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
                    render: (_: any, _rec: any, idx: number) => (
                      <Form.Item
                        name={[idx, 'file_type']}
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
                    render: (_: any, _rec: any, idx: number) => (
                      <Form.Item
                        name={[idx, 'is_required']}
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
                    render: (_: any, _rec: any, idx: number) => (
                      <Space>
                        <Button size="small" onClick={() => move(idx, Math.max(0, idx - 1))} disabled={idx === 0}>
                          <ArrowUpOutlined />
                        </Button>
                        <Button size="small" onClick={() => move(idx, Math.min(fields.length - 1, idx + 1))} disabled={idx === fields.length - 1}>
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
                    <Table size="small" pagination={false} columns={columns} dataSource={data} />
                    <Button type="dashed" block onClick={() => add()}>
                      เพิ่มเอกสาร
                    </Button>
                  </Space>
                );
              }}
            </Form.List>

            {/* เงื่อนไขผู้อนุมัติ (ถ้าต้องการให้แก้ไขรายการ) */}
            <Divider orientation="left">เงื่อนไขผู้อนุมัติ</Divider>
            <Form.List name="leave_approval_rule">
              {(fields, { add, remove, move }) => {
                const columns = [
                  {
                    title: 'ลาน้อยกว่า (วัน)',
                    render: (_: any, _rec: any, idx: number) => (
                      <Form.Item
                        name={[idx, 'leave_less_than']}
                        style={{ marginBottom: 0 }}
                        rules={[{ required: true, message: 'ระบุจำนวนวัน' }]}
                      >
                        <InputNumber min={1} style={{ width: '100%' }} />
                      </Form.Item>
                    ),
                  },
                  {
                    title: 'ลำดับที่ต้องอนุมัติ',
                    render: (_: any, _rec: any, idx: number) => (
                      <Form.Item
                        name={[idx, 'approval_level']}
                        style={{ marginBottom: 0 }}
                        rules={[{ required: true, message: 'เลือกอย่างน้อย 1 ค่า' }]}
                      >
                        <Select placeholder="เลือก" options={approverOrders.map(n => ({ label: `ลำดับที่ ${n}`, value: n }))} />
                      </Form.Item>
                    ),
                  },
                  {
                    title: 'จัดการ',
                    render: (_: any, _rec: any, idx: number) => (
                      <Space>
                        <Button size="small" onClick={() => move(idx, Math.max(0, idx - 1))} disabled={idx === 0}>
                          <ArrowUpOutlined />
                        </Button>
                        <Button size="small" onClick={() => move(idx, Math.min(fields.length - 1, idx + 1))} disabled={idx === fields.length - 1}>
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
                    <Table size="small" pagination={false} columns={columns} dataSource={data} />
                    <Button type="dashed" block onClick={() => add()}>
                      เพิ่มเงื่อนไข
                    </Button>
                  </Space>
                );
              }}
            </Form.List>

            {/* เงื่อนไขวันลาต่อปี */}
            <Divider orientation="left">เงื่อนไขวันลาพักผ่อนต่อปี</Divider>
            <Form.List name="vacation_per_year">
              {(fields, { add, remove, move }) => {
                const dataSource = fields.map((f) => ({ key: f.key, nameIndex: f.name, field: f }));
                const columns = [
                  {
                    title: 'อายุราชการมากกว่า (ปี)',
                    key: 'service_year',
                    render: (_: any, record: any) => (
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
                    render: (_: any, record: any) => (
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
                    render: (_: any, record: any) => (
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
                            onClick={() => move(record.field.name, Math.min(fields.length - 1, record.field.name + 1))}
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
                    <Table size="small" pagination={false} rowKey="key" dataSource={dataSource} columns={columns} />
                    <Button type="dashed" block icon={<PlusOutlined />} style={{ marginTop: 8 }} onClick={() => add()}>
                      เพิ่มกฎวันลาต่อปี
                    </Button>
                  </>
                );
              }}
            </Form.List>

            {/* เงื่อนไขการสะสม */}
            <Divider orientation="left">เงื่อนไขการสะสมวันลาพักผ่อน</Divider>
            <Form.List name="carry_over">
              {(fields, { add, remove, move }) => {
                const dataSource = fields.map((f) => ({ key: f.key, nameIndex: f.name, field: f }));
                const columns = [
                  {
                    title: 'อายุราชการมากกว่า (ปี)',
                    key: 'service_year',
                    render: (_: any, record: any) => (
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
                    render: (_: any, record: any) => (
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
                    render: (_: any, record: any) => (
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
                            onClick={() => move(record.field.name, Math.min(fields.length - 1, record.field.name + 1))}
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
                    <Table size="small" pagination={false} rowKey="key" dataSource={dataSource} columns={columns} />
                    <Button type="dashed" block icon={<PlusOutlined />} style={{ marginTop: 8 }} onClick={() => add()}>
                      เพิ่มกฎการสะสม
                    </Button>
                  </>
                );
              }}
            </Form.List>

            <Divider />

            <Row justify="space-between" style={{ marginTop: 12 }}>
              <Col>
                <Button onClick={() => router.push('/private/admin/manage-leave')}>ยกเลิก</Button>
              </Col>
              <Col>
                <Button type="primary" htmlType="submit">
                  บันทึก
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>
      </Space>
    </div>
  );
}
