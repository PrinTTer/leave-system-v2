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
} from 'antd';
import { useRouter, useParams } from 'next/navigation';

// ✅ ใช้คอมโพเนนต์เดียวกับหน้า Add
import ApproverPositionEditor from '@/app/components/FormElements/ApproverPositionEditor';

import type { LeaveTypeConfig, GenderCode } from '@/types/leave';
import { leaveTypesSeed } from '@/mock/leave-type';

// ✅ ไอคอนเดียวกับหน้า Add
import {
  UpOutlined,
  DownOutlined,
  DeleteOutlined,
  PlusOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';

type LeaveTypeFormValues = Omit<LeaveTypeConfig, 'id' | 'createdAt' | 'updatedAt'> & {
  vacationRules?: { minServiceYears: number; daysPerYear: number }[];
  carryOverRules?: { minServiceYears: number; carryOverDays: number }[];
};

type VacationLeavePayload = LeaveTypeConfig & {
  vacationRules?: { minServiceYears: number; daysPerYear: number }[];
  carryOverRules?: { minServiceYears: number; carryOverDays: number }[];
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
const defaultVacationRules = [
  { minServiceYears: 1, daysPerYear: 10 },
  { minServiceYears: 10, daysPerYear: 20 },
];

const defaultCarryOverRules = [
  { minServiceYears: 1, carryOverDays: 20 },
  { minServiceYears: 10, carryOverDays: 20 },
];

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

  // โหลดข้อมูล mock สำหรับ id
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

    // รองรับฟิลด์พิเศษ (ถ้า seed ไม่มี ให้ใช้ค่า default)
    const vacationRules = (found as any).vacationRules ?? defaultVacationRules;
    const carryOverRules = (found as any).carryOverRules ?? defaultCarryOverRules;

    // set ค่าเริ่มต้นลงฟอร์ม
    form.setFieldsValue({
      name: found.name ?? 'ลาพักผ่อน',
      maxDays: Number(found.maxDays ?? 20),
      allowedGenders: found.allowedGenders ?? [],
      minServiceYears: Number(found.minServiceYears ?? 0),
      workingDaysOnly: !!found.workingDaysOnly,
      documents: found.documents ?? [],
      // หมายเหตุ: หน้า Add ใช้ ApproverPositionEditor (nameList=['approverPositions'])
      // ถ้าระบบจริงมีค่าเริ่มต้นของ approverPositions ให้ setFieldsValue เพิ่มได้ที่นี่
      vacationRules,
      carryOverRules,
    } as LeaveTypeFormValues);

    setLoading(false);
  }, [recordId, router, form]);

  const onFinish = (values: LeaveTypeFormValues) => {
    if (!original) return;

    const payload: VacationLeavePayload = {
      // ฟิลด์หลัก LeaveTypeConfig
      id: original.id,
      createdAt: original.createdAt,
      updatedAt: new Date().toISOString(),
      name: values.name,
      maxDays: Number(values.maxDays ?? 0),
      allowedGenders: values.allowedGenders ?? [],
      minServiceYears: Number(values.minServiceYears ?? 0),
      workingDaysOnly: !!values.workingDaysOnly,
      documents: values.documents ?? [],
      // ให้สอดคล้องกับหน้า Add: ยังไม่ผูก approvers แบบเดิม (ใช้ตำแหน่งใน ApproverPositionEditor)
      approvalRules: original.approvalRules ?? [],

      // นโยบายลาพักผ่อนเพิ่มเติม
      vacationRules: (values.vacationRules ?? []).map((r) => ({
        minServiceYears: Number(r.minServiceYears ?? 0),
        daysPerYear: Number(r.daysPerYear ?? 0),
      })),
      carryOverRules: (values.carryOverRules ?? []).map((r) => ({
        minServiceYears: Number(r.minServiceYears ?? 0),
        carryOverDays: Number(r.carryOverDays ?? 0),
      })),
    };

    // โหมด Mock: ยังไม่ persist ที่ไหน แค่โชว์ผล + redirect
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

              {/* ✅ ผู้อนุมัติ (ลำดับตำแหน่ง) ใช้คอมโพเนนต์เดียวกับหน้า Add */}
              <Divider orientation="left">ผู้อนุมัติ (ลำดับค่าเริ่มต้น)</Divider>
              <ApproverPositionEditor nameList={['approverPositions']} />

              {/* -------- เอกสารแนบ (ตาราง) ให้เหมือนหน้า Add -------- */}
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
                            onClick={() =>
                              move(fields[idx].name, Math.max(0, fields[idx].name - 1))
                            }
                            disabled={idx === 0}
                          >
                            <ArrowUpOutlined />
                          </Button>
                          <Button
                            size="small"
                            onClick={() =>
                              move(
                                fields[idx].name,
                                Math.min(fields.length - 1, fields[idx].name + 1),
                              )
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

              {/* =================== เงื่อนไขวันลาต่อปี: ตาราง (เหมือนหน้า Add) =================== */}
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

              {/* =================== เงื่อนไขการสะสม: ตาราง (เหมือนหน้า Add) =================== */}
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
