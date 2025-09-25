/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
} from 'antd';
import { useRouter, useParams } from 'next/navigation';

import type { LeaveTypeConfig, GenderCode } from '@/types/leave';
import { leaveTypesSeed } from '@/mock/leave-type';

import {
  UpOutlined,
  DownOutlined,
  DeleteOutlined,
  PlusOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';

type VacationRule = { minServiceYears: number; daysPerYear: number };
type CarryOverRule = { minServiceYears: number; carryOverDays: number };
type ApprovalRuleSimple = { order: number };

type LeaveTypeFormValues = Omit<
  LeaveTypeConfig,
  'id' | 'createdAt' | 'updatedAt' | 'approvalRules'
> & {
  // ให้ “Edit” เหมือน “Add”: ใช้จำนวนผู้อนุมัติสูงสุดเพื่ออนุมานลำดับ 1..N
  maxApprovers?: number;
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

// ค่า default เฉพาะลาพักผ่อน กรณี record ไม่มีฟิลด์พิเศษ
const defaultVacationRules: VacationRule[] = [
  { minServiceYears: 1, daysPerYear: 10 },
  { minServiceYears: 10, daysPerYear: 20 },
];

const defaultCarryOverRules: CarryOverRule[] = [
  { minServiceYears: 1, carryOverDays: 20 },
  { minServiceYears: 10, carryOverDays: 20 },
];

/** ===== Adapter: suy maxApprovers จาก seed เก่า/ใหม่ =====
 * ลำดับความสำคัญ:
 * 1) approverPolicy.maxApproverCount
 * 2) ความยาว approverPositions (ลำดับตามตำแหน่ง)
 * 3) ความยาว approvers (legacy)
 */
function deriveMaxApprovers(found: any): number {
  if (Number.isInteger(found?.approverPolicy?.maxApproverCount) && found.approverPolicy.maxApproverCount > 0) {
    return found.approverPolicy.maxApproverCount;
  }
  if (Array.isArray(found?.approverPositions) && found.approverPositions.length > 0) {
    return found.approverPositions.length;
  }
  if (Array.isArray(found?.approvers) && found.approvers.length > 0) {
    return found.approvers.length;
  }
  return 4; // fallback เริ่มต้น
}

export default function EditVacationLeavePage() {
  const { Title, Text } = Typography;
  const router = useRouter();
  const params = useParams();
  const recordId = useMemo(() => {
    const idParam = (params as any)?.id;
    return Array.isArray(idParam) ? idParam[0] : (idParam as string);
  }, [params]);

  const [form] = Form.useForm<LeaveTypeFormValues>();
  const [loading, setLoading] = useState(true);
  const [original, setOriginal] = useState<LeaveTypeConfig | null>(null);

  // พรีวิว “ลำดับผู้อนุมัติ 1..N” ให้เหมือนหน้า Add
  const maxApprovers = Form.useWatch('maxApprovers', form) ?? 0;
  const approverOrders = useMemo(
    () => Array.from({ length: Math.max(0, Number(maxApprovers || 0)) }, (_, i) => i + 1),
    [maxApprovers]
  );

  // โหลดข้อมูล mock สำหรับ id และ set ค่าเริ่มต้นให้ “เหมือนหน้า Add”
  useEffect(() => {
    if (!recordId) return;
    setLoading(true);

    const found = leaveTypesSeed.find((x) => x.id === recordId) ?? null;

    if (!found) {
      message.error('ไม่พบประเภทการลาที่ต้องการแก้ไข');
      router.push('/private/admin/manage-leave');
      return;
    }

    setOriginal(found);

    const initValues: LeaveTypeFormValues = {
      name: found.name ?? 'ลาพักผ่อน',
      maxDays: Number(found.maxDays ?? 20),
      allowedGenders: found.allowedGenders ?? [],
      minServiceYears: Number(found.minServiceYears ?? 0),
      workingDaysOnly: !!found.workingDaysOnly,
      documents: found.documents ?? [],
      maxApprovers: deriveMaxApprovers(found),
      vacationRules: (found as any).vacationRules ?? defaultVacationRules,
      carryOverRules: (found as any).carryOverRules ?? defaultCarryOverRules,
    };

    form.setFieldsValue(initValues);
    setLoading(false);
  }, [recordId, router, form]);

  const onFinish = (values: LeaveTypeFormValues) => {
    if (!original) return;

    const approverCount = Number(values.maxApprovers || 0);

    // ทำให้ “Edit” เหมือน “Add”: สร้างลิสต์ลำดับผู้อนุมัติ 1..N
    const approvalRules = Array.from({ length: approverCount }, (_, i) => ({
      order: i + 1,
      maxDaysThreshold: Number(values.maxDays ?? 0), // จะปรับเป็น threshold จริงในอนาคตได้
      approverChain: [], // โหมด Mock
    }));

    const payload: VacationLeavePayload = {
      id: original.id,
      createdAt: original.createdAt,
      updatedAt: new Date().toISOString(),
      name: values.name,
      maxDays: Number(values.maxDays ?? 0),
      allowedGenders: values.allowedGenders ?? [],
      minServiceYears: Number(values.minServiceYears ?? 0),
      workingDaysOnly: !!values.workingDaysOnly,
      documents: values.documents ?? [],
      approvalRules,

      vacationRules: (values.vacationRules ?? []).map((r) => ({
        minServiceYears: Number(r.minServiceYears ?? 0),
        daysPerYear: Number(r.daysPerYear ?? 0),
      })),
      carryOverRules: (values.carryOverRules ?? []).map((r) => ({
        minServiceYears: Number(r.minServiceYears ?? 0),
        carryOverDays: Number(r.carryOverDays ?? 0),
      })),
    };

    console.log('[MOCK UPDATE VACATION]', payload);
    message.success('บันทึกการแก้ไขประเภทการลา (ลาพักผ่อน) — โหมด Mock (ไม่บันทึกจริง)');
    router.push('/private/admin/manage-leave');
  };

  return (
    <div style={{ padding: 10 }}>
      <Space direction="vertical" style={{ width: '100%' }} size={10}>
        <Title level={4} style={{ margin: 0 }}>
          แก้ไขประเภทลา (ลาพักผ่อน)
        </Title>

        <Card>
          {loading ? (
            <Skeleton active />
          ) : (
            <Form<LeaveTypeFormValues> form={form} layout="vertical" onFinish={onFinish}>
              {/* -------- แถว 1: ชื่อ + อายุราชการขั้นต่ำ -------- */}
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="name"
                    label="ชื่อประเภทการลา"
                    rules={[{ required: true, message: 'กรุณาระบุชื่อประเภทการลา' }]}
                  >
                    <Input disabled /> {/* ล็อกชื่อเป็น ลาพักผ่อน */}
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="minServiceYears" label="อายุราชการขั้นต่ำในการมีสิทธิ์ (ปี)">
                    <InputNumber min={0} style={{ width: '100%' }} placeholder="เช่น 0 หรือ 1" />
                  </Form.Item>
                </Col>
              </Row>

              {/* -------- แถว 2: เพศ + นับเฉพาะวันทำการ -------- */}
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

              {/* ========== ผู้อนุมัติ: ใช้ "จำนวนผู้อนุมัติสูงสุด" แล้วอนุมานเป็นลำดับ 1..N ========== */}
              <Divider orientation="left">ผู้อนุมัติ (กำหนดเพียงจำนวนสูงสุด)</Divider>
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="maxApprovers"
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

              {/* =================== เงื่อนไขวันลาต่อปี =================== */}
              <Divider orientation="left">เงื่อนไขวันลาพักผ่อนต่อปี</Divider>
              <Form.List name="vacationRules">
                {(fields, { add, remove, move }) => {
                  const dataSource = fields.map((f) => ({ key: f.key, nameIndex: f.name, field: f }));
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
              <Form.List name="carryOverRules">
                {(fields, { add, remove, move }) => {
                  const dataSource = fields.map((f) => ({ key: f.key, nameIndex: f.name, field: f }));
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
                  <Button onClick={() => router.push('/private/admin/manage-leave')}>ยกเลิก</Button>
                </Col>
                <Col>
                  <Button type="primary" htmlType="submit">
                    บันทึกการแก้ไข
                  </Button>
                </Col>
              </Row>
            </Form>
          )}
        </Card>
      </Space>
    </div>
  );
}
