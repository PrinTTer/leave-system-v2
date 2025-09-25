/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import {
  Button, Card, Checkbox, Col, Divider, Form, Input, InputNumber, Row, Select,
  Space, Typography, message, Popconfirm, Table
} from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, DeleteOutlined } from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';

import type {
  LeaveTypeConfig, GenderCode, ApproverPositionsStep, ApprovalRule
} from '@/types/leave';

// ✅ ใช้ mock seed โดยตรง
import { leaveTypesSeed } from '@/mock/leave-type';

// ✅ ใช้ editor ตัวเดียวกับหน้า Add
import ApproverPositionEditor from '@/app/components/FormElements/ApproverPositionEditor';

type ApprovalRuleForm = {
  maxDaysThreshold: number;
  /** อ้าง index ของ approverPositions (step ที่เลือก) */
  selectedApproverIndexes?: number[];
};

type LeaveTypeFormValues = Omit<
  LeaveTypeConfig,
  'id' | 'createdAt' | 'updatedAt' | 'approvalRules' | 'approverPositions'
> & {
  approverPositions?: ApproverPositionsStep[];
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

export default function EditLeaveTypePage() {
  const { Title } = Typography;
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm<LeaveTypeFormValues>();

  // ---------- Adapter ช่วยอ่าน seed เก่า/ใหม่ ----------
  // กรณี seed เก่ายังเก็บ approvers เป็นลิสต์ { position: string } ต่อหนึ่งลำดับ
  function legacyApproversToPositions(legacy?: { position?: string }[]): ApproverPositionsStep[] {
    if (!legacy?.length) return [];
    // map ทีละลำดับให้กลายเป็น { positions: [position] }
    return legacy.map(a => ({ positions: a?.position ? [a.position] : [] }));
  }

  // เปรียบเทียบ step ของ positions แบบง่าย ๆ
  const sameStep = (a?: ApproverPositionsStep, b?: ApproverPositionsStep) =>
    JSON.stringify(a?.positions ?? []) === JSON.stringify(b?.positions ?? []);

  useEffect(() => {
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const found = leaveTypesSeed.find((it) => it.id === id);

    if (!found) {
      message.error('ไม่พบประเภทการลา');
      router.push('/private/admin/manage-leave');
      return;
    }

    // 1) อ่าน approverPositions: ถ้ามีให้ใช้เลย, ถ้าไม่มีให้พยายามดึงจาก approvers (legacy)
    const steps: ApproverPositionsStep[] =
      (found.approverPositions && found.approverPositions.length > 0)
        ? found.approverPositions
        : legacyApproversToPositions((found as any).approvers);

    // 2) สร้าง approvalRules (ของฟอร์ม) จากของเดิม
    const approvalRulesWithIndexes: ApprovalRuleForm[] = (found.approvalRules ?? []).map((rule) => {
      // chain ของเดิมอาจเป็นแบบใหม่ ({positions: string[]}) หรือแบบเก่า ({position?: string}[])
      const chainSteps: ApproverPositionsStep[] =
        (rule.approverChain ?? []).map((s: any) => {
          if (Array.isArray(s?.positions)) return { positions: s.positions };
          // กรณีเก่า: เป็นตำแหน่งเดี่ยว
          if (typeof s?.position === 'string') return { positions: [s.position] };
          return { positions: [] };
        });

      // map chain -> index ของ steps
      const selected = chainSteps
        .map((c) => steps.findIndex((st) => sameStep(st, c)))
        .filter((i) => i >= 0);

      return {
        maxDaysThreshold: rule.maxDaysThreshold,
        selectedApproverIndexes: selected,
      };
    });

    const values: LeaveTypeFormValues = {
      name: found.name,
      maxDays: found.maxDays,
      allowedGenders: found.allowedGenders,
      minServiceYears: found.minServiceYears,
      workingDaysOnly: found.workingDaysOnly,
      documents: found.documents,
      approverPositions: steps,
      approvalRules: approvalRulesWithIndexes,
    };

    form.setFieldsValue(values);
    setLoading(false);
  }, [form, params.id, router]);

  // ---- Watch เพื่อสร้างตัวเลือก “ต้องใช้ผู้อนุมัติลำดับที่ …”
  const approverPositions = Form.useWatch('approverPositions', { form }) as ApproverPositionsStep[] | undefined;

  const approverOrderOptions = (approverPositions ?? []).map((ap, idx) => ({
    label: `ลำดับที่ ${idx + 1}${(ap?.positions?.length ?? 0) ? ` : ${ap!.positions!.join(', ')}` : ''}`,
    value: idx,
  }));

  // ---- บันทึก (เดโม: ไม่ persist) -> normalize เป็นโครงสร้างใหม่เหมือนหน้า Add
  const onFinish = (values: LeaveTypeFormValues) => {
    const basePos = values.approverPositions ?? []; // [{ positions: string[] }]

    const normalizedRules: ApprovalRule[] = (values.approvalRules ?? []).map((r) => {
      const idxs: number[] = Array.isArray(r.selectedApproverIndexes) ? r.selectedApproverIndexes : [];
      const chain = idxs.map(i => basePos[i]).filter(Boolean); // chain: ApproverPositionsStep[]
      return {
        maxDaysThreshold: r.maxDaysThreshold,
        approverChain: chain,
      };
    });

    // ปกติจะเรียก update ที่ backend — ตอนนี้แค่แจ้งเตือน + กลับหน้า list
    console.log('[MOCK SAVE] values:', {
      ...values,
      approverPositions: basePos,
      approvalRules: normalizedRules,
    });

    message.success('บันทึก (โหมด Mock) — ไม่มีการเปลี่ยนแปลงข้อมูลจริง');
    router.push('/private/admin/manage-leave');
  };

  // ---- ลบ (เดโม: ไม่ persist)
  const onDelete = () => {
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    console.log('[MOCK DELETE] id:', id);
    message.info('ลบ (โหมด Mock) — ไม่มีการเปลี่ยนแปลงข้อมูลจริง');
    router.push('/private/admin/manage-leave');
  };

  return (
    <div style={{ padding: 10 }}>
      <Space direction="vertical" style={{ width: '100%' }} size={10}>
        <Title level={4} style={{ margin: 0 }}>แก้ไขประเภทลา</Title>

        <Card loading={loading}>
          <Form<LeaveTypeFormValues> form={form} layout="vertical" onFinish={onFinish}>
            {/* -------- แถว 1: ชื่อ + สูงสุด (วัน) -------- */}
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="name"
                  label="ชื่อประเภทการลา"
                  rules={[{ required: true, message: 'กรุณาระบุชื่อประเภทการลา' }]}
                >
                  <Input placeholder="เช่น ลาป่วย / ลากิจส่วนตัว" />
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
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="minServiceYears" label="อายุราชการขั้นต่ำ (ปี)">
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="workingDaysOnly" valuePropName="checked">
              <Checkbox>นับวันลาเฉพาะวันทำการ</Checkbox>
            </Form.Item>

            {/* -------- ผู้อนุมัติ (ตาราง) -------- */}
            <Divider orientation="left">ผู้อนุมัติ (กำหนดตาม “ตำแหน่ง” เป็นลำดับ)</Divider>
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

            {/* -------- เงื่อนไขอนุมัติ (ตาราง) -------- */}
            <Divider orientation="left">เงื่อนไขของการอนุมัติ (เลือกจากลำดับผู้อนุมัติ)</Divider>
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
                    title: 'ต้องใช้ผู้อนุมัติลำดับที่',
                    dataIndex: 'selectedApproverIndexes',
                    render: (_: any, __: any, idx: number) => (
                      <Form.Item
                        name={[fields[idx].name, 'selectedApproverIndexes']}
                        style={{ marginBottom: 0 }}
                        rules={[{ required: true, message: 'เลือกอย่างน้อย 1 ลำดับ' }]}
                      >
                        <Select
                          mode="multiple"
                          options={approverOrderOptions}
                          placeholder="เช่น ลำดับที่ 1, ลำดับที่ 2"
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