/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect } from 'react';
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
} from 'antd';
import { useRouter } from 'next/navigation';
// ✅ เปลี่ยนการ import มาใช้ ApproverPositionEditor
import ApproverPositionEditor from '@/app/components/FormElements/ApproverPositionEditor';
import type { LeaveTypeConfig, GenderCode } from '@/types/leave';
import { UpOutlined, DownOutlined, DeleteOutlined, PlusOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

type VacationRule = { minServiceYears: number; daysPerYear: number };
type CarryOverRule = { minServiceYears: number; carryOverDays: number };
type ApprovalRuleSimple = { order: number };

type LeaveTypeFormValues = Omit<
  LeaveTypeConfig,
  'id' | 'createdAt' | 'updatedAt' | 'approvalRules'
> & {
  // ใหม่: ให้ผู้ใช้ระบุเพียง "จำนวนผู้อนุมัติสูงสุด"
  maxApprovers?: number;
  // ของเดิม: นโยบายลาพักผ่อน/สะสม
  vacationRules?: VacationRule[];
  carryOverRules?: CarryOverRule[];
};

type VacationLeavePayload = LeaveTypeConfig & {
  vacationRules?: VacationRule[];
  carryOverRules?: CarryOverRule[];
  // ใช้รูปแบบเรียบง่าย: ลำดับผู้อนุมัติ 1..N
  approvalRules?: ApprovalRuleSimple[];
};

const genderOptions: { label: string; value: GenderCode }[] = [
  { label: 'ชาย', value: 'male' },
  { label: 'หญิง', value: 'female' },
  { label: 'อื่นๆ', value: 'other' },
];

const fileTypeOptions = [
  { label: 'PDF', value: 'pdf' },
  { label: 'รูปภาพ', value: 'image' },
  { label: 'เอกสาร Word', value: 'doc' },
  { label: 'อื่นๆ', value: 'other' },
];

export default function AddVacationLeavePage() {
  const { Title, Text } = Typography;
  const router = useRouter();
  const [form] = Form.useForm<LeaveTypeFormValues>();

  // watch จำนวนผู้อนุมัติ เพื่อพรีวิวลำดับ 1..N
  const maxApprovers = Form.useWatch('maxApprovers', form) ?? 0;
  const approverOrders = Array.from({ length: Math.max(0, Number(maxApprovers || 0)) }, (_, i) => i + 1);

  useEffect(() => {
    form.setFieldsValue({
      name: 'ลาพักผ่อน',
      maxDays: 20,
      allowedGenders: [],
      minServiceYears: 0,
      workingDaysOnly: true,
      documents: [],
      // ใหม่: ค่าเริ่มต้นจำนวนผู้อนุมัติ
      maxApprovers: 4,
      vacationRules: [
        { minServiceYears: 1, daysPerYear: 10 },
        { minServiceYears: 10, daysPerYear: 20 },
      ],
      carryOverRules: [
        { minServiceYears: 1, carryOverDays: 20 },
        { minServiceYears: 10, carryOverDays: 20 },
      ],
    } as LeaveTypeFormValues);
  }, [form]);

  const onFinish = (values: LeaveTypeFormValues) => {
    const approverCount = Number(values.maxApprovers || 0);
    // ApprovalRule type requires: order, maxDaysThreshold, approverChain
    const approvalRules = Array.from({ length: approverCount }, (_, i) => ({
      order: i + 1,
      maxDaysThreshold: Number(values.maxDays ?? 0), // or set a sensible default
      approverChain: [], // or provide mock data if needed
    }));

    const payload: VacationLeavePayload = {
      // LeaveTypeConfig fields
      id: '', // mock id
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      name: values.name,
      maxDays: Number(values.maxDays ?? 0),
      allowedGenders: values.allowedGenders ?? [],
      minServiceYears: Number(values.minServiceYears ?? 0),
      workingDaysOnly: !!values.workingDaysOnly,
      documents: values.documents ?? [],

      // ✅ ใช้จำนวนผู้อนุมัติ เพื่อสร้างลิสต์ลำดับ 1..N
      approvalRules,

      // extra vacation policies
      vacationRules: (values.vacationRules ?? []).map((r) => ({
        minServiceYears: Number(r.minServiceYears ?? 0),
        daysPerYear: Number(r.daysPerYear ?? 0),
      })),
      carryOverRules: (values.carryOverRules ?? []).map((r) => ({
        minServiceYears: Number(r.minServiceYears ?? 0),
        carryOverDays: Number(r.carryOverDays ?? 0),
      })),
    };

    console.log('[MOCK ADD VACATION]', payload);
    message.success('เพิ่มประเภทการลา (ลาพักผ่อน) — โหมด Mock (ไม่บันทึกจริง)');
    router.push('/private/admin/manage-leave');
  };

  return (
    <div style={{ padding: 10 }}>
      <Space direction="vertical" style={{ width: '100%' }} size={10}>
        <Title level={4} style={{ margin: 0 }}>
          เพิ่มประเภทลา (ลาพักผ่อน)
        </Title>

        <Card>
          <Form<LeaveTypeFormValues> form={form} layout="vertical" onFinish={onFinish}>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="name"
                  label="ชื่อประเภทการลา"
                  rules={[{ required: true, message: 'กรุณาระบุชื่อประเภทการลา' }]}
                >
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="minServiceYears" label="อายุราชการขั้นต่ำในการมีสิทธิ์ (ปี)">
                  <InputNumber min={0} style={{ width: '100%' }} placeholder="เช่น 0 หรือ 1" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="allowedGenders" label="เพศที่สามารถลาในประเภทนี้ได้">
                  <Checkbox.Group options={genderOptions} />
                </Form.Item>
                <Text type="secondary">ไม่เลือก/เลือกครบทุกเพศ = ทุกเพศ</Text>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="workingDaysOnly" valuePropName="checked" label=" ">
                  <Checkbox>นับวันลาเฉพาะวันทำการ</Checkbox>
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">ผู้อนุมัติ (ลำดับค่าเริ่มต้น)</Divider>
            {/* ✅ ใช้ ApproverPositionEditor แทน ApproverEditor */}
              <ApproverPositionEditor nameList={['approverPositions']} />
           {/* -------- เอกสารแนบ (ตาราง) -------- */}
            <Divider orientation="left">เอกสารแนบที่ต้องส่ง</Divider>
            <Form.List name="documents">
              {(fields, { add, remove, move }) => {
                const columns = [
                  {
                    title: 'ชื่อเอกสาร',
                    dataIndex: 'name',
                    render: (_: any, __: any, idx: number) => (
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
                    dataIndex: 'fileType',
                    width: 220,
                    render: (_: any, __: any, idx: number) => (
                      <Form.Item
                        name={[fields[idx].name, 'fileType']}
                        style={{ marginBottom: 0 }}
                        rules={[{ required: true, message: 'เลือกชนิดไฟล์' }]}
                      >
                        <Select options={fileTypeOptions} placeholder="เลือกชนิดไฟล์" />
                      </Form.Item>
                    ),
                  },
                  {
                    title: 'จำเป็น',
                    dataIndex: 'required',
                    width: 120,
                    render: (_: any, __: any, idx: number) => (
                      <Form.Item
                        name={[fields[idx].name, 'required']}
                        valuePropName="checked"
                        style={{ marginBottom: 0 }}
                      >
                        <Checkbox />
                      </Form.Item>
                    ),
                  },
                  {
                    title: 'จัดการ',
                    dataIndex: 'actions',
                    width: 180,
                    render: (_: any, __: any, idx: number) => (
                      <Space>
                        <Button size="small" onClick={() => move(fields[idx].name, Math.max(0, fields[idx].name - 1))} disabled={idx === 0}><ArrowUpOutlined /></Button>
                        <Button size="small" onClick={() => move(fields[idx].name, Math.min(fields.length - 1, fields[idx].name + 1))} disabled={idx === fields.length - 1}><ArrowDownOutlined /></Button>
                        <Button size="small" danger onClick={() => remove(fields[idx].name)}><DeleteOutlined /></Button>
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
                      columns={columns as any}
                      dataSource={data}
                      locale={{ emptyText: 'ยังไม่มีเอกสารแนบ' }}
                    />
                    <Button type="dashed" block onClick={() => add()}>
                      เพิ่มเอกสาร
                    </Button>
                  </Space>
                );
              }}
            </Form.List>

            {/* =================== เงื่อนไขวันลาต่อปี: ตาราง =================== */}
            <Divider orientation="left">เงื่อนไขวันลาพักผ่อนต่อปี</Divider>
            <Form.List name="vacationRules">
              {(fields, { add, remove, move }) => {
                const dataSource = fields.map(f => ({ key: f.key, nameIndex: f.name, field: f }));
                const columns = [
                  {
                    title: 'อายุราชการมากกว่า (ปี)',
                    key: 'minServiceYears',
                    render: (_: any, record: any) => (
                      <Form.Item
                        name={[record.nameIndex, 'minServiceYears']}
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
                    key: 'daysPerYear',
                    render: (_: any, record: any) => (
                      <Form.Item
                        name={[record.nameIndex, 'daysPerYear']}
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
                          <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => remove(record.field.name)}
                          />
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

            {/* =================== เงื่อนไขการสะสม: ตาราง =================== */}
            <Divider orientation="left">เงื่อนไขการสะสมวันลาพักผ่อน</Divider>
            <Form.List name="carryOverRules">
              {(fields, { add, remove, move }) => {
                const dataSource = fields.map(f => ({ key: f.key, nameIndex: f.name, field: f }));
                const columns = [
                  {
                    title: 'อายุราชการมากกว่า (ปี)',
                    key: 'minServiceYears',
                    render: (_: any, record: any) => (
                      <Form.Item
                        name={[record.nameIndex, 'minServiceYears']}
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
                    key: 'carryOverDays',
                    render: (_: any, record: any) => (
                      <Form.Item
                        name={[record.nameIndex, 'carryOverDays']}
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
                          <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => remove(record.field.name)}
                          />
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
