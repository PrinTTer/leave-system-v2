/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Button, Card, Checkbox, Col, Divider, Form, Input, InputNumber,
  Row, Select, Space, Typography, message, Table, Tag, Popconfirm
} from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, DeleteOutlined } from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';

import type { LeaveTypeConfig, GenderCode } from '@/types/leave';
import { leaveTypesSeed } from '@/mock/leave-type';

type ApprovalRuleForm = {
  maxDaysThreshold: number;
  /** เลือกลำดับผู้อนุมัติ “ลำดับที่ …” (เริ่ม 1) */
  requiredApproverOrders: number[];
};

type LeaveTypeFormValues = Omit<
  LeaveTypeConfig,
  'id' | 'createdAt' | 'updatedAt' | 'approvalRules'
> & {
  /** จำนวนลำดับผู้อนุมัติสูงสุด -> จะได้ลำดับ 1..N */
  maxApproverCount: number;
  /** เงื่อนไขอนุมัติ (เลือกจาก “ลำดับที่ …”) */
  approvalRules?: ApprovalRuleForm[];
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

/** ===== Helper แปลง seed เก่า/ใหม่ -> ฟอร์ม “แบบ Add” =====
 * รองรับ 3 เคสของข้อมูลอนุมัติเดิม:
 * 1) approverPolicy (ใหม่)          -> มี maxApproverCount + rules(requiredApproverOrders)
 * 2) approvalRules + approverChain  -> chain คือ step ตาม index (0-based) ของ approverPositions
 * 3) legacy approvers (ลิสต์ {position}) -> นับความยาวใช้เป็น maxApproverCount
 */
function deriveMaxApproverCount(found: any): number {
  // เคสใหม่: มี approverPolicy
  const p = found?.approverPolicy;
  if (p && Number.isInteger(p.maxApproverCount) && p.maxApproverCount > 0) {
    return p.maxApproverCount;
  }

  // เคสเดิม: มี approverPositions เป็น array ของลำดับ
  if (Array.isArray(found?.approverPositions) && found.approverPositions.length > 0) {
    return found.approverPositions.length;
  }

  // เคส legacy มากๆ: มี approvers (เช่น [{position: 'หัวหน้า'}])
  if (Array.isArray((found as any)?.approvers) && (found as any).approvers.length > 0) {
    return (found as any).approvers.length;
  }

  // fallback
  return 0;
}

/** แปลง approvalRules เดิม -> [{ maxDaysThreshold, requiredApproverOrders: number[] }] */
function deriveApprovalRules(found: any, maxApproverCount: number): ApprovalRuleForm[] {
  // ถ้ามี approverPolicy.rules อยู่แล้ว (ใหม่สุด)
  if (found?.approverPolicy?.rules && Array.isArray(found.approverPolicy.rules)) {
    return found.approverPolicy.rules.map((r: any) => ({
      maxDaysThreshold: Number(r?.maxDaysThreshold ?? 0),
      // เช็คขอบเขต 1..maxApproverCount + unique + sort
      requiredApproverOrders: Array.from(
        new Set(
          (r?.requiredApproverOrders ?? [])
            .map((n: any) => Number(n))
            .filter((n: number) => Number.isInteger(n) && n >= 1 && n <= maxApproverCount)
        )
      ).sort((a, b) => (a as number) - (b as number)),
    }));
  }

  // ถ้ามี approvalRules แบบเดิม (approverChain อ้าง step index 0-based)
  if (Array.isArray(found?.approvalRules) && found.approvalRules.length > 0) {
    return found.approvalRules.map((r: any) => {
      // chain เป็นลิสต์ step (0-based) -> แปลงเป็น order (1-based)
      const requiredOrders = Array.from(
        new Set(
          (r?.approverChain ?? [])
            .map((_step: any, stepIdx: number) => stepIdx + 1) // หรือจะ map จากตำแหน่งจริงก็ได้ หาก seed มี mapping
            .filter((n: number) => Number.isInteger(n) && n >= 1 && n <= maxApproverCount)
        )
      ).sort((a, b) => (a as number) - (b as number));

      return {
        maxDaysThreshold: Number(r?.maxDaysThreshold ?? 0),
        requiredApproverOrders: requiredOrders,
      };
    });
  }

  // ไม่มีกฎเดิม -> ค่าว่าง
  return [];
}

export default function EditLeaveTypePage() {
  const { Title, Text } = Typography;
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm<LeaveTypeFormValues>();

  useEffect(() => {
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const found = leaveTypesSeed.find((it) => it.id === id);

    if (!found) {
      message.error('ไม่พบประเภทการลา');
      router.push('/private/admin/manage-leave');
      return;
    }

    // สร้างค่าเริ่มต้นให้อยู่ “รูปแบบเดียวกับหน้า Add”
    const maxApproverCount = deriveMaxApproverCount(found);
    const rules = deriveApprovalRules(found, maxApproverCount);

    const initValues: LeaveTypeFormValues = {
      name: found.name,
      maxDays: found.maxDays,
      allowedGenders: found.allowedGenders,
      minServiceYears: found.minServiceYears,
      workingDaysOnly: found.workingDaysOnly,
      documents: found.documents ?? [],
      maxApproverCount: maxApproverCount || 1, // กัน null -> อย่างน้อย 1
      approvalRules: rules,
    };

    form.setFieldsValue(initValues);
    setLoading(false);
  }, [form, params.id, router]);

  // ใช้ดูค่า maxApproverCount เพื่อสร้างตัวเลือก “ลำดับที่ 1..N”
  const maxApproverCount = Form.useWatch('maxApproverCount', form) ?? 0;
  const approverOrders = useMemo(
    () =>
      Array.from(
        { length: Math.max(0, Number(maxApproverCount || 0)) },
        (_, i) => i + 1
      ),
    [maxApproverCount]
  );

  const onFinish = (values: LeaveTypeFormValues) => {
    const { maxApproverCount, approvalRules = [] } = values;

    // ทำความสะอาด rule: จำกัดให้อยู่ในช่วง 1..maxApproverCount, unique, sort
    const normalizedRules = approvalRules.map((r) => {
      const cleanOrders = Array.from(
        new Set(
          (r.requiredApproverOrders ?? [])
            .map((n) => Number(n))
            .filter((n) => Number.isInteger(n) && n >= 1 && n <= (maxApproverCount ?? 0))
        )
      ).sort((a, b) => a - b);

      return {
        maxDaysThreshold: r.maxDaysThreshold,
        requiredApproverOrders: cleanOrders,
      };
    });

    // === Payload แบบเดียวกับหน้า Add ===
    const payload = {
      ...values,
      approverPolicy: {
        maxApproverCount: Number(maxApproverCount || 0),
        rules: normalizedRules,
      },
    };

    // เดโม: ยังไม่ persist จริง
    console.log('[MOCK UPDATE] payload:', payload);
    message.success('บันทึก (โหมด Mock) — ไม่มีการเปลี่ยนแปลงข้อมูลจริง');
    router.push('/private/admin/manage-leave');
  };

  const onDelete = () => {
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    console.log('[MOCK DELETE] id:', id);
    message.info('ลบ (โหมด Mock) — ไม่มีการเปลี่ยนแปลงข้อมูลจริง');
    router.push('/private/admin/manage-leave');
  };

  return (
    <div style={{ padding: 10 }}>
      <Space direction="vertical" style={{ width: '100%' }} size={10}>
        <Title level={4} style={{ margin: 0 }}>แก้ไขประเภทลา (ลาทั่วไป)</Title>

        <Card loading={loading /* ใช้ Card ปกติ (ไม่ใช้ prop ที่ deprecated) */}>
          <Form<LeaveTypeFormValues> form={form} layout="vertical" onFinish={onFinish}>
            {/* -------- แถว 1: ชื่อ + สูงสุด (วัน) -------- */}
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="name"
                  label="ชื่อประเภทการลา"
                  rules={[{ required: true, message: 'กรุณาระบุชื่อประเภทการลา' }]}
                  extra="ตัวอย่าง: ลาป่วย, ลากิจส่วนตัว, ลาคลอดบุตร (สามารถตั้งชื่ออื่นได้)"
                >
                  <Input placeholder="เช่น ลาป่วย / ลากิจส่วนตัว / ลาคลอดบุตร" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="maxDays"
                  label="จำนวนวันลาสูงสุด"
                  rules={[{ required: true, message: 'กรุณาระบุจำนวนวัน' }]}
                >
                  <InputNumber min={0} style={{ width: '100%' }} placeholder="เช่น 120" />
                </Form.Item>
              </Col>
            </Row>

            {/* -------- แถว 2: เพศ + อายุราชการ -------- */}
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="allowedGenders" label="เพศที่สามารถลาในประเภทนี้ได้">
                  <Checkbox.Group options={genderOptions} />
                </Form.Item>
                <Text type="secondary">ไม่เลือก/เลือกครบทุกเพศ = ทุกเพศ</Text>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="minServiceYears" label="อายุราชการขั้นต่ำ (ปี)">
                  <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="workingDaysOnly" valuePropName="checked">
              <Checkbox>นับวันลาเฉพาะวันทำการ</Checkbox>
            </Form.Item>

            {/* -------- ผู้อนุมัติ (เหมือนหน้า Add) -------- */}
            <Divider orientation="left">ผู้อนุมัติ (กำหนดเพียงจำนวนสูงสุด)</Divider>
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="maxApproverCount"
                  label="จำนวนผู้อนุมัติสูงสุด"
                  rules={[{ required: true, message: 'กรุณาระบุจำนวนผู้อนุมัติสูงสุด' }]}
                  extra="เช่น 10 จะได้ลำดับผู้อนุมัติ 1–10"
                >
                  <InputNumber min={1} max={10} style={{ width: '100%' }} placeholder="เช่น 10" />
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
                          onClick={() => move(fields[idx].name, Math.min(fields.length - 1, fields[idx].name + 1))}
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

            {/* -------- เงื่อนไขอนุมัติ (ตาราง) -------- */}
            <Divider orientation="left">เงื่อนไขของการอนุมัติ (เลือก “ลำดับที่” แบบหลายค่า)</Divider>
            <Form.List name="approvalRules">
              {(fields, { add, remove, move }) => {
                const columns = [
                  {
                    title: 'จำนวนวันลาต่ำกว่า (วัน)',
                    dataIndex: 'maxDaysThreshold',
                    width: 260,
                    render: (_: any, __: any, idx: number) => (
                      <Form.Item
                        name={[fields[idx].name, 'maxDaysThreshold']}
                        style={{ marginBottom: 0 }}
                        rules={[{ required: true, message: 'กรุณาระบุจำนวนวัน' }]}
                      >
                        <InputNumber min={1} style={{ width: '100%' }} placeholder="เช่น 30" />
                      </Form.Item>
                    ),
                  },
                  {
                    title: 'ต้องใช้ผู้อนุมัติ “ลำดับที่”',
                    dataIndex: 'requiredApproverOrders',
                    render: (_: any, __: any, idx: number) => (
                      <Form.Item
                        name={[fields[idx].name, 'requiredApproverOrders']}
                        style={{ marginBottom: 0 }}
                        rules={[{ required: true, message: 'เลือกอย่างน้อย 1 ลำดับ' }]}
                        extra={
                          typeof maxApproverCount === 'number'
                            ? `เลือกได้ตั้งแต่ลำดับที่ 1 ถึง ${maxApproverCount}`
                            : 'กรุณาระบุจำนวนผู้อนุมัติสูงสุดก่อน'
                        }
                      >
                        <Select
                          mode="multiple"
                          placeholder="เช่น ลำดับที่ 1, 2, 4"
                          options={approverOrders.map(n => ({ label: `ลำดับที่ ${n}`, value: n }))}
                          disabled={!approverOrders.length}
                          allowClear
                        />
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
                          onClick={() => move(fields[idx].name, Math.min(fields.length - 1, fields[idx].name + 1))}
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
                      locale={{ emptyText: 'ยังไม่มีเงื่อนไข' }}
                    />
                    <Button type="dashed" block onClick={() => add()}>
                      เพิ่มเงื่อนไข
                    </Button>
                  </Space>
                );
              }}
            </Form.List>

            {/* -------- Action -------- */}
            <Row justify="space-between" style={{ marginTop: 12 }}>
              <Col>
                <Popconfirm title="ยืนยันการลบ?" onConfirm={onDelete} okText="ลบ" cancelText="ยกเลิก">
                  <Button danger>ลบประเภทนี้</Button>
                </Popconfirm>
              </Col>
              <Col>
                <Space>
                  <Button onClick={() => history.back()}>ยกเลิก</Button>
                  <Button type="primary" htmlType="submit">บันทึก</Button>
                </Space>
              </Col>
            </Row>
          </Form>
        </Card>
      </Space>
    </div>
  );
}
